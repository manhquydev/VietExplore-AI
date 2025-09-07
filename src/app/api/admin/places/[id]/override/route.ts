import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { Place, PlaceStatus } from '@/lib/types/places'
import { RealtimeService } from '@/lib/firebase/realtime'

interface OverrideRequest {
  status: PlaceStatus
  reason: string
  skipWorkflow?: boolean
  notifyOwner?: boolean
  additionalData?: any
}

const VALID_OVERRIDE_STATUSES: PlaceStatus[] = [
  'published',
  'hidden', 
  'temporarily_suspended',
  'in_review',
  'rejected',
  'draft'
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin permissions only
    const user = await verifyAuthToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin role required for override authority' },
        { status: 403 }
      )
    }

    const { id: placeId } = await params
    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      )
    }

    const body: OverrideRequest = await request.json()
    
    // Validate override request
    const validation = validateOverrideRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get place document
    const placeRef = getAdminDb().collection('places').doc(placeId)
    const placeDoc = await placeRef.get()
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    const place = placeDoc.data() as Place
    const now = new Date()
    const previousStatus = place.status

    // Prepare update data based on new status
    const updateData: any = {
      status: body.status,
      updatedAt: now.toISOString(),
      moderatedBy: user.uid
    }

    // Handle specific status transitions
    switch (body.status) {
      case 'published':
        updateData.publishedAt = now.toISOString()
        // Clear suspension data if any
        updateData.suspendedAt = null
        updateData.suspendedBy = null
        updateData.suspensionReason = null
        updateData.suspensionExpiresAt = null
        updateData.suspensionType = null
        break

      case 'hidden':
        // Clear published date
        updateData.publishedAt = null
        break

      case 'temporarily_suspended':
        // If overriding to suspended, set minimal suspension data
        updateData.suspendedAt = now.toISOString()
        updateData.suspendedBy = user.uid
        updateData.suspensionReason = body.reason || 'Admin override suspension'
        updateData.suspensionType = 'investigation'
        // Set default 24h expiry if not specified
        const expiryHours = body.additionalData?.expiryHours || 24
        updateData.suspensionExpiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000).toISOString()
        break

      case 'rejected':
        updateData.rejectedAt = now.toISOString()
        updateData.rejectionReason = body.reason
        break

      case 'draft':
        // Clear all publication/rejection data
        updateData.publishedAt = null
        updateData.rejectedAt = null
        updateData.rejectionReason = null
        break
    }

    // Apply additional data if provided
    if (body.additionalData) {
      Object.keys(body.additionalData).forEach(key => {
        if (key !== 'expiryHours') { // Skip internal keys
          updateData[key] = body.additionalData[key]
        }
      })
    }

    // Update the place
    await placeRef.update(updateData)

    // Create detailed moderation action record
    const moderationAction = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      placeId: placeId,
      action: 'admin_override' as const,
      reason: body.reason,
      moderatorId: user.uid,
      createdAt: now.toISOString(),
      previousStatus: previousStatus,
      newStatus: body.status,
      overrideData: {
        skipWorkflow: body.skipWorkflow !== false,
        bypassValidation: true,
        adminOverride: true,
        statusTransition: `${previousStatus} → ${body.status}`,
        additionalData: body.additionalData
      }
    }

    await getAdminDb().collection('moderation_actions').add(moderationAction)

    // Handle workflow cleanup if bypassing
    if (body.skipWorkflow !== false) {
      await cleanupWorkflowItems(placeId)
    }

    // Send notification to place owner if requested
    if (body.notifyOwner !== false && shouldNotifyOwnerForOverride(previousStatus, body.status)) {
      await sendOverrideNotification(place, previousStatus, body.status, body.reason, user)
    }

    // Update real-time stats
    await RealtimeService.updatePlaceStats()

    // Log admin action for audit trail
    await getAdminDb().collection('admin_actions').add({
      adminId: user.uid,
      adminName: user.fullName,
      action: 'place_status_override',
      targetId: placeId,
      targetType: 'place',
      details: {
        previousStatus,
        newStatus: body.status,
        reason: body.reason,
        skipWorkflow: body.skipWorkflow !== false
      },
      timestamp: now.toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      data: {
        placeId: placeId,
        previousStatus: previousStatus,
        newStatus: body.status,
        overriddenBy: {
          id: user.uid,
          name: user.fullName,
          role: user.role
        },
        timestamp: now.toISOString(),
        workflowBypassed: body.skipWorkflow !== false,
        auditLogged: true
      }
    })

  } catch (error) {
    console.error('Error overriding place status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Validation helper
function validateOverrideRequest(request: OverrideRequest): { valid: boolean; error?: string } {
  if (!request.status) {
    return { valid: false, error: 'Status is required' }
  }

  if (!VALID_OVERRIDE_STATUSES.includes(request.status)) {
    return { valid: false, error: `Invalid status. Allowed: ${VALID_OVERRIDE_STATUSES.join(', ')}` }
  }

  if (!request.reason || request.reason.length < 10) {
    return { valid: false, error: 'Reason must be at least 10 characters' }
  }

  return { valid: true }
}

// Cleanup workflow items when bypassing
async function cleanupWorkflowItems(placeId: string) {
  try {
    // Remove from moderation queue
    const queueQuery = getAdminDb().collection('moderation_queue')
      .where('contentId', '==', placeId)
      .where('status', 'in', ['pending', 'claimed', 'in_review'])

    const queueDocs = await queueQuery.get()
    
    const batch = getAdminDb().batch()
    queueDocs.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'admin_bypassed',
        completedAt: new Date().toISOString(),
        bypassReason: 'Admin override - workflow bypassed'
      })
    })

    await batch.commit()

  } catch (error) {
    console.error('Error cleaning up workflow items:', error)
    // Don't fail the main operation for cleanup errors
  }
}

// Determine if owner should be notified
function shouldNotifyOwnerForOverride(previousStatus: PlaceStatus, newStatus: PlaceStatus): boolean {
  const significantOverrides = [
    // Published changes
    { from: ['draft', 'submitted', 'in_review', 'hidden'], to: 'published' },
    { from: 'published', to: ['hidden', 'temporarily_suspended', 'rejected'] },
    
    // Suspension/rejection changes
    { from: ['published', 'in_review'], to: 'temporarily_suspended' },
    { from: 'temporarily_suspended', to: 'published' },
    { from: ['draft', 'submitted', 'in_review'], to: 'rejected' },
    
    // Restoration from rejection
    { from: 'rejected', to: ['published', 'in_review'] }
  ]

  return significantOverrides.some(override => {
    const fromMatch = Array.isArray(override.from) ? override.from.includes(previousStatus) : override.from === previousStatus
    const toMatch = override.to === newStatus
    return fromMatch && toMatch
  })
}

// Send notification to place owner
async function sendOverrideNotification(
  place: Place,
  previousStatus: PlaceStatus, 
  newStatus: PlaceStatus, 
  reason: string,
  admin: any
) {
  try {
    const notificationData = getOverrideNotificationData(previousStatus, newStatus, place.name, reason)
    
    await RealtimeService.sendNotification(place.createdBy, {
      type: 'admin_override',
      title: notificationData.title,
      body: notificationData.body,
      actionUrl: `/places/${place.slug}`,
      data: {
        placeId: place.id,
        previousStatus,
        newStatus,
        reason,
        overriddenBy: admin.fullName,
        timestamp: new Date().toISOString()
      },
      priority: 'high'
    })

  } catch (error) {
    console.error('Error sending override notification:', error)
  }
}

// Get notification content based on status change
function getOverrideNotificationData(previousStatus: PlaceStatus, newStatus: PlaceStatus, placeName: string, reason: string) {
  const statusLabels = {
    draft: 'bản nháp',
    submitted: 'đã gửi',
    in_review: 'đang duyệt',
    published: 'đã xuất bản',
    hidden: 'ẩn',
    temporarily_suspended: 'đình chỉ tạm thời',
    rejected: 'bị từ chối'
  }

  if (newStatus === 'published') {
    return {
      title: 'Địa điểm được xuất bản bởi Admin',
      body: `Địa điểm "${placeName}" đã được Admin chuyển từ ${statusLabels[previousStatus]} sang xuất bản. Lý do: ${reason}`
    }
  }

  if (newStatus === 'hidden') {
    return {
      title: 'Địa điểm bị ẩn bởi Admin',
      body: `Địa điểm "${placeName}" đã bị Admin ẩn khỏi hiển thị. Lý do: ${reason}`
    }
  }

  if (newStatus === 'temporarily_suspended') {
    return {
      title: 'Địa điểm bị đình chỉ bởi Admin',
      body: `Địa điểm "${placeName}" đã bị Admin đình chỉ tạm thời. Lý do: ${reason}`
    }
  }

  if (newStatus === 'rejected') {
    return {
      title: 'Địa điểm bị từ chối bởi Admin',
      body: `Địa điểm "${placeName}" đã bị Admin từ chối. Lý do: ${reason}`
    }
  }

  return {
    title: 'Admin thay đổi trạng thái địa điểm',
    body: `Địa điểm "${placeName}" đã được Admin chuyển sang ${statusLabels[newStatus]}. Lý do: ${reason}`
  }
}
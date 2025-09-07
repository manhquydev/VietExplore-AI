import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { TemporarySuspensionRequest, Place } from '@/lib/types/places'
import { RealtimeService } from '@/lib/firebase/realtime'
import { ServerAuditService } from '@/lib/server/audit-service'

const SUSPENSION_REASONS = [
  'content_policy_violation',
  'quality_issues', 
  'pending_investigation',
  'user_report_review',
  'duplicate_content',
  'data_verification_needed'
] as const

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and permissions
    const user = await verifyAuthToken(request)
    if (!user || !['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Moderator or Admin role required' },
        { status: 403 }
      )
    }

    const placeId = (await params).id
    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      )
    }

    const body: TemporarySuspensionRequest = await request.json()
    
    // Validate suspension request
    const validation = validateSuspensionRequest(body)
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
    
    // Check if already suspended
    if (place.status === 'temporarily_suspended') {
      return NextResponse.json(
        { error: 'Place is already suspended' },
        { status: 409 }
      )
    }

    // Check if place is in a suspendable state
    const suspendableStates = ['published', 'in_review', 'pending_edit']
    if (!suspendableStates.includes(place.status)) {
      return NextResponse.json(
        { error: `Cannot suspend place in status: ${place.status}` },
        { status: 409 }
      )
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + body.duration * 60 * 60 * 1000)

    // Update place with suspension data
    const updateData = {
      status: 'temporarily_suspended',
      suspendedAt: now.toISOString(),
      suspendedBy: user.uid,
      suspensionReason: body.reason,
      suspensionExpiresAt: expiresAt.toISOString(),
      suspensionType: body.type,
      updatedAt: now.toISOString(),
      moderatedBy: user.uid
    }

    await placeRef.update(updateData)

    // Create moderation action record
    const moderationAction = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      placeId: placeId,
      action: 'suspend_temporary' as const,
      reason: body.reason,
      moderatorId: user.uid,
      createdAt: now.toISOString(),
      previousStatus: place.status,
      newStatus: 'temporarily_suspended' as const,
      suspensionData: {
        duration: body.duration,
        type: body.type,
        autoExpire: body.autoExpire || true
      }
    }

    await getAdminDb().collection('moderation_actions').add(moderationAction)

    // Schedule auto-unsuspension if enabled
    if (body.autoExpire !== false) {
      await scheduleAutoUnsuspension(placeId, expiresAt)
    }

    // Send notification to place owner
    if (body.notifyOwner !== false) {
      await RealtimeService.sendNotification(place.createdBy, {
        type: 'place_suspended',
        title: 'Địa điểm bị đình chỉ tạm thời',
        body: `Địa điểm "${place.name}" đã bị đình chỉ do: ${getSuspensionReasonText(body.reason)}`,
        actionUrl: `/places/${place.slug}`,
        data: {
          placeId: placeId,
          suspensionReason: body.reason,
          expiresAt: expiresAt.toISOString()
        }
      })
    }

    // Update real-time stats
    await RealtimeService.updatePlaceStats()

    // Log audit action for place suspension
    await ServerAuditService.logPlaceAction(
      'suspend',
      user,
      {
        id: placeId,
        title: placeDoc.data()?.name || 'Unknown Place'
      },
      [
        {
          field: 'status',
          before: 'published',
          after: 'temporarily_suspended'
        },
        {
          field: 'suspendedUntil',
          before: null,
          after: expiresAt.toISOString()
        }
      ],
      {
        reason: `Tạm đình chỉ: ${body.reason} - ${body.description || 'Không có mô tả'}`,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        placeId: placeId,
        suspendedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        reason: body.reason,
        moderator: {
          id: user.uid,
          name: user.fullName
        }
      }
    })

  } catch (error) {
    console.error('Error suspending place:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Unsuspend place
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuthToken(request)
    if (!user || !['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Moderator or Admin role required' },
        { status: 403 }
      )
    }

    const placeId = (await params).id
    const placeRef = getAdminDb().collection('places').doc(placeId)
    const placeDoc = await placeRef.get()
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    const place = placeDoc.data() as Place

    if (place.status !== 'temporarily_suspended') {
      return NextResponse.json(
        { error: 'Place is not suspended' },
        { status: 409 }
      )
    }

    const now = new Date()
    
    // Determine restoration status
    let restorationStatus = 'published'
    
    // If was in review before suspension, return to review
    if (place.status === 'in_review') {
      restorationStatus = 'in_review'
    }

    // Update place
    await placeRef.update({
      status: restorationStatus,
      suspendedAt: null,
      suspendedBy: null,
      suspensionReason: null,
      suspensionExpiresAt: null,
      suspensionType: null,
      updatedAt: now.toISOString(),
      moderatedBy: user.uid
    })

    // Create moderation action
    const moderationAction = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      placeId: placeId,
      action: 'unsuspend' as const,
      reason: 'Manual unsuspension by moderator',
      moderatorId: user.uid,
      createdAt: now.toISOString(),
      previousStatus: 'temporarily_suspended' as const,
      newStatus: restorationStatus as any
    }

    await getAdminDb().collection('moderation_actions').add(moderationAction)

    // Notify owner
    await RealtimeService.sendNotification(place.createdBy, {
      type: 'place_unsuspended',
      title: 'Địa điểm đã được khôi phục',
      body: `Địa điểm "${place.name}" đã được khôi phục và công khai trở lại`,
      actionUrl: `/places/${place.slug}`
    })

    // Log audit action for place restoration
    await ServerAuditService.logPlaceAction(
      'restore',
      user,
      {
        id: placeId,
        title: place.name || 'Unknown Place'
      },
      [
        {
          field: 'status',
          before: 'temporarily_suspended',
          after: restorationStatus
        },
        {
          field: 'suspendedUntil',
          before: place.suspensionExpiresAt,
          after: null
        }
      ],
      {
        reason: `Khôi phục hoạt động địa điểm từ trạng thái tạm đình chỉ`,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    );

    await RealtimeService.updatePlaceStats()

    return NextResponse.json({
      success: true,
      data: {
        placeId: placeId,
        restoredStatus: restorationStatus,
        unsuspendedAt: now.toISOString(),
        moderator: {
          id: user.uid,
          name: user.fullName
        }
      }
    })

  } catch (error) {
    console.error('Error unsuspending place:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function validateSuspensionRequest(request: TemporarySuspensionRequest): { valid: boolean; error?: string } {
  if (!request.placeId) {
    return { valid: false, error: 'Place ID is required' }
  }

  if (!request.reason || request.reason.length < 10) {
    return { valid: false, error: 'Suspension reason must be at least 10 characters' }
  }

  if (!request.duration || request.duration < 1 || request.duration > 168) {
    return { valid: false, error: 'Duration must be between 1 and 168 hours (7 days)' }
  }

  if (!['violation', 'investigation', 'quality_review', 'user_request'].includes(request.type)) {
    return { valid: false, error: 'Invalid suspension type' }
  }

  return { valid: true }
}

function getSuspensionReasonText(reason: string): string {
  const reasonMap: { [key: string]: string } = {
    'content_policy_violation': 'Vi phạm chính sách nội dung',
    'quality_issues': 'Vấn đề chất lượng nội dung',
    'pending_investigation': 'Đang điều tra vi phạm',
    'user_report_review': 'Xem xét báo cáo từ người dùng',
    'duplicate_content': 'Nội dung trùng lặp',
    'data_verification_needed': 'Cần xác minh thông tin'
  }
  
  return reasonMap[reason] || reason
}

async function scheduleAutoUnsuspension(placeId: string, expiresAt: Date) {
  // In a real implementation, you'd use a job queue or scheduled function
  // For now, we'll store the schedule in Firestore for a background process to handle
  await getAdminDb().collection('suspension_schedules').add({
    placeId,
    expiresAt: expiresAt.toISOString(),
    processed: false,
    createdAt: new Date().toISOString()
  })
}
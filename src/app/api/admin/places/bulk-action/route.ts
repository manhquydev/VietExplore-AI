import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { Place } from '@/lib/types/places'
import { RealtimeService } from '@/lib/firebase/realtime'

interface BulkActionRequest {
  placeIds: string[]
  action: 'published' | 'hidden' | 'featured' | 'unfeatured' | 'delete' | 'suspend'
  reason: string
  duration?: number // for suspension
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin permissions for bulk actions
    const authResult = await verifyAuthToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = authResult.user
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin role required for bulk actions' },
        { status: 403 }
      )
    }

    const body: BulkActionRequest = await request.json()
    
    // Validate request
    if (!body.placeIds || !Array.isArray(body.placeIds) || body.placeIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Place IDs are required' },
        { status: 400 }
      )
    }

    if (body.placeIds.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 places can be processed at once' },
        { status: 400 }
      )
    }

    if (!body.action || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'Action and reason are required' },
        { status: 400 }
      )
    }

    const adminDb = getAdminDb()
    const now = new Date()
    
    const results = {
      processed: [] as string[],
      failed: [] as { id: string; error: string }[],
      total: body.placeIds.length
    }

    // Process each place
    for (const placeId of body.placeIds) {
      try {
        const placeRef = adminDb.collection('places').doc(placeId)
        const placeDoc = await placeRef.get()
        
        if (!placeDoc.exists) {
          results.failed.push({ id: placeId, error: 'Place not found' })
          continue
        }

        const place = placeDoc.data() as Place
        const updateData: any = {
          updatedAt: now.toISOString(),
          moderatedBy: user.uid
        }

        // Determine update based on action
        switch (body.action) {
          case 'published':
            updateData.status = 'published'
            updateData.publishedAt = now.toISOString()
            // Clear suspension if any
            updateData.suspendedAt = null
            updateData.suspendedBy = null
            updateData.suspensionReason = null
            updateData.suspensionExpiresAt = null
            updateData.suspensionType = null
            break

          case 'hidden':
            updateData.status = 'hidden'
            updateData.publishedAt = null
            break

          case 'featured':
            updateData.featured = true
            break

          case 'unfeatured':
            updateData.featured = false
            break

          case 'suspend':
            updateData.status = 'temporarily_suspended'
            updateData.suspendedAt = now.toISOString()
            updateData.suspendedBy = user.uid
            updateData.suspensionReason = body.reason
            updateData.suspensionType = 'investigation'
            // Default 24h if not specified
            const hours = body.duration || 24
            updateData.suspensionExpiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString()
            break

          case 'delete':
            // For soft delete, just mark as deleted
            updateData.status = 'deleted'
            updateData.deletedAt = now.toISOString()
            updateData.deletedBy = user.uid
            break

          default:
            results.failed.push({ id: placeId, error: 'Invalid action' })
            continue
        }

        // Update the place
        await placeRef.update(updateData)

        // Create moderation action record
        const moderationAction = {
          id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          placeId: placeId,
          action: `bulk_${body.action}` as const,
          reason: body.reason,
          moderatorId: user.uid,
          createdAt: now.toISOString(),
          previousStatus: place.status,
          newStatus: updateData.status || place.status,
          bulkOperation: true,
          batchId: `bulk_${Date.now()}`
        }

        await adminDb.collection('moderation_actions').add(moderationAction)

        // Send notification for significant changes
        if (shouldNotifyOwner(body.action, place.status)) {
          try {
            await RealtimeService.sendNotification(place.createdBy, {
              type: 'bulk_place_action',
              title: getBulkNotificationTitle(body.action),
              body: `Địa điểm "${place.name}" đã được ${getBulkActionLabel(body.action)} bởi Admin. Lý do: ${body.reason}`,
              actionUrl: `/places/${place.slug}`,
              data: {
                placeId: placeId,
                action: body.action,
                reason: body.reason,
                bulkOperation: true
              }
            })
          } catch (notifyError) {
            console.error(`Failed to notify owner for place ${placeId}:`, notifyError)
            // Don't fail the operation for notification errors
          }
        }

        results.processed.push(placeId)

      } catch (error) {
        console.error(`Error processing place ${placeId}:`, error)
        results.failed.push({ 
          id: placeId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    // Log bulk admin action
    await adminDb.collection('admin_actions').add({
      adminId: user.uid,
      adminName: user.fullName,
      action: `bulk_${body.action}`,
      targetIds: results.processed,
      targetType: 'place',
      details: {
        action: body.action,
        reason: body.reason,
        processedCount: results.processed.length,
        failedCount: results.failed.length,
        duration: body.duration
      },
      timestamp: now.toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })

    // Update real-time stats
    try {
      await RealtimeService.updatePlaceStats()
    } catch (statsError) {
      console.error('Failed to update stats:', statsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        processedCount: results.processed.length,
        failedCount: results.failed.length,
        totalCount: results.total,
        processed: results.processed,
        failed: results.failed,
        action: body.action,
        reason: body.reason,
        timestamp: now.toISOString()
      }
    })

  } catch (error) {
    console.error('Error in bulk action:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function shouldNotifyOwner(action: string, currentStatus: string): boolean {
  // Notify for significant status changes
  const notifiableActions = ['published', 'hidden', 'suspend', 'delete']
  const significantStatuses = ['draft', 'submitted', 'in_review']
  
  return notifiableActions.includes(action) && 
         (action === 'published' || !significantStatuses.includes(currentStatus))
}

function getBulkNotificationTitle(action: string): string {
  switch (action) {
    case 'published': return 'Địa điểm được xuất bản'
    case 'hidden': return 'Địa điểm bị ẩn'
    case 'suspend': return 'Địa điểm bị đình chỉ'
    case 'delete': return 'Địa điểm bị xóa'
    case 'featured': return 'Địa điểm được đặt nổi bật'
    case 'unfeatured': return 'Địa điểm bỏ nổi bật'
    default: return 'Thay đổi trạng thái địa điểm'
  }
}

function getBulkActionLabel(action: string): string {
  switch (action) {
    case 'published': return 'xuất bản'
    case 'hidden': return 'ẩn'
    case 'suspend': return 'đình chỉ tạm thời'
    case 'delete': return 'xóa'
    case 'featured': return 'đánh dấu nổi bật'
    case 'unfeatured': return 'bỏ đánh dấu nổi bật'
    default: return 'cập nhật'
  }
}
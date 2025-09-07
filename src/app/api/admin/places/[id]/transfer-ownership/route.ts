import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { Place } from '@/lib/types/places'
import { RealtimeService } from '@/lib/firebase/realtime'

interface TransferOwnershipRequest {
  newOwnerId: string
  reason: string
  notifyUsers?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin permissions only
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
        { success: false, error: 'Admin role required for ownership transfer' },
        { status: 403 }
      )
    }

    const placeId = (await params).id
    const body: TransferOwnershipRequest = await request.json()
    
    // Validate request
    if (!body.newOwnerId || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'New owner ID and reason are required' },
        { status: 400 }
      )
    }

    if (body.reason.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Reason must be at least 20 characters' },
        { status: 400 }
      )
    }

    const adminDb = getAdminDb()
    
    // Get place document
    const placeRef = adminDb.collection('places').doc(placeId)
    const placeDoc = await placeRef.get()
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      )
    }

    const place = placeDoc.data() as Place
    const previousOwnerId = place.createdBy

    if (previousOwnerId === body.newOwnerId) {
      return NextResponse.json(
        { success: false, error: 'New owner is the same as current owner' },
        { status: 400 }
      )
    }

    // Verify new owner exists and is active
    const newOwnerDoc = await adminDb.collection('users').doc(body.newOwnerId).get()
    if (!newOwnerDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'New owner user not found' },
        { status: 404 }
      )
    }

    const newOwner = newOwnerDoc.data()
    if (newOwner?.status === 'banned' || newOwner?.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Cannot transfer to banned or suspended user' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Update place ownership
    const updateData = {
      createdBy: body.newOwnerId,
      ownershipTransferredAt: now.toISOString(),
      ownershipTransferredBy: user.uid,
      previousOwner: previousOwnerId,
      updatedAt: now.toISOString(),
      moderatedBy: user.uid
    }

    await placeRef.update(updateData)

    // Create moderation action record
    const moderationAction = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      placeId: placeId,
      action: 'transfer_ownership' as const,
      reason: body.reason,
      moderatorId: user.uid,
      createdAt: now.toISOString(),
      previousStatus: place.status,
      newStatus: place.status,
      ownershipData: {
        previousOwnerId: previousOwnerId,
        newOwnerId: body.newOwnerId,
        transferReason: body.reason
      }
    }

    await adminDb.collection('moderation_actions').add(moderationAction)

    // Update user place counts
    try {
      // Decrease previous owner's count
      const prevOwnerRef = adminDb.collection('users').doc(previousOwnerId)
      await adminDb.runTransaction(async (transaction) => {
        const prevOwnerDoc = await transaction.get(prevOwnerRef)
        if (prevOwnerDoc.exists) {
          const currentCount = prevOwnerDoc.data()?.placesCreated || 0
          transaction.update(prevOwnerRef, {
            placesCreated: Math.max(0, currentCount - 1)
          })
        }
      })

      // Increase new owner's count
      const newOwnerRef = adminDb.collection('users').doc(body.newOwnerId)
      await adminDb.runTransaction(async (transaction) => {
        const newOwnerDoc = await transaction.get(newOwnerRef)
        if (newOwnerDoc.exists) {
          const currentCount = newOwnerDoc.data()?.placesCreated || 0
          transaction.update(newOwnerRef, {
            placesCreated: currentCount + 1
          })
        }
      })
    } catch (countError) {
      console.error('Error updating user place counts:', countError)
      // Don't fail the operation for count update errors
    }

    // Send notifications if requested
    if (body.notifyUsers !== false) {
      // Notify previous owner
      try {
        await RealtimeService.sendNotification(previousOwnerId, {
          type: 'place_ownership_transferred_from',
          title: 'Quyền sở hữu địa điểm đã được chuyển',
          body: `Quyền sở hữu địa điểm "${place.name}" đã được Admin chuyển cho người dùng khác. Lý do: ${body.reason}`,
          actionUrl: `/places/${place.slug}`,
          data: {
            placeId: placeId,
            newOwnerId: body.newOwnerId,
            reason: body.reason,
            transferredBy: user.fullName
          },
          priority: 'high'
        })
      } catch (notifyError) {
        console.error('Failed to notify previous owner:', notifyError)
      }

      // Notify new owner
      try {
        await RealtimeService.sendNotification(body.newOwnerId, {
          type: 'place_ownership_transferred_to',
          title: 'Bạn được chuyển quyền sở hữu địa điểm',
          body: `Admin đã chuyển quyền sở hữu địa điểm "${place.name}" cho bạn. Bạn có thể quản lý và chỉnh sửa địa điểm này.`,
          actionUrl: `/places/${place.slug}`,
          data: {
            placeId: placeId,
            previousOwnerId: previousOwnerId,
            reason: body.reason,
            transferredBy: user.fullName
          },
          priority: 'high'
        })
      } catch (notifyError) {
        console.error('Failed to notify new owner:', notifyError)
      }
    }

    // Log admin action
    await adminDb.collection('admin_actions').add({
      adminId: user.uid,
      adminName: user.fullName,
      action: 'transfer_place_ownership',
      targetId: placeId,
      targetType: 'place',
      details: {
        placeName: place.name,
        previousOwnerId: previousOwnerId,
        newOwnerId: body.newOwnerId,
        reason: body.reason
      },
      timestamp: now.toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      data: {
        placeId: placeId,
        placeName: place.name,
        previousOwnerId: previousOwnerId,
        newOwnerId: body.newOwnerId,
        transferredAt: now.toISOString(),
        transferredBy: {
          id: user.uid,
          name: user.fullName,
          role: user.role
        },
        reason: body.reason
      }
    })

  } catch (error) {
    console.error('Error transferring place ownership:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { RevisionLimitService } from '@/lib/server/revision-limit-service'
import { ConflictResolutionService } from '@/lib/server/conflict-resolution-service'
import { EnhancedNotificationService } from '@/lib/server/enhanced-notification-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== POST /api/places/[id]/request-edit ===')
  console.log('PlaceId:', params.id)
  
  try {
    const adminDb = getAdminDb()
    
    // Verify authentication
    console.log('Verifying authentication...')
    const tokenResult = await verifyAuthToken(request)
    console.log('Auth result:', { success: tokenResult.success, userId: tokenResult.user?.id })
    
    if (!tokenResult.success || !tokenResult.user) {
      console.log('Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = tokenResult.user
    const placeId = params.id
    
    console.log('User authenticated:', user.id)

    // 1. Check revision limit FIRST - tránh spam requests
    const canRequest = await RevisionLimitService.canRequestRevision(placeId, user.id);
    if (!canRequest.allowed) {
      return NextResponse.json({ 
        error: `Bạn đã đạt giới hạn ${canRequest.limit} lần yêu cầu chỉnh sửa cho địa điểm này. ${canRequest.message}` 
      }, { status: 429 });
    }

    // 2. Check for conflicts - prevent concurrent edits
    const conflictCheck = await ConflictResolutionService.checkEditConflicts(placeId, user.id, user.role);
    if (conflictCheck.hasConflict) {
      return NextResponse.json({
        error: conflictCheck.message,
        conflictDetails: conflictCheck.details
      }, { status: 409 });
    }

    // Get the place document
    console.log('Getting place document...')
    const placeDoc = await adminDb.collection('places').doc(placeId).get()

    if (!placeDoc.exists) {
      console.log('Place not found')
      return NextResponse.json({ error: 'Địa điểm không tồn tại' }, { status: 404 })
    }

    const place = placeDoc.data()!
    console.log('Place found:', { 
      id: placeId, 
      status: place.status, 
      createdBy: place.createdBy,
      name: place.name 
    })

    // Validate required fields exist
    if (!place.createdBy) {
      console.log('Place has no createdBy field')
      return NextResponse.json({ error: 'Dữ liệu địa điểm không hợp lệ (thiếu thông tin tác giả)' }, { status: 400 })
    }
    
    if (!place.status) {
      console.log('Place has no status field')
      return NextResponse.json({ error: 'Dữ liệu địa điểm không hợp lệ (thiếu trạng thái)' }, { status: 400 })
    }

    // Check if user owns this place
    if (place.createdBy !== user.id) {
      console.log('Permission denied: user does not own place', { 
        placeCreatedBy: place.createdBy, 
        currentUser: user.id,
        userIdType: typeof user.id,
        createdByType: typeof place.createdBy
      })
      return NextResponse.json({ error: 'Bạn không có quyền chỉnh sửa địa điểm này' }, { status: 403 })
    }

    // Check if place is published
    if (place.status !== 'published') {
      console.log('Place is not published:', place.status)
      return NextResponse.json({ error: 'Chỉ có thể chỉnh sửa địa điểm đã xuất bản' }, { status: 400 })
    }
    
    console.log('All checks passed, processing edit request...')

    // 3. Create edit request through ConflictResolutionService 
    const editResult = await ConflictResolutionService.createEditRequest({
      placeId,
      requesterId: user.id,
      requesterRole: user.role,
      requestType: 'edit_request',
      reason: 'User requested to edit published place',
      metadata: {
        placeName: place.name,
        placeType: place.type,
        currentStatus: place.status
      }
    });

    // 4. Record revision attempt
    await RevisionLimitService.recordRevisionRequest(placeId, user.id, 'edit_request');

    // 5. Create moderation queue entry if no conflicts
    if (editResult.status === 'queued') {
      const moderationEntry = await adminDb.collection('moderation_queue').add({
        itemId: placeId,
        itemType: 'place_edit',
        action: 'edit_request',
        status: 'pending',
        priority: editResult.priority || 'medium',
        queueType: user.role === 'partner' ? 'partner_queue' : 'contributor_queue',
        submittedBy: user.id,
        submittedAt: FieldValue.serverTimestamp(),
        originalData: {
          ...place,
          id: placeId
        },
        editRequestId: editResult.requestId,
        metadata: {
          requestType: 'edit',
          reason: 'User requested to edit published place',
          submitterRole: user.role,
          submitterName: user.fullName || user.email
        }
      });

      // Update place status to pending_edit
      await adminDb.collection('places').doc(placeId).update({
        status: 'pending_edit',
        editRequestId: editResult.requestId,
        updatedAt: FieldValue.serverTimestamp()
      });

      // Notify moderators
      await EnhancedNotificationService.notifyNewModerationItem(
        'Yêu cầu chỉnh sửa địa điểm',
        editResult.priority as any || 'medium',
        moderationEntry.id,
        user.fullName || user.email,
        place.name
      );
    }
    
    console.log('Successfully processed edit request:', editResult)

    return NextResponse.json({ 
      success: true,
      message: editResult.status === 'queued' 
        ? 'Đã tạo yêu cầu chỉnh sửa thành công. Moderator sẽ xem xét trong thời gian sớm nhất.' 
        : `Yêu cầu đã được xếp hàng. ${editResult.message}`,
      data: {
        requestId: editResult.requestId,
        status: editResult.status,
        priority: editResult.priority,
        estimatedWaitTime: editResult.status === 'queued' ? '24-48 giờ' : '1-3 ngày'
      }
    })

  } catch (error) {
    console.error('Error creating edit request:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo yêu cầu chỉnh sửa' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

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
    
    console.log('All checks passed, updating place status...')

    // Update place status to pending_edit
    await adminDb.collection('places').doc(placeId).update({
      status: 'pending_edit',
      updatedAt: FieldValue.serverTimestamp()
    })

    // Create moderation queue entry
    await adminDb.collection('moderation_queue').add({
      itemId: placeId,
      itemType: 'place_edit',
      action: 'edit_request',
      status: 'pending',
      priority: 'medium',
      submittedBy: user.id,
      submittedAt: FieldValue.serverTimestamp(),
      originalData: {
        ...place,
        id: placeId
      },
      metadata: {
        requestType: 'edit',
        reason: 'User requested to edit published place'
      }
    })
    
    console.log('Successfully created edit request')

    return NextResponse.json({ 
      success: true,
      message: 'Đã tạo yêu cầu chỉnh sửa thành công'
    })

  } catch (error) {
    console.error('Error creating edit request:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo yêu cầu chỉnh sửa' },
      { status: 500 }
    )
  }
}
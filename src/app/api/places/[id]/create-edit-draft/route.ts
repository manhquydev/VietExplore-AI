import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { VersioningService } from '@/lib/server/versioning-service'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== POST /api/places/[id]/create-edit-draft ===')
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
    
    console.log('All checks passed, creating versioned edit draft...')

    // Parse request body for edit reason
    const body = await request.json().catch(() => ({}));
    const { editReason } = body;

    // Use VersioningService để tạo version mới theo tài liệu 2.3.1
    const versionResult = await VersioningService.createEditVersion(
      placeId,
      {}, // Data sẽ được update sau khi user chỉnh sửa
      user.id,
      editReason || 'Yêu cầu chỉnh sửa địa điểm đã xuất bản'
    );

    if (!versionResult.success) {
      console.log('Failed to create version:', versionResult.error);
      return NextResponse.json(
        { error: versionResult.error },
        { status: 400 }
      );
    }

    console.log('Successfully created edit version:', versionResult.versionId);

    // Fallback: Tạo draft trong place_drafts collection cho compatibility
    const editDraftData = {
      ...place,
      status: 'draft',
      isEditingPublished: true,
      originalPlaceId: placeId,
      originalData: { ...place, id: placeId },
      versionId: versionResult.versionId, // Link to version
      editCreatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: null,
      moderatedBy: null,
      moderationHistory: null,
    };

    delete editDraftData.id;
    const editDraftRef = await adminDb.collection('place_drafts').add(editDraftData);
    
    console.log('Created compatible draft:', editDraftRef.id);

    return NextResponse.json({ 
      success: true,
      message: 'Đã tạo bản chỉnh sửa với versioning thành công',
      data: {
        editDraftId: editDraftRef.id,
        versionId: versionResult.versionId,
        originalPlaceId: placeId
      }
    })

  } catch (error) {
    console.error('Error creating edit draft:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo bản chỉnh sửa' },
      { status: 500 }
    )
  }
}
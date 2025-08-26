import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/auth-middleware';
import { Place } from '@/lib/types/places';

// GET /api/places/[id] - Get single place
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const placeDoc = await adminDb.collection('places').doc(params.id).get();
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data() as Place;
    
    // Only return published places to public, or owned places to creator
    if (placeData.status !== 'published') {
      const authResult = await verifyAuthToken(request);
      if (!authResult.success || 
          (authResult.user?.id !== placeData.createdBy && 
           !['moderator', 'admin'].includes(authResult.user?.role || ''))) {
        return NextResponse.json(
          { error: 'Địa điểm không tồn tại hoặc chưa được xuất bản' },
          { status: 404 }
        );
      }
    }

    // Increment view count
    await adminDb.collection('places').doc(params.id).update({
      viewCount: (placeData.viewCount || 0) + 1
    });

    return NextResponse.json({
      success: true,
      data: {
        id: placeDoc.id,
        ...placeData,
        viewCount: (placeData.viewCount || 0) + 1
      }
    });

  } catch (error) {
    console.error('Error fetching place:', error);
    return NextResponse.json(
      { error: 'Không thể tải thông tin địa điểm' },
      { status: 500 }
    );
  }
}

// PUT /api/places/[id] - Update place
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để chỉnh sửa địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const placeDoc = await adminDb.collection('places').doc(params.id).get();
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data() as Place;
    
    // Check permissions - owner, moderator, or admin can edit
    if (placeData.createdBy !== user.id && 
        !['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền chỉnh sửa địa điểm này' },
        { status: 403 }
      );
    }

    const updateData = await request.json();
    
    // Prevent changing certain fields
    delete updateData.id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.viewCount;
    delete updateData.likeCount;
    delete updateData.reportCount;
    
    // Update timestamp
    updateData.updatedAt = new Date().toISOString();
    
    // If content was modified, reset to review status (unless admin/moderator)
    if (!['moderator', 'admin'].includes(user.role) && 
        placeData.status === 'published') {
      updateData.status = 'in_review';
    }

    await adminDb.collection('places').doc(params.id).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Địa điểm đã được cập nhật thành công'
    });

  } catch (error) {
    console.error('Error updating place:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật địa điểm' },
      { status: 500 }
    );
  }
}

// DELETE /api/places/[id] - Delete place
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để xóa địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const placeDoc = await adminDb.collection('places').doc(params.id).get();
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data() as Place;
    
    // Only owner, moderator, or admin can delete
    if (placeData.createdBy !== user.id && 
        !['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xóa địa điểm này' },
        { status: 403 }
      );
    }

    // Soft delete - just hide the place
    await adminDb.collection('places').doc(params.id).update({
      status: 'hidden',
      updatedAt: new Date().toISOString(),
      hiddenBy: user.id,
      hiddenAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Địa điểm đã được xóa thành công'
    });

  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { error: 'Không thể xóa địa điểm' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { PlaceFormData, Place } from '@/lib/types/places';

// PUT /api/places/drafts/[draftId] - Update draft
export async function PUT(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để cập nhật bản nháp' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { draftId } = params;

    // Check if draft exists and belongs to user
    const draftDoc = await adminDb.collection('places').doc(draftId).get();
    if (!draftDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bản nháp' },
        { status: 404 }
      );
    }

    const draft = draftDoc.data();
    if (draft?.createdBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền chỉnh sửa bản nháp này' },
        { status: 403 }
      );
    }

    if (draft?.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Chỉ có thể chỉnh sửa bản nháp ở trạng thái draft' },
        { status: 400 }
      );
    }

    const formData: PlaceFormData = await request.json();
    
    // Generate slug from name if changed
    const slug = formData.name
      ? formData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      : draft.slug;

    // Update draft data
    const updateData = {
      slug,
      name: formData.name || '',
      description: formData.description || '',
      shortDescription: formData.shortDescription || '',
      region: formData.region,
      province: formData.province || '',
      provinceSlug: formData.province?.toLowerCase().replace(/\s+/g, '-') || '',
      type: formData.type,
      coordinates: formData.coordinates || { lat: null, lng: null },
      address: formData.address,
      images: formData.images || [],
      tags: formData.tags || [],
      updatedAt: new Date().toISOString()
    };

    await adminDb.collection('places').doc(draftId).update(updateData);

    return NextResponse.json({
      success: true,
      data: {
        id: draftId,
        ...draft,
        ...updateData
      },
      message: 'Đã cập nhật bản nháp thành công'
    });

  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật bản nháp' },
      { status: 500 }
    );
  }
}

// DELETE /api/places/drafts/[draftId] - Delete draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để xóa bản nháp' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { draftId } = params;

    // Check if draft exists and belongs to user
    const draftDoc = await adminDb.collection('places').doc(draftId).get();
    if (!draftDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bản nháp' },
        { status: 404 }
      );
    }

    const draft = draftDoc.data();
    if (draft?.createdBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xóa bản nháp này' },
        { status: 403 }
      );
    }

    if (draft?.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Chỉ có thể xóa bản nháp ở trạng thái draft' },
        { status: 400 }
      );
    }

    await adminDb.collection('places').doc(draftId).delete();

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bản nháp thành công'
    });

  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa bản nháp' },
      { status: 500 }
    );
  }
}
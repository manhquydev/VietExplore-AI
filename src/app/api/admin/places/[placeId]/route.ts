import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// DELETE /api/admin/places/[placeId] - Delete a place (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    // Verify admin access
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để truy cập chức năng này' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ admin mới có quyền xóa địa điểm' },
        { status: 403 }
      );
    }

    const { placeId } = params;
    const adminDb = getAdminDb();

    // Get place info for logging
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const place = placeDoc.data();

    // Delete from places collection
    await adminDb.collection('places').doc(placeId).delete();

    // Also delete from moderation queue if exists
    const moderationQuery = await adminDb.collection('moderation_queue')
      .where('contentId', '==', placeId)
      .get();

    const batch = adminDb.batch();
    moderationQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Log the deletion
    await adminDb.collection('moderation_logs').add({
      action: 'delete_place',
      placeId,
      placeName: place?.name || 'Unknown',
      performedBy: user.id,
      performedAt: new Date().toISOString(),
      reason: 'Admin deletion'
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa địa điểm "${place?.name}" thành công`
    });

  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa địa điểm' },
      { status: 500 }
    );
  }
}
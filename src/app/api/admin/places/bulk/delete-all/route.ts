import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// DELETE /api/admin/places/bulk/delete-all - Delete all places (admin only)
export async function DELETE(request: NextRequest) {
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
        { success: false, error: 'Chỉ admin mới có quyền xóa tất cả địa điểm' },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();

    // Get all places for counting
    const placesSnapshot = await adminDb.collection('places').get();
    const totalPlaces = placesSnapshot.size;

    if (totalPlaces === 0) {
      return NextResponse.json({
        success: true,
        message: 'Không có địa điểm nào để xóa'
      });
    }

    // Delete places in batches (Firestore has batch limit of 500)
    const batchSize = 500;
    let deletedCount = 0;

    while (true) {
      const placesQuery = await adminDb.collection('places').limit(batchSize).get();
      
      if (placesQuery.empty) {
        break;
      }

      const batch = adminDb.batch();
      placesQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });

      await batch.commit();
    }

    // Delete all related moderation queue items
    let moderationDeletedCount = 0;
    while (true) {
      const moderationQuery = await adminDb.collection('moderation_queue')
        .where('contentType', '==', 'place')
        .limit(batchSize)
        .get();
      
      if (moderationQuery.empty) {
        break;
      }

      const batch = adminDb.batch();
      moderationQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
        moderationDeletedCount++;
      });

      await batch.commit();
    }

    // Log the bulk deletion
    await adminDb.collection('moderation_logs').add({
      action: 'bulk_delete_all_places',
      deletedPlacesCount: deletedCount,
      deletedModerationItemsCount: moderationDeletedCount,
      performedBy: user.id,
      performedAt: new Date().toISOString(),
      reason: 'Admin bulk deletion - reset database'
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công ${deletedCount} địa điểm và ${moderationDeletedCount} mục kiểm duyệt liên quan`,
      data: {
        deletedPlaces: deletedCount,
        deletedModerationItems: moderationDeletedCount
      }
    });

  } catch (error) {
    console.error('Error deleting all places:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa tất cả địa điểm' },
      { status: 500 }
    );
  }
}
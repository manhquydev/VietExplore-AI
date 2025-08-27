import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { PlaceStatus } from '@/lib/types/places';

// PUT /api/admin/places/[placeId]/status - Update place status
export async function PUT(
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
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền thay đổi trạng thái địa điểm' },
        { status: 403 }
      );
    }

    const { placeId } = params;
    const { status } = await request.json();

    // Validate status
    const validStatuses: PlaceStatus[] = ['draft', 'submitted', 'in_review', 'published', 'hidden'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    // Get current place data
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const currentPlace = placeDoc.data();
    const previousStatus = currentPlace?.status;

    // Update place status
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
      moderatedBy: user.id
    };

    // Set publishedAt when publishing
    if (status === 'published' && previousStatus !== 'published') {
      updateData.publishedAt = new Date().toISOString();
    }

    // Remove publishedAt when hiding/unpublishing
    if (status === 'hidden' && previousStatus === 'published') {
      updateData.publishedAt = null;
    }

    await adminDb.collection('places').doc(placeId).update(updateData);

    // Log the status change
    await adminDb.collection('moderation_logs').add({
      action: 'change_place_status',
      placeId,
      placeName: currentPlace?.name || 'Unknown',
      previousStatus,
      newStatus: status,
      performedBy: user.id,
      performedAt: new Date().toISOString(),
      reason: `Status changed by ${user.role}`
    });

    // Update moderation queue if necessary
    if (status === 'published' || status === 'hidden') {
      // Remove from moderation queue as it's been processed
      const moderationQuery = await adminDb.collection('moderation_queue')
        .where('contentId', '==', placeId)
        .where('status', '==', 'pending')
        .get();

      if (!moderationQuery.empty) {
        const batch = adminDb.batch();
        moderationQuery.docs.forEach(doc => {
          batch.update(doc.ref, {
            status: status === 'published' ? 'approved' : 'rejected',
            reviewedBy: user.id,
            reviewedAt: new Date().toISOString(),
            reviewNotes: `Status changed to ${status} by admin`
          });
        });
        await batch.commit();
      }
    }

    const statusMessages = {
      'published': 'Đã xuất bản địa điểm thành công',
      'hidden': 'Đã ẩn địa điểm thành công',
      'draft': 'Đã chuyển về bản nháp',
      'submitted': 'Đã chuyển về trạng thái chờ duyệt',
      'in_review': 'Đã chuyển vào trạng thái đang duyệt'
    };

    return NextResponse.json({
      success: true,
      message: statusMessages[status] || `Đã cập nhật trạng thái thành ${status}`,
      data: {
        id: placeId,
        previousStatus,
        newStatus: status,
        updatedAt: updateData.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating place status:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật trạng thái địa điểm' },
      { status: 500 }
    );
  }
}
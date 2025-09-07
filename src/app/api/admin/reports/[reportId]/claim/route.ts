import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { RealtimeService } from '@/lib/firebase/realtime';

// POST /api/admin/reports/[reportId]/claim - Claim or release a report
export async function POST(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = await params;
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để thực hiện hành động này' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền thực hiện hành động này' },
        { status: 403 }
      );
    }

    const { action, notes } = await request.json();

    // Validate action
    if (!['claim', 'release'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    // Get the report
    const reportDoc = await adminDb.collection('place_reports').doc(reportId).get();
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();
    const currentStatus = reportData?.status;

    if (action === 'claim') {
      // Can only claim pending reports
      if (currentStatus !== 'pending') {
        return NextResponse.json(
          { success: false, error: 'Chỉ có thể tiếp nhận báo cáo ở trạng thái chờ xử lý' },
          { status: 400 }
        );
      }

      // Check if user already has too many reports in review (max 10 according to docs)
      const userReportsInReview = await adminDb
        .collection('place_reports')
        .where('status', '==', 'in_review')
        .where('reviewedBy', '==', user.id)
        .get();

      if (userReportsInReview.size >= 10) {
        return NextResponse.json(
          { success: false, error: 'Bạn đã có quá nhiều báo cáo đang xử lý. Giới hạn tối đa 10 báo cáo.' },
          { status: 400 }
        );
      }

      // Claim the report - change status to in_review and assign to user
      const updateData = {
        status: 'in_review',
        reviewedBy: user.id,
        claimedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewerInfo: {
          id: user.id,
          name: user.fullName || user.email,
          email: user.email,
          role: user.role
        }
      };

      if (notes) {
        updateData.reviewNotes = notes;
      }

      await adminDb.collection('place_reports').doc(reportId).update(updateData);

      // Log the action
      await adminDb.collection('moderation_logs').add({
        action: 'report_claimed',
        reportId,
        placeId: reportData?.placeId,
        placeName: reportData?.placeName,
        reportType: reportData?.reportType,
        moderatorId: user.id,
        moderatorInfo: {
          id: user.id,
          name: user.fullName || user.email,
          email: user.email,
          role: user.role
        },
        performedAt: new Date().toISOString(),
        notes: notes || 'Tiếp nhận báo cáo để điều tra',
        oldStatus: 'pending',
        newStatus: 'in_review'
      });

      // Update realtime stats: pending -1, in_review +1
      try {
        await RealtimeService.updateReportStatusStats('pending', 'in_review');
      } catch (error) {
        console.error('Failed to update realtime report stats:', error);
      }

      return NextResponse.json({
        success: true,
        message: 'Đã tiếp nhận báo cáo để điều tra. Báo cáo đã được khóa cho bạn xử lý trong 48 giờ.',
        data: {
          id: reportId,
          status: 'in_review',
          reviewerInfo: updateData.reviewerInfo,
          claimedAt: updateData.claimedAt
        }
      });

    } else if (action === 'release') {
      // Can only release reports that are assigned to this user
      if (currentStatus !== 'in_review') {
        return NextResponse.json(
          { success: false, error: 'Chỉ có thể trả về báo cáo đang điều tra' },
          { status: 400 }
        );
      }

      if (reportData?.reviewedBy !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Bạn chỉ có thể trả về báo cáo do bạn tiếp nhận' },
          { status: 403 }
        );
      }

      // Release the report back to pending pool
      const updateData = {
        status: 'pending',
        reviewedBy: null,
        claimedAt: null,
        updatedAt: new Date().toISOString(),
        reviewerInfo: null,
        reviewNotes: null,
        releaseReason: notes || 'Trả về pool chung'
      };

      await adminDb.collection('place_reports').doc(reportId).update(updateData);

      // Log the action
      await adminDb.collection('moderation_logs').add({
        action: 'report_released',
        reportId,
        placeId: reportData?.placeId,
        placeName: reportData?.placeName,
        reportType: reportData?.reportType,
        moderatorId: user.id,
        moderatorInfo: {
          id: user.id,
          name: user.fullName || user.email,
          email: user.email,
          role: user.role
        },
        performedAt: new Date().toISOString(),
        notes: notes || 'Trả báo cáo về pool chung',
        oldStatus: 'in_review',
        newStatus: 'pending'
      });

      // Update realtime stats: in_review -1, pending +1
      try {
        await RealtimeService.updateReportStatusStats('in_review', 'pending');
      } catch (error) {
        console.error('Failed to update realtime report stats:', error);
      }

      return NextResponse.json({
        success: true,
        message: 'Đã trả báo cáo về pool chung. Các moderator khác có thể tiếp nhận báo cáo này.',
        data: {
          id: reportId,
          status: 'pending',
          reviewerInfo: null,
          releasedAt: new Date().toISOString(),
          releaseReason: updateData.releaseReason
        }
      });
    }

  } catch (error) {
    console.error('Error handling report claim/release:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể thực hiện hành động' },
      { status: 500 }
    );
  }
}
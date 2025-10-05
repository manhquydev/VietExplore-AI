import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

interface RouteContext {
  params: Promise<{ reportId: string }>
}

// POST /api/admin/review-reports/[reportId]/claim - Claim or release a review report
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    console.log('[REVIEW REPORT CLAIM] POST endpoint called');

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

    const { reportId } = await context.params;
    const { action, notes } = await request.json();

    console.log('[REVIEW REPORT CLAIM] Processing action:', { reportId, action, userId: user.id });

    if (!action || !['claim', 'release'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Hành động không hợp lệ. Chỉ chấp nhận "claim" hoặc "release"' },
        { status: 400 }
      );
    }

    // Check if report exists
    const reportDoc = await db.collection('review_reports').doc(reportId).get();
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();

    // CLAIM ACTION
    if (action === 'claim') {
      // Check if already claimed by someone else
      if (reportData?.status === 'in_review' && reportData?.reviewedBy && reportData.reviewedBy !== user.id) {
        // Admin can override and claim any report
        if (user.role !== 'admin') {
          return NextResponse.json(
            {
              success: false,
              error: `Báo cáo đã được tiếp nhận bởi ${reportData.reviewerInfo?.name || 'moderator khác'}`
            },
            { status: 409 } // Conflict
          );
        }
        // Admin override - log this
        console.log('[REVIEW REPORT CLAIM] Admin override claim from:', reportData.reviewedBy);
      }

      // Claim the report
      const updateData = {
        status: 'in_review',
        reviewedBy: user.id,
        claimedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewerInfo: {
          id: user.id,
          name: user.name || user.displayName || user.email,
          email: user.email,
          role: user.role
        }
      };

      if (notes) {
        updateData.reviewNotes = notes;
      }

      await db.collection('review_reports').doc(reportId).update(updateData);

      console.log('[REVIEW REPORT CLAIM] Report claimed successfully:', { reportId, userId: user.id });

      // Log the action
      await db.collection('moderation_logs').add({
        action: 'review_report_claimed',
        reportId,
        reviewId: reportData?.reviewId,
        placeId: reportData?.placeId,
        placeName: reportData?.placeName,
        moderatorId: user.id,
        moderatorInfo: {
          id: user.id,
          name: user.name || user.displayName || user.email,
          email: user.email,
          role: user.role
        },
        performedAt: new Date().toISOString(),
        notes,
        oldStatus: reportData?.status,
        newStatus: 'in_review'
      });

      return NextResponse.json({
        success: true,
        message: 'Đã tiếp nhận báo cáo thành công',
        data: {
          id: reportId,
          ...reportData,
          ...updateData
        }
      });
    }

    // RELEASE ACTION
    if (action === 'release') {
      // Check if user owns the claim or is admin
      if (reportData?.reviewedBy !== user.id && user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Chỉ người tiếp nhận hoặc Admin có thể trả lại báo cáo' },
          { status: 403 }
        );
      }

      // Check if report is in reviewable state
      if (reportData?.status !== 'in_review') {
        return NextResponse.json(
          { success: false, error: 'Chỉ có thể trả lại báo cáo đang được xử lý' },
          { status: 400 }
        );
      }

      // Release the report back to pending pool
      const updateData: any = {
        status: 'pending',
        reviewedBy: null,
        claimedAt: null,
        reviewerInfo: null,
        updatedAt: new Date().toISOString()
      };

      if (notes) {
        updateData.releaseNotes = notes;
        updateData.releasedAt = new Date().toISOString();
        updateData.releasedBy = user.id;
      }

      await db.collection('review_reports').doc(reportId).update(updateData);

      console.log('[REVIEW REPORT CLAIM] Report released successfully:', { reportId, userId: user.id });

      // Log the action
      await db.collection('moderation_logs').add({
        action: 'review_report_released',
        reportId,
        reviewId: reportData?.reviewId,
        placeId: reportData?.placeId,
        placeName: reportData?.placeName,
        moderatorId: user.id,
        moderatorInfo: {
          id: user.id,
          name: user.name || user.displayName || user.email,
          email: user.email,
          role: user.role
        },
        performedAt: new Date().toISOString(),
        notes,
        oldStatus: reportData?.status,
        newStatus: 'pending'
      });

      return NextResponse.json({
        success: true,
        message: 'Đã trả báo cáo về pool chung',
        data: {
          id: reportId,
          ...reportData,
          ...updateData
        }
      });
    }

    // Should never reach here
    return NextResponse.json(
      { success: false, error: 'Hành động không được xử lý' },
      { status: 500 }
    );

  } catch (error) {
    console.error('[REVIEW REPORT CLAIM] Error processing claim/release:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Không thể thực hiện hành động',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

interface RouteContext {
  params: Promise<{ reportId: string }>
}

// PATCH /api/admin/review-reports/[reportId] - Update report status (admin/moderator only)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    console.log('[REVIEW REPORT ADMIN] PATCH endpoint called');

    const authResult = await verifyAuthToken(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để cập nhật báo cáo' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền cập nhật báo cáo' },
        { status: 403 }
      );
    }

    const { reportId } = await context.params;
    const { action, notes } = await request.json();

    console.log('[REVIEW REPORT ADMIN] Processing action:', { reportId, action, userId: user.id });

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin hành động' },
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

    // Map actions to statuses
    const statusMapping: Record<string, string> = {
      'resolve': 'resolved',
      'dismiss': 'dismissed',
      'escalate': 'in_review'  // Escalate reassigns to admin pool
    };

    const newStatus = statusMapping[action];
    if (!newStatus) {
      return NextResponse.json(
        { success: false, error: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    // Escalate: Only moderators can escalate, admins handle directly
    if (action === 'escalate' && user.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin không cần escalate. Hãy xử lý trực tiếp.' },
        { status: 403 }
      );
    }

    // Update report
    const updateData: any = {
      status: newStatus,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString(),
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

    // For escalate action, clear reviewedBy to return to pool
    if (action === 'escalate') {
      updateData.reviewedBy = null;
      updateData.escalatedBy = user.id;
      updateData.escalatedAt = new Date().toISOString();
    }

    await db.collection('review_reports').doc(reportId).update(updateData);

    console.log('[REVIEW REPORT ADMIN] Report updated successfully:', { reportId, newStatus });

    // Log the moderation action
    await db.collection('moderation_logs').add({
      action: `review_report_${action}`,
      reportId,
      reviewId: reportData?.reviewId,
      placeId: reportData?.placeId,
      placeName: reportData?.placeName,
      reportReason: reportData?.reason,
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
      newStatus
    });

    const actionMessages: Record<string, string> = {
      'resolve': 'giải quyết',
      'dismiss': 'bỏ qua',
      'escalate': 'chuyển lên Admin'
    };

    return NextResponse.json({
      success: true,
      message: `Báo cáo đã được ${actionMessages[action]}`,
      data: {
        id: reportId,
        ...reportData,
        ...updateData
      }
    });

  } catch (error) {
    console.error('[REVIEW REPORT ADMIN] Error updating report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Không thể cập nhật báo cáo',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/review-reports/[reportId] - Get specific report details
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const authResult = await verifyAuthToken(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để xem báo cáo' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xem báo cáo' },
        { status: 403 }
      );
    }

    const { reportId } = await context.params;

    // Get report details
    const reportDoc = await db.collection('review_reports').doc(reportId).get();
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();

    // Get review details if available
    let reviewDetails = null;
    if (reportData?.reviewId) {
      try {
        const reviewDoc = await db.collection('place_reviews').doc(reportData.reviewId).get();
        if (reviewDoc.exists) {
          reviewDetails = reviewDoc.data();
        }
      } catch (error) {
        console.warn('[REVIEW REPORT ADMIN] Could not fetch review details:', error);
      }
    }

    // Get place details if available
    let placeDetails = null;
    if (reportData?.placeId) {
      try {
        const placeDoc = await db.collection('places').doc(reportData.placeId).get();
        if (placeDoc.exists) {
          placeDetails = {
            id: reportData.placeId,
            name: placeDoc.data()?.name,
            slug: placeDoc.data()?.slug
          };
        }
      } catch (error) {
        console.warn('[REVIEW REPORT ADMIN] Could not fetch place details:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: reportId,
        ...reportData,
        reviewDetails,
        placeDetails
      }
    });

  } catch (error) {
    console.error('[REVIEW REPORT ADMIN] Error fetching report details:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải chi tiết báo cáo' },
      { status: 500 }
    );
  }
}

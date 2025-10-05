// src/app/api/reviews/[id]/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

interface RouteContext {
  params: Promise<{ id: string }>
}

// POST /api/reviews/[id]/report - Report a review
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    console.log('[REVIEW REPORT] POST endpoint called');

    const authResult = await verifyAuthToken(request);
    console.log('[REVIEW REPORT] Auth result:', { success: authResult.success, userId: authResult.user?.id });

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để báo cáo đánh giá' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    console.log('[REVIEW REPORT] Extracting reviewId from context.params...');
    const { id: reviewId } = await context.params;
    console.log('[REVIEW REPORT] ReviewId:', reviewId);

    // Rate limiting: 3 reports per user per week (prevent spam)
    // TODO: Re-enable after Firestore composite index (reportedBy + createdAt) finishes building
    // Index deployed at: 2025-10-05 01:39 UTC
    // Expected ready: ~10 minutes after deployment
    // Check status: https://console.firebase.google.com/project/vietexplore-ai/firestore/indexes
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // TEMPORARY: Bypass rate limiting until index is ready
    const recentReports = { size: 0 };
    console.log('[REVIEW REPORT] Rate limiting BYPASSED (waiting for index to build)');

    /* UNCOMMENT AFTER INDEX IS READY (~10 minutes from 01:39 UTC):
    const recentReports = await db.collection('review_reports')
      .where('reportedBy', '==', user.id)
      .where('createdAt', '>=', oneWeekAgo)
      .get();
    */

    // Admins and Moderators bypass rate limit
    const isModerator = user.role === 'moderator' || user.role === 'admin';

    if (recentReports.size >= 3 && !isModerator) {
      return NextResponse.json(
        { success: false, error: 'Bạn chỉ có thể báo cáo tối đa 3 đánh giá trong 1 tuần' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { reason, details } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn lý do báo cáo' },
        { status: 400 }
      );
    }

    // Check if review exists
    const reviewDoc = await db.collection('place_reviews').doc(reviewId).get();
    if (!reviewDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      );
    }

    const review = reviewDoc.data()!;

    // Check if user already reported this review
    const existingReport = await db.collection('review_reports')
      .where('reviewId', '==', reviewId)
      .where('reportedBy', '==', user.id)
      .where('status', 'in', ['pending', 'under_review'])
      .get();

    if (!existingReport.empty) {
      return NextResponse.json(
        { success: false, error: 'Bạn đã báo cáo đánh giá này rồi' },
        { status: 400 }
      );
    }

    // Create report
    const reportData = {
      reviewId,
      placeId: review.placeId,
      placeName: review.placeName,
      reviewContent: review.content.substring(0, 200), // Preview
      reviewRating: review.rating,
      reviewAuthorId: review.userId,
      reportedBy: user.id,
      reporterName: user.name || user.displayName || 'Unknown',
      reporterEmail: user.email || user.emailAddress || 'no-email@vietexplore.com',
      reason,
      details: details || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('[REVIEW REPORT] Attempting to create report with data:', {
      ...reportData,
      reviewContent: reportData.reviewContent.substring(0, 50) + '...' // Truncate for logs
    });

    const reportRef = await db.collection('review_reports').add(reportData);

    console.log('[REVIEW REPORT] Successfully created report:', reportRef.id);

    // Optionally: Send notification to moderators
    // await notifyModeratorsOfNewReport(reportRef.id)

    return NextResponse.json({
      success: true,
      message: 'Báo cáo đã được gửi. Chúng tôi sẽ xem xét trong thời gian sớm nhất.',
      reportId: reportRef.id
    });

  } catch (error) {
    console.error('[REVIEW REPORT] CAUGHT ERROR:', error);
    console.error('[REVIEW REPORT] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi khi tạo báo cáo. Vui lòng thử lại sau.',
        // Include error details in development
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined
          }
        })
      },
      { status: 500 }
    );
  }
}

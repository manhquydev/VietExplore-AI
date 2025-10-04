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
    const authResult = await verifyAuthToken(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để báo cáo đánh giá' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { id: reviewId } = await context.params;

    // Rate limiting: 3 reports per user per week (prevent spam)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentReports = await db.collection('review_reports')
      .where('reportedBy', '==', user.id)
      .where('createdAt', '>=', oneWeekAgo)
      .get();

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
      reporterName: user.name || 'Unknown',
      reporterEmail: user.email,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const reportRef = await db.collection('review_reports').add(reportData);

    // Optionally: Send notification to moderators
    // await notifyModeratorsOfNewReport(reportRef.id)

    return NextResponse.json({
      success: true,
      message: 'Báo cáo đã được gửi. Chúng tôi sẽ xem xét trong thời gian sớm nhất.',
      reportId: reportRef.id
    });

  } catch (error) {
    console.error('Error creating review report:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo báo cáo. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

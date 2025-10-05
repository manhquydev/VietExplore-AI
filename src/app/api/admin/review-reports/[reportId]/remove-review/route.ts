import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db, FieldValue } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

interface RouteContext {
  params: Promise<{ reportId: string }>
}

// POST /api/admin/review-reports/[reportId]/remove-review - Remove review when report is valid
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    console.log('[REMOVE REVIEW] POST endpoint called');

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
        { success: false, error: 'Bạn không có quyền xóa đánh giá' },
        { status: 403 }
      );
    }

    const { reportId } = await context.params;
    const { notes } = await request.json();

    console.log('[REMOVE REVIEW] Processing removal:', { reportId, userId: user.id });

    // Get report data
    const reportDoc = await db.collection('review_reports').doc(reportId).get();
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      );
    }

    const report = reportDoc.data();

    // Check if report is in reviewable state
    if (report?.status !== 'in_review') {
      return NextResponse.json(
        { success: false, error: 'Chỉ có thể xóa đánh giá khi báo cáo đang được xử lý' },
        { status: 400 }
      );
    }

    // Check if user owns the claim or is admin
    if (report?.reviewedBy !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ người tiếp nhận hoặc Admin có thể xóa đánh giá' },
        { status: 403 }
      );
    }

    // Get review to be removed
    const reviewDoc = await db.collection('place_reviews').doc(report.reviewId).get();
    if (!reviewDoc.exists) {
      console.warn('[REMOVE REVIEW] Review already deleted or not found:', report.reviewId);
      // Still mark report as resolved, but with note that review was already deleted
      await db.collection('review_reports').doc(reportId).update({
        status: 'resolved',
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        action: 'review_already_deleted',
        reviewNotes: (notes || '') + ' (Review đã bị xóa trước đó)'
      });

      return NextResponse.json({
        success: true,
        message: 'Báo cáo đã được giải quyết. Đánh giá đã bị xóa trước đó.',
        warning: 'Review không tồn tại'
      });
    }

    const review = reviewDoc.data();

    console.log('[REMOVE REVIEW] Deleting review:', {
      reviewId: report.reviewId,
      placeId: report.placeId,
      rating: review?.rating
    });

    // DELETE REVIEW
    await db.collection('place_reviews').doc(report.reviewId).delete();

    console.log('[REMOVE REVIEW] Review deleted successfully');

    // UPDATE PLACE STATS
    try {
      const placeDoc = await db.collection('places').doc(report.placeId).get();
      if (placeDoc.exists) {
        const place = placeDoc.data();
        const currentTotalReviews = place?.stats?.totalReviews || 1;
        const currentAverageRating = place?.stats?.averageRating || 0;
        const reviewRating = review?.rating || 0;

        // Calculate new stats
        const newTotalReviews = Math.max(0, currentTotalReviews - 1);

        let newAverageRating = 0;
        if (newTotalReviews > 0) {
          // Reverse calculate sum and subtract removed review
          const oldSum = currentAverageRating * currentTotalReviews;
          const newSum = oldSum - reviewRating;
          newAverageRating = newSum / newTotalReviews;
        }

        // Update place stats
        const statsUpdate: any = {
          'stats.totalReviews': newTotalReviews,
          'stats.averageRating': newAverageRating,
          updatedAt: new Date().toISOString()
        };

        // Update rating breakdown (decrement count for this rating)
        if (reviewRating >= 1 && reviewRating <= 5) {
          statsUpdate[`stats.ratingBreakdown.${reviewRating}`] = FieldValue.increment(-1);
        }

        await db.collection('places').doc(report.placeId).update(statsUpdate);

        console.log('[REMOVE REVIEW] Place stats updated:', {
          placeId: report.placeId,
          oldTotal: currentTotalReviews,
          newTotal: newTotalReviews,
          oldAvg: currentAverageRating,
          newAvg: newAverageRating
        });
      } else {
        console.warn('[REMOVE REVIEW] Place not found:', report.placeId);
      }
    } catch (statsError) {
      console.error('[REMOVE REVIEW] Error updating place stats:', statsError);
      // Don't fail the entire operation if stats update fails
    }

    // UPDATE REPORT STATUS
    await db.collection('review_reports').doc(reportId).update({
      status: 'resolved',
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      action: 'review_removed',
      reviewNotes: notes || 'Đánh giá đã bị xóa do vi phạm quy định',
      reviewerInfo: {
        id: user.id,
        name: user.name || user.displayName || user.email,
        email: user.email,
        role: user.role
      }
    });

    console.log('[REMOVE REVIEW] Report updated to resolved');

    // LOG MODERATION ACTION
    await db.collection('moderation_logs').add({
      action: 'review_removed',
      reportId,
      reviewId: report.reviewId,
      placeId: report.placeId,
      placeName: report.placeName,
      reviewRating: review?.rating,
      reviewContent: review?.content?.substring(0, 200),
      reportReason: report.reason,
      moderatorId: user.id,
      moderatorInfo: {
        id: user.id,
        name: user.name || user.displayName || user.email,
        email: user.email,
        role: user.role
      },
      performedAt: new Date().toISOString(),
      notes,
      oldStatus: report.status,
      newStatus: 'resolved'
    });

    console.log('[REMOVE REVIEW] Moderation action logged');

    // TODO: Send notification to review author (optional)
    // await notifyReviewAuthor(review.userId, report.placeId, report.placeName, notes);

    return NextResponse.json({
      success: true,
      message: 'Đánh giá vi phạm đã được xóa thành công',
      data: {
        reportId,
        reviewId: report.reviewId,
        placeId: report.placeId,
        action: 'review_removed'
      }
    });

  } catch (error) {
    console.error('[REMOVE REVIEW] Error removing review:', error);
    console.error('[REMOVE REVIEW] Error stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      {
        success: false,
        error: 'Không thể xóa đánh giá. Vui lòng thử lại.',
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined
          }
        })
      },
      { status: 500 }
    );
  }
}

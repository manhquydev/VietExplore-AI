import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

const getAnalyticsHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  try {
    const { adminDb } = getFirebaseAdmin();

    // --- Perform all queries in parallel for efficiency ---
    const [
      placesCount,
      publishedPlacesCount,
      pendingModCount,
      usersCount,
      moderationStats,
    ] = await Promise.all([
      adminDb.collection('places').count().get(),
      adminDb.collection('places').where('status', '==', 'published').count().get(),
      adminDb.collection('moderation/requests/items').where('status', 'in', ['queued', 'in_review']).count().get(),
      adminDb.collection('users').count().get(),
      adminDb.collection('moderation/requests/items').get() // For more detailed stats
    ]);

    // --- Aggregate Platform Metrics ---
    const platformMetrics = {
        totalDestinations: placesCount.data().count,
        publishedContent: publishedPlacesCount.data().count,
        pendingModeration: pendingModCount.data().count,
        hiddenContent: 0, // Placeholder
    };

    // --- Aggregate User Growth Metrics ---
    const userGrowth = {
        newUsersThisMonth: 0, // Placeholder, requires more complex query
        activeUsers: usersCount.data().count,
        retentionRate: 0, // Placeholder
        usersByRole: [], // Placeholder
    };

    // --- Aggregate Moderation Metrics ---
    let totalReviews = 0;
    let approvedCount = 0;
    moderationStats.forEach(doc => {
        const data = doc.data();
        if (data.status === 'approved' || data.status === 'rejected') {
            totalReviews++;
            if (data.status === 'approved') {
                approvedCount++;
            }
        }
    });
    const approvalRate = totalReviews > 0 ? (approvedCount / totalReviews) * 100 : 0;
    const moderationMetrics = {
        avgReviewTime: 'N/A', // Placeholder
        approvalRate: parseFloat(approvalRate.toFixed(1)),
        totalReviews,
        slaCompliance: 0, // Placeholder
    };

    const analyticsData = {
        platformMetrics,
        userGrowth,
        moderationMetrics,
        // trafficMetrics are out of scope for this API
    };

    return NextResponse.json({
      success: true,
      analyticsData,
    });

  } catch (error: any) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getAnalyticsHandler, ['admin']);

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

const getContentDataHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  try {
    const { adminDb } = getFirebaseAdmin();

    // --- Perform all queries in parallel ---
    const [
      publishedPlacesCount,
      hiddenPlacesCount,
      pendingReviewCount,
      contributorPlacesCount,
      partnerPlacesCount,
      verifiedPlacesCount,
      communityPlacesCount,
      recentContentSnapshot,
    ] = await Promise.all([
      adminDb.collection('places').where('status', '==', 'published').count().get(),
      adminDb.collection('places').where('status', '==', 'hidden').count().get(),
      adminDb.collection('moderation/requests/items').where('status', 'in', ['queued', 'in_review']).count().get(),
      adminDb.collection('places').where('trustLabel', '==', 'contributor').count().get(),
      adminDb.collection('places').where('trustLabel', '==', 'partner').count().get(),
      adminDb.collection('places').where('trustLabel', '==', 'verified').count().get(),
      adminDb.collection('places').where('trustLabel', '==', 'community').count().get(),
      adminDb.collection('placeDrafts').orderBy('updatedAt', 'desc').limit(5).get(),
    ]);

    const totalPlaces = publishedPlacesCount.data().count + hiddenPlacesCount.data().count;

    const contentStats = {
        totalPlaces,
        publishedPlaces: publishedPlacesCount.data().count,
        pendingReview: pendingReviewCount.data().count,
        hiddenPlaces: hiddenPlacesCount.data().count,
        trustBadgeStats: {
          contributor: contributorPlacesCount.data().count,
          partner: partnerPlacesCount.data().count,
          verified: verifiedPlacesCount.data().count,
          community: communityPlacesCount.data().count,
        }
    };

    const recentContent = recentContentSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.title,
            province: data.province,
            type: data.type,
            status: data.status,
            trustBadge: data.submitterRole, // This is an approximation
            submittedBy: data.submitter,
            submittedAt: data.updatedAt.toDate().toISOString(),
        }
    });


    return NextResponse.json({
      success: true,
      contentStats,
      recentContent,
    });

  } catch (error: any) {
    console.error('Error fetching content data:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getContentDataHandler, ['admin']);

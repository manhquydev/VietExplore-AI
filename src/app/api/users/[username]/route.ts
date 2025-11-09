import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';

/**
 * GET /api/users/[username]
 * Public endpoint to get user profile by username
 * No authentication required - returns public profile data only
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username is required'
        },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    // Query user by username
    const usersSnapshot = await adminDb
      .collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Return public profile data only
    const publicProfile = {
      id: userDoc.id,
      username: userData.username,
      fullName: userData.fullName || userData.displayName,
      avatar: userData.avatar || null,
      role: userData.role,
      verified: userData.verified || false,
      emailVerified: userData.emailVerified || false,
      badges: userData.badges || [],
      profile: {
        bio: userData.profile?.bio || '',
        location: userData.profile?.location || '',
        website: userData.profile?.website || '',
        socialLinks: userData.profile?.socialLinks || {}
      },
      stats: {
        placesContributed: userData.stats?.placesContributed || 0,
        reviewsWritten: userData.stats?.reviewsWritten || 0,
        helpfulVotesReceived: userData.stats?.helpfulVotesReceived || 0,
        itinerariesCreated: userData.stats?.itinerariesCreated || 0
      },
      createdAt: userData.createdAt
    };

    // Get user's published and pending places
    // Show published + in_review + submitted (transparency for community)
    const placesSnapshot = await adminDb
      .collection('places')
      .where('createdBy', '==', userDoc.id)
      .where('status', 'in', ['published', 'in_review', 'submitted'])
      .orderBy('createdAt', 'desc')
      .limit(12)
      .get();

    const places = placesSnapshot.docs.map(doc => {
      const placeData = doc.data();
      return {
        id: doc.id,
        name: placeData.name,
        slug: placeData.slug,
        shortDescription: placeData.shortDescription,
        type: placeData.type,
        region: placeData.region,
        province: placeData.province,
        images: placeData.images || [],
        rating: placeData.rating || { average: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
        tags: placeData.tags || [],
        viewCount: placeData.viewCount || placeData.stats?.views || 0,
        likeCount: placeData.likeCount || placeData.stats?.likes || 0,
        stats: placeData.stats || { views: 0, likes: 0, saves: 0, reviews: 0 },
        trustLabel: placeData.trustLabel,
        createdAt: placeData.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        user: publicProfile,
        places
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user profile'
      },
      { status: 500 }
    );
  }
}

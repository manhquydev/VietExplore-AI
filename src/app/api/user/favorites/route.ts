import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// GET /api/user/favorites - Get user's favorite places
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để xem danh sách yêu thích' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's favorites (simplified query to avoid index requirement)
    const favoritesQuery = adminDb
      .collection('user_favorites')
      .where('userId', '==', userId);

    const favoritesSnapshot = await favoritesQuery.get();
    let allFavorites = favoritesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort in memory to avoid composite index requirement
    allFavorites.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    // Apply offset
    const favorites = allFavorites.slice(offset);
    
    // Get detailed place information for each favorite
    const detailedFavorites = [];
    for (const favorite of favorites) {
      try {
        const placeDoc = await adminDb.collection('places').doc(favorite.placeId).get();
        if (placeDoc.exists) {
          const placeData = placeDoc.data();
          if (placeData && placeData.status === 'published') {
            detailedFavorites.push({
              id: favorite.id,
              favoriteId: favorite.id,
              placeId: favorite.placeId,
              favoritedAt: favorite.createdAt,
              place: {
                id: favorite.placeId,
                ...placeData
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching place ${favorite.placeId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: detailedFavorites,
      pagination: {
        limit,
        offset,
        hasMore: allFavorites.length > offset + limit,
        total: allFavorites.length
      }
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách yêu thích' },
      { status: 500 }
    );
  }
}
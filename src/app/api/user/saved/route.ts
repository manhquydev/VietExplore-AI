import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// GET /api/user/saved - Get user's saved places
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để xem danh sách đã lưu' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's saved places (simplified query to avoid index requirement)
    const savedQuery = adminDb
      .collection('user_saved_places')
      .where('userId', '==', userId);

    const savedSnapshot = await savedQuery.get();
    let allSaved = savedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort in memory to avoid composite index requirement
    allSaved.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    // Apply offset
    const saved = allSaved.slice(offset);
    
    // Get detailed place information for each saved place
    const detailedSaved = [];
    for (const savedPlace of saved) {
      try {
        const placeDoc = await adminDb.collection('places').doc(savedPlace.placeId).get();
        if (placeDoc.exists) {
          const placeData = placeDoc.data();
          if (placeData && placeData.status === 'published') {
            detailedSaved.push({
              id: savedPlace.id,
              savedId: savedPlace.id,
              placeId: savedPlace.placeId,
              savedAt: savedPlace.createdAt,
              place: {
                id: savedPlace.placeId,
                ...placeData
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching place ${savedPlace.placeId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: detailedSaved,
      pagination: {
        limit,
        offset,
        hasMore: allSaved.length > offset + limit,
        total: allSaved.length
      }
    });

  } catch (error) {
    console.error('Error fetching saved places:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách đã lưu' },
      { status: 500 }
    );
  }
}
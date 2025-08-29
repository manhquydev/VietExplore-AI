import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { Place } from '@/lib/types/places';

// GET /api/places/ranking - Get ranked places
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(request.url);
    
    const rankBy = searchParams.get('rankBy') || 'rating'; // rating, views, likes, reviews
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const timeframe = searchParams.get('timeframe') || 'all'; // all, month, week, year
    const limit = parseInt(searchParams.get('limit') || '20');

    let query: FirebaseFirestore.Query = adminDb.collection('places')
      .where('status', '==', 'published');

    // Apply filters
    if (region) {
      query = query.where('region', '==', region);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }

    // For time-based filtering, we'll need to filter in memory
    let timeFilter: Date | null = null;
    if (timeframe !== 'all') {
      const now = new Date();
      switch (timeframe) {
        case 'week':
          timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          timeFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Get all places and sort in memory for better flexibility
    const snapshot = await query.limit(limit * 2).get(); // Get more for sorting
    let places: (Place & { score?: number })[] = [];

    snapshot.forEach(doc => {
      const placeData = doc.data() as Place;
      const place = {
        id: doc.id,
        ...placeData
      };

      // Apply time filter if specified
      if (timeFilter) {
        const createdAt = new Date(place.createdAt);
        if (createdAt < timeFilter) {
          return; // Skip this place
        }
      }

      // Calculate ranking score based on criteria
      let score = 0;
      switch (rankBy) {
        case 'rating':
          // Weighted score: average rating * number of reviews (with minimum threshold)
          const reviewCount = place.rating?.count || 0;
          const avgRating = place.rating?.average || 0;
          score = avgRating * Math.min(reviewCount, 100) / 10; // Normalize
          break;
          
        case 'views':
          score = place.viewCount || 0;
          break;
          
        case 'likes':
          score = place.likeCount || 0;
          break;
          
        case 'reviews':
          score = place.rating?.count || 0;
          break;
          
        case 'trending':
          // Complex trending score: recent activity + engagement
          const days = Math.max(1, Math.floor((Date.now() - new Date(place.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
          const viewsPerDay = (place.viewCount || 0) / days;
          const likesPerDay = (place.likeCount || 0) / days;
          const reviewsPerDay = (place.rating?.count || 0) / days;
          score = (viewsPerDay * 0.4) + (likesPerDay * 0.4) + (reviewsPerDay * 0.2);
          break;
          
        default:
          score = place.rating?.average || 0;
      }

      place.score = score;
      places.push(place);
    });

    // Sort by score descending
    places.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Apply limit
    places = places.slice(0, limit);

    // Remove score from response (internal only)
    const cleanedPlaces = places.map(({ score, ...place }) => place);

    return NextResponse.json({
      success: true,
      data: cleanedPlaces,
      total: cleanedPlaces.length,
      ranking: {
        rankBy,
        region,
        type,
        timeframe,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching place rankings:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải bảng xếp hạng địa điểm' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { ReviewFormData, PlaceReview, ReviewStats } from '@/lib/types/reviews';

// POST /api/places/[placeId]/reviews - Add a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để đánh giá địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { id: placeId } = await params;

    // Check if place exists and is published
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const place = placeDoc.data();
    if (place?.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Chỉ có thể đánh giá địa điểm đã được xuất bản' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this place
    const existingReview = await adminDb.collection('place_reviews')
      .where('placeId', '==', placeId)
      .where('userId', '==', user.id)
      .get();

    if (!existingReview.empty) {
      return NextResponse.json(
        { success: false, error: 'Bạn đã đánh giá địa điểm này rồi' },
        { status: 400 }
      );
    }

    const formData: ReviewFormData = await request.json();

    // Validate required fields
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn đánh giá từ 1-5 sao' },
        { status: 400 }
      );
    }

    // Create review
    const reviewData: Omit<PlaceReview, 'id'> = {
      placeId,
      placeName: place?.name || 'Unknown',
      userId: user.id,
      userInfo: {
        id: user.id,
        name: formData.isAnonymous ? 'Người dùng ẩn danh' : (user.fullName || user.email),
        role: user.role,
        avatar: user.avatar
      },
      rating: formData.rating,
      title: formData.title,
      content: formData.content,
      images: formData.images as string[] || [],
      visitDate: formData.visitDate,
      isAnonymous: formData.isAnonymous || false,
      isVerified: false, // TODO: Implement visit verification
      helpfulCount: 0,
      reportCount: 0,
      status: 'published', // Auto-publish reviews for now
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('place_reviews').add(reviewData);

    // Update place rating
    await updatePlaceRating(adminDb, placeId);

    // Update user stats
    await adminDb.collection('users').doc(user.id).update({
      'stats.reviewsWritten': (user.stats?.reviewsWritten || 0) + 1,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...reviewData
      },
      message: 'Đã gửi đánh giá thành công!'
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể gửi đánh giá' },
      { status: 500 }
    );
  }
}

// GET /api/places/[placeId]/reviews - Get reviews for a place
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const { id: placeId } = await params;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, highest_rating, lowest_rating, most_helpful

    // Check if place exists
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    // Ultra-simplified query to avoid any index requirements
    // Get all reviews for this place and filter/sort in memory
    let query: FirebaseFirestore.Query = adminDb.collection('place_reviews')
      .where('placeId', '==', placeId)
      .limit(100); // Get reasonable amount

    const snapshot = await query.get();
    const allReviews: PlaceReview[] = [];

    snapshot.forEach(doc => {
      const reviewData = doc.data();
      // Filter by status in memory to avoid index requirement
      if (reviewData.status === 'published') {
        allReviews.push({
          id: doc.id,
          ...reviewData
        } as PlaceReview);
      }
    });

    // Apply sorting in memory
    allReviews.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest_rating':
          return b.rating - a.rating;
        case 'lowest_rating':
          return a.rating - b.rating;
        case 'most_helpful':
          return b.helpfulCount - a.helpfulCount;
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Apply pagination
    const reviews = allReviews.slice(offset, offset + limit);

    // Get review stats
    const stats = await getReviewStats(adminDb, placeId);

    return NextResponse.json({
      success: true,
      data: reviews,
      stats,
      total: stats.totalReviews,
      pagination: {
        limit,
        offset,
        hasMore: allReviews.length > offset + limit
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải đánh giá' },
      { status: 500 }
    );
  }
}

// Helper function to update place rating
async function updatePlaceRating(adminDb: FirebaseFirestore.Firestore, placeId: string) {
  const reviewsSnapshot = await adminDb.collection('place_reviews')
    .where('placeId', '==', placeId)
    .where('status', '==', 'published')
    .get();

  let totalRating = 0;
  let count = 0;
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviewsSnapshot.forEach(doc => {
    const review = doc.data();
    totalRating += review.rating;
    count++;
    breakdown[review.rating as keyof typeof breakdown]++;
  });

  const average = count > 0 ? totalRating / count : 0;

  await adminDb.collection('places').doc(placeId).update({
    rating: {
      average: parseFloat(average.toFixed(1)),
      count,
      breakdown
    },
    updatedAt: new Date().toISOString()
  });
}

// Helper function to get review stats
async function getReviewStats(adminDb: FirebaseFirestore.Firestore, placeId: string): Promise<ReviewStats> {
  const reviewsSnapshot = await adminDb.collection('place_reviews')
    .where('placeId', '==', placeId)
    .where('status', '==', 'published')
    .get();

  let totalRating = 0;
  let count = 0;
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const recentReviews: PlaceReview[] = [];

  const sortedReviews = reviewsSnapshot.docs
    .sort((a, b) => new Date(b.data().createdAt).getTime() - new Date(a.data().createdAt).getTime())
    .slice(0, 5); // Get 5 most recent

  reviewsSnapshot.forEach(doc => {
    const review = doc.data();
    totalRating += review.rating;
    count++;
    breakdown[review.rating as keyof typeof breakdown]++;
  });

  sortedReviews.forEach(doc => {
    recentReviews.push({
      id: doc.id,
      ...doc.data()
    } as PlaceReview);
  });

  const averageRating = count > 0 ? parseFloat((totalRating / count).toFixed(1)) : 0;

  return {
    totalReviews: count,
    averageRating,
    ratingBreakdown: breakdown,
    recentReviews
  };
}
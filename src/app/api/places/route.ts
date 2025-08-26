import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { Place, PlaceFilters, PlaceFormData } from '@/lib/types/places';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// GET /api/places - Fetch places with filtering
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(request.url);
    
    const filters: PlaceFilters = {
      region: searchParams.get('region') as any,
      province: searchParams.get('province') || undefined,
      type: searchParams.get('type') as any,
      trustLabel: searchParams.get('trustLabel') as any,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'newest',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    let query: FirebaseFirestore.Query = adminDb.collection('places')
      .where('status', '==', 'published');

    // Apply filters
    if (filters.region) {
      query = query.where('region', '==', filters.region);
    }
    
    if (filters.province) {
      query = query.where('province', '==', filters.province);
    }
    
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }
    
    if (filters.trustLabel) {
      query = query.where('trustLabel', '==', filters.trustLabel);
    }

    // For now, just use basic ordering to avoid complex indexes
    // We'll sort in memory for better performance without needing Firebase composite indexes
    query = query.orderBy('createdAt', 'desc');
    
    if (filters.limit) {
      // Get more data for in-memory sorting
      query = query.limit(Math.min(filters.limit * 2, 100));
    }

    const snapshot = await query.get();
    let places: Place[] = [];

    snapshot.forEach(doc => {
      places.push({
        id: doc.id,
        ...doc.data()
      } as Place);
    });

    // Apply sorting in memory
    switch (filters.sortBy) {
      case 'oldest':
        places.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rating':
        places.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'popular':
        places.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      default: // newest - already sorted by query
        break;
    }

    // Apply pagination after sorting
    if (filters.offset && filters.offset > 0) {
      places = places.slice(filters.offset);
    }
    
    if (filters.limit) {
      places = places.slice(0, filters.limit);
    }

    // If search term provided, filter by name/description (client-side for now)
    let filteredPlaces = places;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPlaces = places.filter(place => 
        place.name.toLowerCase().includes(searchTerm) ||
        (place.description && place.description.toLowerCase().includes(searchTerm)) ||
        (place.tags && place.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredPlaces,
      total: filteredPlaces.length,
      filters
    });

  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách địa điểm' },
      { status: 500 }
    );
  }
}

// POST /api/places - Create new place
export async function POST(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để tạo địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Check permissions - only allow contributor, partner, or admin roles to create places
    if (!['contributor', 'partner', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền tạo địa điểm' },
        { status: 403 }
      );
    }

    const formData: PlaceFormData = await request.json();

    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .trim();

    // Determine trust label based on user role
    let trustLabel: Place['trustLabel'] = 'community';
    if (user.role === 'contributor') trustLabel = 'contributor';
    if (user.role === 'partner') trustLabel = 'partner';

    // Create place document
    const placeData: Omit<Place, 'id'> = {
      slug,
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      region: formData.region,
      province: formData.province,
      provinceSlug: formData.province.toLowerCase().replace(/\s+/g, '-'),
      type: formData.type,
      coordinates: formData.coordinates,
      address: formData.address,
      images: [], // Will be handled separately
      trustLabel,
      source: {
        type: user.role === 'partner' ? 'partner' : 'user',
        userId: user.id,
        partnerName: user.role === 'partner' ? user.fullName : undefined
      },
      status: user.role === 'partner' ? 'published' : 'submitted', // Partners get fast-track
      rating: {
        average: 0,
        count: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      tags: formData.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: user.role === 'partner' ? new Date().toISOString() : undefined,
      createdBy: user.id,
      viewCount: 0,
      likeCount: 0,
      reportCount: 0,
      featured: false
    };

    const docRef = await adminDb.collection('places').add(placeData);

    // Add to moderation queue if not a partner (partners get fast-track approval)
    if (user.role !== 'partner') {
      const priorityMap = {
        'contributor': 3,
        'traveler': 2,
        'guest': 1
      };

      await adminDb.collection('moderation_queue').add({
        contentType: 'place',
        contentId: docRef.id,
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        priority: priorityMap[user.role] || 1,
        metadata: {
          title: formData.name,
          type: formData.type,
          region: formData.region,
          province: formData.province,
          hasImages: (formData.images?.length || 0) > 0,
          hasCoordinates: !!(formData.coordinates?.lat && formData.coordinates?.lng)
        }
      });
    }

    // Update user stats
    await adminDb.collection('users').doc(user.id).update({
      'stats.placesContributed': (user.stats?.placesContributed || 0) + 1,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...placeData
      },
      message: user.role === 'partner' 
        ? 'Địa điểm đã được tạo và xuất bản thành công'
        : 'Địa điểm đã được gửi để kiểm duyệt. Chúng tôi sẽ xem xét trong vòng 24-48 giờ.'
    });

  } catch (error) {
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'Không thể tạo địa điểm' },
      { status: 500 }
    );
  }
}

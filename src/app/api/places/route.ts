import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin-safe';
import { Place, PlaceFilters, PlaceFormData } from '@/lib/types/places';
import { verifyAuthToken } from '@/lib/auth-middleware';

// GET /api/places - Fetch places with filtering
export async function GET(request: NextRequest) {
  try {
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

    let query = adminDb.collection('places')
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

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        query = query.orderBy('createdAt', 'asc');
        break;
      case 'rating':
        query = query.orderBy('rating.average', 'desc');
        break;
      case 'popular':
        query = query.orderBy('viewCount', 'desc');
        break;
      default: // newest
        query = query.orderBy('createdAt', 'desc');
    }

    // Apply pagination
    if (filters.offset && filters.offset > 0) {
      query = query.offset(filters.offset);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    const places: Place[] = [];

    snapshot.forEach(doc => {
      places.push({
        id: doc.id,
        ...doc.data()
      } as Place);
    });

    // If search term provided, filter by name/description (client-side for now)
    let filteredPlaces = places;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPlaces = places.filter(place => 
        place.name.toLowerCase().includes(searchTerm) ||
        place.description.toLowerCase().includes(searchTerm) ||
        place.tags.some(tag => tag.toLowerCase().includes(searchTerm))
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
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để tạo địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Check permissions
    if (!['contributor', 'partner', 'moderator', 'admin'].includes(user.role)) {
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
        : 'Địa điểm đã được gửi để kiểm duyệt'
    });

  } catch (error) {
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'Không thể tạo địa điểm' },
      { status: 500 }
    );
  }
}

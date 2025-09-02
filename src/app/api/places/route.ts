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
      { success: false, error: 'Không thể tải danh sách địa điểm' },
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
        { success: false, error: 'Bạn cần đăng nhập để tạo địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Check permissions - only allow contributor, partner, or admin roles to create places
    if (!['contributor', 'partner', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền tạo địa điểm' },
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
    if (user.role === 'admin') trustLabel = 'verified'; // Admin gets special verified label
    
    // Admin bypass authority - directly publish with special trust label
    const isAdminBypass = user.role === 'admin' && formData.status !== 'draft';

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
      images: formData.images || [], // Include images from form data
      video: formData.video || null,
      vietnamAddress: formData.vietnamAddress || null,
      addressConversion: formData.addressConversion || null,
      sources: formData.sources || [],
      openingHours: formData.openingHours || null,
      entryFee: formData.entryFee || null,
      bestTimeToVisit: formData.bestTimeToVisit || null,
      facilities: formData.facilities || [],
      trustLabel,
      source: {
        type: user.role === 'partner' ? 'partner' : 'user',
        userId: user.id,
        ...(user.role === 'partner' && user.fullName ? { partnerName: user.fullName } : {})
      },
      status: formData.status === 'draft' 
        ? 'draft' 
        : isAdminBypass
        ? 'published' 
        : 'submitted', // Handle draft, admin bypass auto-publish, or normal submission
      rating: {
        average: 0,
        count: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      tags: formData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(isAdminBypass ? { publishedAt: new Date().toISOString() } : {}),
      createdBy: user.id,
      viewCount: 0,
      likeCount: 0,
      reportCount: 0,
      featured: false
    };

    const docRef = await adminDb.collection('places').add(placeData);

    // Log admin bypass authority usage
    if (isAdminBypass) {
      await adminDb.collection('admin_audit_log').add({
        action: 'admin_bypass_place_creation',
        adminId: user.id,
        adminEmail: user.email,
        contentType: 'place',
        contentId: docRef.id,
        contentDetails: {
          name: formData.name,
          type: formData.type,
          region: formData.region,
          province: formData.province
        },
        bypassReason: 'Admin created place directly published',
        timestamp: new Date().toISOString(),
        metadata: {
          trustLabel: 'verified',
          skipModeration: true,
          directPublish: true
        }
      });
    }

    // Add to moderation queue if not admin bypass and status is submitted (not draft)
    if (!isAdminBypass && placeData.status === 'submitted') {
      const priorityMap = {
        'partner': 4,
        'contributor': 3,
        'traveler': 2,
        'guest': 1
      };

      await adminDb.collection('moderation_queue').add({
        contentType: 'place',
        contentId: docRef.id,
        itemType: 'new_place', // Add itemType for proper filtering
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        priority: priorityMap[user.role] || 1,
        queueType: user.role === 'partner' ? 'partner_queue' : 'contributor_queue', // Separate queues
        metadata: {
          title: formData.name,
          type: formData.type,
          region: formData.region,
          province: formData.province,
          hasImages: (formData.images?.length || 0) > 0,
          hasCoordinates: !!(formData.coordinates?.lat && formData.coordinates?.lng),
          submitterRole: user.role
        },
        submitter: {
          id: user.id,
          fullName: user.fullName || user.email,
          role: user.role,
          email: user.email
        },
        contentDetails: {
          id: docRef.id,
          name: formData.name,
          shortDescription: formData.shortDescription,
          description: formData.description,
          type: formData.type,
          region: formData.region,
          province: formData.province,
          address: formData.address,
          coordinates: formData.coordinates || null,
          images: formData.images || [],
          video: formData.video || null,
          vietnamAddress: formData.vietnamAddress || null,
          addressConversion: formData.addressConversion || null,
          sources: formData.sources || [],
          openingHours: formData.openingHours || null,
          entryFee: formData.entryFee || null,
          bestTimeToVisit: formData.bestTimeToVisit || null,
          facilities: formData.facilities || [],
          tags: formData.tags || []
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
      message: isAdminBypass
        ? '🎉 Admin đã tạo và xuất bản thành công địa điểm với nhãn "Xác thực đặc biệt" - Bỏ qua kiểm duyệt'
        : formData.status === 'draft'
        ? 'Địa điểm đã được lưu dưới dạng bản nháp'
        : user.role === 'partner'
        ? 'Địa điểm đã được gửi vào hàng đợi kiểm duyệt ưu tiên dành cho Partner. Thời gian xử lý: 12-24 giờ.'
        : 'Địa điểm đã được gửi để kiểm duyệt. Thời gian xử lý: 24-48 giờ.'
    });

  } catch (error) {
    console.error('Error creating place:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo địa điểm' },
      { status: 500 }
    );
  }
}

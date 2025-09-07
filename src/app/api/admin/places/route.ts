import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { Place } from '@/lib/types/places';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// GET /api/admin/places - Enhanced places fetch with comprehensive filtering
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để truy cập chức năng này' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền truy cập chức năng này' },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();
    const { searchParams } = new URL(request.url);
    
    // Enhanced filter parameters
    const filters = {
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      type: searchParams.get('type') || '',
      region: searchParams.get('region') || '',
      province: searchParams.get('province') || '',
      createdBy: searchParams.get('createdBy') || '',
      featured: searchParams.get('featured') || '',
      dateRange: searchParams.get('dateRange') || '',
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    };

    let query: FirebaseFirestore.Query = adminDb.collection('places');

    // Apply Firestore filters
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters.region) {
      query = query.where('region', '==', filters.region);
    }
    
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }

    if (filters.createdBy) {
      query = query.where('createdBy', '==', filters.createdBy);
    }

    if (filters.featured === 'true') {
      query = query.where('featured', '==', true);
    } else if (filters.featured === 'false') {
      query = query.where('featured', '==', false);
    }

    // Handle date range filter
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange.split(',');
      if (startDate) {
        query = query.where('createdAt', '>=', startDate);
      }
      if (endDate) {
        query = query.where('createdAt', '<=', endDate);
      }
    }

    // Apply sorting
    const sortDirection = filters.sortOrder === 'desc' ? 'desc' : 'asc';
    query = query.orderBy(filters.sortBy, sortDirection);

    // Get all results first (we'll handle pagination client-side for now)
    const snapshot = await query.get();
    let places: Place[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      places.push({
        id: doc.id,
        ...data,
        // Ensure required fields exist
        viewCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        reportCount: data.reportCount || 0,
        featured: data.featured || false,
        tags: data.tags || []
      } as Place);
    });

    // Apply client-side filters that can't be done in Firestore
    let filteredPlaces = places;

    // Text search across multiple fields
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPlaces = filteredPlaces.filter(place => 
        place.name.toLowerCase().includes(searchTerm) ||
        (place.description && place.description.toLowerCase().includes(searchTerm)) ||
        (place.shortDescription && place.shortDescription.toLowerCase().includes(searchTerm)) ||
        place.province.toLowerCase().includes(searchTerm) ||
        place.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Province partial matching
    if (filters.province) {
      const provinceTerm = filters.province.toLowerCase();
      filteredPlaces = filteredPlaces.filter(place =>
        place.province.toLowerCase().includes(provinceTerm)
      );
    }

    // Calculate pagination
    const totalItems = filteredPlaces.length;
    const totalPages = Math.ceil(totalItems / filters.limit);
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedPlaces = filteredPlaces.slice(startIndex, endIndex);

    // Calculate aggregated stats for admin overview
    const stats = {
      totalPlaces: totalItems,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byRegion: {} as Record<string, number>,
      featuredCount: filteredPlaces.filter(p => p.featured).length,
      totalViews: filteredPlaces.reduce((sum, p) => sum + (p.viewCount || 0), 0),
      totalLikes: filteredPlaces.reduce((sum, p) => sum + (p.likeCount || 0), 0)
    };

    // Count by status
    filteredPlaces.forEach(place => {
      stats.byStatus[place.status] = (stats.byStatus[place.status] || 0) + 1;
      stats.byType[place.type] = (stats.byType[place.type] || 0) + 1;
      stats.byRegion[place.region] = (stats.byRegion[place.region] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        places: paginatedPlaces,
        pagination: {
          currentPage: filters.page,
          pageSize: filters.limit,
          totalItems: totalItems,
          totalPages: totalPages,
          hasNextPage: filters.page < totalPages,
          hasPrevPage: filters.page > 1
        },
        stats: stats,
        filters: filters
      }
    });

  } catch (error) {
    console.error('Error fetching admin places:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách địa điểm' },
      { status: 500 }
    );
  }
}
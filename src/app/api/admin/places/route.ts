import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { Place } from '@/lib/types/places';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// GET /api/admin/places - Fetch all places with admin access (including non-published)
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
    
    const filters = {
      status: searchParams.get('status'),
      region: searchParams.get('region'),
      type: searchParams.get('type'),
      search: searchParams.get('search'),
      limit: parseInt(searchParams.get('limit') || '100')
    };

    let query: FirebaseFirestore.Query = adminDb.collection('places');

    // Apply filters
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters.region) {
      query = query.where('region', '==', filters.region);
    }
    
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }

    // Order by creation date (newest first)
    query = query.orderBy('createdAt', 'desc');
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    let places: Place[] = [];

    snapshot.forEach(doc => {
      places.push({
        id: doc.id,
        ...doc.data()
      } as Place);
    });

    // Apply search filter if provided (client-side for now)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      places = places.filter(place => 
        place.name.toLowerCase().includes(searchTerm) ||
        (place.description && place.description.toLowerCase().includes(searchTerm)) ||
        (place.shortDescription && place.shortDescription.toLowerCase().includes(searchTerm)) ||
        (place.tags && place.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    return NextResponse.json({
      success: true,
      data: places,
      total: places.length,
      filters
    });

  } catch (error) {
    console.error('Error fetching admin places:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách địa điểm' },
      { status: 500 }
    );
  }
}
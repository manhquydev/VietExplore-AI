import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { User, UserRole }from '@/lib/types/auth';

// GET /api/admin/users - List all users (Admin/Moderator only)
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    // Admin và Moderator có quyền xem danh sách người dùng
    if (!authResult.success || !authResult.user || !['admin', 'moderator'].includes(authResult.user.role)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Bạn không có quyền xem danh sách người dùng',
          data: [],
          pagination: null
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as UserRole;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query: FirebaseFirestore.Query = adminDb.collection('users');

    // Filter by role
    if (role && ['traveler', 'contributor', 'partner', 'moderator', 'admin'].includes(role)) {
      query = query.where('role', '==', role);
    }
    
    // Server-side search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      // This is a simple search. For more complex scenarios, consider a search service like Algolia or Elasticsearch.
      query = query.where('fullName', '>=', searchTerm).where('fullName', '<=', searchTerm + '\uf8ff');
    }

    // Get total count for pagination before applying limit/offset
    const totalSnapshot = await query.get();
    const totalUsers = totalSnapshot.size;

    // Order by creation date
    query = query.orderBy('createdAt', 'desc');

    // Apply pagination
    if (offset > 0) {
      const lastVisibleDoc = totalSnapshot.docs[offset - 1];
      if (lastVisibleDoc) {
        query = query.startAfter(lastVisibleDoc);
      }
    }
    query = query.limit(limit);

    const snapshot = await query.get();
    const users: any[] = [];

    snapshot.forEach(doc => {
      const userData = doc.data();
      // Ensure sensitive data is not returned
      const { password, ...userSafeData } = userData;
      users.push({
        id: doc.id,
        ...userSafeData
      });
    });

    const response = NextResponse.json({
      success: true,
      data: users,
      pagination: {
        limit,
        offset,
        total: totalUsers,
        hasMore: (offset + users.length) < totalUsers
      }
    });

    // Prevent caching to ensure fresh data in production
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Không thể tải danh sách người dùng',
        data: [],
        pagination: null
      },
      { status: 500 }
    );
  }
}

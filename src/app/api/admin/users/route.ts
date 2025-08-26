import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { User, UserRole, rolePermissions } from '@/lib/types/auth';

// GET /api/admin/users - List all users (Admin/Moderator only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    
    // Admin và Moderator có quyền xem danh sách người dùng
    if (!authResult.success || !authResult.user || !['admin', 'moderator'].includes(authResult.user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xem danh sách người dùng' },
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

    // Order by creation date
    query = query.orderBy('createdAt', 'desc');

    // Apply pagination
    if (offset > 0) {
      query = query.offset(offset);
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

    // Server-side search filter
    let filteredUsers = users;
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredUsers = users.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm)
      );
    }

    // Get total count for pagination
    let totalQuery = adminDb.collection('users');
    if (role && ['traveler', 'contributor', 'partner', 'moderator', 'admin'].includes(role)) {
      totalQuery = totalQuery.where('role', '==', role);
    }
    const totalSnapshot = await totalQuery.count().get();
    const totalUsers = totalSnapshot.data().count;

    return NextResponse.json({
      success: true,
      data: filteredUsers,
      pagination: {
        limit,
        offset,
        total: totalUsers,
        hasMore: (offset + users.length) < totalUsers
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách người dùng' },
      { status: 500 }
    );
  }
}

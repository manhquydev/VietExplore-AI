import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requirePermission } from '@/lib/auth-middleware';
import { UserRole } from '@/lib/types/auth';

// GET /api/admin/users - List all users (Admin/Moderator only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, 'view_moderation_queue');
    if (!authResult.success || !authResult.user) {
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

    let query = adminDb.collection('users');

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
      users.push({
        id: doc.id,
        email: userData.email,
        fullName: userData.fullName,
        username: userData.username,
        avatar: userData.avatar,
        role: userData.role,
        verified: userData.verified,
        createdAt: userData.createdAt,
        stats: userData.stats,
        roleHistory: userData.roleHistory || []
      });
    });

    // Client-side search filter (for now)
    let filteredUsers = users;
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredUsers,
      total: filteredUsers.length,
      pagination: {
        limit,
        offset,
        hasMore: snapshot.size === limit
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


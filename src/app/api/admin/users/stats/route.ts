import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { UserRole } from '@/lib/types/auth';

/**
 * GET /api/admin/users/stats - Get user statistics by role
 * Returns count of users for each role
 */
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);

    // Admin and Moderator can view user statistics
    if (!authResult.success || !authResult.user || !['admin', 'moderator'].includes(authResult.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bạn không có quyền xem thống kê người dùng',
        },
        { status: 403 }
      );
    }

    const roles: UserRole[] = ['guest', 'traveler', 'contributor', 'partner', 'moderator', 'admin'];

    // Fetch user counts for each role in parallel
    const roleStatsPromises = roles.map(async (role) => {
      const snapshot = await adminDb
        .collection('users')
        .where('role', '==', role)
        .count()
        .get();

      return {
        role,
        count: snapshot.data().count
      };
    });

    const roleStats = await Promise.all(roleStatsPromises);

    // Also get total count and active/disabled counts
    const [totalSnapshot, activeSnapshot, disabledSnapshot, verifiedSnapshot] = await Promise.all([
      adminDb.collection('users').count().get(),
      adminDb.collection('users').where('disabled', '==', false).count().get(),
      adminDb.collection('users').where('disabled', '==', true).count().get(),
      adminDb.collection('users').where('verified', '==', true).count().get(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        byRole: roleStats.reduce((acc, { role, count }) => {
          acc[role] = count;
          return acc;
        }, {} as Record<UserRole, number>),
        total: totalSnapshot.data().count,
        active: activeSnapshot.data().count,
        disabled: disabledSnapshot.data().count,
        verified: verifiedSnapshot.data().count,
      }
    });

  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Không thể tải thống kê người dùng',
      },
      { status: 500 }
    );
  }
}

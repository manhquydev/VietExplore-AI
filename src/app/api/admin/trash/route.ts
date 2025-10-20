import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

/**
 * GET /api/admin/trash
 *
 * Get all deleted places in trash
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin role required' },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();

    // Get all deleted places, ordered by deletedAt DESC
    const deletedPlacesSnapshot = await adminDb
      .collection('deleted_places')
      .orderBy('deletedAt', 'desc')
      .get();

    const deletedPlaces = deletedPlacesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate stats
    const now = new Date();
    const expiringSoon = deletedPlaces.filter(place => {
      const autoDeleteAt = new Date(place.autoDeleteAt);
      const diffTime = autoDeleteAt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    }).length;

    const expired = deletedPlaces.filter(place => {
      const autoDeleteAt = new Date(place.autoDeleteAt);
      return now >= autoDeleteAt;
    }).length;

    return NextResponse.json({
      success: true,
      data: deletedPlaces,
      stats: {
        total: deletedPlaces.length,
        expiringSoon,
        expired
      }
    });

  } catch (error) {
    console.error('Error fetching trash:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

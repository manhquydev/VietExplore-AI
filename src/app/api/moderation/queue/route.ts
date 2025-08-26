import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { hasPermission } from '@/lib/auth/permissions';

// GET /api/moderation/queue - Get moderation queue (Moderator/Admin only)
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || !hasPermission(authResult.user, 'view_moderation_queue')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Bạn không có quyền xem hàng đợi kiểm duyệt',
          data: [],
          total: 0
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const contentType = searchParams.get('contentType');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query: FirebaseFirestore.Query = adminDb.collection('moderation_queue');

    // Filter by status
    if (status) {
      query = query.where('status', '==', status);
    }

    // Filter by content type
    if (contentType) {
      query = query.where('contentType', '==', contentType);
    }

    // Filter by priority
    if (priority) {
      query = query.where('priority', '==', priority);
    }

    // Order by priority and submission date
    query = query.orderBy('priority', 'desc').orderBy('submittedAt', 'asc');

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    const items: any[] = [];

    for (const doc of snapshot.docs) {
      const itemData = doc.data();
      
      // Get submitter info
      const submitterDoc = await adminDb.collection('users').doc(itemData.submittedBy).get();
      const submitterData = submitterDoc.data();

      // Get content details based on type
      let contentDetails = null;
      if (itemData.contentType === 'place') {
        const placeDoc = await adminDb.collection('places').doc(itemData.contentId).get();
        contentDetails = placeDoc.data();
      } else if (itemData.contentType === 'itinerary') {
        const itineraryDoc = await adminDb.collection('itineraries').doc(itemData.contentId).get();
        contentDetails = itineraryDoc.data();
      }

      items.push({
        id: doc.id,
        ...itemData,
        submitter: {
          id: itemData.submittedBy,
          fullName: submitterData?.fullName,
          role: submitterData?.role,
          avatar: submitterData?.avatar
        },
        contentDetails
      });
    }

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length
    });

  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Không thể tải hàng đợi kiểm duyệt',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

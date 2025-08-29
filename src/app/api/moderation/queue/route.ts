import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// GET /api/moderation/queue - Get moderation queue (Moderator/Admin only)
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || !['moderator', 'admin'].includes(authResult.user.role)) {
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
    const queueType = searchParams.get('queueType'); // partner_queue hoặc contributor_queue
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

    // Filter by queue type (partner_queue vs contributor_queue)
    if (queueType) {
      query = query.where('queueType', '==', queueType);
    }

    // Order by priority and submission date
    query = query.orderBy('priority', 'desc').orderBy('submittedAt', 'asc');

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    const items: any[] = [];
    const orphanedEntries: string[] = [];

    for (const doc of snapshot.docs) {
      const itemData = doc.data();
      
      // Get submitter info
      const submitterDoc = await adminDb.collection('users').doc(itemData.submittedBy).get();
      const submitterData = submitterDoc.data();
      
      // Get reviewer info if exists
      let reviewerData = null;
      if (itemData.reviewedBy) {
        const reviewerDoc = await adminDb.collection('users').doc(itemData.reviewedBy).get();
        reviewerData = reviewerDoc.data();
      }

      // Get content details based on type and check if content still exists
      let contentDetails = null;
      let contentExists = false;
      
      if (itemData.contentType === 'place') {
        const placeDoc = await adminDb.collection('places').doc(itemData.contentId).get();
        contentExists = placeDoc.exists;
        contentDetails = placeDoc.data();
      } else if (itemData.contentType === 'itinerary') {
        const itineraryDoc = await adminDb.collection('itineraries').doc(itemData.contentId).get();
        contentExists = itineraryDoc.exists;
        contentDetails = itineraryDoc.data();
      }

      // If content no longer exists, mark for cleanup
      if (!contentExists) {
        console.warn(`Orphaned moderation queue entry detected: ${doc.id} (content: ${itemData.contentId})`);
        orphanedEntries.push(doc.id);
        continue; // Skip adding to results
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
        reviewer: reviewerData ? {
          id: itemData.reviewedBy,
          fullName: reviewerData.fullName,
          role: reviewerData.role,
          avatar: reviewerData.avatar
        } : null,
        contentDetails
      });
    }

    // Clean up orphaned entries in the background
    if (orphanedEntries.length > 0) {
      console.log(`Cleaning up ${orphanedEntries.length} orphaned moderation queue entries`);
      
      const cleanupPromises = orphanedEntries.map(async (entryId) => {
        try {
          await adminDb.collection('moderation_queue').doc(entryId).delete();
          console.log(`Cleaned up orphaned entry: ${entryId}`);
        } catch (error) {
          console.error(`Failed to cleanup orphaned entry ${entryId}:`, error);
        }
      });
      
      // Execute cleanup in background without blocking the response
      Promise.all(cleanupPromises).catch(error => {
        console.error('Error during background cleanup:', error);
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

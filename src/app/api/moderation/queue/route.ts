import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { FieldValue } from 'firebase-admin/firestore';

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
    const status = searchParams.get('status') || 'pending,claimed'; // Default to available items
    const contentType = searchParams.get('contentType');
    const itemType = searchParams.get('itemType'); // Support for itemType filter
    const priority = searchParams.get('priority');
    const queueType = searchParams.get('queueType'); // partner_queue hoặc contributor_queue
    const claimedBy = searchParams.get('claimedBy'); // Filter by specific moderator
    const showExpired = searchParams.get('showExpired') === 'true'; // Show expired claims
    const limit = parseInt(searchParams.get('limit') || '20');

    let query: FirebaseFirestore.Query = adminDb.collection('moderation_queue');

    // Filter by status (can be multiple statuses separated by comma)
    const statusList = status.split(',').map(s => s.trim());
    if (statusList.length === 1) {
      query = query.where('status', '==', statusList[0]);
    } else if (statusList.length > 1) {
      query = query.where('status', 'in', statusList);
    }

    // Filter by content type
    if (contentType) {
      query = query.where('contentType', '==', contentType);
    }

    // TODO: Re-enable server-side itemType filtering once Firestore index is built
    // The composite index for itemType + status + priority + submittedAt is defined in firestore.indexes.json (lines 276-297)
    // Firebase Console: https://console.firebase.google.com/v1/r/project/vietexplore-ai/firestore/indexes
    // Temporarily using client-side filtering until index is ready
    const requestedItemType = itemType;
    
    // FUTURE: Uncomment when index is ready:
    // if (itemType) {
    //   if (Array.isArray(itemType) || itemType.includes(',')) {
    //     const itemTypes = Array.isArray(itemType) ? itemType : itemType.split(',').map(t => t.trim());
    //     query = query.where('itemType', 'in', itemTypes);
    //   } else {
    //     query = query.where('itemType', '==', itemType);
    //   }
    // }

    // Filter by priority
    if (priority) {
      query = query.where('priority', '==', priority);
    }

    // Filter by queue type (partner_queue vs contributor_queue)
    if (queueType) {
      query = query.where('queueType', '==', queueType);
    }

    // Filter by specific moderator's claimed items
    if (claimedBy) {
      query = query.where('claimedBy', '==', claimedBy);
    }

    // Order by priority mapping then submission date
    const priorityOrder: Record<string, number> = {
      'urgent': 4,
      'high': 3, 
      'medium': 2,
      'low': 1
    };
    
    // Order by priority and submission date
    query = query.orderBy('priority', 'desc').orderBy('submittedAt', 'asc');

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    const items: any[] = [];
    const orphanedEntries: string[] = [];
    const expiredClaims: string[] = [];
    const now = new Date();

    for (const doc of snapshot.docs) {
      const itemData = doc.data();
      
      // Check for expired claims and auto-release them
      if (itemData.claimedBy && itemData.claimExpiresAt) {
        const claimExpiry = new Date(itemData.claimExpiresAt);
        if (claimExpiry < now) {
          expiredClaims.push(doc.id);
          // Update item data to reflect expired claim
          itemData.status = 'pending';
          itemData.claimedBy = null;
          itemData.claimedAt = null;
          itemData.claimExpiresAt = null;
        }
      }
      
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
        // Check both places and place_drafts collections for places
        let placeDoc = await adminDb.collection('places').doc(itemData.contentId).get();
        if (!placeDoc.exists) {
          placeDoc = await adminDb.collection('place_drafts').doc(itemData.contentId).get();
        }
        contentExists = placeDoc.exists;
        contentDetails = placeDoc.data();
      } else if (itemData.contentType === 'place_edit' || itemData.itemType === 'place_edit') {
        // Handle edit requests - get both original and edited data
        console.log('Processing place_edit request:', itemData.itemId);
        console.log('Has originalData:', !!itemData.originalData);
        console.log('Has editedData:', !!itemData.editedData);
        
        if (itemData.originalData && itemData.editedData) {
          contentExists = true;
          contentDetails = {
            // Use edited data as primary content
            ...itemData.editedData,
            // Add comparison metadata
            originalData: itemData.originalData,
            isEditRequest: true,
            originalPlaceId: itemData.itemId,
            // Add edit metadata
            editDraftId: itemData.metadata?.editDraftId,
            editReason: itemData.metadata?.reason
          };
          console.log('Built content details with comparison data');
        } else {
          // Fallback - try to get the original place and construct comparison
          console.log('Fallback: getting original place data from places collection');
          const originalDoc = await adminDb.collection('places').doc(itemData.itemId).get();
          contentExists = originalDoc.exists;
          if (contentExists) {
            const originalData = originalDoc.data();
            
            // Try to get edit draft if editDraftId is available
            let editedData = originalData; // Fallback to original if no edit draft found
            if (itemData.metadata?.editDraftId) {
              const editDraftDoc = await adminDb.collection('place_drafts').doc(itemData.metadata.editDraftId).get();
              if (editDraftDoc.exists) {
                editedData = editDraftDoc.data();
              }
            }
            
            contentDetails = {
              ...editedData,
              originalData: originalData,
              isEditRequest: true,
              originalPlaceId: itemData.itemId,
              editDraftId: itemData.metadata?.editDraftId,
              editReason: itemData.metadata?.reason
            };
          }
        }
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

    // Clean up expired claims in the background
    if (expiredClaims.length > 0) {
      console.log(`Releasing ${expiredClaims.length} expired claim(s)`);
      
      const expiredCleanupPromises = expiredClaims.map(async (entryId) => {
        try {
          await adminDb.collection('moderation_queue').doc(entryId).update({
            status: 'pending',
            claimedBy: FieldValue.delete(),
            claimedAt: FieldValue.delete(),
            claimExpiresAt: FieldValue.delete(),
            updatedAt: new Date().toISOString()
          });
          console.log(`Released expired claim: ${entryId}`);
        } catch (error) {
          console.error(`Failed to release expired claim ${entryId}:`, error);
        }
      });
      
      // Execute cleanup in background without blocking the response
      Promise.all(expiredCleanupPromises).catch(error => {
        console.error('Error during expired claim cleanup:', error);
      });
    }

    // Apply client-side itemType filtering until Firestore index is ready
    let filteredItems = items;
    if (requestedItemType) {
      if (Array.isArray(requestedItemType) || requestedItemType.includes(',')) {
        const itemTypes = Array.isArray(requestedItemType) ? requestedItemType : requestedItemType.split(',').map(t => t.trim());
        filteredItems = items.filter(item => 
          itemTypes.includes(item.itemType) || 
          // Fallback logic for items without itemType field
          (itemTypes.includes('new_place') && !item.itemType && item.contentType === 'place')
        );
      } else {
        filteredItems = items.filter(item => 
          item.itemType === requestedItemType ||
          // Fallback logic for items without itemType field
          (requestedItemType === 'new_place' && !item.itemType && item.contentType === 'place')
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: filteredItems,
      total: filteredItems.length
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

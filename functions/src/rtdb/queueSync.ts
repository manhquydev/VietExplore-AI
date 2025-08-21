// functions/src/rtdb/queueSync.ts
import * as admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getDatabase } from 'firebase-admin/database';
import * as logger from 'firebase-functions/logger';

// Sync moderation queue từ Firestore → RTDB (theo Tài liệu 5)
export const syncQueueIndex = onDocumentWritten({
  document: 'moderation/requests/items/{requestId}',
  region: 'asia-southeast1'
}, async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  const requestId = event.params.requestId;
  
  if (!requestId) return;

  try {
    const rtdb = getDatabase();
    const updates: Record<string, any> = {};

    // Helper function to get path for priority queue
    function getQueuePath(data: any): string {
      return `moderation/queueIndex/priority-${data.priority}/${requestId}`;
    }

    // Remove from old queue if status/priority changed
    if (before && (!after || 
        before.status !== after.status || 
        before.priority !== after.priority)) {
      
      if (['queued', 'in_review'].includes(before.status)) {
        updates[getQueuePath(before)] = null;
        logger.info(`Removed request ${requestId} from ${before.priority} queue`);
      }
    }

    // Add to new queue if in active status
    if (after && ['queued', 'in_review'].includes(after.status)) {
      updates[getQueuePath(after)] = true;
      logger.info(`Added request ${requestId} to ${after.priority} queue`);
    }

    // Apply updates to RTDB
    if (Object.keys(updates).length > 0) {
      await rtdb.ref().update(updates);
    }

    // Update queue summary
    await updateQueueSummary();

    logger.info(`Queue sync completed for request ${requestId}`);
  } catch (error) {
    logger.error('Error syncing queue index:', error);
  }
});

// Update queue summary statistics
async function updateQueueSummary() {
  try {
    const db = admin.firestore();
    const rtdb = getDatabase();
    const now = admin.firestore.Timestamp.now();

    // Count requests by status
    const queuedSnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('status', 'in', ['queued', 'in_review'])
      .count()
      .get();

    const highPrioritySnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('status', 'in', ['queued', 'in_review'])
      .where('priority', '==', 'high')
      .count()
      .get();

    const overdueSnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('status', 'in', ['queued', 'in_review'])
      .where('dueAt', '<', now)
      .count()
      .get();

    const summary = {
      totalQueued: queuedSnapshot.data().count,
      highPriority: highPrioritySnapshot.data().count,
      overdue: overdueSnapshot.data().count,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    };

    await rtdb.ref('moderation/queueSummary').set(summary);
    logger.info('Queue summary updated:', summary);
  } catch (error) {
    logger.error('Error updating queue summary:', error);
  }
}

// Sync viewer count cho itineraries
export const syncViewerCount = onDocumentWritten({
  document: 'itineraries/live/{itineraryId}/viewers/{uid}',
  region: 'asia-southeast1'
}, async (event) => {
  const itineraryId = event.params.itineraryId;
  
  try {
    const rtdb = getDatabase();
    const viewersRef = rtdb.ref(`itineraries/live/${itineraryId}/viewers`);
    
    // Count current viewers
    const snapshot = await viewersRef.once('value');
    const viewers = snapshot.val() || {};
    const viewersCount = Object.keys(viewers).length;

    // Update count
    await rtdb.ref(`itineraries/live/${itineraryId}/viewersCount`).set(viewersCount);
    
    logger.info(`Updated viewers count for itinerary ${itineraryId}: ${viewersCount}`);
  } catch (error) {
    logger.error('Error syncing viewer count:', error);
  }
});

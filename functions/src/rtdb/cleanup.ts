// functions/src/rtdb/cleanup.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getDatabase } from 'firebase-admin/database';
import * as logger from 'firebase-functions/logger';

// Cleanup stale moderator activity (every 15 minutes)
export const cleanupModeratorActivity = onSchedule({
  schedule: 'every 15 minutes',
  region: 'asia-southeast1',
  timeZone: 'Asia/Ho_Chi_Minh'
}, async () => {
  try {
    const rtdb = getDatabase();
    const now = Date.now();
    const thirtyMinutesAgo = now - (30 * 60 * 1000); // 30 minutes

    const activeRef = rtdb.ref('moderation/active');
    const snapshot = await activeRef.once('value');
    const activities = snapshot.val() || {};

    const updates: Record<string, null> = {};
    let cleanedCount = 0;

    for (const [modUid, activity] of Object.entries(activities as any)) {
      if (activity && (activity as any).heartbeat) {
        // Convert heartbeat to milliseconds if it's a Firebase timestamp
        const heartbeatTime = typeof (activity as any).heartbeat === 'number' 
          ? (activity as any).heartbeat 
          : (activity as any).heartbeat.toDate?.() || (activity as any).heartbeat;
        
        if (heartbeatTime < thirtyMinutesAgo) {
          updates[`moderation/active/${modUid}`] = null;
          cleanedCount++;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await rtdb.ref().update(updates);
    }

    logger.info(`Cleaned up ${cleanedCount} stale moderator activities`);
  } catch (error) {
    logger.error('Error cleaning up moderator activity:', error);
  }
});

// Cleanup old viewer entries (every hour)
export const cleanupViewerEntries = onSchedule({
  schedule: 'every 60 minutes',
  region: 'asia-southeast1',
  timeZone: 'Asia/Ho_Chi_Minh'
}, async () => {
  try {
    const rtdb = getDatabase();
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour

    const liveRef = rtdb.ref('itineraries/live');
    const snapshot = await liveRef.once('value');
    const itineraries = snapshot.val() || {};

    const updates: Record<string, null> = {};
    let cleanedCount = 0;

    for (const [itineraryId, data] of Object.entries(itineraries as any)) {
      if (data && (data as any).viewers) {
        for (const [uid, timestamp] of Object.entries((data as any).viewers as any)) {
          // Convert timestamp to milliseconds
          const viewerTime = typeof timestamp === 'number' 
            ? timestamp 
            : (timestamp as any).toDate?.() || timestamp;
          
          if (viewerTime < oneHourAgo) {
            updates[`itineraries/live/${itineraryId}/viewers/${uid}`] = null;
            cleanedCount++;
          }
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await rtdb.ref().update(updates);
    }

    logger.info(`Cleaned up ${cleanedCount} stale viewer entries`);
  } catch (error) {
    logger.error('Error cleaning up viewer entries:', error);
  }
});

// Cleanup offline users from status (daily)
export const cleanupOfflineStatus = onSchedule({
  schedule: 'every 24 hours',
  region: 'asia-southeast1',
  timeZone: 'Asia/Ho_Chi_Minh'
}, async () => {
  try {
    const rtdb = getDatabase();
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000); // 7 days

    const statusRef = rtdb.ref('status');
    const snapshot = await statusRef.once('value');
    const statuses = snapshot.val() || {};

    const updates: Record<string, null> = {};
    let cleanedCount = 0;

    for (const [uid, status] of Object.entries(statuses as any)) {
      if (status && (status as any).state === 'offline' && (status as any).lastSeen) {
        const lastSeenTime = typeof (status as any).lastSeen === 'number' 
          ? (status as any).lastSeen 
          : (status as any).lastSeen.toDate?.() || (status as any).lastSeen;
        
        if (lastSeenTime < sevenDaysAgo) {
          updates[`status/${uid}`] = null;
          cleanedCount++;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await rtdb.ref().update(updates);
    }

    logger.info(`Cleaned up ${cleanedCount} old offline status entries`);
  } catch (error) {
    logger.error('Error cleaning up offline status:', error);
  }
});

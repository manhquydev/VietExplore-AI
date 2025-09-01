import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { NotificationService } from '@/lib/server/notification-service';

/**
 * Cron job to sync notifications between Firestore and Realtime Database
 * Runs every 5 minutes as configured in vercel.json
 * Section IV.1: Real-time (Firebase Realtime Database) + persistence
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getAdminDb();
    const realtimeDb = adminDb.database();
    const now = new Date().toISOString();

    let syncCount = 0;
    let errorCount = 0;

    if (!realtimeDb) {
      console.warn('Realtime Database not available for notification sync');
      return NextResponse.json({
        success: false,
        error: 'Realtime Database not configured'
      }, { status: 500 });
    }

    // Get recent notifications from Firestore that might not be in Realtime DB
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentNotificationsQuery = await adminDb.collection('notifications')
      .where('createdAt', '>=', fiveMinutesAgo)
      .where('read', '==', false)
      .get();

    // Sync to Realtime Database
    const syncPromises = recentNotificationsQuery.docs.map(async (doc) => {
      try {
        const notification = doc.data();
        const userId = notification.userId;
        
        // Check if already in Realtime DB
        const realtimeRef = realtimeDb.ref(`notifications/${userId}/${doc.id}`);
        const realtimeSnapshot = await realtimeRef.once('value');
        
        if (!realtimeSnapshot.exists()) {
          // Add to Realtime DB
          await realtimeRef.set({
            ...notification,
            id: doc.id,
            timestamp: adminDb.database.ServerValue.TIMESTAMP,
            syncedAt: now
          });
          
          syncCount++;
        }
      } catch (error) {
        console.error(`Failed to sync notification ${doc.id}:`, error);
        errorCount++;
      }
    });

    await Promise.all(syncPromises);

    // Sync unread counts for active users
    const activeUsersQuery = await adminDb.collection('users')
      .where('lastSeen', '>=', fiveMinutesAgo)
      .get();

    const unreadSyncPromises = activeUsersQuery.docs.map(async (userDoc) => {
      try {
        const userId = userDoc.id;
        await NotificationService.syncUnreadCount(userId);
      } catch (error) {
        console.error(`Failed to sync unread count for user ${userId}:`, error);
        errorCount++;
      }
    });

    await Promise.all(unreadSyncPromises);

    // Cleanup old realtime notifications (older than 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    try {
      const allNotificationsRef = realtimeDb.ref('notifications');
      const oldNotificationsQuery = await allNotificationsRef
        .orderByChild('timestamp')
        .endAt(sevenDaysAgo)
        .once('value');

      const oldNotifications = oldNotificationsQuery.val();
      if (oldNotifications) {
        const cleanupPromises = Object.keys(oldNotifications).map(async (userId) => {
          const userNotifications = oldNotifications[userId];
          const deletePromises = Object.keys(userNotifications).map(async (notificationId) => {
            const notificationTimestamp = userNotifications[notificationId].timestamp;
            if (notificationTimestamp && notificationTimestamp < sevenDaysAgo) {
              await realtimeDb.ref(`notifications/${userId}/${notificationId}`).remove();
            }
          });
          await Promise.all(deletePromises);
        });

        await Promise.all(cleanupPromises);
        console.log('Cleaned up old realtime notifications');
      }
    } catch (cleanupError) {
      console.error('Error during realtime notification cleanup:', cleanupError);
    }

    console.log(`Notification sync completed: ${syncCount} synced, ${errorCount} errors, ${activeUsersQuery.size} users processed`);

    return NextResponse.json({
      success: true,
      message: 'Notification sync completed',
      stats: {
        notificationsSynced: syncCount,
        usersProcessed: activeUsersQuery.size,
        errors: errorCount,
        processedAt: now
      }
    });

  } catch (error) {
    console.error('Cron notification sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Notification sync failed' },
      { status: 500 }
    );
  }
}
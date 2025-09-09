import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Sync place stats từ Firestore sang Realtime Database
 * Trigger khi place document được update
 */
export const syncPlaceStats = functions.firestore
  .document('places/{placeId}')
  .onWrite(async (change, context) => {
    const { placeId } = context.params;
    
    try {
      // Nếu document bị xóa
      if (!change.after.exists) {
        await admin.database()
          .ref(`places/${placeId}`)
          .remove();
        console.log(`Removed place stats for ${placeId}`);
        return;
      }
      
      const placeData = change.after.data();
      
      // Sync basic stats to Realtime DB
      const statsData = {
        views: placeData?.viewCount || 0,
        likes: placeData?.likeCount || 0,
        saves: placeData?.saveCount || 0,
        status: placeData?.status || 'draft',
        lastUpdated: admin.database.ServerValue.TIMESTAMP,
        // Metadata for admin dashboard
        region: placeData?.region || '',
        type: placeData?.type || '',
        province: placeData?.province || '',
      };
      
      await admin.database()
        .ref(`places/${placeId}/stats`)
        .set(statsData);
        
      console.log(`Synced place stats for ${placeId}:`, statsData);
      
    } catch (error) {
      console.error(`Error syncing place stats for ${placeId}:`, error);
    }
  });

/**
 * Sync user stats từ Firestore sang Realtime Database
 * Trigger khi user document được update
 */
export const syncUserStats = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const { userId } = context.params;
    
    try {
      if (!change.after.exists) {
        await admin.database()
          .ref(`users/${userId}`)
          .remove();
        return;
      }
      
      const userData = change.after.data();
      
      // Sync user stats for admin dashboard
      const userStatsData = {
        role: userData?.role || 'traveler',
        status: userData?.status || 'active',
        lastActive: userData?.lastActive || null,
        contributionCount: userData?.contributionCount || 0,
        trustLabel: userData?.trustLabel || 'community',
        joinedAt: userData?.createdAt || null,
        lastUpdated: admin.database.ServerValue.TIMESTAMP,
      };
      
      await admin.database()
        .ref(`users/${userId}/stats`)
        .set(userStatsData);
        
      console.log(`Synced user stats for ${userId}`);
      
    } catch (error) {
      console.error(`Error syncing user stats for ${userId}:`, error);
    }
  });

/**
 * Sync moderation queue từ Firestore sang Realtime Database
 * Trigger khi moderation item được thêm/cập nhật
 */
export const syncModerationQueue = functions.firestore
  .document('moderation_queue/{itemId}')
  .onWrite(async (change, context) => {
    const { itemId } = context.params;
    
    try {
      if (!change.after.exists) {
        await admin.database()
          .ref(`moderation_queue_updates/${itemId}`)
          .remove();
        return;
      }
      
      const moderationData = change.after.data();
      
      // Sync to realtime for instant admin updates
      const updateData = {
        status: moderationData?.status || 'pending',
        priority: moderationData?.priority || 'medium',
        type: moderationData?.type || 'place_submission',
        createdAt: moderationData?.createdAt || null,
        assignedTo: moderationData?.assignedTo || null,
        lastUpdated: admin.database.ServerValue.TIMESTAMP,
      };
      
      await admin.database()
        .ref(`moderation_queue_updates/${itemId}`)
        .set(updateData);
        
      // Cập nhật tổng stats cho admin dashboard
      await updateModerationStats();
      
      console.log(`Synced moderation item ${itemId}`);
      
    } catch (error) {
      console.error(`Error syncing moderation item ${itemId}:`, error);
    }
  });

/**
 * Function để cập nhật tổng thống kê moderation
 */
async function updateModerationStats() {
  try {
    // Lấy tất cả items pending từ Firestore
    const moderationSnapshot = await admin.firestore()
      .collection('moderation_queue')
      .where('status', '==', 'pending')
      .get();
    
    const pendingCount = moderationSnapshot.size;
    
    // Cập nhật vào Realtime DB
    await admin.database()
      .ref('admin/moderation/stats')
      .set({
        pending: pendingCount,
        lastUpdated: admin.database.ServerValue.TIMESTAMP
      });
      
  } catch (error) {
    console.error('Error updating moderation stats:', error);
  }
}

/**
 * Scheduled function để sync tổng stats mỗi 5 phút
 * Đảm bảo data consistency
 */
export const syncAdminStats = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    try {
      console.log('Running scheduled admin stats sync...');
      
      // Sync places count
      const placesSnapshot = await admin.firestore()
        .collection('places')
        .get();
      
      // Sync users count  
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .get();
        
      // Sync moderation stats
      await updateModerationStats();
      
      // Update admin dashboard stats
      await admin.database()
        .ref('admin/dashboard/stats')
        .set({
          totalPlaces: placesSnapshot.size,
          totalUsers: usersSnapshot.size,
          lastSyncAt: admin.database.ServerValue.TIMESTAMP,
        });
        
      console.log('Admin stats sync completed successfully');
      
    } catch (error) {
      console.error('Error in scheduled admin stats sync:', error);
    }
  });

/**
 * HTTP function để manual sync (backup)
 * Có thể gọi từ admin panel nếu cần
 */
export const manualSyncStats = functions.https.onCall(async (data, context) => {
  // Kiểm tra quyền admin
  if (!context.auth || !context.auth.token.role || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger manual sync');
  }
  
  try {
    console.log('Manual sync triggered by admin:', context.auth.uid);
    
    // Sync tất cả stats
    const [placesSnapshot, usersSnapshot] = await Promise.all([
      admin.firestore().collection('places').get(),
      admin.firestore().collection('users').get()
    ]);
    
    await updateModerationStats();
    
    await admin.database()
      .ref('admin/dashboard/stats')
      .set({
        totalPlaces: placesSnapshot.size,
        totalUsers: usersSnapshot.size,
        lastManualSyncAt: admin.database.ServerValue.TIMESTAMP,
        syncTriggeredBy: context.auth.uid
      });
    
    return { 
      success: true, 
      message: 'Manual sync completed successfully',
      stats: {
        places: placesSnapshot.size,
        users: usersSnapshot.size
      }
    };
    
  } catch (error) {
    console.error('Error in manual sync:', error);
    throw new functions.https.HttpsError('internal', 'Manual sync failed');
  }
});
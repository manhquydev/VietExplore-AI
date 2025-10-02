"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerPublishScheduledAnnouncements = exports.publishScheduledAnnouncements = exports.manualSyncStats = exports.syncAdminStats = exports.syncModerationQueue = exports.syncUserStats = exports.syncPlaceStats = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
/**
 * Sync place stats từ Firestore sang Realtime Database
 * Trigger khi place document được update
 */
exports.syncPlaceStats = functions.firestore
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
            views: (placeData === null || placeData === void 0 ? void 0 : placeData.viewCount) || 0,
            likes: (placeData === null || placeData === void 0 ? void 0 : placeData.likeCount) || 0,
            saves: (placeData === null || placeData === void 0 ? void 0 : placeData.saveCount) || 0,
            status: (placeData === null || placeData === void 0 ? void 0 : placeData.status) || 'draft',
            lastUpdated: admin.database.ServerValue.TIMESTAMP,
            // Metadata for admin dashboard
            region: (placeData === null || placeData === void 0 ? void 0 : placeData.region) || '',
            type: (placeData === null || placeData === void 0 ? void 0 : placeData.type) || '',
            province: (placeData === null || placeData === void 0 ? void 0 : placeData.province) || '',
        };
        await admin.database()
            .ref(`places/${placeId}/stats`)
            .set(statsData);
        console.log(`Synced place stats for ${placeId}:`, statsData);
    }
    catch (error) {
        console.error(`Error syncing place stats for ${placeId}:`, error);
    }
});
/**
 * Sync user stats từ Firestore sang Realtime Database
 * Trigger khi user document được update
 */
exports.syncUserStats = functions.firestore
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
            role: (userData === null || userData === void 0 ? void 0 : userData.role) || 'traveler',
            status: (userData === null || userData === void 0 ? void 0 : userData.status) || 'active',
            lastActive: (userData === null || userData === void 0 ? void 0 : userData.lastActive) || null,
            contributionCount: (userData === null || userData === void 0 ? void 0 : userData.contributionCount) || 0,
            trustLabel: (userData === null || userData === void 0 ? void 0 : userData.trustLabel) || 'community',
            joinedAt: (userData === null || userData === void 0 ? void 0 : userData.createdAt) || null,
            lastUpdated: admin.database.ServerValue.TIMESTAMP,
        };
        await admin.database()
            .ref(`users/${userId}/stats`)
            .set(userStatsData);
        console.log(`Synced user stats for ${userId}`);
    }
    catch (error) {
        console.error(`Error syncing user stats for ${userId}:`, error);
    }
});
/**
 * Sync moderation queue từ Firestore sang Realtime Database
 * Trigger khi moderation item được thêm/cập nhật
 */
exports.syncModerationQueue = functions.firestore
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
            status: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.status) || 'pending',
            priority: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.priority) || 'medium',
            type: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.type) || 'place_submission',
            createdAt: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.createdAt) || null,
            assignedTo: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.assignedTo) || null,
            lastUpdated: admin.database.ServerValue.TIMESTAMP,
        };
        await admin.database()
            .ref(`moderation_queue_updates/${itemId}`)
            .set(updateData);
        // Cập nhật tổng stats cho admin dashboard
        await updateModerationStats();
        console.log(`Synced moderation item ${itemId}`);
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error updating moderation stats:', error);
    }
}
/**
 * Scheduled function để sync tổng stats mỗi 5 phút
 * Đảm bảo data consistency
 */
exports.syncAdminStats = functions.pubsub
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
    }
    catch (error) {
        console.error('Error in scheduled admin stats sync:', error);
    }
});
/**
 * HTTP function để manual sync (backup)
 * Có thể gọi từ admin panel nếu cần
 */
exports.manualSyncStats = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        console.error('Error in manual sync:', error);
        throw new functions.https.HttpsError('internal', 'Manual sync failed');
    }
});
/**
 * Scheduled function để tự động xuất bản announcements theo lịch
 * Chạy mỗi 15 phút để kiểm tra và publish announcements đã đến giờ
 */
exports.publishScheduledAnnouncements = functions.pubsub
    .schedule('*/15 * * * *')
    .timeZone('Asia/Ho_Chi_Minh')
    .onRun(async () => {
    try {
        console.log('=== Starting scheduled announcements publish job ===');
        const now = new Date();
        const results = {
            processed: 0,
            published: 0,
            errors: [],
            publishedIds: [],
        };
        // Query all scheduled announcements
        const scheduledSnapshot = await admin.firestore()
            .collection('announcements')
            .where('status', '==', 'scheduled')
            .get();
        console.log(`Found ${scheduledSnapshot.size} scheduled announcements`);
        // Process each scheduled announcement
        for (const doc of scheduledSnapshot.docs) {
            results.processed++;
            const announcement = doc.data();
            const scheduledFor = announcement.scheduledFor;
            try {
                // Check if it's time to publish
                if (scheduledFor && new Date(scheduledFor) <= now) {
                    const nowISO = now.toISOString();
                    // Update to published status
                    await admin.firestore()
                        .collection('announcements')
                        .doc(doc.id)
                        .update({
                        status: 'published',
                        publishedAt: nowISO,
                        updatedAt: nowISO,
                    });
                    results.published++;
                    results.publishedIds.push(doc.id);
                    console.log(`✅ Published announcement: ${announcement.title} (${doc.id})`);
                }
                else {
                    console.log(`⏰ Not yet time to publish: ${announcement.title} (scheduled for ${scheduledFor})`);
                }
            }
            catch (error) {
                const errorMsg = `Failed to publish ${doc.id}: ${error.message}`;
                console.error(`❌ ${errorMsg}`);
                results.errors.push(errorMsg);
            }
        }
        console.log('=== Scheduled announcements publish job completed ===', {
            processed: results.processed,
            published: results.published,
            errors: results.errors.length,
            publishedIds: results.publishedIds,
        });
        // Store job execution log
        if (results.published > 0 || results.errors.length > 0) {
            await admin.firestore()
                .collection('admin_logs')
                .add({
                type: 'scheduled_announcements_publish',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                results,
            });
        }
        return null;
    }
    catch (error) {
        console.error('Fatal error in scheduled announcements publish job:', error);
        // Log critical error
        await admin.firestore()
            .collection('admin_logs')
            .add({
            type: 'scheduled_announcements_publish_error',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
});
/**
 * HTTP callable function để manual trigger publish scheduled announcements
 * Có thể gọi từ admin panel để test hoặc force publish
 */
exports.triggerPublishScheduledAnnouncements = functions.https.onCall(async (data, context) => {
    // Kiểm tra quyền admin
    if (!context.auth || !context.auth.token.role || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger manual publish');
    }
    try {
        console.log('Manual publish triggered by admin:', context.auth.uid);
        const now = new Date();
        const results = {
            processed: 0,
            published: 0,
            errors: [],
            publishedIds: [],
        };
        // Query all scheduled announcements
        const scheduledSnapshot = await admin.firestore()
            .collection('announcements')
            .where('status', '==', 'scheduled')
            .get();
        // Process each scheduled announcement
        for (const doc of scheduledSnapshot.docs) {
            results.processed++;
            const announcement = doc.data();
            const scheduledFor = announcement.scheduledFor;
            try {
                // Check if it's time to publish
                if (scheduledFor && new Date(scheduledFor) <= now) {
                    const nowISO = now.toISOString();
                    await admin.firestore()
                        .collection('announcements')
                        .doc(doc.id)
                        .update({
                        status: 'published',
                        publishedAt: nowISO,
                        updatedAt: nowISO,
                    });
                    results.published++;
                    results.publishedIds.push(doc.id);
                }
            }
            catch (error) {
                results.errors.push(`Failed to publish ${doc.id}: ${error.message}`);
            }
        }
        // Log manual trigger
        await admin.firestore()
            .collection('admin_logs')
            .add({
            type: 'manual_announcements_publish',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            triggeredBy: context.auth.uid,
            results,
        });
        return {
            success: true,
            message: `Published ${results.published} announcements`,
            results,
        };
    }
    catch (error) {
        console.error('Error in manual publish:', error);
        throw new functions.https.HttpsError('internal', 'Manual publish failed');
    }
});
//# sourceMappingURL=index.js.map
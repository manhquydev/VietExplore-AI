"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledModerationHealthCheck = exports.scheduledCleanupDeletedPlaces = exports.scheduledArchiveModerationQueue = exports.scheduledCleanupExpiredClaims = exports.triggerPublishScheduledAnnouncements = exports.publishScheduledAnnouncements = exports.manualSyncStats = exports.syncAdminStats = exports.syncModerationQueue = exports.syncUserStats = exports.syncPlaceStats = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
/**
 * Sync place stats từ Firestore sang Realtime Database
 * Trigger khi place document được update
 *
 * IDEMPOTENCY FIX: Added timestamp comparison để prevent stale updates
 */
exports.syncPlaceStats = functions.firestore
    .document('places/{placeId}')
    .onWrite(async (change, context) => {
    const { placeId } = context.params;
    const eventId = context.eventId; // Unique event ID cho deduplication
    try {
        // Nếu document bị xóa
        if (!change.after.exists) {
            await admin.database()
                .ref(`places/${placeId}`)
                .remove();
            console.log(`[${eventId}] Removed place stats for ${placeId}`);
            return;
        }
        const placeData = change.after.data();
        const placeUpdatedAt = placeData === null || placeData === void 0 ? void 0 : placeData.updatedAt;
        // IDEMPOTENCY CHECK: Compare với existing data trong Realtime DB
        const existingStatsRef = admin.database().ref(`places/${placeId}/stats`);
        const existingSnapshot = await existingStatsRef.once('value');
        const existingStats = existingSnapshot.val();
        // Nếu đã có data mới hơn, skip update để tránh overwrite
        if ((existingStats === null || existingStats === void 0 ? void 0 : existingStats.placeUpdatedAt) && placeUpdatedAt) {
            const existingTime = new Date(existingStats.placeUpdatedAt).getTime();
            const newTime = new Date(placeUpdatedAt).getTime();
            if (existingTime >= newTime) {
                console.log(`[${eventId}] Skipping stale update for ${placeId} (existing: ${existingStats.placeUpdatedAt}, new: ${placeUpdatedAt})`);
                return;
            }
        }
        // Sync basic stats to Realtime DB
        const statsData = {
            views: (placeData === null || placeData === void 0 ? void 0 : placeData.viewCount) || 0,
            likes: (placeData === null || placeData === void 0 ? void 0 : placeData.likeCount) || 0,
            saves: (placeData === null || placeData === void 0 ? void 0 : placeData.saveCount) || 0,
            status: (placeData === null || placeData === void 0 ? void 0 : placeData.status) || 'draft',
            lastUpdated: admin.database.ServerValue.TIMESTAMP,
            placeUpdatedAt: placeUpdatedAt || null,
            eventId: eventId,
            // Metadata for admin dashboard
            region: (placeData === null || placeData === void 0 ? void 0 : placeData.region) || '',
            type: (placeData === null || placeData === void 0 ? void 0 : placeData.type) || '',
            province: (placeData === null || placeData === void 0 ? void 0 : placeData.province) || '',
        };
        await existingStatsRef.set(statsData);
        console.log(`[${eventId}] Synced place stats for ${placeId}:`, statsData);
    }
    catch (error) {
        console.error(`[${eventId}] Error syncing place stats for ${placeId}:`, error);
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
 *
 * IDEMPOTENCY FIX: Added event tracking để prevent duplicate processing
 */
exports.syncModerationQueue = functions.firestore
    .document('moderation_queue/{itemId}')
    .onWrite(async (change, context) => {
    const { itemId } = context.params;
    const eventId = context.eventId;
    try {
        // IMPORTANT: Nếu document bị xóa (ví dụ sau khi approve), cleanup Realtime DB
        if (!change.after.exists) {
            await admin.database()
                .ref(`moderation_queue_updates/${itemId}`)
                .remove();
            console.log(`[${eventId}] Removed moderation queue sync for ${itemId} (deleted from Firestore)`);
            // Also update stats khi có entry bị xóa
            await updateModerationStats();
            return;
        }
        const moderationData = change.after.data();
        const moderationUpdatedAt = moderationData === null || moderationData === void 0 ? void 0 : moderationData.updatedAt;
        // IDEMPOTENCY CHECK: Kiểm tra event đã được process chưa
        const processedEventsRef = admin.database().ref(`processed_events/moderation_queue/${eventId}`);
        const eventSnapshot = await processedEventsRef.once('value');
        if (eventSnapshot.exists()) {
            console.log(`[${eventId}] Skipping duplicate event for moderation ${itemId}`);
            return;
        }
        // Mark event as processed (TTL 24 hours tự động cleanup)
        await processedEventsRef.set({
            itemId: itemId,
            processedAt: admin.database.ServerValue.TIMESTAMP,
            status: moderationData === null || moderationData === void 0 ? void 0 : moderationData.status,
        });
        // Sync to realtime for instant admin updates
        const updateData = {
            status: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.status) || 'pending',
            priority: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.priority) || 'medium',
            type: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.type) || 'place_submission',
            itemType: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.itemType) || null,
            createdAt: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.createdAt) || null,
            submittedAt: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.submittedAt) || null,
            assignedTo: (moderationData === null || moderationData === void 0 ? void 0 : moderationData.assignedTo) || null,
            lastUpdated: admin.database.ServerValue.TIMESTAMP,
            moderationUpdatedAt: moderationUpdatedAt || null,
            eventId: eventId,
        };
        await admin.database()
            .ref(`moderation_queue_updates/${itemId}`)
            .set(updateData);
        // Cập nhật tổng stats cho admin dashboard
        await updateModerationStats();
        console.log(`[${eventId}] Synced moderation item ${itemId} with status ${moderationData === null || moderationData === void 0 ? void 0 : moderationData.status}`);
    }
    catch (error) {
        console.error(`[${eventId}] Error syncing moderation item ${itemId}:`, error);
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
// ============================================================================
// SCHEDULED FUNCTIONS - AUTOMATED BACKGROUND JOBS
// ============================================================================
/**
 * SCHEDULED FUNCTION 1: Cleanup Expired Claims
 *
 * Schedule: Every 2 hours
 * Purpose: Auto-release moderation claims that expired (> 2h timeout)
 *
 * Replaces: Vercel cron /api/cron/cleanup-expired-claims
 */
exports.scheduledCleanupExpiredClaims = functions
    .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
})
    .pubsub.schedule('every 2 hours')
    .timeZone('Asia/Ho_Chi_Minh')
    .onRun(async (context) => {
    console.log('='.repeat(60));
    console.log('🧹 SCHEDULED: Cleanup Expired Claims');
    console.log('Triggered at:', new Date().toISOString());
    console.log('='.repeat(60));
    try {
        const db = admin.firestore();
        const now = new Date();
        const nowISOString = now.toISOString();
        // Find expired claims
        const expiredClaimsQuery = await db.collection('moderation_queue')
            .where('status', '==', 'claimed')
            .where('claimExpiresAt', '<', nowISOString)
            .get();
        let releasedCount = 0;
        // Release expired claims
        const releasePromises = expiredClaimsQuery.docs.map(async (doc) => {
            var _a;
            try {
                const docData = doc.data();
                const creatorId = docData.submittedBy;
                const contentId = docData.contentId || docData.itemId;
                // Update moderation queue
                await db.collection('moderation_queue').doc(doc.id).update({
                    status: 'pending',
                    claimedBy: admin.firestore.FieldValue.delete(),
                    claimedAt: admin.firestore.FieldValue.delete(),
                    claimExpiresAt: admin.firestore.FieldValue.delete(),
                    updatedAt: nowISOString,
                    autoReleasedAt: nowISOString,
                    autoReleaseReason: 'Expired claim (2 hours timeout)',
                });
                releasedCount++;
                console.log(`✅ Auto-released expired claim: ${doc.id}`);
                // FIX GAP #2: Notify creator about claim expiration
                if (creatorId && contentId && (docData.contentType === 'place' || docData.itemType === 'place_edit' || docData.itemType === 'new_place')) {
                    try {
                        const placeDoc = await db.collection('places').doc(contentId).get();
                        const placeName = placeDoc.exists ? (_a = placeDoc.data()) === null || _a === void 0 ? void 0 : _a.name : 'Địa điểm';
                        // Send CLAIM_EXPIRED notification to creator via Realtime Database
                        const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        await admin.database()
                            .ref(`notifications/${creatorId}/${notificationId}`)
                            .set({
                            id: notificationId,
                            type: 'CLAIM_EXPIRED',
                            priority: 'medium',
                            title: 'Tiếp nhận đã hết hạn',
                            body: `"${placeName}" đã được giải phóng do hết thời gian xử lý (2 giờ)`,
                            actionUrl: `/contribute/my-drafts/${contentId}/moderation`,
                            actionText: 'Xem chi tiết',
                            createdAt: nowISOString,
                            read: false,
                            dismissed: false,
                        });
                        // Update unread count
                        const unreadCountRef = admin.database().ref(`unreadCounts/${creatorId}`);
                        await unreadCountRef.transaction((currentCount) => (currentCount || 0) + 1);
                        console.log(`✅ Sent CLAIM_EXPIRED notification to creator ${creatorId}`);
                    }
                    catch (notifError) {
                        console.error(`❌ Failed to send notification for ${doc.id}:`, notifError);
                        // Don't block release if notification fails
                    }
                }
            }
            catch (error) {
                console.error(`❌ Failed to release claim ${doc.id}:`, error);
            }
        });
        await Promise.all(releasePromises);
        console.log(`\n📊 Released ${releasedCount} expired claims`);
        console.log('='.repeat(60));
        return {
            success: true,
            releasedCount,
            timestamp: nowISOString,
        };
    }
    catch (error) {
        console.error('❌ Error in cleanup expired claims:', error);
        throw error;
    }
});
/**
 * SCHEDULED FUNCTION 2: Archive Moderation Queue
 *
 * Schedule: Daily at 2:00 AM (Vietnam time)
 * Purpose: Move approved/rejected entries > 30 days to moderation_archive
 *
 * Replaces: Vercel cron /api/cron/archive-moderation-queue
 */
exports.scheduledArchiveModerationQueue = functions
    .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
})
    .pubsub.schedule('0 2 * * *') // Daily at 2 AM
    .timeZone('Asia/Ho_Chi_Minh')
    .onRun(async (context) => {
    console.log('='.repeat(60));
    console.log('🗄️  SCHEDULED: Archive Moderation Queue');
    console.log('Triggered at:', new Date().toISOString());
    console.log('='.repeat(60));
    try {
        const db = admin.firestore();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
        const results = {
            scanned: 0,
            archived: 0,
            errors: 0,
            oldArchiveCleanedUp: 0,
        };
        // Archive approved/rejected entries > 30 days
        const finalizedStatuses = ['approved', 'rejected'];
        for (const status of finalizedStatuses) {
            const query = db.collection('moderation_queue')
                .where('status', '==', status)
                .where('reviewedAt', '<', thirtyDaysAgoISO);
            const snapshot = await query.get();
            results.scanned += snapshot.size;
            console.log(`Found ${snapshot.size} ${status} entries > 30 days old`);
            // Process in batches to avoid timeout
            const batchSize = 100;
            for (let i = 0; i < snapshot.docs.length; i += batchSize) {
                const batch = snapshot.docs.slice(i, i + batchSize);
                await Promise.all(batch.map(async (doc) => {
                    try {
                        const data = doc.data();
                        // Create archive entry
                        await db.collection('moderation_archive').doc(doc.id).set(Object.assign(Object.assign({}, data), { originalId: doc.id, archivedAt: now.toISOString(), archivedReason: 'auto_archive_30_days' }));
                        // Delete from queue
                        await db.collection('moderation_queue').doc(doc.id).delete();
                        results.archived++;
                        console.log(`✅ Archived ${doc.id}`);
                    }
                    catch (error) {
                        results.errors++;
                        console.error(`❌ Failed to archive ${doc.id}:`, error.message);
                    }
                }));
            }
        }
        // Cleanup old archive entries (> 90 days)
        try {
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            const oldArchiveSnapshot = await db.collection('moderation_archive')
                .where('archivedAt', '<', ninetyDaysAgo.toISOString())
                .get();
            if (oldArchiveSnapshot.size > 0) {
                console.log(`\n🗑️  Cleaning up ${oldArchiveSnapshot.size} archive entries > 90 days`);
                const deletePromises = oldArchiveSnapshot.docs.map(doc => doc.ref.delete());
                await Promise.all(deletePromises);
                results.oldArchiveCleanedUp = oldArchiveSnapshot.size;
                console.log(`✅ Cleaned up ${oldArchiveSnapshot.size} old entries`);
            }
        }
        catch (cleanupError) {
            console.error('⚠️  Warning: Old archive cleanup failed:', cleanupError);
        }
        // Log results
        await db.collection('admin_logs').add({
            type: 'moderation_queue_archive',
            timestamp: now.toISOString(),
            results,
        });
        console.log('\n📊 ARCHIVE SUMMARY');
        console.log(`Scanned: ${results.scanned}, Archived: ${results.archived}, Errors: ${results.errors}`);
        console.log(`Old archive cleaned: ${results.oldArchiveCleanedUp}`);
        console.log('='.repeat(60));
        return results;
    }
    catch (error) {
        console.error('❌ Error in archive moderation queue:', error);
        throw error;
    }
});
/**
 * SCHEDULED FUNCTION 3: Cleanup Deleted Places
 *
 * Schedule: Daily at 3:00 AM (Vietnam time)
 * Purpose: Permanently delete places that have been in trash for > 120 days
 *
 * Replaces: Vercel cron /api/cron/cleanup-deleted-places
 */
exports.scheduledCleanupDeletedPlaces = functions
    .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
})
    .pubsub.schedule('0 3 * * *') // Daily at 3 AM
    .timeZone('Asia/Ho_Chi_Minh')
    .onRun(async (context) => {
    console.log('='.repeat(60));
    console.log('🗑️  SCHEDULED: Cleanup Deleted Places');
    console.log('Triggered at:', new Date().toISOString());
    console.log('='.repeat(60));
    try {
        const db = admin.firestore();
        const now = new Date();
        const nowISO = now.toISOString();
        const results = {
            scanned: 0,
            deleted: 0,
            errors: 0,
            errorDetails: [],
            deletedPlaces: [],
        };
        // Find deleted places where autoDeleteAt has passed
        const expiredQuery = await db.collection('deleted_places')
            .where('autoDeleteAt', '<=', nowISO)
            .get();
        results.scanned = expiredQuery.size;
        console.log(`📊 Found ${results.scanned} places to permanently delete`);
        // Process each expired place
        const processPromises = expiredQuery.docs.map(async (doc) => {
            const place = doc.data();
            const placeId = doc.id;
            try {
                // Log before permanent deletion
                await db.collection('moderation_logs').add({
                    action: 'auto_permanent_delete_place',
                    placeId: placeId,
                    placeName: place.name || 'Unknown',
                    performedBy: 'system_cron',
                    performedAt: nowISO,
                    reason: 'Auto-deleted after 120 days in trash',
                    deletedAt: place.deletedAt,
                    deletedBy: place.deletedBy,
                    autoDeleteAt: place.autoDeleteAt,
                });
                // Permanently delete from deleted_places
                await db.collection('deleted_places').doc(placeId).delete();
                results.deleted++;
                results.deletedPlaces.push({
                    id: placeId,
                    name: place.name || 'Unknown',
                    deletedAt: place.deletedAt,
                });
                console.log(`✅ Permanently deleted: ${place.name} (ID: ${placeId})`);
            }
            catch (error) {
                results.errors++;
                const errorMsg = `Failed to delete ${placeId}: ${error.message}`;
                results.errorDetails.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
            }
        });
        await Promise.all(processPromises);
        // Log results
        await db.collection('admin_logs').add({
            type: 'deleted_places_cleanup',
            timestamp: nowISO,
            results,
        });
        console.log('='.repeat(60));
        console.log('📈 CLEANUP SUMMARY:');
        console.log(`   Scanned: ${results.scanned}`);
        console.log(`   Deleted: ${results.deleted}`);
        console.log(`   Errors: ${results.errors}`);
        console.log('='.repeat(60));
        return Object.assign(Object.assign({ success: true, message: `Cleanup completed: ${results.deleted} places permanently deleted`, stats: {
                scanned: results.scanned,
                deleted: results.deleted,
                errors: results.errors,
            }, deletedPlaces: results.deletedPlaces }, (results.errors > 0 && { errorDetails: results.errorDetails })), { executedAt: nowISO });
    }
    catch (error) {
        console.error('❌ Error in cleanup deleted places:', error);
        throw error;
    }
});
/**
 * SCHEDULED FUNCTION 4: Moderation Health Check
 *
 * Schedule: Every 6 hours
 * Purpose: Monitor queue health and detect issues
 *
 * Replaces: Vercel cron /api/cron/moderation-health-check
 */
exports.scheduledModerationHealthCheck = functions
    .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
})
    .pubsub.schedule('every 6 hours')
    .timeZone('Asia/Ho_Chi_Minh')
    .onRun(async (context) => {
    console.log('='.repeat(60));
    console.log('🏥 SCHEDULED: Moderation Health Check');
    console.log('Triggered at:', new Date().toISOString());
    console.log('='.repeat(60));
    try {
        const db = admin.firestore();
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const healthReport = {
            timestamp: now.toISOString(),
            healthy: true,
            issues: [],
            stats: {
                totalPending: 0,
                totalClaimed: 0,
                totalInReview: 0,
                stuckItems: 0,
                approvedNotArchived: 0,
            },
        };
        // Get all queue entries
        const queueSnapshot = await db.collection('moderation_queue').get();
        const stuckItems = [];
        const approvedNotArchived = [];
        for (const doc of queueSnapshot.docs) {
            const data = doc.data();
            const status = data.status;
            // Count by status
            if (status === 'pending')
                healthReport.stats.totalPending++;
            else if (status === 'claimed')
                healthReport.stats.totalClaimed++;
            else if (status === 'in_review')
                healthReport.stats.totalInReview++;
            // Check for stuck items (> 3 days in pending/claimed)
            const submittedAt = data.submittedAt ? new Date(data.submittedAt) : null;
            if (submittedAt && submittedAt < threeDaysAgo) {
                if (status === 'pending' || status === 'claimed') {
                    stuckItems.push(doc.id);
                    healthReport.stats.stuckItems++;
                }
            }
            // Check for approved/rejected that should be archived
            const reviewedAt = data.reviewedAt ? new Date(data.reviewedAt) : null;
            if (reviewedAt && reviewedAt < threeDaysAgo) {
                if (status === 'approved' || status === 'rejected') {
                    approvedNotArchived.push(doc.id);
                    healthReport.stats.approvedNotArchived++;
                }
            }
        }
        // Generate issues
        if (stuckItems.length > 0) {
            healthReport.healthy = false;
            healthReport.issues.push({
                severity: 'warning',
                type: 'STUCK_ITEMS',
                description: `${stuckItems.length} items stuck > 3 days`,
                affectedItems: stuckItems.slice(0, 5),
            });
        }
        if (healthReport.stats.totalPending > 50) {
            healthReport.healthy = false;
            healthReport.issues.push({
                severity: 'warning',
                type: 'HIGH_QUEUE_BACKLOG',
                description: `Queue has ${healthReport.stats.totalPending} pending items`,
            });
        }
        // Log health report
        await db.collection('moderation_health_logs').add(Object.assign(Object.assign({}, healthReport), { createdAt: now.toISOString() }));
        console.log('\n📊 HEALTH REPORT');
        console.log(`Healthy: ${healthReport.healthy}`);
        console.log(`Pending: ${healthReport.stats.totalPending}, Claimed: ${healthReport.stats.totalClaimed}`);
        console.log(`Stuck items: ${healthReport.stats.stuckItems}`);
        console.log(`Issues: ${healthReport.issues.length}`);
        console.log('='.repeat(60));
        // Alert if critical issues
        if (!healthReport.healthy) {
            console.error('🚨 HEALTH CHECK FAILED - Critical issues detected!');
            // TODO: Send alert email/Slack notification
        }
        return healthReport;
    }
    catch (error) {
        console.error('❌ Error in health check:', error);
        throw error;
    }
});
//# sourceMappingURL=index.js.map
import { getAdminDb, getRealtimeDb } from './firebaseAdmin';
import { User } from '@/lib/types/auth';
import * as admin from 'firebase-admin';

export type NotificationType = 
  // Place moderation (existing)
  | 'place_approved' 
  | 'place_rejected' 
  | 'place_needs_edit'
  | 'edit_request_approved'
  | 'edit_request_rejected' 
  | 'new_moderation_item'
  | 'moderation_claimed'
  | 'moderation_escalated'
  | 'reports_threshold_reached'
  // User interactions (Phase 1)
  | 'place_liked'
  | 'place_saved'
  | 'place_review_posted'
  | 'place_comment_reply'
  | 'place_published'
  | 'place_featured'
  | 'place_milestone'
  // System notifications (Phase 1)
  | 'system_maintenance'
  | 'security_alert'
  | 'feature_update'
  | 'weekly_summary'
  // Admin/Moderator notifications (Phase 2)
  // System Health & Performance
  | 'system_performance_degraded'
  | 'database_connection_issues'
  | 'api_rate_limit_exceeded'
  | 'storage_quota_warning'
  | 'cdn_failure_detected'
  // Security & Compliance
  | 'suspicious_login_patterns'
  | 'multiple_failed_login_attempts'
  | 'data_export_request'
  | 'gdpr_deletion_request'
  | 'admin_privilege_escalation'
  // Business Operations
  | 'moderation_queue_overload'
  | 'content_volume_spike'
  | 'user_registration_anomaly'
  | 'spam_detection_threshold'
  // Infrastructure Monitoring
  | 'server_memory_critical'
  | 'disk_space_warning'
  | 'backup_failure'
  | 'ssl_certificate_expiring'
  | 'third_party_service_down'
  // Moderation Workflow
  | 'moderation_handoff_received'
  | 'moderation_sla_warning'
  | 'moderation_queue_stuck'
  | 'content_pattern_detected';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

// Admin notification configuration interface (Phase 2)
export interface AdminNotificationConfig {
  type: NotificationType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  escalationRules: {
    timeToEscalate: number; // minutes
    escalateTo: 'admin' | 'super_admin' | 'external';
    maxRetries: number;
  };
  channels: ('realtime' | 'email' | 'sms' | 'slack')[];
  quietHoursOverride: boolean; // Can interrupt quiet hours
  batchingAllowed: boolean;
  targetRoles: ('admin' | 'moderator' | 'partner')[];
}

// Admin notification configurations mapping
const ADMIN_NOTIFICATION_CONFIGS: Partial<Record<NotificationType, AdminNotificationConfig>> = {
  system_performance_degraded: {
    type: 'system_performance_degraded',
    priority: 'critical',
    escalationRules: { timeToEscalate: 5, escalateTo: 'super_admin', maxRetries: 3 },
    channels: ['realtime', 'email', 'sms'],
    quietHoursOverride: true,
    batchingAllowed: false,
    targetRoles: ['admin']
  },
  database_connection_issues: {
    type: 'database_connection_issues',
    priority: 'critical',
    escalationRules: { timeToEscalate: 2, escalateTo: 'external', maxRetries: 2 },
    channels: ['realtime', 'email', 'sms'],
    quietHoursOverride: true,
    batchingAllowed: false,
    targetRoles: ['admin']
  },
  moderation_queue_overload: {
    type: 'moderation_queue_overload',
    priority: 'high',
    escalationRules: { timeToEscalate: 30, escalateTo: 'admin', maxRetries: 2 },
    channels: ['realtime', 'email'],
    quietHoursOverride: false,
    batchingAllowed: true,
    targetRoles: ['admin', 'moderator']
  },
  suspicious_login_patterns: {
    type: 'suspicious_login_patterns',
    priority: 'high',
    escalationRules: { timeToEscalate: 15, escalateTo: 'admin', maxRetries: 3 },
    channels: ['realtime', 'email'],
    quietHoursOverride: true,
    batchingAllowed: false,
    targetRoles: ['admin']
  },
  storage_quota_warning: {
    type: 'storage_quota_warning',
    priority: 'medium',
    escalationRules: { timeToEscalate: 120, escalateTo: 'admin', maxRetries: 1 },
    channels: ['realtime', 'email'],
    quietHoursOverride: false,
    batchingAllowed: true,
    targetRoles: ['admin']
  },
  ssl_certificate_expiring: {
    type: 'ssl_certificate_expiring',
    priority: 'medium',
    escalationRules: { timeToEscalate: 1440, escalateTo: 'admin', maxRetries: 1 }, // 24 hours
    channels: ['realtime', 'email'],
    quietHoursOverride: false,
    batchingAllowed: true,
    targetRoles: ['admin']
  }
};

export class NotificationService {
  private static db = getAdminDb();

  /**
   * Send notification to user via Firebase Realtime Database for real-time updates
   * Following Section IV.1 - Real-time (Firebase Realtime Database) specification
   */
  static async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data: Record<string, any> = {},
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    try {
      const notification: Omit<Notification, 'id'> = {
        userId,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: new Date().toISOString(),
        priority
      };

      // 1. Save to Firestore for persistence (as per doc Section IV.2)
      const docRef = await this.db.collection('notifications').add(notification);
      
      // 2. Send to Firebase Realtime Database for INSTANT notifications (Section IV.1)  
      const realtimeDb = getRealtimeDb();
      
      if (realtimeDb) {
        // Following pattern from Section IV.2: `/notifications/${userId}`
        await realtimeDb.ref(`notifications/${userId}/${docRef.id}`).set({
          ...notification,
          id: docRef.id,
          timestamp: admin.database.ServerValue.TIMESTAMP
        });

        // Update unread count for real-time badge updates
        const userNotificationsRef = realtimeDb.ref(`user_stats/${userId}/unreadNotifications`);
        await userNotificationsRef.transaction((current) => (current || 0) + 1);

        // Trigger presence update for online users
        await realtimeDb.ref(`user_presence/${userId}/lastNotification`).set({
          timestamp: admin.database.ServerValue.TIMESTAMP,
          type,
          priority
        });
      }

      console.log(`Real-time notification sent to user ${userId}: ${title}`);
    } catch (error) {
      console.error('Error sending real-time notification:', error);
      throw error;
    }
  }

  /**
   * Send notifications to all moderators about new moderation items
   * Following Section 2.2.1 - Firebase Realtime Database push notification to online Moderators
   */
  static async notifyModerators(
    type: NotificationType,
    title: string,
    message: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Get all moderators and admins
      const moderatorQuery = await this.db.collection('users')
        .where('role', 'in', ['moderator', 'admin'])
        .get();

      const realtimeDb = getRealtimeDb();

      // Send individual notifications
      const notificationPromises = moderatorQuery.docs.map(doc => {
        return this.sendNotification(
          doc.id,
          type,
          title,
          message,
          data,
          'medium'
        );
      });

      // Push to moderator queue for real-time dashboard updates (Section 2.2.1)
      if (realtimeDb) {
        await realtimeDb.ref('moderation_queue_updates').push({
          type: 'new_item',
          title,
          message,
          data,
          timestamp: admin.database.ServerValue.TIMESTAMP,
          notifiedModerators: moderatorQuery.size
        });

        // Update online moderators with instant notification
        const onlineModeratorPromises = moderatorQuery.docs.map(async (doc) => {
          const userId = doc.id;
          // Check if moderator is online by checking presence
          const presenceRef = realtimeDb.ref(`user_presence/${userId}/online`);
          const presenceSnapshot = await presenceRef.once('value');
          
          if (presenceSnapshot.val() === true) {
            // Send instant notification to online moderators
            await realtimeDb.ref(`moderator_alerts/${userId}`).push({
              type,
              title,
              message,
              data,
              priority: 'high',
              timestamp: admin.database.ServerValue.TIMESTAMP
            });
          }
        });

        await Promise.all([...notificationPromises, ...onlineModeratorPromises]);
      } else {
        await Promise.all(notificationPromises);
      }

      console.log(`Sent ${type} notification to ${moderatorQuery.docs.length} moderators (real-time)`);
    } catch (error) {
      console.error('Error notifying moderators:', error);
    }
  }

  /**
   * Send notification about place approval/rejection to submitter
   */
  static async notifyPlaceSubmitter(
    userId: string,
    placeId: string,
    placeName: string,
    status: 'approved' | 'rejected' | 'needs_edit',
    reviewNotes?: string
  ): Promise<void> {
    const typeMap: Record<string, NotificationType> = {
      approved: 'place_approved',
      rejected: 'place_rejected', 
      needs_edit: 'place_needs_edit'
    };

    const titleMap: Record<string, string> = {
      approved: '🎉 Địa điểm được phê duyệt',
      rejected: '❌ Địa điểm bị từ chối',
      needs_edit: '✏️ Địa điểm cần chỉnh sửa'
    };

    const messageMap: Record<string, string> = {
      approved: `Địa điểm "${placeName}" đã được phê duyệt và xuất bản thành công!`,
      rejected: `Địa điểm "${placeName}" đã bị từ chối. ${reviewNotes || 'Vui lòng xem lại thông tin.'}`,
      needs_edit: `Địa điểm "${placeName}" cần được chỉnh sửa. ${reviewNotes || 'Vui lòng cập nhật thông tin.'}`
    };

    await this.sendNotification(
      userId,
      typeMap[status],
      titleMap[status],
      messageMap[status],
      {
        placeId,
        placeName,
        reviewNotes,
        status
      },
      status === 'approved' ? 'high' : 'medium'
    );
  }

  /**
   * Send notification about edit request approval/rejection
   */
  static async notifyEditSubmitter(
    userId: string,
    placeId: string,
    placeName: string,
    status: 'approved' | 'rejected',
    reviewNotes?: string
  ): Promise<void> {
    const type = status === 'approved' ? 'edit_request_approved' : 'edit_request_rejected';
    const title = status === 'approved' 
      ? '✅ Yêu cầu chỉnh sửa được phê duyệt' 
      : '❌ Yêu cầu chỉnh sửa bị từ chối';
    const message = status === 'approved'
      ? `Chỉnh sửa cho địa điểm "${placeName}" đã được phê duyệt và cập nhật!`
      : `Yêu cầu chỉnh sửa cho địa điểm "${placeName}" đã bị từ chối. ${reviewNotes || ''}`;

    await this.sendNotification(
      userId,
      type,
      title,
      message,
      {
        placeId,
        placeName,
        reviewNotes,
        status
      },
      'medium'
    );
  }

  /**
   * Notify moderators about new item in queue
   */
  static async notifyNewModerationItem(
    itemType: string,
    priority: 'urgent' | 'high' | 'medium' | 'low',
    itemId: string,
    submitterName: string,
    contentName: string
  ): Promise<void> {
    const priorityEmoji = {
      urgent: '🚨',
      high: '⚡',
      medium: '📋',
      low: '📝'
    };

    const title = `${priorityEmoji[priority]} Mục kiểm duyệt mới (${priority})`;
    const message = `${submitterName} đã gửi ${itemType} "${contentName}" để kiểm duyệt`;

    await this.notifyModerators(
      'new_moderation_item',
      title,
      message,
      {
        itemType,
        priority,
        itemId,
        submitterName,
        contentName
      }
    );
  }

  /**
   * Notify about moderation escalation
   */
  static async notifyEscalation(
    itemId: string,
    itemType: string,
    escalatedBy: string,
    reason: string
  ): Promise<void> {
    const title = '⚠️ Mục kiểm duyệt được chuyển lên cấp cao hơn';
    const message = `${escalatedBy} đã chuyển ${itemType} lên admin để xử lý. Lý do: ${reason}`;

    // Notify only admins for escalated items
    const adminQuery = await this.db.collection('users')
      .where('role', '==', 'admin')
      .get();

    const notificationPromises = adminQuery.docs.map(doc => {
      return this.sendNotification(
        doc.id,
        'moderation_escalated',
        title,
        message,
        {
          itemId,
          itemType,
          escalatedBy,
          reason
        },
        'high'
      );
    });

    await Promise.all(notificationPromises);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      // Update Firestore
      await this.db.collection('notifications').doc(notificationId).update({
        read: true
      });

      // Update Realtime Database
      const realtimeDb = getRealtimeDb();
      if (realtimeDb) {
        await realtimeDb.ref(`user_notifications/${userId}/${notificationId}/read`).set(true);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get user's unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const unreadQuery = await this.db.collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      return unreadQuery.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Presence tracking for online/offline status (Section IV.1)
   * Essential for real-time moderator notifications
   */
  static async updatePresence(userId: string, online: boolean): Promise<void> {
    try {
      const realtimeDb = getRealtimeDb();
      
      if (realtimeDb) {
        const presenceRef = realtimeDb.ref(`user_presence/${userId}`);
        
        if (online) {
          // User comes online
          await presenceRef.set({
            online: true,
            lastSeen: admin.database.ServerValue.TIMESTAMP,
            connectedAt: admin.database.ServerValue.TIMESTAMP
          });
          
          // Auto-disconnect when client disconnects
          await presenceRef.onDisconnect().set({
            online: false,
            lastSeen: admin.database.ServerValue.TIMESTAMP
          });
        } else {
          // User goes offline
          await presenceRef.set({
            online: false,
            lastSeen: admin.database.ServerValue.TIMESTAMP
          });
        }
        
        console.log(`User ${userId} presence updated: ${online ? 'online' : 'offline'}`);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  /**
   * Get online moderators for real-time notifications (Section 2.2.1)
   */
  static async getOnlineModerators(): Promise<string[]> {
    try {
      const realtimeDb = getRealtimeDb();
      
      if (!realtimeDb) {
        return [];
      }

      // Get all moderators
      const moderatorQuery = await this.db.collection('users')
        .where('role', 'in', ['moderator', 'admin'])
        .get();

      const onlineModeratorIds: string[] = [];

      // Check presence for each moderator
      const presenceChecks = moderatorQuery.docs.map(async (doc) => {
        const userId = doc.id;
        const presenceSnapshot = await realtimeDb.ref(`user_presence/${userId}/online`).once('value');
        
        if (presenceSnapshot.val() === true) {
          onlineModeratorIds.push(userId);
        }
      });

      await Promise.all(presenceChecks);
      
      console.log(`Found ${onlineModeratorIds.length} online moderators`);
      return onlineModeratorIds;
    } catch (error) {
      console.error('Error getting online moderators:', error);
      return [];
    }
  }

  /**
   * Real-time unread count sync (Section IV.1)
   */
  static async syncUnreadCount(userId: string): Promise<void> {
    try {
      const realtimeDb = getRealtimeDb();
      
      if (realtimeDb) {
        const unreadCount = await this.getUnreadCount(userId);
        await realtimeDb.ref(`user_stats/${userId}/unreadNotifications`).set(unreadCount);
      }
    } catch (error) {
      console.error('Error syncing unread count:', error);
    }
  }

  // ============================================================================
  // NEW USER INTERACTION NOTIFICATIONS (Phase 1)
  // ============================================================================

  /**
   * Notify place owner when someone likes their place
   */
  static async notifyPlaceLiked(
    placeOwnerId: string,
    likerId: string,
    likerName: string,
    placeId: string,
    placeName: string
  ): Promise<void> {
    // Don't notify if user likes their own place
    if (placeOwnerId === likerId) return;

    await this.sendNotification(
      placeOwnerId,
      'place_liked',
      '❤️ Có người thích địa điểm của bạn',
      `${likerName} đã thích địa điểm "${placeName}" của bạn`,
      {
        placeId,
        placeName,
        likerId,
        likerName,
        actionUrl: `/places/${placeId}`
      },
      'low'
    );
  }

  /**
   * Notify place owner when someone saves their place
   */
  static async notifyPlaceSaved(
    placeOwnerId: string,
    saverId: string,
    saverName: string,
    placeId: string,
    placeName: string
  ): Promise<void> {
    // Don't notify if user saves their own place
    if (placeOwnerId === saverId) return;

    await this.sendNotification(
      placeOwnerId,
      'place_saved',
      '💾 Có người lưu địa điểm của bạn',
      `${saverName} đã lưu địa điểm "${placeName}" vào danh sách yêu thích`,
      {
        placeId,
        placeName,
        saverId,
        saverName,
        actionUrl: `/places/${placeId}`
      },
      'low'
    );
  }

  /**
   * Notify place owner when someone posts a review
   */
  static async notifyPlaceReviewPosted(
    placeOwnerId: string,
    reviewerId: string,
    reviewerName: string,
    placeId: string,
    placeName: string,
    rating: number,
    reviewSnippet?: string
  ): Promise<void> {
    // Don't notify if user reviews their own place
    if (placeOwnerId === reviewerId) return;

    const stars = '⭐'.repeat(rating);
    await this.sendNotification(
      placeOwnerId,
      'place_review_posted',
      '⭐ Có đánh giá mới cho địa điểm',
      `${reviewerName} đã đánh giá ${stars} cho "${placeName}"${reviewSnippet ? `: "${reviewSnippet}"` : ''}`,
      {
        placeId,
        placeName,
        reviewerId,
        reviewerName,
        rating,
        reviewSnippet,
        actionUrl: `/places/${placeId}#reviews`
      },
      'medium'
    );
  }

  /**
   * Notify user when someone replies to their comment
   */
  static async notifyCommentReply(
    originalCommenterId: string,
    replierId: string,
    replierName: string,
    placeId: string,
    placeName: string,
    replySnippet: string
  ): Promise<void> {
    // Don't notify if user replies to themselves
    if (originalCommenterId === replierId) return;

    await this.sendNotification(
      originalCommenterId,
      'place_comment_reply',
      '💬 Có phản hồi bình luận của bạn',
      `${replierName} đã phản hồi bình luận của bạn về "${placeName}": "${replySnippet}"`,
      {
        placeId,
        placeName,
        replierId,
        replierName,
        replySnippet,
        actionUrl: `/places/${placeId}#comments`
      },
      'medium'
    );
  }

  /**
   * Notify user when their place is published
   */
  static async notifyPlacePublished(
    userId: string,
    placeId: string,
    placeName: string
  ): Promise<void> {
    await this.sendNotification(
      userId,
      'place_published',
      '🎉 Địa điểm của bạn đã được xuất bản',
      `"${placeName}" hiện đã có mặt trên VietExplore và mọi người có thể khám phá!`,
      {
        placeId,
        placeName,
        actionUrl: `/places/${placeId}`
      },
      'high'
    );
  }

  /**
   * Notify user when their place gets featured
   */
  static async notifyPlaceFeatured(
    userId: string,
    placeId: string,
    placeName: string,
    featureType: 'homepage' | 'trending' | 'editor_choice'
  ): Promise<void> {
    const featureMessages = {
      homepage: 'được hiển thị trên trang chủ',
      trending: 'được chọn vào danh sách xu hướng',
      editor_choice: 'được chọn là lựa chọn của biên tập viên'
    };

    await this.sendNotification(
      userId,
      'place_featured',
      '⭐ Địa điểm của bạn được nổi bật',
      `Chúc mừng! "${placeName}" đã ${featureMessages[featureType]}`,
      {
        placeId,
        placeName,
        featureType,
        actionUrl: `/places/${placeId}`
      },
      'high'
    );
  }

  /**
   * Notify user when their place reaches view milestones
   */
  static async notifyPlaceMilestone(
    userId: string,
    placeId: string,
    placeName: string,
    milestone: number,
    metricType: 'views' | 'likes' | 'saves'
  ): Promise<void> {
    const milestoneText = milestone >= 1000 ? `${(milestone / 1000).toFixed(0)}K` : milestone.toString();
    const metricEmojis = {
      views: '👀',
      likes: '❤️',
      saves: '💾'
    };
    const metricNames = {
      views: 'lượt xem',
      likes: 'lượt thích',
      saves: 'lượt lưu'
    };

    await this.sendNotification(
      userId,
      'place_milestone',
      `${metricEmojis[metricType]} Cột mốc ${milestoneText} ${metricNames[metricType]}`,
      `"${placeName}" đã đạt ${milestoneText} ${metricNames[metricType]}! Thật tuyệt vời!`,
      {
        placeId,
        placeName,
        milestone,
        metricType,
        actionUrl: `/places/${placeId}`
      },
      'medium'
    );
  }

  /**
   * Send system maintenance notification to all users
   */
  static async notifySystemMaintenance(
    title: string,
    message: string,
    scheduledTime: string,
    duration: string
  ): Promise<void> {
    try {
      // Get all active users (last login within 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const activeUsersQuery = await this.db.collection('users')
        .where('lastLoginAt', '>=', thirtyDaysAgo.toISOString())
        .get();

      const notificationPromises = activeUsersQuery.docs.map(doc => {
        return this.sendNotification(
          doc.id,
          'system_maintenance',
          title,
          message,
          {
            scheduledTime,
            duration,
            actionUrl: '/system-status'
          },
          'medium'
        );
      });

      await Promise.all(notificationPromises);
      console.log(`Sent maintenance notification to ${activeUsersQuery.docs.length} active users`);
    } catch (error) {
      console.error('Error sending maintenance notifications:', error);
    }
  }

  /**
   * Send security alert to specific user
   */
  static async notifySecurityAlert(
    userId: string,
    alertType: 'login_attempt' | 'password_change' | 'suspicious_activity',
    details: string,
    ipAddress?: string,
    location?: string
  ): Promise<void> {
    const alertTitles = {
      login_attempt: '🔐 Đăng nhập từ thiết bị mới',
      password_change: '🔑 Mật khẩu đã được thay đổi',
      suspicious_activity: '⚠️ Hoạt động đáng ngờ'
    };

    await this.sendNotification(
      userId,
      'security_alert',
      alertTitles[alertType],
      `${details}${ipAddress ? ` từ IP: ${ipAddress}` : ''}${location ? ` tại ${location}` : ''}`,
      {
        alertType,
        details,
        ipAddress,
        location,
        timestamp: new Date().toISOString(),
        actionUrl: '/settings/security'
      },
      'high'
    );
  }

  /**
   * Send feature update notification to all users
   */
  static async notifyFeatureUpdate(
    title: string,
    description: string,
    features: string[],
    actionUrl?: string
  ): Promise<void> {
    try {
      // Get all users who have logged in within the last 7 days
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentUsersQuery = await this.db.collection('users')
        .where('lastLoginAt', '>=', weekAgo.toISOString())
        .get();

      const notificationPromises = recentUsersQuery.docs.map(doc => {
        return this.sendNotification(
          doc.id,
          'feature_update',
          `🚀 ${title}`,
          description,
          {
            features,
            actionUrl: actionUrl || '/features/new',
            version: process.env.NEXT_PUBLIC_APP_VERSION
          },
          'medium'
        );
      });

      await Promise.all(notificationPromises);
      console.log(`Sent feature update notification to ${recentUsersQuery.docs.length} recent users`);
    } catch (error) {
      console.error('Error sending feature update notifications:', error);
    }
  }

  // ============================================================================
  // PHASE 2: ADMIN/MODERATOR NOTIFICATIONS
  // ============================================================================

  /**
   * Send admin notification with smart routing based on configuration
   */
  static async sendAdminNotification(
    type: NotificationType,
    title: string,
    message: string,
    data: Record<string, any> = {},
    overridePriority?: 'critical' | 'high' | 'medium' | 'low'
  ): Promise<void> {
    try {
      const config = ADMIN_NOTIFICATION_CONFIGS[type];
      
      if (!config) {
        console.warn(`No configuration found for admin notification type: ${type}`);
        return;
      }

      const priority = overridePriority || config.priority;
      
      // Get target users based on roles
      const targetUsers = await this.getUsersByRoles(config.targetRoles);
      
      // Send to each target user
      const notificationPromises = targetUsers.map(user => 
        this.sendNotification(
          user.id,
          type,
          title,
          message,
          {
            ...data,
            adminNotification: true,
            escalationConfig: config.escalationRules,
            channels: config.channels
          },
          priority === 'critical' ? 'high' : priority === 'high' ? 'high' : 'medium'
        )
      );

      await Promise.all(notificationPromises);

      // Send to admin dashboard real-time updates
      const realtimeDb = getRealtimeDb();
      if (realtimeDb) {
        await realtimeDb.ref('admin_dashboard/notifications').push({
          type,
          title,
          message,
          priority,
          timestamp: admin.database.ServerValue.TIMESTAMP,
          targetRoles: config.targetRoles,
          notifiedUsers: targetUsers.length,
          data
        });
      }

      console.log(`Admin notification '${type}' sent to ${targetUsers.length} users`);
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }

  /**
   * System health monitoring notifications
   */
  static async notifySystemPerformanceDegraded(
    metric: string,
    currentValue: number,
    threshold: number,
    affectedServices: string[]
  ): Promise<void> {
    await this.sendAdminNotification(
      'system_performance_degraded',
      '🚨 Hiệu suất hệ thống giảm sút',
      `Cảnh báo: ${metric} đã vượt ngưỡng cho phép (${currentValue} > ${threshold})`,
      {
        metric,
        currentValue,
        threshold,
        affectedServices,
        actionRequired: 'immediate_investigation',
        dashboardUrl: '/admin/system/performance'
      }
    );
  }

  static async notifyDatabaseConnectionIssues(
    errorDetails: string,
    affectedOperations: string[],
    startTime: string
  ): Promise<void> {
    await this.sendAdminNotification(
      'database_connection_issues',
      '🔴 Lỗi kết nối cơ sở dữ liệu',
      `Hệ thống không thể kết nối với database. Các tác vụ bị ảnh hưởng: ${affectedOperations.join(', ')}`,
      {
        errorDetails,
        affectedOperations,
        startTime,
        actionRequired: 'immediate_investigation',
        escalateAfter: 2, // minutes
        dashboardUrl: '/admin/system/database'
      }
    );
  }

  /**
   * Moderation queue management notifications
   */
  static async notifyModerationQueueOverload(
    currentQueueSize: number,
    threshold: number,
    averageWaitTime: number,
    onlineModerators: number
  ): Promise<void> {
    await this.sendAdminNotification(
      'moderation_queue_overload',
      '📊 Hàng đợi kiểm duyệt quá tải',
      `Hàng đợi hiện có ${currentQueueSize} mục (ngưỡng: ${threshold}). Thời gian chờ trung bình: ${averageWaitTime} phút`,
      {
        currentQueueSize,
        threshold,
        averageWaitTime,
        onlineModerators,
        actionRequired: 'assign_more_moderators',
        dashboardUrl: '/admin/moderation/queue'
      }
    );
  }

  static async notifyModerationHandoff(
    itemId: string,
    itemType: string,
    fromModeratorId: string,
    fromModeratorName: string,
    toModeratorId: string,
    reason: string,
    contextNotes?: string
  ): Promise<void> {
    await this.sendNotification(
      toModeratorId,
      'moderation_handoff_received',
      '👥 Tiếp nhận kiểm duyệt từ đồng nghiệp',
      `${fromModeratorName} đã chuyển giao ${itemType} #${itemId} cho bạn. Lý do: ${reason}`,
      {
        itemId,
        itemType,
        fromModeratorId,
        fromModeratorName,
        reason,
        contextNotes,
        priority: 'high',
        actionUrl: `/admin/moderation/queue/${itemId}`
      },
      'high'
    );

    // Log handoff activity
    const realtimeDb = getRealtimeDb();
    if (realtimeDb) {
      await realtimeDb.ref('moderation_handoffs').push({
        itemId,
        itemType,
        fromModeratorId,
        toModeratorId,
        reason,
        timestamp: admin.database.ServerValue.TIMESTAMP
      });
    }
  }

  /**
   * Security and compliance notifications
   */
  static async notifySuspiciousLoginPatterns(
    pattern: string,
    affectedUsers: number,
    riskLevel: 'low' | 'medium' | 'high',
    detectionDetails: Record<string, any>
  ): Promise<void> {
    await this.sendAdminNotification(
      'suspicious_login_patterns',
      '⚠️ Phát hiện hoạt động đăng nhập đáng ngờ',
      `Hệ thống phát hiện ${pattern} ảnh hưởng đến ${affectedUsers} tài khoản (mức độ: ${riskLevel})`,
      {
        pattern,
        affectedUsers,
        riskLevel,
        detectionDetails,
        actionRequired: 'security_review',
        dashboardUrl: '/admin/security/login-patterns'
      }
    );
  }

  static async notifyGDPRDataRequest(
    requestType: 'export' | 'deletion' | 'rectification',
    userId: string,
    userEmail: string,
    legalDeadline: string,
    requestDetails: Record<string, any>
  ): Promise<void> {
    await this.sendAdminNotification(
      'data_export_request',
      `📋 Yêu cầu GDPR: ${requestType.toUpperCase()}`,
      `Người dùng ${userEmail} yêu cầu ${requestType} dữ liệu. Thời hạn pháp lý: ${legalDeadline}`,
      {
        requestType,
        userId,
        userEmail,
        legalDeadline,
        requestDetails,
        actionRequired: 'legal_compliance',
        dashboardUrl: `/admin/compliance/requests/${userId}`
      }
    );
  }

  /**
   * Infrastructure monitoring notifications
   */
  static async notifyStorageQuotaWarning(
    currentUsage: number,
    totalQuota: number,
    usagePercentage: number,
    projectedFullDate?: string
  ): Promise<void> {
    await this.sendAdminNotification(
      'storage_quota_warning',
      '📦 Cảnh báo dung lượng lưu trữ',
      `Dung lượng sử dụng: ${usagePercentage}% (${currentUsage}GB/${totalQuota}GB)${projectedFullDate ? `. Dự kiến đầy: ${projectedFullDate}` : ''}`,
      {
        currentUsage,
        totalQuota,
        usagePercentage,
        projectedFullDate,
        actionRequired: 'storage_cleanup_or_upgrade',
        dashboardUrl: '/admin/system/storage'
      }
    );
  }

  static async notifySSLCertificateExpiring(
    domain: string,
    expirationDate: string,
    daysUntilExpiry: number
  ): Promise<void> {
    const urgency = daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 30 ? 'high' : 'medium';
    
    await this.sendAdminNotification(
      'ssl_certificate_expiring',
      '🔒 Chứng chỉ SSL sắp hết hạn',
      `Chứng chỉ SSL cho ${domain} sẽ hết hạn vào ${expirationDate} (còn ${daysUntilExpiry} ngày)`,
      {
        domain,
        expirationDate,
        daysUntilExpiry,
        actionRequired: 'certificate_renewal',
        dashboardUrl: '/admin/system/certificates'
      },
      urgency
    );
  }

  /**
   * Content and spam detection notifications
   */
  static async notifySpamDetectionThreshold(
    detectionType: 'content' | 'user_behavior' | 'ip_pattern',
    threshold: number,
    currentCount: number,
    timeWindow: string,
    affectedItems: string[]
  ): Promise<void> {
    await this.sendAdminNotification(
      'spam_detection_threshold',
      '🛡️ Cảnh báo spam/thư rác',
      `Phát hiện ${currentCount} ${detectionType} nghi ngờ spam trong ${timeWindow} (ngưỡng: ${threshold})`,
      {
        detectionType,
        threshold,
        currentCount,
        timeWindow,
        affectedItems,
        actionRequired: 'content_review',
        dashboardUrl: '/admin/moderation/spam-detection'
      }
    );
  }

  /**
   * Helper method to get users by roles
   */
  private static async getUsersByRoles(roles: string[]): Promise<{id: string, role: string}[]> {
    try {
      const users: {id: string, role: string}[] = [];
      
      for (const role of roles) {
        const roleQuery = await this.db.collection('users')
          .where('role', '==', role)
          .where('isActive', '==', true)
          .get();
        
        roleQuery.docs.forEach(doc => {
          users.push({
            id: doc.id,
            role: doc.data().role
          });
        });
      }
      
      return users;
    } catch (error) {
      console.error('Error getting users by roles:', error);
      return [];
    }
  }

  /**
   * Check if user should receive admin notification based on quiet hours
   */
  private static async shouldSendAdminNotification(
    userId: string,
    notificationType: NotificationType,
    priority: 'critical' | 'high' | 'medium' | 'low'
  ): Promise<boolean> {
    const config = ADMIN_NOTIFICATION_CONFIGS[notificationType];
    
    if (!config) return true;
    
    // Always send critical notifications
    if (priority === 'critical' || config.quietHoursOverride) {
      return true;
    }
    
    // Check user's quiet hours preferences
    // This would integrate with notification preferences from Phase 1
    return true; // Simplified for now
  }
}
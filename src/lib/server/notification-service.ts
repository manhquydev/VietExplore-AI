import { getAdminDb, getRealtimeDb } from './firebaseAdmin';
import { User } from '@/lib/types/auth';
import * as admin from 'firebase-admin';

export type NotificationType = 
  | 'place_approved' 
  | 'place_rejected' 
  | 'place_needs_edit'
  | 'edit_request_approved'
  | 'edit_request_rejected' 
  | 'new_moderation_item'
  | 'moderation_claimed'
  | 'moderation_escalated'
  | 'reports_threshold_reached';

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
}
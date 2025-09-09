/**
 * Notification Preference Management Service
 * Phase 1: User preference management and smart delivery
 */

import { getAdminDb } from './firebaseAdmin';
import { 
  NotificationPreferences, 
  NotificationDigest, 
  NotificationBatch,
  DEFAULT_NOTIFICATION_PREFERENCES,
  NotificationTemplate
} from '@/lib/types/notifications';
import { NotificationService } from './notification-service';

export class NotificationPreferenceService {
  private static db = getAdminDb();

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const prefsDoc = await this.db.collection('notification_preferences').doc(userId).get();
      
      if (!prefsDoc.exists) {
        // Create default preferences for new user
        const defaultPrefs = await this.createDefaultPreferences(userId);
        return defaultPrefs;
      }
      
      return prefsDoc.data() as NotificationPreferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      // Return default preferences if error
      return {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        id: userId,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Create default preferences for new user
   */
  static async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      // Check user role to set appropriate defaults
      const userDoc = await this.db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const userRole = userData?.role || 'traveler';

      const preferences: NotificationPreferences = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        id: userId,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add moderation preferences for moderators/admins
      if (['moderator', 'admin'].includes(userRole)) {
        preferences.categories.moderation = {
          enabled: true,
          types: {
            newItems: true,
            escalated: true,
            slaWarning: true,
            queueOverload: true
          }
        };
      }

      await this.db.collection('notification_preferences').doc(userId).set(preferences);
      return preferences;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(
    userId: string, 
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const currentPrefs = await this.getUserPreferences(userId);
      
      const updatedPrefs: NotificationPreferences = {
        ...currentPrefs,
        ...updates,
        userId,
        updatedAt: new Date().toISOString()
      };

      await this.db.collection('notification_preferences').doc(userId).set(updatedPrefs);
      
      console.log(`Updated notification preferences for user ${userId}`);
      return updatedPrefs;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Check if user should receive notification based on preferences
   */
  static async shouldSendNotification(
    userId: string,
    notificationType: string,
    priority: 'low' | 'medium' | 'high',
    channel: 'inApp' | 'push' | 'email' | 'sms' = 'inApp'
  ): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);

      // Check if channel is enabled
      if (!preferences.channels[channel]) {
        return false;
      }

      // Check quiet hours
      if (preferences.quietHours.enabled && this.isInQuietHours(preferences.quietHours)) {
        // Only allow high priority notifications during quiet hours
        if (priority !== 'high') {
          return false;
        }
      }

      // Check category and type preferences
      const categoryEnabled = this.isCategoryEnabled(preferences, notificationType);
      if (!categoryEnabled) {
        return false;
      }

      // Check frequency limits
      if (preferences.advanced.limitFrequency) {
        const withinLimit = await this.checkFrequencyLimit(userId, notificationType, preferences.frequency);
        if (!withinLimit) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return true; // Default to sending if error
    }
  }

  /**
   * Check if current time is within user's quiet hours
   */
  private static isInQuietHours(quietHours: NotificationPreferences['quietHours']): boolean {
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: quietHours.timezone 
    });

    const start = quietHours.start;
    const end = quietHours.end;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }

  /**
   * Check if notification category/type is enabled in preferences
   */
  private static isCategoryEnabled(preferences: NotificationPreferences, notificationType: string): boolean {
    // Map notification types to categories
    const categoryMapping = {
      // Place notifications
      'place_approved': ['places', 'approved'],
      'place_rejected': ['places', 'rejected'],
      'place_published': ['places', 'published'],
      'place_featured': ['places', 'featured'],
      'place_milestone': ['places', 'milestone'],
      
      // Interaction notifications
      'place_liked': ['interactions', 'liked'],
      'place_saved': ['interactions', 'saved'],
      'place_review_posted': ['interactions', 'reviewed'],
      'place_comment_reply': ['interactions', 'commented'],
      
      // System notifications
      'system_maintenance': ['system', 'maintenance'],
      'security_alert': ['system', 'security'],
      'feature_update': ['system', 'features'],
      'weekly_summary': ['system', 'weekly'],
      
      // Moderation notifications
      'new_moderation_item': ['moderation', 'newItems'],
      'moderation_escalated': ['moderation', 'escalated']
    };

    const mapping = categoryMapping[notificationType as keyof typeof categoryMapping];
    if (!mapping) return true; // Default to enabled if mapping not found

    const [category, type] = mapping;
    const categoryPrefs = preferences.categories[category as keyof typeof preferences.categories];
    
    if (!categoryPrefs?.enabled) return false;
    
    // Check specific type within category
    if (type && categoryPrefs.types) {
      return categoryPrefs.types[type as keyof typeof categoryPrefs.types] !== false;
    }

    return true;
  }

  /**
   * Check if user has exceeded frequency limit for notification type
   */
  private static async checkFrequencyLimit(
    userId: string,
    notificationType: string,
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  ): Promise<boolean> {
    if (frequency === 'realtime') return true;

    try {
      // Define time windows
      const timeWindows = {
        hourly: 60 * 60 * 1000,        // 1 hour
        daily: 24 * 60 * 60 * 1000,    // 24 hours
        weekly: 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      const windowStart = new Date(Date.now() - timeWindows[frequency]);
      
      // Check recent notifications of this type
      const recentNotificationsQuery = await this.db.collection('notifications')
        .where('userId', '==', userId)
        .where('type', '==', notificationType)
        .where('createdAt', '>=', windowStart.toISOString())
        .get();

      // Define limits per frequency
      const limits = {
        hourly: 5,   // Max 5 per hour
        daily: 20,   // Max 20 per day
        weekly: 100  // Max 100 per week
      };

      return recentNotificationsQuery.size < limits[frequency];
    } catch (error) {
      console.error('Error checking frequency limit:', error);
      return true; // Default to allow if error
    }
  }

  /**
   * Create notification batch for similar notifications
   */
  static async createNotificationBatch(
    userId: string,
    notifications: {
      type: string;
      title: string;
      message: string;
      data: Record<string, any>;
    }[]
  ): Promise<NotificationBatch> {
    try {
      // Group similar notifications
      const groupedByType = notifications.reduce((acc, notif) => {
        if (!acc[notif.type]) acc[notif.type] = [];
        acc[notif.type].push(notif);
        return acc;
      }, {} as Record<string, typeof notifications>);

      // Generate combined message
      const { combinedTitle, combinedMessage } = this.generateBatchMessage(groupedByType);

      const batch: NotificationBatch = {
        userId,
        batchType: 'similar',
        notifications: notifications.map(n => ({
          id: this.generateId(),
          ...n,
          createdAt: new Date().toISOString()
        })),
        combinedTitle,
        combinedMessage,
        priority: 'medium',
        scheduledFor: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        processed: false
      };

      const docRef = await this.db.collection('notification_batches').add(batch);
      batch.id = docRef.id;

      return batch;
    } catch (error) {
      console.error('Error creating notification batch:', error);
      throw error;
    }
  }

  /**
   * Generate combined message for batched notifications
   */
  private static generateBatchMessage(groupedNotifications: Record<string, any[]>): {
    combinedTitle: string;
    combinedMessage: string;
  } {
    const types = Object.keys(groupedNotifications);
    const totalCount = Object.values(groupedNotifications).reduce((sum, arr) => sum + arr.length, 0);

    if (types.length === 1) {
      const type = types[0];
      const count = groupedNotifications[type].length;
      
      const typeMessages = {
        'place_liked': `Bạn có ${count} lượt thích mới`,
        'place_saved': `Bạn có ${count} lượt lưu mới`,
        'place_review_posted': `Bạn có ${count} đánh giá mới`,
        'place_comment_reply': `Bạn có ${count} phản hồi mới`
      };

      return {
        combinedTitle: typeMessages[type as keyof typeof typeMessages] || `${count} thông báo mới`,
        combinedMessage: `Địa điểm của bạn vừa nhận được ${count} ${this.getActivityName(type)}`
      };
    } else {
      return {
        combinedTitle: `${totalCount} thông báo mới`,
        combinedMessage: `Bạn có ${totalCount} thông báo mới từ ${types.length} hoạt động khác nhau`
      };
    }
  }

  /**
   * Get activity name for notification type
   */
  private static getActivityName(type: string): string {
    const activityNames = {
      'place_liked': 'lượt thích',
      'place_saved': 'lượt lưu',
      'place_review_posted': 'đánh giá',
      'place_comment_reply': 'phản hồi'
    };
    return activityNames[type as keyof typeof activityNames] || 'hoạt động';
  }

  /**
   * Process pending notification batches
   */
  static async processPendingBatches(): Promise<void> {
    try {
      const pendingBatchesQuery = await this.db.collection('notification_batches')
        .where('processed', '==', false)
        .where('scheduledFor', '<=', new Date().toISOString())
        .get();

      for (const doc of pendingBatchesQuery.docs) {
        const batch = doc.data() as NotificationBatch;
        
        // Send the batched notification
        await NotificationService.sendNotification(
          batch.userId,
          'system' as any, // Will need to update NotificationService types
          batch.combinedTitle,
          batch.combinedMessage,
          {
            batchId: doc.id,
            originalNotifications: batch.notifications,
            batchType: batch.batchType
          },
          batch.priority
        );

        // Mark as processed
        await doc.ref.update({
          processed: true,
          processedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error processing pending batches:', error);
    }
  }

  /**
   * Generate daily notification digest for user
   */
  static async generateDailyDigest(userId: string): Promise<NotificationDigest | null> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      if (!preferences.digest.enabled || preferences.digest.frequency !== 'daily') {
        return null;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get notifications from yesterday
      const notificationsQuery = await this.db.collection('notifications')
        .where('userId', '==', userId)
        .where('createdAt', '>=', yesterday.toISOString())
        .where('createdAt', '<', today.toISOString())
        .get();

      const notifications = notificationsQuery.docs.map(doc => doc.data());
      
      if (notifications.length === 0) return null;

      // Generate digest
      const digest = this.buildDigest(userId, 'daily', yesterday, today, notifications);
      
      // Save digest
      const docRef = await this.db.collection('notification_digests').add(digest);
      digest.id = docRef.id;

      return digest;
    } catch (error) {
      console.error('Error generating daily digest:', error);
      return null;
    }
  }

  /**
   * Build notification digest from raw notifications
   */
  private static buildDigest(
    userId: string,
    period: 'daily' | 'weekly',
    startDate: Date,
    endDate: Date,
    notifications: any[]
  ): NotificationDigest {
    // Group by type and count
    const grouped = notifications.reduce((acc, notif) => {
      const type = notif.type;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          category: this.getCategoryFromType(type),
          lastExample: null
        };
      }
      acc[type].count++;
      acc[type].lastExample = {
        title: notif.title,
        message: notif.message,
        createdAt: notif.createdAt
      };
      return acc;
    }, {} as Record<string, any>);

    // Calculate top categories
    const categoryCount = Object.values(grouped).reduce((acc: Record<string, number>, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + item.count;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    return {
      userId,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        totalNotifications: notifications.length,
        unreadCount: notifications.filter(n => !n.read).length,
        topCategories
      },
      notifications: Object.entries(grouped).map(([type, data]: [string, any]) => ({
        category: data.category,
        type,
        count: data.count,
        lastExample: data.lastExample
      })),
      createdAt: new Date().toISOString(),
      sent: false
    };
  }

  /**
   * Get category from notification type
   */
  private static getCategoryFromType(type: string): string {
    if (type.startsWith('place_')) return 'places';
    if (['place_liked', 'place_saved', 'place_review_posted', 'place_comment_reply'].includes(type)) return 'interactions';
    if (['system_maintenance', 'security_alert', 'feature_update'].includes(type)) return 'system';
    if (type.includes('moderation')) return 'moderation';
    return 'other';
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Send digest notification to user
   */
  static async sendDigestNotification(digest: NotificationDigest): Promise<void> {
    try {
      const title = digest.period === 'daily' ? 
        '📊 Tổng kết thông báo hôm qua' : 
        '📊 Tổng kết thông báo tuần này';

      const message = `Bạn có ${digest.summary.totalNotifications} thông báo với ${digest.summary.unreadCount} chưa đọc`;

      await NotificationService.sendNotification(
        digest.userId,
        'weekly_summary',
        title,
        message,
        {
          digestId: digest.id,
          summary: digest.summary,
          actionUrl: '/notifications/digest'
        },
        'low'
      );

      // Mark digest as sent
      if (digest.id) {
        await this.db.collection('notification_digests').doc(digest.id).update({
          sent: true,
          sentAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending digest notification:', error);
    }
  }
}
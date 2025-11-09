/**
 * Enhanced Notification Service - Real-time Database Design
 * 
 * Thiết kế cho scalability và performance:
 * - Firebase Realtime Database cho real-time notifications
 * - Firestore cho notification history và complex queries  
 * - WebSocket fallback cho browsers không hỗ trợ Firebase
 * - Push notifications cho mobile apps
 * - Email notifications cho critical events
 */

import { getAdminDb, getRealtimeDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { generatePlaceUrl } from '@/lib/utils/url-helpers';

// Notification types theo workflow moderation
export enum NotificationType {
  // Content submission
  PLACE_SUBMITTED = 'place_submitted',
  PLACE_RECEIVED = 'place_received', // Địa điểm đã được tiếp nhận kiểm duyệt
  PLACE_CLAIMED = 'place_claimed', // Địa điểm đã được moderator tiếp nhận xử lý
  PLACE_IN_REVIEW = 'place_in_review', // Địa điểm đang được kiểm duyệt chính thức
  PLACE_APPROVED = 'place_approved',
  PLACE_REJECTED = 'place_rejected',

  // Editing workflow
  EDIT_REQUESTED = 'edit_requested',
  EDIT_APPROVED = 'edit_approved',
  EDIT_REJECTED = 'edit_rejected',
  REVISION_REQUESTED = 'revision_requested',
  
  // Deletion workflow  
  DELETION_REQUESTED = 'deletion_requested',
  DELETION_APPROVED = 'deletion_approved',
  DELETION_REJECTED = 'deletion_rejected',
  
  // Moderation workflow
  CONTENT_CLAIMED = 'content_claimed',
  CONTENT_RELEASED = 'content_released',
  CLAIM_EXPIRING = 'claim_expiring',
  CLAIM_EXPIRED = 'claim_expired',
  
  // Escalation
  CONTENT_ESCALATED = 'content_escalated',
  ESCALATION_ASSIGNED = 'escalation_assigned',
  ESCALATION_RESOLVED = 'escalation_resolved',
  
  // Reports
  CONTENT_REPORTED = 'content_reported',
  REPORT_RESOLVED = 'report_resolved',

  // Place Actions (from report handling)
  PLACE_SUSPENDED = 'place_suspended',
  PLACE_HIDDEN = 'place_hidden',
  PLACE_WARNING = 'place_warning',

  // System
  SYSTEM_MAINTENANCE = 'system_maintenance',
  ROLE_CHANGED = 'role_changed',
  ACCOUNT_WARNING = 'account_warning'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum NotificationChannel {
  IN_APP = 'in_app',      // Real-time trong app
  PUSH = 'push',          // Push notification mobile
  EMAIL = 'email',        // Email notification
  SMS = 'sms',           // SMS cho critical
  WEBHOOK = 'webhook'     // Third-party integrations
}

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  actionText?: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  retentionDays: number; // Bao lâu giữ notification
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipientId: string;
  recipientRole: string;
  title: string;
  body: string;
  actionUrl?: string;
  actionText?: string;
  data?: any; // Additional context data
  channels: NotificationChannel[];
  createdAt: string;
  scheduledFor?: string; // For delayed notifications
  expiresAt?: string;
  readAt?: string;
  dismissedAt?: string;
  metadata?: {
    senderId?: string;
    contentId?: string;
    contentType?: string;
    batchId?: string;
    campaignId?: string;
    [key: string]: any;
  };
}

export interface NotificationPreferences {
  userId: string;
  preferences: {
    [key in NotificationType]?: {
      enabled: boolean;
      channels: NotificationChannel[];
      quietHours?: {
        start: string; // "22:00"
        end: string;   // "08:00"  
        timezone: string;
      };
      frequency?: 'immediate' | 'batched_hourly' | 'batched_daily';
    };
  };
  globalSettings: {
    doNotDisturb: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    emailDigest: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'never';
      time: string; // "09:00"
    };
  };
}

export class EnhancedNotificationService {
  private static adminDb = getAdminDb();
  private static realtimeDb: ReturnType<typeof getRealtimeDb> | null = null;

  // Moderation-related notifications BYPASS quiet hours
  // Lý do: Người dùng cần nhận thông báo kiểm duyệt NGAY LẬP TỨC
  // để có thể hành động kịp thời (sửa lỗi, xem kết quả, etc.)
  private static readonly BYPASS_QUIET_HOURS_TYPES = [
    NotificationType.PLACE_RECEIVED,
    NotificationType.PLACE_CLAIMED,
    NotificationType.PLACE_IN_REVIEW,
    NotificationType.PLACE_APPROVED,
    NotificationType.PLACE_REJECTED,
    NotificationType.REVISION_REQUESTED,
    NotificationType.EDIT_APPROVED,
    NotificationType.EDIT_REJECTED,
    NotificationType.CONTENT_ESCALATED,
  ];

  // Initialize Firebase Realtime Database
  private static getRealtimeDatabase() {
    if (!this.realtimeDb) {
      try {
        this.realtimeDb = getRealtimeDb();
      } catch (error) {
        console.error('Failed to initialize Realtime Database:', error);
        this.realtimeDb = null;
      }
    }
    return this.realtimeDb;
  }

  /**
   * CORE NOTIFICATION TEMPLATES
   */
  private static templates: { [key in NotificationType]: NotificationTemplate } = {
    [NotificationType.PLACE_SUBMITTED]: {
      type: NotificationType.PLACE_SUBMITTED,
      title: 'Địa điểm mới cần kiểm duyệt',
      body: '"{placeName}" đang chờ kiểm duyệt trong hàng đợi',
      actionUrl: '/admin/moderation/queue',
      actionText: 'Xem hàng đợi',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 7
    },

    [NotificationType.PLACE_RECEIVED]: {
      type: NotificationType.PLACE_RECEIVED,
      title: 'Địa điểm đã được tiếp nhận',
      body: '"{placeName}" đã gửi thành công. Chúng tôi sẽ kiểm duyệt trong vòng 24 giờ.',
      actionUrl: '/contribute/my-drafts/{draftId}/moderation',
      actionText: 'Xem tiến trình',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 30
    },

    [NotificationType.PLACE_CLAIMED]: {
      type: NotificationType.PLACE_CLAIMED,
      title: 'Đã được tiếp nhận xử lý',
      body: '{moderatorName} đang xử lý địa điểm "{placeName}" của bạn',
      actionUrl: '/contribute/my-drafts/{draftId}/moderation',
      actionText: 'Theo dõi',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 30
    },

    [NotificationType.PLACE_IN_REVIEW]: {
      type: NotificationType.PLACE_IN_REVIEW,
      title: 'Đang được kiểm duyệt',
      body: '{moderatorName} đang kiểm duyệt "{placeName}". Kết quả sẽ có trong thời gian sớm nhất.',
      actionUrl: '/contribute/my-drafts/{draftId}/moderation',
      actionText: 'Xem chi tiết',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 30
    },

    [NotificationType.PLACE_APPROVED]: {
      type: NotificationType.PLACE_APPROVED,
      title: 'Địa điểm đã được công khai',
      body: '"{placeName}" đã được phê duyệt. Cảm ơn bạn đã đóng góp cho cộng đồng!',
      actionUrl: '/places/{slug}',
      actionText: 'Xem địa điểm',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 30
    },

    [NotificationType.PLACE_REJECTED]: {
      type: NotificationType.PLACE_REJECTED,
      title: 'Địa điểm cần chỉnh sửa',
      body: '"{placeName}" chưa đạt tiêu chuẩn. Lý do: {reason}',
      actionUrl: '/contribute/edit/{draftId}',
      actionText: 'Chỉnh sửa ngay',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 60
    },

    [NotificationType.EDIT_REQUESTED]: {
      type: NotificationType.EDIT_REQUESTED,
      title: 'Yêu cầu chỉnh sửa địa điểm',
      body: '"{placeName}" cần được cập nhật: {reason}',
      actionUrl: '/contribute/edit/{draftId}',
      actionText: 'Chỉnh sửa',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      retentionDays: 14
    },

    [NotificationType.REVISION_REQUESTED]: {
      type: NotificationType.REVISION_REQUESTED,
      title: 'Cần chỉnh sửa bổ sung',
      body: '"{placeName}" cần điều chỉnh theo yêu cầu: {reason}',
      actionUrl: '/contribute/edit/{draftId}',
      actionText: 'Bắt đầu sửa',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 21
    },

    [NotificationType.EDIT_APPROVED]: {
      type: NotificationType.EDIT_APPROVED,
      title: 'Chỉnh sửa đã được duyệt',
      body: 'Cập nhật cho "{placeName}" đã được phê duyệt và hiển thị công khai',
      actionUrl: '/places/{slug}',
      actionText: 'Xem kết quả',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 30
    },

    [NotificationType.EDIT_REJECTED]: {
      type: NotificationType.EDIT_REJECTED,
      title: 'Chỉnh sửa chưa được chấp nhận',
      body: 'Cập nhật "{placeName}" chưa phù hợp. Lý do: {reason}',
      actionUrl: '/contribute/edit/{draftId}',
      actionText: 'Xem lại',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 30
    },

    [NotificationType.DELETION_REQUESTED]: {
      type: NotificationType.DELETION_REQUESTED,
      title: 'Yêu cầu xóa địa điểm',
      body: 'Có yêu cầu xóa địa điểm "{placeName}". Vui lòng xem xét.',
      actionUrl: '/admin/moderation/deletions/{requestId}',
      actionText: 'Xem yêu cầu',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 30
    },

    [NotificationType.DELETION_APPROVED]: {
      type: NotificationType.DELETION_APPROVED,
      title: 'Địa điểm đã được xóa',
      body: '"{placeName}" đã được xóa khỏi hệ thống theo yêu cầu của bạn',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 90
    },

    [NotificationType.DELETION_REJECTED]: {
      type: NotificationType.DELETION_REJECTED,
      title: 'Từ chối xóa địa điểm',
      body: 'Yêu cầu xóa "{placeName}" không được chấp thuận. Lý do: {reason}',
      actionUrl: '/places/{placeId}',
      actionText: 'Xem địa điểm',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 30
    },

    [NotificationType.CONTENT_CLAIMED]: {
      type: NotificationType.CONTENT_CLAIMED,
      title: 'Nội dung đã được tiếp nhận',
      body: '{moderatorName} đang kiểm duyệt "{contentName}"',
      priority: NotificationPriority.LOW,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 3
    },

    [NotificationType.CONTENT_RELEASED]: {
      type: NotificationType.CONTENT_RELEASED,
      title: 'Nội dung có thể tiếp nhận lại',
      body: '"{contentName}" đã được giải phóng khỏi hàng đợi',
      actionUrl: '/admin/moderation/queue/{itemId}',
      actionText: 'Tiếp nhận',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 1
    },

    [NotificationType.CLAIM_EXPIRING]: {
      type: NotificationType.CLAIM_EXPIRING,
      title: 'Tiếp nhận sắp hết hạn',
      body: '"{contentName}" cần xử lý trong {hoursRemaining} giờ nữa',
      actionUrl: '/admin/moderation/queue/{itemId}',
      actionText: 'Xử lý ngay',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      retentionDays: 1
    },

    [NotificationType.CLAIM_EXPIRED]: {
      type: NotificationType.CLAIM_EXPIRED,
      title: 'Tiếp nhận đã hết hạn',
      body: '"{contentName}" đã được giải phóng do hết thời gian xử lý',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 7
    },

    [NotificationType.CONTENT_ESCALATED]: {
      type: NotificationType.CONTENT_ESCALATED,
      title: 'Nội dung cần xem xét cấp cao',
      body: '"{contentName}" cần sự xem xét từ quản trị viên cấp cao',
      actionUrl: '/admin/escalations/{escalationId}',
      actionText: 'Xem ngay',
      priority: NotificationPriority.URGENT,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
      retentionDays: 30
    },

    [NotificationType.ESCALATION_ASSIGNED]: {
      type: NotificationType.ESCALATION_ASSIGNED,
      title: 'Được giao vụ việc quan trọng',
      body: 'Bạn được giao xử lý "{contentName}" với độ ưu tiên cao',
      actionUrl: '/admin/escalations/{escalationId}',
      actionText: 'Xử lý ngay',
      priority: NotificationPriority.URGENT,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      retentionDays: 14
    },

    [NotificationType.ESCALATION_RESOLVED]: {
      type: NotificationType.ESCALATION_RESOLVED,
      title: 'Vụ việc đã được giải quyết',
      body: '"{contentName}" đã được xử lý xong bởi quản trị viên',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 30
    },

    [NotificationType.CONTENT_REPORTED]: {
      type: NotificationType.CONTENT_REPORTED,
      title: 'Báo cáo nội dung mới',
      body: 'Có báo cáo về "{contentName}": {reportReason}',
      actionUrl: '/admin/moderation/reports/{reportId}',
      actionText: 'Xem báo cáo',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 30
    },

    [NotificationType.REPORT_RESOLVED]: {
      type: NotificationType.REPORT_RESOLVED,
      title: 'Báo cáo đã được xử lý',
      body: 'Báo cáo của bạn về "{contentName}" đã được kiểm tra và xử lý',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 30
    },

    [NotificationType.SYSTEM_MAINTENANCE]: {
      type: NotificationType.SYSTEM_MAINTENANCE,
      title: 'Bảo trì hệ thống',
      body: 'Hệ thống sẽ bảo trì từ {startTime} đến {endTime}. Vui lòng lưu ý.',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 3
    },

    [NotificationType.ROLE_CHANGED]: {
      type: NotificationType.ROLE_CHANGED,
      title: 'Quyền hạn đã thay đổi',
      body: 'Vai trò của bạn đã được cập nhật thành: {newRole}',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 90
    },

    [NotificationType.ACCOUNT_WARNING]: {
      type: NotificationType.ACCOUNT_WARNING,
      title: 'Cảnh báo tài khoản',
      body: 'Tài khoản của bạn có vấn đề cần chú ý: {reason}',
      actionUrl: '/profile/warnings',
      actionText: 'Xem chi tiết',
      priority: NotificationPriority.CRITICAL,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
      retentionDays: 365
    },

    // Place Actions (from report handling)
    [NotificationType.PLACE_SUSPENDED]: {
      type: NotificationType.PLACE_SUSPENDED,
      title: 'Địa điểm bị đình chỉ tạm thời',
      body: '"{placeName}" bị đình chỉ {duration}h do vi phạm: {reason}. Sẽ tự động khôi phục lúc {expiresAt}.',
      actionUrl: '/my-places/{placeId}',
      actionText: 'Xem chi tiết',
      priority: NotificationPriority.URGENT,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 90
    },

    [NotificationType.PLACE_HIDDEN]: {
      type: NotificationType.PLACE_HIDDEN,
      title: 'Địa điểm đã bị ẩn',
      body: '"{placeName}" đã bị ẩn khỏi công khai do: {reason}. Bạn có thể khiếu nại quyết định này.',
      actionUrl: '/support/appeal?placeId={placeId}&reportId={reportId}',
      actionText: 'Khiếu nại',
      priority: NotificationPriority.URGENT,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      retentionDays: 180
    },

    [NotificationType.PLACE_WARNING]: {
      type: NotificationType.PLACE_WARNING,
      title: 'Cảnh báo địa điểm',
      body: 'Địa điểm "{placeName}" có vi phạm nhẹ: {reason}. Vui lòng chỉnh sửa để tránh bị xử lý.',
      actionUrl: '/contribute/edit/{placeId}',
      actionText: 'Chỉnh sửa',
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      retentionDays: 30
    }
  };

  /**
   * Send notification với full workflow
   */
  static async sendNotification(
    recipientId: string | string[],
    type: NotificationType,
    data: any = {},
    overrides?: Partial<NotificationPayload>
  ): Promise<{
    success: boolean;
    notificationIds: string[];
    errors: string[];
  }> {
    try {
      const recipients = Array.isArray(recipientId) ? recipientId : [recipientId];
      const template = this.templates[type];
      const results = {
        success: true,
        notificationIds: [] as string[],
        errors: [] as string[]
      };

      for (const userId of recipients) {
        try {
          // 1. Get user preferences
          const preferences = await this.getUserPreferences(userId);
          const userSetting = preferences.preferences[type];

          // Check if notification type is enabled
          // If userSetting is undefined, treat as enabled by default
          if (userSetting && userSetting.enabled === false) {
            console.log(`Notification ${type} disabled for user ${userId}`);
            continue;
          }

          // Check quiet hours (BYPASS cho moderation notifications)
          const shouldBypassQuietHours = this.BYPASS_QUIET_HOURS_TYPES.includes(type);

          if (!shouldBypassQuietHours && this.isQuietHours(preferences.globalSettings.quietHours)) {
            // Queue for later unless critical
            if (template.priority !== NotificationPriority.CRITICAL) {
              console.log(`[NOTIFICATION] Skipping ${type} for user ${userId} due to quiet hours (will schedule later)`);
              await this.scheduleNotification(userId, type, data, overrides);
              continue;
            }
          }

          if (shouldBypassQuietHours) {
            console.log(`[NOTIFICATION] Bypassing quiet hours for moderation notification: ${type}`);
          }

          // 2. Build notification payload
          const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();

          const payload: NotificationPayload = {
            id: notificationId,
            type,
            priority: template.priority,
            recipientId: userId,
            recipientRole: await this.getUserRole(userId),
            title: this.interpolateTemplate(template.title, data),
            body: this.interpolateTemplate(template.body, data),
            actionUrl: template.actionUrl ? this.interpolateTemplate(template.actionUrl, data) : undefined,
            actionText: template.actionText,
            data: data,
            channels: userSetting?.channels || template.channels,
            createdAt: now,
            expiresAt: new Date(Date.now() + template.retentionDays * 24 * 60 * 60 * 1000).toISOString(),
            metadata: {
              templateUsed: type,
              senderId: data.senderId || 'system',
              contentId: data.contentId,
              contentType: data.contentType,
              ...data.metadata
            },
            ...overrides
          };

          // 3. Send to multiple channels
          await this.deliverNotification(payload);

          // 4. Store in Firestore for history
          await this.storeNotificationHistory(payload);

          results.notificationIds.push(notificationId);

        } catch (error) {
          console.error(`Error sending notification to user ${userId}:`, error);
          results.errors.push(`Failed to send to ${userId}: ${error}`);
          results.success = false;
        }
      }

      return results;

    } catch (error) {
      console.error('Fatal error in sendNotification:', error);
      return {
        success: false,
        notificationIds: [],
        errors: [`Fatal error: ${error}`]
      };
    }
  }

  /**
   * Deliver notification to appropriate channels
   */
  private static async deliverNotification(payload: NotificationPayload): Promise<void> {
    const deliveryPromises: Promise<void>[] = [];

    for (const channel of payload.channels) {
      switch (channel) {
        case NotificationChannel.IN_APP:
          deliveryPromises.push(this.sendInAppNotification(payload));
          break;
        case NotificationChannel.PUSH:
          deliveryPromises.push(this.sendPushNotification(payload));
          break;
        case NotificationChannel.EMAIL:
          deliveryPromises.push(this.sendEmailNotification(payload));
          break;
        case NotificationChannel.SMS:
          deliveryPromises.push(this.sendSMSNotification(payload));
          break;
        case NotificationChannel.WEBHOOK:
          deliveryPromises.push(this.sendWebhookNotification(payload));
          break;
      }
    }

    // Execute all deliveries in parallel
    await Promise.allSettled(deliveryPromises);
  }

  /**
   * Real-time in-app notification via Firebase Realtime Database
   */
  private static async sendInAppNotification(payload: NotificationPayload): Promise<void> {
    try {
      const realtimeDb = this.getRealtimeDatabase();
      if (!realtimeDb) {
        console.warn('Realtime Database not available, skipping real-time notification');
        return;
      }

      const userNotificationsRef = realtimeDb.ref(`notifications/${payload.recipientId}`);

      // CRITICAL FIX: Firebase Realtime Database does NOT allow undefined values
      // Filter out undefined values to prevent "set failed" errors
      const cleanData = this.removeUndefinedFields(payload.data || {});

      // Add to user's real-time notifications
      await userNotificationsRef.child(payload.id).set({
        id: payload.id,
        type: payload.type,
        priority: payload.priority,
        title: payload.title,
        body: payload.body,
        actionUrl: payload.actionUrl,
        actionText: payload.actionText,
        data: cleanData,  // ← Use cleaned data
        createdAt: payload.createdAt,
        read: false,
        dismissed: false
      });

      // Update user's unread count
      const unreadCountRef = realtimeDb.ref(`unreadCounts/${payload.recipientId}`);
      await unreadCountRef.transaction((currentCount) => (currentCount || 0) + 1);

      console.log(`✅ Sent in-app notification ${payload.id} to user ${payload.recipientId}`);

    } catch (error) {
      console.error('Error sending in-app notification:', error);
      throw error;
    }
  }

  /**
   * Push notification (Firebase Cloud Messaging)
   */
  private static async sendPushNotification(payload: NotificationPayload): Promise<void> {
    try {
      console.log(`📱 Would send push notification to ${payload.recipientId}:`, {
        title: payload.title,
        body: payload.body,
        data: payload.data
      });

    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Email notification
   */
  private static async sendEmailNotification(payload: NotificationPayload): Promise<void> {
    try {
      console.log(`📧 Would send email to ${payload.recipientId}:`, {
        subject: payload.title,
        body: payload.body,
        actionUrl: payload.actionUrl
      });

    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  /**
   * SMS notification for critical alerts
   */
  private static async sendSMSNotification(payload: NotificationPayload): Promise<void> {
    try {
      console.log(`📱 Would send SMS to ${payload.recipientId}:`, payload.body);
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }

  /**
   * Webhook notification for third-party integrations
   */
  private static async sendWebhookNotification(payload: NotificationPayload): Promise<void> {
    try {
      console.log(`🔗 Would send webhook for ${payload.recipientId}:`, payload);
    } catch (error) {
      console.error('Error sending webhook notification:', error);
      throw error;
    }
  }

  /**
   * Store notification in Firestore for history and complex queries
   */
  private static async storeNotificationHistory(payload: NotificationPayload): Promise<void> {
    try {
      // CRITICAL FIX: Firestore also doesn't allow undefined values
      // Clean payload before storing
      const cleanedPayload = {
        ...payload,
        data: this.removeUndefinedFields(payload.data || {}),
        metadata: this.removeUndefinedFields(payload.metadata || {})
      };

      await this.adminDb.collection('notification_history').doc(payload.id).set(cleanedPayload);

      // Also update user's notification summary
      const userStatsRef = this.adminDb.collection('notification_stats').doc(payload.recipientId);
      await userStatsRef.set({
        totalNotifications: FieldValue.increment(1),
        [`byType.${payload.type}`]: FieldValue.increment(1),
        [`byPriority.${payload.priority}`]: FieldValue.increment(1),
        lastNotificationAt: payload.createdAt,
        updatedAt: new Date().toISOString()
      }, { merge: true });

    } catch (error) {
      console.error('Error storing notification history:', error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Update real-time database
      const realtimeDb = this.getRealtimeDatabase();
      if (realtimeDb) {
        await realtimeDb.ref(`notifications/${userId}/${notificationId}`).update({
          read: true,
          readAt: now
        });
      }

      // Update history in Firestore
      await this.adminDb.collection('notification_history').doc(notificationId).update({
        readAt: now
      });

      // Decrement unread count
      if (realtimeDb) {
        const unreadCountRef = realtimeDb.ref(`unreadCounts/${userId}`);
        await unreadCountRef.transaction((currentCount) => Math.max((currentCount || 0) - 1, 0));
      }

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get user's notification preferences
   */
  private static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const prefsDoc = await this.adminDb.collection('user_notification_preferences').doc(userId).get();
      
      if (prefsDoc.exists) {
        return prefsDoc.data() as NotificationPreferences;
      }

      // Return default preferences
      return this.getDefaultPreferences(userId);

    } catch (error) {
      console.error('Error getting user preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Default notification preferences
   */
  private static getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      preferences: {
        [NotificationType.PLACE_RECEIVED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP]
        },
        [NotificationType.PLACE_CLAIMED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP]
        },
        [NotificationType.PLACE_IN_REVIEW]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP]
        },
        [NotificationType.PLACE_APPROVED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
        },
        [NotificationType.PLACE_REJECTED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
        },
        [NotificationType.REVISION_REQUESTED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH]
        },
        [NotificationType.EDIT_APPROVED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP]
        },
        [NotificationType.EDIT_REJECTED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
        },
        [NotificationType.CONTENT_ESCALATED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH]
        }
      },
      globalSettings: {
        doNotDisturb: false,
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "08:00",
          timezone: "Asia/Ho_Chi_Minh"
        },
        emailDigest: {
          enabled: true,
          frequency: 'daily',
          time: "09:00"
        }
      }
    };
  }

  /**
   * Helper methods
   */
  private static interpolateTemplate(template: string, data: any): string {
    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * Remove undefined fields from object (Firebase Realtime DB doesn't allow undefined)
   */
  private static removeUndefinedFields(obj: any): any {
    if (obj === null || obj === undefined) {
      return {};
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.filter(item => item !== undefined).map(item => this.removeUndefinedFields(item));
    }

    // Handle objects
    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          cleaned[key] = this.removeUndefinedFields(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  private static isQuietHours(quietHours: any): boolean {
    if (!quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.toLocaleTimeString('vi-VN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: quietHours.timezone 
    });
    
    return currentTime >= quietHours.start || currentTime <= quietHours.end;
  }

  private static async getUserRole(userId: string): Promise<string> {
    try {
      const userDoc = await this.adminDb.collection('users').doc(userId).get();
      return userDoc.exists ? userDoc.data()?.role || 'user' : 'user';
    } catch (error) {
      return 'user';
    }
  }

  private static async scheduleNotification(
    userId: string, 
    type: NotificationType, 
    data: any, 
    overrides?: any
  ): Promise<void> {
    console.log(`⏰ Scheduled notification ${type} for user ${userId} after quiet hours`);
  }

  /**
   * CONVENIENCE METHODS FOR COMMON WORKFLOWS
   */

  // Place workflow notifications
  static async notifyPlaceSubmitted(placeId: string, placeName: string, createdBy: string): Promise<void> {
    const moderators = await this.getModerators();
    await this.sendNotification(moderators, NotificationType.PLACE_SUBMITTED, {
      placeId,
      placeName,
      createdBy,
      itemId: placeId
    });
  }

  static async notifyPlaceReceived(draftId: string, placeName: string, ownerId: string): Promise<void> {
    await this.sendNotification(ownerId, NotificationType.PLACE_RECEIVED, {
      draftId,
      placeName
    });
  }

  static async notifyPlaceClaimed(
    draftId: string,
    placeName: string,
    ownerId: string,
    moderatorName: string
  ): Promise<void> {
    await this.sendNotification(ownerId, NotificationType.PLACE_CLAIMED, {
      draftId,
      placeName,
      moderatorName
    });
  }

  static async notifyPlaceInReview(
    draftId: string,
    placeName: string,
    ownerId: string,
    moderatorName: string
  ): Promise<void> {
    await this.sendNotification(ownerId, NotificationType.PLACE_IN_REVIEW, {
      draftId,
      placeName,
      moderatorName
    });
  }

  static async notifyPlaceApproved(placeId: string, placeName: string, slug: string, ownerId: string): Promise<void> {
    // Generate compound URL: /places/{slug}-{shortId}
    const placeUrl = generatePlaceUrl({ slug, name: placeName, id: placeId });

    await this.sendNotification(
      ownerId,
      NotificationType.PLACE_APPROVED,
      {
        placeId,
        placeName,
        slug
      },
      {
        actionUrl: placeUrl  // Override template URL with compound format
      }
    );
  }

  static async notifyPlaceRejected(draftId: string, placeName: string, ownerId: string, reason: string): Promise<void> {
    await this.sendNotification(ownerId, NotificationType.PLACE_REJECTED, {
      draftId,
      placeName,
      reason
    });
  }

  // Revision workflow
  static async notifyRevisionRequested(
    draftId: string,
    placeName: string,
    ownerId: string,
    reason: string
  ): Promise<void> {
    await this.sendNotification(ownerId, NotificationType.REVISION_REQUESTED, {
      draftId,
      placeName,
      reason
    });
  }

  // Edit workflow
  static async notifyEditSubmitter(
    userId: string,
    placeId: string,
    placeName: string,
    slug: string,
    draftId: string,
    status: 'approved' | 'rejected',
    reviewNotes?: string
  ): Promise<any> {
    console.log(`[NOTIFICATION] notifyEditSubmitter called:`, {
      userId,
      placeId,
      placeName,
      slug,
      draftId,
      status,
      reviewNotes
    });

    const type = status === 'approved' ? NotificationType.EDIT_APPROVED : NotificationType.EDIT_REJECTED;

    // Generate compound URL for approved edits (needs full place URL)
    const overrides = status === 'approved' ? {
      actionUrl: generatePlaceUrl({ slug, name: placeName, id: placeId })
    } : {};

    const result = await this.sendNotification(
      userId,
      type,
      {
        placeId,
        placeName,
        slug,
        draftId,
        status,
        reviewNotes,
        reason: reviewNotes // Add reason for template interpolation
      },
      overrides  // Override actionUrl for approved status
    );

    console.log(`[NOTIFICATION] notifyEditSubmitter result:`, result);
    return result;
  }

  static async notifyPlaceSubmitter(
    userId: string,
    placeId: string,
    placeName: string,
    slug: string,
    draftId: string,
    status: 'approved' | 'rejected' | 'needs_edit',
    reviewNotes?: string
  ): Promise<any> {
    console.log(`[NOTIFICATION] notifyPlaceSubmitter called:`, {
      userId,
      placeId,
      placeName,
      slug,
      draftId,
      status,
      reviewNotes
    });

    const typeMap = {
      approved: NotificationType.PLACE_APPROVED,
      rejected: NotificationType.PLACE_REJECTED,
      needs_edit: NotificationType.REVISION_REQUESTED
    };

    // Generate compound URL for approved status (needs full place URL)
    const overrides = status === 'approved' ? {
      actionUrl: generatePlaceUrl({ slug, name: placeName, id: placeId })
    } : {};

    const result = await this.sendNotification(
      userId,
      typeMap[status],
      {
        placeId,
        placeName,
        slug,
        draftId,
        status,
        reviewNotes,
        reason: reviewNotes // Add reason for template interpolation
      },
      overrides  // Override actionUrl for approved status
    );

    console.log(`[NOTIFICATION] notifyPlaceSubmitter result:`, result);
    return result;
  }

  static async notifyNewModerationItem(
    itemType: string,
    priority: 'urgent' | 'high' | 'medium' | 'low',
    itemId: string,
    submitterName: string,
    contentName: string
  ): Promise<void> {
    const moderators = await this.getModerators();
    await this.sendNotification(moderators, NotificationType.PLACE_SUBMITTED, {
      itemType,
      priority,
      itemId,
      submitterName,
      contentName,
      placeName: contentName
    });
  }

  // Escalation workflow  
  static async notifyEscalation(
    escalationId: string,
    contentName: string,
    escalatedBy: string,
    reason: string
  ): Promise<void> {
    const admins = await this.getAdmins();
    await this.sendNotification(admins, NotificationType.CONTENT_ESCALATED, {
      escalationId,
      contentName,
      escalatedBy,
      reason
    });
  }

  // Claim workflow
  static async notifyClaimExpiring(
    moderatorId: string,
    itemId: string,
    contentName: string,
    hoursRemaining: number
  ): Promise<void> {
    await this.sendNotification(moderatorId, NotificationType.CLAIM_EXPIRING, {
      itemId,
      contentName,
      hoursRemaining
    });
  }

  // Place Actions (Report Resolution)
  static async notifyPlaceSuspended(
    placeId: string,
    placeName: string,
    ownerId: string,
    reason: string,
    duration: number,
    expiresAt: string
  ): Promise<void> {
    await this.sendNotification(ownerId, NotificationType.PLACE_SUSPENDED, {
      placeId,
      placeName,
      reason,
      duration,
      expiresAt
    });
  }

  static async notifyPlaceHidden(
    placeId: string,
    placeName: string,
    ownerId: string,
    reason: string,
    reportId?: string
  ): Promise<void> {
    await this.sendNotification(ownerId, NotificationType.PLACE_HIDDEN, {
      placeId,
      placeName,
      reason,
      reportId
    });
  }

  static async notifyPlaceWarning(
    placeId: string,
    placeName: string,
    ownerId: string,
    reason: string
  ): Promise<void> {
    await this.sendNotification(ownerId, NotificationType.PLACE_WARNING, {
      placeId,
      placeName,
      reason
    });
  }

  /**
   * Get user lists for role-based notifications
   */
  private static async getModerators(): Promise<string[]> {
    try {
      const snapshot = await this.adminDb.collection('users')
        .where('role', 'in', ['moderator', 'admin'])
        .get();
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error getting moderators:', error);
      return [];
    }
  }

  private static async getAdmins(): Promise<string[]> {
    try {
      const snapshot = await this.adminDb.collection('users')
        .where('role', '==', 'admin')
        .get();
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error getting admins:', error);
      return [];
    }
  }

  /**
   * Cleanup old notifications
   */
  static async cleanupExpiredNotifications(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Remove expired notifications from Realtime Database
      const realtimeDb = this.getRealtimeDatabase();
      if (!realtimeDb) {
        console.warn('Realtime Database not available for cleanup');
        return;
      }
      const usersRef = realtimeDb.ref('notifications');
      const snapshot = await usersRef.once('value');
      
      if (snapshot.exists()) {
        const updates: any = {};
        
        snapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key;
          
          userSnapshot.forEach((notifSnapshot) => {
            const notif = notifSnapshot.val();
            
            // Remove if expired (based on notification history in Firestore)
            if (this.isExpired(notif, now)) {
              updates[`notifications/${userId}/${notifSnapshot.key}`] = null;
            }
          });
        });

        if (Object.keys(updates).length > 0) {
          await realtimeDb.ref().update(updates);
          console.log(`Cleaned up ${Object.keys(updates).length} expired real-time notifications`);
        }
      }

      // Cleanup old notification history in Firestore  
      const oldHistoryQuery = await this.adminDb.collection('notification_history')
        .where('expiresAt', '<', now)
        .limit(1000)
        .get();

      if (!oldHistoryQuery.empty) {
        const batch = this.adminDb.batch();
        oldHistoryQuery.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`Cleaned up ${oldHistoryQuery.docs.length} expired notification history records`);
      }

    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }

  private static isExpired(notification: any, currentTime: string): boolean {
    const createdAt = new Date(notification.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days default
    return expiryTime < new Date(currentTime);
  }
}
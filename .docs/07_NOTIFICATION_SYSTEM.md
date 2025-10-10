# 07. Notification System - Real-time & Multi-Channel Architecture

> **Cập nhật:** 2025-10-10
> **Trạng thái:** Production Active
> **File:** `src/lib/server/enhanced-notification-service.ts` (1200 lines)

---

## Mục Lục

- [1. Architecture Overview](#1-architecture-overview)
- [2. Notification Types](#2-notification-types)
- [3. Notification Channels](#3-notification-channels)
- [4. Notification Workflow](#4-notification-workflow)
- [5. Template System](#5-template-system)
- [6. User Preferences](#6-user-preferences)
- [7. Convenience Methods](#7-convenience-methods)
- [8. Frontend Integration](#8-frontend-integration)
- [9. Cleanup & Maintenance](#9-cleanup--maintenance)
- [10. Best Practices](#10-best-practices)

---

## 1. Architecture Overview

### Dual-Database Design

Notification system sử dụng **Firebase Realtime Database** + **Firestore** cho performance và scalability:

```
┌─────────────────────────────────────────────────────┐
│           Notification Delivery Flow                │
└─────────────────────────────────────────────────────┘

  Backend Trigger (API/Cron)
         │
         ▼
  EnhancedNotificationService.sendNotification()
         │
         ├─────────────────┬─────────────────┬──────────────┐
         ▼                 ▼                 ▼              ▼
   [In-App]          [Push]            [Email]         [SMS]
         │                 │                 │              │
         ▼                 ▼                 ▼              ▼
  Realtime DB       FCM API        Email API        SMS API
         │
         ▼
  Frontend Listens
  (Real-time updates)
         │
         ▼
  User sees notification bell update instantly


Parallel Process:
─────────────────
         │
         ▼
  Firestore History
  (for complex queries,
   reporting, audit)
```

### Why Dual Database?

| Aspect | Realtime DB | Firestore |
|--------|-------------|-----------|
| **Purpose** | Real-time delivery | History & complex queries |
| **Data Structure** | `/notifications/{userId}/{notifId}` | `notification_history/{notifId}` |
| **Query Capability** | Limited | Advanced (filters, pagination) |
| **Read Pattern** | Subscribe (listener) | Query (on-demand) |
| **Write Speed** | Instant | Fast but not real-time |
| **Best For** | Notification bell | Admin reports, analytics |
| **TTL** | 7 days (auto-cleanup) | 30-365 days (varies) |

**Key Insight:** Realtime DB for **instant delivery**, Firestore for **long-term storage**.

---

## 2. Notification Types

### 2.1. Notification Type Enum

**Total:** 30+ types organized by workflow

```typescript
export enum NotificationType {
  // Content Submission Workflow
  PLACE_SUBMITTED = 'place_submitted',     // → Moderators
  PLACE_RECEIVED = 'place_received',       // → Owner (confirmation)
  PLACE_CLAIMED = 'place_claimed',         // → Owner (moderator assigned)
  PLACE_IN_REVIEW = 'place_in_review',     // → Owner (review started)
  PLACE_APPROVED = 'place_approved',       // → Owner (success!)
  PLACE_REJECTED = 'place_rejected',       // → Owner (needs work)

  // Editing Workflow
  EDIT_REQUESTED = 'edit_requested',       // → Owner (edit needed)
  EDIT_APPROVED = 'edit_approved',         // → Owner (edit published)
  EDIT_REJECTED = 'edit_rejected',         // → Owner (edit denied)
  REVISION_REQUESTED = 'revision_requested', // → Owner (revise draft)

  // Deletion Workflow
  DELETION_REQUESTED = 'deletion_requested',   // → Moderators
  DELETION_APPROVED = 'deletion_approved',     // → Owner
  DELETION_REJECTED = 'deletion_rejected',     // → Owner

  // Moderation Workflow
  CONTENT_CLAIMED = 'content_claimed',     // → Moderators
  CONTENT_RELEASED = 'content_released',   // → Moderators
  CLAIM_EXPIRING = 'claim_expiring',       // → Moderator (SLA warning)
  CLAIM_EXPIRED = 'claim_expired',         // → Moderator

  // Escalation
  CONTENT_ESCALATED = 'content_escalated',       // → Admins
  ESCALATION_ASSIGNED = 'escalation_assigned',   // → Admin
  ESCALATION_RESOLVED = 'escalation_resolved',   // → Moderator

  // Reports
  CONTENT_REPORTED = 'content_reported',   // → Moderators
  REPORT_RESOLVED = 'report_resolved',     // → Reporter

  // Place Actions (from Report Resolution)
  PLACE_SUSPENDED = 'place_suspended',     // → Owner (temporary)
  PLACE_HIDDEN = 'place_hidden',           // → Owner (hidden)
  PLACE_WARNING = 'place_warning',         // → Owner (warning)

  // System
  SYSTEM_MAINTENANCE = 'system_maintenance', // → All users
  ROLE_CHANGED = 'role_changed',           // → User (role upgrade)
  ACCOUNT_WARNING = 'account_warning'      // → User (critical)
}
```

### 2.2. Priority Levels

```typescript
export enum NotificationPriority {
  LOW = 'low',              // Informational, can batch
  MEDIUM = 'medium',        // Standard notifications
  HIGH = 'high',            // Important, show immediately
  URGENT = 'urgent',        // Requires attention
  CRITICAL = 'critical'     // Override quiet hours, multi-channel
}
```

**Priority Behavior:**

| Priority | Quiet Hours Respected? | Auto-Show Toast? | Channels |
|----------|------------------------|------------------|----------|
| LOW | ✅ Yes (queue) | ❌ No | in_app only |
| MEDIUM | ✅ Yes (queue) | ❌ No | in_app |
| HIGH | ✅ Yes (queue) | ✅ Yes | in_app + push |
| URGENT | ❌ No (send immediately) | ✅ Yes | in_app + push + email |
| CRITICAL | ❌ No (send immediately) | ✅ Yes | in_app + push + email + SMS |

---

## 3. Notification Channels

### 3.1. Channel Types

```typescript
export enum NotificationChannel {
  IN_APP = 'in_app',      // Firebase Realtime DB → Real-time bell
  PUSH = 'push',          // Firebase Cloud Messaging (FCM)
  EMAIL = 'email',        // Email via SendGrid/AWS SES
  SMS = 'sms',           // SMS for critical alerts
  WEBHOOK = 'webhook'     // Third-party integrations
}
```

### 3.2. Channel Implementation Status

| Channel | Status | Implementation | Use Cases |
|---------|--------|----------------|-----------|
| **IN_APP** | ✅ **Production** | Firebase Realtime DB | All notifications, real-time bell |
| **PUSH** | 🚧 Placeholder | FCM (future) | Mobile app notifications |
| **EMAIL** | 🚧 Placeholder | SendGrid/AWS SES | Critical events, digests |
| **SMS** | 🚧 Placeholder | Twilio/AWS SNS | Critical alerts only |
| **WEBHOOK** | 🚧 Placeholder | HTTP POST | Third-party integrations |

**Current Focus:** IN_APP channel fully functional for production MVP.

---

## 4. Notification Workflow

### 4.1. Send Notification Flow

```typescript
// Step 1: Trigger notification (API/Cron)
await EnhancedNotificationService.sendNotification(
  recipientId,        // User ID or array of IDs
  NotificationType,   // Type from enum
  data,              // Template interpolation data
  overrides?         // Optional payload overrides
);

// Step 2: Service processes
// ├─ Get user preferences (quiet hours, channels, enabled types)
// ├─ Check quiet hours → Queue if needed (unless CRITICAL)
// ├─ Build notification payload
// ├─ Deliver to selected channels (parallel)
// │  ├─ IN_APP → Realtime DB (instant)
// │  ├─ PUSH → FCM API (if enabled)
// │  ├─ EMAIL → Email service (if enabled)
// │  └─ SMS → SMS provider (if CRITICAL)
// └─ Store in Firestore history (audit trail)
```

### 4.2. Payload Structure

```typescript
export interface NotificationPayload {
  id: string;                     // Unique ID: notif_{timestamp}_{random}
  type: NotificationType;
  priority: NotificationPriority;
  recipientId: string;
  recipientRole: string;          // For role-based filtering
  title: string;                  // Display title
  body: string;                   // Display body
  actionUrl?: string;             // Click destination
  actionText?: string;            // CTA button text
  data?: any;                     // Additional context
  channels: NotificationChannel[];
  createdAt: string;              // ISO timestamp
  scheduledFor?: string;          // For delayed notifications
  expiresAt?: string;             // Auto-cleanup time
  readAt?: string;                // Mark as read timestamp
  dismissedAt?: string;           // Dismiss timestamp
  metadata?: {
    senderId?: string;
    contentId?: string;
    contentType?: string;
    batchId?: string;
    campaignId?: string;
  };
}
```

### 4.3. Delivery Methods

#### A. In-App Notification (Realtime DB)

```typescript
// Path: /notifications/{userId}/{notificationId}
private static async sendInAppNotification(payload: NotificationPayload): Promise<void> {
  const realtimeDb = this.getRealtimeDatabase();
  const userNotificationsRef = realtimeDb.ref(`notifications/${payload.recipientId}`);

  // 1. Add notification
  await userNotificationsRef.child(payload.id).set({
    id: payload.id,
    type: payload.type,
    priority: payload.priority,
    title: payload.title,
    body: payload.body,
    actionUrl: payload.actionUrl,
    actionText: payload.actionText,
    data: payload.data,
    createdAt: payload.createdAt,
    read: false,
    dismissed: false
  });

  // 2. Increment unread count
  const unreadCountRef = realtimeDb.ref(`unreadCounts/${payload.recipientId}`);
  await unreadCountRef.transaction((currentCount) => (currentCount || 0) + 1);
}
```

**Realtime DB Structure:**
```json
{
  "notifications": {
    "user-id-123": {
      "notif-abc": {
        "id": "notif-abc",
        "type": "place_approved",
        "title": "Địa điểm đã được công khai",
        "body": "\"Vịnh Hạ Long\" đã được phê duyệt...",
        "actionUrl": "/places/vinh-ha-long",
        "read": false,
        "createdAt": "2025-10-10T10:00:00Z"
      }
    }
  },
  "unreadCounts": {
    "user-id-123": 5
  }
}
```

#### B. Store in Firestore History

```typescript
// Collection: notification_history/{notificationId}
await this.adminDb.collection('notification_history').doc(payload.id).set(payload);

// Update user stats
await this.adminDb.collection('notification_stats').doc(payload.recipientId).set({
  totalNotifications: FieldValue.increment(1),
  [`byType.${payload.type}`]: FieldValue.increment(1),
  [`byPriority.${payload.priority}`]: FieldValue.increment(1),
  lastNotificationAt: payload.createdAt,
  updatedAt: new Date().toISOString()
}, { merge: true });
```

---

## 5. Template System

### 5.1. Template Structure

```typescript
export interface NotificationTemplate {
  type: NotificationType;
  title: string;              // Template with placeholders: "{placeName}"
  body: string;               // Template with placeholders
  actionUrl?: string;         // URL with placeholders: "/places/{slug}"
  actionText?: string;        // CTA button text
  priority: NotificationPriority;
  channels: NotificationChannel[];
  retentionDays: number;      // How long to keep
}
```

### 5.2. Example Templates

#### Template 1: PLACE_RECEIVED

```typescript
{
  type: NotificationType.PLACE_RECEIVED,
  title: 'Địa điểm đã được tiếp nhận',
  body: '"{placeName}" đã gửi thành công. Chúng tôi sẽ kiểm duyệt trong vòng 24 giờ.',
  actionUrl: '/contribute/my-drafts/{draftId}/moderation',
  actionText: 'Xem tiến trình',
  priority: NotificationPriority.MEDIUM,
  channels: [NotificationChannel.IN_APP],
  retentionDays: 30
}
```

**Usage:**
```typescript
await EnhancedNotificationService.notifyPlaceReceived(
  'draft-123',
  'Vịnh Hạ Long',
  'user-456'
);

// Interpolates to:
{
  title: 'Địa điểm đã được tiếp nhận',
  body: '"Vịnh Hạ Long" đã gửi thành công. Chúng tôi sẽ kiểm duyệt trong vòng 24 giờ.',
  actionUrl: '/contribute/my-drafts/draft-123/moderation'
}
```

#### Template 2: PLACE_APPROVED

```typescript
{
  type: NotificationType.PLACE_APPROVED,
  title: 'Địa điểm đã được công khai',
  body: '"{placeName}" đã được phê duyệt. Cảm ơn bạn đã đóng góp cho cộng đồng!',
  actionUrl: '/places/{slug}',
  actionText: 'Xem địa điểm',
  priority: NotificationPriority.MEDIUM,
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  retentionDays: 30
}
```

#### Template 3: PLACE_SUSPENDED

```typescript
{
  type: NotificationType.PLACE_SUSPENDED,
  title: 'Địa điểm bị đình chỉ tạm thời',
  body: '"{placeName}" bị đình chỉ {duration}h do vi phạm: {reason}. Sẽ tự động khôi phục lúc {expiresAt}.',
  actionUrl: '/my-places/{placeId}',
  actionText: 'Xem chi tiết',
  priority: NotificationPriority.URGENT,
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  retentionDays: 90
}
```

**Usage:**
```typescript
await EnhancedNotificationService.notifyPlaceSuspended(
  'place-789',
  'Địa điểm ABC',
  'user-456',
  'Thông tin không chính xác',
  48,
  '2025-10-12T10:00:00Z'
);

// Interpolates to:
{
  body: '"Địa điểm ABC" bị đình chỉ 48h do vi phạm: Thông tin không chính xác. Sẽ tự động khôi phục lúc 2025-10-12T10:00:00Z.'
}
```

### 5.3. Template Interpolation

```typescript
private static interpolateTemplate(template: string, data: any): string {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    return data[key] || match;  // Fallback to {placeholder} if key not found
  });
}
```

**Example:**
```typescript
interpolateTemplate(
  '"{placeName}" đã được phê duyệt',
  { placeName: 'Vịnh Hạ Long' }
);
// → "Vịnh Hạ Long" đã được phê duyệt
```

---

## 6. User Preferences

### 6.1. Preferences Structure

```typescript
export interface NotificationPreferences {
  userId: string;
  preferences: {
    [NotificationType.PLACE_APPROVED]: {
      enabled: boolean;
      channels: NotificationChannel[];
      quietHours?: {
        start: string;      // "22:00"
        end: string;        // "08:00"
        timezone: string;   // "Asia/Ho_Chi_Minh"
      };
      frequency?: 'immediate' | 'batched_hourly' | 'batched_daily';
    };
    // ... other types
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
      time: string;  // "09:00"
    };
  };
}
```

### 6.2. Default Preferences

```typescript
{
  preferences: {
    [NotificationType.PLACE_RECEIVED]: {
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
}
```

### 6.3. Quiet Hours Logic

```typescript
private static isQuietHours(quietHours: any): boolean {
  if (!quietHours.enabled) return false;

  const now = new Date();
  const currentTime = now.toLocaleTimeString('vi-VN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: quietHours.timezone
  });

  // Check if current time falls in quiet hours range
  return currentTime >= quietHours.start || currentTime <= quietHours.end;
}
```

**Behavior:**
- If quiet hours: Queue notification for later (unless CRITICAL priority)
- CRITICAL priority: Always send immediately (override quiet hours)

---

## 7. Convenience Methods

### 7.1. Place Workflow Methods

#### notifyPlaceReceived()
```typescript
static async notifyPlaceReceived(
  draftId: string,
  placeName: string,
  ownerId: string
): Promise<void>;
```

**When to use:** Ngay sau khi user submit draft for moderation

**Example:**
```typescript
// In API: POST /api/places/drafts/[id]/submit
await EnhancedNotificationService.notifyPlaceReceived(
  draftId,
  placeData.name,
  user.id
);
```

#### notifyPlaceClaimed()
```typescript
static async notifyPlaceClaimed(
  draftId: string,
  placeName: string,
  ownerId: string,
  moderatorName: string
): Promise<void>;
```

**When to use:** Khi moderator claim item trong queue

**Example:**
```typescript
// In API: PUT /api/moderation/queue/[itemId] (action: claim)
await EnhancedNotificationService.notifyPlaceClaimed(
  itemData.contentId,
  itemData.metadata.title,
  itemData.submittedBy,
  user.fullName
);
```

#### notifyPlaceInReview()
```typescript
static async notifyPlaceInReview(
  draftId: string,
  placeName: string,
  ownerId: string,
  moderatorName: string
): Promise<void>;
```

**When to use:** Khi moderator bắt đầu review (action: start_review)

#### notifyPlaceApproved()
```typescript
static async notifyPlaceApproved(
  placeId: string,
  placeName: string,
  slug: string,
  ownerId: string
): Promise<void>;
```

**When to use:** Khi moderator approve place (action: approve)

**Example:**
```typescript
// In API: PUT /api/moderation/queue/[itemId] (action: approve)
await EnhancedNotificationService.notifyPlaceApproved(
  place.id,
  place.name,
  place.slug,
  submitterId
);
```

#### notifyPlaceRejected()
```typescript
static async notifyPlaceRejected(
  draftId: string,
  placeName: string,
  ownerId: string,
  reason: string
): Promise<void>;
```

**When to use:** Khi moderator reject place (action: reject)

#### notifyRevisionRequested()
```typescript
static async notifyRevisionRequested(
  draftId: string,
  placeName: string,
  ownerId: string,
  reason: string
): Promise<void>;
```

**When to use:** Khi moderator request edit (action: request_edit)

---

### 7.2. Edit Workflow Methods

#### notifyEditSubmitter()
```typescript
static async notifyEditSubmitter(
  userId: string,
  placeId: string,
  placeName: string,
  slug: string,
  draftId: string,
  status: 'approved' | 'rejected',
  reviewNotes?: string
): Promise<any>;
```

**When to use:** Khi edit request được approve/reject

---

### 7.3. Report & Suspension Methods

#### notifyPlaceSuspended()
```typescript
static async notifyPlaceSuspended(
  placeId: string,
  placeName: string,
  ownerId: string,
  reason: string,
  duration: number,      // Hours
  expiresAt: string      // ISO timestamp
): Promise<void>;
```

**When to use:** Khi admin/moderator suspend place tạm thời

**Example:**
```typescript
await EnhancedNotificationService.notifyPlaceSuspended(
  placeId,
  place.name,
  place.createdBy,
  'Thông tin không chính xác',
  48,  // 48 hours
  new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
);
```

#### notifyPlaceHidden()
```typescript
static async notifyPlaceHidden(
  placeId: string,
  placeName: string,
  ownerId: string,
  reason: string,
  reportId?: string
): Promise<void>;
```

**When to use:** Khi admin/moderator hide place (permanent hoặc pending appeal)

#### notifyPlaceWarning()
```typescript
static async notifyPlaceWarning(
  placeId: string,
  placeName: string,
  ownerId: string,
  reason: string
): Promise<void>;
```

**When to use:** Khi admin/moderator issue warning (soft warning, no action)

---

### 7.4. Escalation Methods

#### notifyEscalation()
```typescript
static async notifyEscalation(
  escalationId: string,
  contentName: string,
  escalatedBy: string,
  reason: string
): Promise<void>;
```

**When to use:** Khi moderator escalate item lên admin

**Recipient:** All admins (via `getAdmins()`)

---

### 7.5. Role-Based Notification Methods

#### notifyNewModerationItem()
```typescript
static async notifyNewModerationItem(
  itemType: string,
  priority: 'urgent' | 'high' | 'medium' | 'low',
  itemId: string,
  submitterName: string,
  contentName: string
): Promise<void>;
```

**Recipient:** All moderators (via `getModerators()`)

---

## 8. Frontend Integration

### 8.1. Real-time Listener Hook

**File:** `src/hooks/use-realtime-notifications.ts`

```typescript
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

function NotificationBell() {
  const {
    notifications,     // RealtimeNotification[]
    unreadCount,       // number
    isConnected,       // boolean
    markAsRead,        // (notificationId: string) => Promise<void>
    markAllAsRead      // () => Promise<void>
  } = useRealtimeNotifications();

  return (
    <div>
      <BellIcon count={unreadCount} />
      {notifications.slice(0, 10).map(notif => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onRead={() => markAsRead(notif.id)}
        />
      ))}
    </div>
  );
}
```

**How it works:**
```typescript
// Hook subscribes to Firebase Realtime DB
useEffect(() => {
  const unsubscribe = RealtimeService.subscribeToNotifications(
    user.id,
    (notificationsList: RealtimeNotification[]) => {
      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => !n.read).length);

      // Show toast for high-priority new notifications
      const newHighPriority = notificationsList.filter(
        n => !n.read && n.priority === 'high' &&
        Date.now() - n.timestamp < 30000
      );

      newHighPriority.forEach(notif => {
        toast.info(notif.message, notif.title);
      });
    }
  );

  return unsubscribe;
}, [user.id]);
```

---

### 8.2. Notification Bell Component

**File:** `src/components/notifications/notification-bell.tsx`

**Features:**
- ✅ Real-time badge count
- ✅ Dropdown với last 10 notifications
- ✅ Mark as read on click
- ✅ "Xem tất cả" link to `/notifications`
- ✅ Connection status indicator

**UI States:**
```typescript
{!isConnected && <OfflineIndicator />}
<BellIcon />
{unreadCount > 0 && <Badge>{unreadCount}</Badge>}

<Dropdown>
  <button onClick={markAllAsRead}>Đánh dấu tất cả đã đọc</button>
  {notifications.map(notif => (
    <NotificationItem
      notification={notif}
      onClick={() => {
        markAsRead(notif.id);
        router.push(notif.actionUrl);
      }}
    />
  ))}
  <Link href="/notifications">Xem tất cả</Link>
</Dropdown>
```

---

### 8.3. Full Notifications Page

**File:** `src/app/notifications/page.tsx`

**Features:**
- ✅ Paginated notification list
- ✅ Filter by type/priority
- ✅ Mark as read/unread
- ✅ Dismiss notifications
- ✅ Search by content

**Example:**
```typescript
function NotificationsPage() {
  const { notifications, unreadCount } = useRealtimeNotifications();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <div>
      <Header>
        <h1>Thông báo ({unreadCount})</h1>
        <FilterDropdown value={filter} onChange={setFilter}>
          <option value="all">Tất cả</option>
          <option value="unread">Chưa đọc</option>
        </FilterDropdown>
      </Header>

      <NotificationList notifications={filteredNotifications} />
    </div>
  );
}
```

---

### 8.4. Toast Integration

**Automatic Toast for High-Priority Notifications:**

```typescript
// In useRealtimeNotifications hook
const newHighPriorityNotifications = notificationsList.filter(
  n => !n.read && n.priority === 'high' &&
  Date.now() - (n.timestamp || new Date(n.createdAt).getTime()) < 30000
);

newHighPriorityNotifications.forEach(notification => {
  const notificationType = notification.type.includes('approved') ? 'success' :
                          notification.type.includes('rejected') ? 'error' : 'info';

  toast[notificationType](notification.message, notification.title, {
    persistent: true,
    duration: 8000
  });
});
```

---

## 9. Cleanup & Maintenance

### 9.1. Expired Notification Cleanup

**Method:** `cleanupExpiredNotifications()`

**Purpose:** Remove old notifications to prevent database bloat

**Schedule:** Daily via cron job

**Logic:**
```typescript
static async cleanupExpiredNotifications(): Promise<void> {
  // 1. Remove expired from Realtime DB
  const realtimeDb = this.getRealtimeDatabase();
  const usersRef = realtimeDb.ref('notifications');
  const snapshot = await usersRef.once('value');

  snapshot.forEach((userSnapshot) => {
    userSnapshot.forEach((notifSnapshot) => {
      const notif = notifSnapshot.val();

      // Check if expired (7 days default)
      if (this.isExpired(notif, now)) {
        updates[`notifications/${userId}/${notifSnapshot.key}`] = null;
      }
    });
  });

  // 2. Remove expired from Firestore history
  const oldHistoryQuery = await this.adminDb.collection('notification_history')
    .where('expiresAt', '<', now)
    .limit(1000)
    .get();

  const batch = this.adminDb.batch();
  oldHistoryQuery.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
```

**Cron Setup:**
```typescript
// File: src/app/api/cron/cleanup-notifications/route.ts
export async function POST(request: NextRequest) {
  await EnhancedNotificationService.cleanupExpiredNotifications();
  return NextResponse.json({ success: true });
}
```

**Vercel Cron:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-notifications",
      "schedule": "0 2 * * *"  // Daily at 2 AM
    }
  ]
}
```

---

### 9.2. Retention Policy

| Notification Type | Retention Period | Reason |
|-------------------|------------------|--------|
| PLACE_APPROVED | 30 days | Historical reference |
| PLACE_REJECTED | 60 days | Allow time for revision |
| PLACE_SUSPENDED | 90 days | Legal/audit requirement |
| PLACE_HIDDEN | 180 days | Appeal period |
| ACCOUNT_WARNING | 365 days | Compliance |
| LOW priority | 7 days | Informational only |

**Implementation:**
```typescript
// In template definition
{
  type: NotificationType.PLACE_APPROVED,
  retentionDays: 30,  // Auto-cleanup after 30 days
  // ...
}
```

---

## 10. Best Practices

### 10.1. When to Send Notifications

**✅ DO send notifications for:**
- User-facing state changes (approved, rejected, claimed)
- Important deadlines (claim expiring, suspension ending)
- Critical issues (account warning, security alert)
- User-requested updates (digest, followed content)

**❌ DON'T send notifications for:**
- Background system operations
- Debug/development events
- Redundant state updates (already notified)
- Low-value informational changes

---

### 10.2. Notification Timing

**✅ Best Practices:**
```typescript
// 1. Send immediately for critical events
await EnhancedNotificationService.sendNotification(
  userId,
  NotificationType.ACCOUNT_WARNING,
  data,
  { priority: NotificationPriority.CRITICAL }  // Override quiet hours
);

// 2. Respect quiet hours for low-priority
await EnhancedNotificationService.sendNotification(
  userId,
  NotificationType.CONTENT_CLAIMED,
  data
  // Will be queued if during quiet hours
);

// 3. Batch notifications for bulk operations
const userIds = ['user1', 'user2', 'user3'];
await EnhancedNotificationService.sendNotification(
  userIds,  // Send to multiple users
  NotificationType.SYSTEM_MAINTENANCE,
  { startTime: '2025-10-15 02:00', endTime: '2025-10-15 04:00' }
);
```

---

### 10.3. Template Data Validation

**✅ Always provide all placeholders:**
```typescript
// Template: '"{placeName}" đã được phê duyệt'
await EnhancedNotificationService.notifyPlaceApproved(
  place.id,
  place.name,  // ✅ Provides {placeName}
  place.slug,  // ✅ Provides {slug}
  submitterId
);

// If missing:
await EnhancedNotificationService.sendNotification(userId, type, {
  // ❌ Missing placeName → Shows "{placeName}" literally
});
```

---

### 10.4. Error Handling

**✅ Notifications should NEVER block main operations:**
```typescript
// In API endpoint
try {
  // Main operation
  await updatePlace(placeId, data);

  // Notification - wrap in try/catch
  try {
    await EnhancedNotificationService.notifyPlaceApproved(...);
  } catch (notifError) {
    console.error('Failed to send notification:', notifError);
    // Continue - don't fail the main operation
  }

  return NextResponse.json({ success: true });
} catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

---

### 10.5. Testing Notifications

**Development Testing:**
```typescript
// Create test notification
await EnhancedNotificationService.sendNotification(
  'test-user-id',
  NotificationType.PLACE_APPROVED,
  {
    placeId: 'test-place',
    placeName: 'Test Place',
    slug: 'test-place'
  },
  {
    // Override for testing
    channels: [NotificationChannel.IN_APP],  // Only in-app for dev
    priority: NotificationPriority.HIGH      // Force immediate delivery
  }
);

// Check Realtime DB
// Path: /notifications/test-user-id/
```

**Production Monitoring:**
```typescript
// Check notification stats
const stats = await adminDb.collection('notification_stats')
  .doc(userId)
  .get();

console.log(stats.data());
// {
//   totalNotifications: 125,
//   byType: {
//     place_approved: 10,
//     place_rejected: 5,
//     ...
//   },
//   byPriority: {
//     high: 15,
//     medium: 100,
//     low: 10
//   },
//   lastNotificationAt: "2025-10-10T10:00:00Z"
// }
```

---

### 10.6. Performance Optimization

**✅ Parallel Delivery:**
```typescript
// Service delivers to all channels in parallel
await Promise.allSettled([
  sendInAppNotification(payload),
  sendPushNotification(payload),
  sendEmailNotification(payload)
]);
// Doesn't wait for each channel sequentially
```

**✅ Batch Writes:**
```typescript
// For bulk operations
const moderators = await getModerators();  // Get once
await sendNotification(
  moderators,  // Array of user IDs
  NotificationType.PLACE_SUBMITTED,
  data
);
// Service handles batch processing
```

---

## 11. API Integration Examples

### Example 1: Place Submission

```typescript
// File: src/app/api/places/drafts/[draftId]/submit/route.ts
export async function POST(request: NextRequest, { params }: { params: { draftId: string } }) {
  // 1. Submit draft
  await updateDraft(params.draftId, { status: 'submitted' });

  // 2. Add to moderation queue
  const queueItem = await addToModerationQueue({...});

  // 3. Send notification
  await EnhancedNotificationService.notifyPlaceReceived(
    params.draftId,
    draftData.name,
    user.id
  );

  // 4. Notify moderators
  await EnhancedNotificationService.notifyNewModerationItem(
    'new_place',
    'medium',
    queueItem.id,
    user.fullName,
    draftData.name
  );

  return NextResponse.json({ success: true });
}
```

---

### Example 2: Moderation Action

```typescript
// File: src/app/api/moderation/queue/[itemId]/route.ts
export async function PUT(request: NextRequest, { params }: { params: { itemId: string } }) {
  const { action, reviewNotes } = await request.json();

  if (action === 'approve') {
    // 1. Approve place
    await updatePlace(itemData.contentId, { status: 'published' });

    // 2. Send notification
    await EnhancedNotificationService.notifyPlaceApproved(
      itemData.contentId,
      itemData.metadata.title,
      placeData.slug,
      itemData.submittedBy
    );
  } else if (action === 'reject') {
    // 1. Reject place
    await updatePlace(itemData.contentId, { status: 'rejected' });

    // 2. Send notification
    await EnhancedNotificationService.notifyPlaceRejected(
      itemData.contentId,
      itemData.metadata.title,
      itemData.submittedBy,
      reviewNotes
    );
  }

  return NextResponse.json({ success: true });
}
```

---

### Example 3: Report Resolution

```typescript
// File: src/app/api/admin/reports/[reportId]/resolve-with-action/route.ts
export async function POST(request: NextRequest, { params }: { params: { reportId: string } }) {
  const { action, notes } = await request.json();

  if (action === 'suspend_place') {
    // 1. Suspend place
    await updatePlace(reportData.contentId, {
      status: 'suspended',
      suspensionExpiresAt: expiresAt
    });

    // 2. Send notification
    await EnhancedNotificationService.notifyPlaceSuspended(
      reportData.contentId,
      placeData.name,
      placeData.createdBy,
      notes,
      48,  // duration hours
      expiresAt
    );
  } else if (action === 'hide_place') {
    // 1. Hide place
    await updatePlace(reportData.contentId, { status: 'hidden' });

    // 2. Send notification
    await EnhancedNotificationService.notifyPlaceHidden(
      reportData.contentId,
      placeData.name,
      placeData.createdBy,
      notes,
      params.reportId
    );
  }

  return NextResponse.json({ success: true });
}
```

---

## 12. Future Enhancements

### 12.1. Push Notifications (FCM)

**Status:** 🚧 Placeholder

**Implementation Plan:**
```typescript
// 1. Get user FCM token
const fcmToken = await getUserFCMToken(userId);

// 2. Send via Firebase Cloud Messaging
const message = {
  token: fcmToken,
  notification: {
    title: payload.title,
    body: payload.body
  },
  data: {
    actionUrl: payload.actionUrl,
    notificationId: payload.id
  },
  android: {
    priority: 'high'
  },
  apns: {
    headers: {
      'apns-priority': '10'
    }
  }
};

await admin.messaging().send(message);
```

---

### 12.2. Email Notifications

**Status:** 🚧 Placeholder

**Provider Options:**
- SendGrid
- AWS SES
- Mailgun

**Implementation:**
```typescript
import sgMail from '@sendgrid/mail';

const msg = {
  to: userEmail,
  from: 'noreply@dulichviet.com',
  subject: payload.title,
  html: renderEmailTemplate(payload)
};

await sgMail.send(msg);
```

---

### 12.3. Email Digest

**Status:** 🚧 Planned

**Concept:** Batch multiple notifications into daily/weekly digest

**Implementation:**
```typescript
// Cron job: Send digest at 9 AM daily
export async function POST() {
  const users = await getUsersWithDigestEnabled();

  for (const user of users) {
    const notifications = await getUnsentNotifications(user.id, 'last_24_hours');
    if (notifications.length === 0) continue;

    await sendEmailDigest(user.email, {
      summary: groupNotificationsByType(notifications),
      unreadCount: notifications.filter(n => !n.read).length,
      ctaUrl: 'https://dulichviet.com/notifications'
    });

    // Mark as included in digest
    await markNotificationsAsSent(notifications.map(n => n.id));
  }
}
```

---

**END OF NOTIFICATION SYSTEM DOCUMENTATION**

**Total Notification Types:** 30+
**Active Channels:** 1 (IN_APP - Realtime DB)
**Planned Channels:** 4 (PUSH, EMAIL, SMS, WEBHOOK)
**Last Updated:** 2025-10-10
**Maintained By:** Development Team

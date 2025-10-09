# Tính Năng Quan Trọng - Du Lịch Việt

> **Phiên bản:** 3.0.0
> **Ngày cập nhật:** Tháng 10, 2025

---

## Mục Lục

1. [Place Management System](#1-place-management-system)
2. [Content Moderation Workflow](#2-content-moderation-workflow)
3. [Review & Rating System](#3-review--rating-system)
4. [Real-time Notification System](#4-real-time-notification-system)
5. [AI Features](#5-ai-features)
6. [View Tracking & Analytics](#6-view-tracking--analytics)
7. [User Role System](#7-user-role-system)
8. [Admin Dashboard](#8-admin-dashboard)
9. [PWA Features](#9-pwa-features)
10. [Search & Discovery](#10-search--discovery)

---

## 1. Place Management System

### 1.1. Tổng Quan

Hệ thống quản lý địa điểm là **core feature** của Du Lịch Việt, cho phép cộng đồng tạo, chỉnh sửa và chia sẻ thông tin về địa điểm du lịch khắp Việt Nam.

### 1.2. Place Lifecycle

```
┌────────────┐
│   Draft    │  User creates place
└─────┬──────┘
      │ Submit for review
      ▼
┌────────────┐
│ Submitted  │  Waiting in moderation queue
└─────┬──────┘
      │ Moderator reviews
      ▼
┌────────────┐
│ In Review  │  Being actively reviewed
└─────┬──────┘
      │
      ├──> Approve ──> Published (Public)
      ├──> Reject ───> Rejected (với lý do)
      └──> Request Edit ──> Needs Revision (về Draft)
```

### 1.3. Place Data Structure

```typescript
interface Place {
  // Basic Info
  name: string;                  // "Vịnh Hạ Long"
  slug: string;                  // "vinh-ha-long-quang-ninh"
  description: string;           // Rich text description

  // Location
  province: string;              // "Quảng Ninh"
  district?: string;             // "Hạ Long"
  ward?: string;                 // Optional
  address: string;               // Full address
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Classification
  region: 'bac-bo' | 'trung-bo' | 'nam-bo';
  type: 'bien' | 'nui' | 'van-hoa' | 'am-thuc' | 'check-in';

  // Media
  images: PlaceImage[];          // Primary + additional images
  videos?: string[];             // YouTube/Vimeo URLs

  // Details
  openingHours?: {
    monday: string;
    tuesday: string;
    // ... other days
  };
  entryFee?: {
    adult?: number;
    child?: number;
    note?: string;
  };
  facilities: string[];          // ["Bãi đỗ xe", "Nhà vệ sinh", "Wifi"]
  bestTimeToVisit?: string;      // "Tháng 3-5, 9-11"

  // Status
  status: 'draft' | 'submitted' | 'in_review' | 'published' | 'rejected';

  // Ownership
  createdBy: string;             // User ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;

  // Stats
  viewCount: number;
  stats: {
    totalReviews: number;
    averageRating: number;
    totalSaves: number;
    totalLikes: number;
  };

  // Trust
  trustLabel: 'community' | 'contributor' | 'partner' | 'verified';
}
```

### 1.4. Create Place Flow

#### 1.4.1. Form UI
```
┌─────────────────────────────────────────────┐
│          Tạo Địa Điểm Mới                    │
├─────────────────────────────────────────────┤
│                                             │
│  Thông Tin Cơ Bản:                          │
│  ┌───────────────────────────────────────┐  │
│  │ Tên địa điểm *                        │  │
│  │ [________________________]            │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Mô tả chi tiết *                      │  │
│  │ [                                     ]│  │
│  │ [  Rich text editor with formatting  ]│  │
│  │ [                                     ]│  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Vị Trí:                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Tỉnh/TP  │ │ Quận/Huyện│ │ Phường/Xã│   │
│  │ [____v]  │ │ [____v]   │ │ [____v]  │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Địa chỉ chi tiết                      │  │
│  │ [________________________]            │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Phân Loại:                                 │
│  ┌──────────┐ ┌──────────┐                 │
│  │ Vùng     │ │ Loại hình│                 │
│  │ [Bắc Bộ v]  [Biển  v]  │                 │
│  └──────────┘ └──────────┘                 │
│                                             │
│  Hình Ảnh: (Tối đa 10 ảnh)                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ [+] │ │ IMG │ │ IMG │ │ IMG │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│                                             │
│  Thông Tin Bổ Sung: (Optional)              │
│  ┌───────────────────────────────────────┐  │
│  │ Giờ mở cửa                            │  │
│  │ Giá vé                                │  │
│  │ Tiện ích                              │  │
│  │ Thời điểm lý tưởng                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [Lưu nháp]  [Gửi kiểm duyệt]              │
└─────────────────────────────────────────────┘
```

#### 1.4.2. Validation Rules

```typescript
const PlaceSchema = z.object({
  name: z.string()
    .min(3, 'Tên phải có ít nhất 3 ký tự')
    .max(100, 'Tên không quá 100 ký tự'),

  description: z.string()
    .min(50, 'Mô tả phải có ít nhất 50 ký tự')
    .max(5000, 'Mô tả không quá 5000 ký tự'),

  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),

  region: z.enum(['bac-bo', 'trung-bo', 'nam-bo']),

  type: z.enum(['bien', 'nui', 'van-hoa', 'am-thuc', 'check-in']),

  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    isPrimary: z.boolean()
  }))
  .min(1, 'Phải có ít nhất 1 hình ảnh')
  .max(10, 'Tối đa 10 hình ảnh'),

  address: z.string().min(10, 'Địa chỉ phải có ít nhất 10 ký tự'),

  // Optional fields
  entryFee: z.object({
    adult: z.number().optional(),
    child: z.number().optional(),
    note: z.string().optional()
  }).optional()
});
```

#### 1.4.3. Image Upload

**Upload Flow:**
```
User selects image(s)
  ↓
Client validates:
  - File type (JPG, PNG, WebP)
  - File size (max 5MB)
  - Image dimensions (min 800x600)
  ↓
Upload to Firebase Storage:
  Path: places/images/{userId}/{uuid}.{ext}
  ↓
Get download URL
  ↓
Add to images array in form
```

**Upload Code:**
```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadPlaceImage(file: File, userId: string) {
  // Validate
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Chỉ chấp nhận JPG, PNG, WebP');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Kích thước file không quá 5MB');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuid()}.${fileExt}`;
  const filePath = `places/images/${userId}/${fileName}`;

  // Upload
  const storage = getStorage();
  const storageRef = ref(storage, filePath);
  const snapshot = await uploadBytes(storageRef, file);

  // Get URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return {
    url: downloadURL,
    fileName: fileName,
    size: file.size
  };
}
```

### 1.5. Edit Place Flow

**Ownership Rules:**
- **Creator** can edit their own drafts
- **Creator** CANNOT edit published places (must request edit)
- **Moderator/Admin** can edit any place

**Request Edit Flow:**
```
User clicks "Yêu cầu chỉnh sửa" on published place
  ↓
POST /api/places/[id]/request-edit
  ↓
Creates edit_draft:
  - Copy current place data
  - status: 'draft'
  - originalPlaceId: place.id
  ↓
User edits draft
  ↓
Submit for review
  ↓
Moderator approves → Merge to original place
```

### 1.6. Delete Place

**Soft Delete:**
```typescript
// Không xóa hẳn, chỉ đổi status
await db.collection('places').doc(placeId).update({
  status: 'deleted',
  deletedAt: new Date(),
  deletedBy: user.id
});

// Có thể restore trong 30 ngày
```

**Hard Delete (Admin only):**
```typescript
// Xóa hẳn document + images trên Storage
await db.collection('places').doc(placeId).delete();
// + delete all images from Storage
```

---

## 2. Content Moderation Workflow

### 2.1. Workflow V2.0 (State Machine)

**4-Step State Machine:**
```
pending → claimed → in_review → approved/rejected/needs_revision
(chờ)    (tiếp nhận) (đang duyệt)  (quyết định)
```

**Why State Machine?**
- ✅ **Prevent race conditions**: Không thể skip states
- ✅ **Clear ownership**: Biết ai đang review item nào
- ✅ **SLA tracking**: Đo thời gian ở mỗi state
- ✅ **Audit trail**: Log mọi state transitions

### 2.2. Priority Queue System

**Priority Levels:**
1. **Urgent** (Red) - Partner submissions, escalated items
2. **High** (Orange) - Contributor submissions, reports
3. **Medium** (Yellow) - Regular traveler submissions
4. **Low** (Green) - First-time submitters

**Priority Calculation:**
```typescript
function calculatePriority(item: ModerationQueueItem): Priority {
  const submitterRole = item.submitterRole;

  if (item.escalated) return 'urgent';

  switch (submitterRole) {
    case 'partner':
      return 'high';
    case 'contributor':
      return 'medium';
    case 'traveler':
      return 'low';
    default:
      return 'low';
  }
}
```

**Sort Order:**
```typescript
// Priority DESC, then submittedAt ASC (FIFO within priority)
const q = query(
  moderationQueueRef,
  where('status', '==', 'pending'),
  orderBy('priority', 'desc'),
  orderBy('submittedAt', 'asc')
);
```

### 2.3. Claim Mechanism

**Why Claim?**
- Prevent multiple moderators reviewing same item
- Track who's working on what
- Auto-release if moderator abandons (2h timeout)

**Claim Flow:**
```
Moderator clicks "Tiếp nhận"
  ↓
POST /api/moderation/queue/[itemId]?action=claim
  ↓
Update item:
  status: 'pending' → 'claimed'
  claimedBy: moderator.id
  claimedAt: now
  claimExpiresAt: now + 2 hours
  ↓
Lock item for this moderator
```

**Auto-Release (Cron Job):**
```typescript
// Every 30 minutes
export async function cleanupExpiredClaims() {
  const now = new Date();

  const snapshot = await db.collection('moderation_queue')
    .where('status', '==', 'claimed')
    .where('claimExpiresAt', '<', now)
    .get();

  // Use transactions to prevent race conditions
  for (const doc of snapshot.docs) {
    await db.runTransaction(async (transaction) => {
      const freshDoc = await transaction.get(doc.ref);

      // Recheck condition inside transaction
      if (freshDoc.data().status !== 'claimed') return;
      if (freshDoc.data().claimExpiresAt >= now) return;

      // Release claim
      transaction.update(doc.ref, {
        status: 'pending',
        claimedBy: FieldValue.delete(),
        claimedAt: FieldValue.delete(),
        claimExpiresAt: FieldValue.delete()
      });
    });
  }
}
```

### 2.4. Review Actions

#### Action 1: Start Review
```
Moderator clicks "Bắt đầu kiểm duyệt"
  ↓
POST /api/moderation/queue/[itemId]?action=start_review
  ↓
Update item:
  status: 'claimed' → 'in_review'
  claimExpiresAt: DELETE (no longer needed)
  ↓
Official review starts
```

#### Action 2: Approve
```
Moderator clicks "Duyệt"
  ↓
POST /api/moderation/queue/[itemId]?action=approve
  ↓
Update place:
  status: 'submitted' → 'published'
  publishedAt: now
  ↓
Update queue item:
  status: 'in_review' → 'approved'
  reviewedBy: moderator.id
  reviewedAt: now
  ↓
Send notification:
  type: 'PLACE_APPROVED'
  actionUrl: /places/{slug}
```

#### Action 3: Reject
```
Moderator clicks "Từ chối" + enters reason
  ↓
POST /api/moderation/queue/[itemId]?action=reject
Body: { reason: "..." }
  ↓
Update place:
  status: 'submitted' → 'rejected'
  rejectionReason: reason
  rejectedAt: now
  ↓
Update queue item:
  status: 'in_review' → 'rejected'
  reviewedBy: moderator.id
  reviewedAt: now
  reviewNotes: reason
  ↓
Send notification:
  type: 'PLACE_REJECTED'
  body: reason
  actionUrl: /contribute/edit/{draftId}
```

#### Action 4: Request Revision
```
Moderator clicks "Yêu cầu sửa" + enters feedback
  ↓
POST /api/moderation/queue/[itemId]?action=request_edit
Body: { feedback: "..." }
  ↓
Update place:
  status: 'submitted' → 'draft'
  moderatorFeedback: feedback
  ↓
Update queue item:
  status: 'in_review' → 'needs_revision'
  reviewNotes: feedback
  ↓
Send notification:
  type: 'REVISION_REQUESTED'
  body: feedback
  actionUrl: /contribute/edit/{draftId}
```

### 2.5. Escalation System

**When to Escalate?**
- Moderator không chắc chắn về quyết định
- Content vi phạm guidelines nghiêm trọng
- Cần opinion từ Admin

**Escalate Flow:**
```
Moderator clicks "Chuyển lên Admin"
  ↓
POST /api/moderation/queue/[itemId]?action=escalate
Body: { reason: "..." }
  ↓
Update queue item:
  escalated: true
  escalatedBy: moderator.id
  escalatedAt: now
  escalatedReason: reason
  priority: 'urgent'
  status: 'pending' (back to queue for Admin)
  ↓
Send notification to Admin:
  type: 'ITEM_ESCALATED'
  actionUrl: /admin/moderation/queue/{itemId}
```

**Important:**
- Only **Moderators** can escalate (not Admins)
- Admin automatically has full permissions

### 2.6. Auto-Archive

**Why Archive?**
- Giữ moderation queue clean
- Retain historical data for rollback
- Improve query performance

**Archive Rules:**
```typescript
// Archive items that are approved/rejected for 30+ days
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

const snapshot = await db.collection('moderation_queue')
  .where('status', 'in', ['approved', 'rejected'])
  .where('updatedAt', '<', thirtyDaysAgo)
  .get();

// Move to moderation_archive collection
for (const doc of snapshot.docs) {
  await db.collection('moderation_archive').doc(doc.id).set({
    ...doc.data(),
    archivedAt: new Date()
  });
  await doc.ref.delete();
}
```

**Archive Cleanup:**
```typescript
// Delete archived items older than 90 days
const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

await db.collection('moderation_archive')
  .where('archivedAt', '<', ninetyDaysAgo)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
  });
```

---

## 3. Review & Rating System

### 3.1. Review Structure

```typescript
interface PlaceReview {
  id: string;
  placeId: string;
  userId: string;

  // Content
  title?: string;                // "Cảnh đẹp, dịch vụ tốt"
  content: string;               // Main review text (200-2000 chars)
  rating: number;                // 1-5 stars

  // Visit Info
  visitDate?: string;            // "2025-01-15"
  tripType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';

  // Media
  images?: string[];             // Max 4 images

  // Privacy
  isAnonymous: boolean;

  // User Info (denormalized)
  userInfo: {
    id: string;
    name: string;                // "Người dùng ẩn danh" if isAnonymous
    avatar?: string;
  };

  // Engagement
  helpfulCount: number;

  // Status
  status: 'published' | 'hidden' | 'removed';

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.2. Create Review Flow

```
User visits place detail page
  ↓
Clicks "Viết đánh giá"
  ↓
┌─────────────────────────────────────────┐
│      Đánh Giá Địa Điểm                   │
├─────────────────────────────────────────┤
│ Rating: ★★★★☆ (4/5)                     │
│                                         │
│ Tiêu đề (optional):                     │
│ [__________________________]            │
│                                         │
│ Nội dung đánh giá:                      │
│ [                                      ]│
│ [  Chia sẻ trải nghiệm của bạn...     ]│
│ [                                      ]│
│                                         │
│ Ngày ghé thăm: [__/__/____]            │
│                                         │
│ Loại chuyến đi: [Gia đình v]           │
│                                         │
│ Hình ảnh (tối đa 4):                    │
│ [+] [IMG] [IMG] [___]                   │
│                                         │
│ ☑ Đăng ẩn danh                          │
│                                         │
│ [Hủy]  [Gửi đánh giá]                  │
└─────────────────────────────────────────┘
```

**Validation:**
```typescript
const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(20).max(2000),
  title: z.string().max(100).optional(),
  visitDate: z.string().optional(),
  tripType: z.enum(['solo', 'couple', 'family', 'friends', 'business']).optional(),
  images: z.array(z.string().url()).max(4).optional(),
  isAnonymous: z.boolean().default(false)
});
```

**API:**
```typescript
POST /api/places/[id]/reviews
Body: ReviewSchema

// Create review
await db.collection('place_reviews').add({
  placeId,
  userId: user.id,
  userInfo: {
    id: user.id,
    name: isAnonymous ? 'Người dùng ẩn danh' : user.displayName,
    avatar: isAnonymous ? null : user.avatar
  },
  ...reviewData,
  helpfulCount: 0,
  status: 'published',
  createdAt: new Date()
});

// Update place stats
await db.collection('places').doc(placeId).update({
  'stats.totalReviews': FieldValue.increment(1),
  'stats.averageRating': calculateNewAverage(oldAvg, oldCount, newRating)
});
```

### 3.3. Helpful Voting System

**Purpose:**
- Let users vote helpful reviews to the top
- Surface most useful reviews
- Reward quality reviewers

**Vote Flow:**
```
User clicks "Hữu ích" button
  ↓
POST /api/reviews/[id]/helpful
  ↓
Check if already voted:
  collection: review_helpful
  composite ID: {userId}_{reviewId}
  ↓
If not voted:
  - Create vote record
  - Increment review.helpfulCount
  ↓
If already voted:
  - Delete vote record
  - Decrement review.helpfulCount
```

**Implementation:**
```typescript
// Vote
POST /api/reviews/[id]/helpful

// Check existing vote
const voteDoc = await db.collection('review_helpful')
  .doc(`${user.id}_${reviewId}`)
  .get();

if (voteDoc.exists) {
  // Already voted - remove vote
  await voteDoc.ref.delete();
  await reviewRef.update({
    helpfulCount: FieldValue.increment(-1)
  });
} else {
  // Not voted yet - add vote
  await db.collection('review_helpful').doc(`${user.id}_${reviewId}`).set({
    userId: user.id,
    reviewId,
    createdAt: new Date()
  });
  await reviewRef.update({
    helpfulCount: FieldValue.increment(1)
  });
}
```

**Prevent Self-Voting:**
```typescript
if (review.userId === user.id) {
  throw new Error('Không thể vote cho review của chính mình');
}
```

### 3.4. Report Review System

**Report Flow:**
```
User clicks "Báo cáo" on review
  ↓
┌─────────────────────────────────────────┐
│      Báo Cáo Đánh Giá                    │
├─────────────────────────────────────────┤
│ Lý do:                                  │
│ ○ Spam/Quảng cáo                        │
│ ○ Nội dung không phù hợp                │
│ ○ Ngôn từ xúc phạm                      │
│ ○ Đánh giá giả mạo                      │
│ ○ Không liên quan đến địa điểm          │
│ ○ Lý do khác                            │
│                                         │
│ Chi tiết (optional):                    │
│ [__________________________]            │
│                                         │
│ [Hủy]  [Gửi báo cáo]                   │
└─────────────────────────────────────────┘
```

**API:**
```typescript
POST /api/reviews/[id]/report
Body: {
  reason: 'spam' | 'inappropriate' | 'offensive' | 'fake' | 'irrelevant' | 'other',
  details?: string
}

// Prevent duplicate reports
const existingReport = await db.collection('review_reports')
  .where('reviewId', '==', reviewId)
  .where('reportedBy', '==', user.id)
  .get();

if (!existingReport.empty) {
  throw new Error('Bạn đã báo cáo đánh giá này rồi');
}

// Create report
await db.collection('review_reports').add({
  reviewId,
  placeId: review.placeId,
  reportedBy: user.id,
  reason,
  details,
  status: 'pending',
  createdAt: new Date()
});

// Notify moderators (not place owner!)
await EnhancedNotificationService.notifyContentReported({
  contentType: 'review',
  contentId: reviewId,
  reason
});
```

**Rate Limit:**
- Maximum **3 reports per user per week**
- Prevent report spam abuse

---

## 4. Real-time Notification System

### 4.1. Architecture

```
Backend (API/Cron)
  ↓
EnhancedNotificationService.notifyXXX()
  ↓
Write to Firebase Realtime Database
  Path: /notifications/{userId}/{notifId}
  ↓
Client subscribes via useRealtimeNotifications()
  ↓
Real-time update (< 100ms latency)
  ↓
NotificationBell component shows badge + dropdown
```

### 4.2. Notification Types

```typescript
type NotificationType =
  // Place workflow
  | 'PLACE_RECEIVED'         // Địa điểm đã được tiếp nhận
  | 'PLACE_CLAIMED'          // Đã được tiếp nhận xử lý
  | 'PLACE_IN_REVIEW'        // Đang được kiểm duyệt
  | 'PLACE_APPROVED'         // Đã được duyệt
  | 'PLACE_REJECTED'         // Bị từ chối
  | 'REVISION_REQUESTED'     // Yêu cầu chỉnh sửa

  // User events
  | 'USER_ROLE_CHANGED'      // Vai trò đã thay đổi
  | 'REVIEW_REPORTED'        // Đánh giá bị báo cáo

  // System
  | 'SYSTEM_ANNOUNCEMENT'    // Thông báo hệ thống
  | 'MAINTENANCE_SCHEDULED'; // Bảo trì sắp tới
```

### 4.3. Notification Templates

**Example: PLACE_APPROVED**
```typescript
{
  type: 'PLACE_APPROVED',
  title: 'Địa điểm đã được duyệt',
  body: '"{placeName}" đã được duyệt và hiển thị công khai',
  actionUrl: '/places/{slug}',
  actionText: 'Xem địa điểm'
}
```

**Example: REVISION_REQUESTED**
```typescript
{
  type: 'REVISION_REQUESTED',
  title: 'Yêu cầu chỉnh sửa',
  body: 'Địa điểm "{placeName}" cần chỉnh sửa. Lý do: {reason}',
  actionUrl: '/contribute/edit/{draftId}',
  actionText: 'Chỉnh sửa ngay'
}
```

### 4.4. Client Implementation

**Hook:**
```typescript
// src/hooks/use-realtime-notifications.ts
export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const db = getDatabase();
    const notifRef = ref(db, `notifications/${user.id}`);

    // Subscribe to real-time updates
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Convert to array and sort by timestamp DESC
      const notifArray = Object.values(data) as Notification[];
      notifArray.sort((a, b) => b.timestamp - a.timestamp);

      setNotifications(notifArray);
      setUnreadCount(notifArray.filter(n => !n.read).length);
    });

    return unsubscribe;
  }, [user]);

  const markAsRead = async (notifId: string) => {
    if (!user) return;

    const db = getDatabase();
    await update(ref(db, `notifications/${user.id}/${notifId}`), {
      read: true
    });
  };

  return {
    notifications,
    unreadCount,
    markAsRead
  };
}
```

**Component:**
```typescript
// src/components/notifications/notification-bell.tsx
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useRealtimeNotifications();

  return (
    <Popover>
      <PopoverTrigger>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>

      <PopoverContent>
        <div className="max-h-96 overflow-y-auto">
          {notifications.slice(0, 10).map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={() => markAsRead(notif.id)}
            />
          ))}
        </div>
        <Button onClick={() => router.push('/notifications')}>
          Xem tất cả
        </Button>
      </PopoverContent>
    </Popover>
  );
}
```

---

## 5. AI Features

### 5.1. Place-Specific AI Chatbot ✅

**Status:** **Production** (Đang hoạt động)

**Purpose:**
- Trả lời câu hỏi về địa điểm cụ thể
- Cung cấp thông tin chi tiết
- Gợi ý hoạt động, ẩm thực, di chuyển

**Context Injection:**
```typescript
const context = `
Tên: ${place.name}
Mô tả: ${place.description}
Vị trí: ${place.address}, ${place.province}
Loại hình: ${place.type}
Vùng: ${place.region}
Đánh giá: ${place.stats.averageRating}/5 (${place.stats.totalReviews} reviews)
Giá vé: ${place.entryFee?.adult || 'Miễn phí'}
Tiện ích: ${place.facilities.join(', ')}
Thời điểm lý tưởng: ${place.bestTimeToVisit}

Top 3 Reviews:
${topReviews.map(r => `- ${r.title}: ${r.content}`).join('\n')}
`;
```

**Quick Questions:**
```typescript
const quickQuestions = [
  "Địa điểm này có gì đặc biệt?",
  "Nên đi vào thời điểm nào?",
  "Chi phí khoảng bao nhiêu?",
  "Có hoạt động gì thú vị?",
  "Làm sao để di chuyển đến đây?",
  "Xung quanh có quán ăn nào ngon?"
];
```

**Rate Limiting:**
- **10 Q&A per day per place per user** (free tier)
- Prevent abuse và excessive costs

**Cost:**
- ~$0.00026 per Q&A turn (~650 VND)
- Very affordable for value provided

### 5.2. Trip Planner AI ⏸️

**Status:** **Paused** (Chờ đủ data)

**Why Paused:**
- Cần ít nhất **300-500 published places**
- Hiện tại chỉ có ~100-150 places
- AI suggestions sẽ kém chất lượng nếu thiếu data

**Future Implementation:**
```typescript
const itineraryFlow = ai.defineFlow({
  name: 'createItinerary',
  inputSchema: z.object({
    destination: z.string(),
    duration: z.number(),  // Number of days
    budget: z.enum(['low', 'medium', 'high']),
    interests: z.array(z.string()),
    travelers: z.number()
  }),
  async (input) => {
    // Fetch all published places in destination
    const places = await fetchPlaces(input.destination);

    // Build context
    const context = places.map(p => ({
      name: p.name,
      type: p.type,
      rating: p.stats.averageRating,
      description: p.description.slice(0, 200)
    }));

    // Generate itinerary with Gemini
    const { text } = await ai.generate({
      model: 'gemini-2.0-flash',
      prompt: buildItineraryPrompt(input, context)
    });

    return parseItinerary(text);
  }
});
```

---

## 6. View Tracking & Analytics

(Đã cover chi tiết trong file 2 - Kiến Trúc Hệ Thống, section View Tracking)

**Key Features:**
- Session-based tracking (1-hour window)
- IP + User-Agent fingerprinting (SHA-256)
- Atomic increment với FieldValue.increment()
- Privacy-first (no plaintext IP storage)
- Auto-cleanup expired cache

**Display:**
```typescript
const { viewCount } = useViewTracking(placeId, initialViewCount);

return (
  <div>
    <Eye className="h-4 w-4" />
    <span>{viewCount.toLocaleString('vi-VN')} lượt xem</span>
  </div>
);
```

---

## 7. User Role System

### 7.1. 6-Level Hierarchy

```
1. Guest       - Xem nội dung public
2. Traveler    - Tạo review, lưu địa điểm, lập itinerary
3. Contributor - Tạo địa điểm mới
4. Partner     - Priority review, verified badge
5. Moderator   - Kiểm duyệt nội dung
6. Admin       - Full quyền hạn
```

### 7.2. Trust Labels

```
community    → Địa điểm từ cộng đồng (Traveler)
contributor  → Từ Contributor đáng tin
partner      → Từ Partner được verify
verified     → Verified by Admin
```

**Display:**
```typescript
<Badge variant={trustLabelVariant[place.trustLabel]}>
  {trustLabelText[place.trustLabel]}
</Badge>
```

### 7.3. Role Upgrade Path

```
Guest
  ↓ Register
Traveler
  ↓ Contribute 3+ quality places
Contributor
  ↓ Maintain quality + activity (Admin promotes)
Partner
  ↓ Apply or invited by Admin
Moderator
  ↓ Exceptional contribution
Admin
```

---

## 8. Admin Dashboard

### 8.1. Features

**Moderation:**
- Queue management với tabs (Pending, Claimed, In Review, Decided)
- Bulk actions
- Performance metrics

**User Management:**
- List users với filters
- Change roles
- Ban/Suspend users
- View user stats

**Analytics:**
- Total users/places/reviews
- Growth charts
- Provincial distribution
- Top contributors

**System:**
- Health monitoring
- Error logs
- Audit trail
- Settings

---

## 9. PWA Features

(Đã cover chi tiết trong file 2 - Kiến Trúc Hệ Thống, section PWA Implementation)

**Key Features:**
- Offline access
- Install prompt
- Service worker caching
- App shortcuts
- Standalone mode

---

## 10. Search & Discovery

### 10.1. Filter System

**Filters:**
- Region (Bắc Bộ, Trung Bộ, Nam Bộ)
- Type (Biển, Núi, Văn hóa, Ẩm thực, Check-in)
- Province (63 tỉnh/thành)
- Rating (1-5 stars)
- Sort (Newest, Oldest, Rating, Popular)

**UI:**
```typescript
<PlaceFilters
  selectedRegion={region}
  selectedType={type}
  selectedProvince={province}
  onFilterChange={(filters) => setFilters(filters)}
/>
```

### 10.2. Search (Future)

**Planned:**
- Full-text search với Algolia/Elasticsearch
- Semantic search với AI embeddings
- Search suggestions
- Filter by multiple criteria

---

## Kết Luận

**Du Lịch Việt** cung cấp một hệ sinh thái tính năng hoàn chỉnh cho community-driven travel platform, với focus vào:

1. **Quality Content** - Professional moderation workflow
2. **User Engagement** - Reviews, notifications, real-time updates
3. **Smart Features** - AI chatbot, view tracking, analytics
4. **Scalability** - PWA, caching, efficient architecture
5. **Trust & Safety** - RBAC, reporting, transparent processes

**Tài liệu liên quan:**
- [1. Tổng Quan Dự Án](./1_Tong_Quan_Du_Lich_Viet.md)
- [2. Kiến Trúc Hệ Thống](./2_Kien_Truc_He_Thong_&_Cong_Nghe.md)
- [4. Cấu Trúc Thư Mục & Setup](./4_Cau_Truc_Thu_Muc_&_Setup.md)
- [5. API, Database, Security & Performance](./5_API_Database_Security_Performance.md)

---

*© 2025 Du Lịch Việt. All rights reserved.*

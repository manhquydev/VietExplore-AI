# Cấu Trúc Database Schema (Firestore)

## Tổng Quan

**Du Lịch Việt - AI** sử dụng Google Cloud Firestore làm cơ sở dữ liệu NoSQL chính. Database được thiết kế theo mô hình document-oriented với các collections được tối ưu hóa cho real-time sync và scalability.

---

## 1. Database Architecture

### 1.1. Database Type
- **Platform:** Google Cloud Firestore (NoSQL Document Database)
- **Mode:** Native Mode (not Datastore mode)
- **Location:** asia-southeast1 (Singapore)
- **Features:** Real-time sync, offline support, automatic scaling

### 1.2. Collections Overview

```
firestore
├── users                    (User profiles & authentication)
├── places                   (Published travel destinations)
├── placeDrafts              (Draft submissions for moderation)
├── moderation_queue         (Moderation workflow state machine)
├── moderation_logs          (Audit trail for moderation actions)
├── moderation_archive       (Auto-archived moderation history)
├── place_reviews            (User reviews for places)
├── review_helpful           (Helpful vote tracking)
├── review_reports           (Review abuse reports)
├── place_reports            (Place content reports)
├── suspension_schedules     (Auto-restore scheduled suspensions)
├── itineraries              (User-created travel itineraries)
├── itinerary_likes          (Like tracking for itineraries)
├── itinerary_saves          (Save tracking for itineraries)
├── announcements            (Community announcements)
├── team_members             (Team/Founder profiles)
├── view_cache               (Session-based view tracking, 1h TTL)
├── ai_chat_logs             (AI chatbot usage analytics)
├── admin_logs               (Admin action audit trail)
└── rateLimits               (Rate limiting counters)
```

**Total Collections:** 20 collections

---

## 2. Core Collections

### 2.1. users

**Mô tả:** Lưu trữ thông tin người dùng và metadata xác thực

**Schema:**
```typescript
interface FirestoreUser {
  // Identity
  id: string;                  // Document ID = Firebase Auth UID
  email: string;               // Primary email
  fullName: string;            // Display name
  username: string;            // Unique username (slug format)
  avatar?: string;             // Profile picture URL

  // Authorization
  role: UserRole;              // guest | traveler | contributor | partner | moderator | admin
  verified: boolean;           // Content verification status (NOT email)
  emailVerified?: boolean;     // Email verification status
  disabled?: boolean;          // Account disabled flag

  // Profile
  profile?: {
    bio?: string;              // Max 500 chars
    location?: string;         // Max 100 chars
    website?: string;          // Validated URL
    socialLinks?: {
      facebook?: string;
      instagram?: string;
    };
  };

  // Statistics
  stats?: {
    placesContributed: number;
    reviewsWritten: number;
    helpfulVotesReceived: number;
    savedPlacesCount?: number;
  };

  // Metadata
  badges?: string[];           // Achievement badges
  permissions?: string[];      // Custom permissions override
  createdAt: string;           // ISO 8601 timestamp
  updatedAt: string;

  // Role history (audit trail)
  roleHistory?: {
    previousRole: string;
    newRole: string;
    changedBy: string;         // Admin user ID
    changedAt: string;
    reason: string;
  }[];
}
```

**Indexes:**
- `(role, createdAt DESC)`
- `(role, updatedAt DESC)`
- `email` (automatic single-field index)

**Security Rules:**
- Read: Owner, Moderator, Admin
- Update: Owner (limited fields), Admin (all fields)
- Create/Delete: Only via Cloud Functions (beforeCreate trigger)

**Ví dụ Document:**
```json
{
  "id": "user_abc123",
  "email": "nguyen.van.a@example.com",
  "fullName": "Nguyễn Văn A",
  "username": "nguyen-van-a",
  "avatar": "https://storage.googleapis.com/...",
  "role": "contributor",
  "verified": true,
  "emailVerified": true,
  "profile": {
    "bio": "Yêu thích khám phá Việt Nam",
    "location": "Hà Nội, Việt Nam",
    "website": "https://example.com",
    "socialLinks": {
      "facebook": "facebook.com/nguyenvana"
    }
  },
  "stats": {
    "placesContributed": 12,
    "reviewsWritten": 45,
    "helpfulVotesReceived": 128,
    "savedPlacesCount": 23
  },
  "badges": ["early_adopter", "top_contributor"],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-09T10:30:00Z"
}
```

---

### 2.2. places

**Mô tả:** Địa điểm du lịch đã publish (công khai)

**Schema:**
```typescript
interface FirestorePlace {
  // Identity
  id: string;                  // Document ID (auto-generated)
  slug: string;                // URL-friendly unique identifier
  name: string;                // Place name (e.g., "Vịnh Hạ Long")

  // Content
  description: string;         // Full description (rich text)
  shortDescription: string;    // Summary (max 200 chars)

  // Location
  region: PlaceRegion;         // "bac-bo" | "trung-bo" | "nam-bo"
  province: string;            // Province name
  provinceSlug: string;        // Province slug
  type: PlaceType;             // "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in"

  // Address (Standardized Vietnam Administrative)
  vietnamAddress: {
    provinceId: number;        // Official province ID
    provinceName: string;
    districtId?: number;
    districtName?: string;
    wardId?: number;
    wardName?: string;
    fullAddress: string;       // Complete address text
    oldProvinceId?: number;    // For merged provinces
    newProvinceId?: number;
  };

  // Coordinates (Optional - using address text primarily)
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;            // Legacy field

  // Media
  images: PlaceImage[];        // Array of image objects (min 1)
  video?: PlaceVideo;          // Single video (optional)

  // Trust & Source
  trustLabel: TrustLabel;      // "community" | "contributor" | "partner" | "verified"
  source: {
    type: "user" | "partner" | "import";
    userId?: string;
    partnerName?: string;
    url?: string;
  };

  // Status
  status: PlaceStatus;         // "draft" | "submitted" | "in_review" | "published" | etc.

  // Rating
  rating: {
    average: number;           // 0-5
    count: number;             // Total reviews
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };

  // Analytics
  viewCount: number;
  likeCount: number;
  reportCount: number;
  featured: boolean;           // Featured on homepage

  // Metadata
  tags: string[];              // Search tags
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy: string;           // User ID
  moderatedBy?: string;        // Moderator user ID

  // Rejection (if applicable)
  rejectedAt?: string;
  rejectionReason?: string;

  // Temporary Suspension
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  suspensionExpiresAt?: string;
  suspensionType?: "violation" | "investigation" | "quality_review" | "user_request";

  // Moderation History
  moderationHistory?: {
    action: string;
    moderatorId: string;
    reason?: string;
    createdAt: string;
  }[];
}
```

**Sub-types:**

```typescript
interface PlaceImage {
  id: string;
  url: string;                 // Firebase Storage URL
  alt: string;                 // Accessibility text
  caption?: string;
  isPrimary: boolean;          // true = thumbnail
  uploadedBy: string;
  createdAt: string;
  order?: number;              // Display order
}

interface PlaceVideo {
  id: string;
  url: string;
  thumbnail?: string;
  duration?: number;           // seconds
  uploadedBy: string;
  createdAt: string;
}
```

**Indexes:**
- `(status, createdAt DESC)` - List published places
- `(status, updatedAt DESC)` - Recently updated
- `(region, status, createdAt DESC)` - Filter by region
- `(region, province, type, status)` - Complex filtering
- `slug` - Single field (unique lookup)

**Security Rules:**
- Read: Anyone (if `status == 'published'`)
- List: Public (filtered by read rule)
- Create/Update/Delete: Only via Cloud Functions/Admin API

**Ví dụ Document:**
```json
{
  "id": "place_vinh_ha_long",
  "slug": "vinh-ha-long-quang-ninh",
  "name": "Vịnh Hạ Long",
  "description": "Di sản thiên nhiên thế giới UNESCO...",
  "shortDescription": "Kỳ quan thiên nhiên với hàng nghìn đảo đá vôi",
  "region": "bac-bo",
  "province": "Quảng Ninh",
  "provinceSlug": "quang-ninh",
  "type": "bien",
  "vietnamAddress": {
    "provinceId": 22,
    "provinceName": "Quảng Ninh",
    "districtId": 193,
    "districtName": "Thành phố Hạ Long",
    "fullAddress": "Vịnh Hạ Long, TP. Hạ Long, Quảng Ninh"
  },
  "coordinates": {
    "lat": 20.9101,
    "lng": 107.1839
  },
  "images": [
    {
      "id": "img_001",
      "url": "https://storage.googleapis.com/.../halong1.jpg",
      "alt": "Vịnh Hạ Long nhìn từ trên cao",
      "isPrimary": true,
      "uploadedBy": "user_abc123",
      "createdAt": "2025-01-05T10:00:00Z",
      "order": 1
    }
  ],
  "trustLabel": "partner",
  "source": {
    "type": "partner",
    "userId": "partner_xyz",
    "partnerName": "Quảng Ninh Tourism"
  },
  "status": "published",
  "rating": {
    "average": 4.8,
    "count": 1243,
    "breakdown": {
      "5": 1000,
      "4": 200,
      "3": 30,
      "2": 10,
      "1": 3
    }
  },
  "viewCount": 125430,
  "likeCount": 8921,
  "reportCount": 0,
  "featured": true,
  "tags": ["UNESCO", "di sản", "biển", "Quảng Ninh"],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-09T08:00:00Z",
  "publishedAt": "2025-01-02T10:00:00Z",
  "createdBy": "partner_xyz",
  "moderatedBy": "mod_001"
}
```

---

### 2.3. placeDrafts

**Mô tả:** Bản nháp địa điểm chờ kiểm duyệt hoặc chỉnh sửa

**Schema:**
```typescript
interface PlaceDraft {
  // Same structure as Place, but with additional fields:
  id: string;
  submitter: string;           // User ID who created draft
  status: DraftStatus;         // "draft" | "submitted" | "in_review" | "approved" | "rejected" | "changes_requested"

  // Moderation feedback
  moderationNotes?: string;    // Moderator feedback
  changesRequested?: {
    field: string;
    issue: string;
    suggestion: string;
  }[];

  // All other fields from Place schema
  // ...
}
```

**Indexes:**
- `(status, createdAt DESC)`
- `(submitter, status, updatedAt DESC)` - User's drafts

**Security Rules:**
- Read: Owner OR Moderator
- Create: Contributor+ with emailVerified
- Update: Owner (if status draft/changes_requested) OR Moderator
- Delete: Owner (if status draft) OR Admin

**Workflow:**
```
draft → submitted → moderation_queue (pending)
                 → in_review (claimed by moderator)
                 → approved → places (published)
                 → rejected (with reason)
                 → changes_requested (back to submitter)
```

---

### 2.4. moderation_queue

**Mô tả:** Hàng đợi kiểm duyệt với state machine STRICT

**Schema:**
```typescript
interface ModerationQueueItem {
  id: string;                  // Document ID

  // Item Identity
  itemType: "place_submission" | "place_edit" | "place_deletion" | "place_reports_review";
  contentType: "place";        // Future: "itinerary", "review"
  contentId: string;           // ID of draft/place
  itemId: string;              // Reference to moderation item

  // Status (State Machine - STRICT)
  status: "pending" | "claimed" | "in_review" | "approved" | "rejected" | "escalated";
  priority: "urgent" | "high" | "medium" | "low";
  queueType: "partner_queue" | "contributor_queue";

  // Claim Mechanism (Race Condition Prevention)
  claimedBy?: string;          // Moderator user ID
  claimedAt?: string;
  claimExpiresAt?: string;     // Auto-release after 2h

  // Submission Data
  submittedBy: string;         // User ID
  submittedAt: string;

  // Review Data
  reviewedBy?: string;         // Moderator user ID
  reviewedAt?: string;
  reviewNotes?: string;

  // Escalation (Moderator → Admin only)
  escalatedTo?: "admin";
  escalatedAt?: string;
  escalationReason?: string;

  // Content Data (for edit requests)
  originalData?: any;
  editedData?: any;

  // Metadata
  metadata?: {
    editDraftId?: string;
    reason?: string;
    [key: string]: any;
  };
}
```

**State Machine Flow:**
```
PENDING → CLAIMED → IN_REVIEW → APPROVED/REJECTED/NEEDS_REVISION
  (chờ)    (tiếp nhận) (đang duyệt)  (quyết định cuối)
```

**State Transition Rules:**
- `pending → claimed`: Moderator clicks "Tiếp nhận" (sets 2h timeout)
- `claimed → in_review`: Moderator clicks "Bắt đầu kiểm duyệt"
- `claimed → pending`: Auto-release if no action within 2h (cron job)
- `in_review → approved`: Moderator approves
- `in_review → rejected`: Moderator rejects with reason
- `in_review → needs_revision`: Request changes from submitter
- `in_review → escalated`: Moderator escalates to Admin (only Moderator, not Admin)

**Indexes:**
- `(status, priority DESC, submittedAt ASC)` - Priority queue
- `(contentType, status, submittedAt ASC)` - Filter by type
- `(assignedTo, status, submittedAt ASC)` - Moderator's queue
- `(contentId, contentType, submittedAt DESC)` - Find history

**Security Rules:**
- Read/List: Moderator, Admin
- Create: Contributor, Partner (auto-created on submit)
- Update: Moderator, Admin
- Delete: Admin only

**Auto-Archive:**
- Approved/Rejected items kept 30 days → move to `moderation_archive`
- Archive retention: 90 days → auto-delete

---

### 2.5. moderation_logs

**Mô tả:** Audit trail cho mọi hành động kiểm duyệt

**Schema:**
```typescript
interface ModerationLog {
  id: string;
  contentId: string;           // Place/draft ID
  contentType: "place";
  action: "claim" | "start_review" | "approve" | "reject" | "escalate" | "release_claim";

  moderatorId: string;
  moderatorName: string;

  previousStatus?: string;
  newStatus?: string;
  reason?: string;

  metadata?: {
    claimTimeout?: number;
    priority?: string;
    [key: string]: any;
  };

  timestamp: string;           // ISO 8601
  ipAddress?: string;          // Hashed for privacy
}
```

**Indexes:**
- `(contentId, timestamp DESC)` - Item history
- `(moderatorId, timestamp DESC)` - Moderator activity

**Retention:** 1 year

---

### 2.6. place_reviews

**Mô tả:** Đánh giá của người dùng về địa điểm

**Schema:**
```typescript
interface PlaceReview {
  id: string;
  placeId: string;
  placeName: string;

  // User Info
  userId: string;
  userInfo: {
    id: string;
    name: string;             // "Người dùng ẩn danh" if isAnonymous
    role: string;
    avatar?: string;
  };

  // Review Content
  rating: number;             // 1-5 stars
  title?: string;
  content: string;            // Required, multiline
  images?: string[];          // Optional review images
  visitDate?: string;         // When user visited

  // Privacy
  isAnonymous: boolean;       // Hide user identity
  isVerified: boolean;        // Actually visited (future: check-ins)

  // Engagement
  helpfulCount: number;       // Vote count
  reportCount: number;

  // Status
  status: "published" | "hidden" | "pending";

  // Metadata
  createdAt: string;
  updatedAt: string;
  moderatedBy?: string;
}
```

**Indexes:**
- `(placeId, status, createdAt DESC)` - Place reviews
- `(placeId, status, rating DESC)` - Sort by rating
- `(placeId, status, helpfulCount DESC)` - Sort by helpful
- `(userId, createdAt DESC)` - User's reviews

**Security Rules:**
- Read: Public (if `status == 'published'`)
- Create: Authenticated users with emailVerified
- Update: Owner (except rating)
- Delete: Owner OR Moderator

---

### 2.7. review_helpful

**Mô tả:** Tracking "helpful" votes cho reviews

**Schema:**
```typescript
interface ReviewHelpful {
  id: string;                  // Composite: `${userId}_${reviewId}`
  userId: string;
  reviewId: string;
  createdAt: string;
}
```

**Indexes:**
- `(userId, reviewId)` - Unique constraint
- `(reviewId, createdAt DESC)` - Review's votes

**Security Rules:**
- Create: Authenticated (prevent self-vote)
- Delete: Owner only

---

### 2.8. review_reports

**Mô tả:** Báo cáo vi phạm reviews

**Schema:**
```typescript
interface ReviewReport {
  id: string;
  reviewId: string;
  placeId: string;             // For moderator context

  reportedBy: string;          // User ID
  reason: "spam" | "inappropriate" | "offensive" | "fake" | "irrelevant" | "other";
  details?: string;

  status: "pending" | "investigating" | "resolved" | "dismissed";

  // Review (Moderator only)
  reviewerId?: string;         // Moderator user ID
  reviewerInfo?: {
    id: string;
    name: string;
  };
  reviewNotes?: string;

  createdAt: string;
  resolvedAt?: string;
}
```

**Indexes:**
- `(status, createdAt DESC)` - Pending reports
- `(reviewerId, status, createdAt DESC)` - Moderator's queue
- `(reportedBy, createdAt DESC)` - User's reports

**Rate Limiting:** 3 reports/user/week

**Security Rules:**
- Read: Reporter OR Moderator
- Create: Authenticated (rate limited)
- Update: Moderator only

---

### 2.9. place_reports

**Mô tả:** Báo cáo vi phạm địa điểm

**Schema:**
```typescript
interface PlaceReport {
  id: string;
  placeId: string;
  placeName: string;

  reportedBy: string;
  reason: "incorrect_info" | "inappropriate" | "duplicate" | "spam" | "quality_issue" | "other";
  details?: string;

  status: "pending" | "in_review" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";

  // Claim mechanism
  claimedAt?: string;
  reviewerInfo?: {
    id: string;
    name: string;
  };

  // Resolution
  resolvedBy?: string;
  resolvedAt?: string;
  reviewNotes?: string;
  actionTaken?: "hide_place" | "request_edit" | "no_action" | "delete";

  createdAt: string;
}
```

**Indexes:**
- `(placeId, reportedBy, createdAt)` - Prevent duplicate
- `(reportedBy, createdAt DESC)` - User's reports
- `(status, createdAt DESC)` - Pending reports

**Workflow:**
```
User reports → status: "pending"
Moderator reviews → status: "in_review"
Action taken → status: "resolved" (with actionTaken)
No violation → status: "dismissed"
```

---

## 3. Supporting Collections

### 3.1. itineraries

**Mô tả:** Lịch trình du lịch do người dùng tạo

**Schema:**
```typescript
interface Itinerary {
  id: string;
  slug: string;
  userId: string;              // Owner

  title: string;
  description: string;

  // Trip Details
  duration: number;            // days (1-30)
  budget: {
    min: number;
    max: number;
    currency: "VND";
  };
  tripType: "solo" | "couple" | "family" | "group" | "business";

  // Places
  places: {
    id: string;
    name: string;
    day: number;               // Day in itinerary
    order: number;             // Order within day
    duration: number;          // hours
    estimatedCost: number;
    notes?: string;
  }[];

  // Visibility
  isPublic: boolean;
  status: "draft" | "published" | "hidden";

  // Collaboration
  collaborators?: {
    userId: string;
    permission: "view" | "edit" | "admin";
    invitedAt: string;
  }[];

  // Analytics
  viewCount: number;
  likeCount: number;
  copyCount: number;

  // AI Generation Metadata
  aiGenerated?: boolean;
  aiPrompt?: string;
  aiModel?: string;

  createdAt: string;
  updatedAt: string;
}
```

**Indexes:**
- `(userId, status, updatedAt DESC)` - User's itineraries
- `(isPublic, status, createdAt DESC)` - Public itineraries
- `(tripType, isPublic, createdAt DESC)` - Filter by type
- `(duration, isPublic, createdAt DESC)` - Filter by duration

---

### 3.2. announcements

**Mô tả:** Thông báo cộng đồng

**Schema:**
```typescript
interface Announcement {
  id: string;
  slug: string;

  title: string;
  content: string;             // Rich text
  excerpt?: string;
  coverImage?: string;

  type: "announcement" | "feature" | "guide" | "community" | "maintenance" | "event";
  status: "draft" | "scheduled" | "published" | "archived";
  priority: "low" | "medium" | "high" | "urgent";

  authorId: string;
  authorName: string;

  // Display
  isPinned: boolean;
  isFeatured: boolean;

  // Scheduling
  scheduledFor?: string;
  publishedAt?: string;

  // Analytics
  viewCount: number;

  createdAt: string;
  updatedAt: string;
}
```

**Indexes:**
- `(status, publishedAt DESC)` - Published announcements
- `(status, priority DESC, createdAt DESC)` - Priority queue
- `(status, isPinned DESC, priority DESC, publishedAt DESC)` - Homepage display

---

### 3.3. team_members

**Mô tả:** Thông tin thành viên team/founder

**Schema:**
```typescript
interface TeamMember {
  id: string;
  slug: string;

  fullName: string;
  title: string;               // Position/Role
  avatar: string;
  bio: string;                 // Max 250 chars

  expertise: string[];         // Skills/Areas
  department?: string;

  // Social Links
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };

  // Display
  status: "active" | "inactive";
  featured: boolean;
  displayOrder: number;        // Sort order

  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
```

**Indexes:**
- `(status, displayOrder ASC)` - Active members sorted
- `(featured DESC, displayOrder ASC)` - Featured first

---

### 3.4. view_cache

**Mô tả:** Session-based view tracking (prevent count inflation)

**Schema:**
```typescript
interface ViewCache {
  id: string;                  // Composite: `${placeId}_${fingerprint}`
  placeId: string;
  fingerprint: string;         // IP + User-Agent hash
  viewedAt: string;
  expiresAt: string;           // TTL: 1 hour
}
```

**TTL:** 1 hour (auto-delete)

**Purpose:** Prevent same user from inflating view count by refreshing

---

### 3.5. ai_chat_logs

**Mô tả:** AI chatbot usage analytics

**Schema:**
```typescript
interface AIChatLog {
  id: string;
  placeId: string;
  userId?: string;             // Null if anonymous

  userMessage: string;
  aiResponse: string;

  // Analytics
  responseTime: number;        // ms
  tokensUsed: number;
  cost: number;                // USD

  sessionId: string;
  timestamp: string;
}
```

**Indexes:**
- `(placeId, userId, timestamp)` - User chat history
- `(timestamp DESC)` - Recent chats

---

### 3.6. suspension_schedules

**Mô tả:** Auto-restore cho temporary suspensions

**Schema:**
```typescript
interface SuspensionSchedule {
  id: string;
  placeId: string;

  suspendedAt: string;
  expiresAt: string;           // When to auto-restore

  suspensionType: "violation" | "investigation" | "quality_review" | "user_request";
  reason: string;

  processed: boolean;          // Cron job marks true after restore
  processedAt?: string;

  createdBy: string;
}
```

**Indexes:**
- `(processed, expiresAt ASC)` - Cron job query
- `(placeId, processed)` - Active suspensions

**Cron Job:** Runs every hour, restores expired suspensions

---

## 4. Composite Indexes

**File:** `firestore.indexes.json` (884 lines)

**Key Indexes:**

### Places
- `(status, createdAt DESC)`
- `(region, status, createdAt DESC)`
- `(status, updatedAt DESC)`
- `(region, province, type, status)`

### Moderation
- `(status, priority DESC, submittedAt ASC)`
- `(contentType, status, submittedAt ASC)`
- `(assignedTo, status, submittedAt ASC)`
- `(itemType, status, priority DESC, submittedAt ASC)`

### Reviews
- `(placeId, status, createdAt DESC)`
- `(placeId, status, rating DESC)`
- `(placeId, status, helpfulCount DESC)`
- `(userId, createdAt DESC)`

### Itineraries
- `(userId, status, updatedAt DESC)`
- `(isPublic, status, createdAt DESC)`
- `(tripType, isPublic, createdAt DESC)`

**Total Indexes:** 50+ composite indexes

---

## 5. Data Relationships

### 5.1. User → Places
```
users (1) ──< places (n)
         via createdBy field
```

### 5.2. Place → Reviews
```
places (1) ──< place_reviews (n)
           via placeId field
```

### 5.3. Moderation Flow
```
placeDrafts (1) → moderation_queue (1)
                → moderation_logs (n)
                ↓
              places (1) [on approval]
```

### 5.4. Review → Reports
```
place_reviews (1) ──< review_reports (n)
                  via reviewId field
```

### 5.5. Itinerary → Places
```
itineraries (1) ──< places (n)
                via places[] array (denormalized)
```

**Denormalization Strategy:**
- Place data embedded in itineraries (snapshot at creation time)
- User data embedded in reviews/reports (for display even if user deleted)

---

## 6. Data Lifecycle

### 6.1. Place Lifecycle
```
Draft → Submit → Moderation → Publish → [Update/Suspend/Delete]
  ↓       ↓          ↓           ↓
placeDrafts  moderation_queue  places  [places (status change)]
```

### 6.2. Moderation Archive Lifecycle
```
Moderation Item (approved/rejected)
  → Keep 30 days in moderation_queue
  → Move to moderation_archive (cron job)
  → Keep 90 days in archive
  → Auto-delete (cron job)
```

### 6.3. View Cache Lifecycle
```
User views place
  → Check view_cache (placeId + fingerprint)
  → If not exists:
      - Increment place.viewCount
      - Create view_cache entry (TTL: 1h)
  → If exists:
      - Skip increment (within 1h window)
```

---

## 7. Tóm Tắt

| Aspect | Detail |
|--------|--------|
| **Database Type** | Google Cloud Firestore (NoSQL) |
| **Total Collections** | 20 collections |
| **Core Collections** | 9 (users, places, placeDrafts, moderation_queue, reviews, reports, etc.) |
| **Supporting Collections** | 11 (itineraries, announcements, team_members, logs, etc.) |
| **Total Indexes** | 50+ composite indexes |
| **Data Model** | Document-oriented with denormalization |
| **Real-time Sync** | Yes (Firestore real-time listeners) |
| **Offline Support** | Yes (Firestore offline persistence) |
| **Scalability** | Auto-scaling (Google Cloud) |

---

**Phiên bản:** 1.0
**Ngày cập nhật:** 2025-01-09
**Tác giả:** Technical Documentation Team

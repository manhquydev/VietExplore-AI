# Database Architecture - Cloud Firestore (NoSQL)

**Dự án:** VietExplore-AI - Nền tảng du lịch Việt Nam với AI
**Database:** Cloud Firestore (NoSQL Document Database)
**Ngày tạo tài liệu:** 2025-01-23
**Phiên bản:** 1.0.0

---

## 📋 Mục Lục

1. [Executive Summary](#executive-summary)
2. [Tại Sao Chọn NoSQL (Firestore)?](#tại-sao-chọn-nosql-firestore)
3. [Firestore Collections Inventory](#firestore-collections-inventory)
4. [Chi Tiết Schema Từng Collection](#chi-tiết-schema-từng-collection)
5. [Relationships & Data Flow](#relationships--data-flow)
6. [Composite Indexes](#composite-indexes)
7. [Security Rules Architecture](#security-rules-architecture)
8. [Denormalization Strategy](#denormalization-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Trade-offs & Limitations](#trade-offs--limitations)
11. [Migration Considerations](#migration-considerations)

---

## Executive Summary

VietExplore-AI sử dụng **Cloud Firestore** làm database chính với kiến trúc NoSQL document-based. Quyết định này dựa trên:

### ✅ **Lý Do Chính Chọn Firestore:**

1. **Real-time Sync** - Hệ thống notification, moderation queue, place stats cần update real-time
2. **Offline-First Mobile** - PWA cần hoạt động offline với sync tự động
3. **Flexible Schema** - Travel content có cấu trúc đa dạng (biển, núi, văn hóa, ẩm thực)
4. **Auto-Scaling** - Không cần quản lý sharding/replication thủ công
5. **Firebase Ecosystem** - Tích hợp sẵn Authentication, Storage, Cloud Functions
6. **Geographic Distribution** - Firestore multi-region cho low-latency global access

### 📊 **Database Overview:**

- **23+ Collections** (10 core, 8 interaction, 5 system)
- **60+ Composite Indexes** cho complex queries
- **Role-Based Security Rules** (6 user roles)
- **Real-time Database Integration** (RTDB cho stats sync)
- **10 Cloud Functions** (triggers + scheduled jobs)

### 🎯 **Ứng Dụng Phù Hợp:**

| Feature | Why Firestore Fits |
|---------|-------------------|
| **AI Chatbot** | Real-time streaming, session persistence |
| **Moderation Queue** | Live updates, claim mechanism, SLA tracking |
| **Notifications** | Real-time push, read receipts, unread count |
| **Place Reviews** | Nested documents, flexible rating breakdown |
| **User Stats** | Denormalized counters, atomic increments |
| **PWA Offline** | Client-side caching, background sync |

---

## Tại Sao Chọn NoSQL (Firestore)?

### 1. Real-Time Features = Core Value Proposition

**Vấn Đề:** Traditional SQL databases yêu cầu polling hoặc WebSocket infrastructure phức tạp.

**Giải Pháp Firestore:**
```typescript
// Real-time subscription với 1 dòng code
const unsubscribe = onSnapshot(
  collection(db, 'moderation_queue'),
  (snapshot) => {
    // UI tự động update khi moderator claim/approve item
    snapshot.docChanges().forEach(change => {
      if (change.type === 'modified') {
        updateUI(change.doc.data())
      }
    })
  }
)
```

**Kết Quả:**
- Moderation queue updates real-time (< 200ms latency)
- Notification bell badge tự động tăng/giảm
- Place stats (views, likes, saves) sync instantly
- AI chatbot streaming responses

**So Sánh SQL:**
- PostgreSQL + WebSocket = Phải tự implement pub/sub
- MySQL + Polling = Tốn bandwidth, delay 1-5s
- Cost: Firestore $0, SQL + infrastructure $50-200/tháng

---

### 2. Offline-First PWA = Mobile User Experience

**Yêu Cầu:** Du lịch Việt = Users đi du lịch = Mạng yếu/offline thường xuyên

**Firestore Offline Persistence:**
```typescript
// Enable offline persistence
enableIndexedDbPersistence(db)

// Users vẫn xem places, viết reviews khi offline
// Data tự động sync khi online lại
```

**Use Cases:**
1. User xem place detail tại Hà Giang (mạng 2G)
2. Save place, viết draft review offline
3. Về thành phố → Auto-sync review lên server

**So Sánh SQL:**
- PostgreSQL: Không có offline support
- SQLite local + sync: Phải tự implement conflict resolution
- Firestore: Built-in conflict resolution, offline cache quản lý tự động

---

### 3. Flexible Schema = Travel Content Diversity

**Thực Tế:** Mỗi loại địa điểm có metadata khác nhau:

```typescript
// Collection: places
// Document: bien-my-khe (Beach)
{
  type: "bien",
  waterQuality: "Excellent",
  waveHeight: "1-2m",
  bestSeasonForSwimming: ["May", "June", "July"],
  lifeguardHours: "6:00-18:00"
}

// Document: ban-gioc-waterfall (Mountain/Waterfall)
{
  type: "nui",
  elevation: "30m",
  difficulty: "Easy",
  hikingDuration: "1 hour",
  bestViewingTime: "Rainy season (June-September)"
}

// Document: pho-co-hoi-an (Culture)
{
  type: "van-hoa",
  unescoStatus: "World Heritage Site",
  architectureStyle: "Mixed (Chinese, Japanese, Vietnamese)",
  historicalPeriod: "15th-19th century"
}
```

**Tại Sao SQL Khó Khăn:**
- Option 1: 1 table with 100+ nullable columns → Sparse data, wasted space
- Option 2: EAV pattern → Complex joins, slow queries
- Option 3: JSONB column → Lose type safety, indexing khó

**Firestore Solution:**
- Mỗi document tự do thêm fields riêng
- Queries vẫn hoạt động: `where('type', '==', 'bien')`
- Indexes chỉ cần fields thực tế sử dụng

---

### 4. Auto-Scaling Without DevOps Overhead

**Scenario:** Viral content spike (place featured on Facebook/TikTok)

**Firestore Auto-Scaling:**
- Traffic tăng từ 100 → 10,000 requests/second
- Firestore tự động scale horizontally
- Không cần restart, migration, sharding configuration
- Cost: Pay per read/write, không có fixed server cost

**SQL Traditional Approach:**
```
Day 1: 100 users → 1 PostgreSQL instance ($50/month)
Day 30: 5,000 users → Upgrade to 4-core ($200/month)
Day 60: 20,000 users → Master-slave replication ($500/month)
Day 90: 100,000 users → Sharding setup (3 weeks DevOps work)
```

**Firestore:**
```
Day 1-365: Auto-scale
Cost: $0-50/month (based on actual usage)
DevOps Time: 0 hours
```

---

### 5. Firebase Ecosystem Integration

**1-Click Integration:**
- ✅ **Firebase Authentication** → Firestore Security Rules dùng `request.auth.uid`
- ✅ **Firebase Storage** → Firestore documents lưu image URLs
- ✅ **Cloud Functions** → Firestore triggers tự động chạy logic
- ✅ **Firebase Realtime Database** → Sync stats từ Firestore

**Example - Place Creation Workflow:**
```typescript
// 1. Upload image → Firebase Storage
const imageUrl = await uploadToStorage(file)

// 2. Create Firestore document
await addDoc(collection(db, 'places'), {
  name: "Hạ Long Bay",
  images: [{ url: imageUrl, ... }],
  createdBy: auth.currentUser.uid  // ← Auto từ Firebase Auth
})

// 3. Cloud Function tự động trigger
export const onPlaceCreated = onDocumentCreated('places/{id}', async (event) => {
  // Send notification, update stats, create moderation queue
})
```

**SQL Stack Tương Đương:**
- PostgreSQL + S3 + Custom Auth + Lambda + Redis
- Setup time: 2-3 tuần
- Maintenance: 5-10 giờ/tháng

---

### 6. Geographic Distribution & Low Latency

**VietExplore-AI Target Users:**
- 🇻🇳 Việt Nam: 70% users
- 🇺🇸 US/EU: 20% users (Việt kiều)
- 🌏 APAC: 10% users

**Firestore Multi-Region:**
```
Project location: asia-southeast1 (Singapore)
Auto-replicated to: asia-east1 (Taiwan), asia-northeast1 (Tokyo)
```

**Latency Results:**
- Hà Nội → Singapore: ~30-50ms
- TP.HCM → Singapore: ~15-25ms
- US West Coast → Singapore: ~150ms (acceptable for read-heavy app)

**SQL Alternative:**
- Single region PostgreSQL: Latency 200-500ms cho global users
- Multi-region setup: $1000+/month, complex replication

---

## Firestore Collections Inventory

### 📊 **Total: 23 Collections**

#### **CORE COLLECTIONS (10)**

| Collection | Purpose | Document Count (est.) | Hot/Cold |
|------------|---------|----------------------|----------|
| `users` | User profiles, roles, stats | ~1,000-10,000 | HOT |
| `places` | Published travel destinations | ~500-5,000 | HOT |
| `placeDrafts` | Draft/submitted places | ~200-1,000 | WARM |
| `moderation_queue` | Content review workflow | ~50-200 (active) | HOT |
| `moderation_logs` | Audit trail for actions | ~5,000-20,000 | COLD |
| `moderation_archive` | Archived queue items (>30 days) | ~10,000-50,000 | COLD |
| `place_reviews` | User reviews for places | ~2,000-20,000 | WARM |
| `announcements` | System announcements | ~20-100 | WARM |
| `team_members` | Team/founder profiles | ~5-20 | COLD |
| `ai_chat_logs` | AI chatbot usage tracking | ~5,000-50,000 | WARM |

#### **INTERACTION COLLECTIONS (8)**

| Collection | Purpose | Document Count (est.) | Hot/Cold |
|------------|---------|----------------------|----------|
| `review_helpful` | Helpful votes on reviews | ~5,000-50,000 | WARM |
| `review_reports` | Reports against reviews | ~100-500 | WARM |
| `place_reports` | Reports against places | ~100-500 | WARM |
| `edit_suggestions` | User-suggested edits | ~50-200 | WARM |
| `itineraries` | Trip planning (disabled) | 0 | COLD |
| `itinerary_likes` | Like tracking (disabled) | 0 | COLD |
| `itinerary_saves` | Save tracking (disabled) | 0 | COLD |
| `suspension_schedules` | Auto-restore for suspended places | ~10-50 | WARM |

#### **SYSTEM COLLECTIONS (5)**

| Collection | Purpose | Document Count (est.) | Hot/Cold |
|------------|---------|----------------------|----------|
| `deleted_places` | Soft-deleted places (120 days retention) | ~100-500 | COLD |
| `view_cache` | Session-based view tracking (1h TTL) | ~500-2,000 (rotating) | HOT |
| `admin_logs` | System operation logs | ~1,000-5,000 | COLD |
| `moderation_health_logs` | Queue health check results | ~100-500 | COLD |
| `rateLimits` | Rate limiting (functions only) | ~500-2,000 | HOT |

**Note on `audits` collection:** Mentioned in security rules but not actively used in current codebase.

---

## Chi Tiết Schema Từng Collection

### 1. `users` - User Profiles & Authentication

**Purpose:** Lưu thông tin user profile, role-based permissions, stats

**Schema:**
```typescript
interface User {
  // Core Identity
  id: string                          // Firebase Auth UID
  email: string                       // Primary email
  fullName: string                    // Display name
  username: string                    // Unique username
  avatar?: string                     // Firebase Storage URL

  // Role & Permissions
  role: "guest" | "traveler" | "contributor" | "partner" | "moderator" | "admin"
  verified: boolean                   // Manual verification badge
  emailVerified?: boolean             // Firebase Auth email verification
  permissions?: string[]              // Inherited from role

  // Profile Info
  profile?: {
    bio?: string
    location?: string
    website?: string
    socialLinks?: {
      facebook?: string
      instagram?: string
    }
  }

  // User Stats (Denormalized)
  stats?: {
    placesContributed: number         // Total places created
    reviewsWritten: number            // Total reviews
    helpfulVotesReceived: number      // How many found user helpful
    savedPlacesCount?: number         // Bookmarked places
  }

  // Badges & Achievements
  badges?: string[]                   // ["early_adopter", "top_contributor"]

  // Account Status
  disabled?: boolean                  // Account suspended/banned

  // Timestamps
  createdAt: string                   // ISO timestamp
  updatedAt: string                   // ISO timestamp
}
```

**Key Indexes:**
- `email` (unique, for login)
- `username` (unique, for profile URLs)
- `role` + `createdAt` (list users by role)

**Relationships:**
- 1 User → N Places (via `places.createdBy`)
- 1 User → N Reviews (via `place_reviews.userId`)
- 1 User → N Moderation Actions (via `moderation_logs.moderatorId`)

**Security Rules:**
- Public read: `id`, `fullName`, `username`, `avatar`, `verified`, `role`, `stats`, `badges`
- Private: `email`, `permissions`, `disabled`
- Users can only update their own profile (except admin)

---

### 2. `places` - Published Travel Destinations

**Purpose:** Core content - Published places visible to public

**Schema:**
```typescript
interface Place {
  // Core Identity
  id: string                          // Firestore doc ID
  slug: string                        // URL-friendly (e.g., "ha-long-bay")
  name: string                        // Display name

  // Content
  description: string                 // Full description (HTML/Markdown)
  shortDescription: string            // Excerpt for cards (150-200 chars)

  // Categorization
  region: "bac-bo" | "trung-bo" | "nam-bo"
  province: string                    // Province name
  provinceSlug: string                // URL-friendly province
  type: "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in"
  tags: string[]                      // ["family-friendly", "budget", "adventure"]

  // Location
  coordinates?: {
    lat: number
    lng: number
  }
  address?: string                    // Free-text address
  vietnamAddress: {                   // Structured administrative address
    provinceId: number
    provinceName: string
    districtId?: number
    districtName?: string
    wardId?: number
    wardName?: string
    fullAddress: string
    oldProvinceId?: number            // For province mergers
    newProvinceId?: number
  }
  addressConversion?: {               // Province merger tracking
    oldAddress: { province, district, ward, fullAddress }
    newAddress: { province, district, ward, fullAddress } | null
    hasChanges: boolean
    conversionMessage: string
    status: 'converted' | 'unchanged'
  }

  // Media
  images: PlaceImage[]                // See PlaceImage schema below
  video?: PlaceVideo                  // Max 1 video per place

  // Trust & Source
  trustLabel: "community" | "contributor" | "partner" | "verified" | "special_verified"
  source: {
    type: "user" | "partner" | "import"
    userId?: string
    partnerName?: string
    url?: string
  }

  // Status & Lifecycle
  status: "draft" | "submitted" | "in_review" | "published" | "rejected" |
          "hidden" | "pending_edit" | "pending_deletion" | "needs_revision" |
          "temporarily_suspended" | "draft_edit"
  createdAt: string
  updatedAt: string
  publishedAt?: string
  rejectedAt?: string
  rejectionReason?: string

  // Ownership & Moderation
  createdBy: string                   // User ID
  moderatedBy?: string                // User ID

  // Temporary Suspension
  suspendedAt?: string
  suspendedBy?: string
  suspensionReason?: string
  suspensionExpiresAt?: string
  suspensionType?: "violation" | "investigation" | "quality_review" | "user_request"

  // Rating & Reviews
  rating: {
    average: number                   // 1.0-5.0
    count: number                     // Total reviews
    breakdown: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }

  // Engagement Stats (Denormalized)
  viewCount: number
  likeCount: number
  reportCount: number
  featured: boolean                   // Featured on homepage
}

// Nested Schema
interface PlaceImage {
  id: string
  url: string                         // Firebase Storage URL
  alt: string                         // Alt text for SEO
  caption?: string
  isPrimary: boolean                  // true = cover image
  uploadedBy: string                  // User ID
  createdAt: string
  order?: number                      // Display order
}

interface PlaceVideo {
  id: string
  url: string                         // Firebase Storage or YouTube URL
  thumbnail?: string
  duration?: number                   // seconds
  uploadedBy: string
  createdAt: string
}
```

**Key Indexes:**
```json
// Popular queries
["status", "featured", "publishedAt"]        // Homepage featured places
["status", "region", "publishedAt"]          // Places by region
["status", "type", "publishedAt"]            // Places by type
["status", "province", "publishedAt"]        // Places by province
["createdBy", "status", "createdAt"]         // User's places
["trustLabel", "status", "publishedAt"]      // Verified places
```

**Relationships:**
- 1 Place → N Reviews (`place_reviews.placeId`)
- 1 Place → N Reports (`place_reports.placeId`)
- 1 Place → 1 Draft (`placeDrafts.contentId`)
- 1 Place → N Moderation Queue Items (`moderation_queue.contentId`)

**Security Rules:**
- Public read: `status == 'published'` AND NOT `temporarily_suspended`
- Create: Email verified users with `create_place` permission
- Update: Owner OR moderator/admin
- Delete: Soft delete only (moderator/admin)

---

### 3. `placeDrafts` - Draft & Submitted Places

**Purpose:** Work-in-progress places before moderation approval

**Schema:**
```typescript
interface PlaceDraft {
  // Inherits all fields from Place interface
  // Plus draft-specific fields:

  draftType: "new_place" | "edit_place"
  originalPlaceId?: string            // If editing existing place

  // Moderation workflow
  submittedAt?: string
  submittedFor: "review"              // Intent

  // Review history
  reviewHistory?: {
    action: "submitted" | "revision_requested" | "rejected"
    reason?: string
    moderatorId: string
    timestamp: string
  }[]
}
```

**Key Indexes:**
```json
["createdBy", "status", "createdAt"]         // User's drafts
["status", "submittedAt"]                    // Pending review queue
```

**Lifecycle:**
```
draft → submitted → in_review → approved (→ published in places collection)
                              → rejected (stays in drafts)
                              → needs_revision (user can edit)
```

**Security Rules:**
- Read: Owner OR moderator/admin
- Create: Contributors, partners, moderators, admins
- Update: Owner (if status allows) OR moderator/admin
- Delete: Owner OR admin

---

### 4. `moderation_queue` - Content Review Workflow

**Purpose:** Centralized queue for moderators to review content

**Schema:**
```typescript
interface ModerationQueueItem {
  id: string

  // Item Identification
  itemType: "place_submission" | "place_edit" | "place_deletion" | "place_reports_review"
  contentType: "place"
  contentId: string                   // Reference to places/placeDrafts doc
  itemId: string                      // Unique item ID

  // Status & Priority
  status: "pending" | "claimed" | "in_review" | "approved" | "rejected" | "escalated"
  priority: "urgent" | "high" | "medium" | "low"
  queueType: "partner_queue" | "contributor_queue"

  // Claim Mechanism (Anti-Race Condition)
  claimedBy?: string                  // Moderator user ID
  claimedAt?: string                  // ISO timestamp
  claimExpiresAt?: string             // Auto-release after 2 hours

  // Submission Data
  submittedBy: string                 // User ID
  submittedAt: string                 // ISO timestamp

  // Review Data
  reviewedBy?: string                 // Moderator user ID
  reviewedAt?: string                 // ISO timestamp
  reviewNotes?: string                // Moderator comments

  // Escalation (Moderator → Admin)
  escalatedTo?: "admin"
  escalatedAt?: string
  escalationReason?: string

  // Content Data (for edits)
  originalData?: any                  // Before edit
  editedData?: any                    // After edit

  // Metadata
  metadata?: {
    editDraftId?: string
    reason?: string
    [key: string]: any
  }
}
```

**State Machine (STRICT):**
```
pending → claimed → in_review → approved/rejected/needs_revision
(chờ)    (tiếp nhận) (đang duyệt)  (quyết định)
```

**Key Indexes:**
```json
["status", "priority", "submittedAt"]        // Moderation dashboard
["status", "queueType", "priority", "submittedAt"]  // Separate partner/contributor queues
["claimedBy", "status", "claimExpiresAt"]    // Moderator's claimed items
["status", "claimExpiresAt"]                 // Expired claims cleanup
```

**Workflow Rules:**
- ✅ Must claim before reviewing (prevents concurrent edits)
- ✅ Claim expires after 2 hours (auto-release to queue)
- ✅ Can only approve/reject from `in_review` status
- ✅ Moderators can escalate to Admin (not vice versa)
- ✅ Approved/Rejected items stay in queue for 30 days (audit trail)

**Security Rules:**
- Read: Moderators, admins
- Create: System only (automated from place submissions)
- Update: Moderators, admins (with status validation)

---

### 5. `moderation_logs` - Audit Trail

**Purpose:** Immutable log of all moderation actions

**Schema:**
```typescript
interface ModerationLog {
  id: string

  // Action Details
  action: "claim" | "start_review" | "approve" | "reject" | "escalate" |
          "request_revision" | "unclaim"

  // References
  queueItemId: string                 // moderation_queue doc ID
  contentId: string                   // places/placeDrafts doc ID
  contentType: "place"

  // Actor
  moderatorId: string
  moderatorName: string
  moderatorRole: string

  // Details
  reason?: string                     // For reject/escalate
  notes?: string                      // Additional comments

  // State Transition
  previousStatus: string
  newStatus: string

  // Timestamp
  createdAt: string                   // ISO timestamp
}
```

**Key Indexes:**
```json
["queueItemId", "createdAt"]                 // Item history
["moderatorId", "createdAt"]                 // Moderator activity
["action", "createdAt"]                      // Action analytics
```

**Security Rules:**
- Read: Moderators, admins
- Create: System only (append-only log)
- Update: NEVER (immutable)
- Delete: NEVER (permanent audit trail)

---

### 6. `moderation_archive` - Archived Queue Items

**Purpose:** Long-term storage for completed moderation items (>30 days)

**Schema:**
```typescript
// Same as ModerationQueueItem
// Moved here by scheduled Cloud Function after 30 days
```

**Key Indexes:**
```json
["archivedAt", "status"]                     // Cleanup old archives
["contentId", "archivedAt"]                  // Content history
```

**Lifecycle:**
- Approved/Rejected items in `moderation_queue` for 30 days
- Auto-archived to `moderation_archive` by daily cron job
- Kept in archive for 90 days
- Permanently deleted after 90 days in archive

**Security Rules:**
- Read: Admins only
- Create: System only
- Update: NEVER
- Delete: System only (scheduled cleanup)

---

### 7. `place_reviews` - User Reviews

**Purpose:** User-generated reviews and ratings for places

**Schema:**
```typescript
interface PlaceReview {
  id: string

  // References
  placeId: string                     // places doc ID
  placeName: string                   // Denormalized for performance
  userId: string

  // User Info (Denormalized)
  userInfo: {
    id: string
    name: string                      // "Người dùng ẩn danh" if anonymous
    role: string
    avatar?: string
  }

  // Review Content
  rating: number                      // 1-5 stars
  title?: string                      // Review title
  content: string                     // Review text (required)
  images?: string[]                   // Firebase Storage URLs
  visitDate?: string                  // ISO date when visited

  // Privacy & Verification
  isAnonymous: boolean                // Hide reviewer identity
  isVerified: boolean                 // Check-in verified (future)

  // Engagement
  helpfulCount: number                // How many found helpful
  reportCount: number                 // Abuse reports

  // Status
  status: 'published' | 'hidden' | 'pending'

  // Timestamps
  createdAt: string
  updatedAt: string

  // Moderation
  moderatedBy?: string                // If hidden by moderator
}
```

**Key Indexes:**
```json
["placeId", "status", "createdAt"]           // Place reviews (newest first)
["placeId", "status", "helpfulCount"]        // Most helpful
["placeId", "status", "rating"]              // Filter by rating
["userId", "status", "createdAt"]            // User's reviews
```

**Security Rules:**
- Read: Public (if `status == 'published'`)
- Create: Logged-in users
- Update: Owner (within 24h) OR moderator
- Delete: Soft delete only (set `status = 'hidden'`)

**Related Collections:**
- `review_helpful` - Vote tracking
- `review_reports` - Abuse reports

---

### 8. `review_helpful` - Helpful Votes

**Purpose:** Track which users found reviews helpful

**Schema:**
```typescript
interface ReviewHelpful {
  id: string                          // Auto-generated
  reviewId: string                    // place_reviews doc ID
  userId: string                      // Voter user ID
  createdAt: string                   // ISO timestamp
}
```

**Key Indexes:**
```json
["reviewId", "userId"]                       // Unique constraint
["userId", "createdAt"]                      // User's votes
```

**Security Rules:**
- Read: Public
- Create: Logged-in users (1 vote per review)
- Delete: Owner only (undo vote)

**Implementation Pattern:**
```typescript
// Atomic increment on vote
await db.runTransaction(async (transaction) => {
  // 1. Check if already voted
  const existingVote = await checkVote(reviewId, userId)
  if (existingVote) throw new Error('Already voted')

  // 2. Create vote record
  transaction.set(voteRef, { reviewId, userId, createdAt })

  // 3. Increment review.helpfulCount
  transaction.update(reviewRef, {
    helpfulCount: FieldValue.increment(1)
  })
})
```

---

### 9. `review_reports` - Review Abuse Reports

**Purpose:** Report inappropriate/spam reviews

**Schema:**
```typescript
interface ReviewReport {
  id: string

  // References
  reviewId: string                    // place_reviews doc ID
  placeId: string                     // For context

  // Reporter
  reportedBy: string                  // User ID
  reporterInfo: {
    id: string
    name: string
    email: string
    role: string
  }

  // Report Details
  reason: "spam" | "inappropriate" | "offensive" | "fake" | "unrelated" | "other"
  description?: string                // Additional details

  // Status
  status: "pending" | "in_review" | "resolved" | "dismissed"

  // Review (by moderator)
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  resolution?: string                 // What action was taken

  // Claim mechanism (similar to moderation_queue)
  claimedAt?: string
  reviewerInfo?: {
    id: string
    name: string
    email: string
    role: string
  }

  // Timestamps
  createdAt: string
  updatedAt: string
}
```

**Key Indexes:**
```json
["status", "createdAt"]                      // Pending reports
["reviewId", "reportedBy"]                   // Prevent duplicate reports
["reportedBy", "createdAt"]                  // User's reports (rate limit check)
```

**Security Rules:**
- Read: Moderators, admins
- Create: Logged-in users (rate limited: 3 reports/week)
- Update: Moderators, admins

**Important:** Review author is NOT notified until moderator takes action (prevent harassment).

---

### 10. `place_reports` - Place Abuse Reports

**Purpose:** Report incorrect info, spam, or inappropriate places

**Schema:**
```typescript
interface PlaceReport {
  id: string

  // References
  placeId: string
  placeName: string

  // Report Type
  reportType: 'incorrect_info' | 'inappropriate_content' | 'spam' | 'duplicate' | 'other'
  reason: string                      // User-provided reason
  description?: string                // Additional details

  // Reporter (Denormalized)
  reportedBy: string
  reporterInfo: {
    id: string
    name: string
    email: string
    role: string
  }

  // Status
  status: "pending" | "in_review" | "resolved" | "dismissed"

  // Review
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  resolution?: string

  // Claim mechanism
  claimedAt?: string
  reviewerInfo?: {
    id: string
    name: string
    email: string
    role: string
  }

  // Timestamps
  createdAt: string
  updatedAt: string
}
```

**Key Indexes:**
```json
["status", "createdAt"]                      // Pending reports queue
["placeId", "reportedBy"]                    // Prevent duplicate
["reportedBy", "createdAt"]                  // Rate limiting
```

**Security Rules:**
- Read: Moderators, admins
- Create: Logged-in users (rate limited)
- Update: Moderators, admins

---

### 11. `edit_suggestions` - User-Suggested Edits

**Purpose:** Users suggest edits to published places (not direct edit access)

**Schema:**
```typescript
interface EditSuggestion {
  id: string

  // References
  placeId: string
  placeName: string

  // Suggester
  suggestedBy: string
  suggesterInfo: {
    id: string
    name: string
    email: string
    role: string
  }

  // Suggested Changes
  changes: {
    field: string                     // "description", "address", etc.
    currentValue: any
    suggestedValue: any
    reason?: string                   // Why change is needed
  }[]
  description?: string                // Overall explanation

  // Status
  status: "pending" | "under_review" | "approved" | "rejected"

  // Review
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string

  // Timestamps
  createdAt: string
  updatedAt: string
}
```

**Key Indexes:**
```json
["status", "createdAt"]
["placeId", "status", "createdAt"]
```

**Workflow:**
1. User submits edit suggestion
2. Moderator reviews
3. If approved: Moderator applies changes to place
4. Suggester gets notification

---

### 12. `announcements` - System Announcements

**Purpose:** Admin announcements, feature updates, maintenance notices

**Schema:**
```typescript
interface Announcement {
  id?: string

  // Content
  title: string
  slug: string                        // URL-friendly
  content: string                     // Rich HTML from Tiptap editor
  excerpt?: string                    // Auto-generated or manual

  // Categorization
  type: 'announcement' | 'feature' | 'guide' | 'community' | 'maintenance' | 'event'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags?: string[]

  // Featured Image
  featuredImage?: {
    url: string
    alt: string
    width?: number
    height?: number
  }

  // Author (Denormalized)
  authorId: string
  authorName: string
  authorRole: string

  // Publishing
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  publishedAt?: string
  scheduledFor?: string               // Auto-publish at this time
  expiresAt?: string                  // Auto-archive after this

  // Display Control
  viewCount: number
  isPinned: boolean                   // Pin to top of list
  isFeatured: boolean                 // Show on homepage

  // SEO
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }

  // Targeting (future)
  targetAudience?: {
    roles?: string[]                  // Show only to specific roles
    regions?: string[]                // Show only in specific regions
  }

  // Timestamps
  createdAt: string
  updatedAt: string

  // Version Control
  version?: number
  lastEditedBy?: string
  lastEditedAt?: string
}
```

**Key Indexes:**
```json
["status", "isPinned", "priority", "publishedAt"]  // Homepage announcements
["status", "type", "publishedAt"]                  // Filter by type
["authorId", "status", "createdAt"]                // Author's announcements
```

**Auto-Publish Logic:**
```typescript
// Scheduled Cloud Function checks every hour
if (status === 'scheduled' && scheduledFor <= now) {
  update({ status: 'published', publishedAt: now })
}

if (status === 'published' && expiresAt <= now) {
  update({ status: 'archived' })
}
```

---

### 13. `team_members` - Team/Founder Profiles

**Purpose:** About page team section, founder profiles

**Schema:**
```typescript
interface TeamMember {
  id: string
  slug: string                        // URL-friendly (e.g., "nguyen-minh-hoang")

  // Identity
  fullName: string
  title: string                       // "Founder & Product Lead"
  avatar: string                      // Firebase Storage URL
  coverImage?: string                 // Header image for profile page

  // Bio
  bio: string                         // Short (150-200 chars) for About page
  longBio?: string                    // Extended for individual profile
  phone?: string                      // Public contact

  // Social Links
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    github?: string
    website?: string
    email?: string
  }

  // Expertise
  expertise: string[]                 // ["Product Strategy", "UX Design"]
  achievements?: string[]             // ["Founded 3 travel startups"]
  education?: {
    degree: string
    institution: string
    year?: string
    description?: string
  }[]

  // Display Control
  status: 'active' | 'inactive'       // Show/hide on public pages
  featured: boolean                   // Highlight on hero section
  displayOrder: number                // Sort order (0-999)

  // Organization
  department?: 'leadership' | 'product' | 'engineering' | 'marketing' |
               'operations' | 'community'
  joinedDate?: string                 // ISO date

  // SEO
  metaDescription?: string
  tags?: string[]

  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy: string                   // Admin user ID
  updatedBy: string
}
```

**Key Indexes:**
```json
["status", "displayOrder"]                   // Public team page
["status", "featured", "displayOrder"]       // Featured members
["department", "displayOrder"]               // Group by department
```

---

### 14. `ai_chat_logs` - AI Chatbot Usage Tracking

**Purpose:** Analytics for place-specific AI chatbot usage

**Schema:**
```typescript
interface AIChatLog {
  id: string

  // Context
  placeId: string                     // Which place was discussed
  placeName: string
  userId: string                      // Who asked
  userRole: string                    // For rate limit tracking

  // Question & Answer
  question: string                    // User's question
  answer: string                      // AI's response

  // Analytics
  responseTime: number                // Milliseconds
  tokensUsed: {
    input: number
    output: number
    total: number
  }
  cost: number                        // Estimated cost in USD

  // Session
  sessionId?: string                  // Group related Q&A

  // Quality Metrics
  wasHelpful?: boolean                // User feedback
  feedbackComment?: string

  // Error Tracking
  error?: boolean
  errorMessage?: string

  // Timestamp
  createdAt: string
}
```

**Key Indexes:**
```json
["placeId", "userId", "createdAt"]           // Rate limiting (10-50 Q/day)
["userId", "createdAt"]                      // User's total usage
["placeId", "createdAt"]                     // Place-specific analytics
["createdAt", "cost"]                        // Daily cost tracking
```

**Rate Limiting:**
- Traveler: 10 questions/day/place
- Contributor: 20 questions/day/place
- Partner: 50 questions/day/place
- Moderator/Admin: Unlimited

**Cost Tracking:**
- Gemini 2.0 Flash: ~$0.00026 per chat turn
- 10,000 chats/month = ~$2.60

---

### 15. `view_cache` - Session-Based View Tracking

**Purpose:** Prevent view count inflation (same user refreshing)

**Schema:**
```typescript
interface ViewCache {
  id: string                          // Format: {placeId}_{sessionId}
  placeId: string
  sessionId: string                   // IP + User-Agent hash
  viewedAt: string                    // ISO timestamp
  expiresAt: string                   // 1 hour from viewedAt (TTL)
}
```

**Key Indexes:**
```json
["expiresAt"]                                // Cleanup expired (Cloud Function)
["placeId", "sessionId"]                     // Check if already viewed
```

**Workflow:**
```typescript
// On place detail page load
const sessionId = hashSessionFingerprint(ip, userAgent)
const cacheKey = `${placeId}_${sessionId}`

const existingView = await getDoc(doc(db, 'view_cache', cacheKey))
if (!existingView.exists()) {
  // First view in this session
  await setDoc(doc(db, 'view_cache', cacheKey), {
    placeId,
    sessionId,
    viewedAt: now,
    expiresAt: now + 1 hour
  })

  // Increment viewCount
  await updateDoc(doc(db, 'places', placeId), {
    viewCount: FieldValue.increment(1)
  })
}
```

**Cleanup:**
- Scheduled Cloud Function runs daily
- Deletes documents where `expiresAt < now`

---

### 16. `suspension_schedules` - Auto-Restore for Suspended Places

**Purpose:** Automatically restore temporarily suspended places

**Schema:**
```typescript
interface SuspensionSchedule {
  id: string

  // References
  placeId: string
  placeName: string

  // Suspension Details
  suspendedAt: string
  suspendedBy: string                 // Moderator user ID
  suspensionReason: string
  suspensionType: "violation" | "investigation" | "quality_review" | "user_request"

  // Auto-Restore
  expiresAt: string                   // When to auto-restore
  duration: number                    // Hours
  autoRestore: boolean                // If false, manual restore required

  // Execution
  executed: boolean
  executedAt?: string

  // Timestamps
  createdAt: string
}
```

**Key Indexes:**
```json
["executed", "expiresAt"]                    // Pending auto-restore jobs
["placeId", "executed", "createdAt"]         // Place suspension history
```

**Scheduled Job:**
```typescript
// Runs every hour
const pendingRestores = await getDocs(
  query(
    collection(db, 'suspension_schedules'),
    where('executed', '==', false),
    where('expiresAt', '<=', now),
    where('autoRestore', '==', true)
  )
)

for (const schedule of pendingRestores.docs) {
  // Restore place
  await updateDoc(doc(db, 'places', schedule.data().placeId), {
    status: 'published',
    suspendedAt: FieldValue.delete(),
    suspensionReason: FieldValue.delete(),
    suspensionExpiresAt: FieldValue.delete()
  })

  // Mark as executed
  await updateDoc(schedule.ref, { executed: true, executedAt: now })
}
```

---

### 17. `deleted_places` - Soft-Deleted Places (120 Days Retention)

**Purpose:** Trash bin for deleted places (allow restore within 120 days)

**Schema:**
```typescript
interface DeletedPlace {
  id: string                          // Same as original place ID

  // Original Place Data (Complete Snapshot)
  originalData: Place                 // Full place object

  // Deletion Metadata
  deletedAt: string
  deletedBy: string                   // Moderator/admin user ID
  deletionReason: string
  deletionType: "moderation" | "admin_action" | "owner_request"

  // Auto-Delete Schedule
  permanentDeleteAt: string           // deletedAt + 120 days

  // Restore Tracking
  restored: boolean
  restoredAt?: string
  restoredBy?: string
}
```

**Key Indexes:**
```json
["restored", "permanentDeleteAt"]            // Pending permanent delete
["deletedBy", "deletedAt"]                   // Who deleted what
```

**Lifecycle:**
```
places (deleted) → deleted_places (120 days) → Permanently deleted
```

**Scheduled Cleanup:**
```typescript
// Daily cron job
const expiredDeletes = await getDocs(
  query(
    collection(db, 'deleted_places'),
    where('restored', '==', false),
    where('permanentDeleteAt', '<=', now)
  )
)

// Permanent deletion (can't undo)
for (const doc of expiredDeletes.docs) {
  await deleteDoc(doc.ref)
}
```

---

### 18. `admin_logs` - System Operation Logs

**Purpose:** Log cron jobs, background tasks, system events

**Schema:**
```typescript
interface AdminLog {
  id: string

  // Event Details
  eventType: "cron_job" | "background_task" | "system_event" | "error"
  operation: string                   // "cleanup_expired_claims", "archive_moderation_queue"

  // Status
  status: "started" | "completed" | "failed"

  // Details
  details?: {
    itemsProcessed?: number
    itemsSkipped?: number
    errors?: string[]
    duration?: number                 // Milliseconds
    [key: string]: any
  }

  // Error Tracking
  error?: {
    message: string
    stack?: string
    code?: string
  }

  // Timestamp
  createdAt: string
  completedAt?: string
}
```

**Key Indexes:**
```json
["eventType", "createdAt"]
["operation", "status", "createdAt"]
["status", "createdAt"]                      // Failed jobs
```

**Example Log:**
```typescript
{
  id: "log_12345",
  eventType: "cron_job",
  operation: "cleanup_expired_claims",
  status: "completed",
  details: {
    itemsProcessed: 15,
    itemsSkipped: 2,
    duration: 1523,
    errors: []
  },
  createdAt: "2025-01-23T02:00:00Z",
  completedAt: "2025-01-23T02:00:02Z"
}
```

---

### 19. `moderation_health_logs` - Queue Health Check Results

**Purpose:** Monitor moderation queue health (SLA, backlog, throughput)

**Schema:**
```typescript
interface ModerationHealthLog {
  id: string

  // Health Metrics
  totalPending: number
  totalClaimed: number
  totalInReview: number
  totalExpiredClaims: number

  // SLA Tracking
  avgTimeToReview: number             // Minutes
  itemsExceedingSLA: number           // Items pending > 24 hours

  // Priority Breakdown
  byPriority: {
    urgent: number
    high: number
    medium: number
    low: number
  }

  // Queue Type Breakdown
  byQueueType: {
    partner_queue: number
    contributor_queue: number
  }

  // Health Status
  healthStatus: "healthy" | "warning" | "critical"
  issues?: string[]                   // Detected problems

  // Timestamp
  checkedAt: string
}
```

**Key Indexes:**
```json
["checkedAt"]                                // Time-series data
["healthStatus", "checkedAt"]                // Critical health alerts
```

**Scheduled Health Check:**
```typescript
// Runs every 6 hours
const healthMetrics = await calculateQueueHealth()

if (healthMetrics.itemsExceedingSLA > 10) {
  healthStatus = 'critical'
  issues.push('More than 10 items exceeding 24h SLA')
}

if (healthMetrics.totalPending > 50) {
  healthStatus = 'warning'
  issues.push('Queue backlog exceeds 50 items')
}

await addDoc(collection(db, 'moderation_health_logs'), healthMetrics)

// Send alert to admin if critical
if (healthStatus === 'critical') {
  await sendAdminNotification(healthMetrics)
}
```

---

### 20. `rateLimits` - Rate Limiting (Functions Only)

**Purpose:** Server-side rate limiting for API endpoints

**Schema:**
```typescript
interface RateLimit {
  id: string                          // Format: {userId}_{endpoint}_{window}

  // Identification
  userId: string
  endpoint: string                    // "/api/ai/place-chat"
  windowStart: string                 // ISO timestamp (hour/day start)

  // Counters
  requestCount: number
  limit: number                       // Max allowed

  // Metadata
  lastRequestAt: string
  expiresAt: string                   // Window end time
}
```

**Key Indexes:**
```json
["userId", "endpoint", "windowStart"]        // Query user's usage
["expiresAt"]                                // Cleanup expired windows
```

**Implementation:**
```typescript
// AI chatbot rate limiting
const dailyLimit = getRateLimitByRole(userRole)  // 10, 20, 50, or unlimited
const key = `${userId}_place-chat_${placeId}_${today}`

const rateLimitDoc = await getDoc(doc(db, 'rateLimits', key))

if (rateLimitDoc.exists()) {
  if (rateLimitDoc.data().requestCount >= dailyLimit) {
    throw new Error('Rate limit exceeded')
  }

  await updateDoc(rateLimitDoc.ref, {
    requestCount: FieldValue.increment(1),
    lastRequestAt: now
  })
} else {
  await setDoc(doc(db, 'rateLimits', key), {
    userId,
    endpoint: 'place-chat',
    windowStart: startOfDay,
    requestCount: 1,
    limit: dailyLimit,
    lastRequestAt: now,
    expiresAt: endOfDay
  })
}
```

---

### 21-23. Itinerary Collections (DISABLED)

**Collections:**
- `itineraries` - Trip planning (disabled feature)
- `itinerary_likes` - Like tracking (disabled)
- `itinerary_saves` - Save tracking (disabled)

**Status:** Feature disabled after January 2025 due to insufficient data (see [@ai-features case study](../.claude/docs/features/ai-features.md))

**Schema Still Defined in Security Rules:**
```typescript
// firestore.rules
match /itineraries/{itineraryId} { allow read: if true; }
match /itinerary_likes/{likeId} { allow read: if true; }
match /itinerary_saves/{saveId} { allow read: if true; }
```

**Future Re-enablement Criteria:**
- 500+ published places
- User demand validation
- Cost modeling complete

---

## Relationships & Data Flow

### 1. User → Place Creation Flow

```
User (Contributor/Partner)
  ↓
Creates Draft → placeDrafts collection
  ↓
Submits for Review → moderation_queue (itemType: "place_submission")
  ↓
Moderator Claims → moderation_queue.status = "claimed"
  ↓
Reviews → moderation_queue.status = "in_review"
  ↓
Approves → places collection (status: "published")
            + moderation_logs (action: "approve")
            + notification to user
```

**Collections Involved:**
1. `users` - Author identity
2. `placeDrafts` - Work-in-progress
3. `moderation_queue` - Review workflow
4. `moderation_logs` - Audit trail
5. `places` - Final published content

---

### 2. Place → Review → Report Flow

```
User Views Place (places.id)
  ↓
Writes Review → place_reviews (placeId reference)
  ↓
  ├─ Other User Finds Helpful → review_helpful (atomic increment)
  │                             places.rating.count += 1
  │
  └─ User Reports Review → review_reports (reviewId reference)
                           ↓
                           Moderator Investigates
                           ↓
                           ├─ Dismisses → review_reports.status = "dismissed"
                           └─ Hides Review → place_reviews.status = "hidden"
```

**Collections Involved:**
1. `places` - Original content
2. `place_reviews` - User-generated reviews
3. `review_helpful` - Engagement tracking
4. `review_reports` - Moderation system

---

### 3. AI Chatbot Interaction Flow

```
User Opens Place Detail Page
  ↓
Clicks AI Chatbot Icon
  ↓
API: POST /api/ai/place-chat
  ↓
Rate Limit Check → rateLimits collection (userId + placeId + date)
  ↓
If Under Limit:
  ↓
  Genkit AI Flow → Generate Response
  ↓
  Log Usage → ai_chat_logs (question, answer, tokens, cost)
  ↓
  Return Response to User
```

**Collections Involved:**
1. `places` - Context for AI (100+ fields)
2. `rateLimits` - Prevent abuse (10-50 Q/day by role)
3. `ai_chat_logs` - Analytics & cost tracking

---

### 4. Moderation Queue State Machine

```
Place Submitted → moderation_queue (status: "pending")
  ↓
Moderator Claims → status: "claimed" (2h expiry)
  ↓              claimedBy: moderatorId
  ↓              claimExpiresAt: now + 2h
  ↓
Start Review → status: "in_review"
               ↓
               ├─ Approve → status: "approved"
               │            places.status = "published"
               │            notification to user
               │            stays in queue 30 days
               │            → moderation_archive after 30 days
               │
               ├─ Reject → status: "rejected"
               │           placeDrafts.status = "rejected"
               │           notification to user
               │           stays in queue 30 days
               │
               ├─ Request Revision → status: "needs_revision"
               │                     placeDrafts.status = "needs_revision"
               │                     user can edit
               │
               └─ Escalate (Moderator only) → status: "escalated"
                                               escalatedTo: "admin"
                                               admin reviews
```

**Claim Expiry Auto-Release:**
```
Scheduled Cloud Function (every 30 min)
  ↓
Query: status == "claimed" AND claimExpiresAt < now
  ↓
Transaction:
  ↓
  Re-fetch document (check status unchanged)
  ↓
  Update: status = "pending"
          claimedBy = DELETE
          claimedAt = DELETE
          claimExpiresAt = DELETE
```

---

### 5. View Tracking Anti-Inflation System

```
User Visits Place Detail Page
  ↓
Generate Session ID = hash(IP + User-Agent)
  ↓
Check view_cache: {placeId}_{sessionId}
  ↓
  ├─ EXISTS → Do nothing (already viewed in last 1 hour)
  │
  └─ NOT EXISTS → Create cache entry (expiresAt: now + 1h)
                  ↓
                  Increment places.viewCount (atomic)
                  ↓
                  Sync to RTDB (Firebase Function trigger)
```

**Why This Works:**
- Same user refreshing page = 1 view (not 100 views)
- Different users = Separate session IDs = Multiple views
- Cache expires after 1 hour = Daily active users counted accurately
- Firestore Transaction = Race-condition safe

**Collections Involved:**
1. `view_cache` - Deduplication (1h TTL)
2. `places` - viewCount field (denormalized)
3. Realtime Database - Real-time stats sync

---

### 6. Temporary Suspension Auto-Restore

```
Moderator Suspends Place (7 days)
  ↓
places.status = "temporarily_suspended"
places.suspendedAt = now
places.suspensionExpiresAt = now + 7 days
  ↓
Create suspension_schedules document:
  placeId: "place_123"
  expiresAt: now + 7 days
  autoRestore: true
  executed: false
  ↓
  ↓ [7 days pass]
  ↓
Scheduled Cloud Function (hourly)
  ↓
Query: executed == false AND expiresAt <= now AND autoRestore == true
  ↓
For each schedule:
  ↓
  Update places document:
    status = "published"
    DELETE suspendedAt
    DELETE suspensionReason
    DELETE suspensionExpiresAt
  ↓
  Update suspension_schedules:
    executed = true
    executedAt = now
  ↓
  Send notification to owner
```

---

### 7. Announcement Scheduled Publishing

```
Admin Creates Announcement
  ↓
status = "scheduled"
scheduledFor = "2025-01-25T10:00:00Z"
  ↓
  ↓ [Scheduled time arrives]
  ↓
Scheduled Cloud Function (hourly)
  ↓
Query: status == "scheduled" AND scheduledFor <= now
  ↓
Update:
  status = "published"
  publishedAt = now
  ↓
Send notifications to users (if priority == "high" or "urgent")
```

---

## Composite Indexes

**Total: 60+ Composite Indexes**

### Why So Many Indexes?

Firestore requires explicit composite indexes for queries with:
- Multiple `where()` clauses
- `where()` + `orderBy()` on different fields
- Array membership (`array-contains`) + other filters

### Key Index Categories:

#### 1. Moderation Queue (15 indexes)

```json
// Priority queue sorting
{
  "collectionGroup": "moderation_queue",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "priority", "order": "DESCENDING"},
    {"fieldPath": "submittedAt", "order": "ASCENDING"}
  ]
}

// Separate partner/contributor queues
{
  "collectionGroup": "moderation_queue",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "queueType", "order": "ASCENDING"},
    {"fieldPath": "priority", "order": "DESCENDING"},
    {"fieldPath": "submittedAt", "order": "ASCENDING"}
  ]
}

// Expired claims cleanup
{
  "collectionGroup": "moderation_queue",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "claimExpiresAt", "order": "ASCENDING"}
  ]
}
```

**Why Needed:**
- Moderator dashboard shows items by priority + date
- Separate tabs for pending/claimed/in_review require status filter
- Auto-cleanup requires date range queries

---

#### 2. Place Reviews (12 indexes)

```json
// Newest reviews for place
{
  "collectionGroup": "place_reviews",
  "fields": [
    {"fieldPath": "placeId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}

// Most helpful reviews
{
  "collectionGroup": "place_reviews",
  "fields": [
    {"fieldPath": "placeId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "helpfulCount", "order": "DESCENDING"}
  ]
}

// Filter by rating
{
  "collectionGroup": "place_reviews",
  "fields": [
    {"fieldPath": "placeId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "rating", "order": "DESCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

**Why Needed:**
- Sort reviews by newest, most helpful, highest/lowest rating
- Filter published reviews only
- Pagination requires cursor-based queries

---

#### 3. Places (10 indexes)

```json
// Featured places on homepage
{
  "collectionGroup": "places",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "featured", "order": "DESCENDING"},
    {"fieldPath": "publishedAt", "order": "DESCENDING"}
  ]
}

// Places by region
{
  "collectionGroup": "places",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "region", "order": "ASCENDING"},
    {"fieldPath": "publishedAt", "order": "DESCENDING"}
  ]
}

// Places by type
{
  "collectionGroup": "places",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "type", "order": "ASCENDING"},
    {"fieldPath": "publishedAt", "order": "DESCENDING"}
  ]
}

// User's places
{
  "collectionGroup": "places",
  "fields": [
    {"fieldPath": "createdBy", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

**Why Needed:**
- Homepage filters: region, type, featured
- User profile: show user's published + draft places
- Always exclude non-published unless admin/owner

---

#### 4. Announcements (8 indexes)

```json
// Pinned announcements first
{
  "collectionGroup": "announcements",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "isPinned", "order": "DESCENDING"},
    {"fieldPath": "priority", "order": "DESCENDING"},
    {"fieldPath": "publishedAt", "order": "DESCENDING"}
  ]
}

// Filter by type
{
  "collectionGroup": "announcements",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "type", "order": "ASCENDING"},
    {"fieldPath": "publishedAt", "order": "DESCENDING"}
  ]
}

// Scheduled announcements (auto-publish)
{
  "collectionGroup": "announcements",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "scheduledFor", "order": "ASCENDING"}
  ]
}
```

---

#### 5. AI Chat Logs (5 indexes)

```json
// Rate limiting check (userId + placeId)
{
  "collectionGroup": "ai_chat_logs",
  "fields": [
    {"fieldPath": "placeId", "order": "ASCENDING"},
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}

// Cost tracking by date
{
  "collectionGroup": "ai_chat_logs",
  "fields": [
    {"fieldPath": "createdAt", "order": "DESCENDING"},
    {"fieldPath": "cost", "order": "DESCENDING"}
  ]
}

// Place-specific analytics
{
  "collectionGroup": "ai_chat_logs",
  "fields": [
    {"fieldPath": "placeId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

---

#### 6. Reports (10 indexes)

```json
// Pending review reports
{
  "collectionGroup": "review_reports",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}

// Prevent duplicate reports
{
  "collectionGroup": "review_reports",
  "fields": [
    {"fieldPath": "reviewId", "order": "ASCENDING"},
    {"fieldPath": "reportedBy", "order": "ASCENDING"}
  ]
}

// Rate limiting (3 reports/week per user)
{
  "collectionGroup": "review_reports",
  "fields": [
    {"fieldPath": "reportedBy", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}

// Same for place_reports
```

---

### Index Deployment

**After modifying `firestore.indexes.json`:**

```bash
firebase deploy --only firestore:indexes
```

**Firestore Auto-Creates Single-Field Indexes:**
- Automatic for all fields used in `where()`, `orderBy()`
- No need to define in indexes.json

**When to Add Composite Index:**
1. Firestore error message tells you (with auto-generated link)
2. Before deploying query with 2+ filters
3. When adding new sort/filter combinations

**Index Build Time:**
- Small dataset (< 1000 docs): 1-5 minutes
- Medium (1000-10,000 docs): 10-30 minutes
- Large (> 10,000 docs): 1-2 hours

---

## Security Rules Architecture

### Role-Based Permission System

**6 User Roles (Hierarchical):**
```
Guest < Traveler < Contributor < Partner < Moderator < Admin
```

**Permission Inheritance:**
```javascript
// firestore.rules helper function
function hasPermission(permission) {
  let userRole = role();

  // Admin = all permissions
  if (userRole == 'admin') return true;

  // Role-specific permissions
  let rolePermissions = {
    'traveler': ['save_places', 'report_content', 'create_itinerary'],
    'contributor': ['save_places', 'report_content', 'create_place', 'manage_drafts'],
    'partner': ['save_places', 'report_content', 'create_place', 'manage_drafts',
                'partner_badge', 'fast_review'],
    'moderator': ['save_places', 'report_content', 'approve_content',
                  'reject_content', 'view_moderation_queue']
  };

  return permission in (rolePermissions[userRole] || []);
}
```

---

### Collection-Level Security Rules

#### 1. `users` Collection

```javascript
match /users/{userId} {
  // Anyone can read public profile fields
  allow read: if true;

  // Users can create their own profile during signup
  allow create: if request.auth.uid == userId
    && emailVerified()
    && request.resource.data.role == 'traveler';  // New users = traveler

  // Users can update their own profile (except role/permissions)
  allow update: if request.auth.uid == userId
    && !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(['role', 'permissions', 'verified', 'disabled']);

  // Admin can update any user
  allow update: if isAdmin();

  // No deletion (soft-delete via disabled field)
  allow delete: if false;
}
```

---

#### 2. `places` Collection

```javascript
match /places/{placeId} {
  // Public can read published places only
  allow read: if resource.data.status == 'published'
    && !resource.data.keys().hasAny(['suspendedAt']);  // Not suspended

  // Owner/moderator/admin can read all
  allow read: if isOwner(resource.data.createdBy)
    || isModerator()
    || isAdmin();

  // Create: Email verified + contributor+ role
  allow create: if emailVerified()
    && hasPermission('create_place')
    && request.resource.data.status == 'draft'
    && request.resource.data.createdBy == request.auth.uid;

  // Update: Owner can update draft, moderator can update any
  allow update: if (isOwner(resource.data.createdBy)
                    && resource.data.status in ['draft', 'needs_revision'])
    || isModerator()
    || isAdmin();

  // Delete: Moderator/admin only (soft-delete)
  allow delete: if isModerator() || isAdmin();
}
```

---

#### 3. `moderation_queue` Collection

```javascript
match /moderation_queue/{itemId} {
  // Only moderators/admins can read
  allow read: if isModerator() || isAdmin();

  // Create: System only (from Cloud Functions)
  allow create: if false;  // Client cannot create queue items

  // Update: Moderators can claim/review
  allow update: if (isModerator() || isAdmin())
    && validateStatusTransition();

  // Delete: System only (archive after 30 days)
  allow delete: if false;
}

function validateStatusTransition() {
  let oldStatus = resource.data.status;
  let newStatus = request.resource.data.status;

  // Strict state machine enforcement
  return (
    (oldStatus == 'pending' && newStatus == 'claimed') ||
    (oldStatus == 'claimed' && newStatus == 'in_review') ||
    (oldStatus == 'in_review' && newStatus in ['approved', 'rejected', 'needs_revision']) ||
    (oldStatus == 'in_review' && newStatus == 'escalated' && isModerator())  // Only moderator can escalate
  );
}
```

---

#### 4. `place_reviews` Collection

```javascript
match /place_reviews/{reviewId} {
  // Public can read published reviews
  allow read: if resource.data.status == 'published';

  // Owner/moderator can read all
  allow read: if isOwner(resource.data.userId)
    || isModerator()
    || isAdmin();

  // Create: Logged-in users only
  allow create: if emailVerified()
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.status == 'published';

  // Update: Owner (within 24h) OR moderator
  allow update: if (isOwner(resource.data.userId)
                    && request.time < resource.data.createdAt + duration.value(24, 'h'))
    || isModerator()
    || isAdmin();

  // Delete: Soft-delete only (moderator)
  allow delete: if isModerator() || isAdmin();
}
```

---

#### 5. `review_helpful` & `review_reports`

```javascript
match /review_helpful/{voteId} {
  // Public read
  allow read: if true;

  // Create: 1 vote per user per review
  allow create: if emailVerified()
    && request.resource.data.userId == request.auth.uid
    && !exists(/databases/$(database)/documents/review_helpful/$(request.resource.data.reviewId + '_' + request.auth.uid));

  // Delete: Owner only (undo vote)
  allow delete: if isOwner(resource.data.userId);
}

match /review_reports/{reportId} {
  // Only moderators can read
  allow read: if isModerator() || isAdmin();

  // Create: Logged-in users (rate limited in application code)
  allow create: if emailVerified()
    && request.resource.data.reportedBy == request.auth.uid;

  // Update: Moderators only
  allow update: if isModerator() || isAdmin();

  // No deletion
  allow delete: if false;
}
```

---

#### 6. `announcements` Collection

```javascript
match /announcements/{announcementId} {
  // Public can read published announcements
  allow read: if resource.data.status == 'published'
    || resource.data.status == 'scheduled';

  // Admins can read all
  allow read: if isAdmin();

  // Create/Update/Delete: Admins only
  allow create, update, delete: if isAdmin();
}
```

---

#### 7. System Collections (Admin/Functions Only)

```javascript
// Collections locked to Cloud Functions + Admin
match /moderation_logs/{logId} { allow read: if isModerator() || isAdmin(); allow write: if false; }
match /moderation_archive/{archiveId} { allow read: if isAdmin(); allow write: if false; }
match /deleted_places/{placeId} { allow read: if isAdmin(); allow write: if false; }
match /admin_logs/{logId} { allow read: if isAdmin(); allow write: if false; }
match /moderation_health_logs/{logId} { allow read: if isAdmin(); allow write: if false; }
match /rateLimits/{limitId} { allow read, write: if false; }  // Functions only
match /audits/{auditId} { allow read: if isAdmin(); allow write: if false; }
```

---

### Helper Functions

```javascript
function emailVerified() {
  return request.auth != null && request.auth.token.email_verified == true;
}

function isAuthenticated() {
  return request.auth != null;
}

function isOwner(ownerId) {
  return request.auth.uid == ownerId;
}

function role() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
}

function isModerator() {
  return role() in ['moderator', 'admin'];
}

function isAdmin() {
  return role() == 'admin';
}

function hasPermission(permission) {
  // Implementation shown above
}
```

---

### Field-Level Validation (Important Pattern)

**❌ WRONG - Too Restrictive:**
```javascript
allow create: if emailVerified()
  && request.resource.data.keys().hasAll(['field1', 'field2'])
```

**Problem:** `keys().hasAll([...])` checks for EXACTLY those keys and NO OTHERS
- Blocks additional metadata fields
- Causes 500 errors

**✅ CORRECT - Validate Individual Fields:**
```javascript
allow create: if emailVerified()
  && request.resource.data.field1 is string
  && request.resource.data.field2 is string
```

**Benefits:**
- Validates required fields AND correct type
- Allows extra metadata
- More flexible for schema evolution

---

### Firebase Admin SDK Behavior

**Key Fact:** **Firebase Admin SDK BYPASSES ALL Firestore security rules**

- Client SDK (browser/app) → Rules enforced
- Admin SDK (server/Cloud Functions) → Full access, NO rule checks
- If Admin SDK fails, check: network, credentials, data format, collection path - NOT rules
- Only check rules when client-side operations fail

---

## Denormalization Strategy

### Why Denormalize in NoSQL?

**SQL Approach:**
```sql
-- Get place with author info (JOIN)
SELECT places.*, users.name, users.avatar
FROM places
JOIN users ON places.createdBy = users.id
WHERE places.id = 'place_123'
```

**Firestore Limitation:**
- **No server-side JOINs** (by design for horizontal scaling)
- Must do 2 separate queries:
  ```typescript
  const place = await getDoc(doc(db, 'places', 'place_123'))
  const author = await getDoc(doc(db, 'users', place.data().createdBy))
  ```
- 2 network round-trips = Slower UX

**Denormalization Solution:**
```typescript
// Store author info directly in place document
{
  id: "place_123",
  name: "Hạ Long Bay",
  createdBy: "user_456",  // ← Foreign key
  authorInfo: {           // ← Denormalized data
    id: "user_456",
    name: "Nguyễn Văn A",
    avatar: "https://...",
    role: "contributor"
  }
}
```

**Benefits:**
- 1 query instead of 2 = Faster
- Reduced cost (1 read instead of 2)
- Better offline support

**Trade-off:**
- Must update denormalized data when source changes
- Increases storage (duplicate data)

---

### Denormalization Patterns in VietExplore-AI

#### 1. User Info in Reviews

```typescript
// place_reviews collection
{
  id: "review_123",
  placeId: "place_456",
  placeName: "Hạ Long Bay",      // ← Denormalized from places.name
  userId: "user_789",
  userInfo: {                    // ← Denormalized from users
    id: "user_789",
    name: "Trần Thị B",
    role: "traveler",
    avatar: "https://..."
  },
  rating: 5,
  content: "Amazing experience!"
}
```

**When to Update:**
- User changes name → Update all reviews by that user (batch job)
- Place name changes → Update all reviews for that place

**Implementation:**
```typescript
// Cloud Function trigger on user update
export const onUserUpdate = onDocumentUpdated('users/{userId}', async (event) => {
  const userId = event.params.userId
  const newData = event.data.after.data()

  // Update denormalized userInfo in all reviews
  const reviewsSnapshot = await getDocs(
    query(collection(db, 'place_reviews'), where('userId', '==', userId))
  )

  const batch = writeBatch(db)
  reviewsSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      'userInfo.name': newData.fullName,
      'userInfo.avatar': newData.avatar,
      'userInfo.role': newData.role
    })
  })

  await batch.commit()
})
```

---

#### 2. Stats Counters in Places

```typescript
// places collection
{
  id: "place_123",
  name: "Hạ Long Bay",
  viewCount: 15420,              // ← Denormalized from view_cache
  rating: {
    average: 4.7,                // ← Denormalized from place_reviews
    count: 342,
    breakdown: {
      5: 210,
      4: 95,
      3: 25,
      2: 8,
      1: 4
    }
  }
}
```

**Update Triggers:**
- New review → Recalculate rating stats
- View tracked → Increment viewCount

**Atomic Increment:**
```typescript
// Prevent race conditions with FieldValue.increment()
await updateDoc(doc(db, 'places', placeId), {
  viewCount: FieldValue.increment(1)
})

// DON'T do this (race condition):
const place = await getDoc(doc(db, 'places', placeId))
await updateDoc(doc(db, 'places', placeId), {
  viewCount: place.data().viewCount + 1  // ❌ Lost updates if concurrent
})
```

---

#### 3. Moderator Info in Reports

```typescript
// review_reports collection
{
  id: "report_123",
  reviewId: "review_456",
  reportedBy: "user_789",
  reporterInfo: {                // ← Denormalized
    id: "user_789",
    name: "User Name",
    email: "user@example.com",
    role: "traveler"
  },
  status: "in_review",
  claimedAt: "2025-01-23T10:00:00Z",
  reviewerInfo: {                // ← Denormalized (moderator who claimed)
    id: "mod_123",
    name: "Moderator Name",
    email: "mod@example.com",
    role: "moderator"
  }
}
```

**Why:**
- Audit trail even if user/moderator account deleted
- Faster query (no JOIN to users table)

---

#### 4. Place Name in Queue Items

```typescript
// moderation_queue collection
{
  id: "queue_123",
  itemType: "place_submission",
  contentId: "place_456",
  placeName: "Hạ Long Bay",      // ← Denormalized (for display in queue)
  submittedBy: "user_789",
  submitterInfo: {               // ← Denormalized
    id: "user_789",
    name: "User Name",
    role: "contributor"
  }
}
```

**Why:**
- Moderator sees place name without extra query
- Queue list performance (display 50 items = 1 query, not 51)

---

### Consistency Maintenance Strategies

#### 1. Cloud Functions (Event-Driven Updates)

```typescript
// Auto-update denormalized data on source change
export const syncUserDataToReviews = onDocumentUpdated('users/{userId}',
  async (event) => {
    // Update all reviews, reports, queue items with new user data
  }
)

export const syncPlaceNameToReviews = onDocumentUpdated('places/{placeId}',
  async (event) => {
    // Update all reviews with new place name
  }
)
```

**Pros:**
- Automatic, no manual intervention
- Eventual consistency (updates within seconds)

**Cons:**
- Cost: Each update triggers function
- Delay: 100ms - 2s lag

---

#### 2. Batch Jobs (Scheduled Cleanup)

```typescript
// Weekly consistency check
export const scheduledConsistencyCheck = onSchedule('every sunday 02:00',
  async (event) => {
    // Find inconsistent denormalized data
    // Fix mismatches
  }
)
```

**Use Cases:**
- Fix data drift from failed updates
- Migrate schema changes
- Audit trail verification

---

#### 3. Read-Time Fallback

```typescript
// Client-side: If denormalized data missing, fetch from source
const review = reviewDoc.data()
const userInfo = review.userInfo || await fetchUserInfo(review.userId)
```

**Pros:**
- Resilient to inconsistencies
- Handles legacy data without denormalization

**Cons:**
- Extra latency on cache miss
- More complex client logic

---

### When NOT to Denormalize

**❌ DON'T Denormalize:**
1. **Frequently Changing Data** - User's last login time (changes every session)
2. **Large Objects** - Entire place document in reviews (use ID reference)
3. **Transactional Data** - Payment records (must be consistent)
4. **Complex Relationships** - Many-to-many with frequent changes

**✅ DO Denormalize:**
1. **Display Names** - User names, place names (rarely change)
2. **Counters** - View counts, like counts (atomic increment)
3. **Immutable Data** - Created timestamps, author info at creation
4. **Performance-Critical** - Homepage featured places

---

## Performance Optimization

### 1. Query Optimization

#### Use Indexes Wisely

**❌ Slow Query:**
```typescript
// No index: Full collection scan
const places = await getDocs(
  query(
    collection(db, 'places'),
    where('status', '==', 'published'),
    orderBy('viewCount', 'desc')  // ← Firestore error: Missing index
  )
)
```

**✅ Fast Query:**
```typescript
// Add to firestore.indexes.json first:
// ["status", "viewCount"]

const places = await getDocs(
  query(
    collection(db, 'places'),
    where('status', '==', 'published'),
    orderBy('viewCount', 'desc'),
    limit(20)  // ← Always limit results
  )
)
```

---

#### Pagination with Cursors

**❌ Offset-Based (Slow for Large Datasets):**
```typescript
// Skip first 100 documents (reads them anyway!)
const page2 = await getDocs(
  query(
    collection(db, 'places'),
    orderBy('createdAt', 'desc'),
    limit(20),
    offset(100)  // ← Reads first 100 docs then discards
  )
)
```

**✅ Cursor-Based (Efficient):**
```typescript
// Page 1
const page1 = await getDocs(
  query(collection(db, 'places'), orderBy('createdAt', 'desc'), limit(20))
)

// Page 2: Start after last document from page 1
const lastDoc = page1.docs[page1.docs.length - 1]
const page2 = await getDocs(
  query(
    collection(db, 'places'),
    orderBy('createdAt', 'desc'),
    startAfter(lastDoc),  // ← Efficient cursor
    limit(20)
  )
)
```

**Why:**
- Offset reads N docs = Wasted reads = Higher cost
- Cursor jumps directly = 1 read per result

---

### 2. Real-Time Listeners (Use Sparingly)

**❌ Too Many Listeners:**
```typescript
// Every place card subscribes = 50 listeners on homepage!
places.map(place => {
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'places', place.id), (snap) => {
      updatePlaceStats(snap.data())
    })
    return unsubscribe
  }, [place.id])
})
```

**✅ Single Listener:**
```typescript
// 1 listener for all stats
useEffect(() => {
  const unsubscribe = onValue(
    ref(rtdb, 'places/stats'),  // ← Realtime Database (cheaper)
    (snapshot) => {
      updateAllPlaceStats(snapshot.val())
    }
  )
  return unsubscribe
}, [])
```

**Cost Comparison:**
- 50 Firestore listeners = 50 document reads/sec when active
- 1 RTDB listener = 1 connection (flat rate)

---

### 3. Batch Writes

**❌ Sequential Writes:**
```typescript
// 100 network requests (slow!)
for (const review of reviews) {
  await updateDoc(doc(db, 'place_reviews', review.id), { status: 'hidden' })
}
```

**✅ Batch Write:**
```typescript
// 1 network request (max 500 ops per batch)
const batch = writeBatch(db)
reviews.forEach(review => {
  batch.update(doc(db, 'place_reviews', review.id), { status: 'hidden' })
})
await batch.commit()  // ← Atomic, all-or-nothing
```

**Batch Limits:**
- Max 500 operations per batch
- Atomic: All succeed or all fail
- 1 network round-trip

**For > 500 Operations:**
```typescript
// Split into multiple batches
const batches = []
let currentBatch = writeBatch(db)
let opsCount = 0

reviews.forEach(review => {
  currentBatch.update(doc(db, 'place_reviews', review.id), { status: 'hidden' })
  opsCount++

  if (opsCount === 500) {
    batches.push(currentBatch.commit())
    currentBatch = writeBatch(db)
    opsCount = 0
  }
})

if (opsCount > 0) batches.push(currentBatch.commit())

await Promise.all(batches)  // ← Execute all batches in parallel
```

---

### 4. Caching Strategies

#### Client-Side Cache (Firestore SDK)

```typescript
// Enable offline persistence
enableIndexedDbPersistence(db)

// Queries served from cache when available
const places = await getDocs(
  query(collection(db, 'places')),
  { source: 'cache' }  // ← Try cache first, fallback to server
)
```

**Benefits:**
- Instant load from cache
- Works offline
- Automatic cache management

---

#### Application-Level Cache (React Query)

```typescript
import { useQuery } from '@tanstack/react-query'

const { data: places } = useQuery({
  queryKey: ['places', filters],
  queryFn: () => fetchPlaces(filters),
  staleTime: 5 * 60 * 1000,  // ← 5 minutes cache
  cacheTime: 30 * 60 * 1000  // Keep in memory 30 min
})
```

**When to Use:**
- API responses (not direct Firestore)
- Expensive computations
- Cross-component data sharing

---

#### Firebase Realtime Database for Hot Data

```typescript
// Firestore: Source of truth (structured queries)
await updateDoc(doc(db, 'places', placeId), { viewCount: 1523 })

// RTDB: Real-time sync (denormalized for speed)
await set(ref(rtdb, `places/${placeId}/stats`), {
  viewCount: 1523,
  likeCount: 42,
  saveCount: 15
})

// Client subscribes to RTDB (cheaper, faster)
onValue(ref(rtdb, `places/${placeId}/stats`), (snapshot) => {
  updateUI(snapshot.val())
})
```

**Why Hybrid:**
- Firestore: Complex queries, transactions, security rules
- RTDB: Real-time counters, presence, ephemeral data

---

### 5. Image Optimization

**Firebase Storage + Auto-Resize:**
```typescript
// Upload original image
const uploadTask = uploadBytes(ref(storage, `places/${userId}/${filename}`), file)

// Cloud Function trigger: Auto-resize
export const onImageUpload = onObjectFinalized('places/{userId}/{filename}',
  async (event) => {
    // Resize to 1200x800, quality 80%
    const resized = await sharp(imageBuffer)
      .resize(1200, 800, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer()

    await uploadBytes(ref(storage, `places/${userId}/${filename}_1200x800`), resized)
  }
)
```

**Benefits:**
- Faster page load (smaller images)
- Lower bandwidth cost
- Progressive image loading

---

### 6. Bundle Size Optimization

**Tree Shaking (Import Only What You Need):**

**❌ Full SDK Import:**
```typescript
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
// Bundle: ~500KB
```

**✅ Modular SDK (v9+):**
```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
// Bundle: ~200KB (tree-shaken)
```

---

### 7. Security Rules Performance

**❌ Expensive Rule:**
```javascript
// Gets ALL reviews every time (slow!)
allow read: if get(/databases/$(database)/documents/place_reviews/$(placeId))
  .data.reviewCount > 10;
```

**✅ Denormalized Field:**
```javascript
// Read single field from current document (fast)
allow read: if resource.data.reviewCount > 10;
```

**Rule of Thumb:**
- Avoid `get()` in security rules (extra read)
- Use denormalized data in document
- Keep rules simple (evaluated on every request)

---

## Trade-offs & Limitations

### 1. No Server-Side JOINs

**Limitation:**
```typescript
// SQL: Get places with author details
SELECT places.*, users.name, users.avatar
FROM places JOIN users ON places.createdBy = users.id
WHERE places.region = 'bac-bo'

// Firestore: Must do 2 queries
const places = await getDocs(
  query(collection(db, 'places'), where('region', '==', 'bac-bo'))
)

const userIds = [...new Set(places.docs.map(p => p.data().createdBy))]
const users = await Promise.all(
  userIds.map(id => getDoc(doc(db, 'users', id)))
)
```

**Workaround:** Denormalization (store author info in place document)

**When This Hurts:**
- Complex reports (e.g., "Top contributors by region with avg rating")
- Ad-hoc analytics queries
- Data warehouse scenarios

---

### 2. Limited Aggregation Queries

**SQL:**
```sql
SELECT region, AVG(rating) as avg_rating, COUNT(*) as total
FROM places
GROUP BY region
```

**Firestore:**
```typescript
// No built-in GROUP BY or AVG()
// Must fetch all documents and aggregate client-side
const places = await getDocs(collection(db, 'places'))
const byRegion = places.docs.reduce((acc, doc) => {
  const { region, rating } = doc.data()
  if (!acc[region]) acc[region] = { total: 0, sumRating: 0 }
  acc[region].total++
  acc[region].sumRating += rating.average
  return acc
}, {})

const stats = Object.entries(byRegion).map(([region, data]) => ({
  region,
  avgRating: data.sumRating / data.total,
  total: data.total
}))
```

**Workarounds:**
1. **Pre-aggregate in Cloud Functions** (scheduled job updates stats collection)
2. **BigQuery Export** (Firestore → BigQuery for complex analytics)
3. **Hybrid Approach** (Firestore for app, PostgreSQL for reports)

---

### 3. Complex Queries Require Indexes

**Limitation:**
Every unique query pattern needs a composite index.

**Example:**
```typescript
// Query 1: Filter by region + type
query(collection(db, 'places'),
  where('region', '==', 'bac-bo'),
  where('type', '==', 'bien')
)
// ← Needs index: ["region", "type"]

// Query 2: Filter by region + sort by date
query(collection(db, 'places'),
  where('region', '==', 'bac-bo'),
  orderBy('publishedAt', 'desc')
)
// ← Needs index: ["region", "publishedAt"]

// Query 3: Filter by region + type + sort by date
query(collection(db, 'places'),
  where('region', '==', 'bac-bo'),
  where('type', '==', 'bien'),
  orderBy('publishedAt', 'desc')
)
// ← Needs index: ["region", "type", "publishedAt"]
```

**Impact:**
- 60+ indexes in this project
- Index build time (10-30 min for medium datasets)
- Storage cost (indexes stored separately)

**SQL Comparison:**
- Most queries work without explicit indexes
- Indexes improve performance, not a requirement

---

### 4. Transactions Limited to 500 Documents

**Firestore Transaction Limits:**
- Max 500 document operations
- 10MB max size
- Read-only documents counted toward limit

**Example:**
```typescript
// ❌ FAILS if > 500 reviews
await db.runTransaction(async (transaction) => {
  const reviews = await transaction.get(
    query(collection(db, 'place_reviews'), where('placeId', '==', placeId))
  )

  reviews.docs.forEach(doc => {
    transaction.update(doc.ref, { placeName: newName })
  })
})
```

**Workaround: Batch Multiple Transactions:**
```typescript
const reviews = await getDocs(
  query(collection(db, 'place_reviews'), where('placeId', '==', placeId))
)

// Split into chunks of 500
const chunks = []
for (let i = 0; i < reviews.docs.length; i += 500) {
  chunks.push(reviews.docs.slice(i, i + 500))
}

for (const chunk of chunks) {
  await db.runTransaction(async (transaction) => {
    chunk.forEach(doc => {
      transaction.update(doc.ref, { placeName: newName })
    })
  })
}
```

**Note:** Not atomic across chunks (trade-off for large operations)

---

### 5. No Full-Text Search

**Limitation:**
```typescript
// ❌ Can't do this in Firestore
query(collection(db, 'places'),
  where('description', 'contains', 'biển đẹp')  // No text search operator
)
```

**Workarounds:**

#### Option 1: Algolia (Third-Party Search)
```typescript
// Sync Firestore → Algolia (Cloud Function)
export const syncToAlgolia = onDocumentWritten('places/{placeId}',
  async (event) => {
    await algoliaIndex.saveObject({
      objectID: event.params.placeId,
      ...event.data.after.data()
    })
  }
)

// Client-side search
const results = await algoliaIndex.search('biển đẹp')
```

**Cost:** ~$1/month for 10,000 records

#### Option 2: Tag-Based Search (Current Implementation)
```typescript
// Store searchable tags in array
{
  name: "Vịnh Hạ Long",
  tags: ["biển", "đẹp", "ha-long", "quang-ninh", "unesco"],
  searchTerms: ["vinh ha long", "ha long bay"]
}

// Query
query(collection(db, 'places'),
  where('tags', 'array-contains', 'biển')
)
```

**Limitation:** Only 1 `array-contains` per query

#### Option 3: Firestore Data Connect + PostgreSQL (2025 GA)
```typescript
// Future: Firebase Data Connect (SQL-like queries on Firestore data)
SELECT * FROM places WHERE description LIKE '%biển đẹp%'
```

**Status:** GA April 2025, still in beta as of January 2025

---

### 6. Cost at Scale

**Firestore Pricing (2025):**
- Reads: $0.036 per 100,000 documents
- Writes: $0.108 per 100,000 documents
- Deletes: $0.012 per 100,000 documents
- Storage: $0.18/GB/month

**Real-World Cost Scenario:**

| Monthly Activity | Reads | Writes | Storage | Monthly Cost |
|------------------|-------|--------|---------|--------------|
| 10,000 users | 5M | 500K | 10GB | $3-5 |
| 100,000 users | 50M | 5M | 50GB | $30-50 |
| 1M users | 500M | 50M | 200GB | $250-350 |

**Optimization Tips:**
1. Use Realtime Database for hot counters (cheaper)
2. Cache frequently accessed data (reduce reads)
3. Batch writes (reduce write count)
4. Delete unused data (reduce storage)
5. Implement pagination (limit query results)

**When Firestore Becomes Expensive:**
- High read/write volume (> 100M/month)
- Large documents (> 1MB average)
- Many real-time listeners (> 1000 concurrent)

**Alternative at Scale:**
- PostgreSQL: ~$200/month for dedicated server (unlimited reads/writes)
- MongoDB Atlas: ~$100-300/month (similar NoSQL benefits)

---

## Migration Considerations

### Firestore → SQL Migration Path

**Scenario:** When to consider migrating away from Firestore

**Triggers:**
1. **Cost Exceeds Budget** - Firestore bills > $500/month
2. **Complex Analytics Needed** - Business intelligence, data warehouse
3. **Compliance Requirements** - On-premise data storage mandates
4. **Performance Issues** - Query patterns don't fit Firestore model

---

### Migration Strategy

#### Phase 1: Dual-Write (No Downtime)

```typescript
// Write to both Firestore and PostgreSQL
async function createPlace(placeData) {
  // Write to Firestore (existing)
  const firestoreDoc = await addDoc(collection(db, 'places'), placeData)

  // Write to PostgreSQL (new)
  await pgPool.query(
    'INSERT INTO places (id, name, region, ...) VALUES ($1, $2, $3, ...)',
    [firestoreDoc.id, placeData.name, placeData.region, ...]
  )

  return firestoreDoc
}
```

#### Phase 2: Backfill Historical Data

```typescript
// One-time migration script
const places = await getDocs(collection(db, 'places'))

for (const place of places.docs) {
  await pgPool.query(
    'INSERT INTO places ... VALUES ...',
    [place.id, ...Object.values(place.data())]
  )
}
```

#### Phase 3: Read from SQL (Gradual Rollout)

```typescript
// Feature flag: 10% traffic reads from PostgreSQL
const useSQL = Math.random() < 0.1

if (useSQL) {
  const result = await pgPool.query('SELECT * FROM places WHERE id = $1', [placeId])
  return result.rows[0]
} else {
  return (await getDoc(doc(db, 'places', placeId))).data()
}
```

#### Phase 4: Stop Writing to Firestore

```typescript
// All reads/writes go to PostgreSQL
// Keep Firestore read-only for 30 days (rollback safety)
```

#### Phase 5: Archive Firestore Data

```typescript
// Export Firestore to Cloud Storage (backup)
// Delete Firestore collections
```

---

### Hybrid Architecture (Best of Both Worlds)

**Current Trend (2025):**

Many production systems use **Firestore + PostgreSQL hybrid**:

```
Firestore (Real-Time App Data)
  ├─ User sessions, notifications
  ├─ Real-time chat, live updates
  ├─ Mobile offline-first features
  └─ Write-heavy workloads

PostgreSQL (Analytics & Complex Queries)
  ├─ Business intelligence reports
  ├─ Data warehouse (historical analysis)
  ├─ JOIN-heavy queries
  └─ Transactional guarantees

Sync Strategy:
  Firestore → Cloud Functions → PostgreSQL (near real-time ETL)
```

**VietExplore-AI Future Architecture:**

```
Firestore:
  - places (for app queries)
  - users (authentication, profiles)
  - moderation_queue (real-time workflow)
  - notifications (real-time updates)

PostgreSQL:
  - places_analytics (aggregated stats)
  - user_analytics (cohort analysis)
  - financial_reports (revenue tracking)
  - SEO_data (structured data for crawlers)

BigQuery:
  - Long-term data warehouse (> 1 year old data)
  - Complex multi-table analytics
  - ML training datasets
```

---

## Kết Luận

### Tại Sao Firestore Là Lựa Chọn Đúng Đắn Cho VietExplore-AI

**Điểm Mạnh Phù Hợp:**

1. ✅ **Real-Time = Core Feature** - Moderation queue, notifications, place stats
2. ✅ **Offline-First PWA** - Du lịch = Weak network areas
3. ✅ **Auto-Scaling** - Viral content spikes không cần DevOps
4. ✅ **Firebase Ecosystem** - Auth, Storage, Functions tích hợp sẵn
5. ✅ **Flexible Schema** - Travel content đa dạng (biển, núi, văn hóa)
6. ✅ **Cost-Effective at Current Scale** - $3-5/month cho 10K users

**Điểm Yếu Có Thể Chấp Nhận:**

1. ⚠️ **No JOINs** → Denormalization strategy (documented)
2. ⚠️ **No Aggregations** → Pre-aggregate with Cloud Functions
3. ⚠️ **No Full-Text Search** → Algolia integration planned (Phase 2)
4. ⚠️ **Cost at Scale** → Monitor usage, optimize queries, hybrid approach if needed

**Khi Nào Cần Xem Xét SQL:**

- Monthly Firestore bill > $500
- Need complex business intelligence reports
- Compliance requires on-premise database
- User base > 500K (consider hybrid Firestore + PostgreSQL)

**Kết Luận:**
Firestore là lựa chọn **tối ưu cho giai đoạn hiện tại** (startup, MVP, scaling to 100K users). Kiến trúc NoSQL document-based phù hợp với real-time features, offline support, và flexible travel content schema. Với 60+ composite indexes và denormalization strategy, dự án đã tối ưu hóa performance trong giới hạn của Firestore.

---

**Tài liệu được tạo:** 2025-01-23
**Cập nhật gần nhất:** 2025-01-23
**Phiên bản Database:** Firestore (NoSQL)
**Collections:** 23 collections, 60+ composite indexes
**Cloud Functions:** 10 functions (3 triggers, 5 scheduled, 2 callable)

---

## Tài Liệu Tham Khảo

- [Cloud Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Data Modeling Best Practices](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Firebase Pricing Calculator](https://firebase.google.com/pricing)
- [Firestore vs PostgreSQL Comparison (2025)](https://cloud.google.com/blog/products/databases)
- [NoSQL Database Design Patterns](https://www.mongodb.com/nosql-explained/data-modeling)
- [@firebase-functions Documentation](./core/firebase-functions.md)
- [@architecture Documentation](../.claude/docs/core/architecture.md)

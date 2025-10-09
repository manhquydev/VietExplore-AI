# API, Database, Security & Performance - Du Lịch Việt

> **Phiên bản:** 3.0.0
> **Ngày cập nhật:** Tháng 10, 2025

---

## Mục Lục

1. [API Documentation](#1-api-documentation)
2. [Database Schema Chi Tiết](#2-database-schema-chi-tiết)
3. [Security Best Practices](#3-security-best-practices)
4. [Performance Optimization](#4-performance-optimization)
5. [Monitoring & Logging](#5-monitoring--logging)
6. [Error Handling](#6-error-handling)
7. [Rate Limiting](#7-rate-limiting)
8. [Backup & Recovery](#8-backup--recovery)

---

## 1. API Documentation

### 1.1. API Response Format

**Standard Success Response:**
```json
{
  "success": true,
  "data": { ... } | [ ... ],
  "message": "Operation successful",
  "total": 100
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error"
  }
}
```

### 1.2. Authentication Endpoints

#### `POST /api/auth/register`
Register new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "displayName": "Nguyen Van A"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "displayName": "Nguyen Van A",
      "role": "traveler",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
  },
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
}
```

**Validation:**
- Email: Valid email format
- Password: Min 8 characters
- DisplayName: Min 2 characters

---

#### `POST /api/auth/login`
Login existing user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
  }
}
```

**Error Codes:**
- `INVALID_CREDENTIALS` - Email hoặc mật khẩu không đúng
- `EMAIL_NOT_VERIFIED` - Email chưa được xác thực
- `ACCOUNT_DISABLED` - Tài khoản bị vô hiệu hóa

---

#### `GET /api/auth/me`
Get current user info

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "displayName": "Nguyen Van A",
    "role": "contributor",
    "emailVerified": true,
    "stats": {
      "placesCreated": 10,
      "reviewsWritten": 25,
      "helpfulVotes": 50
    }
  }
}
```

---

### 1.3. Places Endpoints

#### `GET /api/places`
Get published places with filters

**Query Parameters:**
- `region` (optional): `bac-bo` | `trung-bo` | `nam-bo`
- `type` (optional): `bien` | `nui` | `van-hoa` | `am-thuc` | `check-in`
- `province` (optional): Province slug
- `search` (optional): Search term
- `sortBy` (optional): `newest` | `oldest` | `rating` | `popular`
- `limit` (optional): Number (default: 20, max: 100)
- `offset` (optional): Number (for pagination)

**Example Request:**
```
GET /api/places?region=bac-bo&type=bien&limit=20&sortBy=rating
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ha-long-bay-abc123",
      "name": "Vịnh Hạ Long",
      "slug": "vinh-ha-long-quang-ninh",
      "description": "Di sản thiên nhiên thế giới...",
      "province": "Quảng Ninh",
      "region": "bac-bo",
      "type": "bien",
      "images": [
        {
          "url": "https://firebasestorage.googleapis.com/...",
          "isPrimary": true
        }
      ],
      "stats": {
        "averageRating": 4.8,
        "totalReviews": 150,
        "totalSaves": 320
      },
      "viewCount": 15420,
      "trustLabel": "verified"
    }
  ],
  "total": 156,
  "offset": 0,
  "limit": 20
}
```

---

#### `GET /api/places/[id]`
Get single place by ID + increment view count

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ha-long-bay-abc123",
    "name": "Vịnh Hạ Long",
    "slug": "vinh-ha-long-quang-ninh",
    "description": "Full description with rich text...",
    "province": "Quảng Ninh",
    "district": "Hạ Long",
    "address": "Thành phố Hạ Long, Quảng Ninh",
    "coordinates": {
      "lat": 20.9101,
      "lng": 107.1839
    },
    "region": "bac-bo",
    "type": "bien",
    "images": [ ... ],
    "openingHours": {
      "monday": "08:00 - 18:00",
      "tuesday": "08:00 - 18:00"
    },
    "entryFee": {
      "adult": 150000,
      "child": 75000,
      "note": "Giá vé tham quan"
    },
    "facilities": ["Bãi đỗ xe", "Nhà vệ sinh", "Wifi"],
    "bestTimeToVisit": "Tháng 3-5, 9-11",
    "viewCount": 15421,
    "stats": {
      "totalReviews": 150,
      "averageRating": 4.8,
      "totalSaves": 320,
      "totalLikes": 450
    },
    "trustLabel": "verified",
    "createdBy": "user_xyz789",
    "createdAt": "2024-12-01T10:00:00Z",
    "publishedAt": "2024-12-02T15:30:00Z"
  }
}
```

---

#### `POST /api/places/drafts`
Create new place draft (Requires: `create_place` permission)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Bãi Biển Mỹ Khê",
  "description": "Một trong những bãi biển đẹp nhất Việt Nam...",
  "province": "Đà Nẵng",
  "district": "Sơn Trà",
  "address": "Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng",
  "region": "trung-bo",
  "type": "bien",
  "images": [
    {
      "url": "https://firebasestorage.googleapis.com/...",
      "alt": "Bãi Biển Mỹ Khê",
      "isPrimary": true
    }
  ],
  "facilities": ["Bãi đỗ xe", "Nhà vệ sinh", "Dịch vụ thuê dù"],
  "bestTimeToVisit": "Tháng 3-8"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "draft_new123",
    "name": "Bãi Biển Mỹ Khê",
    "status": "draft",
    "createdBy": "user_abc123",
    "createdAt": "2025-01-06T10:00:00Z"
  },
  "message": "Tạo nháp thành công! Bạn có thể tiếp tục chỉnh sửa."
}
```

---

#### `POST /api/places/drafts/[draftId]/submit`
Submit draft for moderation

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "draft_new123",
    "status": "submitted",
    "submittedAt": "2025-01-06T11:00:00Z"
  },
  "message": "Gửi kiểm duyệt thành công! Chúng tôi sẽ xem xét trong vòng 24-48 giờ."
}
```

---

#### `POST /api/places/[id]/favorite`
Save/unsave place (Toggle)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isFavorited": true
  },
  "message": "Đã lưu địa điểm vào danh sách yêu thích"
}
```

---

### 1.4. Review Endpoints

#### `POST /api/places/[id]/reviews`
Create review for place

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "rating": 5,
  "title": "Cảnh đẹp, dịch vụ tốt",
  "content": "Tôi đã có một trải nghiệm tuyệt vời tại đây. Cảnh quan rất đẹp...",
  "visitDate": "2025-01-01",
  "tripType": "family",
  "images": [
    "https://firebasestorage.googleapis.com/..."
  ],
  "isAnonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "review_abc123",
    "placeId": "ha-long-bay-abc123",
    "rating": 5,
    "content": "...",
    "userInfo": {
      "id": "user_abc123",
      "name": "Nguyen Van A",
      "avatar": "https://..."
    },
    "helpfulCount": 0,
    "createdAt": "2025-01-06T12:00:00Z"
  },
  "message": "Cảm ơn bạn đã chia sẻ đánh giá!"
}
```

---

#### `POST /api/reviews/[id]/helpful`
Vote review as helpful (Toggle)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isHelpful": true,
    "helpfulCount": 15
  }
}
```

---

#### `POST /api/reviews/[id]/report`
Report inappropriate review

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "reason": "spam",
  "details": "Đây là quảng cáo sản phẩm không liên quan"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Báo cáo của bạn đã được ghi nhận. Chúng tôi sẽ xem xét trong thời gian sớm nhất."
}
```

**Rate Limit:** 3 reports per user per week

---

### 1.5. Moderation Endpoints

#### `GET /api/moderation/queue`
Get moderation queue items (Requires: Moderator/Admin role)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): `pending` | `claimed` | `in_review` | `approved` | `rejected`
- `priority` (optional): `urgent` | `high` | `medium` | `low`
- `limit` (optional): Number (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "queue_item_123",
      "contentType": "place",
      "contentId": "draft_new123",
      "status": "pending",
      "priority": "medium",
      "submittedBy": "user_abc123",
      "submitterRole": "contributor",
      "submittedAt": "2025-01-06T10:00:00Z",
      "content": {
        "name": "Bãi Biển Mỹ Khê",
        "province": "Đà Nẵng"
      }
    }
  ],
  "total": 45
}
```

---

#### `POST /api/moderation/queue/[itemId]?action=claim`
Claim moderation item

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "queue_item_123",
    "status": "claimed",
    "claimedBy": "moderator_xyz",
    "claimedAt": "2025-01-06T14:00:00Z",
    "claimExpiresAt": "2025-01-06T16:00:00Z"
  },
  "message": "Đã tiếp nhận item. Bạn có 2 giờ để xử lý."
}
```

---

#### `POST /api/moderation/queue/[itemId]?action=approve`
Approve content

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "queue_item_123",
    "status": "approved",
    "placeId": "ha-long-bay-abc123",
    "placeSlug": "vinh-ha-long-quang-ninh"
  },
  "message": "Địa điểm đã được duyệt và hiển thị công khai."
}
```

---

### 1.6. AI Endpoints

#### `POST /api/ai/place-chat`
Place-specific AI chatbot

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "placeId": "ha-long-bay-abc123",
  "messages": [
    {
      "role": "user",
      "content": "Địa điểm này có gì đặc biệt?"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Vịnh Hạ Long là Di sản Thiên nhiên Thế giới được UNESCO công nhận với hơn 1,600 hòn đảo đá vôi. Đặc biệt nổi bật với các hang động tuyệt đẹp như Hang Sửng Sốt, Hang Đầu Gỗ..."
  }
}
```

**Rate Limit:** 10 Q&A per day per place per user

---

## 2. Database Schema Chi Tiết

### 2.1. Collection: `users`

```typescript
interface User {
  // Identity
  id: string;                    // Firebase UID
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;

  // Role & Permissions
  role: 'guest' | 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';
  emailVerified: boolean;

  // Profile
  province?: string;
  phone?: string;
  dateOfBirth?: string;

  // Stats
  stats: {
    placesCreated: number;
    placesPublished: number;
    reviewsWritten: number;
    helpfulVotes: number;
    totalViews: number;
  };

  // Badges
  badges: string[];              // ['early_adopter', 'top_contributor']

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;

  // Status
  status: 'active' | 'suspended' | 'banned';
  suspendedUntil?: Timestamp;
  banReason?: string;
}
```

**Indexes:**
```json
[
  { "fields": ["role", "createdAt"] },
  { "fields": ["status", "createdAt"] },
  { "fields": ["emailVerified", "role"] }
]
```

---

### 2.2. Collection: `places`

```typescript
interface Place {
  // Basic Info
  id: string;
  name: string;
  slug: string;
  description: string;           // Rich text/HTML

  // Location
  province: string;
  district?: string;
  ward?: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Classification
  region: 'bac-bo' | 'trung-bo' | 'nam-bo';
  type: 'bien' | 'nui' | 'van-hoa' | 'am-thuc' | 'check-in';
  tags: string[];                // ['family-friendly', 'budget']

  // Media
  images: PlaceImage[];
  videos?: string[];             // YouTube/Vimeo URLs

  // Details
  openingHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  entryFee?: {
    adult?: number;
    child?: number;
    student?: number;
    note?: string;
  };
  facilities: string[];          // ['parking', 'wifi', 'restaurant']
  bestTimeToVisit?: string;
  averageVisitDuration?: string; // "2-3 giờ"

  // Contact
  phone?: string;
  website?: string;
  email?: string;

  // Status
  status: 'draft' | 'submitted' | 'in_review' | 'published' | 'rejected' | 'deleted';
  rejectionReason?: string;
  moderatorFeedback?: string;

  // Ownership
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  deletedAt?: Timestamp;

  // Stats
  viewCount: number;
  lastViewedAt?: Timestamp;
  stats: {
    totalReviews: number;
    averageRating: number;
    ratingBreakdown: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    totalSaves: number;
    totalLikes: number;
    totalShares: number;
  };

  // Trust
  trustLabel: 'community' | 'contributor' | 'partner' | 'verified';

  // SEO
  metaTitle?: string;
  metaDescription?: string;
}

interface PlaceImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  isPrimary: boolean;
  uploadedBy: string;
  createdAt: string;
  order?: number;
  width?: number;
  height?: number;
}
```

**Indexes:**
```json
[
  { "fields": ["status", "publishedAt"] },
  { "fields": ["region", "status", "publishedAt"] },
  { "fields": ["type", "status", "publishedAt"] },
  { "fields": ["province", "status", "publishedAt"] },
  { "fields": ["createdBy", "status", "updatedAt"] },
  { "fields": ["status", "stats.averageRating"] }
]
```

---

### 2.3. Collection: `moderation_queue`

```typescript
interface ModerationQueueItem {
  // Identity
  id: string;
  contentType: 'place' | 'review' | 'report';
  contentId: string;

  // Status Flow: pending → claimed → in_review → approved/rejected/needs_revision
  status: 'pending' | 'claimed' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';

  // Priority
  priority: 'urgent' | 'high' | 'medium' | 'low';
  priorityScore: number;         // For sorting

  // Claim
  claimedBy?: string;
  claimedAt?: Timestamp;
  claimExpiresAt?: Timestamp;

  // Review
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;

  // Escalation
  escalated?: boolean;
  escalatedBy?: string;
  escalatedAt?: Timestamp;
  escalatedReason?: string;

  // Submitter
  submittedBy: string;
  submitterRole: string;
  submittedAt: Timestamp;

  // Content Preview (denormalized for performance)
  contentPreview: {
    name?: string;
    description?: string;
    province?: string;
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
```json
[
  { "fields": ["status", "priority", "submittedAt"] },
  { "fields": ["claimedBy", "status"] },
  { "fields": ["status", "claimExpiresAt"] },
  { "fields": ["contentType", "status"] }
]
```

---

### 2.4. Collection: `place_reviews`

```typescript
interface PlaceReview {
  // Identity
  id: string;
  placeId: string;
  userId: string;

  // Content
  title?: string;
  content: string;
  rating: number;                // 1-5

  // Visit Info
  visitDate?: string;            // YYYY-MM-DD
  tripType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';

  // Media
  images?: string[];             // Max 4

  // Privacy
  isAnonymous: boolean;

  // User Info (denormalized)
  userInfo: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };

  // Engagement
  helpfulCount: number;

  // Status
  status: 'published' | 'hidden' | 'removed';
  hiddenReason?: string;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
```json
[
  { "fields": ["placeId", "status", "createdAt"] },
  { "fields": ["placeId", "status", "helpfulCount"] },
  { "fields": ["userId", "createdAt"] }
]
```

---

### 2.5. Collection: `view_cache`

```typescript
interface ViewCacheEntry {
  // Composite ID: {placeId}_{fingerprint}
  placeId: string;
  fingerprint: string;           // SHA-256(IP + UA)
  viewedAt: Timestamp;
  expiresAt: Timestamp;          // viewedAt + 1 hour

  // Debug info (auto-deleted)
  ip: string;
  userAgent: string;
}
```

**Indexes:**
```json
[
  { "fields": ["expiresAt"] }
]
```

**TTL:** Auto-delete when `expiresAt < now()`

---

## 3. Security Best Practices

### 3.1. Authentication Security

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

**Implementation:**
```typescript
const passwordSchema = z.string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Phải có ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Phải có ít nhất 1 ký tự đặc biệt');
```

**Token Management:**
- JWT tokens with 1-hour expiration
- Refresh token stored in httpOnly cookie
- Automatic token refresh before expiration

### 3.2. API Security

**Input Validation:**
```typescript
// Always use Zod for validation
const CreatePlaceSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(50).max(5000),
  province: z.string(),
  type: z.enum(['bien', 'nui', 'van-hoa', 'am-thuc', 'check-in'])
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = CreatePlaceSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { success: false, error: validated.error.message },
      { status: 400 }
    );
  }

  // Proceed with validated.data
}
```

**SQL Injection Prevention:**
- Use Firebase SDK (no raw SQL)
- Parameterized queries only
- Never concatenate user input into queries

**XSS Prevention:**
```typescript
import validator from 'validator';

// Sanitize user input
const sanitizedContent = validator.escape(userInput);
```

**CSRF Protection:**
```typescript
// Use SameSite cookies
res.setHeader('Set-Cookie', 'token=...; SameSite=Strict; HttpOnly');
```

### 3.3. Firestore Security Rules

**Key Patterns:**

```javascript
// Helper functions
function isAuthenticated() {
  return request.auth != null;
}

function emailVerified() {
  return isAuthenticated() && request.auth.token.email_verified == true;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function hasRole(role) {
  return isAuthenticated() &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
}

// Apply to collections
match /places/{placeId} {
  allow read: if true;  // Public
  allow create: if emailVerified();
  allow update: if isOwner(resource.data.createdBy) || hasRole('moderator');
  allow delete: if hasRole('admin');
}
```

**Never:**
- ❌ `allow read, write: if true;` (too permissive)
- ❌ Trust client data without validation
- ❌ Expose sensitive fields (passwords, private keys)

### 3.4. File Upload Security

**Image Upload Validation:**
```typescript
// Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Chỉ chấp nhận JPG, PNG, WebP');
}

// Validate file size
if (file.size > 5 * 1024 * 1024) {  // 5MB
  throw new Error('Kích thước file không quá 5MB');
}

// Validate image dimensions
const img = new Image();
img.src = URL.createObjectURL(file);
await img.decode();
if (img.width < 800 || img.height < 600) {
  throw new Error('Kích thước ảnh tối thiểu 800x600px');
}
```

**Storage Rules:**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /places/images/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 4. Performance Optimization

### 4.1. Database Optimization

**Denormalization:**
```typescript
// Store user info in reviews to avoid extra fetches
interface PlaceReview {
  // ...
  userInfo: {
    id: string;
    name: string;
    avatar?: string;
  }  // Denormalized from users collection
}
```

**Composite Indexes:**
```json
{
  "collectionGroup": "places",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "region", "order": "ASCENDING" },
    { "fieldPath": "publishedAt", "order": "DESCENDING" }
  ]
}
```

**Pagination:**
```typescript
// Use limit + offset
const placesRef = collection(db, 'places');
const q = query(
  placesRef,
  where('status', '==', 'published'),
  orderBy('publishedAt', 'desc'),
  limit(20),
  startAfter(lastDocSnapshot)  // Cursor-based pagination
);
```

### 4.2. Caching Strategies

**Server-Side Rendering (SSR):**
```typescript
// app/places/[slug]/page.tsx
export const revalidate = 3600;  // Revalidate every 1 hour

export async function generateStaticParams() {
  // Pre-generate top 100 places
  const places = await getTopPlaces(100);
  return places.map(p => ({ slug: p.slug }));
}
```

**Client-Side Caching (SWR):**
```typescript
import useSWR from 'swr';

export function usePlaces(filters) {
  const { data, error } = useSWR(
    ['/api/places', filters],
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000  // 1 minute
    }
  );
  return { places: data?.data || [], loading: !data && !error };
}
```

**Service Worker Caching (PWA):**
```typescript
// Cache strategies in sw.ts
{
  urlPattern: /\/api\/.*/,
  handler: 'NetworkFirst',
  options: {
    networkTimeoutSeconds: 5,
    cacheName: 'api-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 3600  // 1 hour
    }
  }
}
```

### 4.3. Image Optimization

**Next.js Image Component:**
```typescript
import Image from 'next/image';

<Image
  src={place.images[0].url}
  alt={place.name}
  width={1200}
  height={800}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
  quality={80}
/>
```

**Responsive Images:**
```typescript
<picture>
  <source
    srcSet={`${image.url}?w=400 400w, ${image.url}?w=800 800w`}
    sizes="(max-width: 768px) 400px, 800px"
  />
  <img src={image.url} alt={image.alt} />
</picture>
```

### 4.4. Code Splitting

**Dynamic Imports:**
```typescript
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/admin/dashboard'), {
  loading: () => <Skeleton />,
  ssr: false  // Client-side only
});
```

**Route-based Splitting:**
```typescript
// Automatically handled by Next.js App Router
// Each route in app/ folder = separate chunk
```

---

## 5. Monitoring & Logging

### 5.1. Application Logging

**Log Levels:**
- `DEBUG` - Development only
- `INFO` - Normal operations
- `WARN` - Potential issues
- `ERROR` - Errors requiring attention

**Implementation:**
```typescript
// src/lib/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },

  error: (message: string, error?: Error, data?: any) => {
    console.error(`[ERROR] ${message}`, error, data);
    // Send to error tracking service (Sentry, etc)
  }
};
```

### 5.2. Performance Monitoring

**Web Vitals:**
```typescript
// app/layout.tsx
export function reportWebVitals(metric: any) {
  console.log(metric);
  // Send to analytics
}
```

**Metrics to Track:**
- **LCP (Largest Contentful Paint)** - Target: < 2.5s
- **FID (First Input Delay)** - Target: < 100ms
- **CLS (Cumulative Layout Shift)** - Target: < 0.1

### 5.3. Error Tracking

**Integration with Sentry (Example):**
```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
});
```

---

## 6. Error Handling

### 6.1. API Error Responses

**Error Types:**
```typescript
type APIError =
  | { code: 'UNAUTHORIZED', message: 'Unauthorized' }
  | { code: 'FORBIDDEN', message: 'Permission denied' }
  | { code: 'NOT_FOUND', message: 'Resource not found' }
  | { code: 'VALIDATION_ERROR', message: 'Invalid input', details: any }
  | { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' }
  | { code: 'INTERNAL_ERROR', message: 'Internal server error' };
```

**Error Handler:**
```typescript
export function handleAPIError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
        details: error.details
      },
      { status: 400 }
    );
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // Log unknown errors
  logger.error('Unhandled API error', error as Error);

  return NextResponse.json(
    { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

---

## 7. Rate Limiting

### 7.1. Rate Limit Configuration

```typescript
const RATE_LIMITS = {
  '/api/auth/login': { max: 5, window: '15m' },        // 5 attempts per 15 min
  '/api/auth/register': { max: 3, window: '1h' },      // 3 registrations per hour
  '/api/places': { max: 100, window: '1h' },           // 100 requests per hour
  '/api/ai/place-chat': { max: 10, window: '1d' },     // 10 chats per day
  '/api/reviews/*/report': { max: 3, window: '1w' }    // 3 reports per week
};
```

### 7.2. Implementation

```typescript
// src/lib/server/rate-limiter.ts
import { adminDb } from '@/lib/firebase-admin';

export async function checkRateLimit(
  userId: string,
  endpoint: string
): Promise<boolean> {
  const config = RATE_LIMITS[endpoint];
  if (!config) return true;

  const now = Date.now();
  const windowMs = parseWindow(config.window);
  const key = `rate_limit:${userId}:${endpoint}`;

  const doc = await adminDb.collection('rate_limits').doc(key).get();

  if (!doc.exists) {
    // First request
    await doc.ref.set({
      count: 1,
      resetAt: new Date(now + windowMs)
    });
    return true;
  }

  const data = doc.data();
  if (data.resetAt.toMillis() < now) {
    // Window expired, reset
    await doc.ref.set({
      count: 1,
      resetAt: new Date(now + windowMs)
    });
    return true;
  }

  if (data.count >= config.max) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  await doc.ref.update({
    count: FieldValue.increment(1)
  });

  return true;
}
```

---

## 8. Backup & Recovery

### 8.1. Firebase Backup Strategy

**Firestore Export:**
```bash
# Export entire database
gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)

# Automated daily backups (Cloud Scheduler)
```

**Storage Backup:**
```bash
# Sync Firebase Storage to Google Cloud Storage
gsutil -m rsync -r gs://your-project.appspot.com gs://your-backup-bucket
```

### 8.2. Recovery Procedures

**Restore Firestore:**
```bash
gcloud firestore import gs://your-bucket/backups/20250106
```

**Restore Storage:**
```bash
gsutil -m rsync -r gs://your-backup-bucket gs://your-project.appspot.com
```

---

## Kết Luận

Tài liệu này cung cấp chi tiết toàn diện về API, Database, Security và Performance của **Du Lịch Việt**. Tuân thủ các best practices này sẽ đảm bảo hệ thống chạy ổn định, bảo mật và có hiệu suất cao.

**Tài liệu liên quan:**
- [1. Tổng Quan Dự Án](./1_Tong_Quan_Du_Lich_Viet.md)
- [2. Kiến Trúc Hệ Thống](./2_Kien_Truc_He_Thong_&_Cong_Nghe.md)
- [3. Tính Năng Quan Trọng](./3_Tinh_Nang_Quan_Trong.md)
- [4. Cấu Trúc Thư Mục & Setup](./4_Cau_Truc_Thu_Muc_&_Setup.md)

---

*© 2025 Du Lịch Việt. All rights reserved.*

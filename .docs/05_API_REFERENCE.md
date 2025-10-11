# 05. API Reference - Tài Liệu Chi Tiết Endpoints

> **Cập nhật:** 2025-10-11
> **Trạng thái:** Production Active - 105 endpoints documented
> **Coverage:** Core endpoints fully documented, additional endpoints in development

---

## Mục Lục

- [1. Authentication APIs](#1-authentication-apis)
- [2. Places APIs](#2-places-apis)
- [3. Admin APIs](#3-admin-apis)
- [4. Moderation APIs](#4-moderation-apis)
- [5. Community APIs](#5-community-apis)
- [6. Review APIs](#6-review-apis)
- [7. Notification APIs](#7-notification-apis)
- [8. User Profile APIs](#8-user-profile-apis)
- [9. AI Chatbot APIs](#9-ai-chatbot-apis)
- [10. Cron Job APIs](#10-cron-job-apis)
- [11. Error Codes Reference](#11-error-codes-reference)

---

## Conventions Chung

### Authentication Pattern

Tất cả protected endpoints yêu cầu:

```typescript
Headers: {
  "Authorization": "Bearer <firebase-id-token>",
  "Content-Type": "application/json"
}
```

Token lấy từ: `await auth.currentUser.getIdToken()`

### Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": <payload>,
  "message": "Optional success message",
  "pagination": { // Optional for list endpoints
    "limit": 20,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Human-readable error message in Vietnamese",
  "code": "error_code", // Optional
  "retryable": true // Optional, indicates if client should retry
}
```

### Common HTTP Status Codes

- `200 OK` - Request thành công
- `201 Created` - Resource đã được tạo
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing hoặc invalid token
- `403 Forbidden` - Không đủ quyền hạn
- `404 Not Found` - Resource không tồn tại
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

---

## 1. Authentication APIs

### 1.1. POST /api/auth/login

**Mục đích:** Đăng nhập với email và password

**Authentication:** Public (không cần token)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uid",
    "email": "user@example.com",
    "role": "traveler",
    "fullName": "Nguyễn Văn A",
    "avatar": "https://...",
    "emailVerified": true,
    "stats": {
      "placesContributed": 5,
      "reviewsWritten": 10
    }
  },
  "token": "custom-firebase-token"
}
```

**Error Responses:**
- `400` - Email hoặc mật khẩu thiếu
- `401` - Email hoặc mật khẩu không đúng
- `403` - Tài khoản bị vô hiệu hóa
- `404` - Không tìm thấy tài khoản
- `429` - Quá nhiều lần thử đăng nhập
- `503` - Lỗi kết nối mạng

**Implementation:** `src/app/api/auth/login/route.ts`

**Được sử dụng trong:**
- `src/hooks/useAuth.ts` - Hook login()
- `src/components/auth/auth-provider.tsx` - AuthProvider login

---

### 1.2. POST /api/auth/register

**Mục đích:** Đăng ký tài khoản mới

**Authentication:** Public

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn B",
  "acceptTerms": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "new-user-uid",
    "email": "newuser@example.com",
    "role": "traveler",
    "fullName": "Nguyễn Văn B",
    "emailVerified": false,
    "createdAt": "2025-10-10T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Dữ liệu không hợp lệ
- `409` - Email đã tồn tại
- `500` - Lỗi tạo tài khoản

**Validation Rules:**
- Email: Valid format, unique
- Password: Minimum 6 characters
- FullName: Minimum 2 characters
- AcceptTerms: Must be true

**Implementation:** `src/app/api/auth/register/route.ts`

**Được sử dụng trong:**
- `src/hooks/useAuth.ts` - Hook register()
- `src/components/auth/auth-provider.tsx` - AuthProvider register

---

### 1.3. GET /api/auth/me

**Mục đích:** Lấy thông tin user hiện tại

**Authentication:** Required

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uid",
    "email": "user@example.com",
    "role": "contributor",
    "fullName": "Nguyễn Văn A",
    "avatar": "https://...",
    "emailVerified": true,
    "stats": {
      "placesContributed": 12,
      "reviewsWritten": 25,
      "helpfulVotes": 50
    },
    "badges": ["early_adopter", "top_contributor"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-10-10T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Token không hợp lệ hoặc hết hạn
- `404` - User không tồn tại trong database

**Implementation:** `src/app/api/auth/me/route.ts`

**Được sử dụng trong:**
- `src/hooks/useAuth.ts` - Hook refreshUser()
- `src/components/auth/auth-provider.tsx` - Initial auth check

---

### 1.4. POST /api/auth/logout

**Mục đích:** Đăng xuất (invalidate token nếu cần)

**Authentication:** Optional (best practice: include token)

**Request Body:** Empty

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

**Implementation:** `src/app/api/auth/logout/route.ts`

**Note:** Chủ yếu xử lý client-side bằng `signOut(auth)`. API endpoint để future-proof (revoke tokens, cleanup sessions).

---

### 1.5. POST /api/auth/create-missing-user

**Mục đích:** Tạo user document trong Firestore nếu chỉ có Firebase Auth account

**Authentication:** Required

**Use Case:** User đăng ký qua Firebase Auth nhưng Firestore document creation failed

**Request Body:** Empty (user info từ token)

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "user-uid",
    "email": "user@example.com",
    "role": "traveler",
    "createdAt": "2025-10-10T10:00:00.000Z"
  }
}
```

**Implementation:** `src/app/api/auth/create-missing-user/route.ts`

**Được sử dụng trong:**
- `src/hooks/useAuth.ts` - Fallback khi GET /api/auth/me returns 404

---

### 1.6. POST /api/auth/sync-email-verification

**Mục đích:** Sync trạng thái email verification từ Firebase Auth sang Firestore

**Authentication:** Required

**Request Body:** Empty

**Success Response (200):**
```json
{
  "success": true,
  "emailVerified": true
}
```

**Implementation:** `src/app/api/auth/sync-email-verification/route.ts`

**Được sử dụng trong:**
- `src/app/auth/verify-email/page.tsx` - Sau khi user click verify link

---

## 2. Places APIs

### 2.1. GET /api/places

**Mục đích:** Lấy danh sách published places (public)

**Authentication:** Public (không cần token)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | `bac-bo`, `trung-bo`, `nam-bo` |
| `province` | string | No | Tên tỉnh (VD: "Quảng Ninh") |
| `type` | string | No | `bien`, `nui`, `van-hoa`, `am-thuc`, `check-in` |
| `trustLabel` | string | No | `community`, `contributor`, `partner`, `verified` |
| `search` | string | No | Tìm kiếm trong name, description, tags |
| `sortBy` | string | No | `newest` (default), `oldest`, `rating`, `popular` |
| `limit` | number | No | Số lượng kết quả (default: 20, max: 100) |
| `offset` | number | No | Pagination offset (default: 0) |

**Example Request:**
```
GET /api/places?region=bac-bo&type=bien&sortBy=popular&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "place-id-1",
      "slug": "vinh-ha-long",
      "name": "Vịnh Hạ Long",
      "shortDescription": "Di sản thiên nhiên thế giới...",
      "description": "Detailed description...",
      "region": "bac-bo",
      "province": "Quảng Ninh",
      "type": "bien",
      "trustLabel": "verified",
      "coordinates": {
        "lat": 20.9101,
        "lng": 107.1839
      },
      "images": [
        {
          "id": "img-1",
          "url": "https://storage.googleapis.com/...",
          "alt": "Vịnh Hạ Long",
          "isPrimary": true
        }
      ],
      "rating": {
        "average": 4.8,
        "count": 1234
      },
      "viewCount": 50000,
      "status": "published",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "publishedAt": "2025-01-02T00:00:00.000Z"
    }
  ],
  "total": 150,
  "filters": {
    "region": "bac-bo",
    "type": "bien",
    "sortBy": "popular",
    "limit": 10,
    "offset": 0
  }
}
```

**Performance Notes:**
- Caching: Server-side trong 5 phút cho static filters
- Sorting: In-memory (avoid composite index requirements)
- Search: Client-side filtering (future: implement Algolia/Typesense)

**Implementation:** `src/app/api/places/route.ts:8-105` (GET handler)

**Được sử dụng trong:**
- `src/hooks/use-places.ts` - Hook usePlaces()
- `src/lib/client/api.ts:120-128` - apiClient.places.list()

---

### 2.2. POST /api/places

**Mục đích:** Tạo địa điểm mới (draft hoặc submit for moderation)

**Authentication:** Required

**Permission:** `create_place` (contributor, partner, admin)

**Request Body:**
```json
{
  "name": "Bãi biển Mỹ Khê",
  "shortDescription": "Một trong 6 bãi biển đẹp nhất hành tinh",
  "description": "Detailed description...",
  "region": "trung-bo",
  "province": "Đà Nẵng",
  "provinceSlug": "da-nang",
  "type": "bien",
  "coordinates": {
    "lat": 16.0544,
    "lng": 108.2022
  },
  "address": "Đường Võ Nguyên Giáp, Đà Nẵng",
  "images": [
    {
      "id": "img-id",
      "url": "https://storage.googleapis.com/...",
      "alt": "Bãi biển Mỹ Khê",
      "isPrimary": true
    }
  ],
  "video": null,
  "vietnamAddress": {
    "street": "Võ Nguyên Giáp",
    "ward": "Phước Mỹ",
    "district": "Sơn Trà",
    "city": "Đà Nẵng"
  },
  "sources": [
    {
      "type": "official",
      "url": "https://...",
      "title": "Vietnam Tourism"
    }
  ],
  "openingHours": "24/7",
  "entryFee": {
    "isFree": true,
    "price": 0,
    "currency": "VND"
  },
  "bestTimeToVisit": "Tháng 5 - Tháng 9",
  "facilities": ["parking", "restaurant", "shower"],
  "tags": ["bãi biển", "du lịch hè", "Đà Nẵng"],
  "status": "draft" // or omit for auto-submit
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-place-id",
    "slug": "bai-bien-my-khe",
    "name": "Bãi biển Mỹ Khê",
    "status": "submitted", // or "draft" if status: "draft" in request
    "trustLabel": "contributor",
    "createdAt": "2025-10-10T10:00:00.000Z"
  },
  "message": "Địa điểm đã được gửi để kiểm duyệt. Thời gian xử lý: 24-48 giờ."
}
```

**Business Logic:**
1. **Slug generation:** name → lowercase → remove accents → replace spaces with hyphens
2. **Trust label assignment:**
   - `contributor` role → `contributor` label
   - `partner` role → `partner` label
   - `admin` role → `verified` label
3. **Status determination:**
   - `status: "draft"` → Save as draft (NOT sent to moderation)
   - Admin user + not draft → Direct publish (bypass moderation)
   - Other users → `status: "submitted"` → Add to moderation queue
4. **Moderation queue priority:**
   - Partner: Priority 4 (highest)
   - Contributor: Priority 3
   - Traveler: Priority 2
   - Guest: Priority 1

**Error Responses:**
- `401` - Chưa đăng nhập
- `403` - Không có quyền `create_place`
- `400` - Dữ liệu không hợp lệ (thiếu required fields)

**Implementation:** `src/app/api/places/route.ts:108-327` (POST handler)

**Được sử dụng trong:**
- `src/hooks/use-user-drafts.ts` - Hook createDraft()
- `src/app/contribute/new-place/page.tsx` - Form submission

---

### 2.3. GET /api/places/[id]

**Mục đích:** Lấy chi tiết 1 địa điểm (theo ID hoặc slug)

**Authentication:** Public

**Path Parameter:** `id` - Place ID hoặc slug

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "place-id",
    "slug": "vinh-ha-long",
    "name": "Vịnh Hạ Long",
    "shortDescription": "Di sản thiên nhiên thế giới...",
    "description": "Full detailed description...",
    "region": "bac-bo",
    "province": "Quảng Ninh",
    "provinceSlug": "quang-ninh",
    "type": "bien",
    "trustLabel": "verified",
    "coordinates": {
      "lat": 20.9101,
      "lng": 107.1839
    },
    "address": "Hạ Long, Quảng Ninh",
    "images": [
      {
        "id": "img-1",
        "url": "https://storage.googleapis.com/...",
        "alt": "Vịnh Hạ Long từ trên cao",
        "caption": "View từ đỉnh Bái Thơ",
        "isPrimary": true,
        "order": 0
      }
    ],
    "video": {
      "type": "youtube",
      "url": "https://youtube.com/watch?v=...",
      "thumbnail": "https://img.youtube.com/..."
    },
    "vietnamAddress": {
      "street": null,
      "ward": "Bãi Cháy",
      "district": "Hạ Long",
      "city": "Quảng Ninh"
    },
    "sources": [
      {
        "type": "official",
        "url": "https://whc.unesco.org/en/list/672",
        "title": "UNESCO World Heritage"
      }
    ],
    "openingHours": "24/7",
    "entryFee": {
      "isFree": false,
      "price": 250000,
      "currency": "VND",
      "notes": "Vé tàu tham quan"
    },
    "bestTimeToVisit": "Tháng 10 - Tháng 4 (mùa khô)",
    "facilities": ["tour", "restaurant", "hotel", "parking"],
    "rating": {
      "average": 4.8,
      "count": 1234,
      "breakdown": {
        "5": 800,
        "4": 300,
        "3": 100,
        "2": 20,
        "1": 14
      }
    },
    "stats": {
      "views": 50000,
      "likes": 1200,
      "saves": 800,
      "reviews": 1234
    },
    "tags": ["di sản thế giới", "vịnh biển", "Quảng Ninh"],
    "status": "published",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-10-05T15:30:00.000Z",
    "publishedAt": "2025-01-02T00:00:00.000Z",
    "createdBy": "user-id",
    "featured": true
  }
}
```

**Side Effects:**
- Auto-increment `viewCount` using `ViewTracker.trackPlaceView()`
- Session-based deduplication (1-hour TTL)

**Error Responses:**
- `404` - Địa điểm không tồn tại hoặc chưa published

**Implementation:** `src/app/api/places/[id]/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-places.ts` - Hook usePlace()
- `src/hooks/use-place-stats.ts` - Hook useViewTracking()
- `src/app/places/[idOrSlug]/page.tsx` - Place detail SSR

---

### 2.4. GET /api/places/my-drafts

**Mục đích:** Lấy danh sách drafts của user hiện tại

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `draft`, `submitted`, `in_review`, `rejected` |
| `limit` | number | No | Default: 20 |
| `offset` | number | No | Default: 0 |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "draft-id-1",
      "name": "Đảo Cát Bà",
      "status": "draft",
      "type": "bien",
      "region": "bac-bo",
      "province": "Hải Phòng",
      "images": [
        {
          "url": "https://...",
          "isPrimary": true
        }
      ],
      "createdAt": "2025-10-08T10:00:00.000Z",
      "updatedAt": "2025-10-09T15:30:00.000Z"
    },
    {
      "id": "draft-id-2",
      "name": "Chùa Một Cột",
      "status": "in_review",
      "moderationStatus": {
        "submittedAt": "2025-10-09T08:00:00.000Z",
        "claimedBy": "moderator-id",
        "claimedAt": "2025-10-09T09:00:00.000Z",
        "slaDeadline": "2025-10-10T08:00:00.000Z"
      },
      "createdAt": "2025-10-05T10:00:00.000Z",
      "updatedAt": "2025-10-09T08:00:00.000Z"
    }
  ],
  "stats": {
    "totalDrafts": 5,
    "totalSubmitted": 3,
    "totalInReview": 2,
    "totalRejected": 1
  },
  "total": 5
}
```

**Implementation:** `src/app/api/places/my-drafts/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-user-drafts.ts` - Hook useUserDrafts()
- `src/app/contribute/my-drafts/page.tsx` - Drafts management page

---

### 2.5. POST /api/places/drafts/[draftId]/submit

**Mục đích:** Submit draft để kiểm duyệt

**Authentication:** Required

**Permission:** User phải là owner của draft

**Path Parameter:** `draftId` - Draft ID

**Request Body:** Empty

**Success Response (200):**
```json
{
  "success": true,
  "message": "Địa điểm đã được gửi để kiểm duyệt",
  "data": {
    "id": "draft-id",
    "status": "submitted",
    "submittedAt": "2025-10-10T10:00:00.000Z",
    "queueId": "moderation-queue-id"
  }
}
```

**Business Logic:**
1. Validate draft ownership
2. Check draft có đầy đủ required fields
3. Change status: `draft` → `submitted`
4. Add to moderation_queue với priority theo role
5. Trigger notification: `PLACE_RECEIVED`

**Error Responses:**
- `401` - Chưa đăng nhập
- `403` - Không phải owner của draft
- `404` - Draft không tồn tại
- `400` - Draft thiếu required fields

**Implementation:** `src/app/api/places/drafts/[draftId]/submit/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-user-drafts.ts` - Hook submitDraft()

---

### 2.6. GET/POST/DELETE /api/places/[id]/favorite

**Mục đích:** Thêm/xóa/check favorite (like) địa điểm

**Authentication:** Required

**Path Parameter:** `id` - Place ID

**Methods:**

#### GET - Check if user favorited place
**Response (200):**
```json
{
  "success": true,
  "data": {
    "liked": true
  }
}
```

#### POST - Add to favorites
**Response (200):**
```json
{
  "success": true,
  "message": "Đã thêm vào yêu thích",
  "data": {
    "liked": true,
    "likeCount": 1201
  }
}
```

#### DELETE - Remove from favorites
**Response (200):**
```json
{
  "success": true,
  "message": "Đã xóa khỏi yêu thích",
  "data": {
    "liked": false,
    "likeCount": 1200
  }
}
```

**Side Effects:**
- Update Firestore: `places/{id}/stats.likes` với `FieldValue.increment(1/-1)`
- Update Realtime DB: `/place_stats/{id}/likes`
- Record user interaction: `user_interactions/{userId}/likes/{placeId}`

**Implementation:** `src/app/api/places/[id]/favorite/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-place-interactions.ts` - Hook toggleLike()

---

### 2.7. GET/POST/DELETE /api/places/[id]/saved

**Mục đích:** Lưu/bỏ lưu/check saved địa điểm

**Authentication:** Required

**Path Parameter:** `id` - Place ID

**Methods:**

#### GET - Check if user saved place
**Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": true,
    "savedAt": "2025-10-05T10:00:00.000Z"
  }
}
```

#### POST - Save place
**Response (200):**
```json
{
  "success": true,
  "message": "Đã lưu địa điểm",
  "data": {
    "saved": true,
    "saveCount": 801
  }
}
```

#### DELETE - Unsave place
**Response (200):**
```json
{
  "success": true,
  "message": "Đã bỏ lưu địa điểm",
  "data": {
    "saved": false,
    "saveCount": 800
  }
}
```

**Side Effects:**
- Update Firestore: `places/{id}/stats.saves`
- Update Realtime DB: `/place_stats/{id}/saves`
- Record user interaction: `user_interactions/{userId}/saves/{placeId}`

**Implementation:** `src/app/api/places/[id]/saved/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-place-interactions.ts` - Hook toggleSave()

---

### 2.8. GET /api/places/[id]/reviews

**Mục đích:** Lấy danh sách reviews cho địa điểm

**Authentication:** Public

**Path Parameter:** `id` - Place ID

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sortBy` | string | No | `newest`, `oldest`, `highest_rating`, `lowest_rating`, `most_helpful` |
| `limit` | number | No | Default: 10, max: 50 |
| `offset` | number | No | Default: 0 |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "review-id-1",
      "placeId": "place-id",
      "userId": "user-id",
      "userInfo": {
        "name": "Nguyễn Văn A",
        "avatar": "https://...",
        "role": "contributor",
        "badges": ["verified_reviewer"]
      },
      "rating": 5,
      "title": "Tuyệt vời!",
      "content": "Địa điểm rất đẹp, phù hợp đi gia đình...",
      "images": [
        {
          "url": "https://...",
          "alt": "Hình chụp tại địa điểm"
        }
      ],
      "visitDate": "2025-09-15",
      "isAnonymous": false,
      "helpfulCount": 25,
      "status": "published",
      "createdAt": "2025-09-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1234,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Implementation:** `src/app/api/places/[id]/reviews/route.ts` (GET handler)

**Được sử dụng trong:**
- `src/hooks/use-place-reviews.ts` - Hook usePlaceReviews()

---

### 2.9. POST /api/places/[id]/reviews

**Mục đích:** Tạo review mới cho địa điểm

**Authentication:** Required

**Permission:** `emailVerified: true`

**Path Parameter:** `id` - Place ID

**Request Body:**
```json
{
  "rating": 5,
  "title": "Tuyệt vời!",
  "content": "Địa điểm rất đẹp...",
  "images": [
    {
      "url": "https://storage.googleapis.com/...",
      "alt": "Hình chụp tại địa điểm"
    }
  ],
  "visitDate": "2025-09-15",
  "isAnonymous": false
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Đánh giá đã được gửi thành công",
  "data": {
    "id": "new-review-id",
    "placeId": "place-id",
    "rating": 5,
    "createdAt": "2025-10-10T10:00:00.000Z"
  }
}
```

**Validation Rules:**
- Rating: 1-5 (integer)
- Content: Minimum 10 characters
- Images: Max 4 images
- User chỉ có thể review 1 lần per place (enforce unique constraint)

**Side Effects:**
- Update `places/{id}/rating` (average, count, breakdown)
- Update `places/{id}/stats.totalReviews`
- Update `users/{userId}/stats.reviewsWritten`

**Error Responses:**
- `401` - Chưa đăng nhập
- `403` - Email chưa verified
- `409` - User đã review place này rồi
- `400` - Dữ liệu không hợp lệ

**Implementation:** `src/app/api/places/[id]/reviews/route.ts` (POST handler)

**Được sử dụng trong:**
- `src/hooks/use-place-reviews.ts` - Hook createReview()

---

### 2.10. POST /api/places/[id]/reports

**Mục đích:** Báo cáo địa điểm (spam, sai thông tin, etc.)

**Authentication:** Required

**Permission:** `report_content` (traveler+)

**Path Parameter:** `id` - Place ID

**Request Body:**
```json
{
  "reason": "inaccurate_info",
  "description": "Địa chỉ không chính xác, đã chuyển địa điểm",
  "evidence": [
    {
      "type": "image",
      "url": "https://..."
    }
  ]
}
```

**Reason Values:**
- `spam` - Spam/quảng cáo
- `inaccurate_info` - Thông tin sai
- `inappropriate_content` - Nội dung không phù hợp
- `duplicate` - Trùng lặp
- `offensive` - Ngôn từ xúc phạm
- `other` - Lý do khác

**Success Response (201):**
```json
{
  "success": true,
  "message": "Báo cáo đã được gửi. Chúng tôi sẽ xem xét trong 24-48 giờ",
  "data": {
    "reportId": "report-id",
    "status": "pending"
  }
}
```

**Business Logic:**
1. Check rate limit: 3 reports/week per user (prevent spam)
2. Create document in `place_reports` collection
3. Increment `places/{id}/reportCount`
4. If `reportCount >= 3`: Auto-hide place (status: `hidden`)
5. Notify moderators: `CONTENT_REPORTED`

**Error Responses:**
- `429` - Đã quá 3 báo cáo trong tuần

**Implementation:** `src/app/api/places/[id]/reports/route.ts`

**Được sử dụng trong:**
- `src/components/place-detail-content.tsx` - Report modal

---

### 2.11. POST /api/places/[id]/create-edit-draft

**Mục đích:** Tạo edit draft từ published place

**Authentication:** Required

**Permission:** User phải là contributor+ hoặc owner của place

**Path Parameter:** `id` - Place ID (published)

**Request Body:** Empty

**Success Response (201):**
```json
{
  "success": true,
  "message": "Đã tạo bản nháp chỉnh sửa",
  "data": {
    "draftId": "edit-draft-id",
    "originalPlaceId": "place-id",
    "createdAt": "2025-10-10T10:00:00.000Z"
  }
}
```

**Business Logic:**
1. Copy published place data → new draft in `place_drafts`
2. Set `draft.metadata.isEditRequest = true`
3. Set `draft.metadata.originalPlaceId = place-id`
4. User edits draft, then submits for moderation
5. Moderator reviews changes (show diff: original vs edited)

**Error Responses:**
- `403` - Không có quyền edit
- `404` - Place không tồn tại hoặc chưa published
- `409` - Đã có edit draft pending cho place này

**Implementation:** `src/app/api/places/[id]/create-edit-draft/route.ts`

**Được sử dụng trong:**
- `src/app/places/[idOrSlug]/page.tsx` - "Đề xuất chỉnh sửa" button

---

### 2.12. POST /api/places/[id]/request-deletion

**Mục đích:** Yêu cầu xóa địa điểm (với lý do)

**Authentication:** Required

**Permission:** User phải là owner hoặc admin

**Path Parameter:** `id` - Place ID

**Request Body:**
```json
{
  "reason": "Địa điểm không còn tồn tại / đã đóng cửa"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Yêu cầu xóa đã được gửi. Admin sẽ xem xét",
  "data": {
    "requestId": "deletion-request-id",
    "status": "pending"
  }
}
```

**Business Logic:**
1. Create document in `place_reports` với `reason: "deletion_request"`
2. Notify moderators
3. Admin reviews và quyết định approve/reject

**Implementation:** `src/app/api/places/[id]/request-deletion/route.ts`

---

## 3. Admin APIs

### 3.1. GET /api/admin/places

**Mục đích:** Admin/Moderator quản lý tất cả places (all statuses)

**Authentication:** Required

**Permission:** `moderator` hoặc `admin`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `draft`, `submitted`, `published`, `rejected`, `hidden`, `suspended` |
| `region` | string | No | `bac-bo`, `trung-bo`, `nam-bo` |
| `type` | string | No | `bien`, `nui`, `van-hoa`, `am-thuc`, `check-in` |
| `search` | string | No | Tìm kiếm name, description |
| `limit` | number | No | Default: 50, max: 1000 |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "place-id",
      "name": "Vịnh Hạ Long",
      "status": "published",
      "trustLabel": "verified",
      "type": "bien",
      "region": "bac-bo",
      "province": "Quảng Ninh",
      "viewCount": 50000,
      "reportCount": 0,
      "createdBy": "user-id",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "publishedAt": "2025-01-02T00:00:00.000Z"
    }
  ],
  "total": 500
}
```

**Implementation:** `src/app/api/admin/places/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-admin-places-stable.ts` - Hook useAdminPlaces()
- `src/app/admin/places/page.tsx` - Admin places management

---

### 3.2. GET /api/admin/users

**Mục đích:** Admin/Moderator quản lý users

**Authentication:** Required

**Permission:** `moderator` hoặc `admin`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string | No | Filter by role |
| `search` | string | No | Search by fullName or email |
| `limit` | number | No | Default: 50 |
| `offset` | number | No | Default: 0 |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "contributor",
      "emailVerified": true,
      "disabled": false,
      "stats": {
        "placesContributed": 12,
        "reviewsWritten": 25
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastLoginAt": "2025-10-10T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1500,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

**Implementation:** `src/app/api/admin/users/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-admin.ts` - Hook fetchUsers()
- `src/app/admin/users/page.tsx` - Admin users management

---

### 3.3. PUT /api/admin/users/[userId]/role

**Mục đích:** Admin thay đổi role của user

**Authentication:** Required

**Permission:** `admin` only (NOT moderator)

**Path Parameter:** `userId` - User ID

**Request Body:**
```json
{
  "newRole": "contributor",
  "reason": "User đã đóng góp 5 địa điểm chất lượng cao"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã cập nhật role thành công",
  "data": {
    "userId": "user-id",
    "oldRole": "traveler",
    "newRole": "contributor",
    "updatedAt": "2025-10-10T10:00:00.000Z"
  }
}
```

**Business Logic:**
1. Validate role hierarchy (admin không thể tự hạ quyền mình)
2. Update `users/{userId}/role`
3. Log vào `users/{userId}/roleHistory`
4. Trigger notification: `ROLE_UPGRADED`
5. Audit log: `admin_audit_log`

**Error Responses:**
- `403` - Chỉ admin mới có quyền
- `400` - Invalid role value
- `409` - Cannot demote yourself

**Implementation:** `src/app/api/admin/users/[userId]/role/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-admin.ts` - Hook changeUserRole()
- `src/app/admin/users/page.tsx` - Role change modal

---

### 3.4. PUT /api/admin/users/[userId]/status

**Mục đích:** Admin enable/disable user account

**Authentication:** Required

**Permission:** `admin` only

**Path Parameter:** `userId` - User ID

**Request Body:**
```json
{
  "disabled": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tài khoản đã bị vô hiệu hóa",
  "data": {
    "userId": "user-id",
    "disabled": true
  }
}
```

**Side Effects:**
- Update Firebase Auth: `adminAuth.updateUser(userId, { disabled: true })`
- Update Firestore: `users/{userId}/disabled = true`
- Revoke all active sessions

**Implementation:** `src/app/api/admin/users/[userId]/status/route.ts`

---

### 3.5. GET /api/admin/analytics/places

**Mục đích:** Thống kê tổng quan về places

**Authentication:** Required

**Permission:** `admin` hoặc `moderator`

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 500,
    "byStatus": {
      "published": 450,
      "draft": 20,
      "submitted": 15,
      "in_review": 10,
      "rejected": 5
    },
    "byRegion": {
      "bac-bo": 200,
      "trung-bo": 150,
      "nam-bo": 150
    },
    "byType": {
      "bien": 120,
      "nui": 100,
      "van-hoa": 150,
      "am-thuc": 80,
      "check-in": 50
    },
    "byTrustLabel": {
      "community": 100,
      "contributor": 200,
      "partner": 150,
      "verified": 50
    },
    "totalViews": 5000000,
    "totalLikes": 120000,
    "totalReviews": 15000
  }
}
```

**Implementation:** `src/app/api/admin/analytics/places/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-admin.ts` - Hook fetchAnalytics()
- `src/app/admin/analytics/places/page.tsx` - Analytics dashboard

---

### 3.6. GET/POST /api/admin/settings

**Mục đích:** Quản lý system settings

**Authentication:** Required

**Permission:** `admin` only

**GET Success Response (200):**
```json
{
  "success": true,
  "data": {
    "siteName": "Du Lịch Việt",
    "maintenanceMode": false,
    "allowRegistration": true,
    "moderationAutoApprove": false,
    "reviewRequireVerification": true,
    "maxDraftsPerUser": 10,
    "claimTimeoutMinutes": 120
  }
}
```

**POST Request Body:**
```json
{
  "maintenanceMode": true,
  "maintenanceMessage": "Hệ thống đang bảo trì, quay lại sau 2 giờ"
}
```

**POST Success Response (200):**
```json
{
  "success": true,
  "message": "Cài đặt đã được cập nhật"
}
```

**Implementation:** `src/app/api/admin/settings/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-admin.ts` - Hook updateSettings()
- `src/app/admin/settings/page.tsx` - Settings management

---

### 3.7. GET /api/admin/reports

**Mục đích:** Admin/Moderator xem tất cả reports

**Authentication:** Required

**Permission:** `moderator` hoặc `admin`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `pending`, `investigating`, `resolved`, `dismissed` |
| `type` | string | No | `place`, `review`, `user` |
| `priority` | string | No | `urgent`, `high`, `medium`, `low` |
| `limit` | number | No | Default: 20 |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "report-id",
      "contentType": "place",
      "contentId": "place-id",
      "reason": "inaccurate_info",
      "description": "Địa chỉ không chính xác",
      "evidence": [
        {
          "type": "image",
          "url": "https://..."
        }
      ],
      "reportedBy": "user-id",
      "reporterInfo": {
        "fullName": "Nguyễn Văn A",
        "role": "contributor"
      },
      "status": "pending",
      "priority": "high",
      "createdAt": "2025-10-09T10:00:00.000Z"
    }
  ],
  "total": 50
}
```

**Implementation:** `src/app/api/admin/reports/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-admin-reports.ts` - Hook useAdminReports()
- `src/app/admin/moderation/reports/page.tsx` - Reports management

---

### 3.8. POST /api/admin/reports/[reportId]/claim

**Mục đích:** Moderator claim report để xử lý

**Authentication:** Required

**Permission:** `moderator` hoặc `admin`

**Path Parameter:** `reportId` - Report ID

**Request Body:** Empty

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã tiếp nhận báo cáo",
  "data": {
    "reportId": "report-id",
    "status": "investigating",
    "claimedBy": "moderator-id",
    "claimedAt": "2025-10-10T10:00:00.000Z",
    "claimExpiresAt": "2025-10-10T12:00:00.000Z"
  }
}
```

**Business Logic:**
1. Change status: `pending` → `investigating`
2. Set `claimedBy`, `claimedAt`, `claimExpiresAt` (2 hours)
3. If moderator không xử lý trong 2h → auto-release (cron job)

**Error Responses:**
- `409` - Report đã được claim bởi moderator khác

**Implementation:** `src/app/api/admin/reports/[reportId]/claim/route.ts`

---

### 3.9. POST /api/admin/reports/[reportId]/resolve-with-action

**Mục đích:** Moderator resolve report với action cụ thể

**Authentication:** Required

**Permission:** `moderator` hoặc `admin`

**Path Parameter:** `reportId` - Report ID

**Request Body:**
```json
{
  "action": "hide_content",
  "notes": "Thông tin thật sự không chính xác, đã ẩn địa điểm",
  "notifyReporter": true
}
```

**Action Values:**
- `dismiss` - Báo cáo không hợp lệ
- `hide_content` - Ẩn content được báo cáo
- `warn_user` - Cảnh báo user (content owner)
- `suspend_content` - Suspend content tạm thời
- `delete_content` - Xóa content (chỉ admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã xử lý báo cáo và ẩn nội dung",
  "data": {
    "reportId": "report-id",
    "status": "resolved",
    "action": "hide_content",
    "resolvedBy": "moderator-id",
    "resolvedAt": "2025-10-10T10:30:00.000Z"
  }
}
```

**Side Effects:**
- Update report status → `resolved`
- Execute action (hide/suspend/delete content)
- Notify reporter if `notifyReporter: true`
- Notify content owner về action taken
- Log vào `moderation_logs`

**Implementation:** `src/app/api/admin/reports/[reportId]/resolve-with-action/route.ts`

**Được sử dụng trong:**
- `src/app/admin/moderation/reports/page.tsx` - Resolve report modal

---

### 3.10. GET/POST/PATCH/DELETE /api/admin/announcements

**Mục đích:** Quản lý announcements (thông báo hệ thống)

**Authentication:** Required

**Permission:** `admin` only

**GET Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "announcement-id",
      "slug": "bao-tri-he-thong",
      "title": "Bảo trì hệ thống",
      "content": "Hệ thống sẽ bảo trì vào 12h ngày 15/10",
      "type": "maintenance",
      "priority": "high",
      "status": "published",
      "publishedAt": "2025-10-10T10:00:00.000Z",
      "expiresAt": "2025-10-15T14:00:00.000Z",
      "createdBy": "admin-id",
      "createdAt": "2025-10-10T09:00:00.000Z"
    }
  ]
}
```

**POST Request Body:**
```json
{
  "title": "Bảo trì hệ thống",
  "content": "Hệ thống sẽ bảo trì...",
  "type": "maintenance",
  "priority": "high",
  "publishedAt": "2025-10-10T10:00:00.000Z",
  "expiresAt": "2025-10-15T14:00:00.000Z"
}
```

**Implementation:** `src/app/api/admin/announcements/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-announcements.ts` - Hook useAnnouncements()
- `src/app/admin/announcements/page.tsx` - Announcements management

---

## 4. Moderation APIs

### 4.1. GET /api/moderation/queue

**Mục đích:** Lấy moderation queue items

**Authentication:** Required

**Permission:** `moderator` hoặc `admin`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `pending`, `claimed`, `in_review`, `approved`, `rejected` (có thể comma-separated: `pending,claimed`) |
| `contentType` | string | No | `place`, `place_edit`, `itinerary` |
| `itemType` | string | No | `new_place`, `place_edit`, etc. |
| `priority` | string | No | Priority level |
| `queueType` | string | No | `partner_queue`, `contributor_queue` |
| `limit` | number | No | Default: 20 |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "queue-item-id",
      "contentType": "place",
      "contentId": "place-id",
      "itemType": "new_place",
      "status": "pending",
      "priority": 3,
      "queueType": "contributor_queue",
      "submittedBy": "user-id",
      "submittedAt": "2025-10-09T10:00:00.000Z",
      "submitter": {
        "id": "user-id",
        "fullName": "Nguyễn Văn A",
        "role": "contributor",
        "avatar": "https://..."
      },
      "metadata": {
        "title": "Bãi biển Mỹ Khê",
        "type": "bien",
        "region": "trung-bo",
        "province": "Đà Nẵng",
        "hasImages": true,
        "hasCoordinates": true
      },
      "contentDetails": {
        "id": "place-id",
        "name": "Bãi biển Mỹ Khê",
        "description": "...",
        "images": [...],
        // ... full place data
      }
    }
  ],
  "total": 15
}
```

**Background Processing:**
- Auto-cleanup orphaned entries (content deleted but queue item remains)
- Auto-release expired claims (> 2 hours)

**Implementation:** `src/app/api/moderation/queue/route.ts`

**Được sử dụng trong:**
- `src/app/admin/moderation/queue/page.tsx` - Moderation queue UI
- Refresh every 30s using polling

---

### 4.2. PUT /api/moderation/queue/[itemId]

**Mục đích:** Moderator actions trên queue item

**Authentication:** Required

**Permission:** `moderator` hoặc `admin`

**Path Parameter:** `itemId` - Queue item ID

**Request Body:**
```json
{
  "action": "start_review",
  "reviewNotes": "Đã kiểm tra, thông tin chính xác",
  "newTrustLabel": "contributor"
}
```

**Actions:**

#### 1. `claim` - Tiếp nhận item
```json
{
  "action": "claim"
}
```
- `pending` → `claimed`
- Set `claimedBy`, `claimedAt`, `claimExpiresAt` (2h)

#### 2. `unclaim` - Bỏ tiếp nhận
```json
{
  "action": "unclaim"
}
```
- `claimed` → `pending`
- Clear claim fields

#### 3. `start_review` - Bắt đầu kiểm duyệt
```json
{
  "action": "start_review"
}
```
- `claimed` → `in_review`
- Trigger notification: `PLACE_IN_REVIEW`

#### 4. `approve` - Duyệt và publish
```json
{
  "action": "approve",
  "reviewNotes": "Đã kiểm tra, thông tin chính xác",
  "newTrustLabel": "partner"
}
```
- `in_review` → `approved`
- Change place status: `submitted` → `published`
- Set `publishedAt`
- Update trust label if provided
- Trigger notification: `PLACE_APPROVED`
- Keep in queue for 30 days (audit trail)

#### 5. `reject` - Từ chối
```json
{
  "action": "reject",
  "reviewNotes": "Thông tin không đầy đủ, thiếu tọa độ chính xác"
}
```
- `in_review` → `rejected`
- Change place status: `submitted` → `rejected`
- Trigger notification: `PLACE_REJECTED`
- Keep in queue for 30 days

#### 6. `request_edit` - Yêu cầu chỉnh sửa
```json
{
  "action": "request_edit",
  "reviewNotes": "Cần bổ sung thêm hình ảnh và thông tin giờ mở cửa"
}
```
- `in_review` → `needs_revision`
- Change place status: `submitted` → `draft`
- Trigger notification: `REVISION_REQUESTED`
- User edits draft và submit lại

#### 7. `escalate` - Chuyển lên Admin (Moderator only)
```json
{
  "action": "escalate",
  "escalateReason": "Nội dung nhạy cảm, cần Admin xem xét"
}
```
- Set `escalated: true`, `escalatedAt`, `escalatedReason`
- Notify all admins
- **IMPORTANT:** Admin KHÔNG thể escalate (403 error)

**State Machine Validation:**
- `start_review`: CHỈ từ `claimed`
- `approve/reject/request_edit`: CHỈ từ `in_review`
- Violations → 400 error với expected flow message

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã duyệt địa điểm thành công",
  "data": {
    "itemId": "queue-item-id",
    "status": "approved",
    "reviewedBy": "moderator-id",
    "reviewedAt": "2025-10-10T10:30:00.000Z",
    "placeId": "place-id",
    "placeStatus": "published"
  }
}
```

**Implementation:** `src/app/api/moderation/queue/[itemId]/route.ts` (1020 lines)

**Được sử dụng trong:**
- `src/app/admin/moderation/queue/page.tsx` - Action buttons

---

## 5. Community APIs

### 5.1. GET /api/community/stats

**Mục đích:** Lấy thống kê cộng đồng (public)

**Authentication:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalPlaces": 500,
    "totalReviews": 15000,
    "totalUsers": 5000,
    "totalContributors": 500,
    "topRegion": "bac-bo",
    "mostPopularType": "bien",
    "recentActivities": [
      {
        "type": "new_place",
        "placeName": "Vịnh Hạ Long",
        "contributorName": "Nguyễn Văn A",
        "timestamp": "2025-10-10T10:00:00.000Z"
      }
    ]
  }
}
```

**Caching:** 5 minutes

**Implementation:** `src/app/api/community/stats/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-community-stats.ts` - Hook useCommunityStats()
- `src/app/community/page.tsx` - Community stats display

---

### 5.2. GET /api/community/top-contributors

**Mục đích:** Lấy danh sách top contributors (public)

**Authentication:** Public

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | `week`, `month`, `all` (default: `month`) |
| `limit` | number | No | Default: 10, max: 50 |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "user-id",
      "fullName": "Nguyễn Văn A",
      "avatar": "https://...",
      "role": "contributor",
      "stats": {
        "placesContributed": 25,
        "reviewsWritten": 100,
        "helpfulVotes": 500
      },
      "badges": ["top_contributor", "verified_reviewer"],
      "rank": 1
    }
  ]
}
```

**Ranking Algorithm:**
```
score = (placesContributed * 10) + (reviewsWritten * 2) + (helpfulVotes * 1)
```

**Implementation:** `src/app/api/community/top-contributors/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-top-contributors.ts` - Hook useTopContributors()
- `src/app/community/page.tsx` - Leaderboard display

---

## 6. Review APIs

### 6.1. POST /api/reviews/[id]/helpful

**Mục đích:** Đánh dấu review là hữu ích

**Authentication:** Required

**Path Parameter:** `id` - Review ID

**Request Body:** Empty

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã đánh dấu hữu ích",
  "data": {
    "reviewId": "review-id",
    "helpfulCount": 26,
    "userMarkedHelpful": true
  }
}
```

**Validation:**
- User không thể vote cho review của chính mình
- Mỗi user chỉ vote 1 lần per review

**Side Effects:**
- Create document in `review_helpful` collection
- Increment `place_reviews/{id}/helpfulCount` với `FieldValue.increment(1)`

**Implementation:** `src/app/api/reviews/[id]/helpful/route.ts` (POST handler)

**Được sử dụng trong:**
- `src/components/place-detail-content.tsx` - Helpful button

---

### 6.2. DELETE /api/reviews/[id]/helpful

**Mục đích:** Bỏ đánh dấu helpful

**Authentication:** Required

**Path Parameter:** `id` - Review ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã bỏ đánh dấu hữu ích",
  "data": {
    "reviewId": "review-id",
    "helpfulCount": 25,
    "userMarkedHelpful": false
  }
}
```

**Side Effects:**
- Delete document from `review_helpful`
- Decrement `place_reviews/{id}/helpfulCount`

**Implementation:** `src/app/api/reviews/[id]/helpful/route.ts` (DELETE handler)

---

### 6.3. POST /api/reviews/[id]/report

**Mục đích:** Báo cáo review (spam, inappropriate, etc.)

**Authentication:** Required

**Path Parameter:** `id` - Review ID

**Request Body:**
```json
{
  "reason": "spam",
  "description": "Quảng cáo dịch vụ không liên quan"
}
```

**Reason Values:**
- `spam` - Spam/quảng cáo
- `inappropriate` - Nội dung không phù hợp
- `offensive` - Ngôn từ xúc phạm
- `fake` - Đánh giá giả mạo
- `irrelevant` - Không liên quan
- `other` - Lý do khác

**Success Response (201):**
```json
{
  "success": true,
  "message": "Báo cáo đã được gửi",
  "data": {
    "reportId": "report-id",
    "status": "pending"
  }
}
```

**Rate Limiting:** 3 reports per user per week (prevent spam abuse)

**Side Effects:**
- Create document in `review_reports` collection
- **Reports go to MODERATORS** (NOT review author or place owner)
- If review receives 3+ reports → Auto-hide (status: `hidden`)

**Error Responses:**
- `409` - User đã report review này rồi
- `429` - Quá 3 báo cáo trong tuần

**Implementation:** `src/app/api/reviews/[id]/report/route.ts`

**Được sử dụng trong:**
- `src/components/place-detail-content.tsx` - Report review button

---

## 7. Notification APIs

### 7.1. GET /api/notifications/preferences

**Mục đích:** Lấy notification preferences của user

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "channels": {
      "in_app": true,
      "push": false,
      "email": true,
      "sms": false
    },
    "types": {
      "PLACE_APPROVED": true,
      "PLACE_REJECTED": true,
      "NEW_REVIEW": true,
      "MODERATION_ASSIGNED": true
    },
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00",
      "timezone": "Asia/Ho_Chi_Minh"
    },
    "frequency": {
      "digest": "daily",
      "realtime": ["PLACE_APPROVED", "PLACE_REJECTED"]
    }
  }
}
```

**Implementation:** `src/app/api/notifications/preferences/route.ts` (GET handler)

**Được sử dụng trong:**
- `src/hooks/use-notification-preferences.ts` - Hook useNotificationPreferences()

---

### 7.2. PUT /api/notifications/preferences

**Mục đích:** Cập nhật notification preferences

**Authentication:** Required

**Request Body:**
```json
{
  "channels": {
    "in_app": true,
    "email": true
  },
  "quietHours": {
    "enabled": true,
    "start": "23:00",
    "end": "07:00"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã cập nhật cài đặt thông báo"
}
```

**Implementation:** `src/app/api/notifications/preferences/route.ts` (PUT handler)

---

### 7.3. GET /api/notifications/digest

**Mục đích:** Lấy notification digest (summary)

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | `daily`, `weekly` (default: `daily`) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "daily",
    "date": "2025-10-10",
    "summary": {
      "totalNotifications": 15,
      "unreadCount": 5,
      "byType": {
        "PLACE_APPROVED": 2,
        "NEW_REVIEW": 10,
        "HELPFUL_VOTE": 3
      }
    },
    "highlights": [
      {
        "type": "PLACE_APPROVED",
        "title": "Địa điểm của bạn đã được duyệt",
        "content": "\"Bãi biển Mỹ Khê\" đã được xuất bản",
        "timestamp": "2025-10-10T10:00:00.000Z",
        "actionUrl": "/places/bai-bien-my-khe"
      }
    ]
  }
}
```

**Implementation:** `src/app/api/notifications/digest/route.ts`

---

## 8. User Profile APIs

### 8.1. POST /api/users/avatar

**Mục đích:** Upload avatar cho user

**Authentication:** Required

**Request Body:** FormData
```typescript
const formData = new FormData();
formData.append('avatar', file); // File object
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã cập nhật avatar",
  "data": {
    "avatarUrl": "https://storage.googleapis.com/..."
  }
}
```

**Validation:**
- File types: JPG, PNG, WebP
- Max size: 2MB
- Auto-resize: 200x200px

**Implementation:** `src/app/api/users/avatar/route.ts`

**Được sử dụng trong:**
- `src/app/profile/me/page.tsx` - Avatar upload

---

### 8.2. PUT /api/users/profile

**Mục đích:** Cập nhật profile information

**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "bio": "Travel lover, photographer",
  "location": "Hà Nội",
  "website": "https://example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã cập nhật thông tin cá nhân"
}
```

**Validation:**
- fullName: 2-50 characters
- bio: Max 200 characters
- website: Valid URL format

**Implementation:** `src/app/api/users/profile/route.ts`

**Được sử dụng trong:**
- `src/app/profile/me/page.tsx` - Profile edit form

---

### 8.3. GET /api/user/favorites

**Mục đích:** Lấy danh sách places user đã favorite

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "placeId": "place-id",
      "placeName": "Vịnh Hạ Long",
      "placeSlug": "vinh-ha-long",
      "image": "https://...",
      "favoritedAt": "2025-10-01T10:00:00.000Z"
    }
  ],
  "total": 15
}
```

**Implementation:** `src/app/api/user/favorites/route.ts`

---

### 8.4. GET /api/user/saved

**Mục đích:** Lấy danh sách places user đã save

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "placeId": "place-id",
      "placeName": "Bãi biển Mỹ Khê",
      "placeSlug": "bai-bien-my-khe",
      "image": "https://...",
      "savedAt": "2025-10-05T14:00:00.000Z"
    }
  ],
  "total": 20
}
```

**Implementation:** `src/app/api/user/saved/route.ts`

**Được sử dụng trong:**
- `src/app/places/saved/page.tsx` - Saved places page

---

### 8.5. GET /api/user/reports

**Mục đích:** Lấy danh sách reports user đã submit

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "report-id",
      "contentType": "place",
      "contentId": "place-id",
      "contentName": "Vịnh Hạ Long",
      "reason": "inaccurate_info",
      "status": "investigating",
      "createdAt": "2025-10-09T10:00:00.000Z",
      "updatedAt": "2025-10-09T11:00:00.000Z"
    }
  ],
  "total": 5
}
```

**Implementation:** `src/app/api/user/reports/route.ts`

**Được sử dụng trong:**
- `src/app/contribute/my-reports/page.tsx` - User reports tracking

---

## 9. AI Chatbot APIs

### 9.1. POST /api/ai/chat

**Mục đích:** General AI chat (travel planning, Q&A)

**Authentication:** Optional (public + rate limited)

**Request Body:**
```json
{
  "message": "Gợi ý địa điểm du lịch biển ở Việt Nam",
  "conversationId": "conv-id" // Optional, for context
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "response": "Dưới đây là một số gợi ý địa điểm du lịch biển đẹp ở Việt Nam:\n\n1. Vịnh Hạ Long - Quảng Ninh...",
    "conversationId": "conv-id",
    "usage": {
      "promptTokens": 50,
      "completionTokens": 200,
      "totalTokens": 250
    }
  }
}
```

**Rate Limiting:**
- Anonymous: 5 requests/day
- Authenticated: 20 requests/day
- Premium: Unlimited

**Implementation:** `src/app/api/ai/chat/route.ts`

**Được sử dụng trong:**
- `src/app/ai-assistant/chat/page.tsx` - AI chat interface

---

### 9.2. POST /api/ai/place-chat

**Mục đích:** Place-specific AI chatbot (context-aware Q&A)

**Authentication:** Optional

**Request Body:**
```json
{
  "placeId": "place-id",
  "message": "Giờ mở cửa là khi nào?",
  "sessionId": "session-id" // For conversation continuity
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "response": "Vịnh Hạ Long mở cửa 24/7. Tuy nhiên, các tour tham quan thường hoạt động từ 7:00 - 17:00.",
    "sessionId": "session-id",
    "usage": {
      "totalTokens": 150
    }
  }
}
```

**Context Injection:**
- Place data: name, description, openingHours, entryFee, facilities, etc.
- Recent reviews summary
- FAQs from previous conversations

**Rate Limiting:** 10 Q&A per day per place per user (free tier)

**Cost Tracking:** ~$0.00026 per chat turn (~650 VND)

**Implementation:** `src/app/api/ai/place-chat/route.ts`

**Được sử dụng trong:**
- `src/hooks/use-place-chat.ts` - Hook usePlaceChat()
- `src/components/place-detail-content.tsx` - Floating chat widget

---

## 10. Cron Job APIs

> **Note:** Tất cả cron endpoints yêu cầu `X-Cron-Secret` header (configured in Vercel Cron)

### 10.1. POST /api/cron/cleanup-expired-claims

**Mục đích:** Auto-release expired moderation claims (> 2 hours)

**Authentication:** Cron secret header

**Schedule:** Every 30 minutes

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã giải phóng 3 claim hết hạn",
  "stats": {
    "found": 5,
    "released": 3,
    "skipped": 2,
    "errors": 0
  }
}
```

**Business Logic:**
1. Query: `status = 'claimed' AND claimExpiresAt < now()`
2. Use Firestore transaction for atomic check-and-update
3. Recheck status inside transaction (prevent race condition)
4. Update: `status = 'pending'`, delete claim fields

**Implementation:** `src/app/api/cron/cleanup-expired-claims/route.ts`

**Related Documentation:** See `.claude/docs/lessons-learned/critical-patterns/race-conditions.md`

---

### 10.2. POST /api/cron/archive-moderation-queue

**Mục đích:** Archive approved/rejected queue items sau 30 ngày

**Authentication:** Cron secret header

**Schedule:** Daily at 2:00 AM

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã archive 25 items",
  "stats": {
    "archived": 25,
    "deleted": 5
  }
}
```

**Business Logic:**
1. Query: `status IN ['approved', 'rejected'] AND reviewedAt < 30 days ago`
2. Move to `moderation_archive` collection
3. Delete from `moderation_queue`
4. Archive items > 90 days: Permanently delete from archive

**Implementation:** `src/app/api/cron/archive-moderation-queue/route.ts`

---

### 10.3. POST /api/cron/process-expired

**Mục đích:** Process expired suspensions (auto-restore places)

**Authentication:** Cron secret header

**Schedule:** Every hour

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã xử lý 2 suspension hết hạn",
  "stats": {
    "restored": 2
  }
}
```

**Business Logic:**
1. Query `suspension_schedules` collection: `scheduledAt <= now() AND status = 'pending'`
2. Restore place: `status = 'published'`, clear suspension fields
3. Update schedule: `status = 'completed'`
4. Notify place owner: `PLACE_RESTORED`

**Implementation:** `src/app/api/cron/process-expired/route.ts`

---

### 10.4. POST /api/cron/moderation-health-check

**Mục đích:** Health check cho moderation system

**Authentication:** Cron secret header

**Schedule:** Every 6 hours

**Success Response (200):**
```json
{
  "success": true,
  "message": "Moderation health check completed",
  "data": {
    "pendingCount": 15,
    "claimedCount": 5,
    "inReviewCount": 10,
    "avgProcessingTime": "18 hours",
    "slaBreachCount": 2,
    "alerts": [
      {
        "type": "sla_breach",
        "message": "2 items vượt SLA 24h",
        "itemIds": ["item-1", "item-2"]
      }
    ]
  }
}
```

**Alerts Triggered:**
- Pending queue > 50 items
- Claimed items > 2h without review start
- SLA breach (> 24h for contributors, > 12h for partners)

**Implementation:** `src/app/api/cron/moderation-health-check/route.ts`

---

### 10.5. POST /api/cron/publish-scheduled-announcements

**Mục đích:** Publish scheduled announcements

**Authentication:** Cron secret header

**Schedule:** Every 15 minutes

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã publish 2 announcements",
  "stats": {
    "published": 2,
    "expired": 1
  }
}
```

**Business Logic:**
1. Query: `status = 'scheduled' AND publishedAt <= now()`
2. Update: `status = 'published'`
3. Also expire announcements: `status = 'published' AND expiresAt < now()` → `status = 'expired'`

**Implementation:** `src/app/api/cron/publish-scheduled-announcements/route.ts`

---

## 11. Error Codes Reference

### Authentication Errors (AUTH_*)

| Code | HTTP Status | Message | Solution |
|------|-------------|---------|----------|
| `AUTH_TOKEN_MISSING` | 401 | Token không được cung cấp | Include Authorization header |
| `AUTH_TOKEN_INVALID` | 401 | Token không hợp lệ | Refresh token or re-login |
| `AUTH_TOKEN_EXPIRED` | 401 | Token đã hết hạn | Re-login |
| `AUTH_USER_NOT_FOUND` | 404 | User không tồn tại | Check user ID |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email chưa xác thực | Verify email first |

### Permission Errors (PERM_*)

| Code | HTTP Status | Message | Solution |
|------|-------------|---------|----------|
| `PERM_INSUFFICIENT` | 403 | Không đủ quyền | Upgrade role or contact admin |
| `PERM_NOT_OWNER` | 403 | Chỉ owner mới có quyền | Request from owner |
| `PERM_MODERATOR_ONLY` | 403 | Chỉ Moderator/Admin | N/A |
| `PERM_ADMIN_ONLY` | 403 | Chỉ Admin | N/A |

### Validation Errors (VALID_*)

| Code | HTTP Status | Message | Solution |
|------|-------------|---------|----------|
| `VALID_MISSING_FIELD` | 400 | Thiếu field bắt buộc: {field} | Provide required field |
| `VALID_INVALID_FORMAT` | 400 | Format không hợp lệ: {field} | Check format rules |
| `VALID_OUT_OF_RANGE` | 400 | Giá trị ngoài phạm vi | Check min/max constraints |
| `VALID_INVALID_ENUM` | 400 | Giá trị enum không hợp lệ | Use allowed values |

### Resource Errors (RES_*)

| Code | HTTP Status | Message | Solution |
|------|-------------|---------|----------|
| `RES_NOT_FOUND` | 404 | Resource không tồn tại | Check ID/slug |
| `RES_ALREADY_EXISTS` | 409 | Resource đã tồn tại | Use different identifier |
| `RES_DELETED` | 410 | Resource đã bị xóa | Cannot recover |

### Rate Limiting Errors (RATE_*)

| Code | HTTP Status | Message | Solution |
|------|-------------|---------|----------|
| `RATE_LIMIT_EXCEEDED` | 429 | Vượt giới hạn {limit} requests | Wait before retry |
| `RATE_TOO_MANY_REPORTS` | 429 | Quá 3 báo cáo trong tuần | Wait 1 week |

### Business Logic Errors (BIZ_*)

| Code | HTTP Status | Message | Solution |
|------|-------------|---------|----------|
| `BIZ_INVALID_STATE_TRANSITION` | 400 | Không thể chuyển từ {old} → {new} | Follow state machine |
| `BIZ_DUPLICATE_ACTION` | 409 | Hành động đã thực hiện | Skip duplicate |
| `BIZ_SLA_BREACH` | 400 | Đã vượt SLA deadline | Escalate |

---

## Appendix: API Client Usage Examples

### Example 1: Using apiClient (Recommended)

```typescript
import { apiClient } from '@/lib/client/api';

// Get places with filters
const result = await apiClient.places.list({
  region: 'bac-bo',
  type: 'bien',
  sortBy: 'popular',
  limit: 10
});

if (result.success) {
  console.log('Places:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Example 2: Using callApi directly

```typescript
import { callApi } from '@/lib/client/api';

// Create a review
const result = await callApi('/places/place-id/reviews', {
  method: 'POST',
  body: JSON.stringify({
    rating: 5,
    title: 'Tuyệt vời!',
    content: 'Địa điểm rất đẹp...'
  })
});
```

### Example 3: Using fetch with authentication

```typescript
import { auth } from '@/lib/firebase';

const user = auth.currentUser;
const token = await user.getIdToken();

const response = await fetch('/api/places/my-drafts', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Example 4: FormData upload

```typescript
const formData = new FormData();
formData.append('avatar', file);

const result = await callApi('/users/avatar', {
  method: 'POST',
  body: formData
  // DON'T set Content-Type - browser will auto-set with boundary
});
```

---

**END OF API REFERENCE**

**Total Documented Endpoints:** 60+ (actively used)
**Last Updated:** 2025-10-10
**Maintained By:** Development Team

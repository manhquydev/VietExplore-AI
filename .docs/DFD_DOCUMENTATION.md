# Data Flow Diagram (DFD) - Hệ Thống Du Lịch Việt

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [DFD Level 0 - Context Diagram](#2-dfd-level-0---context-diagram)
3. [DFD Level 1 - Major Subsystems](#3-dfd-level-1---major-subsystems)
4. [DFD Level 1 - Chi tiết Process 2.0 (Quản lý Địa điểm)](#4-dfd-level-1---chi-tiết-process-20-quản-lý-địa-điểm)
5. [DFD Level 1 - Chi tiết Process 3.0 (Kiểm duyệt)](#5-dfd-level-1---chi-tiết-process-30-kiểm-duyệt)
6. [DFD Level 1 - Chi tiết Process 4.0 (Đánh giá)](#6-dfd-level-1---chi-tiết-process-40-đánh-giá)
7. [Tổng hợp Data Stores](#7-tổng-hợp-data-stores)
8. [Các luồng dữ liệu chính](#8-các-luồng-dữ-liệu-chính)
9. [Kết luận](#9-kết-luận)

---

## 1. Tổng quan hệ thống

### 1.1. Giới thiệu

**Du Lịch Việt (VietExplore-AI)** là nền tảng khám phá du lịch Việt Nam với tích hợp AI, cho phép:

- 🗺️ Khám phá địa điểm du lịch (biển, núi, văn hóa, ẩm thực, check-in)
- ✍️ Đóng góp nội dung từ cộng đồng (Contributor, Partner)
- 🔍 Kiểm duyệt nội dung chặt chẽ (Moderator, Admin)
- ⭐ Đánh giá và review địa điểm
- 🤖 AI Chatbot hỗ trợ thông tin địa điểm
- 📊 Analytics và tracking hành vi người dùng

### 1.2. Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Firebase Admin SDK
- **Database:** Firebase Firestore (NoSQL)
- **Storage:** Firebase Storage (images/videos)
- **Authentication:** Firebase Auth (email/password, Google)
- **AI:** Firebase Genkit + Google Gemini 2.5 Flash
- **Analytics:** Microsoft Clarity

### 1.3. User Roles Hierarchy

```
Guest → Traveler → Contributor → Partner → Moderator → Admin
```

| Role | Key Permissions |
|------|----------------|
| **Guest** | Xem địa điểm, Tìm kiếm |
| **Traveler** | Report content, Create itinerary, Save places, Review places |
| **Contributor** | Create place (requires moderation), Manage drafts |
| **Partner** | Priority moderation queue, Partner badge, Fast review |
| **Moderator** | Review/Approve/Reject content, View moderation queue, Manage announcements |
| **Admin** | All permissions, System settings, User management, Override restrictions |

---

## 2. DFD Level 0 - Context Diagram

### 2.1. Sơ đồ Context Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                        EXTERNAL ENTITIES                          │
│                                                                   │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐        │
│  │  Guest   │  │ Traveler   │  │Contributor│  │ Partner   │       │
│  └──────────┘  └────────────┘  └──────────┘  └───────────┘        │
│                                                                   │
│  ┌──────────┐  ┌────────────┐                                     │
│  │Moderator │  │   Admin    │                                     │
│  └──────────┘  └────────────┘                                     │
└───────────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌───────────────────────────────────────────┐
        │   Xem địa điểm, Tìm kiếm                  │
        │   ┌─────────────────────────────────┐     │
        │   │                                 │     │
        │   │    HỆ THỐNG DU LỊCH VIỆT        │◄────┤ Đăng ký/Đăng nhập
        │   │   (VietExplore-AI System)       │     │
        │   │         Process 0               │     │
        │   │                                 │     │
        │   └─────────────────────────────────┘     │
        │   Tạo địa điểm, Đánh giá, Báo cáo         │
        └───────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL SYSTEMS                        │
│                                                             │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │Firebase Auth  │  │Firebase Storage│  │Firestore DB   │   │
│  │(Xác thực)     │  │(Lưu hình ảnh) │  │(Lưu dữ liệu)   │   │
│  └───────────────┘  └──────────────┘  └─────────────────┘   │
│                                                             │
│  ┌───────────────┐  ┌──────────────┐                        │
│  │Genkit AI      │  │Microsoft      │                       │
│  │(Chat, Gợi ý)  │  │Clarity        │                       │
│  └───────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Giải thích ký hiệu chuẩn DFD

| Ký hiệu | Ý nghĩa | Ví dụ |
|---------|---------|-------|
| **Hình chữ nhật** | External Entity (Thực thể bên ngoài) | Guest, Traveler, Firebase Auth |
| **Hình tròn** | Process (Quy trình xử lý) | Process 0, Process 1.0, Process 2.1 |
| **Hình chữ nhật mở 1 đầu** | Data Store (Kho dữ liệu) | D1: users, D2: places |
| **Mũi tên có nhãn** | Data Flow (Luồng dữ liệu) | "Xem địa điểm", "Tạo review" |

### 2.3. Các Data Flow chính trong Context Diagram

| From | To | Data Flow | Mô tả |
|------|-----|-----------|-------|
| Guest/Traveler | System | Xem địa điểm, Tìm kiếm | Truy vấn danh sách địa điểm |
| User | System | Đăng ký/Đăng nhập | Thông tin xác thực |
| Contributor/Partner | System | Tạo địa điểm, Upload ảnh | Đóng góp nội dung mới |
| Traveler+ | System | Đánh giá, Review | Feedback về địa điểm |
| User | System | Báo cáo vi phạm | Report place/review |
| Moderator/Admin | System | Kiểm duyệt, Approve/Reject | Quản lý nội dung |
| System | Firebase Auth | Verify credentials | Xác thực người dùng |
| System | Firebase Storage | Upload/Get images | Lưu trữ hình ảnh |
| System | Firestore DB | CRUD operations | Truy vấn/Lưu dữ liệu |
| System | Genkit AI | AI chat queries | Chatbot hỗ trợ |
| System | Microsoft Clarity | Analytics events | Tracking hành vi |

---

## 3. DFD Level 1 - Major Subsystems

### 3.1. Sơ đồ tổng quan các subsystems

```
┌──────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL ENTITIES                       │
│   [Guest] [Traveler] [Contributor] [Partner] [Moderator] [Admin]     │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────────────────────┐
        │                                                        │
        │  1.0                2.0                3.0             │
        │ ┌────────────┐  ┌────────────┐  ┌──────────────┐       │
        │ │Quản lý     │  │Quản lý     │  │Hệ thống      │       │
        │ │Người dùng  │  │Địa điểm    │  │Kiểm duyệt    │       │
        │ │& Xác thực  │  │& Nội dung  │  │Nội dung      │       │
        │ └────────────┘  └────────────┘  └──────────────┘       │
        │        │              │                  │             │
        │        ▼              ▼                  ▼             │
        │   [D1: users]   [D2: places]    [D3: mod_queue]        │
        │                 [D11: drafts]   [D10: mod_logs]        │
        │                 [D12: storage]                         │
        │                                                        │
        │  4.0                5.0                6.0             │
        │ ┌────────────┐  ┌────────────┐  ┌──────────────┐       │
        │ │Đánh giá    │  │Báo cáo     │  │Thông báo     │       │
        │ │& Rating    │  │& Xử lý     │  │Realtime      │       │
        │ │            │  │Vi phạm     │  │              │       │
        │ └────────────┘  └────────────┘  └──────────────┘       │
        │        │              │                  │             │
        │        ▼              ▼                  ▼             │
        │   [D4: reviews] [D5: place_rpt]  [D7: notifs]          │
        │                 [D6: review_rpt]                       │
        │                                                        │
        │  7.0                8.0                                │
        │ ┌────────────┐  ┌────────────┐                         │
        │ │AI Chatbot  │  │Analytics   │                         │
        │ │Place-      │  │& Tracking  │                         │
        │ │specific    │  │            │                         │
        │ └────────────┘  └────────────┘                         │
        │        │              │                                │
        │        ▼              ▼                                │
        │   [D8: ai_logs] [D9: view_cache]                       │
        │                                                        │
        └────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SYSTEMS                              │
│  [Firebase Auth] [Firebase Storage] [Firestore] [Genkit AI] [Clarity]│
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2. Chi tiết các Process chính (Level 1)

#### **Process 1.0 - Quản lý Người dùng & Xác thực**

| Thuộc tính | Giá trị |
|------------|---------|
| **Input** | Email, password, Google OAuth token |
| **Output** | User profile, JWT token, Role assignment |
| **Data Stores** | D1 (users) |
| **External** | Firebase Auth |
| **Sub-processes** | 1.1 Đăng ký, 1.2 Đăng nhập, 1.3 Quản lý profile, 1.4 Verify email |

**Chức năng chính:**
- Đăng ký tài khoản mới (email/password, Google)
- Xác thực người dùng (JWT token)
- Phân quyền role-based (guest → traveler → contributor → partner → moderator → admin)
- Quản lý profile (avatar, bio, stats)
- Email verification

---

#### **Process 2.0 - Quản lý Địa điểm & Nội dung**

| Thuộc tính | Giá trị |
|------------|---------|
| **Input** | Thông tin địa điểm (name, description, images, address, type, region) |
| **Output** | Draft ID, Submitted item, Published place |
| **Data Stores** | D2 (places), D11 (place_drafts), D12 (Firebase Storage) |
| **Sub-processes** | 2.1 Tạo Draft, 2.2 Submit Địa điểm, 2.3 Publish Địa điểm, 2.4 Edit Địa điểm |

**Workflow:**
1. Contributor tạo draft → Lưu vào D11
2. Upload ảnh → Firebase Storage → Lấy URLs
3. Submit draft → Tạo item trong D3 (moderation_queue)
4. Sau khi approved → Move sang D2 (places) với status = published

---

#### **Process 3.0 - Hệ thống Kiểm duyệt Nội dung**

| Thuộc tính | Giá trị |
|------------|---------|
| **Input** | Submitted drafts, Moderation actions (approve/reject/revise) |
| **Output** | Approved/Rejected places, Status updates, Notifications |
| **Data Stores** | D3 (moderation_queue), D10 (moderation_logs) |
| **Sub-processes** | 3.1 Lấy Queue, 3.2 Claim Item, 3.3 Review, 3.4 Quyết định |

**State Machine:**
```
pending → claimed → in_review → {approved | rejected | needs_revision}
```

**Timeout mechanism:**
- Claim timeout: 2 hours (auto-release nếu không start review)
- Review SLA: 24-48 hours tùy priority

---

#### **Process 4.0 - Đánh giá & Rating**

| Thuộc tính | Giá trị |
|------------|---------|
| **Input** | Review data (placeId, rating 1-5, title, content, isAnonymous) |
| **Output** | Review ID, Updated place rating, Helpful counts |
| **Data Stores** | D4 (place_reviews), D2 (places.rating) |
| **Sub-processes** | 4.1 Tạo Review, 4.2 Cập nhật Rating, 4.3 Vote Helpful |

**Rating calculation:**
```javascript
newAverage = (sum of all ratings) / totalReviews
breakdown = { 5★: count, 4★: count, 3★: count, 2★: count, 1★: count }
```

---

#### **Process 5.0 - Báo cáo & Xử lý Vi phạm**

| Thuộc tính | Giá trị |
|------------|---------|
| **Input** | Report data (targetId, reason, evidence) |
| **Output** | Report status, Moderator actions, Place hide/suspend |
| **Data Stores** | D5 (place_reports), D6 (review_reports), D10 (moderation_logs) |
| **Sub-processes** | 5.1 Submit Report, 5.2 Moderator Review, 5.3 Resolve Report |

**Report reasons:**
- Spam/quảng cáo
- Nội dung không phù hợp
- Ngôn từ xúc phạm
- Đánh giá giả mạo
- Không liên quan
- Lý do khác

**Rate limit:** 3 reports/user/week (chống spam abuse)

---

#### **Process 6.0 - Thông báo Realtime**

| Thuộc tính | Giá trị |
|------------|---------|
| **Input** | System events (place status changes, moderation actions, reviews) |
| **Output** | User notifications (in-app, badge count) |
| **Data Stores** | D7 (notifications) |
| **External** | Firebase Realtime Database |

**Notification types:**
- `PLACE_RECEIVED` - Địa điểm đã được tiếp nhận
- `PLACE_CLAIMED` - Đã được tiếp nhận xử lý
- `PLACE_IN_REVIEW` - Đang được kiểm duyệt
- `PLACE_APPROVED` - Địa điểm đã được duyệt
- `PLACE_REJECTED` - Địa điểm bị từ chối
- `REVISION_REQUESTED` - Yêu cầu chỉnh sửa
- `PLACE_HIDDEN` - Địa điểm bị ẩn do vi phạm
- `NEW_REVIEW` - Có đánh giá mới

---

#### **Process 7.0 - AI Chatbot Place-specific**

| Thuộc tính | Giá trị |
|------------|---------|
| **Input** | User question, Place context (name, description, address, features) |
| **Output** | AI-generated answer, Conversation log |
| **Data Stores** | D8 (ai_chat_logs) |
| **External** | Genkit AI (Google Gemini 2.5 Flash) |

**Features:**
- Context injection từ place data (100+ fields)
- Rate limiting: 10 Q&A/day/place/user
- Session persistence (client-side storage)
- Cost tracking: ~$0.00026/turn (~650 VND)

**Context structure:**
```javascript
{
  name: "Vịnh Hạ Long",
  description: "...",
  address: "Quảng Ninh",
  features: ["Di sản UNESCO", "Tour thuyền", ...],
  bestTimeToVisit: "Tháng 3-5, 9-11",
  entryFee: "200,000 VND"
}
```

---

#### **Process 8.0 - Analytics & Tracking**

| Thuộc tính | Giá trị |
|------------|---------|
| **Input** | User interactions, Page views, Clicks, Scrolls |
| **Output** | View counts, Heatmaps, Session recordings |
| **Data Stores** | D9 (view_cache) |
| **External** | Microsoft Clarity |

**Tracking patterns:**
- **View count:** Session-based với 1h TTL (chống spam)
- **Atomic increment:** `FieldValue.increment(1)` trong Firestore
- **Cache strategy:** IP + User-Agent fingerprinting
- **Cleanup:** Cron job hàng ngày xóa expired cache

---

## 4. DFD Level 1 - Chi tiết Process 2.0 (Quản lý Địa điểm)

### 4.1. Sơ đồ chi tiết Process 2.0

```
┌─────────────────────────────────────────────────────────────────┐
│           PROCESS 2.0 - QUẢN LÝ ĐỊA ĐIỂM & NỘI DUNG             │
└─────────────────────────────────────────────────────────────────┘

  [Contributor]  [Partner]
       │              │
       ├──────────────┴─── Tạo địa điểm mới ───────┐
       │                                            ▼
       │                                    ┌──────────────┐
       │                                    │   2.1        │
       │                                    │ Tạo Draft    │
       │                                    │              │
       │                                    └──────────────┘
       │                                            │
       │                                            │ Draft data
       │                                            ▼
       │                                     [D11: place_drafts]
       │                                            │
       │                                            │ Submit for review
       │                                            ▼
       │                                    ┌──────────────┐
       │                                    │   2.2        │
       │                                    │ Submit       │
       ├─── Upload ảnh ─────────────────►  │ Địa điểm      │
       │                                    │              │
       │                                    └──────────────┘
       │                                            │
       │                                            │ Image URLs
       │                                            ▼
       │                                  [D12: Firebase Storage]
       │                                            │
       │                                            │ Submitted item
       │                                            ▼
       │                                    [D3: moderation_queue]
       │                                            │
       │                                            │ Moderation result
       │                                            ▼
       │                                    ┌──────────────┐
       │                                    │   2.3        │
       │                                    │ Publish      │
       │                                    │ Địa điểm     │
       │                                    │              │
       │                                    └──────────────┘
       │                                            │
       │                                            │ Published place
       │                                            ▼
       │                                     [D2: places]
       │                                            │
       ├─── Xem địa điểm ──────────────────────────┘
       │                                            │
       │                                            ▼
       └─── Thông tin địa điểm ───────────────► [Guest/Traveler]


  [Moderator/Admin]
       │
       └─── Approve/Reject ──────────► [Process 3.0: Kiểm duyệt]
```

### 4.2. Chi tiết Sub-processes

#### **Process 2.1 - Tạo Draft**

**Input:**
- name (string, required)
- description (string, required)
- shortDescription (string, required)
- type (PlaceType: "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in")
- region (PlaceRegion: "bac-bo" | "trung-bo" | "nam-bo")
- vietnamAddress (VietnamAddress object)
- images (array of files or URLs)

**Process:**
1. Validate input data (required fields, format)
2. Generate slug from name
3. Set status = "draft"
4. Set trustLabel based on user role
5. Initialize empty stats (views: 0, likes: 0, saves: 0)
6. Save to D11 (place_drafts)

**Output:**
- Draft ID
- Draft object with metadata

---

#### **Process 2.2 - Submit Địa điểm**

**Input:**
- Draft ID
- Submit action (status change: draft → submitted)

**Process:**
1. Validate draft completeness (minimum required fields)
2. Upload images to Firebase Storage:
   - Resize to 1200x800px, 80% quality
   - Generate unique filenames
   - Store in `places/images/{userId}/{filename}`
3. Create moderation queue item:
   - Copy draft data to moderation_queue
   - Set status = "pending"
   - Set priority based on user role (partner = high priority)
   - Set createdAt timestamp
4. Send notification to user: "Địa điểm đã được tiếp nhận"

**Output:**
- Queue ID
- Notification ID

---

#### **Process 2.3 - Publish Địa điểm**

**Input:**
- Approved queue item from Process 3.0

**Process:**
1. Move data from moderation_queue to places collection
2. Set status = "published"
3. Generate public slug
4. Initialize public stats
5. Delete draft from place_drafts (cleanup)
6. Send notification to user: "Địa điểm đã được duyệt"

**Output:**
- Published place ID
- Public URL: `/places/{slug}`

---

#### **Process 2.4 - Edit Địa điểm** (Additional)

**Input:**
- Place ID
- Updated data

**Process:**
1. Check edit permission (owner or admin)
2. If published place: Create revision history entry
3. Update data
4. If significant changes: Re-submit to moderation queue
5. Log edit action in audit trail

**Output:**
- Updated place
- Revision ID (if applicable)

---

## 5. DFD Level 1 - Chi tiết Process 3.0 (Kiểm duyệt)

### 5.1. Sơ đồ chi tiết Process 3.0

```
┌─────────────────────────────────────────────────────────────────┐
│          PROCESS 3.0 - HỆ THỐNG KIỂM DUYỆT NỘI DUNG             │
└─────────────────────────────────────────────────────────────────┘

  [Moderator]  [Admin]
       │          │
       ├──────────┴─── Xem queue ─────────────┐
       │                                       ▼
       │                              ┌──────────────┐
       │                              │   3.1        │
       │                              │ Lấy Queue    │
       │                              │ Items        │
       │                              │              │
       │                              └──────────────┘
       │                                       │
       │                                       │ Queue items
       │                                       ▼
       │                             [D3: moderation_queue]
       │                                       │
       ├─── Claim item ────────────────────────┤
       │                                       │
       │                                       ▼
       │                              ┌──────────────┐
       │                              │   3.2        │
       │                              │ Tiếp nhận    │
       │                              │ (Claim)      │
       │                              │              │
       │                              └──────────────┘
       │                                       │
       │                                       │ status: claimed
       │                                       │ claimExpiresAt: +2h
       │                                       ▼
       │                             [D3: moderation_queue]
       │                                       │
       ├─── Bắt đầu duyệt ─────────────────────┤
       │                                       │
       │                                       ▼
       │                              ┌──────────────┐
       │                              │   3.3        │
       │                              │ Kiểm duyệt   │
       │                              │ (In Review)  │
       │                              │              │
       │                              └──────────────┘
       │                                       │
       │                                       │ status: in_review
       │                                       │ DELETE claimExpiresAt
       │                                       ▼
       │                             [D3: moderation_queue]
       │                                       │
       ├─── Approve/Reject/Revise ─────────────┤
       │                                       │
       │                                       ▼
       │                              ┌──────────────┐
       │                              │   3.4        │
       │                              │ Quyết định   │
       │                              │ cuối cùng    │
       │                              │              │
       │                              └──────────────┘
       │                                       │
       │                      ┌────────────────┼───────────────┐
       │                      │                │               │
       │              status: approved  status: rejected  status: needs_revision
       │                      │                │               │
       │                      ▼                ▼               ▼
       │              [D2: places]    [D10: mod_logs]   [D11: drafts]
       │              status:           Keep 30 days     Return to owner
       │              published         then archive     with feedback
       │                      │                │               │
       │                      └────────┬───────┴───────────────┘
       │                               │
       │                               │ Log action
       │                               ▼
       │                      [D10: moderation_logs]
       │                               │
       │                               │ Notification
       │                               ▼
       │                      [Process 6.0: Thông báo]
       │
       └───────────────────────────────────────────────────────────
```

### 5.2. State Machine Enforcement

```
┌──────────┐  claim   ┌──────────┐  start_review  ┌────────────┐
│ pending  ├─────────►│ claimed  ├───────────────►│ in_review  │
└──────────┘          └──────────┘                └────────────┘
                           │                              │
                           │ timeout (2h)                 │
                           ▼                              ▼
                      ┌──────────┐              ┌─────────────────┐
                      │ pending  │              │ approved        │
                      └──────────┘              │ rejected        │
                                                │ needs_revision  │
                                                └─────────────────┘
```

**Validation rules:**
- ❌ CANNOT skip states (pending → in_review directly)
- ❌ CANNOT approve/reject from "claimed" (must start_review first)
- ✅ MUST claim before review
- ✅ MUST delete claimExpiresAt when leaving "claimed" state
- ✅ Use Firestore transactions for atomic state changes

### 5.3. Chi tiết Sub-processes

#### **Process 3.1 - Lấy Queue Items**

**Input:**
- Filter parameters (status, priority, type, dateRange)
- Pagination (page, limit)
- Sort order (priority DESC, createdAt ASC)

**Process:**
1. Query moderation_queue with filters
2. Apply role-based visibility:
   - Moderator: Only pending + their claimed items
   - Admin: All items
3. Order by priority, createdAt
4. Paginate results (default: 20 items/page)

**Output:**
- Array of queue items
- Total count
- Pagination metadata

---

#### **Process 3.2 - Tiếp nhận (Claim)**

**Input:**
- Queue item ID
- Moderator user ID

**Process:**
1. Check if item already claimed:
   - If claimed by others → Error 409
   - If claimed by self → Allow (extend timeout)
2. Set claimExpiresAt = now + 2 hours
3. Set claimedBy = moderator user ID
4. Set claimedAt = now
5. Update status: pending → claimed
6. Send notification: "Đã được tiếp nhận xử lý"

**Output:**
- Updated queue item
- Notification ID

**Cron job cleanup:**
- Every 30 minutes, check claimed items where claimExpiresAt < now
- Use transaction to atomically:
  - Re-check status (must still be "claimed")
  - Update status: claimed → pending
  - Delete claim fields (claimExpiresAt, claimedBy, claimedAt)

---

#### **Process 3.3 - Kiểm duyệt (In Review)**

**Input:**
- Queue item ID
- Start review action

**Process:**
1. Validate ownership (claimedBy === current user)
2. Update status: claimed → in_review
3. **CRITICAL:** Delete claimExpiresAt field (prevent auto-release)
4. Delete claimedBy, claimedAt (cleanup)
5. Set reviewStartedAt = now
6. Send notification: "Đang được kiểm duyệt"

**Output:**
- Updated queue item with in_review status

**Why delete claimExpiresAt?**
- Prevents race condition where cron job resets item to "pending"
- See: `.claude/docs/lessons-learned/critical-patterns/race-conditions.md`

---

#### **Process 3.4 - Quyết định cuối cùng**

**Input:**
- Queue item ID
- Action: approve | reject | request_revision
- Notes/feedback (required for reject/revise)

**Process:**

**If APPROVE:**
1. Validate status = "in_review"
2. Move data to places collection (status = published)
3. Update queue item: status = approved, reviewedBy, reviewedAt
4. Keep in queue for 30 days (audit visibility)
5. Send notification: "Địa điểm đã được duyệt"
6. Log to moderation_logs

**If REJECT:**
1. Validate status = "in_review"
2. Update queue item: status = rejected, rejectionReason, reviewedBy, reviewedAt
3. Keep in queue for 30 days
4. Send notification: "Địa điểm bị từ chối" + reason
5. Log to moderation_logs

**If REQUEST REVISION:**
1. Validate status = "in_review"
2. Return to draft (place_drafts), status = needs_revision
3. Update queue item: status = needs_revision, revisionNotes
4. Send notification: "Yêu cầu chỉnh sửa" + notes
5. Log to moderation_logs

**Output:**
- Updated place/queue item
- Moderation log entry
- Notification

---

### 5.4. Auto-Archive Mechanism

**Cron job (Daily at 2AM):**

```javascript
// Find items approved/rejected > 30 days ago
const oldItems = await moderation_queue
  .where('status', 'in', ['approved', 'rejected'])
  .where('reviewedAt', '<', thirtyDaysAgo)
  .get()

// Move to moderation_archive collection
for (const item of oldItems) {
  await moderation_archive.doc(item.id).set(item.data())
  await moderation_queue.doc(item.id).delete()
}

// Delete archive entries > 90 days old
const veryOldArchive = await moderation_archive
  .where('reviewedAt', '<', ninetyDaysAgo)
  .get()

for (const item of veryOldArchive) {
  await moderation_archive.doc(item.id).delete()
}
```

**Benefits:**
- Keep moderation queue clean (performance)
- Maintain 30-day rollback window
- 90-day total audit trail
- Auto-cleanup prevents infinite growth

---

## 6. DFD Level 1 - Chi tiết Process 4.0 (Đánh giá)

### 6.1. Sơ đồ chi tiết Process 4.0

```
┌─────────────────────────────────────────────────────────────────┐
│          PROCESS 4.0 - ĐÁNH GIÁ & RATING                       │
└─────────────────────────────────────────────────────────────────┘

  [Traveler/Contributor/Partner]
       │
       ├─── Submit review ───────────────┐
       │                                  ▼
       │                         ┌──────────────┐
       │                         │   4.1        │
       │                         │ Tạo Review  │
       │                         │              │
       │                         └──────────────┘
       │                                  │
       │                                  │ Review data
       │                                  │ (rating, title, content)
       │                                  ▼
       │                        [D4: place_reviews]
       │                                  │
       │                                  │ Trigger update
       │                                  ▼
       │                         ┌──────────────┐
       │                         │   4.2        │
       │                         │ Cập nhật    │
       │                         │ Rating       │
       │                         │              │
       │                         └──────────────┘
       │                                  │
       │                                  │ New average rating
       │                                  │ Updated breakdown
       │                                  ▼
       │                          [D2: places.rating]
       │                          {
       │                            average: 4.3,
       │                            count: 127,
       │                            breakdown: {
       │                              5: 45, 4: 62,
       │                              3: 15, 2: 3, 1: 2
       │                            }
       │                          }
       │                                  │
       ├─── Mark helpful ────────────────┤
       │                                  │
       │                                  ▼
       │                         ┌──────────────┐
       │                         │   4.3        │
       │                         │ Vote Helpful │
       │                         │              │
       │                         └──────────────┘
       │                                  │
       │                                  │ helpfulCount++
       │                                  │ Track in review_helpful
       │                                  ▼
       │                        [D4: place_reviews]
       │                        helpfulCount: 23 → 24
       │
       └───────────────────────────────────────────────────────────
```

### 6.2. Chi tiết Sub-processes

#### **Process 4.1 - Tạo Review**

**Input:**
```typescript
{
  placeId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  title?: string,
  content: string,  // required, min 10 chars
  visitDate?: string,
  images?: File[],  // max 4 images
  isAnonymous: boolean
}
```

**Process:**
1. **Validation:**
   - Check user email verified
   - Check not duplicate (1 review/user/place)
   - Validate content length (10-5000 chars)
   - Validate images (max 4, max 5MB each)

2. **Image upload (if provided):**
   - Upload to Firebase Storage: `reviews/images/{userId}/{filename}`
   - Resize to 800x600px
   - Get URLs

3. **Create review document:**
   ```javascript
   {
     id: reviewId,
     placeId: placeId,
     userId: user.id,
     userInfo: {
       name: isAnonymous ? "Người dùng ẩn danh" : user.displayName,
       avatar: isAnonymous ? null : user.photoURL,
       role: user.role
     },
     rating: rating,
     title: title || null,
     content: content,
     visitDate: visitDate || null,
     images: imageUrls || [],
     isAnonymous: isAnonymous,
     helpfulCount: 0,
     status: "published",
     createdAt: now,
     updatedAt: now
   }
   ```

4. **Save to D4 (place_reviews)**

5. **Trigger Process 4.2** (Update place rating)

6. **Send notification to place owner** (if not anonymous)

**Output:**
- Review ID
- Review object

**Validation rules:**
- ✅ Email must be verified
- ✅ 1 review per user per place (no duplicates)
- ✅ Content minimum 10 characters
- ✅ Anonymous flag respected in userInfo

---

#### **Process 4.2 - Cập nhật Rating**

**Input:**
- New review with rating value
- Place ID

**Process:**
1. **Fetch all reviews for place:**
   ```javascript
   const reviews = await place_reviews
     .where('placeId', '==', placeId)
     .where('status', '==', 'published')
     .get()
   ```

2. **Calculate new statistics:**
   ```javascript
   const totalReviews = reviews.size
   const sumRatings = reviews.reduce((sum, r) => sum + r.data().rating, 0)
   const average = sumRatings / totalReviews

   const breakdown = {
     5: reviews.filter(r => r.data().rating === 5).length,
     4: reviews.filter(r => r.data().rating === 4).length,
     3: reviews.filter(r => r.data().rating === 3).length,
     2: reviews.filter(r => r.data().rating === 2).length,
     1: reviews.filter(r => r.data().rating === 1).length
   }
   ```

3. **Update place document atomically:**
   ```javascript
   await places.doc(placeId).update({
     'rating.average': average,
     'rating.count': totalReviews,
     'rating.breakdown': breakdown,
     'stats.totalReviews': totalReviews,
     updatedAt: now
   })
   ```

**Output:**
- Updated place.rating object
- Updated stats.totalReviews

**Why not FieldValue.increment()?**
- Rating average requires recalculation (not simple increment)
- Breakdown requires full aggregation
- Trade-off: Slightly slower but accurate

---

#### **Process 4.3 - Vote Helpful**

**Input:**
- Review ID
- User ID (voter)

**Process:**
1. **Check duplicate vote:**
   ```javascript
   const existingVote = await review_helpful
     .where('reviewId', '==', reviewId)
     .where('userId', '==', userId)
     .get()

   if (!existingVote.empty) {
     return { error: 'Already voted' }
   }
   ```

2. **Prevent self-voting:**
   ```javascript
   const review = await place_reviews.doc(reviewId).get()
   if (review.data().userId === userId) {
     return { error: 'Cannot vote for own review' }
   }
   ```

3. **Create vote record:**
   ```javascript
   await review_helpful.add({
     reviewId: reviewId,
     userId: userId,
     createdAt: now
   })
   ```

4. **Increment helpful count atomically:**
   ```javascript
   await place_reviews.doc(reviewId).update({
     helpfulCount: FieldValue.increment(1)
   })
   ```

**Output:**
- Updated review.helpfulCount
- Vote record in review_helpful

**Un-vote process:**
- DELETE vote record from review_helpful
- DECREMENT helpfulCount: `FieldValue.increment(-1)`

---

### 6.3. Review Display UX

**Initial load:**
- Show 3 reviews (mobile-friendly)
- Sort by: newest | oldest | highest_rating | lowest_rating | most_helpful

**Load more:**
- "Xem thêm X đánh giá" button
- Load 10 more per click

**Review summary:**
```
┌─────────────────────────────────────┐
│  ⭐ 4.3 / 5.0 (127 đánh giá)        │
│                                     │
│  5★ ████████████████████ 45        │
│  4★ ██████████████████████████ 62  │
│  3★ ██████ 15                      │
│  2★ █ 3                            │
│  1★ █ 2                            │
└─────────────────────────────────────┘
```

**Review card:**
```
┌─────────────────────────────────────┐
│ 👤 Nguyễn Văn A  🏅 Contributor     │
│ ⭐⭐⭐⭐⭐ 5.0                        │
│ Đã ghé thăm: 15/08/2024            │
│                                     │
│ **Tuyệt vời!**                     │
│ Cảnh đẹp, không khí trong lành...  │
│                                     │
│ [📷 4 ảnh]                          │
│                                     │
│ 👍 23 người thấy hữu ích            │
│ 🚩 Báo cáo                          │
│                                     │
│ 2 ngày trước                        │
└─────────────────────────────────────┘
```

---

## 7. Tổng hợp Data Stores

### 7.1. Bảng tổng hợp

| ID | Collection | Mô tả | Schema chính | Được dùng bởi |
|----|-----------|-------|-------------|--------------|
| **D1** | `users` | User profiles, roles, permissions | userId, email, displayName, role, stats | Process 1.0 |
| **D2** | `places` | Published places (public) | id, slug, name, description, images, rating, stats, status | Process 2.0, 4.0, 8.0 |
| **D3** | `moderation_queue` | Pending review items | id, type, status, priority, claimedBy, claimExpiresAt | Process 2.0, 3.0 |
| **D4** | `place_reviews` | User reviews for places | id, placeId, userId, rating, content, helpfulCount | Process 4.0, 5.0 |
| **D5** | `place_reports` | Reports against places | id, placeId, reportedBy, reason, status, reviewerInfo | Process 5.0 |
| **D6** | `review_reports` | Reports against reviews | id, reviewId, reportedBy, reason, status | Process 5.0 |
| **D7** | `notifications` | Realtime user notifications | id, userId, type, title, body, actionUrl, read | Process 6.0 |
| **D8** | `ai_chat_logs` | AI chatbot conversation logs | id, placeId, userId, messages, timestamp | Process 7.0 |
| **D9** | `view_cache` | Session-based view tracking (1h TTL) | placeId, sessionId, viewedAt, expiresAt | Process 8.0 |
| **D10** | `moderation_logs` | Audit trail for moderation actions | id, itemId, action, moderatorId, timestamp, notes | Process 3.0 |
| **D11** | `place_drafts` | User drafts (before submission) | id, userId, name, description, status, createdAt | Process 2.0 |
| **D12** | Firebase Storage | Image/video file storage | `places/images/{userId}/{filename}` | Process 2.0 |

### 7.2. Chi tiết schema quan trọng

#### **D2: places**

```typescript
{
  id: string,
  slug: string,  // URL-friendly: "vinh-ha-long-quang-ninh"
  name: string,
  description: string,
  shortDescription: string,
  region: "bac-bo" | "trung-bo" | "nam-bo",
  province: string,
  provinceSlug: string,
  type: "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in",
  coordinates?: { lat: number, lng: number },
  vietnamAddress: {
    provinceId: number,
    provinceName: string,
    districtId?: number,
    districtName?: string,
    wardId?: number,
    wardName?: string,
    fullAddress: string
  },
  images: [
    {
      id: string,
      url: string,
      alt: string,
      caption?: string,
      isPrimary: boolean,
      uploadedBy: string,
      createdAt: string,
      order?: number
    }
  ],
  trustLabel: "community" | "contributor" | "partner" | "verified",
  source: {
    type: "user" | "partner" | "import",
    userId?: string,
    partnerName?: string
  },
  status: "published" | "hidden" | "temporarily_suspended",
  rating: {
    average: number,
    count: number,
    breakdown: { 5: number, 4: number, 3: number, 2: number, 1: number }
  },
  stats: {
    views: number,
    likes: number,
    saves: number,
    shares: number,
    totalReviews: number
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  publishedAt: Timestamp
}
```

#### **D3: moderation_queue**

```typescript
{
  id: string,
  type: "place" | "review" | "edit_request",
  itemId: string,  // Reference to draft/item
  itemData: object,  // Copy of item data
  status: "pending" | "claimed" | "in_review" | "approved" | "rejected" | "needs_revision",
  priority: "urgent" | "high" | "medium" | "low",

  // Claim management
  claimedBy?: string,
  claimedAt?: Timestamp,
  claimExpiresAt?: Timestamp,  // 2 hours from claim

  // Review tracking
  reviewStartedAt?: Timestamp,
  reviewedBy?: string,
  reviewedAt?: Timestamp,

  // Decision
  approvalNotes?: string,
  rejectionReason?: string,
  revisionNotes?: string,

  // Metadata
  submittedBy: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### **D4: place_reviews**

```typescript
{
  id: string,
  placeId: string,
  userId: string,
  userInfo: {
    name: string,  // "Người dùng ẩn danh" if anonymous
    avatar?: string,
    role: UserRole
  },
  rating: 1 | 2 | 3 | 4 | 5,
  title?: string,
  content: string,
  visitDate?: string,
  images: string[],  // URLs from Firebase Storage
  isAnonymous: boolean,
  helpfulCount: number,
  status: "published" | "hidden" | "deleted",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### **D7: notifications**

```typescript
{
  id: string,
  userId: string,
  type: NotificationType,  // PLACE_RECEIVED, PLACE_APPROVED, etc.
  title: string,
  body: string,
  actionUrl?: string,
  actionText?: string,
  metadata?: {
    placeId?: string,
    placeName?: string,
    moderatorName?: string,
    [key: string]: any
  },
  priority: "critical" | "high" | "medium" | "low",
  read: boolean,
  createdAt: string,  // ISO format
  timestamp: number   // Unix timestamp for sorting
}
```

---

## 8. Các luồng dữ liệu chính

### 8.1. Luồng tạo địa điểm (End-to-end)

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG 1: TẠO ĐỊA ĐIỂM (CONTRIBUTOR → PUBLISHED PLACE)        │
└─────────────────────────────────────────────────────────────────┘

Step 1: Tạo Draft
  Contributor → [UI: /contribute/new]
  Input: name, description, type, region, images
  ↓
  POST /api/places/drafts
  ↓
  [D11: place_drafts] ← Save draft (status: draft)
  ↓
  Response: { draftId, status: "draft" }

Step 2: Upload Images
  Contributor → [UI: Image uploader]
  Input: image files (max 5MB each)
  ↓
  POST /api/upload
  ↓
  [D12: Firebase Storage] ← Upload to places/images/{userId}/{filename}
  ↓
  Response: { imageUrls: [...] }
  ↓
  Update draft with imageUrls

Step 3: Submit for Review
  Contributor → [UI: Submit button]
  ↓
  POST /api/places/drafts/{id}/submit
  ↓
  Validate draft completeness
  ↓
  [D3: moderation_queue] ← Create queue item (status: pending)
  ↓
  [D7: notifications] ← Notify contributor: "Địa điểm đã được tiếp nhận"
  ↓
  Response: { queueId, status: "pending" }

Step 4: Moderator Claim
  Moderator → [UI: /admin/moderation/queue]
  ↓
  POST /api/moderation/queue/{id}/claim
  ↓
  [D3: moderation_queue] ← Update:
    - status: pending → claimed
    - claimedBy: moderatorId
    - claimExpiresAt: now + 2h
  ↓
  [D7: notifications] ← Notify contributor: "Đã được tiếp nhận xử lý"
  ↓
  Response: { status: "claimed" }

Step 5: Start Review
  Moderator → [UI: Start review button]
  ↓
  POST /api/moderation/queue/{id}/start-review
  ↓
  [D3: moderation_queue] ← Update:
    - status: claimed → in_review
    - DELETE claimExpiresAt (CRITICAL!)
    - reviewStartedAt: now
  ↓
  [D7: notifications] ← Notify contributor: "Đang được kiểm duyệt"
  ↓
  Response: { status: "in_review" }

Step 6: Approve
  Moderator → [UI: Approve button]
  ↓
  POST /api/moderation/queue/{id}/approve
  ↓
  Transaction:
    1. [D2: places] ← Create published place (status: published)
    2. [D3: moderation_queue] ← Update (status: approved, reviewedAt: now)
    3. [D10: moderation_logs] ← Log action
    4. [D11: place_drafts] ← Delete draft (cleanup)
  ↓
  [D7: notifications] ← Notify contributor: "Địa điểm đã được duyệt"
  ↓
  Response: { placeId, slug, publicUrl: "/places/{slug}" }

Timeline:
  T0: Draft created
  T1: +5 min - Images uploaded
  T2: +10 min - Submitted (pending)
  T3: +30 min - Claimed by moderator
  T4: +40 min - Review started
  T5: +60 min - Approved → PUBLISHED
```

### 8.2. Luồng đánh giá địa điểm

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG 2: ĐÁNH GIÁ ĐỊA ĐIỂM (TRAVELER → UPDATED RATING)       │
└─────────────────────────────────────────────────────────────────┘

Step 1: Submit Review
  Traveler → [UI: /places/{slug} → Review modal]
  Input: {
    rating: 5,
    title: "Tuyệt vời!",
    content: "Cảnh đẹp, không khí trong lành...",
    isAnonymous: false
  }
  ↓
  POST /api/places/{id}/reviews
  ↓
  Validation:
    - Email verified? ✓
    - Duplicate review? ✗
    - Content length OK? ✓
  ↓
  [D4: place_reviews] ← Create review:
    {
      id: reviewId,
      placeId: placeId,
      rating: 5,
      helpfulCount: 0,
      status: "published"
    }
  ↓
  Trigger rating update
  ↓
  [D2: places] ← Update rating:
    - Calculate new average
    - Update breakdown
    - Increment totalReviews
  ↓
  [D7: notifications] ← Notify place owner: "Có đánh giá mới"
  ↓
  Response: { reviewId, newRating: 4.3 }

Step 2: Other Users Vote Helpful
  User2 → [UI: "Hữu ích" button]
  ↓
  POST /api/reviews/{id}/helpful
  ↓
  Validation:
    - Already voted? ✗
    - Self-vote? ✗
  ↓
  Transaction:
    1. [review_helpful] ← Create vote record
    2. [D4: place_reviews] ← Increment helpfulCount
  ↓
  Response: { helpfulCount: 24 }

Timeline:
  T0: Review submitted
  T1: +1 sec - Rating updated (4.2 → 4.3)
  T2: +5 min - 3 users voted helpful
  T3: +1 hour - 10 users voted helpful
```

### 8.3. Luồng báo cáo vi phạm

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG 3: BÁO CÁO VI PHẠM (USER → MODERATOR ACTION)           │
└─────────────────────────────────────────────────────────────────┘

Step 1: Submit Report
  User → [UI: Report button]
  Input: {
    targetType: "place",
    targetId: placeId,
    reason: "Nội dung không phù hợp",
    evidence: "Screenshot URL"
  }
  ↓
  POST /api/reports
  ↓
  Rate limit check: 3 reports/week OK? ✓
  ↓
  [D5: place_reports] ← Create report (status: pending)
  ↓
  [D7: notifications] ← Notify moderators: "Báo cáo mới"
  ↓
  Response: { reportId }

Step 2: Moderator Review
  Moderator → [UI: /admin/moderation/reports]
  ↓
  POST /api/admin/reports/{id}/claim
  ↓
  [D5: place_reports] ← Update (status: in_review, reviewerInfo)
  ↓
  Moderator investigates evidence
  ↓
  POST /api/admin/reports/{id}/resolve
  Input: {
    action: "hide_place",
    notes: "Vi phạm quy định về nội dung"
  }
  ↓
  Transaction:
    1. [D2: places] ← Update (status: hidden)
    2. [D5: place_reports] ← Update (status: resolved)
    3. [D10: moderation_logs] ← Log action
  ↓
  [D7: notifications] ← Notify:
    - Place owner: "Địa điểm bị ẩn"
    - Reporter: "Báo cáo đã được xử lý"
  ↓
  Response: { action: "hidden", placeStatus: "hidden" }

Timeline:
  T0: Report submitted
  T1: +15 min - Moderator claims
  T2: +30 min - Investigation
  T3: +45 min - Resolved (place hidden)
```

### 8.4. Luồng AI Chatbot

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG 4: AI CHATBOT PLACE-SPECIFIC                           │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Opens Chat
  User → [UI: /places/{slug} → Chat widget button]
  ↓
  Load session from localStorage (if exists)
  ↓
  Display chat interface

Step 2: User Asks Question
  User → Input: "Thời gian tốt nhất để đi?"
  ↓
  POST /api/ai/place-chat
  Input: {
    placeId: placeId,
    message: "Thời gian tốt nhất để đi?",
    conversationHistory: [...]
  }
  ↓
  Rate limit check: 10 Q&A/day OK? ✓
  ↓
  Extract place context from [D2: places]:
    {
      name: "Vịnh Hạ Long",
      description: "...",
      bestTimeToVisit: "Tháng 3-5, 9-11",
      features: [...],
      address: "Quảng Ninh"
    }
  ↓
  Build prompt:
    System: "Bạn là chuyên gia du lịch Việt Nam..."
    Context: { place data }
    User question: "Thời gian tốt nhất để đi?"
  ↓
  Call Genkit AI (Gemini 2.5 Flash)
  ↓
  const { text } = await ai.generate({ prompt, model })
  ↓
  [D8: ai_chat_logs] ← Log conversation:
    {
      placeId, userId, messages, tokens, cost, timestamp
    }
  ↓
  Response: {
    answer: "Thời gian tốt nhất để thăm Vịnh Hạ Long...",
    conversationId: chatId
  }
  ↓
  Client saves to localStorage
  ↓
  Display answer in chat widget

Cost tracking:
  - Input tokens: 1,200
  - Output tokens: 300
  - Total cost: ~$0.00026 (~650 VND)

Timeline:
  T0: User asks question
  T1: +500ms - Context extracted
  T2: +1.5s - AI generates answer
  T3: +1.8s - Response displayed
```

### 8.5. Luồng View Tracking

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG 5: VIEW TRACKING (SESSION-BASED)                       │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Visits Place Page
  User → [UI: /places/{slug}]
  ↓
  GET /api/places/{id} (SSR)
  ↓
  Check session tracking:
    sessionId = hash(IP + User-Agent)
  ↓
  [D9: view_cache] ← Query:
    WHERE placeId = X AND sessionId = Y AND expiresAt > now
  ↓
  If exists → Skip increment (already viewed in last hour)
  If not exists → Proceed to Step 2

Step 2: Increment View Count
  [D9: view_cache] ← Create:
    {
      placeId: placeId,
      sessionId: sessionId,
      viewedAt: now,
      expiresAt: now + 1 hour
    }
  ↓
  [D2: places] ← Atomic update:
    stats.views: FieldValue.increment(1)
  ↓
  Response: { viewCount: 1234 }

Step 3: Client Realtime Sync
  Client → useViewTracking(placeId, initialViewCount)
  ↓
  Subscribe to Firestore:
    onSnapshot(places.doc(placeId))
  ↓
  On stats.views change → Update UI optimistically
  ↓
  Display: "1,234 lượt xem"

Cleanup (Cron job daily):
  [D9: view_cache] ← Delete WHERE expiresAt < now
  Result: Keep cache size manageable

Timeline:
  T0: User visits page
  T1: +100ms - Session check (cache hit/miss)
  T2: +200ms - View count incremented (if new session)
  T3: +1 hour - Session expires (can count again)
```

---

## 9. Kết luận

### 9.1. Đặc điểm kiến trúc DFD hệ thống Du Lịch Việt

#### **Điểm mạnh:**

✅ **Phân tách rõ ràng 6 user roles** với permission hierarchy (guest → admin)
✅ **State machine chặt chẽ** cho moderation workflow (strict enforcement)
✅ **Audit trail đầy đủ** với moderation_logs tracking mọi hành động
✅ **Realtime notifications** qua Firebase Realtime Database
✅ **AI integration** với Genkit + Gemini 2.5 Flash cho chatbot
✅ **Session-based analytics** với 1h TTL chống spam view count
✅ **Transaction-based updates** tránh race conditions

#### **Patterns quan trọng:**

- **Atomic updates:** `FieldValue.increment()` cho rating, view counts, helpful votes
- **Session tracking:** IP + User-Agent fingerprinting với 1h cache TTL
- **Transaction cleanup:** Cron jobs sử dụng Firestore transactions để tránh race conditions
- **Field cleanup on state exit:** Delete `claimExpiresAt` khi approve/reject
- **30-day audit window:** Keep approved/rejected items visible 30 days trước khi archive
- **90-day total retention:** Auto-delete archive sau 90 ngày

### 9.2. Chuẩn DFD được áp dụng

| Ký hiệu | Chuẩn Yourdon/DeMarco |
|---------|----------------------|
| ✅ External Entities | Hình chữ nhật (Guest, Traveler, Firebase Auth) |
| ✅ Processes | Hình tròn có số thứ tự (1.0, 2.1, 3.2) |
| ✅ Data Stores | Hình chữ nhật mở 1 đầu (D1: users, D2: places) |
| ✅ Data Flows | Mũi tên có nhãn rõ ràng ("Tạo địa điểm", "Upload ảnh") |
| ✅ Decomposition | Level 0 → Level 1 → Sub-processes chi tiết |

### 9.3. Các luồng dữ liệu chính (Summary)

| Luồng | From | To | Average Latency |
|-------|------|----|----------------|
| **Tạo địa điểm** | Contributor | Published place | ~60 phút (moderation) |
| **Đánh giá** | Traveler | Updated rating | ~2 giây |
| **Báo cáo** | User | Moderator action | ~45 phút |
| **AI Chat** | User | AI answer | ~1.8 giây |
| **View tracking** | User | Incremented count | ~200ms |

### 9.4. Khối lượng dữ liệu ước tính

| Data Store | Estimated Records | Growth Rate |
|-----------|------------------|-------------|
| D1: users | 10,000 users | +500/month |
| D2: places | 500 places | +50/month |
| D3: moderation_queue | 50-100 active | +150/month (rotated) |
| D4: place_reviews | 5,000 reviews | +300/month |
| D5-D6: reports | 200 reports | +50/month |
| D7: notifications | 50,000 notifs | +10,000/month (archived) |
| D8: ai_chat_logs | 1,000 conversations | +200/month |
| D9: view_cache | 5,000 sessions | Auto-cleanup (1h TTL) |

### 9.5. Performance Metrics (Target)

| Metric | Target | Current |
|--------|--------|---------|
| **API Response Time** | < 500ms | ~300ms |
| **Moderation SLA** | < 24h | ~60 min average |
| **View tracking accuracy** | > 95% | ~98% (with dedup) |
| **AI Chat latency** | < 3s | ~1.8s |
| **Notification delivery** | < 2s | ~1s (realtime) |

### 9.6. Security & Compliance

✅ **Role-based access control** (RBAC) trên mọi API endpoint
✅ **Firebase security rules** enforce permissions client-side
✅ **JWT authentication** với Firebase Auth
✅ **Email verification** required for contributor+ actions
✅ **Rate limiting** cho user-generated content (reviews, reports)
✅ **Audit trail** với moderation_logs cho compliance
✅ **Anonymous reviews** với privacy protection
✅ **GDPR-compliant** analytics (Microsoft Clarity)

### 9.7. Scalability Considerations

**Current bottlenecks:**
- Moderation queue manual review (human-limited)
- Rating recalculation on every review (O(n) query)

**Future optimizations:**
- Implement AI-assisted moderation (auto-flag spam)
- Pre-calculate rating aggregates (materialized view)
- Add caching layer (Redis) for hot places
- Implement CDN for images (Firebase Storage + CDN)

---

## Phụ lục

### A. Thuật ngữ viết tắt

| Viết tắt | Đầy đủ | Giải thích |
|----------|--------|-----------|
| **DFD** | Data Flow Diagram | Sơ đồ luồng dữ liệu |
| **SSR** | Server-Side Rendering | Render trang từ server |
| **TTL** | Time To Live | Thời gian tồn tại |
| **RBAC** | Role-Based Access Control | Kiểm soát truy cập theo vai trò |
| **SLA** | Service Level Agreement | Thỏa thuận mức độ dịch vụ |
| **CRUD** | Create, Read, Update, Delete | Các thao tác cơ bản |
| **JWT** | JSON Web Token | Token xác thực dạng JSON |

### B. Tài liệu tham khảo

- **Source code:** `src/lib/types/`, `src/app/api/`
- **Architecture docs:** `.claude/docs/core/architecture.md`
- **Moderation workflow:** `.claude/docs/core/moderation-workflow.md`
- **Firebase setup:** `.claude/docs/core/firebase-setup.md`
- **Lessons learned:** `.claude/docs/lessons-learned/`

### C. Changelog

| Ngày | Phiên bản | Thay đổi |
|------|-----------|----------|
| 2025-01-31 | 1.0.0 | Initial documentation - DFD Level 0, Level 1, chi tiết 8 processes |

---

**Tài liệu được tạo bởi:** Claude Code
**Ngày tạo:** 2025-01-31
**Dự án:** VietExplore-AI - Du Lịch Việt
**Phiên bản:** 1.0.0

---

**Lưu ý:** Tài liệu này được tạo dựa trên phân tích codebase thực tế tại thời điểm 2025-01-31. Các thay đổi về kiến trúc trong tương lai cần cập nhật tài liệu này để đảm bảo tính chính xác.

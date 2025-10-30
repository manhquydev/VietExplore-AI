# Du Lịch Việt - Nền Tảng Du Lịch Việt Nam

**Version 3.0.0** | [Xem Demo](https://www.dulichviet.tech) | [Báo Lỗi](https://github.com/manhquydev/VietExplore-AI/issues) | [Đề Xuất Tính Năng](https://github.com/manhquydev/VietExplore-AI/issues)

Nền tảng chia sẻ và khám phá địa điểm du lịch Việt Nam với AI Trip Planner.

---

## Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Tính Năng Chính](#tính-năng-chính)
- [Tech Stack](#tech-stack)
- [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- [Hệ Thống Lượt Xem](#hệ-thống-lượt-xem)
- [Cài Đặt](#cài-đặt)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Giới Thiệu

**Du Lịch Việt** là nền tảng du lịch cộng đồng cho phép người dùng:

- Khám phá hàng nghìn địa điểm du lịch khắp Việt Nam
- Đóng góp thông tin địa điểm mới với hệ thống kiểm duyệt chuyên nghiệp
- Lên kế hoạch hành trình du lịch với AI Trip Planner
- Theo dõi thống kê và xu hướng du lịch
- Xây dựng uy tín qua hệ thống phân quyền dựa trên vai trò

### Điểm Nổi Bật

- **Production-Ready**: Đã deploy và hoạt động tại [dulichviet.tech](https://www.dulichviet.tech)
- **Enterprise-Grade**: Hệ thống kiểm duyệt workflow chuẩn enterprise
- **AI-Powered**: Tích hợp Google Genkit cho trip planning thông minh
- **Mobile-First**: Responsive design hoàn hảo trên mọi thiết bị
- **SEO Optimized**: SSR với Next.js 15 App Router, compound URLs
- **PWA Support**: Progressive Web App với offline capability
- **Real-time**: Firebase Realtime Database cho notifications

---

## Tính Năng Chính

### Quản Lý Địa Điểm

**Tạo và Quản Lý Địa Điểm Du Lịch**
- Tạo, chỉnh sửa, quản lý địa điểm du lịch
- Upload hình ảnh với auto-resize (1200x800px, 80% quality)
- Cấu trúc địa chỉ hành chính Việt Nam (Tỉnh/Huyện/Xã)
- Hỗ trợ 5 loại địa điểm: Biển, Núi, Văn hóa, Ẩm thực, Check-in
- Phân vùng miền: Bắc Bộ, Trung Bộ, Nam Bộ

### Hệ Thống Kiểm Duyệt Nội Dung

**State Machine Workflow**

State machine với 4 bước kiểm duyệt:

```
pending → claimed → in_review → approved/rejected/needs_revision
```

**Tính Năng:**
- Auto-archive sau 30 ngày
- Khả năng rollback trong 30 ngày
- Priority queue (Partner > Contributor > Traveler)
- Claim timeout 2 giờ

### AI Trip Planner

**Được Hỗ Trợ Bởi Google Genkit + Vertex AI**

Tự động gợi ý lịch trình dựa trên:
- Thời gian du lịch
- Sở thích cá nhân
- Ngân sách
- Số người tham gia

Export itinerary sang PDF/Excel

### Thông Báo Thời Gian Thực

**Firebase Realtime Database Integration**

8+ loại thông báo:
- Địa điểm đã tiếp nhận
- Địa điểm được claim để review
- Địa điểm đang được kiểm duyệt
- Địa điểm được duyệt/từ chối
- Yêu cầu chỉnh sửa
- Thay đổi vai trò người dùng
- Báo cáo được giải quyết
- Push notifications (Desktop + Mobile)

### Dashboard Phân Tích

**Thống Kê Thời Gian Thực**
- Thống kê theo tỉnh thành
- Xu hướng theo vùng miền
- Hiệu suất moderator
- Theo dõi tuân thủ SLA

### Phân Quyền Người Dùng

**6 Cấp Độ Phân Quyền Rõ Ràng**

| Vai Trò | Quyền Hạn | Trust Label |
|---------|-----------|-------------|
| **Guest** | Xem nội dung public | - |
| **Traveler** | Tạo itinerary, review | - |
| **Contributor** | Tạo địa điểm, submit review | Contributor |
| **Partner** | Priority queue, verified badge | Partner |
| **Moderator** | Review content, quản lý reports | Verified |
| **Admin** | Full permissions, system config | Verified |

---

## Tech Stack

### Frontend

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript 5.9.2
- **Styling**: TailwindCSS 3.4.1 + Tailwind Typography
- **UI Components**: Radix UI (Accordion, Dialog, Select, Toast, etc.)
- **Rich Text Editor**: TipTap 3.6.2
- **Charts**: Recharts 2.15.1
- **Carousel**: Embla Carousel 8.6.0
- **Icons**: Lucide React 0.475.0

### Backend

- **BaaS**: Firebase 11.10.0
  - Authentication (Email/Password, Google OAuth)
  - Firestore (NoSQL Database)
  - Storage (Image/Video hosting)
  - Realtime Database (Live updates)
  - Cloud Functions (Serverless compute)
- **Admin SDK**: Firebase Admin 13.4.0

### AI & ML

- **AI Framework**: Google Genkit 1.16.1
- **LLM**: Google AI + Vertex AI
- **Use Cases**: Trip planning, content suggestions

### DevOps & Tools

- **Package Manager**: npm
- **Linting**: ESLint + Next.js config
- **Testing**: Jest 30.0.5 + React Testing Library
- **Build**: Next.js bundler + SWC
- **Analysis**: Lighthouse, Bundle Analyzer
- **Sitemap**: next-sitemap 4.2.3

### Development Tools

- **Form Handling**: React Hook Form 7.54.2 + Zod 3.25.76
- **Date Handling**: date-fns 3.6.0
- **Drag & Drop**: @hello-pangea/dnd 18.0.1
- **Markdown**: react-markdown 9.1.0
- **Validation**: Validator 13.15.15
- **Excel Export**: xlsx 0.18.5

---

## Kiến Trúc Hệ Thống

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser/Mobile)                  │
│                                                              │
│  Next.js 15 App Router (React 18 + TypeScript)             │
│  - Server Components (SSR)                                  │
│  - Client Components (CSR)                                  │
│  - API Routes (Edge Functions)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE PLATFORM                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Authentication│  │   Firestore  │  │   Storage    │      │
│  │  - Email/PW  │  │  - places    │  │  - images    │      │
│  │  - Google    │  │  - users     │  │  - videos    │      │
│  │  - Custom    │  │  - queue     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Realtime DB  │  │   Functions  │  │  Security    │      │
│  │ - notifications│ │ - syncStats  │  │  - Rules     │      │
│  │ - presence   │  │ - cleanup    │  │  - Indexes   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICES                               │
│                                                              │
│  Google Genkit + Vertex AI                                  │
│  - Trip Planning                                             │
│  - Content Suggestions                                       │
└─────────────────────────────────────────────────────────────┘
```

### Cấu Trúc Dự Án

```
VietExplore-AI/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (routes)/          # Page routes
│   │   ├── api/               # API endpoints
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Radix UI components
│   │   ├── modals/           # Modal dialogs
│   │   ├── auth/             # Auth components
│   │   └── ...
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-place-stats.ts  # View tracking hook
│   │   └── ...
│   │
│   ├── lib/                  # Core libraries
│   │   ├── server/          # Server-side utilities
│   │   │   ├── view-tracker.ts     # View count service
│   │   │   ├── auth-middleware.ts
│   │   │   └── ...
│   │   ├── firebase/        # Firebase configs
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utilities
│   │
│   └── ai/                  # Google Genkit AI flows
│       ├── flows/
│       └── dev.ts
│
├── functions/               # Firebase Cloud Functions
│   └── src/
│       └── index.ts        # Sync, cleanup cron jobs
│
├── scripts/                # Utility scripts
│   ├── seed-places-vietnam.js
│   ├── create-admin-user.js
│   └── ...
│
├── public/                 # Static assets
├── __tests__/             # Jest tests
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
├── firebase.json          # Firebase config
└── package.json
```

---

## Hệ Thống Lượt Xem

### Tổng Quan

Du Lịch Việt sử dụng **session-based view tracking** với fingerprinting để đảm bảo tính chính xác.

### Cơ Chế Hoạt Động

#### Điều Kiện Ghi Nhận View

**Một lượt xem được tính khi:**
- User chưa xem địa điểm này trong 1 giờ qua
- Địa điểm có status = `published`
- API call thành công

**Không được tính khi:**
- User đã xem trong 1 giờ qua (duplicate)
- Refresh trang nhiều lần
- Cùng IP + User-Agent trong window 1 giờ

#### Fingerprinting Mechanism

```typescript
Fingerprint = SHA-256(IP Address + User-Agent)
```

**Ví dụ:**
```
IP: 113.161.89.123
UA: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0
    ↓
Fingerprint: a3f5b8c9d2e1f4a6b7c8d9e0f1a2b3c4
```

**Lợi ích:**
- Privacy: Không lưu IP plaintext
- Performance: Hash cố định 32 chars
- Accuracy: Kết hợp IP + UA

#### Flow Diagram

```
User Visit Place
    ↓
Extract IP + User-Agent
    ↓
Generate Fingerprint
    ↓
Check view_cache/{placeId}_{fingerprint}
    ↓
┌─────────────────┬─────────────────┐
│  Cache EXISTS   │  Cache NOT FOUND│
│  & NOT EXPIRED  │  or EXPIRED     │
└────────┬────────┴────────┬────────┘
         │                 │
         ↓                 ↓
    Return viewCount   Increment viewCount
    (NO INCREMENT)     Create cache (TTL: 1h)
                       Sync to Realtime DB
```

#### Database Structure

**Firestore Collection: `places`**
```json
{
  "id": "ha-long-bay-abc123",
  "name": "Vịnh Hạ Long",
  "viewCount": 15420,
  "lastViewedAt": "2025-01-04T10:30:00Z"
}
```

**Firestore Collection: `view_cache`**
```json
{
  "placeId": "ha-long-bay-abc123",
  "fingerprint": "a3f5b8c9d2e1...",
  "viewedAt": "2025-01-04T10:00:00Z",
  "expiresAt": "2025-01-04T11:00:00Z",
  "ip": "113.161.89.123",
  "userAgent": "Mozilla/5.0..."
}
```

#### Implementation Code

**Server-Side Service:**
```typescript
// src/lib/server/view-tracker.ts
import { trackPlaceView, getClientIP, getUserAgent } from '@/lib/server/view-tracker'

const ip = getClientIP(request.headers)
const userAgent = getUserAgent(request.headers)

const result = await trackPlaceView(placeId, { ip, userAgent })
// result: { success: true, viewCount: 1234, isUnique: true }
```

**Client-Side Hook:**
```typescript
// src/hooks/use-place-stats.ts
import { useViewTracking } from '@/hooks/use-place-stats'

function PlaceDetail({ place }) {
  const { viewCount } = useViewTracking(place.id, place.viewCount)

  return <div>{viewCount.toLocaleString('vi-VN')} lượt xem</div>
}
```

#### Timeline Example

```
10:00 AM - User A visits "Hạ Long Bay"
         → No cache → viewCount: 100 → 101
         → Cache expires at 11:00 AM

10:15 AM - User A refreshes page
         → Cache valid → viewCount: 101 (NO change)

10:30 AM - User B (different IP) visits
         → No cache → viewCount: 101 → 102

11:05 AM - User A visits again
         → Cache expired → viewCount: 102 → 103
         → New cache expires at 12:05 PM
```

#### Cache Cleanup

Auto cleanup expired cache entries:

```typescript
// Firebase Function (runs daily at 2:00 AM)
ViewTracker.cleanupExpiredViewCache()
// Deletes entries where expiresAt < now
// Batch size: 500 documents
```

### Key Features

- Atomic Increment: `FieldValue.increment()` thread-safe
- Session-Based: 1-hour window prevents spam
- Privacy-First: IP hashed, auto-deleted after 1h
- Real-time Sync: Firestore → Realtime DB (non-blocking)
- Centralized Hooks: Consistent display across all components

### Files

| File | Purpose |
|------|---------|
| `src/lib/server/view-tracker.ts` | Server-side tracking service |
| `src/hooks/use-place-stats.ts` | Client-side hooks |
| `src/app/api/places/[id]/route.ts` | API endpoint |
| `src/components/place-detail-content.tsx` | Example usage |

---

## Cài Đặt

### Yêu Cầu Hệ Thống

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Firebase CLI**: >= 13.0.0
- **Git**: Latest version

### Các Bước Cài Đặt

#### 1. Clone Repository

```bash
git clone https://github.com/your-username/VietExplore-AI.git
cd VietExplore-AI
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Thiết Lập Firebase

**3.1. Tạo Firebase Project**
- Vào [Firebase Console](https://console.firebase.google.com/)
- Tạo project mới: "Du Lịch Việt"
- Kích hoạt Firestore, Storage, Authentication, Realtime Database

**3.2. Lấy Firebase Config**
```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already)
firebase init
```

**3.3. Download Service Account Key**
- Firebase Console → Project Settings → Service Accounts
- Generate new private key → Save as `service-account-key.json`

#### 4. Biến Môi Trường

Tạo file `.env.local`:

```bash
# Firebase Web Config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# Firebase Admin SDK (Server-Side - KEEP SECRET!)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# Google AI (for Genkit)
GOOGLE_API_KEY=your_google_ai_api_key
GOOGLE_GENAI_API_KEY=your_genai_key

# App Config
NEXT_PUBLIC_BASE_URL=http://localhost:9002
NODE_ENV=development
```

**Lưu ý quan trọng:**
- Đảm bảo `FIREBASE_PRIVATE_KEY` có escape `\n` đúng format
- KHÔNG commit `.env.local` vào Git
- Add `.env.local` vào `.gitignore`

#### 5. Deploy Firebase Rules & Indexes

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage

# Deploy Realtime Database rules
firebase deploy --only database
```

#### 6. Seed Initial Data (Optional)

```bash
# Create admin user
node scripts/create-admin-user.js

# Seed places
node scripts/seed-places-vietnam.js

# Create test moderation queue
node scripts/create-real-moderation-queue.js
```

---

## Development

### Start Development Server

```bash
# Default (port 9002)
npm run dev

# Custom port
npm run dev:3000
npm run dev:8080
```

Truy cập: `http://localhost:9002`

### Available Scripts

#### Core Commands

```bash
# Development
npm run dev                 # Start dev server (port 9002)
npm run dev:smart           # Auto-select available port
npm run build               # Production build
npm run start               # Start production server

# Code Quality
npm run lint                # ESLint check
npm run lint:fix            # Auto-fix ESLint issues
npm run typecheck           # TypeScript type check
```

#### Testing

```bash
npm test                    # Run all tests
npm run test:watch          # Jest watch mode
npm run test:coverage       # Generate coverage report
npm run test:ci             # CI-optimized tests
```

#### AI Development

```bash
npm run genkit:dev          # Start Genkit dev server
npm run genkit:watch        # Genkit with auto-reload
```

#### Utilities

```bash
npm run analyze             # Bundle size analysis
npm run sitemap:tree        # Generate sitemap tree
npm run lighthouse          # Run Lighthouse audit
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   ```bash
   # Edit files
   npm run dev  # Test locally
   ```

3. **Test & Lint**
   ```bash
   npm run typecheck
   npm run lint:fix
   npm test
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push & PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

---

## API Documentation

### Authentication

All protected endpoints require JWT token in header:

```bash
Authorization: Bearer <firebase_id_token>
```

### Places API

#### `GET /api/places`
Lấy danh sách địa điểm đã published với filters

**Query Parameters:**
- `region` (optional): `bac-bo` | `trung-bo` | `nam-bo`
- `type` (optional): `bien` | `nui` | `van-hoa` | `am-thuc` | `check-in`
- `province` (optional): Province slug
- `search` (optional): Search term
- `sortBy` (optional): `newest` | `oldest` | `rating` | `popular`
- `limit` (optional): Number (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ha-long-bay-abc123",
      "name": "Vịnh Hạ Long",
      "viewCount": 15420,
      "status": "published"
    }
  ],
  "total": 100
}
```

#### `GET /api/places/[id]`
Lấy chi tiết địa điểm + tăng view count

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ha-long-bay-abc123",
    "viewCount": 15421
  }
}
```

#### `POST /api/places`
Tạo địa điểm mới (Contributor+ only)

#### `PATCH /api/places/[id]`
Cập nhật địa điểm (Owner/Moderator/Admin only)

#### `DELETE /api/places/[id]`
Soft delete địa điểm (Owner/Moderator/Admin only)

---

## Database Schema

### Firestore Collections

- `users` - User accounts & profiles
- `places` - Travel destinations
- `moderation_queue` - Content review queue
- `view_cache` - View tracking cache (TTL: 1h)
- `notifications` - User notifications
- `place_reviews` - User reviews for places
- `review_reports` - Reports against reviews
- `place_reports` - Reports against places

---

## Testing

```bash
# Unit tests
npm test

# Integration tests
node src/scripts/test-moderation-workflow.js

# Coverage
npm run test:coverage
```

---

## Deployment

### Vercel

```bash
vercel --prod
```

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

---

## Contributing

Chúng tôi chào đón đóng góp từ cộng đồng! Dù bạn sửa lỗi, thêm tính năng, hoặc cải thiện tài liệu, sự giúp đỡ của bạn đều được trân trọng.

### Bắt Đầu Nhanh

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'feat: add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Hướng Dẫn

- Tuân theo quy ước [Conventional Commits](https://www.conventionalcommits.org/)
- Viết commit messages rõ ràng, ngắn gọn
- Thêm tests cho tính năng mới
- Cập nhật tài liệu khi cần
- Đảm bảo tất cả tests pass trước khi submit PR

**Vui lòng đọc [Hướng Dẫn Đóng Góp](./CONTRIBUTING.md) để biết thông tin chi tiết.**

---

## License

Dự án này được cấp phép theo **MIT License** - xem file [LICENSE](./LICENSE) để biết chi tiết.

```
MIT License

Copyright (c) 2025 Nguyễn Mạnh Quý

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

### Điều Này Có Nghĩa Là Gì

**Bạn có thể:**
- Sử dụng phần mềm này cho mục đích thương mại
- Chỉnh sửa và phân phối mã nguồn
- Sử dụng phần mềm này riêng tư
- Cấp phép lại phần mềm này

**Bạn không thể:**
- Yêu cầu tác giả chịu trách nhiệm về thiệt hại
- Sử dụng tên tác giả để endorsement mà không có phép

**Bạn phải:**
- Bao gồm thông báo bản quyền và license trong tất cả bản sao
- Ghi rõ các thay đổi quan trọng được thực hiện với phần mềm

---

## Liên Hệ

- **Tác giả**: Nguyễn Mạnh Quý
- **Website**: [dulichviet.tech](https://www.dulichviet.tech)
- **Email**: manhquydev@gmail.com

---

## Tác Giả

**Nguyễn Mạnh Quý**
- Website: [dulichviet.tech](https://www.dulichviet.tech)
- Email: manhquydev@gmail.com
- Dự án: Du Lịch Việt

---

**Được phát triển với tâm huyết cho cộng đồng du lịch Việt Nam**

**© 2025 Nguyễn Mạnh Quý. All rights reserved.**

[⭐ Star trên GitHub](https://github.com/manhquydev/VietExplore-AI) · [Báo Lỗi](https://github.com/manhquydev/VietExplore-AI/issues) · [Đề Xuất Tính Năng](https://github.com/manhquydev/VietExplore-AI/issues)

# 🇻🇳 VietExplore - Nền Tảng Du Lịch Việt Nam

<div align="center">

![Version](https://img.shields.io/badge/version-2.1.5-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange?logo=firebase)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Nền tảng chia sẻ và khám phá địa điểm du lịch Việt Nam với AI Trip Planner**

[🌐 Live Demo](https://www.dulichviet.tech) · [🐛 Report Bug](https://github.com/your-repo/issues)

</div>

---

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Tính Năng Chính](#-tính-năng-chính)
- [Tech Stack](#-tech-stack)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Hệ Thống Lượt Xem](#-hệ-thống-lượt-xem)
- [Cài Đặt](#-cài-đặt)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Tổng Quan

**VietExplore** là nền tảng du lịch cộng đồng cho phép người dùng:

- 🗺️ **Khám phá** hàng nghìn địa điểm du lịch khắp Việt Nam
- ✍️ **Đóng góp** thông tin địa điểm mới với hệ thống kiểm duyệt chuyên nghiệp
- 🤖 **Lên kế hoạch** hành trình du lịch với AI Trip Planner
- 📊 **Theo dõi** thống kê và xu hướng du lịch
- 🏆 **Xây dựng** uy tín qua hệ thống Role-Based Access Control

### 🌟 Điểm Nổi Bật

- **Production-Ready**: Đã deploy và đang hoạt động tại [dulichviet.tech](https://www.dulichviet.tech)
- **Enterprise-Grade**: Hệ thống moderation workflow chuẩn enterprise
- **AI-Powered**: Tích hợp Google Genkit cho trip planning thông minh
- **Mobile-First**: Responsive design hoàn hảo trên mọi thiết bị
- **SEO Optimized**: SSR với Next.js 15 App Router, compound URLs

---

## ✨ Tính Năng Chính

### 🏛️ Core Features

#### 1. **Place Management System**
- Tạo, chỉnh sửa, quản lý địa điểm du lịch
- Upload hình ảnh với auto-resize (1200x800px, 80% quality)
- Cấu trúc địa chỉ hành chính Việt Nam (Tỉnh/Huyện/Xã)
- Hỗ trợ 5 loại địa điểm: Biển, Núi, Văn hóa, Ẩm thực, Check-in
- Phân vùng miền: Bắc Bộ, Trung Bộ, Nam Bộ

#### 2. **Content Moderation Workflow**
State machine với 4 bước kiểm duyệt:
```
pending → claimed → in_review → approved/rejected/needs_revision
```
- Auto-archive sau 30 ngày
- Rollback capability trong 30 ngày
- Priority queue (Partner > Contributor > Traveler)
- Claim timeout 2 giờ

#### 3. **AI Trip Planner**
- Powered by Google Genkit + Vertex AI
- Tự động gợi ý lịch trình dựa trên:
  - Thời gian du lịch
  - Sở thích cá nhân
  - Ngân sách
  - Số người tham gia
- Export itinerary sang PDF/Excel

#### 4. **Real-time Notifications**
- Firebase Realtime Database integration
- 8+ loại thông báo:
  - Place submission received
  - Place claimed for review
  - Place in review
  - Place approved/rejected
  - Revision requested
  - User role changed
  - Reports resolved
- Push notifications (Desktop + Mobile)

#### 5. **Analytics Dashboard**
- Real-time statistics
- Provincial analytics
- Regional trends
- Moderator performance metrics
- SLA compliance tracking

### 👥 User Roles & Permissions

6 levels phân quyền rõ ràng:

| Role | Quyền Hạn | Trust Label |
|------|-----------|-------------|
| 🔸 **Guest** | Xem nội dung public | - |
| 🟢 **Traveler** | Tạo itinerary, review | - |
| 🔵 **Contributor** | Tạo địa điểm, submit review | Contributor |
| 🟣 **Partner** | Priority queue, verified badge | Partner |
| 🟠 **Moderator** | Review content, manage reports | Verified |
| 🔴 **Admin** | Full permissions, system config | Verified |

---

## 🛠️ Tech Stack

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

## 🏗️ Kiến Trúc Hệ Thống

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

### Project Structure

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
│   │   ├── use-place-stats.ts  # ⭐ View tracking hook
│   │   └── ...
│   │
│   ├── lib/                  # Core libraries
│   │   ├── server/          # Server-side utilities
│   │   │   ├── view-tracker.ts     # ⭐ View count service
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

## 🔢 Hệ Thống Lượt Xem

### Overview

VietExplore sử dụng **session-based view tracking** với fingerprinting để đảm bảo tính chính xác.

### Cơ Chế Hoạt Động

#### 1. **Điều Kiện Ghi Nhận View**

✅ **1 lượt xem được count khi:**
- User **chưa** xem địa điểm này trong **1 giờ qua**
- Địa điểm có status = `published`
- API call thành công

❌ **KHÔNG được count khi:**
- User **đã** xem trong 1 giờ qua (duplicate)
- Refresh trang nhiều lần
- Cùng IP + User-Agent trong window 1 giờ

#### 2. **Fingerprinting Mechanism**

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
- 🔒 **Privacy**: Không lưu IP plaintext
- ⚡ **Performance**: Hash cố định 32 chars
- 🎯 **Accuracy**: Kết hợp IP + UA

#### 3. **Flow Diagram**

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

#### 4. **Database Structure**

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

#### 5. **Implementation Code**

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

#### 6. **Timeline Example**

```
10:00 AM - User A visits "Hạ Long Bay"
         ✅ No cache → viewCount: 100 → 101
         📝 Cache expires at 11:00 AM

10:15 AM - User A refreshes page
         ❌ Cache valid → viewCount: 101 (NO change)

10:30 AM - User B (different IP) visits
         ✅ No cache → viewCount: 101 → 102

11:05 AM - User A visits again
         ✅ Cache expired → viewCount: 102 → 103
         📝 New cache expires at 12:05 PM
```

#### 7. **Cache Cleanup**

Auto cleanup expired cache entries:

```typescript
// Firebase Function (runs daily at 2:00 AM)
ViewTracker.cleanupExpiredViewCache()
// Deletes entries where expiresAt < now
// Batch size: 500 documents
```

### Key Features

- ✅ **Atomic Increment**: `FieldValue.increment()` thread-safe
- ✅ **Session-Based**: 1-hour window prevents spam
- ✅ **Privacy-First**: IP hashed, auto-deleted after 1h
- ✅ **Real-time Sync**: Firestore → Realtime DB (non-blocking)
- ✅ **Centralized Hooks**: Consistent display across all components

### Files

| File | Purpose |
|------|---------|
| `src/lib/server/view-tracker.ts` | Server-side tracking service |
| `src/hooks/use-place-stats.ts` | Client-side hooks |
| `src/app/api/places/[id]/route.ts` | API endpoint |
| `src/components/place-detail-content.tsx` | Example usage |

---

## 🚀 Cài Đặt

### Prerequisites

Yêu cầu hệ thống:

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Firebase CLI**: >= 13.0.0
- **Git**: Latest version

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/your-username/VietExplore-AI.git
cd VietExplore-AI
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Firebase Setup

**3.1. Create Firebase Project**
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create new project: "VietExplore"
- Enable Firestore, Storage, Authentication, Realtime Database

**3.2. Get Firebase Config**
```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already)
firebase init
```

**3.3. Download Service Account Key**
- Firebase Console → Project Settings → Service Accounts
- Generate new private key → Save as `service-account-key.json`

#### 4. Environment Variables

Create `.env.local` file:

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

**Important**:
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

## 💻 Development

### Start Development Server

```bash
# Default (port 9002)
npm run dev

# Custom port
npm run dev:3000
npm run dev:8080
```

Access: `http://localhost:9002`

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

## 📡 API Documentation

### Authentication

All protected endpoints require JWT token in header:

```bash
Authorization: Bearer <firebase_id_token>
```

### Places API

#### `GET /api/places`
Get published places with filters

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
Get single place + increment view count

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
Create new place (Contributor+ only)

#### `PATCH /api/places/[id]`
Update place (Owner/Moderator/Admin only)

#### `DELETE /api/places/[id]`
Soft delete place (Owner/Moderator/Admin only)

### Full API docs: See [CLAUDE.md](./CLAUDE.md)

---

## 🗄️ Database Schema

### Firestore Collections

- `users` - User accounts & profiles
- `places` - Travel destinations
- `moderation_queue` - Content review queue
- `view_cache` - View tracking cache (TTL: 1h)
- `notifications` - User notifications

### Full schema: See [Database Schema section](#database-schema)

---

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
node src/scripts/test-moderation-workflow.js

# Coverage
npm run test:coverage
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

Full deployment guide: See [Deployment section](#deployment)

---

## 🤝 Contributing

We welcome contributions! Please see [Contributing Guidelines](#contributing).

---

## 📄 License

MIT License - See [LICENSE](#license)

---

## 📞 Contact

- **Website**: [dulichviet.tech](https://www.dulichviet.tech)
- **Email**: support@dulichviet.tech
- **Documentation**: [CLAUDE.md](./CLAUDE.md)

---

<div align="center">

**Made with ❤️ for Vietnam Tourism Community**

[⭐ Star on GitHub](https://github.com/your-repo) · [🐛 Report Bug](https://github.com/your-repo/issues) · [💡 Request Feature](https://github.com/your-repo/issues)

</div>

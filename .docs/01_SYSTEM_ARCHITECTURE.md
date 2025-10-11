# Kiến Trúc Hệ Thống (System Architecture)

## Tổng Quan

**Du Lịch Việt - AI** là nền tảng web progressive được xây dựng với kiến trúc modern fullstack, tận dụng Next.js 15, Firebase, và AI integration để tạo trải nghiệm người dùng tối ưu.

---

## 1. Tech Stack

### 1.1. Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15.3.3 | React framework với App Router |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.9.2 | Type-safe development |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Radix UI** | Latest | Headless UI components |
| **Lucide React** | Latest | Icon system |
| **React Hook Form** | Latest | Form management |
| **Zod** | Latest | Schema validation |

### 1.2. Backend & Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** | RESTful API endpoints |
| **Firebase Authentication** | User authentication (email/password, OAuth) |
| **Cloud Firestore** | NoSQL database (real-time, offline support) |
| **Firebase Realtime Database** | Real-time notifications |
| **Firebase Storage** | File storage (images, videos) |
| **Firebase Admin SDK** | Server-side Firebase operations |

### 1.3. AI & Machine Learning

| Technology | Purpose |
|-----------|---------|
| **Google Genkit** | AI framework for building AI-powered features |
| **Gemini 2.0 Flash** | LLM model for chatbot & AI features |
| **Vertex AI** | Google Cloud AI platform |

### 1.4. Developer Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Jest** | Unit testing |
| **Firebase CLI** | Deployment & management |
| **Git** | Version control |

### 1.5. Progressive Web App

| Technology | Purpose |
|-----------|---------|
| **Serwist** | Service Worker framework |
| **next-pwa** | PWA configuration for Next.js |
| **Web App Manifest** | PWA metadata |

---

## 2. Architecture Layers

```
┌──────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Pages (SSR)  │  │  Components  │  │    Hooks     │       │
│  │ /app/**      │  │ /components  │  │   /hooks     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────────────┐
│                       API LAYER (BFF)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ API Routes   │  │  Middleware  │  │   Services   │       │
│  │ /app/api/**  │  │  Auth, CORS  │  │    /lib      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────────────┐
│                      DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Firestore   │  │  Realtime DB │  │   Storage    │       │
│  │  (Documents) │  │ (Notifications)│ │   (Files)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Gemini AI   │  │ Google Maps  │  │ Firebase Auth│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

### 3.1. Cấu Trúc Tổng Quan

```
viet-explore-ai/
├── .docs/                      # 📚 Technical Documentation (this folder)
│   ├── 00_INDEX.md             # Navigation & overview
│   ├── 01_SYSTEM_ARCHITECTURE.md
│   ├── 02_RBAC_PERMISSIONS.md
│   ├── 03_DATABASE_SCHEMA.md
│   └── 04_WORKFLOWS.md
│
├── .claude/                    # 🤖 Claude Code AI documentation
│   └── docs/                   # Project-specific guides for Claude
│
├── src/                        # 💻 Source code
│   ├── app/                    # Next.js 15 App Router
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & libraries
│   └── ai/                     # AI integration (Genkit flows)
│
├── public/                     # 🌐 Static assets
│   ├── images/                 # Image assets
│   ├── icons/                  # PWA icons
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service Worker (auto-generated)
│
├── scripts/                    # 🛠️ Development scripts
│   ├── seed-places-vietnam.js
│   └── generate-pwa-icons.js
│
├── firebase/                   # 🔥 Firebase configuration
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   └── storage.rules
│
└── config files               # ⚙️ Configuration
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

### 3.2. Chi Tiết src/app/ (App Router)

```
src/app/
├── layout.tsx                  # Root layout (global providers)
├── page.tsx                    # Homepage
│
├── places/                     # 🏞️ Places module
│   ├── page.tsx                # Places listing
│   ├── [...slug]/page.tsx      # Place detail (dynamic route)
│   ├── saved/page.tsx          # User's saved places
│   ├── map/page.tsx            # Map view
│   └── regions/[region]/page.tsx # Regional listings
│
├── contribute/                 # ✍️ Content contribution
│   ├── new-place/page.tsx      # Create new place
│   ├── edit/[id]/page.tsx      # Edit draft
│   └── my-drafts/page.tsx      # User's drafts dashboard
│
├── admin/                      # 🛡️ Admin panel
│   ├── layout.tsx              # Admin-specific layout
│   ├── moderation/
│   │   ├── queue/page.tsx      # Moderation queue
│   │   └── reports/page.tsx    # Reports management
│   ├── users/page.tsx          # User management
│   ├── analytics/page.tsx      # Analytics dashboard
│   └── settings/page.tsx       # System settings
│
├── auth/                       # 🔐 Authentication
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
│
├── profile/                    # 👤 User profiles
│   ├── me/page.tsx             # Current user profile
│   └── [username]/page.tsx     # Public profile
│
├── notifications/page.tsx      # 🔔 Notifications center
│
├── community/                  # 👥 Community features
│   └── announcements/page.tsx
│
├── api/                        # 🔌 API Routes
│   ├── places/
│   │   ├── route.ts            # GET /api/places
│   │   ├── [id]/
│   │   │   ├── route.ts        # GET/PATCH /api/places/[id]
│   │   │   ├── view/route.ts   # POST /api/places/[id]/view
│   │   │   ├── like/route.ts   # POST /api/places/[id]/like
│   │   │   └── reviews/route.ts # GET/POST /api/places/[id]/reviews
│   │   └── my-drafts/route.ts
│   │
│   ├── moderation/
│   │   └── queue/
│   │       └── [itemId]/route.ts # PATCH /api/moderation/queue/[itemId]
│   │
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── verify-email/route.ts
│   │
│   ├── notifications/route.ts
│   │
│   ├── cron/                   # Scheduled tasks
│   │   ├── cleanup-expired-claims/route.ts
│   │   └── restore-suspensions/route.ts
│   │
│   └── ai/
│       └── place-chat/route.ts # AI chatbot endpoint
│
├── offline/page.tsx            # PWA offline fallback page
│
└── (legal)/                    # Legal pages (group route)
    ├── terms/page.tsx
    ├── privacy/page.tsx
    └── content-policy/page.tsx
```

### 3.3. Chi Tiết src/components/

```
src/components/
├── ui/                         # 🎨 Base UI components (Radix UI + Tailwind)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── toast.tsx
│   └── ... (50+ components)
│
├── header.tsx                  # Global header with navigation
├── footer.tsx                  # Global footer
│
├── auth/                       # Authentication components
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── protected-route.tsx
│
├── admin/                      # Admin-specific components
│   ├── moderation-queue-table.tsx
│   ├── user-table.tsx
│   └── analytics-charts.tsx
│
├── modals/                     # Modal dialogs
│   ├── review-modal.tsx
│   ├── report-modal.tsx
│   └── confirm-dialog.tsx
│
├── notifications/              # Notification system
│   ├── notification-bell.tsx   # Header bell icon
│   └── notification-item.tsx
│
├── pwa/                        # PWA-specific
│   ├── service-worker-registration.tsx
│   └── install-prompt.tsx
│
└── providers/                  # React context providers
    ├── auth-provider.tsx
    ├── theme-provider.tsx
    └── toast-provider.tsx
```

### 3.4. Chi Tiết src/lib/

```
src/lib/
├── types/                      # TypeScript types & interfaces
│   ├── auth.ts                 # User, UserRole, Permission
│   ├── places.ts               # Place, PlaceStatus, PlaceType
│   ├── reviews.ts              # PlaceReview, ReviewStats
│   └── notifications.ts        # Notification types
│
├── auth/                       # Authentication logic
│   ├── permissions.ts          # hasPermission(), rolePermissions
│   └── email-verification.ts
│
├── server/                     # Server-side only utilities
│   ├── auth-middleware.ts      # verifyAuthToken()
│   ├── enhanced-notification-service.ts # Centralized notifications
│   └── view-tracker.ts         # View count tracking
│
├── client/                     # Client-side utilities
│   ├── api.ts                  # callApi() helper
│   └── firebase-storage.ts     # File upload utilities
│
├── firebase/
│   ├── firebase.ts             # Client Firebase config
│   └── firebase-admin.ts       # Server Firebase Admin config
│
├── design-system/              # Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
│
├── firestore-schema.ts         # Firestore collections schema
├── utils.ts                    # General utilities (cn, formatDate, etc.)
└── constants.ts                # App-wide constants
```

### 3.5. Chi Tiết src/hooks/

```
src/hooks/
├── use-auth.ts                 # Authentication state
├── use-places.ts               # Places data fetching
├── use-user-drafts.ts          # User's drafts CRUD
├── use-moderation-queue.ts     # Moderation workflow
├── use-place-reviews.ts        # Reviews for a place
├── use-place-stats.ts          # View count, likes, saves
├── use-view-tracking.ts        # Auto-increment view count
├── use-realtime-notifications.ts # Real-time notification listener
└── use-place-chat.ts           # AI chatbot session
```

### 3.6. Chi Tiết src/ai/

```
src/ai/
├── flows/                      # Genkit AI flows
│   ├── place-chat-flow.ts      # Place-specific chatbot
│   └── chat-flow.ts            # General chatbot
│
└── prompts/                    # AI prompts (future)
    └── place-chat-system.txt
```

---

## 4. Data Flow Architecture

### 4.1. Server-Side Rendering (SSR) Flow

```
User navigates to /places/vinh-ha-long
  ↓
1. Next.js Server (src/app/places/[...slug]/page.tsx)
   - Extract slug from params
   - Query Firestore: places WHERE slug == 'vinh-ha-long'
   - Fetch place data + initial stats
  ↓
2. Render React Component (Server Component)
   - Generate HTML with place data
   - Include metadata for SEO (title, description, OG tags)
  ↓
3. Send HTML to browser
   - Fast initial load (no loading spinner)
   - SEO-friendly (search engines see content)
  ↓
4. Client-side Hydration
   - React takes over DOM
   - Hooks attach (useViewTracking, usePlaceStats)
   - Real-time listeners connect
  ↓
5. Client-side Data Updates
   - useViewTracking → POST /api/places/[id]/view
   - usePlaceStats → Firestore realtime listener
   - UI updates with latest data
```

### 4.2. API Request Flow

```
Client calls: callApi('/places/123/like', { method: 'POST' })
  ↓
1. callApi() helper (src/lib/client/api.ts)
   - Get Firebase ID token (if authenticated)
   - Add Authorization header: Bearer {token}
   - Add Content-Type: application/json
   - Fetch from API route
  ↓
2. API Route (src/app/api/places/[id]/like/route.ts)
   - Extract token from Authorization header
   - verifyAuthToken() → decode token, get user
   - Check permissions: hasPermission(user, 'like_places')
   - Execute business logic:
     * Check existing like
     * Increment/decrement likeCount
     * Create/delete like record
   - Return JSON response
  ↓
3. Client receives response
   - callApi() parses JSON
   - Update UI (optimistic update + confirmation)
   - Show toast notification if needed
```

### 4.3. Real-time Notification Flow

```
Event occurs: Place approved
  ↓
1. API/Cloud Function calls:
   EnhancedNotificationService.notifyPlaceApproved(...)
  ↓
2. Service writes to Firebase Realtime Database:
   /notifications/{userId}/{notificationId}
  ↓
3. Client listener (useRealtimeNotifications hook)
   - onValue() callback triggered
   - New notification detected
  ↓
4. UI Updates:
   - Increment bell badge count
   - Show toast notification
   - Add to notification dropdown
  ↓
5. User clicks notification:
   - Mark as read (update database)
   - Navigate to actionUrl
```

---

## 5. Deployment Architecture

### 5.1. Production Environment

```
┌───────────────────────────────────────────────────────────┐
│                       VERCEL EDGE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Next.js App │  │  API Routes  │  │  Static CDN  │    │
│  │   (SSR/SSG)  │  │  (Serverless)│  │   (Assets)   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘    │
└─────────┼──────────────────┼────────────────────────────  ┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────  ┐
│               GOOGLE CLOUD FIREBASE                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Firestore   │  │  Realtime DB │  │   Storage    │    │
│  │ (asia-se1)   │  │ (asia-se1)   │  │ (asia-se1)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │    Auth      │  │  Vertex AI   │                       │
│  └──────────────┘  └──────────────┘                       │
└────────────────────────────────────────────────────────  ─┘
```

### 5.2. Development Workflow

```
Developer machine
  ├── npm run dev → localhost:9002 (Next.js dev server)
  ├── npm run genkit:dev → localhost:4000 (Genkit dev UI)
  └── Firebase Emulators (optional)
      ├── Firestore: localhost:8080
      ├── Auth: localhost:9099
      └── Storage: localhost:9199

Git workflow:
  main branch → Production (Vercel auto-deploy)
  develop2 branch → Staging (Vercel preview)
  feature/* → PR → Review → Merge to develop2
```

### 5.3. CI/CD Pipeline

```
Git push to branch
  ↓
GitHub Actions (future - not yet implemented)
  ├── Run ESLint
  ├── Run TypeScript check
  ├── Run Jest tests
  └── Build Next.js app
  ↓
Vercel Deployment
  ├── Build succeeds → Deploy preview URL
  ├── PR merged to main → Deploy to production
  └── Auto-rollback on failure
```

---

## 6. Security Architecture

### 6.1. Authentication Flow

```
User submits login form
  ↓
1. Frontend: Firebase Auth signInWithEmailAndPassword()
  ↓
2. Firebase Auth validates credentials
  ↓
3. Returns ID token (JWT)
  ↓
4. Frontend stores token in memory (not localStorage)
  ↓
5. Every API request:
   - callApi() gets fresh token: await user.getIdToken()
   - Add header: Authorization: Bearer {token}
  ↓
6. Backend: verifyAuthToken()
   - Decode JWT using Firebase Admin SDK
   - Extract uid, email, email_verified
   - Query users collection for role
   - Return user object with permissions
```

### 6.2. Authorization Layers

**Layer 1: Firestore Security Rules** (First line of defense)
```javascript
// firestore.rules
allow read: if resource.data.status == 'published';
allow create: if emailVerified() && hasRole('contributor');
```

**Layer 2: API Middleware** (Server-side validation)
```typescript
// API route
const user = await verifyAuthToken(request);
requirePermission(user, 'create_place');
```

**Layer 3: UI Conditional Rendering** (UX convenience)
```typescript
{hasPermission(user, 'create_place') && (
  <Button>Đóng góp địa điểm</Button>
)}
```

### 6.3. Data Privacy

- **User data encryption:** Firebase Auth + Firestore encryption at rest
- **HTTPS only:** All traffic encrypted in transit
- **API keys:** Stored in environment variables (.env.local)
- **Sensitive data:** IP addresses hashed before storage
- **Anonymous reviews:** User identity hidden when isAnonymous === true
- **GDPR compliance:** User data export/delete functionality (future)

---

## 7. Performance Optimization

### 7.1. Frontend Optimizations

| Technique | Implementation |
|-----------|---------------|
| **Code Splitting** | Next.js automatic route-based splitting |
| **Image Optimization** | `next/image` with auto-sizing, lazy load |
| **Font Optimization** | `next/font` with font subsetting |
| **Static Generation** | SSG for static pages (homepage, legal) |
| **Server Components** | Default in App Router (reduce JS bundle) |
| **Lazy Loading** | Dynamic imports for heavy components |

### 7.2. Backend Optimizations

| Technique | Implementation |
|-----------|---------------|
| **Database Indexing** | 50+ composite indexes in Firestore |
| **Caching** | View cache (1h TTL), API response cache |
| **Pagination** | Limit queries to 20 items/page |
| **Denormalization** | Embed user data in reviews (avoid joins) |
| **Atomic Operations** | FieldValue.increment() for counters |

### 7.3. PWA Performance

| Feature | Benefit |
|---------|---------|
| **Service Worker** | Cache static assets (CSS, JS, images) |
| **Offline Support** | View cached pages when offline |
| **Install Prompt** | Add to home screen → app-like experience |
| **Cache-First Strategy** | Load assets instantly (2-3x faster) |

**Lighthouse Scores (Target):**
- Performance: ≥ 85
- PWA: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

---

## 8. Monitoring & Logging

### 8.1. Application Logs

```typescript
// Console logs với prefix
console.log('[NOTIFICATION] Sending notification:', data);
console.log('[PLACE-CHAT] AI response:', response);
console.error('[ERROR] API failed:', error);
```

### 8.2. Firebase Analytics (Future)

- Page views
- User engagement
- Conversion tracking
- Custom events (place viewed, draft submitted, etc.)

### 8.3. Admin Audit Logs

**Collection:** `admin_logs`

```typescript
{
  adminId: "user_xyz",
  adminName: "Nguyễn Văn A",
  action: "approve_place",
  targetType: "place",
  targetId: "place_123",
  details: {...},
  timestamp: "2025-01-09T10:30:00Z",
  ipAddress: "hashed_ip"
}
```

**Retention:** 1 year

---

## 9. Tóm Tắt

| Aspect | Technology |
|--------|-----------|
| **Frontend Framework** | Next.js 15 (App Router) + React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS + Radix UI |
| **Backend** | Next.js API Routes (serverless) |
| **Database** | Cloud Firestore (NoSQL) |
| **Authentication** | Firebase Auth |
| **File Storage** | Firebase Storage |
| **Real-time** | Firebase Realtime Database |
| **AI** | Google Genkit + Gemini 2.0 Flash |
| **Deployment** | Vercel (Edge Functions) |
| **PWA** | Serwist + Service Worker |
| **Monitoring** | Console logs + Firebase Analytics (future) |

---

**Phiên bản:** 1.0
**Ngày cập nhật:** 2025-01-09
**Tác giả:** Technical Documentation Team

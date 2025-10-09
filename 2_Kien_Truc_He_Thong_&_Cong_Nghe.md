# Kiến Trúc Hệ Thống & Công Nghệ - Du Lịch Việt

> **Phiên bản:** 3.0.0
> **Ngày cập nhật:** Tháng 10, 2025
> **Tech Stack Version:** Next.js 15.3.3 + Firebase 11.10.0

---

## Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Tech Stack Chi Tiết](#2-tech-stack-chi-tiết)
3. [Kiến Trúc Frontend](#3-kiến-trúc-frontend)
4. [Kiến Trúc Backend](#4-kiến-trúc-backend)
5. [Kiến Trúc Database](#5-kiến-trúc-database)
6. [Luồng Dữ Liệu](#6-luồng-dữ-liệu)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [AI Architecture](#8-ai-architecture)
9. [PWA Implementation](#9-pwa-implementation)
10. [Performance Optimization](#10-performance-optimization)
11. [Security Architecture](#11-security-architecture)

---

## 1. Tổng Quan Kiến Trúc

### 1.1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Web Browser   │  │  Mobile PWA    │  │  Desktop PWA     │  │
│  │  (React 18)    │  │  (Serwist)     │  │  (Installable)   │  │
│  └────────┬───────┘  └────────┬───────┘  └────────┬─────────┘  │
│           │                   │                    │             │
│           └───────────────────┴────────────────────┘             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTPS
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                   APPLICATION LAYER (Next.js 15)                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                Server Components (SSR)                    │   │
│  │  • SEO-optimized page rendering                          │   │
│  │  • Data fetching from Firestore                          │   │
│  │  • Static Generation where possible                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                Client Components (CSR)                    │   │
│  │  • Interactive UI (forms, modals, real-time updates)     │   │
│  │  • Client-side routing                                    │   │
│  │  • State management                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                API Routes (Edge Functions)                │   │
│  │  • /api/places      • /api/moderation                    │   │
│  │  • /api/auth        • /api/admin                         │   │
│  │  • /api/ai          • /api/cron                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
┌───────▼────────────────┐                  ┌──────────▼──────────┐
│  FIREBASE PLATFORM     │                  │   GOOGLE GENKIT AI  │
│                        │                  │                     │
│  ┌──────────────────┐  │                  │  ┌───────────────┐ │
│  │ Authentication   │  │                  │  │ Vertex AI     │ │
│  │ • Email/Password │  │                  │  │ • Gemini 2.0  │ │
│  │ • Google OAuth   │  │                  │  │ • Trip Plan   │ │
│  │ • Custom Claims  │  │                  │  │ • Place Chat  │ │
│  └──────────────────┘  │                  │  └───────────────┘ │
│                        │                  └─────────────────────┘
│  ┌──────────────────┐  │
│  │ Firestore DB     │  │
│  │ • places         │  │
│  │ • users          │  │
│  │ • moderation_*   │  │
│  │ • reviews        │  │
│  └──────────────────┘  │
│                        │
│  ┌──────────────────┐  │
│  │ Storage          │  │
│  │ • images/        │  │
│  │ • avatars/       │  │
│  └──────────────────┘  │
│                        │
│  ┌──────────────────┐  │
│  │ Realtime DB      │  │
│  │ • notifications  │  │
│  │ • presence       │  │
│  └──────────────────┘  │
│                        │
│  ┌──────────────────┐  │
│  │ Cloud Functions  │  │
│  │ • Cron jobs      │  │
│  │ • Triggers       │  │
│  └──────────────────┘  │
└────────────────────────┘
```

### 1.2. Architecture Principles

#### 1. **Serverless-First**
- Không có server riêng để quản lý
- Firebase BaaS cho toàn bộ backend
- Next.js API Routes cho business logic
- Cloud Functions cho scheduled tasks

**Benefits:**
- ✅ Zero operations overhead
- ✅ Auto-scaling out of the box
- ✅ Pay-per-use pricing
- ✅ Focus on features, not infrastructure

#### 2. **API-First Design**
- Mọi feature đều expose qua RESTful API
- Consistent API response format
- Authentication middleware cho protected routes
- Client SDKs (hooks) wrap API calls

**Example:**
```typescript
// API Route
// src/app/api/places/route.ts
export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    data: [...],
    total: 100
  });
}

// Client Hook
// src/hooks/use-places.ts
export function usePlaces(filters) {
  const { data } = useSWR('/api/places', fetcher);
  return { places: data?.data || [] };
}
```

#### 3. **Component-Based Architecture**
- Atomic design pattern (Atoms → Molecules → Organisms)
- Radix UI components cho accessibility
- Custom components trong `src/components/ui/`
- Reusable hooks trong `src/hooks/`

#### 4. **Type-Safe Development**
- TypeScript 5.9.2 strict mode
- Zod schemas cho runtime validation
- Shared types trong `src/lib/types/`
- Type inference từ Firebase schemas

#### 5. **Mobile-First Responsive**
- TailwindCSS với breakpoints
- PWA support cho offline access
- Touch-optimized UI
- 70%+ traffic từ mobile

---

## 2. Tech Stack Chi Tiết

### 2.1. Frontend Stack

#### Core Framework

**Next.js 15.3.3**
- **App Router** (không phải Pages Router)
- Server Components for SSR
- Client Components for interactivity
- File-based routing
- Built-in API routes

**Lý do chọn Next.js:**
- ✅ SEO-friendly SSR out of the box
- ✅ React Server Components
- ✅ Edge runtime support
- ✅ Image optimization tự động
- ✅ Best-in-class DX

**React 18.3.1**
- Concurrent features
- Suspense cho data fetching
- Automatic batching
- Transitions API

**TypeScript 5.9.2**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### Styling & UI

**TailwindCSS 3.4.1**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#16A34A', // Green
        secondary: '#0EA5E9', // Blue
        accent: '#F59E0B', // Orange
      }
    }
  }
}
```

**Radix UI Components**
- `@radix-ui/react-dialog` - Modals
- `@radix-ui/react-dropdown-menu` - Dropdowns
- `@radix-ui/react-select` - Selects
- `@radix-ui/react-toast` - Notifications
- `@radix-ui/react-accordion` - Accordions
- + 15 more components

**Lý do chọn Radix UI:**
- ✅ Unstyled primitives = full control
- ✅ Accessibility built-in (ARIA)
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Tree-shakable

**Lucide React** (Icon Library)
- 1000+ icons
- Tree-shakable
- Consistent design
- TypeScript support

#### Forms & Validation

**React Hook Form 7.54.2**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});
```

**Zod 3.25.76**
```typescript
import { z } from 'zod';

const PlaceSchema = z.object({
  name: z.string().min(3).max(100),
  province: z.string(),
  type: z.enum(['bien', 'nui', 'van-hoa', 'am-thuc', 'check-in'])
});
```

**Why this combo:**
- ✅ Type-safe forms
- ✅ Runtime validation
- ✅ Great DX với autocomplete
- ✅ Minimal re-renders

#### Rich Text Editor

**TipTap 3.6.2**
- Headless editor built on ProseMirror
- Extensions: Bold, Italic, Lists, Links, Images
- Character count
- Placeholder support

```typescript
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit, Image, Link],
  content: '<p>Hello world</p>'
});
```

#### Data Visualization

**Recharts 2.15.1**
- Line charts
- Bar charts
- Pie charts
- Area charts

Used in: Admin Dashboard, Analytics

#### Other Frontend Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `embla-carousel-react` | 8.6.0 | Image carousels |
| `react-markdown` | 9.1.0 | Markdown rendering |
| `react-day-picker` | 8.10.1 | Date picker |
| `date-fns` | 3.6.0 | Date formatting |
| `@hello-pangea/dnd` | 18.0.1 | Drag & drop |

### 2.2. Backend Stack

#### Firebase Platform (v11.10.0)

**Firebase Authentication**
```typescript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth(app);
await signInWithEmailAndPassword(auth, email, password);
```

**Features:**
- Email/Password authentication
- Google OAuth
- Custom claims for roles
- Email verification
- Password reset

**Firestore Database**
```typescript
import { getFirestore, collection, query, where } from 'firebase/firestore';

const db = getFirestore(app);
const placesRef = collection(db, 'places');
const q = query(placesRef, where('status', '==', 'published'));
```

**Features:**
- NoSQL document database
- Real-time subscriptions
- Offline support
- Complex queries với composite indexes
- Security rules

**Firebase Storage**
```typescript
import { getStorage, ref, uploadBytes } from 'firebase/storage';

const storage = getStorage(app);
const imageRef = ref(storage, `places/images/${userId}/${filename}`);
await uploadBytes(imageRef, file);
```

**Features:**
- Image/video hosting
- Auto-resize với Cloud Functions (optional)
- CDN-backed
- Security rules

**Firebase Realtime Database**
```typescript
import { getDatabase, ref, onValue } from 'firebase/database';

const db = getDatabase(app);
const notifRef = ref(db, `notifications/${userId}`);
onValue(notifRef, (snapshot) => { ... });
```

**Use Cases:**
- Real-time notifications
- User presence
- Live updates

**Firebase Admin SDK (Server-Side)**
```typescript
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();
```

**Powers:**
- Bypass security rules (server-side only)
- Create custom claims
- Send emails
- Manage users

### 2.3. AI & ML Stack

**Google Genkit 1.16.1**
```typescript
// src/ai/flows/place-chat-flow.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({ plugins: [googleAI()] });

export const placeChatFlow = ai.defineFlow(
  { name: 'placeChat' },
  async (input) => {
    const { text } = await ai.generate({
      model: googleAI('gemini-2.0-flash-exp'),
      prompt: input.prompt
    });
    return text;
  }
);
```

**Features:**
- Vertex AI integration
- Gemini 2.0 Flash models
- Structured outputs
- Streaming support

**Use Cases:**
1. **Place-Specific Chatbot** ✅
   - Context: Place data (name, description, amenities, reviews)
   - Q&A về địa điểm
   - Cost: ~$0.00026/turn

2. **Trip Planner** ⏸️ (Paused - waiting for more data)
   - Context: All published places
   - Generate itineraries
   - Cost: ~$0.004/request

### 2.4. DevOps & Tools

#### Build Tools

**Next.js Compiler (SWC)**
- 17x faster than Babel
- Built-in TypeScript support
- Minification
- Dead code elimination

**Configuration:**
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
};
```

#### Testing

**Jest 30.0.5 + React Testing Library**
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

**Current Coverage:** ~30%
**Target:** 80%+

#### Code Quality

**ESLint 9.37.0**
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

**TypeScript Compiler**
```bash
npm run typecheck   # Type check without build
```

#### Development Tools

| Tool | Purpose |
|------|---------|
| `patch-package` | Patch dependencies |
| `genkit-cli` | AI flow development |
| `firebase-cli` | Firebase deployment |
| `next-sitemap` | Sitemap generation |

---

## 3. Kiến Trúc Frontend

### 3.1. Next.js App Router Structure

```
src/app/
├── (root)/                   # Layout group (có Header)
│   ├── page.tsx             # Homepage
│   ├── places/
│   │   ├── page.tsx         # Browse places
│   │   ├── saved/           # Saved places
│   │   └── [slug]/
│   │       └── page.tsx     # Place detail
│   ├── explore/
│   │   ├── [region]/        # By region
│   │   └── [type]/          # By type
│   ├── profile/
│   │   └── me/page.tsx      # User profile
│   └── contribute/
│       ├── create/          # Create place
│       └── edit/[id]/       # Edit draft
│
├── admin/                   # Admin panel
│   ├── layout.tsx           # Admin-specific layout
│   ├── dashboard/
│   ├── moderation/
│   │   ├── queue/
│   │   └── reports/
│   └── users/
│
├── api/                     # API Routes
│   ├── places/
│   │   ├── route.ts         # GET /api/places
│   │   └── [id]/
│   │       ├── route.ts     # GET/PATCH/DELETE
│   │       ├── reviews/     # Reviews CRUD
│   │       └── reports/     # Report place
│   ├── moderation/
│   │   └── queue/
│   │       ├── route.ts     # GET queue
│   │       └── [itemId]/
│   │           └── route.ts # Actions (claim, approve, etc)
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── me/
│   └── ai/
│       ├── chat/            # General chat
│       └── place-chat/      # Place-specific chat
│
├── layout.tsx               # Root layout
├── not-found.tsx            # 404 page
├── error.tsx                # Error boundary
├── loading.tsx              # Loading skeleton
└── sw.ts                    # Service Worker (PWA)
```

### 3.2. Component Architecture

```
src/components/
├── ui/                      # Radix UI wrappers
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── toast.tsx
│   └── ... (30+ components)
│
├── auth/                    # Authentication
│   ├── login-modal.tsx
│   ├── register-modal.tsx
│   └── protected-route.tsx
│
├── places/                  # Place-related
│   ├── place-card.tsx
│   ├── place-detail-content.tsx
│   ├── place-images-carousel.tsx
│   └── place-filters.tsx
│
├── modals/                  # Modal dialogs
│   ├── create-place-modal.tsx
│   ├── review-modal.tsx
│   └── report-modal.tsx
│
├── notifications/           # Real-time notifications
│   ├── notification-bell.tsx
│   └── notification-item.tsx
│
├── admin/                   # Admin components
│   ├── moderation-queue-table.tsx
│   ├── user-management-table.tsx
│   └── analytics-charts.tsx
│
├── pwa/                     # PWA components
│   ├── install-prompt.tsx
│   └── service-worker-registration.tsx
│
├── header.tsx               # Global header
├── footer.tsx               # Global footer
└── providers.tsx            # Context providers
```

### 3.3. Custom Hooks Pattern

```
src/hooks/
├── use-auth.ts              # Authentication state
├── use-places.ts            # Fetch places with filters
├── use-place-stats.ts       # View tracking + real-time stats
├── use-user-drafts.ts       # User's draft management
├── use-moderation-queue.ts  # Moderation queue (admin)
├── use-place-reviews.ts     # Fetch reviews
├── use-place-chat.ts        # AI chatbot integration
├── use-realtime-notifications.ts  # Real-time notifs
└── use-view-tracking.ts     # Auto-increment view count
```

**Example Hook:**
```typescript
// src/hooks/use-places.ts
export function usePlaces(filters: PlaceFilters) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      const response = await callApi('/api/places', {
        params: filters
      });
      setPlaces(response.data);
      setLoading(false);
    };
    fetchPlaces();
  }, [filters]);

  return { places, loading };
}
```

### 3.4. State Management Strategy

**Không dùng Redux/Zustand/Recoil!**

**Lý do:**
- Next.js App Router with Server Components làm giảm client state
- React Context cho global state (auth, theme)
- Local state (useState) cho component state
- SWR/React Query cho server state (nếu cần)

**Current approach:**
```typescript
// Context cho Auth
export const AuthContext = createContext<AuthContextType>();

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook để consume
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}
```

---

## 4. Kiến Trúc Backend

### 4.1. API Architecture

#### RESTful Principles

**Consistent Response Format:**
```typescript
// Success Response
{
  "success": true,
  "data": { ... } | [ ... ],
  "message": "Optional success message",
  "total": 100  // For paginated lists
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }  // Optional
}
```

#### Authentication Middleware

```typescript
// src/lib/server/auth-middleware.ts
export async function verifyAuthToken(request: Request) {
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!token) {
    throw new Error('No token provided');
  }

  const decodedToken = await adminAuth.verifyIdToken(token);
  const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    user: userDoc.data()
  };
}
```

**Usage in API Route:**
```typescript
// src/app/api/places/route.ts
export async function POST(request: Request) {
  // Verify auth
  const { user } = await verifyAuthToken(request);

  // Check permissions
  if (!hasPermission(user, 'create_place')) {
    return NextResponse.json(
      { success: false, error: 'Permission denied' },
      { status: 403 }
    );
  }

  // Business logic...
}
```

### 4.2. Server-Side Services

#### View Tracker Service

```typescript
// src/lib/server/view-tracker.ts
export class ViewTracker {
  static async trackPlaceView(
    placeId: string,
    context: { ip: string; userAgent: string }
  ) {
    // Generate fingerprint
    const fingerprint = sha256(context.ip + context.userAgent);

    // Check cache
    const cacheKey = `${placeId}_${fingerprint}`;
    const cache = await db.collection('view_cache').doc(cacheKey).get();

    if (cache.exists && !isExpired(cache.data().expiresAt)) {
      // Already viewed within 1 hour
      return { success: true, isUnique: false };
    }

    // Increment view count atomically
    await db.collection('places').doc(placeId).update({
      viewCount: FieldValue.increment(1),
      lastViewedAt: new Date()
    });

    // Create cache entry
    await db.collection('view_cache').doc(cacheKey).set({
      placeId,
      fingerprint,
      viewedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    return { success: true, isUnique: true };
  }
}
```

#### Enhanced Notification Service

```typescript
// src/lib/server/enhanced-notification-service.ts
export class EnhancedNotificationService {
  static async notifyPlaceApproved(
    placeId: string,
    placeName: string,
    slug: string,
    ownerId: string
  ) {
    const notification = {
      id: generateId(),
      userId: ownerId,
      type: 'PLACE_APPROVED',
      title: 'Địa điểm đã được duyệt',
      body: `"${placeName}" đã được duyệt và hiển thị công khai`,
      actionUrl: `/places/${slug}`,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    };

    // Save to Realtime DB
    await realtimeDb.ref(`notifications/${ownerId}/${notification.id}`).set(notification);
  }
}
```

### 4.3. Cloud Functions (Cron Jobs)

**Scheduled Tasks:**
```typescript
// functions/src/index.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';

// Run every 30 minutes
export const cleanupExpiredClaims = onSchedule(
  'every 30 minutes',
  async (event) => {
    const now = new Date();

    // Find expired claims
    const snapshot = await db.collection('moderation_queue')
      .where('status', '==', 'claimed')
      .where('claimExpiresAt', '<', now)
      .get();

    // Release claims using transactions
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        status: 'pending',
        claimExpiresAt: FieldValue.delete(),
        claimedBy: FieldValue.delete()
      });
    });

    await batch.commit();
    console.log(`Released ${snapshot.size} expired claims`);
  }
);

// Run daily at 2:00 AM
export const archiveModerationQueue = onSchedule(
  'every day 02:00',
  async (event) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Archive old approved/rejected items
    const snapshot = await db.collection('moderation_queue')
      .where('status', 'in', ['approved', 'rejected'])
      .where('updatedAt', '<', thirtyDaysAgo)
      .get();

    // Move to archive
    const batch = db.batch();
    snapshot.forEach(doc => {
      const archiveRef = db.collection('moderation_archive').doc(doc.id);
      batch.set(archiveRef, { ...doc.data(), archivedAt: new Date() });
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Archived ${snapshot.size} items`);
  }
);
```

---

## 5. Kiến Trúc Database

### 5.1. Firestore Collections

#### Collection: `users`
```typescript
interface User {
  id: string;                    // Firebase UID
  email: string;
  displayName: string;
  avatar?: string;
  role: 'guest' | 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Stats
  stats: {
    placesCreated: number;
    reviewsWritten: number;
    helpfulVotes: number;
  };

  // Profile
  bio?: string;
  province?: string;
}
```

**Indexes:**
- `role` (ASC)
- `createdAt` (DESC)
- Compound: `role` (ASC) + `createdAt` (DESC)

---

#### Collection: `places`
```typescript
interface Place {
  id: string;
  name: string;
  slug: string;                  // URL-friendly
  description: string;

  // Location
  province: string;              // Tỉnh/Thành phố
  district?: string;             // Quận/Huyện
  ward?: string;                 // Phường/Xã
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Classification
  region: 'bac-bo' | 'trung-bo' | 'nam-bo';
  type: 'bien' | 'nui' | 'van-hoa' | 'am-thuc' | 'check-in';

  // Media
  images: PlaceImage[];
  videos?: string[];

  // Metadata
  status: 'draft' | 'submitted' | 'in_review' | 'published' | 'rejected';
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

  // Trust label
  trustLabel: 'community' | 'contributor' | 'partner' | 'verified';
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
}
```

**Indexes:**
- `status` (ASC)
- `region` (ASC) + `status` (ASC)
- `type` (ASC) + `status` (ASC)
- `province` (ASC) + `status` (ASC)
- `createdBy` (ASC) + `status` (ASC)
- `publishedAt` (DESC) + `status` (ASC)

---

#### Collection: `moderation_queue`
```typescript
interface ModerationQueueItem {
  id: string;
  contentType: 'place' | 'review' | 'report';
  contentId: string;             // Reference to actual content

  // Status flow: pending → claimed → in_review → approved/rejected/needs_revision
  status: 'pending' | 'claimed' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';

  // Priority
  priority: 'urgent' | 'high' | 'medium' | 'low';

  // Claim mechanism
  claimedBy?: string;            // Moderator ID
  claimedAt?: Timestamp;
  claimExpiresAt?: Timestamp;    // 2 hours from claimedAt

  // Review
  reviewedBy?: string;           // Final reviewer ID
  reviewedAt?: Timestamp;
  reviewNotes?: string;

  // Timestamps
  submittedAt: Timestamp;
  updatedAt: Timestamp;

  // Submitter info
  submittedBy: string;           // User ID
  submitterRole: string;         // For priority calculation
}
```

**Indexes:**
- `status` (ASC) + `priority` (DESC) + `submittedAt` (ASC)
- `claimedBy` (ASC) + `status` (ASC)
- `status` (ASC) + `claimExpiresAt` (ASC)  // For cleanup cron

---

#### Collection: `place_reviews`
```typescript
interface PlaceReview {
  id: string;
  placeId: string;
  userId: string;

  // Content
  title?: string;
  content: string;               // Main review text
  rating: number;                // 1-5 stars

  // Visit info
  visitDate?: string;            // YYYY-MM-DD
  tripType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';

  // Media
  images?: string[];             // Max 4 images

  // Privacy
  isAnonymous: boolean;          // If true, hide real name

  // User info (denormalized for performance)
  userInfo: {
    id: string;
    name: string;                // "Người dùng ẩn danh" if isAnonymous
    avatar?: string;
  };

  // Stats
  helpfulCount: number;

  // Status
  status: 'published' | 'hidden' | 'removed';

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `placeId` (ASC) + `status` (ASC) + `createdAt` (DESC)
- `userId` (ASC) + `createdAt` (DESC)

---

#### Collection: `view_cache`
```typescript
interface ViewCacheEntry {
  placeId: string;
  fingerprint: string;           // SHA-256 hash of IP + User-Agent
  viewedAt: Timestamp;
  expiresAt: Timestamp;          // viewedAt + 1 hour

  // For debugging (auto-deleted after expiration)
  ip: string;
  userAgent: string;
}
```

**Composite ID:** `{placeId}_{fingerprint}`
**TTL:** Auto-delete after `expiresAt`

**Indexes:**
- `expiresAt` (ASC)  // For cleanup cron

---

### 5.2. Realtime Database Structure

```json
{
  "notifications": {
    "{userId}": {
      "{notificationId}": {
        "id": "notif_abc123",
        "userId": "user_123",
        "type": "PLACE_APPROVED",
        "title": "Địa điểm đã được duyệt",
        "body": "...",
        "actionUrl": "/places/ha-long-bay",
        "read": false,
        "createdAt": "2025-01-06T10:00:00Z",
        "timestamp": 1736154000000
      }
    }
  }
}
```

**Why Realtime DB instead of Firestore for notifications?**
- ✅ Real-time updates (< 100ms latency)
- ✅ Lower cost for high-frequency reads
- ✅ Simple key-value structure
- ✅ Automatic sorting by timestamp

---

### 5.3. Firebase Storage Structure

```
gs://du-lich-viet.appspot.com/
├── places/
│   └── images/
│       └── {userId}/
│           ├── abc123.jpg
│           ├── def456.png
│           └── ...
│
├── avatars/
│   └── {userId}/
│       └── avatar.jpg
│
└── announcements/
    └── {announcementId}/
        └── cover.jpg
```

**Upload Rules:**
- Max file size: 5MB
- Allowed types: JPG, PNG, WebP
- Auto-resize: 1200x800px, 80% quality
- Naming: `{uuid}.{ext}`

---

## 6. Luồng Dữ Liệu

### 6.1. Place Creation Flow

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Fill form + Upload images
       ▼
┌──────────────┐
│ Create Place │
│    Modal     │
└──────┬───────┘
       │
       │ 2. POST /api/places/drafts
       ▼
┌─────────────────────┐
│  API Route          │
│  - Verify auth      │
│  - Validate data    │
│  - Upload to Storage│
└──────┬──────────────┘
       │
       │ 3. Write to Firestore
       ▼
┌──────────────────────┐
│  places collection   │
│  status: 'draft'     │
└──────┬───────────────┘
       │
       │ 4. User submits draft
       │    POST /api/places/drafts/[id]/submit
       ▼
┌───────────────────────┐
│  Update status:       │
│  'draft' → 'submitted'│
└──────┬────────────────┘
       │
       │ 5. Create moderation queue item
       ▼
┌────────────────────────────┐
│  moderation_queue          │
│  status: 'pending'         │
│  priority: based on role   │
└──────┬─────────────────────┘
       │
       │ 6. Send notification
       ▼
┌────────────────────────┐
│  Realtime DB           │
│  notifications/{userId}│
│  type: 'PLACE_RECEIVED'│
└────────────────────────┘
```

### 6.2. Moderation Workflow Flow

```
┌────────────────┐
│  Moderator     │
│  (Admin Panel) │
└────────┬───────┘
         │
         │ 1. View queue
         │    GET /api/moderation/queue?status=pending
         ▼
┌─────────────────────────┐
│  Fetch queue items      │
│  Sort by priority + date│
└────────┬────────────────┘
         │
         │ 2. Click "Tiếp nhận"
         │    POST /api/moderation/queue/[id]?action=claim
         ▼
┌────────────────────────────────┐
│  Update queue item:            │
│  status: 'pending' → 'claimed' │
│  claimedBy: moderator_id       │
│  claimExpiresAt: now + 2h      │
└────────┬───────────────────────┘
         │
         │ 3. Click "Bắt đầu kiểm duyệt"
         │    POST /api/moderation/queue/[id]?action=start_review
         ▼
┌─────────────────────────────────┐
│  Update queue item:             │
│  status: 'claimed' → 'in_review'│
│  claimExpiresAt: DELETE         │
└────────┬────────────────────────┘
         │
         │ 4. Review content
         │    (Check quality, accuracy, guidelines)
         ▼
┌─────────────────────────┐
│  Decision:              │
│  - Approve              │
│  - Reject               │
│  - Request Revision     │
└────────┬────────────────┘
         │
         │ 5. Click "Duyệt"
         │    POST /api/moderation/queue/[id]?action=approve
         ▼
┌──────────────────────────────────┐
│  Update place:                   │
│  status: 'submitted' → 'published'│
│  publishedAt: now                │
└────────┬─────────────────────────┘
         │
         │ Update queue:
         │  status: 'in_review' → 'approved'
         │  reviewedBy: moderator_id
         │  reviewedAt: now
         ▼
┌─────────────────────────────┐
│  Send notification:         │
│  type: 'PLACE_APPROVED'     │
│  actionUrl: /places/{slug}  │
└─────────────────────────────┘
```

**Auto-Cleanup (Cron):**
```
Every 30 minutes:
  - Find items with status='claimed' AND claimExpiresAt < now
  - Use transaction to:
    1. Re-fetch item
    2. Verify still in 'claimed' state
    3. Update to 'pending'
    4. Delete claim fields
```

### 6.3. View Tracking Flow

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Visit place detail page
       │    GET /places/[slug]
       ▼
┌──────────────────────┐
│  Server Component    │
│  - Fetch place data  │
│  - Render HTML (SSR) │
└──────┬───────────────┘
       │
       │ 2. Client component mounts
       │    useViewTracking(placeId, initialViewCount)
       ▼
┌──────────────────────────────┐
│  Auto-call API:              │
│  POST /api/places/[id]/route │
│  Body: { action: 'view' }    │
└──────┬───────────────────────┘
       │
       │ 3. Server extracts context
       │    ip = getClientIP(request.headers)
       │    userAgent = getUserAgent(request.headers)
       ▼
┌───────────────────────────────┐
│  ViewTracker.trackPlaceView() │
│  - Generate fingerprint       │
│  - Check view_cache           │
└──────┬────────────────────────┘
       │
       ├──> Cache exists & not expired
       │    └──> Return current viewCount (NO increment)
       │
       └──> Cache expired or not found
            ├──> Increment place.viewCount
            ├──> Create cache entry (TTL: 1h)
            └──> Return new viewCount
```

---

## 7. Authentication & Authorization

### 7.1. Authentication Flow

```
┌──────────────────────┐
│  User Registration   │
│  /auth/register      │
└──────┬───────────────┘
       │
       │ 1. POST /api/auth/register
       │    { email, password, displayName }
       ▼
┌───────────────────────────────┐
│  Firebase Auth                │
│  createUserWithEmailAndPassword()
└──────┬────────────────────────┘
       │
       │ 2. Send verification email
       ▼
┌──────────────────────────┐
│  Create user document    │
│  collection: users       │
│  role: 'traveler'        │
│  emailVerified: false    │
└──────┬───────────────────┘
       │
       │ 3. Return JWT token
       ▼
┌──────────────────────────┐
│  Client saves token      │
│  localStorage or cookie  │
└──────────────────────────┘
```

**Login Flow:**
```
┌──────────────────────┐
│  User Login          │
│  /auth/login         │
└──────┬───────────────┘
       │
       │ 1. POST /api/auth/login
       │    { email, password }
       ▼
┌───────────────────────────────┐
│  Firebase Auth                │
│  signInWithEmailAndPassword() │
└──────┬────────────────────────┘
       │
       │ 2. Fetch user document
       │    from Firestore
       ▼
┌──────────────────────────┐
│  Return user + token     │
└──────────────────────────┘
```

### 7.2. Role-Based Access Control (RBAC)

**6-Level Role Hierarchy:**
```
Admin           (all_permissions)
   ↓ inherits
Moderator       (review_content, manage_reports, moderate_reviews)
   ↓ inherits
Partner         (create_place, edit_own_place, delete_own_place)
   ↓ inherits
Contributor     (create_place, edit_own_place)
   ↓ inherits
Traveler        (create_review, save_place, create_itinerary)
   ↓ inherits
Guest           (view_public_content)
```

**Permission System:**
```typescript
// src/lib/auth/permissions.ts
const ROLE_PERMISSIONS = {
  guest: ['view_public_content'],
  traveler: ['create_review', 'save_place', 'create_itinerary'],
  contributor: ['create_place', 'edit_own_place'],
  partner: ['delete_own_place', 'priority_review'],
  moderator: ['review_content', 'manage_reports', 'moderate_reviews'],
  admin: ['all_permissions']
};

export function hasPermission(user: User, permission: string): boolean {
  const userRole = user.role || 'guest';
  const hierarchy = ['guest', 'traveler', 'contributor', 'partner', 'moderator', 'admin'];

  // Get user role index
  const userRoleIndex = hierarchy.indexOf(userRole);

  // Check all inherited permissions
  for (let i = 0; i <= userRoleIndex; i++) {
    const role = hierarchy[i];
    if (ROLE_PERMISSIONS[role].includes(permission)) {
      return true;
    }
  }

  // Admin has all permissions
  if (userRole === 'admin') return true;

  return false;
}
```

**Usage in API:**
```typescript
export async function POST(request: Request) {
  const { user } = await verifyAuthToken(request);

  if (!hasPermission(user, 'create_place')) {
    return NextResponse.json(
      { success: false, error: 'You need Contributor role to create places' },
      { status: 403 }
    );
  }

  // ... business logic
}
```

---

## 8. AI Architecture

### 8.1. Genkit Framework Setup

```typescript
// src/ai/dev.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY
    })
  ]
});

export default ai;
```

### 8.2. Place-Specific Chatbot

```typescript
// src/ai/flows/place-chat-flow.ts
export const placeChatFlow = ai.defineFlow(
  {
    name: 'placeChat',
    inputSchema: z.object({
      placeId: z.string(),
      placeData: z.object({ ... }),
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string()
      }))
    })
  },
  async (input) => {
    // Build context from place data
    const context = `
      Tên địa điểm: ${input.placeData.name}
      Mô tả: ${input.placeData.description}
      Loại hình: ${input.placeData.type}
      Vị trí: ${input.placeData.province}
      Đánh giá trung bình: ${input.placeData.stats.averageRating}/5
      ...
    `;

    const systemPrompt = `
      Bạn là trợ lý AI chuyên về du lịch Việt Nam.
      Dưới đây là thông tin về địa điểm người dùng đang xem:

      ${context}

      Nhiệm vụ: Trả lời câu hỏi của người dùng về địa điểm này một cách chính xác, hữu ích và thân thiện.

      Lịch sử trò chuyện:
      ${input.messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    `;

    // Call Gemini API
    const { text } = await ai.generate({
      model: googleAI('gemini-2.0-flash-exp'),
      prompt: systemPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    // Log for analytics
    await logAIChatUsage({
      placeId: input.placeId,
      userId: input.userId,
      prompt: input.messages[input.messages.length - 1].content,
      response: text,
      model: 'gemini-2.0-flash-exp',
      tokensUsed: usage.totalTokens
    });

    return { response: text };
  }
);
```

**API Endpoint:**
```typescript
// src/app/api/ai/place-chat/route.ts
export async function POST(request: Request) {
  const { user } = await verifyAuthToken(request);
  const { placeId, messages } = await request.json();

  // Fetch place data
  const placeDoc = await adminDb.collection('places').doc(placeId).get();
  const placeData = placeDoc.data();

  // Call Genkit flow
  const result = await placeChatFlow({
    placeId,
    placeData,
    messages,
    userId: user.uid
  });

  return NextResponse.json({
    success: true,
    data: { response: result.response }
  });
}
```

### 8.3. Cost Analysis

**Gemini 2.0 Flash Pricing:**
- Input: $0.000001 per token (~$0.001 per 1K tokens)
- Output: $0.000004 per token (~$0.004 per 1K tokens)

**Place Chat Typical Request:**
- Input tokens: ~500 (context + history)
- Output tokens: ~200 (response)
- Cost per turn: ~$0.00026 (~650 VND)

**Scalability:**
- 1,000 chat turns/day = $0.26/day = $7.80/month
- 10,000 chat turns/day = $2.60/day = $78/month
- Very affordable for value provided

---

## 9. PWA Implementation

### 9.1. Service Worker (Serwist)

```typescript
// src/app/sw.ts
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  // Caching strategies
  runtimeCaching: [
    // Static assets
    {
      urlPattern: /\.(css|js|woff|woff2|ttf|otf)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets-v1.0.0',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },

    // Images
    {
      urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-v1.0.0',
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 60 * 24 * 60 * 60 // 60 days
        }
      }
    },

    // Firebase Storage images
    {
      urlPattern: ({ url }) => url.hostname === 'firebasestorage.googleapis.com',
      handler: 'CacheFirst',
      options: {
        cacheName: 'firebase-images-v1.0.0',
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 90 * 24 * 60 * 60 // 90 days
        }
      }
    },

    // API routes
    {
      urlPattern: /\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache-v1.0.0',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 // 1 hour
        }
      }
    },

    // Pages
    {
      urlPattern: /\/(places|explore|profile)\/.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages-v1.0.0',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  ]
});

serwist.addEventListeners();
```

### 9.2. Manifest File

```json
// public/manifest.json
{
  "name": "Du Lịch Việt - Khám phá Việt Nam với AI",
  "short_name": "Du Lịch Việt",
  "description": "Nền tảng chia sẻ và khám phá địa điểm du lịch Việt Nam với AI Trip Planner",
  "theme_color": "#16A34A",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "start_url": "/?source=pwa",
  "scope": "/",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Khám phá",
      "url": "/explore?source=pwa_shortcut",
      "description": "Khám phá địa điểm du lịch"
    },
    {
      "name": "Đã lưu",
      "url": "/places/saved?source=pwa_shortcut",
      "description": "Xem địa điểm đã lưu"
    },
    {
      "name": "Hồ sơ",
      "url": "/profile/me?source=pwa_shortcut",
      "description": "Xem hồ sơ cá nhân"
    }
  ]
}
```

---

## 10. Performance Optimization

### 10.1. Next.js Optimizations

**1. Image Optimization**
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
/>
```

**2. Code Splitting**
```typescript
// Dynamic import cho heavy components
const AdminDashboard = dynamic(() => import('@/components/admin/dashboard'), {
  loading: () => <Skeleton />,
  ssr: false  // Client-side only
});
```

**3. Package Optimization**
```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
}
```

### 10.2. Database Optimization

**1. Denormalization**
```typescript
// Store user info in reviews to avoid extra fetch
interface PlaceReview {
  // ...
  userInfo: {
    id: string;
    name: string;
    avatar?: string;
  }
}
```

**2. Composite Indexes**
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "places",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "region", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**3. Pagination**
```typescript
// Limit queries to 20 items
const placesRef = collection(db, 'places');
const q = query(
  placesRef,
  where('status', '==', 'published'),
  orderBy('publishedAt', 'desc'),
  limit(20)
);
```

### 10.3. Caching Strategies

**1. Server-Side Caching**
```typescript
// Revalidate every 1 hour
export const revalidate = 3600;

export async function generateStaticParams() {
  // Pre-generate top 100 places
  const places = await getTopPlaces(100);
  return places.map(p => ({ slug: p.slug }));
}
```

**2. Client-Side Caching (SWR)**
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

---

## 11. Security Architecture

### 11.1. Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function hasRole(role) {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }

    function emailVerified() {
      return isAuthenticated() && request.auth.token.email_verified == true;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if emailVerified() && isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false;  // Never allow user deletion via client
    }

    // Places collection
    match /places/{placeId} {
      allow read: if true;  // Public read
      allow create: if emailVerified() &&
        request.resource.data.createdBy == request.auth.uid;
      allow update: if isOwner(resource.data.createdBy) ||
        hasRole('moderator') || hasRole('admin');
      allow delete: if hasRole('admin');
    }

    // Moderation queue
    match /moderation_queue/{itemId} {
      allow read: if hasRole('moderator') || hasRole('admin');
      allow create: if emailVerified();
      allow update: if hasRole('moderator') || hasRole('admin');
      allow delete: if hasRole('admin');
    }

    // Reviews
    match /place_reviews/{reviewId} {
      allow read: if resource.data.status == 'published';
      allow create: if emailVerified() &&
        request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId) || hasRole('moderator');
    }
  }
}
```

### 11.2. API Security

**1. Rate Limiting**
```typescript
// Implement rate limiting for sensitive endpoints
const RATE_LIMIT = {
  '/api/ai/place-chat': { max: 10, window: '1d' },  // 10 chats per day
  '/api/places': { max: 100, window: '1h' },        // 100 requests per hour
  '/api/auth/login': { max: 5, window: '15m' }      // 5 login attempts per 15 min
};
```

**2. Input Validation**
```typescript
// Always validate input with Zod
const CreatePlaceSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(50).max(5000),
  province: z.string(),
  type: z.enum(['bien', 'nui', 'van-hoa', 'am-thuc', 'check-in']),
  // ... more fields
});

export async function POST(request: Request) {
  const body = await request.json();

  // Validate
  const validated = CreatePlaceSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { success: false, error: validated.error.message },
      { status: 400 }
    );
  }

  // ... proceed with validated.data
}
```

**3. CORS Configuration**
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://dulichviet.tech' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type' }
      ]
    }
  ];
}
```

### 11.3. XSS/CSRF Protection

**1. Content Security Policy**
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ];
}
```

**2. Sanitize User Input**
```typescript
import validator from 'validator';

// Sanitize before storing
const sanitizedContent = validator.escape(userInput);
const sanitizedEmail = validator.normalizeEmail(email);
```

---

## Kết Luận

Kiến trúc của **Du Lịch Việt** được thiết kế với các nguyên tắc:

1. **Serverless-First**: Zero operations overhead, focus on features
2. **Type-Safe**: TypeScript strict mode + Zod validation
3. **Scalable**: Firebase auto-scaling + efficient caching
4. **Secure**: Multi-layer security (Firebase Rules + API middleware + validation)
5. **Performant**: SSR + Code splitting + PWA + Aggressive caching
6. **Developer-Friendly**: Clean architecture + comprehensive docs

**Tài liệu liên quan:**
- [1. Tổng Quan Dự Án](./1_Tong_Quan_Du_Lich_Viet.md)
- [3. Tính Năng Quan Trọng](./3_Tinh_Nang_Quan_Trong.md)
- [4. Cấu Trúc Thư Mục & Setup](./4_Cau_Truc_Thu_Muc_&_Setup.md)
- [5. API, Database, Security & Performance](./5_API_Database_Security_Performance.md)

---

*© 2025 Du Lịch Việt. All rights reserved.*

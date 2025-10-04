# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Core Development:**
- `npm run dev` - Start development server on port 9002
- `npm run build` - Production build with sitemap generation (includes `next-sitemap` postbuild)
- `npm run typecheck` - TypeScript type checking without build
- `npm run lint` / `npm run lint:fix` - ESLint validation and auto-fix

**Testing:**
- `npm test` - Run Jest test suite
- `npm run test:watch` - Jest in watch mode for development
- `npm run test:coverage` - Generate coverage reports
- `npm run test:ci` - CI-optimized test run

**AI Development:**
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Genkit with file watching for AI flow development

**Utilities:**
- `npm run analyze` - Bundle analysis for performance optimization
- `npm run sitemap:tree` - Generate sitemap tree visualization
- Scripts in `/scripts/` for database seeding and Firebase management

## Architecture Overview

### Tech Stack Foundation
- **Next.js 15** with App Router architecture
- **Firebase** for authentication, Firestore database, and file storage
- **TypeScript** with strict type safety
- **Tailwind CSS** with custom design system
- **Genkit AI** integration for travel itinerary generation

### Authentication & Authorization System

**Role-Based Hierarchy (6 levels):**
```
Guest → Traveler → Contributor → Partner → Moderator → Admin
```

**Permission System:**
- Defined in `src/lib/auth/permissions.ts` 
- Hierarchical inheritance (higher roles inherit lower role permissions)
- Key permissions: `create_place`, `review_content`, `manage_users`, `all_permissions`
- Use `hasPermission(user, permission)` function for access control

**Trust Label System:**
- `community` → `contributor` → `partner` → `verified` 
- Affects content moderation priority and display prominence
- Assigned based on user role and content quality

### Core Data Models

**Place Schema (`src/lib/types/places.ts`):**
- **Status flow:** `draft → submitted → in_review → published/rejected`
- **Regional structure:** Vietnam divided into `bac-bo`, `trung-bo`, `nam-bo`
- **Types:** `bien`, `nui`, `van-hoa`, `am-thuc`, `check-in`
- **Image system:** Firebase Storage integration with auto-resize and validation

**User Schema (`src/lib/types/auth.ts`):**
- Role-based permissions with stats tracking
- Profile data, badges, and contribution metrics
- Email verification and account status management

### API Architecture

**RESTful Endpoints Structure:**
- `GET /api/places` - Public place listing with filtering
- `POST /api/places` - Create new place (requires contributor+ role)
- `PATCH /api/places/[id]` - Update place status/content
- `GET /api/places/my-drafts` - User's draft management
- `GET /api/moderation/queue` - Moderation workflow (moderator+ only)
- `PUT /api/moderation/queue/[itemId]` - Review actions (approve/reject/escalate)

**Authentication Middleware:**
- `verifyAuthToken()` in `src/lib/server/auth-middleware.ts`
- JWT token validation with role-based access control
- Used across all protected API endpoints

### Content Moderation Workflow

**Stable Long-Term Solution (v2.0 - State Machine Enforced):**

**State Machine (STRICT ENFORCEMENT):**
```
pending → claimed → in_review → approved/rejected/needs_revision
(chờ)    (tiếp nhận) (đang duyệt)  (quyết định cuối)
```

**Place Lifecycle:**
1. **Creation:** Contributors create draft → submit for review (status: `pending`)
2. **Moderation:** Moderators review via `/admin/moderation/queue`
   - **Step 1 - CLAIM:** `pending` → `claimed` (Moderator tiếp nhận việc, timeout 2h)
   - **Step 2 - START REVIEW:** `claimed` → `in_review` (Bắt đầu kiểm duyệt chính thức)
   - **Step 3 - DECISION:** `in_review` → `approved`/`rejected`/`needs_revision`
   - Approved/Rejected entries **GIỮ 30 NGÀY** trong queue
   - Auto-archive sau 30 ngày → `moderation_archive` collection
3. **Publication:** Approved content becomes `published` and public
4. **Monitoring:** Reports, edit requests, quality checks

**Key Features:**
- ✅ **Strict State Machine:** Bắt buộc tuân theo flow, không cho skip state
- ✅ **Audit Trail:** Approved/rejected visible 30 days
- ✅ **Rollback Capability:** Can review/rollback decisions
- ✅ **Auto-Archive:** Cron job daily at 2AM archives old entries
- ✅ **Auto-Cleanup:** Archive > 90 days automatically deleted
- Priority-based queue (urgent → high → medium → low)
- Claim mechanism with 2h timeout
- Escalation system for Moderators (Admin không cần escalate - quyền cao nhất)
- Real-time dashboard with filtering and tabs

**UI Behavior by Tab:**
- **Tab "Chờ duyệt" (pending):** Chỉ nút "Tiếp nhận"
- **Tab "Đã tiếp nhận" (claimed):** Nút "Bắt đầu kiểm duyệt" + "Bỏ tiếp nhận"
- **Tab "Đang duyệt" (in_review):** Đầy đủ nút Duyệt/Từ chối/Yêu cầu sửa + Escalate (chỉ Moderator)
- **Tab "Đã duyệt/Bị từ chối":** Read-only (Admin có thể rollback)

**API Validation:**
- `start_review`: Chỉ từ `claimed` → `in_review`
- `approve/reject/request_edit`: Chỉ từ `in_review`
- `escalate`: Chỉ Moderator, chặn Admin (403 error)

**Documentation:** See `PLACE_LIFECYCLE_WORKFLOW.md` for complete workflow

### Key React Patterns

**Custom Hooks:**
- `useAuth()` - Authentication state management
- `usePlaces(filters)` - Place data fetching with filtering
- `useUserDrafts(options)` - User's draft management with CRUD operations
- `useModerationQueue(filters)` - Admin moderation workflow

**Component Architecture:**
- Compound components with consistent UI patterns
- Role-based conditional rendering throughout
- Custom UI components in `src/components/ui/` built on Radix UI
- Image upload system with Firebase Storage integration

### Firebase Configuration

**Collections:**
- `users` - User profiles and authentication data
- `places` - Travel destinations with full metadata
- `moderation_queue` - Content review workflow
- `moderation_logs` - Audit trail for all moderation actions

**Security Rules:**
- Firestore rules in `firestore.rules` enforce role-based access
- Storage rules in `storage.rules` protect uploaded images
- Composite indexes in `firestore.indexes.json` for complex queries

### Development Workflow

**Branch Strategy:**
- `main` - Production branch
- `develop1` - Current development branch

**Database Seeding:**
- `scripts/seed-places-vietnam.js` - Real Vietnam tourism data
- `scripts/create-real-moderation-queue.js` - Realistic moderation scenarios
- `scripts/seed-users.js` - Test user accounts with various roles

**File Upload System:**
- Firebase Storage path: `places/images/{userId}/{filename}`
- Auto-resize to 1200x800px, 80% quality
- Support for JPG, PNG, WebP (max 5MB)
- Dual interface: file upload or URL input

### AI Integration

**Genkit Framework:**
- Travel itinerary generation in `src/ai/flows/`
- Integrated with Google AI for intelligent trip planning
- Development server on separate port for AI testing

### Real-time Notification System

**Architecture:**
- **Backend Service:** `src/lib/server/enhanced-notification-service.ts` - Centralized notification creation
- **Frontend Hook:** `src/hooks/use-realtime-notifications.ts` - Real-time subscription via Firebase Realtime Database
- **UI Components:**
  - `src/components/notifications/notification-bell.tsx` - Bell icon dropdown (max 10 recent)
  - `src/app/notifications/page.tsx` - Full notifications page with filtering

**Notification Workflow for Place Moderation:**
```
User submits place
    ↓
📬 PLACE_RECEIVED - "Địa điểm đã được tiếp nhận"
    ↓
👤 PLACE_CLAIMED - "Đã được tiếp nhận xử lý" (when moderator claims)
    ↓
🔍 PLACE_IN_REVIEW - "Đang được kiểm duyệt" (when review starts)
    ↓
✅ PLACE_APPROVED / ❌ PLACE_REJECTED / 🔄 REVISION_REQUESTED
```

**Key Implementation Points:**
- **Always include both `createdAt` (ISO string) and `timestamp` (number)** when creating notifications
- Notifications are **automatically sorted by timestamp descending** (newest first) in `src/lib/firebase/realtime.ts:227`
- Use `EnhancedNotificationService` static methods for consistency:
  - `notifyPlaceReceived(draftId, placeName, ownerId)`
  - `notifyPlaceClaimed(draftId, placeName, ownerId, moderatorName)`
  - `notifyPlaceInReview(draftId, placeName, ownerId, moderatorName)`
  - `notifyPlaceApproved(placeId, placeName, slug, ownerId)`
  - `notifyPlaceRejected(draftId, placeName, ownerId, reason)`
  - `notifyRevisionRequested(draftId, placeName, ownerId, reason)`

**Notification Types:**
- Add new types to `NotificationType` enum in `enhanced-notification-service.ts`
- Add corresponding icons to `notificationIcons` object in notification components
- Add default preferences in `getDefaultPreferences()` method
- Add template in `NOTIFICATION_TEMPLATES` object with title, body, actionUrl, priority, channels

**Common Pitfalls:**
- ❌ **DON'T** create notifications directly with Firebase - use `EnhancedNotificationService`
- ❌ **DON'T** forget to add notification calls in moderation workflow actions
- ❌ **DON'T** block operations if notification fails - wrap in try/catch and log errors
- ✅ **DO** include moderator name for transparency in claimed/in_review notifications
- ✅ **DO** log notification calls with `[NOTIFICATION]` prefix for debugging
- ✅ **DO** provide actionUrl for navigation to relevant pages

### Error Patterns & Debugging

**Common Issues:**
- **"Firebase Admin SDK not initialized"** - Check `.env.local` variables
- **"The query requires an index"** - Run Firebase index deployment
- **Role permission errors** - Verify user role in `/admin/dashboard`
- **Image upload failures** - Check Firebase Storage rules and auth
- **Notifications not appearing** - Check Firebase Realtime Database path `notifications/{userId}`, verify timestamps exist
- **Wrong notification order** - Ensure all notifications have `timestamp` field (number) for proper sorting

**Debugging Tools:**
- Firebase Admin SDK logs in server console
- Role switcher component in development for testing permissions
- Comprehensive error boundaries for user-friendly error handling
- `[NOTIFICATION]` prefixed console logs for tracking notification flow

**Page Structure Convention:**
- **ALL user-facing pages MUST include `<Header />` component** from `@/components/header`
- Root layout (`src/app/layout.tsx`) does NOT include Header - each page imports it individually
- Admin pages use separate `src/app/admin/layout.tsx` with admin-specific navigation

### View Count & Analytics Best Practices

**Architecture Decision:**
- ✅ **CORRECT:** Use Firestore as single source of truth for persistent counters
- ❌ **WRONG:** Dual-sync between Firestore ↔ Realtime DB for same metric (causes race conditions)
- ✅ Use Realtime DB only for ephemeral real-time data (presence, chat), not persistent counters

**Implementation:**
- Use `FieldValue.increment()` for atomic, thread-safe updates
- Implement session-based tracking with IP + User-Agent fingerprinting
- Cache viewed items with 1-hour TTL in `view_cache` collection to prevent count inflation
- Centralized service: `src/lib/server/view-tracker.ts`

**Display Pattern:**
```typescript
// ✅ CORRECT: Use centralized hook with optimistic updates
import { useViewTracking } from '@/hooks/use-place-stats'

const { viewCount } = useViewTracking(placeId, initialViewCount)
return <div>{viewCount.toLocaleString('vi-VN')} lượt xem</div>

// ❌ WRONG: Manual tracking with Math.max() hides synchronization problems
const viewCount = Math.max(realtimeViews, firestoreViews)
```

**Shared Hook Pattern:**
- `src/hooks/use-place-stats.ts` - Centralized stats management
- `useViewTracking()` - Auto-increment view count with optimistic UI
- `usePlaceStats()` - Real-time subscription for all stats (views, likes, saves)
- `usePlaceStatsCompact()` - Compact number formatting for cards (1.2K, 1.2M)

**Common Pitfalls:**
- ❌ Incrementing on every API call without deduplication → inflated counts
- ❌ Using Cloud Functions for counter sync → adds 100ms-5s latency
- ❌ No session tracking → users refresh = multiple counts
- ❌ Different display logic in different components → inconsistent UX
- ✅ **DO** use `ViewTracker.trackPlaceView()` for all view increments
- ✅ **DO** use shared hooks (`useViewTracking`, `usePlaceStats`) in components
- ✅ **DO** format numbers with `.toLocaleString('vi-VN')` for Vietnamese locale

**View Cache Cleanup:**
- Expired cache entries (>1 hour) should be cleaned periodically
- Use `ViewTracker.cleanupExpiredViewCache()` via cron job
- Prevents `view_cache` collection from growing indefinitely

**Files:**
- `src/lib/server/view-tracker.ts` - Server-side tracking service
- `src/hooks/use-place-stats.ts` - Client-side hooks
- `src/app/api/places/[id]/route.ts` - API endpoint using ViewTracker
- `src/components/place-detail-content.tsx` - Example implementation

When working with this codebase, always consider the role-based permission system, maintain the moderation workflow integrity, ensure proper Firebase security rule compliance, follow the notification workflow patterns for consistency, and use centralized view tracking to prevent count inflation.
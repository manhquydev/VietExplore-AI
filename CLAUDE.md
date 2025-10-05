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
- ❌ **NEVER hardcode stats to 0 in SSR** - Always read from Firestore `place.stats.saves`, `place.stats.likes`, etc.
- ❌ Hardcoding breaks real-time sync even when API/hooks work correctly
- ✅ **DO** use `ViewTracker.trackPlaceView()` for all view increments
- ✅ **DO** use shared hooks (`useViewTracking`, `usePlaceStats`) in components
- ✅ **DO** format numbers with `.toLocaleString('vi-VN')` for Vietnamese locale
- ✅ **DO** read initial stats from `place.stats.*` fields in SSR for accurate client hydration

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

### Critical Pattern: Cron Job + User Actions Race Conditions

**⚠️ LESSON LEARNED (2025-01-04): Địa điểm published bị reset về pending**

**Problem:**
Cron jobs cleaning up "stale" data can overwrite recent user actions, causing approved/published items to reset to `pending` state.

**Root Cause:**
1. **Missing cleanup triggers:** Actions like `start_review`/`approve` didn't delete `claimExpiresAt` field
2. **Query-then-update anti-pattern:** Cron job used non-atomic `query().then(update())`
3. **No transaction recheck:** Status could change between query and update (race window)

**Race Condition Timeline:**
```
T0: Item in 'claimed' state, claimExpiresAt = "2025-01-04T10:00:00Z"
T1: User clicks "Approve" → status = 'approved', places.status = 'published'
    ❌ BUT claimExpiresAt NOT deleted
T2: Cron job runs (every 30 min):
    - Query: WHERE status='claimed' AND claimExpiresAt < now
    - Finds item in cache (stale read)
T3: Cron update executes:
    - SET status = 'pending' ← ❌ Overwrites 'approved'!
    - Published place disappears from public view
```

**Solution (5-Layer Protection):**

```typescript
// 1. ✅ DELETE cleanup triggers when leaving watched state
if (action === 'start_review' || action === 'approve' || action === 'reject') {
  updateData.claimExpiresAt = FieldValue.delete();
  updateData.claimedBy = FieldValue.delete();
  updateData.claimedAt = FieldValue.delete();
}

// 2. ✅ USE Firestore Transactions for atomic check-and-update
await db.runTransaction(async (transaction) => {
  // 3. ✅ RE-FETCH inside transaction to get fresh state
  const freshDoc = await transaction.get(docRef);

  // 4. ✅ RECHECK all conditions inside transaction
  if (freshDoc.data().status !== 'claimed') {
    console.log('Status changed, skipping cleanup');
    return; // Prevent overwrite
  }

  if (freshDoc.data().claimExpiresAt >= now) {
    console.log('Claim extended, skipping');
    return;
  }

  // 5. ✅ ONLY update if all checks pass
  transaction.update(docRef, {
    status: 'pending',
    claimExpiresAt: FieldValue.delete()
  });
});
```

**Anti-pattern (NEVER do this):**
```typescript
// ❌ BAD - Race condition window between query and update
const docs = await db.collection('items')
  .where('status', '==', 'claimed')
  .where('expiresAt', '<', now)
  .get();

// 50-200ms race window here - status can change!
docs.forEach(doc => {
  doc.ref.update({ status: 'pending' }); // May overwrite newer state
});
```

**Testing Race Conditions:**
```bash
# Simulate concurrent approve + cron cleanup
1. Start item in 'claimed' state with claimExpiresAt
2. Approve item (should delete claimExpiresAt)
3. Immediately run cron job
4. Verify item stays 'approved', not reset to 'pending'
```

**Monitoring:**
- Log detailed stats: `found`, `released`, `skipped`, `errors`
- Alert if `skipped > 50%` (indicates high contention)
- Track items that transition `approved → pending` (should be ZERO)

**Files implementing this pattern:**
- `src/app/api/moderation/queue/[itemId]/route.ts` - Cleanup on state exit
- `src/app/api/cron/cleanup-expired-claims/route.ts` - Transaction-based cleanup

**Key Takeaway:**
Always ask: "What if a user action happens RIGHT BEFORE this cron job runs?"
Use transactions + field deletion to make race conditions impossible.

### Place Review System Best Practices

**Review Architecture:**
- **Collection:** `place_reviews` in Firestore
- **Schema:** Defined in `src/lib/types/reviews.ts`
- **API Endpoint:** `src/app/api/places/[id]/reviews/route.ts`
- **Frontend Hook:** `src/hooks/use-place-reviews.ts`
- **UI Component:** `src/components/place-detail-content.tsx`

**Critical Implementation Rules:**
- ✅ **ALWAYS** ensure Firestore rules exist for `place_reviews` collection before deployment
- ✅ **ALWAYS** add composite indexes for review queries (placeId + status + createdAt)
- ✅ **ALWAYS** match UI property names with backend schema:
  - Use `review.userInfo.name` NOT `review.userName`
  - Use `review.content` NOT `review.comment`
  - Display `review.title`, `review.visitDate`, `review.images[]`
- ✅ **ALWAYS** provide visual indicators for anonymous vs public reviews
  - Anonymous badge for `review.isAnonymous === true`
  - Verified badge for `!review.isAnonymous && review.isVerified`
  - Different avatar styling (gray for anonymous, blue for public)
- ✅ **DO** implement helpful voting system with `review.helpfulCount`
- ✅ **DO** provide spam/inappropriate content reporting
- ✅ **DO** respect user privacy with proper anonymous name handling ("Người dùng ẩn danh")

**Anonymous Review System:**
- Backend properly handles `isAnonymous` flag in API (line 110 in reviews route)
- When `isAnonymous === true`, backend sets `userInfo.name = "Người dùng ẩn danh"`
- Frontend displays badge and uses gray styling for anonymous reviews
- User can toggle anonymous mode in ReviewModal checkbox

**Review Content Display:**
Required elements to show:
1. Title (bold) - optional field
2. Content (main review text) - required, supports multiline
3. Rating stars (1-5) - visual display
4. Visit date - optional, shows when user visited
5. Review images - optional, max 4 visible + counter
6. Helpful count + interactive button
7. Report abuse button
8. Created date
9. Anonymous/Verified badges

**Common Pitfalls to Avoid:**
- ❌ **NEVER** create review collection without Firestore security rules
- ❌ **NEVER** skip composite indexes - queries will fail in production
- ❌ **NEVER** mismatch property names between backend schema and frontend display
- ❌ **NEVER** ignore `isAnonymous` flag in UI rendering
- ❌ **NEVER** allow users to see reviewer identity when `isAnonymous === true`
- ❌ **NEVER** forget to pass `placeId` prop to ReviewModal component
- ❌ **NEVER** call hooks (useState, useEffect) inside loops, conditions, or nested functions
  - **BAD:** `reviews.map(review => { const [state, setState] = useState() ... })`
  - **GOOD:** Extract to separate component: `reviews.map(review => <ReviewItem review={review} />)`
  - **Reason:** Violates Rules of Hooks, causes "Rendered more hooks than previous render" error
- ❌ **NEVER** manually implement fetch for authenticated APIs
  - **BAD:** `fetch('/api/endpoint', { headers: { Authorization: ... } })`
  - **GOOD:** `callApi('/endpoint', { method: 'POST' })`
  - **Reason:** `callApi()` from `src/lib/client/api.ts` handles auth tokens automatically, includes error handling, logging
  - **Result:** Missing auth header → 401 Unauthorized errors
- ❌ **NEVER** skip rate limiting for user-generated actions
  - **BAD:** Allow unlimited reports/votes/submissions
  - **GOOD:** Limit to X actions per time period (e.g., 3 reports/week)
  - **Reason:** Prevents spam attacks and abuse
- ❌ **NEVER** notify content owner about reports against their content
  - **BAD:** Notify place owner when their place is reported
  - **GOOD:** Reports go to moderators only
  - **Reason:** Conflict of interest, owner can manipulate/delete negative feedback

**Firestore Deployment:**
After updating `firestore.rules` or `firestore.indexes.json`:
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Or deploy both
firebase deploy --only firestore
```

**Review Display UX Best Practices:**
- ✅ **Initial Load:** 3 reviews (mobile-friendly, prevents overwhelming)
- ✅ **Load More Pattern:** "Xem thêm X đánh giá" button (better UX than infinite scroll)
- ✅ **Review Summary:** Display rating average + breakdown with progress bars
- ✅ **Sort/Filter:** Dropdown with options (newest, oldest, highest_rating, lowest_rating, most_helpful)
- ✅ **Expandable Content:** Long reviews (>200 chars) show preview with "Đọc thêm" button
- ✅ **Count Display:** Use `stats.totalReviews` NOT `reviews.length` (shows actual total)
- ✅ **Progress Indicator:** Show "Hiển thị X / Y đánh giá" for user awareness

**Review Interaction Features:**

**1. Helpful System (Vote system):**
- **API Endpoints:**
  - `POST /api/reviews/[id]/helpful` - Mark review as helpful
  - `DELETE /api/reviews/[id]/helpful` - Remove helpful vote
- **Collection:** `review_helpful` (userId, reviewId, createdAt)
- **Features:**
  - Prevent duplicate votes (1 vote/user/review)
  - Prevent self-voting
  - Atomic increment/decrement with `FieldValue.increment()`
  - Optimistic UI updates with rollback on error
  - Visual feedback (blue color + filled icon when voted)
- **Security:** Firestore rules enforce email verification + ownership

**2. Report System:**
- **API Endpoint:** `POST /api/reviews/[id]/report`
- **Collection:** `review_reports` (reviewId, placeId, reportedBy, reason, status)
- **Report Reasons:**
  - Spam/quảng cáo
  - Nội dung không phù hợp
  - Ngôn từ xúc phạm
  - Đánh giá giả mạo
  - Không liên quan
  - Lý do khác
- **Workflow:**
  - User submits report → status: 'pending'
  - **Reports go to MODERATORS ONLY** (NOT place owner)
  - Review author NOT notified until action taken
  - Moderators review in admin panel
  - Prevent duplicate reports (1 report/user/review)
  - **Rate limit: 3 reports/user/week** (prevent spam abuse)
- **Security:** Firestore rules enforce authentication + prevent abuse
- **Why NOT notify place owner:**
  - Review thuộc về reviewer, not place owner
  - Prevent conflict of interest
  - Moderators are neutral third-party

**Testing Checklist:**
- [ ] Anonymous reviews show gray avatar + "Ẩn danh" badge
- [ ] Public reviews show blue avatar + reviewer name
- [ ] Verified users show "Đã xác thực" badge
- [ ] Review title displays when provided
- [ ] Review content shows full multiline text
- [ ] Visit date displays with calendar icon
- [ ] Images gallery shows (max 4 + counter)
- [ ] Helpful button toggles state (gray ↔ blue)
- [ ] Helpful count updates correctly with optimistic UI
- [ ] Cannot vote on own review (shows error toast)
- [ ] Cannot vote without login (shows auth error)
- [ ] Report button opens modal with form
- [ ] Report submission successful → shows success toast
- [ ] Cannot submit duplicate reports
- [ ] Only 1 review per user per place allowed
- [ ] Review Summary shows correct average + breakdown
- [ ] Load More button shows remaining count correctly
- [ ] Sort dropdown changes review order
- [ ] Long reviews (>200 chars) show "Đọc thêm" button
- [ ] Expandable reviews toggle properly

## Review Report System (Moderator Workflow)

### Architecture Overview

**Purpose:** Allow users to report inappropriate reviews for moderator review

**Collections:**
- `review_reports` - Stores reports against reviews
- **NOT** for place reports (separate: `place_reports`)

**Workflow:**
```
User reports review → review_reports collection → Moderators review → Resolve/Remove/Dismiss
```

**Key Principle:** Reports go to **MODERATORS ONLY**, NOT to review author (conflict of interest)

---

### Critical Firestore Rules Pattern (LESSON LEARNED)

**❌ WRONG - Too Restrictive:**
```javascript
allow create: if emailVerified()
  && request.resource.data.keys().hasAll(['reviewId', 'placeId', 'reportedBy', 'reason', 'status'])
  && request.resource.data.status == 'pending';
```

**Problem:** `keys().hasAll([...])` checks if document has **EXACTLY** those keys and **NO OTHERS**
- Blocks any additional metadata fields (reporterName, details, createdAt, etc.)
- Causes: **500 Internal Server Error** on write attempts
- Hard to debug: Error is vague "permission denied"

**✅ CORRECT - Validate Individual Fields:**
```javascript
allow create: if emailVerified()
  && request.resource.data.reportedBy == request.auth.uid
  && request.resource.data.reviewId is string
  && request.resource.data.placeId is string
  && request.resource.data.reportedBy is string
  && request.resource.data.reason is string
  && request.resource.data.status == 'pending';
```

**Benefits:**
- Validates required fields exist AND correct type
- Allows extra metadata (reporterEmail, details, timestamps, etc.)
- More flexible for future schema evolution
- Clear error messages when validation fails

**Rule of Thumb:**
- Use `keys().hasAll([...])` ONLY when you need strict schema enforcement
- For user-generated content, validate individual fields instead
- Always allow audit trail fields (createdAt, updatedAt, metadata)

---

### Firestore Indexes Required

```json
{
  "collectionGroup": "review_reports",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
},
{
  "collectionGroup": "review_reports",
  "fields": [
    {"fieldPath": "reviewerId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
},
{
  "collectionGroup": "review_reports",
  "fields": [
    {"fieldPath": "reportedBy", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
},
{
  "collectionGroup": "review_reports",
  "fields": [
    {"fieldPath": "reason", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

---

### API Implementation

**File:** `src/app/api/reviews/[id]/report/route.ts`

**Key Features:**
1. **Rate Limiting:** 3 reports per user per week (moderators bypass)
2. **Duplicate Prevention:** Check existing pending reports
3. **Rich Context:** Store review preview, place name, reporter info
4. **Status:** Always `pending` on creation
5. **Moderator Target:** Reports go to moderators, NOT review author

**Schema:**
```typescript
{
  reviewId: string,           // Review being reported
  placeId: string,            // Place context
  placeName: string,          // For display
  reviewContent: string,      // First 200 chars preview
  reviewRating: number,       // Context
  reviewAuthorId: string,     // (NOT notified until action taken)
  reportedBy: string,         // Reporter user ID
  reporterName: string,       // For moderator reference
  reporterEmail: string,      // Contact if needed
  reason: string,             // spam|inappropriate|fake|offensive|irrelevant|other
  details: string,            // Optional explanation
  status: 'pending',          // pending|in_review|resolved|dismissed
  createdAt: string,          // ISO timestamp
  updatedAt: string           // ISO timestamp
}
```

---

### Admin UI (TODO - Not Yet Built)

**Location:** `/admin/moderation/review-reports` (to be created)

**Features Needed:**
1. **Tabs by Status:**
   - Pending (chờ xử lý)
   - In Review (đang điều tra)
   - Resolved (đã xử lý)
   - Dismissed (đã bỏ qua)

2. **Display Context:**
   - Original review content + rating + author
   - Place name + link to place page
   - Reporter info (name, email, role)
   - Report reason + details
   - Timestamp + SLA tracking

3. **Actions:**
   - **Claim** - Assign report to moderator (prevent conflicts)
   - **View Review** - Link to place page, scroll to review
   - **Resolve** - Mark resolved, keep review (false alarm)
   - **Remove Review** - Delete review from `place_reviews`
   - **Dismiss** - Reject report as invalid
   - **Escalate** - Moderator → Admin (complex cases)

4. **Filters:**
   - Report reason dropdown
   - Date range
   - Reporter name search
   - Reviewer name search

**Reuse Patterns From:** `src/app/admin/moderation/reports/page.tsx` (place reports)

---

### Notifications (TODO - Not Yet Implemented)

**Events to Notify:**
1. **New Report** → Moderators (all with role moderator/admin)
2. **Report Resolved** → Reporter (outcome explanation)
3. **Review Removed** → Review Author (reason + appeal link)

**Notification Types to Add:**
```typescript
REVIEW_REPORTED: {
  title: "Báo cáo đánh giá mới",
  body: "Có báo cáo mới về đánh giá tại {placeName}",
  actionUrl: "/admin/moderation/review-reports",
  priority: "high",
  channels: ["moderator", "admin"]
}

REVIEW_REPORT_RESOLVED: {
  title: "Báo cáo của bạn đã được xử lý",
  body: "Báo cáo về đánh giá tại {placeName} đã được giải quyết",
  actionUrl: "/places/{placeSlug}",
  priority: "medium",
  channels: ["in_app"]
}

REVIEW_REMOVED: {
  title: "Đánh giá của bạn đã bị xóa",
  body: "Đánh giá tại {placeName} vi phạm quy định cộng đồng",
  actionUrl: "/community-guidelines",
  priority: "high",
  channels: ["in_app", "email"]
}
```

---

### Common Pitfalls (LESSONS LEARNED)

**❌ Using `keys().hasAll()` for field validation:**
- **Problem:** Blocks additional metadata fields
- **Result:** 500 errors, hard to debug
- **Fix:** Validate individual fields with type checks

**❌ No admin UI for review reports:**
- **Problem:** Reports sit in DB unprocessed
- **Result:** User reports ignored, bad reviews stay up
- **Fix:** Build dedicated moderator interface

**❌ Notifying review author about reports:**
- **Problem:** Conflict of interest, manipulation risk
- **Result:** Authors delete negative reviews preemptively
- **Fix:** Only notify moderators until decision made

**❌ No rate limiting on reports:**
- **Problem:** Spam attacks, harassment
- **Result:** Report queue flooded
- **Fix:** 3 reports/week limit (moderators bypass)

**❌ Mixing review reports with place reports:**
- **Problem:** Different workflows, different contexts
- **Result:** Confusion in admin UI, wrong actions
- **Fix:** Separate collections, separate UIs

**❌ Generic error messages without debugging context:**
- **Problem:** `console.error('Error:', error)` provides no actionable info
- **Result:** Cannot debug where failure occurred or with what data
- **Fix:** Add detailed contextual logging:
  ```typescript
  console.log('[FEATURE] Attempting action:', { userId, itemId, action });
  await operation();
  console.log('[FEATURE] Success:', result.id);
  // In catch:
  console.error('[FEATURE] Error details:', {
    message: error instanceof Error ? error.message : 'Unknown',
    stack: error instanceof Error ? error.stack : undefined,
    context: { userId, itemId }
  });
  ```
- **Benefits:** Trace exact failure point, see input data, easier debugging

**❌ Assuming Firestore rules block Firebase Admin SDK:**
- **Problem:** Debugging Firestore rules when using `firebase-admin` package
- **Result:** Wasted time investigating rules when they weren't the issue
- **Key Fact:** **Firebase Admin SDK BYPASSES ALL Firestore security rules**
  - Client SDK (browser/app) → Rules enforced
  - Admin SDK (server/Cloud Functions) → Full access, NO rule checks
- **Fix:** If Admin SDK fails, check: network, credentials, data format, collection path - NOT rules
- **When to check rules:** Only when client-side operations fail (browser fetch, mobile SDK)

---

### Testing Checklist

- [ ] Report submission returns 200 OK (not 500)
- [ ] Report appears in `review_reports` collection
- [ ] Cannot submit duplicate report (same review + user)
- [ ] Rate limiting enforced (3 reports/week)
- [ ] Moderators bypass rate limit
- [ ] Report contains all context fields
- [ ] Review author NOT notified on report creation
- [ ] (Future) Moderator receives notification
- [ ] (Future) Can view/process in admin UI
- [ ] (Future) Can resolve/remove/dismiss
- [ ] (Future) Reporter notified of outcome

---

### Implementation Status

✅ **Completed:**
- API endpoint for creating reports
- Firestore rules (fixed from restrictive to flexible)
- Firestore composite indexes
- Rate limiting (3/week)
- Duplicate prevention
- Rich context storage

❌ **TODO:**
- Admin UI page (`/admin/moderation/review-reports`)
- API endpoints for moderator actions (claim, resolve, remove, etc.)
- Notification system integration
- Email notifications for resolved reports
- Appeal system for removed reviews

**Estimated Effort for Remaining Work:** 4-5 hours
- Admin UI: 2-3 hours (reuse patterns from place reports)
- API endpoints: 1 hour
- Notifications: 30 minutes
- Testing: 30-60 minutes
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

---

## AI Feature Development: Critical Lessons Learned

### ❌ Case Study: Itinerary AI Suggestions (January 2025)

**Status:** ⚠️ **DISABLED** - Feature implemented too early without sufficient data foundation

**Problem Summary:**
Built AI-powered itinerary suggestions using Firebase Genkit + Gemini 2.0 Flash, but launched before having critical mass of data required for quality AI recommendations.

**Root Causes:**

1. **Insufficient Data Foundation:**
   - AI requires minimum 300-500 published places for quality suggestions
   - Project only had 50-70 places at launch
   - Result: AI suggestions repetitive and low-quality, poor UX

2. **Premature Optimization:**
   - Built complex AI system (2,500+ lines) before validating manual workflow
   - Should have shipped simple manual builder first, measured adoption, then enhanced with AI
   - Tech-driven decision instead of user-driven

3. **Cost Modeling Blindness:**
   - Gemini 2.0 Flash costs: $0.15/1M input + $0.60/1M output tokens
   - Per-request cost: ~$0.004 (~10,000 VND)
   - At 20k requests/month = $82.20/month
   - No revenue model to justify AI costs at current scale

4. **Complexity vs Value:**
   - Added 2,500 lines of code to maintain
   - Required Genkit dependencies, Vertex AI setup, Blaze plan
   - Maintenance burden: AI model updates, prompt engineering, schema coupling
   - User value delta minimal compared to simple rule-based recommendations

**Technical Implementation (Archived for Future Reference):**

```
Architecture:
- UI: /itineraries/builder/page.tsx (909 lines)
- AI Flow: /ai/flows/itinerary-suggestions.ts (291 lines)
- Backend: /api/itineraries/route.ts (CRUD complete)
- Types: /lib/types/itineraries.ts (Zod schemas)
- Hooks: use-itineraries.ts, use-ai-suggestions.ts

AI Pipeline:
1. User preferences → Genkit flow
2. Query Firestore: places.where('status', '==', 'published')
3. Map interests → place types (beach→biển, food→ẩm-thực)
4. Gemini generates 8-12 suggestions with reasoning
5. Return structured output with priority + budget breakdown

Bottleneck:
- AI quality ∝ Data quantity
- 50 places × 3 regions = ~17 places/region
- Insufficient for 5-7 day itineraries
```

**Correct Approach Going Forward:**

**Phase 1: Manual Foundation (Current Priority)**
```typescript
// ✅ Simple manual builder with drag & drop
// ✅ "Quick Add" buttons on place cards
// ✅ Popular itineraries section (social proof)
// ✅ Template itineraries (admin curated)
// Focus 100% on growing published places to 300+
```

**Phase 2: Rule-Based Intelligence (When 150+ places)**
```typescript
// Rule-based suggestions (NO AI calls, $0 cost)
function generateSuggestions(preferences: UserPreferences) {
  const places = await queryPlaces({
    region: preferences.regions,
    type: mapInterestsToTypes(preferences.interests),
    status: 'published'
  });

  // Simple scoring: rating × popularity × type_match
  return places
    .map(p => ({ place: p, score: calculateScore(p, preferences) }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 10);
}

// Benefits: <100ms response, $0 cost, predictable, testable
// Trade-off: Less "AI magic" but 80% of value
```

**Phase 3: AI Enhancement (When 500+ places + Revenue)**
```typescript
// Re-enable AI only when:
// ✅ Published places ≥ 500
// ✅ Active users ≥ 10,000/month
// ✅ Monthly revenue > $1,000
// ✅ Dedicated engineer for AI/ML
// ✅ A/B testing shows AI > rule-based (conversion +20%)

// Then implement with optimizations:
// - Caching layer for common preferences
// - Hybrid: Rule-based + AI refinement
// - Cost monitoring with per-user budgets
```

**Decision Framework for Future AI Features:**

```
Should I build AI feature X?

1. DATA CHECK:
   ❓ Do I have ≥10× minimum viable data?
   → NO → ❌ DON'T BUILD (build data collection first)

2. MANUAL VALIDATION:
   ❓ Have I validated the workflow manually?
   → NO → ✅ BUILD MANUAL VERSION FIRST
   → YES → Can rule-based achieve 80% of value?
      → YES → ❌ DON'T USE AI (use rules instead)
      → NO → Continue to step 3

3. COST MODELING:
   ❓ Cost per request × expected volume × 10 < monthly budget?
   → NO → ❌ DEFER (too expensive for current scale)
   → YES → Continue to step 4

4. STRATEGIC FIT:
   ❓ Is AI THE core differentiator (not just "nice to have")?
   → NO → ❌ DEFER (focus on core features)
   → YES → Continue to step 5

5. MAINTENANCE:
   ❓ Do I have dedicated resources to maintain AI code?
   → NO → ❌ DEFER (will become tech debt)
   → YES → ✅ BUILD with metrics-driven approach

6. SUCCESS CRITERIA:
   Define BEFORE coding:
   - Conversion rate target (e.g., ≥30% of AI suggestions used)
   - Cost per conversion budget (e.g., <$0.50)
   - User satisfaction delta (e.g., NPS +10 vs manual)
   - Kill switch criteria (e.g., if cost/value ratio >2× for 2 months)
```

**Metrics to Track (If Re-enabling AI):**

```javascript
// Required analytics
const aiMetrics = {
  ai_suggestion_requested: number,      // Times users clicked AI button
  ai_suggestion_used: number,           // Suggestions actually added to itinerary
  ai_suggestion_abandoned: number,      // Clicked AI but didn't use results

  // Key ratios
  conversion_rate: used / requested,    // Target: ≥30%
  avg_suggestions_per_itinerary: number, // Target: ≥3
  cost_per_suggestion: number,          // Must be < revenue_per_itinerary

  // Business metrics
  ltv_ai_users: number,                 // Lifetime value of users who use AI
  ltv_manual_users: number,             // Lifetime value of manual users
  ai_value_delta: ltv_ai - ltv_manual   // Must be > AI costs
};

// Kill switch thresholds
if (conversion_rate < 0.30) disableAI("Low adoption");
if (cost_per_suggestion > revenue_per_itinerary) disableAI("Negative ROI");
if (ai_value_delta < ai_monthly_cost * 12) disableAI("Poor LTV impact");
```

**Key Takeaways:**

1. ✅ **Data First, AI Second:** Don't build AI on empty datasets
2. ✅ **Validate Manually:** Prove workflow value before automating
3. ✅ **Progressive Enhancement:** Manual → Rule-based → Hybrid → Full AI
4. ✅ **Cost Awareness:** Model economics at 1×, 10×, 100× scale
5. ✅ **Metrics-Driven:** Define success criteria before building
6. ✅ **Kill Switch Ready:** Be willing to disable if metrics fail

**Files Modified:**
- `/itineraries/builder/page.tsx` - AI features disabled via feature flag
- `/ai/flows/itinerary-suggestions.ts` - Archived, not deleted (for future)
- `/hooks/use-ai-suggestions.ts` - Disabled, fallback to manual

**Current Priorities (Q1-Q2 2025):**
1. Grow published places from 50 → 300+ (gamification, contests, partnerships)
2. Improve manual itinerary builder UX (templates, quick-add, drag-drop polish)
3. Build "Popular Itineraries" social proof section
4. Implement basic rule-based suggestions (no AI, $0 cost)

**Re-evaluation Checkpoint:** Q3 2025
- If published places ≥ 300 AND active users ≥ 5,000 → Prototype AI v2
- If data still insufficient → Continue manual focus

---

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

---

## Place Report → Action Workflow (2025-01-05)

### Implementation Overview

**Problem Solved:** Moderators could mark reports as "resolved" but had NO WAY to actually fix the reported place.

**Solution:** Atomic Report Resolution + Place Action workflow with 4 action types:

1. **Request Edit** - Place → `needs_revision`, owner gets edit request
2. **Suspend** - Place → `temporarily_suspended` (1-168 hours, auto-restore)
3. **Hide Permanent** - Place → `hidden` (admin can restore)
4. **Warning Only** - Owner gets warning, place stays `published`

### Key Components

**1. PlaceActionSelector Component** ([place-action-selector.tsx](src/components/admin/place-action-selector.tsx))
- Radio group dialog with 4 action choices
- Conditional duration input for suspend (1-168 hours)
- Full validation + user-friendly warnings

**2. API Endpoint** ([resolve-with-action/route.ts](src/app/api/admin/reports/[reportId]/resolve-with-action/route.ts))
- Atomic operation: Update report + Execute place action + Send notifications
- Transaction-safe with rollback on failure
- Comprehensive moderation logging

**3. Notification Integration** ([enhanced-notification-service.ts](src/lib/server/enhanced-notification-service.ts))
- `notifyPlaceSuspended()` - Email + in-app, urgent priority
- `notifyPlaceHidden()` - Email + in-app, urgent, includes appeal link
- `notifyPlaceWarning()` - In-app only, medium priority

**4. Firestore Configuration**
- **Indexes:** `suspension_schedules` (processed + expiresAt, placeId + processed)
- **Rules:** Admin/moderator only access, admin-only updates

### Critical Lessons Learned

**❌ MISTAKE: Incomplete Notification Service Implementation**

**What Happened:**
- Added `NotificationType` enums for PLACE_SUSPENDED/PLACE_HIDDEN/PLACE_WARNING
- Added templates to `NOTIFICATION_TEMPLATES` object
- **BUT FORGOT** to create static helper methods (`notifyPlaceSuspended`, etc.)
- API code used `RealtimeService.sendNotification()` directly instead

**Why This is Bad:**
1. **Inconsistency** - Mix of EnhancedNotificationService vs RealtimeService
2. **Missing Features** - No email, no priority, no retention policy
3. **Hard to Maintain** - Notification logic scattered across codebase
4. **Type Unsafe** - Manual object creation prone to typos

**Correct Pattern:**
```typescript
// ✅ GOOD - Centralized, typed, feature-complete
await EnhancedNotificationService.notifyPlaceSuspended(
  placeId,
  placeName,
  ownerId,
  reason,
  duration,
  expiresAt
);

// ❌ BAD - Direct RealtimeService, missing features
await RealtimeService.sendNotification(ownerId, {
  type: 'place_suspended',
  title: 'Địa điểm bị đình chỉ',
  body: `...`, // Manual string interpolation
  // Missing: email, priority, retention, template validation
});
```

**Prevention Strategy:**
1. **When adding new NotificationType:**
   - ✅ Add to `NotificationType` enum
   - ✅ Add template to `NOTIFICATION_TEMPLATES`
   - ✅ **Create static helper method** (DON'T FORGET THIS!)
   - ✅ Update any relevant UI to show new notification type
2. **Code Review Checklist:**
   - Search for `RealtimeService.sendNotification` in new code
   - Verify all notifications use EnhancedNotificationService
   - Check that static methods exist for all NotificationTypes

**Files Changed to Fix:**
- `src/lib/server/enhanced-notification-service.ts` - Added 3 static methods
- `src/app/api/admin/reports/[reportId]/resolve-with-action/route.ts` - Replaced RealtimeService calls

---

**❌ MISTAKE: Missing Firestore Indexes for New Collections**

**What Happened:**
- API creates `suspension_schedules` collection for auto-restore
- No indexes defined → Queries will fail in production
- No security rules → Potential unauthorized access

**Fix:**
- Added indexes for `suspension_schedules`: (processed, expiresAt), (placeId, processed)
- Added rules: Admin/moderator read+create, admin-only update/delete

**Prevention:**
- **Before deploying new collection:** Check `firestore.indexes.json` + `firestore.rules`
- **For scheduled/cron queries:** Always index on (processed/status + timestamp)

---

**❌ MISTAKE: reportTypeConfig Mismatch with ReportType**

**What Happened:**
- UI used `reportTypeConfig` with types: `safety_legal`, `misinformation`, `inappropriate_content`, `other`
- Type definition: `ReportType = 'incorrect_info' | 'inappropriate_content' | 'spam' | 'duplicate' | 'other'`
- TypeScript errors: `This comparison appears to be unintentional`

**Root Cause:**
- Copy-pasted config from example, didn't verify against actual schema
- No type enforcement on config object keys

**Fix:**
```typescript
// ❌ BAD - Keys don't match ReportType
const reportTypeConfig = {
  safety_legal: { ... },
  misinformation: { ... }
}

// ✅ GOOD - Keys match ReportType exactly
const reportTypeConfig: Record<ReportType, { ... }> = {
  incorrect_info: { ... },
  inappropriate_content: { ... },
  spam: { ... },
  duplicate: { ... },
  other: { ... }
}
```

**Prevention:**
- Use `Record<EnumType, ValueType>` for config objects
- TypeScript will enforce all enum values are present

---

**❌ MISTAKE: Notification URLs Pointing to Non-Existent Routes (2025-01-05)**

**What Happened:**
- User reported clicking notification → 404 error
- URL: `/contribute/my-drafts/{draftId}` (without `/moderation` suffix)
- Route structure:
  - ✅ `/contribute/my-drafts` - List page (has page.tsx)
  - ✅ `/contribute/my-drafts/[draftId]/moderation` - Moderation log (has page.tsx)
  - ✅ `/contribute/edit/[id]` - Edit page (has page.tsx)
  - ❌ `/contribute/my-drafts/[draftId]` - NO page.tsx → 404

**Affected Notifications:**
- `REVISION_REQUESTED` - "Yêu cầu sửa lại"
- `PLACE_REJECTED` - "Địa điểm bị từ chối"
- `EDIT_REQUESTED` - "Yêu cầu chỉnh sửa"
- `EDIT_REJECTED` - "Chỉnh sửa bị từ chối"

**Root Cause:**
- Copy-pasted notification templates without verifying routes exist
- Assumed `/my-drafts/{id}` would show detail view, but it's actually `/edit/{id}`
- No automated testing for notification actionUrl validity

**Fix:**
```typescript
// ❌ BAD - Points to non-existent route
actionUrl: '/contribute/my-drafts/{draftId}'

// ✅ GOOD - Points to actual edit page
actionUrl: '/contribute/edit/{draftId}'

// ✅ ALSO GOOD - Moderation log (for status updates)
actionUrl: '/contribute/my-drafts/{draftId}/moderation'
```

**Prevention Strategy:**
1. **Before adding notification template:**
   - Run `ls src/app/{path}` to verify route exists
   - Check for `page.tsx` in dynamic route folders
   - Test URL manually in browser
2. **Create route inventory:**
   ```typescript
   // src/lib/routes.ts
   export const ROUTES = {
     contribute: {
       myDrafts: '/contribute/my-drafts',
       edit: (id: string) => `/contribute/edit/${id}`,
       moderation: (id: string) => `/contribute/my-drafts/${id}/moderation`
     }
   };
   ```
3. **Use typed route helpers:**
   ```typescript
   actionUrl: ROUTES.contribute.edit('{draftId}')
   // TypeScript ensures route exists
   ```
4. **E2E testing for notifications:**
   - Click notification → Verify no 404
   - Check all `actionUrl` values in templates

**Files Changed:**
- `src/lib/server/enhanced-notification-service.ts` - Fixed 4 notification URLs (lines 226, 237, 248, 270)

---

### Deployment Checklist

**Before deploying to production:**

1. **Deploy Firestore Configuration:**
   ```bash
   firebase deploy --only firestore:indexes
   firebase deploy --only firestore:rules
   ```

2. **Verify Indexes Created:**
   - Go to Firebase Console → Firestore → Indexes
   - Check `suspension_schedules` indexes are active

3. **Test Notification Delivery:**
   - Create test report → Resolve with each action type
   - Verify owner receives notifications (check Realtime DB + email)
   - Verify notification templates render correctly

4. **Create Cron Job for Auto-Restore:**
   ```typescript
   // /api/cron/restore-suspended-places
   // Run every hour, query:
   // suspension_schedules.where('processed', '==', false)
   //                    .where('expiresAt', '<=', now)
   // For each: Update place status, mark schedule as processed
   ```

5. **Monitor Logs:**
   - Watch for `[RESOLVE-WITH-ACTION]`, `[SUSPEND]`, `[HIDE]`, `[WARNING]` prefixes
   - Alert on high error rates

---

## Common Pitfalls & Lessons Learned

### ❌ Emoji Spam trong Notification Text (2025-01-05)

**Problem:** Notification templates chứa emoji trong title và body, gây "spam icon thiếu chuyên nghiệp"

**Root Cause:**
- Copy-paste pattern từ ví dụ mẫu không cập nhật
- Không tuân theo best practices về professional notification design
- Emoji trong text + emoji icon = double spam, khó đọc

**Why Wrong:**
1. **Double visual noise:**
   - ❌ Icon: 📬 (emoji component) + Title: "📬 Địa điểm đã được tiếp nhận"
   - → 2 emoji cùng lúc, spam và redundant
2. **Accessibility issues:**
   - Screen readers đọc emoji text = confusing
   - Không nhất quán trên các device/OS
3. **Unprofessional appearance:**
   - Modern apps dùng icon components (Lucide, Heroicons)
   - Emoji = casual, không phù hợp business/professional context

**Solution Applied:**

**1. Loại bỏ toàn bộ emoji trong templates:**
```typescript
// BEFORE (BAD):
PLACE_RECEIVED: {
  title: '📬 Địa điểm đã được tiếp nhận',
  body: 'Địa điểm "{placeName}" của bạn đã được tiếp nhận và đang chờ kiểm duyệt',
  actionUrl: '/contribute/my-drafts/{draftId}/moderation'
}

// AFTER (GOOD):
PLACE_RECEIVED: {
  title: 'Địa điểm đã được tiếp nhận',
  body: '"{placeName}" đã gửi thành công. Chúng tôi sẽ kiểm duyệt trong vòng 24 giờ.',
  actionUrl: '/contribute/my-drafts/{draftId}/moderation',
  actionText: 'Xem tiến trình'
}
```

**2. Best Practices áp dụng:**
- ✅ **Title ngắn gọn** (5-8 từ) - Mô tả hành động chính
- ✅ **Body cụ thể** (10-15 từ) - Context + Next step rõ ràng
- ✅ **ActionURL thông minh** - Đưa user đến nơi họ cần hành động
- ✅ **ActionText rõ ràng** - CTA cụ thể (không generic "Xem chi tiết")
- ✅ **Tone phù hợp priority:**
  - Critical/Urgent: Trực tiếp, yêu cầu hành động ngay
  - High: Rõ ràng, cung cấp đủ thông tin
  - Medium/Low: Thông tin, không gây áp lực

**3. ActionURL Logic Improvements:**
```typescript
// User-facing results → Direct to outcome
PLACE_APPROVED: actionUrl: '/places/{slug}' // ✅ Xem place public
PLACE_REJECTED: actionUrl: '/contribute/edit/{draftId}' // ✅ Edit ngay

// Need action → Direct to action page
REVISION_REQUESTED: actionUrl: '/contribute/edit/{draftId}' // ✅ Sửa ngay
PLACE_HIDDEN: actionUrl: '/support/appeal?placeId={placeId}&reportId={reportId}' // ✅ Khiếu nại

// Monitoring → Direct to tracking
PLACE_IN_REVIEW: actionUrl: '/contribute/my-drafts/{draftId}/moderation' // ✅ Theo dõi

// Admin actions → Direct to management
CONTENT_REPORTED: actionUrl: '/admin/moderation/reports/{reportId}' // ✅ Xem báo cáo
```

**Notification Text Examples (Improved):**

| Type | Before (Emoji Spam) | After (Professional) |
|------|---------------------|----------------------|
| PLACE_APPROVED | ✅ Địa điểm đã được phê duyệt<br>Địa điểm "{placeName}" của bạn đã được phê duyệt và xuất bản | Địa điểm đã được công khai<br>"{placeName}" đã được phê duyệt. Cảm ơn bạn đã đóng góp cho cộng đồng! |
| PLACE_REJECTED | ❌ Địa điểm bị từ chối<br>Địa điểm "{placeName}" bị từ chối. Lý do: {reason} | Địa điểm cần chỉnh sửa<br>"{placeName}" chưa đạt tiêu chuẩn. Lý do: {reason} |
| PLACE_SUSPENDED | ⏸️ Địa điểm bị đình chỉ tạm thời<br>Địa điểm "{placeName}" đã bị đình chỉ tạm thời do: {reason} | Địa điểm bị đình chỉ tạm thời<br>"{placeName}" bị đình chỉ {duration}h do vi phạm: {reason}. Sẽ tự động khôi phục lúc {expiresAt}. |
| CLAIM_EXPIRING | ⏰ Claim sắp hết hạn<br>Claim "{contentName}" sẽ hết hạn trong {hoursRemaining}h | Tiếp nhận sắp hết hạn<br>"{contentName}" cần xử lý trong {hoursRemaining} giờ nữa |

**Prevention Strategy:**
1. ✅ **Icon config centralized** - Use `notification-config.tsx` for visual icons
2. ✅ **Text templates clean** - No emoji in title/body
3. ✅ **Research UX best practices** - Follow modern notification design patterns
4. ✅ **User-centric ActionURL** - Think "Where does user need to go next?"
5. ✅ **Code review checklist:** Check for emoji in any new notification template

**Files Changed:**
- `src/lib/server/enhanced-notification-service.ts` - Rewrote 30+ notification templates (lines 166-461)
- `src/lib/notification-config.tsx` - Professional Lucide icon mapping (NEW)
- `src/components/notifications/notification-bell.tsx` - Updated to use icon config
- `src/app/notifications/page.tsx` - Updated to use icon config

**Result:**
- ✅ Clean, professional notification text
- ✅ Consistent icon system (Lucide components only)
- ✅ Better UX with smart ActionURL routing
- ✅ Improved accessibility (no emoji text for screen readers)

---

### ❌ Nhầm lẫn giữa Content Moderation vs Report Handling (2025-01-05)

**Problem:** Dùng `AdminApproveDialog` và action `'approve'` cho báo cáo địa điểm

**Root Cause:**
- Không phân biệt rõ 2 workflows khác nhau:
  - **Content Moderation** = Duyệt/Từ chối NỘI DUNG
  - **Report Handling** = Xử lý KHIẾU NẠI về nội dung

**Why Wrong:**
1. **Approve/Reject ≠ Resolve/Dismiss**
   - Approve = Nội dung hợp lệ → Công khai (cho địa điểm, bài viết, review)
   - Resolve = Khiếu nại hợp lệ → Đã xử lý vấn đề (sửa địa điểm, ẩn hình ảnh vi phạm)
   - Reject = Nội dung vi phạm → Ẩn/Xóa
   - Dismiss = Khiếu nại sai → Bác bỏ (không hợp lệ)

2. **UI Text sai nghiêm trọng:**
   - ❌ "Phê duyệt báo cáo về 'Ba Na Hills' và công khai cho người dùng"
   - → Vô nghĩa! Báo cáo là nội bộ, không có "công khai báo cáo"
   - ✅ "Xác nhận đã xử lý xong báo cáo về 'Ba Na Hills'? Ghi chú hành động đã thực hiện"

3. **Logic nghịch lý:**
   - Approve báo cáo = Resolved = Báo cáo HỢP LỆ
   - → Nghĩa là ĐỊA ĐIỂM có VẤN ĐỀ, KHÔNG phải "phê duyệt địa điểm"

**Solution Applied:**

**1. Tạo components riêng biệt cho Report Handling:**
```typescript
// NEW: src/components/admin/confirmation-dialogs.tsx

// ✅ Content Moderation (places, reviews, posts)
AdminApproveDialog  // "Phê duyệt ... và công khai cho người dùng?"
AdminRejectDialog   // "Từ chối ... Nội dung sẽ bị ẩn"

// ✅ Report Handling (complaints about content)
AdminResolveReportDialog  // "Xác nhận đã xử lý xong báo cáo? Ghi chú hành động..."
AdminDismissReportDialog  // "Xác nhận báo cáo không hợp lệ? Lý do bác bỏ..."
```

**2. Fix API status mapping:**
```typescript
// OLD (WRONG):
const statusMapping = {
  'approve': 'resolved',  // ❌ Không có approve cho report
  'reject': 'dismissed',  // ❌ Reject ≠ Dismiss
  'escalate': 'escalated' // ❌ Status không tồn tại
};

// NEW (CORRECT):
const statusMapping = {
  'resolve': 'resolved',   // ✅ Giải quyết khiếu nại
  'dismiss': 'dismissed',  // ✅ Bác bỏ khiếu nại
  'escalate': 'in_review'  // ✅ Chuyển Admin (giữ in_review + flag escalated)
};
```

**3. Thống nhất Type Definitions:**
```typescript
// OLD: Mâu thuẫn giữa code và type
type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed'
// But API uses: status = 'in_review' ← không match!

// NEW: Nhất quán
type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'dismissed'
```

**Correct Workflow Patterns:**

```typescript
// === CONTENT MODERATION (địa điểm, review, bài viết) ===
User submit content → Moderator review
    ↓
├─ APPROVE → status: published, visible: true
│   Dialog: "Phê duyệt ... và công khai?"
│   Component: AdminApproveDialog
│
└─ REJECT → status: rejected, visible: false
    Dialog: "Từ chối ... Lý do?"
    Component: AdminRejectDialog

// === REPORT HANDLING (khiếu nại về content) ===
User report problem → Moderator investigate
    ↓
├─ RESOLVE → status: resolved (Báo cáo hợp lệ → Đã fix)
│   Dialog: "Xác nhận đã xử lý? Ghi chú hành động..."
│   Component: AdminResolveReportDialog
│
├─ DISMISS → status: dismissed (Báo cáo sai → Bác bỏ)
│   Dialog: "Xác nhận báo cáo không hợp lệ? Lý do..."
│   Component: AdminDismissReportDialog
│
└─ ESCALATE → status: in_review + escalated: true
    Dialog: "Chuyển lên Admin? Lý do..."
    Component: AdminEscalateDialog
```

**Prevention Strategy:**
1. ✅ **Tách biệt components** cho 2 workflows khác nhau
2. ✅ **Naming convention rõ ràng:**
   - `Approve/Reject` = Content moderation
   - `Resolve/Dismiss` = Report handling
3. ✅ **Review UI text:** Kiểm tra ngữ nghĩa có logic không
4. ✅ **Type safety:** Action types phải match workflow

**Files Changed:**
- [src/lib/types/reports.ts](src/lib/types/reports.ts)
- [src/components/admin/confirmation-dialogs.tsx](src/components/admin/confirmation-dialogs.tsx)
- [src/app/api/admin/reports/[reportId]/route.ts](src/app/api/admin/reports/[reportId]/route.ts)
- [src/hooks/use-admin-reports.ts](src/hooks/use-admin-reports.ts)
- [src/app/admin/moderation/reports/page.tsx](src/app/admin/moderation/reports/page.tsx)

---

### ❌ Missing Required Props in Component Usage (2025-01-05)

**Problem:** Place report modal failed with `TypeError: onSubmit is not a function`

**Root Cause:**
- `ReportModal` component requires `onSubmit` callback prop
- Component was rendered at [place-detail-content.tsx:1313-1318](src/components/place-detail-content.tsx#L1313-L1318) WITHOUT this prop
- TypeScript didn't catch this at build time (prop types were correct but usage wasn't enforced)

**Error Log:**
```
Error submitting report: TypeError: onSubmit is not a function
    at handleSubmit (src/components/modals/report-modal.tsx:56:13)
```

**Solution Applied:**
```typescript
// ✅ CORRECT: Added missing handler function
const handleReportSubmit = async (reportData: ReportFormData) => {
  try {
    const result = await callApi(`/places/${place.id}/reports`, {
      method: 'POST',
      body: JSON.stringify(reportData)
    })

    if (!result.success) throw new Error(result.error || 'Failed to submit report')

    toast({
      title: "Gửi báo cáo thành công",
      description: result.message || "Chúng tôi sẽ xem xét trong thời gian sớm nhất.",
    })

    setShowReportModal(false)
  } catch (error: any) {
    toast({
      title: "Lỗi",
      description: error.error || error.message || "Không thể gửi báo cáo. Vui lòng thử lại.",
      variant: "destructive",
    })
  }
}

// ✅ CORRECT: Wire up the prop
<ReportModal
  isOpen={showReportModal}
  onClose={() => setShowReportModal(false)}
  onSubmit={handleReportSubmit}  // ← Fixed: Added missing prop
  placeId={place.id}
  placeName={place.name}
/>
```

**Prevention Strategies:**
1. ✅ **Always check component prop requirements before usage** - Review component interface/props
2. ✅ **Follow existing patterns** - Look for similar components (e.g., `ReviewModal` at line 568 had working implementation)
3. ✅ **Use `callApi()` helper** - From `@/lib/client/api` for authenticated requests (auto-handles auth tokens)
4. ✅ **Complete error handling pattern:**
   ```typescript
   const handleSubmit = async (data) => {
     try {
       const result = await callApi('/endpoint', { method: 'POST', body: JSON.stringify(data) })
       if (!result.success) throw new Error(result.error)
       toast({ success message })
       closeModal()
     } catch (error) {
       toast({ error message, variant: "destructive" })
     }
   }
   ```
5. ✅ **Test before committing** - Run `npm run build` to catch TypeScript errors early

**Files Changed:**
- [place-detail-content.tsx](src/components/place-detail-content.tsx) - Added `handleReportSubmit` function and wired `onSubmit` prop

**Related Patterns:**
- Place report API: [/api/places/[id]/reports/route.ts](src/app/api/places/[id]/reports/route.ts)
- Review modal (working example): [place-detail-content.tsx:568-584](src/components/place-detail-content.tsx#L568-L584)
---

### ❌ Lesson 4: Missing Field Cleanup on Status Transitions (2025-01-06)

**Problem:** Reports marked as `resolved` still displayed "Đang được điều tra bởi: [Moderator]" with stale SLA countdown in UI.

**Root Cause:**
- When resolving/dismissing reports, APIs updated `status` field but **did NOT delete claim-related fields** (`reviewerInfo`, `claimedAt`)
- UI rendered stale data even though report was no longer `in_review`
- Similar to race condition pattern (CLAUDE.md:499-592) but for manual actions instead of cron jobs

**Evidence:**
```typescript
// ❌ BAD - resolve-with-action/route.ts:88-101
await adminDb.collection('place_reports').doc(reportId).update({
  status: 'resolved',  // Changed status
  reviewedBy: user.id,
  reviewedAt: now,
  // BUT reviewerInfo, claimedAt NOT deleted → Stale UI data
});

// UI still shows (page.tsx:547)
{report.reviewerInfo && (  // ❌ Never cleared on resolve!
  <div>Đang được điều tra bởi: {report.reviewerInfo.name}</div>
  <div>Còn {slaHours}h</div>  // Stale countdown
)}
```

**Correct Pattern:**

**1. API - Clean up claim fields when leaving `in_review` state:**
```typescript
import { FieldValue } from 'firebase-admin/firestore';

// ✅ CORRECT - Delete fields on status exit
await adminDb.collection('place_reports').doc(reportId).update({
  status: 'resolved',
  reviewedBy: user.id,
  reviewedAt: now,
  reviewNotes: action.notes,
  updatedAt: now,
  // ✅ Clear claim-related fields (prevent stale UI)
  reviewerInfo: FieldValue.delete(),
  claimedAt: FieldValue.delete()
});
```

**2. UI - Defensive rendering with status check:**
```typescript
// ✅ CORRECT - Only show for in_review status
{report.status === 'in_review' && report.reviewerInfo && (
  <div className="bg-blue-50 rounded-lg p-3">
    <div>Đang được điều tra bởi: {report.reviewerInfo.name}</div>
    {report.claimedAt && <div>Tiếp nhận lúc: {formatDate(report.claimedAt)}</div>}
  </div>
)}
```

**Prevention Strategies:**

1. ✅ **Field Cleanup Rule:** When transitioning OUT of a state, delete that state's specific fields
   ```typescript
   // Pattern for all status transitions:
   if (newStatus !== 'claimed') {
     updateData.claimExpiresAt = FieldValue.delete();
     updateData.claimedBy = FieldValue.delete();
     updateData.claimedAt = FieldValue.delete();
   }

   if (newStatus !== 'in_review') {
     updateData.reviewerInfo = FieldValue.delete();
     updateData.claimedAt = FieldValue.delete();
   }
   ```

2. ✅ **UI Defensive Checks:** Always check status BEFORE rendering state-specific data
   ```typescript
   // ❌ BAD - Trusts field existence
   {item.reviewerInfo && <ReviewerDisplay />}

   // ✅ GOOD - Checks status first
   {item.status === 'in_review' && item.reviewerInfo && <ReviewerDisplay />}
   ```

3. ✅ **Checklist for State Transitions:**
   - [ ] Status field updated? ✅
   - [ ] Previous state fields deleted? ✅
   - [ ] New state fields added? ✅
   - [ ] UI checks status before rendering? ✅
   - [ ] Tested transition in both directions? ✅

4. ✅ **Common State-Specific Fields to Clean:**
   - `in_review` → `reviewerInfo`, `claimedAt`, `reviewNotes`
   - `claimed` → `claimExpiresAt`, `claimedBy`, `claimedAt`
   - `suspended` → `suspendedAt`, `suspensionReason`, `suspensionExpiresAt`
   - `escalated` → `escalated`, `escalatedAt`, `escalatedBy`, `escalatedReason`

**Why This Matters:**

**Stale Data Symptoms:**
- ❌ Resolved reports showing "Đang được điều tra bởi..."
- ❌ SLA countdown on completed items
- ❌ Lock icons on available reports
- ❌ Incorrect moderator workload counts

**Impact:**
- Confusing UX (users see contradictory statuses)
- Broken analytics (workload metrics include stale claims)
- Wasted time debugging "ghost" states

**Files Fixed (2025-01-06):**
- `src/app/api/admin/reports/[reportId]/resolve-with-action/route.ts` - Added `FieldValue.delete()` for claim fields (lines 103-104)
- `src/app/api/admin/reports/[reportId]/route.ts` - Added cleanup for resolve/dismiss actions (lines 96-99)
- `src/app/admin/moderation/reports/page.tsx` - Added `status === 'in_review'` check (line 547)

**Related Patterns:**
- Cron Job Race Conditions (CLAUDE.md:499-592) - Use transactions + field deletion
- Moderation Queue State Machine (CLAUDE.md:85-126) - Always clean up on state exit

**Key Takeaway:**
Status transitions are **TWO-WAY operations**: Update new state AND **delete old state fields**. UI should never trust field existence alone - always verify status first.

---

## Place-Specific AI Chatbot Implementation (January 2025)

### ✅ Feature Successfully Implemented

**Purpose:** Provide instant, context-aware AI assistance for users on place detail pages

**Architecture:**

```
Place Detail Page → PlaceChatWidget (floating button)
                           ↓
                  POST /api/ai/place-chat
                  - Extract placeId from props  
                  - Verify auth + rate limiting
                           ↓
               Genkit Flow (place-chat-flow.ts)
                  1. Fetch place data from Firestore
                  2. Build context-rich prompt
                  3. Gemini 2.5 Flash generation
                  4. Return response + token tracking
                           ↓
                  Session Storage (client-side)
                  - Persist chat history per place
                  - Survive page refresh
                           ↓
                  Analytics Logging (ai_chat_logs)
                  - Track usage, costs, response times
```

**Files Created:**
- `src/ai/flows/place-chat-flow.ts` - Context-aware AI flow
- `src/app/api/ai/place-chat/route.ts` - API with rate limiting
- `src/hooks/use-place-chat.ts` - React hook with session persistence
- `src/components/place-chat-widget.tsx` - Floating chat UI
- `src/components/place-detail-content.tsx` - Integration (added PlaceChatWidget)

**Key Features:**

1. **Context Injection:**
   ```typescript
   // Build structured context from place data
   const placeContext = `
   THÔNG TIN ĐỊA ĐIỂM:
   - Tên: ${place.name}
   - Loại: ${getPlaceTypeLabel(place.type)}
   - Giờ mở cửa: ${place.openingHours || 'Chưa cập nhật'}
   - Giá vé: ${place.entryFee || 'Chưa cập nhật'}
   
   QUY TẮC TRẢ LỜI:
   1. CHỈ dựa vào thông tin trên
   2. Nếu không có data → "Tôi chưa có dữ liệu..."
   3. Không bịa đặt hoặc đoán mò
   `;
   ```

2. **Rate Limiting:**
   - Free tier: 10 Q&A per day per place per user
   - Tracks usage in `ai_chat_logs` collection
   - Returns remaining quota in API response

3. **Session Persistence:**
   - Client-side session storage (no server state)
   - Key: `place_chat_${placeId}`
   - Survives page refresh, cleared on browser close

4. **Cost Tracking:**
   - Logs every interaction with tokens + cost
   - Gemini 2.5 Flash: $0.15/1M input, $0.60/1M output
   - Estimated cost: ~$0.00026 per chat turn (~650 VND)

5. **Quick Questions UX:**
   - Context-aware suggestions based on place type
   - Biển: "Có chỗ để đồ và tắm rửa không?"
   - Núi: "Độ khó của tuyến đường thế nào?"
   - Văn hóa: "Giờ mở cửa và giá vé?"

**Cost Analysis:**

| Users | Avg Q&A/user | Total turns | Cost/month |
|-------|--------------|-------------|------------|
| 1,000 | 10 | 10,000 | $2.60 |
| 10,000 | 10 | 100,000 | $26.00 |

**Why This Works (vs Itinerary AI):**

| Aspect | Itinerary AI (Failed) | Place Chat (Success) |
|--------|----------------------|----------------------|
| Data Dependency | Needs 300+ places | Works with 1 place |
| Cost per Use | $0.004/request | $0.00026/turn |
| User Value | Nice-to-have | Solves real problem |
| Quality | Poor (sparse data) | Good (rich context) |
| Implementation | 2,500 LOC | ~1,000 LOC |

**Monitoring Dashboard Queries:**

```javascript
// Daily metrics
const metrics = {
  total_conversations: COUNT(DISTINCT sessionId),
  total_turns: COUNT(*),
  avg_turns_per_session: total_turns / total_conversations,
  daily_cost: SUM(cost),
  cost_per_user: SUM(cost) / COUNT(DISTINCT userId),
  top_places: SUM(cost) GROUP BY placeId ORDER BY DESC LIMIT 10,
  avg_response_time: AVG(responseTime),
  error_rate: COUNT(errors) / COUNT(*)
};

// Alerts
if (daily_cost > $10) alert("High AI cost");
if (error_rate > 0.05) alert("Quality issue");
if (avg_turns_per_session < 2) alert("Low engagement");
```

**Success Metrics:**

- ✅ Avg 3+ Q&A per session = users find value
- ✅ Error rate <2% = quality stable
- ✅ Cost per user < revenue per user = ROI positive
- ✅ Bounce rate <30% = sticky feature

**Best Practices Applied:**

1. ✅ **Context is King:** AI quality depends on structured, accurate context
2. ✅ **Rate Limiting Essential:** Prevent abuse + control costs
3. ✅ **Session Storage >> Server State:** Client-side = no DB overhead
4. ✅ **Cost Monitoring from Day 1:** Log every interaction
5. ✅ **Quick Questions UX:** Reduce friction, guide conversations
6. ✅ **Factual Mode:** Low temp (0.3) + strict prompt = accurate
7. ✅ **Graceful Degradation:** "I don't have data" > hallucination

**Future Enhancements (Phase 2):**

1. Streaming responses (real-time text generation)
2. Multi-modal (image analysis)
3. RAG with reviews (include user reviews in context)
4. Voice input (speech-to-text for mobile)
5. Proactive suggestions ("Users also asked...")
6. Premium tier (unlimited Q&A for paid users)

**Deployment Checklist:**

- [x] Implement core functionality
- [x] Add rate limiting
- [x] Session persistence
- [x] Cost tracking
- [ ] A/B test (50% users) for 2 weeks
- [ ] Monitor costs for 1 week
- [ ] Gather user feedback (NPS survey)
- [ ] Optimize prompts based on common questions
- [ ] Full rollout if metrics positive

**Key Takeaway:**

AI features succeed when solving **specific, scoped problems** with **rich context** and **clear user value**. Place chat works because:
- One place at a time (not entire database)
- 100+ fields per place (rich context)
- Answers specific questions (not vague planning)
- Incremental cost per question (not bulk generation)
- Immediate value (instant answers vs future trips)

---

### ❌ Genkit API Version Mismatch & Missing Firestore Indexes (2025-01-05)

**Problem 1:** Place AI Chat failed with `TypeError: result.text is not a function`

**Root Cause:**
- Genkit API changes between versions - some return `.text` property, others return `.text()` method
- Code assumed `.text()` method would always exist
- No defensive type checking

**Evidence:**
```typescript
// Bug in place-chat-flow.ts:99
const responseText = result.text(); // ❌ Crashes when .text is property

// Working code in chat-flow.ts:47
const responseText = typeof result.text === 'function'
  ? result.text()
  : result.text || result.output?.text || 'No response received'; // ✅ Defensive
```

**Solution:**
```typescript
// Extract response text safely (Genkit API may return .text property or .text() method)
const responseText = typeof result.text === 'function'
  ? result.text()
  : result.text || result.output?.text || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.';
```

**Problem 2:** Rate limit query failed with missing Firestore index error

**Root Cause:**
- Wrote compound query `ai_chat_logs.where('placeId', '==', x).where('userId', '==', y).where('timestamp', '>=', z)`
- Did NOT add composite index to `firestore.indexes.json` BEFORE deploying
- Firebase Admin SDK bypasses rules but NOT index requirements

**Error:**
```
The query requires an index:
https://console.firebase.google.com/v1/r/project/vietexplore-ai/firestore/indexes?create_composite=...
```

**Solution:**
```json
// Added to firestore.indexes.json
{
  "collectionGroup": "ai_chat_logs",
  "queryScope": "COLLECTION",
  "fields": [
    {"fieldPath": "placeId", "order": "ASCENDING"},
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "timestamp", "order": "ASCENDING"}
  ],
  "density": "SPARSE_ALL"
}
```

**Problem 3:** Chat widget UI used dark mode classes when project enforces light-only

**Root Cause:**
- Copy-pasted generic chat widget template without checking project design system
- Used `dark:bg-gray-900`, `dark:text-white` classes
- Project has `color-scheme: light only` in `globals.css:8`
- Used generic sky/teal gradient instead of brand green/emerald

**Evidence from Design System (globals.css):**
```css
html { color-scheme: light only; } /* Line 8 - ENFORCED */

:root {
  --primary: #16A34A;        /* Leaf green - lá dong bánh chưng */
  --secondary: #F59E0B;      /* Golden yellow - đậu xanh */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-backdrop: blur(16px);
}
```

**Solution Applied:**
- ❌ Removed ALL `dark:*` classes (100+ instances)
- ✅ Changed gradient: `from-sky-500 to-teal-500` → `from-green-600 to-emerald-500`
- ✅ Applied glassmorphism: `bg-white/80 backdrop-blur-sm`
- ✅ Used brand colors: green for primary, amber for badges
- ✅ Matched existing card styling from place-detail-content.tsx

**Before (Generic):**
```typescript
className="bg-gradient-to-r from-sky-500 to-teal-500"
className="bg-white dark:bg-gray-900"
className="text-gray-600 dark:text-gray-400"
```

**After (Vietnamese Design System):**
```typescript
className="bg-gradient-to-br from-green-600 to-emerald-500"
className="bg-white/80 backdrop-blur-sm"
className="text-gray-600"
```

**Prevention Strategies:**

1. ✅ **Genkit API:** Always use defensive `typeof` checks for method vs property
   ```typescript
   const text = typeof result.text === 'function' ? result.text() : result.text || fallback;
   ```

2. ✅ **Firestore Indexes:** Write index FIRST, then write query code
   - Pattern: `firestore.indexes.json` → Deploy → Write query
   - Never assume compound queries work without indexes
   - Even Admin SDK needs indexes (bypasses rules only, not indexes)

3. ✅ **UI Design System:** Check `globals.css` BEFORE implementing any UI component
   - Search for `color-scheme` enforcement
   - Check CSS variables (`:root`)
   - Find similar components and reuse their styling patterns
   - Glassmorphism = `bg-white/80 backdrop-blur-sm border-white/20`

4. ✅ **Testing Checklist:**
   - [ ] Test AI response extraction (mock both `.text` and `.text()`)
   - [ ] Run query locally BEFORE production (catches index errors)
   - [ ] Visual test in light mode ONLY (no dark mode fallbacks)
   - [ ] Compare new component colors with existing pages

**Files Changed:**
- `firestore.indexes.json` - Added `ai_chat_logs` composite index (lines 805-823)
- `src/ai/flows/place-chat-flow.ts:99` - Added defensive text extraction
- `src/components/place-chat-widget.tsx` - Full redesign (Vietnamese green theme, glassmorphism, removed dark mode)

**Deployment:**
```bash
firebase deploy --only firestore:indexes
# Wait for index to build before testing queries
```

**Result:**
- ✅ AI responses render correctly (handles both API versions)
- ✅ Rate limiting works (no index errors)
- ✅ UI matches project design system (Vietnamese green + glassmorphism)
- ✅ Professional appearance (no dark mode artifacts)

---

### ❌ Lesson 4: Outdated Documentation - Web Search Grounding Implementation (2025-01-06)

**Problem:** AI chatbot responded "Tôi chưa có dữ liệu" for common questions because database lacked fields like `bestTimeToVisit`, `openingHours`, etc.

**User Request:**
1. Priority: Use database content first
2. Fallback: Google Search when database lacks data
3. Display citation sources from web search results

**Initial Mistake:** Relied on `genkit-grounding-guide.md` without verification

**Discovery:**
- Document claimed Firebase Genkit lacks Google Search grounding support
- **REALITY:** `@google/genai` package (v1.15.0, already installed) has FULL support
- Gemini 2.5 Flash model includes `googleSearch` tool with complete citation metadata

**Correct Implementation Pattern:**

**1. Dual-Path AI Architecture:**
```typescript
// src/ai/flows/place-chat-flow.ts

// Detection function - When to use web search
function needsWebSearch(place: any, question: string): boolean {
  const questionLower = question.toLowerCase();

  // Photography timing
  if ((questionLower.includes('thời gian') || questionLower.includes('chụp ảnh'))
      && !place.bestTimeToVisit && !place.bestSeason) {
    return true;
  }

  // Operating hours
  if ((questionLower.includes('giờ mở cửa') || questionLower.includes('mở cửa'))
      && !place.openingHours) {
    return true;
  }

  // Entry fees
  if ((questionLower.includes('giá vé') || questionLower.includes('phí'))
      && !place.entryFee) {
    return true;
  }

  return false;
}

// Citation extraction from groundingMetadata
function extractCitations(metadata: any): Citation | null {
  if (!metadata?.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  return {
    sources: metadata.groundingChunks.map((chunk: any, index: number) => ({
      index: index + 1,
      title: chunk.web?.title || 'Nguồn không rõ',
      url: chunk.web?.uri || '#',
      snippet: chunk.web?.snippet || ''
    })),
    searchQueries: metadata.webSearchQueries || [],
    supports: metadata.groundingSupports || []
  };
}
```

**2. Database-First Path (No Web Search):**
```typescript
if (!needsWebSearch(place, message)) {
  // Use Firebase Genkit flow (existing implementation)
  const result = await prompt({
    placeData,
    history,
    message
  });

  return {
    response: extractResponseText(result),
    source: 'database',
    citations: null,
    tokensUsed: result.usage
  };
}
```

**3. Web Search Fallback (With Citations):**
```typescript
// Use @google/genai directly
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

const searchResult = await genAI.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: promptText,
  config: {
    tools: [{ googleSearch: {} }],  // Enable Google Search
    temperature: 0.3,
    maxOutputTokens: 500
  }
});

const citations = extractCitations(searchResult.groundingMetadata);

return {
  response: searchResult.text,
  source: 'web_search',
  citations: citations,  // Full citation data
  tokensUsed: searchResult.usage
};
```

**4. Frontend Type Definitions:**
```typescript
// src/hooks/use-place-chat.ts

export interface Citation {
  sources: Array<{
    index: number;
    title: string;
    url: string;
    snippet?: string;
  }>;
  searchQueries: string[];
  supports?: any[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'database' | 'web_search';
  citations?: Citation | null;
}
```

**5. Citation UI Component:**
```tsx
// src/components/place-chat-widget.tsx

{msg.role === 'assistant' && msg.citations && msg.citations.sources?.length > 0 && (
  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <ExternalLink className="w-4 h-4 text-green-600" />
      <span className="text-xs font-semibold text-green-700">
        Nguồn trích dẫn từ Google Search
      </span>
    </div>
    <div className="space-y-1">
      {msg.citations.sources.map((source, idx) => (
        <a
          key={idx}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-green-700 hover:text-green-800 hover:underline"
          title={source.snippet}
        >
          <span className="font-medium">[{source.index}]</span> {source.title}
        </a>
      ))}
    </div>
  </div>
)}

{/* Source badge in timestamp */}
{msg.role === 'assistant' && msg.source === 'web_search' && (
  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
    Web Search
  </span>
)}
```

**Key Lessons Learned:**

1. **❌ NEVER trust documentation without verification**
   - Always web search for latest official documentation
   - Technology changes rapidly (especially AI APIs)
   - Verify publication date and source authority

2. **✅ Research Process:**
   - Search: "google gemini 2.5 flash grounding 2025"
   - Verify: Check official Google AI documentation
   - Compare: Installed package versions vs documentation
   - Test: Validate API shape matches expectations

3. **✅ Dual-Path Strategy for Missing Data:**
   - Detect gaps in database with keyword matching
   - Fallback to external search when needed
   - Preserve database responses when sufficient
   - Always indicate source to user (transparency)

4. **✅ Citation Implementation:**
   - Extract from `groundingMetadata.groundingChunks`
   - Map to user-friendly format (index, title, URL, snippet)
   - Display clickable links in UI
   - Include search queries for context

5. **✅ API Integration Pattern:**
   - Use Firebase Genkit for database-driven responses
   - Use `@google/genai` directly for web search + grounding
   - Don't mix frameworks - each for specific use case
   - Extract tokens/usage from both for cost tracking

**Common Pitfalls:**

- ❌ **Assuming Genkit = Google AI** - Different packages, different capabilities
- ❌ **No detection logic** - Always web search = wasted API calls + slow responses
- ❌ **Missing citation UI** - Users don't know where info came from (trust issue)
- ❌ **No source badge** - Users can't tell database vs web search responses
- ❌ **Trusting old guides** - AI API landscape changes monthly

**Testing Scenarios:**

1. **Database-first test:**
   - Question: "Địa điểm này ở đâu?" (location data exists in DB)
   - Expected: Response without citations, no "Web Search" badge
   - Verify: No `groundingMetadata` in logs

2. **Web search test:**
   - Question: "Thời gian nào đẹp nhất để chụp ảnh?" (bestTimeToVisit missing)
   - Expected: Response with citations visible, "Web Search" badge
   - Verify: Citations have valid URLs, titles render

3. **Citation interaction:**
   - Click citation link → Opens in new tab
   - Hover citation → Shows snippet tooltip
   - Verify: All URLs are valid (not "#" or broken)

**Files Changed:**
- [src/ai/flows/place-chat-flow.ts](src/ai/flows/place-chat-flow.ts) - Dual-path logic, citation extraction (lines 7, 18-41, 101-210, 257-311)
- [src/app/api/ai/place-chat/route.ts](src/app/api/ai/place-chat/route.ts) - Response schema with citations (lines 106-118)
- [src/hooks/use-place-chat.ts](src/hooks/use-place-chat.ts) - Citation interface, extended ChatMessage (lines 6-24, 147-154)
- [src/components/place-chat-widget.tsx](src/components/place-chat-widget.tsx) - Citation UI component (lines 18, 249-290)

**Package Requirements:**
- `@google/genai` v1.15.0+ (already installed)
- `firebase-genkit` v0.5.0+ (for database path)
- Environment: `GOOGLE_AI_API_KEY` in `.env.local`

**API Documentation References:**
- [Google AI Gemini API - Grounding](https://ai.google.dev/gemini-api/docs/grounding)
- [Gemini 2.5 Flash Model](https://ai.google.dev/gemini-api/docs/models/gemini-2.5)
- [@google/genai Package](https://www.npmjs.com/package/@google/genai)

**Cost Implications:**
- Database path: ~$0.10 per 1M tokens (Gemini Flash)
- Web search path: Same token cost + potential search quota limits
- Detection logic saves costs by avoiding unnecessary searches

**Prevention Strategy:**
1. ✅ **Web search** latest docs before implementing new features
2. ✅ **Verify** package versions match documentation examples
3. ✅ **Test both paths** separately during development
4. ✅ **Monitor costs** - Log which path is used per request
5. ✅ **Update documentation** when APIs change (add date stamps)

**Result:**
- ✅ AI can answer questions even when database lacks data
- ✅ Users see citation sources for transparency
- ✅ Database responses prioritized (faster, cheaper)
- ✅ Web search fallback works seamlessly
- ✅ Citation UI matches Vietnamese green design system

---

### ❌ Lesson 5: Genkit API Response Extraction - Destructuring Required (2025-01-06)

**Problem:** AI chatbot returned fallback error message "Xin lỗi, tôi không thể trả lời..." even though API succeeded (200 OK, tokens consumed).

**Symptoms:**
```
[PLACE-CHAT] Success (database): {
  inputTokens: 579,
  outputTokens: 19,  // ← AI DID respond (19 tokens)
  cost: 0.00009825
}
POST /api/ai/place-chat 200  // ← API succeeded

// But user saw: "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này..."
```

**Root Cause Analysis:**

**❌ WRONG CODE (Old Pattern):**
```typescript
const result = await ai.generate({
  model: 'googleai/gemini-2.5-flash',
  prompt: systemPrompt,
  config: { ... }
});

// Tried to access text as property or method
const responseText = typeof result.text === 'function'
  ? result.text()  // ❌ result.text is NOT a function
  : result.text    // ❌ result.text is undefined
  || result.output?.text  // ❌ Also undefined
  || 'Xin lỗi, tôi không thể trả lời...';  // ← ALWAYS fell back to this!
```

**Why it failed:**
1. `result.text` is **undefined** (text is not a direct property of result object)
2. `result.output?.text` is also **undefined** (wrong path)
3. Defensive check `typeof result.text === 'function'` is meaningless
4. **ALL conditions failed → Always returned fallback error message**

**✅ CORRECT CODE (Genkit v1.0+ Official Pattern):**
```typescript
// Destructure text from result object
const { text, usage } = await ai.generate({
  model: 'googleai/gemini-2.5-flash',
  prompt: systemPrompt,
  config: { ... }
});

const responseText = text || 'Xin lỗi, tôi không thể trả lời...';
```

**Official Genkit Documentation Example:**
```javascript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({
  plugins: [googleAI()]
});

// ✅ CORRECT: Destructure text
const { text } = await ai.generate({
  model: googleAI.model('gemini-2.5-flash'),
  prompt: 'Why is Firebase awesome?'
});

console.log(text);  // Direct access to generated text
```

**Key Differences:**

| Aspect | ❌ Wrong Pattern | ✅ Correct Pattern |
|--------|-----------------|-------------------|
| **Access method** | `result.text` | `const { text } = await ai.generate(...)` |
| **Function call** | `result.text()` | `text` (just variable) |
| **Type** | Tried property AND function | Destructured variable |
| **Fallback** | Always triggered | Only when `text` is falsy |
| **Result** | User sees error | User sees AI response |

**Why This Pattern Exists:**

Genkit v1.0 (released 2025) uses **destructuring pattern** for cleaner API:
- `text`: The generated text content
- `usage`: Token usage statistics (input, output, total)
- `output`: Structured output (when schema provided)

**Files Fixed:**
- [src/ai/flows/place-chat-flow.ts:108-119](src/ai/flows/place-chat-flow.ts#L108-L119) - Database path
- [src/ai/flows/chat-flow.ts:36-47](src/ai/flows/chat-flow.ts#L36-L47) - General chat flow

**Before Fix:**
```typescript
const result = await ai.generate({ ... });
const responseText = typeof result.text === 'function'
  ? result.text()
  : result.text || result.output?.text || 'Error fallback';
```

**After Fix:**
```typescript
const { text, usage } = await ai.generate({ ... });
const responseText = text || 'Error fallback';
```

**How to Detect This Bug:**

1. **Log Analysis:**
   - API returns 200 OK ✅
   - Tokens consumed (input + output) ✅
   - But user sees fallback error message ❌
   - → Text extraction logic is broken

2. **Debug Pattern:**
   ```typescript
   console.log('Result keys:', Object.keys(result));
   console.log('result.text:', result.text);
   console.log('typeof result.text:', typeof result.text);
   // Will show: undefined, undefined, "undefined"
   ```

3. **Testing:**
   - Ask AI any question
   - Check response is NOT the fallback error
   - Verify actual AI-generated content appears

**Common Pitfalls:**

- ❌ **Assuming result.text is a property** - It's not directly accessible
- ❌ **Defensive checks without understanding API** - `typeof result.text === 'function'` is wrong
- ❌ **Copying old patterns** - Genkit 1.0 changed API structure
- ❌ **Not reading official docs** - Always check latest documentation
- ❌ **Testing only API success** - Must verify response CONTENT, not just status code

**Prevention Strategy:**

1. ✅ **Always destructure Genkit responses:**
   ```typescript
   const { text, usage } = await ai.generate({ ... });
   ```

2. ✅ **Read official Genkit docs** before implementing:
   - https://genkit.dev/docs/models/
   - https://github.com/firebase/genkit

3. ✅ **Test actual content**, not just API status:
   ```typescript
   // ❌ BAD: Only checks status code
   expect(response.status).toBe(200);

   // ✅ GOOD: Verifies actual response content
   expect(response.status).toBe(200);
   expect(response.data.response).not.toContain('Xin lỗi, tôi không thể');
   expect(response.data.response.length).toBeGreaterThan(10);
   ```

4. ✅ **Log response structure in development:**
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     console.log('[DEBUG] Genkit response keys:', Object.keys(result));
   }
   ```

5. ✅ **Avoid "defensive programming" without understanding:**
   - Don't add checks like `typeof x === 'function'` without knowing API contract
   - Read docs first, then write appropriate error handling

**Migration Guide (Old → New):**

If you have old Genkit code:
```typescript
// OLD (Genkit < 1.0?)
const result = await ai.generate({ ... });
const text = result.text() || result.text || result.output?.text;

// NEW (Genkit 1.0+)
const { text } = await ai.generate({ ... });
```

**Related Issues:**

This bug affected **ALL AI responses** in the project:
- Place chat (place-chat-flow.ts) - FIXED
- General chat (chat-flow.ts) - FIXED
- Any future flows using `ai.generate()` - Must use destructuring pattern

**Documentation References:**
- [Genkit 1.0 Release Notes](https://firebase.blog/posts/2025/02/announcing-genkit/)
- [Genkit Models Documentation](https://genkit.dev/docs/models/)
- [Genkit GitHub Examples](https://github.com/firebase/genkit)

**Result:**
- ✅ AI responses now appear correctly
- ✅ Fallback error only shown when AI genuinely fails
- ✅ Cleaner code (1 line vs 3 lines)
- ✅ Matches official Genkit 1.0 API patterns
- ✅ Future-proof (using documented API)

---

## Itinerary Planning Feature Removal (2025-01-06)

### Decision: Complete Removal

**User Request:** "AI Lập kế hoạch Chuyến đi tuy đã chốt phương án clear rồi nhưng vẫn đang tồn tại giao diện ở homepage"

**Problem:** Despite previous decision to disable itinerary AI feature, multiple remnants still existed in the codebase.

### Audit Results

Found **3 separate itinerary-related features**:

**1. AI Planner Component (Homepage)** - Mock UI only
- `src/components/ai-planner.tsx` - Simple form collecting interests/budget/duration
- Used in `src/app/page.tsx` lines 11, 42-46
- No real AI backend, just setTimeout + mock response
- **Action:** ✅ REMOVED

**2. Itinerary Management System** - Full CRUD but unused
- Pages: `/itineraries/my`, `/itineraries/[slug]`
- API routes: `/api/itineraries/*`
- Hook: `src/hooks/use-itineraries.ts`
- Types: `src/lib/types/itineraries.ts`
- Had complete backend but redundant with AI Travel Planner
- **Action:** ✅ REMOVED

**3. AI Travel Planner** (`/ai-assistant/plan`) - Mock despite having AI flow
- 609-line page at `src/app/ai-assistant/plan/page.tsx`
- AI flow existed: `src/ai/flows/generate-travel-itinerary.ts` (Genkit-based)
- BUT page only used mock data (setTimeout 3s → return mockItinerary)
- Flow was never called from UI
- **Action:** ✅ REMOVED

### Files Deleted

**Components:**
- `src/components/ai-planner.tsx`

**Pages:**
- `src/app/itineraries/` (entire directory)
- `src/app/ai-assistant/plan/` (entire directory)

**API Routes:**
- `src/app/api/itineraries/` (entire directory)

**Types & Hooks:**
- `src/hooks/use-itineraries.ts`
- `src/lib/types/itineraries.ts`

**AI Flows:**
- `src/ai/flows/generate-travel-itinerary.ts` (unused Genkit flow)

**UI Updates:**
- Removed AI Planner section from homepage (`src/app/page.tsx`)
- Removed "Lịch trình của tôi" link from user dropdown (`src/components/header.tsx` line 175)

### Build Verification

```bash
npm run build
# ✅ Build succeeded
# Route count: 68 pages (down from 70)
# Warnings: Pre-existing FieldValue import issue only
```

### Key Learnings

**❌ Mistake: Incomplete Feature Removal**
- Previous removal only deleted `/itineraries/builder` but left:
  - Homepage AI Planner component
  - Itinerary management pages (`/my`, `/[slug]`)
  - All API routes
  - Navigation links

**✅ Correct Approach:**
1. **Audit thoroughly** - Use grep for all references (keywords: "itinerary", "lịch trình", etc.)
2. **Check all layers:**
   - UI components
   - Page routes
   - API routes
   - Types/hooks
   - Navigation/links
   - AI flows
3. **Verify implementation** - Don't assume AI flow exists means it's used (check actual calls)
4. **Test build** - Ensure no import errors

**Pattern for Future Feature Removal:**
```bash
# 1. Find all references
grep -r "feature-name" src/

# 2. Check pages
ls src/app/*feature*

# 3. Check APIs
ls src/app/api/*feature*

# 4. Check components
grep -r "FeatureName" src/components/

# 5. Check hooks/types
ls src/hooks/*feature* src/lib/types/*feature*

# 6. Check navigation
grep -r "/feature" src/components/header.tsx

# 7. Delete systematically
rm -rf src/app/feature-name
rm -rf src/app/api/feature-name
rm src/hooks/use-feature.ts
rm src/lib/types/feature.ts

# 8. Build verification
npm run build
```

### Why This Matters

**Cost Savings:**
- Removed ~1,500 lines of dead code
- Reduced bundle size
- Eliminated maintenance burden

**Clarity:**
- No confusing mock features
- Clear project scope
- Honest UX (no fake AI)

---

## ❌ Lesson Learned: API Response Structure Mismatch (2025-01-06)

### Problem: `TypeError: Cannot read properties of undefined (reading 'map')`

**Error Location:** `src/hooks/use-user-contributions.ts:64`

**Root Cause:**
- **Assumed API structure:** `{success: true, data: {drafts: [...]}}`
- **Actual API structure:** `{success: true, data: [...]}`
- Code tried to access `draftsResponse.data.drafts` but `data` was already the array

**Evidence from logs:**
```
API Response for /places/my-drafts:
{success: true, data: [], stats: {...}, total: 0}
                      ^^^ Already array, not {drafts: []}
```

**Wrong Code:**
```typescript
const draftsResponse = await callApi<{success: boolean, data: {drafts: any[]}}>('/places/my-drafts')
const drafts = draftsResponse.success ? draftsResponse.data.drafts : []  // ❌ .drafts undefined
```

**Fixed Code:**
```typescript
const draftsResponse = await callApi<{success: boolean, data: any[]}>('/places/my-drafts')
const drafts = (draftsResponse.success && Array.isArray(draftsResponse.data))
  ? draftsResponse.data
  : []
```

### Prevention Strategies:

1. **✅ Always Check API Response in Browser DevTools First**
   - Open Network tab
   - Check actual JSON response structure
   - Don't assume structure based on API name

2. **✅ Add Defensive Type Guards**
   ```typescript
   // ❌ BAD - Assumes structure
   const items = response.data.items

   // ✅ GOOD - Validates structure
   const items = Array.isArray(response.data) ? response.data : []
   ```

3. **✅ Log Response in Development**
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     console.log('[Hook] API response:', response)
   }
   ```

4. **✅ Use Zod/Type Validation for Critical APIs**
   ```typescript
   import { z } from 'zod'

   const ResponseSchema = z.object({
     success: z.boolean(),
     data: z.array(z.any())
   })

   const validated = ResponseSchema.parse(response)
   ```

5. **✅ Check API Implementation**
   - Read `src/app/api/places/my-drafts/route.ts`
   - See actual `return NextResponse.json({...})` structure
   - Match hook expectations with API reality

### Common Pitfall Pattern:

**Nested vs Flat Data Structure:**
```typescript
// Pattern 1: Nested (some APIs)
{success: true, data: {items: [], total: 10}}

// Pattern 2: Flat (other APIs)
{success: true, data: [], total: 10}

// Pattern 3: Paginated
{success: true, data: {results: [], pagination: {}}}
```

**Always verify which pattern the API uses!**

### Files Fixed:
- `src/hooks/use-user-contributions.ts` - Added `Array.isArray()` check before `.map()`

---

## ❌ Lesson Learned: Empty/Whitespace Image URLs (2025-01-06)

### Problem: `An empty string ("") was passed to the src attribute of <img>`

**Error Location:** `src/app/profile/me/page.tsx:616-617`

**Root Cause:**
- Image URLs from API can be empty strings `""` or whitespace `" "`
- Conditional check `images?.[0] &&` doesn't handle whitespace strings
- Whitespace string `" "` is truthy → Image renders with invalid src
- Browser downloads entire page when `src=""` or `src=" "`

**Evidence:**
```
Error: An empty string ("") was passed to src attribute
Location: page.tsx:616 (Image component in published places section)
```

**Why This Happens:**
```javascript
// API returns
{images: [""]}      // Empty string
{images: [" "]}     // Whitespace (TRUTHY!)
{images: ["  \n"]}  // Whitespace with newline (TRUTHY!)

// Conditional fails
" " && <Image src=" " />  // ✅ Renders (whitespace is truthy)
"" && <Image src="" />    // ❌ Doesn't render (empty is falsy)
```

**Wrong Code:**
```typescript
{draft.images?.[0] && (
  <Image
    src={draft.images[0]}  // ❌ Could be "", " ", or other whitespace
    alt={draft.name}
  />
)}
```

**Fixed Code (Iteration 1 - Insufficient):**
```typescript
{draft.images?.[0]?.trim() && (
  <Image
    src={draft.images[0].trim()}  // ✅ Trim whitespace first
    alt={draft.name}
  />
)}
```

**Issue with Fix #1:** Still failed! Error persisted because React might render with stale/partial data during hydration, causing timing issues where the conditional evaluates correctly but Image still receives empty src.

**Fixed Code (Iteration 2 - Robust):**
```typescript
{draft.images?.[0]?.trim() && draft.images[0].trim().length > 0 && (
  <Image
    src={draft.images[0].trim()}  // ✅ Triple-validated: optional chaining + truthy + explicit length
    alt={draft.name}
  />
)}

// Why this works:
// 1. draft.images?.[0] - Handles undefined/null array or element
// 2. .trim() - Removes whitespace
// 3. .trim().length > 0 - Explicit non-empty string check (not just truthy)
```

### Prevention Strategies:

1. **✅ Always `.trim()` User-Generated URLs**
   ```typescript
   // ❌ BAD - Whitespace passes check
   {imageUrl && <Image src={imageUrl} />}

   // ✅ GOOD - Trim and check
   {imageUrl?.trim() && <Image src={imageUrl.trim()} />}
   ```

2. **✅ Create Utility Function for Safe Image URLs**
   ```typescript
   function getSafeImageUrl(url: string | undefined | null): string | null {
     if (!url) return null
     const trimmed = url.trim()
     if (!trimmed) return null
     if (!trimmed.startsWith('http')) return null  // Extra safety
     return trimmed
   }

   // Usage
   const safeUrl = getSafeImageUrl(place.images?.[0])
   {safeUrl && <Image src={safeUrl} alt={...} />}
   ```

3. **✅ Validate in Data Mapping Layer**
   ```typescript
   // In useUserContributions hook
   images: (d.images || [])
     .map(url => url?.trim())
     .filter(url => url && url.length > 0)
   ```

4. **✅ Add Image Error Handling**
   ```typescript
   <Image
     src={url}
     alt={name}
     onError={(e) => {
       e.currentTarget.style.display = 'none'  // Hide broken images
     }}
   />
   ```

### Common Pitfall: Truthy vs Valid

**Truthy doesn't mean valid!**
```javascript
// All TRUTHY but INVALID for Image src:
" " → truthy
"   \n  " → truthy
"undefined" → truthy (string!)
"null" → truthy (string!)

// Solution: Explicit validation
function isValidUrl(url: any): url is string {
  return typeof url === 'string'
    && url.trim().length > 0
    && (url.startsWith('http') || url.startsWith('/'))
}
```

### Files Fixed:
- `src/app/profile/me/page.tsx` - Added robust validation (`.trim()` + `.length > 0`) for draft and published images (lines 566, 615)
- `CLAUDE.md` - Documented iteration 1 failure and robust fix pattern

---

### ❌ Lesson 3: Type Mismatch - PlaceImage[] vs string[] (2025-01-06)

**Problem:** `TypeError: place.images[0].trim is not a function` at `src/app/profile/me/page.tsx:615`

**Root Cause Analysis:**

1. **Schema Definition Mismatch:**
   - Type definition: `Place.images: PlaceImage[]` (array of objects)
   - `PlaceImage` structure: `{id, url, alt, caption, isPrimary, uploadedBy, createdAt, order?}`
   - Component expected: `string[]` (array of URLs)

2. **Data Flow Problem:**
   ```typescript
   // API returns:
   {images: [{id: "...", url: "https://...", alt: "..."}, ...]}

   // Hook mapped as-is:
   images: p.images || []  // Still PlaceImage[]

   // Component tried to call:
   place.images[0].trim()  // ❌ PlaceImage object doesn't have .trim()
   ```

3. **Previous Fix Insufficient:**
   - Iteration 1: Added `.trim()` and `.length > 0` checks
   - Iteration 2: Still failed because checking `.trim()` on object = TypeError
   - Root issue: **Type mismatch**, not empty string validation

**Correct Fix Applied:**

**1. Data Mapping Layer** (`src/hooks/use-user-contributions.ts`)
```typescript
// Helper function to extract image URLs from PlaceImage objects or string arrays
const extractImageUrls = (images: any): string[] => {
  if (!images || !Array.isArray(images)) return []

  return images
    .map((img: any) => {
      // If already string (legacy data or draft), return as-is
      if (typeof img === 'string') {
        return img.trim()
      }
      // If PlaceImage object, extract url field
      if (typeof img === 'object' && img !== null && typeof img.url === 'string') {
        return img.url.trim()
      }
      return null
    })
    .filter((url): url is string => url !== null && url.length > 0)
}

// Usage in mapping:
published: published.map((p: any) => ({
  ...p,
  images: extractImageUrls(p.images)  // ✅ Always returns string[]
}))
```

**2. Component Layer** (`src/app/profile/me/page.tsx`)
```typescript
// BEFORE (Iteration 2 - Still failed):
{place.images?.[0]?.trim() && place.images[0].trim().length > 0 && (
  <Image src={place.images[0].trim()} />
)}

// AFTER (Type-safe):
{typeof place.images?.[0] === 'string' && place.images[0].trim() && (
  <Image src={place.images[0].trim()} />
)}
```

**Why This Pattern Works:**

1. **Data Layer Normalization:**
   - Handles both `PlaceImage[]` (published places) and `string[]` (drafts)
   - Extracts URL from objects, validates strings
   - Filters out null/empty values upfront
   - Returns consistent `string[]` type

2. **Type-Safe Component Check:**
   - `typeof place.images?.[0] === 'string'` - Explicit type guard
   - Only calls `.trim()` if confirmed string type
   - Prevents calling string methods on objects

3. **Backward Compatible:**
   - Works with legacy `string[]` data
   - Works with new `PlaceImage[]` schema
   - Gracefully handles mixed or malformed data

**Key Lessons:**

1. ✅ **Always verify data types match schema definitions**
   - Check type definitions in `src/lib/types/*.ts`
   - Verify API response structure matches component expectations
   - Don't assume primitives - objects are common in normalized data

2. ✅ **Normalize complex types at data layer, not UI layer**
   - Extract primitive values (URLs, IDs) in hooks/services
   - Keep component logic simple with primitives
   - One source of truth for data transformation

3. ✅ **Use explicit type guards before calling methods**
   ```typescript
   // ❌ BAD - Assumes type
   value?.trim()

   // ✅ GOOD - Verifies type first
   typeof value === 'string' && value.trim()
   ```

4. ✅ **Helper functions for complex transformations**
   - Encapsulate type checking + extraction logic
   - Reusable across multiple mapping operations
   - Document edge cases (legacy vs new schema)

5. ✅ **Test with real API data, not mocks**
   - Mocks hide schema mismatches
   - Real data reveals object vs primitive issues
   - Check browser console for actual response structure

**Common Patterns to Avoid:**

```typescript
// ❌ Assuming primitive when schema says object
interface Place {
  images: PlaceImage[]  // Array of objects!
}
// Then doing:
place.images[0].startsWith('http')  // ❌ Objects don't have .startsWith()

// ✅ Extract primitive first
const imageUrls = place.images.map(img => img.url)
imageUrls[0].startsWith('http')  // ✅ Now it's a string
```

**Files Changed:**
- `src/hooks/use-user-contributions.ts` - Added `extractImageUrls()` helper (lines 63-80)
- `src/app/profile/me/page.tsx` - Type-safe conditionals (lines 566, 615)
- `CLAUDE.md` - Documented type mismatch lesson

**Prevention Checklist:**
- [ ] Check type definitions before mapping API data
- [ ] Add helper functions for object → primitive extraction
- [ ] Use `typeof` guards before calling type-specific methods
- [ ] Test with real API responses (check DevTools Network tab)
- [ ] Handle both legacy and new schemas gracefully

**Related Errors:**
- `x.toUpperCase is not a function` → x is not a string
- `x.map is not a function` → x is not an array
- `x.url is undefined` → Forgot to extract from object

**Quick Debug Pattern:**
```typescript
console.log('Type:', typeof value)
console.log('Is array:', Array.isArray(value))
console.log('Keys:', value && typeof value === 'object' ? Object.keys(value) : 'N/A')
```

---

## ❌ Lesson Learned: Systematic Branding Update Across Codebase (2025-01-06)

### Problem: Inconsistent Brand Name "VietExplore" vs "Du Lịch Việt"

**User Request:** "trang địa điểm chi tiết đang hiển thị tiêu đề trang web, hiển thị trên tab của trình duyệt có 'VietExplore' nhưng hiện tôi đã đồng bộ dự án là 'Du Lịch Việt'. hãy sửa lại giúp tôi đồng thời tôi cần rà soát dự án sửa lại toàn bộ chỗ nào đang hiển thị là VietExplore thành Du Lịch Việt"

**Root Cause:**
- Project was initially developed with English branding "VietExplore"
- Brand name appeared in 103 files across the codebase
- Inconsistent branding affects SEO, user experience, and brand identity

### Systematic Approach Applied:

**1. Comprehensive Search (Find All Occurrences)**
```bash
# Find all source files containing old brand name
grep -r "VietExplore" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"

# Result: 49 source files found
# Also checked: package.json, config files, markdown docs
```

**2. Bulk Replacement Strategy**
```bash
# Replace in all source files at once
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/VietExplore/Du Lịch Việt/g' {} \;

# Replace in root markdown files
find . -maxdepth 1 -type f -name "*.md" -exec sed -i 's/VietExplore/Du Lịch Việt/g' {} \;

# Replace in scripts folder
find scripts -type f \( -name "*.md" -o -name "*.js" \) -exec sed -i 's/VietExplore/Du Lịch Việt/g' {} \;
```

**3. Critical Files Manually Updated:**

**a. Page Metadata** (`src/app/places/[...slug]/page.tsx`):
```typescript
// BEFORE:
title: `${place.name} - ${place.province} | VietExplore`
siteName: 'VietExplore'

// AFTER:
title: `${place.name} - ${place.province} | Du Lịch Việt`
siteName: 'Du Lịch Việt'
```

**b. Share Functionality** (`src/components/place-detail-content.tsx`):
```typescript
// BEFORE:
const shareData = {
  title: `${place.name} - VietExplore`,
  text: place.shortDescription,
  url: window.location.href
}

// AFTER:
const shareData = {
  title: `${place.name} - Du Lịch Việt`,
  text: place.shortDescription,
  url: window.location.href
}
```

**c. Sitemap Configuration** (`next-sitemap.config.js`):
```javascript
// BEFORE:
siteUrl: process.env.SITE_URL || 'https://viet-explore-ai.vercel.app'
alternateRefs: [
  { href: 'https://viet-explore-ai.vercel.app', hreflang: 'vi' }
]

// AFTER:
siteUrl: process.env.SITE_URL || 'https://www.dulichviet.tech'
alternateRefs: [
  { href: 'https://www.dulichviet.tech', hreflang: 'vi' }
]
```

**d. Root Layout** (`src/app/layout.tsx`):
```typescript
// Already correct - verified:
export const metadata: Metadata = {
  title: 'Du Lịch Việt - Khám phá Việt Nam với trí tuệ nhân tạo',
  description: 'Nền tảng du lịch thông minh, khám phá văn hóa Việt Nam với công nghệ AI tiên tiến',
  authors: [{ name: 'Du Lịch Việt Team' }],
  openGraph: {
    title: 'Du Lịch Việt - Khám phá Việt Nam với trí tuệ nhân tạo',
    // ...
  }
}
```

**4. Verification Steps:**
```bash
# Verify no more old branding in source
grep -r "VietExplore" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"
# Result: 0 matches

# Count new branding occurrences
grep -r "Du Lịch Việt" src/ --include="*.tsx" --include="*.ts" | wc -l
# Result: 175 occurrences

# Test production build
npm run build
# Result: ✓ Compiled successfully
# Sitemap generated with new URLs: https://www.dulichviet.tech/sitemap-0.xml
```

### Files Changed Summary:

**Source Files (49 files):**
- Page metadata (places, admin, auth, etc.)
- Components (notifications, modals, templates)
- Utility libraries (URL helpers, design tokens, theme providers)
- Server utilities (notification service, system health monitoring)
- Test files (notification tests, test utils)
- API routes (admin settings, address conversion, etc.)

**Configuration Files:**
- `next-sitemap.config.js` - Updated siteUrl and alternateRefs
- `package.json` - Already correct ("Du-Lich-Viet")

**Documentation Files:**
- Root markdown files (README.md, DEPLOYMENT_GUIDE.md, etc.)
- Scripts documentation

### Key Lessons:

1. ✅ **Use Bulk Operations for Systematic Changes:**
   - `find` + `sed` is efficient for mass replacements
   - Always verify with grep before and after
   - Test build immediately after changes

2. ✅ **Critical Metadata Locations to Check:**
   - Page metadata (`generateMetadata()` functions)
   - Share/social media data (Web Share API, Open Graph)
   - Sitemap configuration (affects SEO indexing)
   - Root layout metadata (default site-wide title)

3. ✅ **Brand Consistency Checklist:**
   - [ ] Browser tab title (`<title>` tag)
   - [ ] Open Graph metadata (Facebook, LinkedIn)
   - [ ] Twitter cards
   - [ ] Share functionality text
   - [ ] Sitemap URLs
   - [ ] Error messages and notifications
   - [ ] Email templates (if any)
   - [ ] Documentation files

4. ✅ **Testing After Branding Update:**
   - Production build successful
   - Sitemap regenerated with correct URLs
   - Dev server running (verify tab title)
   - Check browser DevTools for metadata
   - Test Web Share API (mobile)

### Prevention Strategy:

**When Starting New Projects:**
1. ✅ Define brand name in central config file (e.g., `src/config/branding.ts`)
2. ✅ Import from config instead of hardcoding strings
3. ✅ Use environment variables for URLs

**Example Best Practice:**
```typescript
// src/config/branding.ts
export const BRANDING = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Du Lịch Việt',
  shortName: 'DLV',
  tagline: 'Khám phá Việt Nam với trí tuệ nhân tạo',
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.dulichviet.tech',
  author: 'Du Lịch Việt Team'
} as const;

// Usage in components:
import { BRANDING } from '@/config/branding';

const shareData = {
  title: `${place.name} - ${BRANDING.name}`,
  url: window.location.href
};
```

### Build Output:

```
✓ Generating static pages (68/68)
✅ [next-sitemap] Generation completed

SITEMAP INDICES
   ○ https://www.dulichviet.tech/sitemap.xml

SITEMAPS
   ○ https://www.dulichviet.tech/sitemap-0.xml
```

**Result:**
- ✅ All 103 files updated successfully
- ✅ Production build passes (68 static pages)
- ✅ Sitemap generated with new brand URLs
- ✅ Dev server running on http://localhost:9004
- ✅ Browser tab now shows "Du Lịch Việt" correctly

---

## ✅ Best Practice: Display Real Contributor Information (2025-01-07)

### Problem Statement

Place detail pages showed generic "Cộng đồng" contributor label instead of actual user data, hiding valuable information about who contributed the content.

### Root Cause

**Data Flow Gap:**
1. **API Layer:** `/api/places/[id]` returned place data but didn't fetch author user info
2. **SSR Layer:** `page.tsx` fetched place from Firestore but didn't join with users collection
3. **UI Layer:** Component had contributor card but received no real user data
4. **Fallback Logic:** Used `place.source.partnerName || 'Cộng đồng'` which rarely had data

**Why This Matters:**
- Contributors deserve recognition for their work
- Users want to know source credibility
- Trust signals (verified badges, contribution stats) were hidden
- No way to view contributor's profile or other contributions

### Solution Architecture

**Three-Layer Enhancement:**

**1. API Data Enrichment** (`src/app/api/places/[id]/route.ts`)
```typescript
// Fetch author user data
let authorInfo = null;
if (placeData.createdBy) {
  try {
    const userDoc = await adminDb.collection('users').doc(placeData.createdBy).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      authorInfo = {
        id: userDoc.id,
        fullName: userData?.fullName || 'Người đóng góp',
        username: userData?.username || `user_${userDoc.id.slice(0, 8)}`,
        avatar: userData?.avatar || null,
        role: userData?.role || 'contributor',
        verified: userData?.verified || false,
        emailVerified: userData?.emailVerified || false,
        badges: userData?.badges || [],
        stats: {
          placesContributed: userData?.stats?.placesContributed || 0,
          reviewsWritten: userData?.stats?.reviewsWritten || 0,
          helpfulVotesReceived: userData?.stats?.helpfulVotesReceived || 0
        }
      };
    }
  } catch (error) {
    console.error('[API] Error fetching author info:', error);
    // Continue without author info - will use fallback in UI
  }
}

return NextResponse.json({
  success: true,
  data: {
    ...placeData,
    authorInfo: authorInfo  // ✅ Added
  }
});
```

**2. SSR Data Fetching** (`src/app/places/[...slug]/page.tsx`)
```typescript
// Same user fetch logic in getPlaceData()
// Ensures SSR pages have author info for SEO
const userDoc = await adminDb.collection('users').doc(place.createdBy).get();
// ... build authorInfo object

return {
  ...placeData,
  authorInfo: authorInfo,  // ✅ Added
  authorName: authorInfo?.fullName || 'Cộng đồng',
  authorRole: authorInfo?.role || 'contributor'
};
```

**3. UI Component Enhancement** (`src/components/place-detail-content.tsx`)
```typescript
{place.authorInfo ? (
  <>
    <Link href={`/profile/${place.authorInfo.username}`} className="...">
      <Avatar className="h-12 w-12 border-2 border-purple-200">
        {place.authorInfo.avatar ? (
          <AvatarImage src={place.authorInfo.avatar} alt={place.authorInfo.fullName} />
        ) : null}
        <AvatarFallback className="bg-purple-100 text-purple-700">
          {place.authorInfo.fullName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{place.authorInfo.fullName}</span>
          {place.authorInfo.verified && (
            <CheckCircle className="h-4 w-4 text-blue-500" title="Đã xác thực" />
          )}
        </div>
        <ProfessionalRoleBadge role={place.authorInfo.role} />
        <div className="text-xs text-gray-500 flex gap-3">
          <span>{place.authorInfo.stats.placesContributed} địa điểm</span>
          <span>{place.authorInfo.stats.reviewsWritten} đánh giá</span>
        </div>
      </div>
    </Link>

    {/* Badges display */}
    {place.authorInfo.badges?.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {place.authorInfo.badges.map((badge) => (
          <Badge variant="secondary" className="text-xs">
            <Award className="h-3 w-3 mr-1" />
            {badge}
          </Badge>
        ))}
      </div>
    )}
  </>
) : (
  // Fallback for missing/deleted users
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 bg-purple-100 rounded-full">
      <User className="h-5 w-5 text-purple-600" />
    </div>
    <div>
      <div className="font-medium">{place.authorName}</div>
      <div className="text-sm text-gray-500">{place.authorRole}</div>
    </div>
  </div>
)}
```

### TypeScript Interface Updates

**Extended PlaceData Interface:**
```typescript
interface PlaceData {
  // ... existing fields
  authorRole: "contributor" | "partner" | "admin" | "moderator"  // ✅ Extended
  authorName: string
  authorInfo?: {  // ✅ NEW
    id: string
    fullName: string
    username: string
    avatar: string | null
    role: "contributor" | "partner" | "admin" | "moderator" | "traveler"
    verified: boolean
    emailVerified: boolean
    badges: string[]
    stats: {
      placesContributed: number
      reviewsWritten: number
      helpfulVotesReceived: number
    }
  } | null
}
```

### UX Improvements Delivered

**Before:**
- Generic "Cộng đồng" label
- Static purple icon
- No user identification
- No trust signals

**After:**
- ✅ **Real Avatar:** User photo or fallback initials
- ✅ **Full Name:** Clickable link to profile
- ✅ **Role Badge:** Visual indicator (Contributor/Partner/Admin)
- ✅ **Verification Badge:** Blue checkmark for verified users
- ✅ **Contribution Stats:** "X địa điểm • Y đánh giá"
- ✅ **Achievements:** Badge display (if user has earned any)
- ✅ **Profile Link:** Navigate to user's full profile page
- ✅ **Hover Effect:** Purple background on link hover

### Error Handling & Edge Cases

**Graceful Degradation:**
```typescript
// User deleted/not found
if (!userDoc.exists) {
  authorInfo = null;  // Falls back to generic UI
}

// Missing avatar
<AvatarFallback>
  {fullName.charAt(0).toUpperCase()}  // Show initials
</AvatarFallback>

// No stats
stats: {
  placesContributed: userData?.stats?.placesContributed || 0,  // Default to 0
  reviewsWritten: userData?.stats?.reviewsWritten || 0,
  helpfulVotesReceived: userData?.stats?.helpfulVotesReceived || 0
}

// Missing badges
{place.authorInfo.badges && place.authorInfo.badges.length > 0 && (
  // Only render if badges exist
)}
```

### Performance Considerations

**Additional Query Cost:**
- **+1 Firestore read** per place view (users collection)
- **Caching opportunity:** User data changes infrequently → can cache for 1 hour
- **SSR benefit:** User info included in initial HTML → no client-side fetch needed

**Optimization Strategies:**
```typescript
// Future enhancement: Add caching layer
const cachedUser = await cache.get(`user:${userId}`);
if (cachedUser) return cachedUser;

const userDoc = await adminDb.collection('users').doc(userId).get();
await cache.set(`user:${userId}`, userData, { ttl: 3600 }); // 1 hour
```

### Testing Checklist

**User Role Scenarios:**
- [x] Place created by contributor → Shows Contributor badge
- [x] Place created by partner → Shows Partner badge
- [x] Place created by admin → Shows Admin badge
- [x] Place created by verified user → Shows blue checkmark
- [x] Place created by deleted user → Shows generic fallback

**UI/UX Tests:**
- [x] Avatar renders correctly (photo or initials)
- [x] Username link navigates to `/profile/{username}`
- [x] Stats count accurately (places, reviews)
- [x] Badges display when present
- [x] Hover effect on contributor card works
- [x] Responsive layout on mobile

**Data Integrity:**
- [x] SSR includes author info (view page source)
- [x] API returns authorInfo field
- [x] No TypeScript errors in modified files
- [x] Build completes successfully

### Key Lessons Learned

**✅ Data Joining Best Practices:**
1. **Join at API/SSR layer** - Don't expose raw Firestore queries to client
2. **Enrich before returning** - Transform data to include related entities
3. **Graceful fallbacks** - Always handle missing/deleted related data
4. **Type safety** - Define clear interfaces for joined data

**✅ User Attribution Pattern:**
```typescript
// Standard pattern for content with authors:
1. Store userId in content document (createdBy field)
2. Fetch user data when fetching content
3. Include user info in response (authorInfo object)
4. Display with Avatar, role badge, stats
5. Link to user profile for full details
```

**✅ UI Component Structure:**
```typescript
// Conditional rendering pattern:
{richDataAvailable ? (
  <EnhancedDisplay with={richData} />
) : (
  <SimpleDisplay with={fallbackData} />
)}

// Never assume data exists - always check
place.authorInfo?.stats?.placesContributed || 0
```

**❌ Common Pitfalls to Avoid:**

1. **Don't fetch in component** - Do it in API/SSR layer
   ```typescript
   // ❌ BAD - Client-side fetch creates loading states
   useEffect(() => {
     fetch(`/api/users/${place.createdBy}`)
   }, [])

   // ✅ GOOD - Server-side join
   const placeData = await getPlace(id);  // Already has authorInfo
   ```

2. **Don't assume user exists** - Always use optional chaining
   ```typescript
   // ❌ BAD - Crashes if user deleted
   <Avatar src={place.authorInfo.avatar} />

   // ✅ GOOD - Graceful fallback
   {place.authorInfo ? <Avatar src={place.authorInfo.avatar} /> : <DefaultIcon />}
   ```

3. **Don't skip SSR enrichment** - Breaks SEO
   ```typescript
   // ❌ BAD - Only enriches in API, not SSR
   // User sees "Cộng đồng" on first load

   // ✅ GOOD - Enrich in both API and SSR
   // User sees real name immediately, search engines index it
   ```

### Files Modified

- `src/app/api/places/[id]/route.ts` - Added user data fetch (lines 61-88)
- `src/app/places/[...slug]/page.tsx` - Added user data fetch in SSR (lines 118-145), updated interface (lines 47-61)
- `src/components/place-detail-content.tsx` - Enhanced contributor card UI (lines 1357-1450), updated interface (lines 115-129), imported Avatar components (line 75)

### Future Enhancements

**Phase 2 Ideas:**
- Add caching layer for user data (reduce Firestore reads)
- Show "Top Contributor" badge for users with 50+ places
- Display recent activity ("Last active: 2 days ago")
- Add "Follow" button on contributor card
- Show contributor's other places in this region
- Implement contributor leaderboard

**Analytics Tracking:**
- Track profile link clicks from place pages
- Measure contributor attribution impact on trust signals
- A/B test: Generic vs Real contributor display

### Related Patterns

**Similar Features Using This Pattern:**
- Review author attribution (already implemented)
- Report submitter info (for moderators only)
- Edit request creator display
- Comment author display (future)

**Reusable Components Created:**
- Avatar with fallback initials
- ProfessionalRoleBadge
- User stats display pattern

---

## ❌ Lesson Learned: Missing Import After Adding Component Usage (2025-01-07)

### Problem: Runtime Error - Component Not Defined

**Error:** `ReferenceError: BrandedCardSkeleton is not defined`

**Location:** `src/app/places/saved/page.tsx:327`

**Context:** During UI/UX optimization of `/places/saved` page, added skeleton loading states but forgot to import the component.

### Root Cause Analysis

**What Happened:**
1. Added `BrandedCardSkeleton` component usage in JSX (lines 327, 354)
2. Component was used inside loading state conditionals
3. **Forgot to add import statement** at top of file
4. TypeScript/build passed (component exists in codebase)
5. Runtime error occurred when loading state triggered

**Code Pattern:**
```typescript
// ❌ WRONG - Used component without import
{isLoading ? (
  <div className={...}>
    {Array.from({ length: 6 }).map((_, i) => (
      <BrandedCardSkeleton key={i} />  // ← Component not imported!
    ))}
  </div>
) : ...}
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Import before use
import { BrandedCardSkeleton } from "@/components/ui/branded-loading"

// Then use in JSX:
{isLoading ? (
  <div className={...}>
    {Array.from({ length: 6 }).map((_, i) => (
      <BrandedCardSkeleton key={i} />  // ✅ Works correctly
    ))}
  </div>
) : ...}
```

### Why This Happened

**Common Pitfall Pattern:**
1. **Mental Model Error:** Focused on JSX logic, assumed component was already imported
2. **No IDE Warning:** If using auto-import disabled or missed the suggestion
3. **Build Passed:** TypeScript doesn't catch runtime errors for missing imports in some cases
4. **Late Detection:** Error only appears when that code path executes (loading state)

**Similar to previous lesson (Type Mismatch - CLAUDE.md:3470):**
- Both involve assumptions about data/components being available
- Both caught at runtime, not build time
- Both require defensive thinking about what's actually imported/defined

### Prevention Strategies

**✅ Checklist When Adding New Components:**
1. **Before writing JSX:**
   - [ ] Check if component is imported
   - [ ] If not, add import statement immediately
   - [ ] Verify import path is correct

2. **IDE Setup:**
   - [ ] Enable auto-import suggestions
   - [ ] Use ESLint rule: `no-undef` (catches undefined variables)
   - [ ] Enable TypeScript strict mode

3. **Testing Pattern:**
   - [ ] Test all code paths (loading states, error states, empty states)
   - [ ] Don't just test happy path
   - [ ] Use dev tools to force loading states

4. **Code Review Pattern:**
   ```typescript
   // When reviewing PRs, check:
   // 1. Every JSX component tag has corresponding import
   // 2. No orphaned JSX without imports
   // 3. Conditional renders have all dependencies imported
   ```

### Quick Fix Commands

**Find all component usages without imports:**
```bash
# Search for component usage
grep -r "BrandedCardSkeleton" src/

# Check if imported in that file
grep "import.*BrandedCardSkeleton" src/app/places/saved/page.tsx
# If empty → Missing import!
```

**Verify all imports match usage:**
```bash
# List all imported components
grep "^import.*from.*components" src/app/places/saved/page.tsx

# List all JSX component tags
grep -o "<[A-Z][a-zA-Z]*" src/app/places/saved/page.tsx | sort -u
```

### Related Patterns

**Other cases where this happens:**
- Adding hooks: `usePlaces()` without importing `@/hooks/use-places`
- Adding utilities: `cn()` without importing `@/lib/utils`
- Adding icons: `<Heart />` without importing from `lucide-react`
- Adding types: `PlaceData` without importing from `@/lib/types/places`

**Prevention Mantra:**
> **"Import first, use second. Never assume it's there."**

### Files Fixed

- `src/app/places/saved/page.tsx` - Added missing import (line 15)

### Key Takeaway

**Rule:** Every time you type `<ComponentName />` in JSX:
1. ✅ Check imports at top of file
2. ✅ Add import if missing
3. ✅ Test the code path immediately

**Why Important:**
- Runtime errors break user experience
- Hard to debug (error message doesn't always point to root cause)
- Can slip through build process
- Only caught when specific UI state triggers

**Remember:** TypeScript catches type errors, not missing imports for components that exist elsewhere in the codebase. Always verify imports manually.

---

## ❌ Lesson Learned: FormData Upload - Content-Type Header Conflict (2025-01-07)

### Problem
Upload file bị lỗi 500: `Content-Type was not one of "multipart/form-data"...`

### Root Cause
`callApi()` luôn set `'Content-Type': 'application/json'` mặc định. Khi upload FormData, header này KHÔNG được ghi đè vì `headers: {}` không có key `'Content-Type'` để override.

### Solution
```typescript
// Check if body is FormData before setting Content-Type
if (!(options.body instanceof FormData)) {
  headers['Content-Type'] = 'application/json';
}
// Browser will auto-set: multipart/form-data; boundary=...
```

### Key Takeaway
**NEVER manually set Content-Type for FormData.** Browser MUST set it with boundary parameter.

**Files:** `src/lib/client/api.ts:22-24`, `src/hooks/use-team-members.ts:273-277`

**Full Documentation:** [docs/lessons/formdata-upload-content-type.md](docs/lessons/formdata-upload-content-type.md)

---

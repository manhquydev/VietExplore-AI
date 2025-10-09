# Best Practices & Lessons Learned - Du Lịch Việt

> **Phiên bản:** 3.0.0
> **Ngày cập nhật:** Tháng 10, 2025
> **Nguồn**: Tổng hợp từ `.claude/docs/lessons-learned/`

---

## Mục Lục

1. [Critical Patterns](#1-critical-patterns)
2. [Common Pitfalls](#2-common-pitfalls)
3. [Feature Development Lessons](#3-feature-development-lessons)
4. [Workflow Improvements](#4-workflow-improvements)
5. [React Best Practices](#5-react-best-practices)
6. [Firebase Best Practices](#6-firebase-best-practices)
7. [API Design Patterns](#7-api-design-patterns)
8. [Performance Best Practices](#8-performance-best-practices)
9. [Security Best Practices](#9-security-best-practices)
10. [Code Review Checklist](#10-code-review-checklist)

---

## 1. Critical Patterns

### 1.1. Race Conditions trong Cron Jobs

**❌ Problem: Địa điểm published bị reset về pending**

**Root Cause:**
```typescript
// ❌ BAD - Query then update (race condition)
const docs = await db.collection('moderation_queue')
  .where('status', '==', 'claimed')
  .where('claimExpiresAt', '<', now)
  .get();

// 50-200ms race window - status could change!
docs.forEach(doc => {
  doc.ref.update({ status: 'pending' });  // May overwrite newer state
});
```

**✅ Solution: Use Transactions**
```typescript
// ✅ GOOD - Atomic check-and-update
await db.runTransaction(async (transaction) => {
  // Re-fetch inside transaction (fresh data)
  const freshDoc = await transaction.get(docRef);

  // Recheck conditions
  if (freshDoc.data().status !== 'claimed') {
    return;  // Status changed, skip
  }

  if (freshDoc.data().claimExpiresAt >= now) {
    return;  // Claim extended, skip
  }

  // Update only if all checks pass
  transaction.update(docRef, {
    status: 'pending',
    claimExpiresAt: FieldValue.delete()
  });
});
```

**Key Learnings:**
1. ✅ Always use **Firestore Transactions** for check-and-update
2. ✅ **Re-fetch inside transaction** để có fresh state
3. ✅ **Recheck all conditions** before update
4. ✅ **Delete cleanup triggers** khi leaving watched state

**Files**: `src/app/api/moderation/queue/[itemId]/route.ts:312`

---

### 1.2. Field Cleanup on Status Transitions

**❌ Problem: Reports hiển thị "Đang được điều tra bởi..." sau khi resolved**

**Root Cause:**
```typescript
// ❌ BAD - Status updated but claim fields NOT deleted
await db.collection('place_reports').doc(reportId).update({
  status: 'resolved',
  reviewedBy: user.id,
  // BUT reviewerInfo, claimedAt NOT deleted → Stale UI
});
```

**✅ Solution: Clean up state-specific fields**
```typescript
// ✅ GOOD - Delete fields when leaving state
import { FieldValue } from 'firebase-admin/firestore';

await db.collection('place_reports').doc(reportId).update({
  status: 'resolved',
  reviewedBy: user.id,
  reviewedAt: now,
  // ✅ Clean up claim fields
  reviewerInfo: FieldValue.delete(),
  claimedAt: FieldValue.delete()
});
```

**Pattern for All State Transitions:**
```typescript
// When leaving 'claimed' state
if (newStatus !== 'claimed') {
  updateData.claimExpiresAt = FieldValue.delete();
  updateData.claimedBy = FieldValue.delete();
  updateData.claimedAt = FieldValue.delete();
}

// When leaving 'in_review' state
if (newStatus !== 'in_review') {
  updateData.reviewerInfo = FieldValue.delete();
  updateData.claimedAt = FieldValue.delete();
}
```

**UI Defensive Rendering:**
```typescript
// ✅ GOOD - Check status before showing state-specific data
{item.status === 'in_review' && item.reviewerInfo && (
  <div>Đang được điều tra bởi: {item.reviewerInfo.name}</div>
)}

// ❌ BAD - Trusts field existence
{item.reviewerInfo && (
  <div>Đang được điều tra bởi: {item.reviewerInfo.name}</div>
)}
```

**Files**: `.claude/docs/lessons-learned/critical-patterns/field-cleanup.md`

---

## 2. Common Pitfalls

### 2.1. Type Mismatches (Object vs String)

**❌ Problem: `TypeError: place.images[0].trim is not a function`**

**Root Cause:**
```typescript
// Schema says: PlaceImage[] (array of objects)
interface Place {
  images: PlaceImage[];  // Objects!
}

// But component tried:
place.images[0].trim()  // ❌ Objects don't have .trim()
```

**✅ Solution: Extract primitives**
```typescript
// Helper to extract URLs from PlaceImage objects
const extractImageUrls = (images: any): string[] => {
  if (!images || !Array.isArray(images)) return [];

  return images
    .map((img) => {
      if (typeof img === 'string') return img.trim();
      if (typeof img === 'object' && img.url) return img.url.trim();
      return null;
    })
    .filter((url): url is string => url !== null);
};

// Usage
const imageUrls = extractImageUrls(place.images);
```

**Prevention:**
1. ✅ Check type definitions before mapping
2. ✅ Add helper functions for object → primitive extraction
3. ✅ Use `typeof` guards before calling methods
4. ✅ Test with real API data

**Files**: `.claude/docs/lessons-learned/common-pitfalls/type-mismatches.md`

---

### 2.2. API Response Structure Mismatch

**❌ Problem: `Cannot read properties of undefined (reading 'map')`**

**Root Cause:**
```typescript
// Assumed: { success: true, data: { drafts: [...] } }
const drafts = response.data.drafts;

// Actual:  { success: true, data: [...] }
// response.data.drafts is undefined!
```

**✅ Solution: Always validate structure**
```typescript
// Check actual API response first (DevTools Network tab)
const drafts = Array.isArray(response.data)
  ? response.data
  : response.data?.drafts || [];
```

**Prevention:**
1. ✅ Check Network tab for actual response
2. ✅ Add defensive type guards
3. ✅ Log responses in development
4. ✅ Read API implementation before using

**Files**: `.claude/docs/lessons-learned/common-pitfalls/api-responses.md`

---

### 2.3. FormData Upload - Content-Type Conflict

**❌ Problem: `Content-Type was not one of "multipart/form-data"`**

**Root Cause:**
```typescript
// ❌ BAD - Manually set Content-Type
fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data'  // Missing boundary!
  },
  body: formData
});
```

**✅ Solution: Let browser auto-set**
```typescript
// src/lib/client/api.ts
if (!(options.body instanceof FormData)) {
  headers['Content-Type'] = 'application/json';
}
// Browser will auto-set: multipart/form-data; boundary=...
```

**Why:** Browser must generate unique boundary parameter. Manual setting breaks upload.

**Files**: `.claude/docs/lessons-learned/common-pitfalls/formdata-upload.md`

---

### 2.4. Missing Component Imports

**❌ Problem: `ReferenceError: BrandedCardSkeleton is not defined`**

**Root Cause:**
```typescript
// Used component but forgot import
{isLoading && (
  <BrandedCardSkeleton />  // ← Not imported!
)}
```

**✅ Solution: Import before use**
```typescript
// ✅ GOOD - Always import first
import { BrandedCardSkeleton } from '@/components/ui/branded-loading';

{isLoading && (
  <BrandedCardSkeleton />  // ✅ Works
)}
```

**Prevention Rule:**
> **Every time you type `<ComponentName />`, check imports first!**

**Files**: `.claude/docs/lessons-learned/common-pitfalls/component-imports.md`

---

## 3. Feature Development Lessons

### 3.1. AI Itinerary Planner (Paused)

**❌ Status: ⚠️ DISABLED - Built too early**

**Problem:**
- Launched AI itinerary suggestions without sufficient data
- Need 300-500+ places for quality AI recommendations
- Only had 50-70 places at launch

**Root Causes:**
1. **Insufficient Data Foundation** - AI needs critical mass
2. **Premature Optimization** - Built complex AI before validating manual workflow
3. **Cost Modeling Blindness** - No revenue model to justify costs
4. **Complexity vs Value** - Minimal user value delta vs simple rules

**Correct Approach:**
```
Phase 1: Manual Foundation (current priority)
  → Collect 150+ places manually
  → Validate user workflow

Phase 2: Rule-Based Intelligence (when 150+ places)
  → Simple filters and recommendations
  → $0 cost

Phase 3: AI Enhancement (when 500+ places + revenue)
  → Full AI-powered itineraries
  → Cost-justified by revenue
```

**✅ Success Story: Place-Specific AI Chatbot**
- Works with 1 place (not 300+)
- Rich context (100+ fields per place)
- Answers specific questions
- Incremental cost (~$0.00026/turn)
- Immediate value

**Key Takeaways:**
1. ✅ **Data First, AI Second** - Don't build AI on empty datasets
2. ✅ **Validate Manually** - Prove workflow value before automating
3. ✅ **Progressive Enhancement** - Manual → Rule-based → Hybrid → Full AI
4. ✅ **Cost Awareness** - Model economics at 1×, 10×, 100× scale
5. ✅ **Kill Switch Ready** - Be willing to disable if metrics fail

**Files**: `.claude/docs/lessons-learned/feature-development/genkit-api.md`

---

### 3.2. Genkit API Response Extraction

**❌ Problem: AI returned fallback despite API success**

**Root Cause:**
```typescript
// ❌ WRONG - Tried accessing .text as property
const responseText = typeof result.text === 'function'
  ? result.text()     // result.text is NOT a function
  : result.text       // result.text is undefined
  || 'Fallback...';   // ← Always fell back!
```

**✅ Correct Pattern (Genkit 1.0+):**
```typescript
// ✅ GOOD - Destructure from result
const { text, usage } = await ai.generate({
  model: 'googleai/gemini-2.0-flash',
  prompt: systemPrompt
});

const responseText = text || 'Fallback...';
```

**Prevention:**
1. ✅ Always destructure Genkit responses
2. ✅ Read official docs before implementing
3. ✅ Test actual content, not just API status
4. ✅ Avoid "defensive programming" without understanding

**Files**: `.claude/docs/lessons-learned/feature-development/genkit-api.md:10`

---

## 4. Workflow Improvements

### 4.1. Notification Best Practices

**❌ Problem: Emoji spam trong notification text**

**Bad Example:**
```typescript
// ❌ BAD - Emoji in both icon and text
{
  icon: 📬,  // Emoji component
  title: '📬 Địa điểm đã được tiếp nhận'  // Emoji in text too!
}
```

**✅ Best Practice:**
```typescript
// ✅ GOOD - Icon component only, clean text
import { Inbox } from 'lucide-react';

{
  icon: <Inbox />,  // Lucide icon
  title: 'Địa điểm đã được tiếp nhận',
  body: '"{placeName}" đã gửi thành công. Chúng tôi sẽ kiểm duyệt trong vòng 24 giờ.',
  actionUrl: '/contribute/my-drafts/{draftId}/moderation',
  actionText: 'Xem tiến trình'
}
```

**Why:**
- ✅ Professional appearance
- ✅ Better accessibility (screen readers)
- ✅ Consistent across devices

**ActionURL Best Practices:**
```typescript
// User-facing results → Direct to outcome
PLACE_APPROVED: actionUrl: '/places/{slug}'

// Need action → Direct to action page
REVISION_REQUESTED: actionUrl: '/contribute/edit/{draftId}'

// Monitoring → Direct to tracking
PLACE_IN_REVIEW: actionUrl: '/contribute/my-drafts/{draftId}/moderation'

// Admin actions → Direct to management
CONTENT_REPORTED: actionUrl: '/admin/moderation/reports/{reportId}'
```

**Files**: `.claude/docs/lessons-learned/workflow-improvements/notification-best-practices.md`

---

### 4.2. Report Handling

**❌ Problem: User reported review but place owner got notified**

**Correct Pattern:**
- Reports about reviews → Notify **MODERATORS** (not place owner)
- Review author NOT notified until action taken
- Prevent conflict of interest

**Rate Limiting:**
- Maximum **3 reports per user per week**
- Prevent spam abuse

**Files**: `.claude/docs/features/review-system.md:200`

---

## 5. React Best Practices

### 5.1. Rules of Hooks

**❌ NEVER call hooks inside loops/conditions:**
```typescript
// ❌ BAD - Violates Rules of Hooks
reviews.map(review => {
  const [state, setState] = useState();  // ERROR!
  return <div>...</div>;
});
```

**✅ Extract to separate component:**
```typescript
// ✅ GOOD - Component per item
const ReviewItem = ({ review }) => {
  const [state, setState] = useState();
  return <div>...</div>;
};

reviews.map(review => <ReviewItem review={review} />);
```

**Files**: `.claude/docs/frontend/react-patterns.md:30`

---

### 5.2. API Client Pattern

**❌ NEVER manually implement fetch:**
```typescript
// ❌ BAD - Missing auth header
fetch('/api/endpoint', {
  headers: { Authorization: ... }
});
```

**✅ Use callApi helper:**
```typescript
// ✅ GOOD - Auth handled automatically
import { callApi } from '@/lib/client/api';
const result = await callApi('/endpoint', { method: 'POST' });
```

**Files**: `.claude/docs/frontend/react-patterns.md:40`

---

## 6. Firebase Best Practices

### 6.1. Firestore Rules - Field Validation

**❌ WRONG - Too Restrictive:**
```javascript
allow create: if emailVerified()
  && request.resource.data.keys().hasAll(['field1', 'field2']);
// ❌ Blocks extra metadata fields
```

**✅ CORRECT - Validate Individual Fields:**
```javascript
allow create: if emailVerified()
  && request.resource.data.field1 is string
  && request.resource.data.field2 is string;
// ✅ Allows extra metadata
```

**Files**: `.claude/docs/core/firebase-setup.md:50`

---

### 6.2. Admin SDK Behavior

**Key Fact:**
> **Firebase Admin SDK BYPASSES ALL Firestore security rules**

- Client SDK → Rules enforced
- Admin SDK → Full access, NO rule checks
- If Admin SDK fails, check: network, credentials, data format - NOT rules

**Files**: `.claude/docs/core/firebase-setup.md:75`

---

## 7. API Design Patterns

### 7.1. Consistent Response Format

**✅ Standard Success:**
```json
{
  "success": true,
  "data": { ... } | [ ... ],
  "message": "Optional",
  "total": 100
}
```

**✅ Standard Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### 7.2. Authentication Middleware

**✅ Always verify auth on protected routes:**
```typescript
export async function POST(request: Request) {
  const { user } = await verifyAuthToken(request);

  if (!hasPermission(user, 'create_place')) {
    return NextResponse.json(
      { success: false, error: 'Permission denied' },
      { status: 403 }
    );
  }

  // Business logic...
}
```

---

## 8. Performance Best Practices

### 8.1. View Tracking

**✅ CORRECT: Firestore as single source of truth**
```typescript
// Use FieldValue.increment() for atomic updates
await placeRef.update({
  viewCount: FieldValue.increment(1)
});
```

**❌ WRONG: Dual-sync Firestore ↔ Realtime DB**
- Causes race conditions
- Use Realtime DB only for ephemeral data

**Files**: `.claude/docs/frontend/analytics-tracking.md`

---

### 8.2. Display Pattern

**✅ Use centralized hooks:**
```typescript
import { useViewTracking } from '@/hooks/use-place-stats';

const { viewCount } = useViewTracking(placeId, initialViewCount);
return <div>{viewCount.toLocaleString('vi-VN')} lượt xem</div>;
```

**❌ NEVER hardcode stats to 0 in SSR:**
```typescript
// ❌ BAD - Breaks real-time sync
stats: { saves: 0, likes: 0 }

// ✅ GOOD - Read from Firestore
stats: {
  saves: place.stats.saves,
  likes: place.stats.likes
}
```

---

## 9. Security Best Practices

### 9.1. Input Validation

**✅ Always use Zod for validation:**
```typescript
const CreatePlaceSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(50).max(5000)
});

const validated = CreatePlaceSchema.safeParse(body);
if (!validated.success) {
  return NextResponse.json({ error: validated.error }, { status: 400 });
}
```

### 9.2. Password Requirements

**✅ Strong password policy:**
```typescript
const passwordSchema = z.string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Phải có ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Phải có ít nhất 1 ký tự đặc biệt');
```

### 9.3. XSS Prevention

**✅ Sanitize user input:**
```typescript
import validator from 'validator';
const sanitizedContent = validator.escape(userInput);
```

---

## 10. Code Review Checklist

### 10.1. Before Submitting PR

**Code Quality:**
- [ ] TypeScript type check passed (`npm run typecheck`)
- [ ] ESLint warnings resolved (`npm run lint`)
- [ ] No console.log statements (use logger)
- [ ] Comments explain WHY, not WHAT

**Testing:**
- [ ] Unit tests written for new functions
- [ ] Integration tests for new API routes
- [ ] Manual testing completed
- [ ] Edge cases tested

**Documentation:**
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Comments added for complex logic
- [ ] CLAUDE.md updated if architectural change

**Security:**
- [ ] Input validation with Zod
- [ ] Authentication check on protected routes
- [ ] No sensitive data in logs
- [ ] Firestore rules updated if schema changed

**Performance:**
- [ ] No N+1 queries
- [ ] Proper indexing for queries
- [ ] Images optimized
- [ ] No unnecessary re-renders

### 10.2. Code Review Guidelines

**As Reviewer:**
1. ✅ Check for security vulnerabilities
2. ✅ Verify test coverage
3. ✅ Look for performance issues
4. ✅ Ensure code readability
5. ✅ Validate error handling

**As Author:**
1. ✅ Respond to all comments
2. ✅ Explain design decisions
3. ✅ Add tests for edge cases found
4. ✅ Update documentation
5. ✅ Squash commits before merge

---

## Kết Luận

Những bài học này được tổng hợp từ **thực tế phát triển Du Lịch Việt**. Tuân thủ các best practices này sẽ giúp:

1. ✅ **Tránh được bugs phổ biến** - Học từ mistakes của người trước
2. ✅ **Code chất lượng cao hơn** - Follow established patterns
3. ✅ **Phát triển nhanh hơn** - Không phải học lại từ đầu
4. ✅ **Maintain dễ dàng hơn** - Consistent patterns across codebase

**Remember:**
> **"Good judgment comes from experience. Experience comes from bad judgment."**

**Tài liệu liên quan:**
- [2. Kiến Trúc Hệ Thống](./2_Kien_Truc_He_Thong_&_Cong_Nghe.md)
- [3. Tính Năng Quan Trọng](./3_Tinh_Nang_Quan_Trong.md)
- [6. Testing & Quality Assurance](./6_Testing_Quality_Assurance.md)

---

*© 2025 Du Lịch Việt. All rights reserved.*

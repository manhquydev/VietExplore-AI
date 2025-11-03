# Quy Trình Nghiệp Vụ (Business Workflows)

## Tổng Quan

Tài liệu này mô tả chi tiết các quy trình nghiệp vụ chính trong hệ thống **Du Lịch Việt - AI**, bao gồm luồng dữ liệu, state transitions, và decision logic.

---

## 1. Content Moderation Workflow (Quy trình kiểm duyệt nội dung)

### 1.1. State Machine (STRICT ENFORCEMENT)

Hệ thống sử dụng state machine chặt chẽ để quản lý quy trình kiểm duyệt, **BẮT BUỘC** tuân theo flow, không cho phép skip state.

```
┌──────────┐
│ PENDING  │  Chờ moderator tiếp nhận
└────┬─────┘
     │ Action: "Tiếp nhận" (Claim)
     │ By: Moderator
     │ Timeout: 2 hours
     ▼
┌──────────┐
│ CLAIMED  │  Đã tiếp nhận, chưa bắt đầu review
└────┬─────┘
     │ Action: "Bắt đầu kiểm duyệt"
     │ By: Moderator who claimed
     │ OR: Auto-release if timeout (2h)
     ▼
┌───────────┐
│ IN_REVIEW │  Đang kiểm duyệt chính thức
└─────┬─────┘
      │
      ├─ Action: "Duyệt" → APPROVED
      ├─ Action: "Từ chối" → REJECTED
      ├─ Action: "Yêu cầu sửa" → NEEDS_REVISION
      └─ Action: "Escalate" (Moderator only) → ESCALATED

┌──────────┬─────────────┬────────────────┐
│          │             │                │
▼          ▼             ▼                ▼
APPROVED  REJECTED  NEEDS_REVISION  ESCALATED (Admin xử lý)
  │          │             │
  │          │             └─ User sửa → Submit lại → PENDING
  │          │
  ├─ Auto-archive sau 30 ngày
  ▼
moderation_archive (Retention: 90 ngày) → Auto-delete
```

### 1.2. Chi Tiết Từng State

#### A. PENDING (Chờ duyệt)
**Mô tả:** Item mới submit, chưa có moderator nào tiếp nhận

**UI Actions:**
- Moderator: Nút "Tiếp nhận" hiển thị
- User: Không có action (chỉ xem status)

**Backend Logic:**
```typescript
// API: POST /api/moderation/queue/[itemId] { action: "claim" }
async function claimItem(itemId, moderatorId) {
  const item = await db.collection('moderation_queue').doc(itemId).get();

  // Validation
  if (item.data().status !== 'pending') {
    throw new Error('Can only claim pending items');
  }

  // Atomic update
  await item.ref.update({
    status: 'claimed',
    claimedBy: moderatorId,
    claimedAt: now(),
    claimExpiresAt: now() + 2 * HOURS
  });

  // Create audit log
  await logModerationAction({
    action: 'claim',
    moderatorId,
    itemId,
    previousStatus: 'pending',
    newStatus: 'claimed'
  });
}
```

#### B. CLAIMED (Đã tiếp nhận)
**Mô tả:** Moderator đã tiếp nhận, đang chuẩn bị review

**UI Actions:**
- Moderator (owner): "Bắt đầu kiểm duyệt", "Bỏ tiếp nhận"
- Other moderators: Hiển thị "Đang được xử lý bởi [Tên]"

**Auto-Release Mechanism:**
```typescript
// Cron job: runs every 30 minutes
async function releaseExpiredClaims() {
  const now = new Date();

  const expiredItems = await db.collection('moderation_queue')
    .where('status', '==', 'claimed')
    .where('claimExpiresAt', '<', now)
    .get();

  for (const doc of expiredItems.docs) {
    // Use transaction to prevent race conditions
    await db.runTransaction(async (transaction) => {
      const freshDoc = await transaction.get(doc.ref);

      // Recheck status inside transaction
      if (freshDoc.data().status !== 'claimed') {
        return; // Status changed, skip
      }

      if (freshDoc.data().claimExpiresAt >= now) {
        return; // Claim extended, skip
      }

      // Release claim
      transaction.update(doc.ref, {
        status: 'pending',
        claimedBy: FieldValue.delete(),
        claimedAt: FieldValue.delete(),
        claimExpiresAt: FieldValue.delete()
      });
    });
  }
}
```

#### C. IN_REVIEW (Đang duyệt)
**Mô tả:** Moderator đang kiểm duyệt chính thức

**UI Actions:**
- Moderator (owner):
  - ✅ "Duyệt" → APPROVED
  - ❌ "Từ chối" → REJECTED
  - 🔄 "Yêu cầu sửa" → NEEDS_REVISION
  - ⬆️ "Escalate lên Admin" (chỉ Moderator, không cho Admin)

**Decision Logic:**
```typescript
// API: POST /api/moderation/queue/[itemId] { action: "approve" | "reject" | "request_edit" }
async function makeDecision(itemId, action, moderatorId, data) {
  const item = await db.collection('moderation_queue').doc(itemId).get();

  // Validation
  if (item.data().status !== 'in_review') {
    throw new Error('Can only make decision on in_review items');
  }

  if (item.data().claimedBy !== moderatorId) {
    throw new Error('Only assigned moderator can make decision');
  }

  // Clean up claim fields (CRITICAL - prevent race condition)
  const updateData = {
    status: getNewStatus(action),
    reviewedBy: moderatorId,
    reviewedAt: now(),
    reviewNotes: data.notes,
    // DELETE claim fields
    claimedBy: FieldValue.delete(),
    claimedAt: FieldValue.delete(),
    claimExpiresAt: FieldValue.delete()
  };

  if (action === 'approve') {
    // Publish to places collection
    await publishPlace(item.data().contentId);

    // Notify user
    await notifyPlaceApproved(item.data());
  } else if (action === 'reject') {
    updateData.rejectionReason = data.reason;
    await notifyPlaceRejected(item.data(), data.reason);
  } else if (action === 'request_edit') {
    await notifyRevisionRequested(item.data(), data.reason);
  }

  await item.ref.update(updateData);

  // Log decision
  await logModerationAction({
    action,
    moderatorId,
    itemId,
    previousStatus: 'in_review',
    newStatus: updateData.status,
    reason: data.reason || data.notes
  });
}
```

#### D. APPROVED / REJECTED (Quyết định cuối)
**Mô tả:** Đã có quyết định cuối cùng, giữ lại 30 ngày cho audit/rollback

**UI Display:**
- Tab "Đã duyệt/Bị từ chối": Read-only
- Admin có nút "Rollback Decision" (rare use case)

**Auto-Archive:**
```typescript
// Cron job: runs daily at 2 AM
async function archiveOldDecisions() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldItems = await db.collection('moderation_queue')
    .where('status', 'in', ['approved', 'rejected'])
    .where('reviewedAt', '<', thirtyDaysAgo)
    .get();

  for (const doc of oldItems.docs) {
    // Move to archive
    await db.collection('moderation_archive').doc(doc.id).set(doc.data());

    // Delete from queue
    await doc.ref.delete();
  }
}
```

### 1.3. Escalation Flow (Moderator → Admin)

**Khi nào escalate:**
- Nội dung nhạy cảm (chính trị, tôn giáo)
- Không chắc chắn về quyết định
- Partner có phản đối quyết định

**Quy tắc:**
- ✅ Moderator CÓ THỂ escalate
- ❌ Admin KHÔNG THỂ escalate (quyền cao nhất)

```typescript
function canEscalate(user, item) {
  if (user.role !== 'moderator') {
    return false; // Only moderator can escalate
  }

  if (item.status !== 'in_review') {
    return false; // Only from in_review state
  }

  return true;
}

async function escalateToAdmin(itemId, moderatorId, reason) {
  await db.collection('moderation_queue').doc(itemId).update({
    status: 'escalated',
    escalatedTo: 'admin',
    escalatedBy: moderatorId,
    escalatedAt: now(),
    escalationReason: reason
  });

  // Notify all admins
  await notifyAdminsEscalation(itemId, reason);
}
```

---

## 2. Place Submission Workflow

### 2.1. Contributor Submission

```
User (Contributor) tạo draft
  ↓
1. Create placeDrafts document (status: "draft")
  ↓
2. User chỉnh sửa, thêm hình ảnh
  ↓
3. User click "Gửi kiểm duyệt"
  ↓
4. API validates:
   - Email verified
   - Has contributor/partner role
   - Draft has required fields (name, region, province, type, description, images)
  ↓
5. Update draft status: "submitted"
  ↓
6. Create moderation_queue item:
   {
     itemType: "place_submission",
     contentId: draftId,
     status: "pending",
     priority: user.role === 'partner' ? "high" : "medium",
     queueType: user.role === 'partner' ? "partner_queue" : "contributor_queue",
     submittedBy: userId,
     submittedAt: now()
   }
  ↓
7. Send notification to user: "Địa điểm đã được tiếp nhận"
  ↓
8. Moderator reviews (see section 1)
  ↓
9a. APPROVED → Publish to places collection
    - Copy draft data → places
    - Set status: "published"
    - Set trustLabel: "contributor" or "partner"
    - Set publishedAt: now()
    - Delete draft
    - Notify user: "Địa điểm đã được duyệt"

9b. REJECTED → Keep draft
    - Draft status: "rejected"
    - Add rejectionReason
    - Notify user with reason
    - User can edit and resubmit

9c. NEEDS_REVISION → Request changes
    - Draft status: "changes_requested"
    - Add changesRequested[] with specific feedback
    - Notify user
    - User edits → Submit lại → Cycle
```

### 2.2. Partner Fast-Track

**Khác biệt cho Partner:**
- Priority: `high` (vs `medium` cho Contributor)
- QueueType: `partner_queue` (tab riêng trong UI)
- SLA: 12 giờ (vs 24-48h cho Contributor)
- Moderator alerts nếu quá SLA

```typescript
async function checkPartnerSLA() {
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  const overduePartnerItems = await db.collection('moderation_queue')
    .where('queueType', '==', 'partner_queue')
    .where('status', '==', 'pending')
    .where('submittedAt', '<', twelveHoursAgo)
    .get();

  if (!overduePartnerItems.empty) {
    // Send urgent alert to moderators
    await notifyModeratorsUrgent({
      type: 'partner_sla_breach',
      count: overduePartnerItems.size,
      items: overduePartnerItems.docs.map(d => d.id)
    });
  }
}
```

---

## 3. User Review Workflow

### 3.1. Review Submission

```
User views place detail page
  ↓
1. Click "Viết đánh giá"
  ↓
2. Modal opens with form:
   - Rating (1-5 stars) - Required
   - Title (optional)
   - Content (required, min 10 chars)
   - Images (optional, max 4)
   - Visit date (optional)
   - Anonymous checkbox
  ↓
3. User submits
  ↓
4. API validates:
   - Email verified
   - Not already reviewed this place
   - Content length >= 10 chars
   - Rating 1-5
  ↓
5. Create place_reviews document:
   {
     placeId,
     userId,
     userInfo: {
       id: userId,
       name: isAnonymous ? "Người dùng ẩn danh" : user.fullName,
       role: user.role,
       avatar: isAnonymous ? null : user.avatar
     },
     rating,
     title,
     content,
     images,
     visitDate,
     isAnonymous,
     status: "published", // Auto-publish for now
     helpfulCount: 0,
     reportCount: 0,
     createdAt: now()
   }
  ↓
6. Update place.rating:
   - Recalculate average
   - Increment count
   - Update breakdown[rating]++
  ↓
7. Update user.stats.reviewsWritten++
  ↓
8. Notify place owner: "Địa điểm của bạn nhận được đánh giá mới"
```

### 3.2. Helpful Voting

```
User clicks "Hữu ích" button
  ↓
1. Check existing vote:
   - Query review_helpful WHERE userId == current AND reviewId == target
  ↓
2a. If exists → Remove vote (toggle off)
    - Delete review_helpful document
    - Decrement review.helpfulCount
    - UI: Remove blue highlight

2b. If not exists → Add vote
    - Validate: Not self-vote (userId !== review.userId)
    - Create review_helpful document (id: `${userId}_${reviewId}`)
    - Increment review.helpfulCount (FieldValue.increment(1))
    - UI: Add blue highlight
  ↓
3. Update happens with optimistic UI:
   - UI updates immediately
   - If backend fails → Rollback UI
```

### 3.3. Review Report Workflow

```
User clicks "Báo cáo" on review
  ↓
1. Modal shows report reasons:
   - Spam/quảng cáo
   - Nội dung không phù hợp
   - Ngôn từ xúc phạm
   - Đánh giá giả mạo
   - Không liên quan
   - Lý do khác
  ↓
2. User selects reason + optional details
  ↓
3. API validates:
   - Email verified
   - Rate limit: Max 3 reports/user/week
   - Not duplicate (user hasn't reported this review already)
  ↓
4. Create review_reports document:
   {
     reviewId,
     placeId,
     reportedBy: userId,
     reason,
     details,
     status: "pending",
     createdAt: now()
   }
  ↓
5. Notify MODERATORS (NOT place owner - conflict of interest):
   - "Báo cáo mới về đánh giá"
   - Link to /admin/moderation/reports
  ↓
6. Moderator reviews report:
   - Status: "pending" → "investigating"
   - Assign to self (reviewerId)
  ↓
7. Moderator takes action:
   a. Hide review → review.status = "hidden"
   b. Warn user → Send warning notification
   c. Dismiss report → status = "dismissed" (no violation)
  ↓
8. Log action in admin_logs
  ↓
9. Notify reporter: "Báo cáo đã được xử lý"
```

---

## 4. Notification Workflow

### 4.1. Real-time Notification System

**Architecture:**
- Backend: `EnhancedNotificationService` (centralized service)
- Database: Firebase Realtime Database (for real-time sync)
- Frontend: `useRealtimeNotifications()` hook + Firestore listener

**Flow:**
```
Event occurs (e.g., place approved)
  ↓
1. API/Cloud Function calls:
   EnhancedNotificationService.notifyPlaceApproved(placeId, placeName, slug, ownerId)
  ↓
2. Service creates notification object:
   {
     id: "notif_abc123",
     userId: ownerId,
     type: "PLACE_APPROVED",
     title: "Địa điểm đã được duyệt",
     body: "{placeName} đã được duyệt và xuất bản. Xem ngay!",
     actionUrl: "/places/{slug}",
     actionText: "Xem địa điểm",
     read: false,
     createdAt: ISO_STRING,
     timestamp: EPOCH_MS,
     priority: "medium"
   }
  ↓
3. Write to Firebase Realtime DB:
   /notifications/{userId}/{notificationId}
  ↓
4. Frontend listener detects change:
   - useRealtimeNotifications() hook
   - Auto-updates UI (bell icon badge)
   - Show toast notification (if enabled)
  ↓
5. User clicks notification:
   - Mark as read: { read: true }
   - Navigate to actionUrl
```

### 4.2. Notification Types

**Place Lifecycle:**
- `PLACE_RECEIVED` - Địa điểm đã được tiếp nhận
- `PLACE_CLAIMED` - Đã được tiếp nhận xử lý (include moderator name)
- `PLACE_IN_REVIEW` - Đang được kiểm duyệt
- `PLACE_APPROVED` - Địa điểm đã được duyệt
- `PLACE_REJECTED` - Địa điểm bị từ chối
- `REVISION_REQUESTED` - Yêu cầu chỉnh sửa

**User Interactions:**
- `PLACE_LIKED` - Ai đó thích địa điểm của bạn
- `PLACE_SAVED` - Ai đó lưu địa điểm của bạn
- `PLACE_REVIEW_POSTED` - Ai đó đánh giá địa điểm của bạn

**Moderation (for Moderators/Admins):**
- `CONTENT_REPORTED` - Báo cáo nội dung mới
- `MODERATION_SLA_WARNING` - Cảnh báo SLA
- `ESCALATION_REQUESTED` - Item được escalate lên Admin

---

## 5. Temporary Suspension Workflow

### 5.1. Manual Suspension (Moderator/Admin)

```
Moderator finds violation
  ↓
1. Click "Tạm ẩn" on place
  ↓
2. Modal shows:
   - Suspension duration (1-168 hours = 7 days)
   - Reason (dropdown + text)
   - Type: violation | investigation | quality_review | user_request
   - Auto-restore checkbox
  ↓
3. Moderator submits
  ↓
4. API updates:
   a. places document:
      {
        status: "temporarily_suspended",
        suspendedAt: now(),
        suspendedBy: moderatorId,
        suspensionReason: reason,
        suspensionExpiresAt: now() + duration,
        suspensionType: type
      }

   b. Create suspension_schedules document:
      {
        placeId,
        suspendedAt: now(),
        expiresAt: now() + duration,
        suspensionType: type,
        reason,
        processed: false,
        createdBy: moderatorId
      }
  ↓
5. Notify place owner:
   - "Địa điểm tạm thời bị ẩn"
   - Reason + Duration
   - Link to support/appeal
  ↓
6. Place hidden from public view (Firestore rules filter status)
  ↓
7. Cron job (hourly) checks suspension_schedules:
   - WHERE processed == false AND expiresAt < now()
   - Restore place: status = "published"
   - Delete suspension fields
   - Mark schedule: processed = true
  ↓
8. Notify owner: "Địa điểm đã được khôi phục"
```

### 5.2. Auto-Restore Cron Job

```typescript
// Runs every hour
async function restoreExpiredSuspensions() {
  const now = new Date();

  const expiredSuspensions = await db.collection('suspension_schedules')
    .where('processed', '==', false)
    .where('expiresAt', '<=', now)
    .get();

  for (const doc of expiredSuspensions.docs) {
    const placeId = doc.data().placeId;

    // Restore place
    await db.collection('places').doc(placeId).update({
      status: 'published',
      suspendedAt: FieldValue.delete(),
      suspendedBy: FieldValue.delete(),
      suspensionReason: FieldValue.delete(),
      suspensionExpiresAt: FieldValue.delete(),
      suspensionType: FieldValue.delete()
    });

    // Mark schedule as processed
    await doc.ref.update({
      processed: true,
      processedAt: now
    });

    // Notify owner
    await notifyPlaceRestored(placeId);

    // Log action
    await logAdminAction({
      action: 'auto_restore_suspension',
      placeId,
      timestamp: now
    });
  }
}
```

---

## 6. Role Upgrade Workflow

### 6.1. Auto-Upgrade: Traveler → Contributor

**Tiêu chí tự động:**
- 5+ reviews với helpful votes
- Tài khoản > 30 ngày
- Không có vi phạm

```typescript
// Cron job: runs weekly
async function checkAutoUpgrade() {
  const travelers = await db.collection('users')
    .where('role', '==', 'traveler')
    .get();

  for (const user of travelers.docs) {
    const userData = user.data();
    const accountAge = daysSince(userData.createdAt);

    if (accountAge < 30) continue;

    // Check reviews
    const reviews = await db.collection('place_reviews')
      .where('userId', '==', user.id)
      .where('status', '==', 'published')
      .get();

    const qualityReviews = reviews.docs.filter(r => r.data().helpfulCount >= 3);

    if (qualityReviews.length >= 5) {
      // Auto-upgrade
      await user.ref.update({
        role: 'contributor',
        updatedAt: now(),
        roleHistory: FieldValue.arrayUnion({
          previousRole: 'traveler',
          newRole: 'contributor',
          changedBy: 'system_auto',
          changedAt: now(),
          reason: 'Auto-upgrade: Quality contributions'
        })
      });

      // Notify user
      await notifyRoleUpgrade(user.id, 'contributor');
    }
  }
}
```

### 6.2. Manual Upgrade: Contributor → Partner

**Quy trình:**
```
User fills form tại /about/partnership
  ↓
1. Submit with:
   - Company name
   - Business registration
   - Contact info
   - Intent description
  ↓
2. Create partner_requests document (new collection):
   {
     userId,
     currentRole: 'contributor',
     requestedRole: 'partner',
     companyName,
     documents: [urls],
     description,
     status: 'pending',
     requestedAt: now()
   }
  ↓
3. Notify admins: "Yêu cầu đối tác mới"
  ↓
4. Admin reviews in /admin/partners/requests:
   - Verify documents
   - Check contribution history
   - Contact user if needed
  ↓
5a. Admin approves:
    - Update user.role = 'partner'
    - Add roleHistory entry
    - Notify user: "Chúc mừng! Bạn đã trở thành đối tác"
    - Send welcome email with benefits

5b. Admin rejects:
    - Update request status = 'rejected'
    - Add rejection reason
    - Notify user with feedback
```

---

## 7. View Tracking Workflow (Anti-Inflation)

### 7.1. Session-Based View Tracking

**Problem:** Prevent users from inflating view count by refreshing

**Solution:** Cache viewed places per session (1-hour TTL)

```
User lands on place detail page (/places/[slug])
  ↓
1. Server-side (SSR):
   - Get initial viewCount from place document
   - Pass to client
  ↓
2. Client-side (useEffect):
   - useViewTracking(placeId, initialViewCount)
  ↓
3. Hook calls API: POST /api/places/[id]/view
   {
     fingerprint: hash(IP + User-Agent)
   }
  ↓
4. API backend (ViewTracker.trackPlaceView):
   a. Generate cache key: `${placeId}_${fingerprint}`

   b. Check view_cache:
      - Query WHERE id == cacheKey

   c. If exists AND expiresAt > now:
      → Return current count (no increment)

   d. If not exists OR expired:
      → Increment place.viewCount (FieldValue.increment(1))
      → Create view_cache entry:
        {
          id: cacheKey,
          placeId,
          fingerprint,
          viewedAt: now(),
          expiresAt: now() + 1_HOUR
        }
      → Return new count
  ↓
5. Client updates UI with latest count
  ↓
6. Background: Cron job cleans expired cache (daily)
```

**Code Example:**
```typescript
// src/lib/server/view-tracker.ts
export class ViewTracker {
  static async trackPlaceView(
    placeId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<number> {
    const fingerprint = hash(`${ipAddress}_${userAgent}`);
    const cacheKey = `${placeId}_${fingerprint}`;

    // Check cache
    const cachedView = await adminDb.collection('view_cache').doc(cacheKey).get();

    if (cachedView.exists) {
      const expiresAt = new Date(cachedView.data()!.expiresAt);
      if (expiresAt > new Date()) {
        // Within 1h window - don't increment
        const place = await adminDb.collection('places').doc(placeId).get();
        return place.data()?.viewCount || 0;
      }
    }

    // Not in cache or expired - increment
    const placeRef = adminDb.collection('places').doc(placeId);
    await placeRef.update({
      viewCount: FieldValue.increment(1)
    });

    // Create cache entry
    await adminDb.collection('view_cache').doc(cacheKey).set({
      placeId,
      fingerprint,
      viewedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1h
    });

    // Return new count
    const updatedPlace = await placeRef.get();
    return updatedPlace.data()?.viewCount || 0;
  }
}
```

---

## 8. Tóm Tắt Workflows

| Workflow | Complexity | Key Technologies | State Machine |
|----------|-----------|------------------|---------------|
| **Content Moderation** | High | Firestore transactions, Cron jobs | Yes (Strict) |
| **Place Submission** | Medium | Firestore, Cloud Storage | Yes |
| **Review System** | Medium | Atomic counters, Vote tracking | No |
| **Notifications** | Medium | Realtime DB, WebSocket | No |
| **Suspension** | Medium | Cron jobs, Auto-restore | Yes |
| **Role Upgrade** | Low | Auto + Manual | No |
| **View Tracking** | Low | Cache with TTL | No |

---

**Phiên bản:** 1.0
**Ngày cập nhật:** 2025-01-09
**Tác giả:** Technical Documentation Team

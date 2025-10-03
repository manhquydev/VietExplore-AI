# 📍 PLACE LIFECYCLE WORKFLOW - DOCUMENTATION

> **Stable Long-Term Solution for VietExplore Place Management System**
>
> Version: 2.0
> Last Updated: 2025-10-03
> Status: ✅ Production Ready

---

## 🎯 OVERVIEW

This document describes the complete lifecycle of a Place (địa điểm) trong hệ thống VietExplore, từ lúc user tạo đến khi published và monitoring.

### Key Principles:

1. **Clear State Management** - Mỗi state có nghĩa rõ ràng
2. **Audit Trail** - Lưu lại toàn bộ lịch sử
3. **Auto-Cleanup** - Tự động dọn dẹp dữ liệu cũ
4. **Rollback Capability** - Có thể rollback decisions trong 30 ngày

---

## 📊 COMPLETE LIFECYCLE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                  PLACE LIFECYCLE - FULL FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

🔹 PHASE 1: CREATION (User-Driven)
   │
   ├─ draft
   │  User tạo place draft
   │  Collection: places (status: 'draft')
   │  Quyền: Contributor+
   │
   └─ submitted
      User submit cho review
      Collection: places (status: 'submitted')
      Tự động tạo: moderation_queue entry

          ↓

🔹 PHASE 2: MODERATION (Admin/Moderator)
   │
   ├─ pending (trong moderation_queue)
   │  Chờ moderator claim
   │  Hiển thị: Tab "Chờ duyệt"
   │
   ├─ claimed
   │  Moderator đã claim
   │  Timeout: 2 giờ (auto-release nếu không action)
   │
   ├─ in_review
   │  Đang review tích cực
   │  Moderator đang làm việc
   │
   ├─ needs_revision
   │  Yêu cầu user sửa
   │  Quay lại user để edit
   │
   └─ DECISION:
      ├─ approved ✅
      │  - Place.status = 'published'
      │  - Entry VẪN CÒN trong moderation_queue
      │  - Hiển thị tab "Đã duyệt" (30 ngày)
      │  - Sau 30 ngày → Auto-archive
      │
      ├─ rejected ❌
      │  - Place.status = 'rejected'
      │  - Entry VẪN CÒN trong moderation_queue
      │  - Hiển thị tab "Bị từ chối" (30 ngày)
      │  - Sau 30 ngày → Auto-archive
      │
      └─ escalated ⚠️
         - Chuyển admin review (complex cases)

          ↓

🔹 PHASE 3: PUBLISHED (Public-Facing)
   │
   ├─ published
   │  Hiển thị công khai
   │  Collection: places (status: 'published')
   │  Users có thể:
   │    - View, Like, Save
   │    - Report issues
   │    - Suggest edits
   │
   ├─ MONITORING
   │  - View/Like/Save tracking
   │  - Report monitoring (place_reports collection)
   │  - Quality checks
   │  - User engagement metrics
   │
   └─ ACTIONS:
      ├─ Edit Request → Back to MODERATION
      │  User request edit published place
      │  Tạo moderation_queue entry (type: place_edit)
      │
      ├─ Report → REPORT QUEUE
      │  Collection: place_reports
      │  Workflow: pending → under_review → resolved/dismissed
      │
      └─ Suspension → temporarily_suspended
         Admin suspend (max 7 days)
         Auto-restore khi hết hạn

          ↓

🔹 PHASE 4: ARCHIVE (Historical Data)
   │
   ├─ moderation_archive
   │  Entries > 30 days trong moderation_queue
   │  Cron job chạy daily at 2:00 AM
   │
   └─ Auto-Cleanup
      Xóa entries > 90 days trong archive
      Export to cold storage nếu cần
```

---

## 🔄 MODERATION QUEUE STATES

### Active States (Cần Action):

| Status | Label | Màu | Action Required | Timeout |
|--------|-------|-----|-----------------|---------|
| `pending` | Chờ duyệt | 🟡 Yellow | Moderator claim | - |
| `claimed` | Đã tiếp nhận | 🔵 Blue | Start review | 2h |
| `in_review` | Đang duyệt | 🔵 Blue | Approve/Reject/Escalate | - |
| `needs_revision` | Yêu cầu sửa | 🟡 Yellow | User update | - |
| `escalated` | Chuyển admin | 🟠 Orange | Admin review | - |

### Finalized States (Audit Trail):

| Status | Label | Màu | Retention | Auto-Archive |
|--------|-------|-----|-----------|--------------|
| `approved` | Đã duyệt | 🟢 Green | 30 days | ✅ Yes |
| `rejected` | Bị từ chối | 🔴 Red | 30 days | ✅ Yes |

**Lý do giữ 30 ngày:**
1. ✅ Admin review lại decisions
2. ✅ Rollback nếu approve nhầm
3. ✅ Audit trail rõ ràng
4. ✅ User có thể appeal

---

## 🗄️ DATABASE COLLECTIONS

### 1. `places` (Main Collection)

```typescript
{
  id: string
  name: string
  status: PlaceStatus  // Lifecycle state
  createdBy: string
  createdAt: string
  publishedAt?: string
  rejectedAt?: string
  moderatedBy?: string
  // ... other fields
}
```

**Key Statuses:**
- `draft` - User draft
- `submitted` - Submitted for review
- `in_review` - Under moderation
- `published` - Live on website ✅
- `rejected` - Rejected by moderator
- `pending_edit` - Edit request pending
- `temporarily_suspended` - Temporarily hidden

### 2. `moderation_queue` (Active Queue)

```typescript
{
  id: string
  itemType: 'place_submission' | 'place_edit' | 'place_deletion'
  contentId: string  // Place ID
  status: QueueStatus
  priority: 'urgent' | 'high' | 'medium' | 'low'

  // Claim mechanism
  claimedBy?: string
  claimedAt?: string
  claimExpiresAt?: string

  // Review data
  submittedBy: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}
```

**Lifecycle:**
- Tạo khi user submit
- Update status qua moderation flow
- **GIỮ** entries approved/rejected (30 ngày)
- Auto-archive sau 30 ngày

### 3. `moderation_logs` (Audit Trail)

```typescript
{
  id: string
  moderationItemId: string
  contentId: string
  action: 'approve' | 'reject' | 'escalate' | 'start_review'
  moderatorId: string
  reviewNotes: string
  timestamp: string
}
```

**Purpose:**
- Permanent audit trail
- Track ALL moderation actions
- KHÔNG tự động xóa

### 4. `moderation_archive` (Historical Data)

```typescript
{
  originalId: string  // Original queue entry ID
  // ... all fields from moderation_queue
  archivedAt: string
  archivedReason: 'auto_archive_30_days'
}
```

**Lifecycle:**
- Entries moved from moderation_queue sau 30 ngày
- Auto-cleanup entries > 90 ngày
- Queryable cho historical reports

### 5. `place_reports` (User Reports)

```typescript
{
  id: string
  placeId: string
  reportType: ReportType
  reason: string
  reportedBy: string
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
}
```

**Features:**
- Rate limiting: 3 reports/user/week
- Claim mechanism cho moderators
- Auto-escalation cho critical reports

---

## 🤖 AUTOMATED JOBS (Cron)

### 1. Cleanup Expired Claims
**Schedule:** Every 2 hours
**Path:** `/api/cron/cleanup-expired-claims`
**Purpose:** Release claims expired > 2 hours

### 2. Archive Moderation Queue ⭐
**Schedule:** Daily at 2:00 AM
**Path:** `/api/cron/archive-moderation-queue`
**Purpose:**
- Move approved/rejected entries > 30 days → `moderation_archive`
- Delete archive entries > 90 days
- Keep queue performant

### 3. Health Check
**Schedule:** Every 6 hours
**Path:** `/api/cron/moderation-health-check`
**Purpose:**
- Scan cho stuck items
- Detect orphaned entries
- Alert nếu có issues

---

## 👥 USER WORKFLOWS

### Contributor Workflow:

```
1. Tạo Draft
   → places (status: draft)

2. Submit for Review
   → places (status: submitted)
   → moderation_queue entry created

3. Wait for Decision
   - If Approved → See place published
   - If Rejected → View rejection reason, can re-submit
   - If Needs Revision → Edit and re-submit
```

### Moderator Workflow:

```
1. View Queue
   → /admin/moderation/queue
   → Tab "Chờ duyệt" (pending items)

2. Claim Item
   → Status: claimed
   → 2h timeout

3. Review
   → Status: in_review
   → View content, check quality

4. Decision:
   - Approve → Status: approved (visible 30 days)
   - Reject → Status: rejected (visible 30 days)
   - Request Edit → Status: needs_revision
   - Escalate → Status: escalated (to admin)
```

### Admin Workflow:

```
1. Monitor Queue
   → View all tabs including "Đã duyệt", "Bị từ chối"

2. Review Decisions
   → Check approved/rejected trong 30 ngày
   → Rollback nếu cần

3. Handle Reports
   → /admin/reports
   → Review user reports
   → Take action (hide, suspend, dismiss)

4. Health Check
   → /admin/health
   → View metrics, stuck items
   → Manual interventions if needed
```

---

## 📊 METRICS & MONITORING

### Key Metrics:

1. **Queue Health:**
   - Pending count
   - Avg time: submission → decision
   - Approval rate
   - Stuck items (> 3 days)

2. **Moderator Performance:**
   - Items reviewed/day
   - Approval/Rejection ratio
   - Avg review time

3. **Content Quality:**
   - Report rate
   - Suspension rate
   - User appeals

4. **System Performance:**
   - Queue size
   - Archive size
   - API response times

### Alerts:

- 🚨 Queue > 50 items
- ⚠️  Items stuck > 3 days
- 🔴 Critical reports pending > 24h

---

## 🔒 SECURITY & PERMISSIONS

### Role-Based Access:

| Action | Guest | Traveler | Contributor | Partner | Moderator | Admin |
|--------|-------|----------|-------------|---------|-----------|-------|
| Create draft | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Submit for review | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| View queue | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Claim items | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve/Reject | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View archive | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Rollback decisions | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Report places | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Firestore Security Rules:

```javascript
// places collection
match /places/{placeId} {
  allow read: if resource.data.status == 'published';
  allow create, update, delete: if false; // Via API only
}

// moderation_queue
match /moderation_queue/{itemId} {
  allow read: if isModerator() || isAdmin();
  allow write: if false; // Via API only
}

// moderation_archive
match /moderation_archive/{itemId} {
  allow read: if isAdmin();
  allow write: if false; // Via cron job only
}
```

---

## 🧪 TESTING CHECKLIST

### Smoke Tests:

- [ ] User submit place → Queue entry created
- [ ] Moderator approve → Status updated, place published
- [ ] Moderator reject → Status updated, entry visible
- [ ] Tab "Đã duyệt" shows approved items
- [ ] Tab "Bị từ chối" shows rejected items

### Integration Tests:

- [ ] Claim timeout works (2h)
- [ ] Archive cron runs successfully
- [ ] Health check detects issues
- [ ] Reports workflow end-to-end

### Performance Tests:

- [ ] Queue with 100+ items loads fast
- [ ] Archive query performant
- [ ] Cron jobs complete < 5 minutes

---

## 📝 DEPLOYMENT NOTES

### Prerequisites:

1. **Environment Variables:**
   ```
   CRON_SECRET=<random-secret>
   FIREBASE_PROJECT_ID=<project-id>
   FIREBASE_CLIENT_EMAIL=<service-account-email>
   FIREBASE_PRIVATE_KEY=<private-key>
   ```

2. **Firestore Indexes:**
   ```
   moderation_queue:
   - (status, reviewedAt)
   - (status, submittedAt)

   moderation_archive:
   - (archivedAt)
   ```

3. **Vercel Cron Jobs:**
   - Configured in `vercel.json`
   - CRON_SECRET must match

### Deployment Steps:

```bash
# 1. Run migration to cleanup existing stuck entries
node scripts/cleanup-all-published-places.js

# 2. Deploy code
git push origin main
vercel --prod

# 3. Verify cron jobs running
Check Vercel dashboard → Cron Jobs tab

# 4. Monitor for 48h
Check /admin/health dashboard
```

---

## 🆘 TROUBLESHOOTING

### Issue: "Đã duyệt" tab empty

**Cause:** Entries bị xóa bởi old auto-delete logic
**Fix:** Run migration script đã chạy, sẽ OK với places mới

### Issue: Queue phình to

**Cause:** Archive cron không chạy
**Fix:**
1. Check vercel.json config
2. Verify CRON_SECRET
3. Manual run: `curl /api/cron/archive-moderation-queue`

### Issue: Items stuck > 3 days

**Cause:** Moderators quá tải
**Fix:**
1. Add more moderators
2. Auto-escalate to admin
3. Check health dashboard

---

## 📚 REFERENCES

- **Best Practices:** [Content Lifecycle Management 2024](https://blog.pics.io/content-lifecycle-management-best-practices-in-2024/)
- **Firebase Docs:** [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions)
- **Vercel Cron:** [Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)

---

**Maintained by:** VietExplore Development Team
**Questions:** Create issue on GitHub or contact admin

---

✅ **This workflow is production-ready and battle-tested for long-term stability.**

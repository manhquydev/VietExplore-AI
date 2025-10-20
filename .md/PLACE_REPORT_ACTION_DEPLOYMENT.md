# Place Report → Action Workflow - Deployment Guide

## 📋 Implementation Summary

**Date:** 2025-01-05
**Status:** ✅ Implementation Complete, Pending Deployment

### What Was Built

Complete atomic workflow for resolving place reports with concrete actions on the place:

1. **PlaceActionSelector Component** - UI for choosing action when resolving report
2. **API Endpoint** - Atomic report resolution + place action execution
3. **Notification System** - Email + in-app notifications for all actions
4. **Firestore Configuration** - Indexes and rules for new collections

### 4 Action Types

| Action | Place Status | Auto-Restore | Notification | Use Case |
|--------|-------------|--------------|--------------|----------|
| **Request Edit** | `needs_revision` | No | In-app | Minor issues, owner can fix |
| **Suspend** | `temporarily_suspended` | Yes (1-168h) | Email + in-app | Investigation needed |
| **Hide Permanent** | `hidden` | Manual only | Email + in-app | Serious violations |
| **Warning Only** | No change | N/A | In-app only | First-time minor offense |

---

## 🚀 Deployment Steps

### Step 1: Deploy Firestore Configuration

**Deploy indexes and rules:**

```bash
# Deploy indexes for suspension_schedules collection
firebase deploy --only firestore:indexes

# Deploy security rules
firebase deploy --only firestore:rules
```

**Verify in Firebase Console:**
1. Go to Firestore → Indexes
2. Check these indexes exist and are **Active**:
   - `suspension_schedules`: (processed ASC, expiresAt ASC)
   - `suspension_schedules`: (placeId ASC, processed ASC)

⏱️ **Wait time:** 5-10 minutes for indexes to build

---

### Step 2: Deploy Application Code

```bash
# Build and deploy
npm run build
firebase deploy --only hosting

# Or deploy all
firebase deploy
```

---

### Step 3: Create Auto-Restore Cron Job

**⚠️ IMPORTANT:** Without this cron job, suspended places will NOT auto-restore!

Create file: `src/app/api/cron/restore-suspended-places/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminDb = getAdminDb();
    const now = new Date().toISOString();

    // Query expired suspensions
    const snapshot = await adminDb.collection('suspension_schedules')
      .where('processed', '==', false)
      .where('expiresAt', '<=', now)
      .get();

    const restored: string[] = [];
    const errors: any[] = [];

    for (const doc of snapshot.docs) {
      const { placeId } = doc.data();

      try {
        // Restore place to published status
        await adminDb.collection('places').doc(placeId).update({
          status: 'published',
          suspendedAt: null,
          suspendedBy: null,
          suspensionReason: null,
          suspensionExpiresAt: null,
          updatedAt: now,
          autoRestoredAt: now
        });

        // Mark schedule as processed
        await doc.ref.update({ processed: true, processedAt: now });

        restored.push(placeId);
        console.log(`[AUTO-RESTORE] Restored place ${placeId}`);
      } catch (error) {
        console.error(`[AUTO-RESTORE] Failed to restore ${placeId}:`, error);
        errors.push({ placeId, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      restored: restored.length,
      errors: errors.length,
      details: { restored, errors }
    });

  } catch (error) {
    console.error('[AUTO-RESTORE] Cron job failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Setup Cron Job (using Vercel Cron or Cloud Scheduler):**

**Option A: Vercel Cron** (add to `vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/restore-suspended-places",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Option B: Google Cloud Scheduler:**
```bash
gcloud scheduler jobs create http restore-suspended-places \
  --schedule="0 * * * *" \
  --uri="https://your-domain.com/api/cron/restore-suspended-places" \
  --http-method=GET \
  --headers="Authorization=Bearer YOUR_CRON_SECRET"
```

**Add to `.env.local` and production:**
```bash
CRON_SECRET=your-random-secret-here
```

---

## ✅ Testing Checklist

### Manual Testing Workflow

**Test 1: Request Edit Action**
1. Login as moderator
2. Go to `/admin/moderation/reports`
3. Find a report in "Đang điều tra" status
4. Click "Giải quyết báo cáo"
5. Select "Yêu cầu chỉnh sửa"
6. Fill in notes: "Vui lòng cập nhật địa chỉ chính xác"
7. Confirm
8. **Verify:**
   - ✅ Report status → `resolved`
   - ✅ Place status → `needs_revision`
   - ✅ Owner receives notification
   - ✅ Entry appears in `moderation_queue`

**Test 2: Suspend Action**
1. Click "Giải quyết báo cáo"
2. Select "Tạm đình chỉ"
3. Set duration: 24 hours
4. Fill notes: "Đang điều tra thông tin sai lệch"
5. Confirm
6. **Verify:**
   - ✅ Report status → `resolved`
   - ✅ Place status → `temporarily_suspended`
   - ✅ `suspensionExpiresAt` = 24 hours from now
   - ✅ Entry in `suspension_schedules` with `processed: false`
   - ✅ Owner receives EMAIL + in-app notification
   - ✅ Place hidden from public search

**Test 3: Hide Permanent Action**
1. Click "Giải quyết báo cáo"
2. Select "Ẩn vĩnh viễn"
3. Fill notes: "Vi phạm nghiêm trọng quy định cộng đồng"
4. Confirm
5. **Verify:**
   - ✅ Report status → `resolved`
   - ✅ Place status → `hidden`
   - ✅ Owner receives EMAIL with appeal link
   - ✅ Place completely hidden from public

**Test 4: Warning Only Action**
1. Click "Giải quyết báo cáo"
2. Select "Chỉ cảnh báo owner"
3. Fill notes: "Vui lòng kiểm tra lại thông tin trước khi đăng"
4. Confirm
5. **Verify:**
   - ✅ Report status → `resolved`
   - ✅ Place status → UNCHANGED (stays `published`)
   - ✅ Owner receives in-app notification
   - ✅ Entry in `moderation_logs` with action = `place_warning_issued`

**Test 5: Auto-Restore (after 24h or manually trigger cron)**
1. Wait for suspension to expire OR manually trigger cron:
   ```bash
   curl -X GET https://your-domain.com/api/cron/restore-suspended-places \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
2. **Verify:**
   - ✅ Place status → `published`
   - ✅ `suspendedAt`, `suspensionReason` cleared
   - ✅ `suspension_schedules` entry marked `processed: true`
   - ✅ Place visible in public search again

---

## 🔍 Monitoring & Debugging

### Log Prefixes

Watch for these in production logs:

```
[RESOLVE-WITH-ACTION] - Main workflow
[REQUEST-EDIT] - Request edit action
[SUSPEND] - Suspend action
[HIDE-PERMANENT] - Hide action
[WARNING-ONLY] - Warning action
[AUTO-RESTORE] - Cron job restoring suspensions
[NOTIFICATION] - Notification sending
```

### Common Issues

**Issue 1: "The query requires an index"**
- **Cause:** Firestore indexes not deployed or still building
- **Fix:** Run `firebase deploy --only firestore:indexes` and wait 5-10 min

**Issue 2: Notifications not received**
- **Cause:** EnhancedNotificationService not properly initialized
- **Check:** Firebase Realtime Database path `/notifications/{userId}`
- **Verify:** User has `place.createdBy` field matching their ID

**Issue 3: Suspended place not auto-restoring**
- **Cause:** Cron job not running
- **Check:** Cron job logs in Vercel/Cloud Scheduler
- **Manual trigger:** `curl` the cron endpoint with auth header

**Issue 4: Report can't be resolved (403 Forbidden)**
- **Cause:** User not moderator/admin
- **Check:** User role in Firestore `users` collection
- **Verify:** `reviewerInfo.id` matches current user for claimed reports

---

## 📊 Success Metrics

Monitor these metrics post-deployment:

1. **Report Resolution Rate**
   - Target: >80% resolved within SLA
   - Query: `place_reports.where('status', '==', 'resolved').count()`

2. **Action Distribution**
   - Track usage of each action type
   - Expected: Request Edit > Warning > Suspend > Hide

3. **Auto-Restore Success Rate**
   - Target: 100% of scheduled restorations complete
   - Query: `suspension_schedules.where('processed', '==', true).count()`

4. **Notification Delivery Rate**
   - Target: >95% delivered
   - Check: Realtime DB vs Firestore report count

---

## 🐛 Known Limitations

1. **No Appeal System** - Hidden places can't be appealed yet (future work)
2. **No Bulk Actions** - Must resolve reports one by one
3. **No Undo** - Actions are permanent (except suspend auto-restores)
4. **Email Rate Limits** - SendGrid free tier: 100 emails/day

---

## 📝 Future Enhancements

- [ ] Appeal system for hidden places
- [ ] Bulk report resolution
- [ ] Admin dashboard for suspension analytics
- [ ] Automatic severity detection (AI-based)
- [ ] Integration with external content moderation APIs

---

## 📞 Support

If you encounter issues:

1. Check CLAUDE.md "Place Report → Action Workflow" section
2. Review logs with relevant prefixes
3. Verify Firestore indexes are active
4. Test notifications in Realtime Database

**Created:** 2025-01-05
**Last Updated:** 2025-01-05

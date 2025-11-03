# Firebase Functions - Backend Services

**Firebase Project:** `vietexplore-ai`
**Runtime:** Node.js 18
**Location:** `functions/src/index.ts`
**Deployment:** `firebase deploy --only functions`

---

## 📋 Tổng Quan

Firebase Functions là **serverless backend** của dự án, xử lý:
1. **Real-time sync** giữa Firestore ↔ Realtime Database
2. **Scheduled cron jobs** thay thế Vercel Cron (migration từ Next.js API routes)
3. **Background processing** (moderation, stats aggregation)
4. **Callable functions** cho admin operations

---

## 🏗️ Kiến Trúc Functions

### Phân Loại Functions

| Category | Count | Purpose |
|----------|-------|---------|
| **Firestore Triggers** | 3 | Sync data changes to Realtime DB |
| **Scheduled Jobs** | 5 | Automated background tasks |
| **HTTP Callable** | 2 | Admin-triggered operations |

**Total:** 10 Firebase Functions

---

## 📡 FIRESTORE TRIGGERS (3 Functions)

### 1. `syncPlaceStats`

**Trigger:** `onWrite('places/{placeId}')`
**Purpose:** Sync place stats từ Firestore sang Realtime Database

**Workflow:**
```
Firestore: places/{placeId} updated
  ↓
Check if document deleted → Remove from RTDB
  ↓
Idempotency check (compare placeUpdatedAt timestamps)
  ↓
Skip if existing data is newer (prevent stale overwrites)
  ↓
Sync stats to RTDB: places/{placeId}/stats
  {
    views, likes, saves, status,
    region, type, province,
    lastUpdated, eventId
  }
```

**Key Features:**
- ✅ **Idempotency fix** (2025-01-04): Prevents race conditions bằng timestamp comparison
- ✅ **Event deduplication:** Uses `context.eventId` để track processed events
- ✅ **Stale update protection:** Compares `placeUpdatedAt` trước khi overwrite

**Why Sync to RTDB:**
- Realtime updates cho admin dashboard
- Faster reads (RTDB < 50ms vs Firestore ~200ms)
- Reduce Firestore read costs

**Files:**
- `functions/src/index.ts:13-70`

---

### 2. `syncUserStats`

**Trigger:** `onWrite('users/{userId}')`
**Purpose:** Sync user stats cho admin dashboard

**Workflow:**
```
Firestore: users/{userId} updated
  ↓
Check if deleted → Remove from RTDB
  ↓
Extract user stats: role, status, contributionCount, trustLabel
  ↓
Sync to RTDB: users/{userId}/stats
```

**Synced Fields:**
- `role`, `status`, `lastActive`
- `contributionCount`, `trustLabel`
- `joinedAt`, `lastUpdated`

**Files:**
- `functions/src/index.ts:76-111`

---

### 3. `syncModerationQueue`

**Trigger:** `onWrite('moderation_queue/{itemId}')`
**Purpose:** Real-time sync moderation queue cho admin dashboard

**Workflow:**
```
Firestore: moderation_queue/{itemId} updated
  ↓
Check if deleted → Cleanup RTDB + update stats
  ↓
Idempotency check (event already processed?)
  ↓
Mark event as processed (TTL 24h auto-cleanup)
  ↓
Sync to RTDB: moderation_queue_updates/{itemId}
  ↓
Update aggregated stats: admin/moderation/stats
```

**Key Features:**
- ✅ **Event deduplication:** Tracks processed events trong `processed_events/moderation_queue/`
- ✅ **Auto-cleanup:** Processed events có TTL 24 hours
- ✅ **Stats aggregation:** Calls `updateModerationStats()` sau mỗi update

**Why Important:**
- Admin dashboard cần real-time moderation queue updates
- Prevents duplicate processing khi Firestore retries failed functions

**Files:**
- `functions/src/index.ts:119-183`
- Helper: `updateModerationStats()` (lines 188-209)

---

## ⏰ SCHEDULED FUNCTIONS (5 Functions)

### 1. `syncAdminStats`

**Schedule:** Every 5 minutes
**Purpose:** Periodic sync tổng stats cho admin dashboard

**Workflow:**
```
Every 5 minutes
  ↓
Count Firestore collections:
  - places.size
  - users.size
  ↓
Call updateModerationStats()
  ↓
Update RTDB: admin/dashboard/stats
  {
    totalPlaces, totalUsers,
    lastSyncAt
  }
```

**Why Needed:**
- Đảm bảo data consistency nếu Firestore triggers miss
- Backup mechanism cho real-time sync
- Aggregate stats từ multiple collections

**Files:**
- `functions/src/index.ts:215-248`

---

### 2. `publishScheduledAnnouncements`

**Schedule:** Every 15 minutes (`*/15 * * * *`)
**Timezone:** Asia/Ho_Chi_Minh
**Purpose:** Auto-publish announcements theo lịch hẹn

**Workflow:**
```
Every 15 minutes
  ↓
Query: announcements WHERE status='scheduled'
  ↓
For each announcement:
  Check if scheduledFor <= now
    YES → Update status='published', publishedAt=now
    NO  → Skip (log "not yet time")
  ↓
Log results to admin_logs collection
  {
    processed, published, errors,
    publishedIds: [...]
  }
```

**Use Case:**
- Moderator tạo announcement trước
- Đặt `scheduledFor = "2025-02-01T09:00:00Z"`
- Function tự động publish đúng giờ

**Error Handling:**
- Individual failures không block toàn bộ batch
- Errors logged to `admin_logs` collection
- Critical failures trigger alert (TODO: email/Slack)

**Files:**
- `functions/src/index.ts:299-390`

---

### 3. `scheduledCleanupExpiredClaims`

**Schedule:** Every 2 hours
**Timeout:** 5 minutes
**Memory:** 512MB
**Purpose:** Auto-release moderation claims bị timeout (> 2h)

**Workflow:**
```
Every 2 hours
  ↓
Query: moderation_queue WHERE status='claimed' AND claimExpiresAt < now
  ↓
For each expired claim:
  Update status='pending'
  Delete: claimedBy, claimedAt, claimExpiresAt
  Add: autoReleasedAt, autoReleaseReason
  ↓
Log: Released {count} expired claims
```

**Why Important:**
- Moderator claim job nhưng quên hoặc bị gián đoạn
- Claim timeout sau 2 giờ → Tự động trả về queue
- Đảm bảo moderation không bị stuck

**Replaces:**
- Vercel cron: `/api/cron/cleanup-expired-claims`

**Files:**
- `functions/src/index.ts:481-542`

---

### 4. `scheduledArchiveModerationQueue`

**Schedule:** Daily at 2:00 AM Vietnam time (`0 2 * * *`)
**Timeout:** 9 minutes
**Memory:** 1GB
**Purpose:** Archive approved/rejected entries > 30 days

**Workflow:**
```
Daily at 2AM
  ↓
Query: moderation_queue WHERE
  (status='approved' OR status='rejected')
  AND reviewedAt < (now - 30 days)
  ↓
For each entry (batches of 100):
  1. Copy to moderation_archive
  2. Delete from moderation_queue
  ↓
Cleanup old archives (> 90 days):
  Delete from moderation_archive WHERE archivedAt < (now - 90 days)
  ↓
Log results to admin_logs
```

**Retention Policy:**
- **30 days:** Approved/rejected entries stay in queue (audit trail)
- **90 days:** Archives permanently deleted
- **Total retention:** 120 days max

**Performance:**
- Processes in batches (100 entries/batch) để tránh timeout
- Parallel processing với `Promise.all()`

**Replaces:**
- Vercel cron: `/api/cron/archive-moderation-queue`

**Files:**
- `functions/src/index.ts:552-660`

---

### 5. `scheduledCleanupDeletedPlaces`

**Schedule:** Daily at 3:00 AM Vietnam time (`0 3 * * *`)
**Timeout:** 9 minutes
**Memory:** 1GB
**Purpose:** Permanently delete places in trash > 120 days

**Workflow:**
```
Daily at 3AM
  ↓
Query: deleted_places WHERE autoDeleteAt <= now
  ↓
For each expired place:
  1. Log to moderation_logs (audit trail)
  2. Delete from deleted_places (permanent)
  ↓
Log results to admin_logs
  {
    scanned, deleted, errors,
    deletedPlaces: [{id, name, deletedAt}]
  }
```

**Trash Workflow:**
1. Admin deletes place → Move to `deleted_places` collection
2. Set `autoDeleteAt = deletedAt + 120 days`
3. Admin có 120 ngày để restore
4. Sau 120 ngày: Function tự động xóa vĩnh viễn

**Audit Trail:**
- Mỗi permanent delete được log với:
  - `placeId`, `placeName`, `deletedBy`
  - `deletedAt`, `autoDeleteAt`
  - `reason: "Auto-deleted after 120 days in trash"`

**Replaces:**
- Vercel cron: `/api/cron/cleanup-deleted-places`

**Files:**
- `functions/src/index.ts:670-776`

---

### 6. `scheduledModerationHealthCheck`

**Schedule:** Every 6 hours
**Timeout:** 5 minutes
**Memory:** 512MB
**Purpose:** Monitor moderation queue health và detect issues

**Workflow:**
```
Every 6 hours
  ↓
Scan toàn bộ moderation_queue
  ↓
Collect stats:
  - Count by status (pending, claimed, in_review)
  - Stuck items (> 3 days in pending/claimed)
  - Approved not archived (> 3 days after review)
  ↓
Generate health report:
  healthy: true/false
  issues: [{severity, type, description, affectedItems}]
  ↓
Save to moderation_health_logs
  ↓
If NOT healthy → Alert (TODO: email/Slack)
```

**Health Checks:**

| Check | Threshold | Severity | Action |
|-------|-----------|----------|--------|
| Stuck items | > 3 days | Warning | Flag for manual review |
| High backlog | > 50 pending | Warning | Alert moderators |
| Approved not archived | > 30 days | Info | Trigger manual archive |

**Output Example:**
```json
{
  "timestamp": "2025-01-23T02:00:00Z",
  "healthy": false,
  "stats": {
    "totalPending": 65,
    "totalClaimed": 5,
    "totalInReview": 3,
    "stuckItems": 8,
    "approvedNotArchived": 2
  },
  "issues": [
    {
      "severity": "warning",
      "type": "HIGH_QUEUE_BACKLOG",
      "description": "Queue has 65 pending items"
    },
    {
      "severity": "warning",
      "type": "STUCK_ITEMS",
      "description": "8 items stuck > 3 days",
      "affectedItems": ["abc123", "def456", ...]
    }
  ]
}
```

**Replaces:**
- Vercel cron: `/api/cron/moderation-health-check`

**Files:**
- `functions/src/index.ts:786-896`

---

## 🔧 HTTP CALLABLE FUNCTIONS (2 Functions)

### 1. `manualSyncStats`

**Type:** `functions.https.onCall`
**Auth:** Admin role required
**Purpose:** Manual trigger sync tất cả stats (backup mechanism)

**Workflow:**
```
Admin calls function
  ↓
Verify auth.token.role === 'admin'
  ↓
Parallel fetch:
  - places.size
  - users.size
  ↓
Call updateModerationStats()
  ↓
Update RTDB: admin/dashboard/stats
  {
    totalPlaces, totalUsers,
    lastManualSyncAt,
    syncTriggeredBy: admin.uid
  }
  ↓
Return success response
```

**Usage từ Admin Panel:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const manualSync = httpsCallable(functions, 'manualSyncStats');

const result = await manualSync();
console.log(result.data);
// {
//   success: true,
//   message: "Manual sync completed successfully",
//   stats: { places: 450, users: 1200 }
// }
```

**When to Use:**
- Sau khi bulk import data
- Sau khi fix data corruption
- Testing/debugging dashboard stats

**Files:**
- `functions/src/index.ts:254-293`

---

### 2. `triggerPublishScheduledAnnouncements`

**Type:** `functions.https.onCall`
**Auth:** Admin role required
**Purpose:** Manual trigger publish scheduled announcements

**Workflow:**
```
Admin calls function
  ↓
Verify auth.token.role === 'admin'
  ↓
Query: announcements WHERE status='scheduled'
  ↓
For each announcement:
  Check if scheduledFor <= now
    YES → Publish
    NO  → Skip
  ↓
Log to admin_logs
  ↓
Return results: {processed, published, publishedIds}
```

**Usage từ Admin Panel:**
```typescript
const triggerPublish = httpsCallable(functions, 'triggerPublishScheduledAnnouncements');

const result = await triggerPublish();
console.log(result.data);
// {
//   success: true,
//   message: "Published 3 announcements",
//   results: {
//     processed: 5,
//     published: 3,
//     errors: [],
//     publishedIds: ["abc", "def", "ghi"]
//   }
// }
```

**When to Use:**
- Test announcement scheduling
- Force publish trước giờ hẹn (emergency)
- Verify scheduled announcements hoạt động đúng

**Files:**
- `functions/src/index.ts:396-467`

---

## 🔄 Migration: Vercel Cron → Firebase Functions

### Tại Sao Migrate?

**Vấn Đề Vercel Cron:**
- ❌ Không reliable với free tier (rate limited)
- ❌ Cold start 5-10 seconds cho mỗi cron job
- ❌ Timeout 10 giây (Hobby plan) / 5 phút (Pro plan)
- ❌ Không có retry mechanism built-in
- ❌ Cron secret có thể bị expose qua logs

**Lợi Ích Firebase Functions:**
- ✅ **Reliable:** Google infrastructure, 99.95% SLA
- ✅ **Flexible timeout:** Lên đến 9 phút (540 seconds)
- ✅ **Auto-retry:** Built-in retry for failed functions
- ✅ **Better logging:** Firebase Console + Cloud Logging
- ✅ **No cold start issues:** Scheduled functions kept warm

### Mapping Vercel → Firebase

| Vercel Cron Route | Firebase Function | Schedule |
|------------------|-------------------|----------|
| `/api/cron/cleanup-expired-claims` | `scheduledCleanupExpiredClaims` | Every 2 hours |
| `/api/cron/archive-moderation-queue` | `scheduledArchiveModerationQueue` | Daily 2AM |
| `/api/cron/cleanup-deleted-places` | `scheduledCleanupDeletedPlaces` | Daily 3AM |
| `/api/cron/moderation-health-check` | `scheduledModerationHealthCheck` | Every 6 hours |
| `/api/cron/publish-scheduled-announcements` | `publishScheduledAnnouncements` | Every 15 min |

**Status:**
- ✅ Firebase Functions deployed và active
- ⚠️ Vercel cron routes vẫn tồn tại (fallback/backup)
- 📝 TODO: Xóa Vercel cron routes sau khi xác minh Firebase hoạt động ổn định 30 ngày

---

## 🚀 Deployment

### Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify project
firebase use vietexplore-ai
```

### Deployment Commands

```bash
# Deploy all functions
cd functions
npm run build    # Compile TypeScript
npm run deploy   # = firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:syncPlaceStats

# Deploy multiple functions
firebase deploy --only functions:scheduledCleanupExpiredClaims,scheduledArchiveModerationQueue
```

### Build Process

```
functions/src/index.ts (TypeScript)
  ↓ npm run build
functions/lib/index.js (JavaScript)
  ↓ firebase deploy --only functions
Firebase Cloud Functions (Production)
```

### Environment Variables

**Required in Firebase Console:**
1. Go to Firebase Console → Functions → Configuration
2. Set environment variables:
   ```bash
   # None required currently
   # All Firebase credentials auto-provided
   ```

**Note:** Firebase Admin SDK auto-initializes với project credentials, không cần manual config.

---

## 📊 Monitoring & Logs

### Firebase Console

**View Logs:**
1. Firebase Console → Functions
2. Click function name → Logs tab
3. Filter by:
   - Severity (INFO, WARNING, ERROR)
   - Time range
   - Text search

**Monitor Performance:**
- Invocations count
- Error rate
- Execution time
- Memory usage

### Console Logging Best Practices

**✅ Current Pattern:**
```typescript
console.log('[FUNCTION_NAME] Action description:', {data});
console.log('✅ Success message');
console.error('❌ Error message:', error);
console.log('='.repeat(60)); // Visual separator
```

**✅ Log Structured Data:**
```typescript
console.log(`[${eventId}] Synced place stats for ${placeId}:`, {
  views: 123,
  likes: 45,
  status: 'published'
});
```

**❌ Don't Log Sensitive Data:**
```typescript
// ❌ BAD
console.log('User data:', userData); // May contain email, phone

// ✅ GOOD
console.log('Synced user stats:', {
  userId: user.id,
  role: user.role // Only safe fields
});
```

### Error Tracking

**Automatic Retry:**
- Firestore triggers: Auto-retry up to 7 days
- Scheduled functions: Auto-retry 3 times
- HTTP callable: No auto-retry (client handles)

**Failed Function Handling:**
```typescript
try {
  // Function logic
} catch (error) {
  console.error('[FUNCTION_NAME] Error:', error);
  // Log to admin_logs for visibility
  await db.collection('admin_logs').add({
    type: 'function_error',
    functionName: 'syncPlaceStats',
    error: error.message,
    timestamp: new Date().toISOString()
  });
  throw error; // Trigger retry
}
```

---

## 🔐 Security & Permissions

### Function Authentication

**Firestore Triggers:** No auth needed (server-side only)

**Scheduled Functions:** No auth needed (Cloud Scheduler calls)

**HTTP Callable Functions:**
```typescript
export const manualSyncStats = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  // Check role
  if (context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger manual sync');
  }

  // Function logic
});
```

### Firestore Admin SDK

**Firebase Admin SDK bypasses ALL security rules:**
- ✅ Can read/write any document
- ✅ Can delete any document
- ❌ Still needs Firestore indexes for compound queries

**Use Cases:**
- Background processing
- Bulk operations
- System-level tasks

**Don't Use Admin SDK For:**
- User-initiated actions (use client SDK với rules)
- Operations that should respect permissions

---

## 🧪 Testing

### Local Emulator

```bash
# Start emulator
cd functions
npm run serve

# OR full emulator suite
firebase emulators:start

# Test callable function
curl http://localhost:5001/vietexplore-ai/us-central1/manualSyncStats \
  -H "Content-Type: application/json" \
  -d '{"data": {}}'
```

### Manual Testing

**Test Firestore Triggers:**
```typescript
// In Firestore console, update a place document
// Watch function logs in Firebase Console
```

**Test Scheduled Functions:**
```bash
# Trigger manually via Cloud Functions console
# Or call with gcloud CLI
gcloud functions call scheduledCleanupExpiredClaims \
  --project vietexplore-ai
```

**Test HTTP Callable:**
```typescript
// In admin panel or test script
const functions = getFunctions();
const testFunc = httpsCallable(functions, 'manualSyncStats');
await testFunc();
```

---

## ⚠️ Common Issues

### Issue 1: Function Timeout

**Symptom:** Function exceeds timeout limit

**Solutions:**
```typescript
// Increase timeout in runWith()
export const myFunction = functions
  .runWith({
    timeoutSeconds: 540, // Max 9 minutes
    memory: '1GB'
  })
  .pubsub.schedule('0 2 * * *')
  .onRun(async (context) => {
    // Process in batches
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map(processItem));
    }
  });
```

### Issue 2: Race Conditions

**Problem:** Firestore triggers overwrite newer data

**Solution:** Use idempotency checks
```typescript
export const syncPlaceStats = functions.firestore
  .document('places/{placeId}')
  .onWrite(async (change, context) => {
    const placeData = change.after.data();
    const placeUpdatedAt = placeData?.updatedAt;

    // Fetch existing data
    const existingSnapshot = await rtdb.ref(`places/${placeId}/stats`).once('value');
    const existingStats = existingSnapshot.val();

    // Compare timestamps
    if (existingStats?.placeUpdatedAt) {
      const existingTime = new Date(existingStats.placeUpdatedAt).getTime();
      const newTime = new Date(placeUpdatedAt).getTime();

      if (existingTime >= newTime) {
        console.log('Skipping stale update');
        return; // Prevent overwrite
      }
    }

    // Proceed with update
    await rtdb.ref(`places/${placeId}/stats`).set({...});
  });
```

### Issue 3: Missing Indexes

**Error:** `The query requires an index`

**Solution:**
1. Click link trong error message
2. Or manually add to `firestore.indexes.json`:
```json
{
  "collectionGroup": "moderation_queue",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "claimExpiresAt", "order": "ASCENDING"}
  ]
}
```
3. Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

---

## 📈 Performance Optimization

### Best Practices

**1. Batch Operations:**
```typescript
// ❌ BAD - Sequential
for (const item of items) {
  await processItem(item);
}

// ✅ GOOD - Parallel
await Promise.all(items.map(item => processItem(item)));

// ✅ BETTER - Batched parallel
const batchSize = 100;
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize);
  await Promise.all(batch.map(processItem));
}
```

**2. Minimize Reads:**
```typescript
// ❌ BAD - N+1 queries
const users = await db.collection('users').get();
for (const user of users.docs) {
  const stats = await db.collection('user_stats').doc(user.id).get();
}

// ✅ GOOD - Batch fetch
const users = await db.collection('users').get();
const statDocs = await db.getAll(...users.docs.map(u =>
  db.collection('user_stats').doc(u.id)
));
```

**3. Use Transactions for Consistency:**
```typescript
// ✅ GOOD - Atomic update
await db.runTransaction(async (transaction) => {
  const doc = await transaction.get(docRef);
  if (doc.data().status !== 'claimed') {
    return; // Skip if state changed
  }
  transaction.update(docRef, {status: 'pending'});
});
```

---

## 🔄 Integration với Next.js

### Client-Side Calls (HTTP Callable)

```typescript
// src/lib/firebase/functions.ts
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './config';

const functions = getFunctions(app);

export async function triggerManualSync() {
  const manualSync = httpsCallable(functions, 'manualSyncStats');

  try {
    const result = await manualSync();
    return result.data;
  } catch (error) {
    console.error('Error calling manual sync:', error);
    throw error;
  }
}
```

### Admin Panel Integration

```typescript
// src/app/admin/dashboard/page.tsx
import { triggerManualSync } from '@/lib/firebase/functions';

export default function AdminDashboard() {
  const handleManualSync = async () => {
    try {
      const result = await triggerManualSync();
      alert(`Sync completed: ${result.stats.places} places, ${result.stats.users} users`);
    } catch (error) {
      alert('Sync failed: ' + error.message);
    }
  };

  return (
    <button onClick={handleManualSync}>
      Manual Sync Stats
    </button>
  );
}
```

### Real-time Data Subscription

```typescript
// src/hooks/use-realtime-stats.ts
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export function useRealtimeStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const statsRef = ref(db, 'admin/dashboard/stats');

    const unsubscribe = onValue(statsRef, (snapshot) => {
      setStats(snapshot.val());
    });

    return unsubscribe;
  }, []);

  return stats;
}
```

---

## 📝 TODO & Future Improvements

### Short-term (Next Sprint)

- [ ] **Add email/Slack alerts** cho health check failures
- [ ] **Implement retry logic** cho failed archive operations
- [ ] **Add metrics tracking** (execution time, error rates)
- [ ] **Remove Vercel cron routes** sau khi xác minh Firebase stable

### Long-term (Q1 2025)

- [ ] **Migration to Cloud Run** nếu cần more complex workflows
- [ ] **Add integration tests** với Firebase emulator
- [ ] **Implement dead letter queue** cho failed events
- [ ] **Add custom metrics** to Cloud Monitoring

---

## 📚 Related Documentation

- [@firebase-setup](./firebase-setup.md) - Firebase configuration và collections
- [@notification-system](../frontend/notification-system.md) - Integration với notification triggers
- [@moderation-workflow](./moderation-workflow.md) - Moderation state machine
- [@race-conditions](../lessons-learned/critical-patterns/race-conditions.md) - Race condition patterns

---

## 🔗 External Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Cloud Scheduler Cron Syntax](https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules)
- [Firebase Admin SDK Reference](https://firebase.google.com/docs/reference/admin/node)
- [Firestore Transaction Best Practices](https://firebase.google.com/docs/firestore/manage-data/transactions)

---

**Last Updated:** 2025-01-23
**Version:** 2.0.0 (Post-migration từ Vercel Cron)
**Maintainer:** Development Team

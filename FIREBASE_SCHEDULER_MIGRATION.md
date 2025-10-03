# 🔄 MIGRATION: Vercel Cron → Firebase Cloud Scheduler

> **Status:** ✅ Migration Complete - Ready for Deployment
>
> **Date:** 2025-10-03
> **Impact:** Improved reliability, independence from Vercel

---

## 📊 WHAT CHANGED

### ❌ BEFORE (Vercel Cron Jobs):

```json
// vercel.json
"crons": [
  { "path": "/api/cron/cleanup-expired-claims", "schedule": "0 */2 * * *" },
  { "path": "/api/cron/archive-moderation-queue", "schedule": "0 2 * * *" },
  { "path": "/api/cron/moderation-health-check", "schedule": "0 */6 * * *" }
]
```

**Problems:**
- ⚠️ Phụ thuộc Vercel & Next.js
- ⚠️ Nếu Next.js down → Cron không chạy
- ⚠️ Harder to monitor & debug

### ✅ AFTER (Firebase Cloud Scheduler):

```typescript
// functions/src/index.ts
export const scheduledCleanupExpiredClaims = functions
  .pubsub.schedule('every 2 hours')
  .timeZone('Asia/Ho_Chi_Minh')
  .onRun(...)

export const scheduledArchiveModerationQueue = functions
  .pubsub.schedule('0 2 * * *')
  .timeZone('Asia/Ho_Chi_Minh')
  .onRun(...)

export const scheduledModerationHealthCheck = functions
  .pubsub.schedule('every 6 hours')
  .timeZone('Asia/Ho_Chi_Minh')
  .onRun(...)
```

**Benefits:**
- ✅ **Independent** từ Next.js/Vercel
- ✅ **Reliable** - Firebase infrastructure
- ✅ **Better Monitoring** - Firebase Console
- ✅ **Vietnam Timezone** - Chính xác hơn
- ✅ **Cost-effective** - Đã có Blaze plan

---

## 🎯 WHY FIREBASE CLOUD SCHEDULER?

### 1. **Independence & Reliability**
- Không phụ thuộc Next.js app
- Firebase infrastructure cực kỳ stable
- Auto-retry nếu function fails

### 2. **Better Monitoring**
- Firebase Console → Functions → Logs
- Realtime monitoring
- Error tracking built-in

### 3. **Cost Optimization**
- Đã có Firebase Blaze plan
- Pub/Sub + Cloud Scheduler included
- Tối ưu resource usage

### 4. **Centralized Backend**
- Tất cả backend logic ở Firebase
- Dễ maintain & debug
- Single source of truth

---

## 📋 3 SCHEDULED FUNCTIONS

### Function 1: `scheduledCleanupExpiredClaims`

**Purpose:** Auto-release moderation claims expired > 2h

**Schedule:** Every 2 hours

**Logic:**
```
1. Find moderation_queue entries với:
   - status = 'claimed'
   - claimExpiresAt < now
2. Update to:
   - status = 'pending'
   - Remove claimedBy, claimedAt, claimExpiresAt
   - Add autoReleasedAt, autoReleaseReason
3. Log results
```

**Resources:**
- Timeout: 5 minutes
- Memory: 512MB

---

### Function 2: `scheduledArchiveModerationQueue` ⭐

**Purpose:** Archive approved/rejected entries > 30 days

**Schedule:** Daily at 2:00 AM (Vietnam time)

**Logic:**
```
1. Find moderation_queue entries với:
   - status IN ['approved', 'rejected']
   - reviewedAt < 30 days ago

2. For each entry:
   - Create copy in moderation_archive
   - Delete from moderation_queue

3. Cleanup moderation_archive:
   - Delete entries > 90 days old

4. Log results to admin_logs
```

**Resources:**
- Timeout: 9 minutes
- Memory: 1GB
- Batch processing: 100 entries/batch

---

### Function 3: `scheduledModerationHealthCheck`

**Purpose:** Monitor queue health & detect issues

**Schedule:** Every 6 hours

**Logic:**
```
1. Scan all moderation_queue entries
2. Count by status (pending, claimed, in_review)
3. Detect issues:
   - Stuck items (> 3 days in pending/claimed)
   - High queue backlog (> 50 pending)
   - Approved not archived (old finalized entries)
4. Generate health report
5. Save to moderation_health_logs
6. Alert if critical issues found
```

**Resources:**
- Timeout: 5 minutes
- Memory: 512MB

---

## 🚀 DEPLOYMENT GUIDE

### Prerequisites:

1. **Firebase CLI Installed:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Firebase Blaze Plan Active:**
   - ✅ Already active (confirmed by user)
   - Cloud Scheduler requires Blaze plan

3. **Project Selected:**
   ```bash
   firebase use --add
   # Select your project
   ```

### Deployment Steps:

#### Step 1: Build Functions

```bash
cd functions
npm install
npm run build
```

#### Step 2: Deploy Scheduled Functions

```bash
# Deploy all functions (includes scheduled ones)
npm run deploy

# Or deploy only scheduled functions:
firebase deploy --only functions:scheduledCleanupExpiredClaims,functions:scheduledArchiveModerationQueue,functions:scheduledModerationHealthCheck
```

#### Step 3: Verify Deployment

```bash
# Check Firebase Console
# Functions → Scheduler tab
# Should see 3 scheduled functions

# Or via CLI:
firebase functions:list
```

#### Step 4: Test Functions Manually (Optional)

```bash
# Trigger manually to test
firebase functions:shell

# In shell:
> scheduledCleanupExpiredClaims()
> scheduledArchiveModerationQueue()
> scheduledModerationHealthCheck()
```

---

## 🧪 VERIFICATION CHECKLIST

### After Deployment:

- [ ] **Firebase Console → Functions**
  - See 3 new scheduled functions
  - Status: Active
  - No deployment errors

- [ ] **Firebase Console → Scheduler**
  - See 3 Cloud Scheduler jobs
  - Next run times visible
  - Timezone: Asia/Ho_Chi_Minh

- [ ] **Firebase Console → Logs**
  - Watch for first scheduled run
  - Check for errors

- [ ] **Firestore Collections**
  - `admin_logs` - Archive results logged
  - `moderation_health_logs` - Health reports saved

### Within 24 Hours:

- [ ] Archive function ran at 2:00 AM
- [ ] Cleanup function ran (every 2h)
- [ ] Health check function ran (every 6h)
- [ ] No errors in logs
- [ ] Queue functioning normally

---

## 📊 MONITORING

### Firebase Console:

**Functions Dashboard:**
```
Firebase Console → Functions → Scheduler
```
View:
- Execution count
- Success rate
- Error rate
- Execution time

**Logs:**
```
Firebase Console → Functions → [Function Name] → Logs
```
Real-time logs cho mỗi execution.

### Firestore Logs:

**Archive Logs:**
```
Collection: admin_logs
Filter: type = 'moderation_queue_archive'
```

**Health Logs:**
```
Collection: moderation_health_logs
Sort by: createdAt DESC
```

---

## ⚠️ TROUBLESHOOTING

### Issue 1: Function Not Deploying

**Symptoms:**
```
Error: HTTP Error: 403, Permission denied
```

**Fix:**
```bash
# Enable required APIs
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable pubsub.googleapis.com

# Or via Firebase Console:
# Settings → Project Settings → Service Accounts
```

---

### Issue 2: Function Times Out

**Symptoms:**
```
Error: Function execution took longer than 540000ms
```

**Fix:**
Already configured with extended timeouts:
- Cleanup: 300s (5 min)
- Archive: 540s (9 min)
- Health Check: 300s (5 min)

If still timing out, check Firestore query performance.

---

### Issue 3: Wrong Timezone

**Symptoms:**
```
Archive runs at wrong time (not 2 AM Vietnam)
```

**Fix:**
Already configured:
```typescript
.timeZone('Asia/Ho_Chi_Minh')
```

Verify in Cloud Scheduler console.

---

### Issue 4: High Costs

**Monitoring:**
```
Firebase Console → Usage
Check:
- Cloud Functions invocations
- Pub/Sub messages
- Firestore reads/writes
```

**Expected Costs (per month):**
- Cleanup (every 2h): ~360 invocations
- Archive (daily): ~30 invocations
- Health (every 6h): ~120 invocations
- Total: ~510 invocations/month

**Cost:** ~$0.00 (well within free tier)

---

## 🔄 ROLLBACK PLAN

### If Issues After Deployment:

#### Option 1: Disable Scheduled Functions

```bash
# Via Firebase Console
Functions → [Function Name] → Disable

# Or delete functions:
firebase functions:delete scheduledCleanupExpiredClaims
firebase functions:delete scheduledArchiveModerationQueue
firebase functions:delete scheduledModerationHealthCheck
```

#### Option 2: Revert to Vercel Cron

```bash
# 1. Restore vercel.json
git checkout HEAD~1 vercel.json

# 2. Redeploy Next.js
vercel --prod

# 3. Delete Firebase functions
firebase functions:delete [function-names]
```

---

## 📈 BENEFITS SUMMARY

| Aspect | Vercel Cron | Firebase Scheduler |
|--------|-------------|-------------------|
| **Reliability** | Depends on Next.js | ✅ Independent |
| **Monitoring** | Limited | ✅ Firebase Console |
| **Timezone** | UTC-based | ✅ Vietnam timezone |
| **Cost** | Free (Vercel limit) | ✅ Blaze plan included |
| **Debugging** | Harder | ✅ Easy (Firebase logs) |
| **Scalability** | Limited | ✅ Excellent |
| **Independence** | ❌ Needs Next.js | ✅ Standalone |

---

## 🎓 BEST PRACTICES

### 1. Monitor Regularly

Check Firebase Console weekly:
- Execution success rate
- Error logs
- Execution duration

### 2. Set Up Alerts

Firebase Console → Alerting:
- Function error rate > 5%
- Function timeout
- High execution cost

### 3. Log Important Events

All functions already log to:
- Console (Firebase logs)
- Firestore (admin_logs, health_logs)

### 4. Test Before Critical Changes

```bash
# Always test locally first
firebase emulators:start --only functions

# Then deploy to staging (if available)
firebase use staging
firebase deploy --only functions

# Finally production
firebase use production
firebase deploy --only functions
```

---

## 📚 REFERENCES

- **Firebase Scheduled Functions:** [Documentation](https://firebase.google.com/docs/functions/schedule-functions)
- **Cloud Scheduler:** [Cron Syntax](https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules)
- **Firebase Pricing:** [Blaze Plan Details](https://firebase.google.com/pricing)

---

## ✅ FINAL CHECKLIST

### Pre-Deployment:
- [x] Code written & tested
- [x] Functions added to index.ts
- [x] vercel.json updated (deprecated crons)
- [x] Documentation created

### Deployment:
- [ ] Firebase CLI ready
- [ ] Functions built successfully
- [ ] Functions deployed to production
- [ ] Verified in Firebase Console

### Post-Deployment:
- [ ] Scheduler jobs visible
- [ ] First execution successful
- [ ] Logs showing correct behavior
- [ ] No errors detected
- [ ] Old Vercel crons disabled

---

**🎉 Migration Complete!**

**Next Steps:**
1. Deploy functions: `cd functions && npm run deploy`
2. Verify in Firebase Console
3. Monitor for 48 hours
4. Document any issues

**Questions?** Check Firebase Console → Functions → Logs for details.

---

**Maintained by:** VietExplore Development Team
**Updated:** 2025-10-03

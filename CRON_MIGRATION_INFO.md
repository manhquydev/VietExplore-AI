# ⏰ Cron Jobs Migration - Vercel → Firebase Cloud Scheduler

## 📋 Migration Status: ✅ **COMPLETED**

All cron jobs have been migrated from Vercel Cron to Firebase Cloud Scheduler for better reliability and cost optimization.

---

## 🔄 Migrated Jobs

### 1. **Cleanup Expired Claims**
**Old:** Vercel Cron `/api/cron/cleanup-expired-claims`
- Schedule: `0 */2 * * *` (Every 2 hours)

**New:** Firebase Function `scheduledCleanupExpiredClaims`
- Location: [functions/src/index.ts:481](functions/src/index.ts#L481)
- Schedule: Every 2 hours
- Timeout: 300s (5 min)
- Memory: 512MB

**Purpose:** Clean up expired moderation claim locks (2h timeout)

---

### 2. **Archive Moderation Queue**
**Old:** Vercel Cron `/api/cron/archive-moderation-queue`
- Schedule: `0 2 * * *` (Daily at 2 AM)

**New:** Firebase Function `scheduledArchiveModerationQueue`
- Location: [functions/src/index.ts:552](functions/src/index.ts#L552)
- Schedule: Daily at 2:00 AM Asia/Ho_Chi_Minh
- Timeout: 540s (9 min)
- Memory: 1GB

**Purpose:** Archive approved/rejected entries older than 30 days

---

### 3. **Moderation Health Check**
**Old:** Vercel Cron `/api/cron/moderation-health-check`
- Schedule: `0 */6 * * *` (Every 6 hours)

**New:** Firebase Function `scheduledModerationHealthCheck`
- Location: [functions/src/index.ts:670](functions/src/index.ts#L670)
- Schedule: Every 6 hours
- Timeout: 300s (5 min)
- Memory: 512MB

**Purpose:** Monitor moderation queue health and send alerts

---

## ✅ Why Firebase Cloud Scheduler?

### Vercel Cron (Old)
- ❌ Hobby plan: Limited to 1 cron job
- ❌ Pro plan required for multiple crons ($20/month)
- ❌ Execution limits và reliability issues
- ❌ No native timezone support
- ❌ Limited monitoring

### Firebase Cloud Scheduler (New)
- ✅ Free tier: 3 jobs/month included
- ✅ Better reliability (Google Cloud infrastructure)
- ✅ Native timezone support
- ✅ Better logging và monitoring via Firebase Console
- ✅ Tích hợp sẵn với Firebase Functions
- ✅ No cold start issues (scheduled functions)

---

## 🚀 Deployment

### Verify Functions Deployed
```bash
# List deployed functions
firebase functions:list

# Expected output:
# scheduledCleanupExpiredClaims
# scheduledArchiveModerationQueue
# scheduledModerationHealthCheck
```

### Check Schedules in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project **vietexplore-ai**
3. **Functions** → See all scheduled functions
4. **Cloud Scheduler** (in Google Cloud) → See cron schedules

---

## 🧪 Testing Scheduled Functions

### Manual Trigger (for testing)
```bash
# Test cleanup
firebase functions:shell
> scheduledCleanupExpiredClaims()

# Or via gcloud
gcloud scheduler jobs run scheduledCleanupExpiredClaims
```

### Check Logs
```bash
# View function logs
firebase functions:log --only scheduledCleanupExpiredClaims

# Or in Firebase Console
# Functions → Select function → Logs tab
```

---

## 📊 Monitoring

### Firebase Console Monitoring
- **Functions Dashboard**: See invocation counts, errors, duration
- **Logs**: Real-time logs với filtering
- **Alerts**: Set up budget alerts

### Expected Behavior
- `scheduledCleanupExpiredClaims`: Runs every 2h, usually completes in <30s
- `scheduledArchiveModerationQueue`: Runs daily 2AM, may take 2-5 min
- `scheduledModerationHealthCheck`: Runs every 6h, completes in <1min

---

## 🔧 Troubleshooting

### Function not running
**Check:**
1. Cloud Scheduler enabled? (Google Cloud Console)
2. Function deployed? `firebase deploy --only functions`
3. Timezone correct? (Asia/Ho_Chi_Minh)

### Function errors
**Debug:**
```bash
# Check logs
firebase functions:log --only scheduledCleanupExpiredClaims --limit 50

# Check function config
firebase functions:config:get
```

---

## 📝 Notes

### Old Vercel API Routes
The old cron API routes still exist in the codebase:
- `/api/cron/cleanup-expired-claims`
- `/api/cron/archive-moderation-queue`
- `/api/cron/moderation-health-check`

**Status:** Can be safely removed or kept for manual triggering

**Security:** Protected by `CRON_SECRET` in `.env`

### Cost Estimate
**Firebase Cloud Scheduler:**
- Free tier: 3 jobs included
- Our usage: 3 jobs → **$0/month** ✅

**Vercel Cron (if we kept it):**
- Would need Pro plan → **$20/month** ❌

**Savings:** $240/year 💰

---

## ✅ Verification Checklist

- [x] All 3 functions migrated to Firebase
- [x] Functions deployed and scheduled
- [x] Schedules verified in Cloud Scheduler
- [x] Test runs successful
- [x] Logs accessible in Firebase Console
- [x] Deprecated Vercel cron config removed from `vercel.json`
- [ ] (Optional) Remove old API routes if not needed

---

**Migration completed:** [Date]
**Verified by:** [Your name]
**Status:** ✅ **PRODUCTION READY**

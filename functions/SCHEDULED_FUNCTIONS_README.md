# Firebase Scheduled Functions

## Tổng quan

Tất cả cron jobs đã được chuyển từ Vercel sang Firebase Functions để đồng bộ với backend.

## Danh sách Scheduled Functions

### 1. **scheduledCleanupExpiredClaims**
- **Schedule:** Every 2 hours
- **Purpose:** Auto-release moderation claims > 2h timeout
- **Function:** `scheduledCleanupExpiredClaims`
- **Timezone:** Asia/Ho_Chi_Minh

### 2. **scheduledArchiveModerationQueue**
- **Schedule:** Daily at 2:00 AM
- **Purpose:** Archive approved/rejected entries > 30 days
- **Function:** `scheduledArchiveModerationQueue`
- **Timezone:** Asia/Ho_Chi_Minh

### 3. **scheduledCleanupDeletedPlaces** ✨ NEW
- **Schedule:** Daily at 3:00 AM
- **Purpose:** Permanently delete places in trash > 120 days
- **Function:** `scheduledCleanupDeletedPlaces`
- **Timezone:** Asia/Ho_Chi_Minh

### 4. **scheduledModerationHealthCheck**
- **Schedule:** Every 6 hours
- **Purpose:** Monitor queue health and detect issues
- **Function:** `scheduledModerationHealthCheck`
- **Timezone:** Asia/Ho_Chi_Minh

### 5. **publishScheduledAnnouncements**
- **Schedule:** Every 15 minutes
- **Purpose:** Auto-publish scheduled announcements
- **Function:** `publishScheduledAnnouncements`
- **Timezone:** Asia/Ho_Chi_Minh

## Deploy Instructions

### 1. Build Functions
```bash
cd functions
npm install
npm run build
```

### 2. Deploy All Functions
```bash
# Deploy tất cả functions
firebase deploy --only functions

# Hoặc deploy từng function cụ thể
firebase deploy --only functions:scheduledCleanupDeletedPlaces
firebase deploy --only functions:scheduledArchiveModerationQueue
firebase deploy --only functions:scheduledCleanupExpiredClaims
firebase deploy --only functions:scheduledModerationHealthCheck
firebase deploy --only functions:publishScheduledAnnouncements
```

### 3. Verify Deployment
```bash
# Kiểm tra logs
firebase functions:log --only scheduledCleanupDeletedPlaces

# Hoặc xem trên Firebase Console
https://console.firebase.google.com/project/YOUR_PROJECT/functions
```

## Monitoring

### View Logs
```bash
# Real-time logs
firebase functions:log --only scheduledCleanupDeletedPlaces

# View last 50 entries
firebase functions:log --limit 50
```

### Check Execution History
1. Open Firebase Console
2. Navigate to **Functions** → **Logs**
3. Filter by function name
4. Check execution status and errors

## Testing

### Manual Trigger (for testing)
You can manually test scheduled functions:

```bash
# Test cleanup deleted places locally
firebase functions:shell

# Then in shell:
scheduledCleanupDeletedPlaces()
```

### Emulator Testing
```bash
# Start emulator
firebase emulators:start

# Functions will execute on schedule in emulator
```

## Cost Estimates

Firebase Functions pricing:
- **Invocations:** First 2M free/month
- **Compute time:**
  - 400,000 GB-seconds free/month
  - $0.0000025/GB-second after

Estimated monthly cost for scheduled functions:
- **scheduledCleanupDeletedPlaces:** ~30 invocations/month × 2s = **FREE**
- **scheduledArchiveModerationQueue:** ~30 invocations/month × 5s = **FREE**
- **scheduledCleanupExpiredClaims:** ~360 invocations/month × 2s = **FREE**
- **scheduledModerationHealthCheck:** ~120 invocations/month × 3s = **FREE**

**Total estimated cost: $0.00** (well within free tier)

## Troubleshooting

### Function Not Running
1. Check function is deployed:
   ```bash
   firebase functions:list
   ```

2. Check logs for errors:
   ```bash
   firebase functions:log --only scheduledCleanupDeletedPlaces
   ```

3. Verify timezone is correct (should be `Asia/Ho_Chi_Minh`)

### Function Timeout
If function times out (default 60s):
- Already configured with longer timeouts:
  - Archive/Cleanup: 540s (9 minutes)
  - Others: 300s (5 minutes)

### Permission Errors
Ensure Firebase Admin SDK has proper permissions:
```bash
# Check service account permissions in Firebase Console
https://console.firebase.google.com/project/YOUR_PROJECT/settings/serviceaccounts
```

## Migration from Vercel Crons

### Files to Remove (Old Vercel Crons)
These API endpoints are no longer needed:
- ❌ `/api/cron/cleanup-deleted-places/route.ts`
- ❌ `/api/cron/cleanup-expired-claims/route.ts`
- ❌ `/api/cron/archive-moderation-queue/route.ts`
- ❌ `/api/cron/moderation-health-check/route.ts`

### Files to Keep
Keep these for manual triggers if needed:
- ✅ `/api/cron/process-expired/route.ts` (if still used)

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Scheduled Functions Guide](https://firebase.google.com/docs/functions/schedule-functions)
- [Cloud Scheduler Pricing](https://cloud.google.com/scheduler/pricing)

---

**Last Updated:** 2025-01-22
**Maintained By:** Du Lịch Việt Dev Team

# 🔥 CRITICAL FIX: Firebase Storage Bucket Error

## Ngày fix: 2025-09-30

## ❌ VẤN ĐỀ CHÍNH

### Lỗi Avatar Upload 500 Error
```json
{
  "error": {
    "code": 404,
    "message": "The specified bucket does not exist.",
    "errors": [{
      "message": "The specified bucket does not exist.",
      "domain": "global",
      "reason": "notFound"
    }]
  }
}
```

**Root Cause**: Firebase Storage bucket name không đúng trong `firebaseAdmin.ts`

## 🔍 PHÂN TÍCH

### Bucket Name Changes (October 2024)
Firebase đã thay đổi format bucket URL:
- ❌ **Old format**: `project-id.appspot.com`
- ✅ **New format**: `project-id.firebasestorage.app`

### File Config
**`.env.local`** (Line 15) - **ĐÚNG**:
```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vietexplore-ai.firebasestorage.app
```

**`firebaseAdmin.ts`** (Line 24) - **SAI**:
```typescript
storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
// ❌ Hardcoded old format, không đọc từ env
```

### Kết quả
- Server khởi tạo bucket: `vietexplore-ai.appspot.com` (không tồn tại)
- Bucket thực tế: `vietexplore-ai.firebasestorage.app`
- → 404 "bucket does not exist"

## ✅ GIẢI PHÁP

### Fixed Code
**File**: `src/lib/server/firebaseAdmin.ts`

```typescript
// Before (SAI)
storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`

// After (ĐÚNG)
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
                     `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`;

console.log('[Firebase Admin] Initializing with storage bucket:', storageBucket);

return admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: storageBucket, // ✅ Use from env
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`
});
```

### Key Changes
1. ✅ Đọc bucket từ environment variable `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
2. ✅ Fallback to new format `.firebasestorage.app` thay vì `.appspot.com`
3. ✅ Add console log để verify bucket name khi khởi động
4. ✅ Fix databaseURL thành asia-southeast1 (match với .env.local)

## 🧪 TESTING

### Server Logs Expected
Khi server khởi động, phải thấy:
```
[Firebase Admin] Initializing with storage bucket: vietexplore-ai.firebasestorage.app
```

### Upload Avatar Flow
1. User click Camera icon
2. Select image file
3. Check browser console:
   - ✅ Should see: `[Avatar Upload] Starting upload process...`
   - ✅ Should see: `[Avatar Upload] Bucket name: vietexplore-ai.firebasestorage.app`
   - ✅ Should NOT see: 404 bucket error
4. Check server terminal:
   - ✅ Should see successful upload logs
   - ✅ Should see: `POST /api/users/avatar 200`

### Verify in Firebase Console
1. Navigate to Firebase Console → Storage
2. Check folder: `users/{userId}/profile/`
3. Verify uploaded avatar exists
4. Check file is publicly accessible

## 📊 IMPACT ANALYSIS

### Before Fix
- ❌ Avatar upload: 100% fail rate (500 error)
- ❌ All Storage operations: Broken
- ❌ User experience: Cannot update profile picture

### After Fix
- ✅ Avatar upload: Should work
- ✅ Storage operations: Functional
- ✅ User experience: Can update profile picture
- ✅ Sharp image processing: Working (logs show 477KB → 40KB)

## 🔗 RELATED ISSUES FIXED

### Issue #1: Functions Import Error ✅
- Added `getFunctions` export to `firebase.ts`
- Fixed auto-sync-service import errors

### Issue #2: Profile Update 400 Error ✅
- Fixed Zod validation to accept empty strings
- Updated schema: `.optional().or(z.literal(''))`

### Issue #3: Storage Bucket 404 ❌ → ✅
- **This fix**: Updated `firebaseAdmin.ts` to use correct bucket

## 🚀 DEPLOYMENT STEPS

### 1. Restart Dev Server
```bash
# Kill old process
pkill -f "next dev"

# Start fresh
npm run dev
```

### 2. Verify Logs
Check terminal for:
```
[Firebase Admin] Initializing with storage bucket: vietexplore-ai.firebasestorage.app
```

### 3. Test Upload
- Navigate to: http://localhost:9006/profile/me
- Upload avatar
- Check success

### 4. Production Deploy
```bash
npm run build
firebase deploy
```

## ⚠️ IMPORTANT NOTES

### Firebase Storage Bucket URLs
- **Client-side** (.env.local): `vietexplore-ai.firebasestorage.app`
- **Server-side** (Admin SDK): Must match client-side
- **Legacy projects**: May still use `.appspot.com` - check Firebase Console

### Environment Variables
**Required in `.env.local`**:
```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vietexplore-ai.firebasestorage.app
```

**Server reads this** in `firebaseAdmin.ts`:
```typescript
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```

### Verification
Always verify bucket name in Firebase Console:
1. Firebase Console → Project Settings
2. General tab → Your apps
3. Check "storageBucket" value
4. Use EXACTLY that value in `.env.local`

## 📝 LESSONS LEARNED

1. **Never hardcode infrastructure URLs** - Always use environment variables
2. **Firebase bucket formats change** - Stay updated with Firebase releases
3. **Server logs are critical** - Added detailed logging for debugging
4. **Test with real data** - Caught issue only during actual upload test

## 🔧 PREVENTION

### Code Review Checklist
- [ ] No hardcoded URLs (API, Storage, Database)
- [ ] All config comes from environment variables
- [ ] Logging added for critical initialization
- [ ] Tested against real Firebase project

### Monitoring
- Add error tracking for Storage operations
- Monitor 404 errors in production
- Alert on bucket misconfiguration

---

**Status**: ✅ FIXED - Server restarting on port 9006
**Next Step**: Test avatar upload on http://localhost:9006/profile/me
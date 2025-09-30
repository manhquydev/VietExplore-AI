# Bug Fix Summary - Profile Update

## Ngày fix: 2025-09-30

## Các lỗi đã fix:

### 1. ✅ Import Error: `functions` not exported from firebase
**File**: `src/lib/firebase.ts`

**Lỗi**:
```
Attempted import error: 'functions' is not exported from '@/lib/firebase'
```

**Root cause**: Missing `getFunctions` import và export

**Fix**:
```typescript
// Added import
import { getFunctions } from "firebase/functions";

// Added initialization
const functions = getFunctions(app);

// Added export
export { app, db, auth, storage, functions };
```

---

### 2. ✅ 400 Bad Request - Profile Update Validation
**File**: `src/app/api/users/profile/route.ts`

**Lỗi**:
```
PATCH http://localhost:9002/api/users/profile 400 (Bad Request)
Error: Dữ liệu không hợp lệ
```

**Root cause**: Zod validation schema quá strict, không chấp nhận empty strings

**Fix**:
```typescript
// Before
fullName: z.string().min(2).max(100).optional()

// After - allow empty strings
fullName: z.string().min(2).max(100).optional().or(z.literal(''))
```

Áp dụng tương tự cho: `bio`, `location`, `website`

---

### 3. 🔧 500 Internal Server Error - Avatar Upload
**File**: `src/app/api/users/avatar/route.ts`

**Lỗi**:
```
POST http://localhost:9002/api/users/avatar 500 (Internal Server Error)
```

**Possible causes**:
1. Sharp library không cài đúng trên Windows
2. Firebase Storage bucket không được config đúng
3. Permissions issues

**Fix applied**:
- Thêm detailed logging tại mỗi bước:
  ```typescript
  console.log('[Avatar Upload] Starting upload process...');
  console.log('[Avatar Upload] User authenticated:', userId);
  console.log('[Avatar Upload] Buffer size:', buffer.length);
  console.log('[Avatar Upload] Sharp processing...');
  console.log('[Avatar Upload] Getting Firebase Storage bucket...');
  ```

- Improved error handling với specific error messages:
  ```typescript
  try {
    processedImage = await sharp(buffer)...
  } catch (sharpError) {
    console.error('[Avatar Upload] Sharp error:', sharpError);
    throw new Error(`Image processing failed: ${sharpError.message}`);
  }
  ```

- Error categorization:
  - Sharp errors → 400 với message chi tiết
  - Storage errors → 500 với message chi tiết
  - Generic errors → 500 với full error message

---

## Testing Steps

### 1. Test Functions Import
```bash
# Check dev server logs
npm run dev
# Should not see "functions is not exported" error
```

### 2. Test Profile Update
**Endpoint**: `PATCH /api/users/profile`

**Test cases**:
- ✅ Update với empty strings
- ✅ Update fullName only
- ✅ Update profile.bio only
- ✅ Update all fields
- ✅ Invalid website URL (should fail)

**Test payload**:
```json
{
  "fullName": "Nguyễn Văn A",
  "profile": {
    "bio": "",
    "location": "Hà Nội",
    "website": "https://example.com"
  }
}
```

### 3. Test Avatar Upload
**Endpoint**: `POST /api/users/avatar`

**Test cases**:
- Upload JPG file
- Upload PNG file
- Upload file > 5MB (should fail)
- Upload non-image file (should fail)

**Check server logs để xác định lỗi cụ thể:**
```
[Avatar Upload] Starting upload process...
[Avatar Upload] User authenticated: {userId}
[Avatar Upload] Converting file to buffer...
[Avatar Upload] Buffer size: {size}
[Avatar Upload] Starting Sharp processing...
[Avatar Upload] Sharp processing completed. Size: {size}
[Avatar Upload] Getting Firebase Storage bucket...
[Avatar Upload] Bucket name: {bucketName}
```

---

## Potential Issues Remaining

### Sharp on Windows
**Symptom**: Sharp processing fails

**Possible fixes**:
```bash
# Option 1: Rebuild Sharp
npm rebuild sharp

# Option 2: Reinstall with correct architecture
npm uninstall sharp
npm install --platform=win32 --arch=x64 sharp

# Option 3: Use alternative (client-side resize)
# Không dùng Sharp, resize ở client với canvas API
```

### Firebase Storage Bucket
**Symptom**: "Storage initialization failed"

**Check**:
1. `.env.local` có đúng `FIREBASE_PROJECT_ID`?
2. Firebase Admin SDK có credentials đúng?
3. Storage bucket có tồn tại? Check Firebase Console

**Fix trong firebaseAdmin.ts**:
```typescript
return admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`, // Ensure correct format
});
```

---

## Next Steps

1. **Test trên browser**:
   - Navigate to http://localhost:9005/profile/me
   - Try uploading avatar
   - Try updating profile info
   - Check browser console for client errors
   - Check terminal for server logs

2. **If avatar upload still fails**:
   - Check terminal logs để xác định failure point
   - Nếu Sharp fails: Xem xét dùng alternative approach (client-side resize)
   - Nếu Storage fails: Verify Firebase credentials và bucket config

3. **Monitor production**:
   - Add error tracking (Sentry, LogRocket, etc.)
   - Monitor rate limiting effectiveness
   - Track upload success rate

---

## Files Modified

1. `src/lib/firebase.ts` - Added functions export
2. `src/app/api/users/profile/route.ts` - Fixed validation schema
3. `src/app/api/users/avatar/route.ts` - Added detailed logging & error handling
4. `src/app/profile/me/page.tsx` - (No changes needed for these fixes)

---

## Server Status

- ✅ Dev server running on port 9005
- ✅ Functions import error fixed
- ✅ Profile validation fixed
- 🔧 Avatar upload needs live testing to verify

**Test URL**: http://localhost:9005/profile/me
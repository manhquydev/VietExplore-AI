# 🔔 HƯỚNG DẪN DEBUG HỆ THỐNG THÔNG BÁO

## Vấn đề phát hiện

Khi moderator duyệt/yêu cầu chỉnh sửa địa điểm, user không nhận được thông báo mặc dù hệ thống đã được implement đầy đủ.

## Nguyên nhân gốc rễ

### 1. **Firebase Admin SDK không parse đúng credentials** ⚠️
- File `.env.local` có `FIREBASE_ADMIN_SDK_JSON` (JSON string)
- Nhưng code `firebaseAdmin.ts` lại parse từ các biến riêng lẻ (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- **Đã sửa**: Parse từ `FIREBASE_ADMIN_SDK_JSON` nếu có, fallback sang individual vars

### 2. **Firebase Realtime Database URL không được load** ⚠️
- `firebaseAdmin.ts` construct URL từ `FIREBASE_PROJECT_ID` thay vì dùng `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- **Đã sửa**: Ưu tiên `NEXT_PUBLIC_FIREBASE_DATABASE_URL` từ .env.local

## Các thay đổi đã thực hiện

### File: `src/lib/server/firebaseAdmin.ts`

```typescript
// TRƯỚC (SAI):
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// SAU (ĐÚNG):
let serviceAccount: ServiceAccount;

if (process.env.FIREBASE_ADMIN_SDK_JSON) {
  try {
    const parsed = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON);
    serviceAccount = {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
  } catch (error) {
    console.error('Failed to parse FIREBASE_ADMIN_SDK_JSON:', error);
    throw new Error('Invalid FIREBASE_ADMIN_SDK_JSON format');
  }
} else {
  // Fallback to individual env vars
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
}
```

```typescript
// TRƯỚC (hardcoded):
databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`

// SAU (từ .env):
const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
                   `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`;

databaseURL: databaseURL
```

## Cách kiểm tra hệ thống đã hoạt động

### Bước 1: Kiểm tra server logs

Restart server và xem log:
```bash
npm run dev
```

Phải thấy:
```
[Firebase Admin] Initializing with storage bucket: vietexplore-ai.firebasestorage.app
[Firebase Admin] Initializing with database URL: https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app
```

### Bước 2: Test notification bằng API

1. Mở `test-notification.html` trong browser
2. Đăng nhập vào app trên tab khác
3. Lấy Firebase token từ console:
```javascript
Object.keys(localStorage).filter(k => k.startsWith("firebase:authUser")).forEach(k => {
  const data = JSON.parse(localStorage.getItem(k));
  console.log("Token:", data.stsTokenManager.accessToken);
});
```
4. Paste token vào form test và gửi thông báo

### Bước 3: Test luồng thực tế

1. **Tạo 2 tài khoản:**
   - User A (contributor/partner) - Đăng địa điểm
   - User B (moderator/admin) - Duyệt địa điểm

2. **User A:** Tạo địa điểm mới và submit
3. **User B:** Vào `/admin/moderation/queue` và duyệt/yêu cầu chỉnh sửa
4. **User A:** Kiểm tra chuông thông báo (góc phải navigation)

### Bước 4: Debug trong console

Mở browser console khi test, phải thấy log:
```
[MODERATION] Sending approval notification to user xxx for place yyy
[NOTIFICATION] notifyPlaceSubmitter called: {...}
[NOTIFICATION] notifyPlaceSubmitter result: {...}
✅ Sent in-app notification notif_xxx to user yyy
```

## Flow hoàn chỉnh của Notification

```
1. Moderator duyệt địa điểm
   ↓
2. API /api/moderation/queue/[itemId] PUT
   ↓ (dòng 679-743)
3. EnhancedNotificationService.notifyPlaceSubmitter()
   ↓ (enhanced-notification-service.ts:846)
4. sendNotification() - Tạo payload
   ↓ (line 391-484)
5. deliverNotification() - Gửi đến channels
   ↓ (line 489-514)
6. sendInAppNotification() - Ghi vào Realtime DB
   ↓ (line 519-554)
7. Firebase Realtime Database: notifications/{userId}/{notificationId}
   ↓
8. Client hook: useRealtimeNotifications
   ↓ (use-realtime-notifications.ts:48)
9. subscribeToNotifications callback
   ↓
10. Component NotificationBell hiển thị
```

## Các điểm kiểm tra nếu vẫn không nhận thông báo

### 1. Firebase Realtime Database Rules
Kiểm tra `database.rules.json`:
```json
{
  "rules": {
    "notifications": {
      "$userId": {
        ".read": "$userId === auth.uid || auth.token.role === 'admin'",
        ".write": "auth.token.role === 'admin' || auth.token.role === 'moderator'"
      }
    }
  }
}
```

### 2. Network Tab
- Mở DevTools > Network
- Filter: `notifications`
- Phải thấy WebSocket connection hoặc long-polling requests

### 3. Realtime Database trong Firebase Console
- Vào Firebase Console > Realtime Database
- Check data structure: `notifications/{userId}/`
- Phải thấy notification objects với `read: false`

### 4. User Role
User phải có `createdBy` field trùng với ID của người tạo địa điểm

### 5. Environment Variables
Kiểm tra `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_ADMIN_SDK_JSON='{...}'  # Phải có
```

## Troubleshooting Commands

### Xem Firebase Admin init:
```javascript
// Trong server console khi start
// Phải thấy:
[Firebase Admin] Initializing with database URL: https://...
```

### Test Realtime DB connection (client):
```javascript
import { getDatabase, ref, get } from 'firebase/database';
import { app } from '@/lib/firebase';

const db = getDatabase(app);
const testRef = ref(db, 'notifications/YOUR_USER_ID');
get(testRef).then(snapshot => {
  console.log('Realtime DB data:', snapshot.val());
});
```

### Test từ server:
```javascript
// Trong src/lib/server/firebaseAdmin.ts
const rtdb = getRealtimeDb();
const testRef = rtdb.ref('notifications/test');
await testRef.set({
  test: 'hello',
  timestamp: Date.now()
});
```

## Monitoring & Logs

Các log cần theo dõi:

1. **Server side (terminal):**
```
[MODERATION] Sending approval notification to user {userId}
[NOTIFICATION] notifyPlaceSubmitter called
✅ Sent in-app notification {notificationId} to user {userId}
```

2. **Client side (browser console):**
```
[RealtimeService] Subscribed to notifications for user {userId}
[Notification] New notification received: {...}
```

3. **Firebase Console:**
   - Realtime Database > Data tab
   - Check `notifications/{userId}` node có data mới không

## Kết luận

Sau khi apply fixes:
- ✅ Firebase Admin SDK được khởi tạo đúng với JSON credentials
- ✅ Realtime Database URL được load từ .env.local
- ✅ Notification service có thể ghi vào Realtime DB
- ✅ Client có thể subscribe và nhận thông báo realtime

**Lưu ý:** Cần restart server sau khi sửa `firebaseAdmin.ts` để áp dụng thay đổi!

# Hướng dẫn Deploy Firebase Functions - Auto-Publish Announcements

## 📋 Tổng quan

Firebase Function `publishScheduledAnnouncements` tự động xuất bản thông báo theo lịch, chạy mỗi 15 phút.

## 🚀 Các bước deploy

### 1. Build TypeScript code

```bash
cd functions
npm run build
```

### 2. Deploy function lên Firebase

**Deploy tất cả functions:**
```bash
npm run deploy
```

**Hoặc deploy chỉ function này:**
```bash
firebase deploy --only functions:publishScheduledAnnouncements
```

### 3. Verify deployment

Sau khi deploy xong, check Firebase Console:
- Vào **Firebase Console** → **Functions**
- Tìm function `publishScheduledAnnouncements`
- Kiểm tra status: **Healthy** ✅

## 📊 Monitoring & Logs

### Xem logs realtime

```bash
# Xem logs của function
firebase functions:log --only publishScheduledAnnouncements

# Hoặc xem tất cả logs
firebase functions:log
```

### Xem logs trên Firebase Console

1. Vào **Firebase Console** → **Functions**
2. Click vào function `publishScheduledAnnouncements`
3. Tab **Logs** → Xem execution history

### Xem admin logs trong Firestore

Function tự động lưu logs vào collection `admin_logs`:

```
admin_logs/
  └── {docId}
      ├── type: "scheduled_announcements_publish"
      ├── timestamp: [server timestamp]
      └── results:
          ├── processed: 5
          ├── published: 2
          ├── errors: []
          └── publishedIds: ["id1", "id2"]
```

## 🧪 Testing

### Test manual trigger từ code

Bạn có thể gọi callable function từ admin panel:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const triggerPublish = httpsCallable(functions, 'triggerPublishScheduledAnnouncements');

// Gọi function (chỉ admin mới được)
const result = await triggerPublish();
console.log(result.data);
// { success: true, message: "Published 2 announcements", results: {...} }
```

### Test local với emulator

```bash
cd functions
npm run serve
```

Sau đó trigger function manually trong emulator UI hoặc qua code.

## ⚙️ Cấu hình

### Schedule (Mỗi 15 phút)

```typescript
.schedule('*/15 * * * *')
```

**Cron syntax:**
- `*/15` = mỗi 15 phút
- `* * * *` = mọi giờ, ngày, tháng

### Timezone

```typescript
.timeZone('Asia/Ho_Chi_Minh')
```

Đảm bảo scheduledFor trong database cũng dùng timezone này.

## 🔍 Troubleshooting

### Function không chạy

1. **Kiểm tra Cloud Scheduler đã enable chưa:**
   - Vào **Google Cloud Console** → **Cloud Scheduler**
   - Nếu chưa enable, click **Enable API**

2. **Kiểm tra billing:**
   - Cloud Functions scheduled functions yêu cầu **Blaze plan** (pay-as-you-go)
   - Vào Firebase Console → **Settings** → **Usage and billing**

3. **Kiểm tra permissions:**
   ```bash
   firebase functions:log
   # Xem có error về permissions không
   ```

### Function chạy nhưng không publish

1. **Check logs:**
   ```bash
   firebase functions:log --only publishScheduledAnnouncements
   ```

2. **Verify data trong Firestore:**
   - Mở **Firestore** → collection `announcements`
   - Filter: `status == 'scheduled'`
   - Kiểm tra `scheduledFor` có đúng format ISO 8601 không

3. **Check timezone:**
   - Đảm bảo `scheduledFor` đã convert đúng sang UTC hoặc Asia/Ho_Chi_Minh

## 📈 Cost Estimation

Firebase Functions scheduled pricing:

- **Free tier:** 2M invocations/month
- **Scheduled function:** Chạy mỗi 15 phút = ~2,880 lần/tháng
- **Cost:** MIỄN PHÍ (dưới free tier)

**Lưu ý:** Cần Blaze plan để enable scheduled functions (không tính phí nếu dưới free tier).

## 🔐 Security

Function được bảo vệ bởi:
- Chỉ admin mới trigger được callable function `triggerPublishScheduledAnnouncements`
- Scheduled function chạy tự động với Firebase Admin SDK permissions

## 🔄 Update Function

Khi cần update logic:

1. Sửa code trong `functions/src/index.ts`
2. Build lại:
   ```bash
   cd functions
   npm run build
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```

## 📝 Notes

- Function tự động lưu execution logs vào `admin_logs` collection
- Nếu có errors, sẽ log vào `admin_logs` với type `scheduled_announcements_publish_error`
- Function chỉ publish announcements có `scheduledFor <= now()`
- Sau khi publish, status sẽ đổi từ `scheduled` → `published`

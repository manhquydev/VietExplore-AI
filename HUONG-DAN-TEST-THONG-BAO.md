# 🧪 HƯỚNG DẪN TEST THÔNG BÁO - STEP BY STEP

## 🎯 MỤC TIÊU

Test toàn bộ flow thông báo moderation:
1. User tạo địa điểm
2. Moderator duyệt
3. User nhận thông báo

---

## ✅ CHUẨN BỊ

Đã thêm **DETAILED LOGGING** vào moderation API để debug:
- ✅ Log khi approve/reject
- ✅ Log user ID, place ID, moderator info
- ✅ Log notification service calls
- ✅ Log lỗi chi tiết nếu có

---

## 📋 BƯỚC 1: KHỞI ĐỘNG SERVER

```bash
# Terminal 1: Start dev server
cd C:\Users\manhq\Downloads\da2\VietExplore-AI
npm run dev

# Chờ đến khi thấy:
# ✓ Ready in 4s
# - Local: http://localhost:9003  (hoặc port khác)
```

**Lưu ý port:** Server đang chạy ở **port 9003** (không phải 9002)

---

## 📋 BƯỚC 2: CHUẨN BỊ 2 TÀI KHOẢN

### Account A - Contributor (Người đăng địa điểm)
- **Email:** manhquydev@gmail.com
- **User ID:** Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
- **Role:** contributor

### Account B - Admin/Moderator (Người duyệt)
- **Email:** admin@vietexplore.ai (hoặc bất kỳ admin nào)
- **User ID:** 69XqrTdQuDML8YkyazqRzYPhyJd2
- **Role:** admin

---

## 📋 BƯỚC 3: TEST NHANH BẰNG DEBUG SCRIPT (TÙY CHỌN)

Trước khi test flow thực tế, hãy verify hệ thống hoạt động:

```bash
# Terminal 2: Run debug script
node debug-notification-flow.js
```

**Kỳ vọng:**
```
✅ Firebase Admin SDK: OK
✅ Realtime Database: OK
✅ Gửi notification: OK
📬 Test user: manhquydev@gmail.com
```

**Sau đó:**
1. Đăng nhập với `manhquydev@gmail.com`
2. Kiểm tra chuông thông báo (góc phải navigation)
3. Phải thấy 1 thông báo test mới

---

## 📋 BƯỚC 4: TEST FLOW THỰC TẾ

### 4.1. Tạo địa điểm mới (Account A)

1. **Đăng nhập:** manhquydev@gmail.com
2. **Vào:** http://localhost:9003/contribute/new
3. **Điền form:**
   - Tên địa điểm: "Test Notification - Vịnh Hạ Long"
   - Mô tả ngắn: "Test địa điểm để kiểm tra thông báo"
   - Mô tả đầy đủ: "Mô tả chi tiết..."
   - Vùng: Bắc Bộ
   - Tỉnh: Quảng Ninh
   - Loại: Biển
   - Địa chỉ: "123 Test Street"
   - Upload ít nhất 1 ảnh

4. **Click "Lưu nháp"** → Địa điểm được lưu

5. **Click "Gửi kiểm duyệt"** → Submit địa điểm

**Kiểm tra Terminal:**
```
Created new moderation queue entry for place [placeId]
```

### 4.2. Kiểm tra Moderation Queue

1. **Logout Account A**
2. **Đăng nhập Account B** (admin@vietexplore.ai)
3. **Vào:** http://localhost:9003/moderation/dashboard
4. **Phải thấy:** Địa điểm "Test Notification - Vịnh Hạ Long" trong queue

### 4.3. Duyệt địa điểm (Account B)

1. **Click vào địa điểm** trong queue
2. **Click "Tiếp nhận"** (Claim)
3. **Review địa điểm**
4. **Chọn action:**
   - Option 1: **Approve** → Điền review notes (tùy chọn)
   - Option 2: **Reject** → Điền lý do từ chối

5. **Click "Phê duyệt"** (hoặc "Từ chối")

**Kiểm tra Terminal - Phải thấy logs chi tiết:**
```
========================================
[MODERATION] APPROVE ACTION - DEBUG INFO
========================================
Place ID: [placeId]
Place Name: Test Notification - Vịnh Hạ Long
Created By: Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
Item Type: new_place
Moderator: 69XqrTdQuDML8YkyazqRzYPhyJd2
Review Notes: Địa điểm đẹp, approved
========================================
[MODERATION] 🔔 Sending approval notification to user Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
[MODERATION] Calling notifyPlaceSubmitter...
[NOTIFICATION] notifyPlaceSubmitter called: {...}
✅ Sent in-app notification notif_xxx to user Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
[MODERATION] ✅ Place approval notification result: {
  "success": true,
  "notificationIds": ["notif_xxx"],
  "errors": []
}
```

### 4.4. Kiểm tra thông báo (Account A)

**KHÔNG LOGOUT Account B - Mở incognito window hoặc browser khác:**

1. **Incognito/Browser mới:** http://localhost:9003
2. **Đăng nhập:** manhquydev@gmail.com
3. **Kiểm tra icon chuông** (góc phải navigation)

**Phải thấy:**
- ✅ Badge đỏ với số "1" (hoặc nhiều hơn)
- ✅ Click vào chuông → Thấy notification:
  - **Title:** "✅ Địa điểm đã được phê duyệt"
  - **Body:** "Địa điểm 'Test Notification - Vịnh Hạ Long' của bạn đã được phê duyệt và xuất bản"
  - **Priority:** Medium
  - **Read:** false (chưa đọc)

4. **Click vào notification** → Phải navigate đến trang địa điểm

5. **Notification badge phải giảm** sau khi click

---

## 🔍 BƯỚC 5: KIỂM TRA REALTIME DATABASE

Nếu vẫn không thấy thông báo, kiểm tra trực tiếp database:

### 5.1. Kiểm tra từ Browser Console

1. **Đăng nhập Account A:** manhquydev@gmail.com
2. **Mở Browser Console (F12)**
3. **Chạy lệnh:**

```javascript
import { getDatabase, ref, get } from 'firebase/database';
const db = getDatabase();
const userId = 'Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2';
get(ref(db, `notifications/${userId}`)).then(snapshot => {
  console.log('=== NOTIFICATIONS DATA ===');
  console.log(JSON.stringify(snapshot.val(), null, 2));
});
```

**Nếu thấy data:**
→ Notification đã được ghi vào DB
→ Vấn đề: Client không subscribe đúng

**Nếu KHÔNG thấy data:**
→ Notification không được ghi vào DB
→ Vấn đề: Server không ghi được hoặc có lỗi

### 5.2. Kiểm tra từ Firebase Console

1. **Vào:** https://console.firebase.google.com
2. **Chọn project:** vietexplore-ai
3. **Realtime Database** → Data tab
4. **Navigate:** `notifications/Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2/`
5. **Phải thấy:** Các notification objects

---

## 🐛 TROUBLESHOOTING

### Vấn đề 1: Terminal không có logs

**Nguyên nhân:**
- Server chưa được restart sau khi thêm logs
- Port không đúng

**Giải pháp:**
```bash
# Kill server
Ctrl+C

# Restart
npm run dev

# Kiểm tra port
# Phải thấy: - Local: http://localhost:XXXX
```

### Vấn đề 2: Log hiển thị nhưng không gọi notifyPlaceSubmitter

**Kiểm tra log:**
- Có log "Created By: Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2" không?
- Có log "Calling notifyPlaceSubmitter..." không?

**Nếu có log "Created By" nhưng không có "Calling":**
→ `if (placeData?.createdBy)` failed
→ Kiểm tra field `createdBy` trong Firestore

### Vấn đề 3: Log "Calling notifyPlaceSubmitter" nhưng có lỗi

**Kiểm tra log error:**
```
[MODERATION] ❌ NOTIFICATION ERROR
Error message: ...
Error stack: ...
```

**Các lỗi thường gặp:**
1. **"Firebase Admin not initialized"**
   → Restart server
   → Kiểm tra `.env.local`

2. **"Permission denied"**
   → Database rules chưa deploy
   → Chạy: `firebase deploy --only database`

3. **"User not found"**
   → User ID không tồn tại
   → Kiểm tra Firestore `users` collection

### Vấn đề 4: Không thấy thông báo trong UI

**Nếu logs OK nhưng UI không hiển thị:**

1. **Kiểm tra connection status:**
   - Mở app, xem icon chuông
   - Phải thấy dot màu xanh (connected)
   - Nếu màu vàng → Đang reconnect

2. **Kiểm tra subscription:**
   ```javascript
   // Browser console
   console.log('[DEBUG] Checking notification subscription...');
   ```
   → Mở `src/hooks/use-realtime-notifications.ts`
   → Thêm `console.log` vào line 48

3. **Hard refresh:**
   - `Ctrl+Shift+R` để xóa cache
   - Logout và login lại

### Vấn đề 5: createdBy field missing

**Log hiển thị:**
```
[MODERATION] ⚠️ WARNING: placeData.createdBy is missing!
Place data: {...}
```

**Giải pháp:**
1. Kiểm tra Firestore document của place
2. Field `createdBy` phải tồn tại và chứa user ID
3. Nếu missing → Update place document:
   ```javascript
   db.collection('places').doc(placeId).update({
     createdBy: 'Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2'
   });
   ```

---

## 📊 CHECKLIST ĐẦY ĐỦ

Sau khi test, xác nhận các điểm sau:

### Server Logs:
- [ ] Firebase Admin SDK initialized
- [ ] Database URL correct
- [ ] Moderation queue created when submit
- [ ] Approve/Reject logs hiển thị
- [ ] "Calling notifyPlaceSubmitter" logged
- [ ] Notification result logged với `success: true`

### Firebase Realtime Database:
- [ ] `notifications/{userId}/` có data
- [ ] Notification có structure đúng
- [ ] `read: false` cho notification mới
- [ ] `unreadCounts/{userId}` được update

### Client UI:
- [ ] Icon chuông hiển thị
- [ ] Badge đỏ với số lượng thông báo
- [ ] Click chuông → Popover hiển thị
- [ ] Notification items hiển thị đúng
- [ ] Click notification → Navigate đúng trang
- [ ] Mark as read hoạt động

---

## 🎉 KẾT QUẢ MỌNG ĐỢI

**Flow hoàn chỉnh:**
```
1. User A submit địa điểm
   ↓
2. Moderation queue tạo entry
   ↓
3. Moderator B duyệt địa điểm
   ↓
4. Terminal log: "Calling notifyPlaceSubmitter"
   ↓
5. EnhancedNotificationService.sendNotification()
   ↓
6. Ghi vào Realtime DB: notifications/{userId}/
   ↓
7. Client hook subscribe và nhận data
   ↓
8. NotificationBell component update badge
   ↓
9. User A thấy notification trong UI
```

**Tất cả các bước phải thành công!**

---

## 📧 BÁO CÁO LỖI

Nếu sau khi làm theo hướng dẫn mà vẫn không hoạt động, vui lòng cung cấp:

1. **Server terminal logs** (đầy đủ từ lúc start đến lúc approve)
2. **Browser console logs** (F12)
3. **Screenshot Firebase Realtime Database** (notifications node)
4. **Screenshot Firestore** (place document với createdBy field)
5. **Các bước đã thực hiện**

---

**Chúc bạn test thành công! 🎊**

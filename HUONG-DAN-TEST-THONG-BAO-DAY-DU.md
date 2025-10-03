# 📋 HƯỚNG DẪN TEST HỆ THỐNG THÔNG BÁO ĐẦY ĐỦ

## ✅ ĐÃ FIX

### 1. **Navigation Link đã hoạt động**
- ✅ Fixed: `notification-bell.tsx` check cả `notification.actionUrl` và `notification.data.actionUrl`
- ✅ Click vào notification → Navigate đến đúng trang

### 2. **Default Preferences đã đầy đủ**
- ✅ Added: `PLACE_RECEIVED`, `EDIT_APPROVED`, `EDIT_REJECTED` vào default preferences
- ✅ Logic check enabled đã được sửa để xử lý undefined case

---

## 🧪 CÁCH TEST ĐÚNG

### ❌ CÁCH SAI (Đã Test)
```
❌ Xem notification cũ trong database (từ script debug cũ)
❌ Test với admin account (admin auto-publish, không có workflow)
❌ Chưa submit địa điểm mới thực sự
```

### ✅ CÁCH ĐÚNG (Cần Test Lại)

#### **Bước 1: Chuẩn Bị 2 Account**

**Account A - Contributor (Người đăng)**
- Email: manhquydev@gmail.com
- User ID: Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
- Role: contributor

**Account B - Moderator/Admin (Người duyệt)**
- Email: admin@vietexplore.ai
- User ID: 69XqrTdQuDML8YkyazqRzYPhyJd2
- Role: admin

---

#### **Bước 2: Submit Địa Điểm Mới (Account A)**

1. **Login:** manhquydev@gmail.com
2. **Vào:** http://localhost:9002/contribute/new-place
3. **Điền form đầy đủ:**
   - Tên: "Test Thông Báo - Vịnh Hạ Long"
   - Mô tả ngắn: "Test hệ thống thông báo hoàn chỉnh"
   - Mô tả đầy đủ: "Mô tả chi tiết về địa điểm..."
   - **Vùng:** Bắc Bộ
   - **Tỉnh:** Quảng Ninh
   - **Loại:** Biển
   - **Địa chỉ:** "Vịnh Hạ Long, Quảng Ninh"
   - **Upload ít nhất 1 ảnh**

4. **Click "Gửi kiểm duyệt"**

**Expected Result:**
```bash
# Server logs:
[NOTIFICATION] Sending PLACE_RECEIVED notification to user Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
[NOTIFICATION] ✅ Successfully sent PLACE_RECEIVED notification
```

5. **Kiểm tra ngay:**
   - Refresh page
   - Check notification bell (góc phải)
   - **Phải thấy:** Badge đỏ với số "1" (hoặc nhiều hơn)
   - **Click chuông** → Thấy notification:
     ```
     📬 Địa điểm đã được tiếp nhận
     Địa điểm "Test Thông Báo - Vịnh Hạ Long" của bạn đã được tiếp nhận và đang chờ kiểm duyệt
     ```
   - **Click vào notification** → Navigate to: `/contribute/my-drafts/{draftId}/moderation`
   - **Phải thấy:** Nhật ký kiểm duyệt của địa điểm

---

#### **Bước 3: Approve Địa Điểm (Account B)**

1. **Logout Account A**
2. **Login Account B:** admin@vietexplore.ai
3. **Vào:** http://localhost:9002/moderation/dashboard
4. **Tìm địa điểm** "Test Thông Báo - Vịnh Hạ Long" trong tab "Pending"
5. **Click vào địa điểm** để xem chi tiết
6. **Click "Tiếp nhận"** (Claim)
7. **Review và approve:**
   - Điền review notes (tùy chọn): "Địa điểm đẹp, thông tin đầy đủ"
   - **Click "Phê duyệt"**

**Expected Result:**
```bash
# Server logs:
========================================
[MODERATION] APPROVE ACTION - DEBUG INFO
========================================
Place ID: {placeId}
Place Name: Test Thông Báo - Vịnh Hạ Long
Created By: Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
========================================
[MODERATION] 🔔 Sending approval notification to user Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
[MODERATION] Calling notifyPlaceSubmitter...
[NOTIFICATION] notifyPlaceSubmitter called: {
  userId: 'Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2',
  placeId: '{placeId}',
  placeName: 'Test Thông Báo - Vịnh Hạ Long',
  slug: 'test-thong-bao-vinh-ha-long',
  draftId: '{draftId}',
  status: 'approved',
  reviewNotes: 'Địa điểm đẹp, thông tin đầy đủ'
}
✅ Sent in-app notification notif_xxx to user Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
[MODERATION] ✅ Place approval notification result: {
  "success": true,
  "notificationIds": ["notif_xxx"],
  "errors": []
}
```

---

#### **Bước 4: Kiểm Tra Notification (Account A)**

1. **Quay lại Account A** (không cần logout B, mở incognito window)
2. **Login:** manhquydev@gmail.com
3. **Kiểm tra notification bell**

**Phải thấy:**
- ✅ Badge đỏ với số "2" (hoặc nhiều hơn)
- ✅ Click chuông → Thấy 2 notifications:

  **[1] Notification Mới:**
  ```
  ✅ Địa điểm đã được phê duyệt
  Địa điểm "Test Thông Báo - Vịnh Hạ Long" của bạn đã được phê duyệt và xuất bản
  ```

  **[2] Notification Cũ:**
  ```
  📬 Địa điểm đã được tiếp nhận
  Địa điểm "Test Thông Báo - Vịnh Hạ Long" của bạn đã được tiếp nhận và đang chờ kiểm duyệt
  ```

4. **Click vào notification "✅ Địa điểm đã được phê duyệt"**

**Expected Result:**
- ✅ Navigate to: `/places/test-thong-bao-vinh-ha-long`
- ✅ Xem được địa điểm đã public
- ✅ Badge giảm xuống còn 1 (hoặc 0 nếu đã đọc notification kia)

---

## 🎯 TEST SCENARIOS KHÁC

### **Scenario 2: Địa Điểm Bị Từ Chối**

**Bước 1:** Submit địa điểm mới (giống Scenario 1)

**Bước 2:** Moderator reject với lý do:
- Review notes: "Thiếu thông tin chi tiết về giờ mở cửa và giá vé"
- Click "Từ chối"

**Expected Notifications:**
1. `📬 Địa điểm đã được tiếp nhận` (khi submit)
2. `❌ Địa điểm bị từ chối` (khi reject)
   - Click → Navigate to: `/contribute/my-drafts/{draftId}` (để sửa lại)

---

### **Scenario 3: Yêu Cầu Chỉnh Sửa**

**Bước 1:** Submit địa điểm mới

**Bước 2:** Moderator request edit:
- Chọn action: "Request Edit"
- Review notes: "Cần bổ sung ảnh đẹp hơn và thông tin chi tiết hơn về cách đi lại"
- Click submit

**Expected Notifications:**
1. `📬 Địa điểm đã được tiếp nhận` (khi submit)
2. `🔄 Yêu cầu sửa lại` (khi request edit)
   - Click → Navigate to: `/contribute/my-drafts/{draftId}` (để chỉnh sửa)

---

## 🔍 CÁCH KIỂM TRA DATABASE

Nếu cần verify trực tiếp trong database:

```bash
node check-realtime-notifications.js
```

**Expected Output:**
```
📬 Checking notifications for user: Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2
======================================================================
✅ Found X notification(s)

[1] place_approved
    Title: ✅ Địa điểm đã được phê duyệt
    ActionURL: /places/test-thong-bao-vinh-ha-long
    Priority: medium
    Read: No

[2] place_received
    Title: 📬 Địa điểm đã được tiếp nhận
    ActionURL: /contribute/my-drafts/{draftId}/moderation
    Priority: medium
    Read: No
```

---

## ❌ TROUBLESHOOTING

### Vấn đề 1: Không thấy notification

**Kiểm tra:**
1. Server có chạy không? (http://localhost:9002)
2. User có đăng nhập đúng không?
3. Check server logs có thấy `[NOTIFICATION]` không?
4. Run `node check-realtime-notifications.js` xem có data trong DB không

**Giải pháp:**
- Hard refresh: Ctrl+Shift+R
- Logout và login lại
- Restart server

---

### Vấn đề 2: Click notification không navigate

**Kiểm tra:**
1. Notification có `actionUrl` không?
2. Run script check: `node check-realtime-notifications.js`
3. Xem actionURL có phải "N/A" không?

**Nguyên nhân:**
- Notification cũ từ script debug (không có actionUrl đúng)
- Cần test lại với địa điểm mới

**Giải pháp:**
- Submit địa điểm MỚI và test lại workflow đầy đủ

---

### Vấn đề 3: Server logs không có [NOTIFICATION]

**Kiểm tra:**
1. Account có phải admin không? (Admin auto-publish, skip notification)
2. File `enhanced-notification-service.ts` có được compile không?
3. Server có restart sau khi fix không?

**Giải pháp:**
- Test với contributor account (manhquydev@gmail.com)
- Restart server: Ctrl+C và `npm run dev`

---

## 📊 CHECKLIST ĐẦY ĐỦ

- [ ] Server đang chạy: http://localhost:9002
- [ ] Account contributor đã sẵn sàng
- [ ] Account moderator đã sẵn sàng
- [ ] Submit địa điểm mới (không dùng địa điểm cũ)
- [ ] Nhận được notification "📬 Địa điểm đã được tiếp nhận"
- [ ] Click notification → Navigate đến nhật ký kiểm duyệt
- [ ] Moderator approve địa điểm
- [ ] Nhận được notification "✅ Địa điểm đã được phê duyệt"
- [ ] Click notification → Navigate đến địa điểm public
- [ ] Badge cập nhật đúng số lượng unread
- [ ] Mark as read hoạt động

---

**🎉 NẾU TẤT CẢ CHECK PASS → HỆ THỐNG HOÀN HẢO!**

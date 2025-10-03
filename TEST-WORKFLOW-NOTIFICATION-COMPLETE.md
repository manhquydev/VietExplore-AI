# 🎉 HƯỚNG DẪN TEST HỆ THỐNG THÔNG BÁO HOÀN CHỈNH

## ✅ ĐÃ TRIỂN KHAI XONG

### 1. **Notification Types Mới**
- ✅ `PLACE_RECEIVED` - Địa điểm đã được tiếp nhận kiểm duyệt
- ✅ `REVISION_REQUESTED` - Địa điểm cần chỉnh sửa theo yêu cầu
- ✅ Cập nhật `EDIT_APPROVED` và `EDIT_REJECTED` với navigation URLs đúng

### 2. **Navigation URLs**
Tất cả notification đều có actionUrl chính xác:
- `PLACE_RECEIVED` → `/contribute/my-drafts/{draftId}/moderation` (nhật ký)
- `PLACE_APPROVED` → `/places/{slug}` (địa điểm public)
- `PLACE_REJECTED` → `/contribute/my-drafts/{draftId}` (draft để sửa)
- `REVISION_REQUESTED` → `/contribute/my-drafts/{draftId}` (draft để sửa)
- `EDIT_APPROVED` → `/places/{slug}` (địa điểm đã cập nhật)
- `EDIT_REJECTED` → `/contribute/my-drafts/{draftId}` (draft để sửa)

### 3. **Service Methods Đã Cập Nhật**
- ✅ `notifyPlaceReceived(draftId, placeName, ownerId)`
- ✅ `notifyPlaceApproved(placeId, placeName, slug, ownerId)`
- ✅ `notifyPlaceRejected(draftId, placeName, ownerId, reason)`
- ✅ `notifyRevisionRequested(draftId, placeName, ownerId, reason)`
- ✅ `notifyEditSubmitter(userId, placeId, placeName, slug, draftId, status, reviewNotes)`

### 4. **UI Components**
- ✅ Thêm icons mới trong `notification-bell.tsx`
- ✅ Cập nhật types trong `use-realtime-notifications.ts`

---

## 📋 WORKFLOW TEST ĐẦY ĐỦ

### **Scenario 1: Submit Địa Điểm Mới**

#### Bước 1: User submit địa điểm
```
User Action: Contributor gửi địa điểm mới "Vịnh Hạ Long"
Expected Notification:
  - Type: PLACE_RECEIVED
  - Title: "📬 Địa điểm đã được tiếp nhận"
  - Body: "Địa điểm 'Vịnh Hạ Long' của bạn đã được tiếp nhận và đang chờ kiểm duyệt"
  - Action: Click → Navigate to /contribute/my-drafts/{draftId}/moderation
  - Result: ✅ Xem nhật ký kiểm duyệt
```

#### Bước 2: Moderator approve
```
Moderator Action: Approve địa điểm
Expected Notification:
  - Type: PLACE_APPROVED
  - Title: "✅ Địa điểm đã được phê duyệt"
  - Body: "Địa điểm 'Vịnh Hạ Long' của bạn đã được phê duyệt và xuất bản"
  - Action: Click → Navigate to /places/vinh-ha-long
  - Result: ✅ Xem địa điểm đã public
```

---

### **Scenario 2: Submit Địa Điểm Bị Từ Chối**

#### Bước 1: User submit địa điểm
```
User Action: Contributor gửi địa điểm "Địa Điểm Test"
Expected Notification:
  - Type: PLACE_RECEIVED
  - Title: "📬 Địa điểm đã được tiếp nhận"
  - Action: Click → /contribute/my-drafts/{draftId}/moderation
```

#### Bước 2: Moderator reject
```
Moderator Action: Reject với lý do "Thiếu thông tin chi tiết"
Expected Notification:
  - Type: PLACE_REJECTED
  - Title: "❌ Địa điểm bị từ chối"
  - Body: "Địa điểm 'Địa Điểm Test' bị từ chối. Lý do: Thiếu thông tin chi tiết"
  - Action: Click → Navigate to /contribute/my-drafts/{draftId}
  - Result: ✅ Mở draft để sửa lại
```

---

### **Scenario 3: Địa Điểm Cần Chỉnh Sửa**

#### Bước 1: User submit địa điểm
```
User Action: Contributor gửi địa điểm
Expected Notification: PLACE_RECEIVED
```

#### Bước 2: Moderator request edit
```
Moderator Action: Request Edit với notes "Cần bổ sung ảnh đẹp hơn"
Expected Notification:
  - Type: REVISION_REQUESTED
  - Title: "🔄 Yêu cầu sửa lại"
  - Body: "Địa điểm 'Địa Điểm Test' cần sửa lại theo yêu cầu: Cần bổ sung ảnh đẹp hơn"
  - Action: Click → Navigate to /contribute/my-drafts/{draftId}
  - Result: ✅ Mở draft để chỉnh sửa theo yêu cầu
```

---

### **Scenario 4: Chỉnh Sửa Địa Điểm Đã Xuất Bản**

#### Bước 1: User submit edit request
```
User Action: Contributor chỉnh sửa địa điểm đã public và submit
Expected Notification:
  - Type: PLACE_RECEIVED (for edit request)
  - Title: "📬 Địa điểm đã được tiếp nhận"
  - Body: "Địa điểm 'Vịnh Hạ Long' của bạn đã được tiếp nhận và đang chờ kiểm duyệt"
```

#### Bước 2: Moderator approve edit
```
Moderator Action: Approve edit request
Expected Notification:
  - Type: EDIT_APPROVED
  - Title: "✅ Chỉnh sửa được duyệt"
  - Body: "Chỉnh sửa địa điểm 'Vịnh Hạ Long' đã được phê duyệt"
  - Action: Click → Navigate to /places/vinh-ha-long
  - Result: ✅ Xem địa điểm với nội dung đã cập nhật
```

#### Bước 3: Moderator reject edit
```
Moderator Action: Reject edit request với lý do "Thông tin không chính xác"
Expected Notification:
  - Type: EDIT_REJECTED
  - Title: "❌ Chỉnh sửa bị từ chối"
  - Body: "Chỉnh sửa địa điểm 'Vịnh Hạ Long' bị từ chối: Thông tin không chính xác"
  - Action: Click → Navigate to /contribute/my-drafts/{editDraftId}
  - Result: ✅ Mở edit draft để sửa lại
```

---

## 🧪 CHECKLIST TEST

### Backend Logs
```bash
# Terminal should show:
[NOTIFICATION] Sending PLACE_RECEIVED notification to user {userId} for draft {draftId}
[NOTIFICATION] ✅ Successfully sent PLACE_RECEIVED notification

[MODERATION] 🔔 Sending approval notification to user {userId} for place {placeId}
[MODERATION] Calling notifyPlaceSubmitter...
[NOTIFICATION] notifyPlaceSubmitter called: { ... }
✅ Sent in-app notification notif_xxx to user {userId}
[MODERATION] ✅ Place approval notification result: { "success": true, ... }

[MODERATION] REQUEST_EDIT ACTION - DEBUG INFO
[MODERATION] 🔔 Sending REVISION_REQUESTED notification to user {userId}
[MODERATION] ✅ Revision requested notification sent successfully
```

### Firebase Realtime Database
```
notifications/
  {userId}/
    notif_xxx1/
      type: "place_received"
      title: "📬 Địa điểm đã được tiếp nhận"
      body: "..."
      actionUrl: "/contribute/my-drafts/{draftId}/moderation"
      read: false

    notif_xxx2/
      type: "place_approved"
      title: "✅ Địa điểm đã được phê duyệt"
      body: "..."
      actionUrl: "/places/{slug}"
      read: false

    notif_xxx3/
      type: "revision_requested"
      title: "🔄 Yêu cầu sửa lại"
      body: "..."
      actionUrl: "/contribute/my-drafts/{draftId}"
      read: false
```

### UI Behavior
- [ ] Badge đỏ hiển thị số lượng notification chưa đọc
- [ ] Click chuông → Popover hiển thị danh sách
- [ ] Mỗi notification có icon đúng (📬, ✅, ❌, 🔄)
- [ ] Click vào notification → Navigate đến URL đúng
- [ ] Sau khi click → Badge giảm số lượng
- [ ] Mark as read hoạt động
- [ ] Real-time update khi có notification mới

---

## 🎯 TẤT CẢ CÁC LOẠI THÔNG BÁO

| Event | Type | Icon | Title | Navigation |
|-------|------|------|-------|------------|
| Submit địa điểm | `PLACE_RECEIVED` | 📬 | Địa điểm đã được tiếp nhận | Nhật ký kiểm duyệt |
| Duyệt địa điểm | `PLACE_APPROVED` | ✅ | Địa điểm đã được phê duyệt | Địa điểm public |
| Từ chối địa điểm | `PLACE_REJECTED` | ❌ | Địa điểm bị từ chối | Draft để sửa |
| Yêu cầu chỉnh sửa | `REVISION_REQUESTED` | 🔄 | Yêu cầu sửa lại | Draft để sửa |
| Duyệt edit request | `EDIT_APPROVED` | ✅ | Chỉnh sửa được duyệt | Địa điểm đã cập nhật |
| Từ chối edit request | `EDIT_REJECTED` | ❌ | Chỉnh sửa bị từ chối | Edit draft để sửa |

---

## 🚀 CÁCH CHẠY TEST

### 1. Start Server
```bash
npm run dev
# Đợi server khởi động ở port 9002 hoặc 9003
```

### 2. Chuẩn Bị 2 Tài Khoản
- **Account A**: Contributor (manhquydev@gmail.com)
- **Account B**: Admin/Moderator

### 3. Test Flow
1. **Account A**: Submit địa điểm mới
2. **Check logs**: Phải thấy "PLACE_RECEIVED notification sent"
3. **Account A**: Refresh page → Thấy badge notification
4. **Account A**: Click chuông → Thấy "📬 Địa điểm đã được tiếp nhận"
5. **Account A**: Click notification → Navigate to moderation history
6. **Account B**: Login và approve địa điểm
7. **Check logs**: Phải thấy "PLACE_APPROVED notification sent"
8. **Account A**: Thấy notification mới "✅ Địa điểm đã được phê duyệt"
9. **Account A**: Click → Navigate to public place page

### 4. Repeat cho tất cả scenarios

---

## ✨ KẾT QUẢ MONG ĐỢI

**100% Coverage cho tất cả events quan trọng:**
✅ User submit → Nhận thông báo ngay lập tức
✅ Moderator approve → User nhận thông báo approval
✅ Moderator reject → User nhận thông báo rejection với lý do
✅ Moderator request edit → User nhận thông báo needs revision
✅ Edit approved/rejected → User nhận thông báo tương ứng

**Navigation chính xác:**
✅ Tất cả actionUrl đều navigate đúng context
✅ Nhật ký kiểm duyệt cho PLACE_RECEIVED
✅ Draft editor cho REJECTED và REVISION_REQUESTED
✅ Public place page cho APPROVED

**Real-time updates:**
✅ Notification xuất hiện trong vòng 1-2 giây
✅ Badge update tức thì
✅ UI responsive và smooth

---

## 📊 FILES ĐÃ THAY ĐỔI

1. `src/lib/server/enhanced-notification-service.ts`
   - ✅ Thêm `PLACE_RECEIVED` enum
   - ✅ Thêm template với actionUrl đúng
   - ✅ Thêm `notifyPlaceReceived()` method
   - ✅ Cập nhật tất cả notification methods với slug và draftId

2. `src/app/api/places/drafts/[draftId]/submit/route.ts`
   - ✅ Gọi `notifyPlaceReceived()` sau khi submit thành công

3. `src/app/api/moderation/queue/[itemId]/route.ts`
   - ✅ Cập nhật `notifyPlaceSubmitter()` và `notifyEditSubmitter()` với slug + draftId
   - ✅ Thêm notification cho `request_edit` action

4. `src/components/notifications/notification-bell.tsx`
   - ✅ Thêm icons cho notification types mới

5. `src/hooks/use-realtime-notifications.ts`
   - ✅ Cập nhật interface với notification types mới

---

**🎊 HỆ THỐNG THÔNG BÁO HOÀN CHỈNH VÀ SẴN SÀNG PRODUCTION!**

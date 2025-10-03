# 🔄 HƯỚNG DẪN RESET HOÀN TOÀN DỰ ÁN

## 📋 Tổng Quan

Script `reset-complete.js` là công cụ reset DỰ ÁN HOÀN TOÀN, xóa **100% dữ liệu** về trạng thái sạch.

### ✅ **So sánh với các scripts khác:**

| Tính năng | reset-vn-admin.js | reset-project.js | **reset-complete.js** |
|-----------|-------------------|------------------|-----------------------|
| Collections xóa | 4 | 4 | **36+** |
| Phủ sóng | 20% | 20% | **100%** |
| Storage cleanup | ✅ `places/` | ✅ `places/` | **✅ 5 folders** |
| Tiếng Việt | ✅ | ❌ | ✅ |
| Progress tracking | ✅ | ❌ | **✅ Chi tiết** |

---

## 🎯 SCRIPT SẼ XÓA GÌ?

### ✅ **Firestore Collections (36+ collections):**

**1. Dữ liệu cốt lõi (4):**
- `users` - Người dùng
- `places` - Địa điểm
- `place_drafts` - Bản nháp địa điểm
- `placeDrafts` - (legacy)

**2. Kiểm duyệt (7):**
- `moderation_queue` - Hàng đợi kiểm duyệt
- `moderationQueue` - (legacy camelCase version)
- `moderation` - Parent collection cho subcollections
- `moderation_logs` - Lịch sử kiểm duyệt
- `suggestions` - Đề xuất
- `edit_suggestions` - Đề xuất chỉnh sửa
- `deletion_requests` - Yêu cầu xóa soft delete

**3. Tương tác người dùng (5):**
- `user_saved_places` - Địa điểm đã lưu
- `user_favorites` - Yêu thích
- `place_reviews` - Đánh giá địa điểm
- `place_reports` - Báo cáo địa điểm
- `reports` - Báo cáo chung

**4. Lộ trình du lịch (4):**
- `itineraries` - Lộ trình AI
- `itinerary_likes` - Lượt thích
- `itinerary_saves` - Lượt lưu
- `itineraryShares` - Chia sẻ

**5. Thông báo (1):**
- `announcements` - Thông báo cộng đồng

**6. Quản trị & Kiểm toán (7):**
- `admin_logs` - Logs admin
- `adminLogs` - (legacy)
- `admin_audit_log` - Audit bypass
- `admin_actions` - Hành động admin
- `audit_logs` - Audit chung
- `audits` - (legacy)
- `admin_settings` - Cài đặt homepage

**7. Quản lý người dùng (2):**
- `user_bans` - Người dùng bị ban
- `ban_schedules` - Lịch trình ban

**8. Hệ thống (7):**
- `system` - Documents: settings, moderation_settings, notification_settings
- `notifications` - Thông báo realtime
- `notification_digests` - Tổng hợp thông báo
- `preview_sessions` - Sessions preview
- `rateLimits` - Rate limiting
- `labels` - Labels
- `partners` - Đối tác

### ✅ **Firebase Storage (5 folders):**
- `places/` - Ảnh địa điểm
- `users/` - Avatar người dùng
- `itineraries/` - Ảnh lộ trình
- `homepage/` - Ảnh homepage regions (bac-bo, trung-bo, nam-bo)
- `announcements/` - Ảnh thông báo

### ✅ **Firebase Authentication:**
- Tất cả users accounts

---

## ❌ **SCRIPT KHÔNG ẢNH HƯỞNG GÌ?**

### ✅ **Cấu hình Firebase GIỮ NGUYÊN:**
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Composite indexes
- `storage.rules` - Storage security rules
- Firebase project settings
- Authentication methods (Email/Password, Google, etc.)
- Cloud Functions deployed
- Firebase Extensions

**QUAN TRỌNG:** Script chỉ xóa **DATA**, không xóa **CẤU HÌNH**!

---

## 📝 CÁC LỆNH SỬ DỤNG

### 1️⃣ **Kiểm tra trạng thái hiện tại:**
```bash
node scripts/reset-complete.js --status
```

**Output:**
```
📊 TÌNH TRẠNG CƠ SỞ DỮ LIỆU HIỆN TẠI
═══════════════════════════════════════════════

📂 FIRESTORE COLLECTIONS:
   📁 users                     : 10 documents
   📁 places                    : 2 documents
   ...
   📊 TỔNG CỘNG: 96 documents

👥 FIREBASE AUTHENTICATION:
   👤 Tổng số users: 10
   👑 Số admin: 1

💾 FIREBASE STORAGE:
   📁 places/              : 4 files
   ...
```

### 2️⃣ **Reset hoàn toàn dự án:**
```bash
node scripts/reset-complete.js --confirm
```

**Quá trình thực hiện:**
```
🔄 DU LỊCH VIỆT - RESET DỰ ÁN HOÀN TOÀN
═══════════════════════════════════════════════

📍 BƯỚC 1/4: Xóa tất cả Firestore collections
   ✅ users: 10 documents
   ✅ places: 2 documents
   ...

📦 BƯỚC 2/4: Xóa tất cả Storage files
   ✅ places/: 4 files
   ...

👥 BƯỚC 3/4: Xóa tất cả Firebase Auth users
   ✅ ĐÃ XÓA: 10 users

👤 BƯỚC 4/4: Tạo tài khoản quản trị viên mới
   ✅ Đã tạo admin user

🎉 RESET DỰ ÁN HOÀN TẤT THÀNH CÔNG!
```

### 3️⃣ **Hiển thị trợ giúp:**
```bash
node scripts/reset-complete.js --help
```

---

## 🔑 THÔNG TIN ADMIN MỚI

Sau khi reset, script tự động tạo admin account:

- **📧 Email:** `admin@dulichviet.tech`
- **🔐 Mật khẩu:** `Manhquy203@`
- **👨‍💼 Tên:** `Quản Trị Viên Du Lịch Việt`
- **🏷️ Username:** `admin-dulichviet`
- **👑 Role:** `admin` (full permissions)

---

## 🚀 CÁC BƯỚC SAU KHI RESET

### 1. Khởi động server
```bash
npm run dev
```

### 2. Đăng nhập admin
- **URL:** http://localhost:9002/admin
- **Email:** admin@dulichviet.tech
- **Mật khẩu:** Manhquy203@

### 3. Thêm dữ liệu mẫu (Tùy chọn)
```bash
# Thêm địa điểm du lịch Việt Nam
node scripts/seed-places-vietnam.js --confirm

# Thêm users mẫu
node scripts/seed-users.js --confirm
```

---

## ⚡ TÍNH NĂNG NỔI BẬT

### ✨ **1. Comprehensive (Toàn diện)**
- Xóa **33+ collections** (so với 4 collections của scripts cũ)
- Xóa **3 Storage folders** (so với 1 folder)
- 100% coverage cho dự án hiện tại

### ✨ **2. Progress Tracking Chi Tiết**
```
📂 Dữ liệu cốt lõi:
   ✅ users: 10 documents
   ✅ places: 2 documents
   📊 Đã xóa 50/100 documents...
```

### ✨ **3. Batch Operations Tối Ưu**
- Xử lý 500 documents/batch (Firestore limit)
- Parallel deletion cho Storage files
- Hiệu quả cao với database lớn

### ✨ **4. Error Handling Robust**
```javascript
try {
  // Delete collections
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    // Collection không tồn tại, bỏ qua
  } else {
    throw error; // Báo lỗi thật sự
  }
}
```

### ✨ **5. Giao Diện Tiếng Việt**
- Tất cả messages bằng tiếng Việt
- Emoji trực quan
- User-friendly cho developer Việt

---

## 🎯 KHI NÀO SỬ DỤNG?

### ✅ **NÊN DÙNG KHI:**
- ✅ Bắt đầu development từ đầu
- ✅ Reset về trạng thái sạch 100%
- ✅ Test tính năng mới từ scratch
- ✅ Có quá nhiều data test/spam
- ✅ Cần đảm bảo không có dữ liệu rác

### ❌ **KHÔNG NÊN DÙNG KHI:**
- ❌ Đang có data production quan trọng
- ❌ Chỉ muốn xóa một phần data
- ❌ Cần giữ lại một số users/places

---

## 🚨 CẢNH BÁO QUAN TRỌNG

### ⚠️ **KHÔNG THỂ HOÀN TÁC**
- Tất cả dữ liệu sẽ bị xóa **VĨNH VIỄN**
- Không có tính năng backup tự động
- Hãy backup thủ công nếu cần

### ⚠️ **YÊU CẦU TRƯỚC KHI CHẠY**

**Files cần thiết:**
```
✅ firebase-service-account.json (trong thư mục gốc)
✅ .env.local (Firebase config đúng)
```

**Quyền truy cập:**
```
✅ Firebase Admin SDK quyền đầy đủ
✅ Firestore Database quyền write
✅ Storage quyền delete
✅ Authentication quyền delete users
```

**Kết nối:**
```
✅ Internet ổn định
✅ Firebase services accessible
```

---

## 💡 TROUBLESHOOTING

### ❌ **Lỗi: Firebase Admin không khởi tạo được**
```
❌ Error initializing Firebase Admin: Error reading...
```

**Giải pháp:**
1. Kiểm tra file `firebase-service-account.json` tồn tại
2. Verify quyền truy cập Firebase project
3. Kiểm tra format JSON file

### ❌ **Lỗi: Không thể xóa Storage files**
```
⚠️  Could not access Firebase Storage
```

**Giải pháp:**
- Script tự động fallback, không ảnh hưởng chức năng chính
- Storage files có thể cần xóa thủ công từ Firebase Console
- Kiểm tra quyền Storage trong Service Account

### ❌ **Lỗi: Một số collections không xóa được**
```
❌ some_collection: Lỗi - Permission denied
```

**Giải pháp:**
- Kiểm tra Security Rules có chặn delete không
- Script chỉ sử dụng Admin SDK (bypass rules)
- Verify Service Account có đủ quyền

---

## 📊 THỐNG KÊ HIỆU SUẤT

**Với database test (96 documents, 6 files):**
- ⏱️ Thời gian: ~6-8 giây
- 📊 Documents xóa: 96
- 📦 Files xóa: 6
- 👥 Users xóa: 10

**Với database lớn (1000+ documents):**
- ⏱️ Thời gian: ~30-60 giây
- Progress tracking hiển thị từng bước
- Batch processing tối ưu

---

## 📞 HỖ TRỢ

**🎯 Mục đích:** Development & Testing
**🚀 Phiên bản:** 1.0 Complete
**📅 Cập nhật:** December 2024
**👨‍💻 Tác giả:** Du Lịch Việt Team

---

## 📋 CHECKLIST TRƯỚC KHI RESET

- [ ] Đã backup dữ liệu quan trọng (nếu có)
- [ ] Kiểm tra file `firebase-service-account.json` tồn tại
- [ ] Đã đọc và hiểu warning về xóa data vĩnh viễn
- [ ] Sẵn sàng với thông tin admin mới
- [ ] Kết nối internet ổn định
- [ ] Đã chạy `--status` để xem trước dữ liệu sẽ xóa

**✅ Sẵn sàng? Chạy lệnh:**
```bash
node scripts/reset-complete.js --confirm
```

---

## 🎉 **CHÚC BẠN PHÁT TRIỂN DỰ ÁN THÀNH CÔNG!** 🇻🇳

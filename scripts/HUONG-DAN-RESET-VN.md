# 🇻🇳 HƯỚNG DẪN RESET DỰ ÁN DU LỊCH VIỆT

## 📋 Tổng Quan

Script `reset-vn-admin.js` được thiết kế đặc biệt cho dự án Du Lịch Việt, giúp:

✅ **Xóa toàn bộ dữ liệu cũ**  
✅ **Tạo tài khoản quản trị viên duy nhất**  
✅ **Giao diện tiếng Việt hoàn toàn**  
✅ **Thông tin admin được cấu hình sẵn**  

## 🔑 Thông Tin Quản Trị Viên

**📧 Email:** `admin@dulichviet.tech`  
**🔐 Mật khẩu:** `Manhquy203@`  
**👨‍💼 Tên:** `Quản Trị Viên Du Lịch Việt`  
**🏷️ Username:** `admin-dulichviet`  

## 📊 Kiểm Tra Trạng Thái Hiện Tại

```bash
node scripts/reset-vn-admin.js --status
```

**Kết quả hiển thị:**
```
📊 TÌNH TRẠNG CƠ SỞ DỮ LIỆU HIỆN TẠI:
=====================================
👥 Người dùng: 5
📍 Địa điểm: 25
⚖️  Hàng đợi kiểm duyệt: 3
📋 Nhật ký kiểm duyệt: 15

👑 DANH SÁCH QUẢN TRỊ VIÊN:
   1. Admin Cũ (admin@old.com)
   2. Test Admin (test@example.com)
```

## 🔄 Reset Hoàn Toàn Dự Án

```bash
node scripts/reset-vn-admin.js --confirm
```

**Quá trình thực hiện:**
1. 📍 **Xóa dữ liệu địa điểm** (places, moderation, storage files)
2. 👥 **Xóa dữ liệu người dùng** (Firestore + Firebase Auth)  
3. 👤 **Tạo quản trị viên mới** với thông tin đã cấu hình

**Thời gian ước tính:** 5-10 giây

## 🎯 Kết Quả Sau Reset

```
🎉 RESET DỰ ÁN HOÀN TẤT THÀNH CÔNG!
==================================
⏱️  Tổng thời gian: 6 giây

🔑 THÔNG TIN ĐĂNG NHẬP QUẢN TRỊ VIÊN:
   📧 Email: admin@dulichviet.tech
   🔐 Mật khẩu: Manhquy203@
   👨‍💼 Tên: Quản Trị Viên Du Lịch Việt
```

## 🚀 Các Bước Tiếp Theo

### 1. Khởi Động Server
```bash
npm run dev
```

### 2. Đăng Nhập Quản Trị
- 🌐 **URL:** http://localhost:9002/admin
- 📧 **Email:** admin@dulichviet.tech  
- 🔐 **Mật khẩu:** Manhquy203@

### 3. Thêm Dữ Liệu Mẫu (Tùy Chọn)
```bash
# Thêm 10 địa điểm du lịch Việt Nam
node scripts/seed-places-vietnam.js --confirm

# Thêm người dùng mẫu
node scripts/seed-users.js --confirm
```

## 🎨 Tính Năng Đặc Biệt

### ✨ Giao Diện Tiếng Việt
- Tất cả thông báo bằng tiếng Việt
- Emoji trực quan dễ hiểu
- Terminology phù hợp với Việt Nam

### ⚡ Tối Ưu Hiệu Suất
- Xử lý batch operations
- Progress tracking chi tiết
- Error handling robust

### 🛡️ Bảo Mật Cao
- Confirmation required (`--confirm`)
- Password mạnh được cấu hình sẵn
- Admin permissions đầy đủ

## 🔧 So Sánh Với Script Cũ

| Tính Năng | Script Cũ | Script Mới |
|-----------|-----------|-----------|
| **Ngôn ngữ** | Tiếng Anh | 🇻🇳 Tiếng Việt |
| **Admin Config** | Generic | 🎯 Custom cho dự án |
| **Output** | Technical | 👥 User-friendly |
| **Domain** | vietexplore.ai | 🌐 dulichviet.tech |

## 🎯 Khi Nào Sử Dụng

### ✅ Nên Dùng Khi:
- Bắt đầu development mới
- Reset về trạng thái sạch
- Có quá nhiều data test/spam
- Cần admin với domain cụ thể
- Muốn giao diện tiếng Việt

### ❌ Không Nên Dùng Khi:
- Đang có data production quan trọng
- Chỉ muốn xóa một phần data
- Cần giữ lại users hiện tại

## 🚨 Lưu Ý Quan Trọng

**⚠️ KHÔNG THỂ HOÀN TÁC**
- Tất cả dữ liệu sẽ bị xóa vĩnh viễn
- Không có tính năng backup tự động
- Hãy backup thủ công nếu cần

**📁 Yêu Cầu Files**
- `firebase-service-account.json` phải tồn tại
- `.env.local` với Firebase config đúng
- Quyền admin trên Firebase project

**🌐 Kết Nối**
- Internet ổn định
- Firebase services accessible
- Storage bucket phải tồn tại

## 💡 Troubleshooting

### Lỗi Firebase Connection
```
❌ Error initializing Firebase Admin: Error reading...
```
**Giải pháp:**
- Kiểm tra file `firebase-service-account.json`
- Verify Firebase project permissions

### Lỗi Storage Access
```
⚠️  Could not access Firebase Storage
```
**Giải pháp:**
- Tự động fallback, không ảnh hưởng chức năng
- Storage files có thể cần xóa thủ công

### Lỗi User Already Exists
```
auth/email-already-exists
```
**Giải pháp:**
- Script tự động xóa users trước
- Nếu vẫn lỗi, chạy lại script

## 📞 Hỗ Trợ

**🎯 Mục đích:** Development & Testing  
**🚀 Phiên bản:** 1.0  
**📅 Cập nhật:** December 2024  
**👨‍💻 Tác giả:** Du Lịch Việt Team  

---

## 📋 Checklist Sử Dụng

- [ ] Đã backup data quan trọng (nếu có)
- [ ] Kiểm tra file `firebase-service-account.json` tồn tại  
- [ ] Đã đọc và hiểu warning về xóa data vĩnh viễn
- [ ] Sẵn sàng với thông tin admin mới
- [ ] Kết nối internet ổn định

**✅ Sẵn sàng? Chạy lệnh:**
```bash
node scripts/reset-vn-admin.js --confirm
```

🎉 **Chúc bạn phát triển dự án thành công!** 🇻🇳
# VietExplore AI - Reset Scripts

## 📋 Tổng quan

Bộ scripts này giúp bạn reset và làm sạch dữ liệu trong dự án VietExplore AI. Rất hữu ích khi:

- Bạn muốn bắt đầu lại từ đầu với dữ liệu sạch
- Có quá nhiều dữ liệu test/spam cần xóa
- Cần tạo lại admin user duy nhất
- Database bị lỗi hoặc corrupted

## 🆕 **KHUYẾN NGHỊ: Sử dụng `reset-complete.js`**

**Script mới nhất (December 2024)** - Xóa **100% dữ liệu** dự án:
- ✅ **36+ Firestore collections** (vs 4 collections của scripts cũ)
- ✅ **5 Storage folders** (places/, users/, itineraries/, homepage/, announcements/)
- ✅ Progress tracking chi tiết
- ✅ Giao diện tiếng Việt

👉 **Xem chi tiết:** [HUONG-DAN-RESET-COMPLETE.md](./HUONG-DAN-RESET-COMPLETE.md)

---

## 📊 So sánh các Reset Scripts

| Tính năng | reset-vn-admin.js | reset-project.js | **reset-complete.js** ⭐ |
|-----------|-------------------|------------------|--------------------------|
| **Collections xóa** | 4 | 4 | **36+** |
| **Phủ sóng dữ liệu** | ~20% | ~20% | **100%** |
| **Storage cleanup** | ✅ `places/` | ✅ `places/` | **✅ 5 folders** |
| **Ngôn ngữ** | 🇻🇳 Tiếng Việt | 🇬🇧 English | **🇻🇳 Tiếng Việt** |
| **Progress tracking** | Cơ bản | Không | **Chi tiết** |
| **Batch operations** | Có | Có | **Tối ưu** |
| **Status preview** | ✅ | ✅ | **✅ Chi tiết** |
| **Use case** | Quick test | Quick test | **Production-ready** |

### 💡 Chọn script nào?

- **🚀 Để reset hoàn toàn 100%:** `reset-complete.js` (Khuyến nghị)
- **⚡ Để reset nhanh 80%:** `reset-vn-admin.js` (Tiếng Việt)
- **🔧 Để custom admin:** `reset-project.js` (Có options)
- **🎯 Để xóa từng phần:** Dùng scripts riêng lẻ

---

## ⚠️ LƯU Ý QUAN TRỌNG

**CÁC SCRIPTS NÀY SẼ XÓA DỮ LIỆU VĨNH VIỄN!**

- Không thể hoàn tác sau khi chạy
- Hãy backup dữ liệu quan trọng trước khi sử dụng
- Test trên development environment trước

## 🔧 Cài đặt

Đảm bảo bạn đã có:

1. **Firebase Service Account Key**
   ```bash
   # File này phải tồn tại:
   firebase-service-account.json
   ```

2. **Node.js Dependencies**
   ```bash
   npm install firebase-admin
   ```

## 📊 Kiểm tra trạng thái hiện tại

Trước khi reset, hãy kiểm tra database hiện tại:

```bash
node scripts/reset-project.js --status
```

**Output mẫu:**
```
📊 Current Database Status:
==========================
👥 Users: 25
📍 Places: 150
⚖️  Moderation queue: 12
📋 Moderation logs: 45

👑 Admin Users:
   1. Admin User (admin@vietexplore.ai)
   2. Test Admin (test@example.com)
```

## 🗑️ Scripts riêng lẻ

### 1. Xóa tất cả users

```bash
# Xóa tất cả users từ Firebase Auth + Firestore
node scripts/clear-all-users.js --confirm
```

**Chức năng:**
- ✅ Xóa tất cả users từ Firebase Authentication
- ✅ Xóa tất cả user documents từ Firestore
- ✅ Xử lý lỗi và retry logic
- ✅ Progress tracking cho datasets lớn

### 2. Xóa tất cả places

```bash
# Xóa tất cả places + related data
node scripts/clear-all-places.js --confirm
```

**Chức năng:**
- ✅ Xóa collection `places`
- ✅ Xóa collection `moderation_queue`
- ✅ Xóa collection `moderation_logs`
- ✅ Xóa tất cả ảnh từ Firebase Storage (`places/` folder)
- ✅ Báo cáo chi tiết số lượng đã xóa

### 3. Tạo admin user duy nhất

```bash
# Tạo admin với thông tin mặc định
node scripts/create-single-admin.js --confirm

# Tạo admin với thông tin custom
node scripts/create-single-admin.js \
  --email admin@yourdomain.com \
  --password YourSecurePassword123 \
  --name "Your Admin Name" \
  --username youradmin \
  --confirm
```

**Thông tin mặc định:**
- **Email:** `admin@vietexplore.ai`
- **Password:** `VietExplore2024!Admin`
- **Name:** `VietExplore Admin`
- **Username:** `admin`

**Chức năng:**
- ✅ Tạo user trong Firebase Auth (email verified)
- ✅ Tạo user document trong Firestore với full profile
- ✅ Set role = 'admin' và permissions
- ✅ Set custom claims cho authorization
- ✅ Error handling cho trường hợp user đã tồn tại

## 🔄 Script tổng hợp - KHUYẾN NGHỊ

### ⭐ Reset hoàn toàn 100% - `reset-complete.js` (MỚI NHẤT)

**Xóa tất cả 36+ collections, Storage files, và Auth users:**

```bash
# 1. Kiểm tra trạng thái hiện tại
node scripts/reset-complete.js --status

# 2. Reset hoàn toàn dự án
node scripts/reset-complete.js --confirm

# 3. Hiển thị trợ giúp
node scripts/reset-complete.js --help
```

**Quy trình thực hiện:**
1. 🗑️ Xóa **36+ Firestore collections** (users, places, deletion_requests, announcements, ...)
2. 📦 Xóa **5 Storage folders** (places/, users/, itineraries/, homepage/, announcements/)
3. 👥 Xóa tất cả **Firebase Auth users**
4. 👤 Tạo **admin user mới** tự động
5. 📊 Báo cáo chi tiết từng bước

**Admin account được tạo:**
- Email: `admin@dulichviet.tech`
- Password: `Manhquy203@`
- Role: `admin` (full permissions)

👉 **Chi tiết đầy đủ:** [HUONG-DAN-RESET-COMPLETE.md](./HUONG-DAN-RESET-COMPLETE.md)

---

### Reset nhanh 80% - `reset-project.js` / `reset-vn-admin.js`

**Xóa 4 collections chính (nhanh hơn nhưng còn sót data):**

```bash
# Reset toàn bộ project với admin mặc định
node scripts/reset-project.js --confirm

# Hoặc dùng phiên bản tiếng Việt
node scripts/reset-vn-admin.js --confirm

# Reset với admin custom
node scripts/reset-project.js \
  --email admin@yourdomain.com \
  --password YourPassword123 \
  --name "Custom Admin" \
  --confirm
```

**Quy trình thực hiện:**
1. 🗑️ Xóa places data (bao gồm ảnh)
2. 👥 Xóa users data
3. 👤 Tạo admin user mới
4. 📊 Báo cáo kết quả

**⚠️ Lưu ý:** Script này chỉ xóa 4 collections, còn sót ~29 collections khác (announcements, itineraries, reviews, etc.)

### Reset chỉ data (giữ lại users)

```bash
# Chỉ xóa places, giữ lại users
node scripts/reset-project.js --data-only --confirm
```

## 📱 Hướng dẫn sử dụng

### Scenario 1: Bắt đầu project mới (100% clean) ⭐

**Khuyến nghị sử dụng `reset-complete.js`:**

```bash
# 1. Kiểm tra trạng thái hiện tại
node scripts/reset-complete.js --status

# 2. Reset hoàn toàn 100% (36+ collections)
node scripts/reset-complete.js --confirm

# 3. Start development server
npm run dev

# 4. Login admin panel: http://localhost:9002/admin
# Email: admin@dulichviet.tech
# Password: Manhquy203@

# 5. (Optional) Seed data mẫu
node scripts/seed-places-vietnam.js --confirm
node scripts/seed-users.js --confirm
```

**Kết quả:**
- ✅ 36+ collections đã xóa (bao gồm deletion_requests, moderation, moderationQueue)
- ✅ Storage files đã xóa (places/, users/, itineraries/, homepage/, announcements/)
- ✅ Tất cả users đã xóa
- ✅ Admin mới đã tạo với thông tin cố định
- ✅ Database 100% sạch, không còn dữ liệu rác

---

### Scenario 2: Reset nhanh 80% (Quick test)

**Dùng script cũ nếu chỉ cần xóa nhanh:**

```bash
# Reset nhanh với tiếng Việt
node scripts/reset-vn-admin.js --confirm

# Hoặc dùng script English
node scripts/reset-project.js --confirm
```

**⚠️ Lưu ý:** Còn sót ~29 collections (announcements, itineraries, reviews, etc.)

---

### Scenario 3: Làm sạch data test (giữ users)

```bash
# Chỉ xóa places, giữ lại user accounts
node scripts/reset-project.js --data-only --confirm

# Hoặc seed lại data mẫu
node scripts/seed-places-vietnam.js --confirm
```

---

### Scenario 4: Tạo lại admin với thông tin riêng

**Nếu muốn custom admin (không dùng admin@dulichviet.tech):**

```bash
# 1. Xóa tất cả users cũ
node scripts/clear-all-users.js --confirm

# 2. Tạo admin mới với thông tin của bạn
node scripts/create-single-admin.js \
  --email youremail@domain.com \
  --password YourSecurePassword \
  --name "Your Name" \
  --confirm
```

**Hoặc sửa trực tiếp trong `reset-complete.js` (line 104-109):**
```javascript
const adminConfig = {
  email: 'youremail@domain.com',
  password: 'YourSecurePassword',
  fullName: 'Your Name',
  username: 'yourusername'
};
```

## 🚨 Troubleshooting

### Lỗi Firebase credentials

```
❌ Error initializing Firebase Admin: Error reading...
```

**Giải pháp:**
1. Kiểm tra file `firebase-service-account.json` tồn tại
2. Đảm bảo file có đúng format JSON
3. Verify Firebase project permissions

### Lỗi permission denied

```
❌ Permission denied: Missing or insufficient permissions
```

**Giải pháp:**
1. Kiểm tra Firebase service account có đủ quyền:
   - Firebase Authentication Admin
   - Cloud Firestore Database Admin  
   - Firebase Storage Admin
2. Re-download service account key từ Firebase Console

### Lỗi rate limiting

```
❌ Too many requests
```

**Giải pháp:**
1. Scripts đã có retry logic, chờ một chút
2. Firebase có giới hạn API calls, thường tự recovery

### Admin user đã tồn tại

```
⚠️ Admin user already exists!
```

**Giải pháp:**
```bash
# Xóa tất cả users trước, rồi tạo lại
node scripts/clear-all-users.js --confirm
node scripts/create-single-admin.js --confirm
```

## 📝 Logs và Monitoring

Tất cả scripts đều có logging chi tiết:

- ✅ Success operations (green)
- ⚠️ Warnings (yellow) 
- ❌ Errors (red)
- 📊 Progress counters
- ⏱️ Time tracking
- 📋 Summary reports

## 🔐 Security Notes

1. **Passwords**: Scripts dùng strong passwords mặc định, nhưng nên đổi sau khi login
2. **Service Account**: Giữ bí mật file `firebase-service-account.json`
3. **Production**: KHÔNG chạy scripts này trên production database
4. **Backup**: Luôn backup trước khi reset

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs chi tiết
2. Verify Firebase setup
3. Check network connection
4. Review troubleshooting section

---

**Created by:** VietExplore AI Team  
**Last updated:** December 2024
# VietExplore AI - Reset Scripts

## 📋 Tổng quan

Bộ scripts này giúp bạn reset và làm sạch dữ liệu trong dự án VietExplore AI. Rất hữu ích khi:

- Bạn muốn bắt đầu lại từ đầu với dữ liệu sạch
- Có quá nhiều dữ liệu test/spam cần xóa
- Cần tạo lại admin user duy nhất
- Database bị lỗi hoặc corrupted

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

### Reset hoàn toàn (All-in-one)

```bash
# Reset toàn bộ project với admin mặc định
node scripts/reset-project.js --confirm

# Reset với admin custom
node scripts/reset-project.js \
  --email admin@yourdomain.com \
  --password YourPassword123 \
  --name "Custom Admin" \
  --confirm
```

**Quy trình thực hiện:**
1. 🗑️ Xóa tất cả places data (bao gồm ảnh)
2. 👥 Xóa tất cả users data 
3. 👤 Tạo admin user mới
4. 📊 Báo cáo kết quả chi tiết

### Reset chỉ data (giữ lại users)

```bash
# Chỉ xóa places, giữ lại users
node scripts/reset-project.js --data-only --confirm
```

## 📱 Hướng dẫn sử dụng

### Scenario 1: Bắt đầu project mới

```bash
# 1. Kiểm tra trạng thái
node scripts/reset-project.js --status

# 2. Reset hoàn toàn
node scripts/reset-project.js --confirm

# 3. Start development server
npm run dev

# 4. Login admin panel: http://localhost:9002/admin
# Email: admin@vietexplore.ai
# Password: VietExplore2024!Reset
```

### Scenario 2: Làm sạch data test

```bash
# Chỉ xóa places, giữ lại user accounts
node scripts/reset-project.js --data-only --confirm

# Hoặc seed lại data mẫu
node scripts/seed-places-vietnam.js --confirm
```

### Scenario 3: Tạo lại admin với thông tin riêng

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
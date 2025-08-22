# 🚀 VietExplore-AI Development Guide

## 📋 Quy trình khởi chạy môi trường phát triển

### 1. 🔧 Khởi chạy emulator và frontend
```bash
npm run dev:emulator
```
**Đợi thấy:**
- `All emulators ready! It is now safe to connect your app.`
- `Ready in X.Xs` (Next.js)

### 2. 👤 Setup admin user (chỉ cần làm 1 lần)
```bash
node scripts/setup-admin-local.js
```
**Kết quả:**
- ✅ Admin user: `manhquydev@gmail.com` / `password123`
- ✅ Role: admin với full permissions
- ✅ Custom claims được set đúng

### 3. 🔐 Đăng nhập và kiểm tra
- **URL**: http://localhost:9002
- **Login**: `manhquydev@gmail.com` / `password123`
- **Kiểm tra**: AuthDebugger (góc phải trên) - Role = "admin"

---

## 🔗 URLs quan trọng

| Service | URL | Mô tả |
|---------|-----|-------|
| **Frontend** | http://localhost:9002 | Next.js app |
| **Firebase UI** | http://127.0.0.1:4000 | Emulator dashboard |
| **Auth UI** | http://127.0.0.1:4000/auth | Quản lý users |
| **Firestore UI** | http://127.0.0.1:4000/firestore | Database explorer |

---

## 🛠️ Scripts hữu ích

### 🔧 Admin Management
```bash
# Tạo admin user (chính)
node scripts/setup-admin-local.js

# Reset password admin
node scripts/fix-admin-password.js

# Debug tất cả users
node scripts/debug-all-users.js
```

### 🔍 Debugging
- **AuthDebugger**: Component trên UI (góc phải trên)
- **DirectFirestoreDebugger**: Component trên UI (góc trái trên)

---

## ⚠️ Lưu ý quan trọng

### 🎯 Development vs Production
- **`npm run dev:emulator`**: Môi trường local an toàn ✅
- **`npm run dev`**: Production data - **NGUY HIỂM** ⚠️

### 🔄 Khi restart emulator
- Emulator data sẽ bị reset
- Cần chạy lại: `node scripts/setup-admin-local.js`
- Đăng nhập lại với credentials mới

### 🚨 Troubleshooting
1. **Role hiển thị "Du khách"**: Chạy lại setup-admin-local.js
2. **Firebase connection failed**: Đảm bảo emulator đang chạy
3. **Permission denied**: Kiểm tra emulator connection trong console

---

## 📦 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NODE_ENV=development
```

**✅ Đã setup hoàn chỉnh - Sẵn sàng phát triển!**

# 🔧 Firebase Emulator Configuration Guide

## Overview
Dự án VietExplore-AI đã được cấu hình để hỗ trợ cả Development (Emulators) và Production (Firebase Cloud).

## 🚀 Development Commands

### 1. Development với Emulators (Khuyến nghị)
```bash
# Chạy emulators + frontend cùng lúc
npm run dev:emulator

# Hoặc chạy riêng lẻ:
npm run emulator        # Chạy Firebase Emulators
npm run dev            # Chạy Next.js (sẽ tự kết nối emulators)
```

### 2. Development với Production Firebase
```bash
npm run dev:production
```

### 3. Production Build
```bash
npm run build
npm start
```

## 🔧 Environment Variables

### Development (.env)
```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true  # Dùng emulators
```

### Production (.env.production)
```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false # Dùng Firebase Cloud
```

## 📊 Emulator URLs

- **Auth:** http://127.0.0.1:9099
- **Firestore:** http://127.0.0.1:8081
- **Functions:** http://127.0.0.1:5002
- **Storage:** http://127.0.0.1:9199
- **Realtime Database:** http://127.0.0.1:9000
- **Emulator UI:** http://127.0.0.1:4000

## ✅ Kiểm tra Kết nối

Khi chạy development, check console browser để thấy:

```
🔧 Connected to Auth Emulator
🔧 Connected to Firestore Emulator
🔧 Connected to Storage Emulator
🔧 Connected to Database Emulator
🔧 Connected to Functions Emulator
✅ All Firebase Emulators connected successfully
```

## 🎯 Lợi ích của Emulators

### ✅ Development với Emulators:
- **An toàn:** Data giả, không ảnh hưởng production
- **Nhanh:** Local, không cần internet
- **Miễn phí:** Không tốn quota Firebase
- **Debug dễ:** Có UI để xem data

### ❌ Development với Production:
- **Rủi ro:** Data thật, có thể làm hỏng production
- **Chậm:** Phụ thuộc internet
- **Tốn tiền:** Sử dụng quota Firebase
- **Khó debug:** Khó theo dõi thay đổi

## 🚨 Lưu ý Quan trọng

1. **Development luôn dùng emulators** (trừ khi test production)
2. **Production build tự động dùng Firebase Cloud**
3. **Không commit file .env với sensitive data**
4. **Check console để đảm bảo kết nối đúng emulator**

## 🔄 Workflow Chuẩn

### Development:
```bash
npm run dev:emulator    # → Emulators + Frontend
```

### Testing Production locally:
```bash
npm run dev:production  # → Production Firebase + Local Frontend
```

### Deploy Production:
```bash
npm run build          # → Build với Production config
firebase deploy        # → Deploy lên Firebase Hosting
```

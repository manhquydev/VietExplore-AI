# 🚀 VietExplore-AI Development & Deployment Guide

## 📋 **ENVIRONMENT MODES**

### 🏠 **1. LOCAL DEVELOPMENT (Emulators) - KHUYẾN NGHỊ**
```bash
npm run dev:emulator
# OR
npm run dev:local
```
**✅ Đặc điểm:**
- Sử dụng Firebase Emulators locally
- Data không ảnh hưởng production
- Hoàn toàn an toàn để test
- Auto-reload khi có thay đổi functions

**🔍 Kiểm tra:**
- Console browser sẽ hiển thị: `🔧 Connected to ... Emulator`
- Emulator UI: http://localhost:4000
- Frontend: http://localhost:9002

---

### 🌐 **2. DEVELOPMENT với PRODUCTION Firebase**
```bash
npm run dev:production
```
**⚠️ Cảnh báo:**
- Kết nối trực tiếp với Firebase Cloud
- **AFFECTS PRODUCTION DATA**
- Chỉ dùng khi cần test với real data
- Console sẽ hiển thị: `⚠️ BE CAREFUL: You are affecting PRODUCTION data!`

---

### 🏭 **3. PRODUCTION DEPLOYMENT**
```bash
# Build và deploy toàn bộ
npm run deploy

# Deploy riêng lẻ
npm run deploy:hosting    # Chỉ deploy frontend
npm run deploy:functions  # Chỉ deploy Cloud Functions
```

## 🔧 **DEVELOPMENT WORKFLOW**

### **Setup lần đầu:**
```bash
# 1. Clone repo
git clone <repo-url>
cd VietExplore-AI

# 2. Install dependencies
npm install
cd functions && npm install && cd ..

# 3. Start development
npm run dev:emulator
```

### **Daily Development:**
```bash
# Start emulators + frontend
npm run dev:emulator

# Trong terminal khác, watch functions changes:
npm run functions:build -- --watch
```

### **Testing Registration/Auth:**
1. Mở: http://localhost:9002/auth/register
2. Đăng ký tài khoản test
3. Kiểm tra Emulator UI: http://localhost:4000
4. Verify user data trong Firestore

## 🔍 **DEBUGGING GUIDES**

### **Nếu gặp lỗi "Missing permissions":**
1. Kiểm tra console: emulators có chạy không?
2. Kiểm tra logs trong terminal emulators
3. Restart emulators: `Ctrl+C` → `npm run dev:emulator`

### **Nếu functions lỗi:**
```bash
# Build functions riêng
npm run functions:build

# Check functions logs
firebase emulators:start --inspect-functions
```

### **Reset emulator data:**
```bash
# Stop emulators
Ctrl+C

# Clear emulator data
firebase emulators:start --import=./emulator-data --export-on-exit
```

## 📁 **FILE STRUCTURE**

```
VietExplore-AI/
├── .env.local          # Development config
├── .env.production     # Production config
├── firebase.json       # Firebase config
├── functions/          # Cloud Functions
│   ├── src/
│   └── lib/           # Built functions
├── src/
│   ├── lib/firebase.ts # Firebase client config
│   └── components/     # React components
└── public/
```

## 🎯 **TESTING CHECKLIST**

### **Local Development:**
- [ ] `npm run dev:emulator` khởi động thành công
- [ ] Console hiển thị emulator connections
- [ ] Registration tạo user thành công
- [ ] Emulator UI hiển thị data đúng
- [ ] No production data được touch

### **Before Production Deploy:**
- [ ] `npm run build` thành công
- [ ] Functions build không lỗi
- [ ] All tests pass: `npm test`
- [ ] TypeScript check: `npm run typecheck`
- [ ] Lint check: `npm run lint`

### **Production Deploy:**
- [ ] `npm run deploy` thành công
- [ ] Functions deploy thành công
- [ ] Website accessible trên production URL
- [ ] Registration/Login hoạt động
- [ ] Data xuất hiện đúng trong Firebase Console

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

#### **1. Emulator connection failed**
```bash
# Solution 1: Restart emulators
Ctrl+C
npm run dev:emulator

# Solution 2: Clear port
netstat -ano | findstr :9099
taskkill /PID <PID> /F
```

#### **2. Functions HTTP 500 error**
```bash
# Check functions logs
firebase emulators:start --inspect-functions

# Rebuild functions
npm run functions:build
```

#### **3. "beforeCreate" duplicate error**
```bash
# Make sure only one beforeCreate function exported
grep -r "beforeCreate" functions/src/
```

## 📞 **SUPPORT**

- **Emulator UI:** http://localhost:4000
- **Logs:** Check terminal running emulators
- **Firebase Console:** https://console.firebase.google.com/project/vietexplore-ai

# Backend Deployment Guide - VietExplore-AI

## 🎯 Tổng quan triển khai Backend

Backend được triển khai theo tài liệu **Firebase Authentication** với các thành phần chính:

### ✅ Đã triển khai
1. **Cloud Functions** - Authentication, Moderation, User Management
2. **Firestore Security Rules** - Role-based access control
3. **Testing Setup** - Jest configuration và validation tests
4. **Client-side Auth Helpers** - React hooks và utilities

---

## 📁 Cấu trúc Backend

```
functions/
├── src/
│   ├── auth/                    # Authentication functions
│   │   ├── onUserCreate.ts      # Firestore trigger cho user creation
│   │   ├── grantRole.ts         # Admin function gán role
│   │   ├── beforeCreate.ts      # Blocking function cho đăng ký
│   │   └── beforeSignIn.ts      # Blocking function cho đăng nhập
│   ├── moderation/              # Moderation functions
│   │   └── placeModeration.ts   # Submit/approve place drafts
│   ├── user/                    # User management
│   │   └── userManagement.ts    # Admin user controls
│   ├── itinerary/               # Itinerary helpers
│   │   └── itineraryHelpers.ts  # Share, duplicate, report
│   ├── utils/                   # Utilities
│   │   └── validation.ts        # Validation helpers
│   ├── __tests__/               # Test files
│   └── index.ts                 # Main export file
├── package.json
├── jest.config.js
└── tsconfig.json

src/lib/
├── firebase.ts                  # Firebase config với App Check
├── auth.ts                      # Client-side auth helpers
└── auth-guards.ts               # Route protection components
```

---

## 🚀 Deployment Steps

### 1. Cấu hình Environment Variables

Tạo file `.env.local` với các biến:
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# App Check (reCAPTCHA v3)
NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY=your_recaptcha_site_key

# Development
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### 2. Deploy Cloud Functions

```bash
# Build functions
cd functions
npm run build

# Deploy tất cả functions
firebase deploy --only functions

# Hoặc deploy từng function cụ thể
firebase deploy --only functions:handleUserCreate
firebase deploy --only functions:grantRole
```

### 3. Deploy Firestore Rules

```bash
# Deploy Security Rules
firebase deploy --only firestore:rules

# Deploy Indexes
firebase deploy --only firestore:indexes
```

### 4. Cấu hình Firebase Console

#### 4.1 Authentication Settings
- ✅ Bật Email/Password provider
- ✅ Bật Google provider
- ✅ Bật Email Verification bắt buộc
- ✅ Thiết lập domain whitelist cho OAuth

#### 4.2 App Check
- ✅ Bật App Check cho Web
- ✅ Cấu hình reCAPTCHA v3
- ✅ Enforce cho Firestore, Storage, Functions

#### 4.3 Blocking Functions
- ✅ Deploy `beforeCreate` và `beforeSignIn`
- ✅ Test với email domain bị cấm

---

## 🧪 Testing

### Chạy Tests
```bash
cd functions
npm test                    # Chạy tất cả tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Test Coverage
- ✅ Validation helpers - 100%
- ✅ Business logic functions
- ⚠️ Integration tests cần Firebase Emulator

---

## 🔐 Security Features

### Đã triển khai theo tài liệu:

1. **Email Verification bắt buộc**
   - Security Rules yêu cầu `email_verified = true` cho write operations
   - Client helpers kiểm tra verification status

2. **Role-based Access Control**
   - Custom Claims: `role`, `verifiedContributor`, `partnerId`, `permissions`
   - Firestore Rules theo role hierarchy
   - Client-side guards và middleware

3. **Blocking Functions**
   - Chặn domain email tạm/spam
   - Rate limiting đăng ký theo IP
   - Chặn user bị disable

4. **App Check**
   - reCAPTCHA v3 protection
   - Enforce cho tất cả Firebase services

5. **Audit Logging**
   - Log tất cả thay đổi role/permissions
   - Track user status changes
   - Moderation action logs

---

## 📋 Role & Permissions Matrix

| Role | Đọc Places | Tạo Itinerary | Tạo Place Draft | Fast Track | Moderate | Admin |
|------|------------|---------------|-----------------|------------|----------|-------|
| Guest | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Traveler | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Contributor | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Partner | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Moderator | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🔄 Next Steps

### Cần triển khai tiếp:
1. **MFA Setup** cho Moderator/Admin
2. **Email Templates** tùy chỉnh
3. **Analytics & Monitoring** với Crashlytics
4. **Backup & Recovery** strategies
5. **Performance optimization** cho Functions

### Integration với Frontend:
1. Cập nhật auth components sử dụng helpers mới
2. Implement role-based UI hiding/showing
3. Add email verification flow
4. Create admin dashboard cho user management

---

## 🛠️ Troubleshooting

### Common Issues:

1. **Functions deployment fails**
   ```bash
   # Check build errors
   cd functions && npm run build
   
   # Check Firebase project
   firebase use --list
   ```

2. **Security Rules errors**
   ```bash
   # Test rules locally
   firebase emulators:start --only firestore
   ```

3. **App Check issues**
   - Verify reCAPTCHA site key
   - Check domain whitelist
   - Monitor App Check dashboard

### Debug Commands:
```bash
# View function logs
firebase functions:log

# Test with emulator
firebase emulators:start --only functions,auth,firestore

# Check project status
firebase projects:list
```

---

## 📚 Tài liệu tham khảo

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Cloud Functions Testing](https://firebase.google.com/docs/functions/unit-testing)
- [App Check Setup](https://firebase.google.com/docs/app-check)



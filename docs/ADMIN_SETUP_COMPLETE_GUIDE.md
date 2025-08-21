# VietExplore AI - Complete Admin Setup Guide

## 🎯 Tổng Quan
Hướng dẫn hoàn chỉnh để thiết lập và sử dụng hệ thống Admin cho VietExplore AI với Firebase Authentication và RBAC.

## ✅ Admin đã được Setup Thành Công

### 👤 Admin Account Details
- **Email**: manhquydev@gmail.com
- **UID**: QQ986yaD9WUMjUyUDwhDDeL7VFu2
- **Role**: admin
- **Status**: active
- **Permissions**: * (full access)

### 🔐 Custom Claims Configured
```json
{
  "role": "admin",
  "verifiedContributor": true,
  "partnerId": null,
  "permissions": ["*"]
}
```

## 🔧 Environment Configuration

### 1. Frontend Environment (.env.local)
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAruiU_SkLHyOKE9tK5nWkc1FMCYJ4jfJc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vietexplore-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vietexplore-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vietexplore-ai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=366287046860
NEXT_PUBLIC_FIREBASE_APP_ID=1:366287046860:web:1ab1d22c3be92ba2fd9a69

# App Check (reCAPTCHA v3)
NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY=6Lcysq0rAAAAALEPzAMOrcdpMa63nQ5hqMecpg8X
```

### 2. Functions Environment (functions/.env)
```env
# Admin Setup Keys
ADMIN_SETUP_KEY=vietexplore-admin-setup-2024
EMERGENCY_ADMIN_KEY=emergency-admin-promote-2024

# Firebase Admin SDK (Production - Optional)
FIREBASE_ADMIN_PROJECT_ID=vietexplore-ai
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@vietexplore-ai.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[PRIVATE_KEY_CONTENT]\n-----END PRIVATE KEY-----\n"
```

## 🚀 Authentication System

### ✅ Implemented Features
1. **Email/Password Authentication**
   - Registration với email verification
   - Login với error handling
   - Password reset functionality
   - Account status checking

2. **Google OAuth Integration**
   - Popup-based Google login
   - Auto profile creation
   - Error handling cho popup blocks

3. **Security Features**
   - Email verification required
   - Role-based access control
   - Custom claims integration
   - Account suspension support

### 🔗 Auth Flow Routes
- **Login**: `/auth/login` - Email/Password + Google
- **Register**: `/auth/register` - Full registration form
- **Forgot Password**: `/auth/forgot-password` - Password reset
- **Admin Setup**: `/admin/setup` - Initial admin creation

## 📱 Admin Management System

### 1. Admin Dashboard Access
**URL**: `/admin/dashboard`
**Requirements**: 
- Login với manhquydev@gmail.com
- Admin role verified
- Email verification complete

### 2. User Management
**URL**: `/admin/users`
**Features**:
- View all users với pagination
- Search by email/name
- Filter by role và status
- Assign roles với audit trail
- Suspend/activate accounts
- View user statistics

### 3. Available Admin Functions
```typescript
// Role Management
assignUserRole(targetUserId, newRole, reason)
promoteUser(targetUserId, reason)
toggleUserStatus(targetUserId, action, reason)

// User Management
getAllUsers(limit, filters)
getAuditLogs(filters)

// System Management
checkSetupStatus()
emergencyPromoteAdmin(email, emergencyKey, reason)
```

## 🔒 Security Implementation

### 1. Firebase Admin SDK Security
- **Service Account**: Stored securely in environment variables
- **Private Key**: Never exposed to client-side
- **Admin Functions**: Server-side only operations
- **Audit Logging**: All admin actions tracked

### 2. RBAC Security
- **Role Hierarchy**: Guest → Traveler → Contributor → Partner → Moderator → Admin
- **Permission Matrix**: 20+ granular permissions
- **Self-Protection**: Admin cannot demote themselves
- **Audit Trail**: Complete action logging

### 3. Firebase Console Security
- **Project Access**: Limited to authorized accounts
- **Service Account**: Proper IAM roles configured
- **App Check**: reCAPTCHA v3 protection enabled
- **Security Rules**: Multi-layer protection deployed

## 🧪 Testing Instructions

### 1. Test Authentication Flow
```bash
# 1. Start development server
npm run dev

# 2. Test registration
- Go to /auth/register
- Register với email mới
- Check email verification
- Complete registration

# 3. Test login
- Go to /auth/login
- Login với registered account
- Test Google login
- Test forgot password

# 4. Test admin access
- Login với manhquydev@gmail.com
- Go to /admin/dashboard
- Verify admin permissions
- Test user management
```

### 2. Test RBAC System
```bash
# Create test users với different roles
1. Register normal user (traveler)
2. Use admin to promote to contributor
3. Test permission differences
4. Verify security rules working
```

### 3. Test Admin Functions
```bash
# In admin dashboard:
1. View user list
2. Assign roles
3. Suspend/activate accounts
4. View audit logs
5. Check system statistics
```

## 🚀 Production Deployment

### 1. Firebase Console Setup
**Authentication**:
- Enable Email/Password provider
- Enable Google provider
- Configure authorized domains
- Set up App Check với reCAPTCHA v3

**Firestore**:
- ✅ Rules deployed
- ✅ Indexes deployed
- Verify security rules working

**Storage**:
- ✅ Rules deployed
- Configure bucket region (asia-southeast1)

**Realtime Database**:
- ✅ Rules deployed
- Verify live features working

### 2. Deploy Functions
```bash
# After configuring storage bucket region
firebase deploy --only functions

# Or deploy specific admin functions
firebase deploy --only functions:assignUserRole,getAllUsers,createFirstAdmin
```

### 3. Frontend Deployment
```bash
# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel:
- All NEXT_PUBLIC_* variables
- Firebase configuration
- App Check key
```

## 🎯 Admin Usage Guide

### 1. First-time Login
1. **Access**: https://your-domain.com/auth/login
2. **Email**: manhquydev@gmail.com
3. **Password**: [Your Firebase Auth password]
4. **Verify**: Email verification if required
5. **Access**: Admin dashboard automatically available

### 2. Managing Users
1. **Navigate**: `/admin/users`
2. **Search**: Find users by email/name
3. **Filter**: By role (traveler, contributor, etc.)
4. **Assign Role**: Click "Đổi vai trò"
   - Select new role
   - Provide reason
   - Confirm assignment
5. **Manage Status**: Click "Khóa/Kích hoạt"
   - Provide reason
   - Confirm action

### 3. Role Assignment Rules
```
Traveler → Contributor: Verify content quality
Contributor → Partner: Business verification
Partner → Moderator: Admin assignment only
Moderator → Admin: Admin assignment only
```

### 4. Monitoring & Audit
- **Audit Logs**: Track all admin actions
- **User Statistics**: Monitor role distribution
- **System Health**: Check function performance
- **Security Alerts**: Monitor suspicious activities

## 🔧 Troubleshooting

### Common Issues

#### 1. "Permission Denied" khi access admin
**Cause**: Role chưa được set hoặc email chưa verify
**Solution**:
```bash
# Check custom claims in Firebase Console
# Or run setup script again:
node scripts/setup-admin.js
```

#### 2. Google Login không hoạt động
**Cause**: Google provider chưa enable hoặc domain chưa authorize
**Solution**:
- Enable Google provider in Firebase Console
- Add domain to authorized domains
- Configure OAuth consent screen

#### 3. Functions deployment failed
**Cause**: Storage bucket region chưa configure
**Solution**:
- Go to Firebase Console → Storage
- Create bucket in asia-southeast1 region
- Retry deployment

### Emergency Access
```bash
# If admin access lost, use emergency promotion:
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./vietexplore-ai-firebase-adminsdk-fbsvc-3554e3a673.json');
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
admin.auth().setCustomUserClaims('QQ986yaD9WUMjUyUDwhDDeL7VFu2', {role: 'admin'});
console.log('Emergency admin access restored');
"
```

## 📊 System Status

### ✅ Deployed Components
- ✅ **Firestore Rules**: RBAC protection active
- ✅ **Firestore Indexes**: Performance optimized
- ✅ **RTDB Rules**: Real-time features protected
- ✅ **Storage Rules**: Media security active
- ✅ **Admin User**: manhquydev@gmail.com configured
- ✅ **Auth System**: Firebase Auth integrated

### ⏳ Pending Tasks
- 🔄 **Cloud Functions**: Deploy after storage bucket config
- 🔄 **Environment**: Create .env.local với provided config
- 🔄 **Google OAuth**: Enable in Firebase Console
- 🔄 **Production Domain**: Configure authorized domains

## 🎉 Ready for Testing

**VietExplore AI** giờ đây có:
- ✅ **Real Firebase Authentication**: Email/Password + Google OAuth
- ✅ **Admin Account Ready**: manhquydev@gmail.com với full permissions
- ✅ **RBAC System**: Complete role-based access control
- ✅ **Security Protection**: Multi-layer security deployed
- ✅ **Admin Dashboard**: Professional user management interface

### 🚀 Next Steps:
1. **Create .env.local** với Firebase config provided
2. **Enable Google OAuth** in Firebase Console
3. **Test Authentication**: Register/login flows
4. **Configure Storage Bucket** region để deploy functions
5. **Access Admin Dashboard**: Manage users và test permissions

**System ready cho extensive testing với real users!** 🌟

---
*Setup Guide: [Current Date] - VietExplore AI Admin Team*

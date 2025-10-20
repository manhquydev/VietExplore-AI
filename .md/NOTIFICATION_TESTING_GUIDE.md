# 🧪 NOTIFICATION SYSTEM TESTING GUIDE

## 🔍 **KIỂM TRA VÀ DEBUG NOTIFICATION SYSTEM**

### **⚠️ VẤN ĐỀ HIỆN TẠI**
- Admin notification bell luôn hiển thị 3 thông báo cố định
- Nút bấm admin notification không hoạt động
- Cần verify Firebase connection và API endpoints

---

## 📋 **BƯỚC KIỂM TRA CHI TIẾT**

### **1. Truy cập Test Page**
```
URL: http://localhost:9002/test-notifications
```

### **2. Debug Firebase Connection (Admin only)**

#### **🐛 Debug Steps:**
1. **Login với admin account**
2. **Click "🔍 Debug Info" button** trong Admin section
3. **Check browser console** cho debug information

**Expected Output trong console:**
```javascript
🔍 Debug Info: {
  userId: "admin_user_id",
  userRole: "admin", 
  checks: {
    realtimeDatabase: { status: "connected", notificationCount: X },
    firestore: { status: "connected", notificationCount: Y },
    userPresence: { status: "found", data: {...} },
    adminDashboard: { status: "accessible", recentNotifications: {...} }
  }
}
```

### **3. Clear & Create Test Notifications**

#### **🗑️ Clear All Notifications:**
1. **Click "🗑️ Clear All" button**
2. **Notification bell** should show 0 notifications
3. **Verify:** Unread count = 0

#### **➕ Create Test Notifications:**
1. **Click "➕ Create 3 Test Notifications" button**
2. **Wait 2-3 seconds**
3. **Check notification bell** - should show 3 new notifications
4. **Verify:** Unread count = 3

### **4. Test Admin Notifications**

#### **🚨 System Performance Test:**
```javascript
// Expected behavior:
1. Click "🚨 System Performance" button
2. Toast notification: "Admin notification sent successfully"  
3. Notification bell: New notification appears
4. Real-time update: Badge count increases
```

#### **🔴 Database Issues Test:**
```javascript
// Expected behavior:
1. Click "🔴 Database Issues" button
2. Toast notification: Success message
3. Notification bell: Critical notification with red priority
4. Real-time sync: Immediate update
```

---

## 🔧 **MANUAL API TESTING**

### **Debug Endpoint Test:**
```bash
# Get debug information
curl -X GET http://localhost:9002/api/debug/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Clear Notifications Test:**
```bash
curl -X POST http://localhost:9002/api/debug/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"action": "clear_notifications"}'
```

### **Admin Notification Test:**
```bash
curl -X POST http://localhost:9002/api/admin/system/health \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"action": "test_notification", "testType": "system_performance"}'
```

---

## ✅ **EXPECTED RESULTS**

### **✅ Working Notification System Should Show:**

#### **Firebase Connection:**
- ✅ `realtimeDatabase: { status: "connected" }`
- ✅ `firestore: { status: "connected" }`
- ✅ `userPresence: { status: "found" }`

#### **Notification Bell Behavior:**
- ✅ **Dynamic count:** Updates real-time based on actual data
- ✅ **Clear function:** Count goes to 0 when cleared
- ✅ **Create function:** Count increases when notifications added
- ✅ **Admin notifications:** New notifications appear when admin buttons clicked

#### **Real-time Updates:**
- ✅ **Instant sync:** Notifications appear immediately
- ✅ **Badge updates:** Unread count updates in real-time
- ✅ **Status indicators:** Connection status shows green
- ✅ **Toast notifications:** Success messages when actions performed

---

## 🚨 **TROUBLESHOOTING COMMON ISSUES**

### **Issue 1: Notification Bell Always Shows 3**
**Possible Causes:**
- Mock data in component
- Firebase rules blocking access
- Cached data from development

**Solutions:**
1. Clear browser data and cookies
2. Check Firebase console for actual data
3. Verify user authentication token
4. Test with debug endpoint

### **Issue 2: Admin Buttons Not Working**
**Possible Causes:**
- API endpoint not found (404)
- Authentication failure (403)
- Firebase Admin SDK not initialized

**Solutions:**
1. Check browser network tab for API calls
2. Verify admin role in JWT token
3. Check server logs for errors
4. Test API endpoints manually with curl

### **Issue 3: Firebase Connection Issues**
**Possible Causes:**
- Firebase config missing or incorrect
- Database rules too restrictive
- Network connectivity issues

**Solutions:**
1. Check `.env.local` for Firebase config
2. Verify Firebase rules are deployed
3. Test Firebase connection with debug endpoint
4. Check Firebase console for authentication logs

---

## 📊 **SUCCESS CRITERIA**

**✅ Notification System is Working Correctly When:**

1. **Debug Info shows all connections successful**
2. **Clear All button reduces count to 0**
3. **Create Test Notifications increases count by 3**
4. **Admin notification buttons trigger real notifications**
5. **Notification bell updates in real-time**
6. **Toast messages appear for successful actions**
7. **Network tab shows successful API calls (200 status)**
8. **Browser console shows no Firebase errors**

---

## 🎯 **NEXT STEPS IF ISSUES FOUND**

### **If Debug Shows Firebase Connection Issues:**
1. Check Firebase project configuration
2. Verify database rules deployment
3. Review authentication setup
4. Test with simple Firebase read/write

### **If Admin Notifications Don't Work:**
1. Verify API endpoints are accessible
2. Check authentication middleware
3. Review admin role permissions
4. Test notification service methods

### **If Real-time Updates Fail:**
1. Check Firebase Realtime Database setup
2. Verify client-side Firebase configuration
3. Review useRealtimeNotifications hook
4. Test with manual database writes

---

## 📞 **SUPPORT INFORMATION**

**Development Server:** http://localhost:9002
**Test Page:** http://localhost:9002/test-notifications
**Debug API:** http://localhost:9002/api/debug/notifications
**Admin Health API:** http://localhost:9002/api/admin/system/health

**Important Files:**
- `src/hooks/use-realtime-notifications.ts` - Main notification hook
- `src/lib/server/notification-service.ts` - Server-side notification logic  
- `src/components/notifications/notification-bell.tsx` - UI component
- `database.rules.json` - Firebase Realtime Database rules

**Testing with this guide sẽ help identify exactly where the notification system issue lies!** 🎯
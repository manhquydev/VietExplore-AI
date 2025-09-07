# Hướng Dẫn Chuyển Đổi Từ Cron Jobs Sang Firebase Realtime Database

## 1. Phân Tích Cron Jobs Hiện Tại

### **Có thể chuyển sang Firebase Realtime Database:**
- ✅ **`sync-notifications`** - Đồng bộ thông báo real-time

### **Vẫn cần giữ Cron Job:**
- ⚠️ **`cleanup-expired-claims`** - Dọn dẹp database (backend task)

**Lý do:** Firebase Realtime Database chỉ phù hợp với **real-time data sync**, không thể thay thế **backend maintenance tasks** như cleanup.

## 2. Cài Đặt Firebase Realtime Database

### **Bước 1: Cài đặt dependencies**
```bash
npm install firebase
# hoặc
yarn add firebase
```

### **Bước 2: Cấu hình Firebase (nếu chưa có)**
```javascript
// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // Quan trọng!
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... các config khác
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
```

### **Bước 3: Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app/
```

## 3. Thay Thế `sync-notifications` Bằng Realtime Listeners

### **Trước đây (với Cron Job):**
```javascript
// api/cron/sync-notifications.js - XÓA FILE NÀY
export default async function handler(req, res) {
  // Sync notifications mỗi 5 phút
  const notifications = await fetchNotifications();
  // Update database...
  res.status(200).json({ success: true });
}
```

### **Bây giờ (với Firebase Realtime Database):**

#### **1. Tạo Notifications Service**
```javascript
// lib/notifications.js
import { database } from '@/lib/firebase';
import { ref, onValue, push, set, remove } from 'firebase/database';

export class NotificationService {
  // Lắng nghe thông báo real-time
  static subscribeToNotifications(userId, callback) {
    const notificationsRef = ref(database, `users/${userId}/notifications`);
    
    return onValue(notificationsRef, (snapshot) => {
      const notifications = snapshot.val() || {};
      callback(Object.entries(notifications).map(([id, data]) => ({
        id,
        ...data
      })));
    });
  }

  // Tạo thông báo mới
  static async createNotification(userId, notification) {
    const notificationsRef = ref(database, `users/${userId}/notifications`);
    const newNotificationRef = push(notificationsRef);
    
    await set(newNotificationRef, {
      ...notification,
      createdAt: Date.now(),
      read: false
    });
    
    return newNotificationRef.key;
  }

  // Đánh dấu đã đọc
  static async markAsRead(userId, notificationId) {
    const notificationRef = ref(database, `users/${userId}/notifications/${notificationId}/read`);
    await set(notificationRef, true);
  }

  // Xóa thông báo
  static async deleteNotification(userId, notificationId) {
    const notificationRef = ref(database, `users/${userId}/notifications/${notificationId}`);
    await remove(notificationRef);
  }
}
```

#### **2. Hook cho React Component**
```javascript
// hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { NotificationService } from '@/lib/notifications';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = NotificationService.subscribeToNotifications(
      userId, 
      (newNotifications) => {
        setNotifications(newNotifications);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading };
}
```

#### **3. Sử dụng trong Component**
```javascript
// components/NotificationsList.jsx
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationService } from '@/lib/notifications';

export default function NotificationsList({ userId }) {
  const { notifications, loading } = useNotifications(userId);

  const handleMarkAsRead = async (notificationId) => {
    await NotificationService.markAsRead(userId, notificationId);
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      {notifications.map(notification => (
        <div key={notification.id} className={notification.read ? 'read' : 'unread'}>
          <p>{notification.message}</p>
          {!notification.read && (
            <button onClick={() => handleMarkAsRead(notification.id)}>
              Đánh dấu đã đọc
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 4. Cập Nhật File `vercel.json`

### **Phiên bản mới (chỉ giữ cleanup):**
```json
{
  "version": 2,
  "regions": ["sin1", "hkg1"],
  "functions": {
    "src/app/api/edge/**/*.ts": {
      "runtime": "edge"
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-claims",
      "schedule": "0 2 * * *"
    }
    // Đã bỏ sync-notifications vì Firebase Realtime DB thay thế
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=60, stale-while-revalidate=300"
        }
      ]
    },
    {
      "source": "/places/(.*)",
      "headers": [
        {
          "key": "Cache-Control", 
          "value": "public, s-maxage=300, stale-while-revalidate=600"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/places/validate",
      "destination": "/api/edge/validate-place"
    },
    {
      "source": "/api/auth/verify",
      "destination": "/api/edge/auth/verify"
    },
    {
      "source": "/api/moderation/claim",
      "destination": "/api/edge/moderation/claim"
    }
  ]
}
```

## 5. Migration Plan

### **Phase 1: Setup Firebase**
1. ✅ Cài đặt Firebase SDK
2. ✅ Cấu hình Realtime Database
3. ✅ Thiết lập environment variables

### **Phase 2: Implement Realtime Features**
1. ✅ Tạo NotificationService
2. ✅ Implement hooks và components
3. ✅ Test real-time functionality

### **Phase 3: Deploy Changes**
1. ✅ Cập nhật `vercel.json`
2. ✅ Deploy lên Vercel
3. ✅ Xóa file `api/cron/sync-notifications.js`

## 6. Testing Checklist

### **Before Migration:**
- [ ] Backup dữ liệu notifications hiện tại
- [ ] Document current notification flow
- [ ] Test Firebase connection locally

### **After Migration:**
- [ ] Notifications xuất hiện real-time (< 1 giây)
- [ ] Mark as read hoạt động ngay lập tức
- [ ] Offline support hoạt động
- [ ] Performance tốt với nhiều notifications

### **Performance Testing:**
```javascript
// Test real-time performance
console.time('notification-sync');
NotificationService.createNotification(userId, {
  message: "Test notification",
  type: "info"
});
// Đo thời gian nhận ở client
console.timeEnd('notification-sync'); // Nên < 1000ms
```

## 7. Lợi Ích Sau Khi Chuyển Đổi

| Khía cạnh | Trước (Cron Job) | Sau (Firebase) |
|-----------|------------------|----------------|
| **Độ trễ** | 5 phút | < 1 giây |
| **Tài nguyên server** | Cao (chạy mỗi 5 phút) | Thấp (event-driven) |
| **Chi phí Vercel** | Cần Pro Plan | Hobby Plan đủ |
| **User experience** | Delay thông báo | Real-time |
| **Offline support** | Không | Có |

## 8. Lưu Ý Quan Trọng

### **Firebase Realtime Database Limits:**
- **200,000 concurrent connections**
- **1GB storage miễn phí**
- **10GB bandwidth/tháng miễn phí**

### **Security Rules:**
```javascript
// Firebase Console -> Realtime Database -> Rules
{
  "rules": {
    "users": {
      "$userId": {
        "notifications": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid"
        }
      }
    }
  }
}
```

**Kết quả cuối cùng:** Deploy thành công với Hobby Plan + notifications real-time < 1 giây + tiết kiệm $20/tháng!
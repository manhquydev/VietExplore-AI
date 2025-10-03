/**
 * DEBUG SCRIPT - Kiểm tra toàn bộ flow thông báo
 *
 * Chạy: node debug-notification-flow.js
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

console.log('\n🔍 ===== DEBUG NOTIFICATION FLOW =====\n');

// Step 1: Kiểm tra Environment Variables
console.log('📋 STEP 1: Kiểm tra Environment Variables');
console.log('-------------------------------------------');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('FIREBASE_DATABASE_URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
console.log('FIREBASE_ADMIN_SDK_JSON exists:', !!process.env.FIREBASE_ADMIN_SDK_JSON);

if (!process.env.FIREBASE_ADMIN_SDK_JSON) {
  console.error('❌ FIREBASE_ADMIN_SDK_JSON không tồn tại!');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
  console.error('❌ NEXT_PUBLIC_FIREBASE_DATABASE_URL không tồn tại!');
  process.exit(1);
}

console.log('✅ Environment variables OK\n');

// Step 2: Khởi tạo Firebase Admin
console.log('📋 STEP 2: Khởi tạo Firebase Admin SDK');
console.log('-------------------------------------------');

let serviceAccount;
try {
  const parsed = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON);
  serviceAccount = {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  };
  console.log('✅ Parse FIREBASE_ADMIN_SDK_JSON thành công');
  console.log('   Project ID:', serviceAccount.projectId);
  console.log('   Client Email:', serviceAccount.clientEmail);
} catch (error) {
  console.error('❌ Parse FIREBASE_ADMIN_SDK_JSON thất bại:', error.message);
  process.exit(1);
}

try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
    console.log('✅ Firebase Admin initialized');
    console.log('   Database URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const rtdb = admin.database();

console.log('✅ Firebase Admin SDK OK\n');

// Step 3: Test Realtime Database connection
console.log('📋 STEP 3: Test Realtime Database Connection');
console.log('-------------------------------------------');

async function testRealtimeDB() {
  try {
    const testRef = rtdb.ref('_health_check');
    await testRef.set({
      test: 'connection',
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    const snapshot = await testRef.get();
    console.log('✅ Realtime Database write/read OK');
    console.log('   Test data:', snapshot.val());

    // Cleanup
    await testRef.remove();
    return true;
  } catch (error) {
    console.error('❌ Realtime Database connection failed:', error.message);
    return false;
  }
}

// Step 4: Tìm một user để test
console.log('\n📋 STEP 4: Tìm users trong database');
console.log('-------------------------------------------');

async function findTestUsers() {
  try {
    // Tìm 1 contributor và 1 moderator/admin
    const contributorSnapshot = await db.collection('users')
      .where('role', 'in', ['contributor', 'partner', 'traveler'])
      .limit(1)
      .get();

    const moderatorSnapshot = await db.collection('users')
      .where('role', 'in', ['moderator', 'admin'])
      .limit(1)
      .get();

    const contributor = contributorSnapshot.empty ? null : {
      id: contributorSnapshot.docs[0].id,
      ...contributorSnapshot.docs[0].data()
    };

    const moderator = moderatorSnapshot.empty ? null : {
      id: moderatorSnapshot.docs[0].id,
      ...moderatorSnapshot.docs[0].data()
    };

    console.log('Contributors found:', contributorSnapshot.size);
    if (contributor) {
      console.log('   ID:', contributor.id);
      console.log('   Name:', contributor.fullName || contributor.email);
      console.log('   Role:', contributor.role);
    }

    console.log('\nModerators/Admins found:', moderatorSnapshot.size);
    if (moderator) {
      console.log('   ID:', moderator.id);
      console.log('   Name:', moderator.fullName || moderator.email);
      console.log('   Role:', moderator.role);
    }

    return { contributor, moderator };
  } catch (error) {
    console.error('❌ Error finding users:', error.message);
    return { contributor: null, moderator: null };
  }
}

// Step 5: Test gửi notification trực tiếp
console.log('\n📋 STEP 5: Test gửi notification');
console.log('-------------------------------------------');

async function sendTestNotification(userId, userName) {
  try {
    console.log(`\n🔔 Đang gửi test notification đến user: ${userName} (${userId})`);

    const notificationId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const notificationData = {
      id: notificationId,
      type: 'place_approved',
      priority: 'high',
      title: '✅ [TEST] Địa điểm đã được phê duyệt',
      body: 'Đây là test notification từ debug script',
      data: {
        placeId: 'test-place-123',
        placeName: 'Test Place',
        actionUrl: '/places/test-place-123'
      },
      createdAt: now,
      read: false,
      dismissed: false
    };

    // Ghi vào Realtime Database
    console.log('   Writing to path:', `notifications/${userId}/${notificationId}`);
    await rtdb.ref(`notifications/${userId}/${notificationId}`).set(notificationData);
    console.log('   ✅ Notification written to Realtime DB');

    // Update unread count
    const unreadCountRef = rtdb.ref(`unreadCounts/${userId}`);
    await unreadCountRef.transaction((currentCount) => (currentCount || 0) + 1);
    console.log('   ✅ Unread count updated');

    // Verify data
    const verifySnapshot = await rtdb.ref(`notifications/${userId}/${notificationId}`).get();
    console.log('   ✅ Verification successful:', verifySnapshot.exists());

    return { success: true, notificationId };
  } catch (error) {
    console.error('   ❌ Error sending notification:', error.message);
    console.error('   Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Step 6: Kiểm tra notifications đã có trong DB
async function checkExistingNotifications(userId) {
  try {
    const snapshot = await rtdb.ref(`notifications/${userId}`).get();
    const notifications = snapshot.val() || {};
    const notifList = Object.keys(notifications);

    console.log(`\n📬 Notifications hiện có cho user ${userId}:`);
    console.log(`   Tổng số: ${notifList.length}`);

    if (notifList.length > 0) {
      console.log('\n   Chi tiết 3 notification gần nhất:');
      notifList.slice(-3).forEach((key, index) => {
        const notif = notifications[key];
        console.log(`\n   [${index + 1}] ${notif.title}`);
        console.log(`       Type: ${notif.type}`);
        console.log(`       Read: ${notif.read}`);
        console.log(`       Created: ${notif.createdAt}`);
      });
    }

    return notifList.length;
  } catch (error) {
    console.error('   ❌ Error checking notifications:', error.message);
    return 0;
  }
}

// Step 7: Kiểm tra moderation queue
async function checkModerationQueue() {
  console.log('\n📋 STEP 7: Kiểm tra Moderation Queue');
  console.log('-------------------------------------------');

  try {
    const queueSnapshot = await db.collection('moderation_queue')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    console.log(`Total items in queue: ${queueSnapshot.size}`);

    if (queueSnapshot.size > 0) {
      console.log('\nRecent moderation items:');
      queueSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n[${index + 1}] ${doc.id}`);
        console.log(`    Type: ${data.itemType || data.contentType}`);
        console.log(`    Status: ${data.status}`);
        console.log(`    Submitted by: ${data.submittedBy}`);
        console.log(`    Created: ${data.createdAt}`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking moderation queue:', error.message);
  }
}

// Main execution
async function main() {
  try {
    // Test Realtime DB
    const rtdbOk = await testRealtimeDB();
    if (!rtdbOk) {
      console.error('\n❌ REALTIME DATABASE CONNECTION FAILED - DỪNG KIỂM TRA\n');
      process.exit(1);
    }

    // Find test users
    const { contributor, moderator } = await findTestUsers();

    if (!contributor) {
      console.error('\n⚠️ Không tìm thấy user nào để test!');
      console.log('Vui lòng tạo ít nhất 1 user trong hệ thống.\n');
      process.exit(1);
    }

    // Check existing notifications
    await checkExistingNotifications(contributor.id);

    // Send test notification
    const result = await sendTestNotification(contributor.id, contributor.fullName || contributor.email);

    if (result.success) {
      console.log('\n✅ TEST NOTIFICATION GỬI THÀNH CÔNG!');
      console.log(`\nBây giờ hãy:`);
      console.log(`1. Đăng nhập với user: ${contributor.email}`);
      console.log(`2. Kiểm tra icon chuông ở góc phải navigation`);
      console.log(`3. Phải thấy badge đỏ với số lượng thông báo`);
      console.log(`4. Click vào chuông để xem notification`);
    }

    // Check moderation queue
    await checkModerationQueue();

    console.log('\n🔍 ===== DEBUG HOÀN TẤT =====\n');

    // Summary
    console.log('📊 TÓM TẮT:');
    console.log('-------------------------------------------');
    console.log(`✅ Firebase Admin SDK: OK`);
    console.log(`✅ Realtime Database: OK`);
    console.log(`✅ Gửi notification: ${result.success ? 'OK' : 'FAILED'}`);
    console.log(`📬 Test user: ${contributor.email}`);
    console.log(`🆔 User ID: ${contributor.id}`);

    console.log('\n💡 NEXT STEPS:');
    console.log('-------------------------------------------');
    console.log('1. Đăng nhập vào app với user:', contributor.email);
    console.log('2. Mở browser console (F12)');
    console.log('3. Chạy command này để kiểm tra connection:');
    console.log(`\n   import { getDatabase, ref, get } from 'firebase/database';`);
    console.log(`   const db = getDatabase();`);
    console.log(`   get(ref(db, 'notifications/${contributor.id}')).then(s => console.log('Notifications:', s.val()));`);
    console.log('\n4. Nếu thấy data → Client không subscribe đúng');
    console.log('5. Nếu không thấy data → Server không ghi được vào Realtime DB');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
main();

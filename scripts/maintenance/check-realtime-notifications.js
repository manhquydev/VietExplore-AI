/**
 * Script kiểm tra notifications trong Firebase Realtime Database
 */

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

const rtdb = admin.database();

async function checkNotifications() {
  console.log('🔍 CHECKING FIREBASE REALTIME DATABASE NOTIFICATIONS\n');

  try {
    // User IDs to check
    const userIds = [
      'Qb3cq7V9ekZ8KA0Hn6yYBnD9dKe2', // manhquydev@gmail.com (contributor)
      '69XqrTdQuDML8YkyazqRzYPhyJd2'  // admin
    ];

    for (const userId of userIds) {
      console.log(`\n📬 Checking notifications for user: ${userId}`);
      console.log('='.repeat(70));

      // Get notifications
      const notifSnapshot = await rtdb.ref(`notifications/${userId}`).once('value');
      const notifications = notifSnapshot.val();

      if (!notifications) {
        console.log('❌ No notifications found');
        continue;
      }

      const notifArray = Object.entries(notifications).map(([id, data]) => ({
        id,
        ...data
      }));

      console.log(`✅ Found ${notifArray.length} notification(s)\n`);

      // Sort by timestamp
      notifArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // Display each notification
      notifArray.forEach((notif, index) => {
        const date = notif.createdAt ? new Date(notif.createdAt).toLocaleString('vi-VN') : 'N/A';
        const age = notif.timestamp ? Math.floor((Date.now() - notif.timestamp) / 1000 / 60) : '?';

        console.log(`[${index + 1}] ${notif.type}`);
        console.log(`    Title: ${notif.title}`);
        console.log(`    Message: ${notif.message || notif.body || 'N/A'}`);
        console.log(`    ActionURL: ${notif.actionUrl || 'N/A'}`);
        console.log(`    Priority: ${notif.priority}`);
        console.log(`    Read: ${notif.read ? 'Yes' : 'No'}`);
        console.log(`    Created: ${date} (${age} minutes ago)`);
        console.log('');
      });

      // Check unread count
      const unreadSnapshot = await rtdb.ref(`unreadCounts/${userId}`).once('value');
      const unreadCount = unreadSnapshot.val() || 0;
      console.log(`📊 Unread count: ${unreadCount}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Check completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkNotifications();

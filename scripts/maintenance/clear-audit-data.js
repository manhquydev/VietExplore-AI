// Script to clear old demo audit data from Firebase Realtime Database
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: 'https://vietexplore-ai-default-rtdb.firebaseio.com'
  });
}

const db = admin.database();

async function clearOldAuditData() {
  console.log('Clearing old audit data...');

  try {
    // Get all audit logs
    const auditRef = db.ref('audit_logs');
    const snapshot = await auditRef.once('value');
    const data = snapshot.val();

    if (!data) {
      console.log('No data found to clear');
      return;
    }

    // Clear all old data
    await auditRef.remove();
    console.log('All old audit data cleared successfully!');

    // Clear audit stats too
    const statsRef = db.ref('audit_stats');
    await statsRef.remove();
    console.log('Audit stats cleared successfully!');

  } catch (error) {
    console.error('Error clearing audit data:', error);
  }
}

// Run the cleanup
clearOldAuditData()
  .then(() => {
    console.log('Cleanup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
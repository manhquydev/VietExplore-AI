const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function checkModerationQueue() {
  console.log('🔍 Checking moderation queue statuses...\n');

  try {
    // Get all moderation queue items
    const snapshot = await db.collection('moderation_queue').get();
    
    if (snapshot.empty) {
      console.log('❌ No items found in moderation queue');
      return;
    }

    console.log(`📋 Total items in queue: ${snapshot.size}\n`);

    const statusCounts = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'unknown';
      
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      console.log(`📄 Item ID: ${doc.id}`);
      console.log(`   Status: ${status}`);
      console.log(`   Content ID: ${data.contentId}`);
      console.log(`   Content Type: ${data.contentType}`);
      console.log(`   Queue Type: ${data.queueType}`);
      console.log(`   Submitted By: ${data.submittedBy}`);
      console.log(`   Reviewed By: ${data.reviewedBy || 'None'}`);
      console.log(`   Submitted At: ${data.submittedAt}`);
      console.log(`   Reviewed At: ${data.reviewedAt || 'N/A'}`);
      console.log('   ---');
    });

    console.log('\n📊 Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} items`);
    });

    // Now check places status
    console.log('\n🏢 Checking places status...\n');
    
    const placesSnapshot = await db.collection('places').get();
    const placeStatusCounts = {};
    
    placesSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'unknown';
      
      placeStatusCounts[status] = (placeStatusCounts[status] || 0) + 1;
    });

    console.log('📊 Place Status Summary:');
    Object.entries(placeStatusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} places`);
    });

  } catch (error) {
    console.error('❌ Error checking moderation queue:', error);
  }
}

checkModerationQueue();
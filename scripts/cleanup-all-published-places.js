/**
 * Cleanup ALL moderation_queue entries for published places
 * Xóa TOÀN BỘ entries mà place đã published
 */
const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  let credential;
  if (process.env.FIREBASE_PROJECT_ID) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });
  } else {
    try {
      let serviceAccount;
      try {
        serviceAccount = require('../firebase-service-account.json');
      } catch {
        serviceAccount = require('./firebase-service-account.json');
      }
      credential = admin.credential.cert(serviceAccount);
    } catch (error) {
      console.error('Cannot find Firebase credentials');
      process.exit(1);
    }
  }
  admin.initializeApp({ credential });
}

const db = admin.firestore();

async function cleanupAllPublishedPlaces() {
  console.log('='.repeat(60));
  console.log('🔧 CLEANUP: All Queue Entries for Published Places');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Get ALL entries in queue
    const allEntries = await db.collection('moderation_queue').get();
    console.log(`📊 Scanning ${allEntries.size} entries in moderation_queue...`);
    console.log('');

    const toDelete = [];

    // Check each entry
    for (const doc of allEntries.docs) {
      const data = doc.data();
      const contentId = data.contentId || data.itemId;

      if (!contentId) {
        console.log(`⚠️  Entry ${doc.id} has no contentId - skipping`);
        continue;
      }

      // Check if place exists and is published
      try {
        const placeDoc = await db.collection('places').doc(contentId).get();

        if (!placeDoc.exists) {
          console.log(`❌ Place ${contentId} not found - entry ${doc.id} is ORPHANED`);
          toDelete.push({
            entryId: doc.id,
            contentId,
            reason: 'orphaned',
            queueStatus: data.status,
            placeStatus: 'not_found',
          });
        } else {
          const placeStatus = placeDoc.data().status;
          const placeName = placeDoc.data().name;

          if (placeStatus === 'published') {
            console.log(`✅ Place "${placeName}" is PUBLISHED - entry ${doc.id} should be deleted`);
            toDelete.push({
              entryId: doc.id,
              contentId,
              placeName,
              reason: 'published',
              queueStatus: data.status,
              placeStatus: 'published',
              publishedAt: placeDoc.data().publishedAt,
            });
          }
        }
      } catch (error) {
        console.error(`Error checking place ${contentId}:`, error.message);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log(`📋 Found ${toDelete.length} entries to cleanup:`);
    console.log('='.repeat(60));

    if (toDelete.length === 0) {
      console.log('✅ No entries need cleanup! Queue is healthy.');
      return;
    }

    // Show details
    console.table(toDelete);

    // Confirm
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirmed = await new Promise((resolve) => {
      readline.question(`\n❓ Delete ${toDelete.length} entries? (yes/no): `, (answer) => {
        readline.close();
        resolve(answer.toLowerCase() === 'yes');
      });
    });

    if (!confirmed) {
      console.log('\n❌ Cleanup cancelled');
      return;
    }

    // Delete entries
    console.log('\n🧹 Deleting entries...');
    let deleted = 0;
    let errors = 0;

    for (const item of toDelete) {
      try {
        await db.collection('moderation_queue').doc(item.entryId).delete();
        deleted++;
        console.log(`✅ Deleted ${item.entryId} (${deleted}/${toDelete.length})`);
      } catch (error) {
        errors++;
        console.error(`❌ Error deleting ${item.entryId}:`, error.message);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully deleted: ${deleted} entries`);
    console.log(`❌ Errors: ${errors} entries`);
    console.log('');

    // Verify
    const remainingSnapshot = await db.collection('moderation_queue').get();
    console.log(`📋 Remaining entries in queue: ${remainingSnapshot.size}`);

    if (deleted > 0) {
      console.log('');
      console.log('🎉 CLEANUP COMPLETED!');
      console.log('   All published places have been removed from queue.');
      console.log('   They will remain visible on the website.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    throw error;
  }
}

// Run cleanup
cleanupAllPublishedPlaces()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

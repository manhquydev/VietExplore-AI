/**
 * Migration Script: Fix Stuck Approved Places
 *
 * Vấn đề: Địa điểm đã approved nhưng vẫn còn trong moderation_queue
 * Giải pháp: Tự động cleanup các entries approved/rejected
 *
 * Usage: node scripts/fix-stuck-approved-places.js
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Try to use service account from environment or file
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Use service account from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Use individual environment variables
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });
  } else {
    // Try to use service account key file
    try {
      // Try different possible locations
      let serviceAccount;
      try {
        serviceAccount = require('./serviceAccountKey.json');
      } catch {
        try {
          serviceAccount = require('../firebase-service-account.json');
        } catch {
          serviceAccount = require('./firebase-service-account.json');
        }
      }
      credential = admin.credential.cert(serviceAccount);
    } catch (error) {
      console.error('❌ Error: Cannot find Firebase credentials');
      console.error('\nPlease use one of the following methods:');
      console.error('\n1. Set environment variables in .env.local:');
      console.error('   FIREBASE_PROJECT_ID=your-project-id');
      console.error('   FIREBASE_CLIENT_EMAIL=your-client-email');
      console.error('   FIREBASE_PRIVATE_KEY="your-private-key"');
      console.error('\n2. Create one of these files:');
      console.error('   - scripts/serviceAccountKey.json');
      console.error('   - firebase-service-account.json (root)');
      console.error('\nCurrent directory:', __dirname);
      process.exit(1);
    }
  }

  admin.initializeApp({ credential });
  console.log('✅ Firebase Admin initialized');
}

const db = admin.firestore();

async function fixStuckApprovedPlaces() {
  console.log('='.repeat(60));
  console.log('🔧 MIGRATION: Fix Stuck Approved Places');
  console.log('='.repeat(60));

  try {
    // Step 1: Tìm tất cả entries trong moderation_queue với status approved/rejected
    console.log('\n📊 Step 1: Scanning moderation_queue for finalized entries...');

    const finalizedStatuses = ['approved', 'rejected', 'deleted'];
    const moderationQueueRef = db.collection('moderation_queue');

    // Get all entries (không filter để đảm bảo catch tất cả)
    const allEntriesSnapshot = await moderationQueueRef.get();
    console.log(`Found ${allEntriesSnapshot.size} total entries in moderation_queue`);

    const finalizedEntries = [];
    const entryDetails = [];

    // Analyze each entry
    for (const doc of allEntriesSnapshot.docs) {
      const data = doc.data();
      const contentId = data.contentId || data.itemId;

      // Check nếu status là finalized
      if (finalizedStatuses.includes(data.status)) {
        finalizedEntries.push(doc.id);

        // Get place details để verify
        let placeStatus = 'unknown';
        try {
          const placeDoc = await db.collection('places').doc(contentId).get();
          if (placeDoc.exists) {
            placeStatus = placeDoc.data().status;
          }
        } catch (error) {
          console.error(`Error checking place ${contentId}:`, error.message);
        }

        entryDetails.push({
          queueId: doc.id,
          contentId: contentId,
          queueStatus: data.status,
          placeStatus: placeStatus,
          submittedAt: data.submittedAt,
          reviewedAt: data.reviewedAt,
        });
      }
    }

    console.log(`\n📋 Found ${finalizedEntries.length} finalized entries to cleanup:`);
    console.table(entryDetails.slice(0, 20)); // Show first 20

    if (finalizedEntries.length === 0) {
      console.log('\n✅ No stuck entries found! Queue is clean.');
      return;
    }

    // Step 2: Confirm before cleanup
    console.log(`\n⚠️  About to DELETE ${finalizedEntries.length} entries from moderation_queue`);
    console.log('These entries are already finalized (approved/rejected/deleted)');
    console.log('History will be preserved in moderation_logs collection');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirmed = await new Promise((resolve) => {
      readline.question('\n❓ Proceed with cleanup? (yes/no): ', (answer) => {
        readline.close();
        resolve(answer.toLowerCase() === 'yes');
      });
    });

    if (!confirmed) {
      console.log('\n❌ Cleanup cancelled by user');
      return;
    }

    // Step 3: Delete finalized entries
    console.log('\n🧹 Step 2: Cleaning up finalized entries...');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process in batches of 10 để avoid overload
    const batchSize = 10;
    for (let i = 0; i < finalizedEntries.length; i += batchSize) {
      const batch = finalizedEntries.slice(i, i + batchSize);

      await Promise.all(batch.map(async (entryId) => {
        try {
          await db.collection('moderation_queue').doc(entryId).delete();
          successCount++;
          console.log(`✅ Deleted: ${entryId} (${successCount}/${finalizedEntries.length})`);
        } catch (error) {
          errorCount++;
          errors.push({ entryId, error: error.message });
          console.error(`❌ Error deleting ${entryId}:`, error.message);
        }
      }));

      // Small delay between batches
      if (i + batchSize < finalizedEntries.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully deleted: ${successCount} entries`);
    console.log(`❌ Errors: ${errorCount} entries`);
    console.log(`📝 Total processed: ${finalizedEntries.length} entries`);

    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      console.table(errors);
    }

    // Step 5: Verify cleanup
    console.log('\n🔍 Step 3: Verifying cleanup...');
    const remainingSnapshot = await moderationQueueRef
      .where('status', 'in', finalizedStatuses)
      .get();

    console.log(`Remaining finalized entries: ${remainingSnapshot.size}`);

    if (remainingSnapshot.size === 0) {
      console.log('\n🎉 SUCCESS! All finalized entries have been cleaned up.');
      console.log('Moderation queue is now healthy.');
    } else {
      console.log(`\n⚠️  Warning: ${remainingSnapshot.size} finalized entries still remain`);
      console.log('You may need to run this script again or investigate manually.');
    }

    console.log('\n✅ Migration completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    throw error;
  }
}

// Run migration
fixStuckApprovedPlaces()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

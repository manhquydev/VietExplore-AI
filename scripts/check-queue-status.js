/**
 * Quick Check: Moderation Queue Status
 * Xem có bao nhiêu entries trong queue và status của chúng
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
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

async function checkQueueStatus() {
  console.log('🔍 Checking Moderation Queue Status...\n');

  try {
    // Get ALL entries in moderation_queue
    const queueSnapshot = await db.collection('moderation_queue').get();
    console.log(`📊 Total entries in moderation_queue: ${queueSnapshot.size}\n`);

    if (queueSnapshot.size === 0) {
      console.log('✅ Queue is empty - no entries found!');
      return;
    }

    // Group by status
    const statusGroups = {};
    const allEntries = [];

    for (const doc of queueSnapshot.docs) {
      const data = doc.data();
      const status = data.status || 'unknown';

      if (!statusGroups[status]) {
        statusGroups[status] = [];
      }

      const entry = {
        id: doc.id,
        contentId: data.contentId || data.itemId,
        status: status,
        itemType: data.itemType || data.contentType,
        submittedAt: data.submittedAt,
        reviewedAt: data.reviewedAt,
      };

      statusGroups[status].push(entry);
      allEntries.push(entry);
    }

    // Print summary by status
    console.log('📋 Entries by Status:');
    console.log('─'.repeat(60));
    for (const [status, entries] of Object.entries(statusGroups)) {
      console.log(`\n${status.toUpperCase()}: ${entries.length} entries`);

      if (entries.length <= 5) {
        // Show all if 5 or less
        console.table(entries);
      } else {
        // Show first 3
        console.log('  (Showing first 3 of', entries.length, 'entries)');
        console.table(entries.slice(0, 3));
      }
    }

    // Check for problematic entries
    console.log('\n⚠️  PROBLEMATIC ENTRIES:');
    console.log('─'.repeat(60));

    const problematic = allEntries.filter(e =>
      ['approved', 'rejected', 'deleted'].includes(e.status)
    );

    if (problematic.length > 0) {
      console.log(`❌ Found ${problematic.length} entries that should NOT be in queue:`);
      console.table(problematic);
      console.log('\n💡 These entries should be deleted via migration script!');
    } else {
      console.log('✅ No problematic entries found!');
      console.log('   All entries have valid statuses (pending, claimed, in_review, etc.)');
    }

    // Recommendations
    console.log('\n📝 RECOMMENDATIONS:');
    console.log('─'.repeat(60));
    if (problematic.length > 0) {
      console.log('⚠️  Run migration to cleanup:', problematic.length, 'finalized entries');
      console.log('   Command: node scripts/fix-stuck-approved-places.js');
    }

    if (statusGroups.claimed) {
      const claimedCount = statusGroups.claimed.length;
      console.log(`ℹ️  ${claimedCount} claimed entries - check for expired claims`);
    }

    if (statusGroups.in_review) {
      const reviewCount = statusGroups.in_review.length;
      console.log(`ℹ️  ${reviewCount} entries in review - waiting for moderator action`);
    }

    if (statusGroups.pending) {
      const pendingCount = statusGroups.pending.length;
      console.log(`ℹ️  ${pendingCount} pending entries - ready for review`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run check
checkQueueStatus()
  .then(() => {
    console.log('\n✅ Check completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });

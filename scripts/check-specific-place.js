/**
 * Check specific place status
 * Kiểm tra 1 địa điểm cụ thể xem đang ở trạng thái nào
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Get placeId from command line
const placeId = process.argv[2];

if (!placeId) {
  console.error('❌ Usage: node scripts/check-specific-place.js <placeId>');
  console.error('Example: node scripts/check-specific-place.js bCzDYUYpSXIkbURDpXlJ');
  process.exit(1);
}

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

async function checkSpecificPlace(placeId) {
  console.log('🔍 Checking Place:', placeId);
  console.log('='.repeat(60), '\n');

  try {
    // 1. Check place document
    const placeDoc = await db.collection('places').doc(placeId).get();

    if (!placeDoc.exists) {
      console.log('❌ Place NOT FOUND in places collection');
      console.log('   This place may have been deleted or never existed.\n');
    } else {
      const placeData = placeDoc.data();
      console.log('✅ Place exists in places collection:');
      console.log('   Name:', placeData.name);
      console.log('   Status:', placeData.status);
      console.log('   Created By:', placeData.createdBy);
      console.log('   Created At:', placeData.createdAt);
      console.log('   Published At:', placeData.publishedAt || 'Not published');
      console.log('   Updated At:', placeData.updatedAt);
      console.log('');
    }

    // 2. Check moderation_queue
    const queueQuery = await db.collection('moderation_queue')
      .where('contentId', '==', placeId)
      .get();

    if (queueQuery.empty) {
      console.log('✅ NO entries in moderation_queue for this place');
      console.log('   This is CORRECT if place is already published.\n');
    } else {
      console.log(`⚠️  Found ${queueQuery.size} entries in moderation_queue:`);
      queueQuery.forEach(doc => {
        const data = doc.data();
        console.log('\n   Queue Entry:', doc.id);
        console.log('   Status:', data.status);
        console.log('   Item Type:', data.itemType || data.contentType);
        console.log('   Submitted At:', data.submittedAt);
        console.log('   Reviewed At:', data.reviewedAt || 'Not reviewed');
        console.log('   Reviewed By:', data.reviewedBy || 'None');
        console.log('   Review Notes:', data.reviewNotes || 'None');
      });
      console.log('');
    }

    // 3. Check moderation_logs
    const logsQuery = await db.collection('moderation_logs')
      .where('contentId', '==', placeId)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    if (logsQuery.empty) {
      console.log('ℹ️  No moderation logs found for this place\n');
    } else {
      console.log(`📋 Last ${logsQuery.size} moderation actions:`);
      logsQuery.forEach(doc => {
        const data = doc.data();
        console.log('\n   Action:', data.action);
        console.log('   Moderator:', data.moderatorId);
        console.log('   Timestamp:', data.timestamp);
        console.log('   Notes:', data.reviewNotes || 'None');
      });
      console.log('');
    }

    // 4. Diagnosis
    console.log('─'.repeat(60));
    console.log('📊 DIAGNOSIS:');
    console.log('─'.repeat(60));

    if (!placeDoc.exists) {
      console.log('❌ PROBLEM: Place does not exist!');
      if (!queueQuery.empty) {
        console.log('   → Queue entries are ORPHANED - should be deleted');
      }
    } else {
      const placeData = placeDoc.data();
      const placeStatus = placeData.status;

      if (placeStatus === 'published') {
        if (queueQuery.empty) {
          console.log('✅ HEALTHY: Place is published, no queue entries');
        } else {
          console.log('❌ PROBLEM: Place is published but still has queue entries!');
          console.log('   → These entries should be DELETED');
          console.log('   → Run: node scripts/fix-stuck-approved-places.js');
        }
      } else if (['pending', 'submitted', 'in_review'].includes(placeStatus)) {
        if (queueQuery.empty) {
          console.log('⚠️  WARNING: Place is', placeStatus, 'but NO queue entry!');
          console.log('   → This place may be stuck');
        } else {
          console.log('✅ NORMAL: Place is', placeStatus, 'and has queue entry');
        }
      } else if (placeStatus === 'rejected') {
        if (queueQuery.empty) {
          console.log('✅ CORRECT: Place is rejected, no queue entries');
        } else {
          console.log('⚠️  WARNING: Place is rejected but still has queue entries');
          console.log('   → Queue entries should be deleted');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run check
checkSpecificPlace(placeId)
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });

/**
 * Audit Script: Tìm các địa điểm bị reset sai do race condition
 *
 * Bug: Địa điểm đã approved/published bị cron job reset về pending
 * Cause: claimExpiresAt không được xóa khi approve
 *
 * Script này tìm:
 * 1. Places có status='published' NHƯNG moderation_queue.status='pending'
 * 2. Moderation_queue items có autoReleasedAt (bị cron job reset)
 * 3. Places có moderationHistory chứa 'approved' nhưng queue status='pending'
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function auditModerationReset() {
  console.log('🔍 Starting moderation reset audit...\n');

  const results = {
    affectedPlaces: [],
    autoReleasedItems: [],
    inconsistentStates: [],
    stats: {
      totalChecked: 0,
      affectedCount: 0,
      needsReview: 0
    }
  };

  try {
    // 1. Tìm các moderation_queue items bị auto-release
    console.log('📋 Step 1: Checking auto-released items...');
    const autoReleasedQuery = await db.collection('moderation_queue')
      .where('autoReleasedAt', '!=', null)
      .orderBy('autoReleasedAt', 'desc')
      .limit(100)
      .get();

    console.log(`   Found ${autoReleasedQuery.size} auto-released items\n`);

    for (const doc of autoReleasedQuery.docs) {
      const data = doc.data();
      const contentId = data.contentId || data.itemId;

      // Check if place is actually published
      if (contentId) {
        const placeDoc = await db.collection('places').doc(contentId).get();
        if (placeDoc.exists) {
          const placeData = placeDoc.data();

          // INCONSISTENCY: Place is published but queue is pending
          if (placeData.status === 'published' && data.status === 'pending') {
            results.affectedPlaces.push({
              placeId: contentId,
              placeName: placeData.name,
              placeStatus: placeData.status,
              queueId: doc.id,
              queueStatus: data.status,
              autoReleasedAt: data.autoReleasedAt,
              publishedAt: placeData.publishedAt,
              moderatedBy: placeData.moderatedBy,
              issue: 'Place is published but queue reset to pending'
            });

            results.stats.affectedCount++;
          }

          // Check moderation history
          if (placeData.moderationHistory && Array.isArray(placeData.moderationHistory)) {
            const hasApproval = placeData.moderationHistory.some(h => h.action === 'approved');
            if (hasApproval && data.status === 'pending') {
              results.inconsistentStates.push({
                placeId: contentId,
                placeName: placeData.name,
                queueId: doc.id,
                issue: 'Has approval in history but queue is pending',
                history: placeData.moderationHistory
              });
            }
          }
        }
      }

      results.autoReleasedItems.push({
        queueId: doc.id,
        contentId: contentId,
        status: data.status,
        autoReleasedAt: data.autoReleasedAt,
        autoReleaseReason: data.autoReleaseReason,
        claimedBy: data.claimedBy
      });
    }

    // 2. Tìm places đã published nhưng có claimExpiresAt trong queue
    console.log('📋 Step 2: Checking published places with pending queue...');

    // Changed: Use simpler query without orderBy to avoid index requirement
    const publishedPlaces = await db.collection('places')
      .where('status', '==', 'published')
      .limit(100)
      .get();

    console.log(`   Checking ${publishedPlaces.size} published places...\n`);
    results.stats.totalChecked = publishedPlaces.size;

    for (const placeDoc of publishedPlaces.docs) {
      const placeData = placeDoc.data();

      // Find corresponding moderation_queue item
      const queueQuery = await db.collection('moderation_queue')
        .where('contentId', '==', placeDoc.id)
        .limit(1)
        .get();

      if (!queueQuery.empty) {
        const queueDoc = queueQuery.docs[0];
        const queueData = queueDoc.data();

        // INCONSISTENCY: Published place but queue is pending
        if (queueData.status === 'pending') {
          results.stats.needsReview++;

          results.affectedPlaces.push({
            placeId: placeDoc.id,
            placeName: placeData.name,
            placeStatus: placeData.status,
            queueId: queueDoc.id,
            queueStatus: queueData.status,
            publishedAt: placeData.publishedAt,
            claimExpiresAt: queueData.claimExpiresAt,
            autoReleasedAt: queueData.autoReleasedAt,
            issue: 'Published place has pending queue status'
          });
        }
      }
    }

    // Print results
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUDIT RESULTS');
    console.log('='.repeat(80));
    console.log(`Total places checked: ${results.stats.totalChecked}`);
    console.log(`Affected places found: ${results.stats.affectedCount}`);
    console.log(`Items needing re-review: ${results.stats.needsReview}`);
    console.log(`Auto-released items: ${results.autoReleasedItems.length}`);
    console.log(`Inconsistent states: ${results.inconsistentStates.length}`);
    console.log('='.repeat(80) + '\n');

    if (results.affectedPlaces.length > 0) {
      console.log('🚨 AFFECTED PLACES (need manual review):');
      console.log('-'.repeat(80));
      results.affectedPlaces.forEach((item, idx) => {
        console.log(`\n${idx + 1}. ${item.placeName} (${item.placeId})`);
        console.log(`   Place Status: ${item.placeStatus}`);
        console.log(`   Queue Status: ${item.queueStatus}`);
        console.log(`   Queue ID: ${item.queueId}`);
        console.log(`   Published At: ${item.publishedAt}`);
        console.log(`   Auto-Released At: ${item.autoReleasedAt || 'N/A'}`);
        console.log(`   Issue: ${item.issue}`);
      });
      console.log('\n' + '-'.repeat(80));
    }

    if (results.autoReleasedItems.length > 0) {
      console.log('\n📝 AUTO-RELEASED ITEMS (by cron job):');
      console.log('-'.repeat(80));
      results.autoReleasedItems.slice(0, 10).forEach((item, idx) => {
        console.log(`${idx + 1}. Queue ${item.queueId} - Content: ${item.contentId}`);
        console.log(`   Released At: ${item.autoReleasedAt}`);
        console.log(`   Reason: ${item.autoReleaseReason}`);
      });
      if (results.autoReleasedItems.length > 10) {
        console.log(`   ... and ${results.autoReleasedItems.length - 10} more`);
      }
      console.log('-'.repeat(80));
    }

    // Export to JSON
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `audit-results-${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n✅ Results exported to: ${filename}\n`);

    // Recommendations
    console.log('💡 RECOMMENDED ACTIONS:');
    console.log('-'.repeat(80));
    console.log('1. Review affected places in admin panel: /admin/moderation/queue');
    console.log('2. Re-approve legitimate published places');
    console.log('3. Deploy the race condition fix');
    console.log('4. Monitor cron job logs for "skipped" count increase');
    console.log('5. Run this audit again in 24 hours to verify fix');
    console.log('-'.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Audit failed:', error);
    throw error;
  }

  return results;
}

// Run audit
auditModerationReset()
  .then(() => {
    console.log('✅ Audit completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  });

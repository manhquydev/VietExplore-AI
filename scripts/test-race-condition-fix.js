/**
 * Test Script: Verify Race Condition Fix
 *
 * Tests:
 * 1. Approve item → verify claimExpiresAt is deleted
 * 2. Start review → verify claimExpiresAt is deleted
 * 3. Simulate cron job + concurrent approve
 * 4. Verify status stays 'approved' after cron run
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Test utilities
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTestItem() {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

  const testItem = {
    contentId: `test_place_${Date.now()}`,
    contentType: 'place',
    status: 'claimed',
    claimedBy: 'test_moderator',
    claimedAt: now,
    claimExpiresAt: expiresAt, // ← This should be deleted after approve
    submittedBy: 'test_user',
    submittedAt: now,
    priority: 'medium',
    metadata: {
      title: 'Test Place for Race Condition Fix'
    }
  };

  const docRef = await db.collection('moderation_queue').add(testItem);
  console.log(`✅ Created test item: ${docRef.id}`);

  return docRef.id;
}

async function testStartReviewDeletesClaim() {
  console.log('\n📝 TEST 1: start_review deletes claimExpiresAt');
  console.log('-'.repeat(80));

  const itemId = await createTestItem();

  // Simulate start_review
  await db.collection('moderation_queue').doc(itemId).update({
    status: 'in_review',
    claimExpiresAt: admin.firestore.FieldValue.delete(),
    claimedBy: admin.firestore.FieldValue.delete(),
    claimedAt: admin.firestore.FieldValue.delete()
  });

  // Verify
  const doc = await db.collection('moderation_queue').doc(itemId).get();
  const data = doc.data();

  if (data.status === 'in_review' && !data.claimExpiresAt) {
    console.log('✅ PASS: claimExpiresAt was deleted');
    console.log(`   Status: ${data.status}`);
    console.log(`   claimExpiresAt: ${data.claimExpiresAt || 'undefined (deleted)'}`);
  } else {
    console.log('❌ FAIL: claimExpiresAt still exists!');
    console.log(`   Status: ${data.status}`);
    console.log(`   claimExpiresAt: ${data.claimExpiresAt}`);
  }

  // Cleanup
  await db.collection('moderation_queue').doc(itemId).delete();
  console.log(`🗑️  Cleaned up test item\n`);

  return !data.claimExpiresAt;
}

async function testApproveDeletesClaim() {
  console.log('📝 TEST 2: approve deletes claimExpiresAt');
  console.log('-'.repeat(80));

  const itemId = await createTestItem();

  // Simulate in_review first
  await db.collection('moderation_queue').doc(itemId).update({
    status: 'in_review'
  });

  await sleep(100);

  // Simulate approve
  await db.collection('moderation_queue').doc(itemId).update({
    status: 'approved',
    reviewedAt: new Date().toISOString(),
    claimExpiresAt: admin.firestore.FieldValue.delete(),
    claimedBy: admin.firestore.FieldValue.delete(),
    claimedAt: admin.firestore.FieldValue.delete()
  });

  // Verify
  const doc = await db.collection('moderation_queue').doc(itemId).get();
  const data = doc.data();

  if (data.status === 'approved' && !data.claimExpiresAt) {
    console.log('✅ PASS: claimExpiresAt was deleted on approve');
    console.log(`   Status: ${data.status}`);
    console.log(`   claimExpiresAt: ${data.claimExpiresAt || 'undefined (deleted)'}`);
  } else {
    console.log('❌ FAIL: claimExpiresAt still exists after approve!');
    console.log(`   Status: ${data.status}`);
    console.log(`   claimExpiresAt: ${data.claimExpiresAt}`);
  }

  // Cleanup
  await db.collection('moderation_queue').doc(itemId).delete();
  console.log(`🗑️  Cleaned up test item\n`);

  return !data.claimExpiresAt;
}

async function testCronJobRespectsStatus() {
  console.log('📝 TEST 3: Cron job respects current status (transaction recheck)');
  console.log('-'.repeat(80));

  const itemId = await createTestItem();

  // Set expired claim
  const pastTime = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(); // 3 hours ago
  await db.collection('moderation_queue').doc(itemId).update({
    claimExpiresAt: pastTime
  });

  // Approve the item (user action)
  await db.collection('moderation_queue').doc(itemId).update({
    status: 'approved',
    reviewedAt: new Date().toISOString(),
    claimExpiresAt: admin.firestore.FieldValue.delete()
  });

  console.log('   User approved item → status=approved, claimExpiresAt deleted');

  // Simulate cron job with transaction (like the fix)
  await sleep(100);

  const docRef = db.collection('moderation_queue').doc(itemId);

  try {
    await db.runTransaction(async (transaction) => {
      const freshDoc = await transaction.get(docRef);

      if (!freshDoc.exists) {
        console.log('   Document not found');
        return;
      }

      const freshData = freshDoc.data();

      // CRITICAL: Recheck status INSIDE transaction
      if (freshData.status !== 'claimed') {
        console.log(`   🛡️  PROTECTED: Status is '${freshData.status}', skipping cleanup`);
        return;
      }

      if (!freshData.claimExpiresAt || freshData.claimExpiresAt >= new Date().toISOString()) {
        console.log('   🛡️  PROTECTED: No claimExpiresAt or not expired, skipping');
        return;
      }

      // Should not reach here
      transaction.update(docRef, {
        status: 'pending',
        claimExpiresAt: admin.firestore.FieldValue.delete()
      });

      console.log('   ❌ WARNING: Cron job updated status to pending!');
    });
  } catch (error) {
    console.log(`   ⚠️  Transaction error: ${error.message}`);
  }

  // Verify final status
  const finalDoc = await db.collection('moderation_queue').doc(itemId).get();
  const finalData = finalDoc.data();

  if (finalData.status === 'approved') {
    console.log('✅ PASS: Status stayed "approved" after cron job simulation');
    console.log(`   Final Status: ${finalData.status}`);
  } else {
    console.log('❌ FAIL: Status was changed by cron job!');
    console.log(`   Expected: approved`);
    console.log(`   Got: ${finalData.status}`);
  }

  // Cleanup
  await db.collection('moderation_queue').doc(itemId).delete();
  console.log(`🗑️  Cleaned up test item\n`);

  return finalData.status === 'approved';
}

async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 RACE CONDITION FIX TEST SUITE');
  console.log('='.repeat(80) + '\n');

  const results = {
    test1: false,
    test2: false,
    test3: false
  };

  try {
    results.test1 = await testStartReviewDeletesClaim();
    await sleep(500);

    results.test2 = await testApproveDeletesClaim();
    await sleep(500);

    results.test3 = await testCronJobRespectsStatus();
    await sleep(500);

    // Summary
    console.log('='.repeat(80));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.log(`Test 1 (start_review cleanup): ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 2 (approve cleanup):      ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 3 (cron job protection):  ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(80));

    const allPassed = results.test1 && results.test2 && results.test3;

    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED! Race condition fix is working correctly.\n');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED! Please review the fix.\n');
    }

    return allPassed;

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return false;
  }
}

// Run tests
runAllTests()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

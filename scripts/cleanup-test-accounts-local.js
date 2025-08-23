#!/usr/bin/env node
/**
 * Script cleanup test accounts trên LOCAL EMULATOR
 * Sử dụng: node scripts/cleanup-test-accounts-local.js
 * Yêu cầu: Firebase Emulator đang chạy
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK for EMULATOR
admin.initializeApp({
  projectId: 'vietexplore-ai'
});

// Configure for emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8888';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9888';

const auth = admin.auth();
const firestore = admin.firestore();

// Import test accounts từ setup script
const { TEST_ACCOUNTS } = require('./setup-test-accounts-local');

async function cleanupTestAccounts() {
  console.log('🧹 Bắt đầu cleanup test accounts trên LOCAL EMULATOR...\n');

  const results = {
    auth: { success: 0, errors: 0 },
    firestore: { success: 0, errors: 0 },
    testData: { success: 0, errors: 0 }
  };

  // Cleanup Auth users
  for (const account of TEST_ACCOUNTS) {
    try {
      const userRecord = await auth.getUserByEmail(account.email);
      await auth.deleteUser(userRecord.uid);
      console.log(`✅ Deleted Auth user: ${account.email}`);
      results.auth.success++;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`⚠️  Auth user not found: ${account.email}`);
      } else {
        console.error(`❌ Error deleting Auth user ${account.email}:`, error.message);
        results.auth.errors++;
      }
    }
  }

  // Cleanup Firestore user profiles (by testAccount flag)
  try {
    const testUsersSnapshot = await firestore
      .collection('users')
      .where('testAccount', '==', true)
      .get();

    const batch = firestore.batch();
    testUsersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (!testUsersSnapshot.empty) {
      await batch.commit();
      console.log(`✅ Deleted ${testUsersSnapshot.size} test user profiles`);
      results.firestore.success += testUsersSnapshot.size;
    }
  } catch (error) {
    console.error('❌ Error cleaning up user profiles:', error.message);
    results.firestore.errors++;
  }

  // Cleanup test data (by isEmulatorData flag)
  const collections = ['placeDrafts', 'itineraries', 'moderationQueue'];
  
  for (const collectionName of collections) {
    try {
      const testDataSnapshot = await firestore
        .collection(collectionName)
        .where('isEmulatorData', '==', true)
        .get();

      if (!testDataSnapshot.empty) {
        const batch = firestore.batch();
        testDataSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`✅ Deleted ${testDataSnapshot.size} test documents from ${collectionName}`);
        results.testData.success += testDataSnapshot.size;
      }
    } catch (error) {
      console.error(`❌ Error cleaning up ${collectionName}:`, error.message);
      results.testData.errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 KẾT QUẢ CLEANUP (LOCAL EMULATOR)');
  console.log('='.repeat(50));
  console.log(`Auth Users: ${results.auth.success} deleted, ${results.auth.errors} errors`);
  console.log(`User Profiles: ${results.firestore.success} deleted, ${results.firestore.errors} errors`);
  console.log(`Test Data: ${results.testData.success} deleted, ${results.testData.errors} errors`);
  console.log('\n✅ Cleanup hoàn tất!');

  await admin.app().delete();
}

// Run cleanup
if (require.main === module) {
  cleanupTestAccounts().catch(console.error);
}

#!/usr/bin/env node
/**
 * Script cleanup test accounts
 * Sử dụng: node scripts/cleanup-test-accounts.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK  
const serviceAccountPath = path.join(__dirname, '..', 'vietexplore-ai-firebase-adminsdk-fbsvc-3554e3a673.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Không tìm thấy service account file:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'vietexplore-ai'
});

const auth = admin.auth();
const firestore = admin.firestore();

async function cleanupTestAccounts() {
  console.log('🧹 Bắt đầu cleanup test accounts...\n');

  try {
    // Find all test accounts in Firestore
    const testUsersSnapshot = await firestore
      .collection('users')
      .where('testAccount', '==', true)
      .get();

    if (testUsersSnapshot.empty) {
      console.log('ℹ️  Không tìm thấy test accounts nào để cleanup');
      return;
    }

    console.log(`🔍 Tìm thấy ${testUsersSnapshot.size} test accounts`);

    for (const doc of testUsersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;

      try {
        console.log(`🗑️  Xóa ${userData.email} (${uid})`);

        // Delete from Firebase Auth
        try {
          await auth.deleteUser(uid);
          console.log(`  ✅ Đã xóa khỏi Auth`);
        } catch (authError) {
          console.log(`  ⚠️  Không thể xóa khỏi Auth: ${authError.message}`);
        }

        // Delete from Firestore users collection
        await firestore.collection('users').doc(uid).delete();
        console.log(`  ✅ Đã xóa khỏi Firestore users`);

        // Delete related data
        const batch = firestore.batch();

        // Delete place drafts
        const draftsSnapshot = await firestore
          .collection('placeDrafts')
          .where('submitter', '==', uid)
          .get();
        
        draftsSnapshot.docs.forEach(draftDoc => {
          batch.delete(draftDoc.ref);
        });

        // Delete moderation queue items
        const moderationSnapshot = await firestore
          .collection('moderationQueue')
          .where('assignedModerator', '==', uid)
          .get();

        moderationSnapshot.docs.forEach(modDoc => {
          batch.delete(modDoc.ref);
        });

        await batch.commit();
        console.log(`  ✅ Đã xóa dữ liệu liên quan\n`);

      } catch (error) {
        console.error(`  ❌ Lỗi xóa ${userData.email}:`, error.message);
      }
    }

    console.log('✅ Cleanup hoàn thành!');

  } catch (error) {
    console.error('❌ Lỗi cleanup:', error);
  } finally {
    await admin.app().delete();
  }
}

if (require.main === module) {
  cleanupTestAccounts().catch(console.error);
}

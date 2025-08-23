const admin = require('firebase-admin');
const serviceAccount = require('../vietexplore-ai-firebase-adminsdk-fbsvc-3554e3a673.json');

async function fixFirestoreRole() {
  try {
    console.log('🔧 Fixing Firestore role for current user...');
    
    // Initialize Firebase Admin for emulator
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'vietexplore-ai'
      });
    }

    // Configure for emulator
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

    const db = admin.firestore();
    const targetUID = 'k66yJCq1o3P8eZRup0NQOGRfkeBN';
    
    console.log(`👤 Updating Firestore role for: ${targetUID}`);

    // Update Firestore document
    const userRef = db.collection('users').doc(targetUID);
    await userRef.update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastModified: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Firestore role updated successfully!');

    // Verify the update
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('\n📊 Updated Firestore Profile:');
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Status: ${userData.status}`);
    }

    console.log('\n🎉 Firestore role fix completed!');
    console.log('💡 Please refresh your browser to see the changes');
    
  } catch (error) {
    console.error('❌ Error fixing Firestore role:', error);
  }
}

fixFirestoreRole();

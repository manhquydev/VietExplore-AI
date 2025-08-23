const admin = require('firebase-admin');
const serviceAccount = require('../vietexplore-ai-firebase-adminsdk-fbsvc-3554e3a673.json');

async function debugFirestoreDirectly() {
  try {
    console.log('🔍 Debugging Firestore directly...');
    
    // Initialize Firebase Admin for emulator
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'vietexplore-ai'
      });
    }

    // Configure for emulator
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';

    const db = admin.firestore();
    const targetUID = 'k66yJCq1o3P8eZRup0NQOGRfkeBN';
    
    console.log(`👤 Checking user document: ${targetUID}`);

    // Check the exact document
    const userRef = db.collection('users').doc(targetUID);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('\n📄 Full Firestore Document:');
      console.log(JSON.stringify(userData, null, 2));
    } else {
      console.log('❌ Document does not exist!');
    }

    // Check all documents in users collection
    console.log('\n👥 All users in collection:');
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   ${doc.id}: ${data.email} - Role: ${data.role}`);
    });

    // Force update with merge
    console.log(`\n🔧 Force updating with merge...`);
    await userRef.set({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Verify again
    const updatedDoc = await userRef.get();
    if (updatedDoc.exists) {
      const updatedData = updatedDoc.data();
      console.log('\n✅ After force update:');
      console.log(`   Role: ${updatedData.role}`);
      console.log(`   Updated at: ${updatedData.updatedAt}`);
    }

  } catch (error) {
    console.error('❌ Error debugging Firestore:', error);
  }
}

debugFirestoreDirectly();

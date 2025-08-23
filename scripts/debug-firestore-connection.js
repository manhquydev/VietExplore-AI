const admin = require('firebase-admin');
const serviceAccount = require('../vietexplore-ai-firebase-adminsdk-fbsvc-3554e3a673.json');

async function debugFirestoreConnection() {
  try {
    console.log('🔍 Testing Firestore connection from script...');
    
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
    
    console.log(`\n👤 Testing read from client perspective...`);
    
    // Test as client would read
    const userRef = db.collection('users').doc(targetUID);
    console.log(`Reading: users/${targetUID}`);
    
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('\n✅ Document exists and readable:');
      console.log(`   Role: ${userData.role}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Status: ${userData.status}`);
    } else {
      console.log('❌ Document not found from client perspective!');
    }

    // Test frontend-like read
    console.log('\n🌐 Testing with web SDK patterns...');
    
    // Try to read as the web SDK would
    const docSnapshot = await db.doc(`users/${targetUID}`).get();
    console.log(`Web-style read result: exists=${docSnapshot.exists}`);
    
    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      console.log(`Web-style role: ${data.role}`);
    }

  } catch (error) {
    console.error('❌ Error testing Firestore connection:', error);
  }
}

debugFirestoreConnection();

// scripts/debug-all-users.js - Debug tất cả users trong emulator
const admin = require('firebase-admin');

// Set emulator hosts BEFORE initializing admin
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

// Initialize Firebase Admin for LOCAL EMULATOR
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'vietexplore-ai'
  });
}

const db = admin.firestore();

async function debugAllUsers() {
  try {
    console.log('🔍 Debugging all users in emulator...');
    
    // List all users in Firebase Auth
    console.log('\n👥 Firebase Auth Users:');
    const listUsersResult = await admin.auth().listUsers();
    
    listUsersResult.users.forEach((userRecord, index) => {
      console.log(`\n${index + 1}. User Record:`);
      console.log(`   UID: ${userRecord.uid}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Display Name: ${userRecord.displayName}`);
      console.log(`   Email Verified: ${userRecord.emailVerified}`);
      console.log(`   Created: ${userRecord.metadata.creationTime}`);
      console.log(`   Last Sign In: ${userRecord.metadata.lastSignInTime}`);
      console.log(`   Custom Claims:`, userRecord.customClaims || 'None');
    });
    
    // List all users in Firestore
    console.log('\n📄 Firestore Users Collection:');
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('   ❌ No users found in Firestore!');
    } else {
      usersSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Firestore Document:`);
        console.log(`   Doc ID: ${doc.id}`);
        console.log(`   Email: ${data.email}`);
        console.log(`   Display Name: ${data.displayName}`);
        console.log(`   Role: ${data.role}`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Setup Type: ${data.setupType}`);
        console.log(`   Created At: ${data.createdAt}`);
      });
    }
    
    // Find specific user
    const targetEmail = 'manhquydev@gmail.com';
    console.log(`\n🎯 Looking for ${targetEmail}:`);
    
    try {
      const userRecord = await admin.auth().getUserByEmail(targetEmail);
      console.log(`✅ Found in Auth: ${userRecord.uid}`);
      
      const userDoc = await db.doc(`users/${userRecord.uid}`).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log(`✅ Found in Firestore: role = ${userData.role}`);
        
        console.log('\n🔍 Full Firestore Profile:');
        console.log(JSON.stringify(userData, null, 2));
      } else {
        console.log(`❌ NOT found in Firestore for UID: ${userRecord.uid}`);
        
        // Check if there's a doc with email as ID
        const emailDoc = await db.doc(`users/${targetEmail}`).get();
        if (emailDoc.exists) {
          console.log('⚠️ Found doc with email as ID instead of UID!');
        }
      }
    } catch (error) {
      console.log(`❌ User ${targetEmail} not found in Auth:`, error.message);
    }
    
    console.log('\n💡 Debugging Summary:');
    console.log('1. Check if correct UID exists in both Auth and Firestore');
    console.log('2. Verify role in Firestore document matches custom claims');
    console.log('3. Ensure no temporary profile is being created');
    
  } catch (error) {
    console.error('❌ Error debugging users:', error);
    process.exit(1);
  }
}

// Run debug
debugAllUsers().then(() => {
  console.log('\n✨ Debug completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

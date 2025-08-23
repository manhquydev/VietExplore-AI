// scripts/debug-token-claims.js - Debug và force refresh token claims
const admin = require('firebase-admin');

// Set emulator hosts BEFORE initializing admin
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = '127.0.0.1:9000';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

// Initialize Firebase Admin for LOCAL EMULATOR
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'vietexplore-ai'
  });
}

const db = admin.firestore();

async function debugTokenClaims() {
  try {
    console.log('🔍 Debugging Token Claims...');
    
    const adminEmail = 'manhquydev@gmail.com';
    
    // Get user record
    const userRecord = await admin.auth().getUserByEmail(adminEmail);
    console.log(`\n👤 User Record (UID: ${userRecord.uid}):`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Email Verified: ${userRecord.emailVerified}`);
    console.log(`   Created: ${userRecord.metadata.creationTime}`);
    console.log(`   Last Sign In: ${userRecord.metadata.lastSignInTime}`);
    
    // Check custom claims
    console.log('\n🔐 Current Custom Claims:');
    if (userRecord.customClaims) {
      console.log(JSON.stringify(userRecord.customClaims, null, 2));
    } else {
      console.log('   ❌ No custom claims found!');
    }
    
    // Check Firestore document
    const userDoc = await db.doc(`users/${userRecord.uid}`).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('\n📄 Firestore User Document:');
      console.log(`   Role: ${userData.role}`);
      console.log(`   Status: ${userData.status}`);
      console.log(`   Verified Contributor: ${userData.verifiedContributor}`);
      console.log(`   Setup Type: ${userData.setupType}`);
    } else {
      console.log('\n❌ User document not found in Firestore!');
    }
    
    // Force set custom claims again
    console.log('\n🔄 Force setting custom claims...');
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      verifiedContributor: true,
      partnerId: null,
      permissions: ['*'],
      environment: 'local',
      lastUpdated: new Date().toISOString()
    });
    
    // Verify claims were set
    const updatedRecord = await admin.auth().getUser(userRecord.uid);
    console.log('\n✅ Updated Custom Claims:');
    console.log(JSON.stringify(updatedRecord.customClaims, null, 2));
    
    console.log('\n🚨 IMPORTANT NEXT STEPS:');
    console.log('1. 🚪 LOGOUT from app completely');
    console.log('2. 🧹 CLEAR browser data:');
    console.log('   - Press F12 → Application → Storage → Clear storage');
    console.log('   - Or Ctrl+Shift+Delete → Clear all data');
    console.log('3. 🔄 RESTART browser completely');
    console.log('4. 🔑 LOGIN again with:');
    console.log(`   - Email: ${adminEmail}`);
    console.log('   - Password: admin123456');
    console.log('5. ✅ Check role display');
    
    console.log('\n💡 Alternative - Force token refresh in browser console:');
    console.log('   firebase.auth().currentUser?.getIdToken(true)');
    console.log('   .then(() => window.location.reload())');
    
    console.log('\n🎯 Expected result: Role should show "Quản trị viên"');
    
  } catch (error) {
    console.error('❌ Error debugging token claims:', error);
    
    if (error.code === 'unavailable') {
      console.error('\n💡 Make sure emulators are running:');
      console.error('   npm run dev:emulator');
    }
    
    process.exit(1);
  }
}

// Run debug
debugTokenClaims().then(() => {
  console.log('\n✨ Debug completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

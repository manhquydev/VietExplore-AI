// scripts/force-update-firestore-role.js - Force update Firestore role
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

async function forceUpdateFirestoreRole() {
  try {
    console.log('🔧 Force updating Firestore role...');
    
    const adminEmail = 'manhquydev@gmail.com';
    
    // Get user record
    const userRecord = await admin.auth().getUserByEmail(adminEmail);
    const adminUid = userRecord.uid;
    
    console.log(`👤 User: ${adminEmail} (${adminUid})`);
    
    // Get current Firestore document
    const userDoc = await db.doc(`users/${adminUid}`).get();
    
    if (userDoc.exists) {
      const currentData = userDoc.data();
      console.log('\n📄 Current Firestore data:');
      console.log(`   Role: ${currentData.role}`);
      console.log(`   Status: ${currentData.status}`);
      console.log(`   Display Name: ${currentData.displayName}`);
      console.log(`   Setup Type: ${currentData.setupType}`);
    }
    
    // FORCE UPDATE with merge: false to completely overwrite
    console.log('\n🔄 Force updating Firestore document...');
    
    await db.doc(`users/${adminUid}`).set({
      email: adminEmail,
      displayName: 'Manh Quy (Local Admin)',
      photoURL: userRecord.photoURL || '',
      role: 'admin',  // 🎯 KEY FIELD
      status: 'active',
      verifiedContributor: true,
      permissions: ['*'],
      createdAt: new Date(),
      updatedAt: new Date(),
      roleAssignedAt: new Date(),
      roleAssignedBy: 'force_update_script',
      setupType: 'force_firestore_update',
      environment: 'local',
      lastLogin: new Date(),
      emailVerified: true
    }, { merge: false }); // merge: false = complete overwrite
    
    console.log('✅ Firestore document force updated');
    
    // Verify the update
    const updatedDoc = await db.doc(`users/${adminUid}`).get();
    const updatedData = updatedDoc.data();
    
    console.log('\n📄 Updated Firestore data:');
    console.log(`   Role: ${updatedData.role}`);
    console.log(`   Status: ${updatedData.status}`);
    console.log(`   Display Name: ${updatedData.displayName}`);
    console.log(`   Verified Contributor: ${updatedData.verifiedContributor}`);
    console.log(`   Last Updated: ${updatedData.updatedAt}`);
    
    // Also verify custom claims
    const authRecord = await admin.auth().getUser(adminUid);
    console.log('\n🔐 Custom Claims (for reference):');
    console.log(JSON.stringify(authRecord.customClaims, null, 2));
    
    console.log('\n🎉 Force update completed!');
    console.log('\n🚨 IMPORTANT NEXT STEPS:');
    console.log('1. 🚪 LOGOUT from app completely');
    console.log('2. 🔄 RESTART emulators to clear any cache:');
    console.log('   - Stop: Ctrl+C');
    console.log('   - Start: npm run dev:emulator');
    console.log('3. 🔑 LOGIN again and check role');
    console.log('\n🎯 Expected: Role should show "Quản trị viên"');
    
  } catch (error) {
    console.error('❌ Error force updating Firestore:', error);
    process.exit(1);
  }
}

// Run force update
forceUpdateFirestoreRole().then(() => {
  console.log('\n✨ Force update completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

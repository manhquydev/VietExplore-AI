// scripts/fix-current-user-admin.js - Fix admin role for current logged in user
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

async function fixCurrentUserAdmin() {
  try {
    console.log('🔧 Fixing admin role for current user...');
    
    const targetUID = 'qfaMw1egpoWzdK501hXZ6Ke0XJ00'; // Current user UID from debugger
    const adminEmail = 'manhquydev@gmail.com';
    
    console.log(`👤 Fixing user: ${adminEmail} (${targetUID})`);
    
    // Verify user exists in Auth
    const userRecord = await admin.auth().getUser(targetUID);
    console.log(`✅ Found in Auth: ${userRecord.email}`);
    
    // Update Firestore document for the correct UID
    console.log('\n🔄 Updating Firestore document...');
    
    await db.doc(`users/${targetUID}`).set({
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
      roleAssignedBy: 'current_user_fix_script',
      setupType: 'current_user_admin_fix',
      environment: 'local',
      lastLogin: new Date(),
      emailVerified: true
    }, { merge: false }); // Complete overwrite
    
    console.log('✅ Firestore document updated');
    
    // Set custom claims for the correct UID
    console.log('\n🔄 Setting custom claims...');
    
    await admin.auth().setCustomUserClaims(targetUID, {
      role: 'admin',
      verifiedContributor: true,
      partnerId: null,
      permissions: ['*'],
      environment: 'local',
      lastUpdated: new Date().toISOString()
    });
    
    console.log('✅ Custom claims set');
    
    // Verify the updates
    const updatedDoc = await db.doc(`users/${targetUID}`).get();
    const updatedData = updatedDoc.data();
    const updatedAuth = await admin.auth().getUser(targetUID);
    
    console.log('\n📊 Fix Results:');
    console.log(`   UID: ${targetUID}`);
    console.log(`   Email: ${updatedData.email}`);
    console.log(`   Firestore Role: ${updatedData.role}`);
    console.log(`   Custom Claims Role: ${updatedAuth.customClaims?.role}`);
    console.log(`   Verified Contributor: ${updatedAuth.customClaims?.verifiedContributor}`);
    
    console.log('\n🎉 Current user admin fix completed!');
    console.log('\n🚨 NEXT STEPS:');
    console.log('1. 🔄 Click "Force Refresh Token" in AuthDebugger');
    console.log('2. ✅ Role should change to "admin" in debugger');
    console.log('3. 🎯 UI should show "Quản trị viên" instead of "Du khách"');
    console.log('4. 🚪 If still not working, logout and login again');
    
  } catch (error) {
    console.error('❌ Error fixing current user admin:', error);
    process.exit(1);
  }
}

// Run fix
fixCurrentUserAdmin().then(() => {
  console.log('\n✨ Fix completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

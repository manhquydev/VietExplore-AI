// scripts/fix-admin-password.js - Fix admin password in emulator
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

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password in LOCAL EMULATOR...');
    
    const adminEmail = 'manhquydev@gmail.com';
    const newPassword = 'admin123456'; // Clear password for local testing
    
    console.log(`👤 Looking for user: ${adminEmail}`);
    
    let userRecord;
    try {
      // Try to get existing user
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log(`✅ Found existing user: ${userRecord.uid}`);
      
      // Update password
      await admin.auth().updateUser(userRecord.uid, {
        password: newPassword
      });
      console.log(`✅ Password updated for user: ${userRecord.uid}`);
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('👤 User not found, creating new admin user...');
        
        // Create new user
        userRecord = await admin.auth().createUser({
          email: adminEmail,
          password: newPassword,
          displayName: 'Manh Quy (Local Admin)',
          emailVerified: true
        });
        console.log(`✅ Created new user: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }
    
    const adminUid = userRecord.uid;
    
    // Update Firestore document
    await db.doc(`users/${adminUid}`).set({
      email: adminEmail,
      displayName: 'Manh Quy (Local Admin)',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      roleAssignedAt: new Date(),
      roleAssignedBy: 'password_fix_script',
      setupType: 'password_fix',
      verifiedContributor: true,
      permissions: ['*'],
      environment: 'local'
    }, { merge: true });
    
    console.log('✅ User document updated in Firestore');
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(adminUid, {
      role: 'admin',
      verifiedContributor: true,
      partnerId: null,
      permissions: ['*'],
      environment: 'local'
    });
    
    console.log('✅ Custom claims set');
    
    // Verify setup
    const userDoc = await db.doc(`users/${adminUid}`).get();
    const userData = userDoc.data();
    
    console.log('\n📊 Admin Password Fix Complete:');
    console.log(`   UID: ${adminUid}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Status: ${userData.status}`);
    console.log(`   New Password: ${newPassword}`);
    
    console.log('\n🎉 Password fix completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n🔗 Login URL: http://localhost:9002/auth/login');
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
    
    if (error.code === 'unavailable') {
      console.error('\n💡 Make sure emulators are running:');
      console.error('   npm run dev:emulator');
    }
    
    process.exit(1);
  }
}

// Run password fix
fixAdminPassword().then(() => {
  console.log('\n✨ Password fix completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

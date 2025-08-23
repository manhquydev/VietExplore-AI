// scripts/manual-admin-setup.js - Manual Admin Setup for Emulator
const admin = require('firebase-admin');

// Initialize for emulator
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'vietexplore-ai'
  });
}

// Set emulator hosts before calling any admin methods
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

const db = admin.firestore();

async function manualSetupAdmin() {
  try {
    console.log('🔧 Manual Admin Setup for Emulator...');
    
    const adminUid = 'Y0DcYyfPtjcO7FCg26GF1FwwEi8P';
    const adminEmail = 'manhquydev@gmail.com';
    
    console.log(`👤 Setting up admin: ${adminEmail} (${adminUid})`);
    
    // 1. Update user document in Firestore
    await db.doc(`users/${adminUid}`).set({
      email: adminEmail,
      displayName: 'Manh Quy (Local Admin)',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      roleAssignedAt: new Date(),
      roleAssignedBy: 'manual_setup',
      setupType: 'manual_admin',
      verifiedContributor: true,
      permissions: ['*'],
      environment: 'local'
    }, { merge: true });
    
    console.log('✅ User document updated in Firestore');
    
    // 2. Set custom claims in Firebase Auth
    await admin.auth().setCustomUserClaims(adminUid, {
      role: 'admin',
      verifiedContributor: true,
      partnerId: null,
      permissions: ['*'],
      environment: 'local'
    });
    
    console.log('✅ Custom claims set in Firebase Auth');
    
    // 3. Create audit log
    await db.collection('audits').add({
      actor: {
        uid: adminUid,
        role: 'admin',
        email: adminEmail
      },
      action: 'manual_admin_setup',
      target: {
        collection: 'users',
        id: adminUid
      },
      metadata: {
        setupType: 'manual_script',
        setupTime: new Date(),
        adminEmail,
        adminUid,
        environment: 'local'
      },
      createdAt: new Date()
    });
    
    console.log('✅ Audit log created');
    
    // 4. Verify setup
    const userDoc = await db.doc(`users/${adminUid}`).get();
    const userData = userDoc.data();
    
    console.log('\n📊 Manual Admin Setup Complete:');
    console.log(`   UID: ${adminUid}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Status: ${userData.status}`);
    console.log(`   Environment: ${userData.environment}`);
    
    // 5. Check custom claims
    const userRecord = await admin.auth().getUser(adminUid);
    console.log('\n🔐 Custom Claims:');
    console.log(JSON.stringify(userRecord.customClaims, null, 2));
    
    console.log('\n🎉 Manual admin setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Login lại với tài khoản: manhquydev@gmail.com');
    console.log('   2. Access admin dashboard: http://localhost:9002/admin/dashboard');
    console.log('   3. Verify admin permissions work correctly');
    
  } catch (error) {
    console.error('❌ Error in manual admin setup:', error);
    
    if (error.code === 'unavailable') {
      console.error('\n💡 Make sure emulators are running:');
      console.error('   npm run dev:emulator');
    }
    
    process.exit(1);
  }
}

// Run manual setup
manualSetupAdmin().then(() => {
  console.log('\n✨ Manual setup completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

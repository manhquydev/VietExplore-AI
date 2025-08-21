// scripts/setup-admin.js - Setup Admin User Script
const admin = require('firebase-admin');

// Initialize Firebase Admin với service account
const serviceAccount = require('../vietexplore-ai-firebase-adminsdk-fbsvc-3554e3a673.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user for VietExplore AI...');
    
    const adminEmail = 'manhquydev@gmail.com';
    const adminUid = 'QQ986yaD9WUMjUyUDwhDDeL7VFu2';
    
    console.log(`👤 Setting up admin: ${adminEmail} (${adminUid})`);
    
    // 1. Update user document in Firestore
    await db.doc(`users/${adminUid}`).set({
      email: adminEmail,
      displayName: 'Manh Quy (Admin)',
      role: 'admin',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      roleAssignedAt: admin.firestore.FieldValue.serverTimestamp(),
      roleAssignedBy: 'system',
      setupType: 'initial_admin',
      verifiedContributor: true,
      permissions: ['*']
    }, { merge: true });
    
    console.log('✅ User document updated in Firestore');
    
    // 2. Set custom claims in Firebase Auth
    await admin.auth().setCustomUserClaims(adminUid, {
      role: 'admin',
      verifiedContributor: true,
      partnerId: null,
      permissions: ['*']
    });
    
    console.log('✅ Custom claims set in Firebase Auth');
    
    // 3. Create audit log
    await db.collection('audits').add({
      actor: {
        uid: adminUid,
        role: 'admin',
        email: adminEmail
      },
      action: 'initial_admin_setup',
      target: {
        collection: 'users',
        id: adminUid
      },
      metadata: {
        setupType: 'script_setup',
        setupTime: admin.firestore.FieldValue.serverTimestamp(),
        adminEmail,
        adminUid
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Audit log created');
    
    // 4. Verify setup
    const userDoc = await db.doc(`users/${adminUid}`).get();
    const userData = userDoc.data();
    
    console.log('\n📊 Admin Setup Complete:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Status: ${userData.status}`);
    console.log(`   UID: ${adminUid}`);
    
    // 5. Check custom claims
    const userRecord = await admin.auth().getUser(adminUid);
    console.log('\n🔐 Custom Claims:');
    console.log(JSON.stringify(userRecord.customClaims, null, 2));
    
    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Login với email: manhquydev@gmail.com');
    console.log('   2. Access admin dashboard: /admin/dashboard');
    console.log('   3. Manage users và roles');
    console.log('   4. Deploy functions: npm run deploy:backend');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
}

// Run setup
setupAdmin().then(() => {
  console.log('\n✨ Setup script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

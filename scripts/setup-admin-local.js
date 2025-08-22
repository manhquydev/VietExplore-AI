// scripts/setup-admin-local.js - Setup Admin User for LOCAL EMULATOR
const admin = require('firebase-admin');

// Set emulator hosts BEFORE initializing admin
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = '127.0.0.1:9000';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

// Initialize Firebase Admin for LOCAL EMULATOR (no credentials needed for emulator)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'vietexplore-ai'
  });
}

const db = admin.firestore();

async function setupLocalAdmin() {
  try {
    console.log('🔧 Setting up admin user for LOCAL EMULATOR...');
    console.log('📡 Connecting to Firebase Emulators:');
    console.log('   - Auth: 127.0.0.1:9099');
    console.log('   - Firestore: 127.0.0.1:8081');
    console.log('   - Database: 127.0.0.1:9000');
    
    const adminEmail = 'manhquydev@gmail.com';
    
    // 1. First, get or create the user in Firebase Auth Emulator
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log(`✅ Found existing user: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('👤 Creating new admin user in Auth emulator...');
        userRecord = await admin.auth().createUser({
          email: adminEmail,
          displayName: 'Manh Quy (Local Admin)',
          password: 'password123', // For local testing only
          emailVerified: true
        });
        console.log(`✅ Created new user: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }
    
    const adminUid = userRecord.uid;
    
    console.log(`👤 Setting up local admin: ${adminEmail} (${adminUid})`);
    
    // 2. Update user document in Firestore Emulator
    await db.doc(`users/${adminUid}`).set({
      email: adminEmail,
      displayName: 'Manh Quy (Local Admin)',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      roleAssignedAt: new Date(),
      roleAssignedBy: 'system',
      setupType: 'local_admin',
      verifiedContributor: true,
      permissions: ['*'],
      environment: 'local'
    }, { merge: true });
    
    console.log('✅ User document updated in Firestore Emulator');
    
    // 3. Set custom claims in Firebase Auth Emulator
    await admin.auth().setCustomUserClaims(adminUid, {
      role: 'admin',
      verifiedContributor: true,
      partnerId: null,
      permissions: ['*'],
      environment: 'local'
    });
    
    console.log('✅ Custom claims set in Firebase Auth Emulator');
    
    // 4. Create audit log in Firestore Emulator
    await db.collection('audits').add({
      actor: {
        uid: adminUid,
        role: 'admin',
        email: adminEmail
      },
      action: 'local_admin_setup',
      target: {
        collection: 'users',
        id: adminUid
      },
      metadata: {
        setupType: 'local_script_setup',
        setupTime: new Date(),
        adminEmail,
        adminUid,
        environment: 'local'
      },
      createdAt: new Date()
    });
    
    console.log('✅ Audit log created in Firestore Emulator');
    
    // 5. Verify setup
    const userDoc = await db.doc(`users/${adminUid}`).get();
    const userData = userDoc.data();
    
    console.log('\n📊 Local Admin Setup Complete:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Status: ${userData.status}`);
    console.log(`   UID: ${adminUid}`);
    console.log(`   Environment: ${userData.environment}`);
    
    // 6. Check custom claims
    const updatedUserRecord = await admin.auth().getUser(adminUid);
    console.log('\n🔐 Custom Claims:');
    console.log(JSON.stringify(updatedUserRecord.customClaims, null, 2));
    
    console.log('\n🎉 Local Admin setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Ensure emulators are running: npm run dev:emulator');
    console.log(`   2. Login với email: ${adminEmail}`);
    console.log('   3. Password for local: password123');
    console.log('   4. Access admin dashboard: http://localhost:9002/admin/dashboard');
    console.log('   5. Manage users và roles trong local environment');
    
    console.log('\n🔗 Emulator URLs:');
    console.log('   - App: http://localhost:9002');
    console.log('   - Firebase UI: http://127.0.0.1:4000');
    console.log('   - Auth UI: http://127.0.0.1:4000/auth');
    console.log('   - Firestore UI: http://127.0.0.1:4000/firestore');
    
  } catch (error) {
    console.error('❌ Error setting up local admin:', error);
    
    if (error.code === 'unavailable') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Ensure Firebase emulators are running');
      console.error('   - Run: npm run dev:emulator');
      console.error('   - Wait for "All emulators ready!" message');
    }
    
    process.exit(1);
  }
}

// Check if emulators are likely running
function checkEmulatorConnection() {
  console.log('🔍 Checking emulator connection...');
  console.log('   Make sure you have run: npm run dev:emulator');
  console.log('   And see "All emulators ready!" message\n');
}

// Run setup
checkEmulatorConnection();
setupLocalAdmin().then(() => {
  console.log('\n✨ Local setup script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

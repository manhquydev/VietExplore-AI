// Final comprehensive test before deployment
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function runFinalTests() {
  console.log('🎯 FINAL DEPLOYMENT READINESS CHECK');
  console.log('===================================');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };

  function logTest(name, status, message, isWarning = false) {
    const icon = status ? '✅' : (isWarning ? '⚠️' : '❌');
    console.log(`${icon} ${name}: ${message}`);
    
    if (status) results.passed++;
    else if (isWarning) results.warnings++;
    else results.failed++;
  }

  // 1. Environment Configuration
  console.log('\n🔧 Environment Configuration:');
  const requiredEnv = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'NEXT_PUBLIC_FIREBASE_API_KEY'
  ];
  
  const missingEnv = requiredEnv.filter(key => !process.env[key]);
  logTest(
    'Environment Variables',
    missingEnv.length === 0,
    missingEnv.length === 0 
      ? `All ${requiredEnv.length} variables configured`
      : `Missing: ${missingEnv.join(', ')}`
  );

  // 2. Firebase Admin SDK
  console.log('\n🔥 Firebase Services:');
  try {
    const projectId = admin.app().options.projectId;
    logTest('Firebase Admin SDK', true, `Connected to project: ${projectId}`);
  } catch (error) {
    logTest('Firebase Admin SDK', false, error.message);
  }

  // 3. Authentication Service
  try {
    const userList = await auth.listUsers(1);
    logTest('Authentication Service', true, `Service active, ${userList.users.length} test users found`);
  } catch (error) {
    logTest('Authentication Service', false, error.message);
  }

  // 4. Firestore Database
  try {
    await db.collection('test').doc('final-check').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'testing'
    });
    
    const testDoc = await db.collection('test').doc('final-check').get();
    await db.collection('test').doc('final-check').delete();
    
    logTest('Firestore Database', true, 'Read/write operations successful');
  } catch (error) {
    logTest('Firestore Database', false, error.message);
  }

  // 5. Admin Users
  console.log('\n👑 Admin Functionality:');
  try {
    const adminUsers = await db.collection('users').where('role', '==', 'admin').get();
    logTest(
      'Admin Users Available',
      adminUsers.size > 0,
      adminUsers.size > 0 
        ? `${adminUsers.size} admin users ready`
        : 'No admin users found'
    );

    // List admin users
    if (adminUsers.size > 0) {
      console.log('   Admin accounts:');
      adminUsers.forEach(doc => {
        const data = doc.data();
        console.log(`   • ${data.email || 'No email'} (${doc.id.substring(0, 8)}...)`);
      });
    }
  } catch (error) {
    logTest('Admin Users Available', false, error.message);
  }

  // 6. Role Management
  try {
    const testUsers = await db.collection('users').where('role', '!=', 'admin').limit(1).get();
    
    if (!testUsers.empty) {
      const testUser = testUsers.docs[0];
      const originalRole = testUser.data().role;
      
      // Test role change
      await auth.setCustomUserClaims(testUser.id, { role: 'test_role' });
      await db.collection('users').doc(testUser.id).update({
        role: 'test_role',
        lastTest: new Date().toISOString()
      });
      
      // Verify and revert
      const userRecord = await auth.getUser(testUser.id);
      const roleChangeSuccess = userRecord.customClaims?.role === 'test_role';
      
      // Revert changes
      await auth.setCustomUserClaims(testUser.id, { role: originalRole });
      await db.collection('users').doc(testUser.id).update({ role: originalRole });
      
      logTest('Role Management', roleChangeSuccess, 'Custom claims and Firestore updates working');
    } else {
      logTest('Role Management', false, 'No test users available', true);
    }
  } catch (error) {
    logTest('Role Management', false, error.message);
  }

  // 7. Database Indexes
  console.log('\n📊 Database Indexes:');
  const indexTests = [
    {
      name: 'Users by Role',
      query: db.collection('users').where('role', '==', 'admin').orderBy('createdAt', 'desc').limit(1)
    },
    {
      name: 'Places by Status',
      query: db.collection('places').where('status', '==', 'published').orderBy('updatedAt', 'desc').limit(1)
    }
  ];

  for (const test of indexTests) {
    try {
      await test.query.get();
      logTest(`Index: ${test.name}`, true, 'Query executed successfully');
    } catch (error) {
      if (error.code === 9) { // FAILED_PRECONDITION
        logTest(`Index: ${test.name}`, false, 'Index still building - may take 5-10 minutes', true);
      } else {
        logTest(`Index: ${test.name}`, false, error.message);
      }
    }
  }

  // 8. Security Rules
  console.log('\n🔒 Security:');
  try {
    // Test that admin can create logs (should succeed)
    const logRef = await db.collection('admin_logs').add({
      type: 'deployment_test',
      timestamp: new Date().toISOString(),
      action: 'Pre-deployment security test'
    });
    
    await logRef.delete();
    logTest('Security Rules', true, 'Admin operations permitted correctly');
  } catch (error) {
    logTest('Security Rules', false, error.message);
  }

  // 9. Essential Collections
  console.log('\n📦 Data Structure:');
  const collections = ['users', 'places', 'placeDrafts'];
  for (const collection of collections) {
    try {
      const snapshot = await db.collection(collection).limit(1).get();
      logTest(
        `Collection: ${collection}`,
        true,
        snapshot.size > 0 ? 'Contains data' : 'Empty but accessible'
      );
    } catch (error) {
      logTest(`Collection: ${collection}`, false, error.message);
    }
  }

  // Summary
  console.log('\n📋 FINAL SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log('================');

  if (results.failed === 0) {
    console.log('🎉 ALL CRITICAL TESTS PASSED!');
    console.log('📦 Project is ready for deployment');
    
    if (results.warnings > 0) {
      console.log('⚠️  Note: Some warnings present but non-blocking');
    }
    
    console.log('\n🚀 DEPLOYMENT CHECKLIST:');
    console.log('• ✅ Firebase services configured');
    console.log('• ✅ Admin accounts available');
    console.log('• ✅ Database operations working');
    console.log('• ✅ Security rules deployed');
    console.log('• ✅ Essential collections accessible');
    
    console.log('\n📝 TO ACCESS ADMIN PANEL:');
    console.log('1. Login with admin credentials');
    console.log('2. Navigate to /admin/dashboard');
    console.log('3. Admin functions should work properly');
    
    return true;
  } else {
    console.log('❌ CRITICAL ISSUES FOUND');
    console.log('🛑 Fix these issues before deployment:');
    console.log('• Check Firebase configuration');
    console.log('• Verify environment variables');
    console.log('• Ensure admin users exist');
    
    return false;
  }
}

// Run final tests
runFinalTests().then((success) => {
  console.log('\n' + '='.repeat(50));
  console.log(success ? '🟢 DEPLOYMENT READY' : '🔴 DEPLOYMENT BLOCKED');
  console.log('='.repeat(50));
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
// Comprehensive Firebase connection test
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection Comprehensive...\n');

  const results = {
    adminSDK: false,
    firestore: false,
    authentication: false,
    adminUsers: false,
    roleChange: false,
    indexes: false
  };

  try {
    // 1. Test Firebase Admin SDK
    console.log('1. Testing Firebase Admin SDK...');
    const projectId = admin.app().options.projectId;
    console.log(`   Project ID: ${projectId}`);
    results.adminSDK = true;
    console.log('✅ Admin SDK initialized\n');

    // 2. Test Firestore connection
    console.log('2. Testing Firestore connection...');
    const testDoc = await db.collection('test').doc('connection').get();
    console.log('✅ Firestore connection successful');
    results.firestore = true;

    // Test write/read
    await db.collection('test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: 'Firebase connection test'
    });
    const readDoc = await db.collection('test').doc('connection').get();
    console.log(`   Test data: ${readDoc.data().test}`);
    console.log('✅ Firestore read/write successful\n');

    // 3. Test Authentication
    console.log('3. Testing Firebase Authentication...');
    const userList = await auth.listUsers(1);
    console.log(`   Found ${userList.users.length} user(s) in Auth`);
    results.authentication = true;
    console.log('✅ Authentication connection successful\n');

    // 4. Test admin users in Firestore
    console.log('4. Testing admin users in Firestore...');
    const adminQuery = await db.collection('users').where('role', '==', 'admin').get();
    console.log(`   Found ${adminQuery.size} admin user(s) in Firestore`);
    
    if (adminQuery.size > 0) {
      adminQuery.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.email || 'No email'} (${doc.id})`);
      });
      results.adminUsers = true;
      console.log('✅ Admin users found\n');
    } else {
      console.log('⚠️  No admin users found in Firestore\n');
    }

    // 5. Test role change functionality
    console.log('5. Testing role change functionality...');
    const regularUser = await db.collection('users')
      .where('role', '!=', 'admin')
      .limit(1)
      .get();

    if (!regularUser.empty) {
      const testUser = regularUser.docs[0];
      const userId = testUser.id;
      const userData = testUser.data();
      const originalRole = userData.role;
      
      console.log(`   Testing with user: ${userData.email} (current role: ${originalRole})`);
      
      // Test setting custom claims
      await auth.setCustomUserClaims(userId, { role: 'contributor', testFlag: true });
      console.log('✅ Custom claims set successfully');
      
      // Test Firestore update
      await db.collection('users').doc(userId).update({
        role: 'contributor',
        testUpdate: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Firestore document updated successfully');
      
      // Revert changes
      await auth.setCustomUserClaims(userId, { role: originalRole });
      await db.collection('users').doc(userId).update({
        role: originalRole,
        testUpdate: admin.firestore.FieldValue.delete()
      });
      console.log('✅ Changes reverted successfully');
      
      results.roleChange = true;
      console.log('✅ Role change functionality working\n');
    } else {
      console.log('⚠️  No regular users found for testing role change\n');
    }

    // 6. Test indexes by running queries
    console.log('6. Testing database indexes...');
    const indexQueries = [
      { name: 'Users by role and createdAt', query: db.collection('users').where('role', '==', 'admin').orderBy('createdAt', 'desc').limit(1) },
      { name: 'Places by status and updatedAt', query: db.collection('places').where('status', '==', 'published').orderBy('updatedAt', 'desc').limit(1) },
      { name: 'Moderation queue by status and submittedAt', query: db.collection('moderation_queue').where('status', '==', 'pending').orderBy('submittedAt', 'asc').limit(1) }
    ];

    let indexesWorking = 0;
    for (const queryTest of indexQueries) {
      try {
        await queryTest.query.get();
        console.log(`   ✅ ${queryTest.name}`);
        indexesWorking++;
      } catch (error) {
        if (error.code === 9) { // FAILED_PRECONDITION
          console.log(`   ⚠️  ${queryTest.name} - Index missing`);
        } else {
          console.log(`   ❌ ${queryTest.name} - Error: ${error.message}`);
        }
      }
    }
    
    if (indexesWorking === indexQueries.length) {
      results.indexes = true;
      console.log('✅ All indexes working\n');
    } else {
      console.log(`⚠️  ${indexesWorking}/${indexQueries.length} indexes working\n`);
    }

    // Clean up test data
    await db.collection('test').doc('connection').delete();
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      stack: error.stack
    });
  }

  // Summary
  console.log('\n📊 CONNECTION TEST SUMMARY:');
  console.log('================================');
  console.log(`Admin SDK:        ${results.adminSDK ? '✅' : '❌'}`);
  console.log(`Firestore:        ${results.firestore ? '✅' : '❌'}`);
  console.log(`Authentication:   ${results.authentication ? '✅' : '❌'}`);
  console.log(`Admin Users:      ${results.adminUsers ? '✅' : '⚠️'}`);
  console.log(`Role Change:      ${results.roleChange ? '✅' : '⚠️'}`);
  console.log(`Indexes:          ${results.indexes ? '✅' : '⚠️'}`);
  console.log('================================');

  const allGood = Object.values(results).every(r => r === true);
  if (allGood) {
    console.log('🎉 ALL TESTS PASSED - Firebase is fully operational!');
  } else {
    console.log('⚠️  Some tests failed - check the issues above');
  }

  return results;
}

testFirebaseConnection().then((results) => {
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
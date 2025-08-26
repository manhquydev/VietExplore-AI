// Admin functionality test script
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

async function testAdminFunctionality() {
  console.log('🔍 Testing Admin Functionality...\n');

  try {
    // 1. Test Firebase Admin connection
    console.log('1. Testing Firebase Admin SDK connection...');
    const testUser = await auth.listUsers(1);
    console.log('✅ Firebase Admin SDK connected successfully\n');

    // 2. Check if admin user exists
    console.log('2. Checking for admin users...');
    const usersSnapshot = await db.collection('users').where('role', '==', 'admin').get();
    
    if (usersSnapshot.empty) {
      console.log('⚠️  No admin users found!');
      console.log('Creating a test admin user...\n');
      
      // Create a test admin user
      const email = 'admin@vietexplore-ai.com';
      const password = 'AdminTest123!';
      
      try {
        const userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: 'Admin Test',
          emailVerified: true
        });

        // Set admin role in custom claims
        await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          email: email,
          fullName: 'Admin Test',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailVerified: true
        });

        console.log(`✅ Created admin user: ${email}`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   Password: ${password}\n`);
        
      } catch (createError) {
        if (createError.code === 'auth/email-already-exists') {
          console.log('⚠️  Admin email already exists in Auth');
          const existingUser = await auth.getUserByEmail(email);
          await auth.setCustomUserClaims(existingUser.uid, { role: 'admin' });
          console.log('✅ Updated existing user with admin role\n');
        } else {
          throw createError;
        }
      }
    } else {
      console.log(`✅ Found ${usersSnapshot.size} admin user(s):`);
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.email} (${doc.id})`);
      });
      console.log('');
    }

    // 3. Test user role change
    console.log('3. Testing user role change functionality...');
    
    // Find a non-admin user for testing
    const regularUsersSnapshot = await db.collection('users')
      .where('role', '!=', 'admin')
      .limit(1)
      .get();
    
    if (!regularUsersSnapshot.empty) {
      const testUserDoc = regularUsersSnapshot.docs[0];
      const testUserId = testUserDoc.id;
      const testUserData = testUserDoc.data();
      
      console.log(`   Testing role change for user: ${testUserData.email}`);
      
      // Try to set custom claims
      await auth.setCustomUserClaims(testUserId, { role: 'contributor' });
      console.log('✅ Successfully set custom claims');
      
      // Update Firestore document
      await db.collection('users').doc(testUserId).update({
        role: 'contributor',
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Successfully updated Firestore document\n');
      
    } else {
      console.log('⚠️  No regular users found to test role change\n');
    }

    // 4. Test API endpoint (if server is running)
    console.log('4. API endpoint information:');
    console.log('   PUT /api/admin/users/[userId]/role');
    console.log('   Make sure to include Authorization: Bearer <token> header');
    console.log('   Body: { "newRole": "contributor", "reason": "Test role change" }\n');

    // 5. Check Firestore indexes
    console.log('5. Checking for potential index issues...');
    const indexCheckQueries = [
      // Query that might need index
      db.collection('users').where('role', '==', 'admin').orderBy('createdAt', 'desc').limit(1)
    ];

    for (let query of indexCheckQueries) {
      try {
        await query.get();
        console.log('✅ Query executed successfully');
      } catch (error) {
        if (error.code === 9) { // FAILED_PRECONDITION
          console.log('⚠️  Index missing for query:', error.message);
        } else {
          console.log('❌ Query error:', error.message);
        }
      }
    }

    console.log('\n🎉 Admin functionality test completed!');

  } catch (error) {
    console.error('❌ Error during admin test:', error);
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n💡 Fix: Check your Firebase service account credentials in .env.local');
    } else if (error.code === 'permission-denied') {
      console.log('\n💡 Fix: Update Firestore security rules to allow admin operations');
    }
  }
}

testAdminFunctionality().then(() => {
  console.log('Test completed. You can now close this script.');
}).catch(console.error);
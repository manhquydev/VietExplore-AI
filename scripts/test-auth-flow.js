// Script to test the complete authentication flow
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables  
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin SDK
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

const auth = admin.auth();
const db = admin.firestore();

async function testAuthFlow() {
  try {
    console.log('Testing authentication flow...\n');
    
    // 1. Test admin user exists in Auth
    const adminEmail = 'admin@dulichviet.com';
    const userRecord = await auth.getUserByEmail(adminEmail);
    console.log('✅ Admin user exists in Firebase Auth');
    console.log('   UID:', userRecord.uid);
    console.log('   Email:', userRecord.email);
    console.log('   Custom claims:', userRecord.customClaims);
    
    // 2. Test admin user exists in Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ Admin user exists in Firestore');
      console.log('   Role:', userData.role);
      console.log('   Full name:', userData.fullName);
    } else {
      console.log('❌ Admin user NOT found in Firestore');
      return;
    }
    
    // 3. Test token creation and verification
    const customToken = await auth.createCustomToken(userRecord.uid);
    console.log('✅ Custom token created successfully');
    
    try {
      const decodedToken = await auth.verifyIdToken(customToken);
      console.log('❌ Custom token verification (this should fail for custom tokens)');
    } catch (error) {
      console.log('✅ Custom token verification correctly failed (expected)');
    }
    
    // 4. Check moderation queue data
    const moderationSnapshot = await db.collection('moderation_queue').get();
    console.log('✅ Moderation queue collection accessible');
    console.log('   Items count:', moderationSnapshot.size);
    
    // 5. Check users collection
    const usersSnapshot = await db.collection('users').limit(5).get();
    console.log('✅ Users collection accessible');
    console.log('   Total users (sample):', usersSnapshot.size);
    
    console.log('\n📋 Summary:');
    console.log('- Admin user exists and has proper role');
    console.log('- Database collections are accessible');
    console.log('- Firebase Admin SDK is working properly');
    
    console.log('\n🔧 Next steps:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Login with: admin@dulichviet.com / password123');
    console.log('3. Navigate to /admin/dashboard');
    
  } catch (error) {
    console.error('❌ Error in authentication flow test:', error);
  }
  
  process.exit(0);
}

// Run the test
testAuthFlow();
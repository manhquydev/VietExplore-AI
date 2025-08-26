// Script to create an admin user for testing
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

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const adminEmail = 'admin@dulichviet.com';
    const adminPassword = 'password123';
    
    // Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        emailVerified: true,
        displayName: 'Admin User'
      });
      console.log('Created new Firebase Auth user:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('User already exists in Firebase Auth, getting existing user...');
        userRecord = await auth.getUserByEmail(adminEmail);
      } else {
        throw error;
      }
    }
    
    // Create user document in Firestore
    const adminUserData = {
      email: adminEmail,
      fullName: 'Quản trị viên hệ thống',
      username: 'admin_system',
      role: 'admin',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        bio: 'Quản trị viên hệ thống Du Lịch Việt',
        location: 'Hà Nội, Việt Nam'
      },
      stats: {
        placesContributed: 0,
        itinerariesCreated: 0,
        helpfulVotes: 0
      },
      permissions: ['all_permissions']
    };
    
    // Set user data in Firestore
    await db.collection('users').doc(userRecord.uid).set(adminUserData, { merge: true });
    
    console.log('Successfully created admin user:');
    console.log('UID:', userRecord.uid);
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    
    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log('Set custom claims for admin user');
    
    console.log('\nYou can now login with:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the creation
createAdminUser();
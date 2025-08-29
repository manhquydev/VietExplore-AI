// Script to create admin user for testing moderation workflow
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  let credential;
  
  // Try to get service account from environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = admin.credential.cert(serviceAccount);
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
      console.log('Please check your .env.local file');
      process.exit(1);
    }
  } else {
    // Try to find service account file
    const possiblePaths = [
      path.resolve(__dirname, '../serviceAccountKey.json'),
      path.resolve(__dirname, '../firebase-admin-key.json'),
      path.resolve(__dirname, '../firebase-service-account.json')
    ];
    
    let serviceAccountPath = null;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        serviceAccountPath = filePath;
        break;
      }
    }
    
    if (serviceAccountPath) {
      credential = admin.credential.cert(serviceAccountPath);
      console.log(`Using service account from: ${serviceAccountPath}`);
    } else {
      console.error('Firebase service account not found!');
      console.log('Please either:');
      console.log('1. Set FIREBASE_SERVICE_ACCOUNT_KEY in .env.local');
      console.log('2. Place service account JSON file in project root as serviceAccountKey.json');
      process.exit(1);
    }
  }
  
  admin.initializeApp({
    credential: credential
  });
}

const db = admin.firestore();

async function createAdminUser() {
  try {
    // Create test admin user in Firebase Auth
    const adminUser = await admin.auth().createUser({
      email: 'admin@vietexplore.test',
      password: 'AdminTest123!',
      displayName: 'Admin Test',
      emailVerified: true
    });

    console.log('Created admin user:', adminUser.uid);

    // Create user profile in Firestore with admin role
    const userProfile = {
      id: adminUser.uid,
      email: 'admin@vietexplore.test',
      fullName: 'Admin Test',
      role: 'admin',
      trustLabel: 'verified',
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        placesCreated: 0,
        placesApproved: 0,
        itinerariesCreated: 0,
        reviewsCount: 0,
        likesReceived: 0,
        viewsReceived: 0
      }
    };

    await db.collection('users').doc(adminUser.uid).set(userProfile);

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@vietexplore.test');
    console.log('Password: AdminTest123!');
    console.log('Role: admin');
    console.log('\nYou can now use this account to access moderation dashboard at /moderation/dashboard');

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('Admin user already exists, updating role...');
      
      // Get existing user
      const existingUser = await admin.auth().getUserByEmail('admin@vietexplore.test');
      
      // Update user profile in Firestore
      await db.collection('users').doc(existingUser.uid).update({
        role: 'admin',
        trustLabel: 'verified',
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Updated existing user to admin role');
    } else {
      console.error('Error creating admin user:', error);
    }
  } finally {
    process.exit(0);
  }
}

createAdminUser();
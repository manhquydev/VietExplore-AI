const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    // Try to get storage bucket from environment or use default pattern
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.log('📁 Make sure firebase-service-account.json exists in project root');
    process.exit(1);
  }
}

const db = admin.firestore();

async function clearAllUsers() {
  try {
    console.log('🔥 Starting to clear all users data...');
    
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Found ${usersSnapshot.size} users in Firestore`);
    
    if (usersSnapshot.empty) {
      console.log('✅ No users found in Firestore');
      return;
    }

    // Delete all users from Firestore in batches
    const batch = db.batch();
    let deletedCount = 0;
    
    usersSnapshot.forEach(doc => {
      batch.delete(doc.ref);
      deletedCount++;
    });
    
    await batch.commit();
    console.log(`✅ Deleted ${deletedCount} users from Firestore`);

    // Get all users from Firebase Auth
    console.log('🔍 Fetching all users from Firebase Auth...');
    let nextPageToken;
    let authUsersCount = 0;
    
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      if (listUsersResult.users.length > 0) {
        // Delete users in batches (Firebase has rate limits)
        const deletePromises = listUsersResult.users.map(user => 
          admin.auth().deleteUser(user.uid)
            .then(() => {
              authUsersCount++;
              if (authUsersCount % 50 === 0) {
                console.log(`🗑️  Deleted ${authUsersCount} auth users...`);
              }
            })
            .catch(error => {
              console.error(`❌ Failed to delete user ${user.uid}:`, error.message);
            })
        );
        
        await Promise.all(deletePromises);
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`✅ Deleted ${authUsersCount} users from Firebase Auth`);
    
    console.log('🎉 All users data cleared successfully!');
    console.log('📈 Summary:');
    console.log(`   - Firestore users: ${deletedCount}`);
    console.log(`   - Auth users: ${authUsersCount}`);
    
  } catch (error) {
    console.error('❌ Error clearing users:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  console.log('⚠️  WARNING: This will DELETE ALL USERS DATA!');
  console.log('⚠️  This action cannot be undone!');
  
  // Simple confirmation check
  const args = process.argv.slice(2);
  if (!args.includes('--confirm')) {
    console.log('');
    console.log('To confirm you want to delete all users, run:');
    console.log('node scripts/clear-all-users.js --confirm');
    console.log('');
    process.exit(0);
  }
  
  clearAllUsers()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { clearAllUsers };
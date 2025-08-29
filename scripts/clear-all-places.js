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
    console.log(`📦 Using storage bucket: ${storageBucket}`);
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.log('📁 Make sure firebase-service-account.json exists in project root');
    process.exit(1);
  }
}

const db = admin.firestore();

// Initialize storage bucket with error handling
let storage = null;
try {
  storage = admin.storage().bucket();
} catch (error) {
  console.warn('⚠️  Could not initialize Firebase Storage:', error.message);
  console.log('   (Storage operations will be skipped)');
}

async function clearAllPlaces() {
  try {
    console.log('🔥 Starting to clear all places data...');
    
    // Clear places collection
    const placesSnapshot = await db.collection('places').get();
    console.log(`📊 Found ${placesSnapshot.size} places in Firestore`);
    
    if (!placesSnapshot.empty) {
      const placeBatch = db.batch();
      let deletedPlacesCount = 0;
      
      placesSnapshot.forEach(doc => {
        placeBatch.delete(doc.ref);
        deletedPlacesCount++;
      });
      
      await placeBatch.commit();
      console.log(`✅ Deleted ${deletedPlacesCount} places from Firestore`);
    }
    
    // Clear moderation_queue collection
    const moderationSnapshot = await db.collection('moderation_queue').get();
    console.log(`📊 Found ${moderationSnapshot.size} moderation queue items`);
    
    if (!moderationSnapshot.empty) {
      const moderationBatch = db.batch();
      let deletedModerationCount = 0;
      
      moderationSnapshot.forEach(doc => {
        moderationBatch.delete(doc.ref);
        deletedModerationCount++;
      });
      
      await moderationBatch.commit();
      console.log(`✅ Deleted ${deletedModerationCount} moderation queue items`);
    }
    
    // Clear moderation_logs collection
    const logsSnapshot = await db.collection('moderation_logs').get();
    console.log(`📊 Found ${logsSnapshot.size} moderation logs`);
    
    if (!logsSnapshot.empty) {
      const logsBatch = db.batch();
      let deletedLogsCount = 0;
      
      logsSnapshot.forEach(doc => {
        logsBatch.delete(doc.ref);
        deletedLogsCount++;
      });
      
      await logsBatch.commit();
      console.log(`✅ Deleted ${deletedLogsCount} moderation logs`);
    }
    
    // Clear place images from Firebase Storage
    if (storage) {
      console.log('🗑️  Clearing place images from Firebase Storage...');
      try {
        const [files] = await storage.getFiles({ prefix: 'places/' });
        console.log(`📊 Found ${files.length} files in places/ folder`);
        
        if (files.length > 0) {
          // Delete files in batches
          const deletePromises = files.map(file => 
            file.delete().catch(error => {
              console.error(`❌ Failed to delete ${file.name}:`, error.message);
            })
          );
          
          await Promise.all(deletePromises);
          console.log(`✅ Deleted ${files.length} image files from Storage`);
        } else {
          console.log('ℹ️  No files found in places/ folder');
        }
      } catch (storageError) {
        console.warn('⚠️  Could not access Firebase Storage:', storageError.message);
        console.log('   (Storage clearing skipped - may need to clear manually)');
      }
    } else {
      console.log('⚠️  Firebase Storage not available, skipping file cleanup');
      console.log('   (You may need to clear Storage files manually from Firebase Console)');
    }
    
    console.log('🎉 All places data cleared successfully!');
    console.log('📈 Summary:');
    console.log(`   - Places: ${placesSnapshot.size}`);
    console.log(`   - Moderation queue: ${moderationSnapshot.size}`);
    console.log(`   - Moderation logs: ${logsSnapshot.size}`);
    console.log(`   - Storage files: ${await countStorageFiles()}`);
    
  } catch (error) {
    console.error('❌ Error clearing places:', error);
    throw error;
  }
}

async function countStorageFiles() {
  if (!storage) return 'N/A (Storage not available)';
  
  try {
    const [files] = await storage.getFiles({ prefix: 'places/' });
    return files.length;
  } catch {
    return 'N/A (Storage error)';
  }
}

// Function to clear specific collections (useful for partial cleanup)
async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing ${collectionName} collection...`);
  const snapshot = await db.collection(collectionName).get();
  
  if (snapshot.empty) {
    console.log(`✅ ${collectionName} collection is already empty`);
    return 0;
  }
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
    count++;
  });
  
  await batch.commit();
  console.log(`✅ Deleted ${count} documents from ${collectionName}`);
  return count;
}

// Run the script
if (require.main === module) {
  console.log('⚠️  WARNING: This will DELETE ALL PLACES DATA!');
  console.log('⚠️  This includes places, moderation queue, logs, and images!');
  console.log('⚠️  This action cannot be undone!');
  
  // Simple confirmation check
  const args = process.argv.slice(2);
  if (!args.includes('--confirm')) {
    console.log('');
    console.log('To confirm you want to delete all places data, run:');
    console.log('node scripts/clear-all-places.js --confirm');
    console.log('');
    process.exit(0);
  }
  
  clearAllPlaces()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { clearAllPlaces, clearCollection };
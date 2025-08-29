const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to load service account from environment or file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Use default credentials or Application Default Credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.log('⚠️  Using minimal Firebase setup for testing:', error.message);
    // For testing purposes, we'll just run without Firebase
  }
}

async function createTestModerationFlow() {
  console.log('🧪 Creating Test Moderation Flow...\n');

  try {
    const db = admin.firestore();

    // 1. Create a test place that needs moderation
    const testPlaceId = 'test-place-' + Date.now();
    const testUserId = 'test-user-' + Date.now();

    console.log('1. Creating test place...');
    const testPlace = {
      name: 'Bãi biển Mỹ Khê Test',
      description: 'Bãi biển tuyệt đẹp ở Đà Nẵng dành cho test',
      shortDescription: 'Bãi biển Mỹ Khê dành cho testing',
      type: 'bien',
      region: 'trung-bo',
      province: 'da-nang',
      address: 'Mỹ Khê, Đà Nẵng',
      coordinates: { lat: 16.0544, lng: 108.2455 },
      images: ['https://example.com/image1.jpg'],
      status: 'submitted',  // This should trigger moderation
      createdBy: testUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trustLabel: 'community'
    };

    await db.collection('places').doc(testPlaceId).set(testPlace);
    console.log(`✅ Created test place: ${testPlaceId}`);

    // 2. Create corresponding moderation queue item
    console.log('2. Creating moderation queue item...');
    const moderationItem = {
      contentId: testPlaceId,
      contentType: 'place',
      submittedBy: testUserId,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      priority: 'medium',
      queueType: 'contributor_queue',
      metadata: {
        title: testPlace.name,
        description: testPlace.shortDescription,
        region: testPlace.region,
        province: testPlace.province,
        type: testPlace.type
      }
    };

    const moderationRef = await db.collection('moderation_queue').add(moderationItem);
    console.log(`✅ Created moderation item: ${moderationRef.id}`);

    // 3. Create test user profile
    console.log('3. Creating test user profile...');
    const testUser = {
      id: testUserId,
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'contributor',
      trustLabel: 'community',
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        placesCreated: 1,
        placesApproved: 0,
        itinerariesCreated: 0,
        reviewsCount: 0,
        likesReceived: 0,
        viewsReceived: 0
      }
    };

    await db.collection('users').doc(testUserId).set(testUser);
    console.log(`✅ Created test user: ${testUserId}`);

    // 4. Create test admin user if doesn't exist
    console.log('4. Ensuring test admin user exists...');
    const adminUserId = 'test-admin-user';
    const adminUserDoc = await db.collection('users').doc(adminUserId).get();
    
    if (!adminUserDoc.exists) {
      const adminUser = {
        id: adminUserId,
        email: 'admin@vietexplore.test',
        fullName: 'Test Admin',
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
      
      await db.collection('users').doc(adminUserId).set(adminUser);
      console.log(`✅ Created test admin user: ${adminUserId}`);
    } else {
      console.log(`✅ Test admin user already exists: ${adminUserId}`);
    }

    // 5. Summary
    console.log('\n📋 Test Setup Complete!');
    console.log(`   Place ID: ${testPlaceId}`);
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Admin ID: ${adminUserId}`);
    console.log(`   Moderation ID: ${moderationRef.id}`);
    
    console.log('\n🎯 To test the moderation flow:');
    console.log('   1. Login as admin (admin@vietexplore.test)');
    console.log('   2. Go to /moderation/dashboard');
    console.log('   3. Find the test place in the queue');
    console.log('   4. Try to approve or reject it');
    console.log('   5. Check server logs for errors');

    console.log('\n🧹 To clean up test data:');
    console.log(`   - Delete place: ${testPlaceId}`);
    console.log(`   - Delete user: ${testUserId}`);
    console.log(`   - Delete moderation: ${moderationRef.id}`);

    return {
      placeId: testPlaceId,
      userId: testUserId,
      adminId: adminUserId,
      moderationId: moderationRef.id
    };

  } catch (error) {
    console.error('❌ Error creating test flow:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

async function cleanupTestData(testData) {
  if (!testData) return;
  
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    const db = admin.firestore();
    
    await Promise.all([
      db.collection('places').doc(testData.placeId).delete(),
      db.collection('users').doc(testData.userId).delete(),
      db.collection('moderation_queue').doc(testData.moderationId).delete()
    ]);
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up:', error.message);
  }
}

// Check if we should cleanup or create
const args = process.argv.slice(2);
const shouldCleanup = args.includes('--cleanup');

if (shouldCleanup) {
  console.log('🧹 Cleanup mode - not implemented yet');
  console.log('Please manually delete test documents or restart the script without --cleanup');
} else {
  // Create test data
  createTestModerationFlow().then((testData) => {
    if (testData) {
      console.log('\n✅ Test moderation flow ready!');
    }
    process.exit(0);
  });
}
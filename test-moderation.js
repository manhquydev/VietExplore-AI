// Test script to debug moderation functionality
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Use default credentials from environment
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

async function testModerationFlow() {
  console.log('🔍 Testing Moderation Flow...\n');

  try {
    // 1. Check if there are any items in moderation queue
    console.log('1. Checking moderation queue...');
    const queueSnapshot = await db.collection('moderation_queue').limit(5).get();
    
    if (queueSnapshot.empty) {
      console.log('❌ No items in moderation queue');
      
      // Create a test moderation item
      console.log('2. Creating test moderation item...');
      const testItem = {
        contentId: 'test-place-123',
        contentType: 'place',
        submittedBy: 'test-user-123',
        submittedAt: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        metadata: {
          title: 'Test Place for Moderation',
          description: 'Test description'
        }
      };
      
      const docRef = await db.collection('moderation_queue').add(testItem);
      console.log('✅ Created test moderation item:', docRef.id);
      
      // Also create the corresponding place
      const testPlace = {
        name: 'Test Place for Moderation',
        description: 'Test description',
        status: 'submitted',
        createdBy: 'test-user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('places').doc('test-place-123').set(testPlace);
      console.log('✅ Created corresponding test place');
      
    } else {
      console.log(`✅ Found ${queueSnapshot.size} items in moderation queue`);
      queueSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.contentType} - ${data.status} - ${data.metadata?.title || 'No title'}`);
      });
    }

    // 2. Test API endpoints
    console.log('\n3. Testing API endpoints...');
    
    // Test GET moderation queue
    console.log('   Testing GET /api/moderation/queue...');
    const response = await fetch('http://localhost:9003/api/moderation/queue', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ GET queue successful: ${data.data?.length || 0} items`);
    } else {
      console.log(`   ❌ GET queue failed: ${response.status} ${response.statusText}`);
      const errorData = await response.text();
      console.log(`   Error details: ${errorData}`);
    }

    // 3. Test data structure consistency
    console.log('\n4. Testing data structure consistency...');
    const places = await db.collection('places').where('status', '==', 'submitted').limit(3).get();
    
    places.docs.forEach(doc => {
      const place = doc.data();
      console.log(`   Place ${doc.id}:`);
      console.log(`     - Status: ${place.status}`);
      console.log(`     - Created by: ${place.createdBy}`);
      console.log(`     - Has moderation entry: checking...`);
      
      // Check if there's a corresponding moderation queue entry
      db.collection('moderation_queue')
        .where('contentId', '==', doc.id)
        .get()
        .then(moderationSnapshot => {
          if (moderationSnapshot.empty) {
            console.log(`     ❌ No moderation entry for place ${doc.id}`);
          } else {
            console.log(`     ✅ Found moderation entry for place ${doc.id}`);
          }
        });
    });

    console.log('\n5. Checking Firebase rules and permissions...');
    // This would require actual authentication token testing
    console.log('   (Skipping auth testing - requires actual user tokens)');

  } catch (error) {
    console.error('❌ Error in moderation testing:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testModerationFlow().then(() => {
  console.log('\n✅ Moderation test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
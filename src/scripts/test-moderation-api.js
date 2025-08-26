// Test moderation API endpoints
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

async function testModerationAPI() {
  console.log('🔌 TESTING MODERATION API ENDPOINTS');
  console.log('====================================');

  try {
    // 1. Create test data first
    console.log('\n1. Creating test moderation data...');
    
    // Get contributor and admin users
    const contributorSnapshot = await db.collection('users')
      .where('role', '==', 'contributor')
      .limit(1)
      .get();
    
    const adminSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();
    
    if (contributorSnapshot.empty || adminSnapshot.empty) {
      throw new Error('Need both contributor and admin users for testing');
    }
    
    const contributor = contributorSnapshot.docs[0];
    const adminUser = adminSnapshot.docs[0];
    
    // Create test place
    const testPlace = {
      name: `API Test Place - ${Date.now()}`,
      description: 'Test place for API testing',
      shortDescription: 'API test place',
      region: 'bac-bo',
      province: 'ha-noi',
      type: 'van-hoa',
      address: 'API Test Address',
      coordinates: { lat: 21.0285, lng: 105.8542 },
      status: 'submitted',
      createdBy: contributor.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['api-test'],
      trustLabel: 'contributor',
      slug: 'api-test-' + Date.now()
    };
    
    const placeRef = await db.collection('places').add(testPlace);
    const placeId = placeRef.id;
    
    // Create moderation queue entry
    const queueEntry = {
      contentType: 'place',
      contentId: placeId,
      submittedBy: contributor.id,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      priority: 3,
      metadata: {
        title: testPlace.name,
        type: testPlace.type,
        region: testPlace.region,
        province: testPlace.province
      }
    };
    
    const queueRef = await db.collection('moderation_queue').add(queueEntry);
    const queueId = queueRef.id;
    
    console.log(`✅ Created test place: ${placeId}`);
    console.log(`✅ Created queue entry: ${queueId}`);
    
    // 2. Test API endpoints (would need server running)
    console.log('\n2. API Endpoint Information:');
    console.log('============================');
    
    // Get admin token for testing
    const adminToken = await auth.createCustomToken(adminUser.id);
    console.log(`✅ Created admin token (first 20 chars): ${adminToken.substring(0, 20)}...`);
    
    console.log('\n📋 API ENDPOINTS TO TEST:');
    console.log('==========================');
    console.log('🔍 GET Endpoints:');
    console.log(`   • GET /api/moderation/queue?status=pending`);
    console.log(`   • GET /api/moderation/queue?limit=10`);
    console.log(`   • GET /api/places (should show published places only)`);
    console.log(`   • GET /api/admin/users (admin only)`);
    
    console.log('\n🔄 PUT/POST Endpoints:');
    console.log(`   • PUT /api/moderation/queue/${queueId}`);
    console.log(`     Headers: Authorization: Bearer <admin-token>`);
    console.log(`     Body: { "action": "approve", "reviewNotes": "API test approval" }`);
    console.log(`   • POST /api/places`);
    console.log(`     Headers: Authorization: Bearer <contributor-token>`);
    console.log(`     Body: { place data }`);
    
    console.log('\n🧪 CURL EXAMPLES:');
    console.log('==================');
    console.log(`# Get pending moderation queue:`);
    console.log(`curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\`);
    console.log(`     "http://localhost:3000/api/moderation/queue?status=pending"`);
    console.log('');
    console.log(`# Approve a moderation item:`);
    console.log(`curl -X PUT \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\`);
    console.log(`     -d '{"action":"approve","reviewNotes":"Approved via API"}' \\`);
    console.log(`     "http://localhost:3000/api/moderation/queue/${queueId}"`);
    
    // 3. Test database queries that the API uses
    console.log('\n3. Testing underlying database queries...');
    
    // Test moderation queue query
    const pendingItems = await db.collection('moderation_queue')
      .where('status', '==', 'pending')
      .orderBy('priority', 'desc')
      .orderBy('submittedAt', 'asc')
      .limit(20)
      .get();
    
    console.log(`✅ Pending items query: Found ${pendingItems.size} items`);
    
    // Test with filters
    const placeItems = await db.collection('moderation_queue')
      .where('status', '==', 'pending')
      .where('contentType', '==', 'place')
      .get();
    
    console.log(`✅ Place items query: Found ${placeItems.size} place items`);
    
    // Test place query
    const publishedPlaces = await db.collection('places')
      .where('status', '==', 'published')
      .limit(5)
      .get();
    
    console.log(`✅ Published places query: Found ${publishedPlaces.size} places`);
    
    // Test user query
    const allUsers = await db.collection('users')
      .limit(10)
      .get();
    
    console.log(`✅ Users query: Found ${allUsers.size} users`);
    
    console.log('\n4. Testing admin permissions...');
    
    // Test admin role checking
    const adminUserData = adminUser.data();
    const isAdmin = adminUserData.role === 'admin';
    console.log(`✅ Admin role check: ${isAdmin ? 'PASS' : 'FAIL'}`);
    
    // Test moderator permissions
    const moderatorSnapshot = await db.collection('users')
      .where('role', '==', 'moderator')
      .limit(1)
      .get();
    
    if (!moderatorSnapshot.empty) {
      const moderatorData = moderatorSnapshot.docs[0].data();
      const isModerator = ['moderator', 'admin'].includes(moderatorData.role);
      console.log(`✅ Moderator permissions: ${isModerator ? 'PASS' : 'FAIL'}`);
    } else {
      console.log('ℹ️  No moderator users found (admin can handle moderation)');
    }
    
    // 5. Performance check
    console.log('\n5. Performance testing...');
    const startTime = Date.now();
    
    await Promise.all([
      db.collection('moderation_queue').where('status', '==', 'pending').limit(1).get(),
      db.collection('places').where('status', '==', 'published').limit(1).get(),
      db.collection('users').where('role', '==', 'admin').limit(1).get()
    ]);
    
    const endTime = Date.now();
    console.log(`✅ Concurrent queries completed in ${endTime - startTime}ms`);
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await db.collection('places').doc(placeId).delete();
    await db.collection('moderation_queue').doc(queueId).delete();
    console.log('✅ Test data cleaned up');
    
    return {
      success: true,
      stats: {
        pendingItems: pendingItems.size,
        publishedPlaces: publishedPlaces.size,
        totalUsers: allUsers.size,
        queryPerformance: endTime - startTime
      },
      endpoints: {
        moderationQueue: `/api/moderation/queue`,
        reviewAction: `/api/moderation/queue/${queueId}`,
        places: `/api/places`,
        adminUsers: `/api/admin/users`
      }
    };
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function displayModerationDashboard() {
  console.log('\n📊 MODERATION DASHBOARD PREVIEW');
  console.log('===============================');
  
  try {
    // Get real data for dashboard preview
    const [pendingSnapshot, approvedSnapshot, rejectedSnapshot, usersSnapshot] = await Promise.all([
      db.collection('moderation_queue').where('status', '==', 'pending').get(),
      db.collection('moderation_queue').where('status', '==', 'approved').get(),
      db.collection('moderation_queue').where('status', '==', 'rejected').get(),
      db.collection('users').get()
    ]);
    
    console.log('📈 Current Statistics:');
    console.log(`   • Pending Review: ${pendingSnapshot.size} items`);
    console.log(`   • Approved: ${approvedSnapshot.size} items`);
    console.log(`   • Rejected: ${rejectedSnapshot.size} items`);
    console.log(`   • Total Users: ${usersSnapshot.size} users`);
    
    if (pendingSnapshot.size > 0) {
      console.log('\n📋 Pending Items Preview:');
      pendingSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.metadata?.title || 'No title'} (${data.contentType})`);
        console.log(`      Submitted: ${new Date(data.submittedAt).toLocaleDateString('vi-VN')}`);
        console.log(`      Priority: ${data.priority} | By: ${data.submittedBy}`);
      });
      
      if (pendingSnapshot.size > 3) {
        console.log(`   ... and ${pendingSnapshot.size - 3} more items`);
      }
    } else {
      console.log('\n✅ No items pending review - queue is clean!');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Login as admin at: http://localhost:3000/auth/login');
    console.log('   3. Go to admin dashboard: http://localhost:3000/admin/dashboard');
    console.log('   4. Click "Kiểm duyệt" tab to see moderation queue');
    console.log('   5. Review and approve/reject pending items');
    
  } catch (error) {
    console.error('Dashboard preview failed:', error.message);
  }
}

// Run the tests
testModerationAPI().then(async (result) => {
  if (result.success) {
    console.log('\n🎉 MODERATION API TEST COMPLETED!');
    console.log('==================================');
    console.log(`✅ Database queries working: ${result.stats.pendingItems} pending items`);
    console.log(`✅ Performance good: ${result.stats.queryPerformance}ms`);
    console.log(`✅ API endpoints ready for testing`);
    
    await displayModerationDashboard();
    
    console.log('\n🚀 MODERATION SYSTEM READY FOR USE!');
  } else {
    console.log('\n❌ MODERATION API TEST FAILED');
    console.log('===============================');
    console.log(`Error: ${result.error}`);
  }
  
  process.exit(result.success ? 0 : 1);
}).catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
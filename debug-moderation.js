// Real-time debugging script for moderation issues
// Run this with: node debug-moderation.js

async function debugModerationIssues() {
  console.log('🐛 Debugging Moderation Issues...\n');

  const baseUrl = 'http://localhost:9003';

  try {
    // 1. Test GET moderation queue without auth
    console.log('1. Testing GET /api/moderation/queue without auth...');
    const response1 = await fetch(`${baseUrl}/api/moderation/queue`);
    const data1 = await response1.json();
    
    console.log(`   Status: ${response1.status}`);
    console.log(`   Response:`, data1);
    
    if (response1.status === 403) {
      console.log('   ✅ Correctly rejects unauthenticated requests');
    }

    // 2. Test with mock admin token (this will likely fail, but shows the structure)
    console.log('\n2. Testing moderation queue structure...');
    
    // Test the review endpoint structure
    console.log('\n3. Testing PUT /api/moderation/queue/[itemId] structure...');
    const mockItemId = 'test-item-123';
    const response2 = await fetch(`${baseUrl}/api/moderation/queue/${mockItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'approve',
        reviewNotes: 'Test approval'
      })
    });
    
    const data2 = await response2.json();
    console.log(`   Status: ${response2.status}`);
    console.log(`   Response:`, data2);

    // 3. Check if the API routes are properly configured
    console.log('\n4. Testing route accessibility...');
    
    const routes = [
      '/api/moderation/queue',
      '/api/moderation/queue/test123'  // This should exist as a dynamic route
    ];
    
    for (const route of routes) {
      try {
        const resp = await fetch(`${baseUrl}${route}`);
        console.log(`   ${route}: ${resp.status} ${resp.statusText}`);
        
        if (resp.status === 404) {
          console.log(`   ❌ Route ${route} not found - check route configuration`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to reach ${route}: ${error.message}`);
      }
    }

    // 4. Test data structure expectations
    console.log('\n5. Testing data structure expectations...');
    
    // Simulate the data structure that should be returned
    const expectedStructure = {
      success: true,
      data: [
        {
          id: "item-123",
          contentType: "place",
          contentId: "place-456",
          submittedBy: "user-789",
          submittedAt: "2024-01-01T00:00:00Z",
          status: "pending",
          priority: "medium",
          contentDetails: {
            name: "Test Place",
            description: "Description",
            region: "bac-bo"
          },
          submitter: {
            id: "user-789",
            fullName: "Test User",
            role: "contributor"
          }
        }
      ]
    };
    
    console.log('   Expected API response structure:', JSON.stringify(expectedStructure, null, 2));

    // 5. Common error scenarios
    console.log('\n6. Common error scenarios to check:');
    console.log('   - Firebase Admin SDK not initialized');
    console.log('   - Authentication middleware returning wrong format');  
    console.log('   - Missing moderation queue entries');
    console.log('   - Incorrect data mapping in hooks');
    console.log('   - Async/await issues in API routes');

    // 6. Check if server is actually running
    console.log('\n7. Checking server connectivity...');
    try {
      const healthCheck = await fetch(`${baseUrl}/api/auth/me`);
      console.log(`   Server health check: ${healthCheck.status}`);
      
      if (healthCheck.ok) {
        console.log('   ✅ Server is running and responding');
      } else {
        console.log('   ⚠️  Server responding but may have issues');
      }
    } catch (error) {
      console.log(`   ❌ Cannot connect to server: ${error.message}`);
      console.log('   Make sure the server is running on port 9003');
    }

  } catch (error) {
    console.error('❌ Debug script error:', error.message);
  }

  console.log('\n📋 Debug Summary:');
  console.log('   1. Check server logs for specific error messages');
  console.log('   2. Verify Firebase Admin SDK initialization');
  console.log('   3. Test authentication token format');
  console.log('   4. Validate data mapping in useModerationQueue hook');
  console.log('   5. Check if moderation queue has actual data');
  console.log('   6. Verify API route file structure and exports');
}

// Run the debug
debugModerationIssues();
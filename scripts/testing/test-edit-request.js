// Test script to create a sample edit request
const { execSync } = require('child_process');

async function testEditWorkflow() {
  try {
    console.log('Creating a test edit request...');
    
    // Test the API endpoint to see what data is returned
    console.log('\n1. Testing API endpoint: /api/moderation/queue');
    try {
      const response = await fetch('http://localhost:9002/api/moderation/queue?status=pending', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Queue items found:', data.data?.length || 0);
        
        if (data.data && data.data.length > 0) {
          console.log('\nFirst item details:');
          const firstItem = data.data[0];
          console.log('- ID:', firstItem.id);
          console.log('- ItemType:', firstItem.itemType);
          console.log('- ContentType:', firstItem.contentType);
          console.log('- Status:', firstItem.status);
          console.log('- Has originalData:', !!firstItem.originalData);
          console.log('- Has editedData:', !!firstItem.editedData);
          console.log('- Content Details:', !!firstItem.contentDetails);
          
          if (firstItem.contentDetails) {
            console.log('  - Name:', firstItem.contentDetails.name);
            console.log('  - IsEditRequest:', firstItem.contentDetails.isEditRequest);
          }
        }
      } else {
        console.log('API error:', response.status, response.statusText);
      }
    } catch (apiError) {
      console.error('API test failed:', apiError.message);
    }
    
    // Test create edit draft endpoint
    console.log('\n2. Testing create edit draft flow...');
    console.log('First we need to find a published place...');
    
    try {
      const placesResponse = await fetch('http://localhost:9002/api/places?status=published', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (placesResponse.ok) {
        const placesData = await placesResponse.json();
        console.log('Published places found:', placesData.data?.length || 0);
        
        if (placesData.data && placesData.data.length > 0) {
          const firstPlace = placesData.data[0];
          console.log('Testing with place:', firstPlace.id, '-', firstPlace.name);
          
          // Create edit draft (requires authentication)
          console.log('Note: Creating edit draft requires authentication');
          console.log('You can test this manually by:');
          console.log(`1. Go to http://localhost:9002/contribute/my-drafts`);
          console.log(`2. Find a published place and click "Chỉnh sửa"`);
          console.log(`3. Make changes and submit for review`);
          console.log(`4. Check the moderation queue at http://localhost:9002/admin/moderation`);
        }
      }
    } catch (placesError) {
      console.error('Places API test failed:', placesError.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testEditWorkflow();
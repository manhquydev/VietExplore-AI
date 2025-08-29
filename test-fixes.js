// Quick script to test the API fixes
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:9002';

async function testFixes() {
  console.log('🔧 Testing API fixes...\n');
  
  try {
    // 1. Test moderation queue endpoint
    console.log('1. Testing moderation queue endpoint...');
    const response = await fetch(`${BASE_URL}/api/moderation/queue?limit=1`);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Success: Found ${data.data?.length || 0} items`);
    } else {
      console.log(`Error: ${response.status}`);
    }
    
    // 2. Test places endpoint
    console.log('\n2. Testing places endpoint...');
    const placesResponse = await fetch(`${BASE_URL}/api/places?limit=1`);
    console.log(`Status: ${placesResponse.status}`);
    
    if (placesResponse.ok) {
      const placesData = await placesResponse.json();
      console.log(`Success: Found ${placesData.data?.length || 0} places`);
    } else {
      console.log(`Error: ${placesResponse.status}`);
    }
    
    console.log('\n✅ Basic API connectivity test completed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nMake sure the dev server is running: npm run dev');
  }
}

testFixes();
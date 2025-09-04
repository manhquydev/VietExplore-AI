// Test script to debug review submission issue
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:9002';

// Test the review API endpoint directly
async function testReviewSubmission() {
  console.log('Testing review submission...');
  
  // First, let's try to hit the endpoint without auth to see what happens
  try {
    const response = await fetch(`${BASE_URL}/api/places/test-place-id/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: 5,
        content: 'Test review content',
        title: 'Test Title'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    
    let responseData;
    try {
      responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData, null, 2));
    } catch (jsonError) {
      console.log('Could not parse JSON response');
      const textResponse = await response.text();
      console.log('Response text:', textResponse);
    }
    
  } catch (error) {
    console.error('Error testing review submission:', error);
  }
}

// Test if we can reach the places endpoint
async function testPlacesEndpoint() {
  console.log('Testing places endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/places`);
    console.log('Places endpoint status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Found', data.data?.length || 0, 'places');
      if (data.data && data.data.length > 0) {
        console.log('First place ID:', data.data[0].id);
        return data.data[0].id;
      }
    }
  } catch (error) {
    console.error('Error testing places endpoint:', error);
  }
  
  return null;
}

async function main() {
  console.log('Starting review submission debug...');
  
  // First test if server is running
  try {
    const response = await fetch(BASE_URL);
    console.log('Server is running on', BASE_URL);
  } catch (error) {
    console.error('Server is not running on', BASE_URL);
    return;
  }
  
  // Test places endpoint first
  const placeId = await testPlacesEndpoint();
  
  // Test review submission
  await testReviewSubmission();
  
  if (placeId) {
    console.log('Testing with real place ID:', placeId);
    try {
      const response = await fetch(`${BASE_URL}/api/places/${placeId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: 5,
          content: 'Test review content with real place ID',
          title: 'Test Title'
        })
      });
      
      console.log('Real place test - Response status:', response.status);
      const responseText = await response.text();
      console.log('Real place test - Response:', responseText);
      
    } catch (error) {
      console.error('Error testing with real place ID:', error);
    }
  }
}

main();
// Script to test admin API endpoints directly
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin SDK
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

const auth = admin.auth();

async function testAdminAPI() {
  try {
    console.log('Testing admin API endpoints...');
    
    // Get the admin user we created
    const adminEmail = 'admin@dulichviet.com';
    const userRecord = await auth.getUserByEmail(adminEmail);
    console.log('Found admin user:', userRecord.uid);
    
    // Create a custom token for testing
    const customToken = await auth.createCustomToken(userRecord.uid);
    console.log('Created custom token for admin user');
    
    // Test the moderation queue endpoint
    console.log('\n--- Testing /api/moderation/queue ---');
    try {
      const response = await fetch('http://localhost:9002/api/moderation/queue?status=pending', {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.text();
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response body:', data);
      
      if (data) {
        try {
          const jsonData = JSON.parse(data);
          console.log('Parsed JSON:', jsonData);
        } catch (e) {
          console.log('Response is not valid JSON');
        }
      }
    } catch (error) {
      console.error('Error testing moderation queue:', error);
    }
    
    // Test the admin users endpoint
    console.log('\n--- Testing /api/admin/users ---');
    try {
      const response = await fetch('http://localhost:9002/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.text();
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response body:', data);
      
      if (data) {
        try {
          const jsonData = JSON.parse(data);
          console.log('Parsed JSON:', jsonData);
        } catch (e) {
          console.log('Response is not valid JSON');
        }
      }
    } catch (error) {
      console.error('Error testing admin users:', error);
    }
    
    console.log('\n--- API Test Complete ---');
    
  } catch (error) {
    console.error('Error in test script:', error);
  }
  
  process.exit(0);
}

// Run the test
console.log('Note: Make sure the dev server is running on localhost:9002');
console.log('Run: npm run dev\n');

setTimeout(() => {
  testAdminAPI();
}, 2000);
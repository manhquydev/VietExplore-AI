// For Node 18+, fetch is global, for older versions install node-fetch
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:9002';

async function debugAuth() {
  console.log('🔍 Debugging Authentication...\n');
  
  try {
    // 1. Create admin user
    console.log('1. Creating admin user...');
    const createAdminResponse = await fetch(`${BASE_URL}/api/admin/create-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'debug-admin@vietexplore.ai',
        password: 'admin123456',
        fullName: 'Debug Admin User'
      })
    });
    
    const createAdminResult = await createAdminResponse.json();
    console.log('Create admin result:', createAdminResult);
    
    // 2. Login and get token
    console.log('\n2. Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'debug-admin@vietexplore.ai',
        password: 'admin123456'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult);
    
    if (!loginResult.token) {
      throw new Error('No token received from login');
    }
    
    const token = loginResult.token;
    
    // 3. Check /me endpoint to verify token and role
    console.log('\n3. Checking current user with token...');
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const meResult = await meResponse.json();
    console.log('/api/auth/me result:', meResult);
    console.log('User role:', meResult.user?.role);
    
    // 4. Test admin API with token
    console.log('\n4. Testing admin API access...');
    const adminUsersResponse = await fetch(`${BASE_URL}/api/admin/users?limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Admin API Status:', adminUsersResponse.status);
    const adminUsersResult = await adminUsersResponse.json();
    console.log('Admin API result:', adminUsersResult);
    
    // 5. Test moderation API
    console.log('\n5. Testing moderation API access...');
    const moderationResponse = await fetch(`${BASE_URL}/api/moderation/queue?limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Moderation API Status:', moderationResponse.status);
    const moderationResult = await moderationResponse.json();
    console.log('Moderation API result:', moderationResult);
    
    // 6. Check token payload (basic decode - don't use in production)
    console.log('\n6. Token analysis...');
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('Token payload:', payload);
      } catch (e) {
        console.log('Could not decode token payload');
      }
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  }
}

debugAuth();
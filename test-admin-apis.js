const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

/**
 * Comprehensive Admin API Testing Script
 * Tests all admin-related endpoints with proper authentication and error handling
 */

const BASE_URL = 'http://localhost:9002';
const ADMIN_ENDPOINTS = [
  // User Management APIs
  {
    name: 'Admin Users List',
    method: 'GET',
    url: '/api/admin/users',
    description: 'List all users with filtering',
    requiredRole: 'admin',
    testVariations: [
      '?limit=10',
      '?role=contributor', 
      '?search=test',
      '?limit=5&offset=0'
    ]
  },
  {
    name: 'Admin User Role Change',
    method: 'PUT',
    url: '/api/admin/users/{userId}/role',
    description: 'Change user role (admin only)',
    requiredRole: 'admin',
    body: { newRole: 'contributor', reason: 'Test role change' }
  },
  {
    name: 'Admin Password Reset',
    method: 'POST',
    url: '/api/admin/users/reset-password',
    description: 'Send password reset email',
    requiredRole: 'admin',
    body: { email: 'test@example.com' }
  },

  // Place Management APIs
  {
    name: 'Admin Places List',
    method: 'GET',
    url: '/api/admin/places',
    description: 'List all places for admin',
    requiredRole: 'admin',
    testVariations: [
      '?status=published',
      '?limit=20',
      '?region=bac-bo'
    ]
  },
  {
    name: 'Admin Place Status Change',
    method: 'PATCH',
    url: '/api/admin/places/{placeId}/status',
    description: 'Change place status',
    requiredRole: 'admin',
    body: { status: 'published', reason: 'Test status change' }
  },

  // Moderation APIs
  {
    name: 'Moderation Queue',
    method: 'GET',
    url: '/api/moderation/queue',
    description: 'Get moderation queue items',
    requiredRole: 'moderator',
    testVariations: [
      '?status=pending',
      '?status=approved', 
      '?queueType=partner_queue',
      '?priority=high'
    ]
  },
  {
    name: 'Moderation Review Action',
    method: 'PUT',
    url: '/api/moderation/queue/{itemId}',
    description: 'Review moderation item',
    requiredRole: 'moderator',
    body: { action: 'approve', notes: 'Test approval' }
  },

  // Analytics APIs (if implemented)
  {
    name: 'Admin Analytics',
    method: 'GET',
    url: '/api/admin/analytics',
    description: 'Get admin dashboard analytics',
    requiredRole: 'admin',
    testVariations: [
      '?timeRange=30d',
      '?timeRange=7d'
    ]
  }
];

class AdminAPITester {
  constructor() {
    this.results = [];
    this.authTokens = {
      admin: null,
      moderator: null,
      user: null
    };
  }

  async setupAuth() {
    console.log('🔑 Setting up authentication tokens...\n');
    
    try {
      // Create test admin if not exists
      await this.createTestAdmin();
      
      // Login as admin
      this.authTokens.admin = await this.login('admin@vietexplore.ai', 'admin123');
      console.log('✅ Admin authentication successful');
      
      // Login as moderator (if exists)
      try {
        this.authTokens.moderator = await this.login('moderator@vietexplore.ai', 'mod123');
        console.log('✅ Moderator authentication successful');
      } catch (error) {
        console.log('⚠️  Moderator account not available');
      }
      
      console.log('');
    } catch (error) {
      console.error('❌ Authentication setup failed:', error.message);
      throw error;
    }
  }

  async createTestAdmin() {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@vietexplore.ai',
          password: 'admin123',
          fullName: 'Test Admin',
          confirmPassword: 'admin123'
        })
      });
      
      if (response.ok) {
        console.log('✅ Test admin account created/verified');
      }
    } catch (error) {
      console.log('ℹ️  Admin account may already exist');
    }
  }

  async login(email, password) {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed for ${email}: ${response.status}`);
    }
    
    const data = await response.json();
    return data.token;
  }

  async testEndpoint(endpoint) {
    const results = [];
    const token = this.authTokens[endpoint.requiredRole] || this.authTokens.admin;
    
    if (!token) {
      return [{
        ...endpoint,
        status: 'SKIPPED',
        error: `No ${endpoint.requiredRole} token available`,
        responseTime: 0
      }];
    }

    // Test main endpoint
    const mainResult = await this.makeRequest(endpoint, token);
    results.push(mainResult);

    // Test variations if available
    if (endpoint.testVariations) {
      for (const variation of endpoint.testVariations) {
        const variationEndpoint = {
          ...endpoint,
          name: `${endpoint.name} ${variation}`,
          url: endpoint.url + variation
        };
        const variationResult = await this.makeRequest(variationEndpoint, token);
        results.push(variationResult);
      }
    }

    return results;
  }

  async makeRequest(endpoint, token, replaceIds = true) {
    const startTime = Date.now();
    
    try {
      let url = endpoint.url;
      
      // Replace placeholder IDs with actual IDs if needed
      if (replaceIds && url.includes('{')) {
        url = await this.replaceIds(url);
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const options = {
        method: endpoint.method,
        headers
      };

      if (endpoint.body && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(`${BASE_URL}${url}`, options);
      const responseTime = Date.now() - startTime;
      const data = await response.json().catch(() => null);

      return {
        ...endpoint,
        url,
        status: response.ok ? 'PASS' : 'FAIL',
        statusCode: response.status,
        responseTime,
        data: response.ok ? 'Success' : data?.error || 'Unknown error',
        dataSize: data ? JSON.stringify(data).length : 0
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        ...endpoint,
        status: 'ERROR',
        statusCode: 0,
        responseTime,
        error: error.message
      };
    }
  }

  async replaceIds(url) {
    // Simple ID replacement logic - in real testing, you'd fetch actual IDs
    if (url.includes('{userId}')) {
      // Get first user ID from users endpoint
      try {
        const token = this.authTokens.admin;
        const response = await fetch(`${BASE_URL}/api/admin/users?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          url = url.replace('{userId}', data.data[0].id);
        }
      } catch (error) {
        url = url.replace('{userId}', 'test-user-id');
      }
    }

    if (url.includes('{placeId}')) {
      url = url.replace('{placeId}', 'test-place-id');
    }

    if (url.includes('{itemId}')) {
      // Get first moderation item
      try {
        const token = this.authTokens.admin;
        const response = await fetch(`${BASE_URL}/api/moderation/queue?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          url = url.replace('{itemId}', data.data[0].id);
        }
      } catch (error) {
        url = url.replace('{itemId}', 'test-item-id');
      }
    }

    return url;
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive admin API tests...\n');
    
    const startTime = Date.now();
    
    for (const endpoint of ADMIN_ENDPOINTS) {
      console.log(`Testing: ${endpoint.name}`);
      const results = await this.testEndpoint(endpoint);
      this.results.push(...results);
      
      // Short delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const totalTime = Date.now() - startTime;
    this.generateReport(totalTime);
  }

  generateReport(totalTime) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ADMIN API TEST RESULTS');
    console.log('='.repeat(80));
    
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'FAIL').length,
      errors: this.results.filter(r => r.status === 'ERROR').length,
      skipped: this.results.filter(r => r.status === 'SKIPPED').length,
    };

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed}`);
    console.log(`   ❌ Failed: ${summary.failed}`);
    console.log(`   🔥 Errors: ${summary.errors}`);
    console.log(`   ⏭️  Skipped: ${summary.skipped}`);
    console.log(`   ⏱️  Total Time: ${totalTime}ms`);
    console.log(`   💯 Success Rate: ${((summary.passed / (summary.total - summary.skipped)) * 100).toFixed(1)}%`);

    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    console.log('-'.repeat(120));
    console.log('STATUS'.padEnd(8) + 'CODE'.padEnd(6) + 'TIME'.padEnd(8) + 'ENDPOINT'.padEnd(50) + 'RESULT');
    console.log('-'.repeat(120));

    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅ PASS' :
                    result.status === 'FAIL' ? '❌ FAIL' :
                    result.status === 'ERROR' ? '🔥 ERR ' : '⏭️ SKIP';
      
      const code = result.statusCode ? result.statusCode.toString() : 'N/A';
      const time = `${result.responseTime}ms`;
      const endpoint = `${result.method} ${result.url}`.substring(0, 48);
      const resultMsg = result.error || result.data || 'N/A';
      
      console.log(
        status.padEnd(8) + 
        code.padEnd(6) + 
        time.padEnd(8) + 
        endpoint.padEnd(50) + 
        resultMsg.toString().substring(0, 40)
      );
    });

    // Failed tests detail
    const failedTests = this.results.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    if (failedTests.length > 0) {
      console.log('\n🔍 FAILED TESTS DETAIL:');
      failedTests.forEach(test => {
        console.log(`\n❌ ${test.name}`);
        console.log(`   URL: ${test.method} ${test.url}`);
        console.log(`   Error: ${test.error || test.data}`);
        console.log(`   Status Code: ${test.statusCode}`);
      });
    }

    // Performance insights
    const avgResponseTime = this.results
      .filter(r => r.responseTime > 0)
      .reduce((sum, r) => sum + r.responseTime, 0) / this.results.length;
    
    const slowTests = this.results
      .filter(r => r.responseTime > 1000)
      .sort((a, b) => b.responseTime - a.responseTime);

    console.log(`\n⚡ PERFORMANCE:`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    
    if (slowTests.length > 0) {
      console.log(`   Slow Tests (>1000ms):`);
      slowTests.forEach(test => {
        console.log(`     - ${test.name}: ${test.responseTime}ms`);
      });
    }

    console.log('\n' + '='.repeat(80));
    
    // Return summary for programmatic use
    return {
      ...summary,
      totalTime,
      avgResponseTime,
      successRate: (summary.passed / (summary.total - summary.skipped)) * 100
    };
  }
}

async function main() {
  try {
    // Check if dev server is running
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`);
    } catch (error) {
      console.error('❌ Dev server not running. Please run: npm run dev');
      process.exit(1);
    }

    const tester = new AdminAPITester();
    await tester.setupAuth();
    const results = await tester.runAllTests();
    
    // Exit with error code if tests failed
    if (results.failed > 0 || results.errors > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AdminAPITester;
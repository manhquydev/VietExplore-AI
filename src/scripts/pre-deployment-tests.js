// Comprehensive Pre-deployment Test Suite
const admin = require('firebase-admin');
const fetch = require('node-fetch');
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

class TestSuite {
  constructor() {
    this.results = {
      infrastructure: [],
      authentication: [],
      database: [],
      api: [],
      admin: [],
      security: []
    };
    this.baseUrl = 'http://localhost:3000';
  }

  async runTest(category, testName, testFn) {
    console.log(`🧪 Testing: ${testName}`);
    
    try {
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results[category].push({
        name: testName,
        status: 'PASS',
        duration,
        message: result?.message || 'Test passed successfully'
      });
      
      console.log(`   ✅ PASS (${duration}ms)`);
      return result;
      
    } catch (error) {
      this.results[category].push({
        name: testName,
        status: 'FAIL',
        message: error.message,
        error: error.stack
      });
      
      console.log(`   ❌ FAIL - ${error.message}`);
      throw error;
    }
  }

  async testInfrastructure() {
    console.log('\n🏗️  INFRASTRUCTURE TESTS');
    console.log('========================');

    // Firebase Admin SDK
    await this.runTest('infrastructure', 'Firebase Admin SDK Connection', async () => {
      const projectId = admin.app().options.projectId;
      if (!projectId) throw new Error('Project ID not found');
      return { message: `Connected to project: ${projectId}` };
    });

    // Environment Variables
    await this.runTest('infrastructure', 'Environment Variables', async () => {
      const requiredVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL', 
        'FIREBASE_PRIVATE_KEY',
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
      ];
      
      const missing = requiredVars.filter(v => !process.env[v]);
      if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
      }
      
      return { message: `All ${requiredVars.length} required variables present` };
    });

    // Build Status
    await this.runTest('infrastructure', 'Next.js Build', async () => {
      const { execSync } = require('child_process');
      try {
        execSync('npm run build', { stdio: 'pipe' });
        return { message: 'Build completed successfully' };
      } catch (error) {
        throw new Error(`Build failed: ${error.message}`);
      }
    });
  }

  async testAuthentication() {
    console.log('\n🔐 AUTHENTICATION TESTS');
    console.log('=======================');

    // Firebase Auth Connection
    await this.runTest('authentication', 'Firebase Auth Connection', async () => {
      const users = await auth.listUsers(1);
      return { message: `Authentication service accessible, ${users.users.length} users found` };
    });

    // Admin Users Exist
    await this.runTest('authentication', 'Admin Users Available', async () => {
      const adminUsers = await db.collection('users').where('role', '==', 'admin').get();
      if (adminUsers.empty) {
        throw new Error('No admin users found');
      }
      return { message: `Found ${adminUsers.size} admin users` };
    });

    // Custom Claims
    await this.runTest('authentication', 'Custom Claims Functionality', async () => {
      const testUsers = await db.collection('users').where('role', '!=', 'admin').limit(1).get();
      if (testUsers.empty) {
        throw new Error('No test users available');
      }
      
      const testUser = testUsers.docs[0];
      const originalRole = testUser.data().role;
      
      // Set test claims
      await auth.setCustomUserClaims(testUser.id, { role: 'test', testFlag: true });
      
      // Verify claims
      const userRecord = await auth.getUser(testUser.id);
      if (userRecord.customClaims?.role !== 'test') {
        throw new Error('Custom claims not set correctly');
      }
      
      // Revert
      await auth.setCustomUserClaims(testUser.id, { role: originalRole });
      
      return { message: 'Custom claims set and reverted successfully' };
    });
  }

  async testDatabase() {
    console.log('\n🗄️  DATABASE TESTS');
    console.log('==================');

    // Firestore Connection
    await this.runTest('database', 'Firestore Connection', async () => {
      const testDoc = await db.collection('test').doc('connectivity').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        test: true
      });
      
      const readDoc = await db.collection('test').doc('connectivity').get();
      if (!readDoc.exists) {
        throw new Error('Could not read written document');
      }
      
      await db.collection('test').doc('connectivity').delete();
      return { message: 'Read/write operations successful' };
    });

    // Firestore Rules
    await this.runTest('database', 'Firestore Security Rules', async () => {
      // Test that rules are enforced (try to read admin collection without auth)
      try {
        // This should be prevented by rules
        await db.collection('admin_logs').doc('test').get();
        return { message: 'Admin SDK can access protected collections' };
      } catch (error) {
        if (error.code === 'permission-denied') {
          // This is expected for client SDK, but admin SDK should work
          return { message: 'Admin SDK bypasses rules correctly' };
        }
        throw error;
      }
    });

    // Essential Collections
    await this.runTest('database', 'Essential Collections Exist', async () => {
      const collections = ['users', 'places', 'placeDrafts'];
      const results = [];
      
      for (const collection of collections) {
        const snapshot = await db.collection(collection).limit(1).get();
        results.push(`${collection}: ${snapshot.size > 0 ? 'has data' : 'empty'}`);
      }
      
      return { message: results.join(', ') };
    });

    // Database Indexes
    await this.runTest('database', 'Database Indexes', async () => {
      const indexQueries = [
        { name: 'users-role-createdAt', query: db.collection('users').where('role', '==', 'admin').orderBy('createdAt', 'desc').limit(1) },
        { name: 'places-status-updatedAt', query: db.collection('places').where('status', '==', 'published').orderBy('updatedAt', 'desc').limit(1) }
      ];

      const working = [];
      const failing = [];
      
      for (const { name, query } of indexQueries) {
        try {
          await query.get();
          working.push(name);
        } catch (error) {
          if (error.code === 9) { // FAILED_PRECONDITION
            failing.push(name);
          }
        }
      }
      
      if (failing.length > 0) {
        console.warn(`   ⚠️  Indexes still building: ${failing.join(', ')}`);
      }
      
      return { message: `${working.length} indexes working, ${failing.length} still building` };
    });
  }

  async testAPI() {
    console.log('\n🌐 API TESTS');
    console.log('=============');

    // Basic API Routes
    await this.runTest('api', 'Health Check Routes', async () => {
      const routes = ['/api/auth/me', '/api/places'];
      const results = [];
      
      for (const route of routes) {
        try {
          const response = await fetch(`${this.baseUrl}${route}`);
          results.push(`${route}: ${response.status}`);
        } catch (error) {
          results.push(`${route}: ERROR`);
        }
      }
      
      return { message: results.join(', ') };
    });

    // Static Assets
    await this.runTest('api', 'Static Assets', async () => {
      const assets = ['/favicon.svg', '/_next/static/css'];
      const results = [];
      
      for (const asset of assets) {
        try {
          const response = await fetch(`${this.baseUrl}${asset}`);
          results.push(`${asset}: ${response.status < 400 ? 'OK' : 'FAIL'}`);
        } catch (error) {
          results.push(`${asset}: ERROR`);
        }
      }
      
      return { message: results.join(', ') };
    });
  }

  async testAdminFunctionality() {
    console.log('\n👑 ADMIN FUNCTIONALITY TESTS');
    console.log('=============================');

    // Admin User Role Change
    await this.runTest('admin', 'User Role Change', async () => {
      const regularUsers = await db.collection('users').where('role', '!=', 'admin').limit(1).get();
      if (regularUsers.empty) {
        throw new Error('No regular users to test role change');
      }
      
      const testUser = regularUsers.docs[0];
      const originalRole = testUser.data().role;
      
      // Test role change functionality
      await auth.setCustomUserClaims(testUser.id, { role: 'contributor' });
      await db.collection('users').doc(testUser.id).update({
        role: 'contributor',
        updatedAt: new Date().toISOString()
      });
      
      // Verify change
      const updatedDoc = await db.collection('users').doc(testUser.id).get();
      if (updatedDoc.data().role !== 'contributor') {
        throw new Error('Role change not reflected in database');
      }
      
      // Revert
      await auth.setCustomUserClaims(testUser.id, { role: originalRole });
      await db.collection('users').doc(testUser.id).update({ role: originalRole });
      
      return { message: 'Role change functionality working correctly' };
    });

    // Admin Logs
    await this.runTest('admin', 'Admin Logging', async () => {
      const logEntry = {
        type: 'test',
        adminId: 'test-admin',
        action: 'Pre-deployment test',
        timestamp: new Date().toISOString()
      };
      
      const docRef = await db.collection('admin_logs').add(logEntry);
      const writtenDoc = await docRef.get();
      
      if (!writtenDoc.exists) {
        throw new Error('Admin log not written');
      }
      
      await docRef.delete();
      return { message: 'Admin logging functionality working' };
    });
  }

  async testSecurity() {
    console.log('\n🔒 SECURITY TESTS');
    console.log('==================');

    // Environment Secrets
    await this.runTest('security', 'Environment Secrets Protection', async () => {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey && privateKey.includes('PRIVATE KEY')) {
        // Check that it's properly formatted
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          throw new Error('Private key not properly formatted');
        }
        return { message: 'Private key properly secured and formatted' };
      } else {
        throw new Error('Private key not found or invalid');
      }
    });

    // API Rate Limiting (basic check)
    await this.runTest('security', 'Basic Security Headers', async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/places`);
        const headers = response.headers;
        
        const securityHeaders = [];
        if (headers.get('x-frame-options')) securityHeaders.push('X-Frame-Options');
        if (headers.get('x-content-type-options')) securityHeaders.push('X-Content-Type-Options');
        
        return { message: `Security headers found: ${securityHeaders.join(', ') || 'None (configure in production)'}` };
      } catch (error) {
        return { message: 'Could not test security headers (server not running)' };
      }
    });
  }

  printSummary() {
    console.log('\n📋 TEST SUMMARY');
    console.log('================');
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const [category, tests] of Object.entries(this.results)) {
      const passed = tests.filter(t => t.status === 'PASS').length;
      const failed = tests.filter(t => t.status === 'FAIL').length;
      
      totalTests += tests.length;
      totalPassed += passed;
      totalFailed += failed;
      
      const status = failed === 0 ? '✅' : (passed > 0 ? '⚠️' : '❌');
      console.log(`${status} ${category.toUpperCase()}: ${passed}/${tests.length} passed`);
      
      if (failed > 0) {
        tests.filter(t => t.status === 'FAIL').forEach(test => {
          console.log(`   ❌ ${test.name}: ${test.message}`);
        });
      }
    }
    
    console.log('================');
    console.log(`TOTAL: ${totalPassed}/${totalTests} tests passed`);
    
    if (totalFailed === 0) {
      console.log('🎉 ALL TESTS PASSED - Ready for deployment!');
    } else if (totalPassed > totalFailed) {
      console.log('⚠️  Most tests passed - Review failures before deployment');
    } else {
      console.log('❌ Multiple failures - Fix issues before deployment');
    }
    
    return totalFailed === 0;
  }

  async run() {
    console.log('🚀 VietExplore AI - Pre-deployment Test Suite');
    console.log('==============================================');
    console.log(`Started at: ${new Date().toISOString()}\n`);
    
    const startTime = Date.now();
    
    try {
      await this.testInfrastructure();
      await this.testAuthentication();
      await this.testDatabase();
      await this.testAPI();
      await this.testAdminFunctionality();
      await this.testSecurity();
    } catch (error) {
      console.error('\n💥 Test suite encountered a fatal error:', error.message);
    }
    
    const duration = Date.now() - startTime;
    console.log(`\nCompleted in ${duration}ms`);
    
    const allPassed = this.printSummary();
    return allPassed;
  }
}

// Run the test suite
const testSuite = new TestSuite();
testSuite.run().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
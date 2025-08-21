#!/usr/bin/env node
// scripts/deploy-backend.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 VietExplore-AI Backend Deployment Script\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI detected');
} catch (error) {
  console.error('❌ Firebase CLI not found. Please install: npm install -g firebase-tools');
  process.exit(1);
}

// Check if logged in to Firebase
try {
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ Firebase authentication verified');
} catch (error) {
  console.error('❌ Not logged in to Firebase. Please run: firebase login');
  process.exit(1);
}

// Build and test functions
console.log('\n📦 Building Cloud Functions...');
try {
  execSync('cd functions && npm run build', { stdio: 'inherit' });
  console.log('✅ Functions built successfully');
} catch (error) {
  console.error('❌ Functions build failed');
  process.exit(1);
}

// Run tests
console.log('\n🧪 Running validation tests...');
try {
  execSync('cd functions && npm test -- --testPathPattern=helpers.test.ts', { stdio: 'inherit' });
  console.log('✅ Validation tests passed');
} catch (error) {
  console.warn('⚠️ Some tests failed, but continuing deployment...');
}

// Deploy functions
console.log('\n🚀 Deploying Cloud Functions...');
try {
  execSync('firebase deploy --only functions', { stdio: 'inherit' });
  console.log('✅ Functions deployed successfully');
} catch (error) {
  console.error('❌ Functions deployment failed');
  process.exit(1);
}

// Deploy Firestore rules
console.log('\n🔐 Deploying Firestore Security Rules...');
try {
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('✅ Security Rules deployed successfully');
} catch (error) {
  console.error('❌ Security Rules deployment failed');
  process.exit(1);
}

// Deploy Firestore indexes
console.log('\n📊 Deploying Firestore Indexes...');
try {
  execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
  console.log('✅ Indexes deployed successfully');
} catch (error) {
  console.warn('⚠️ Indexes deployment failed, continuing...');
}

console.log('\n🎉 Backend deployment completed!');
console.log('\n📋 Next steps:');
console.log('1. Configure Firebase Console settings (Auth providers, App Check)');
console.log('2. Set up environment variables for frontend');
console.log('3. Test authentication flow in development');
console.log('4. Set up monitoring and alerts');

console.log('\n📚 Documentation: docs/BACKEND_DEPLOYMENT_GUIDE.md');



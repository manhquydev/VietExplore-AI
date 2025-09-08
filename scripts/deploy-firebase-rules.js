#!/usr/bin/env node

/**
 * Deploy Firebase Security Rules and Indexes
 * This script validates and deploys Firestore rules and indexes
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const FIREBASE_PROJECT = process.env.FIREBASE_PROJECT || 'default'

console.log('🚀 Starting Firebase Rules and Indexes Deployment...')
console.log(`📝 Project: ${FIREBASE_PROJECT}`)

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'ignore' })
} catch (error) {
  console.error('❌ Firebase CLI is not installed. Please install it first:')
  console.error('   npm install -g firebase-tools')
  process.exit(1)
}

// Check if user is logged in
try {
  execSync('firebase projects:list', { stdio: 'ignore' })
} catch (error) {
  console.error('❌ Not logged into Firebase. Please login first:')
  console.error('   firebase login')
  process.exit(1)
}

// Validate files exist
const rulesPath = path.join(__dirname, '..', 'firestore.rules')
const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json')

if (!fs.existsSync(rulesPath)) {
  console.error('❌ firestore.rules not found')
  process.exit(1)
}

if (!fs.existsSync(indexesPath)) {
  console.error('❌ firestore.indexes.json not found')
  process.exit(1)
}

console.log('✅ Files validated')

// Deploy rules
console.log('📋 Deploying Firestore Security Rules...')
try {
  execSync(`firebase deploy --only firestore:rules --project ${FIREBASE_PROJECT}`, {
    stdio: 'inherit'
  })
  console.log('✅ Security Rules deployed successfully')
} catch (error) {
  console.error('❌ Failed to deploy security rules')
  console.error(error.message)
  process.exit(1)
}

// Deploy indexes
console.log('📊 Deploying Firestore Indexes...')
try {
  execSync(`firebase deploy --only firestore:indexes --project ${FIREBASE_PROJECT}`, {
    stdio: 'inherit'
  })
  console.log('✅ Indexes deployed successfully')
  console.log('⏰ Note: Index creation may take several minutes to complete')
} catch (error) {
  console.error('❌ Failed to deploy indexes')
  console.error(error.message)
  process.exit(1)
}

console.log('')
console.log('🎉 Firebase deployment completed successfully!')
console.log('')
console.log('📋 Next steps:')
console.log('   1. Wait for indexes to finish building (check Firebase console)')
console.log('   2. Test API endpoints with authentication')
console.log('   3. Verify security rules are working correctly')
console.log('')

// Test basic rules if in development
if (process.env.NODE_ENV === 'development' || process.argv.includes('--test')) {
  console.log('🧪 Testing basic security rules...')
  
  try {
    // This would require Firebase emulator setup
    console.log('⚠️  Manual testing required:')
    console.log('   - Test authenticated user can create itineraries')
    console.log('   - Test unauthenticated users cannot access private data')
    console.log('   - Test role-based permissions are enforced')
  } catch (error) {
    console.log('ℹ️  Automated testing skipped (requires emulator setup)')
  }
}
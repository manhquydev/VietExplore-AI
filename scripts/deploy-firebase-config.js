// Script to deploy Firebase configuration (rules and indexes)
const { execSync } = require('child_process');
const path = require('path');

console.log('🔥 Deploying Firebase Configuration...\n');

try {
  // Change to project directory
  process.chdir(path.join(__dirname, '..'));
  
  console.log('1. Checking Firebase CLI...');
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI found');
  } catch (error) {
    console.error('❌ Firebase CLI not found. Please install: npm install -g firebase-tools');
    process.exit(1);
  }
  
  console.log('\n2. Checking Firebase login...');
  try {
    execSync('firebase auth:list', { stdio: 'pipe' });
    console.log('✅ Firebase authenticated');
  } catch (error) {
    console.error('❌ Not authenticated. Please run: firebase login');
    process.exit(1);
  }
  
  console.log('\n3. Deploying Firestore rules...');
  try {
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('✅ Firestore rules deployed');
  } catch (error) {
    console.error('❌ Failed to deploy rules:', error.message);
    process.exit(1);
  }
  
  console.log('\n4. Deploying Firestore indexes...');
  try {
    execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
    console.log('✅ Firestore indexes deployed');
  } catch (error) {
    console.error('❌ Failed to deploy indexes:', error.message);
    process.exit(1);
  }
  
  console.log('\n5. Deploying Storage rules...');
  try {
    execSync('firebase deploy --only storage', { stdio: 'inherit' });
    console.log('✅ Storage rules deployed');
  } catch (error) {
    console.error('❌ Failed to deploy storage rules:', error.message);
    process.exit(1);
  }
  
  console.log('\n🎉 Firebase configuration deployed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Wait 1-2 minutes for indexes to build');
  console.log('2. Restart your development server: npm run dev');
  console.log('3. Test admin dashboard functionality');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
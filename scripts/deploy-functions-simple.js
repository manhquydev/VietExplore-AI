// scripts/deploy-functions-simple.js - Simple Functions Deployment
const { execSync } = require('child_process');

console.log('🚀 Deploying VietExplore AI Functions (Simple Mode)');

try {
  // Deploy only essential functions without storage triggers
  console.log('📦 Building functions...');
  execSync('npm run build', { stdio: 'inherit', cwd: './functions' });
  
  console.log('🚀 Deploying core functions...');
  
  // Deploy specific functions without storage dependencies
  const functionsToDeployFirst = [
    'assignUserRole',
    'getAllUsers', 
    'createFirstAdmin',
    'checkSetupStatus',
    'grantRole',
    'onUserDocumentCreate',
    'beforeCreate',
    'beforeSignIn'
  ];
  
  const deployCommand = `firebase deploy --only functions:${functionsToDeployFirst.join(',')}`;
  console.log(`Running: ${deployCommand}`);
  
  execSync(deployCommand, { stdio: 'inherit' });
  
  console.log('✅ Core functions deployed successfully!');
  console.log('📝 Next steps:');
  console.log('   1. Configure storage bucket region in Firebase Console');
  console.log('   2. Deploy remaining functions with storage triggers');
  console.log('   3. Test admin access và user management');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('💡 Try manual deployment:');
  console.log('   1. Go to Firebase Console → Functions');
  console.log('   2. Deploy functions manually');
  console.log('   3. Or fix storage bucket region first');
  process.exit(1);
}

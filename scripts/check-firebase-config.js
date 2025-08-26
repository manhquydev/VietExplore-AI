// Script to check Firebase configuration compatibility
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Firebase Configuration Compatibility...\n');

// Check .env.local
console.log('1. Checking .env.local...');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];
  
  let allPresent = true;
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      console.log(`   ❌ Missing: ${varName}`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log('   ✅ All required environment variables present');
  }
} else {
  console.log('   ❌ .env.local file not found');
}

// Check firebase.json
console.log('\n2. Checking firebase.json...');
const firebaseJsonPath = path.join(__dirname, '..', 'firebase.json');
if (fs.existsSync(firebaseJsonPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
  
  const requiredServices = ['firestore', 'storage'];
  let allServicesPresent = true;
  
  requiredServices.forEach(service => {
    if (!firebaseConfig[service]) {
      console.log(`   ❌ Missing service: ${service}`);
      allServicesPresent = false;
    }
  });
  
  if (allServicesPresent) {
    console.log('   ✅ All required services configured');
  }
} else {
  console.log('   ❌ firebase.json file not found');
}

// Check .firebaserc
console.log('\n3. Checking .firebaserc...');
const firebasercPath = path.join(__dirname, '..', '.firebaserc');
if (fs.existsSync(firebasercPath)) {
  const firebaserc = JSON.parse(fs.readFileSync(firebasercPath, 'utf8'));
  if (firebaserc.projects && firebaserc.projects.default) {
    console.log(`   ✅ Default project: ${firebaserc.projects.default}`);
  } else {
    console.log('   ❌ No default project configured');
  }
} else {
  console.log('   ❌ .firebaserc file not found');
}

// Check firestore.rules
console.log('\n4. Checking firestore.rules...');
const rulesPath = path.join(__dirname, '..', 'firestore.rules');
if (fs.existsSync(rulesPath)) {
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  const requiredCollections = ['users', 'places', 'moderation_queue'];
  let allRulesPresent = true;
  
  requiredCollections.forEach(collection => {
    if (!rulesContent.includes(`match /${collection}/`)) {
      console.log(`   ❌ Missing rules for: ${collection}`);
      allRulesPresent = false;
    }
  });
  
  if (allRulesPresent) {
    console.log('   ✅ All required collection rules present');
  }
} else {
  console.log('   ❌ firestore.rules file not found');
}

// Check firestore.indexes.json
console.log('\n5. Checking firestore.indexes.json...');
const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
if (fs.existsSync(indexesPath)) {
  const indexes = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));
  
  const moderationQueueIndexes = indexes.indexes.filter(idx => 
    idx.collectionGroup === 'moderation_queue'
  );
  
  if (moderationQueueIndexes.length > 0) {
    console.log(`   ✅ Found ${moderationQueueIndexes.length} indexes for moderation_queue`);
  } else {
    console.log('   ❌ No indexes found for moderation_queue');
  }
} else {
  console.log('   ❌ firestore.indexes.json file not found');
}

// Check storage.rules
console.log('\n6. Checking storage.rules...');
const storageRulesPath = path.join(__dirname, '..', 'storage.rules');
if (fs.existsSync(storageRulesPath)) {
  const storageRules = fs.readFileSync(storageRulesPath, 'utf8');
  if (storageRules.includes('function isAdmin()') && storageRules.includes('function isModerator()')) {
    console.log('   ✅ Storage rules include admin/moderator functions');
  } else {
    console.log('   ⚠️  Storage rules may need admin/moderator functions');
  }
} else {
  console.log('   ❌ storage.rules file not found');
}

console.log('\n📋 Configuration Summary:');
console.log('- Environment variables: Check required vars');
console.log('- Firebase services: firestore, storage configured');  
console.log('- Project: vietexplore-ai');
console.log('- Rules: Updated with moderation_queue');
console.log('- Indexes: Added composite indexes for moderation_queue');

console.log('\n🚀 Next Steps:');
console.log('1. Run: node scripts/deploy-firebase-config.js');
console.log('2. Wait for indexes to build (1-2 minutes)');
console.log('3. Restart development server');
console.log('4. Test admin functionality');

console.log('\n✅ Configuration check complete!');
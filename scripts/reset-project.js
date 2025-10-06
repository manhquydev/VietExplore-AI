const { clearAllUsers } = require('./clear-all-users');
const { clearAllPlaces } = require('./clear-all-places');
const { createSingleAdmin } = require('./create-single-admin');

// Default admin configuration for reset
const defaultResetAdminConfig = {
  email: 'admin@vietexplore.ai',
  password: 'Du Lịch Việt2024!Reset',
  fullName: 'Du Lịch Việt Admin',
  username: 'admin'
};

async function resetProject(customAdminConfig = {}) {
  console.log('🔄 Du Lịch Việt AI - Project Reset');
  console.log('=================================');
  console.log('');
  console.log('⚠️  WARNING: This will COMPLETELY RESET the project!');
  console.log('⚠️  All data will be permanently deleted!');
  console.log('');
  
  try {
    const startTime = Date.now();
    
    // Step 1: Clear all places data
    console.log('📍 STEP 1: Clearing all places data...');
    console.log('────────────────────────────────────');
    await clearAllPlaces();
    console.log('✅ Places data cleared successfully\n');
    
    // Step 2: Clear all users data
    console.log('👥 STEP 2: Clearing all users data...');
    console.log('────────────────────────────────────');
    await clearAllUsers();
    console.log('✅ Users data cleared successfully\n');
    
    // Step 3: Create single admin user
    console.log('👤 STEP 3: Creating single admin user...');
    console.log('─────────────────────────────────────');
    const adminConfig = { ...defaultResetAdminConfig, ...customAdminConfig };
    const adminResult = await createSingleAdmin(adminConfig);
    console.log('✅ Admin user created successfully\n');
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('🎉 PROJECT RESET COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log('');
    console.log('🔑 Admin Login Details:');
    console.log(`   Email: ${adminResult.email}`);
    console.log(`   Password: ${adminResult.password}`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Open admin panel: http://localhost:9002/admin');
    console.log('   3. Login with the credentials above');
    console.log('   4. Optionally seed sample data if needed');
    console.log('');
    console.log('📝 Available seeding scripts:');
    console.log('   - node scripts/seed-places-vietnam.js --confirm');
    console.log('   - node scripts/seed-users.js --confirm');
    console.log('');
    
    return {
      success: true,
      duration,
      admin: adminResult
    };
    
  } catch (error) {
    console.error('❌ PROJECT RESET FAILED!');
    console.error('========================');
    console.error('Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure Firebase credentials are correct');
    console.log('   2. Check internet connection');
    console.log('   3. Verify Firebase project permissions');
    console.log('   4. Check if firebase-service-account.json exists');
    console.log('');
    
    throw error;
  }
}

// Function to reset only data (keep existing admin if needed)
async function resetDataOnly() {
  console.log('🗑️  Resetting data only (keeping users)...');
  
  try {
    await clearAllPlaces();
    console.log('✅ All places data cleared successfully');
    
    return { success: true, message: 'Data reset completed' };
  } catch (error) {
    console.error('❌ Data reset failed:', error);
    throw error;
  }
}

// Function to show current database status
async function showDatabaseStatus() {
  const admin = require('firebase-admin');
  const path = require('path');
  
  // Initialize Firebase Admin if not already initialized
  if (!admin.apps.length) {
    const dotenv = require('dotenv');
    dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
    
    const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket
    });
  }
  
  const db = admin.firestore();
  
  try {
    console.log('📊 Current Database Status:');
    console.log('==========================');
    
    // Count users
    const usersSnapshot = await db.collection('users').get();
    console.log(`👥 Users: ${usersSnapshot.size}`);
    
    // Count places
    const placesSnapshot = await db.collection('places').get();
    console.log(`📍 Places: ${placesSnapshot.size}`);
    
    // Count moderation queue
    const moderationSnapshot = await db.collection('moderation_queue').get();
    console.log(`⚖️  Moderation queue: ${moderationSnapshot.size}`);
    
    // Count moderation logs
    const logsSnapshot = await db.collection('moderation_logs').get();
    console.log(`📋 Moderation logs: ${logsSnapshot.size}`);
    
    // Show admin users
    const adminUsers = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.role === 'admin') {
        adminUsers.push({
          email: userData.email,
          fullName: userData.fullName,
          verified: userData.verified
        });
      }
    });
    
    console.log('');
    console.log('👑 Admin Users:');
    if (adminUsers.length === 0) {
      console.log('   ❌ No admin users found!');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.fullName} (${admin.email})`);
      });
    }
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Failed to get database status:', error.message);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    confirm: args.includes('--confirm'),
    dataOnly: args.includes('--data-only'),
    status: args.includes('--status'),
    customAdmin: {}
  };
  
  // Parse custom admin options
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      options.customAdmin.email = args[i + 1];
      i++;
    } else if (args[i] === '--password' && args[i + 1]) {
      options.customAdmin.password = args[i + 1];
      i++;
    } else if (args[i] === '--name' && args[i + 1]) {
      options.customAdmin.fullName = args[i + 1];
      i++;
    } else if (args[i] === '--username' && args[i + 1]) {
      options.customAdmin.username = args[i + 1];
      i++;
    }
  }
  
  return options;
}

// Run the script
if (require.main === module) {
  const options = parseArgs();
  
  if (options.status) {
    showDatabaseStatus()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    return;
  }
  
  if (!options.confirm) {
    console.log('🔄 Du Lịch Việt AI - Project Reset Tool');
    console.log('====================================');
    console.log('');
    console.log('This tool will help you reset your project to a clean state.');
    console.log('');
    console.log('Available options:');
    console.log('');
    console.log('📊 Check current status:');
    console.log('   node scripts/reset-project.js --status');
    console.log('');
    console.log('🗑️  Reset data only (keep users):');
    console.log('   node scripts/reset-project.js --data-only --confirm');
    console.log('');
    console.log('🔄 Full project reset (delete everything + create admin):');
    console.log('   node scripts/reset-project.js --confirm');
    console.log('');
    console.log('🔧 Full reset with custom admin:');
    console.log('   node scripts/reset-project.js \\');
    console.log('     --email admin@example.com \\');
    console.log('     --password MyPassword123 \\');
    console.log('     --name "Custom Admin" \\');
    console.log('     --confirm');
    console.log('');
    console.log('⚠️  WARNING: These operations cannot be undone!');
    console.log('');
    process.exit(0);
  }
  
  if (options.dataOnly) {
    resetDataOnly()
      .then(() => {
        console.log('✅ Data-only reset completed successfully');
        process.exit(0);
      })
      .catch(() => process.exit(1));
  } else {
    resetProject(options.customAdmin)
      .then(() => {
        console.log('✅ Full project reset completed successfully');
        process.exit(0);
      })
      .catch(() => process.exit(1));
  }
}

module.exports = {
  resetProject,
  resetDataOnly,
  showDatabaseStatus
};
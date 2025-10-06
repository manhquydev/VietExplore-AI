const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    // Try to get storage bucket from environment or use default pattern
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.log('📁 Make sure firebase-service-account.json exists in project root');
    process.exit(1);
  }
}

const db = admin.firestore();

// Default admin configuration
const defaultAdminConfig = {
  email: 'admin@vietexplore.ai',
  password: 'Du Lịch Việt2024!Admin',
  fullName: 'Du Lịch Việt Admin',
  username: 'admin'
};

async function createSingleAdmin(customConfig = {}) {
  try {
    // Merge custom config with defaults
    const adminConfig = { ...defaultAdminConfig, ...customConfig };
    
    console.log('👤 Creating single admin user...');
    console.log(`📧 Email: ${adminConfig.email}`);
    console.log(`👨‍💼 Name: ${adminConfig.fullName}`);
    
    // Create user in Firebase Auth
    console.log('🔐 Creating Firebase Auth user...');
    const userRecord = await admin.auth().createUser({
      email: adminConfig.email,
      password: adminConfig.password,
      displayName: adminConfig.fullName,
      emailVerified: true, // Auto-verify admin email
    });
    
    console.log(`✅ Created Firebase Auth user: ${userRecord.uid}`);
    
    // Create user document in Firestore
    console.log('📄 Creating Firestore user document...');
    const userData = {
      id: userRecord.uid,
      email: adminConfig.email,
      fullName: adminConfig.fullName,
      username: adminConfig.username,
      role: 'admin',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        bio: 'Administrator of Du Lịch Việt AI platform',
        location: 'Vietnam'
      },
      stats: {
        placesContributed: 0,
        itinerariesCreated: 0,
        helpfulVotes: 0,
        placesPublished: 0
      },
      permissions: [
        'all_permissions'
      ],
      disabled: false
    };
    
    await db.collection('users').doc(userRecord.uid).set(userData);
    console.log(`✅ Created Firestore user document`);
    
    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      verified: true
    });
    console.log(`✅ Set custom claims for admin role`);
    
    console.log('🎉 Single admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Email: ${adminConfig.email}`);
    console.log(`   - Password: ${adminConfig.password}`);
    console.log(`   - Full Name: ${adminConfig.fullName}`);
    console.log(`   - Username: ${adminConfig.username}`);
    console.log(`   - Role: admin`);
    console.log(`   - Verified: true`);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log(`   Email: ${adminConfig.email}`);
    console.log(`   Password: ${adminConfig.password}`);
    
    return {
      uid: userRecord.uid,
      email: adminConfig.email,
      password: adminConfig.password,
      fullName: adminConfig.fullName,
      username: adminConfig.username
    };
    
  } catch (error) {
    // Handle specific error cases
    if (error.code === 'auth/email-already-exists') {
      console.log('');
      console.log('⚠️  Admin user already exists!');
      console.log('   If you want to recreate the admin, first clear all users.');
      console.log('   Run: node scripts/clear-all-users.js --confirm');
      console.log('');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
    throw error;
  }
}

// Interactive function to get custom admin details
function getAdminConfigFromArgs() {
  const args = process.argv.slice(2);
  const config = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      config.email = args[i + 1];
      i++;
    } else if (args[i] === '--password' && args[i + 1]) {
      config.password = args[i + 1];
      i++;
    } else if (args[i] === '--name' && args[i + 1]) {
      config.fullName = args[i + 1];
      i++;
    } else if (args[i] === '--username' && args[i + 1]) {
      config.username = args[i + 1];
      i++;
    }
  }
  
  return config;
}

// Run the script
if (require.main === module) {
  console.log('👤 Du Lịch Việt AI - Create Single Admin User');
  console.log('==========================================');
  
  const customConfig = getAdminConfigFromArgs();
  const finalConfig = { ...defaultAdminConfig, ...customConfig };
  
  console.log('📋 Admin configuration:');
  console.log(`   - Email: ${finalConfig.email}`);
  console.log(`   - Name: ${finalConfig.fullName}`);
  console.log(`   - Username: ${finalConfig.username}`);
  console.log(`   - Password: ${customConfig.password ? '[CUSTOM]' : '[DEFAULT]'}`);
  console.log('');
  
  // Simple confirmation check
  const args = process.argv.slice(2);
  if (!args.includes('--confirm')) {
    console.log('Custom options:');
    console.log('  --email <email>       Custom admin email');
    console.log('  --password <password> Custom admin password');
    console.log('  --name <name>        Custom admin full name');
    console.log('  --username <username> Custom admin username');
    console.log('');
    console.log('To confirm creating the admin user, add --confirm:');
    console.log('node scripts/create-single-admin.js --confirm');
    console.log('');
    console.log('Example with custom details:');
    console.log('node scripts/create-single-admin.js --email admin@example.com --name "My Admin" --confirm');
    console.log('');
    process.exit(0);
  }
  
  createSingleAdmin(customConfig)
    .then((result) => {
      console.log('✅ Script completed successfully');
      console.log('');
      console.log('🚀 You can now login to the admin panel at:');
      console.log('   http://localhost:9002/admin');
      console.log('');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { createSingleAdmin };
#!/usr/bin/env node
/**
 * Script tạo tài khoản test cho tất cả các role trong dự án VietExplore-AI
 * VERSION: LOCAL EMULATOR
 * Sử dụng: node scripts/setup-test-accounts-local.js
 * Yêu cầu: Firebase Emulator đang chạy (npm run emulators:start)
 */

const admin = require('firebase-admin');

// Check if emulator is running
const isEmulatorRunning = async () => {
  try {
    // Check auth emulator specifically 
    const response = await fetch('http://localhost:9888');
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Initialize Firebase Admin SDK for EMULATOR
admin.initializeApp({
  projectId: 'vietexplore-ai'
});

// Configure for emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8888';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9888';

const auth = admin.auth();
const firestore = admin.firestore();

// Định nghĩa test accounts cho từng role
const TEST_ACCOUNTS = [
  {
    email: 'guest@vietexplore.test',
    password: 'guest123456',
    role: 'guest',
    displayName: 'Test Guest User',
    description: 'Tài khoản test cho khách vãng lai'
  },
  {
    email: 'traveler@vietexplore.test', 
    password: 'traveler123456',
    role: 'traveler',
    displayName: 'Test Traveler User',
    description: 'Tài khoản test cho du khách'
  },
  {
    email: 'contributor@vietexplore.test',
    password: 'contributor123456', 
    role: 'contributor',
    displayName: 'Test Contributor User',
    description: 'Tài khoản test cho cộng tác viên'
  },
  {
    email: 'partner@vietexplore.test',
    password: 'partner123456',
    role: 'partner', 
    displayName: 'Test Partner User',
    description: 'Tài khoản test cho đối tác cộng đồng'
  },
  {
    email: 'moderator@vietexplore.test',
    password: 'moderator123456',
    role: 'moderator',
    displayName: 'Test Moderator User', 
    description: 'Tài khoản test cho kiểm duyệt viên'
  },
  {
    email: 'admin2@vietexplore.test',
    password: 'admin123456',
    role: 'admin',
    displayName: 'Test Admin User',
    description: 'Tài khoản test cho admin (backup)'
  }
];

/**
 * Tạo user trong Firebase Auth (EMULATOR)
 */
async function createAuthUser(account) {
  try {
    const userRecord = await auth.createUser({
      email: account.email,
      password: account.password,
      displayName: account.displayName,
      emailVerified: true // Auto verify for test accounts
    });
    
    console.log(`✅ Created Auth user: ${account.email} (${userRecord.uid})`);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️  User ${account.email} already exists in Auth`);
      const existingUser = await auth.getUserByEmail(account.email);
      return existingUser;
    }
    throw error;
  }
}

/**
 * Tạo user profile trong Firestore (EMULATOR)
 */
async function createUserProfile(userRecord, account) {
  try {
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: account.displayName,
      role: account.role,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: true,
      testAccount: true, // Flag để dễ cleanup sau
      description: account.description,
      isEmulatorAccount: true // Flag để phân biệt với production
    };

    // Thêm metadata specific cho từng role
    if (account.role === 'contributor') {
      userProfile.verifiedContributor = true;
      userProfile.contributorBadge = 'verified';
    }

    if (account.role === 'partner') {
      userProfile.partnerId = `test-partner-${userRecord.uid.substring(0, 8)}`;
      userProfile.partnerType = 'test-organization';
    }

    if (account.role === 'moderator') {
      userProfile.moderatorLevel = 'standard';
      userProfile.moderatorPermissions = ['review_content', 'manage_reports'];
    }

    if (account.role === 'admin') {
      userProfile.adminLevel = 'super';
      userProfile.adminPermissions = ['all'];
    }

    await firestore.collection('users').doc(userRecord.uid).set(userProfile);
    console.log(`✅ Created Firestore profile for: ${account.email}`);
    
    return userProfile;
  } catch (error) {
    console.error(`❌ Error creating profile for ${account.email}:`, error);
    throw error;
  }
}

/**
 * Setup test data cho các role (EMULATOR)
 */
async function setupTestDataForRole(userRecord, account) {
  try {
    const batch = firestore.batch();

    // Setup data cho Contributor
    if (account.role === 'contributor') {
      // Tạo 1-2 place drafts
      const draftRef1 = firestore.collection('placeDrafts').doc();
      batch.set(draftRef1, {
        title: 'Địa điểm test từ Contributor (Local)',
        description: 'Mô tả địa điểm test trên emulator',
        region: 'Miền Bắc',
        province: 'Hà Nội',
        type: 'cultural',
        submitter: userRecord.uid,
        submitterRole: 'contributor',
        status: 'draft',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isEmulatorData: true
      });
    }

    // Setup data cho Partner
    if (account.role === 'partner') {
      const draftRef2 = firestore.collection('placeDrafts').doc();
      batch.set(draftRef2, {
        title: 'Địa điểm chính thức từ Partner (Local)',
        description: 'Thông tin chính thức từ đối tác test',
        region: 'Miền Nam', 
        province: 'TP.HCM',
        type: 'business',
        submitter: userRecord.uid,
        submitterRole: 'partner',
        status: 'submitted',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isEmulatorData: true
      });
    }

    // Setup moderation queue cho Moderator test
    if (account.role === 'moderator') {
      const modRef = firestore.collection('moderationQueue').doc();
      batch.set(modRef, {
        contentId: 'test-content-id-local',
        contentType: 'place',
        priority: 'normal',
        status: 'pending',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        assignedModerator: null,
        isEmulatorData: true
      });
    }

    // Setup test itinerary cho Traveler
    if (account.role === 'traveler') {
      const itineraryRef = firestore.collection('itineraries').doc();
      batch.set(itineraryRef, {
        title: 'Lịch trình test Traveler (Local)',
        description: 'Lịch trình test trên emulator',
        ownerId: userRecord.uid,
        visibility: 'private',
        days: [],
        duration: 3,
        budgetEstimate: 2000000,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isEmulatorData: true
      });
    }

    await batch.commit();
    console.log(`✅ Setup test data for role: ${account.role}`);
  } catch (error) {
    console.warn(`⚠️  Could not setup test data for ${account.role}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Bắt đầu tạo test accounts cho LOCAL EMULATOR...\n');

  // Check if emulator is running
  const emulatorRunning = await isEmulatorRunning();
  if (!emulatorRunning) {
    console.error('❌ Firebase Emulator không chạy!');
    console.log('💡 Hãy chạy: npm run emulators:start');
    process.exit(1);
  }

    console.log('✅ Firebase Emulator đã chạy tại: http://localhost:4444\n');  const results = [];
  
  for (const account of TEST_ACCOUNTS) {
    try {
      console.log(`📝 Tạo tài khoản: ${account.email} (${account.role})`);
      
      // Step 1: Create Auth user
      const userRecord = await createAuthUser(account);
      
      // Step 2: Create Firestore profile  
      const userProfile = await createUserProfile(userRecord, account);
      
      // Step 3: Setup test data
      await setupTestDataForRole(userRecord, account);
      
      results.push({
        email: account.email,
        uid: userRecord.uid,
        role: account.role,
        status: 'success'
      });
      
    } catch (error) {
      console.error(`❌ Lỗi tạo tài khoản ${account.email}:`, error);
      results.push({
        email: account.email,
        role: account.role,
        status: 'error',
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 KẾT QUẢ TẠO TEST ACCOUNTS (LOCAL EMULATOR)');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.email} (${result.role})`);
    if (result.uid) console.log(`   UID: ${result.uid}`);
    if (result.error) console.log(`   Error: ${result.error}`);
  });

  console.log('\n🔐 THÔNG TIN ĐĂNG NHẬP:');
  console.log('Password cho tất cả test accounts: {role}123456');
  console.log('Ví dụ: traveler@vietexplore.test / traveler123456');
  console.log('\n🌐 Firebase Auth UI: http://127.0.0.1:4000/auth');
  console.log('🗄️  Firestore UI: http://127.0.0.1:4000/firestore\n');

  // Cleanup
  await admin.app().delete();
  console.log('✅ Hoàn thành tạo test accounts trên LOCAL EMULATOR!');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TEST_ACCOUNTS };

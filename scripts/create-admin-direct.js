#!/usr/bin/env node
/**
 * Test script để tạo admin account mà không cần emulator
 * Kết nối trực tiếp với Firebase Production để tạo test admin
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK với production credentials
const serviceAccount = require('../vietexplore-ai-firebase-adminsdk-fbsvc-3554e3a673.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'vietexplore-ai'
});

const auth = admin.auth();
const firestore = admin.firestore();

/**
 * Tạo admin account trực tiếp trên production
 */
async function createAdminAccount() {
  try {
    console.log('🔧 Tạo admin account trực tiếp trên Firebase Production...');
    
    const adminEmail = 'admin.local@vietexplore.test';
    const adminPassword = 'admin123456789';
    
    // Create auth user
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'Local Admin User',
        emailVerified: true
      });
      console.log(`✅ Created auth user: ${adminEmail} (${userRecord.uid})`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  User already exists: ${adminEmail}`);
        userRecord = await auth.getUserByEmail(adminEmail);
        console.log(`✅ Using existing user: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }
    
    // Create firestore profile
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: 'Local Admin User',
      role: 'admin',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: true,
      isTestAccount: true,
      adminLevel: 'super',
      adminPermissions: ['all']
    };
    
    await firestore.collection('users').doc(userRecord.uid).set(userProfile, { merge: true });
    console.log(`✅ Created/updated Firestore profile for admin`);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ADMIN ACCOUNT READY!');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Password: ${adminPassword}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`⚡ Role: admin (super)`);
    console.log('\n🌐 Login tại: http://localhost:9002/login');
    console.log('🎯 Admin Dashboard: http://localhost:9002/admin/dashboard');
    
    console.log('\n✅ PRODUCTION ADMIN ACCOUNT CREATED - Ready for testing!');
    
  } catch (error) {
    console.error('❌ Lỗi tạo admin account:', error);
  } finally {
    await admin.app().delete();
  }
}

// Run main function
if (require.main === module) {
  createAdminAccount().catch(console.error);
}

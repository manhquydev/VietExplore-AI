// functions/src/admin/initialSetup.ts - Initial Admin Setup
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// Create first admin user (one-time setup)
export const createFirstAdmin = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    const { email, setupKey } = req.data;
    
    // Security: Only allow with special setup key
    const SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'vietexplore-admin-setup-2024';
    if (setupKey !== SETUP_KEY) {
      throw new HttpsError('permission-denied', 'Invalid setup key');
    }
    
    if (!email) {
      throw new HttpsError('invalid-argument', 'Email là bắt buộc');
    }
    
    const db = admin.firestore();
    
    // Check if any admin already exists
    const existingAdmins = await db.collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();
    
    if (!existingAdmins.empty) {
      throw new HttpsError('failed-precondition', 'Admin đã tồn tại trong hệ thống');
    }
    
    try {
      // Get user by email
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Update user role in Firestore
      await db.doc(`users/${userRecord.uid}`).set({
        email: userRecord.email,
        displayName: userRecord.displayName || 'Admin',
        role: 'admin',
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        roleAssignedAt: admin.firestore.FieldValue.serverTimestamp(),
        roleAssignedBy: 'system',
        setupType: 'initial_admin'
      }, { merge: true });
      
      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: 'admin',
        verifiedContributor: true,
        permissions: ['*']
      });
      
      // Log the setup
      await db.collection('audits').add({
        actor: {
          uid: userRecord.uid,
          role: 'admin',
          email: userRecord.email
        },
        action: 'initial_admin_setup',
        target: {
          collection: 'users',
          id: userRecord.uid
        },
        metadata: {
          setupType: 'first_admin',
          setupTime: admin.firestore.FieldValue.serverTimestamp()
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      logger.info(`First admin created: ${email} (${userRecord.uid})`);
      
      return {
        success: true,
        message: 'Admin đầu tiên đã được tạo thành công',
        adminId: userRecord.uid,
        email: userRecord.email
      };
      
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found') {
        throw new HttpsError('not-found', 'Người dùng với email này chưa đăng ký. Vui lòng đăng ký trước khi thiết lập admin.');
      }
      throw authError;
    }
    
  } catch (error) {
    logger.error('Error creating first admin:', error);
    throw error;
  }
});

// Check if system needs initial setup
export const checkSetupStatus = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    const db = admin.firestore();
    
    // Check if any admin exists
    const adminSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();
    
    const hasAdmin = !adminSnapshot.empty;
    
    // Count total users
    const totalUsersSnapshot = await db.collection('users').count().get();
    const totalUsers = totalUsersSnapshot.data().count;
    
    // Count by role
    const roleStats: Record<string, number> = {};
    const roles = ['traveler', 'contributor', 'partner', 'moderator', 'admin'];
    
    for (const role of roles) {
      const roleSnapshot = await db.collection('users')
        .where('role', '==', role)
        .count()
        .get();
      roleStats[role] = roleSnapshot.data().count;
    }
    
    return {
      success: true,
      needsSetup: !hasAdmin,
      hasAdmin,
      totalUsers,
      roleStats,
      setupComplete: hasAdmin && totalUsers > 0
    };
    
  } catch (error) {
    logger.error('Error checking setup status:', error);
    throw new HttpsError('internal', 'Lỗi khi kiểm tra trạng thái hệ thống');
  }
});

// Promote existing user to admin (emergency function)
export const emergencyPromoteAdmin = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    const { targetEmail, emergencyKey, reason } = req.data;
    
    // Security: Only allow with emergency key
    const EMERGENCY_KEY = process.env.EMERGENCY_ADMIN_KEY || 'emergency-admin-promote-2024';
    if (emergencyKey !== EMERGENCY_KEY) {
      throw new HttpsError('permission-denied', 'Invalid emergency key');
    }
    
    if (!targetEmail || !reason) {
      throw new HttpsError('invalid-argument', 'Email và lý do là bắt buộc');
    }
    
    const db = admin.firestore();
    
    try {
      // Get user by email
      const userRecord = await admin.auth().getUserByEmail(targetEmail);
      
      // Update user role
      await db.doc(`users/${userRecord.uid}`).update({
        role: 'admin',
        roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        roleUpdatedBy: 'emergency_system',
        emergencyPromotion: true,
        emergencyReason: reason
      });
      
      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: 'admin',
        verifiedContributor: true,
        permissions: ['*']
      });
      
      // Audit log
      await db.collection('audits').add({
        actor: {
          uid: 'system',
          role: 'system',
          email: 'system'
        },
        action: 'emergency_admin_promotion',
        target: {
          collection: 'users',
          id: userRecord.uid
        },
        metadata: {
          targetEmail,
          reason,
          emergencyPromotion: true
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      logger.warn(`Emergency admin promotion: ${targetEmail} (${userRecord.uid}) - Reason: ${reason}`);
      
      return {
        success: true,
        message: 'Emergency admin promotion completed',
        adminId: userRecord.uid,
        email: userRecord.email
      };
      
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found') {
        throw new HttpsError('not-found', 'Người dùng với email này không tồn tại');
      }
      throw authError;
    }
    
  } catch (error) {
    logger.error('Error in emergency admin promotion:', error);
    throw error;
  }
});

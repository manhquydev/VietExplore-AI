// functions/src/user/userManagement.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';

// Function để disable/enable user (Admin only)
export const toggleUserStatus = onCall(async (req) => {
  if (!req.auth?.token?.role || req.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Chỉ Admin mới có quyền thay đổi trạng thái user');
  }

  const { uid, disabled, reason } = req.data;
  
  if (!uid || typeof disabled !== 'boolean') {
    throw new HttpsError('invalid-argument', 'UID và trạng thái disabled là bắt buộc');
  }

  // Không cho disable chính mình
  if (req.auth.uid === uid) {
    throw new HttpsError('permission-denied', 'Không thể disable chính mình');
  }

  try {
    const db = admin.firestore();
    
    // Cập nhật user document
    await db.doc(`users/${uid}`).update({
      disabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(reason && { disabledReason: reason })
    });

    // Ghi audit log
    await db.collection('audits').add({
      type: 'user_status_change',
      adminId: req.auth.uid,
      targetUserId: uid,
      action: disabled ? 'disable' : 'enable',
      reason: reason || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`User ${uid} ${disabled ? 'disabled' : 'enabled'} by admin ${req.auth.uid}`);
    return { success: true, message: `User đã được ${disabled ? 'vô hiệu hóa' : 'kích hoạt'}` };
  } catch (error) {
    logger.error('Error toggling user status:', error);
    throw new HttpsError('internal', 'Lỗi khi thay đổi trạng thái user');
  }
});

// Function để lấy danh sách users cho Admin
export const getUsers = onCall(async (req) => {
  if (!req.auth?.token?.role || req.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Chỉ Admin mới có quyền xem danh sách users');
  }

  const { limit = 50, offset = 0, role, status } = req.data;

  try {
    const db = admin.firestore();
    let query = db.collection('users').orderBy('createdAt', 'desc');

    // Filter by role
    if (role && role !== 'all') {
      query = query.where('role', '==', role);
    }

    // Filter by status
    if (status === 'disabled') {
      query = query.where('disabled', '==', true);
    } else if (status === 'active') {
      query = query.where('disabled', '==', false);
    }

    const snapshot = await query.limit(limit).offset(offset).get();
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    return { users, total: snapshot.size };
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy danh sách users');
  }
});

// Function để request role upgrade
export const requestRoleUpgrade = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  const { requestedRole, reason, portfolio } = req.data;
  
  if (!requestedRole || !['contributor', 'partner'].includes(requestedRole)) {
    throw new HttpsError('invalid-argument', 'Role yêu cầu không hợp lệ');
  }

  try {
    const db = admin.firestore();
    
    // Kiểm tra user hiện tại
    const userDoc = await db.doc(`users/${req.auth.uid}`).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy thông tin user');
    }

    const userData = userDoc.data()!;
    
    // Kiểm tra role hiện tại
    if (userData.role !== 'traveler') {
      throw new HttpsError('failed-precondition', 'Chỉ Traveler mới có thể yêu cầu nâng cấp');
    }

    // Tạo role upgrade request
    const upgradeRequest = {
      type: 'role_upgrade',
      userId: req.auth.uid,
      currentRole: userData.role,
      requestedRole,
      reason: reason || '',
      portfolio: portfolio || null,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null
    };

    const requestRef = await db.collection('moderation/requests').add(upgradeRequest);

    logger.info(`Role upgrade request created: ${requestRef.id} for user ${req.auth.uid}`);
    return { success: true, requestId: requestRef.id };
  } catch (error) {
    logger.error('Error creating role upgrade request:', error);
    throw error;
  }
});

// Trigger khi user profile được update
export const onUserProfileUpdate = onDocumentUpdated('users/{uid}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  
  if (!beforeData || !afterData) return;

  const uid = event.params.uid;
  const db = admin.firestore();

  try {
    // Log những thay đổi quan trọng
    const importantChanges: string[] = [];
    
    if (beforeData.role !== afterData.role) {
      importantChanges.push(`Role: ${beforeData.role} → ${afterData.role}`);
    }
    
    if (beforeData.verifiedContributor !== afterData.verifiedContributor) {
      importantChanges.push(`Verified: ${beforeData.verifiedContributor} → ${afterData.verifiedContributor}`);
    }
    
    if (beforeData.disabled !== afterData.disabled) {
      importantChanges.push(`Status: ${beforeData.disabled ? 'disabled' : 'active'} → ${afterData.disabled ? 'disabled' : 'active'}`);
    }

    if (importantChanges.length > 0) {
      await db.collection('audits').add({
        type: 'user_profile_change',
        targetUserId: uid,
        changes: importantChanges,
        beforeData: {
          role: beforeData.role,
          verifiedContributor: beforeData.verifiedContributor,
          disabled: beforeData.disabled
        },
        afterData: {
          role: afterData.role,
          verifiedContributor: afterData.verifiedContributor,
          disabled: afterData.disabled
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`User profile changes logged for ${uid}:`, importantChanges);
    }
  } catch (error) {
    logger.error('Error logging user profile changes:', error);
  }
});



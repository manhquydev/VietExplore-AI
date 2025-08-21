// functions/src/auth/grantRole.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

interface GrantRoleData {
  uid: string;
  role: 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';
  verifiedContributor?: boolean;
  partnerId?: string | null;
  permissions?: string[];
}

export const grantRole = onCall<GrantRoleData>(async (req) => {
  const caller = req.auth;
  
  // Kiểm tra quyền Admin
  if (!caller?.token?.role || caller.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Chỉ Admin mới có quyền gán role');
  }

  const { uid, role, verifiedContributor, partnerId, permissions } = req.data;

  // Validation
  if (!uid || !role) {
    throw new HttpsError('invalid-argument', 'UID và role là bắt buộc');
  }

  // Không cho tự nâng quyền cho chính mình
  if (caller.uid === uid) {
    throw new HttpsError('permission-denied', 'Không thể tự nâng quyền cho chính mình');
  }

  const validRoles = ['traveler', 'contributor', 'partner', 'moderator', 'admin'];
  if (!validRoles.includes(role)) {
    throw new HttpsError('invalid-argument', 'Role không hợp lệ');
  }

  try {
    logger.info(`Admin ${caller.uid} granting role ${role} to user ${uid}`);

    // Cập nhật custom claims
    const newClaims = {
      role,
      verifiedContributor: !!verifiedContributor,
      partnerId: partnerId || null,
      permissions: Array.isArray(permissions) ? permissions : []
    };

    await admin.auth().setCustomUserClaims(uid, newClaims);

    // Cập nhật Firestore document
    await admin.firestore().doc(`users/${uid}`).update({
      role,
      verifiedContributor: !!verifiedContributor,
      partnerId: partnerId || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Ghi log audit
    await admin.firestore().collection('audits').add({
      type: 'role_grant',
      adminId: caller.uid,
      targetUserId: uid,
      previousRole: null, // Có thể lấy từ user doc trước khi update
      newRole: role,
      changes: newClaims,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      reason: `Role granted by admin ${caller.uid}`
    });

    logger.info(`Successfully granted role ${role} to user ${uid}`);
    return { success: true, message: `Đã gán role ${role} thành công` };
  } catch (error) {
    logger.error(`Error granting role to user ${uid}:`, error);
    throw new HttpsError('internal', 'Lỗi khi gán role');
  }
});



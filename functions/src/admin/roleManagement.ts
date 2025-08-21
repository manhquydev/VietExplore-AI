// functions/src/admin/roleManagement.ts - Admin Role Management Functions
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { requireAdminRole, requireEmailVerified, UserRole } from '../middleware/rbac';

// Assign role to user (Admin only)
export const assignUserRole = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    // Security checks
    requireEmailVerified(req.auth);
    requireAdminRole(req.auth);
    
    const { targetUserId, newRole, reason } = req.data;
    
    if (!targetUserId || !newRole) {
      throw new HttpsError('invalid-argument', 'Target user ID và role là bắt buộc');
    }
    
    const validRoles: UserRole[] = ['traveler', 'contributor', 'partner', 'moderator', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new HttpsError('invalid-argument', `Role không hợp lệ. Chỉ chấp nhận: ${validRoles.join(', ')}`);
    }
    
    // Prevent self-demotion from admin
    if (req.auth!.uid === targetUserId && newRole !== 'admin') {
      throw new HttpsError('permission-denied', 'Không thể tự giảm quyền Admin');
    }
    
    const db = admin.firestore();
    
    await db.runTransaction(async (tx) => {
      // Get current user data
      const userRef = db.doc(`users/${targetUserId}`);
      const userSnap = await tx.get(userRef);
      
      if (!userSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy người dùng');
      }
      
      const userData = userSnap.data()!;
      const oldRole = userData.role || 'traveler';
      
      // Update Firestore user document
      tx.update(userRef, {
        role: newRole,
        roleUpdatedBy: req.auth!.uid,
        roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update Firebase Auth custom claims
      await admin.auth().setCustomUserClaims(targetUserId, {
        role: newRole,
        verifiedContributor: userData.verifiedContributor || false,
        partnerId: userData.partnerId || null,
        permissions: getPermissionsForRole(newRole)
      });
      
      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: {
          uid: req.auth!.uid,
          role: req.auth!.token.role,
          email: req.auth!.token.email
        },
        action: 'assign_role',
        target: {
          collection: 'users',
          id: targetUserId
        },
        diff: {
          before: { role: oldRole },
          after: { role: newRole }
        },
        metadata: {
          reason: reason || 'Admin assignment',
          targetUserEmail: userData.email
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    logger.info(`Role assigned: ${targetUserId} → ${newRole} by ${req.auth!.uid}`);
    
    return {
      success: true,
      message: `Đã gán role ${newRole} cho người dùng`,
      targetUserId,
      newRole
    };
    
  } catch (error) {
    logger.error('Error assigning role:', error);
    throw error;
  }
});

// Get all users with pagination (Admin only)
export const getAllUsers = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    requireEmailVerified(req.auth);
    requireAdminRole(req.auth);
    
    const { limit = 20, startAfter, role, status } = req.data;
    
    const db = admin.firestore();
    let query = db.collection('users').orderBy('createdAt', 'desc');
    
    // Filter by role if specified
    if (role) {
      query = query.where('role', '==', role);
    }
    
    // Filter by status if specified
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // Pagination
    if (startAfter) {
      const startAfterDoc = await db.doc(`users/${startAfter}`).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }
    
    query = query.limit(Math.min(limit, 100)); // Max 100 per request
    
    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Remove sensitive fields
      password: undefined,
      refreshTokens: undefined
    }));
    
    // Get total count for pagination
    const totalSnapshot = await db.collection('users').count().get();
    
    return {
      success: true,
      users,
      total: totalSnapshot.data().count,
      hasMore: snapshot.docs.length === limit
    };
    
  } catch (error) {
    logger.error('Error getting users:', error);
    throw error;
  }
});

// Promote user to next role level
export const promoteUser = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    requireEmailVerified(req.auth);
    requireAdminRole(req.auth);
    
    const { targetUserId, reason } = req.data;
    
    if (!targetUserId) {
      throw new HttpsError('invalid-argument', 'Target user ID là bắt buộc');
    }
    
    const db = admin.firestore();
    const userRef = db.doc(`users/${targetUserId}`);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy người dùng');
    }
    
    const userData = userSnap.data()!;
    const currentRole = userData.role || 'traveler';
    
    // Define promotion path
    const promotionPath: Record<string, string> = {
      'traveler': 'contributor',
      'contributor': 'partner',
      'partner': 'moderator'
      // moderator → admin requires explicit assignment
    };
    
    const newRole = promotionPath[currentRole];
    if (!newRole) {
      throw new HttpsError('failed-precondition', `Không thể thăng cấp từ role ${currentRole}`);
    }
    
    // Use the assignUserRole function
    return await assignUserRole.run({
      data: { targetUserId, newRole, reason: reason || `Promotion from ${currentRole}` },
      auth: req.auth
    } as any);
    
  } catch (error) {
    logger.error('Error promoting user:', error);
    throw error;
  }
});

// Suspend/Unsuspend user (Admin only)
export const toggleUserStatus = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    requireEmailVerified(req.auth);
    requireAdminRole(req.auth);
    
    const { targetUserId, action, reason } = req.data;
    
    if (!targetUserId || !action) {
      throw new HttpsError('invalid-argument', 'Target user ID và action là bắt buộc');
    }
    
    if (!['suspend', 'activate'].includes(action)) {
      throw new HttpsError('invalid-argument', 'Action phải là suspend hoặc activate');
    }
    
    // Prevent self-suspension
    if (req.auth!.uid === targetUserId && action === 'suspend') {
      throw new HttpsError('permission-denied', 'Không thể tự khóa tài khoản Admin');
    }
    
    const db = admin.firestore();
    
    await db.runTransaction(async (tx) => {
      const userRef = db.doc(`users/${targetUserId}`);
      const userSnap = await tx.get(userRef);
      
      if (!userSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy người dùng');
      }
      
      const userData = userSnap.data()!;
      const newStatus = action === 'suspend' ? 'suspended' : 'active';
      
      // Update user status
      tx.update(userRef, {
        status: newStatus,
        statusReason: reason || `${action} by admin`,
        statusUpdatedBy: req.auth!.uid,
        statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Disable Firebase Auth account if suspending
      if (action === 'suspend') {
        await admin.auth().updateUser(targetUserId, { disabled: true });
      } else {
        await admin.auth().updateUser(targetUserId, { disabled: false });
      }
      
      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: {
          uid: req.auth!.uid,
          role: req.auth!.token.role,
          email: req.auth!.token.email
        },
        action: `user_${action}`,
        target: {
          collection: 'users',
          id: targetUserId
        },
        diff: {
          before: { status: userData.status || 'active' },
          after: { status: newStatus }
        },
        metadata: {
          reason: reason || `${action} by admin`,
          targetUserEmail: userData.email
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    logger.info(`User ${action}: ${targetUserId} by ${req.auth!.uid}`);
    
    return {
      success: true,
      message: `Đã ${action === 'suspend' ? 'khóa' : 'kích hoạt'} tài khoản người dùng`,
      targetUserId,
      newStatus: action === 'suspend' ? 'suspended' : 'active'
    };
    
  } catch (error) {
    logger.error('Error toggling user status:', error);
    throw error;
  }
});

// Get audit logs (Admin only)
export const getAuditLogs = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    requireEmailVerified(req.auth);
    requireAdminRole(req.auth);
    
    const { limit = 50, startAfter, actorId, action, targetCollection } = req.data;
    
    const db = admin.firestore();
    let query = db.collection('audits').orderBy('createdAt', 'desc');
    
    // Filters
    if (actorId) {
      query = query.where('actor.uid', '==', actorId);
    }
    
    if (action) {
      query = query.where('action', '==', action);
    }
    
    if (targetCollection) {
      query = query.where('target.collection', '==', targetCollection);
    }
    
    // Pagination
    if (startAfter) {
      query = query.startAfter(startAfter);
    }
    
    query = query.limit(Math.min(limit, 100));
    
    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      success: true,
      logs,
      hasMore: snapshot.docs.length === limit
    };
    
  } catch (error) {
    logger.error('Error getting audit logs:', error);
    throw error;
  }
});

// Helper function to get permissions for role
function getPermissionsForRole(role: UserRole): string[] {
  // This should match the RBAC matrix
  const permissions: Record<UserRole, string[]> = {
    guest: ['content.view_public'],
    traveler: ['content.view_public', 'itinerary.create', 'place.suggest', 'report.create'],
    contributor: ['content.view_public', 'itinerary.create', 'place.suggest', 'place.create_draft', 'place.submit_review', 'report.create'],
    partner: ['content.view_public', 'itinerary.create', 'place.suggest', 'place.create_draft', 'place.submit_review', 'report.create'],
    moderator: ['content.view_public', 'itinerary.create', 'place.suggest', 'moderation.queue_view', 'moderation.approve', 'moderation.reject', 'report.create', 'report.view'],
    admin: ['*'] // All permissions
  };
  
  return permissions[role] || [];
}

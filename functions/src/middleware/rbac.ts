// functions/src/middleware/rbac.ts - RBAC Middleware for Cloud Functions
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';

// Role definitions
export type UserRole = 'guest' | 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';

// Permission definitions
export type Permission = 
  | 'content.view_public'
  | 'itinerary.create' | 'itinerary.update_own' | 'itinerary.view_own' | 'itinerary.share_public' | 'itinerary.delete_own'
  | 'place.suggest' | 'place.create_draft' | 'place.submit_review' | 'place.edit_own_draft' | 'place.view_review_status'
  | 'moderation.queue_view' | 'moderation.approve' | 'moderation.reject' | 'moderation.request_changes' | 'moderation.hide' | 'moderation.resolve_report'
  | 'report.create' | 'report.view'
  | 'admin.manage_roles' | 'admin.assign_verified_label' | 'admin.emergency_remove' | 'admin.view_audit_logs';

// RBAC Matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: ['content.view_public'],
  
  traveler: [
    'content.view_public', 'itinerary.create', 'itinerary.update_own', 'itinerary.view_own', 
    'itinerary.share_public', 'itinerary.delete_own', 'place.suggest', 'place.view_review_status', 'report.create'
  ],
  
  contributor: [
    'content.view_public', 'itinerary.create', 'itinerary.update_own', 'itinerary.view_own',
    'itinerary.share_public', 'itinerary.delete_own', 'place.suggest', 'place.create_draft',
    'place.submit_review', 'place.edit_own_draft', 'place.view_review_status', 'report.create'
  ],
  
  partner: [
    'content.view_public', 'itinerary.create', 'itinerary.update_own', 'itinerary.view_own',
    'itinerary.share_public', 'itinerary.delete_own', 'place.suggest', 'place.create_draft',
    'place.submit_review', 'place.edit_own_draft', 'place.view_review_status', 'report.create'
  ],
  
  moderator: [
    'content.view_public', 'itinerary.create', 'itinerary.update_own', 'itinerary.view_own',
    'itinerary.share_public', 'itinerary.delete_own', 'place.suggest', 'place.view_review_status',
    'moderation.queue_view', 'moderation.approve', 'moderation.reject', 'moderation.request_changes',
    'moderation.hide', 'moderation.resolve_report', 'report.create', 'report.view',
    'admin.assign_verified_label', 'admin.view_audit_logs'
  ],
  
  admin: [
    'content.view_public', 'itinerary.create', 'itinerary.update_own', 'itinerary.view_own',
    'itinerary.share_public', 'itinerary.delete_own', 'place.suggest', 'place.create_draft',
    'place.submit_review', 'place.edit_own_draft', 'place.view_review_status',
    'moderation.queue_view', 'moderation.approve', 'moderation.reject', 'moderation.request_changes',
    'moderation.hide', 'moderation.resolve_report', 'report.create', 'report.view',
    'admin.manage_roles', 'admin.assign_verified_label', 'admin.emergency_remove', 'admin.view_audit_logs'
  ]
};

// Permission checking
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

// Get user role from auth context
export function getUserRole(auth: any): UserRole {
  if (!auth?.token) return 'guest';
  return (auth.token.role as UserRole) || 'traveler';
}

// RBAC Middleware
export function requirePermission(permission: Permission) {
  return (auth: any) => {
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Yêu cầu đăng nhập');
    }

    const userRole = getUserRole(auth);
    
    if (!hasPermission(userRole, permission)) {
      throw new HttpsError('permission-denied', `Không có quyền ${permission}`);
    }

    return true;
  };
}

// Email verification requirement
export function requireEmailVerified(auth: any) {
  if (!auth?.token?.email_verified) {
    throw new HttpsError('failed-precondition', 'Yêu cầu xác minh email');
  }
  return true;
}

// Ownership check
export async function requireOwnership(
  auth: any, 
  resourceType: string, 
  resourceId: string,
  ownerField: string = 'owner'
) {
  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', 'Yêu cầu đăng nhập');
  }

  const db = admin.firestore();
  const doc = await db.doc(`${resourceType}/${resourceId}`).get();
  
  if (!doc.exists) {
    throw new HttpsError('not-found', 'Không tìm thấy tài nguyên');
  }

  const data = doc.data()!;
  if (data[ownerField] !== auth.uid) {
    throw new HttpsError('permission-denied', 'Không có quyền truy cập tài nguyên này');
  }

  return data;
}

// Prevent self-moderation
export async function preventSelfModeration(
  auth: any,
  resourceType: string,
  resourceId: string
) {
  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', 'Yêu cầu đăng nhập');
  }

  const db = admin.firestore();
  const doc = await db.doc(`${resourceType}/${resourceId}`).get();
  
  if (!doc.exists) {
    throw new HttpsError('not-found', 'Không tìm thấy tài nguyên');
  }

  const data = doc.data()!;
  if (data.submitter === auth.uid || data.createdBy === auth.uid) {
    throw new HttpsError('permission-denied', 'Không thể kiểm duyệt nội dung do chính mình tạo');
  }

  return data;
}

// Role management checks
export function requireAdminRole(auth: any) {
  if (!auth?.token?.role || auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Chỉ Admin mới có quyền thực hiện');
  }
  return true;
}

export function requireModeratorRole(auth: any) {
  if (!auth?.token?.role || !['moderator', 'admin'].includes(auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền thực hiện');
  }
  return true;
}

// Rate limiting check
const RATE_LIMITS: Record<string, Record<UserRole, number>> = {
  'place.suggest': {
    guest: 0,
    traveler: 5, // per hour
    contributor: 10,
    partner: 20,
    moderator: 50,
    admin: 100
  },
  'report.create': {
    guest: 0,
    traveler: 3,
    contributor: 5,
    partner: 5,
    moderator: 10,
    admin: 20
  }
};

export async function checkRateLimit(
  auth: any,
  action: string,
  timeWindow: number = 3600000 // 1 hour in ms
) {
  if (!auth?.uid) return true; // Skip for unauthenticated
  
  const userRole = getUserRole(auth);
  const limit = RATE_LIMITS[action]?.[userRole];
  
  if (!limit) return true; // No limit defined
  
  const db = admin.firestore();
  const now = Date.now();
  const windowStart = now - timeWindow;
  
  // Count recent actions
  const recentActions = await db.collection('rateLimits')
    .where('userId', '==', auth.uid)
    .where('action', '==', action)
    .where('timestamp', '>', windowStart)
    .count()
    .get();
  
  if (recentActions.data().count >= limit) {
    throw new HttpsError('resource-exhausted', `Đã vượt quá giới hạn ${limit} lần/${timeWindow/3600000}h cho hành động ${action}`);
  }
  
  // Record this action
  await db.collection('rateLimits').add({
    userId: auth.uid,
    action,
    timestamp: now,
    userRole
  });
  
  return true;
}

// Audit logging
export async function logAction(
  auth: any,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: any
) {
  if (!auth?.uid) return;
  
  const db = admin.firestore();
  await db.collection('audits').add({
    actor: {
      uid: auth.uid,
      role: getUserRole(auth),
      email: auth.token?.email
    },
    action,
    target: {
      collection: resourceType,
      id: resourceId
    },
    metadata: metadata || {},
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

// Combined middleware for common patterns
export function requireAuthAndPermission(permission: Permission) {
  return (auth: any) => {
    requireEmailVerified(auth);
    requirePermission(permission)(auth);
    return true;
  };
}

export function requireModeratorAndPreventSelf(resourceType: string, resourceId: string) {
  return async (auth: any) => {
    requireModeratorRole(auth);
    await preventSelfModeration(auth, resourceType, resourceId);
    return true;
  };
}

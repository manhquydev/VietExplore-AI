// src/lib/rbac.ts - Role-Based Access Control System
import { User } from 'firebase/auth';

// Role definitions based on RBAC documents
export type UserRole = 'guest' | 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';

// Permission definitions from technical requirements
export type Permission = 
  // Content permissions
  | 'content.view_public'
  // Itinerary permissions  
  | 'itinerary.create'
  | 'itinerary.update_own'
  | 'itinerary.view_own'
  | 'itinerary.share_public'
  | 'itinerary.delete_own'
  // Place permissions
  | 'place.suggest'
  | 'place.create_draft'
  | 'place.submit_review'
  | 'place.edit_own_draft'
  | 'place.view_review_status'
  // Moderation permissions
  | 'moderation.queue_view'
  | 'moderation.approve'
  | 'moderation.reject'
  | 'moderation.request_changes'
  | 'moderation.hide'
  | 'moderation.resolve_report'
  // Report permissions
  | 'report.create'
  | 'report.view'
  // Admin permissions
  | 'admin.manage_roles'
  | 'admin.assign_verified_label'
  | 'admin.emergency_remove'
  | 'admin.view_audit_logs';

// RBAC Matrix based on technical requirements
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: [
    'content.view_public'
  ],
  
  traveler: [
    'content.view_public',
    'itinerary.create',
    'itinerary.update_own',
    'itinerary.view_own', 
    'itinerary.share_public',
    'itinerary.delete_own',
    'place.suggest',
    'place.view_review_status',
    'report.create'
  ],
  
  contributor: [
    'content.view_public',
    'itinerary.create',
    'itinerary.update_own',
    'itinerary.view_own',
    'itinerary.share_public', 
    'itinerary.delete_own',
    'place.suggest',
    'place.create_draft',
    'place.submit_review',
    'place.edit_own_draft',
    'place.view_review_status',
    'report.create'
  ],
  
  partner: [
    'content.view_public',
    'itinerary.create',
    'itinerary.update_own',
    'itinerary.view_own',
    'itinerary.share_public',
    'itinerary.delete_own', 
    'place.suggest',
    'place.create_draft',
    'place.submit_review', // với fast-track flag
    'place.edit_own_draft',
    'place.view_review_status',
    'report.create'
  ],
  
  moderator: [
    'content.view_public',
    'itinerary.create',
    'itinerary.update_own',
    'itinerary.view_own',
    'itinerary.share_public',
    'itinerary.delete_own',
    'place.suggest',
    'place.view_review_status',
    'moderation.queue_view',
    'moderation.approve',
    'moderation.reject', 
    'moderation.request_changes',
    'moderation.hide',
    'moderation.resolve_report',
    'report.create',
    'report.view',
    'admin.assign_verified_label', // gán nhãn bài/địa điểm
    'admin.view_audit_logs'
  ],
  
  admin: [
    'content.view_public',
    'itinerary.create',
    'itinerary.update_own', 
    'itinerary.view_own',
    'itinerary.share_public',
    'itinerary.delete_own',
    'place.suggest',
    'place.create_draft',
    'place.submit_review',
    'place.edit_own_draft',
    'place.view_review_status',
    'moderation.queue_view',
    'moderation.approve',
    'moderation.reject',
    'moderation.request_changes',
    'moderation.hide',
    'moderation.resolve_report',
    'report.create',
    'report.view',
    'admin.manage_roles',
    'admin.assign_verified_label',
    'admin.emergency_remove',
    'admin.view_audit_logs'
  ]
};

// Permission checking functions
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Get user role from Firebase Auth user
export function getUserRole(user: User | null): UserRole {
  if (!user) return 'guest';
  
  // Get role from custom claims
  const claims = (user as any)?.customClaims || {};
  const role = claims.role as UserRole;
  
  // Default to traveler if authenticated but no role set
  return role || 'traveler';
}

// Check if user can perform action on resource
export function canPerformAction(
  userRole: UserRole, 
  permission: Permission,
  resource?: { ownerId?: string },
  userId?: string
): boolean {
  // Basic permission check
  if (!hasPermission(userRole, permission)) {
    return false;
  }
  
  // Ownership check for *_own permissions
  if (permission.includes('_own') && resource && userId) {
    return resource.ownerId === userId;
  }
  
  return true;
}

// Prevent self-moderation (Moderator không duyệt bài của chính mình)
export function canModerateContent(
  userRole: UserRole,
  contentCreatorId: string,
  moderatorId: string
): boolean {
  // Must have moderation permission
  if (!hasPermission(userRole, 'moderation.approve')) {
    return false;
  }
  
  // Cannot moderate own content
  if (contentCreatorId === moderatorId) {
    return false;
  }
  
  return true;
}

// Role hierarchy for role management
const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  traveler: 1,
  contributor: 2,
  partner: 3,
  moderator: 4,
  admin: 5
};

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  // Only admin can manage roles
  if (!hasPermission(managerRole, 'admin.manage_roles')) {
    return false;
  }
  
  // Admin can manage all roles except cannot demote other admins
  if (managerRole === 'admin') {
    return true;
  }
  
  return false;
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    guest: 'Khách',
    traveler: 'Du khách',
    contributor: 'Cộng tác viên',
    partner: 'Đối tác',
    moderator: 'Kiểm duyệt viên',
    admin: 'Quản trị viên'
  };
  
  return names[role] || role;
}

// Get available permissions for role
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Check if role upgrade is valid
export function canUpgradeToRole(currentRole: UserRole, targetRole: UserRole): boolean {
  const currentLevel = ROLE_HIERARCHY[currentRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  
  // Can only upgrade to next level (except admin assignment)
  if (targetRole === 'admin') return false; // Admin must be assigned by existing admin
  if (targetRole === 'moderator') return false; // Moderator must be assigned by admin
  
  // Traveler → Contributor
  if (currentRole === 'traveler' && targetRole === 'contributor') return true;
  
  // Contributor → Partner (with verification)
  if (currentRole === 'contributor' && targetRole === 'partner') return true;
  
  return false;
}

// Rate limiting permissions
export function getRateLimit(userRole: UserRole, action: string): number {
  const limits: Record<string, Record<UserRole, number>> = {
    'place.suggest': {
      guest: 0,
      traveler: 5, // 5 per hour
      contributor: 10,
      partner: 20,
      moderator: 50,
      admin: 100
    },
    'report.create': {
      guest: 0,
      traveler: 3, // 3 per hour
      contributor: 5,
      partner: 5,
      moderator: 10,
      admin: 20
    }
  };
  
  return limits[action]?.[userRole] || 0;
}

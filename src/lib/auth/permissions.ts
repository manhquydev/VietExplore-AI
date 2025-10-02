import { User, UserRole, Permission } from '@/lib/types/auth';

// Role-to-permission mapping based on document matrix
export const rolePermissions: Record<UserRole, Permission[]> = {
  guest: [], // Can only view content
  traveler: [
    "report_content",
    "create_itinerary", 
    "save_places"
  ],
  contributor: [
    "create_place", // Requires moderation
    "report_content",
    "create_itinerary", 
    "save_places", 
    "manage_drafts"
  ],
  partner: [
    "create_place", // Requires moderation but priority queue
    "create_place_priority",
    "report_content",
    "create_itinerary", 
    "save_places", 
    "manage_drafts",
    "partner_badge", 
    "fast_review"
  ],
  moderator: [
    "review_content",
    "approve_content",
    "reject_content",
    "hide_content",
    "view_moderation_queue",
    "claim_moderation_item",
    "manage_partial_admin",
    "manage_settings", // Basic settings access
    "manage_announcements", // Create and manage announcements
    "publish_announcements", // Publish announcements
    // Inherits traveler permissions
    "report_content",
    "create_itinerary",
    "save_places"
  ],
  admin: [
    "all_permissions", // Auto-approve places, full moderation access
    "manage_settings", // Full system settings
    "manage_security", // Security settings
    "manage_notifications", // Notification settings
    "manage_maintenance", // Maintenance mode
    "view_audit_logs", // Security audit logs
    "manage_users_advanced", // Advanced user management
    "system_override", // Override any restriction
    "manage_announcements", // Create and manage announcements
    "publish_announcements" // Publish announcements
  ]
};

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const userPermissions = rolePermissions[user.role] || [];
  
  // Grant base permissions for higher roles
  if (user.role === 'partner') {
    return userPermissions.concat(rolePermissions.contributor).includes(permission);
  }
  if (user.role === 'contributor') {
    return userPermissions.concat(rolePermissions.traveler).includes(permission);
  }

  return userPermissions.includes(permission);
}

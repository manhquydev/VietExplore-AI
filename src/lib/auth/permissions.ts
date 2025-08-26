"use client"
import { User, UserRole, Permission } from '@/lib/types/auth';

// Role-to-permission mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  guest: [],
  traveler: ["create_itinerary", "save_places", "report_content"],
  contributor: [
    "create_place", 
    "create_itinerary", 
    "save_places", 
    "report_content", 
    "manage_drafts"
  ],
  partner: [
    "create_place_priority",
    "create_place",
    "create_itinerary", 
    "save_places", 
    "report_content", 
    "partner_badge", 
    "fast_review"
  ],
  moderator: [
    "review_content",
    "approve_content",
    "reject_content",
    "hide_content",
    "view_moderation_queue"
  ],
  admin: ["all_permissions"],
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

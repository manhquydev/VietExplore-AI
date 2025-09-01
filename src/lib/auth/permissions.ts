"use client"
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
    // Inherits traveler permissions
    "report_content",
    "create_itinerary", 
    "save_places"
  ],
  admin: ["all_permissions"], // Auto-approve places, full moderation access
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

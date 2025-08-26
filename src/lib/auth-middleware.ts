// This file is safe for both client and server.
// It only contains type definitions and non-sensitive logic.

import { UserRole } from '@/lib/types/auth';

export type Permission = 'create_place' | 'review_content' | 'manage_users' | 'admin' | 'view_moderation_queue' | 'all_permissions' | 'create_place_priority' | 'create_itinerary' | 'save_places' | 'report_content' | 'manage_drafts' | 'partner_badge' | 'fast_review';

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
    "create_itinerary", 
    "save_places", 
    "report_content", 
    "partner_badge", 
    "fast_review"
  ],
  moderator: [
    "review_content",
    "view_moderation_queue"
  ],
  admin: ["all_permissions"],
};

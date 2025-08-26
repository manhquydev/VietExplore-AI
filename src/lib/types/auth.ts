// User roles based on role-badge-logic.md
export type UserRole = "guest" | "traveler" | "contributor" | "partner" | "moderator" | "admin";

// Trust labels for content
export type TrustLabel = "community" | "contributor" | "partner" | "verified";

// User interface matching role-badge-logic requirements
export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatar?: string;
  role: UserRole;
  verified: boolean; // This is for content verification, not role verification
  createdAt: string;
  updatedAt: string;
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
    };
  };
  stats?: {
    placesContributed: number;
    itinerariesCreated: number;
    helpfulVotes: number;
  };
  permissions?: string[];
}

// Role permissions mapping
export const ROLE_PERMISSIONS = {
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
    "approve_content", 
    "reject_content", 
    "hide_content", 
    "handle_reports", 
    "view_moderation_queue"
  ],
  admin: ["all_permissions"]
} as const;

// Function to check if user has permission
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  if (user.role === "admin") return true;
  
  const rolePermissions = ROLE_PERMISSIONS[user.role] as readonly string[];
  return rolePermissions.includes(permission);
}

// Role upgrade requirements (Admin only actions)
export interface RoleUpgradeRequest {
  userId: string;
  targetRole: UserRole;
  reason: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status: "pending" | "approved" | "rejected";
}


"use client"

// This file is safe for both client and server.
// It only contains type definitions and non-sensitive logic.

export type UserRole = "guest" | "traveler" | "contributor" | "partner" | "moderator" | "admin";
export type TrustLabel = "community" | "contributor" | "partner" | "verified";

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatar?: string;
  role: UserRole;
  verified: boolean;
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
  badges?: string[];
  permissions?: string[];
  disabled?: boolean;
}

export type Permission = 
  | 'create_place' 
  | 'review_content' 
  | 'manage_users' 
  | 'admin' 
  | 'view_moderation_queue' 
  | 'all_permissions' 
  | 'create_place_priority' 
  | 'create_itinerary' 
  | 'save_places' 
  | 'report_content' 
  | 'manage_drafts' 
  | 'partner_badge' 
  | 'fast_review'
  | 'approve_content'
  | 'reject_content'
  | 'hide_content';

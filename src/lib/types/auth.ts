"use client"

// This file is safe for both client and server.
// It only contains type definitions and non-sensitive logic.

export type UserRole = "guest" | "traveler" | "contributor" | "partner" | "moderator" | "admin";
export type TrustLabel = "community" | "contributor" | "partner" | "verified" | "special_verified";

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatar?: string;
  role: UserRole;
  verified: boolean;
  emailVerified?: boolean;
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

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}

export interface ResetPasswordData {
  email: string;
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
  | 'hide_content'
  | 'claim_moderation_item'
  | 'manage_partial_admin'
  | 'manage_settings'
  | 'manage_security'
  | 'manage_notifications'
  | 'manage_maintenance'
  | 'view_audit_logs'
  | 'manage_users_advanced'
  | 'system_override'
  | 'manage_announcements'
  | 'publish_announcements';

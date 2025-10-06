/**
 * Firestore Database Schema for Du Lịch Việt-AI
 * Based on role-badge-logic.md and project requirements
 */

// Collection: users
export interface FirestoreUser {
  email: string;
  fullName: string;
  username: string;
  avatar?: string;
  role: "guest" | "traveler" | "contributor" | "partner" | "moderator" | "admin";
  verified: boolean; // Content verification, not role verification
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
  
  // Role upgrade tracking
  roleHistory?: {
    previousRole: string;
    newRole: string;
    changedBy: string;
    changedAt: string;
    reason: string;
  }[];
}

// Collection: places
export interface FirestorePlace {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  region: "bac-bo" | "trung-bo" | "nam-bo";
  province: string;
  provinceSlug: string;
  type: "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in";
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  images: {
    id: string;
    url: string;
    alt: string;
    caption?: string;
    isPrimary: boolean;
    uploadedBy: string;
    createdAt: string;
  }[];
  trustLabel: "community" | "contributor" | "partner" | "verified";
  source: {
    type: "user" | "partner" | "import";
    userId?: string;
    partnerName?: string;
    url?: string;
  };
  status: "draft" | "submitted" | "in_review" | "published" | "hidden";
  rating: {
    average: number;
    count: number;
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy: string; // User ID
  moderatedBy?: string; // User ID
  
  // Analytics
  viewCount: number;
  likeCount: number;
  reportCount: number;
  featured: boolean;
  
  // Moderation
  moderationHistory?: {
    action: string;
    moderatorId: string;
    reason?: string;
    createdAt: string;
  }[];
}

// Collection: itineraries
export interface FirestoreItinerary {
  slug: string;
  title: string;
  description: string;
  duration: number; // days
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  tripType: string;
  places: {
    id: string;
    name: string;
    day: number;
    order: number;
    duration: number; // hours
    estimatedCost: number;
    notes?: string;
  }[];
  isPublic: boolean;
  status: "draft" | "published" | "hidden";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Analytics
  viewCount: number;
  likeCount: number;
  copyCount: number; // How many times copied by others
  
  // AI Generation metadata
  aiGenerated?: boolean;
  aiPrompt?: string;
  aiModel?: string;
}

// Collection: moderation_queue
export interface FirestoreModerationItem {
  contentType: "place" | "itinerary" | "user_report";
  contentId: string;
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  
  // Content details
  content: {
    title: string;
    description: string;
    changes?: string; // What was changed
  };
  
  // Moderation details
  assignedTo?: string; // Moderator ID
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  
  // Escalation
  escalatedTo?: string;
  escalatedAt?: string;
  escalationReason?: string;
}

// Collection: user_reports
export interface FirestoreUserReport {
  reportType: "inappropriate_content" | "spam" | "copyright" | "harassment" | "other";
  targetType: "place" | "itinerary" | "user" | "comment";
  targetId: string;
  reportedBy: string;
  reason: string;
  description?: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  createdAt: string;
  
  // Resolution
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  actionTaken?: string;
}

// Collection: role_upgrade_requests
export interface FirestoreRoleUpgradeRequest {
  userId: string;
  currentRole: string;
  requestedRole: "contributor" | "partner";
  reason: string;
  evidence?: {
    type: "portfolio" | "credentials" | "recommendations";
    description: string;
    urls?: string[];
  }[];
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  
  // Review
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  
  // If approved
  approvedBy?: string;
  approvedAt?: string;
}

// Collection: analytics_events
export interface FirestoreAnalyticsEvent {
  eventType: "page_view" | "place_view" | "itinerary_view" | "search" | "place_like" | "itinerary_copy";
  userId?: string; // Anonymous if not logged in
  sessionId: string;
  
  // Event data
  data: {
    path?: string;
    placeId?: string;
    itineraryId?: string;
    searchQuery?: string;
    [key: string]: any;
  };
  
  // Metadata
  timestamp: string;
  userAgent?: string;
  ipAddress?: string; // Hashed for privacy
  referrer?: string;
}

// Firestore Security Rules Schema Reference
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  PLACES: 'places',
  ITINERARIES: 'itineraries',
  MODERATION_QUEUE: 'moderation_queue',
  USER_REPORTS: 'user_reports',
  ROLE_UPGRADE_REQUESTS: 'role_upgrade_requests',
  ANALYTICS_EVENTS: 'analytics_events',
} as const;

// Composite Indexes needed for Firestore
export const REQUIRED_INDEXES = [
  // Places
  { collection: 'places', fields: ['status', 'region', 'createdAt'] },
  { collection: 'places', fields: ['status', 'type', 'createdAt'] },
  { collection: 'places', fields: ['status', 'trustLabel', 'createdAt'] },
  { collection: 'places', fields: ['status', 'featured', 'createdAt'] },
  { collection: 'places', fields: ['createdBy', 'status', 'createdAt'] },
  
  // Moderation
  { collection: 'moderation_queue', fields: ['status', 'priority', 'submittedAt'] },
  { collection: 'moderation_queue', fields: ['assignedTo', 'status', 'submittedAt'] },
  
  // User Reports
  { collection: 'user_reports', fields: ['status', 'reportType', 'createdAt'] },
  { collection: 'user_reports', fields: ['targetType', 'targetId', 'status'] },
  
  // Analytics
  { collection: 'analytics_events', fields: ['eventType', 'timestamp'] },
  { collection: 'analytics_events', fields: ['userId', 'timestamp'] },
];

// Default user stats
export const DEFAULT_USER_STATS = {
  placesContributed: 0,
  itinerariesCreated: 0,
  helpfulVotes: 0,
};

// Default place rating
export const DEFAULT_PLACE_RATING = {
  average: 0,
  count: 0,
  breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};


// src/types/firestore.ts - Firestore Data Model Types (Tài liệu 2)
import { Timestamp } from 'firebase/firestore';

// ===============================
// 1. Users Collection
// ===============================
export interface UserProfile {
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';
  verifiedContributor: boolean;
  partnerId: string | null;
  disabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  consent: {
    privacyAcceptedAt: Timestamp;
    marketing: boolean;
  };
  // Optional stats for UI display
  stats?: {
    placesCreated: number;
    itinerariesPublic: number;
    contributionScore: number;
  };
}

// ===============================
// 2. Places Collection
// ===============================
export interface Place {
  id: string;
  name: string;                // 50-120 ký tự
  slug: string;                // không dấu, duy nhất
  region: 'bac-bo' | 'trung-bo' | 'nam-bo';
  province: string;            // ví dụ: "ha-noi"
  type: 'bien' | 'nui' | 'van-hoa' | 'am-thuc' | 'check-in';
  description: string;         // 100-1200 từ (lean: 80-400 từ)
  photos: PlacePhoto[];        // 3–5 ảnh
  sources: string[];           // link/nguồn tham khảo
  trustLabel: 'community' | 'contributor' | 'partner' | 'verified';
  createdBy: string;           // uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'published' | 'hidden';
  // Performance fields
  viewCount?: number;
  likeCount?: number;
  duplicateCount?: number;
}

export interface PlacePhoto {
  path: string;
  width: number;
  height: number;
  credit: string;
  alt?: string;
}

// ===============================
// 3. Place Drafts Collection
// ===============================
export interface PlaceDraft {
  id: string;
  title: string;              // dùng để gợi ý slug
  region: 'bac-bo' | 'trung-bo' | 'nam-bo';
  province: string;
  type: 'bien' | 'nui' | 'van-hoa' | 'am-thuc' | 'check-in';
  description: string;
  photos: PlacePhoto[];
  sources: string[];
  submitter: string;          // uid
  submitterRole: 'traveler' | 'contributor' | 'partner';
  status: 'draft' | 'submitted' | 'in_review' | 'changes_requested' | 'approved' | 'published' | 'rejected';
  linkedPlaceId: string | null;   // nếu đã publish
  moderationNotes: string | null;
  moderationId: string | null;    // link to moderation request
  createdAt: Timestamp;
  updatedAt: Timestamp;
  submittedAt?: Timestamp;
}

// ===============================
// 4. Itineraries Collection  
// ===============================
export interface Itinerary {
  id: string;
  ownerId: string;            // uid (renamed from authorId for consistency)
  title: string;
  description?: string;
  days: ItineraryDay[];
  budgetEstimate: number;
  visibility: 'private' | 'public';
  isPublic: boolean;          // Computed field for easier querying
  region?: 'bac-bo' | 'trung-bo' | 'nam-bo';
  duration: number;           // số ngày
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  // Social features
  viewCount?: number;
  duplicateCount?: number;
  likeCount?: number;
  tags?: string[];
}

export interface ItineraryDay {
  date: string;               // ISO date string
  title?: string;
  stops: ItineraryStop[];
  notes?: string;
}

export interface ItineraryStop {
  placeId: string;
  time: string;               // HH:mm format
  duration?: number;          // minutes
  notes?: string;
  estimatedCost?: number;
}

// ===============================
// 5. Itinerary Shares Collection
// ===============================
export interface ItineraryShare {
  id: string;
  itineraryId: string;
  token: string;              // mã ngắn cho link chia sẻ
  authorId: string;           // owner của itinerary
  expiresAt: Timestamp | null;
  createdAt: Timestamp;
  accessCount: number;
  isActive: boolean;
  lastAccessedAt?: Timestamp;
}

// ===============================
// 6. Suggestions Collection
// ===============================
export interface Suggestion {
  id: string;
  placeId: string;
  proposed: {
    description?: string;
    sources?: string[];
    photos?: PlacePhoto[];
    // Có thể suggest thay đổi bất kỳ field nào của Place
    [key: string]: any;
  };
  submitter: string;          // uid
  status: 'submitted' | 'in_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedBy?: string;        // moderator uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
  reviewedAt?: Timestamp;
}

// ===============================
// 7. Reports Collection
// ===============================
export interface Report {
  id: string;
  target: {
    type: 'place' | 'itinerary' | 'comment' | 'user';
    id: string;
  };
  reason: string;
  description?: string;
  evidence: string[];         // storage paths
  reporter: string | null;    // Guest có thể ẩn danh → null
  status: 'received' | 'processing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  handledBy: string | null;   // moderator uid
  resolution?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}

// ===============================
// 8. Partners Collection
// ===============================
export interface Partner {
  id: string;
  name: string;
  slug: string;
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  authorizedSubmitters: string[];  // uids
  scope: string[];            // ["province/ha-noi", "type/van-hoa"]
  status: 'active' | 'suspended';
  logo?: string;              // storage path
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===============================
// 9. Moderation Requests Collection
// ===============================
export interface ModerationRequest {
  id: string;
  type: 'place_draft' | 'suggestion' | 'report' | 'role_upgrade';
  ref: {
    collection: string;
    id: string;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submitter: string;          // uid
  submitterRole: 'traveler' | 'contributor' | 'partner';
  moderator: string | null;   // assigned moderator uid
  status: 'queued' | 'in_review' | 'approved' | 'rejected' | 'returned';
  decisionNotes: string | null;
  targetData?: any;           // snapshot của data được review
  changes?: {
    before: any;
    after: any;
    diff: any;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  assignedAt?: Timestamp;
  reviewedAt?: Timestamp;
}

// ===============================
// 10. Labels Collection
// ===============================
export interface Label {
  id: string;
  key: 'verified' | 'partner' | 'contributor' | 'community';
  displayName: string;
  description?: string;
  color: string;              // hex color
  icon?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===============================
// 11. Audits Collection
// ===============================
export interface AuditLog {
  id: string;
  actor: {
    uid: string;
    role: string;
    email?: string;
  };
  action: 'create' | 'update' | 'delete' | 'publish' | 'hide' | 'grantRole' | 'disable' | 'enable';
  target: {
    collection: string;
    id: string;
  };
  diff?: {
    before: any;
    after: any;
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  };
  createdAt: Timestamp;
}

// ===============================
// 12. System Counters Collection
// ===============================
export interface SystemCounter {
  id: string;
  key: 'places_published' | 'itineraries_public' | 'reports_open' | 'users_active' | 'drafts_pending';
  value: number;
  lastUpdatedBy?: string;     // function name or uid
  updatedAt: Timestamp;
  metadata?: {
    breakdown?: { [key: string]: number };
    trend?: 'increasing' | 'decreasing' | 'stable';
  };
}

// ===============================
// Utility Types
// ===============================
export type CollectionName = 
  | 'users'
  | 'places' 
  | 'placeDrafts'
  | 'itineraries'
  | 'itineraryShares'
  | 'suggestions'
  | 'reports'
  | 'partners'
  | 'labels'
  | 'audits';

export type UserRole = 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';

export type PlaceType = 'bien' | 'nui' | 'van-hoa' | 'am-thuc' | 'check-in';

export type Region = 'bac-bo' | 'trung-bo' | 'nam-bo';

export type ModerationStatus = 'queued' | 'in_review' | 'approved' | 'rejected' | 'returned';

export type ContentStatus = 'draft' | 'submitted' | 'published' | 'hidden' | 'rejected';

// ===============================
// API Response Types
// ===============================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===============================
// Query Filter Types
// ===============================
export interface PlaceFilters {
  region?: Region;
  province?: string;
  type?: PlaceType;
  search?: string;
  trustLabel?: string;
  limit?: number;
  offset?: number;
}

export interface ItineraryFilters {
  ownerId?: string;
  visibility?: 'private' | 'public';
  region?: Region;
  duration?: {
    min?: number;
    max?: number;
  };
  budget?: {
    min?: number;
    max?: number;
  };
  limit?: number;
  offset?: number;
}


import { TrustLabel, User } from './auth';

// Place types based on existing structure
export type PlaceType = "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in";
export type PlaceRegion = "bac-bo" | "trung-bo" | "nam-bo";
export type PlaceStatus = "draft" | "submitted" | "in_review" | "published" | "rejected" | "hidden" | "pending_edit" | "pending_deletion" | "needs_revision" | "temporarily_suspended" | "draft_edit";

export interface PlaceImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  isPrimary: boolean; // true = ảnh đại diện, false = ảnh phụ
  uploadedBy: string;
  createdAt: string;
  order?: number; // thứ tự hiển thị
}

export interface PlaceVideo {
  id: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  uploadedBy: string;
  createdAt: string;
}

export interface PlaceCoordinates {
  lat: number;
  lng: number;
}

export interface PlaceSource {
  type: "user" | "partner" | "import";
  userId?: string;
  partnerName?: string;
  url?: string;
}

export interface PlaceRating {
  average: number;
  count: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Địa chỉ hành chính Việt Nam
export interface VietnamAddress {
  provinceId: number;
  provinceName: string;
  districtId?: number;
  districtName?: string;
  wardId?: number;
  wardName?: string;
  fullAddress: string; // Địa chỉ đầy đủ
  oldProvinceId?: number; // ID tỉnh cũ trước sáp nhập
  newProvinceId?: number; // ID tỉnh mới sau sáp nhập
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  region: PlaceRegion;
  province: string;
  provinceSlug: string;
  type: PlaceType;
  coordinates?: PlaceCoordinates; // Optional vì sẽ dùng address text
  address?: string;
  vietnamAddress: VietnamAddress; // Địa chỉ hành chính chuẩn
  addressConversion?: {
    oldAddress: {
      province: { id: number, name: string }
      district: { id: number, name: string } | null
      ward: { id: number, name: string } | null
      fullAddress: string
    }
    newAddress: {
      province: { id: number, name: string }
      district: { id: number, name: string } | null
      ward: { id: number, name: string } | null
      fullAddress: string
    } | null
    hasChanges: boolean
    conversionMessage: string
    status: 'converted' | 'unchanged'
  }
  images: PlaceImage[];
  video?: PlaceVideo; // Chỉ 1 video
  trustLabel: TrustLabel;
  source: PlaceSource;
  status: PlaceStatus;
  rating: PlaceRating;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdBy: string; // User ID
  moderatedBy?: string; // User ID
  
  // Temporary suspension fields
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  suspensionExpiresAt?: string;
  suspensionType?: "violation" | "investigation" | "quality_review" | "user_request";
  
  // Additional metadata
  viewCount: number;
  likeCount: number;
  reportCount: number;
  featured: boolean;
}

// Form data for creating/editing places
export interface PlaceFormData {
  name: string;
  description: string;
  shortDescription: string;
  region: PlaceRegion;
  province: string;
  type: PlaceType;
  coordinates?: PlaceCoordinates;
  address?: string;
  vietnamAddress: VietnamAddress;
  images: File[] | PlaceImage[]; // Bắt buộc có ít nhất 1 ảnh
  video?: File | PlaceVideo; // Tối đa 1 video
  tags: string[];
}

// Place search filters
export interface PlaceFilters {
  region?: PlaceRegion;
  province?: string;
  type?: PlaceType;
  trustLabel?: TrustLabel;
  tags?: string[];
  minRating?: number;
  search?: string;
  sortBy?: "newest" | "oldest" | "rating" | "popular";
  limit?: number;
  offset?: number;
}

// Place moderation
export interface PlaceModerationAction {
  id: string;
  placeId: string;
  action: "approve" | "reject" | "hide" | "feature" | "verify" | "direct_delete" | "request_edit" | "suspend_temporary" | "unsuspend" | "force_edit";
  reason?: string;
  moderatorId: string;
  createdAt: string;
  previousStatus: PlaceStatus;
  newStatus: PlaceStatus;
  suspensionData?: {
    duration: number; // hours
    type: "violation" | "investigation" | "quality_review" | "user_request";
    autoExpire: boolean;
  };
}

// Temporary suspension request
export interface TemporarySuspensionRequest {
  placeId: string;
  reason: string;
  duration: number; // hours, max 168 (7 days)
  type: "violation" | "investigation" | "quality_review" | "user_request";
  autoExpire?: boolean;
  notifyOwner?: boolean;
}

// Moderation queue item
export interface ModerationQueueItem {
  id: string;
  itemType: "place_submission" | "place_edit" | "place_deletion" | "place_reports_review";
  contentType: "place";
  contentId: string;
  itemId: string;
  status: "pending" | "claimed" | "in_review" | "approved" | "rejected" | "escalated";
  priority: "urgent" | "high" | "medium" | "low";
  queueType: "partner_queue" | "contributor_queue";
  
  // Claim mechanism
  claimedBy?: string;
  claimedAt?: string;
  claimExpiresAt?: string; // Auto-release after 2 hours if no action
  
  // Submission data
  submittedBy: string;
  submittedAt: string;
  
  // Review data
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  
  // Escalation data  
  escalatedTo?: "admin";
  escalatedAt?: string;
  escalationReason?: string;
  
  // Content data for edit requests
  originalData?: any;
  editedData?: any;
  
  // Metadata
  metadata?: {
    editDraftId?: string;
    reason?: string;
    [key: string]: any;
  };
}


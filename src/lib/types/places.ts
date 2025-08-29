import { TrustLabel, User } from './auth';

// Place types based on existing structure
export type PlaceType = "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in";
export type PlaceRegion = "bac-bo" | "trung-bo" | "nam-bo";
export type PlaceStatus = "draft" | "submitted" | "in_review" | "published" | "rejected" | "hidden";

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
  action: "approve" | "reject" | "hide" | "feature" | "verify";
  reason?: string;
  moderatorId: string;
  createdAt: string;
  previousStatus: PlaceStatus;
  newStatus: PlaceStatus;
}


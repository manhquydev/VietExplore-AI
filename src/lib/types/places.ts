import { TrustLabel, User } from './auth';

// Place types based on existing structure
export type PlaceType = "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in";
export type PlaceRegion = "bac-bo" | "trung-bo" | "nam-bo";
export type PlaceStatus = "draft" | "submitted" | "in_review" | "published" | "hidden";

export interface PlaceImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  isPrimary: boolean;
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
  coordinates: PlaceCoordinates;
  address?: string;
  images: PlaceImage[];
  trustLabel: TrustLabel;
  source: PlaceSource;
  status: PlaceStatus;
  rating: PlaceRating;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
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
  coordinates: PlaceCoordinates;
  address?: string;
  images: File[] | PlaceImage[];
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


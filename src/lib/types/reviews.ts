export interface PlaceReview {
  id: string;
  placeId: string;
  placeName: string;
  userId: string;
  userInfo: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  rating: number; // 1-5 stars
  title?: string;
  content: string;
  images?: string[]; // Optional review images
  visitDate?: string; // When user visited the place
  isAnonymous: boolean;
  isVerified: boolean; // If user actually visited (based on check-ins, etc)
  helpfulCount: number; // How many found this review helpful
  reportCount: number;
  status: 'published' | 'hidden' | 'pending'; 
  createdAt: string;
  updatedAt: string;
  moderatedBy?: string;
}

export interface ReviewFormData {
  placeId: string;
  rating: number;
  title?: string;
  content: string;
  images?: File[] | string[];
  visitDate?: string;
  isAnonymous?: boolean;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: PlaceReview[];
}
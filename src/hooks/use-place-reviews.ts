"use client"

import { useState, useEffect } from 'react';
import { PlaceReview, ReviewFormData, ReviewStats } from '@/lib/types/reviews';
import { useAuth } from '@/components/auth/auth-provider';
import { authenticatedFetch } from '@/lib/utils/api';

interface UseReviewsResult {
  reviews: PlaceReview[];
  stats: ReviewStats | null;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  userReview: PlaceReview | null;
  hasUserReviewed: boolean;
  submitReview: (reviewData: ReviewFormData) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface UseReviewsOptions {
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
  limit?: number;
}

export function usePlaceReviews(
  placeId: string, 
  options: UseReviewsOptions = {}
): UseReviewsResult {
  const { isAuthenticated, user } = useAuth();
  const { sortBy = 'newest', limit = 10 } = options;
  
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [userReview, setUserReview] = useState<PlaceReview | null>(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  const loadReviews = async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const response = await authenticatedFetch(
        `/api/places/${placeId}/reviews?limit=${limit}&offset=${currentOffset}&sortBy=${sortBy}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Place not found, set empty state but don't error
          setReviews([]);
          setStats({
            totalReviews: 0,
            averageRating: 0,
            ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            recentReviews: []
          });
          setHasMore(false);
          return;
        }
        if (response.status === 500) {
          // Server error (like missing index), set empty state
          setReviews([]);
          setStats({
            totalReviews: 0,
            averageRating: 0,
            ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            recentReviews: []
          });
          setHasMore(false);
          console.warn('Reviews API error (likely missing Firestore index):', response.statusText);
          return;
        }
        throw new Error('Không thể tải đánh giá');
      }

      const data = await response.json();
      
      if (reset) {
        setReviews(data.data);
        setOffset(limit);
      } else {
        setReviews(prev => [...prev, ...data.data]);
        setOffset(prev => prev + limit);
      }
      
      // Check if current user has reviewed this place
      if (isAuthenticated && user) {
        const currentUserReview = data.data?.find((review: PlaceReview) => review.userId === user.id);
        setUserReview(currentUserReview || null);
        setHasUserReviewed(!!currentUserReview);
      } else {
        setUserReview(null);
        setHasUserReviewed(false);
      }
      
      setStats(data.stats);
      setHasMore(data.pagination?.hasMore || false);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async (reviewData: ReviewFormData) => {
    if (!isAuthenticated) {
      setError('Bạn cần đăng nhập để đánh giá');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await authenticatedFetch(`/api/places/${placeId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Bạn cần đăng nhập để đánh giá địa điểm');
        }
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Không thể gửi đánh giá');
        } catch (parseError) {
          // If response can't be parsed as JSON, use status text
          throw new Error(`Không thể gửi đánh giá: ${response.statusText || 'Lỗi máy chủ'}`);
        }
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Phản hồi từ máy chủ không hợp lệ');
      }
      
      // Add the new review to the top of the list and update user review status
      if (result.data) {
        setReviews(prev => [result.data, ...prev]);
        setUserReview(result.data);
        setHasUserReviewed(true);
        
        // Update stats if available
        if (result.data.rating && stats) {
          const newStats = {
            ...stats,
            totalReviews: stats.totalReviews + 1,
            averageRating: result.data.rating.average || stats.averageRating,
            ratingBreakdown: {
              ...stats.ratingBreakdown,
              [reviewData.rating]: (stats.ratingBreakdown[reviewData.rating as keyof typeof stats.ratingBreakdown] || 0) + 1
            }
          };
          setStats(newStats);
        }
      }

      // Refresh the reviews to get accurate stats
      await loadReviews(true);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
      console.error('Error submitting review:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (hasMore && !isLoading) {
      await loadReviews(false);
    }
  };

  const refresh = async () => {
    await loadReviews(true);
  };

  useEffect(() => {
    if (placeId) {
      loadReviews(true);
    }
  }, [placeId, sortBy]);

  return {
    reviews,
    stats,
    isLoading,
    hasMore,
    error,
    userReview,
    hasUserReviewed,
    submitReview,
    loadMore,
    refresh
  };
}
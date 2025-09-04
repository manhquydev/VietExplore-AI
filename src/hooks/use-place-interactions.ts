"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { authenticatedFetch } from '@/lib/utils/api';
import RealtimeService from '@/lib/firebase/realtime';

interface PlaceInteractions {
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  saveCount: number;
}

interface UseInteractionsResult {
  interactions: PlaceInteractions;
  isLoading: boolean;
  toggleLike: () => Promise<void>;
  toggleSave: () => Promise<void>;
  error: string | null;
}

export function usePlaceInteractions(placeId: string, initialLikeCount = 0): UseInteractionsResult {
  const { isAuthenticated, user } = useAuth();
  const [interactions, setInteractions] = useState<PlaceInteractions>({
    isLiked: false,
    isSaved: false,
    likeCount: initialLikeCount,
    saveCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time place stats
  useEffect(() => {
    if (!placeId) return;

    const unsubscribe = RealtimeService.subscribeToPlaceStats(placeId, (stats) => {
      setInteractions(prev => ({
        ...prev,
        likeCount: stats.likes,
        saveCount: stats.saves
      }));
    });

    return unsubscribe;
  }, [placeId]);

  // Check if user has liked/saved this place
  useEffect(() => {
    if (!isAuthenticated || !placeId || !user?.id) return;

    const checkInteractions = async () => {
      try {
        setIsLoading(true);
        
        const [favoriteResponse, savedResponse, likedPlaces, savedPlaces] = await Promise.all([
          authenticatedFetch(`/api/places/${placeId}/favorite`),
          authenticatedFetch(`/api/places/${placeId}/saved`),
          RealtimeService.getUserInteractions(user.id, 'like'),
          RealtimeService.getUserInteractions(user.id, 'save')
        ]);

        setInteractions(prev => ({
          ...prev,
          isLiked: likedPlaces.includes(placeId),
          isSaved: savedPlaces.includes(placeId)
        }));

        if (favoriteResponse.ok) {
          const favoriteData = await favoriteResponse.json();
          const isLiked = favoriteData.data?.liked || false;
          if (isLiked !== likedPlaces.includes(placeId)) {
            setInteractions(prev => ({ ...prev, isLiked }));
          }
        }

        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const isSaved = savedData.data?.saved || false;
          if (isSaved !== savedPlaces.includes(placeId)) {
            setInteractions(prev => ({ ...prev, isSaved }));
          }
        }
      } catch (error) {
        console.error('Error checking interactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkInteractions();
  }, [placeId, isAuthenticated, user?.id]);

  const toggleLike = async () => {
    if (!isAuthenticated || !user?.id) {
      setError('Bạn cần đăng nhập để thêm yêu thích');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const isCurrentlyLiked = interactions.isLiked;
      const method = isCurrentlyLiked ? 'DELETE' : 'POST';
      
      // Optimistically update UI
      setInteractions(prev => ({
        ...prev,
        isLiked: !isCurrentlyLiked,
        likeCount: prev.likeCount + (isCurrentlyLiked ? -1 : 1)
      }));

      const response = await authenticatedFetch(`/api/places/${placeId}/favorite`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setInteractions(prev => ({
          ...prev,
          isLiked: isCurrentlyLiked,
          likeCount: prev.likeCount + (isCurrentlyLiked ? 1 : -1)
        }));
        
        if (response.status === 401) {
          setError('Bạn cần đăng nhập để thêm yêu thích');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể thực hiện thao tác');
      }

      const data = await response.json();
      
      // Update real-time database
      if (!isCurrentlyLiked) {
        await RealtimeService.recordUserInteraction(user.id, placeId, 'like');
        await RealtimeService.updatePlaceStats(placeId, 'likes', 1);
      } else {
        await RealtimeService.removeUserInteraction(user.id, placeId, 'like');
        await RealtimeService.updatePlaceStats(placeId, 'likes', -1);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSave = async () => {
    if (!isAuthenticated || !user?.id) {
      setError('Bạn cần đăng nhập để lưu địa điểm');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const isCurrentlySaved = interactions.isSaved;
      const method = isCurrentlySaved ? 'DELETE' : 'POST';
      
      // Optimistically update UI
      setInteractions(prev => ({
        ...prev,
        isSaved: !isCurrentlySaved,
        saveCount: prev.saveCount + (isCurrentlySaved ? -1 : 1)
      }));

      const response = await authenticatedFetch(`/api/places/${placeId}/saved`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setInteractions(prev => ({
          ...prev,
          isSaved: isCurrentlySaved,
          saveCount: prev.saveCount + (isCurrentlySaved ? 1 : -1)
        }));
        
        if (response.status === 401) {
          setError('Bạn cần đăng nhập để lưu địa điểm');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể thực hiện thao tác');
      }

      const data = await response.json();
      
      // Update real-time database
      if (!isCurrentlySaved) {
        await RealtimeService.recordUserInteraction(user.id, placeId, 'save');
        await RealtimeService.updatePlaceStats(placeId, 'saves', 1);
      } else {
        await RealtimeService.removeUserInteraction(user.id, placeId, 'save');
        await RealtimeService.updatePlaceStats(placeId, 'saves', -1);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    interactions,
    isLoading,
    toggleLike,
    toggleSave,
    error
  };
}
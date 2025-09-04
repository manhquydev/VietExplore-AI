"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { authenticatedFetch } from '@/lib/utils/api';

interface CollectionItem {
  id: string;
  placeId: string;
  savedAt?: string;
  favoritedAt?: string;
  place: {
    id: string;
    name: string;
    shortDescription: string;
    type: string;
    region: string;
    province: string;
    images: Array<{
      id: string;
      url: string;
      alt: string;
      isPrimary: boolean;
    }>;
    rating: {
      average: number;
      count: number;
    };
    tags: string[];
    viewCount: number;
    likeCount: number;
  };
}

interface UseCollectionsResult {
  favorites: CollectionItem[];
  savedPlaces: CollectionItem[];
  isLoading: boolean;
  error: string | null;
  refreshFavorites: () => Promise<void>;
  refreshSaved: () => Promise<void>;
  removeFavorite: (favoriteId: string) => Promise<void>;
  removeSaved: (savedId: string) => Promise<void>;
}

interface UseCollectionsOptions {
  limit?: number;
  autoLoad?: boolean;
}

export function useUserCollections(options: UseCollectionsOptions = {}): UseCollectionsResult {
  const { isAuthenticated } = useAuth();
  const { limit = 20, autoLoad = true } = options;
  
  const [favorites, setFavorites] = useState<CollectionItem[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authenticatedFetch(`/api/user/favorites?limit=${limit}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setFavorites([]);
          return;
        }
        throw new Error('Không thể tải danh sách yêu thích');
      }

      const data = await response.json();
      setFavorites(data.data || []);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSaved = async () => {
    if (!isAuthenticated) {
      setSavedPlaces([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authenticatedFetch(`/api/user/saved?limit=${limit}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setSavedPlaces([]);
          return;
        }
        throw new Error('Không thể tải danh sách đã lưu');
      }

      const data = await response.json();
      setSavedPlaces(data.data || []);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
      console.error('Error loading saved places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      // Find the favorite item to get placeId
      const favoriteItem = favorites.find(f => f.id === favoriteId);
      if (!favoriteItem) return;

      const response = await authenticatedFetch(`/api/places/${favoriteItem.placeId}/favorite`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Không thể xóa yêu thích');
      }

      // Remove from local state
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
      console.error('Error removing favorite:', error);
    }
  };

  const removeSaved = async (savedId: string) => {
    try {
      // Find the saved item to get placeId
      const savedItem = savedPlaces.find(s => s.id === savedId);
      if (!savedItem) return;

      const response = await authenticatedFetch(`/api/places/${savedItem.placeId}/saved`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Không thể xóa địa điểm đã lưu');
      }

      // Remove from local state
      setSavedPlaces(prev => prev.filter(s => s.id !== savedId));
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
      console.error('Error removing saved place:', error);
    }
  };

  // Auto-load on mount and auth changes
  useEffect(() => {
    if (autoLoad && isAuthenticated) {
      refreshFavorites();
      refreshSaved();
    } else if (!isAuthenticated) {
      setFavorites([]);
      setSavedPlaces([]);
    }
  }, [isAuthenticated, autoLoad]);

  return {
    favorites,
    savedPlaces,
    isLoading,
    error,
    refreshFavorites,
    refreshSaved,
    removeFavorite,
    removeSaved
  };
}
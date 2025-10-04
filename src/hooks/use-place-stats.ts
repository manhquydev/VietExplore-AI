/**
 * Shared Hook: usePlaceStats
 *
 * Centralized hook for displaying place statistics (views, likes, saves)
 * Ensures consistent display pattern across all components.
 *
 * Features:
 * - Real-time stats subscription from Realtime Database
 * - Falls back to Firestore data when realtime not available
 * - Uses Math.max() to handle race conditions
 * - Auto-formats numbers with Vietnamese locale
 *
 * Usage:
 * ```tsx
 * const stats = usePlaceStats(place.id, {
 *   initialViews: place.viewCount,
 *   initialLikes: place.likeCount,
 *   initialSaves: place.saveCount
 * });
 *
 * return <div>{stats.views} lượt xem</div>
 * ```
 *
 * @see place-detail-content.tsx - Example implementation
 * @see place-card.tsx - Example implementation
 */

import { useState, useEffect } from 'react';

export interface PlaceStatsOptions {
  initialViews?: number;
  initialLikes?: number;
  initialSaves?: number;
  enableRealtime?: boolean; // Default: true
}

export interface PlaceStats {
  views: number;
  likes: number;
  saves: number;
  isRealtime: boolean; // Indicates if stats are from realtime subscription
  formattedViews: string;
  formattedLikes: string;
  formattedSaves: string;
}

/**
 * Hook to manage place statistics with real-time updates
 */
export function usePlaceStats(
  placeId: string,
  options: PlaceStatsOptions = {}
): PlaceStats {
  const {
    initialViews = 0,
    initialLikes = 0,
    initialSaves = 0,
    enableRealtime = true,
  } = options;

  // State for each stat
  const [views, setViews] = useState(initialViews);
  const [likes, setLikes] = useState(initialLikes);
  const [saves, setSaves] = useState(initialSaves);
  const [isRealtime, setIsRealtime] = useState(false);

  // Subscribe to realtime stats if enabled
  useEffect(() => {
    if (!enableRealtime || !placeId) return;

    let unsubscribe: (() => void) | undefined;

    const subscribeToStats = async () => {
      try {
        const { RealtimeService } = await import('@/lib/firebase/realtime');

        unsubscribe = RealtimeService.subscribeToPlaceStats(
          placeId,
          (realtimeStats) => {
            // Use Math.max to ensure we always show the highest value
            // This handles race conditions between Firestore and Realtime DB
            const newViews = Math.max(realtimeStats.views || 0, views);
            const newLikes = Math.max(realtimeStats.likes || 0, likes);
            const newSaves = Math.max(realtimeStats.saves || 0, saves);

            // Only update if values actually changed
            if (newViews !== views) setViews(newViews);
            if (newLikes !== likes) setLikes(newLikes);
            if (newSaves !== saves) setSaves(newSaves);

            setIsRealtime(true);
          }
        );
      } catch (error) {
        console.error('[USE_PLACE_STATS] Failed to subscribe:', error);
        setIsRealtime(false);
      }
    };

    subscribeToStats();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [placeId, enableRealtime, views, likes, saves]);

  // Format numbers with Vietnamese locale
  const formattedViews = views.toLocaleString('vi-VN');
  const formattedLikes = likes.toLocaleString('vi-VN');
  const formattedSaves = saves.toLocaleString('vi-VN');

  return {
    views,
    likes,
    saves,
    isRealtime,
    formattedViews,
    formattedLikes,
    formattedSaves,
  };
}

/**
 * Hook for optimistic view tracking
 * Automatically increments view count on mount with optimistic UI update
 *
 * Usage:
 * ```tsx
 * const { viewCount, isTracking } = useViewTracking(place.id, place.viewCount);
 * ```
 */
export function useViewTracking(
  placeId: string,
  initialViewCount: number = 0
): {
  viewCount: number;
  isTracking: boolean;
  hasTracked: boolean;
} {
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [isTracking, setIsTracking] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    if (hasTracked || !placeId) return;

    const trackView = async () => {
      setIsTracking(true);

      try {
        // Optimistic update - increment immediately
        setViewCount((prev) => prev + 1);

        // Call API to track view
        const response = await fetch(`/api/places/${placeId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Update with actual value from server
            setViewCount(data.data.viewCount || initialViewCount);
          }
        } else {
          // Rollback optimistic update on error
          setViewCount(initialViewCount);
        }
      } catch (error) {
        console.error('[USE_VIEW_TRACKING] Failed to track view:', error);
        // Rollback optimistic update on error
        setViewCount(initialViewCount);
      } finally {
        setIsTracking(false);
        setHasTracked(true);
      }
    };

    trackView();
  }, [placeId, hasTracked, initialViewCount]);

  return {
    viewCount,
    isTracking,
    hasTracked,
  };
}

/**
 * Utility function to format large numbers compactly
 * Examples: 1234 → "1.2K", 1234567 → "1.2M"
 */
export function formatCompactNumber(num: number, locale: string = 'vi-VN'): string {
  if (num < 1000) {
    return num.toString();
  }

  const formatter = new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });

  return formatter.format(num);
}

/**
 * Hook for combined stats with compact formatting
 * Useful for card/list views where space is limited
 */
export function usePlaceStatsCompact(
  placeId: string,
  options: PlaceStatsOptions = {}
): PlaceStats & {
  compactViews: string;
  compactLikes: string;
  compactSaves: string;
} {
  const stats = usePlaceStats(placeId, options);

  return {
    ...stats,
    compactViews: formatCompactNumber(stats.views),
    compactLikes: formatCompactNumber(stats.likes),
    compactSaves: formatCompactNumber(stats.saves),
  };
}

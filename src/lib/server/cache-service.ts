import { revalidatePath, revalidateTag } from 'next/cache';

export class CacheService {
  /**
   * Revalidate place-specific pages when place is published/updated
   * Section 2.2.2: "Trigger ISR revalidation cho related pages"
   */
  static async revalidatePlace(placeId: string, placeSlug?: string): Promise<void> {
    try {
      // Revalidate specific place page
      if (placeSlug) {
        revalidatePath(`/places/${placeSlug}`);
      }
      revalidatePath(`/places/${placeId}`);
      
      // Revalidate place detail API
      revalidateTag(`place-${placeId}`);
      
      console.log(`ISR revalidated cache for place ${placeId}`);
    } catch (error) {
      console.error('Error revalidating place cache:', error);
    }
  }

  /**
   * Immediate cache purge via Vercel API - Section 2.4.1
   * "Immediate cache purge qua Vercel API"
   */
  static async purgeCacheImmediate(paths: string[]): Promise<void> {
    try {
      // If running on Vercel, use Vercel API for immediate purge
      if (process.env.VERCEL_URL && process.env.VERCEL_TOKEN) {
        const purgePromises = paths.map(async (path) => {
          try {
            const response = await fetch(`https://api.vercel.com/v1/purge`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                paths: [path]
              })
            });
            
            if (!response.ok) {
              console.warn(`Failed to purge ${path} via Vercel API`);
            }
          } catch (error) {
            console.error(`Error purging ${path}:`, error);
          }
        });

        await Promise.all(purgePromises);
        console.log(`Immediate cache purge completed for ${paths.length} paths`);
      } else {
        // Fallback to Next.js revalidation
        paths.forEach(path => {
          revalidatePath(path);
        });
        console.log(`Fallback revalidation completed for ${paths.length} paths`);
      }
    } catch (error) {
      console.error('Error during immediate cache purge:', error);
    }
  }

  /**
   * Revalidate category and listing pages when new place is published
   * Section 2.2.2: "Clear CDN cache cho category pages"
   */
  static async revalidatePlaceListings(
    region?: string, 
    province?: string, 
    type?: string
  ): Promise<void> {
    try {
      // Build paths to clear from CDN
      const pathsToClear: string[] = [
        '/places',
        '/'
      ];

      // Revalidate main places listing
      revalidatePath('/places');
      revalidateTag('places-list');
      
      // Revalidate region-specific pages
      if (region) {
        const regionPath = `/places/${region}`;
        pathsToClear.push(regionPath);
        revalidatePath(regionPath);
        revalidateTag(`places-${region}`);
      }
      
      // Revalidate province-specific pages
      if (province && region) {
        const provincePath = `/places/${region}/${province}`;
        pathsToClear.push(provincePath);
        revalidatePath(provincePath);
        revalidateTag(`places-${province}`);
      }
      
      // Revalidate type-specific pages
      if (type) {
        const typePath = `/places/types/${type}`;
        pathsToClear.push(typePath);
        revalidatePath(typePath);
        revalidateTag(`places-type-${type}`);
      }
      
      // Clear CDN cache for category pages as specified
      await this.purgeCacheImmediate(pathsToClear);
      
      // Revalidate home page (might show featured places)
      revalidatePath('/');
      
      console.log('CDN cache cleared and ISR revalidated for place listing caches');
    } catch (error) {
      console.error('Error revalidating place listing cache:', error);
    }
  }

  /**
   * Revalidate search index and filters
   */
  static async revalidateSearch(): Promise<void> {
    try {
      revalidateTag('search-index');
      revalidateTag('place-filters');
      
      console.log('Revalidated search cache');
    } catch (error) {
      console.error('Error revalidating search cache:', error);
    }
  }

  /**
   * Revalidate popular/trending places
   */
  static async revalidatePopular(): Promise<void> {
    try {
      revalidateTag('popular-places');
      revalidateTag('trending-places');
      
      console.log('Revalidated popular places cache');
    } catch (error) {
      console.error('Error revalidating popular places cache:', error);
    }
  }

  /**
   * Clear all place-related caches (use sparingly)
   */
  static async revalidateAll(): Promise<void> {
    try {
      // Revalidate critical paths
      revalidatePath('/');
      revalidatePath('/places');
      revalidatePath('/places/bac-bo');
      revalidatePath('/places/trung-bo');
      revalidatePath('/places/nam-bo');
      
      // Revalidate critical tags
      revalidateTag('places-list');
      revalidateTag('popular-places');
      revalidateTag('search-index');
      
      console.log('Performed full cache revalidation');
    } catch (error) {
      console.error('Error during full cache revalidation:', error);
    }
  }

  /**
   * Comprehensive revalidation when place is approved
   */
  static async revalidatePlaceApproval(place: {
    id: string;
    slug?: string;
    region?: string;
    province?: string;
    type?: string;
    featured?: boolean;
  }): Promise<void> {
    try {
      // Revalidate the specific place
      await this.revalidatePlace(place.id, place.slug);
      
      // Revalidate listings that this place would appear in
      await this.revalidatePlaceListings(place.region, place.province, place.type);
      
      // Revalidate search to include new place
      await this.revalidateSearch();
      
      // If featured, revalidate popular places
      if (place.featured) {
        await this.revalidatePopular();
      }
      
      console.log(`Full revalidation completed for approved place ${place.id}`);
    } catch (error) {
      console.error('Error during place approval revalidation:', error);
    }
  }

  /**
   * Revalidation when place is hidden/deleted
   */
  static async revalidatePlaceRemoval(place: {
    id: string;
    slug?: string;
    region?: string;
    province?: string;
    type?: string;
  }): Promise<void> {
    try {
      // Clear the specific place page (will now show 404)
      await this.revalidatePlace(place.id, place.slug);
      
      // Revalidate listings to remove the place
      await this.revalidatePlaceListings(place.region, place.province, place.type);
      
      // Revalidate search index
      await this.revalidateSearch();
      
      console.log(`Cache cleared for removed place ${place.id}`);
    } catch (error) {
      console.error('Error during place removal revalidation:', error);
    }
  }
}

/**
 * Cache configuration for different types of content
 */
export const CACHE_CONFIG = {
  // Static pages that rarely change
  STATIC: {
    revalidate: 3600, // 1 hour
    tags: ['static-content']
  },
  
  // Place listings - moderate change frequency
  PLACE_LISTINGS: {
    revalidate: 300, // 5 minutes
    tags: ['places-list']
  },
  
  // Popular places - changes based on user activity
  POPULAR: {
    revalidate: 600, // 10 minutes
    tags: ['popular-places']
  },
  
  // Individual places - can change when edited
  PLACE_DETAIL: {
    revalidate: 1800, // 30 minutes
    tags: ['place-detail']
  },
  
  // Search results - need to be relatively fresh
  SEARCH: {
    revalidate: 180, // 3 minutes
    tags: ['search-results']
  }
};

/**
 * Helper function to get cache headers for API responses
 */
export function getCacheHeaders(type: keyof typeof CACHE_CONFIG) {
  const config = CACHE_CONFIG[type];
  return {
    'Cache-Control': `public, s-maxage=${config.revalidate}, stale-while-revalidate`,
    'CDN-Cache-Control': `public, max-age=${config.revalidate}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${config.revalidate}`
  };
}
import DestinationCard, { type Destination } from './destination-card';
import { usePlaces } from '@/hooks/use-places';
import { Skeleton } from '@/components/ui/skeleton';

// Map Place to Destination format for compatibility
function mapPlaceToDestination(place: any): Destination {
  return {
    id: place.id,
    name: place.name,
    location: place.province,
    description: place.shortDescription,
    image: place.images[0]?.url || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop&q=80',
    'data-ai-hint': place.slug || place.id,
    rating: place.rating?.average || 0,
    reviews: place.rating?.count || 0,
    type: place.trustLabel || 'community',
    slug: place.slug // Pass slug for URL generation
  };
}

export default function DestinationGrid() {
  // Get featured places with high ratings and verified status
  const { places, loading, error } = usePlaces({
    sortBy: 'rating',
    limit: 6,
    featured: true
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`loading-${i}`} className="glass-card p-0 overflow-hidden">
            <Skeleton className="aspect-[3/2] w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          Tải lại
        </button>
      </div>
    );
  }

  // Convert places to destination format for compatibility
  const destinations = places.slice(0, 6).map(mapPlaceToDestination);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {destinations.map((destination) => (
        <DestinationCard key={destination.id} destination={destination} />
      ))}
    </div>
  );
}

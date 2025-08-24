import { useEffect, useState } from 'react';
import DestinationCard from './destination-card';
import { Place } from '@/types/firestore';

export default function DestinationGrid() {
  const [destinations, setDestinations] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedPlaces = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/places/featured');
        if (!response.ok) {
          throw new Error('Failed to fetch featured places');
        }
        const data = await response.json();
        if (data.success) {
          setDestinations(data.places);
        } else {
          throw new Error(data.error || 'API returned an error');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPlaces();
  }, []);

  if (loading) {
    // Optional: Render skeleton loaders
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Could not load destinations: {error}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {destinations.map((destination) => (
        <DestinationCard key={destination.id} destination={destination} />
      ))}
    </div>
  );
}

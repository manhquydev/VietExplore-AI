import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Place, PlaceFilters } from '@/lib/types/places';

export function usePlaces(filters: PlaceFilters = {}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true);
      setError(null);

      try {
        const result = await apiClient.places.list(filters);
        
        if (result.success && result.data) {
          setPlaces(result.data);
        } else {
          setError(result.error || 'Không thể tải danh sách địa điểm');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu');
        console.error('Error fetching places:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, [JSON.stringify(filters)]);

  const refetch = () => {
    fetchPlaces();
  };

  return {
    places,
    loading,
    error,
    refetch
  };
}

export function usePlace(id: string) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchPlace() {
      setLoading(true);
      setError(null);

      try {
        const result = await apiClient.places.getById(id);
        
        if (result.success && result.data) {
          setPlace(result.data);
        } else {
          setError(result.error || 'Không thể tải thông tin địa điểm');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu');
        console.error('Error fetching place:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlace();
  }, [id]);

  return {
    place,
    loading,
    error
  };
}


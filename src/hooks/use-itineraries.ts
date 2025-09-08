// src/hooks/use-itineraries.ts
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { auth } from '@/lib/firebase'
import type { 
  Itinerary, 
  CreateItineraryInput, 
  UpdateItineraryInput, 
  ItineraryFilters 
} from '@/lib/types/itineraries'

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser
  if (!user) {
    throw new Error('Authentication required')
  }

  const token = await user.getIdToken()
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
}

interface UseItinerariesResult {
  itineraries: Itinerary[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    offset: number
    limit: number
    hasMore: boolean
  }
  stats?: {
    total: number
    draft: number
    published: number
    public: number
    private: number
    totalViews: number
    totalLikes: number
  }
  refetch: () => Promise<void>
  loadMore: () => Promise<void>
}

interface UseItinerariesOptions {
  filters?: Partial<ItineraryFilters>
  autoFetch?: boolean
}

// Hook for listing itineraries
export function useItineraries(options: UseItinerariesOptions = {}): UseItinerariesResult {
  const { filters = {}, autoFetch = true } = options
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    offset: 0,
    limit: 20,
    hasMore: false
  })
  const [stats, setStats] = useState<UseItinerariesResult['stats']>()

  const fetchItineraries = useCallback(async (reset: boolean = true) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      // Apply filters
      if (filters.status) searchParams.append('status', filters.status)
      if (filters.tripType) searchParams.append('tripType', filters.tripType)
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.sortBy) searchParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) searchParams.append('sortOrder', filters.sortOrder)
      
      searchParams.append('limit', (filters.limit || 20).toString())
      searchParams.append('offset', reset ? '0' : pagination.offset.toString())

      const response = await fetch(`/api/itineraries?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch itineraries')
      }

      const data = await response.json()
      
      setItineraries(prev => reset ? data.data : [...prev, ...data.data])
      setPagination(data.pagination)
      
      if (data.stats) {
        setStats(data.stats)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.offset])

  const refetch = useCallback(() => fetchItineraries(true), [fetchItineraries])
  const loadMore = useCallback(() => fetchItineraries(false), [fetchItineraries])

  useEffect(() => {
    if (autoFetch) {
      fetchItineraries(true)
    }
  }, [autoFetch, fetchItineraries])

  return {
    itineraries,
    loading,
    error,
    pagination,
    stats,
    refetch,
    loadMore
  }
}

// Hook for user's own itineraries
export function useMyItineraries(options: UseItinerariesOptions = {}): UseItinerariesResult {
  const { filters = {}, autoFetch = true } = options
  const { isAuthenticated } = useAuth()
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    offset: 0,
    limit: 20,
    hasMore: false
  })
  const [stats, setStats] = useState<UseItinerariesResult['stats']>()

  const fetchMyItineraries = useCallback(async (reset: boolean = true) => {
    if (!isAuthenticated) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      if (filters.status) searchParams.append('status', filters.status)
      if (filters.tripType) searchParams.append('tripType', filters.tripType)
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.sortBy) searchParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) searchParams.append('sortOrder', filters.sortOrder)
      
      searchParams.append('limit', (filters.limit || 20).toString())
      searchParams.append('offset', reset ? '0' : pagination.offset.toString())

      const response = await makeAuthenticatedRequest(`/api/itineraries/my?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch your itineraries')
      }

      const data = await response.json()
      
      setItineraries(prev => reset ? data.data : [...prev, ...data.data])
      setPagination(data.pagination)
      setStats(data.stats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, filters, pagination.offset])

  const refetch = useCallback(() => fetchMyItineraries(true), [fetchMyItineraries])
  const loadMore = useCallback(() => fetchMyItineraries(false), [fetchMyItineraries])

  useEffect(() => {
    if (autoFetch && isAuthenticated) {
      fetchMyItineraries(true)
    }
  }, [autoFetch, isAuthenticated, fetchMyItineraries])

  return {
    itineraries,
    loading,
    error,
    pagination,
    stats,
    refetch,
    loadMore
  }
}

// Hook for single itinerary CRUD operations
export function useItinerary(id?: string) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch single itinerary
  const fetchItinerary = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/itineraries/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Itinerary not found')
        }
        throw new Error('Failed to fetch itinerary')
      }

      const data = await response.json()
      setItinerary(data.data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setItinerary(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  // Create new itinerary
  const createItinerary = useCallback(async (data: CreateItineraryInput): Promise<Itinerary | null> => {
    setSaving(true)
    setError(null)

    try {
      const response = await makeAuthenticatedRequest('/api/itineraries', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create itinerary')
      }

      const result = await response.json()
      const newItinerary = result.data
      
      setItinerary(newItinerary)
      return newItinerary
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setSaving(false)
    }
  }, [])

  // Update existing itinerary
  const updateItinerary = useCallback(async (data: UpdateItineraryInput): Promise<boolean> => {
    if (!id) return false

    setSaving(true)
    setError(null)

    try {
      const response = await makeAuthenticatedRequest(`/api/itineraries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update itinerary')
      }

      const result = await response.json()
      setItinerary(result.data)
      return true
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setSaving(false)
    }
  }, [id])

  // Delete itinerary
  const deleteItinerary = useCallback(async (): Promise<boolean> => {
    if (!id) return false

    setSaving(true)
    setError(null)

    try {
      const response = await makeAuthenticatedRequest(`/api/itineraries/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete itinerary')
      }

      setItinerary(null)
      return true
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setSaving(false)
    }
  }, [id])

  // Like/unlike itinerary
  const toggleLike = useCallback(async (): Promise<boolean> => {
    if (!id || !itinerary) return false

    try {
      const isLiked = itinerary.metadata?.likes > 0 // Simple check - in real app you'd track user's likes
      const method = isLiked ? 'DELETE' : 'POST'
      
      const response = await makeAuthenticatedRequest(`/api/itineraries/${id}/like`, {
        method,
      })

      if (response.ok) {
        // Optimistically update the UI
        setItinerary(prev => {
          if (!prev) return prev
          return {
            ...prev,
            metadata: {
              ...prev.metadata,
              likes: isLiked 
                ? Math.max(0, (prev.metadata?.likes || 0) - 1)
                : (prev.metadata?.likes || 0) + 1
            }
          }
        })
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error toggling like:', err)
      return false
    }
  }, [id, itinerary])

  // Auto-fetch when id changes
  useEffect(() => {
    fetchItinerary()
  }, [fetchItinerary])

  return {
    itinerary,
    loading,
    saving,
    error,
    fetchItinerary,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    toggleLike
  }
}
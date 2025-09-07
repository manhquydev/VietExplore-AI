"use client"

import { useState, useEffect, useCallback } from 'react'
import { Place } from '@/lib/types/places'
import { useFirebaseAuth } from './use-firebase-auth'

interface PlaceFilters {
  search?: string
  status?: string
  type?: string
  region?: string
  province?: string
  createdBy?: string
  featured?: string
  dateRange?: string
}

interface AdminPlacesData {
  places: Place[]
  loading: boolean
  error: string | null
  totalCount: number
  lastUpdated: number | null
}

export const useAdminPlacesSimple = (filters: PlaceFilters = {}) => {
  const [data, setData] = useState<AdminPlacesData>({
    places: [],
    loading: true,
    error: null,
    totalCount: 0,
    lastUpdated: null
  })
  
  const { firebaseUser, loading: authLoading, getIdToken } = useFirebaseAuth()

  // Load places data from API
  const loadPlaces = useCallback(async () => {
    try {
      // Don't try to load if still loading auth or not authenticated
      if (authLoading) {
        return
      }
      
      if (!firebaseUser) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Authentication required - please login'
        }))
        return
      }
      
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      const token = await getIdToken()
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      // Build query params from filters
      const queryParams = new URLSearchParams()
      queryParams.set('limit', '1000') // Get all places for admin
      
      if (filters.search) queryParams.set('search', filters.search)
      if (filters.status && filters.status !== 'all') queryParams.set('status', filters.status)
      if (filters.type && filters.type !== 'all') queryParams.set('type', filters.type)
      if (filters.region && filters.region !== 'all') queryParams.set('region', filters.region)
      if (filters.province) queryParams.set('province', filters.province)
      if (filters.createdBy) queryParams.set('createdBy', filters.createdBy)
      if (filters.featured && filters.featured !== 'all') queryParams.set('featured', filters.featured)
      if (filters.dateRange) queryParams.set('dateRange', filters.dateRange)

      const response = await fetch(`/api/admin/places?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const places = result.data?.places || []

      setData({
        places: places,
        loading: false,
        error: null,
        totalCount: places.length,
        lastUpdated: Date.now()
      })

    } catch (error) {
      console.error('Error loading places:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load places'
      }))
    }
  }, [filters, getIdToken, authLoading, firebaseUser])

  // Load data on mount and when filters change, but wait for auth
  useEffect(() => {
    if (!authLoading && firebaseUser) {
      loadPlaces()
    } else if (!authLoading && !firebaseUser) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Authentication required - please login'
      }))
    }
  }, [loadPlaces, authLoading, firebaseUser])

  // Auto-refresh every 30 seconds (only when authenticated)
  useEffect(() => {
    if (!authLoading && firebaseUser) {
      const interval = setInterval(() => {
        // Only refresh if not currently loading
        if (!data.loading) {
          loadPlaces()
        }
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [loadPlaces, data.loading, authLoading, firebaseUser])

  // Manual refresh function
  const refresh = useCallback(() => {
    loadPlaces()
  }, [loadPlaces])

  // Update single place locally
  const updatePlace = useCallback((placeId: string, updatedPlace: Partial<Place>) => {
    setData(prev => ({
      ...prev,
      places: prev.places.map(place =>
        place.id === placeId ? { ...place, ...updatedPlace } : place
      ),
      lastUpdated: Date.now()
    }))
  }, [])

  return {
    ...data,
    refresh,
    updatePlace,
    isRealtime: false // Indicate this is polling-based, not realtime
  }
}
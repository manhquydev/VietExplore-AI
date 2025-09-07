"use client"

import { useState, useEffect, useRef } from 'react'
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

export const useAdminPlacesStable = (filters: PlaceFilters = {}) => {
  const [data, setData] = useState<AdminPlacesData>({
    places: [],
    loading: true,
    error: null,
    totalCount: 0,
    lastUpdated: null
  })
  
  const { firebaseUser, loading: authLoading, getIdToken } = useFirebaseAuth()
  const filtersRef = useRef(filters)
  const loadingRef = useRef(false)
  
  // Update filters ref when filters change
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Load places data from API
  const loadPlaces = async () => {
    // Prevent concurrent loads
    if (loadingRef.current) return
    
    try {
      loadingRef.current = true
      
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

      // Build query params from current filters
      const currentFilters = filtersRef.current
      const queryParams = new URLSearchParams()
      queryParams.set('limit', '1000') // Get all places for admin
      
      if (currentFilters.search) queryParams.set('search', currentFilters.search)
      if (currentFilters.status && currentFilters.status !== 'all') queryParams.set('status', currentFilters.status)
      if (currentFilters.type && currentFilters.type !== 'all') queryParams.set('type', currentFilters.type)
      if (currentFilters.region && currentFilters.region !== 'all') queryParams.set('region', currentFilters.region)
      if (currentFilters.province) queryParams.set('province', currentFilters.province)
      if (currentFilters.createdBy) queryParams.set('createdBy', currentFilters.createdBy)
      if (currentFilters.featured && currentFilters.featured !== 'all') queryParams.set('featured', currentFilters.featured)
      if (currentFilters.dateRange) queryParams.set('dateRange', currentFilters.dateRange)

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
    } finally {
      loadingRef.current = false
    }
  }

  // Load data when auth is ready or filters change
  useEffect(() => {
    if (!authLoading) {
      if (firebaseUser) {
        loadPlaces()
      } else {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Authentication required - please login'
        }))
      }
    }
  }, [authLoading, firebaseUser, filters.search, filters.status, filters.type, filters.region, filters.province, filters.createdBy, filters.featured, filters.dateRange])

  // Auto-refresh every 30 seconds (only when authenticated)
  useEffect(() => {
    if (!authLoading && firebaseUser && !data.loading) {
      const interval = setInterval(() => {
        loadPlaces()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [authLoading, firebaseUser, data.loading])

  // Manual refresh function  
  const refresh = () => {
    if (!loadingRef.current) {
      loadPlaces()
    }
  }

  // Update single place locally
  const updatePlace = (placeId: string, updatedPlace: Partial<Place>) => {
    setData(prev => ({
      ...prev,
      places: prev.places.map(place =>
        place.id === placeId ? { ...place, ...updatedPlace } : place
      ),
      lastUpdated: Date.now()
    }))
  }

  return {
    ...data,
    refresh,
    updatePlace,
    isRealtime: false // Indicate this is polling-based, not realtime
  }
}
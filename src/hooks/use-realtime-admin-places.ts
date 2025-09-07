"use client"

import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, off, set, serverTimestamp } from 'firebase/database'
import { getDatabase } from 'firebase/database'
import { app } from '@/lib/firebase'
import { Place } from '@/lib/types/places'
import { useFirebaseAuth } from './use-firebase-auth'

const db = getDatabase(app)

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

export const useRealtimeAdminPlaces = (filters: PlaceFilters = {}) => {
  const [data, setData] = useState<AdminPlacesData>({
    places: [],
    loading: true,
    error: null,
    totalCount: 0,
    lastUpdated: null
  })
  
  const { getIdToken } = useFirebaseAuth()

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      const token = await getIdToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      // Build query params from filters
      const queryParams = new URLSearchParams()
      if (filters.search) queryParams.set('search', filters.search)
      if (filters.status && filters.status !== 'all') queryParams.set('status', filters.status)
      if (filters.type && filters.type !== 'all') queryParams.set('type', filters.type)
      if (filters.region && filters.region !== 'all') queryParams.set('region', filters.region)
      if (filters.province) queryParams.set('province', filters.province)
      if (filters.createdBy) queryParams.set('createdBy', filters.createdBy)
      if (filters.featured && filters.featured !== 'all') queryParams.set('featured', filters.featured)
      if (filters.dateRange) queryParams.set('dateRange', filters.dateRange)

      const response = await fetch(`/api/admin/places?limit=1000&${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
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
      console.error('Error refreshing places:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Refresh failed'
      }))
    }
  }, [filters, getIdToken])

  // Subscribe to realtime updates
  useEffect(() => {
    let isSubscribed = true
    
    const loadData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }))
        
        const token = await getIdToken()
        if (!token || !isSubscribed) {
          if (isSubscribed) {
            setData(prev => ({
              ...prev,
              loading: false,
              error: 'Authentication required'
            }))
          }
          return
        }

        // Build query params from filters
        const queryParams = new URLSearchParams()
        if (filters.search) queryParams.set('search', filters.search)
        if (filters.status && filters.status !== 'all') queryParams.set('status', filters.status)
        if (filters.type && filters.type !== 'all') queryParams.set('type', filters.type)
        if (filters.region && filters.region !== 'all') queryParams.set('region', filters.region)
        if (filters.province) queryParams.set('province', filters.province)
        if (filters.createdBy) queryParams.set('createdBy', filters.createdBy)
        if (filters.featured && filters.featured !== 'all') queryParams.set('featured', filters.featured)
        if (filters.dateRange) queryParams.set('dateRange', filters.dateRange)

        const response = await fetch(`/api/admin/places?limit=1000&${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const result = await response.json()
        const places = result.data?.places || []

        if (isSubscribed) {
          setData({
            places: places,
            loading: false,
            error: null,
            totalCount: places.length,
            lastUpdated: Date.now()
          })
        }
      } catch (error) {
        console.error('Error loading places:', error)
        if (isSubscribed) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load places'
          }))
        }
      }
    }

    loadData()

    // Polling for updates every 30 seconds
    const interval = setInterval(() => {
      if (isSubscribed) {
        loadData()
      }
    }, 30000)

    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [filters, getIdToken])


  // Update single place locally (simple client-side update)
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
    isRealtime: true
  }
}
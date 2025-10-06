"use client"

import { useState, useEffect } from 'react'
import { callApi } from '@/lib/client/api'

export interface UserContribution {
  id: string
  name: string
  slug: string
  images: string[]
  status: 'draft' | 'submitted' | 'in_review' | 'published' | 'rejected'
  createdAt: string
  region?: string
  type?: string
}

export interface UserContributionsData {
  drafts: UserContribution[]
  published: UserContribution[]
  total: number
  isLoading: boolean
  error: string | null
}

export function useUserContributions() {
  const [data, setData] = useState<UserContributionsData>({
    drafts: [],
    published: [],
    total: 0,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }))

        // Fetch all user's places (API filters by current user's auth token)
        const myPlacesResponse = await callApi<{ success: boolean, data: any[] }>('/places/my-drafts', {
          method: 'GET'
        })

        const myPlaces = (myPlacesResponse.success && Array.isArray(myPlacesResponse.data))
          ? myPlacesResponse.data
          : []

        // Client-side filtering: separate drafts from published
        const drafts = myPlaces.filter((p: any) => p.status !== 'published')
        const published = myPlaces.filter((p: any) => p.status === 'published')

        // Helper function to extract image URLs from PlaceImage objects or string arrays
        const extractImageUrls = (images: any): string[] => {
          if (!images || !Array.isArray(images)) return []

          return images
            .map((img: any) => {
              // If already string (legacy data or draft), return as-is
              if (typeof img === 'string') {
                return img.trim()
              }
              // If PlaceImage object, extract url field
              if (typeof img === 'object' && img !== null && typeof img.url === 'string') {
                return img.url.trim()
              }
              return null
            })
            .filter((url): url is string => url !== null && url.length > 0)
        }

        setData({
          drafts: drafts.map((d: any) => ({
            id: d.id,
            name: d.name,
            slug: d.slug || `draft-${d.id}`,
            images: extractImageUrls(d.images),
            status: d.status,
            createdAt: d.createdAt,
            region: d.region,
            type: d.type
          })),
          published: published.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            images: extractImageUrls(p.images),
            status: 'published' as const,
            createdAt: p.createdAt,
            region: p.region,
            type: p.type
          })),
          total: drafts.length + published.length,
          isLoading: false,
          error: null
        })
      } catch (error: any) {
        console.error('[useUserContributions] Error:', error)
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Không thể tải danh sách đóng góp'
        }))
      }
    }

    fetchContributions()
  }, []) // No dependencies - uses auth token from API

  return data
}

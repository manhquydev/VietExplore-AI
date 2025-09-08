/**
 * @fileOverview Type definitions for travel itinerary system
 * Following Firebase Firestore best practices for NoSQL schema design
 */

import { z } from 'zod'

// Core itinerary place schema - denormalized for performance
export const ItineraryPlaceSchema = z.object({
  id: z.string(),
  placeId: z.string(), // Reference to places collection
  name: z.string(),
  province: z.string(),
  region: z.enum(['bac-bo', 'trung-bo', 'nam-bo']),
  type: z.enum(['bien', 'nui', 'van-hoa', 'am-thuc', 'check-in']),
  image: z.string().url(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  day: z.number().min(1),
  order: z.number().min(0), // Order within the day
  duration: z.number().min(1), // Duration in minutes
  notes: z.string().optional(),
  estimatedCost: z.number().min(0),
  tags: z.array(z.string()).default([]),
  transportation: z.object({
    method: z.enum(['walk', 'taxi', 'bus', 'motorbike', 'car', 'plane', 'train']).optional(),
    duration: z.number().optional(), // Travel time to this place in minutes
    cost: z.number().optional()
  }).optional()
})

// Budget configuration
export const BudgetSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
  currency: z.enum(['VND', 'USD']).default('VND'),
  breakdown: z.object({
    accommodation: z.number().optional(),
    food: z.number().optional(),
    transportation: z.number().optional(),
    activities: z.number().optional(),
    shopping: z.number().optional(),
    other: z.number().optional()
  }).optional()
})

// Itinerary metadata and stats
export const ItineraryMetadataSchema = z.object({
  views: z.number().default(0),
  likes: z.number().default(0),
  saves: z.number().default(0),
  copies: z.number().default(0),
  shares: z.number().default(0),
  averageRating: z.number().min(0).max(5).optional(),
  totalRatings: z.number().default(0)
})

// Main itinerary schema
export const ItinerarySchema = z.object({
  id: z.string(),
  userId: z.string(),
  slug: z.string(), // URL-friendly identifier
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  duration: z.number().min(1).max(30), // days
  budget: BudgetSchema,
  tripType: z.enum(['solo', 'couple', 'family', 'group', 'business']),
  places: z.array(ItineraryPlaceSchema),
  coverImage: z.string().url().optional(),
  
  // Visibility and sharing
  isPublic: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  
  // Collaboration
  collaborators: z.array(z.object({
    userId: z.string(),
    permission: z.enum(['view', 'edit', 'admin']),
    addedAt: z.string(), // ISO timestamp
    addedBy: z.string() // userId who added this collaborator
  })).default([]),
  
  // SEO and discovery
  tags: z.array(z.string()).default([]),
  season: z.array(z.enum(['spring', 'summer', 'autumn', 'winter'])).default([]),
  difficulty: z.enum(['easy', 'moderate', 'challenging']).optional(),
  
  // System metadata
  metadata: ItineraryMetadataSchema.default({}),
  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string(), // ISO timestamp
  publishedAt: z.string().optional() // ISO timestamp when first published
})

// Create itinerary input schema (for API endpoints)
export const CreateItinerarySchema = ItinerarySchema.omit({
  id: true,
  userId: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true
})

// Update itinerary input schema
export const UpdateItinerarySchema = CreateItinerarySchema.partial()

// Query filters for itineraries
export const ItineraryFiltersSchema = z.object({
  userId: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  tripType: z.enum(['solo', 'couple', 'family', 'group', 'business']).optional(),
  region: z.enum(['bac-bo', 'trung-bo', 'nam-bo']).optional(),
  duration: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  budget: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(), // Search in title and description
  sortBy: z.enum(['createdAt', 'updatedAt', 'views', 'likes', 'title']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
})

// Type exports
export type ItineraryPlace = z.infer<typeof ItineraryPlaceSchema>
export type Budget = z.infer<typeof BudgetSchema>
export type ItineraryMetadata = z.infer<typeof ItineraryMetadataSchema>
export type Itinerary = z.infer<typeof ItinerarySchema>
export type CreateItineraryInput = z.infer<typeof CreateItinerarySchema>
export type UpdateItineraryInput = z.infer<typeof UpdateItinerarySchema>
export type ItineraryFilters = z.infer<typeof ItineraryFiltersSchema>

// Utility types
export type TripType = Itinerary['tripType']
export type ItineraryStatus = Itinerary['status']
export type CollaboratorPermission = Itinerary['collaborators'][0]['permission']

// Database collection names
export const COLLECTIONS = {
  ITINERARIES: 'itineraries',
  ITINERARY_LIKES: 'itinerary_likes',
  ITINERARY_SAVES: 'itinerary_saves'
} as const

// Constants
export const TRIP_TYPE_LABELS: Record<TripType, string> = {
  solo: 'Một mình',
  couple: 'Cặp đôi',
  family: 'Gia đình',
  group: 'Nhóm bạn',
  business: 'Công tác'
}

export const PLACE_TYPE_LABELS: Record<ItineraryPlace['type'], string> = {
  bien: 'Biển',
  nui: 'Núi',
  'van-hoa': 'Văn hóa',
  'am-thuc': 'Ẩm thực',
  'check-in': 'Check-in'
}

export const REGION_LABELS: Record<ItineraryPlace['region'], string> = {
  'bac-bo': 'Bắc Bộ',
  'trung-bo': 'Trung Bộ',
  'nam-bo': 'Nam Bộ'
}

// Helper functions
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

export const calculateTotalCost = (places: ItineraryPlace[]): number => {
  return places.reduce((total, place) => {
    const placeCost = place.estimatedCost || 0
    const transportCost = place.transportation?.cost || 0
    return total + placeCost + transportCost
  }, 0)
}

export const getTotalDuration = (places: ItineraryPlace[]): number => {
  return places.reduce((total, place) => total + place.duration, 0)
}

export const getPlacesByDay = (places: ItineraryPlace[], duration: number): Record<number, ItineraryPlace[]> => {
  const placesByDay: Record<number, ItineraryPlace[]> = {}
  
  // Initialize all days
  for (let day = 1; day <= duration; day++) {
    placesByDay[day] = []
  }
  
  // Group places by day and sort by order
  places.forEach(place => {
    if (place.day >= 1 && place.day <= duration) {
      placesByDay[place.day].push(place)
    }
  })
  
  // Sort places within each day by order
  Object.keys(placesByDay).forEach(day => {
    placesByDay[Number(day)].sort((a, b) => a.order - b.order)
  })
  
  return placesByDay
}
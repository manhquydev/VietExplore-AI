// src/app/api/itineraries/__tests__/route.test.ts
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
  db: {
    collection: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: jest.fn(() => Promise.resolve({
        docs: [],
        empty: true
      })),
      count: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          data: () => ({ count: 0 })
        }))
      }))
    }))
  }
}))

// Mock auth middleware
jest.mock('@/lib/auth-middleware', () => ({
  verifyAuthToken: jest.fn(() => Promise.resolve({
    success: true,
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      role: 'traveler'
    }
  }))
}))

// Mock permissions
jest.mock('@/lib/auth/permissions', () => ({
  hasPermission: jest.fn(() => true)
}))

// Mock types
jest.mock('@/lib/types/itineraries', () => ({
  ItineraryFiltersSchema: {
    parse: jest.fn((data) => data)
  },
  CreateItinerarySchema: {
    parse: jest.fn((data) => data)
  },
  generateSlug: jest.fn((title) => title.toLowerCase().replace(/\s+/g, '-')),
  COLLECTIONS: {
    ITINERARIES: 'itineraries'
  }
}))

describe('Itineraries API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/itineraries', () => {
    it('should return empty list when no itineraries exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/itineraries')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data).toEqual([])
      expect(data.pagination).toEqual({
        total: 0,
        offset: 0,
        limit: 20,
        hasMore: false
      })
    })

    it('should handle query parameters correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/itineraries?search=test&limit=10')
      
      const response = await GET(request)
      
      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/itineraries', () => {
    it('should require authentication', async () => {
      const { verifyAuthToken } = require('@/lib/auth-middleware')
      verifyAuthToken.mockResolvedValueOnce({ success: false })

      const request = new NextRequest('http://localhost:3000/api/itineraries', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Itinerary',
          duration: 3,
          tripType: 'couple',
          budget: { min: 1000000, max: 3000000, currency: 'VND' },
          places: [],
          isPublic: false,
          status: 'draft'
        })
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(401)
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/itineraries', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
        })
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })
  })
})
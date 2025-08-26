/**
 * @jest-environment node
 */

import { GET, POST } from '../route'
import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken } from '@/lib/auth-middleware'

// Mock dependencies
jest.mock('@/lib/firebase-admin')
jest.mock('@/lib/auth-middleware')

const mockAdminDb = adminDb as jest.Mocked<typeof adminDb>
const mockVerifyAuthToken = verifyAuthToken as jest.MockedFunction<typeof verifyAuthToken>

describe('/api/places', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/places', () => {
    it('should fetch published places successfully', async () => {
      const mockPlaces = [
        {
          id: 'place1',
          name: 'Test Place 1',
          status: 'published',
          trustLabel: 'verified'
        },
        {
          id: 'place2', 
          name: 'Test Place 2',
          status: 'published',
          trustLabel: 'contributor'
        }
      ]

      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          mockPlaces.forEach((place, index) => {
            callback({
              id: place.id,
              data: () => place
            })
          })
        })
      }

      // Mock Firestore query chain
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      }

      mockAdminDb.collection.mockReturnValue(mockQuery as any)

      const request = new NextRequest('http://localhost:3000/api/places')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].name).toBe('Test Place 1')
    })

    it('should filter places by region', async () => {
      const mockSnapshot = {
        forEach: jest.fn()
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      }

      mockAdminDb.collection.mockReturnValue(mockQuery as any)

      const request = new NextRequest('http://localhost:3000/api/places?region=bac-bo')
      await GET(request)

      expect(mockQuery.where).toHaveBeenCalledWith('status', '==', 'published')
      expect(mockQuery.where).toHaveBeenCalledWith('region', '==', 'bac-bo')
    })
  })

  describe('POST /api/places', () => {
    it('should create place successfully for contributor', async () => {
      const mockUser = {
        id: 'user1',
        role: 'contributor',
        fullName: 'Test Contributor'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockUser
      } as any)

      const mockDocRef = { id: 'new-place-id' }
      mockAdminDb.collection.mockReturnValue({
        add: jest.fn().mockResolvedValue(mockDocRef),
        doc: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(undefined)
        })
      } as any)

      const placeData = {
        name: 'New Test Place',
        description: 'A test place description',
        shortDescription: 'Short desc',
        region: 'bac-bo',
        province: 'Ha Noi',
        type: 'van-hoa',
        coordinates: { lat: 21.0285, lng: 105.8542 },
        tags: ['test', 'place']
      }

      const request = new NextRequest('http://localhost:3000/api/places', {
        method: 'POST',
        body: JSON.stringify(placeData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.trustLabel).toBe('contributor')
      expect(data.data.status).toBe('submitted') // Contributor content needs review
    })

    it('should create place with auto-publish for partner', async () => {
      const mockUser = {
        id: 'partner1',
        role: 'partner',
        fullName: 'Test Partner'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockUser
      } as any)

      mockAdminDb.collection.mockReturnValue({
        add: jest.fn().mockResolvedValue({ id: 'partner-place-id' }),
        doc: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(undefined)
        })
      } as any)

      const placeData = {
        name: 'Partner Place',
        description: 'Partner place description',
        shortDescription: 'Partner short desc',
        region: 'trung-bo',
        province: 'Da Nang',
        type: 'bien',
        coordinates: { lat: 16.0544, lng: 108.2022 },
        tags: ['partner', 'beach']
      }

      const request = new NextRequest('http://localhost:3000/api/places', {
        method: 'POST',
        body: JSON.stringify(placeData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.trustLabel).toBe('partner')
      expect(data.data.status).toBe('published') // Partner gets auto-publish
      expect(data.message).toContain('xuất bản thành công')
    })

    it('should reject unauthorized users', async () => {
      mockVerifyAuthToken.mockResolvedValue({
        success: false,
        error: 'Unauthorized'
      })

      const request = new NextRequest('http://localhost:3000/api/places', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Bạn cần đăng nhập để tạo địa điểm')
    })

    it('should reject traveler role', async () => {
      const mockUser = {
        id: 'traveler1',
        role: 'traveler',
        fullName: 'Test Traveler'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockUser
      } as any)

      const request = new NextRequest('http://localhost:3000/api/places', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Bạn không có quyền tạo địa điểm')
    })
  })
})


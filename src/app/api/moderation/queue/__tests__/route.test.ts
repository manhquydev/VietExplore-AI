/**
 * @jest-environment node
 */

import { GET } from '../route'
import { NextRequest } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { hasPermission } from '@/lib/auth/permissions'
import { getAdminDb } from '@/lib/server/firebaseAdmin'

// Mock dependencies
jest.mock('@/lib/server/auth-middleware')
jest.mock('@/lib/auth/permissions')
jest.mock('@/lib/server/firebaseAdmin')

const mockVerifyAuthToken = verifyAuthToken as jest.MockedFunction<typeof verifyAuthToken>
const mockHasPermission = hasPermission as jest.MockedFunction<typeof hasPermission>
const mockGetAdminDb = getAdminDb as jest.MockedFunction<typeof getAdminDb>

describe('/api/moderation/queue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/moderation/queue', () => {
    it('should fetch moderation queue successfully for moderator', async () => {
      const mockModerator = {
        id: 'moderator1',
        role: 'moderator',
        fullName: 'Moderator User'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockModerator
      } as any)

      mockHasPermission.mockReturnValue(true)

      // Mock moderation queue items
      const mockItems = [
        {
          id: 'mod_item_1',
          contentType: 'place',
          contentId: 'place_001',
          submittedBy: 'contributor_001',
          submittedAt: '2024-03-15T10:30:00Z',
          status: 'pending',
          priority: 'medium',
          content: {
            title: 'Bãi biển Nha Trang',
            description: 'Bãi biển đẹp với nước trong xanh',
            changes: 'Tạo mới địa điểm'
          }
        },
        {
          id: 'mod_item_2',
          contentType: 'user_report',
          contentId: 'report_001',
          submittedBy: 'traveler_001',
          submittedAt: '2024-03-15T08:15:00Z',
          status: 'pending',
          priority: 'high',
          content: {
            title: 'Báo cáo nội dung không phù hợp',
            description: 'Địa điểm chứa thông tin sai lệch',
            changes: 'Báo cáo vi phạm'
          }
        }
      ]

      // Mock submitter user data
      const mockSubmitterData = {
        fullName: 'Test User',
        role: 'contributor',
        avatar: 'https://example.com/avatar.jpg'
      }

      const mockFirestoreSnapshot = {
        docs: mockItems.map(item => ({
          id: item.id,
          data: () => item
        }))
      }

      const mockUserDoc = {
        data: () => mockSubmitterData,
        exists: true
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockFirestoreSnapshot)
      }

      const mockCollection = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockFirestoreSnapshot),
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection)
      }

      mockGetAdminDb.mockReturnValue(mockDb as any)

      const request = new NextRequest('http://localhost:3000/api/moderation/queue?status=pending', {
        headers: {
          'Authorization': 'Bearer moderator-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].contentType).toBe('place')
      expect(data.data[1].priority).toBe('high')
      expect(mockVerifyAuthToken).toHaveBeenCalledWith(request)
      expect(mockHasPermission).toHaveBeenCalledWith(mockModerator, 'view_moderation_queue')
    })

    it('should filter by status parameter', async () => {
      const mockModerator = {
        id: 'moderator1',
        role: 'moderator',
        fullName: 'Moderator User'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockModerator
      } as any)

      mockHasPermission.mockReturnValue(true)

      const mockFirestoreSnapshot = {
        docs: []
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockFirestoreSnapshot)
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockQuery)
      }

      mockGetAdminDb.mockReturnValue(mockDb as any)

      const request = new NextRequest('http://localhost:3000/api/moderation/queue?status=approved', {
        headers: {
          'Authorization': 'Bearer moderator-token'
        }
      })

      await GET(request)

      expect(mockQuery.where).toHaveBeenCalledWith('status', '==', 'approved')
    })

    it('should filter by content type parameter', async () => {
      const mockModerator = {
        id: 'moderator1',
        role: 'moderator',
        fullName: 'Moderator User'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockModerator
      } as any)

      mockHasPermission.mockReturnValue(true)

      const mockFirestoreSnapshot = {
        docs: []
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockFirestoreSnapshot)
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockQuery)
      }

      mockGetAdminDb.mockReturnValue(mockDb as any)

      const request = new NextRequest('http://localhost:3000/api/moderation/queue?contentType=place', {
        headers: {
          'Authorization': 'Bearer moderator-token'
        }
      })

      await GET(request)

      expect(mockQuery.where).toHaveBeenCalledWith('contentType', '==', 'place')
    })

    it('should set default status to pending', async () => {
      const mockModerator = {
        id: 'moderator1',
        role: 'moderator',
        fullName: 'Moderator User'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockModerator
      } as any)

      mockHasPermission.mockReturnValue(true)

      const mockFirestoreSnapshot = {
        docs: []
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockFirestoreSnapshot)
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockQuery)
      }

      mockGetAdminDb.mockReturnValue(mockDb as any)

      const request = new NextRequest('http://localhost:3000/api/moderation/queue', {
        headers: {
          'Authorization': 'Bearer moderator-token'
        }
      })

      await GET(request)

      expect(mockQuery.where).toHaveBeenCalledWith('status', '==', 'pending')
    })

    it('should reject non-moderator users', async () => {
      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: {
          id: 'traveler1',
          role: 'traveler',
          fullName: 'Regular User'
        }
      } as any)

      mockHasPermission.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/moderation/queue', {
        headers: {
          'Authorization': 'Bearer user-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Bạn không có quyền xem hàng đợi kiểm duyệt')
    })

    it('should reject unauthenticated users', async () => {
      mockVerifyAuthToken.mockResolvedValue({
        success: false,
        error: 'No token provided'
      })

      const request = new NextRequest('http://localhost:3000/api/moderation/queue')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Bạn không có quyền xem hàng đợi kiểm duyệt')
    })

    it('should handle database errors gracefully', async () => {
      const mockModerator = {
        id: 'moderator1',
        role: 'moderator',
        fullName: 'Moderator User'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockModerator
      } as any)

      mockHasPermission.mockReturnValue(true)

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockQuery)
      }

      mockGetAdminDb.mockReturnValue(mockDb as any)

      const request = new NextRequest('http://localhost:3000/api/moderation/queue', {
        headers: {
          'Authorization': 'Bearer moderator-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Không thể tải hàng đợi kiểm duyệt')
      expect(data.data).toEqual([])
      expect(data.total).toBe(0)
    })

    it('should return empty array when no items found', async () => {
      const mockModerator = {
        id: 'moderator1',
        role: 'moderator',
        fullName: 'Moderator User'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockModerator
      } as any)

      mockHasPermission.mockReturnValue(true)

      const mockFirestoreSnapshot = {
        docs: []
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockFirestoreSnapshot)
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockQuery)
      }

      mockGetAdminDb.mockReturnValue(mockDb as any)

      const request = new NextRequest('http://localhost:3000/api/moderation/queue', {
        headers: {
          'Authorization': 'Bearer moderator-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
      expect(data.total).toBe(0)
    })

    it('should apply limit parameter', async () => {
      const mockModerator = {
        id: 'moderator1',
        role: 'moderator',
        fullName: 'Moderator User'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockModerator
      } as any)

      mockHasPermission.mockReturnValue(true)

      const mockFirestoreSnapshot = {
        docs: []
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockFirestoreSnapshot)
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockQuery)
      }

      mockGetAdminDb.mockReturnValue(mockDb as any)

      const request = new NextRequest('http://localhost:3000/api/moderation/queue?limit=50', {
        headers: {
          'Authorization': 'Bearer moderator-token'
        }
      })

      await GET(request)

      expect(mockQuery.limit).toHaveBeenCalledWith(50)
    })

    it('should use default limit when not specified', async () => {
      const mockModerator = {
        id: 'moderator1',
        role: 'moderator',
        fullName: 'Moderator User'
      }

      mockVerifyAuthToken.mockResolvedValue({
        success: true,
        user: mockModerator
      } as any)

      mockHasPermission.mockReturnValue(true)

      const mockFirestoreSnapshot = {
        docs: []
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockFirestoreSnapshot)
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockQuery)
      }

      mockGetAdminDb.mockReturnValue(mockDb as any)

      const request = new NextRequest('http://localhost:3000/api/moderation/queue', {
        headers: {
          'Authorization': 'Bearer moderator-token'
        }
      })

      await GET(request)

      expect(mockQuery.limit).toHaveBeenCalledWith(20)
    })
  })
})
/**
 * @jest-environment node
 */

import { GET } from '../route'
import { NextRequest } from 'next/server'
import { requirePermission } from '@/lib/auth-middleware'
import { adminDb } from '@/lib/firebase-admin'

// Mock dependencies
jest.mock('@/lib/auth-middleware')
jest.mock('@/lib/firebase-admin')

const mockRequirePermission = requirePermission as jest.MockedFunction<typeof requirePermission>
const mockAdminDb = adminDb as jest.Mocked<typeof adminDb>

describe('/api/admin/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/users', () => {
    it('should fetch users successfully for admin', async () => {
      const mockAdmin = {
        id: 'admin1',
        role: 'admin',
        fullName: 'Admin User'
      }

      mockRequirePermission.mockResolvedValue({
        success: true,
        user: mockAdmin
      } as any)

      const mockUsers = [
        {
          id: 'user1',
          email: 'user1@example.com',
          fullName: 'User One',
          role: 'traveler',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          fullName: 'User Two',
          role: 'contributor',
          createdAt: '2024-01-02T00:00:00Z'
        }
      ]

      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          mockUsers.forEach((user) => {
            callback({
              id: user.id,
              data: () => user
            })
          })
        }),
        size: mockUsers.length
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      }

      mockAdminDb.collection.mockReturnValue(mockQuery as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].email).toBe('user1@example.com')
      expect(mockRequirePermission).toHaveBeenCalledWith(request, 'view_moderation_queue')
    })

    it('should filter users by role', async () => {
      const mockAdmin = {
        id: 'admin1',
        role: 'admin',
        fullName: 'Admin User'
      }

      mockRequirePermission.mockResolvedValue({
        success: true,
        user: mockAdmin
      } as any)

      const mockSnapshot = {
        forEach: jest.fn(),
        size: 0
      }

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      }

      mockAdminDb.collection.mockReturnValue(mockQuery as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users?role=contributor', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      await GET(request)

      expect(mockQuery.where).toHaveBeenCalledWith('role', '==', 'contributor')
    })

    it('should reject non-admin users', async () => {
      mockRequirePermission.mockResolvedValue({
        success: false,
        error: 'Insufficient permissions'
      })

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': 'Bearer user-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Bạn không có quyền xem danh sách người dùng')
    })
  })
})



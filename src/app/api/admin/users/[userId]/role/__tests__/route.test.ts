/**
 * @jest-environment node
 */

import { PUT } from '../route'
import { NextRequest } from 'next/server'
import { requirePermission } from '@/lib/auth-middleware'
import { adminDb } from '@/lib/firebase-admin'

// Mock dependencies
jest.mock('@/lib/auth-middleware')
jest.mock('@/lib/firebase-admin')

const mockRequirePermission = requirePermission as jest.MockedFunction<typeof requirePermission>
const mockAdminDb = adminDb as jest.Mocked<typeof adminDb>

describe('/api/admin/users/[userId]/role', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PUT /api/admin/users/[userId]/role', () => {
    it('should change user role successfully', async () => {
      const mockAdmin = {
        id: 'admin1',
        role: 'admin',
        fullName: 'Admin User'
      }

      mockRequirePermission.mockResolvedValue({
        success: true,
        user: mockAdmin
      } as any)

      const mockTargetUser = {
        role: 'traveler',
        fullName: 'Target User'
      }

      const mockUserDoc = {
        exists: true,
        data: () => mockTargetUser
      }

      const mockUpdate = jest.fn().mockResolvedValue(undefined)
      const mockAdd = jest.fn().mockResolvedValue({ id: 'log-id' })

      mockAdminDb.collection.mockImplementation((collectionName) => {
        if (collectionName === 'users') {
          return {
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue(mockUserDoc),
              update: mockUpdate
            })
          } as any
        } else if (collectionName === 'admin_logs') {
          return {
            add: mockAdd
          } as any
        }
        return {} as any
      })

      // Mock FieldValue
      mockAdminDb.FieldValue = {
        arrayUnion: jest.fn((value) => `arrayUnion(${JSON.stringify(value)})`),
        increment: jest.fn((value) => `increment(${value})`)
      } as any

      const request = new NextRequest('http://localhost:3000/api/admin/users/user123/role', {
        method: 'PUT',
        body: JSON.stringify({
          newRole: 'contributor',
          reason: 'User has demonstrated expertise'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await PUT(request, { params: { userId: 'user123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Đã thay đổi vai trò từ traveler thành contributor')
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        role: 'contributor'
      }))
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        type: 'role_change',
        adminId: 'admin1',
        targetUserId: 'user123',
        action: 'Changed role from traveler to contributor'
      }))
    })

    it('should reject invalid roles', async () => {
      const mockAdmin = {
        id: 'admin1',
        role: 'admin',
        fullName: 'Admin User'
      }

      mockRequirePermission.mockResolvedValue({
        success: true,
        user: mockAdmin
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/user123/role', {
        method: 'PUT',
        body: JSON.stringify({
          newRole: 'invalid_role',
          reason: 'Test'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await PUT(request, { params: { userId: 'user123' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Vai trò không hợp lệ')
    })

    it('should prevent admin from demoting themselves', async () => {
      const mockAdmin = {
        id: 'admin1',
        role: 'admin',
        fullName: 'Admin User'
      }

      mockRequirePermission.mockResolvedValue({
        success: true,
        user: mockAdmin
      } as any)

      const mockTargetUser = {
        role: 'admin',
        fullName: 'Admin User'
      }

      const mockUserDoc = {
        exists: true,
        data: () => mockTargetUser
      }

      mockAdminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/admin1/role', {
        method: 'PUT',
        body: JSON.stringify({
          newRole: 'moderator',
          reason: 'Test self-demotion'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await PUT(request, { params: { userId: 'admin1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Bạn không thể thay đổi vai trò của chính mình')
    })

    it('should reject non-admin users', async () => {
      mockRequirePermission.mockResolvedValue({
        success: false,
        error: 'Insufficient permissions'
      })

      const request = new NextRequest('http://localhost:3000/api/admin/users/user123/role', {
        method: 'PUT',
        body: JSON.stringify({
          newRole: 'contributor',
          reason: 'Test'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        }
      })

      const response = await PUT(request, { params: { userId: 'user123' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Chỉ admin mới có quyền thay đổi vai trò người dùng')
    })

    it('should handle non-existent users', async () => {
      const mockAdmin = {
        id: 'admin1',
        role: 'admin',
        fullName: 'Admin User'
      }

      mockRequirePermission.mockResolvedValue({
        success: true,
        user: mockAdmin
      } as any)

      const mockUserDoc = {
        exists: false
      }

      mockAdminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users/nonexistent/role', {
        method: 'PUT',
        body: JSON.stringify({
          newRole: 'contributor',
          reason: 'Test'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await PUT(request, { params: { userId: 'nonexistent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Người dùng không tồn tại')
    })
  })
})



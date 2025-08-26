/**
 * @jest-environment node
 */

import { verifyAuthToken, requirePermission } from '../auth-middleware'
import { NextRequest } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

// Mock Firebase Admin SDK
jest.mock('@/lib/firebase-admin')

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>
const mockAdminDb = adminDb as jest.Mocked<typeof adminDb>

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('verifyAuthToken', () => {
    it('should verify valid token successfully', async () => {
      const mockDecodedToken = {
        uid: 'test-user-id',
        email: 'test@example.com'
      }

      const mockUserData = {
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'traveler'
      }

      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any)
      
      const mockUserDoc = {
        exists: true,
        data: () => mockUserData
      }

      mockAdminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/test', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const result = await verifyAuthToken(request)

      expect(result.success).toBe(true)
      expect(result.user?.email).toBe('test@example.com')
      expect(result.user?.id).toBe('test-user-id')
      expect(mockAdminAuth.verifyIdToken).toHaveBeenCalledWith('valid-token')
    })

    it('should fail with missing Authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/test')

      const result = await verifyAuthToken(request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Token xác thực không hợp lệ')
    })

    it('should fail with invalid token format', async () => {
      const request = new NextRequest('http://localhost:3000/test', {
        headers: {
          'Authorization': 'InvalidFormat'
        }
      })

      const result = await verifyAuthToken(request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Token xác thực không hợp lệ')
    })

    it('should fail when user does not exist in Firestore', async () => {
      const mockDecodedToken = {
        uid: 'nonexistent-user',
        email: 'nonexistent@example.com'
      }

      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any)
      
      const mockUserDoc = {
        exists: false
      }

      mockAdminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/test', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const result = await verifyAuthToken(request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Người dùng không tồn tại')
    })
  })

  describe('requirePermission', () => {
    it('should allow admin to access any permission', async () => {
      const mockDecodedToken = {
        uid: 'admin-user',
        email: 'admin@example.com'
      }

      const mockUserData = {
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'admin'
      }

      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any)
      
      const mockUserDoc = {
        exists: true,
        data: () => mockUserData
      }

      mockAdminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/test', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const result = await requirePermission(request, 'any_permission')

      expect(result.success).toBe(true)
      expect(result.user?.role).toBe('admin')
    })

    it('should allow contributor to create places', async () => {
      const mockDecodedToken = {
        uid: 'contributor-user',
        email: 'contributor@example.com'
      }

      const mockUserData = {
        email: 'contributor@example.com',
        fullName: 'Contributor User',
        role: 'contributor'
      }

      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any)
      
      const mockUserDoc = {
        exists: true,
        data: () => mockUserData
      }

      mockAdminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/test', {
        headers: {
          'Authorization': 'Bearer contributor-token'
        }
      })

      const result = await requirePermission(request, 'create_place')

      expect(result.success).toBe(true)
      expect(result.user?.role).toBe('contributor')
    })

    it('should deny traveler from creating places', async () => {
      const mockDecodedToken = {
        uid: 'traveler-user',
        email: 'traveler@example.com'
      }

      const mockUserData = {
        email: 'traveler@example.com',
        fullName: 'Traveler User',
        role: 'traveler'
      }

      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any)
      
      const mockUserDoc = {
        exists: true,
        data: () => mockUserData
      }

      mockAdminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/test', {
        headers: {
          'Authorization': 'Bearer traveler-token'
        }
      })

      const result = await requirePermission(request, 'create_place')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bạn không có quyền thực hiện hành động này')
    })

    it('should allow moderator to review content', async () => {
      const mockDecodedToken = {
        uid: 'moderator-user',
        email: 'moderator@example.com'
      }

      const mockUserData = {
        email: 'moderator@example.com',
        fullName: 'Moderator User',
        role: 'moderator'
      }

      mockAdminAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any)
      
      const mockUserDoc = {
        exists: true,
        data: () => mockUserData
      }

      mockAdminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc)
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/test', {
        headers: {
          'Authorization': 'Bearer moderator-token'
        }
      })

      const result = await requirePermission(request, 'review_content')

      expect(result.success).toBe(true)
      expect(result.user?.role).toBe('moderator')
    })
  })
})



/**
 * @jest-environment node
 */

import { POST } from '../route'
import { NextRequest } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

// Mock Firebase Admin SDK
jest.mock('@/lib/firebase-admin')
jest.mock('@/lib/firebase')

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>
const mockAdminDb = adminDb as jest.Mocked<typeof adminDb>

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login successfully with valid credentials', async () => {
    // Mock Firebase Auth success
    const mockUser = {
      uid: 'test-user-id',
      email: 'test@example.com'
    }

    const mockUserData = {
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'traveler',
      verified: false
    }

    // Mock Firestore user document
    const mockUserDoc = {
      exists: true,
      data: () => mockUserData
    }

    mockAdminDb.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserDoc)
      })
    } as any)

    mockAdminAuth.createCustomToken.mockResolvedValue('mock-custom-token')

    // Create request
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Call the API
    const response = await POST(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.email).toBe('test@example.com')
    expect(data.token).toBe('mock-custom-token')
    expect(mockAdminAuth.createCustomToken).toHaveBeenCalledWith('test-user-id')
  })

  it('should return 400 for missing email or password', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com'
        // Missing password
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email và mật khẩu là bắt buộc')
  })

  it('should return 404 for non-existent user', async () => {
    // Mock user not found in Firestore
    const mockUserDoc = {
      exists: false
    }

    mockAdminDb.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserDoc)
      })
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Người dùng không tồn tại')
  })
})


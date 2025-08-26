/**
 * @jest-environment jsdom
 */

import { apiClient } from '../api'
import { auth } from '@/lib/firebase'

// Mock Firebase auth
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null
  }
}))

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>
const mockAuth = auth as jest.Mocked<typeof auth>

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.currentUser = null
  })

  describe('callApi error handling', () => {
    it('should handle empty response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
        json: jest.fn()
      } as any)

      const result = await apiClient.moderation.queue.list()

      expect(result).toEqual({})
    })

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('invalid json'),
        json: jest.fn()
      } as any)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await apiClient.moderation.queue.list()

      expect(result).toEqual({ error: 'Invalid response format' })
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse response as JSON:', expect.any(SyntaxError))

      consoleSpy.mockRestore()
    })

    it('should handle valid JSON response', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1', status: 'pending' }],
        total: 1
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
        json: jest.fn()
      } as any)

      const result = await apiClient.moderation.queue.list()

      expect(result).toEqual(mockResponse)
    })

    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        success: false,
        error: 'Unauthorized',
        data: [],
        total: 0
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: jest.fn().mockResolvedValue(JSON.stringify(errorResponse)),
        json: jest.fn()
      } as any)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await expect(apiClient.moderation.queue.list()).rejects.toThrow('Unauthorized')

      expect(consoleSpy).toHaveBeenCalledWith('API call to /moderation/queue? failed:', errorResponse)

      consoleSpy.mockRestore()
    })

    it('should include authentication token when user is logged in', async () => {
      const mockUser = {
        getIdToken: jest.fn().mockResolvedValue('mock-token')
      }

      mockAuth.currentUser = mockUser as any

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
        json: jest.fn()
      } as any)

      await apiClient.moderation.queue.list()

      expect(mockFetch).toHaveBeenCalledWith('/api/moderation/queue?', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      })
    })

    it('should not include authorization header when user is not logged in', async () => {
      mockAuth.currentUser = null

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
        json: jest.fn()
      } as any)

      await apiClient.moderation.queue.list()

      expect(mockFetch).toHaveBeenCalledWith('/api/moderation/queue?', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })
  })

  describe('moderation.queue.list', () => {
    it('should build query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
        json: jest.fn()
      } as any)

      const filters = {
        status: 'pending',
        contentType: 'place',
        priority: 'high',
        limit: 50
      }

      await apiClient.moderation.queue.list(filters)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/moderation/queue?status=pending&contentType=place&priority=high&limit=50',
        expect.any(Object)
      )
    })

    it('should handle empty filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
        json: jest.fn()
      } as any)

      await apiClient.moderation.queue.list({})

      expect(mockFetch).toHaveBeenCalledWith('/api/moderation/queue?', expect.any(Object))
    })

    it('should skip undefined and null values in filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
        json: jest.fn()
      } as any)

      const filters = {
        status: 'pending',
        contentType: undefined,
        priority: null,
        limit: 10
      }

      await apiClient.moderation.queue.list(filters as any)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/moderation/queue?status=pending&limit=10',
        expect.any(Object)
      )
    })
  })

  describe('moderation.queue.review', () => {
    it('should send review request with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('{"success": true}'),
        json: jest.fn()
      } as any)

      await apiClient.moderation.queue.review('item123', 'approve', 'Looks good', 'verified')

      expect(mockFetch).toHaveBeenCalledWith('/api/moderation/queue/item123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'approve',
          reviewNotes: 'Looks good',
          newTrustLabel: 'verified'
        })
      })
    })

    it('should handle optional parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('{"success": true}'),
        json: jest.fn()
      } as any)

      await apiClient.moderation.queue.review('item123', 'reject')

      expect(mockFetch).toHaveBeenCalledWith('/api/moderation/queue/item123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reject',
          reviewNotes: undefined,
          newTrustLabel: undefined
        })
      })
    })
  })

  describe('network errors', () => {
    it('should handle fetch network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await expect(apiClient.moderation.queue.list()).rejects.toThrow('Request failed')

      expect(consoleSpy).toHaveBeenCalledWith('API call to /moderation/queue? failed:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should handle auth token retrieval errors', async () => {
      const mockUser = {
        getIdToken: jest.fn().mockRejectedValue(new Error('Token error'))
      }

      mockAuth.currentUser = mockUser as any

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await expect(apiClient.moderation.queue.list()).rejects.toThrow('Request failed')

      expect(consoleSpy).toHaveBeenCalledWith('API call to /moderation/queue? failed:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})
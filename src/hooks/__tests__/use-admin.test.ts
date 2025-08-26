/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useAdminStats, useModerationQueue } from '../use-admin'
import { apiClient } from '@/lib/client/api'
import { useAuth } from '@/components/auth/auth-provider'

// Mock dependencies
jest.mock('@/lib/client/api')
jest.mock('@/components/auth/auth-provider')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('useAdminStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch admin stats successfully for admin user', async () => {
    const mockAdmin = {
      id: 'admin1',
      role: 'admin',
      fullName: 'Admin User'
    }

    mockUseAuth.mockReturnValue({
      user: mockAdmin,
      loading: false,
      error: null
    } as any)

    mockApiClient.admin.users.list.mockResolvedValue({
      success: true,
      data: [],
      pagination: { total: 150 }
    })

    mockApiClient.moderation.queue.list.mockResolvedValue({
      success: true,
      data: [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'pending' }
      ]
    })

    const { result } = renderHook(() => useAdminStats())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats.totalUsers).toBe(150)
    expect(result.current.stats.pendingModeration).toBe(3)
    expect(result.current.stats.totalPlaces).toBe(456) // Simulated value
    expect(result.current.stats.openReports).toBe(8) // Simulated value
  })

  it('should not fetch stats for non-admin users', async () => {
    const mockTraveler = {
      id: 'traveler1',
      role: 'traveler',
      fullName: 'Regular User'
    }

    mockUseAuth.mockReturnValue({
      user: mockTraveler,
      loading: false,
      error: null
    } as any)

    const { result } = renderHook(() => useAdminStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats.totalUsers).toBe(0)
    expect(result.current.stats.pendingModeration).toBe(0)
    expect(mockApiClient.admin.users.list).not.toHaveBeenCalled()
    expect(mockApiClient.moderation.queue.list).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const mockAdmin = {
      id: 'admin1',
      role: 'admin',
      fullName: 'Admin User'
    }

    mockUseAuth.mockReturnValue({
      user: mockAdmin,
      loading: false,
      error: null
    } as any)

    mockApiClient.admin.users.list.mockRejectedValue(new Error('Network error'))
    mockApiClient.moderation.queue.list.mockRejectedValue(new Error('Network error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useAdminStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats.totalUsers).toBe(0)
    expect(result.current.stats.pendingModeration).toBe(0)
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch admin stats', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should handle when user is null', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null
    } as any)

    const { result } = renderHook(() => useAdminStats())

    expect(result.current.loading).toBe(false)
    expect(result.current.stats.totalUsers).toBe(0)
    expect(mockApiClient.admin.users.list).not.toHaveBeenCalled()
  })
})

describe('useModerationQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch moderation queue successfully for moderator', async () => {
    const mockModerator = {
      id: 'moderator1',
      role: 'moderator',
      fullName: 'Moderator User'
    }

    mockUseAuth.mockReturnValue({
      user: mockModerator,
      loading: false,
      error: null
    } as any)

    const mockQueueItems = [
      {
        id: 'mod_item_1',
        contentType: 'place',
        status: 'pending',
        priority: 'medium',
        content: { title: 'Test Place' }
      },
      {
        id: 'mod_item_2',
        contentType: 'user_report',
        status: 'pending',
        priority: 'high',
        content: { title: 'Test Report' }
      }
    ]

    mockApiClient.moderation.queue.list.mockResolvedValue({
      success: true,
      data: mockQueueItems
    })

    const { result } = renderHook(() => useModerationQueue({ status: 'pending' }))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toEqual(mockQueueItems)
    expect(result.current.error).toBeNull()
    expect(mockApiClient.moderation.queue.list).toHaveBeenCalledWith({ status: 'pending' })
  })

  it('should work for admin users as well', async () => {
    const mockAdmin = {
      id: 'admin1',
      role: 'admin',
      fullName: 'Admin User'
    }

    mockUseAuth.mockReturnValue({
      user: mockAdmin,
      loading: false,
      error: null
    } as any)

    mockApiClient.moderation.queue.list.mockResolvedValue({
      success: true,
      data: []
    })

    const { result } = renderHook(() => useModerationQueue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApiClient.moderation.queue.list).toHaveBeenCalled()
  })

  it('should not fetch for non-moderator users', async () => {
    const mockTraveler = {
      id: 'traveler1',
      role: 'traveler',
      fullName: 'Regular User'
    }

    mockUseAuth.mockReturnValue({
      user: mockTraveler,
      loading: false,
      error: null
    } as any)

    const { result } = renderHook(() => useModerationQueue())

    expect(result.current.loading).toBe(false)
    expect(result.current.items).toEqual([])
    expect(mockApiClient.moderation.queue.list).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const mockModerator = {
      id: 'moderator1',
      role: 'moderator',
      fullName: 'Moderator User'
    }

    mockUseAuth.mockReturnValue({
      user: mockModerator,
      loading: false,
      error: null
    } as any)

    mockApiClient.moderation.queue.list.mockRejectedValue(new Error('Network error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useModerationQueue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Có lỗi xảy ra khi tải dữ liệu')
    expect(result.current.items).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching moderation queue:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should handle unsuccessful API responses', async () => {
    const mockModerator = {
      id: 'moderator1',
      role: 'moderator',
      fullName: 'Moderator User'
    }

    mockUseAuth.mockReturnValue({
      user: mockModerator,
      loading: false,
      error: null
    } as any)

    mockApiClient.moderation.queue.list.mockResolvedValue({
      success: false,
      error: 'Unauthorized access'
    })

    const { result } = renderHook(() => useModerationQueue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Unauthorized access')
    expect(result.current.items).toEqual([])
  })

  it('should review items successfully', async () => {
    const mockModerator = {
      id: 'moderator1',
      role: 'moderator',
      fullName: 'Moderator User'
    }

    mockUseAuth.mockReturnValue({
      user: mockModerator,
      loading: false,
      error: null
    } as any)

    // Initial fetch
    mockApiClient.moderation.queue.list.mockResolvedValueOnce({
      success: true,
      data: [{ id: 'mod_item_1', status: 'pending' }]
    })

    // Review action
    mockApiClient.moderation.queue.review.mockResolvedValueOnce({
      success: true,
      message: 'Item approved successfully'
    })

    // Refresh after review
    mockApiClient.moderation.queue.list.mockResolvedValueOnce({
      success: true,
      data: []
    })

    const { result } = renderHook(() => useModerationQueue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const reviewResult = await result.current.reviewItem('mod_item_1', 'approve', 'Looks good')

    expect(reviewResult.success).toBe(true)
    expect(reviewResult.message).toBe('Item approved successfully')
    expect(mockApiClient.moderation.queue.review).toHaveBeenCalledWith('mod_item_1', 'approve', 'Looks good', undefined)
    expect(mockApiClient.moderation.queue.list).toHaveBeenCalledTimes(2) // Initial fetch + refresh
  })

  it('should handle review errors', async () => {
    const mockModerator = {
      id: 'moderator1',
      role: 'moderator',
      fullName: 'Moderator User'
    }

    mockUseAuth.mockReturnValue({
      user: mockModerator,
      loading: false,
      error: null
    } as any)

    mockApiClient.moderation.queue.list.mockResolvedValue({
      success: true,
      data: []
    })

    mockApiClient.moderation.queue.review.mockRejectedValue(new Error('Review failed'))

    const { result } = renderHook(() => useModerationQueue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const reviewResult = await result.current.reviewItem('mod_item_1', 'reject')

    expect(reviewResult.success).toBe(false)
    expect(reviewResult.error).toBe('Review failed')
  })

  it('should handle filters correctly', async () => {
    const mockModerator = {
      id: 'moderator1',
      role: 'moderator',
      fullName: 'Moderator User'
    }

    mockUseAuth.mockReturnValue({
      user: mockModerator,
      loading: false,
      error: null
    } as any)

    mockApiClient.moderation.queue.list.mockResolvedValue({
      success: true,
      data: []
    })

    const filters = {
      status: 'pending',
      contentType: 'place',
      priority: 'high',
      limit: 10
    }

    renderHook(() => useModerationQueue(filters))

    await waitFor(() => {
      expect(mockApiClient.moderation.queue.list).toHaveBeenCalledWith(filters)
    })
  })
})
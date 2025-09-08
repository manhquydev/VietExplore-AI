// src/hooks/use-ai-suggestions.ts
import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { auth } from '@/lib/firebase'
import type { ItinerarySuggestionsInput, ItinerarySuggestionsOutput } from '@/ai/flows/itinerary-suggestions'

interface AiOptions {
  interests: Array<{
    value: string
    label: string
    icon: string
  }>
  budgets: Array<{
    value: string
    label: string
    range: string
  }>
  tripTypes: Array<{
    value: string
    label: string
    icon: string
  }>
  regions: Array<{
    value: string
    label: string
    description: string
  }>
  seasons: Array<{
    value: string
    label: string
    months: string
  }>
}

interface AiLimits {
  maxDuration: number
  maxSuggestions: number
  dailyLimit: number
}

interface UseAiSuggestionsResult {
  suggestions: ItinerarySuggestionsOutput | null
  loading: boolean
  error: string | null
  options: AiOptions | null
  limits: AiLimits | null
  available: boolean
  userRole: string | null
  generateSuggestions: (input: ItinerarySuggestionsInput) => Promise<ItinerarySuggestionsOutput | null>
  resetSuggestions: () => void
}

export function useAiSuggestions(): UseAiSuggestionsResult {
  const { isAuthenticated } = useAuth()
  const [suggestions, setSuggestions] = useState<ItinerarySuggestionsOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<AiOptions | null>(null)
  const [limits, setLimits] = useState<AiLimits | null>(null)
  const [available, setAvailable] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Fetch AI options and user limits
  const fetchOptions = useCallback(async () => {
    if (!isAuthenticated) {
      setAvailable(false)
      setOptions(null)
      setLimits(null)
      setUserRole(null)
      return
    }

    try {
      const user = auth.currentUser
      if (!user) {
        setAvailable(false)
        return
      }

      const token = await user.getIdToken()
      const response = await fetch('/api/ai/itinerary-suggestions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAvailable(data.available)
        setOptions(data.options)
        setLimits(data.limits)
        setUserRole(data.userRole)
      } else {
        console.error('Failed to fetch AI options:', response.status, response.statusText)
        setAvailable(false)
      }
    } catch (err) {
      console.error('Error fetching AI options:', err)
      setAvailable(false)
    }
  }, [isAuthenticated])

  // Generate AI suggestions
  const generateSuggestions = useCallback(async (input: ItinerarySuggestionsInput): Promise<ItinerarySuggestionsOutput | null> => {
    if (!isAuthenticated) {
      setError('Authentication required')
      return null
    }

    if (!available) {
      setError('AI suggestions not available for your account level')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) {
        setError('Authentication required')
        return null
      }

      const token = await user.getIdToken()
      const response = await fetch('/api/ai/itinerary-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle specific error codes
        switch (errorData.code) {
          case 'NO_PLACES_FOUND':
            throw new Error('Không tìm thấy địa điểm phù hợp. Thử điều chỉnh sở thích của bạn.')
          case 'AI_SERVICE_UNAVAILABLE':
            throw new Error('Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.')
          default:
            throw new Error(errorData.error || 'Không thể tạo gợi ý. Vui lòng thử lại.')
        }
      }

      const data = await response.json()
      setSuggestions(data.data)
      return data.data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, available])

  // Reset suggestions
  const resetSuggestions = useCallback(() => {
    setSuggestions(null)
    setError(null)
  }, [])

  // Fetch options when authentication state changes
  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  return {
    suggestions,
    loading,
    error,
    options,
    limits,
    available,
    userRole,
    generateSuggestions,
    resetSuggestions
  }
}

// Helper hook for building AI preferences from UI state
export function useAiPreferences() {
  const [preferences, setPreferences] = useState<ItinerarySuggestionsInput['preferences']>({
    interests: [],
    budget: 'medium',
    duration: 3,
    tripType: 'couple'
  })

  const updatePreferences = useCallback((updates: Partial<ItinerarySuggestionsInput['preferences']>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }, [])

  const toggleInterest = useCallback((interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest as any)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest as any]
    }))
  }, [])

  const validatePreferences = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (preferences.interests.length === 0) {
      errors.push('Vui lòng chọn ít nhất một sở thích')
    }

    if (preferences.duration < 1) {
      errors.push('Thời gian chuyến đi phải ít nhất 1 ngày')
    }

    if (preferences.duration > 30) {
      errors.push('Thời gian chuyến đi không được vượt quá 30 ngày')
    }

    if (preferences.budget === 'low' && preferences.duration > 14) {
      errors.push('Chuyến đi ngân sách thấp không được vượt quá 14 ngày')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }, [preferences])

  const resetPreferences = useCallback(() => {
    setPreferences({
      interests: [],
      budget: 'medium',
      duration: 3,
      tripType: 'couple'
    })
  }, [])

  return {
    preferences,
    updatePreferences,
    toggleInterest,
    validatePreferences,
    resetPreferences
  }
}
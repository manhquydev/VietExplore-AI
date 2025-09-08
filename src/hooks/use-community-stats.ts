import { useState, useEffect } from 'react'

interface CommunityStats {
  totalMembers: number
  totalPlaces: number
  totalItineraries: number
  monthlyGrowth: number
  weeklyHighlights: {
    topPlace: { name: string, likes: number, slug: string } | null
    trending: string[]
    topItinerary: { title: string, author: string } | null
  }
}

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/community/stats', {
          cache: 'no-store'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          setStats(result.data)
        } else {
          setError(result.error || 'Không thể tải thống kê cộng đồng')
        }
      } catch (err: any) {
        setError('Có lỗi xảy ra khi tải dữ liệu')
        console.error('Error fetching community stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const refetch = async () => {
    await fetchStats()
  }

  async function fetchStats() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/community/stats', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setStats(result.data)
      } else {
        setError(result.error || 'Không thể tải thống kê cộng đồng')
      }
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải dữ liệu')
      console.error('Error fetching community stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    error,
    refetch
  }
}
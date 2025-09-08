import { useState, useEffect } from 'react'
import { UserRole } from '@/lib/types/auth'

interface TopContributor {
  id: string
  name: string
  username: string
  avatar: string | null
  contributions: number
  verified: boolean
  role: UserRole
  trustLabel: string
}

interface UseTopContributorsOptions {
  limit?: number
}

export function useTopContributors(options: UseTopContributorsOptions = {}) {
  const { limit = 10 } = options
  const [contributors, setContributors] = useState<TopContributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContributors() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ 
          limit: limit.toString() 
        })
        
        const response = await fetch(`/api/community/top-contributors?${params}`, {
          cache: 'no-store'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          setContributors(result.data)
        } else {
          setError(result.error || 'Không thể tải danh sách người đóng góp')
        }
      } catch (err: any) {
        setError('Có lỗi xảy ra khi tải dữ liệu')
        console.error('Error fetching top contributors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContributors()
  }, [limit])

  const refetch = async () => {
    await fetchContributors()
  }

  async function fetchContributors() {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ 
        limit: limit.toString() 
      })
      
      const response = await fetch(`/api/community/top-contributors?${params}`, {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setContributors(result.data)
      } else {
        setError(result.error || 'Không thể tải danh sách người đóng góp')
      }
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải dữ liệu')
      console.error('Error fetching top contributors:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    contributors,
    loading,
    error,
    refetch
  }
}
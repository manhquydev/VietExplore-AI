"use client"

import * as React from "react"

export interface User {
  id: string
  email: string
  fullName: string
  username: string
  avatar?: string
  role: "guest" | "traveler" | "contributor" | "partner" | "moderator" | "admin"
  verified: boolean
  createdAt: string
  profile?: {
    bio?: string
    location?: string
    website?: string
  }
  stats?: {
    placesContributed: number
    itinerariesCreated: number
    helpfulVotes: number
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

interface RegisterData {
  fullName: string
  email: string
  password: string
  agreeToTerms: boolean
  subscribeNewsletter?: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Initialize auth state
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session
        const token = localStorage.getItem('auth_token')
        if (token) {
          // TODO: Validate token with API
          // For now, use mock user data
          const mockUser: User = {
            id: "user_001",
            email: "user@example.com",
            fullName: "Nguyễn Văn A",
            username: "nguyen_van_a",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            role: "traveler",
            verified: false,
            createdAt: new Date().toISOString(),
            profile: {
              bio: "Yêu thích khám phá những địa điểm mới",
              location: "Hà Nội, Việt Nam"
            },
            stats: {
              placesContributed: 0,
              itinerariesCreated: 2,
              helpfulVotes: 5
            }
          }
          setUser(mockUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // TODO: Implement actual login API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      // Mock successful login
      const mockUser: User = {
        id: "user_001",
        email,
        fullName: "Nguyễn Văn A",
        username: email.split('@')[0],
        role: "traveler",
        verified: false,
        createdAt: new Date().toISOString(),
        stats: {
          placesContributed: 0,
          itinerariesCreated: 0,
          helpfulVotes: 0
        }
      }

      setUser(mockUser)
      localStorage.setItem('auth_token', 'mock_token_' + Date.now())
    } catch (error) {
      throw new Error('Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      // TODO: Implement actual registration API call
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call

      // Mock successful registration
      const mockUser: User = {
        id: "user_" + Date.now(),
        email: data.email,
        fullName: data.fullName,
        username: data.email.split('@')[0],
        role: "traveler",
        verified: false,
        createdAt: new Date().toISOString(),
        stats: {
          placesContributed: 0,
          itinerariesCreated: 0,
          helpfulVotes: 0
        }
      }

      setUser(mockUser)
      localStorage.setItem('auth_token', 'mock_token_' + Date.now())
    } catch (error) {
      throw new Error('Đăng ký thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


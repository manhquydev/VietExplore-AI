"use client"

import * as React from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithCustomToken,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth, googleProvider, isMobileDevice } from '@/lib/firebase'
import { User } from '@/lib/types/auth'
import { toastService } from '@/lib/ui/toast-service'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  loginWithGoogle: () => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  logout: () => Promise<void>
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

  // Force refresh user data from API
  const refreshUserData = React.useCallback(async (firebaseUser: any) => {
    try {
      const token = await firebaseUser.getIdToken(true) // Force refresh token
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache' // Prevent caching
        }
      })

      if (response.ok) {
        const { user } = await response.json()
        setUser({
          ...user,
          uid: firebaseUser.uid
        })
        return true
      } else if (response.status === 401) {
        console.warn('Auth token invalid, signing out user')
        await signOut(auth)
        setUser(null)
        return false
      } else {
        console.error('Failed to fetch user data:', response.status)
        // Use fallback user data
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || 'User',
          username: firebaseUser.email?.split('@')[0] || 'user',
          role: 'traveler' as any,
          verified: false,
          emailVerified: firebaseUser.emailVerified,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            placesContributed: 0,
            itinerariesCreated: 0,
            helpfulVotes: 0
          }
        })
        return true
      }
    } catch (error: any) {
      console.error('Error refreshing user data:', error)
      if (error?.code === 'auth/token-expired' || error?.code === 'auth/id-token-expired') {
        await signOut(auth)
        setUser(null)
        return false
      }
      return false
    }
  }, [])

  // Initialize auth state with Firebase
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Retry mechanism with exponential backoff for new users
          const maxRetries = 3
          const baseDelay = 500
          let lastError: any = null

          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              const token = await firebaseUser.getIdToken()
              const response = await fetch('/api/auth/me', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Cache-Control': 'no-cache'
                }
              })

              if (response.ok) {
                const { user } = await response.json()
                setUser({
                  ...user,
                  uid: firebaseUser.uid
                })
                setIsLoading(false)
                return // Success - exit early
              } else if (response.status === 401) {
                // User document might not exist yet (Google sign-in race condition)
                console.log(`Attempt ${attempt + 1}/${maxRetries}: User document not found, retrying...`)

                if (attempt < maxRetries - 1) {
                  // Wait with exponential backoff before retrying
                  const delay = baseDelay * Math.pow(2, attempt)
                  await new Promise(resolve => setTimeout(resolve, delay))
                  continue
                } else {
                  // Final attempt failed - check if this is a real auth error
                  try {
                    // Verify token is still valid
                    await firebaseUser.getIdToken(true) // Force refresh

                    // Token is valid but user doc doesn't exist - use fallback
                    console.warn('User document not found after retries, using fallback data')
                    lastError = null // Clear error - we'll use fallback
                    break
                  } catch (tokenError: any) {
                    // Token is actually invalid - sign out
                    if (tokenError?.code === 'auth/token-expired' ||
                        tokenError?.code === 'auth/id-token-expired') {
                      console.warn('Token expired, signing out')
                      await signOut(auth)
                      setUser(null)
                      setIsLoading(false)
                      return
                    }
                  }
                }
              } else {
                console.error(`Attempt ${attempt + 1}/${maxRetries}: Unexpected status ${response.status}`)
                lastError = new Error(`HTTP ${response.status}`)

                if (attempt < maxRetries - 1) {
                  const delay = baseDelay * Math.pow(2, attempt)
                  await new Promise(resolve => setTimeout(resolve, delay))
                  continue
                }
              }
            } catch (fetchError: any) {
              console.error(`Attempt ${attempt + 1}/${maxRetries}:`, fetchError)
              lastError = fetchError

              if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt)
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
              }
            }
          }

          // All retries exhausted - use fallback user data
          console.warn('Using fallback user data after retries')
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || 'User',
            username: firebaseUser.email?.split('@')[0] || 'user',
            role: 'traveler' as any,
            verified: false,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            stats: {
              placesContributed: 0,
              itinerariesCreated: 0,
              helpfulVotes: 0
            }
          })

        } catch (error: any) {
          console.error('Critical error in auth state change:', error)

          // Only sign out for specific auth errors
          if (error?.code === 'auth/token-expired' ||
              error?.code === 'auth/id-token-expired' ||
              error?.code === 'auth/user-disabled' ||
              error?.code === 'auth/user-token-expired') {
            console.warn('Auth error, signing out user')
            await signOut(auth)
            setUser(null)
          } else {
            // For other errors, use fallback
            console.warn('Using fallback user data due to critical error')
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || 'User',
              username: firebaseUser.email?.split('@')[0] || 'user',
              role: 'traveler' as any,
              verified: false,
              emailVerified: firebaseUser.emailVerified,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              stats: {
                placesContributed: 0,
                itinerariesCreated: 0,
                helpfulVotes: 0
              }
            })
          }
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Handle redirect result from Google sign-in (mobile)
  // Note: onAuthStateChanged will automatically handle the redirect result
  // This effect just ensures user document creation for Google sign-in after redirect
  React.useEffect(() => {
    let mounted = true

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)

        if (!mounted) return

        if (result?.user) {
          console.log('[Redirect] User returned from Google OAuth, ensuring user document exists...')

          // Ensure user document exists after redirect
          try {
            const registerResponse = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: result.user.uid,
                email: result.user.email,
                password: 'google-auth-placeholder',
                fullName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
                photoURL: result.user.photoURL, // ✅ Lấy avatar từ Google
                acceptTerms: true,
                isGoogleAuth: true
              }),
            })

            if (registerResponse.ok) {
              const data = await registerResponse.json()
              console.log('[Redirect] User document ensured:', data.isExisting ? 'existing' : 'created')

              // Wait for Firestore propagation
              await new Promise(resolve => setTimeout(resolve, 500))

              if (mounted) {
                toastService.success('Thành công', 'Đăng nhập Google thành công!')
              }
            } else {
              console.error('[Redirect] Failed to create user document:', await registerResponse.text())
            }
          } catch (docError) {
            console.error('[Redirect] Error ensuring user document:', docError)
            // Still show success - onAuthStateChanged will handle fallback
          }
        } else {
          console.log('[Redirect] No pending redirect result')
        }
      } catch (error: any) {
        // Only log non-null errors (null means no redirect pending)
        if (error && mounted) {
          console.error('[Redirect] Error handling redirect result:', error)
          if (error.code !== 'auth/popup-closed-by-user') {
            toastService.error('Lỗi', 'Đăng nhập thất bại sau redirect')
          }
        }
      }
    }

    // Small delay to ensure auth is initialized
    const timer = setTimeout(() => {
      if (mounted) {
        handleRedirectResult()
      }
    }, 200)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toastService.error('Đăng nhập thất bại', data.error || 'Email hoặc mật khẩu không đúng')
        throw new Error(data.error || 'Đăng nhập thất bại')
      }

      // Sign in on client with custom token
      // DON'T set user here - let onAuthStateChanged handle it
      await signInWithCustomToken(auth, data.token)

      // Success toast
      toastService.success('Thành công', 'Đăng nhập thành công!')

    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Đăng nhập thất bại')
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          acceptTerms: data.agreeToTerms
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toastService.error('Đăng ký thất bại', result.error || 'Không thể tạo tài khoản')
        throw new Error(result.error || 'Đăng ký thất bại')
      }

      // Sign in on client with custom token from register response
      // DON'T set user here - let onAuthStateChanged handle it
      await signInWithCustomToken(auth, result.token)

      // Success toast
      toastService.success('Đăng ký thành công', 'Chào mừng bạn đến với Du Lịch Việt!')

    } catch (error: any) {
      console.error('Register error:', error)
      throw new Error(error.message || 'Đăng ký thất bại')
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const isMobile = isMobileDevice()

      if (isMobile) {
        // Use redirect for mobile
        console.log('[Mobile] Starting Google redirect flow...')
        toastService.info('Đang chuyển hướng...', 'Vui lòng đợi')
        await signInWithRedirect(auth, googleProvider)
        console.log('[Mobile] Redirect initiated, user will be redirected...')
        return true
      } else {
        // Try popup first for desktop
        let result
        try {
          result = await signInWithPopup(auth, googleProvider)
        } catch (popupError: any) {
          // Auto-fallback to redirect if popup fails due to COOP or blocking
          if (
            popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message?.includes('Cross-Origin-Opener-Policy')
          ) {
            console.log('Popup failed, falling back to redirect...', popupError.code)
            toastService.info('Đang chuyển hướng...', 'Popup bị chặn, chuyển sang redirect')
            await signInWithRedirect(auth, googleProvider)
            return true
          }
          // Re-throw other errors
          throw popupError
        }

        // Ensure user document exists IMMEDIATELY after Google sign-in
        if (result.user) {
          console.log('Google sign-in successful, ensuring user document exists...')

          try {
            // Create or get user document (idempotent operation)
            const registerResponse = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: result.user.uid,
                email: result.user.email,
                password: 'google-auth-placeholder',
                fullName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
                photoURL: result.user.photoURL, // ✅ Lấy avatar từ Google
                acceptTerms: true,
                isGoogleAuth: true
              }),
            })

            if (!registerResponse.ok) {
              console.error('Failed to create user document:', await registerResponse.text())
              throw new Error('Failed to create user document')
            }

            const data = await registerResponse.json()
            console.log('User document ensured:', data.isExisting ? 'existing' : 'created')

            // Wait a brief moment for Firestore to propagate
            await new Promise(resolve => setTimeout(resolve, 500))
          } catch (docError) {
            console.error('Error ensuring user document:', docError)
            // Don't fail the entire login - onAuthStateChanged will handle fallback
          }
        }

        toastService.success('Thành công', 'Đăng nhập Google thành công!')
        return true
      }
    } catch (error: any) {
      console.error('Google login error:', error)

      if (error.code === 'auth/popup-blocked') {
        toastService.error('Popup bị chặn', 'Vui lòng cho phép popup hoặc làm mới trang')
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Silent - user cancelled
        console.log('User cancelled Google sign-in')
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toastService.warning('Tài khoản đã tồn tại', 'Email này đã được đăng ký với phương thức khác')
      } else {
        toastService.error('Lỗi', 'Đăng nhập Google thất bại')
      }
      return false
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      if (!email || !email.trim()) {
        toastService.error('Thiếu thông tin', 'Vui lòng nhập email')
        return false
      }

      await sendPasswordResetEmail(auth, email)
      toastService.success('Email đã gửi', 'Vui lòng kiểm tra hộp thư để đặt lại mật khẩu')
      return true
    } catch (error: any) {
      console.error('Reset password error:', error)
      toastService.error('Lỗi', 'Không thể gửi email đặt lại mật khẩu')
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      toastService.success('Đã đăng xuất', 'Hẹn gặp lại!')
    } catch (error) {
      console.error('Logout error:', error)
      toastService.error('Lỗi', 'Không thể đăng xuất')
    }
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
    loginWithGoogle,
    resetPassword,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  LogIn,
  Shield,
  UserCheck,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { TEST_CREDENTIALS } from "@/lib/mock-data"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useAuth()
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const redirectUrl = searchParams.get('redirect') || '/'

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl)
    }
  }, [isAuthenticated, router, redirectUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login(email, password)
      router.push(redirectUrl)
    } catch (err) {
      setError("Email hoặc mật khẩu không đúng")
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = (role: string) => {
    const credentials = TEST_CREDENTIALS[role as keyof typeof TEST_CREDENTIALS]
    if (credentials && 'email' in credentials) {
      setEmail(credentials.email)
      setPassword(credentials.password)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-800/40 dark:to-slate-900/60"></div>
          
          <div className="relative container">
            <div className="max-w-md mx-auto">
              {/* Welcome Message */}
              <div className="glass-card text-center p-8 mb-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                </div>
                <h1 className="gradient-text text-3xl sm:text-4xl font-bold mb-4">
                  Chào mừng trở lại
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Tiếp tục hành trình khám phá Việt Nam cùng chúng tôi
                </p>
              </div>

              {/* Quick Test Logins - Development only */}
              {process.env.NODE_ENV === 'development' && (
                <div className="glass-card p-6 mb-6 border border-sky-200/30 dark:border-sky-700/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Test Login</h3>
                    <Badge variant="outline" className="text-xs glass-subtle">DEV</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => quickLogin('traveler')}
                        className="glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40"
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        Traveler
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => quickLogin('contributor')}
                        className="glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40"
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        Contributor
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => quickLogin('partner')}
                        className="glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Partner
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => quickLogin('moderator')}
                        className="glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Moderator
                      </Button>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40" 
                      onClick={() => quickLogin('admin')}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Button>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <div className="glass-card p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-lg glass-subtle">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="glass-subtle pl-10 border-white/20 dark:border-slate-700/50 focus:border-sky-300 dark:focus:border-sky-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="glass-subtle pl-10 pr-10 border-white/20 dark:border-slate-700/50 focus:border-sky-300 dark:focus:border-sky-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500" 
                      />
                      <span className="text-slate-600 dark:text-slate-300">Ghi nhớ đăng nhập</span>
                    </label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-medium h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang đăng nhập...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200/50 dark:border-slate-700/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white/80 dark:bg-slate-800/80 px-4 text-slate-500 dark:text-slate-400">
                        hoặc
                      </span>
                    </div>
                  </div>
                  <div className="text-center text-sm mt-6">
                    <span className="text-slate-600 dark:text-slate-300">Chưa có tài khoản? </span>
                    <Link 
                      href="/auth/register" 
                      className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium transition-colors"
                    >
                      Đăng ký ngay
                    </Link>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="glass-card mt-6 p-6 text-center">
                <div className="flex items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Bảo mật cao</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    <span>Xác thực 2FA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Trải nghiệm cá nhân</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

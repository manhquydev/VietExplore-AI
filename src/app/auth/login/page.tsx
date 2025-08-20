"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight
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

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google login initiated")
  }

  const quickLogin = (role: string) => {
    const credentials = TEST_CREDENTIALS[role as keyof typeof TEST_CREDENTIALS]
    if (credentials && 'email' in credentials) {
      setEmail(credentials.email)
      setPassword(credentials.password)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative min-h-screen pt-20 pb-12">
        <div className="container">
          <div className="max-w-md mx-auto">
            {/* Welcome Header with Logo */}
            <div className="text-center mb-8 space-y-6">
              <div className="space-y-4">
                {/* Project Logo */}
                <div className="flex justify-center">
                  <Logo variant="stacked" size="lg" className="h-20" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    <span className="text-foreground">Chào mừng</span>
                    <br />
                    <span className="gradient-text">trở lại</span>
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Tiếp tục hành trình khám phá{" "}
                    <span className="font-medium text-primary">cửa sổ Việt Nam</span>
                  </p>
                </div>
              </div>
            </div>
            {/* Login Form */}
            <div className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Đăng nhập</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
                  </div>
                </div>

                {/* Google Login */}
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Đăng nhập với Google
                </Button>
              </form>

              {/* Links */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <div className="text-center">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  Chưa có tài khoản?{" "}
                  <Link 
                    href="/auth/register" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

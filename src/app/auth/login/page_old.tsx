"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
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
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
            <p className="text-muted">
              Truy cập tài khoản Du Lịch Việt của bạn
            </p>
          </div>

          {/* Quick Test Logins - Development only */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mb-6 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  🧪 Quick Test Login
                  <Badge variant="outline" className="text-xs">DEV</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => quickLogin('traveler')}>
                    Traveler
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => quickLogin('contributor')}>
                    Contributor
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => quickLogin('partner')}>
                    Partner
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => quickLogin('moderator')}>
                    Moderator
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => quickLogin('admin')}>
                  Admin
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-4"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                    >
                      <Icon name={showPassword ? "eye-off" : "eye"} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-border" />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-sm">
                    Quên mật khẩu?
                  </Button>
                </div>

                <Button type="submit" className="w-full" loading={isLoading}>
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>

              <div className="mt-6">
                <Separator />
                <div className="text-center text-sm mt-4">
                  <span className="text-muted">Chưa có tài khoản? </span>
                  <Link href="/auth/register" className="text-primary hover:underline">
                    Đăng ký ngay
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}


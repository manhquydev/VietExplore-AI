"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@/components/ui/icon"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    location: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Vui lòng đồng ý với điều khoản sử dụng"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        agreeToTerms: formData.agreeToTerms,
        subscribeNewsletter: formData.subscribeNewsletter,
      })
      
      router.push('/')
    } catch (err) {
      setErrors({ general: "Đã có lỗi xảy ra. Vui lòng thử lại." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Tạo tài khoản</h1>
            <p className="text-muted">
              Tham gia cộng đồng Du Lịch Việt
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
                    {errors.general}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                    className={cn(errors.fullName && "border-danger")}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-danger">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className={cn(errors.email && "border-danger")}
                  />
                  {errors.email && (
                    <p className="text-sm text-danger">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      className={cn("pr-10", errors.password && "border-danger")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                    >
                      <Icon name={showPassword ? "eye-off" : "eye"} />
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-danger">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      className={cn("pr-10", errors.confirmPassword && "border-danger")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                    >
                      <Icon name={showConfirmPassword ? "eye-off" : "eye"} />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-danger">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu bản thân (tùy chọn)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Chia sẻ về sở thích du lịch của bạn..."
                    value={formData.bio}
                    onChange={handleInputChange('bio')}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm (tùy chọn)</Label>
                  <Input
                    id="location"
                    placeholder="VD: Hà Nội, Việt Nam"
                    value={formData.location}
                    onChange={handleInputChange('location')}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))
                        if (errors.agreeToTerms) {
                          setErrors(prev => ({ ...prev, agreeToTerms: "" }))
                        }
                      }}
                      className={cn(errors.agreeToTerms && "border-danger")}
                    />
                    <label htmlFor="agreeToTerms" className="text-sm leading-tight">
                      Tôi đồng ý với{" "}
                      <Link href="/legal/terms" className="text-primary hover:underline">
                        Điều khoản sử dụng
                      </Link>{" "}
                      và{" "}
                      <Link href="/legal/privacy" className="text-primary hover:underline">
                        Chính sách bảo mật
                      </Link>{" "}
                      *
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-danger">{errors.agreeToTerms}</p>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="subscribeNewsletter"
                      checked={formData.subscribeNewsletter}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, subscribeNewsletter: !!checked }))}
                    />
                    <label htmlFor="subscribeNewsletter" className="text-sm text-muted">
                      Nhận thông báo về địa điểm mới và cập nhật từ Du Lịch Việt
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full" loading={isLoading}>
                  {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                </Button>
              </form>

              <div className="mt-6">
                <Separator />
                <div className="text-center text-sm mt-4">
                  <span className="text-muted">Đã có tài khoản? </span>
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Đăng nhập ngay
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


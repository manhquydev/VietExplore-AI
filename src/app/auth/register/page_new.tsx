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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  MapPin,
  UserPlus,
  Shield,
  Heart,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
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

  const handleGoogleRegister = () => {
    // TODO: Implement Google OAuth
    console.log("Google register initiated")
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Background with Vietnam imagery - "Sheet of Glass" principle */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-fixed opacity-30"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(14, 165, 233, 0.1)), url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white/60 to-secondary/5" />
      </div>
      
      <Header />
      
      <main className="relative min-h-screen pt-20 pb-12">
        <div className="container">
          <div className="max-w-lg mx-auto">
            {/* Welcome Header - Typography as Voice */}
            <div className="text-center mb-8 space-y-6">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-secondary-700 flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    <span className="text-foreground">Tham gia</span>
                    <br />
                    <span className="gradient-text">cộng đồng</span>
                  </h1>
                  <p className="text-lg text-muted leading-relaxed">
                    Bắt đầu hành trình khám phá{" "}
                    <span className="font-medium text-primary">cửa sổ Việt Nam</span>
                  </p>
                </div>

                {/* Community benefits */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center space-y-1">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted">Khám phá</span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm text-muted">Chia sẻ</span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-sm text-muted">Gợi ý AI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Registration Form - "Eloquence of Emptiness" */}
            <div className="glass-card p-8 space-y-8">
              {/* Google Registration - Primary Option */}
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleRegister}
                  variant="outline" 
                  className="w-full h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-gray-700">Đăng ký với Google</span>
                  </div>
                </Button>
              </div>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-border/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted font-medium">
                    hoặc đăng ký bằng email
                  </span>
                </div>
              </div>

              {/* Email/Password Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="p-4 text-sm text-red-600 bg-red-50/80 border border-red-200/50 rounded-xl backdrop-blur-sm">
                    {errors.general}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground font-medium">
                      Họ và tên *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted">
                        <User className="w-5 h-5" />
                      </div>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={handleInputChange('fullName')}
                        className={cn(
                          "pl-12 h-12 bg-background/50 border-border hover:border-primary/50 focus:border-primary transition-colors",
                          errors.fullName && "border-red-300 focus:border-red-400"
                        )}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">
                      Email *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted">
                        <Mail className="w-5 h-5" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        className={cn(
                          "pl-12 h-12 bg-background/50 border-border hover:border-primary/50 focus:border-primary transition-colors",
                          errors.email && "border-red-300 focus:border-red-400"
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">
                      Mật khẩu *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        className={cn(
                          "pl-12 pr-12 h-12 bg-background/50 border-border hover:border-primary/50 focus:border-primary transition-colors",
                          errors.password && "border-red-300 focus:border-red-400"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                      Xác nhận mật khẩu *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        className={cn(
                          "pl-12 pr-12 h-12 bg-background/50 border-border hover:border-primary/50 focus:border-primary transition-colors",
                          errors.confirmPassword && "border-red-300 focus:border-red-400"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Terms and Newsletter */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                        if (errors.agreeToTerms) {
                          setErrors(prev => ({ ...prev, agreeToTerms: "" }))
                        }
                      }}
                      className={cn(
                        "mt-1",
                        errors.agreeToTerms && "border-red-300"
                      )}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                        Tôi đồng ý với{" "}
                        <Link href="/legal/terms" className="text-primary hover:text-primary-600 underline">
                          Điều khoản sử dụng
                        </Link>{" "}
                        và{" "}
                        <Link href="/legal/privacy" className="text-primary hover:text-primary-600 underline">
                          Chính sách bảo mật
                        </Link>
                      </Label>
                      {errors.agreeToTerms && (
                        <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="subscribeNewsletter"
                      checked={formData.subscribeNewsletter}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, subscribeNewsletter: checked as boolean }))
                      }
                      className="mt-1"
                    />
                    <Label htmlFor="subscribeNewsletter" className="text-sm leading-relaxed text-muted">
                      Tôi muốn nhận email về địa điểm mới, mẹo du lịch và ưu đãi đặc biệt
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-secondary to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang tạo tài khoản...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Tạo tài khoản
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-border/50">
                <p className="text-muted">
                  Đã có tài khoản?{" "}
                  <Link 
                    href="/auth/login" 
                    className="text-primary hover:text-primary-600 font-medium transition-colors"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </div>

            {/* Community Benefits - Social Proof */}
            <div className="glass-card mt-8 p-6 text-center space-y-4">
              <h3 className="font-semibold text-foreground">Tại sao chọn VietExplore?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Hoàn toàn miễn phí</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10">
                  <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">Dữ liệu được bảo mật</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10">
                  <Star className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-foreground">Trải nghiệm cá nhân hóa</span>
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

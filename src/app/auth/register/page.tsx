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
  Sparkles
} from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-800/40 dark:to-slate-900/60"></div>
          
          <div className="relative container">
            <div className="max-w-lg mx-auto">
              {/* Welcome Message */}
              <div className="glass-card text-center p-8 mb-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                </div>
                <h1 className="gradient-text text-3xl sm:text-4xl font-bold mb-4">
                  Tham gia cộng đồng
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Bắt đầu hành trình khám phá Việt Nam cùng chúng tôi
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-500" />
                    <span>Khám phá địa điểm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Chia sẻ trải nghiệm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Nhận gợi ý AI</span>
                  </div>
                </div>
              </div>

              {/* Registration Form */}
              <div className="glass-card p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.general && (
                    <div className="p-4 text-sm text-red-600 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-lg glass-subtle">
                      {errors.general}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 font-medium">
                      Họ và tên *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={handleInputChange('fullName')}
                        className={cn(
                          "glass-subtle pl-10 border-white/20 dark:border-slate-700/50 focus:border-sky-300 dark:focus:border-sky-600",
                          errors.fullName && "border-red-300 dark:border-red-600"
                        )}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                      Email *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        className={cn(
                          "glass-subtle pl-10 border-white/20 dark:border-slate-700/50 focus:border-sky-300 dark:focus:border-sky-600",
                          errors.email && "border-red-300 dark:border-red-600"
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                      Mật khẩu *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        className={cn(
                          "glass-subtle pl-10 pr-10 border-white/20 dark:border-slate-700/50 focus:border-sky-300 dark:focus:border-sky-600",
                          errors.password && "border-red-300 dark:border-red-600"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">
                      Xác nhận mật khẩu *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        className={cn(
                          "glass-subtle pl-10 pr-10 border-white/20 dark:border-slate-700/50 focus:border-sky-300 dark:focus:border-sky-600",
                          errors.confirmPassword && "border-red-300 dark:border-red-600"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300 font-medium">
                      Giới thiệu bản thân (tùy chọn)
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Chia sẻ về sở thích du lịch của bạn..."
                      value={formData.bio}
                      onChange={handleInputChange('bio')}
                      rows={3}
                      className="glass-subtle border-white/20 dark:border-slate-700/50 focus:border-sky-300 dark:focus:border-sky-600 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-slate-700 dark:text-slate-300 font-medium">
                      Địa điểm (tùy chọn)
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <Input
                        id="location"
                        placeholder="VD: Hà Nội, Việt Nam"
                        value={formData.location}
                        onChange={handleInputChange('location')}
                        className="glass-subtle pl-10 border-white/20 dark:border-slate-700/50 focus:border-sky-300 dark:focus:border-sky-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))
                          if (errors.agreeToTerms) {
                            setErrors(prev => ({ ...prev, agreeToTerms: "" }))
                          }
                        }}
                        className={cn(
                          "border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 mt-0.5",
                          errors.agreeToTerms && "border-red-300 dark:border-red-600"
                        )}
                      />
                      <label htmlFor="agreeToTerms" className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        Tôi đồng ý với{" "}
                        <Link href="/legal/terms" className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors">
                          Điều khoản sử dụng
                        </Link>{" "}
                        và{" "}
                        <Link href="/legal/privacy" className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors">
                          Chính sách bảo mật
                        </Link>{" "}
                        *
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.agreeToTerms}</p>
                    )}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="subscribeNewsletter"
                        checked={formData.subscribeNewsletter}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, subscribeNewsletter: !!checked }))}
                        className="border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 mt-0.5"
                      />
                      <label htmlFor="subscribeNewsletter" className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Nhận thông báo về địa điểm mới và cập nhật từ Du Lịch Việt
                      </label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-medium h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang tạo tài khoản...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Tạo tài khoản
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
                    <span className="text-slate-600 dark:text-slate-300">Đã có tài khoản? </span>
                    <Link 
                      href="/auth/login" 
                      className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium transition-colors"
                    >
                      Đăng nhập ngay
                    </Link>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="glass-card mt-6 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 text-center">
                  Lợi ích thành viên
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">Khám phá</p>
                    <p className="text-slate-600 dark:text-slate-300">Tìm kiếm địa điểm độc đáo</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">AI Thông minh</p>
                    <p className="text-slate-600 dark:text-slate-300">Gợi ý lịch trình cá nhân</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">Cộng đồng</p>
                    <p className="text-slate-600 dark:text-slate-300">Kết nối người đam mê</p>
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

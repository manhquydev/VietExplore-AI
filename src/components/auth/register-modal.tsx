"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin?: () => void
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Password validation
  const passwordValidation = React.useMemo(() => {
    const password = formData.password
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*]/.test(password),
    }
  }, [formData.password])

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleCheckboxChange = (field: string) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

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
    } else if (!isPasswordValid) {
      newErrors.password = "Mật khẩu không đáp ứng yêu cầu"
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
      // TODO: Implement actual registration logic
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      // Mock success
      console.log("Registration successful", formData)
      onClose()
    } catch (err) {
      setErrors({ general: "Đã có lỗi xảy ra. Vui lòng thử lại." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Register with ${provider}`)
    // TODO: Implement social registration
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Tạo tài khoản Du Lịch Việt
          </DialogTitle>
          <DialogDescription className="text-center">
            Tham gia cộng đồng du lịch để lưu lịch trình và đóng góp nội dung
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Social Registration */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('google')}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng ký với Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted">
                Hoặc đăng ký bằng email
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleInputChange('fullName')}
                  className={cn("pl-10", errors.fullName && "border-danger")}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-danger">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={cn("pl-10", errors.email && "border-danger")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-danger">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={cn("pl-10 pr-10", errors.password && "border-danger")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-1 text-xs">
                  <div className={cn("flex items-center gap-2", passwordValidation.length ? "text-success" : "text-muted")}>
                    {passwordValidation.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Ít nhất 8 ký tự</span>
                  </div>
                  <div className={cn("flex items-center gap-2", passwordValidation.uppercase ? "text-success" : "text-muted")}>
                    {passwordValidation.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Có ít nhất 1 chữ hoa</span>
                  </div>
                  <div className={cn("flex items-center gap-2", passwordValidation.lowercase ? "text-success" : "text-muted")}>
                    {passwordValidation.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Có ít nhất 1 chữ thường</span>
                  </div>
                  <div className={cn("flex items-center gap-2", passwordValidation.number ? "text-success" : "text-muted")}>
                    {passwordValidation.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Có ít nhất 1 số</span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-sm text-danger">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={cn("pl-10 pr-10", errors.confirmPassword && "border-danger")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-danger">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={handleCheckboxChange('agreeToTerms')}
                  className={cn(errors.agreeToTerms && "border-danger")}
                />
                <label htmlFor="agreeToTerms" className="text-sm leading-tight">
                  Tôi đồng ý với{" "}
                  <a href="/legal/terms" className="text-primary hover:underline">
                    Điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a href="/legal/privacy" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </a>{" "}
                  của Du Lịch Việt *
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-danger">{errors.agreeToTerms}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="subscribeNewsletter"
                  checked={formData.subscribeNewsletter}
                  onCheckedChange={handleCheckboxChange('subscribeNewsletter')}
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

          <div className="text-center text-sm">
            <span className="text-muted">Đã có tài khoản? </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-primary hover:underline"
              onClick={onSwitchToLogin}
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


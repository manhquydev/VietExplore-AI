"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

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
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Vui lòng đồng ý với điều khoản sử dụng"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Use Firebase Auth registration
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Update display name
      await updateProfile(result.user, {
        displayName: formData.fullName
      });
      
      // Send email verification
      await sendEmailVerification(result.user);
      
      // Create user profile in Firestore
      const userProfile = {
        email: formData.email,
        displayName: formData.fullName,
        role: 'traveler',
        status: 'active',
        verifiedContributor: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      
      console.log("Registration successful", formData.email);
      setErrors({ general: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản." });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrors({ general: 'Email này đã được sử dụng' });
          break;
        case 'auth/weak-password':
          setErrors({ general: 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.' });
          break;
        case 'auth/invalid-email':
          setErrors({ general: 'Email không hợp lệ' });
          break;
        default:
          setErrors({ general: error.message || "Đã có lỗi xảy ra. Vui lòng thử lại." });
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      
      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        const userProfile = {
          email: result.user.email!,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          role: 'traveler',
          status: 'active',
          verifiedContributor: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
      }
      
      console.log("Google registration successful");
      onClose();
    } catch (error: any) {
      console.error('Google registration error:', error);
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setErrors({ general: 'Đăng ký bị hủy' });
          break;
        case 'auth/popup-blocked':
          setErrors({ general: 'Popup bị chặn. Vui lòng cho phép popup và thử lại.' });
          break;
        default:
          setErrors({ general: error.message || 'Đăng ký Google thất bại' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white">
        <div className="p-8 space-y-6">
          <DialogHeader className="space-y-4">
            {/* Logo */}
            <div className="flex justify-center">
              <Logo variant="horizontal" size="lg" className="h-12" />
            </div>
            
            <div className="space-y-2">
              <DialogTitle className="text-center text-2xl font-bold text-slate-900">
                Đăng ký
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600">
                Chào mừng tới VietExplore
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Google Register */}
            <Button
              onClick={handleGoogleRegister}
              variant="outline"
              className="w-full h-12 border-2 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium">Tiếp tục với Google</span>
              </div>
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-slate-500">hoặc đăng ký bằng email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {errors.general}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-fullName" className="text-slate-700 font-medium">
                    Họ và tên
                  </Label>
                  <Input
                    id="modal-fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    className="h-11"
                    required
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="modal-email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="h-11"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-password" className="text-slate-700 font-medium">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="modal-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-confirmPassword" className="text-slate-700 font-medium">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="modal-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start space-x-2 text-sm">
                  <input 
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 mt-0.5"
                  />
                  <span className="text-slate-600">
                    Tôi đồng ý với{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                      điều khoản sử dụng
                    </a>{" "}
                    và{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                      chính sách bảo mật
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang đăng ký...
                  </div>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </form>

            {/* Switch to Login */}
            {onSwitchToLogin && (
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Đã có tài khoản?{" "}
                  <button 
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

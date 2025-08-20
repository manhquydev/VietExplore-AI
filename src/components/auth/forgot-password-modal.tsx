"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Logo } from "@/components/ui/logo"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin?: () => void
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin,
}) => {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Vui lòng nhập email")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email không hợp lệ")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // TODO: Implement actual forgot password logic
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Forgot password email sent to:", email)
      setIsSuccess(true)
    } catch (error) {
      console.error('Forgot password error:', error)
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setError("")
    setIsSuccess(false)
    onClose()
  }

  const handleBackToLogin = () => {
    setEmail("")
    setError("")
    setIsSuccess(false)
    if (onBackToLogin) {
      onBackToLogin()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white">
        <div className="p-8 space-y-6">
          <DialogHeader className="space-y-4">
            {/* Logo */}
            <div className="flex justify-center">
              <Logo variant="horizontal" size="lg" className="h-12" />
            </div>
            
            <div className="space-y-2">
              <DialogTitle className="text-center text-2xl font-bold text-slate-900">
                {isSuccess ? "Kiểm tra email" : "Quên mật khẩu"}
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600">
                {isSuccess 
                  ? "Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn"
                  : "Nhập email để nhận link đặt lại mật khẩu"
                }
              </DialogDescription>
            </div>
          </DialogHeader>

          {isSuccess ? (
            /* Success State */
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-slate-600">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email:
                </p>
                <p className="font-medium text-slate-900">{email}</p>
                <p className="text-sm text-slate-500">
                  Kiểm tra cả thư mục spam nếu bạn không thấy email trong hộp thư chính.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleClose}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Đóng
                </Button>
                
                {onBackToLogin && (
                  <Button 
                    onClick={handleBackToLogin}
                    variant="ghost"
                    className="w-full h-11 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại đăng nhập
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Form State */
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    autoFocus
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang gửi...
                    </div>
                  ) : (
                    "Gửi link đặt lại mật khẩu"
                  )}
                </Button>
              </form>

              {/* Back to Login */}
              {onBackToLogin && (
                <div className="text-center pt-4 border-t border-slate-200">
                  <Button 
                    onClick={handleBackToLogin}
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại đăng nhập
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

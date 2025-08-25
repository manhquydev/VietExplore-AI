"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin?: () => void
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Không tìm thấy tài khoản với email này');
          break;
        case 'auth/invalid-email':
          setError('Email không hợp lệ');
          break;
        default:
          setError(error.message || 'Gửi email reset thất bại');
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setSuccess(false);
    setEmail("");
    setError("");
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      onClose();
    }
  }

  const handleSendAgain = () => {
    setSuccess(false);
    setError("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white">
        <div className="p-8 space-y-6">
          {/* Header */}
          <DialogHeader className="space-y-4">
            <div className="flex justify-center mb-4">
              <Logo size="sm" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              {success ? 'Email đã được gửi' : 'Quên mật khẩu?'}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600">
              {success 
                ? `Chúng tôi đã gửi link reset mật khẩu đến ${email}`
                : 'Nhập email để nhận link reset mật khẩu'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Content */}
          <div className="pt-0">
            {success ? (
              // Success State
              <div className="text-center space-y-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Vui lòng kiểm tra email và click vào link để reset mật khẩu.
                    Nếu không thấy email, hãy kiểm tra thư mục spam.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleBackToLogin}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại đăng nhập
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleSendAgain}
                    className="w-full"
                  >
                    Gửi lại email
                  </Button>
                </div>
              </div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-forgot" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email-forgot"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    <span>Gửi email reset</span>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

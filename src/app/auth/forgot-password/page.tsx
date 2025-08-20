"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Mail, 
  ArrowLeft,
  RotateCcw,
  CheckCircle2
} from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // TODO: Implement password reset logic
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      setIsSuccess(true)
    } catch (error) {
      console.error('Password reset error:', error)
      setError("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative min-h-screen pt-20 pb-12">
        <div className="container">
          <div className="max-w-md mx-auto">
            {/* Back to Login */}
            <div className="mb-6">
              <Link 
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
            </div>

            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="text-center mb-8 space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      Quên mật khẩu?
                    </h1>
                    <p className="text-muted leading-relaxed">
                      Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="glass-card p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-4 text-sm text-red-600 bg-red-50/80 border border-red-200/50 rounded-xl">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted">
                          <Mail className="w-5 h-5" />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-12 bg-background/50 border-border hover:border-primary/50 focus:border-primary transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium transition-all duration-200"
                      disabled={isLoading || !email}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Đang gửi...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-5 h-5" />
                          Gửi liên kết đặt lại
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="glass-card p-8 text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-foreground">
                    Email đã được gửi!
                  </h2>
                  <p className="text-muted leading-relaxed">
                    Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                  <p className="text-sm text-muted">
                    Kiểm tra hộp thư đến và làm theo hướng dẫn để đặt lại mật khẩu.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => {
                      setIsSuccess(false)
                      setEmail("")
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    Gửi lại email
                  </Button>
                  
                  <Link 
                    href="/auth/login"
                    className="block w-full text-center text-sm text-primary hover:text-primary-600 transition-colors"
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-8 text-center text-sm text-muted">
              <p>
                Bạn nhớ lại mật khẩu?{" "}
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:text-primary-600 font-medium transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

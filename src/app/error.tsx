"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Logo } from "@/components/ui/logo"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-surface/30 to-primary-50/20 text-text">
      <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        <Header />
        
        <main className="container py-8 lg:py-16 flex items-center justify-center">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Error content */}
              <div className="text-center lg:text-left space-y-8">
                {/* Error indicator */}
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto lg:mx-0 bg-gradient-to-br from-danger/20 to-warn/20 rounded-3xl flex items-center justify-center">
                    <div className="text-4xl font-black text-danger">!</div>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-danger to-warn bg-clip-text text-transparent">
                    Có lỗi xảy ra
                  </h1>
                </div>
                
                <p className="text-lg text-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                  Xin lỗi, đã có lỗi không mong muốn xảy ra trong hành trình khám phá của bạn. 
                  Chúng tôi đã ghi nhận và sẽ khắc phục sớm nhất.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button onClick={reset} size="lg" className="shadow-float">
                    Thử lại
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="shadow-soft"
                    onClick={() => window.location.href = '/'}
                  >
                    Về trang chủ
                  </Button>
                  
                  <Button variant="ghost" asChild size="lg">
                    <a href="mailto:support@dulichviet.com">
                      Báo cáo lỗi
                    </a>
                  </Button>
                </div>
              </div>

              {/* Right side - Visual content */}
              <div className="space-y-6">
                {/* Logo showcase */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-card border-border/50">
                  <CardContent className="p-8 text-center">
                    <Logo variant="horizontal" size="xl" className="mx-auto mb-4" />
                    <p className="text-muted text-sm">
                      Chúng tôi sẽ sớm khắc phục để mang đến trải nghiệm tốt nhất
                    </p>
                  </CardContent>
                </Card>

                {/* Help options */}
                <div className="grid grid-cols-1 gap-4">
                  <Card className="bg-white/60 backdrop-blur-sm shadow-soft border-border/50 hover:shadow-card transition-all duration-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 text-primary">
                        Cần trợ giúp?
                      </h3>
                      <p className="text-muted text-sm mb-4">
                        Liên hệ với đội ngũ hỗ trợ hoặc xem câu hỏi thường gặp
                      </p>
                      <div className="space-y-2">
                        <Button variant="ghost" asChild className="w-full justify-start">
                          <Link href="/help/faq">
                            Câu hỏi thường gặp
                          </Link>
                        </Button>
                        <Button variant="ghost" asChild className="w-full justify-start">
                          <Link href="/about/contact">
                            Liên hệ hỗ trợ
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/60 backdrop-blur-sm shadow-soft border-border/50 hover:shadow-card transition-all duration-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 text-primary">
                        Khám phá ngay
                      </h3>
                      <p className="text-muted text-sm mb-4">
                        Tiếp tục hành trình khám phá Việt Nam
                      </p>
                      <div className="space-y-2">
                        <Link
                          href="/places"
                          className="block text-sm text-muted hover:text-primary transition-colors py-1"
                        >
                          Khám phá địa điểm
                        </Link>
                        <Link
                          href="/ai-assistant/chat"
                          className="block text-sm text-muted hover:text-primary transition-colors py-1"
                        >
                          Trò chuyện với AI
                        </Link>
                        <Link
                          href="/community"
                          className="block text-sm text-muted hover:text-primary transition-colors py-1"
                        >
                          Cộng đồng
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="mt-12 bg-danger/5 border-danger/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-danger mb-4 text-lg">
                    Chi tiết lỗi (Development Mode)
                  </h3>
                  <div className="bg-danger/10 rounded-lg p-4 border border-danger/20">
                    <pre className="text-sm text-danger overflow-auto whitespace-pre-wrap">
                      {error.message}
                    </pre>
                    {error.digest && (
                      <p className="text-xs text-danger/70 mt-2">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}


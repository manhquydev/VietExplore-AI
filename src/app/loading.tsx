import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Logo } from "@/components/ui/logo"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-surface/30 to-primary-50/20 text-text">
      <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        <Header />
        
        <main className="container py-8 lg:py-16 flex items-center justify-center">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Loading content */}
              <div className="text-center lg:text-left space-y-8">
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto lg:mx-0 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent">
                    Đang tải...
                  </h1>
                </div>
                
                <p className="text-lg text-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                  Chúng tôi đang chuẩn bị những trải nghiệm du lịch tuyệt vời nhất cho bạn.
                  Vui lòng chờ một chút.
                </p>

                {/* Loading indicators */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted">Đang tải nội dung...</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <span className="text-sm text-muted">Chuẩn bị dữ liệu...</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <span className="text-sm text-muted">Sắp hoàn tất...</span>
                  </div>
                </div>
              </div>

              {/* Right side - Visual content */}
              <div className="space-y-6">
                {/* Logo showcase */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-card border-border/50">
                  <CardContent className="p-8 text-center">
                    <Logo variant="stacked" size="lg" className="mx-auto mb-4" />
                    <p className="text-muted text-sm">
                      Nền tảng du lịch Việt Nam đáng tin cậy
                    </p>
                  </CardContent>
                </Card>

                {/* Loading skeleton cards */}
                <div className="grid grid-cols-1 gap-4">
                  <Card className="bg-white/60 backdrop-blur-sm shadow-soft border-border/50">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-9 w-full mt-4" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/60 backdrop-blur-sm shadow-soft border-border/50">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <div className="space-y-2 mt-4">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-4/5" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}


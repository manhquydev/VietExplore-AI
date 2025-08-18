import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Logo } from "@/components/ui/logo"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-surface/30 to-primary-50/20 text-text">
      <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        <Header />
        
        <main className="container py-8 lg:py-16 flex items-center justify-center">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Error content */}
              <div className="text-center lg:text-left space-y-8">
                {/* 404 Number */}
                <div className="space-y-4">
                  <div className="text-8xl lg:text-9xl font-black text-primary/20 leading-none">
                    404
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent">
                    Trang không tồn tại
                  </h1>
                </div>
                
                <p className="text-lg text-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                  Có vẻ như bạn đã lạc đường trong hành trình khám phá Việt Nam. 
                  Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="shadow-float">
                    <Link href="/">
                      Về trang chủ
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild size="lg" className="shadow-soft">
                    <Link href="/places">
                      Khám phá địa điểm
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right side - Visual content */}
              <div className="space-y-6">
                {/* Logo showcase */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-card border-border/50">
                  <CardContent className="p-8 text-center">
                    <Logo variant="stacked" size="lg" className="mx-auto mb-4" />
                    <p className="text-muted text-sm">
                      Tiếp tục hành trình khám phá Việt Nam cùng chúng tôi
                    </p>
                  </CardContent>
                </Card>

                {/* Quick navigation */}
                <div className="grid grid-cols-1 gap-4">
                  <Card className="bg-white/60 backdrop-blur-sm shadow-soft border-border/50 hover:shadow-card transition-all duration-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 text-primary">
                        Khám phá cùng AI
                      </h3>
                      <p className="text-muted text-sm mb-4">
                        Để AI trợ lý giúp bạn tạo lịch trình hoàn hảo
                      </p>
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link href="/ai-assistant/chat">
                          Bắt đầu với AI trợ lý
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/60 backdrop-blur-sm shadow-soft border-border/50 hover:shadow-card transition-all duration-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 text-primary">
                        Địa điểm phổ biến
                      </h3>
                      <p className="text-muted text-sm mb-4">
                        Khám phá những điểm đến được yêu thích nhất
                      </p>
                      <div className="space-y-2">
                        <Link 
                          href="/places/regions/bac-bo" 
                          className="block text-sm text-muted hover:text-primary transition-colors py-1"
                        >
                          Miền Bắc - Sapa, Hạ Long, Hà Nội
                        </Link>
                        <Link 
                          href="/places/regions/trung-bo" 
                          className="block text-sm text-muted hover:text-primary transition-colors py-1"
                        >
                          Miền Trung - Đà Nẵng, Hội An, Huế
                        </Link>
                        <Link 
                          href="/places/regions/nam-bo" 
                          className="block text-sm text-muted hover:text-primary transition-colors py-1"
                        >
                          Miền Nam - TP.HCM, Phú Quốc, Đà Lạt
                        </Link>
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


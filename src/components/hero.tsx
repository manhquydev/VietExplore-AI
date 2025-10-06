import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const Hero: React.FC = () => {
  return (
    <section className="container py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Subtle background gradient - like morning mist */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 -z-10" />
      
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        {/* Text Content - "Typography as Voice" */}
        <div className="lg:col-span-6 space-y-8 lg:space-y-10">
          <div className="space-y-6 lg:space-y-8">
            <Badge variant="outline" className="w-fit bg-primary/8 border-primary/20 text-primary font-medium backdrop-blur-sm flex items-center gap-2 text-xs sm:text-sm">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="sm:w-4 sm:h-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21"/>
              </svg>
              Cửa sổ khám phá Việt Nam
            </Badge>
            
            {/* Strong Typography Hierarchy - Confident & Modern */}
            <h1 className="font-bold leading-[1.1] text-[clamp(28px,6vw,68px)] tracking-tight text-text">
              Khám phá vẻ đẹp{" "}
              <span className="gradient-text">
                Việt Nam
              </span>{" "}
              qua ống kính AI
            </h1>
            
            {/* Comfortable reading - like quiet conversation */}
            <p className="text-muted text-base sm:text-lg leading-relaxed max-w-xl">
              Từng thước phim, từng câu chuyện là một cánh cửa mở ra vẻ đẹp bất tận của đất nước. 
              Để AI đồng hành cùng bạn tạo nên hành trình khó quên qua những địa điểm đáng tin cậy nhất.
            </p>
          </div>

          {/* Gentle, refined CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/places">
              <Button
                size="lg"
                className="motion-gentle w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto rounded-xl bg-primary hover:bg-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
              >
                Khám phá ngay →
              </Button>
            </Link>
            <Link href="/ai-assistant/chat">
              <Button
                variant="secondary"
                size="lg"
                className="motion-gentle w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto rounded-xl border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 font-semibold backdrop-blur-sm"
              >
                Trò chuyện với AI
              </Button>
            </Link>
          </div>

          {/* Eloquent emptiness - generous spacing for trust indicators */}
          <div className="pt-8 lg:pt-12 space-y-4 lg:space-y-6">
            <p className="text-xs sm:text-sm text-muted font-semibold uppercase tracking-wider opacity-60">
              Được tin tưởng bởi cộng đồng
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-primary">1K+</div>
                <div className="text-xs sm:text-sm text-muted">Địa điểm xác minh</div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-primary">10K+</div>
                <div className="text-xs sm:text-sm text-muted">Người dùng</div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-primary">100%</div>
                <div className="text-xs sm:text-sm text-muted">Kiểm duyệt</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual - "Sheet of Glass" Principle */}
        <div className="lg:col-span-6 mt-8 lg:mt-0">
          <div className="relative">
            {/* Main Glass Card - Premium photographic art */}
            <div className="relative glass-card overflow-hidden motion-gentle hover:scale-[1.02]">
              <div className="aspect-[4/3] sm:aspect-[5/4] relative">
                {/* High-quality Vietnam landscape placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/15 flex items-center justify-center">
                  <div className="text-center space-y-6 p-8">
                    <div className="text-8xl opacity-40">🌅</div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-text">Golden Hour Vietnam</h3>
                      <p className="text-muted leading-relaxed">
                        Photographic art capturing the soul of each destination
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Gentle motion overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Floating glass elements - Subtle signposts */}
                <div className="absolute top-6 right-6 glass-subtle rounded-xl p-4 motion-soft hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse opacity-80"></div>
                    <span className="text-sm font-medium text-text">AI sẵn sàng hỗ trợ</span>
                  </div>
                </div>
                
                <div className="absolute bottom-6 left-6 glass-subtle rounded-xl p-4 motion-soft">
                  <div className="space-y-1">
                    <div className="font-semibold text-text">Sapa - Hà Giang</div>
                    <div className="text-muted text-sm">4 ngày · Khuyến nghị AI</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating glass cards - Natural, fluid positioning */}
            <div className="absolute -top-8 -left-8 glass-subtle rounded-2xl p-6 hidden lg:block motion-gentle hover:scale-110">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">AI</div>
                <div className="text-sm font-medium text-text">Cá nhân hóa</div>
                <div className="text-xs text-muted">Thông minh</div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 glass-subtle rounded-2xl p-6 hidden lg:block motion-gentle hover:scale-110">
              <div className="text-center space-y-2">
                {/* Only necessary functional icon */}
                <svg className="w-8 h-8 text-success mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <div className="text-sm font-medium text-text">Đáng tin cậy</div>
                <div className="text-xs text-muted">Cộng đồng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

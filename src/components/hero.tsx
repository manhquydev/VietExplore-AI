import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const Hero: React.FC = () => {
  return (
    <section className="container py-20 lg:py-32">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        {/* Text Content */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-6">
            <Badge variant="outline" className="w-fit bg-primary/5 border-primary/20 text-primary">
              ✨ Nền tảng phi lợi nhuận
            </Badge>
            
            <h1 className="font-bold leading-tight text-[clamp(36px,5vw,56px)] tracking-tight">
              Trải nghiệm phép màu của{" "}
              <span className="text-primary">những chuyến đi Việt Nam!</span>
            </h1>
            
            <p className="text-muted text-xl leading-relaxed text-justify max-w-lg">
              Khám phá địa điểm đáng tin cậy khắp Việt Nam và để Trợ lý AI giúp bạn tạo lịch trình hoàn hảo trong vài phút.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-base px-8 py-4 h-auto">
              Bắt đầu với AI →
            </Button>
            <Button variant="secondary" size="lg" className="text-base px-8 py-4 h-auto">
              Khám phá địa điểm
            </Button>
          </div>

          {/* Trust Indicators - Clean, minimal design */}
          <div className="pt-6 space-y-3">
            <p className="text-sm text-muted font-medium">Được tin tưởng bởi:</p>
            <div className="flex flex-wrap gap-6 text-sm text-muted">
              <span className="font-medium">1,000+ địa điểm xác minh</span>
              <span className="font-medium">10,000+ người dùng</span>
              <span className="font-medium">Đối tác chính thống</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Visual */}
        <div className="lg:col-span-6">
          <div className="relative">
            {/* Main Hero Card */}
            <div className="relative rounded-2xl shadow-float overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="aspect-[16/10] relative">
                {/* Placeholder for hero image */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🏝️</div>
                    <p className="text-muted font-medium">
                      Hình ảnh Việt Nam đẹp
                    </p>
                  </div>
                </div>
                
                {/* Overlay với gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Floating Elements - Simplified, no decorative icons */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-card">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">AI đang hoạt động</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-card">
                  <div className="text-sm">
                    <div className="font-medium">Đà Nẵng - Hội An</div>
                    <div className="text-muted">3 ngày 2 đêm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards - Typography focused, minimal icons */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-card p-4 border border-border hidden lg:block">
              <div className="text-center">
                <div className="font-semibold text-primary text-lg">AI</div>
                <div className="font-medium text-sm">Cá nhân hóa</div>
                <div className="text-xs text-muted">Gợi ý thông minh</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-card p-4 border border-border hidden lg:block">
              <div className="text-center">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <div className="font-medium text-sm">Đáng tin cậy</div>
                <div className="text-xs text-muted">Xác minh cộng đồng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

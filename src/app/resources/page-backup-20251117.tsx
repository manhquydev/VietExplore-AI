"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  ExternalLink,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Heart,
  Plane,
  Compass,
  MessageCircle,
  Download,
  Globe,
  CreditCard,
  Smartphone,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react"
import { HotlineCard, SearchBar } from "@/components/resources"
import { getActiveHotlines, getLegacyHotlines } from "@/data"

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showLegacyNumbers, setShowLegacyNumbers] = React.useState(false)

  const activeHotlines = getActiveHotlines()
  const legacyHotlines = getLegacyHotlines()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      <Header />
      
      <main className="min-h-screen pt-14 sm:pt-16 md:pt-20">
        {/* Hero Section - Compact & Optimized */}
        <section className="relative py-6 sm:py-8 md:py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-green-50/40 to-amber-50/60"></div>

          <div className="relative container max-w-7xl">
            <div className="glass-card max-w-4xl mx-auto text-center p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
                </div>
                <h1 className="gradient-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Tài nguyên du lịch
                </h1>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-4 sm:mb-5 md:mb-6 max-w-2xl mx-auto leading-relaxed">
                Tổng hợp đầy đủ các hướng dẫn, công cụ và thông tin cần thiết<br className="hidden sm:block" />
                để bạn có chuyến khám phá Việt Nam an toàn và trọn vẹn.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-4 sm:mb-5">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  showResultCount={false}
                />
              </div>

              {/* Quick access stats */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Hướng dẫn toàn diện</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Cập nhật liên tục</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Dễ dàng tra cứu</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-6 sm:py-8 md:py-10 lg:py-12 max-w-7xl">

        {/* Essential Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10 md:mb-12">
          {/* Travel Planning */}
          <div className="glass-card p-5 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold" />
              </div>
              Lập kế hoạch
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  title: "Mùa du lịch tốt nhất",
                  description: "Thời điểm lý tưởng cho từng vùng miền",
                  icon: Clock,
                  href: "#weather-guide"
                },
                {
                  title: "Ngân sách du lịch",
                  description: "Ước tính chi phí cho các loại hình du lịch",
                  icon: CreditCard,
                  href: "#budget-guide"
                },
                {
                  title: "Khám phá địa điểm",
                  description: "Tìm điểm đến phù hợp với sở thích",
                  icon: MapPin,
                  href: "/places"
                },
                {
                  title: "Trợ lý AI",
                  description: "Lập kế hoạch thông minh với AI",
                  icon: Smartphone,
                  href: "/ai-assistant/chat"
                }
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 glass-subtle rounded-xl hover:bg-slate-100/50 transition-colors group min-h-[64px] sm:min-h-[72px]"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-slate-900 group-hover:text-brand-gold transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-brand-gold transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Transportation */}
          <div className="glass-card p-5 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              </div>
              Di chuyển
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  title: "Vé máy bay",
                  description: "Hãng hàng không và sân bay trong nước",
                  icon: Plane,
                  external: true,
                  href: "https://www.vietnam-airlines.com"
                },
                {
                  title: "Xe khách & tàu hỏa",
                  description: "Đặt vé liên tỉnh thuận tiện",
                  icon: Compass,
                  external: true,
                  href: "https://futabus.vn"
                },
                {
                  title: "Grab & be",
                  description: "Ứng dụng gọi xe phổ biến",
                  icon: Smartphone,
                  external: true,
                  href: "https://www.grab.com/vn/"
                },
                {
                  title: "Thuê xe máy",
                  description: "Hướng dẫn thuê xe và lái xe an toàn",
                  icon: MapPin,
                  href: "#motorbike-guide"
                }
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 glass-subtle rounded-xl hover:bg-slate-100/50 transition-colors group min-h-[64px] sm:min-h-[72px]"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Safety & Health */}
          <div className="glass-card p-5 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
              </div>
              An toàn & sức khỏe
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  title: "Số điện thoại khẩn cấp",
                  description: "Cảnh sát, cứu hỏa, y tế",
                  icon: Phone,
                  href: "#emergency"
                },
                {
                  title: "Bảo hiểm du lịch",
                  description: "Gợi ý các gói bảo hiểm phù hợp",
                  icon: Heart,
                  href: "#insurance"
                },
                {
                  title: "Y tế & thuốc men",
                  description: "Bệnh viện, nhà thuốc 24/7",
                  icon: MessageCircle,
                  href: "#healthcare"
                },
                {
                  title: "An toàn thực phẩm",
                  description: "Lưu ý khi ăn uống tại Việt Nam",
                  icon: AlertTriangle,
                  href: "#food-safety"
                }
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 glass-subtle rounded-xl hover:bg-slate-100/50 transition-colors group min-h-[64px] sm:min-h-[72px]"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-slate-900 group-hover:text-red-600 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Essential Apps Section */}
        <div className="glass-card p-5 sm:p-6 md:p-8 mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 sm:mb-7 md:mb-8 text-center flex items-center justify-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-green" />
            </div>
            Ứng dụng thiết yếu
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[
              {
                name: "Google Translate",
                description: "Dịch tiếng Việt offline",
                category: "Ngôn ngữ",
                colorBg: "bg-blue-100",
                colorIcon: "text-brand-green",
                icon: Globe
              },
              {
                name: "Grab",
                description: "Gọi xe, đặt món",
                category: "Di chuyển",
                colorBg: "bg-emerald-100",
                colorIcon: "text-emerald-600",
                icon: Plane
              },
              {
                name: "Zalo Pay/MoMo",
                description: "Thanh toán không tiền mặt",
                category: "Thanh toán",
                colorBg: "bg-amber-100",
                colorIcon: "text-brand-gold",
                icon: CreditCard
              },
              {
                name: "Maps.me",
                description: "Bản đồ offline",
                category: "Điều hướng",
                colorBg: "bg-amber-100",
                colorIcon: "text-amber-600",
                icon: MapPin
              }
            ].map((app, index) => (
              <div key={index} className="glass-subtle p-4 sm:p-5 md:p-6 rounded-xl text-center hover:scale-105 transition-transform duration-200 min-h-[160px] sm:min-h-[180px]">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${app.colorBg} rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <app.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${app.colorIcon}`} />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-1.5 sm:mb-2">{app.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">{app.description}</p>
                <Badge className="bg-green-100 text-brand-green text-xs">
                  {app.category}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts - UPDATED WITH 112 */}
        <div id="emergency" className="mb-8 sm:mb-10 md:mb-12">
          {/* Section Header */}
          <div className="glass-card p-5 sm:p-6 md:p-8 mb-6 bg-red-50/50 border-2 border-red-200">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  🚨 Số điện thoại khẩn cấp
                </h2>
                <p className="text-sm sm:text-base text-slate-700">
                  Luôn sẵn sàng hỗ trợ 24/7 trong trường hợp khẩn cấp
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm sm:text-base text-amber-900">
                  <strong className="font-bold">Thông báo quan trọng:</strong> Từ ngày <strong>23/8/2025</strong>,
                  Việt Nam chính thức sử dụng số <strong className="text-red-600">112</strong> làm tổng đài
                  khẩn cấp thống nhất (thay thế 113, 114, 115).
                </div>
              </div>
            </div>
          </div>

          {/* Active Emergency Hotlines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-6">
            {activeHotlines.map((hotline) => (
              <HotlineCard key={hotline.id} hotline={hotline} />
            ))}
          </div>

          {/* Legacy Numbers (Collapsible) */}
          {legacyHotlines.length > 0 && (
            <div className="glass-card p-5 sm:p-6 bg-slate-50">
              <button
                onClick={() => setShowLegacyNumbers(!showLegacyNumbers)}
                className="w-full flex items-center justify-between text-left mb-4 hover:bg-slate-100 p-3 rounded-lg transition-colors"
                aria-expanded={showLegacyNumbers}
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-slate-500" />
                  <span className="font-semibold text-slate-700">
                    Các số khẩn cấp cũ (chuyển sang 112)
                  </span>
                </div>
                <Badge variant="outline" className="bg-slate-100">
                  {showLegacyNumbers ? "Ẩn" : "Xem"}
                </Badge>
              </button>

              {showLegacyNumbers && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {legacyHotlines.map((hotline) => (
                    <HotlineCard key={hotline.id} hotline={hotline} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Download Guides */}
        <div className="glass-card text-center p-5 sm:p-6 md:p-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
            <Download className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">
            Tải hướng dẫn offline
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto">
            Tải về các hướng dẫn PDF để sử dụng khi không có internet trong chuyến du lịch.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white min-h-[44px] text-sm sm:text-base"
              asChild
            >
              <Link href="#guide-download">
                <Download className="w-4 h-4 mr-2" />
                Hướng dẫn tổng quan
              </Link>
            </Button>
            <Button variant="secondary" className="glass-subtle min-h-[44px] text-sm sm:text-base" asChild>
              <Link href="#emergency-guide">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Thẻ khẩn cấp
              </Link>
            </Button>
            <Button variant="secondary" className="glass-subtle min-h-[44px] text-sm sm:text-base" asChild>
              <Link href="#phrase-book">
                <MessageCircle className="w-4 h-4 mr-2" />
                Sổ tay tiếng Việt
              </Link>
            </Button>
          </div>
        </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

import * as React from "react"
import { Metadata } from "next"
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
  Camera,
  Compass,
  MessageCircle,
  Download,
  Globe,
  CreditCard,
  Smartphone,
  Clock,
  AlertTriangle,
  Users
} from "lucide-react"

export const metadata: Metadata = {
  title: "Tài nguyên du lịch | Du Lịch Việt",
  description: "Tổng hợp tài nguyên, hướng dẫn và công cụ hữu ích cho chuyến du lịch Việt Nam của bạn",
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section - Compact & Optimized */}
        <section className="relative py-8 sm:py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-green-50/40 to-amber-50/60"></div>

          <div className="relative container max-w-7xl">
            <div className="glass-card max-w-4xl mx-auto text-center p-6 sm:p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-brand-green" />
                </div>
                <h1 className="gradient-text text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  Tài nguyên du lịch
                </h1>
              </div>
              <p className="text-base sm:text-lg text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                Tổng hợp đầy đủ các hướng dẫn, công cụ và thông tin cần thiết<br className="hidden sm:block" />
                để bạn có chuyến khám phá Việt Nam an toàn và trọn vẹn.
              </p>

              {/* Quick access stats */}
              <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
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

        <section className="container py-8 sm:py-12 max-w-7xl">

        {/* Essential Resources Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Travel Planning */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-brand-gold" />
              </div>
              Lập kế hoạch
            </h2>
            
            <div className="space-y-4">
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
                  title: "Lịch trình mẫu",
                  description: "Gợi ý hành trình cho 3, 7, 14 ngày",
                  icon: MapPin,
                  href: "/itineraries/builder"
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
                  className="flex items-center gap-3 p-3 glass-subtle rounded-xl hover:bg-slate-100/50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-brand-gold" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 group-hover:text-brand-gold transition-colors">
                      {item.title}
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-gold transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Transportation */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Plane className="w-4 h-4 text-emerald-600" />
              </div>
              Di chuyển
            </h2>
            
            <div className="space-y-4">
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
                  className="flex items-center gap-3 p-3 glass-subtle rounded-xl hover:bg-slate-100/50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Safety & Health */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-red-600" />
              </div>
              An toàn & sức khỏe
            </h2>
            
            <div className="space-y-4">
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
                  className="flex items-center gap-3 p-3 glass-subtle rounded-xl hover:bg-slate-100/50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 group-hover:text-red-600 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Essential Apps Section */}
        <div className="glass-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-brand-green" />
            </div>
            Ứng dụng thiết yếu
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div key={index} className="glass-subtle p-6 rounded-xl text-center hover:scale-105 transition-transform duration-200">
                <div className={`w-12 h-12 ${app.colorBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <app.icon className={`w-6 h-6 ${app.colorIcon}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{app.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{app.description}</p>
                <Badge className="bg-green-100 text-brand-green">
                  {app.category}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="glass-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            Số điện thoại khẩn cấp
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                service: "Cảnh sát",
                number: "113",
                description: "Báo cáo tội phạm, mất trộm",
                colorBg: "bg-blue-100",
                colorIcon: "text-brand-green"
              },
              {
                service: "Cứu hỏa",
                number: "114",
                description: "Hỏa hoạn, cứu hộ khẩn cấp",
                colorBg: "bg-red-100",
                colorIcon: "text-red-600"
              },
              {
                service: "Y tế khẩn cấp",
                number: "115",
                description: "Cấp cứu y tế, tai nạn",
                colorBg: "bg-emerald-100",
                colorIcon: "text-emerald-600"
              }
            ].map((item, index) => (
              <div key={index} className="glass-subtle p-6 rounded-xl text-center">
                <div className={`w-16 h-16 ${item.colorBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Phone className={`w-8 h-8 ${item.colorIcon}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.service}</h3>
                <div className="text-3xl font-bold text-red-600 mb-3">{item.number}</div>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download Guides */}
        <div className="glass-card text-center p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Download className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Tải hướng dẫn offline
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Tải về các hướng dẫn PDF để sử dụng khi không có internet trong chuyến du lịch.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white"
              asChild
            >
              <Link href="#guide-download">
                <Download className="w-4 h-4 mr-2" />
                Hướng dẫn tổng quan
              </Link>
            </Button>
            <Button variant="secondary" className="glass-subtle" asChild>
              <Link href="#emergency-guide">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Thẻ khẩn cấp
              </Link>
            </Button>
            <Button variant="secondary" className="glass-subtle" asChild>
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

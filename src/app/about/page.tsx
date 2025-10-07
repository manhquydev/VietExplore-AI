"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TeamSection } from "@/components/team/team-section"
import {
  Heart,
  Users,
  Globe,
  Shield,
  Target,
  Award,
  Mail,
  Github,
  Handshake,
  Calendar,
  ExternalLink,
  MapPin,
  Star,
  Lightbulb
} from "lucide-react"

// Team members are now managed dynamically via /admin/team
// and fetched from Firestore in the TeamSection component

const milestones = [
  {
    date: "Q1 2024",
    title: "Ra mắt nền tảng",
    description: "Phát hành phiên bản đầu tiên với 1,000+ địa điểm",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-500"
  },
  {
    date: "Q2 2024", 
    title: "AI Trợ lý",
    description: "Tích hợp AI để tạo lịch trình thông minh",
    icon: Star,
    color: "from-purple-500 to-pink-500"
  },
  {
    date: "Q3 2024",
    title: "Mở rộng cộng đồng",
    description: "Đạt 10,000+ thành viên và 100+ cộng tác viên",
    icon: Users,
    color: "from-emerald-500 to-teal-500"
  },
  {
    date: "Q4 2024",
    title: "Đối tác chính thức",
    description: "Hợp tác với 10+ Sở Du lịch địa phương",
    icon: Award,
    color: "from-sky-500 to-blue-500"
  }
]

const coreValues = [
  {
    title: "Minh bạch",
    description: "Thông tin rõ ràng, không thiên vị, dựa trên trải nghiệm thực tế",
    icon: Shield,
    color: "from-brand-gold to-amber-600"
  },
  {
    title: "Cộng đồng",
    description: "Được xây dựng bởi và vì cộng đồng du lịch Việt Nam",
    icon: Heart,
    color: "from-rose-500 to-pink-500"
  },
  {
    title: "Bền vững",
    description: "Khuyến khích du lịch có trách nhiệm với môi trường và văn hóa",
    icon: Globe,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Đổi mới",
    description: "Ứng dụng công nghệ AI để tạo ra trải nghiệm du lịch tốt hơn",
    icon: Target,
    color: "from-amber-500 to-orange-500"
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
      
      <Header />
      
      <main className="relative">
        {/* Hero Section - Compact & Optimized */}
        <section className="container py-8 sm:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Glass morphism card with background image */}
            <div className="relative overflow-hidden rounded-3xl">
              {/* Background image with overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-white/60 to-secondary/20 backdrop-blur-sm" />

              {/* Content with glass effect */}
              <div className="relative glass-card text-center p-6 sm:p-8 border-0">
                <Badge className="mb-4 glass-subtle border-primary/20 text-primary px-4 py-2">
                  🇻🇳 Cửa sổ đến Việt Nam
                </Badge>

                {/* Typography as Voice - Confident & Modern */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  <span className="gradient-text">Du Lịch Việt</span>
                  <br />
                  <span className="text-foreground">Trong suốt & Tinh tế</span>
                </h1>

                {/* Compact content */}
                <div className="space-y-4 max-w-3xl mx-auto">
                  <p className="text-base sm:text-lg text-muted leading-relaxed">
                    Chúng tôi không chỉ xây dựng một website du lịch. Chúng tôi tạo ra một
                    <span className="font-medium text-primary"> cửa sổ kỹ thuật số</span>,
                    nơi mỗi click và cuộn trang đều mở ra những khung cảnh đầy cảm hứng của vẻ đẹp Việt Nam.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <Button
                    size="lg"
                    className="motion-gentle hover:scale-105 shadow-soft"
                    asChild
                  >
                    <Link href="/community">
                      <Heart className="w-5 h-5 mr-2" />
                      Khám phá cộng đồng
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="glass-subtle motion-gentle hover:scale-105"
                    asChild
                  >
                    <Link href="/about/mission">
                      <Target className="w-5 h-5 mr-2" />
                      Sứ mệnh của chúng tôi
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision - Refined Layout with Glass Effect */}
        <section className="container py-20">
          <div className="max-w-6xl mx-auto">
            {/* Section header with breathing space */}
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                <span className="gradient-text">Tầm nhìn</span> & <span className="text-foreground">Sứ mệnh</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Mission Card with glass morphism */}
              <div className="relative group">
                <div className="glass-card p-8 lg:p-10 h-full motion-gentle hover:scale-[1.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Sứ mệnh</h3>
                  </div>
                  
                  <div className="space-y-4 text-muted leading-relaxed">
                    <p className="text-base lg:text-lg">
                      <strong className="text-foreground">Tạo ra kho dữ liệu du lịch minh bạch</strong> – xác thực – dễ tiếp cận cho mọi người, 
                      giúp du khách có những quyết định thông minh cho chuyến đi.
                    </p>
                    <p>
                      Mỗi chuyến du lịch đều có thể trở thành trải nghiệm ý nghĩa 
                      khi có thông tin đúng đắn, được chia sẻ bởi cộng đồng với tinh thần cởi mở và trung thực.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vision Card with glass morphism */}
              <div className="relative group">
                <div className="glass-card p-8 lg:p-10 h-full motion-gentle hover:scale-[1.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-purple-600 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Tầm nhìn</h3>
                  </div>
                  
                  <div className="space-y-4 text-muted leading-relaxed">
                    <p className="text-base lg:text-lg">
                      <strong className="text-foreground">Trở thành nguồn thông tin du lịch Việt Nam đáng tin cậy nhất</strong>, 
                      được xây dựng và duy trì bởi chính cộng đồng yêu du lịch.
                    </p>
                    <p>
                      Khát vọng của chúng tôi là giúp mọi người khám phá vẻ đẹp Việt Nam một cách bền vững, 
                      có trách nhiệm và trọn vẹn nhất.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values - Typography as Voice with Generous Spacing */}
        <section className="container py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                <span className="gradient-text">Giá trị cốt lõi</span>
              </h2>
              <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
                Những nguyên tắc định hướng mọi quyết định và hoạt động của chúng tôi, 
                như những viên đá tảng vững chắc trong dòng chảy.
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-primary via-secondary to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {coreValues.map((value, index) => (
                <div key={index} className="group">
                  <div className="glass-card p-6 lg:p-8 text-center h-full motion-gentle hover:scale-105">
                    {/* Icon with breathing space */}
                    <div className="mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto shadow-soft`}>
                        <value.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Typography hierarchy */}
                    <h3 className="text-xl font-bold text-foreground mb-4">{value.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline - Journey with Gentle Motion */}
        <section className="container py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                <span className="gradient-text">Hành trình</span> <span className="text-foreground">phát triển</span>
              </h2>
              <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
                Từ ý tưởng ban đầu đến cửa sổ kỹ thuật số mở ra vẻ đẹp Việt Nam
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="group relative">
                  {/* Connecting line for larger screens */}
                  {index < milestones.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-full w-8 h-0.5 bg-gradient-to-r from-border to-transparent z-0"></div>
                  )}
                  
                  <div className="glass-card p-6 lg:p-8 h-full motion-gentle hover:scale-105 relative z-10">
                    {/* Icon with enhanced visual hierarchy */}
                    <div className="mb-6">
                      <div className={`w-14 h-14 bg-gradient-to-r ${milestone.color} rounded-2xl flex items-center justify-center shadow-soft`}>
                        <milestone.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    
                    {/* Timeline badge */}
                    <Badge className="mb-4 glass-subtle border-primary/20 text-primary">
                      {milestone.date}
                    </Badge>
                    
                    {/* Content with proper spacing */}
                    <h3 className="text-lg font-bold text-foreground mb-3 leading-tight">{milestone.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team - Dynamic Team Section from Firestore */}
        <TeamSection />

        {/* Contact Section - Clean Call to Action */}
        <section className="container py-12 sm:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Glass card with background imagery */}
            <div className="relative overflow-hidden rounded-3xl min-h-[400px] flex items-center">
              {/* Background with Vietnam scenery */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1559592413-7cec4d0d5d2d?q=80&w=2069')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/90"></div>
              
              {/* Content */}
              <div className="relative p-8 sm:p-10 text-center text-white w-full">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Cùng tạo nên <span className="text-white/90">cửa sổ Việt Nam</span>
                </h2>
                <p className="text-base sm:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Có câu hỏi, góp ý hoặc muốn hợp tác? Hãy liên hệ với chúng tôi.
                  Mỗi ý kiến đóng góp đều giúp chúng tôi hoàn thiện hơn.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                  <div className="glass-subtle p-4 rounded-xl border border-white/20">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
                    <div className="text-xs sm:text-sm text-white/70">Hỗ trợ</div>
                  </div>
                  <div className="glass-subtle p-4 rounded-xl border border-white/20">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">&lt;2h</div>
                    <div className="text-xs sm:text-sm text-white/70">Phản hồi</div>
                  </div>
                  <div className="glass-subtle p-4 rounded-xl border border-white/20">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">100%</div>
                    <div className="text-xs sm:text-sm text-white/70">Miễn phí</div>
                  </div>
                </div>

                {/* Contact Methods */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
                  <div className="glass-subtle p-5 rounded-2xl border border-white/20 motion-gentle hover:scale-105">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-1.5">Email chúng tôi</h3>
                    <p className="text-white/80 text-sm mb-3">Gửi thắc mắc hoặc ý kiến góp ý</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      asChild
                    >
                      <a href="mailto:hello@dulichviet.com">
                        hello@dulichviet.com
                      </a>
                    </Button>
                  </div>

                  <div className="glass-subtle p-5 rounded-2xl border border-white/20 motion-gentle hover:scale-105">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Github className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-1.5">Mã nguồn mở</h3>
                    <p className="text-white/80 text-sm mb-3">Tham gia phát triển dự án</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      asChild
                    >
                      <a href="https://github.com/dulichviet" target="_blank" rel="noopener noreferrer">
                        GitHub
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 shadow-soft motion-gentle hover:scale-105"
                    asChild
                  >
                    <Link href="/about/contact">
                      <Handshake className="w-5 h-5 mr-2" />
                      Liên hệ chi tiết
                    </Link>
                  </Button>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white/70">
                    <Link href="/community" className="text-white hover:text-white/90 underline flex items-center gap-1">
                      Tham gia cộng đồng
                    </Link>
                    <span className="hidden sm:inline">•</span>
                    <Link href="/contribute" className="text-white hover:text-white/90 underline flex items-center gap-1">
                      Đóng góp địa điểm
                    </Link>
                    <span className="hidden sm:inline">•</span>
                    <Link href="/admin" className="text-white hover:text-white/90 underline flex items-center gap-1">
                      Quản trị viên
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

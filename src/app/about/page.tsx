"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const teamMembers = [
  {
    name: "Nguyễn Minh Hoàng",
    role: "Founder & Product Lead",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    description: "Passionate về việc xây dựng nền tảng du lịch bền vững cho Việt Nam"
  },
  {
    name: "Trần Thị Lan",
    role: "Community Manager",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c5cd?w=150&h=150&fit=crop&crop=face",
    description: "Kết nối và phát triển cộng đồng du lịch Việt Nam"
  },
  {
    name: "Lê Văn Đức",
    role: "Technical Lead",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    description: "Phát triển công nghệ AI và platform architecture"
  }
]

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
        {/* Hero Section - "Digital Window" Principle */}
        <section className="container py-16 lg:py-24">
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
              <div className="relative glass-card text-center p-8 sm:p-12 border-0">
                <Badge className="mb-6 glass-subtle border-primary/20 text-primary px-4 py-2">
                  🇻🇳 Cửa sổ đến Việt Nam
                </Badge>
                
                {/* Typography as Voice - Confident & Modern */}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  <span className="gradient-text">Du Lịch Việt</span>
                  <br />
                  <span className="text-foreground">Trong suốt & Tinh tế</span>
                </h1>
                
                {/* Eloquence of Emptiness - Generous spacing */}
                <div className="space-y-6 max-w-3xl mx-auto">
                  <p className="text-lg sm:text-xl text-muted leading-relaxed">
                    Chúng tôi không chỉ xây dựng một website du lịch. Chúng tôi tạo ra một 
                    <span className="font-medium text-primary"> cửa sổ kỹ thuật số</span>, 
                    nơi mỗi click và cuộn trang đều mở ra những khung cảnh đầy cảm hứng của vẻ đẹp Việt Nam.
                  </p>
                  
                  <p className="text-base text-muted/80 leading-relaxed">
                    Giao diện của chúng tôi như một tấm kính trong suốt, tinh tế - cho phép bạn tương tác 
                    mà không làm gián đoạn kết nối cảm xúc với cảnh quan phía sau.
                  </p>
                </div>

                {/* Gentle Motion - Subtle interactions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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

        {/* Team - Typography as Voice with Personal Touch */}
        <section className="container py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                <span className="gradient-text">Đội ngũ</span> <span className="text-foreground">sáng lập</span>
              </h2>
              <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
                Những người tiên phong với đam mê xây dựng cửa sổ kỹ thuật số mở ra vẻ đẹp Việt Nam
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="group">
                  <div className="glass-card p-6 lg:p-8 text-center h-full motion-gentle hover:scale-105">
                    {/* Avatar with glass effect */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover shadow-soft"
                      />
                      <div className="absolute inset-0 rounded-full ring-4 ring-white/20 group-hover:ring-primary/30 transition-all duration-300"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    
                    {/* Typography hierarchy */}
                    <h3 className="text-lg font-bold text-foreground mb-2">{member.name}</h3>
                    <p className="text-primary text-sm font-medium mb-4">{member.role}</p>
                    <p className="text-muted text-sm leading-relaxed">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section - Clean Call to Action */}
        <section className="container py-20">
          <div className="max-w-4xl mx-auto">
            {/* Glass card with background imagery */}
            <div className="relative overflow-hidden rounded-3xl">
              {/* Background with Vietnam scenery */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1559592413-7cec4d0d5d2d?q=80&w=2069')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/80"></div>
              
              {/* Content */}
              <div className="relative glass-card border-0 p-8 sm:p-12 text-center text-white">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Cùng tạo nên <span className="text-white/90">cửa sổ Việt Nam</span>
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Có câu hỏi, góp ý hoặc muốn hợp tác? Hãy liên hệ với chúng tôi. 
                  Mỗi ý kiến đóng góp đều giúp chúng tôi hoàn thiện hơn.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="glass-subtle p-6 rounded-2xl border border-white/20 motion-gentle hover:scale-105">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Email chúng tôi</h3>
                    <p className="text-white/80 text-sm mb-4">Gửi thắc mắc hoặc ý kiến góp ý</p>
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

                  <div className="glass-subtle p-6 rounded-2xl border border-white/20 motion-gentle hover:scale-105">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Github className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Mã nguồn mở</h3>
                    <p className="text-white/80 text-sm mb-4">Tham gia phát triển dự án</p>
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
                  
                  <p className="text-white/70 text-sm">
                    Hoặc tham gia{" "}
                    <Link href="/community" className="text-white hover:text-white/90 underline">
                      cộng đồng Du Lịch Việt
                    </Link>
                  </p>
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

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
    color: "from-blue-500 to-indigo-500"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="container py-16 lg:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="glass-card text-center p-8 sm:p-12">
              <Badge className="mb-6 bg-gradient-to-r from-sky-500 to-teal-500 text-white border-none">
                🇻🇳 Made in Vietnam
              </Badge>
              
              <h1 className="gradient-text text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Về Du Lịch Việt
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-3xl mx-auto">
                Chúng tôi là nền tảng phi lợi nhuận, được xây dựng bởi cộng đồng và vì cộng đồng, 
                nhằm cung cấp thông tin du lịch Việt Nam đáng tin cậy và hỗ trợ du khách tạo ra 
                những trải nghiệm du lịch tuyệt vời.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                  asChild
                >
                  <Link href="/community">
                    <Users className="w-5 h-5 mr-2" />
                    Tham gia cộng đồng
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" className="glass-subtle" asChild>
                  <Link href="/about/mission">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Xem tài liệu dự án
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="container py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                Sứ mệnh của chúng tôi
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-slate-900 dark:text-white">Tạo ra kho dữ liệu du lịch minh bạch – xác thực – dễ tiếp cận</strong> cho mọi người, 
                  giúp du khách có những quyết định thông minh cho chuyến đi của mình.
                </p>
                <p>
                  Chúng tôi tin rằng mỗi chuyến du lịch đều có thể trở thành trải nghiệm ý nghĩa 
                  khi có thông tin đúng đắn, được chia sẻ bởi cộng đồng với tinh thần cởi mở và trung thực.
                </p>
              </div>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Tầm nhìn
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-slate-900 dark:text-white">Trở thành nguồn thông tin du lịch Việt Nam đáng tin cậy nhất</strong>, 
                  được xây dựng và duy trì bởi chính cộng đồng yêu du lịch.
                </p>
                <p>
                  Khát vọng của chúng tôi là giúp mọi người khám phá vẻ đẹp Việt Nam một cách bền vững, 
                  có trách nhiệm và trọn vẹn nhất.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="gradient-text text-3xl font-bold mb-4">Giá trị cốt lõi</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Những nguyên tắc định hướng mọi quyết định và hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-200">
                <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="gradient-text text-3xl font-bold mb-4">Hành trình phát triển</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Từ ý tưởng ban đầu đến nền tảng du lịch hàng đầu Việt Nam
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="glass-card p-6 relative">
                <div className={`w-12 h-12 bg-gradient-to-r ${milestone.color} rounded-xl flex items-center justify-center mb-4`}>
                  <milestone.icon className="w-6 h-6 text-white" />
                </div>
                <Badge className="mb-3 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {milestone.date}
                </Badge>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{milestone.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{milestone.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="gradient-text text-3xl font-bold mb-4">Đội ngũ sáng lập</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Những người tiên phong với đam mê xây dựng nền tảng du lịch bền vững
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-200">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover ring-4 ring-sky-200/50 dark:ring-sky-400/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-sky-600 dark:text-sky-400 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 sm:p-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Liên hệ với chúng tôi</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                Có câu hỏi, góp ý hoặc muốn hợp tác? Chúng tôi luôn sẵn sàng lắng nghe!
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                <div className="glass-subtle p-6 rounded-xl hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Email</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Gửi email cho chúng tôi</p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-none"
                    asChild
                  >
                    <a href="mailto:hello@dulichviet.com">
                      hello@dulichviet.com
                    </a>
                  </Button>
                </div>

                <div className="glass-subtle p-6 rounded-xl hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Github className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Open Source</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Xem mã nguồn dự án</p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-none"
                    asChild
                  >
                    <a href="https://github.com/dulichviet" target="_blank" rel="noopener noreferrer">
                      GitHub →
                    </a>
                  </Button>
                </div>
              </div>

              <div className="glass-subtle p-8 rounded-2xl bg-gradient-to-br from-sky-500/10 to-teal-500/10 dark:from-sky-400/10 dark:to-teal-400/10">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Quan tâm đến việc hợp tác?</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-xl mx-auto">
                  Chúng tôi luôn tìm kiếm các đối tác, tổ chức và cá nhân có cùng tầm nhìn 
                  để cùng xây dựng nền tảng du lịch bền vững cho Việt Nam.
                </p>
                <Button 
                  className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                  asChild
                >
                  <Link href="/about/partnership">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Tìm hiểu về đối tác
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

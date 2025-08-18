"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { 
  Heart,
  Users,
  Shield,
  Zap,
  Target,
  Award,
  Mail,
  Github,
  ExternalLink
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
    description: "Phát hành phiên bản đầu tiên với 1,000+ địa điểm"
  },
  {
    date: "Q2 2024", 
    title: "AI Trợ lý",
    description: "Tích hợp AI để tạo lịch trình thông minh"
  },
  {
    date: "Q3 2024",
    title: "Mở rộng cộng đồng",
    description: "Đạt 10,000+ thành viên và 100+ cộng tác viên"
  },
  {
    date: "Q4 2024",
    title: "Đối tác chính thức",
    description: "Hợp tác với 10+ Sở Du lịch địa phương"
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="container py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6">
              🇻🇳 Made in Vietnam
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Về <span className="text-primary">Du Lịch Việt</span>
            </h1>
            
            <p className="text-lg text-muted leading-relaxed mb-8">
              Chúng tôi là nền tảng phi lợi nhuận, được xây dựng bởi cộng đồng và vì cộng đồng, 
              nhằm cung cấp thông tin du lịch Việt Nam đáng tin cậy và hỗ trợ du khách tạo ra 
              những trải nghiệm du lịch tuyệt vời.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Tham gia cộng đồng
              </Button>
              <Button variant="outline" size="lg">
                Xem tài liệu dự án
              </Button>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-surface py-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Sứ mệnh của chúng tôi</h2>
                <div className="space-y-4 text-muted leading-relaxed">
                  <p>
                    <strong className="text-text">Tạo ra kho dữ liệu du lịch minh bạch – xác thực – dễ tiếp cận</strong> cho mọi người, 
                    giúp du khách có những quyết định thông minh cho chuyến đi của mình.
                  </p>
                  <p>
                    <strong className="text-text">Kết nối du khách, cộng đồng địa phương, blogger và cơ quan quản lý</strong> vào 
                    một nền tảng chung, tạo ra hệ sinh thái du lịch bền vững.
                  </p>
                  <p>
                    <strong className="text-text">Ứng dụng công nghệ AI</strong> để cá nhân hóa hành trình, tiết kiệm thời gian 
                    và nâng cao trải nghiệm khám phá Việt Nam.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                  <div className="text-sm text-muted">Người dùng tin tưởng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">1,000+</div>
                  <div className="text-sm text-muted">Địa điểm xác minh</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100+</div>
                  <div className="text-sm text-muted">Cộng tác viên</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">5+</div>
                  <div className="text-sm text-muted">Đối tác chính thức</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Giá trị cốt lõi</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Phi lợi nhuận</h3>
              <p className="text-sm text-muted">
                Hoạt động vì cộng đồng, minh bạch về tài chính và mục tiêu
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Đáng tin cậy</h3>
              <p className="text-sm text-muted">
                Thông tin được xác minh kỹ lưỡng bởi cộng đồng và chuyên gia
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Cộng đồng</h3>
              <p className="text-sm text-muted">
                Lắng nghe và phát triển dựa trên nhu cầu thực tế của cộng đồng
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-warn/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-warn" />
              </div>
              <h3 className="font-semibold mb-2">Đổi mới</h3>
              <p className="text-sm text-muted">
                Không ngừng cải tiến với công nghệ AI và feedback từ người dùng
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-surface py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Hành trình phát triển</h2>
              <p className="text-muted">
                Những cột mốc quan trọng trong quá trình xây dựng nền tảng
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-primary rounded-full flex-shrink-0"></div>
                      {index < milestones.length - 1 && (
                        <div className="w-0.5 h-16 bg-border mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {milestone.date}
                        </Badge>
                        <h3 className="font-semibold">{milestone.title}</h3>
                      </div>
                      <p className="text-muted text-sm">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Đội ngũ phát triển</h2>
            <p className="text-muted">
              Những con người đam mê du lịch và công nghệ
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm mb-3">{member.role}</p>
                  <p className="text-muted text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-surface py-16">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Liên hệ với chúng tôi</h2>
              <p className="text-muted mb-8">
                Có câu hỏi, góp ý hoặc muốn hợp tác? Chúng tôi luôn sẵn sàng lắng nghe!
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-muted text-sm mb-3">Gửi email cho chúng tôi</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="mailto:hello@dulichviet.com">
                        hello@dulichviet.com
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Github className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Open Source</h3>
                    <p className="text-muted text-sm mb-3">Xem mã nguồn dự án</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://github.com/dulichviet" target="_blank" rel="noopener noreferrer">
                        GitHub
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 p-6 bg-primary-50 rounded-xl">
                <h3 className="font-semibold mb-2">🤝 Quan tâm đến việc hợp tác?</h3>
                <p className="text-sm text-muted mb-4">
                  Chúng tôi luôn tìm kiếm các đối tác, tổ chức và cá nhân có cùng tầm nhìn 
                  để cùng xây dựng nền tảng du lịch bền vững cho Việt Nam.
                </p>
                <Button variant="secondary" asChild>
                  <Link href="/about/partnership">
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

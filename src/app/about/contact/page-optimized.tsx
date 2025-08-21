"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  MessageSquare,
  UserPlus,
  MapPin,
  Flag,
  Handshake,
  Settings,
  Heart,
  Users,
  Phone,
  Clock,
  Send
} from "lucide-react"

type ContactType = 'general' | 'role-upgrade' | 'suggest-place' | 'report' | 'partnership' | 'technical'

const contactTypes = [
  {
    id: 'general' as ContactType,
    label: 'Hỗ trợ chung',
    description: 'Câu hỏi và hỗ trợ sử dụng nền tảng',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-500',
    bgClass: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  {
    id: 'role-upgrade' as ContactType,
    label: 'Nâng cấp quyền hạn',
    description: 'Đăng ký trở thành Contributor hoặc Community Partner',
    icon: UserPlus,
    color: 'from-green-500 to-emerald-500',
    bgClass: 'bg-green-50 border-green-200 text-green-800'
  },
  {
    id: 'suggest-place' as ContactType,
    label: 'Đề xuất địa điểm',
    description: 'Gợi ý địa điểm mới cho Ban biên tập',
    icon: MapPin,
    color: 'from-yellow-500 to-amber-500',
    bgClass: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  },
  {
    id: 'report' as ContactType,
    label: 'Báo cáo vi phạm',
    description: 'Báo cáo nội dung không phù hợp hoặc sai sự thật',
    icon: Flag,
    color: 'from-red-500 to-rose-500',
    bgClass: 'bg-red-50 border-red-200 text-red-800'
  },
  {
    id: 'partnership' as ContactType,
    label: 'Hợp tác kinh doanh',
    description: 'Liên hệ hợp tác cho tổ chức, doanh nghiệp',
    icon: Handshake,
    color: 'from-purple-500 to-violet-500',
    bgClass: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  {
    id: 'technical' as ContactType,
    label: 'Hỗ trợ kỹ thuật',
    description: 'Lỗi hệ thống, vấn đề kỹ thuật',
    icon: Settings,
    color: 'from-gray-500 to-slate-500',
    bgClass: 'bg-gray-50 border-gray-200 text-gray-800'
  }
]

export default function ContactPage() {
  const searchParams = useSearchParams()
  const [selectedType, setSelectedType] = React.useState<ContactType>(
    (searchParams.get('type') as ContactType) || 'general'
  )
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  })

  const currentType = contactTypes.find(type => type.id === selectedType)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', { type: selectedType, data: formData })
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Subtle background following "Sheet of Glass" principle */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
      
      <Header />
      
      <main className="relative">
        {/* Hero Section - Typography as Voice */}
        <section className="container py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card p-8 sm:p-12 rounded-3xl">
              <div className="space-y-6">
                <Badge className="glass-subtle border-primary/20 text-primary px-4 py-2">
                  📞 Liên hệ với chúng tôi
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                  <span className="gradient-text">Cùng xây dựng</span>
                  <br />
                  <span className="text-foreground">cửa sổ Việt Nam</span>
                </h1>
                
                {/* Eloquence of Emptiness - Generous spacing */}
                <div className="space-y-4 max-w-2xl mx-auto">
                  <p className="text-lg sm:text-xl text-muted leading-relaxed">
                    Mỗi ý kiến đóng góp, mỗi câu hỏi đều giúp chúng tôi hoàn thiện 
                    <span className="font-medium text-primary"> cửa sổ kỹ thuật số</span> 
                    mở ra vẻ đẹp Việt Nam.
                  </p>
                  
                  <p className="text-base text-muted/80">
                    Chúng tôi cam kết phản hồi trong vòng 24 giờ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Types - Clean Selection */}
        <section className="container py-12 lg:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="gradient-text">Chọn loại liên hệ</span>
              </h2>
              <p className="text-muted max-w-2xl mx-auto">
                Để chúng tôi có thể hỗ trợ bạn tốt nhất, vui lòng chọn loại yêu cầu phù hợp
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {contactTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`glass-card p-6 text-left motion-gentle hover:scale-105 transition-all duration-200 ${
                    selectedType === type.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center flex-shrink-0`}>
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">{type.label}</h3>
                      <p className="text-sm text-muted leading-relaxed">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form - Minimal & Clear */}
        <section className="container py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-8 lg:p-12 rounded-3xl">
              {currentType && (
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentType.color} flex items-center justify-center`}>
                      <currentType.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{currentType.label}</h3>
                      <p className="text-sm text-muted">{currentType.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium mb-2 block">
                      Họ và tên đệm
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="h-12 glass-subtle border-border/50"
                      placeholder="Nguyễn Văn"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium mb-2 block">
                      Tên
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="h-12 glass-subtle border-border/50"
                      placeholder="An"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Email liên hệ
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 glass-subtle border-border/50"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
                    Tiêu đề
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="h-12 glass-subtle border-border/50"
                    placeholder="Mô tả ngắn gọn về yêu cầu của bạn"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                    Nội dung chi tiết
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="min-h-[120px] glass-subtle border-border/50 resize-none"
                    placeholder="Vui lòng mô tả chi tiết yêu cầu, câu hỏi hoặc ý kiến đóng góp của bạn..."
                    required
                  />
                </div>

                {/* Submit Button with Gentle Motion */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full motion-gentle hover:scale-105 shadow-soft"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Gửi tin nhắn
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Additional Contact Info - Transparent Information */}
        <section className="container py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="gradient-text">Thông tin liên hệ</span>
              </h2>
              <p className="text-muted">
                Những cách khác để kết nối với cộng đồng Du Lịch Việt
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 text-center motion-gentle hover:scale-105">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Email chung</h3>
                <p className="text-muted text-sm mb-4">Để liên hệ trực tiếp</p>
                <Button variant="ghost" size="sm" className="glass-subtle" asChild>
                  <a href="mailto:hello@dulichviet.com">
                    hello@dulichviet.com
                  </a>
                </Button>
              </div>

              <div className="glass-card p-6 text-center motion-gentle hover:scale-105">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Cộng đồng</h3>
                <p className="text-muted text-sm mb-4">Tham gia thảo luận</p>
                <Button variant="ghost" size="sm" className="glass-subtle" asChild>
                  <Link href="/community">
                    Truy cập
                  </Link>
                </Button>
              </div>

              <div className="glass-card p-6 text-center motion-gentle hover:scale-105">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Thời gian phản hồi</h3>
                <p className="text-muted text-sm mb-4">24 giờ (ngày làm việc)</p>
                <Badge className="glass-subtle border-emerald-200 text-emerald-700">
                  Cam kết phản hồi
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

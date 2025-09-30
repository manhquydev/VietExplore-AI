"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Database,
  Eye,
  Lock,
  UserCheck,
  Settings,
  AlertCircle,
  Mail,
  CheckCircle,
  ExternalLink,
  FileText
} from "lucide-react"

const privacySections = [
  {
    title: "1. Thu thập thông tin",
    icon: Database,
    color: "from-brand-gold to-amber-600",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600  leading-relaxed">
          Chúng tôi thu thập thông tin bạn cung cấp trực tiếp khi đăng ký tài khoản, 
          đóng góp nội dung, hoặc sử dụng các tính năng của nền tảng.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "Thông tin cá nhân (tên, email)",
            "Nội dung đóng góp (bài viết, hình ảnh)",
            "Dữ liệu sử dụng (lịch sử truy cập)",
            "Thông tin thiết bị (IP, browser)"
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 glass-subtle rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-gray-600 ">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "2. Mục đích sử dụng",
    icon: Eye,
    color: "from-brand-green to-brand-forest",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600  leading-relaxed">
          Thông tin được thu thập để cung cấp và cải thiện dịch vụ, cá nhân hóa trải nghiệm 
          người dùng và đảm bảo an toàn cho cộng đồng.
        </p>
        <div className="space-y-3">
          {[
            {
              purpose: "Cung cấp dịch vụ",
              description: "Vận hành nền tảng và các tính năng cơ bản",
              icon: "🔧"
            },
            {
              purpose: "Cá nhân hóa AI",
              description: "Đề xuất địa điểm và lịch trình phù hợp",
              icon: "🤖"
            },
            {
              purpose: "Bảo mật và an toàn",
              description: "Phát hiện và ngăn chặn hành vi vi phạm",
              icon: "🛡️"
            },
            {
              purpose: "Cải thiện dịch vụ",
              description: "Phân tích để nâng cao chất lượng nền tảng",
              icon: "📈"
            }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 glass-subtle rounded-lg">
              <div className="text-2xl">{item.icon}</div>
              <div>
                <h4 className="font-medium text-gray-900  mb-1">{item.purpose}</h4>
                <p className="text-sm text-gray-600 ">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "3. Chia sẻ thông tin",
    icon: UserCheck,
    color: "from-brand-gold to-amber-600",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600  leading-relaxed">
          Chúng tôi <strong className="text-gray-900 ">không bán</strong> thông tin cá nhân. 
          Dữ liệu chỉ được chia sẻ trong các trường hợp sau:
        </p>
        <div className="space-y-3">
          {[
            {
              case: "Với sự đồng ý",
              description: "Khi bạn cho phép chia sẻ thông tin cụ thể",
              color: "border-emerald-500 bg-emerald-50/50 "
            },
            {
              case: "Yêu cầu pháp luật",
              description: "Tuân thủ lệnh tòa án hoặc quy định pháp luật",
              color: "border-blue-500 bg-blue-50/50 "
            },
            {
              case: "Bảo vệ quyền lợi",
              description: "Ngăn chặn gian lận hoặc bảo vệ an toàn",
              color: "border-amber-500 bg-amber-50/50 "
            }
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${item.color}`}>
              <h4 className="font-medium text-gray-900  mb-1">{item.case}</h4>
              <p className="text-sm text-gray-600 ">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "4. Bảo mật dữ liệu",
    icon: Lock,
    color: "from-red-500 to-rose-500",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600  leading-relaxed">
          Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn công nghiệp để bảo vệ thông tin của bạn.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              measure: "Mã hóa SSL/TLS",
              description: "Bảo vệ dữ liệu truyền tải"
            },
            {
              measure: "Mã hóa cơ sở dữ liệu", 
              description: "Bảo mật dữ liệu lưu trữ"
            },
            {
              measure: "Xác thực 2 lớp",
              description: "Tăng cường bảo mật tài khoản"
            },
            {
              measure: "Kiểm soát truy cập",
              description: "Hạn chế quyền truy cập dữ liệu"
            }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-4 glass-subtle rounded-lg">
              <Lock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900  mb-1">{item.measure}</h4>
                <p className="text-sm text-gray-600 ">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "5. Quyền của người dùng",
    icon: Settings,
    color: "from-amber-500 to-orange-500",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600  leading-relaxed">
          Bạn có các quyền sau đối với dữ liệu cá nhân của mình:
        </p>
        <div className="space-y-3">
          {[
            {
              right: "Truy cập dữ liệu",
              description: "Xem thông tin cá nhân chúng tôi lưu trữ",
              action: "Trong phần Cài đặt tài khoản"
            },
            {
              right: "Chỉnh sửa thông tin",
              description: "Cập nhật hoặc sửa đổi dữ liệu cá nhân",
              action: "Trong trang Hồ sơ cá nhân"
            },
            {
              right: "Xóa tài khoản",
              description: "Xóa vĩnh viễn tài khoản và dữ liệu",
              action: "Liên hệ đội ngũ hỗ trợ"
            },
            {
              right: "Xuất dữ liệu",
              description: "Tải về bản sao dữ liệu cá nhân",
              action: "Gửi yêu cầu qua email"
            }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 glass-subtle rounded-lg">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900  mb-1">{item.right}</h4>
                <p className="text-sm text-gray-600  mb-2">{item.description}</p>
                <p className="text-xs text-amber-600 font-medium">{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "6. Liên hệ",
    icon: Mail,
    color: "from-gray-500 to-gray-600",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600  leading-relaxed">
          Nếu có câu hỏi về chính sách bảo mật hoặc cần hỗ trợ về quyền riêng tư, 
          vui lòng liên hệ với chúng tôi:
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 glass-subtle rounded-lg hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-gray-600 " />
            </div>
            <div>
              <p className="font-medium text-gray-900 ">Email bảo mật</p>
              <a 
                href="mailto:privacy@dulichviet.com" 
                className="text-gray-600  hover:underline text-sm"
              >
                privacy@dulichviet.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 glass-subtle rounded-lg hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <p className="font-medium text-gray-900 ">Báo cáo vi phạm</p>
              <a 
                href="mailto:report@dulichviet.com" 
                className="text-gray-600  hover:underline text-sm"
              >
                report@dulichviet.com
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      <Header />
      
      <main className="container py-16 max-w-5xl">
        {/* Hero Section */}
        <div className="glass-card text-center p-8 sm:p-12 mb-12">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-brand-green" />
          </div>
          <h1 className="gradient-text text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-lg text-gray-600  max-w-3xl mx-auto leading-relaxed mb-6">
            Cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn 
            với các tiêu chuẩn bảo mật cao nhất.
          </p>
          <Badge className="bg-white text-gray-700 ">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </Badge>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8 mb-12">
          {privacySections.map((section, index) => (
            <div key={index} className="glass-card p-8 hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-2">
                    {section.title}
                  </h2>
                </div>
              </div>
              <div className="ml-16">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Commitment */}
        <div className="glass-card p-8 bg-gradient-to-br from-brand-green/10 to-brand-forest/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-brand-green" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900  mb-4">
              Cam kết về quyền riêng tư
            </h2>
            <p className="text-gray-600  max-w-2xl mx-auto mb-8 leading-relaxed">
              Du Lịch Việt cam kết không bao giờ bán thông tin cá nhân của bạn. 
              Dữ liệu chỉ được sử dụng để cải thiện trải nghiệm và phục vụ cộng đồng du lịch.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white"
                asChild
              >
                <Link href="/legal/terms">
                  <FileText className="w-4 h-4 mr-2" />
                  Điều khoản sử dụng
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="secondary" className="glass-subtle" asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Cài đặt quyền riêng tư
                </Link>
              </Button>
              <Button variant="secondary" className="glass-subtle" asChild>
                <Link href="/about/contact">
                  <Mail className="w-4 h-4 mr-2" />
                  Liên hệ hỗ trợ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}











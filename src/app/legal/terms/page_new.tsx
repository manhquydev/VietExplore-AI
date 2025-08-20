"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Scale,
  Shield,
  FileText,
  Users,
  Eye,
  AlertTriangle,
  Mail,
  CheckCircle,
  ExternalLink,
  BookOpen
} from "lucide-react"

const termsSection = [
  {
    title: "1. Giới thiệu về Du Lịch Việt",
    icon: BookOpen,
    color: "from-sky-500 to-blue-500",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Du Lịch Việt là nền tảng phi lợi nhuận, được vận hành bởi cộng đồng nhằm cung cấp 
          thông tin du lịch Việt Nam đáng tin cậy. Bằng việc sử dụng nền tảng này, bạn đồng ý 
          tuân thủ các điều khoản và điều kiện được nêu dưới đây.
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Nền tảng hoạt động với sứ mệnh tạo ra kho dữ liệu du lịch minh bạch, xác thực và 
          dễ tiếp cận cho mọi người.
        </p>
      </div>
    )
  },
  {
    title: "2. Nghĩa vụ của người dùng",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Khi sử dụng Du Lịch Việt, người dùng cam kết:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "Cung cấp thông tin chính xác và trung thực",
            "Tôn trọng quyền sở hữu trí tuệ", 
            "Không đăng tải nội dung vi phạm pháp luật",
            "Tuân thủ quy tắc cộng đồng"
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 glass-subtle rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "3. Nội dung và sở hữu trí tuệ",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Tất cả nội dung do người dùng đóng góp sẽ được chia sẻ theo giấy phép 
          <strong className="text-slate-900 dark:text-white mx-1">Creative Commons Attribution-ShareAlike 4.0</strong>. 
          Người dùng cam kết rằng họ có quyền chia sẻ nội dung được đóng góp.
        </p>
        <div className="glass-subtle p-4 rounded-lg border-l-4 border-purple-500">
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            <strong>Lưu ý:</strong> Điều này có nghĩa là nội dung của bạn có thể được sử dụng 
            và chia sẻ bởi cộng đồng với điều kiện ghi rõ nguồn gốc.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "4. Quy trình kiểm duyệt",
    icon: Eye,
    color: "from-amber-500 to-orange-500",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Mọi nội dung đóng góp sẽ được kiểm duyệt bởi đội ngũ Moderator trước khi xuất bản. 
          Quy trình kiểm duyệt tuân thủ nguyên tắc minh bạch và công bằng.
        </p>
        <div className="flex items-center gap-4 p-4 glass-subtle rounded-lg">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <span className="text-amber-600 dark:text-amber-400 font-bold">48-72h</span>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Thời gian xử lý trung bình</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Từ lúc gửi đến khi được duyệt</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "5. Miễn trừ trách nhiệm",
    icon: AlertTriangle,
    color: "from-red-500 to-rose-500",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Du Lịch Việt cung cấp thông tin "nguyên trạng" và không đảm bảo tính chính xác 
          tuyệt đối. Người dùng tự chịu trách nhiệm khi sử dụng thông tin để lập kế hoạch du lịch.
        </p>
        <div className="glass-subtle p-4 rounded-lg border-l-4 border-red-500 bg-red-50/50 dark:bg-red-900/10">
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            <strong>Khuyến nghị:</strong> Luôn xác minh thông tin từ nhiều nguồn khác nhau 
            và liên hệ trực tiếp với nhà cung cấp dịch vụ trước khi đi du lịch.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "6. Liên hệ",
    icon: Mail,
    color: "from-blue-500 to-indigo-500",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Nếu có câu hỏi về điều khoản sử dụng, vui lòng liên hệ với chúng tôi:
        </p>
        <div className="flex items-center gap-4 p-4 glass-subtle rounded-lg hover:scale-105 transition-transform duration-200">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Email hỗ trợ pháp lý</p>
            <a 
              href="mailto:legal@dulichviet.com" 
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              legal@dulichviet.com
            </a>
          </div>
        </div>
      </div>
    )
  }
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container py-16 max-w-5xl">
        {/* Hero Section */}
        <div className="glass-card text-center p-8 sm:p-12 mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="gradient-text text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Điều Khoản Sử Dụng
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6">
            Các quy tắc và điều kiện sử dụng nền tảng Du Lịch Việt để đảm bảo 
            trải nghiệm tốt nhất cho toàn bộ cộng đồng.
          </p>
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </Badge>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8 mb-12">
          {termsSection.map((section, index) => (
            <div key={index} className="glass-card p-8 hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
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

        {/* Legal Footer */}
        <div className="glass-card p-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Cam kết minh bạch
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Du Lịch Việt hoạt động dựa trên nguyên tắc minh bạch và cộng đồng. 
              Mọi thay đổi về điều khoản sẽ được thông báo công khai trước ít nhất 30 ngày.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                asChild
              >
                <Link href="/legal/privacy">
                  <Shield className="w-4 h-4 mr-2" />
                  Chính sách bảo mật
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="secondary" className="glass-subtle" asChild>
                <Link href="/legal/content-policy">
                  <FileText className="w-4 h-4 mr-2" />
                  Chính sách nội dung
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

import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  Award,
  CheckCircle,
  Star,
  Shield,
  Heart,
  Zap,
  Target,
  ArrowRight,
  Plus,
  FileText
} from "lucide-react"

export const metadata: Metadata = {
  title: "Hướng dẫn đóng góp | Du Lịch Việt",
  description: "Hướng dẫn chi tiết về cách đóng góp địa điểm và nội dung chất lượng cho Du Lịch Việt",
}

export default function ContributeGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="glass-card text-center p-8 sm:p-12 mb-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="gradient-text text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Hướng dẫn đóng góp
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Cách tạo ra những đóng góp chất lượng cao giúp xây dựng 
            kho thông tin du lịch Việt Nam đáng tin cậy nhất.
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Bắt đầu nhanh
          </h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              {
                step: "1",
                title: "Đăng ký tài khoản",
                description: "Tạo tài khoản miễn phí để bắt đầu",
                color: "from-sky-500 to-teal-500"
              },
              {
                step: "2", 
                title: "Đọc hướng dẫn",
                description: "Tìm hiểu quy tắc và tiêu chuẩn chất lượng",
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "3",
                title: "Tạo đóng góp",
                description: "Chia sẻ địa điểm với thông tin chi tiết",
                color: "from-emerald-500 to-teal-500"
              },
              {
                step: "4",
                title: "Nhận huy hiệu",
                description: "Được công nhận với huy hiệu thành tích",
                color: "from-amber-500 to-orange-500"
              }
            ].map((item, index) => (
              <div key={index} className="glass-subtle p-6 rounded-2xl">
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white font-bold">{item.step}</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Guidelines */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Tiêu chuẩn nội dung
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Nên làm
              </h3>
              <ul className="space-y-3">
                {[
                  "Thông tin chính xác và cập nhật",
                  "Hình ảnh chất lượng cao, rõ ràng", 
                  "Mô tả chi tiết và hữu ích",
                  "Trải nghiệm cá nhân thật",
                  "Thông tin liên hệ đầy đủ"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Tránh làm
              </h3>
              <ul className="space-y-3">
                {[
                  "Thông tin sai lệch hoặc lỗi thời",
                  "Hình ảnh mờ, kém chất lượng",
                  "Nội dung quảng cáo thương mại",
                  "Copy nội dung từ nguồn khác",
                  "Spam hoặc nội dung không phù hợp"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                    <Target className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Review Process */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            Quy trình duyệt
          </h2>
          
          <div className="space-y-6">
            {[
              {
                title: "Gửi đóng góp",
                description: "Bạn tạo và gửi đóng góp địa điểm mới",
                status: "Tự động"
              },
              {
                title: "Kiểm tra ban đầu",
                description: "Hệ thống kiểm tra định dạng và thông tin cơ bản",
                status: "< 1 phút"
              },
              {
                title: "Duyệt nội dung",
                description: "Đội ngũ kiểm duyệt xem xét chất lượng và tính chính xác",
                status: "1-3 ngày"
              },
              {
                title: "Phát hành",
                description: "Nội dung được công bố và bạn nhận điểm đóng góp",
                status: "Hoàn thành"
              }
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-4 p-4 glass-subtle rounded-xl">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                </div>
                <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                  {step.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* User Levels */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            Hệ thống cấp độ
          </h2>
          
          <div className="space-y-6">
            {[
              {
                badge: "Người mới",
                color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                icon: Users,
                description: "Thành viên mới bắt đầu đóng góp. Cần xác minh email và tuân thủ quy tắc cộng đồng."
              },
              {
                badge: "Đóng góp viên",
                color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
                icon: Heart,
                description: "Đã có ít nhất 3 đóng góp được duyệt. Có kinh nghiệm và hiểu rõ tiêu chuẩn chất lượng."
              },
              {
                badge: "Chuyên gia",
                color: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
                icon: Star,
                description: "Người đóng góp dày dạn với nhiều nội dung chất lượng cao được cộng đồng đánh giá tích cực."
              },
              {
                badge: "Đối tác",
                color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
                icon: Award,
                description: "Dành cho tổ chức, doanh nghiệp có uy tín muốn hợp tác dài hạn. Có quyền lợi đặc biệt và luồng duyệt ưu tiên."
              }
            ].map((level, index) => (
              <div key={index} className="flex gap-4 items-start p-4 glass-subtle rounded-xl">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <level.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={level.color}>{level.badge}</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="glass-card text-center p-8">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Sẵn sàng bắt đầu đóng góp?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto">
            Hãy chia sẻ những địa điểm du lịch tuyệt vời mà bạn đã khám phá để giúp đỡ cộng đồng.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
              asChild
            >
              <Link href="/contribute/new-place">
                <Plus className="w-4 h-4 mr-2" />
                Đóng góp địa điểm mới
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="secondary" className="glass-subtle" asChild>
              <Link href="/contribute/my-drafts">
                <FileText className="w-4 h-4 mr-2" />
                Xem bản nháp của tôi
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
            Bạn cần đăng nhập để có thể đóng góp nội dung
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}



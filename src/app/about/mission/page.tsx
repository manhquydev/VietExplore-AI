import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Lightbulb,
  Heart,
  Users,
  Shield,
  Globe,
  Star,
  Zap,
  ArrowRight,
  CheckCircle,
  Award
} from "lucide-react"

export const metadata: Metadata = {
  title: "Sứ mệnh | Du Lịch Việt",
  description: "Tìm hiểu về sứ mệnh và tầm nhìn của nền tảng Du Lịch Việt",
}

const coreValues = [
  {
    title: "Minh bạch",
    description: "Mọi thông tin đều có nguồn rõ ràng và được xác minh bởi cộng đồng",
    icon: Shield,
    iconColor: "text-brand-green "
  },
  {
    title: "Cộng đồng", 
    description: "Xây dựng bởi cộng đồng, vì cộng đồng, không vì lợi nhuận",
    icon: Heart,
    iconColor: "text-rose-600 "
  },
  {
    title: "Bền vững",
    description: "Khuyến khích du lịch có trách nhiệm với môi trường và văn hóa",
    icon: Globe,
    iconColor: "text-emerald-600 "
  },
  {
    title: "Đổi mới",
    description: "Ứng dụng AI và công nghệ mới để cải thiện trải nghiệm du lịch",
    icon: Star,
    iconColor: "text-amber-600 "
  }
]

const principles = [
  {
    title: "Xác thực và đáng tin cậy",
    description: "Mọi thông tin đều được kiểm chứng bởi cộng đồng người dùng thực tế",
    icon: CheckCircle,
    iconColor: "text-emerald-600 "
  },
  {
    title: "Miễn phí và công bằng",
    description: "Không có phí ẩn, không thiên vị thương mại, chỉ có thông tin trung thực",
    icon: Heart,
    iconColor: "text-rose-600 "
  },
  {
    title: "Hỗ trợ địa phương",
    description: "Ưu tiên các doanh nghiệp nhỏ, cộng đồng địa phương và du lịch bền vững",
    icon: Users,
    iconColor: "text-brand-green "
  },
  {
    title: "Công nghệ thông minh",
    description: "Tích hợp AI để cung cấp gợi ý cá nhân hóa và trải nghiệm tốt nhất",
    icon: Zap,
    iconColor: "text-brand-gold "
  }
]

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 ">
      <Header />
      
      <main className="container py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="glass-card text-center p-8 sm:p-12 mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-brand-green to-brand-forest text-white border-none">
            🎯 Sứ mệnh & Tầm nhìn
          </Badge>
          
          <h1 className="gradient-text text-4xl md:text-5xl font-bold mb-8 leading-tight">
            Sứ mệnh của Du Lịch Việt
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600  max-w-4xl mx-auto leading-relaxed mb-8">
            Xây dựng nền tảng phi lợi nhuận, cung cấp thông tin du lịch Việt Nam đáng tin cậy, 
            tích hợp AI để nâng cao trải nghiệm khám phá đất nước.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white"
              asChild
            >
              <Link href="/contribute/new-place">
                <Target className="w-5 h-5 mr-2" />
                Tham gia sứ mệnh
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="glass-subtle" asChild>
              <Link href="/about">
                <ArrowRight className="w-5 h-5 mr-2" />
                Tìm hiểu về dự án
              </Link>
            </Button>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-slate-900  mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-brand-green " />
              Sứ mệnh
            </h2>
            <div className="space-y-4 text-slate-600  leading-relaxed">
              <p className="text-lg">
                <strong className="text-slate-900 ">Tạo ra kho dữ liệu du lịch minh bạch – xác thực – dễ tiếp cận</strong> cho mọi người, 
                giúp du khách có những quyết định thông minh cho chuyến đi của mình.
              </p>
              <p>
                Chúng tôi tin rằng mỗi chuyến du lịch đều có thể trở thành trải nghiệm ý nghĩa 
                khi có thông tin đúng đắn, được chia sẻ bởi cộng đồng với tinh thần cởi mở và trung thực.
              </p>
            </div>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-slate-900  mb-6 flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-brand-gold " />
              Tầm nhìn
            </h2>
            <div className="space-y-4 text-slate-600  leading-relaxed">
              <p className="text-lg">
                <strong className="text-slate-900 ">Trở thành nguồn thông tin du lịch Việt Nam đáng tin cậy nhất</strong>, 
                được xây dựng và duy trì bởi chính cộng đồng yêu du lịch.
              </p>
              <p>
                Khát vọng của chúng tôi là giúp mọi người khám phá vẻ đẹp Việt Nam một cách bền vững, 
                có trách nhiệm và trọn vẹn nhất.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="gradient-text text-3xl font-bold mb-4">Giá trị cốt lõi</h2>
            <p className="text-slate-600  max-w-2xl mx-auto">
              Những nguyên tắc định hướng mọi quyết định và hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div key={`core-value-${value.title}`} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className={`w-8 h-8 ${value.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900  mb-3">{value.title}</h3>
                <p className="text-slate-600  text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Principles */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="gradient-text text-3xl font-bold mb-4">Nguyên tắc hoạt động</h2>
            <p className="text-slate-600  max-w-3xl mx-auto">
              Cách chúng tôi vận hành để đảm bảo chất lượng và độ tin cậy của nền tảng
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {principles.map((principle, index) => (
              <div key={`principle-${principle.title}`} className="glass-card p-8 hover:scale-105 transition-transform duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <principle.icon className={`w-6 h-6 ${principle.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900  mb-3">{principle.title}</h3>
                    <p className="text-slate-600  leading-relaxed">{principle.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Statement */}
        <div className="glass-card p-8 sm:p-12 mb-16 bg-gradient-to-br from-sky-500/10 to-teal-500/10 dark:from-sky-400/10 dark:to-teal-400/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-brand-green " />
            </div>
            <h2 className="text-3xl font-bold text-slate-900  mb-6">
              Tác động mong muốn
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-slate-600  leading-relaxed mb-6">
                Chúng tôi mong muốn Du Lịch Việt không chỉ là một nền tảng thông tin, 
                mà còn là cầu nối giúp du khách hiểu sâu hơn về văn hóa, con người và thiên nhiên Việt Nam.
              </p>
              <p className="text-lg text-slate-600  leading-relaxed">
                Mỗi chuyến đi được lên kế hoạch qua nền tảng của chúng tôi sẽ góp phần 
                <strong className="text-slate-900 "> phát triển du lịch bền vững</strong>, 
                <strong className="text-slate-900 "> hỗ trợ cộng đồng địa phương</strong>, 
                và <strong className="text-slate-900 ">bảo tồn di sản văn hóa</strong> cho thế hệ tương lai.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="glass-card text-center p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-slate-900  mb-6">
            Tham gia cùng chúng tôi
          </h2>
          <p className="text-lg text-slate-600  mb-8 max-w-2xl mx-auto">
            Hãy là một phần của cộng đồng xây dựng nền tảng du lịch Việt Nam tốt nhất
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white"
              asChild
            >
              <Link href="/contribute/new-place">
                <Target className="w-5 h-5 mr-2" />
                Đóng góp địa điểm
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="glass-subtle" asChild>
              <Link href="/community">
                <Users className="w-5 h-5 mr-2" />
                Tham gia cộng đồng
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Du Lịch Việt - Được xây dựng với ❤️ bởi cộng đồng Việt Nam
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

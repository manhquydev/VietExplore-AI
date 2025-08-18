import * as React from "react"
import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sứ mệnh | Du Lịch Việt",
  description: "Tìm hiểu về sứ mệnh và tầm nhìn của nền tảng Du Lịch Việt",
}

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text mb-6">
            Sứ mệnh của Du Lịch Việt
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Xây dựng nền tảng phi lợi nhuận, cung cấp thông tin du lịch Việt Nam đáng tin cậy, 
            tích hợp AI để nâng cao trải nghiệm khám phá đất nước.
          </p>
        </div>

        {/* Vision */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-text mb-4">🎯 Tầm nhìn</h2>
            <p className="text-muted leading-relaxed">
              "Du Lịch Việt" trở thành <strong>nền tảng phi lợi nhuận, cộng đồng mở</strong>, 
              cung cấp thông tin du lịch Việt Nam đáng tin cậy, xác minh bởi cộng đồng và đối tác chính thống. 
              Ứng dụng AI để hỗ trợ người dùng tìm hiểu địa điểm, xây dựng kế hoạch du lịch, 
              nâng cao trải nghiệm khám phá và lan tỏa giá trị văn hóa – thiên nhiên Việt Nam.
            </p>
          </CardContent>
        </Card>

        {/* Mission */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-text mb-6">🚀 Sứ mệnh</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-text mb-2">Tạo kho dữ liệu minh bạch</h3>
                  <p className="text-muted">
                    Xây dựng kho dữ liệu du lịch <strong>minh bạch – xác thực – dễ tiếp cận</strong> cho mọi người.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-text mb-2">Kết nối cộng đồng</h3>
                  <p className="text-muted">
                    Kết nối du khách, cộng đồng địa phương, blogger, doanh nghiệp nhỏ và cơ quan quản lý 
                    vào một nền tảng chung.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-text mb-2">Ứng dụng AI thông minh</h3>
                  <p className="text-muted">
                    Ứng dụng công nghệ AI giúp <strong>cá nhân hóa hành trình</strong>, 
                    tiết kiệm thời gian và tăng trải nghiệm.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-text mb-6">📈 Mục tiêu giai đoạn 1 (12 tháng)</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-muted">Ra mắt nền tảng với ~1,000 địa điểm xác minh</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-muted">Tích hợp AI trợ lý hành trình thông minh</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-muted">Hệ thống phân quyền minh bạch 6 cấp độ</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">⏳</span>
                  </div>
                  <span className="text-muted">Thu hút 10,000 người dùng đầu tiên</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">⏳</span>
                  </div>
                  <span className="text-muted">Tuyển dụng 100 Contributor tích cực</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">⏳</span>
                  </div>
                  <span className="text-muted">Hợp tác với 5+ Community Partner</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-text mb-6">💎 Giá trị cốt lõi</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="font-semibold text-text mb-2">Minh bạch</h3>
                <p className="text-sm text-muted">
                  Mọi thông tin đều có nguồn rõ ràng và được xác minh bởi cộng đồng
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-semibold text-text mb-2">Cộng đồng</h3>
                <p className="text-sm text-muted">
                  Xây dựng bởi cộng đồng, vì cộng đồng, không vì lợi nhuận
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="font-semibold text-text mb-2">Đổi mới</h3>
                <p className="text-sm text-muted">
                  Ứng dụng AI và công nghệ mới để cải thiện trải nghiệm du lịch
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-text mb-4">
            Tham gia cùng chúng tôi
          </h3>
          <p className="text-muted mb-6">
            Hãy là một phần của cộng đồng xây dựng nền tảng du lịch Việt Nam tốt nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/contribute/new-place">
                Đóng góp địa điểm
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/community">
                Tham gia cộng đồng
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}


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
            <h2 className="text-2xl font-semibold text-text mb-4">Tầm nhìn</h2>
            <p className="text-muted leading-relaxed text-justify">
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
            <h2 className="text-2xl font-semibold text-text mb-6">Sứ mệnh</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-3">Tạo kho dữ liệu minh bạch</h3>
                  <p className="text-muted leading-relaxed">
                    Xây dựng kho dữ liệu du lịch <strong>minh bạch – xác thực – dễ tiếp cận</strong> cho mọi người.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-3">Kết nối cộng đồng</h3>
                  <p className="text-muted leading-relaxed">
                    Kết nối du khách, cộng đồng địa phương, blogger, doanh nghiệp nhỏ và cơ quan quản lý 
                    vào một nền tảng chung.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-3">Ứng dụng AI thông minh</h3>
                  <p className="text-muted leading-relaxed">
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
            <h2 className="text-2xl font-semibold text-text mb-6">Mục tiêu giai đoạn 1 (12 tháng)</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <span className="text-muted">Ra mắt nền tảng với ~1,000 địa điểm xác minh</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <span className="text-muted">Tích hợp AI trợ lý hành trình thông minh</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
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
            <h2 className="text-2xl font-semibold text-text mb-6">Giá trị cốt lõi</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <svg className="w-10 h-10 text-yellow-500 mb-4 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
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
                <svg className="w-10 h-10 text-blue-600 mb-4 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 22V7.5a3 3 0 013-3h9a3 3 0 013 3V22m-10.5-10.5h3m-3 4h3m-6-10V2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75V1.5"/>
                </svg>
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
            <Button variant="secondary" asChild>
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


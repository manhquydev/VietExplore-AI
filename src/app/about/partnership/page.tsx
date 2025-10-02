import * as React from "react"
import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoleBadge } from "@/components/ui/role-badge"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Đối tác | Du Lịch Việt",
  description: "Thông tin về chương trình đối tác cộng đồng Du Lịch Việt",
}

export const dynamic = 'force-dynamic'

const partnerTypes = [
  {
    type: "government",
    title: "Cơ quan nhà nước",
    description: "Sở Du lịch, UBND tỉnh/thành, cơ quan quản lý di tích",
    examples: ["Sở Du lịch Đà Nẵng", "UBND TP. Hội An", "Ban Quản lý Vịnh Hạ Long"],
    benefits: ["Luồng duyệt nhanh", "Hiển thị ưu tiên", "Nhãn chính thức", "Hỗ trợ kỹ thuật"]
  },
  {
    type: "organization", 
    title: "Tổ chức văn hóa",
    description: "Bảo tàng, trung tâm văn hóa, tổ chức bảo tồn di sản",
    examples: ["Bảo tàng Dân tộc học", "Trung tâm Bảo tồn Di tích Huế", "Quỹ Bảo vệ Môi trường"],
    benefits: ["Chia sẻ thông tin chuyên môn", "Tăng nhận diện thương hiệu", "Kết nối cộng đồng"]
  },
  {
    type: "business",
    title: "Doanh nghiệp địa phương",
    description: "Khách sạn, nhà hàng, công ty lữ hành có uy tín lâu năm",
    examples: ["Khách sạn Majestic Sài Gòn", "Nhà hàng Madame Hiền", "Saigon Tourist"],
    benefits: ["Thông tin dịch vụ chính thống", "Tăng độ tin cậy", "Tiếp cận khách hàng mới"]
  }
]

const currentPartners = [
  {
    name: "Sở Du lịch Đà Nẵng",
    type: "Cơ quan nhà nước",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    description: "Cung cấp thông tin chính thức về các điểm tham quan, sự kiện và dịch vụ du lịch tại Đà Nẵng",
    contributions: 45,
    joinDate: "2024-01-05"
  },
  {
    name: "Bảo tàng Dân tộc học Việt Nam",
    type: "Tổ chức văn hóa", 
    logo: "https://images.unsplash.com/photo-1494790108755-2616b332c5cd?w=100&h=100&fit=crop&crop=face",
    description: "Chia sẻ thông tin về các di tích văn hóa và truyền thống dân tộc",
    contributions: 23,
    joinDate: "2024-02-10"
  },
  {
    name: "Saigon Tourist",
    type: "Doanh nghiệp",
    logo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    description: "Công ty lữ hành lâu năm với kinh nghiệm tổ chức tour chất lượng",
    contributions: 18,
    joinDate: "2024-02-20"
  }
]

export default function PartnershipPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-20 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <RoleBadge role="partner" variant="detailed" />
          </div>
          <h1 className="text-4xl font-bold text-text mb-6">
            Chương trình Đối tác Cộng đồng
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto leading-relaxed text-justify">
            Tham gia cùng Du Lịch Việt để xây dựng nền tảng thông tin du lịch đáng tin cậy, 
            minh bạch và phi lợi nhuận cho cộng đồng.
          </p>
        </div>

        {/* Partner Types */}
        <div className="mb-20">
          <h2 className="text-3xl font-semibold text-text mb-12 text-center">
            Các loại đối tác
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((partner, index) => (
              <Card key={partner.type} className="h-full">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">{index + 1}</span>
                    </div>
                    {partner.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  <p className="text-muted leading-relaxed text-justify">
                    {partner.description}
                  </p>
                  
                  <div>
                    <h4 className="font-medium text-text mb-3">Ví dụ:</h4>
                    <ul className="text-sm text-muted space-y-2">
                      {partner.examples.map((example, idx) => (
                        <li key={`${partner.type}-example-${idx}`} className="flex items-start">
                          <span className="text-primary mr-2 font-bold">•</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text mb-3">Quyền lợi:</h4>
                    <ul className="text-sm text-success space-y-2">
                      {partner.benefits.map((benefit, idx) => (
                        <li key={`${partner.type}-benefit-${idx}`} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5 flex-shrink-0">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Current Partners */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-text mb-8 text-center">
            Đối tác hiện tại
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPartners.map((partner) => (
              <Card key={partner.name}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text">{partner.name}</h3>
                        <RoleBadge role="partner" variant="compact" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {partner.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted text-sm mb-4 leading-relaxed text-justify">
                    {partner.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-muted">
                    <span>{partner.contributions} đóng góp</span>
                    <span>Từ {new Date(partner.joinDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnership Process */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center">Quy trình trở thành đối tác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Liên hệ</h3>
                <p className="text-sm text-muted">
                  Gửi email đề xuất hợp tác với thông tin tổ chức
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Xem xét</h3>
                <p className="text-sm text-muted">
                  Đội ngũ đánh giá tư cách và uy tín của tổ chức
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Phê duyệt</h3>
                <p className="text-sm text-muted">
                  Ký kết thỏa thuận và cấp quyền đối tác
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RoleBadge role="partner" variant="compact" />
                </div>
                <h3 className="font-semibold mb-2">Hoạt động</h3>
                <p className="text-sm text-muted">
                  Bắt đầu đóng góp nội dung với quyền ưu tiên
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Quyền lợi đối tác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-text mb-4">Giai đoạn 1 (Hiện tại)</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>• Gắn nhãn Partner chính thức</li>
                  <li>• Luồng duyệt nhanh (24-48h)</li>
                  <li>• Hiển thị ưu tiên trong kết quả tìm kiếm</li>
                  <li>• Hỗ trợ kỹ thuật chuyên biệt</li>
                  <li>• Báo cáo thống kê riêng</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-text mb-4">Giai đoạn 2 (Sắp tới)</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>• Quyền xuất bản ủy quyền</li>
                  <li>• API tích hợp hệ thống riêng</li>
                  <li>• Tùy chỉnh giao diện thương hiệu</li>
                  <li>• Analytics chi tiết</li>
                  <li>• Tính năng booking tích hợp</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Yêu cầu đối tác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-text mb-4">📋 Tiêu chí cơ bản</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>• Là tổ chức/doanh nghiệp có uy tín</li>
                  <li>• Hoạt động trong lĩnh vực du lịch/văn hóa</li>
                  <li>• Cam kết cung cấp thông tin chính xác</li>
                  <li>• Tuân thủ chính sách nội dung</li>
                  <li>• Không có xung đột lợi ích</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-text mb-4">📄 Hồ sơ cần thiết</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>• Giấy phép kinh doanh/hoạt động</li>
                  <li>• Thông tin liên hệ chính thức</li>
                  <li>• Portfolio dự án/hoạt động</li>
                  <li>• Cam kết hợp tác dài hạn</li>
                  <li>• Người đại diện ủy quyền</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center">Đăng ký trở thành đối tác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <p className="text-muted">
                  Điền thông tin dưới đây để bắt đầu quá trình đánh giá đối tác
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Tên tổ chức *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-md bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tên chính thức của tổ chức"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Loại hình *
                  </label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Chọn loại hình</option>
                    <option value="government">Cơ quan nhà nước</option>
                    <option value="organization">Tổ chức văn hóa</option>
                    <option value="business">Doanh nghiệp</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Email liên hệ chính thức *
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="contact@organization.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Website chính thức
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-border rounded-md bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://www.organization.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Mô tả về tổ chức *
                </label>
                <textarea
                  className="w-full min-h-[120px] px-3 py-2 border border-border rounded-md bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mô tả về hoạt động, kinh nghiệm và mục tiêu hợp tác..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Kế hoạch đóng góp
                </label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Bạn dự định đóng góp loại nội dung gì? Tần suất như thế nào?"
                />
              </div>
              
              <div className="text-center">
                <Button className="px-8">
                  Gửi đề xuất hợp tác
                </Button>
                <p className="text-xs text-muted mt-2">
                  Chúng tôi sẽ phản hồi trong vòng 5-7 ngày làm việc
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-text mb-4">
            Có câu hỏi về chương trình đối tác?
          </h3>
          <p className="text-muted mb-6">
            Liên hệ trực tiếp với đội ngũ phát triển đối tác của chúng tôi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:partnership@dulichviet.com"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-center"
            >
              partnership@dulichviet.com
            </a>
            <Link 
              href="/about/contact"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-center"
            >
              Trang liên hệ
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

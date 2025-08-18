import * as React from "react"
import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { RoleBadge } from "@/components/ui/role-badge"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cẩm nang cộng đồng | Du Lịch Việt",
  description: "Hướng dẫn chi tiết về cách tham gia và đóng góp cho cộng đồng Du Lịch Việt",
}

export default function CommunityHandbookPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text mb-6">
            Cẩm nang cộng đồng
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Hướng dẫn toàn diện về cách tham gia, đóng góp và phát triển cùng cộng đồng Du Lịch Việt
          </p>
        </div>

        {/* Getting Started */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="star" />
              Bắt đầu với Du Lịch Việt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-text mb-3">🚀 Cho người mới</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>• Tạo tài khoản miễn phí</li>
                  <li>• Khám phá địa điểm yêu thích</li>
                  <li>• Tạo lịch trình đầu tiên với AI</li>
                  <li>• Tham gia thảo luận cộng đồng</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-3">✍️ Cho người đóng góp</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>• Đọc hướng dẫn đóng góp</li>
                  <li>• Gửi địa điểm đầu tiên</li>
                  <li>• Theo dõi trạng thái duyệt</li>
                  <li>• Nhận huy hiệu Contributor</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Roles */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="users" />
              Các vai trò trong cộng đồng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <RoleBadge role="guest" variant="compact" />
                    <div>
                      <h4 className="font-medium text-text">Khách vãng lai</h4>
                      <p className="text-sm text-muted">Xem nội dung công khai, dùng AI demo</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <RoleBadge role="traveler" variant="compact" />
                    <div>
                      <h4 className="font-medium text-text">Du khách</h4>
                      <p className="text-sm text-muted">Tạo lịch trình, lưu địa điểm, báo cáo</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <RoleBadge role="contributor" variant="compact" />
                    <div>
                      <h4 className="font-medium text-text">Cộng tác viên</h4>
                      <p className="text-sm text-muted">Đóng góp địa điểm, quản lý bản nháp</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <RoleBadge role="partner" variant="compact" />
                    <div>
                      <h4 className="font-medium text-text">Đối tác cộng đồng</h4>
                      <p className="text-sm text-muted">Tổ chức chính thức, duyệt nhanh</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <RoleBadge role="moderator" variant="compact" />
                    <div>
                      <h4 className="font-medium text-text">Kiểm duyệt viên</h4>
                      <p className="text-sm text-muted">Duyệt nội dung, xử lý báo cáo</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <RoleBadge role="admin" variant="compact" />
                    <div>
                      <h4 className="font-medium text-text">Quản trị viên</h4>
                      <p className="text-sm text-muted">Quản lý hệ thống</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="shield" />
              Quy tắc cộng đồng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text mb-2">🤝 Tôn trọng lẫn nhau</h3>
                <p className="text-sm text-muted">
                  Sử dụng ngôn ngữ lịch sự, tôn trọng quan điểm khác nhau, không spam hay quảng cáo
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-text mb-2">📍 Thông tin chính xác</h3>
                <p className="text-sm text-muted">
                  Chỉ chia sẻ thông tin đã trải nghiệm hoặc có nguồn đáng tin cậy, ghi rõ nguồn tham khảo
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-text mb-2">🎯 Nội dung hữu ích</h3>
                <p className="text-sm text-muted">
                  Chia sẻ kinh nghiệm thực tế, mẹo hay, lưu ý quan trọng giúp ích cho du khách khác
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border">
              <Button variant="outline" asChild>
                <Link href="/legal/content-policy">
                  Xem chính sách nội dung đầy đủ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How to Contribute */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="plus" />
              Cách đóng góp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-text mb-4">Đóng góp địa điểm</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">1</span>
                    </div>
                    <p className="text-muted">Điền thông tin cơ bản (tên, mô tả, loại hình)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">2</span>
                    </div>
                    <p className="text-muted">Chọn vị trí địa lý (vùng, tỉnh/thành)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">3</span>
                    </div>
                    <p className="text-muted">Tải ảnh chất lượng cao và ghi nguồn</p>
                  </div>
                </div>
                <Button className="mt-4 w-full" asChild>
                  <Link href="/contribute/new-place">
                    Bắt đầu đóng góp
                  </Link>
                </Button>
              </div>
              
              <div>
                <h3 className="font-semibold text-text mb-4">Chia sẻ lịch trình</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-secondary text-xs font-bold">1</span>
                    </div>
                    <p className="text-muted">Tạo lịch trình với AI hoặc tự thiết kế</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-secondary text-xs font-bold">2</span>
                    </div>
                    <p className="text-muted">Thêm ghi chú, mẹo hay và ước tính chi phí</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-secondary text-xs font-bold">3</span>
                    </div>
                    <p className="text-muted">Chia sẻ công khai để giúp cộng đồng</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/itineraries/builder">
                    Tạo lịch trình
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="bar-chart" />
              Thống kê cộng đồng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">1,247</div>
                <div className="text-sm text-muted">Địa điểm</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">8,934</div>
                <div className="text-sm text-muted">Lịch trình</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">156</div>
                <div className="text-sm text-muted">Contributor</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">23</div>
                <div className="text-sm text-muted">Partner</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}

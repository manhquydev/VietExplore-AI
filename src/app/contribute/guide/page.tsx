import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Hướng dẫn đóng góp | Du Lịch Việt",
  description: "Hướng dẫn chi tiết về cách đóng góp địa điểm và nội dung chất lượng cho Du Lịch Việt",
}

export default function ContributeGuidePage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text mb-6">
            Hướng dẫn đóng góp
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Cách tạo ra những đóng góp chất lượng cao giúp xây dựng 
            kho thông tin du lịch Việt Nam đáng tin cậy nhất.
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Bắt đầu nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-medium mb-2">Đăng ký tài khoản</h4>
                <p className="text-xs text-muted">Tạo tài khoản miễn phí để bắt đầu</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">Đọc hướng dẫn</h4>
                <p className="text-xs text-muted">Tìm hiểu quy trình và tiêu chuẩn</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-medium mb-2">Tạo đóng góp đầu tiên</h4>
                <p className="text-xs text-muted">Chia sẻ địa điểm bạn yêu thích</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h4 className="font-medium mb-2">Nhận phản hồi</h4>
                <p className="text-xs text-muted">Theo dõi và cải thiện chất lượng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Guide */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Hướng dẫn chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Step 1 */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Bước 1: Chuẩn bị thông tin</h3>
              <div className="bg-surface border border-border rounded-lg p-6">
                <h4 className="font-medium text-text mb-3">Thông tin cơ bản cần có:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <ul className="space-y-2 text-muted">
                    <li>• Tên chính thức của địa điểm</li>
                    <li>• Địa chỉ cụ thể và chính xác</li>
                    <li>• Mô tả chi tiết về đặc điểm nổi bật</li>
                    <li>• Loại hình du lịch phù hợp</li>
                  </ul>
                  <ul className="space-y-2 text-muted">
                    <li>• Giờ mở cửa và ngày nghỉ</li>
                    <li>• Giá vé hoặc chi phí tham khảo</li>
                    <li>• Thời điểm tốt nhất để ghé thăm</li>
                    <li>• Lưu ý quan trọng cho du khách</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Bước 2: Chuẩn bị hình ảnh</h3>
              <div className="bg-surface border border-border rounded-lg p-6">
                <h4 className="font-medium text-text mb-3">Yêu cầu về ảnh:</h4>
                <div className="space-y-3 text-sm text-muted">
                  <p>• <strong>Số lượng:</strong> 3-5 ảnh cho mỗi địa điểm</p>
                  <p>• <strong>Chất lượng:</strong> Độ phân giải tối thiểu 800x600px, rõ nét</p>
                  <p>• <strong>Nội dung:</strong> Ảnh chụp thực tế tại địa điểm, không sử dụng ảnh stock</p>
                  <p>• <strong>Bản quyền:</strong> Chỉ sử dụng ảnh do bạn chụp hoặc có phép sử dụng</p>
                  <p>• <strong>Đa dạng:</strong> Bao gồm cả cảnh quan tổng thể và chi tiết đặc trưng</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Bước 3: Điền form đóng góp</h3>
              <div className="bg-surface border border-border rounded-lg p-6">
                <h4 className="font-medium text-text mb-3">Form 3 bước:</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Badge variant="default" className="min-w-fit">Bước 1</Badge>
                    <div>
                      <h5 className="font-medium text-text">Thông tin cơ bản</h5>
                      <p className="text-sm text-muted">Tên, mô tả, loại hình và đặc điểm nổi bật</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Badge variant="default" className="min-w-fit">Bước 2</Badge>
                    <div>
                      <h5 className="font-medium text-text">Vị trí địa lý</h5>
                      <p className="text-sm text-muted">Vùng, tỉnh/thành, địa chỉ cụ thể</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Badge variant="default" className="min-w-fit">Bước 3</Badge>
                    <div>
                      <h5 className="font-medium text-text">Ảnh và nguồn</h5>
                      <p className="text-sm text-muted">Upload ảnh và ghi rõ nguồn tham khảo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Standards */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Tiêu chuẩn chất lượng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-text mb-3">Mô tả địa điểm xuất sắc</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">
                    <strong>Ví dụ tốt:</strong> "Bãi biển Mỹ Khê là bãi biển công cộng miễn phí tại Đà Nẵng, 
                    nổi tiếng với cát trắng mịn và nước biển trong xanh. Thời điểm đẹp nhất để tắm biển 
                    là từ 6-10h sáng và 16-18h chiều khi nắng không quá gắt. Có bãi đỗ xe miễn phí 
                    và nhiều quán ăn ven biển."
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-text mb-3">Mô tả cần cải thiện</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Ví dụ chưa tốt:</strong> "Bãi biển đẹp, nước trong, cát trắng. 
                    Rất tuyệt vời để đi chơi. Mọi người nên đến."
                  </p>
                  <p className="text-xs text-red-700">
                    Thiếu thông tin cụ thể, không có lưu ý thực tế, quá chung chung.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recognition */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Ghi nhận đóng góp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted mb-6">
              Chúng tôi trân trọng mọi đóng góp và có nhiều cách để ghi nhận những cộng tác viên tích cực.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <Badge variant="success">Cộng tác viên</Badge>
                <div>
                  <h4 className="font-medium text-text mb-1">Huy hiệu Cộng tác viên</h4>
                  <p className="text-sm text-muted">
                    Dành cho những người đóng góp chất lượng và nhất quán. 
                    Được hiển thị trên hồ sơ và bên cạnh các đóng góp.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <Badge variant="warning">Đối tác</Badge>
                <div>
                  <h4 className="font-medium text-text mb-1">Đối tác Cộng đồng</h4>
                  <p className="text-sm text-muted">
                    Dành cho tổ chức, doanh nghiệp có uy tín muốn hợp tác dài hạn. 
                    Có quyền lợi đặc biệt và luồng duyệt ưu tiên.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-text mb-4">
            Sẵn sàng bắt đầu đóng góp?
          </h3>
          <p className="text-muted mb-8">
            Hãy chia sẻ những địa điểm du lịch tuyệt vời mà bạn đã khám phá để giúp đỡ cộng đồng.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/contribute/new-place">
                Đóng góp địa điểm mới
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contribute/my-drafts">
                Xem bản nháp của tôi
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-muted mt-4">
            Bạn cần đăng nhập để có thể đóng góp nội dung
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}


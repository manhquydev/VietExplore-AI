"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Điều Khoản Sử Dụng</h1>
            <p className="text-muted">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Giới thiệu về Du Lịch Việt</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Du Lịch Việt là nền tảng phi lợi nhuận, được vận hành bởi cộng đồng nhằm cung cấp 
                  thông tin du lịch Việt Nam đáng tin cậy. Bằng việc sử dụng nền tảng này, bạn đồng ý 
                  tuân thủ các điều khoản và điều kiện được nêu dưới đây.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Quyền và nghĩa vụ của người dùng</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h4 className="font-semibold mb-2">2.1 Quyền của người dùng:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Truy cập miễn phí vào tất cả thông tin công khai</li>
                  <li>Tạo tài khoản và sử dụng các tính năng cá nhân hóa</li>
                  <li>Đóng góp nội dung theo quy định</li>
                  <li>Báo cáo nội dung vi phạm</li>
                </ul>
                
                <h4 className="font-semibold mb-2 mt-4">2.2 Nghĩa vụ của người dùng:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Cung cấp thông tin chính xác và trung thực</li>
                  <li>Tôn trọng quyền sở hữu trí tuệ</li>
                  <li>Không đăng tải nội dung vi phạm pháp luật</li>
                  <li>Tuân thủ quy tắc cộng đồng</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Nội dung và sở hữu trí tuệ</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Tất cả nội dung do người dùng đóng góp sẽ được chia sẻ theo giấy phép 
                  Creative Commons Attribution-ShareAlike 4.0. Người dùng cam kết rằng 
                  họ có quyền chia sẻ nội dung được đóng góp.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Quy trình kiểm duyệt</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Mọi nội dung đóng góp sẽ được kiểm duyệt bởi đội ngũ Moderator trước khi xuất bản. 
                  Quy trình kiểm duyệt tuân thủ nguyên tắc minh bạch và công bằng. Thời gian xử lý 
                  trung bình là 48-72 giờ.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Miễn trừ trách nhiệm</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Du Lịch Việt cung cấp thông tin "nguyên trạng" và không đảm bảo tính chính xác 
                  tuyệt đối. Người dùng tự chịu trách nhiệm khi sử dụng thông tin để lập kế hoạch du lịch.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Liên hệ</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Nếu có câu hỏi về điều khoản sử dụng, vui lòng liên hệ: 
                  <a href="mailto:legal@dulichviet.com" className="text-primary hover:underline ml-1">
                    legal@dulichviet.com
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


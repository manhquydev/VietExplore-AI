"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Chính Sách Bảo Mật</h1>
            <p className="text-muted">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Thu thập thông tin</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Chúng tôi thu thập thông tin bạn cung cấp trực tiếp khi đăng ký tài khoản, 
                  đóng góp nội dung, hoặc sử dụng các tính năng của nền tảng.
                </p>
                
                <h4 className="font-semibold mb-2">Thông tin cá nhân:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Họ tên, email, thông tin hồ sơ</li>
                  <li>Nội dung đóng góp (địa điểm, lịch trình)</li>
                  <li>Lịch sử hoạt động trên nền tảng</li>
                </ul>

                <h4 className="font-semibold mb-2 mt-4">Thông tin kỹ thuật:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Địa chỉ IP, thông tin trình duyệt</li>
                  <li>Cookies và local storage</li>
                  <li>Dữ liệu sử dụng và analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Sử dụng thông tin</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>Chúng tôi sử dụng thông tin của bạn để:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Cung cấp và cải thiện dịch vụ</li>
                  <li>Cá nhân hóa trải nghiệm người dùng</li>
                  <li>Gửi thông báo quan trọng về dịch vụ</li>
                  <li>Phân tích và cải thiện nền tảng</li>
                  <li>Đảm bảo an toàn và bảo mật</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Chia sẻ thông tin</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn. 
                  Thông tin chỉ được chia sẻ trong các trường hợp:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Với sự đồng ý của bạn</li>
                  <li>Để tuân thủ pháp luật</li>
                  <li>Bảo vệ quyền lợi của nền tảng và người dùng</li>
                  <li>Với các đối tác dịch vụ (được ký hợp đồng bảo mật)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Bảo mật thông tin</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp 
                  để bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép, mất mát, 
                  hoặc lạm dụng.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Quyền của bạn</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>Bạn có quyền:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Truy cập và cập nhật thông tin cá nhân</li>
                  <li>Yêu cầu xóa tài khoản và dữ liệu</li>
                  <li>Từ chối nhận email marketing</li>
                  <li>Khiếu nại về việc xử lý dữ liệu</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Liên hệ</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Để thực hiện các quyền trên hoặc có câu hỏi về chính sách bảo mật, 
                  vui lòng liên hệ: 
                  <a href="mailto:privacy@dulichviet.com" className="text-primary hover:underline ml-1">
                    privacy@dulichviet.com
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


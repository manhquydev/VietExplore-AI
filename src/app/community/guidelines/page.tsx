import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Quy tắc cộng đồng | Du Lịch Việt",
  description: "Quy tắc và hướng dẫn để xây dựng cộng đồng Du Lịch Việt tích cực và chất lượng",
}

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text mb-6">
            Quy tắc cộng đồng
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Những nguyên tắc cơ bản để xây dựng một cộng đồng du lịch tích cực, 
            hữu ích và đáng tin cậy cho tất cả mọi người.
          </p>
        </div>

        {/* Core Principles */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Nguyên tắc cốt lõi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text mb-3">1. Tôn trọng và lịch sự</h3>
              <p className="text-muted mb-4">
                Chúng tôi tin rằng sự tôn trọng lẫn nhau là nền tảng của một cộng đồng mạnh mẽ. 
                Hãy luôn sử dụng ngôn ngữ lịch sự, tích cực và xây dựng trong mọi tương tác.
              </p>
              <ul className="space-y-2 text-muted text-sm ml-4">
                <li>• Sử dụng ngôn ngữ lịch sự, không thô tục hoặc xúc phạm</li>
                <li>• Tôn trọng quan điểm và kinh nghiệm khác nhau</li>
                <li>• Không phân biệt đối xử dựa trên giới tính, tuổi tác, tôn giáo hay xuất xứ</li>
                <li>• Góp ý một cách xây dựng và mang tính hỗ trợ</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-3">2. Thông tin chính xác và hữu ích</h3>
              <p className="text-muted mb-4">
                Chất lượng thông tin là yếu tố quan trọng nhất để xây dựng niềm tin trong cộng đồng. 
                Hãy chỉ chia sẻ những thông tin mà bạn đã trải nghiệm hoặc có nguồn đáng tin cậy.
              </p>
              <ul className="space-y-2 text-muted text-sm ml-4">
                <li>• Chỉ chia sẻ thông tin địa điểm mà bạn đã trực tiếp trải nghiệm</li>
                <li>• Ghi rõ nguồn thông tin khi tham khảo từ nguồn khác</li>
                <li>• Cập nhật thông tin khi có thay đổi (giá cả, giờ mở cửa, tình trạng)</li>
                <li>• Không đưa thông tin sai lệch hoặc quảng cáo ẩn</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-3">3. Nội dung chất lượng</h3>
              <p className="text-muted mb-4">
                Mỗi đóng góp của bạn đều có giá trị với cộng đồng. Hãy dành thời gian để tạo ra 
                những nội dung thực sự hữu ích và có ý nghĩa.
              </p>
              <ul className="space-y-2 text-muted text-sm ml-4">
                <li>• Viết mô tả chi tiết, dễ hiểu và có cấu trúc rõ ràng</li>
                <li>• Sử dụng ảnh chụp thực tế, rõ nét và phù hợp</li>
                <li>• Chia sẻ kinh nghiệm cá nhân, mẹo hay và lưu ý thực tế</li>
                <li>• Tránh nội dung trùng lặp hoặc spam</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Content */}
        <Card className="mb-12 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Nội dung bị cấm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-text mb-2">Nội dung không được phép</h4>
                <ul className="space-y-1 text-sm text-muted">
                  <li>• Quảng cáo thương mại trực tiếp</li>
                  <li>• Nội dung chính trị gây chia rẽ</li>
                  <li>• Thông tin sai lệch về an toàn, sức khỏe</li>
                  <li>• Spam hoặc nội dung trùng lặp</li>
                  <li>• Ngôn từ thô tục, xúc phạm</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-text mb-2">Hình ảnh không phù hợp</h4>
                <ul className="space-y-1 text-sm text-muted">
                  <li>• Ảnh có bản quyền của người khác</li>
                  <li>• Ảnh chứa nội dung nhạy cảm</li>
                  <li>• Ảnh có watermark của trang web khác</li>
                  <li>• Ảnh chụp người khác mà không có sự đồng ý</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enforcement */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Xử lý vi phạm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted">
              Chúng tôi áp dụng phương pháp xử lý vi phạm theo từng mức độ, 
              luôn ưu tiên giáo dục và hỗ trợ thay vì trừng phạt.
            </p>

            <div className="space-y-4">
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Cảnh báo lần đầu</h4>
                <p className="text-sm text-yellow-700">
                  Vi phạm nhẹ hoặc lần đầu: nhắc nhở và hướng dẫn cách cải thiện
                </p>
              </div>
              
              <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">Tạm khóa tính năng</h4>
                <p className="text-sm text-orange-700">
                  Vi phạm lặp lại: tạm khóa quyền đóng góp 7-30 ngày tùy mức độ
                </p>
              </div>
              
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Khóa tài khoản</h4>
                <p className="text-sm text-red-700">
                  Vi phạm nghiêm trọng hoặc cố ý: khóa tài khoản vĩnh viễn
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Báo cáo vi phạm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted mb-4">
              Nếu bạn phát hiện nội dung vi phạm quy tắc cộng đồng, hãy báo cáo để chúng tôi xử lý kịp thời.
            </p>
            
            <div className="bg-surface border border-border rounded-lg p-6">
              <h4 className="font-medium text-text mb-3">Cách báo cáo</h4>
              <ol className="space-y-2 text-sm text-muted">
                <li>1. Sử dụng nút "Báo cáo" trên từng địa điểm hoặc lịch trình</li>
                <li>2. Mô tả rõ ràng lý do báo cáo</li>
                <li>3. Cung cấp thông tin bổ sung nếu cần</li>
                <li>4. Chờ phản hồi từ đội ngũ kiểm duyệt trong vòng 48 giờ</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Community Values */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Giá trị cộng đồng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-3">🤝</div>
                <h4 className="font-semibold text-text mb-2">Hợp tác</h4>
                <p className="text-sm text-muted">
                  Cùng nhau xây dựng kho tài nguyên du lịch phong phú và đáng tin cậy
                </p>
              </div>
              <div>
                <svg className="w-8 h-8 text-yellow-500 mb-3 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                <h4 className="font-semibold text-text mb-2">Chất lượng</h4>
                <p className="text-sm text-muted">
                  Luôn hướng tới việc cung cấp thông tin chính xác và hữu ích nhất
                </p>
              </div>
              <div>
                <svg className="w-8 h-8 text-brand-green mb-3 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 22V7.5a3 3 0 013-3h9a3 3 0 013 3V22m-10.5-10.5h3m-3 4h3m-6-10V2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75V1.5"/>
                </svg>
                <h4 className="font-semibold text-text mb-2">Phát triển</h4>
                <p className="text-sm text-muted">
                  Không ngừng học hỏi và cải thiện để phục vụ cộng đồng tốt hơn
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Help */}
        <Card>
          <CardHeader>
            <CardTitle>Cần hỗ trợ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted mb-6">
              Nếu bạn có thắc mắc về quy tắc cộng đồng hoặc cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-text mb-3">Tài liệu hữu ích</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/contribute/guide">
                      Hướng dẫn đóng góp
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/legal/content-policy">
                      Chính sách nội dung
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/help/faq">
                      Câu hỏi thường gặp
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-text mb-3">Liên hệ trực tiếp</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Email hỗ trợ cộng đồng:</p>
                    <a href="mailto:community@dulichviet.com" className="text-primary hover:underline">
                      community@dulichviet.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium">Báo cáo vi phạm khẩn cấp:</p>
                    <a href="mailto:report@dulichviet.com" className="text-primary hover:underline">
                      report@dulichviet.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium">Thời gian phản hồi:</p>
                    <p className="text-muted">24-48 giờ (ngày làm việc)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}


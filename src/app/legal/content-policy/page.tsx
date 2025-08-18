import * as React from "react"
import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Chính sách nội dung | Du Lịch Việt",
  description: "Hướng dẫn về nội dung và quy tắc cộng đồng cho nền tảng Du Lịch Việt",
}

export default function ContentPolicyPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-16 max-w-4xl">
      <div className="prose prose-slate max-w-none">
        <h1 className="text-4xl font-bold text-text mb-8">
          Chính sách nội dung
        </h1>
        
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <p className="text-lg text-muted mb-0">
            Du Lịch Việt cam kết xây dựng một cộng đồng chia sẻ thông tin du lịch chính xác, 
            hữu ích và tôn trọng lẫn nhau. Chính sách này giúp đảm bảo chất lượng nội dung 
            và trải nghiệm tích cực cho tất cả người dùng.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-text mt-8 mb-4">
          1. Nguyên tắc chung
        </h2>
        
        <h3 className="text-xl font-medium text-text mt-6 mb-3">
          1.1. Thông tin chính xác
        </h3>
        <ul className="space-y-2 text-muted">
          <li>• Chỉ chia sẻ thông tin địa điểm mà bạn đã trực tiếp trải nghiệm hoặc có nguồn đáng tin cậy</li>
          <li>• Ghi rõ nguồn thông tin khi chia sẻ từ nguồn khác</li>
          <li>• Cập nhật thông tin khi có thay đổi (giá cả, giờ mở cửa, tình trạng hoạt động)</li>
          <li>• Không đưa thông tin sai lệch hoặc quảng cáo ẩn</li>
        </ul>

        <h3 className="text-xl font-medium text-text mt-6 mb-3">
          1.2. Nội dung hữu ích
        </h3>
        <ul className="space-y-2 text-muted">
          <li>• Chia sẻ kinh nghiệm cá nhân, mẹo hay và lưu ý thực tế</li>
          <li>• Sử dụng ảnh chụp thực tế, rõ nét và phù hợp</li>
          <li>• Viết mô tả chi tiết, dễ hiểu và có cấu trúc</li>
          <li>• Tránh nội dung trùng lặp hoặc spam</li>
        </ul>

        <h2 className="text-2xl font-semibold text-text mt-8 mb-4">
          2. Quy tắc về ảnh và media
        </h2>
        
        <h3 className="text-xl font-medium text-text mt-6 mb-3">
          2.1. Ảnh được khuyến khích
        </h3>
        <ul className="space-y-2 text-muted">
          <li>• Ảnh chụp thực tế tại địa điểm (3-5 ảnh mỗi địa điểm)</li>
          <li>• Ảnh phong cảnh, kiến trúc, món ăn đặc trưng</li>
          <li>• Ảnh có độ phân giải tốt, ánh sáng phù hợp</li>
          <li>• Ảnh thể hiện được đặc điểm nổi bật của địa điểm</li>
        </ul>

        <h3 className="text-xl font-medium text-text mt-6 mb-3">
          2.2. Ảnh bị cấm
        </h3>
        <ul className="space-y-2 text-muted">
          <li>• Ảnh có bản quyền của người khác (trừ khi có phép)</li>
          <li>• Ảnh chứa nội dung nhạy cảm, bạo lực hoặc không phù hợp</li>
          <li>• Ảnh có watermark của trang web/công ty khác</li>
          <li>• Ảnh chụp người khác mà không có sự đồng ý</li>
        </ul>

        <h2 className="text-2xl font-semibold text-text mt-8 mb-4">
          3. Quy tắc cộng đồng
        </h2>
        
        <h3 className="text-xl font-medium text-text mt-6 mb-3">
          3.1. Tôn trọng và lịch sự
        </h3>
        <ul className="space-y-2 text-muted">
          <li>• Sử dụng ngôn ngữ lịch sự, tôn trọng trong mọi tương tác</li>
          <li>• Không sử dụng từ ngữ thô tục, xúc phạm hoặc phân biệt đối xử</li>
          <li>• Tôn trọng quan điểm và kinh nghiệm khác nhau</li>
          <li>• Góp ý xây dựng và mang tính chất hỗ trợ</li>
        </ul>

        <h3 className="text-xl font-medium text-text mt-6 mb-3">
          3.2. Nội dung bị cấm
        </h3>
        <ul className="space-y-2 text-muted">
          <li>• Quảng cáo thương mại trực tiếp (trừ Partner được ủy quyền)</li>
          <li>• Nội dung chính trị, tôn giáo gây chia rẽ</li>
          <li>• Thông tin sai lệch về an toàn, sức khỏe</li>
          <li>• Spam, nội dung trùng lặp hoặc không liên quan</li>
        </ul>

        <h2 className="text-2xl font-semibold text-text mt-8 mb-4">
          4. Quy trình kiểm duyệt
        </h2>
        
        <h3 className="text-xl font-medium text-text mt-6 mb-3">
          4.1. Các cấp độ tin cậy
        </h3>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium text-text mb-2">🌟 Verified</h4>
            <p className="text-sm text-muted">Nội dung được xác thực bởi đội ngũ kiểm duyệt</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium text-text mb-2">🏛️ Partner</h4>
            <p className="text-sm text-muted">Nội dung từ đối tác chính thức (Sở Du lịch, khách sạn uy tín)</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium text-text mb-2">✍️ Contributor</h4>
            <p className="text-sm text-muted">Nội dung từ cộng tác viên có uy tín</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium text-text mb-2">👥 Community</h4>
            <p className="text-sm text-muted">Nội dung từ cộng đồng, cần xem xét thêm</p>
          </div>
        </div>

        <h3 className="text-xl font-medium text-text mt-6 mb-3">
          4.2. Quy trình duyệt
        </h3>
        <div className="space-y-3 text-muted">
          <p><strong>Bước 1:</strong> Nội dung được gửi lên với trạng thái "Draft"</p>
          <p><strong>Bước 2:</strong> Kiểm duyệt viên xem xét và phân loại</p>
          <p><strong>Bước 3:</strong> Phê duyệt, yêu cầu chỉnh sửa hoặc từ chối</p>
          <p><strong>Bước 4:</strong> Nội dung được công khai với nhãn tin cậy phù hợp</p>
        </div>

        <h2 className="text-2xl font-semibold text-text mt-8 mb-4">
          5. Báo cáo vi phạm
        </h2>
        
        <p className="text-muted mb-4">
          Nếu bạn phát hiện nội dung vi phạm chính sách, hãy báo cáo để chúng tôi xử lý kịp thời:
        </p>
        
        <ul className="space-y-2 text-muted mb-6">
          <li>• Sử dụng nút "Báo cáo" trên từng địa điểm hoặc lịch trình</li>
          <li>• Mô tả rõ lý do báo cáo</li>
          <li>• Cung cấp thông tin bổ sung nếu cần</li>
          <li>• Chúng tôi sẽ xem xét và phản hồi trong vòng 48 giờ</li>
        </ul>

        <h2 className="text-2xl font-semibold text-text mt-8 mb-4">
          6. Xử lý vi phạm
        </h2>
        
        <div className="space-y-4">
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Cảnh báo</h4>
            <p className="text-sm text-yellow-700">Vi phạm nhẹ lần đầu: nhắc nhở và hướng dẫn</p>
          </div>
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">Tạm khóa</h4>
            <p className="text-sm text-orange-700">Vi phạm lặp lại: tạm khóa tính năng đóng góp 7-30 ngày</p>
          </div>
          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Khóa vĩnh viễn</h4>
            <p className="text-sm text-red-700">Vi phạm nghiêm trọng: khóa tài khoản vĩnh viễn</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-text mt-8 mb-4">
          7. Liên hệ
        </h2>
        
        <p className="text-muted mb-4">
          Có thắc mắc về chính sách nội dung? Liên hệ với chúng tôi:
        </p>
        
        <ul className="space-y-2 text-muted">
          <li>• Email: <a href="mailto:content@dulichviet.com" className="text-primary hover:underline">content@dulichviet.com</a></li>
          <li>• Telegram: <a href="https://t.me/dulichviet_support" className="text-primary hover:underline">@dulichviet_support</a></li>
          <li>• Thời gian phản hồi: 24-48 giờ (ngày làm việc)</li>
        </ul>

        <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted text-center">
            Chính sách này có hiệu lực từ ngày 01/01/2024 và có thể được cập nhật theo thời gian. 
            Phiên bản mới nhất luôn được công bố tại trang này.
          </p>
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  )
}

"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"

const faqCategories = [
  {
    name: "Sử dụng nền tảng",
    questions: [
      {
        q: "Du Lịch Việt là gì?",
        a: "Du Lịch Việt là nền tảng phi lợi nhuận cung cấp thông tin du lịch Việt Nam đáng tin cậy, được xây dựng và vận hành bởi cộng đồng. Chúng tôi tích hợp AI trợ lý để giúp bạn lập kế hoạch du lịch thông minh."
      },
      {
        q: "Tôi có cần đăng ký tài khoản không?",
        a: "Bạn có thể xem thông tin địa điểm và lịch trình công khai mà không cần đăng ký. Tuy nhiên, để lưu lịch trình, đóng góp nội dung, và sử dụng đầy đủ AI trợ lý, bạn cần tạo tài khoản miễn phí."
      },
      {
        q: "AI trợ lý hoạt động như thế nào?",
        a: "AI trợ lý của chúng tôi phân tích sở thích, ngân sách, và thời gian của bạn để đề xuất lịch trình phù hợp. AI được huấn luyện trên dữ liệu du lịch Việt Nam được cộng đồng xác minh."
      }
    ]
  },
  {
    name: "Đóng góp nội dung", 
    questions: [
      {
        q: "Làm thế nào để trở thành Contributor?",
        a: "Sau khi đăng ký tài khoản, bạn có thể đóng góp địa điểm mới. Khi đóng góp đạt chất lượng và được cộng đồng đánh giá tích cực, bạn sẽ được cấp quyền Contributor."
      },
      {
        q: "Quy trình duyệt nội dung như thế nào?",
        a: "Nội dung sẽ được kiểm duyệt trong 48-72 giờ. Đội ngũ Moderator sẽ xác minh thông tin, chất lượng hình ảnh, và tính chính xác của dữ liệu trước khi xuất bản."
      },
      {
        q: "Tôi có thể chỉnh sửa nội dung đã gửi không?",
        a: "Bạn có thể chỉnh sửa nội dung ở trạng thái 'Bản nháp'. Sau khi gửi duyệt, nếu cần chỉnh sửa, Moderator sẽ gửi lại cho bạn với góp ý cụ thể."
      }
    ]
  },
  {
    name: "Tài khoản và bảo mật",
    questions: [
      {
        q: "Thông tin cá nhân của tôi có được bảo mật không?",
        a: "Chúng tôi cam kết bảo vệ thông tin cá nhân theo chính sách bảo mật. Thông tin chỉ được sử dụng để cải thiện dịch vụ và không được bán cho bên thứ ba."
      },
      {
        q: "Làm thế nào để xóa tài khoản?",
        a: "Bạn có thể yêu cầu xóa tài khoản bằng cách liên hệ support@dulichviet.com. Chúng tôi sẽ xử lý trong vòng 7 ngày làm việc."
      },
      {
        q: "Tôi quên mật khẩu, phải làm sao?",
        a: "Sử dụng tính năng 'Quên mật khẩu' trên trang đăng nhập. Chúng tôi sẽ gửi link đặt lại mật khẩu qua email của bạn."
      }
    ]
  }
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return faqCategories
    
    return faqCategories.map(category => ({
      ...category,
      questions: category.questions.filter(
        q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
             q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.questions.length > 0)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Câu Hỏi Thường Gặp</h1>
            <p className="text-muted">
              Tìm câu trả lời cho những thắc mắc phổ biến về Du Lịch Việt
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <Input
                placeholder="Tìm kiếm câu hỏi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    <Badge variant="outline" className="text-xs">
                      {category.questions.length} câu hỏi
                    </Badge>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted leading-relaxed">{faq.a}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <Card className="mt-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Không tìm thấy câu trả lời?</h3>
              <p className="text-muted mb-6">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp bạn
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@dulichviet.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-700 transition-colors"
                >
                  Gửi email hỗ trợ
                </a>
                <a
                  href="/about/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-full hover:bg-primary-50 transition-colors"
                >
                  Xem thông tin liên hệ
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}






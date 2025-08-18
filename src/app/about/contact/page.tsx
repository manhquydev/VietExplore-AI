import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@/components/ui/icon"

export const metadata: Metadata = {
  title: "Liên hệ | Du Lịch Việt",
  description: "Liên hệ với đội ngũ Du Lịch Việt để được hỗ trợ và tư vấn",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text mb-6">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe ý kiến và hỗ trợ cộng đồng. 
            Hãy liên hệ để được tư vấn hoặc đóng góp ý kiến.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Gửi tin nhắn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Họ</Label>
                  <Input id="firstName" placeholder="Nhập họ" />
                </div>
                <div>
                  <Label htmlFor="lastName">Tên</Label>
                  <Input id="lastName" placeholder="Nhập tên" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              
              <div>
                <Label htmlFor="subject">Chủ đề</Label>
                <Input id="subject" placeholder="Chủ đề tin nhắn" />
              </div>
              
              <div>
                <Label htmlFor="message">Nội dung</Label>
                <textarea
                  id="message"
                  className="w-full min-h-[120px] px-3 py-2 border border-border rounded-md bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nhập nội dung tin nhắn..."
                />
              </div>
              
              <Button className="w-full">
                Gửi tin nhắn
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                  <Icon name="mail" />
                  Email liên hệ
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Hỗ trợ chung:</p>
                    <a href="mailto:hello@dulichviet.com" className="text-primary hover:underline">
                      hello@dulichviet.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium">Đóng góp nội dung:</p>
                    <a href="mailto:contribute@dulichviet.com" className="text-primary hover:underline">
                      contribute@dulichviet.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium">Báo cáo vi phạm:</p>
                    <a href="mailto:report@dulichviet.com" className="text-primary hover:underline">
                      report@dulichviet.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-text mb-4">⏰ Thời gian phản hồi</h3>
                <div className="space-y-2 text-sm text-muted">
                  <p>• Hỗ trợ chung: 24-48 giờ</p>
                  <p>• Báo cáo vi phạm: Trong vòng 48 giờ</p>
                  <p>• Đóng góp nội dung: 3-5 ngày làm việc</p>
                  <p>• Hợp tác đối tác: 1-2 tuần</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-text mb-4">🤝 Hợp tác</h3>
                <p className="text-muted text-sm mb-4">
                  Bạn đại diện cho tổ chức du lịch, sở văn hóa, hoặc doanh nghiệp muốn hợp tác?
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:partnership@dulichviet.com">
                    Liên hệ hợp tác
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-text mb-4">📱 Mạng xã hội</h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                  >
                    <Icon name="facebook" />
                    Facebook
                  </a>
                  <a
                    href="https://github.com/dulichviet"
                    className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                  >
                    <Icon name="github" />
                    GitHub
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-16">
          <p className="text-muted mb-4">
            Có thể câu hỏi của bạn đã được trả lời trong phần FAQ?
          </p>
          <Button variant="outline" asChild>
            <Link href="/help/faq">
              Xem câu hỏi thường gặp
            </Link>
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

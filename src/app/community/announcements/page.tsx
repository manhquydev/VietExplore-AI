import * as React from "react"
import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Thông báo cộng đồng | Du Lịch Việt",
  description: "Cập nhật mới nhất từ đội ngũ Du Lịch Việt và cộng đồng",
}

const announcements = [
  {
    id: "1",
    title: "🎉 Chào mừng đến với Du Lịch Việt!",
    content: "Chúng tôi vui mừng giới thiệu nền tảng du lịch phi lợi nhuận đầu tiên tại Việt Nam. Hãy cùng nhau xây dựng cộng đồng chia sẻ thông tin du lịch đáng tin cậy.",
    author: "Đội ngũ Du Lịch Việt",
    date: "2024-03-15",
    type: "announcement",
    pinned: true
  },
  {
    id: "2", 
    title: "🤖 AI Trợ lý đã sẵn sàng phục vụ",
    content: "Tính năng AI trợ lý giúp bạn lập kế hoạch du lịch thông minh đã chính thức ra mắt. Hãy thử ngay để nhận gợi ý lịch trình phù hợp với sở thích và ngân sách của bạn.",
    author: "Team AI",
    date: "2024-03-12",
    type: "feature",
    pinned: false
  },
  {
    id: "3",
    title: "📝 Hướng dẫn đóng góp nội dung chất lượng",
    content: "Để đảm bảo chất lượng thông tin trên nền tảng, chúng tôi đã cập nhật hướng dẫn chi tiết về cách đóng góp địa điểm và lịch trình. Hãy tham khảo để nội dung của bạn được duyệt nhanh chóng.",
    author: "Đội kiểm duyệt",
    date: "2024-03-10",
    type: "guide",
    pinned: false
  },
  {
    id: "4",
    title: "🏆 Chương trình Contributor của tháng",
    content: "Chúng tôi tri ân những cộng tác viên tích cực nhất trong tháng 3. Hãy tham gia đóng góp để có cơ hội nhận được huy hiệu đặc biệt và được giới thiệu trên trang chủ.",
    author: "Community Manager",
    date: "2024-03-08",
    type: "community",
    pinned: false
  }
]

const typeConfig = {
  announcement: { label: "Thông báo", variant: "default" as const, icon: "alert" },
  feature: { label: "Tính năng mới", variant: "success" as const, icon: "sparkles" },
  guide: { label: "Hướng dẫn", variant: "warning" as const, icon: "edit" },
  community: { label: "Cộng đồng", variant: "secondary" as const, icon: "users" }
}

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Thông báo cộng đồng</h1>
          <p className="text-muted">
            Cập nhật mới nhất về tính năng, sự kiện và hoạt động của cộng đồng Du Lịch Việt
          </p>
        </div>

        {/* Announcements */}
        <div className="space-y-6">
          {announcements.map((announcement) => {
            const typeInfo = typeConfig[announcement.type as keyof typeof typeConfig]
            return (
              <Card key={announcement.id} className={announcement.pinned ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        {announcement.pinned && <Icon name="star" className="text-yellow-500" />}
                        {announcement.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted">
                        <span>Bởi {announcement.author}</span>
                        <span>•</span>
                        <span>{new Date(announcement.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <Badge variant={typeInfo.variant} className="gap-1">
                      <Icon name={typeInfo.icon} className="w-3 h-3" />
                      {typeInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted leading-relaxed">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline">
            Xem thêm thông báo
          </Button>
        </div>

        {/* Quick Links */}
        <Card className="mt-12">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Liên kết hữu ích</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" asChild>
                <Link href="/community">
                  <Icon name="users" />
                  <span className="text-sm">Cộng đồng</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" asChild>
                <Link href="/help/faq">
                  <Icon name="alert" />
                  <span className="text-sm">FAQ</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" asChild>
                <Link href="/about/contact">
                  <Icon name="mail" />
                  <span className="text-sm">Liên hệ</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}


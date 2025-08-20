"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { cn } from "@/lib/utils"
import { 
  Users,
  MessageSquare,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  ExternalLink,
  Heart,
  Star,
  FileText,
  Edit,
  MapPin
} from "lucide-react"

const announcements = [
  {
    id: "announce_001",
    title: "Chào mừng các thành viên mới tham gia cộng đồng Du Lịch Việt!",
    content: "Chúng tôi rất vui mừng chào đón hơn 10,000 thành viên đã tham gia cộng đồng. Cảm ơn mọi người đã tin tưởng và đóng góp để xây dựng nền tảng du lịch đáng tin cậy.",
    date: "2024-03-15T10:00:00Z",
    author: "Du Lịch Việt Team",
    important: true
  },
  {
    id: "announce_002", 
    title: "Cập nhật tính năng AI Trợ lý - Gợi ý lịch trình thông minh hơn",
    content: "Chúng tôi đã nâng cấp AI Trợ lý với khả năng hiểu ngữ cảnh tốt hơn và đưa ra gợi ý lịch trình phù hợp với ngân sách, thời gian và sở thích của bạn.",
    date: "2024-03-10T14:30:00Z",
    author: "Technical Team",
    important: false
  },
  {
    id: "announce_003",
    title: "Quy định mới về đóng góp nội dung - Đảm bảo chất lượng thông tin",
    content: "Để đảm bảo thông tin chính xác và đáng tin cậy, chúng tôi đã cập nhật quy định về đóng góp nội dung. Vui lòng xem hướng dẫn chi tiết.",
    date: "2024-03-05T09:15:00Z", 
    author: "Community Team",
    important: false
  }
]

const communityStats = {
  totalMembers: 10247,
  placesContributed: 1089,
  itinerariesShared: 2341,
  monthlyGrowth: 15.2
}

const topContributors = [
  {
    id: "user_001",
    name: "Nguyễn Minh Anh",
    username: "travel_explorer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    contributions: 45,
    verified: true
  },
  {
    id: "user_002", 
    name: "Trần Thị Lan",
    username: "vietnam_wanderer",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c5cd?w=100&h=100&fit=crop&crop=face",
    contributions: 38,
    verified: true
  },
  {
    id: "user_003",
    name: "Lê Văn Đức",
    username: "mountain_lover",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    contributions: 32,
    verified: false
  }
]

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">
                Cộng Đồng Du Lịch Việt
              </h1>
              <p className="text-lg text-muted mb-8">
                Nơi kết nối những người yêu thích khám phá Việt Nam, chia sẻ kinh nghiệm và xây dựng cộng đồng du lịch đáng tin cậy
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{communityStats.totalMembers.toLocaleString('vi-VN')}</div>
                  <div className="text-sm text-muted">Thành viên</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{communityStats.placesContributed.toLocaleString('vi-VN')}</div>
                  <div className="text-sm text-muted">Địa điểm</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{communityStats.itinerariesShared.toLocaleString('vi-VN')}</div>
                  <div className="text-sm text-muted">Lịch trình</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">+{communityStats.monthlyGrowth}%</div>
                  <div className="text-sm text-muted">Tăng trưởng</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Announcements */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Thông báo cộng đồng</h2>
                <Badge variant="outline" className="gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {announcements.length} thông báo
                </Badge>
              </div>

              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} className={cn(
                    "transition-all hover:shadow-card",
                    announcement.important && "border-primary"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg flex-1 pr-4">
                          {announcement.title}
                        </h3>
                        {announcement.important && (
                          <Badge variant="default" className="text-xs">
                            Quan trọng
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted mb-4 leading-relaxed">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(announcement.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <span>Bởi {announcement.author}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Cộng tác viên xuất sắc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topContributors.map((contributor, index) => (
                      <div key={contributor.id} className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={contributor.avatar}
                            alt={contributor.name}
                            className="w-10 h-10 rounded-full"
                          />
                          {index < 3 && (
                            <div className={cn(
                              "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white",
                              index === 0 ? "bg-yellow-500" :
                              index === 1 ? "bg-gray-400" : "bg-orange-500"
                            )}>
                              {index + 1}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{contributor.name}</span>
                          </div>
                          <div className="mb-1">
                            <UserRoleDisplay 
                              role="contributor"
                              variant="compact"
                            />
                          </div>
                          <p className="text-xs text-muted">
                            {contributor.contributions} đóng góp
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    Xem tất cả cộng tác viên
                  </Button>
                </CardContent>
              </Card>

              {/* Community Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Hướng dẫn cộng đồng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/community/guidelines">
                      <FileText className="w-4 h-4 mr-2" />
                      Quy tắc cộng đồng
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/contribute/guide">
                      <Edit className="w-4 h-4 mr-2" />
                      Hướng dẫn đóng góp
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/help/faq">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Câu hỏi thường gặp
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/about/contact">
                      <Users className="w-4 h-4 mr-2" />
                      Liên hệ hỗ trợ
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Join Community */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Tham gia đóng góp</h3>
                  <p className="text-sm text-muted mb-4">
                    Chia sẻ kiến thức và trải nghiệm để giúp cộng đồng du lịch phát triển
                  </p>
                  <Button className="w-full">
                    Bắt đầu đóng góp
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Community Values */}
        <section className="bg-surface py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Giá trị cộng đồng</h2>
              <p className="text-muted max-w-2xl mx-auto">
                Du Lịch Việt được xây dựng trên những giá trị cốt lõi để tạo ra một cộng đồng du lịch tích cực và bền vững
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Phi lợi nhuận</h3>
                <p className="text-sm text-muted">
                  Hoạt động vì cộng đồng, không vì lợi nhuận thương mại
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Đáng tin cậy</h3>
                <p className="text-sm text-muted">
                  Thông tin được xác minh bởi cộng đồng và đối tác uy tín
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Cộng đồng</h3>
                <p className="text-sm text-muted">
                  Xây dựng bởi cộng đồng, vì cộng đồng du lịch Việt Nam
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-warn/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-warn" />
                </div>
                <h3 className="font-semibold mb-2">Đổi mới</h3>
                <p className="text-sm text-muted">
                  Ứng dụng AI và công nghệ để nâng cao trải nghiệm du lịch
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Contribute */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cách thức đóng góp</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Có nhiều cách để bạn có thể đóng góp và hỗ trợ cộng đồng Du Lịch Việt phát triển
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Chia sẻ địa điểm</h3>
                <p className="text-sm text-muted mb-4">
                  Đóng góp những địa điểm tuyệt vời mà bạn đã khám phá
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contribute/new-place">Thêm địa điểm</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Tạo lịch trình</h3>
                <p className="text-sm text-muted mb-4">
                  Chia sẻ lịch trình du lịch để giúp người khác lên kế hoạch
                </p>
                <Button variant="outline" asChild>
                  <Link href="/itineraries/builder">Tạo lịch trình</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Phản hồi & Đánh giá</h3>
                <p className="text-sm text-muted mb-4">
                  Đánh giá địa điểm và chia sẻ trải nghiệm thực tế
                </p>
                <Button variant="outline" disabled>
                  Sắp ra mắt
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

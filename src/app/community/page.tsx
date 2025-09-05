"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  MapPin,
  Sparkles,
  UserPlus,
  Globe
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 ">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 "></div>
          
          <div className="relative container">
            <div className="glass-card max-w-4xl mx-auto text-center p-8 sm:p-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100  flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-600 " />
                </div>
                <h1 className="gradient-text text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Cộng Đồng Du Lịch Việt
                </h1>
              </div>
              <p className="text-lg sm:text-xl text-slate-600  mb-8 max-w-2xl mx-auto leading-relaxed">
                Kết nối với hàng nghìn người yêu du lịch Việt Nam. Chia sẻ trải nghiệm, khám phá địa điểm mới và lên kế hoạch chuyến đi cùng nhau.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600  mb-8">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-500" />
                  <span>{communityStats.totalMembers.toLocaleString()} thành viên</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  <span>{communityStats.placesContributed.toLocaleString()} địa điểm</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span>{communityStats.itinerariesShared.toLocaleString()} lịch trình</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tham gia cộng đồng
                </Button>
                <Button variant="secondary" className="glass-subtle">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Hướng dẫn
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 sm:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Community Stats */}
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-slate-900  mb-6">Tổng quan cộng đồng</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100  rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-blue-600 " />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 ">
                      {communityStats.totalMembers.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 ">Thành viên</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 ">
                      {communityStats.placesContributed.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 ">Địa điểm</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 ">
                      {communityStats.itinerariesShared.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 ">Lịch trình</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 ">
                      +{communityStats.monthlyGrowth}%
                    </div>
                    <div className="text-sm text-slate-600 ">Tăng trưởng</div>
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 ">Thông báo cộng đồng</h2>
                  <Link href="/community/announcements">
                    <Button variant="secondary" size="sm" className="glass-subtle">
                      Xem tất cả
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="glass-subtle p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {announcement.important && (
                            <Badge variant="danger" className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                              Quan trọng
                            </Badge>
                          )}
                          <span className="text-sm text-slate-600 ">
                            {formatDate(announcement.date)}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {announcement.author}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900  mb-2">
                        {announcement.title}
                      </h3>
                      
                      <p className="text-slate-600  leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Guidelines */}
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-slate-900  mb-6">Quy tắc cộng đồng</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link href="/community/guidelines">
                    <div className="glass-subtle p-4 rounded-xl hover:scale-105 transition-transform cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-5 h-5 text-sky-600" />
                        <h3 className="font-semibold text-slate-900 ">Hướng dẫn đóng góp</h3>
                      </div>
                      <p className="text-sm text-slate-600 ">
                        Cách chia sẻ địa điểm và lịch trình hiệu quả
                      </p>
                    </div>
                  </Link>
                  
                  <Link href="/community/handbook">
                    <div className="glass-subtle p-4 rounded-xl hover:scale-105 transition-transform cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        <h3 className="font-semibold text-slate-900 ">Cẩm nang thành viên</h3>
                      </div>
                      <p className="text-sm text-slate-600 ">
                        Tất cả về cách sử dụng platform hiệu quả
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Contributors */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900  mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Người đóng góp hàng đầu
                </h3>
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={contributor.avatar} 
                          alt={contributor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900  text-sm">
                            {contributor.name}
                          </h4>
                          {contributor.verified && (
                            <Badge variant="secondary" className="text-xs glass-subtle">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 ">
                          <span>@{contributor.username}</span>
                          <span>•</span>
                          <span>{contributor.contributions} đóng góp</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900  mb-4">Hành động nhanh</h3>
                <div className="space-y-3">
                  <Link href="/contribute/new-place">
                    <Button variant="secondary" className="w-full glass-subtle justify-start">
                      <MapPin className="w-4 h-4 mr-3" />
                      Thêm địa điểm mới
                    </Button>
                  </Link>
                  
                  <Link href="/itineraries/builder">
                    <Button variant="secondary" className="w-full glass-subtle justify-start">
                      <Calendar className="w-4 h-4 mr-3" />
                      Tạo lịch trình
                    </Button>
                  </Link>
                  
                  <Link href="/community/guidelines">
                    <Button variant="secondary" className="w-full glass-subtle justify-start">
                      <BookOpen className="w-4 h-4 mr-3" />
                      Đọc hướng dẫn
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Community Highlights */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900  mb-4">Nổi bật tuần này</h3>
                <div className="space-y-4">
                  <div className="glass-subtle p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-slate-900 ">
                        Địa điểm được yêu thích nhất
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 ">
                      Phố cổ Hội An với 1,234 lượt thích
                    </p>
                  </div>
                  
                  <div className="glass-subtle p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-slate-900 ">
                        Lịch trình hot nhất
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 ">
                      "Miền Trung 7 ngày" bởi @travel_explorer
                    </p>
                  </div>
                  
                  <div className="glass-subtle p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-slate-900 ">
                        Xu hướng tìm kiếm
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 ">
                      #DaLat #PhuQuoc #SaPa đang trending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

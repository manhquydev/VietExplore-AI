"use client"

import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

interface AnalyticsData {
  platformMetrics: {
    totalDestinations: number
    publishedContent: number
    pendingModeration: number
    hiddenContent: number
  }
  userGrowth: {
    newUsersThisMonth: number
    activeUsers: number
    retentionRate: number
    usersByRole: Array<{ role: string; count: number; percentage: number }>
  }
  moderationMetrics: {
    avgReviewTime: string
    approvalRate: number
    totalReviews: number
    slaCompliance: number
  }
  trafficMetrics: {
    pageViews: number
    uniqueVisitors: number
    avgSessionDuration: string
    topPages: Array<{ page: string; views: number }>
  }
}

export default function AdminAnalyticsPage() {
  const { user, profile, loading: authLoading } = useFirebaseAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (!profile || profile.role !== 'admin') {
      router.push('/')
      return
    }

    loadAnalyticsData()
  }, [user, profile, authLoading, router])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // For now, using mock data - can be replaced with real Firebase Functions calls
      const mockData: AnalyticsData = {
        platformMetrics: {
          totalDestinations: 1247,
          publishedContent: 1189,
          pendingModeration: 38,
          hiddenContent: 20
        },
        userGrowth: {
          newUsersThisMonth: 156,
          activeUsers: 892,
          retentionRate: 73.5,
          usersByRole: [
            { role: 'traveler', count: 723, percentage: 81.1 },
            { role: 'contributor', count: 89, percentage: 10.0 },
            { role: 'partner', count: 67, percentage: 7.5 },
            { role: 'moderator', count: 10, percentage: 1.1 },
            { role: 'admin', count: 3, percentage: 0.3 }
          ]
        },
        moderationMetrics: {
          avgReviewTime: '2.4 giờ',
          approvalRate: 87.3,
          totalReviews: 234,
          slaCompliance: 94.2
        },
        trafficMetrics: {
          pageViews: 15480,
          uniqueVisitors: 3247,
          avgSessionDuration: '4m 32s',
          topPages: [
            { page: '/destinations/ha-long-bay', views: 1247 },
            { page: '/destinations/hoi-an', views: 986 },
            { page: '/destinations/da-lat', views: 823 },
            { page: '/itinerary-builder', views: 672 },
            { page: '/destinations/sapa', views: 543 }
          ]
        }
      }

      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">Đang tải dữ liệu phân tích...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center text-red-600">Không có quyền truy cập</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">Không thể tải dữ liệu phân tích</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Analytics Dashboard</h1>
            <p className="text-muted mt-2">
              Theo dõi và phân tích hiệu suất nền tảng
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="danger">
              <Icon name="shield" className="mr-1" />
              Admin Access
            </Badge>
            <Button variant="secondary">
              <Icon name="share" className="mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Platform Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="bar-chart" />
              Thống kê nền tảng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{analyticsData.platformMetrics.totalDestinations}</div>
                <div className="text-sm text-muted">Tổng địa điểm</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analyticsData.platformMetrics.publishedContent}</div>
                <div className="text-sm text-muted">Nội dung đã xuất bản</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{analyticsData.platformMetrics.pendingModeration}</div>
                <div className="text-sm text-muted">Chờ duyệt</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{analyticsData.platformMetrics.hiddenContent}</div>
                <div className="text-sm text-muted">Nội dung bị ẩn</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="users" />
                Tăng trưởng người dùng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.userGrowth.newUsersThisMonth}</div>
                    <div className="text-xs text-muted">Người dùng mới tháng này</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{analyticsData.userGrowth.activeUsers}</div>
                    <div className="text-xs text-muted">Người dùng hoạt động</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{analyticsData.userGrowth.retentionRate}%</div>
                    <div className="text-xs text-muted">Tỷ lệ giữ chân</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Phân bố theo vai trò:</h4>
                  {analyticsData.userGrowth.usersByRole.map((item) => (
                    <div key={item.role} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{item.role}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.count}</span>
                        <span className="text-xs text-muted">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="shield" />
                Hiệu suất kiểm duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.moderationMetrics.avgReviewTime}</div>
                    <div className="text-xs text-muted">Thời gian duyệt trung bình</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{analyticsData.moderationMetrics.approvalRate}%</div>
                    <div className="text-xs text-muted">Tỷ lệ phê duyệt</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tổng số đánh giá:</span>
                    <span className="font-semibold">{analyticsData.moderationMetrics.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tuân thủ SLA:</span>
                    <span className="font-semibold text-green-600">{analyticsData.moderationMetrics.slaCompliance}%</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Badge variant={analyticsData.moderationMetrics.slaCompliance >= 95 ? "success" : "warning"}>
                    {analyticsData.moderationMetrics.slaCompliance >= 95 ? "SLA Tốt" : "Cần cải thiện SLA"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="activity" />
              Lưu lượng truy cập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Thống kê tổng quan</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-blue-600">{analyticsData.trafficMetrics.pageViews.toLocaleString()}</div>
                    <div className="text-xs text-muted">Lượt xem trang</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">{analyticsData.trafficMetrics.uniqueVisitors.toLocaleString()}</div>
                    <div className="text-xs text-muted">Khách truy cập duy nhất</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600">{analyticsData.trafficMetrics.avgSessionDuration}</div>
                    <div className="text-xs text-muted">Thời gian phiên trung bình</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Trang được xem nhiều nhất</h4>
                <div className="space-y-2">
                  {analyticsData.trafficMetrics.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-200 rounded px-2 py-1">{index + 1}</span>
                        <span className="text-sm">{page.page}</span>
                      </div>
                      <span className="text-sm font-semibold">{page.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="share" />
              Xuất dữ liệu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="secondary" className="w-full">
                Xuất PDF tổng quan
              </Button>
              <Button variant="secondary" className="w-full">
                Xuất Excel chi tiết
              </Button>
              <Button variant="secondary" className="w-full">
                Dữ liệu người dùng
              </Button>
              <Button variant="secondary" className="w-full">
                Báo cáo kiểm duyệt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}

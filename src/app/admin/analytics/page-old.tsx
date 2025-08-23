// src/app/admin/analytics/page.tsx
"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Eye,
  Flag
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getUserRole, hasPermission } from "@/lib/rbac"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"
import { redirect } from "next/navigation"

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalPlaces: number
    totalItineraries: number
    totalReports: number
    activeUsers: number
    pendingModerations: number
  }
  userGrowth: {
    daily: number[]
    weekly: number[]
    monthly: number[]
  }
  contentStats: {
    placesPublished: number
    itinerariesCreated: number
    moderationsPending: number
    reportsClosed: number
  }
  platformHealth: {
    uptime: number
    responseTime: number
    errorRate: number
    lastUpdated: string
  }
  topContent: {
    mostViewedPlaces: Array<{id: string, title: string, views: number}>
    mostSharedItineraries: Array<{id: string, title: string, shares: number}>
    mostReportedContent: Array<{id: string, title: string, reports: number}>
  }
  moderationMetrics: {
    averageResponseTime: number
    approvalRate: number
    rejectionRate: number
    slaCompliance: number
  }
}

// Firebase Functions
const getAnalyticsData = httpsCallable(functions, 'getAnalyticsData')
const exportAnalytics = httpsCallable(functions, 'exportAnalytics')
const getSLAMetrics = httpsCallable(functions, 'getSLAMetrics')

export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [timeRange, setTimeRange] = React.useState('7d')

  const userRole = getUserRole(user)
  const canViewAnalytics = hasPermission(userRole, 'admin.view_audit_logs')

  React.useEffect(() => {
    if (!user || !canViewAnalytics) {
      redirect('/auth/login')
      return
    }
    loadAnalyticsData()
  }, [user, canViewAnalytics, timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Load analytics data
      const analyticsResult = await getAnalyticsData({ timeRange })
      const data = (analyticsResult.data as any) || {}
      
      // Load SLA metrics
      const slaResult = await getSLAMetrics({ timeRange })
      const slaData = (slaResult.data as any) || {}

      // Mock data for demonstration - replace with real data
      setAnalytics({
        overview: {
          totalUsers: data.totalUsers || 1250,
          totalPlaces: data.totalPlaces || 456,
          totalItineraries: data.totalItineraries || 789,
          totalReports: data.totalReports || 23,
          activeUsers: data.activeUsers || 245,
          pendingModerations: data.pendingModerations || 12
        },
        userGrowth: {
          daily: data.userGrowth?.daily || [10, 15, 8, 22, 18, 25, 14],
          weekly: data.userGrowth?.weekly || [45, 62, 38, 71, 55],
          monthly: data.userGrowth?.monthly || [120, 180, 165, 220]
        },
        contentStats: {
          placesPublished: data.contentStats?.placesPublished || 34,
          itinerariesCreated: data.contentStats?.itinerariesCreated || 67,
          moderationsPending: data.contentStats?.moderationsPending || 12,
          reportsClosed: data.contentStats?.reportsClosed || 8
        },
        platformHealth: {
          uptime: data.platformHealth?.uptime || 99.9,
          responseTime: data.platformHealth?.responseTime || 245,
          errorRate: data.platformHealth?.errorRate || 0.1,
          lastUpdated: data.platformHealth?.lastUpdated || new Date().toISOString()
        },
        topContent: {
          mostViewedPlaces: data.topContent?.mostViewedPlaces || [
            { id: '1', title: 'Vịnh Hạ Long', views: 12500 },
            { id: '2', title: 'Phố cổ Hội An', views: 9800 },
            { id: '3', title: 'TP.HCM', views: 8700 }
          ],
          mostSharedItineraries: data.topContent?.mostSharedItineraries || [
            { id: '1', title: 'Hà Nội - Sa Pa 5 ngày', shares: 456 },
            { id: '2', title: 'Miền Tây 3 ngày', shares: 342 },
            { id: '3', title: 'Đà Nẵng - Hội An', shares: 298 }
          ],
          mostReportedContent: data.topContent?.mostReportedContent || [
            { id: '1', title: 'Địa điểm X', reports: 5 },
            { id: '2', title: 'Lịch trình Y', reports: 3 },
            { id: '3', title: 'Bài viết Z', reports: 2 }
          ]
        },
        moderationMetrics: {
          averageResponseTime: slaData.averageResponseTime || 4.2,
          approvalRate: slaData.approvalRate || 78.5,
          rejectionRate: slaData.rejectionRate || 15.2,
          slaCompliance: slaData.slaCompliance || 94.8
        }
      })

    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportAnalytics = async () => {
    try {
      const result = await exportAnalytics({ timeRange, format: 'csv' })
      // Handle download - mock implementation
      console.log('Exporting analytics:', result.data)
    } catch (error) {
      console.error('Error exporting analytics:', error)
    }
  }

  if (!user || !canViewAnalytics) {
    return null
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">Đang tải dữ liệu thống kê...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted">
              Thống kê và phân tích hoạt động nền tảng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 giờ</SelectItem>
                <SelectItem value="7d">7 ngày</SelectItem>
                <SelectItem value="30d">30 ngày</SelectItem>
                <SelectItem value="90d">3 tháng</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={loadAnalyticsData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button variant="primary" onClick={handleExportAnalytics}>
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted">Tổng người dùng</p>
                  <p className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted">Địa điểm</p>
                  <p className="text-2xl font-bold">{analytics.overview.totalPlaces.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted">Lịch trình</p>
                  <p className="text-2xl font-bold">{analytics.overview.totalItineraries.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted">Hoạt động</p>
                  <p className="text-2xl font-bold">{analytics.overview.activeUsers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted">Chờ duyệt</p>
                  <p className="text-2xl font-bold">{analytics.overview.pendingModerations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted">Báo cáo</p>
                  <p className="text-2xl font-bold">{analytics.overview.totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Thống kê nội dung ({timeRange})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Địa điểm được xuất bản</span>
                <span className="font-bold text-green-600">+{analytics.contentStats.placesPublished}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Lịch trình được tạo</span>
                <span className="font-bold text-blue-600">+{analytics.contentStats.itinerariesCreated}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Kiểm duyệt đang chờ</span>
                <span className="font-bold text-yellow-600">{analytics.contentStats.moderationsPending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Báo cáo đã xử lý</span>
                <span className="font-bold text-purple-600">{analytics.contentStats.reportsClosed}</span>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Hiệu suất kiểm duyệt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Thời gian phản hồi trung bình</span>
                <Badge variant="success">{analytics.moderationMetrics.averageResponseTime}h</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Tỷ lệ phê duyệt</span>
                <Badge variant="success">{analytics.moderationMetrics.approvalRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Tỷ lệ từ chối</span>
                <Badge variant="warning">{analytics.moderationMetrics.rejectionRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Tuân thủ SLA</span>
                <Badge variant="success">{analytics.moderationMetrics.slaCompliance}%</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Tình trạng hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Uptime</span>
                <Badge variant="success">{analytics.platformHealth.uptime}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Thời gian phản hồi</span>
                <Badge variant="default">{analytics.platformHealth.responseTime}ms</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Tỷ lệ lỗi</span>
                <Badge variant="success">{analytics.platformHealth.errorRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Cập nhật lần cuối</span>
                <span className="text-sm text-muted">
                  {new Date(analytics.platformHealth.lastUpdated).toLocaleString('vi-VN')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Top Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Nội dung nổi bật
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Địa điểm xem nhiều nhất</h4>
                {analytics.topContent.mostViewedPlaces.map((place, index) => (
                  <div key={place.id} className="flex justify-between text-sm">
                    <span>{index + 1}. {place.title}</span>
                    <span className="text-muted">{place.views.toLocaleString()} lượt xem</span>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Lịch trình chia sẻ nhiều</h4>
                {analytics.topContent.mostSharedItineraries.map((itinerary, index) => (
                  <div key={itinerary.id} className="flex justify-between text-sm">
                    <span>{index + 1}. {itinerary.title}</span>
                    <span className="text-muted">{itinerary.shares} lượt chia sẻ</span>
                  </div>
                ))}
              </div>

              {analytics.topContent.mostReportedContent.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Nội dung bị báo cáo</h4>
                  {analytics.topContent.mostReportedContent.map((content, index) => (
                    <div key={content.id} className="flex justify-between text-sm">
                      <span>{index + 1}. {content.title}</span>
                      <span className="text-red-500">{content.reports} báo cáo</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Growth Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tăng trưởng người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-muted">Biểu đồ tăng trưởng sẽ được hiển thị ở đây</p>
              <p className="text-xs text-muted ml-2">
                (Có thể tích hợp Chart.js hoặc Recharts)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}

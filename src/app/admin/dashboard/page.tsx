"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/useAuth"
import { MOCK_USERS } from "@/lib/mock-data"
import { Icon } from "@/components/ui/icon"
import { redirect } from "next/navigation"

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()

  // Check admin permissions
  const isAdmin = user?.role === 'admin'

  if (!isAuthenticated || !isAdmin) {
    redirect('/auth/login')
  }

  const stats = {
    totalUsers: MOCK_USERS.length,
    pendingReviews: 12,
    contentReports: 3,
    systemAlerts: 1
  }

  const recentActivities = [
    {
      id: "1",
      type: "user_registration",
      description: "Người dùng mới đăng ký: Nguyễn Văn A",
      timestamp: "2 giờ trước",
      severity: "info"
    },
    {
      id: "2", 
      type: "content_approval",
      description: "Địa điểm 'Cầu Vàng Đà Nẵng' được phê duyệt",
      timestamp: "4 giờ trước",
      severity: "success"
    },
    {
      id: "3",
      type: "system_alert",
      description: "Cảnh báo: Lượng truy cập tăng cao bất thường",
      timestamp: "6 giờ trước", 
      severity: "warning"
    }
  ]

  const usersByRole = React.useMemo(() => {
    const counts = MOCK_USERS.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return [
      { role: "guest", label: "Khách vãng lai", count: counts.guest || 0 },
      { role: "traveler", label: "Du khách", count: counts.traveler || 0 },
      { role: "contributor", label: "Cộng tác viên", count: counts.contributor || 0 },
      { role: "partner", label: "Đối tác", count: counts.partner || 0 },
      { role: "moderator", label: "Kiểm duyệt viên", count: counts.moderator || 0 },
      { role: "admin", label: "Quản trị viên", count: counts.admin || 0 }
    ]
  }, [])

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-muted mt-2">
            Quản lý hệ thống và giám sát hoạt động nền tảng
          </p>
        </div>
        <Badge variant="destructive" className="text-sm">
          <Icon name="shield" className="mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Icon name="users" className="text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted">+2 người dùng tuần này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Icon name="clock" className="text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted">Nội dung cần xem xét</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Báo cáo</CardTitle>
            <Icon name="flag" className="text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentReports}</div>
            <p className="text-xs text-muted">Báo cáo vi phạm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo hệ thống</CardTitle>
            <Icon name="alert-triangle" className="text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemAlerts}</div>
            <p className="text-xs text-muted">Cần xem xét ngay</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="users" />
              Quản lý người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usersByRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="min-w-[100px] justify-center">
                      {item.label}
                    </Badge>
                    <span className="text-sm text-muted">{item.count} người</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Quản lý
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Button className="w-full">
                <Icon name="user-plus" className="mr-2" />
                Tạo tài khoản mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="activity" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.severity === 'success' ? 'bg-green-500' :
                    activity.severity === 'warning' ? 'bg-yellow-500' :
                    activity.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-text">{activity.description}</p>
                    <p className="text-xs text-muted">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Button variant="outline" className="w-full">
                Xem tất cả hoạt động
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="zap" />
            Hành động nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline">
              Duyệt nội dung
            </Button>
            <Button variant="outline">
              Quản lý người dùng
            </Button>
            <Button variant="outline">
              Xem thống kê
            </Button>
            <Button variant="outline">
              Cài đặt hệ thống
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Icon name="alert-triangle" />
            Hành động khẩn cấp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="destructive">
              Ẩn nội dung ngay
            </Button>
            <Button variant="destructive">
              Khóa tài khoản
            </Button>
            <Button variant="destructive">
              Bảo trì hệ thống
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      
      <Footer />
    </div>
  )
}

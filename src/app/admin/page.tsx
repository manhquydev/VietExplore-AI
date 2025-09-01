"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { adminIcons } from "@/lib/admin/icon-system"
import { adminClasses } from "@/lib/admin/theme-utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminStats, useModerationQueue, useAdminUsers, useAdminPlaces } from "@/hooks/use-admin"
import { useToast } from "@/components/providers/toast-provider"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AdminMetricSkeleton, AdminLoading, AdminErrorState } from "@/components/admin/loading-states"
import { AdminConfirmDialog } from "@/components/admin/confirmation-dialogs"

export default function AdminOverviewPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Real data hooks
  const { stats, loading: statsLoading } = useAdminStats()
  const { items: pendingReviews, loading: moderationLoading, error: moderationError } = useModerationQueue({ status: 'pending' })
  const { users, loading: usersLoading, error: usersError } = useAdminUsers({ limit: 10 })
  const { places, loading: placesLoading, error: placesError } = useAdminPlaces({ limit: 10 })
  
  const isLoading = statsLoading || moderationLoading || usersLoading || placesLoading
  const hasError = moderationError || usersError || placesError
  
  // Show detailed errors if any
  React.useEffect(() => {
    if (hasError) {
      toast.error(`Admin data loading error: ${moderationError || usersError || placesError}`)
    }
  }, [hasError, moderationError, usersError, placesError, toast])
  
  // Calculate metrics from real data
  const metrics = {
    totalUsers: stats.totalUsers || 0,
    totalPlaces: stats.totalPlaces || 0,
    pendingReviews: pendingReviews?.length || 0,
    systemHealth: stats.systemHealth || 95.0,
    userGrowth: stats.userGrowth || 0,
    placeGrowth: stats.placeGrowth || 0
  }
  
  const pendingActions = [
    {
      id: 1,
      title: "Địa điểm chờ duyệt", 
      count: metrics.pendingReviews,
      priority: metrics.pendingReviews > 20 ? "high" : metrics.pendingReviews > 10 ? "medium" : "low",
      href: "/admin/moderation?status=pending"
    },
    {
      id: 2,
      title: "Người dùng chưa xác minh",
      count: users?.filter(u => !u.verified).length || 0,
      priority: "medium",
      href: "/admin/users?filter=unverified" 
    },
    {
      id: 3,
      title: "Địa điểm mới",
      count: places?.filter(p => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return new Date(p.createdAt) > dayAgo
      }).length || 0,
      priority: "low",
      href: "/admin/analytics"
    }
  ]

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatGrowth = (growth: number) => {
    return growth > 0 ? `+${growth}%` : `${growth}%`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registration": return <Users className="h-4 w-4 text-blue-600" />
      case "place_submitted": return <MapPin className="h-4 w-4 text-green-600" />
      case "review_completed": return <CheckCircle className="h-4 w-4 text-purple-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low": return "bg-gray-100 text-gray-700 border-gray-200"
      default: return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tổng quan</h1>
            <p className="text-sm md:text-base text-gray-600">Theo dõi các chỉ số chính và hoạt động gần đây của nền tảng</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs md:text-sm text-green-600 font-medium">Hệ thống hoạt động tốt</span>
          </div>
        </div>
        {hasError && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-semibold">Một số dữ liệu không thể tải</p>
                <p className="text-red-700 text-sm mt-1">Vui lòng kiểm tra kết nối mạng hoặc thử lại sau</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Professional Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Metric - Professional */}
          <Card className="admin-card group">
            <CardContent className="admin-card-content">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="admin-caption-text uppercase tracking-wider font-semibold mb-2">Tổng người dùng</p>
                  <p className="text-3xl font-bold text-admin-neutral-900 mb-1">
                    {isLoading ? (
                      <AdminLoading size="lg" inline />
                    ) : (
                      formatNumber(metrics.totalUsers)
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-600 to-admin-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <adminIcons.navigation.users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-admin-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${metrics.userGrowth > 0 ? 'bg-admin-success-600' : 'bg-admin-error-600'}`} />
                  <span className={`text-sm font-semibold ${metrics.userGrowth > 0 ? 'text-admin-success-700' : 'text-admin-error-700'}`}>
                    {isLoading ? '...' : `${metrics.userGrowth > 0 ? '+' : ''}${metrics.userGrowth.toFixed(1)}%`}
                  </span>
                </div>
                <span className="admin-caption-text">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>

          {/* Places Metric - Professional */}
          <Card className="admin-card group">
            <CardContent className="admin-card-content">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="admin-caption-text uppercase tracking-wider font-semibold mb-2">Tổng địa điểm</p>
                  <p className="text-3xl font-bold text-admin-neutral-900 mb-1">
                    {isLoading ? (
                      <AdminLoading size="lg" inline />
                    ) : (
                      formatNumber(metrics.totalPlaces)
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-success-600 to-admin-success-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <adminIcons.content.location className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-admin-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${metrics.placeGrowth > 0 ? 'bg-admin-success-600' : 'bg-admin-error-600'}`} />
                  <span className={`text-sm font-semibold ${metrics.placeGrowth > 0 ? 'text-admin-success-700' : 'text-admin-error-700'}`}>
                    {isLoading ? '...' : `${metrics.placeGrowth > 0 ? '+' : ''}${metrics.placeGrowth.toFixed(1)}%`}
                  </span>
                </div>
                <span className="admin-caption-text">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Reviews Metric - Alert Style */}
          <Card className={`admin-card group ${metrics.pendingReviews > 10 ? 'border-l-4 border-l-admin-warning-500 bg-admin-warning-50' : ''}`}>
            <CardContent className="admin-card-content">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="admin-caption-text uppercase tracking-wider font-semibold mb-2">Đang chờ duyệt</p>
                  <p className="text-3xl font-bold text-admin-neutral-900 mb-1">
                    {isLoading ? (
                      <AdminLoading size="lg" inline />
                    ) : (
                      <span className={metrics.pendingReviews > 10 ? 'text-admin-warning-700' : 'text-admin-neutral-900'}>
                        {metrics.pendingReviews}
                      </span>
                    )}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 ${
                  metrics.pendingReviews > 10 
                    ? 'bg-gradient-to-br from-admin-warning-600 to-admin-warning-700' 
                    : 'bg-gradient-to-br from-admin-info-600 to-admin-info-700'
                }`}>
                  <adminIcons.status.pending className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-admin-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-admin-info-700">
                    {pendingReviews?.filter(item => {
                      const today = new Date().toDateString()
                      return new Date(item.submittedAt).toDateString() === today
                    }).length || 0}
                  </span>
                  <span className="admin-caption-text">hôm nay</span>
                </div>
                {metrics.pendingReviews > 10 && (
                  <Badge className="admin-status-warning text-xs px-2 py-1">
                    Cần chú ý
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Health Metric - With Progress */}
          <Card className="admin-card group">
            <CardContent className="admin-card-content">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="admin-caption-text uppercase tracking-wider font-semibold mb-2">Tình trạng hệ thống</p>
                  <p className="text-3xl font-bold text-admin-neutral-900 mb-1">
                    {metrics.systemHealth}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-600 to-admin-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <adminIcons.navigation.analytics className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-admin-neutral-100 space-y-2">
                <Progress value={metrics.systemHealth} className="h-2 bg-admin-neutral-200">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    metrics.systemHealth >= 99 
                      ? 'bg-admin-success-600' 
                      : metrics.systemHealth >= 95 
                        ? 'bg-admin-warning-600' 
                        : 'bg-admin-error-600'
                  }`}></div>
                </Progress>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${
                    metrics.systemHealth >= 99 
                      ? 'text-admin-success-700' 
                      : metrics.systemHealth >= 95 
                        ? 'text-admin-warning-700' 
                        : 'text-admin-error-700'
                  }`}>
                    {metrics.systemHealth >= 99 ? 'Hoạt động tốt' : metrics.systemHealth >= 95 ? 'Ổn định' : 'Cần kiểm tra'}
                  </span>
                  <span className="admin-caption-text">
                    Uptime {metrics.systemHealth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Professional Recent Activity */}
          <Card className="admin-card group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-admin-primary-100 rounded-lg flex items-center justify-center">
                    <adminIcons.navigation.analytics className="h-4 w-4 text-admin-primary-700" />
                  </div>
                  <span className="admin-section-title">Hoạt động gần đây</span>
                </div>
                <Badge className="admin-status-success text-xs px-2 py-1">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-admin-neutral-50">
                        <AdminLoading size="base" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-admin-neutral-200 rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-admin-neutral-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                        <div className="h-3 bg-admin-neutral-200 rounded w-16 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : hasError ? (
                  <AdminErrorState
                    title="Không thể tải hoạt động"
                    description="Vui lòng thử lại sau hoặc liên hệ quản trị viên."
                  />
                ) : (
                  <>
                    {/* Recent Users - Clean Design */}
                    {users?.slice(0, 3).map((user, index) => (
                      <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl bg-admin-primary-50 border border-admin-primary-100 hover:bg-admin-primary-100 hover:border-admin-primary-200 transition-all duration-200">
                        <div className="h-10 w-10 bg-gradient-to-br from-admin-primary-600 to-admin-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <adminIcons.navigation.users className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="admin-body-text font-semibold text-admin-neutral-900 truncate">
                            {user.fullName}
                          </p>
                          <p className="admin-caption-text">
                            Tham gia với vai trò <span className="font-semibold text-admin-primary-700">{user.role}</span>
                          </p>
                        </div>
                        <div className="admin-caption-text flex-shrink-0 font-medium">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                    {/* Recent Places - Clean Design */}
                    {places?.slice(0, 2).map((place, index) => (
                      <div key={place.id} className="flex items-center gap-4 p-4 rounded-xl bg-admin-success-50 border border-admin-success-100 hover:bg-admin-success-100 hover:border-admin-success-200 transition-all duration-200">
                        <div className="h-10 w-10 bg-gradient-to-br from-admin-success-600 to-admin-success-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <adminIcons.content.location className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="admin-body-text font-semibold text-admin-neutral-900 truncate">
                            {place.name}
                          </p>
                          <p className="admin-caption-text">
                            Địa điểm mới được thêm
                          </p>
                        </div>
                        <div className="admin-caption-text flex-shrink-0 font-medium">
                          {new Date(place.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-admin-neutral-100">
                <Button variant="ghost" size="sm" className="admin-btn-ghost w-full hover:bg-admin-primary-50 hover:text-admin-primary-700 transition-colors" asChild>
                  <Link href="/admin/analytics" className="flex items-center justify-center gap-2">
                    Xem tất cả hoạt động
                    <adminIcons.content.external className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professional Pending Actions */}
          <Card className="admin-card group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-admin-warning-100 rounded-lg flex items-center justify-center">
                    <adminIcons.status.warning className="h-4 w-4 text-admin-warning-700" />
                  </div>
                  <span className="admin-section-title">Hành động chờ xử lý</span>
                </div>
                <Badge className="admin-status-warning text-xs px-2 py-1">
                  Cần xử lý
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {pendingActions.map((action) => (
                  <Link 
                    key={action.id}
                    href={action.href}
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl border border-admin-neutral-200 hover:border-admin-primary-300 hover:bg-admin-primary-50 transition-all duration-200 group-hover:shadow-sm">
                      <div className="flex items-center gap-3">
                        <Badge className={cn("font-semibold px-3 py-1 rounded-full transition-colors", getPriorityColor(action.priority))}>
                          {action.count}
                        </Badge>
                        <span className="admin-body-text font-medium text-admin-neutral-900 group-hover:text-admin-primary-900">
                          {action.title}
                        </span>
                      </div>
                      <div className="flex items-center admin-caption-text group-hover:text-admin-primary-600 transition-colors">
                        <span className="mr-2">Xem</span>
                        <adminIcons.content.external className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Quick Actions */}
        <Card className="admin-card group">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3">
              <div className="h-8 w-8 bg-admin-primary-100 rounded-lg flex items-center justify-center">
                <adminIcons.actions.view className="h-4 w-4 text-admin-primary-700" />
              </div>
              <span className="admin-section-title">Hành động nhanh</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Moderation Queue Action */}
              <Link href="/admin/moderation" className="block group">
                <div className={cn(
                  "admin-card border-2 p-6 text-center space-y-4 transition-all duration-200 group-hover:shadow-lg",
                  metrics.pendingReviews > 10 
                    ? "border-admin-warning-300 bg-gradient-to-br from-admin-warning-50 to-admin-warning-100 hover:border-admin-warning-400" 
                    : "border-admin-primary-300 bg-gradient-to-br from-admin-primary-50 to-admin-primary-100 hover:border-admin-primary-400"
                )}>
                  <div className="relative mx-auto w-fit">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110",
                      metrics.pendingReviews > 10 
                        ? "bg-admin-warning-600 shadow-lg shadow-admin-warning-200" 
                        : "bg-admin-primary-600 shadow-lg shadow-admin-primary-200"
                    )}>
                      <adminIcons.navigation.moderation className="h-6 w-6 text-white" />
                    </div>
                    {metrics.pendingReviews > 10 && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-admin-error-500 rounded-full animate-pulse border-2 border-white"></div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="admin-card-title text-admin-neutral-900">Hàng đợi duyệt</div>
                    <div className="admin-body-text">
                      <span className="font-bold text-lg">{metrics.pendingReviews}</span> mục chờ xử lý
                    </div>
                  </div>
                </div>
              </Link>

              {/* User Management Action */}
              <Link href="/admin/users" className="block group">
                <div className="admin-card border-2 border-admin-success-300 bg-gradient-to-br from-admin-success-50 to-admin-success-100 hover:border-admin-success-400 p-6 text-center space-y-4 transition-all duration-200 group-hover:shadow-lg">
                  <div className="h-12 w-12 bg-admin-success-600 rounded-xl flex items-center justify-center mx-auto transition-all duration-200 group-hover:scale-110 shadow-lg shadow-admin-success-200">
                    <adminIcons.navigation.users className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="admin-card-title text-admin-neutral-900">Quản lý người dùng</div>
                    <div className="admin-body-text">
                      <span className="font-bold text-lg text-admin-success-700">{formatNumber(metrics.totalUsers)}</span> tổng người dùng
                    </div>
                  </div>
                </div>
              </Link>

              {/* Analytics Action */}
              <Link href="/admin/analytics" className="block group sm:col-span-2 lg:col-span-1">
                <div className="admin-card border-2 border-admin-info-300 bg-gradient-to-br from-admin-info-50 to-admin-info-100 hover:border-admin-info-400 p-6 text-center space-y-4 transition-all duration-200 group-hover:shadow-lg">
                  <div className="h-12 w-12 bg-admin-info-600 rounded-xl flex items-center justify-center mx-auto transition-all duration-200 group-hover:scale-110 shadow-lg shadow-admin-info-200">
                    <adminIcons.navigation.analytics className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="admin-card-title text-admin-neutral-900">Xem thống kê</div>
                    <div className="admin-body-text">
                      Thông tin chi tiết nền tảng
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
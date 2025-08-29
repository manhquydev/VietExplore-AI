"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  MapPin,
  FileCheck,
  AlertCircle,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Play
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminStats, useModerationQueue, useAdminUsers, useAdminPlaces } from "@/hooks/use-admin"
import { useToast } from "@/components/providers/toast-provider"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Tổng người dùng</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 md:h-8 w-12 md:w-16 rounded"></div>
                    ) : (
                      <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                        {formatNumber(metrics.totalUsers)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
              <div className="mt-3 md:mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-emerald-500 mr-1" />
                  <span className="text-xs md:text-sm font-semibold text-emerald-600">
                    {isLoading ? '...' : `${metrics.userGrowth > 0 ? '+' : ''}${metrics.userGrowth.toFixed(1)}%`}
                  </span>
                </div>
                <span className="text-xs text-gray-500">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Tổng địa điểm</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 md:h-8 w-12 md:w-16 rounded"></div>
                    ) : (
                      <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                        {formatNumber(metrics.totalPlaces)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
              <div className="mt-3 md:mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-emerald-500 mr-1" />
                  <span className="text-xs md:text-sm font-semibold text-emerald-600">
                    {isLoading ? '...' : `${metrics.placeGrowth > 0 ? '+' : ''}${metrics.placeGrowth.toFixed(1)}%`}
                  </span>
                </div>
                <span className="text-xs text-gray-500">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-amber-400">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Đang chờ duyệt</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 md:h-8 w-12 md:w-16 rounded"></div>
                    ) : (
                      <span className={`${metrics.pendingReviews > 10 ? 'text-amber-600' : 'text-gray-900'} font-bold`}>
                        {metrics.pendingReviews}
                      </span>
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
              <div className="mt-3 md:mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs md:text-sm font-semibold text-amber-700">
                    {pendingReviews?.filter(item => {
                      const today = new Date().toDateString()
                      return new Date(item.submittedAt).toDateString() === today
                    }).length || 0}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">hôm nay</span>
                </div>
                {metrics.pendingReviews > 10 && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    Cần chú ý
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Tình trạng hệ thống</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                      {metrics.systemHealth}%
                    </span>
                  </p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
              <div className="mt-3 md:mt-4 space-y-2">
                <Progress value={metrics.systemHealth} className="h-2 bg-gray-100">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"></div>
                </Progress>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-600">
                    Hoạt động tốt
                  </span>
                  <span className="text-xs text-gray-500">
                    Uptime {metrics.systemHealth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Hoạt động gần đây */}
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold">Hoạt động gần đây</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <RefreshCw className="animate-spin h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Đang tải hoạt động mới nhất...</p>
                  </div>
                ) : (
                  <>
                    {/* Recent Users */}
                    {users?.slice(0, 3).map((user, index) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-transparent border border-blue-100 hover:shadow-sm transition-all duration-200">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-600">
                            Tham gia với vai trò <span className="font-medium text-blue-600">{user.role}</span>
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 flex-shrink-0">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                    {/* Recent Places */}
                    {places?.slice(0, 2).map((place, index) => (
                      <div key={place.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-transparent border border-emerald-100 hover:shadow-sm transition-all duration-200">
                        <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium">
                            {place.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Địa điểm mới được thêm
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 flex-shrink-0">
                          {new Date(place.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button variant="ghost" size="sm" className="w-full hover:bg-blue-50 hover:text-blue-600 transition-colors" asChild>
                  <Link href="/admin/analytics">
                    Xem tất cả hoạt động
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hành động chờ xử lý */}
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-lg font-semibold">Hành động chờ xử lý</span>
                </div>
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  Cần xử lý
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {pendingActions.map((action) => (
                  <Link 
                    key={action.id}
                    href={action.href}
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group-hover:shadow-sm">
                      <div className="flex items-center gap-3">
                        <Badge className={cn("font-semibold transition-colors", getPriorityColor(action.priority))}>
                          {action.count}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                          {action.title}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 group-hover:text-blue-600">
                        <span className="mr-1">Xem</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hành động nhanh */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold">Hành động nhanh</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button asChild className={cn(
                "h-auto p-6 flex-col gap-4 group transition-all duration-200 hover:shadow-lg",
                metrics.pendingReviews > 10 ? "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" :
                "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              )}>
                <Link href="/admin/moderation">
                  <div className="relative">
                    <FileCheck className="h-8 w-8 group-hover:scale-110 transition-transform" />
                    {metrics.pendingReviews > 10 && (
                      <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="text-center space-y-1">
                    <div className="font-semibold text-base">Hàng đợi duyệt</div>
                    <div className="text-sm opacity-90">
                      <span className="font-bold">{metrics.pendingReviews}</span> mục chờ xử lý
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-6 flex-col gap-4 group border-2 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                <Link href="/admin/users">
                  <Users className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div className="text-center space-y-1">
                    <div className="font-semibold text-base text-gray-900">Quản lý người dùng</div>
                    <div className="text-sm text-gray-600">
                      <span className="font-bold text-blue-600">{formatNumber(metrics.totalUsers)}</span> tổng người dùng
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-6 flex-col gap-4 group border-2 hover:border-purple-300 hover:shadow-lg transition-all duration-200 sm:col-span-2 lg:col-span-1">
                <Link href="/admin/analytics">
                  <Activity className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                  <div className="text-center space-y-1">
                    <div className="font-semibold text-base text-gray-900">Xem thống kê</div>
                    <div className="text-sm text-gray-600">
                      Thông tin chi tiết nền tảng
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
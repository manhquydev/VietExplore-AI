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
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AdminMetricSkeleton, AdminErrorState } from "@/components/admin/loading-states"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { 
  Users, MapPin, Eye, CheckCircle, Activity, AlertCircle, RefreshCw,
  TrendingUp, TrendingDown, ArrowUp, ArrowDown, MoreHorizontal, 
  Calendar, Clock, Star, Shield, BarChart3
} from "lucide-react"

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
      toast({
        title: "Lỗi tải dữ liệu",
        description: `${moderationError || usersError || placesError}`,
        variant: "destructive"
      })
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
    <div className="min-h-screen bg-gradient-to-br from-admin-neutral-50 via-white to-admin-primary-50/30">
      {/* Modern Header Section */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-admin-primary-600/5 via-admin-primary-500/3 to-admin-success-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-600 to-admin-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <adminIcons.navigation.dashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-admin-neutral-900 tracking-tight">
                    Tổng quan
                  </h1>
                  <p className="text-admin-neutral-600 mt-1">
                    Dashboard điều hành và phân tích hệ thống VietExplore AI
                  </p>
                </div>
              </div>
            </div>
            
            {/* System Status Indicator */}
            <div className="flex items-center gap-6">
              <div className="bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-3 w-3 bg-admin-success-500 rounded-full"></div>
                    <div className="absolute inset-0 h-3 w-3 bg-admin-success-500 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-admin-success-700">Hệ thống ổn định</div>
                    <div className="text-xs text-admin-neutral-500">Cập nhật {new Date().toLocaleTimeString('vi-VN')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error Alert - Modern Style */}
          {hasError && (
            <div className="mt-6 bg-white/80 backdrop-blur-sm border border-admin-error-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-admin-error-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-admin-error-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-admin-error-900 mb-1">Cảnh báo hệ thống</h3>
                  <p className="text-sm text-admin-error-700 mb-3">Một số dữ liệu không thể tải được. Điều này có thể ảnh hưởng đến độ chính xác của báo cáo.</p>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Thử lại
                    </Button>
                    <span className="text-xs text-admin-neutral-500">
                      Lần cập nhật cuối: {new Date().toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">
        
        {/* Key Performance Metrics - Modern Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Users Metric */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-primary-500/10 via-transparent to-admin-primary-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Người dùng
                  </p>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <div className="h-8 w-24 bg-admin-neutral-200 rounded animate-pulse"></div>
                    ) : (
                      <span className="text-3xl font-bold text-admin-neutral-900">
                        {formatNumber(metrics.totalUsers)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-500 to-admin-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metrics.userGrowth >= 0 ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-admin-success-50 rounded-full">
                      <TrendingUp className="h-3 w-3 text-admin-success-600" />
                      <span className="text-xs font-semibold text-admin-success-700">
                        +{metrics.userGrowth.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-admin-error-50 rounded-full">
                      <TrendingDown className="h-3 w-3 text-admin-error-600" />
                      <span className="text-xs font-semibold text-admin-error-700">
                        {metrics.userGrowth.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-admin-neutral-500">30 ngày</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Places Metric */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-success-500/10 via-transparent to-admin-success-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Địa điểm
                  </p>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <div className="h-8 w-24 bg-admin-neutral-200 rounded animate-pulse"></div>
                    ) : (
                      <span className="text-3xl font-bold text-admin-neutral-900">
                        {formatNumber(metrics.totalPlaces)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-success-500 to-admin-success-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metrics.placeGrowth >= 0 ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-admin-success-50 rounded-full">
                      <TrendingUp className="h-3 w-3 text-admin-success-600" />
                      <span className="text-xs font-semibold text-admin-success-700">
                        +{metrics.placeGrowth.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-admin-error-50 rounded-full">
                      <TrendingDown className="h-3 w-3 text-admin-error-600" />
                      <span className="text-xs font-semibold text-admin-error-700">
                        {metrics.placeGrowth.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-admin-neutral-500">30 ngày</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Reviews Metric */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className={`absolute inset-0 ${metrics.pendingReviews > 10 ? 'bg-gradient-to-br from-admin-warning-500/10 via-transparent to-admin-warning-600/5' : 'bg-gradient-to-br from-admin-info-500/10 via-transparent to-admin-info-600/5'}`}></div>
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Chờ duyệt
                  </p>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <div className="h-8 w-16 bg-admin-neutral-200 rounded animate-pulse"></div>
                    ) : (
                      <span className={`text-3xl font-bold ${metrics.pendingReviews > 10 ? 'text-admin-warning-700' : 'text-admin-neutral-900'}`}>
                        {metrics.pendingReviews}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 ${
                  metrics.pendingReviews > 10 
                    ? 'bg-gradient-to-br from-admin-warning-500 to-admin-warning-600' 
                    : 'bg-gradient-to-br from-admin-info-500 to-admin-info-600'
                }`}>
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-admin-info-50 rounded-full">
                    <Calendar className="h-3 w-3 text-admin-info-600" />
                    <span className="text-xs font-semibold text-admin-info-700">
                      {pendingReviews?.filter(item => {
                        const today = new Date().toDateString()
                        return new Date(item.submittedAt).toDateString() === today
                      }).length || 0} hôm nay
                    </span>
                  </div>
                </div>
                <span className="text-xs text-admin-neutral-500">Cần xử lý</span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Reviews Completed */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-primary-500/10 via-transparent to-admin-success-500/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Đã duyệt
                  </p>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <div className="h-8 w-20 bg-admin-neutral-200 rounded animate-pulse"></div>
                    ) : (
                      <span className="text-3xl font-bold text-admin-neutral-900">
                        {formatNumber(metrics.monthlyReviews || 0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-success-500 to-admin-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-admin-success-50 rounded-full">
                    <BarChart3 className="h-3 w-3 text-admin-success-600" />
                    <span className="text-xs font-semibold text-admin-success-700">
                      {Math.round((metrics.monthlyReviews || 0) / 30)} /ngày
                    </span>
                  </div>
                </div>
                <span className="text-xs text-admin-neutral-500">30 ngày</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Recent Activity Feed */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-admin-primary-500/5 via-transparent to-admin-info-500/5"></div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-admin-primary-500 to-admin-info-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-admin-neutral-900">Hoạt động gần đây</h2>
                      <p className="text-sm text-admin-neutral-600">Theo dõi các hành động mới nhất trên hệ thống</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-admin-success-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-admin-success-700">Live</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-admin-neutral-50 animate-pulse">
                        <div className="h-12 w-12 bg-admin-neutral-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-admin-neutral-200 rounded w-3/4"></div>
                          <div className="h-3 bg-admin-neutral-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-3 bg-admin-neutral-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Recent Users */}
                    {users?.slice(0, 3).map((user) => (
                      <div key={user.id} className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-admin-primary-50/50 to-admin-primary-100/30 border border-admin-primary-200/30 hover:shadow-md transition-all duration-200">
                        <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-500 to-admin-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-admin-neutral-900 truncate mb-1">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-admin-neutral-600">
                            Đã tham gia với vai trò <span className="font-medium text-admin-primary-700 capitalize">{user.role}</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-medium text-admin-neutral-500">
                            {new Date(user.createdAt).toLocaleDateString('vi-VN', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Recent Places */}
                    {places?.slice(0, 2).map((place) => (
                      <div key={place.id} className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-admin-success-50/50 to-admin-success-100/30 border border-admin-success-200/30 hover:shadow-md transition-all duration-200">
                        <div className="h-12 w-12 bg-gradient-to-br from-admin-success-500 to-admin-success-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-admin-neutral-900 truncate mb-1">
                            {place.name}
                          </p>
                          <p className="text-sm text-admin-neutral-600">
                            Địa điểm mới tại <span className="font-medium text-admin-success-700">{place.province}</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-medium text-admin-neutral-500">
                            {new Date(place.createdAt).toLocaleDateString('vi-VN', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-admin-neutral-200">
                      <Button variant="ghost" className="w-full text-admin-neutral-600 hover:text-admin-primary-600 hover:bg-admin-primary-50" asChild>
                        <Link href="/admin/activity">
                          <Activity className="h-4 w-4 mr-2" />
                          Xem tất cả hoạt động
                          <ArrowUp className="h-4 w-4 ml-2 rotate-45" />
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            
            {/* Quick Actions Card */}
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-admin-warning-500/5 via-transparent to-admin-success-500/5"></div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-admin-warning-500 to-admin-success-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-admin-neutral-900">Thao tác nhanh</h3>
                    <p className="text-sm text-admin-neutral-600">Các công cụ quản lý thường dùng</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative space-y-3">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-admin-primary-600 to-admin-primary-700 hover:from-admin-primary-700 hover:to-admin-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  asChild
                >
                  <Link href="/admin/moderation">
                    <Clock className="h-4 w-4 mr-3" />
                    <span>Kiểm duyệt ({metrics.pendingReviews})</span>
                    {metrics.pendingReviews > 10 && (
                      <Badge className="ml-auto bg-admin-warning-100 text-admin-warning-700 border-admin-warning-200">
                        Cần chú ý
                      </Badge>
                    )}
                  </Link>
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full justify-start border-admin-neutral-200 hover:bg-admin-neutral-50 hover:border-admin-primary-200 transition-all duration-200"
                  asChild
                >
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-3 text-admin-primary-600" />
                    <span>Quản lý người dùng</span>
                  </Link>
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full justify-start border-admin-neutral-200 hover:bg-admin-neutral-50 hover:border-admin-success-200 transition-all duration-200"
                  asChild
                >
                  <Link href="/admin/places">
                    <MapPin className="h-4 w-4 mr-3 text-admin-success-600" />
                    <span>Quản lý địa điểm</span>
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-admin-neutral-200 hover:bg-admin-neutral-50 hover:border-admin-info-200 transition-all duration-200"
                  asChild
                >
                  <Link href="/admin/analytics">
                    <BarChart3 className="h-4 w-4 mr-3 text-admin-info-600" />
                    <span>Báo cáo & Thống kê</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Health Card */}
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-admin-success-500/5 via-transparent to-admin-info-500/5"></div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-admin-success-500 to-admin-info-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-admin-neutral-900">Tình trạng hệ thống</h3>
                    <p className="text-sm text-admin-neutral-600">Hiệu suất và độ ổn định</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-admin-neutral-700">Uptime</span>
                    <span className="text-2xl font-bold text-admin-success-700">
                      {metrics.systemHealth || 99.9}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={metrics.systemHealth || 99.9} 
                    className="h-3 bg-admin-neutral-200"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 rounded-lg bg-admin-success-50">
                      <div className="text-xl font-bold text-admin-success-700 mb-1">
                        {formatNumber(metrics.totalUsers || 0)}
                      </div>
                      <div className="text-xs text-admin-success-600 font-medium">Người dùng hoạt động</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-admin-primary-50">
                      <div className="text-xl font-bold text-admin-primary-700 mb-1">
                        {metrics.todayActions || 0}
                      </div>
                      <div className="text-xs text-admin-primary-600 font-medium">Thao tác hôm nay</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center pt-2">
                    <div className="flex items-center gap-2 text-sm text-admin-success-700 font-medium">
                      <div className="h-2 w-2 bg-admin-success-500 rounded-full animate-pulse"></div>
                      Hệ thống hoạt động bình thường
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

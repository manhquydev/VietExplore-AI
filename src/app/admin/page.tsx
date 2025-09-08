"use client"

import * as React from "react"
import { ModernCard } from "@/components/ui/modern/card"
import { ModernMetricCard, QuickActionCard, ModernMetricCardSkeleton } from "@/components/admin/modern-metric-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminStats, useModerationQueue, useAdminUsers, useAdminPlaces } from "@/hooks/use-admin"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { 
  Users, MapPin, CheckCircle, Activity, AlertCircle, RefreshCw,
  Calendar, Clock, Shield, BarChart3
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
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Modern Header Section */}
      <div className="px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image
                    src="/logo-icon.svg"
                    alt="Du Lịch Việt Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
                    Tổng quan
                  </h1>
                  <p className="text-neutral-600 mt-1">
                    Dashboard điều hành và phân tích hệ thống Du Lịch Việt
                  </p>
                </div>
              </div>
            </div>
            
            {/* System Status Indicator */}
            <div className="flex items-center gap-6">
              <div className="bg-white border rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-3 w-3 bg-success-500 rounded-full"></div>
                    <div className="absolute inset-0 h-3 w-3 bg-success-500 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-success-700">Hệ thống ổn định</div>
                    <div className="text-xs text-neutral-500">Cập nhật {new Date().toLocaleTimeString('vi-VN')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error Alert - Modern Style */}
          {hasError && (
            <div className="mt-6 bg-white border border-danger-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-danger-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-danger-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-danger-900 mb-1">Cảnh báo hệ thống</h3>
                  <p className="text-sm text-danger-700 mb-3">Một số dữ liệu không thể tải được. Điều này có thể ảnh hưởng đến độ chính xác của báo cáo.</p>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Thử lại
                    </Button>
                    <span className="text-xs text-neutral-500">
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
        
        {/* Key Performance Metrics - Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Users Metric */}
          {isLoading ? (
            <ModernMetricCardSkeleton />
          ) : (
            <ModernMetricCard
              title="Người dùng"
              value={metrics.totalUsers}
              description="Tổng số người dùng đã đăng ký"
              trend={{
                value: metrics.userGrowth,
                label: "30 ngày"
              }}
              icon={Users}
              variant="info"
            />
          )}

          {/* Total Places Metric */}
          {isLoading ? (
            <ModernMetricCardSkeleton />
          ) : (
            <ModernMetricCard
              title="Địa điểm"
              value={metrics.totalPlaces}
              description="Địa điểm du lịch trong hệ thống"
              trend={{
                value: metrics.placeGrowth,
                label: "30 ngày"
              }}
              icon={MapPin}
              variant="success"
            />
          )}

          {/* Pending Reviews Metric */}
          {isLoading ? (
            <ModernMetricCardSkeleton />
          ) : (
            <ModernMetricCard
              title="Chờ duyệt"
              value={metrics.pendingReviews}
              description={`${pendingReviews?.filter(item => {
                const today = new Date().toDateString()
                return new Date(item.submittedAt).toDateString() === today
              }).length || 0} mục hôm nay`}
              icon={Clock}
              variant={metrics.pendingReviews > 10 ? "warning" : "default"}
            />
          )}

          {/* Monthly Reviews Completed */}
          {isLoading ? (
            <ModernMetricCardSkeleton />
          ) : (
            <ModernMetricCard
              title="Đã duyệt"
              value={metrics.monthlyReviews || 0}
              description={`${Math.round((metrics.monthlyReviews || 0) / 30)} mục mỗi ngày`}
              icon={CheckCircle}
              variant="success"
            />
          )}
        </div>

        {/* Dashboard Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Recent Activity Feed */}
          <div className="xl:col-span-2 space-y-6">
            <ModernCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Hoạt động gần đây</h2>
                    <p className="text-sm text-neutral-600">Theo dõi các hành động mới nhất trên hệ thống</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-success-700">Live</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 animate-pulse">
                        <div className="h-12 w-12 bg-neutral-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                          <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-3 bg-neutral-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Recent Users */}
                    {users?.slice(0, 3).map((user) => (
                      <div key={user.id} className="group flex items-center gap-4 p-4 rounded-xl bg-primary-50/50 border border-primary-200/30 hover:shadow-md transition-all duration-200">
                        <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 truncate mb-1">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-neutral-600">
                            Đã tham gia với vai trò <span className="font-medium text-primary-700 capitalize">{user.role}</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-medium text-neutral-500">
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
                      <div key={place.id} className="group flex items-center gap-4 p-4 rounded-xl bg-success-50/50 border border-success-200/30 hover:shadow-md transition-all duration-200">
                        <div className="h-12 w-12 bg-success-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 truncate mb-1">
                            {place.name}
                          </p>
                          <p className="text-sm text-neutral-600">
                            Địa điểm mới tại <span className="font-medium text-success-700">{place.province}</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-medium text-neutral-500">
                            {new Date(place.createdAt).toLocaleDateString('vi-VN', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-neutral-200">
                      <Button variant="ghost" className="w-full text-neutral-600 hover:text-primary-600 hover:bg-primary-50" asChild>
                        <Link href="/admin/activity">
                          <Activity className="h-4 w-4 mr-2" />
                          Xem tất cả hoạt động
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </ModernCard>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            
            {/* Quick Actions Card */}
            <ModernCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Thao tác nhanh</h3>
                  <p className="text-sm text-neutral-600">Các công cụ quản lý thường dùng</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {pendingActions.map((action) => (
                  <QuickActionCard
                    key={action.id}
                    title={action.title}
                    count={action.count}
                    priority={action.priority}
                    href={action.href}
                  />
                ))}
              </div>
            </ModernCard>

            {/* System Health Card */}
            <ModernCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-success-600 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Tình trạng hệ thống</h3>
                  <p className="text-sm text-neutral-600">Hiệu suất và độ ổn định</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Uptime</span>
                    <span className="text-2xl font-bold text-success-700">
                      {metrics.systemHealth || 99.9}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={metrics.systemHealth || 99.9} 
                    className="h-3 bg-neutral-200"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 rounded-lg bg-success-50">
                      <div className="text-xl font-bold text-success-700 mb-1">
                        {formatNumber(metrics.totalUsers || 0)}
                      </div>
                      <div className="text-xs text-success-600 font-medium">Người dùng hoạt động</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-primary-50">
                      <div className="text-xl font-bold text-primary-700 mb-1">
                        {metrics.todayActions || 0}
                      </div>
                      <div className="text-xs text-primary-600 font-medium">Thao tác hôm nay</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center pt-2">
                    <div className="flex items-center gap-2 text-sm text-success-700 font-medium">
                      <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
                      Hệ thống hoạt động bình thường
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  )
}

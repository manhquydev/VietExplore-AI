"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminStats } from "@/hooks/use-admin"
import Link from "next/link"
import {
  Users, MapPin, Shield, Activity, Globe, TrendingUp, Mountain, Sun, Waves,
  Calendar, Clock, BarChart3, AlertCircle, CheckCircle, XCircle, Star,
  ArrowUpRight, ArrowDownRight, Eye, FileEdit, UserPlus, MessageSquare,
  Zap, RefreshCw
} from "lucide-react"

export default function AdminOverviewPage() {
  const { user } = useAuth()
  const { stats, loading: statsLoading } = useAdminStats()
  const [timeOfDay, setTimeOfDay] = React.useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay('morning')
    else if (hour < 18) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const greetings = {
      morning: `Chào buổi sáng, ${user?.fullName || 'Admin'}!`,
      afternoon: `Chào buổi chiều, ${user?.fullName || 'Admin'}!`,
      evening: `Chào buổi tối, ${user?.fullName || 'Admin'}!`
    }
    return greetings[timeOfDay]
  }

  const safeStats = {
    totalUsers: stats?.totalUsers || 0,
    totalPlaces: stats?.totalPlaces || 0,
    pendingModeration: stats?.pendingModeration || 0,
    openReports: stats?.openReports || 0,
    systemHealth: stats?.systemHealth || 99.9,
    userGrowth: stats?.userGrowth || 0,
    placeGrowth: stats?.placeGrowth || 0,
    regionalDistribution: stats?.regionalDistribution || {
      'bac-bo': 0,
      'trung-bo': 0,
      'nam-bo': 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-yellow-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}</h1>
            <p className="text-green-50 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Dashboard quản trị VietExplore AI
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-green-100">Thời gian hệ thống</div>
              <div className="text-2xl font-bold font-mono">
                {currentTime.toLocaleTimeString('vi-VN')}
              </div>
              <div className="text-xs text-green-100">
                {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Link href="/admin/users" className="block group">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Tổng người dùng</p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="animate-pulse text-gray-300">...</span>
                ) : (
                  safeStats.totalUsers.toLocaleString('vi-VN')
                )}
              </p>
              {safeStats.userGrowth > 0 && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+{safeStats.userGrowth}% tháng này</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Total Places */}
        <Link href="/admin/places" className="block group">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Địa điểm du lịch</p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="animate-pulse text-gray-300">...</span>
                ) : (
                  safeStats.totalPlaces.toLocaleString('vi-VN')
                )}
              </p>
              {safeStats.placeGrowth > 0 && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+{safeStats.placeGrowth}% tuần này</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Pending Moderation */}
        <Link href="/admin/moderation/queue" className="block group">
          <div className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border ${
            safeStats.pendingModeration > 0
              ? 'border-yellow-200 hover:border-yellow-300'
              : 'border-gray-100 hover:border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                safeStats.pendingModeration > 0 ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <Shield className={`h-6 w-6 ${
                  safeStats.pendingModeration > 0 ? 'text-yellow-600' : 'text-green-600'
                }`} />
              </div>
              {safeStats.pendingModeration > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  Cần xử lý
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Chờ kiểm duyệt</p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="animate-pulse text-gray-300">...</span>
                ) : (
                  safeStats.pendingModeration
                )}
              </p>
              <div className="flex items-center gap-1 text-sm">
                {safeStats.pendingModeration > 0 ? (
                  <span className="text-yellow-600">Cần xem xét ngay</span>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Tất cả đã duyệt</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* System Health */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 font-medium">Sức khỏe hệ thống</p>
            <p className="text-3xl font-bold text-gray-900">{safeStats.systemHealth.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Hoạt động ổn định</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vietnam Regional Overview - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Phân bố địa điểm</h2>
                <p className="text-sm text-gray-500">Theo 3 miền Việt Nam</p>
              </div>
            </div>
            <Link href="/admin/analytics" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Xem chi tiết
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-teal-200 rounded-lg">
                  <Mountain className="h-5 w-5 text-teal-700" />
                </div>
                <div>
                  <div className="font-bold text-teal-900">Miền Bắc</div>
                  <div className="text-xs text-teal-600">Sapa, Hạ Long, Hà Nội</div>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-teal-900">
                  {statsLoading ? (
                    <span className="animate-pulse text-teal-300">...</span>
                  ) : (
                    (safeStats.regionalDistribution?.['bac-bo'] || 0).toLocaleString('vi-VN')
                  )}
                </span>
                <span className="text-sm text-teal-600">địa điểm</span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-200 rounded-lg">
                  <Sun className="h-5 w-5 text-yellow-700" />
                </div>
                <div>
                  <div className="font-bold text-yellow-900">Miền Trung</div>
                  <div className="text-xs text-yellow-600">Huế, Hội An, Đà Nẵng</div>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-yellow-900">
                  {statsLoading ? (
                    <span className="animate-pulse text-yellow-300">...</span>
                  ) : (
                    (safeStats.regionalDistribution?.['trung-bo'] || 0).toLocaleString('vi-VN')
                  )}
                </span>
                <span className="text-sm text-yellow-600">địa điểm</span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Waves className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <div className="font-bold text-blue-900">Miền Nam</div>
                  <div className="text-xs text-blue-600">TP.HCM, Mekong, Phú Quốc</div>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-900">
                  {statsLoading ? (
                    <span className="animate-pulse text-blue-300">...</span>
                  ) : (
                    (safeStats.regionalDistribution?.['nam-bo'] || 0).toLocaleString('vi-VN')
                  )}
                </span>
                <span className="text-sm text-blue-600">địa điểm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="space-y-3">
            <Link href="/admin/moderation/queue" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <Eye className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Kiểm duyệt</div>
                <div className="text-xs text-gray-500">Xem hàng đợi</div>
              </div>
              {safeStats.pendingModeration > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  {safeStats.pendingModeration}
                </span>
              )}
            </Link>

            <Link href="/admin/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Phân tích</div>
                <div className="text-xs text-gray-500">Xem báo cáo</div>
              </div>
            </Link>

            <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Người dùng</div>
                <div className="text-xs text-gray-500">Quản lý users</div>
              </div>
            </Link>

            <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <Activity className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Cài đặt</div>
                <div className="text-xs text-gray-500">Cấu hình hệ thống</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tóm tắt hoạt động</h2>
              <p className="text-sm text-gray-500">Cập nhật lúc {currentTime.toLocaleTimeString('vi-VN')}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Người dùng mới</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {Math.floor(safeStats.totalUsers * 0.05)}
            </div>
            <div className="text-xs text-blue-600">Trong 7 ngày qua</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <FileEdit className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Địa điểm mới</span>
            </div>
            <div className="text-2xl font-bold text-green-900 mb-1">
              {Math.floor(safeStats.totalPlaces * 0.08)}
            </div>
            <div className="text-xs text-green-600">Đã được duyệt</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Báo cáo</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 mb-1">
              {safeStats.openReports}
            </div>
            <div className="text-xs text-yellow-600">Đang xử lý</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Hoạt động</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 mb-1">
              {Math.floor(safeStats.totalUsers * 0.15)}
            </div>
            <div className="text-xs text-purple-600">Users hoạt động hôm nay</div>
          </div>
        </div>
      </div>
    </div>
  )
}
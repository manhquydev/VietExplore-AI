"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Users, Eye, Clock, ArrowRight, TrendingUp, AlertTriangle, CheckCircle, Edit3, Trash2, Flag, Shield } from "lucide-react"
import { adminIcons } from "@/lib/admin/icon-system"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminStats } from "@/hooks/use-admin"
import { AdminLoading, AdminErrorState } from "@/components/admin/loading-states"
import { apiClient } from "@/lib/client/api"

const moderationQueues = [
  {
    title: "Địa điểm Mới",
    description: "Kiểm duyệt địa điểm mới từ cộng tác viên",
    icon: MapPin,
    href: "/admin/moderation/queue",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600",
    stats: { pending: 0, total: 0 }
  },
  {
    title: "Quản lý Địa điểm", 
    description: "Xử lý yêu cầu chỉnh sửa và xóa địa điểm",
    icon: Edit3,
    href: "/admin/moderation/management",
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    iconColor: "text-orange-600",
    stats: { pending: 0, total: 0 }
  },
  {
    title: "Báo cáo Vi phạm",
    description: "Xử lý báo cáo từ cộng đồng",
    icon: Flag,
    href: "/admin/moderation/reports", 
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    iconColor: "text-red-600",
    stats: { pending: 0, total: 0 }
  }
]

export default function ModerationOverviewPage() {
  const { user } = useAuth()
  const { stats, loading, error } = useAdminStats()

  const [queueStats, setQueueStats] = React.useState<{[key: string]: any}>({})

  const fetchQueueStats = React.useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    try {
      // Fetch stats for each queue type - API now handles filtering
      const newPlacesResult = await apiClient.moderation.queue.list({ 
        itemType: 'new_place',
        status: 'submitted'
      })
      
      const managementResult = await apiClient.moderation.queue.list({
        itemType: ['place_edit', 'place_deletion'],
        status: 'pending'
      })
      
      const reportsResult = await apiClient.moderation.queue.list({
        itemType: 'user_report',
        status: 'pending'
      })

      setQueueStats({
        newPlaces: {
          pending: newPlacesResult.data?.length || 0,
          total: newPlacesResult.data?.length || 0
        },
        management: {
          pending: managementResult.data?.length || 0,
          total: managementResult.data?.length || 0
        },
        reports: {
          pending: reportsResult.data?.length || 0,
          total: reportsResult.data?.length || 0
        }
      })
    } catch (error) {
      console.error('Error fetching queue stats:', error)
    }
  }, [user])

  React.useEffect(() => {
    fetchQueueStats()
  }, [fetchQueueStats])

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-64"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-96"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-32"></div>
                  <div className="h-4 bg-gray-100 animate-pulse rounded"></div>
                  <div className="h-8 bg-gray-100 animate-pulse rounded w-24"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <AdminErrorState
          title="Lỗi tải trang tổng quan kiểm duyệt"
          description={error}
          action={
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              <adminIcons.system.refresh className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  const totalPending = (queueStats.newPlaces?.pending || 0) + 
                      (queueStats.management?.pending || 0) + 
                      (queueStats.reports?.pending || 0)

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="admin-page-title flex items-center gap-3">
            <adminIcons.navigation.moderation className="h-8 w-8 text-admin-primary-600" />
            Tổng quan Kiểm duyệt
          </h1>
          <p className="admin-body-text max-w-3xl">
            Hệ thống kiểm duyệt chuyên nghiệp với quy trình tách biệt cho từng loại nội dung
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="admin-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600">Tổng chờ xử lý</p>
                  <p className="text-2xl font-bold text-admin-neutral-900">{totalPending}</p>
                </div>
                <div className="h-12 w-12 bg-admin-warning-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-admin-warning-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600">Địa điểm mới</p>
                  <p className="text-2xl font-bold text-blue-600">{queueStats.newPlaces?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600">Yêu cầu quản lý</p>
                  <p className="text-2xl font-bold text-orange-600">{queueStats.management?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600">Báo cáo vi phạm</p>
                  <p className="text-2xl font-bold text-red-600">{queueStats.reports?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Flag className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Moderation Queues */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-admin-neutral-900">Hàng đợi Kiểm duyệt</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {moderationQueues.map((queue, index) => {
              const queueKey = ['newPlaces', 'management', 'reports'][index]
              const pending = queueStats[queueKey]?.pending || 0
              
              return (
                <Card key={queue.href} className={cn("transition-all duration-200 hover:shadow-lg border-2", queue.color)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", queue.color.replace('hover:bg-', 'bg-').replace('border-', 'bg-').replace('-200', '-100'))}>
                          <queue.icon className={cn("h-6 w-6", queue.iconColor)} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-admin-neutral-900">{queue.title}</h3>
                          <p className="text-sm text-admin-neutral-600">{queue.description}</p>
                        </div>
                      </div>
                      {pending > 0 && (
                        <Badge className={cn("text-sm font-semibold px-3 py-1", 
                          pending > 10 ? "bg-red-100 text-red-800" : 
                          pending > 5 ? "bg-orange-100 text-orange-800" : 
                          "bg-yellow-100 text-yellow-800"
                        )}>
                          {pending} chờ
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-admin-neutral-600">Đang chờ xử lý</span>
                        <span className="font-medium">{pending} mục</span>
                      </div>
                      <Progress 
                        value={pending > 0 ? Math.min((pending / 20) * 100, 100) : 0} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-admin-neutral-500">
                        {queue.href.includes('queue') && 'SLA: 48 giờ'}
                        {queue.href.includes('management') && 'SLA: 72 giờ (xóa)'}
                        {queue.href.includes('reports') && 'SLA: 6-72 giờ'}
                      </div>
                      <Button asChild size="sm" variant="outline" className="hover:shadow-md transition-all duration-200">
                        <Link href={queue.href}>
                          <span className="mr-2">Mở</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* System Performance */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Hiệu suất Hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-admin-neutral-600">Tỷ lệ phê duyệt</span>
                <span className="font-semibold">
                  {loading ? <AdminLoading size="sm" inline /> : '85%'}
                </span>
              </div>
              <Progress value={85} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-admin-neutral-600">Thời gian xử lý trung bình</span>
                <span className="font-semibold">
                  {loading ? <AdminLoading size="sm" inline /> : '18 giờ'}
                </span>
              </div>
              <Progress value={60} className="h-2" />
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Tuân thủ SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-admin-neutral-600">Địa điểm mới</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">95%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-admin-neutral-600">Báo cáo khẩn cấp</span>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-600">88%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-admin-neutral-600">Quản lý địa điểm</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">92%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  MapPin, Users, Eye, Clock, ArrowRight, TrendingUp, AlertTriangle, 
  CheckCircle, Edit3, Trash2, Flag, Shield, Activity, BarChart3,
  Timer, FileCheck, Target, Zap
} from "lucide-react"
import { adminIcons } from "@/lib/admin/icon-system"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminStats } from "@/hooks/use-admin"
import { AdminErrorState } from "@/components/admin/loading-states"
import { BrandedLoading, BrandedCardSkeleton } from "@/components/ui/branded-loading"
import { apiClient } from "@/lib/client/api"
import { RealtimeService } from "@/lib/firebase/realtime"
import { auth } from "@/lib/firebase"

const moderationQueues = [
  {
    title: "Địa điểm Mới",
    description: "Kiểm duyệt địa điểm mới từ cộng tác viên và đối tác",
    icon: MapPin,
    href: "/admin/moderation/queue",
    gradient: "from-admin-primary-500 to-admin-info-600",
    bgGradient: "from-admin-primary-50/50 to-admin-info-100/30",
    borderColor: "border-admin-primary-200/50",
    iconColor: "text-white",
    priority: "Cao",
    stats: { pending: 0, total: 0 }
  },
  {
    title: "Quản lý Địa điểm", 
    description: "Xử lý yêu cầu chỉnh sửa, cập nhật và xóa địa điểm",
    icon: Edit3,
    href: "/admin/moderation/management",
    gradient: "from-admin-warning-500 to-admin-success-600",
    bgGradient: "from-admin-warning-50/50 to-admin-success-100/30",
    borderColor: "border-admin-warning-200/50",
    iconColor: "text-white",
    priority: "Trung bình",
    stats: { pending: 0, total: 0 }
  },
  {
    title: "Báo cáo Vi phạm",
    description: "Xử lý báo cáo vi phạm và khiếu nại từ cộng đồng",
    icon: Flag,
    href: "/admin/moderation/reports", 
    gradient: "from-admin-error-500 to-admin-error-600",
    bgGradient: "from-admin-error-50/50 to-admin-error-100/30",
    borderColor: "border-admin-error-200/50",
    iconColor: "text-white",
    priority: "Khẩn cấp",
    stats: { pending: 0, total: 0 }
  }
]

export default function ModerationOverviewPage() {
  const { user } = useAuth()
  const { stats, loading, error } = useAdminStats()

  const [queueStats, setQueueStats] = React.useState<{[key: string]: any}>({})
  const [realtimeReportStats, setRealtimeReportStats] = React.useState<any>({
    pending: 0,
    in_review: 0,
    resolved: 0,
    dismissed: 0,
    total: 0
  })

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
          pending: realtimeReportStats.pending || 0,
          total: realtimeReportStats.total || 0
        }
      })
    } catch (error) {
      console.error('Error fetching queue stats:', error)
    }
  }, [user, realtimeReportStats])

  // Sync report stats from Firestore to Realtime Database
  const syncReportStats = React.useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch('/api/admin/sync-report-stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Report stats synced successfully:', result.stats);
      }
    } catch (error) {
      console.error('Error syncing report stats:', error);
    }
  }, [user])

  // Subscribe to realtime report stats
  React.useEffect(() => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    // First, sync existing data from Firestore
    syncReportStats()

    // Initialize report stats if they don't exist
    RealtimeService.initializeReportStats()

    // Subscribe to realtime updates
    const unsubscribe = RealtimeService.subscribeToReportStats((stats) => {
      setRealtimeReportStats(stats)
    })

    return unsubscribe
  }, [user, syncReportStats])

  React.useEffect(() => {
    fetchQueueStats()
  }, [fetchQueueStats])

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="min-h-[400px] flex items-center justify-center">
          <BrandedLoading 
            variant="logo" 
            size="lg"
            text="Đang tải tổng quan kiểm duyệt..."
          />
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
    <div className="min-h-screen bg-gradient-to-br from-admin-neutral-50 via-white to-admin-warning-50/20">
      
      {/* Modern Header Section */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-admin-warning-500/5 via-admin-primary-500/3 to-admin-error-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-admin-warning-600 to-admin-error-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-admin-neutral-900 tracking-tight">
                    Trung tâm Kiểm duyệt
                  </h1>
                  <p className="text-admin-neutral-600 mt-1">
                    Hệ thống kiểm duyệt nội dung chuyên nghiệp và an toàn
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status Overview Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 rounded-xl px-6 py-4 shadow-lg">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-admin-warning-700">{totalPending}</div>
                  <div className="text-xs font-medium text-admin-neutral-600">Chờ duyệt</div>
                </div>
                <div className="w-px h-10 bg-admin-neutral-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-admin-success-700">
                    {stats?.moderationStats?.dailyProcessed || 0}
                  </div>
                  <div className="text-xs font-medium text-admin-neutral-600">Đã xử lý hôm nay</div>
                </div>
                <div className="w-px h-10 bg-admin-neutral-200"></div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={syncReportStats}
                  className="text-xs"
                  title="Đồng bộ thống kê báo cáo"
                >
                  <adminIcons.system.refresh className="h-3 w-3 mr-1" />
                  Sync
                </Button>
                <div className="relative">
                  <div className={`h-3 w-3 rounded-full ${totalPending > 10 ? 'bg-admin-error-500' : 'bg-admin-success-500'}`}></div>
                  <div className={`absolute inset-0 h-3 w-3 rounded-full animate-ping opacity-20 ${totalPending > 10 ? 'bg-admin-error-500' : 'bg-admin-success-500'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Pending */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-warning-500/10 via-transparent to-admin-warning-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Tổng chờ xử lý
                  </p>
                  <p className="text-3xl font-bold text-admin-warning-700 mt-1">{totalPending}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-warning-500 to-admin-warning-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Timer className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className={`h-2 w-2 rounded-full ${totalPending > 10 ? 'bg-admin-error-500' : 'bg-admin-success-500'}`}></div>
                <span className="text-xs font-medium text-admin-neutral-500">
                  {totalPending > 10 ? 'Cần xử lý khẩn cấp' : 'Trong tầm kiểm soát'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* New Places */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-primary-500/10 via-transparent to-admin-info-500/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Địa điểm mới
                  </p>
                  <p className="text-3xl font-bold text-admin-primary-700 mt-1">{queueStats.newPlaces?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-500 to-admin-info-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Target className="h-3 w-3 text-admin-primary-600" />
                <span className="text-xs font-medium text-admin-primary-600">Ưu tiên cao</span>
              </div>
            </CardContent>
          </Card>

          {/* Management Requests */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-success-500/10 via-transparent to-admin-warning-500/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Quản lý địa điểm
                  </p>
                  <p className="text-3xl font-bold text-admin-success-700 mt-1">{queueStats.management?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-success-500 to-admin-warning-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Activity className="h-3 w-3 text-admin-success-600" />
                <span className="text-xs font-medium text-admin-success-600">Trung bình</span>
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-error-500/10 via-transparent to-admin-error-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Báo cáo vi phạm
                  </p>
                  <p className="text-3xl font-bold text-admin-error-700 mt-1">{queueStats.reports?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-error-500 to-admin-error-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Flag className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Zap className="h-3 w-3 text-admin-error-600" />
                <span className="text-xs font-medium text-admin-error-600">Khẩn cấp</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Moderation Queues */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-admin-neutral-900">Hàng đợi Kiểm duyệt</h2>
              <p className="text-admin-neutral-600 mt-1">Xử lý nội dung theo quy trình chuyên nghiệp</p>
            </div>
            <Button variant="outline" className="text-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Xem báo cáo
            </Button>
          </div>
          
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            {moderationQueues.map((queue, index) => {
              const queueKey = ['newPlaces', 'management', 'reports'][index]
              const pending = queueStats[queueKey]?.pending || 0
              
              return (
                <Card key={queue.href} className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${queue.bgGradient}`}></div>
                  
                  <CardContent className="relative p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-16 w-16 bg-gradient-to-br ${queue.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-200`}>
                          <queue.icon className={`h-8 w-8 ${queue.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-admin-neutral-900 mb-2">{queue.title}</h3>
                          <p className="text-admin-neutral-600 text-sm leading-relaxed">{queue.description}</p>
                        </div>
                      </div>
                      
                      {/* Priority Badge */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={cn("text-xs font-semibold px-3 py-1 border-0", 
                          queue.priority === 'Khẩn cấp' ? "bg-admin-error-100 text-admin-error-700" : 
                          queue.priority === 'Cao' ? "bg-admin-warning-100 text-admin-warning-700" : 
                          "bg-admin-success-100 text-admin-success-700"
                        )}>
                          {queue.priority}
                        </Badge>
                        {pending > 0 && (
                          <Badge className="bg-admin-primary-600 text-white text-sm font-bold px-3 py-1 shadow-lg">
                            {pending}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-admin-neutral-700">Chờ xử lý</span>
                        <span className="text-2xl font-bold text-admin-neutral-900">{pending}</span>
                      </div>
                      
                      <div className="w-full bg-admin-neutral-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${queue.gradient} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min((pending / 20) * 100, 100)}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-admin-neutral-500 text-center">
                        {pending === 0 ? 'Không có mục nào chờ xử lý' : 
                         pending < 5 ? 'Tình trạng bình thường' :
                         pending < 10 ? 'Cần chú ý' : 'Yêu cầu xử lý khẩn cấp'}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Button 
                      asChild 
                      className={`w-full bg-gradient-to-r ${queue.gradient} hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-white border-0`}
                    >
                      <Link href={queue.href}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xử lý ngay ({pending})
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 

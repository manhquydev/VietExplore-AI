/**
 * Enhanced Moderation Overview Page 2025 - VietExplore AI Admin
 * Modern, professional moderation dashboard with enhanced components
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { EnhancedCard, CardHeader, CardContent } from "@/components/ui/modern/enhanced-card"
import { EnhancedButton } from "@/components/ui/modern/enhanced-button"
import { useAdminTheme } from "@/providers/admin-theme-provider"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, Timer, FileCheck, Flag, Eye, ArrowRight, Activity, 
  BarChart3, MapPin, Zap, Target, RefreshCw, CheckCircle
} from "lucide-react"
import { adminIcons } from "@/lib/admin/icon-system"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminStats } from "@/hooks/use-admin"
import { AdminErrorState } from "@/components/admin/loading-states"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { apiClient } from "@/lib/client/api"
import { RealtimeService } from "@/lib/firebase/realtime"
import { auth } from "@/lib/firebase"

const moderationQueues = [
  {
    id: 'newPlaces',
    title: "Địa điểm Mới",
    description: "Kiểm duyệt địa điểm mới từ cộng tác viên và đối tác",
    icon: MapPin,
    href: "/admin/moderation/queue",
    priority: "Cao",
    color: "primary"
  },
  {
    id: 'management', 
    title: "Quản lý Địa điểm",
    description: "Xử lý yêu cầu chỉnh sửa, cập nhật và xóa địa điểm",
    icon: FileCheck,
    href: "/admin/moderation/management", 
    priority: "Trung bình",
    color: "success"
  },
  {
    id: 'reports',
    title: "Báo cáo Vi phạm",
    description: "Xử lý báo cáo vi phạm và khiếu nại từ cộng đồng",
    icon: Flag,
    href: "/admin/moderation/reports",
    priority: "Khẩn cấp", 
    color: "danger"
  }
]

export default function EnhancedModerationOverviewPage() {
  const { user } = useAuth()
  const { stats, loading, error } = useAdminStats()
  const { colors, spacing, animations } = useAdminTheme()

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

  React.useEffect(() => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    syncReportStats()
    RealtimeService.initializeReportStats()

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
      <div className="p-6">
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
      <div className="p-6">
        <AdminErrorState
          title="Lỗi tải trang tổng quan kiểm duyệt"
          description={error}
          action={
            <EnhancedButton 
              variant="outline" 
              onClick={() => window.location.reload()}
              leftIcon={<adminIcons.system.refresh className="h-4 w-4" />}
            >
              Thử lại
            </EnhancedButton>
          }
        />
      </div>
    )
  }

  const totalPending = (queueStats.newPlaces?.pending || 0) + 
                      (queueStats.management?.pending || 0) + 
                      (queueStats.reports?.pending || 0)

  return (
    <div className="min-h-screen bg-white">
      
      {/* Enhanced Header Section */}
      <div className="relative px-6 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-warning-500/5 via-primary-500/3 to-danger-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            <CardHeader
              title="Trung tâm Kiểm duyệt"
              subtitle="Hệ thống kiểm duyệt nội dung chuyên nghiệp và an toàn"
              icon={<Shield className="h-6 w-6" />}
            />
            
            {/* System Status */}
            <EnhancedCard variant="ghost" className="bg-white/80 backdrop-blur-sm">
              <CardContent className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-700">
                    {totalPending}
                  </div>
                  <div className="text-xs font-medium text-neutral-600">Chờ duyệt</div>
                </div>
                
                <div className="w-px h-10 bg-neutral-200"></div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-700">
                    {stats?.moderationStats?.dailyProcessed || 0}
                  </div>
                  <div className="text-xs font-medium text-neutral-600">Đã xử lý hôm nay</div>
                </div>
                
                {/* AUTO-SYNC: Manual sync button removed - now using real-time updates */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  Real-time
                </div>
                
                <div className="relative">
                  <div className={`h-3 w-3 rounded-full ${totalPending > 10 ? 'bg-danger-500' : 'bg-success-500'}`}></div>
                  <div className={`absolute inset-0 h-3 w-3 rounded-full animate-ping opacity-20 ${totalPending > 10 ? 'bg-danger-500' : 'bg-success-500'}`}></div>
                </div>
              </CardContent>
            </EnhancedCard>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Tổng chờ xử lý
                  </p>
                  <p className="text-3xl font-bold text-warning-700 mt-1">{totalPending}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center">
                  <Timer className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className={`h-2 w-2 rounded-full ${totalPending > 10 ? 'bg-danger-500' : 'bg-success-500'}`}></div>
                <span className="text-xs font-medium text-neutral-500">
                  {totalPending > 10 ? 'Cần xử lý khẩn cấp' : 'Trong tầm kiểm soát'}
                </span>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Địa điểm mới
                  </p>
                  <p className="text-3xl font-bold text-primary-700 mt-1">{queueStats.newPlaces?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Target className="h-3 w-3 text-primary-600" />
                <span className="text-xs font-medium text-primary-600">Ưu tiên cao</span>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Quản lý địa điểm
                  </p>
                  <p className="text-3xl font-bold text-success-700 mt-1">{queueStats.management?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Activity className="h-3 w-3 text-success-600" />
                <span className="text-xs font-medium text-success-600">Trung bình</span>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Báo cáo vi phạm
                  </p>
                  <p className="text-3xl font-bold text-danger-700 mt-1">{queueStats.reports?.pending || 0}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-danger-500 to-danger-600 rounded-xl flex items-center justify-center">
                  <Flag className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Zap className="h-3 w-3 text-danger-600" />
                <span className="text-xs font-medium text-danger-600">Khẩn cấp</span>
              </div>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Moderation Queues */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <CardHeader
              title="Hàng đợi Kiểm duyệt"
              subtitle="Xử lý nội dung theo quy trình chuyên nghiệp"
            />
            <EnhancedButton 
              variant="outline"
              leftIcon={<BarChart3 className="h-4 w-4" />}
            >
              Xem báo cáo
            </EnhancedButton>
          </div>
          
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            {moderationQueues.map((queue) => {
              const pending = queueStats[queue.id]?.pending || 0
              
              const colorClasses = {
                primary: 'from-primary-500 to-primary-600',
                success: 'from-success-500 to-success-600', 
                danger: 'from-danger-500 to-danger-600'
              }

              const priorityClasses = {
                'Khẩn cấp': 'bg-danger-100 text-danger-700',
                'Cao': 'bg-warning-100 text-warning-700',
                'Trung bình': 'bg-success-100 text-success-700'
              }
              
              return (
                <EnhancedCard 
                  key={queue.href} 
                  variant="elevated" 
                  className="group hover:scale-[1.02] transition-transform duration-200"
                >
                  <CardHeader
                    title={queue.title}
                    subtitle={queue.description}
                    icon={<queue.icon className="h-6 w-6" />}
                    action={
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={cn("text-xs font-semibold px-3 py-1 border-0", 
                          priorityClasses[queue.priority as keyof typeof priorityClasses])}>
                          {queue.priority}
                        </Badge>
                        {pending > 0 && (
                          <Badge className="bg-primary-600 text-white text-sm font-bold px-3 py-1 shadow-lg">
                            {pending}
                          </Badge>
                        )}
                      </div>
                    }
                  />
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">Chờ xử lý</span>
                      <span className="text-2xl font-bold text-neutral-900">{pending}</span>
                    </div>
                    
                    <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${colorClasses[queue.color as keyof typeof colorClasses]} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min((pending / 20) * 100, 100)}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-neutral-500 text-center">
                      {pending === 0 ? 'Không có mục nào chờ xử lý' : 
                       pending < 5 ? 'Tình trạng bình thường' :
                       pending < 10 ? 'Cần chú ý' : 'Yêu cầu xử lý khẩn cấp'}
                    </div>
                    
                    <Link href={queue.href}>
                      <EnhancedButton 
                        variant="primary"
                        fullWidth
                        leftIcon={<Eye className="h-4 w-4" />}
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Xử lý ngay ({pending})
                      </EnhancedButton>
                    </Link>
                  </CardContent>
                </EnhancedCard>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
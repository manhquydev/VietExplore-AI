"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Users, Eye, AlertTriangle, Flag, Shield, Clock } from "lucide-react"
import { adminIcons } from "@/lib/admin/icon-system"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useModerationQueue } from "@/hooks/use-admin"
import { useToast } from "@/hooks/use-toast"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { apiClient } from "@/lib/client/api"
import { AdminErrorState, AdminEmptyState } from "@/components/admin/loading-states"
import { BrandedLoading, BrandedCardSkeleton } from "@/components/ui/branded-loading"
import { AdminApproveDialog, AdminRejectDialog, AdminEscalateDialog } from "@/components/admin/confirmation-dialogs"

const statusConfig = {
  pending: { 
    label: "Chờ xử lý", 
    variant: "warning" as const, 
    icon: adminIcons.status.pending,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  in_review: { 
    label: "Đang điều tra", 
    variant: "default" as const, 
    icon: adminIcons.actions.view,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  resolved: { 
    label: "Đã xử lý", 
    variant: "success" as const, 
    icon: adminIcons.status.success,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  dismissed: { 
    label: "Bỏ qua", 
    variant: "secondary" as const, 
    icon: adminIcons.status.error,
    color: "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const reportTypeConfig = {
  safety_legal: {
    label: "An toàn/Pháp lý",
    priority: "Nghiêm trọng",
    sla: "6 giờ",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Shield
  },
  misinformation: {
    label: "Thông tin sai lệch", 
    priority: "Cao",
    sla: "24 giờ",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertTriangle
  },
  inappropriate_content: {
    label: "Nội dung không phù hợp",
    priority: "Trung bình", 
    sla: "48 giờ",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Flag
  },
  other: {
    label: "Khác",
    priority: "Thấp",
    sla: "72 giờ", 
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Flag
  }
}

export default function ReportsHandlingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [selectedStatus, setSelectedStatus] = React.useState<string>('pending')
  const [selectedType, setSelectedType] = React.useState<string>('all')
  const [selectedPriority, setSelectedPriority] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusCounts, setStatusCounts] = React.useState<{[key: string]: number}>({})

  // Build filters for reports only
  const queueFilters = React.useMemo(() => {
    const filters: any = { 
      status: selectedStatus,
      itemType: 'user_report'
    }
    if (selectedType !== 'all') {
      filters.reportType = selectedType
    }
    if (selectedPriority !== 'all') {
      filters.priority = selectedPriority
    }
    return filters
  }, [selectedStatus, selectedType, selectedPriority])

  const { items, loading, error, reviewItem } = useModerationQueue(queueFilters)

  // Fetch status counts for reports only
  const fetchStatusCounts = React.useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    try {
      const statuses = ['pending', 'in_review', 'resolved', 'dismissed']
      const counts: {[key: string]: number} = {}

      for (const status of statuses) {
        const filters: any = { 
          status,
          itemType: 'user_report'
        }
        const result = await apiClient.moderation.queue.list(filters)
        counts[status] = result.data?.length || 0
      }

      setStatusCounts(counts)
    } catch (error) {
      console.error('Error fetching status counts:', error)
    }
  }, [user])

  React.useEffect(() => {
    fetchStatusCounts()
  }, [fetchStatusCounts])

  const handleAction = async (
    itemId: string, 
    action: 'resolve' | 'dismiss' | 'escalate',
    notes?: string
  ) => {
    try {
      const mappedAction = action === 'resolve' ? 'approve' : action === 'dismiss' ? 'reject' : 'escalate'
      const result = await reviewItem(itemId, mappedAction, notes)
      
      if (result && result.success) {
        const actionMessages = {
          'resolve': 'Báo cáo đã được xử lý và giải quyết',
          'dismiss': 'Báo cáo đã được bỏ qua',
          'escalate': 'Báo cáo đã được chuyển lên Admin xử lý'
        }
        toast({ 
          title: "Thành công",
          description: actionMessages[action as keyof typeof actionMessages] || 'Hành động đã được thực hiện thành công',
          variant: "success"
        })
        
        await fetchStatusCounts()
        window.dispatchEvent(new CustomEvent('moderationUpdated'))
      } else {
        const errorMessage = result?.error || 'Có lỗi xảy ra khi thực hiện hành động'
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Error in handleAction:', error)
      const errorMessage = error?.error || error?.message || 'Có lỗi không mong đợi xảy ra'
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items
    
    return items.filter(item =>
      item.contentDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submitter?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.reportReason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.reportDetails?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [items, searchQuery])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  const getSLAStatus = (submittedAt: string, reportType: string) => {
    const now = new Date()
    const submitted = new Date(submittedAt)
    const hoursAgo = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60))
    
    const slaHours = {
      safety_legal: 6,
      misinformation: 24,
      inappropriate_content: 48,
      other: 72
    }
    
    const limit = slaHours[reportType as keyof typeof slaHours] || 72
    const remaining = limit - hoursAgo
    
    if (remaining <= 0) {
      return { status: 'overdue', text: 'Quá hạn', color: 'text-red-600 bg-red-50' }
    } else if (remaining <= limit * 0.2) {
      return { status: 'urgent', text: `Còn ${remaining}h`, color: 'text-orange-600 bg-orange-50' }
    } else {
      return { status: 'on-time', text: `Còn ${remaining}h`, color: 'text-green-600 bg-green-50' }
    }
  }

  const actions = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1 sm:flex-none">
        <adminIcons.utility.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-admin-neutral-400" />
        <Input
          placeholder="Tìm kiếm báo cáo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-input pl-10 w-full sm:w-64"
        />
      </div>
      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="w-full sm:w-48 admin-input">
          <SelectValue placeholder="Loại báo cáo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả loại</SelectItem>
          {Object.entries(reportTypeConfig).map(([type, config]) => (
            <SelectItem key={type} value={type}>
              <div className="flex items-center gap-2">
                <config.icon className="h-3 w-3" />
                {config.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedPriority} onValueChange={setSelectedPriority}>
        <SelectTrigger className="w-full sm:w-40 admin-input">
          <SelectValue placeholder="Ưu tiên" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="urgent">Khẩn cấp</SelectItem>
          <SelectItem value="high">Cao</SelectItem>
          <SelectItem value="medium">Trung bình</SelectItem>
          <SelectItem value="low">Thấp</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="admin-page-title flex items-center gap-3">
            <Flag className="h-8 w-8 text-admin-primary-600" />
            Xử lý Báo cáo
          </h1>
          <p className="admin-body-text max-w-2xl">Điều tra và giải quyết báo cáo vi phạm từ cộng đồng</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-admin-neutral-600">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-red-500" />
              <span>An toàn/Pháp lý: SLA 6 giờ</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Sai lệch: SLA 24 giờ</span>
            </div>
            <div className="flex items-center gap-1">
              <Flag className="h-4 w-4 text-yellow-500" />
              <span>Không phù hợp: SLA 48 giờ</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          {actions}
        </div>
      </div>
      <div className="space-y-6">
        {/* Status Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <div className="admin-card p-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-admin-neutral-50 p-1 rounded-lg">
              {Object.entries(statusConfig).map(([status, config]) => (
                <TabsTrigger 
                  key={status} 
                  value={status}
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-admin-primary-200 text-xs md:text-sm font-medium px-3 py-2 rounded-md transition-all duration-200"
                >
                  <config.icon className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                  {statusCounts[status] > 0 && (
                    <Badge className={cn("ml-1 text-xs px-2 py-0.5 h-5 rounded-full font-semibold", config.color)}>
                      {statusCounts[status]}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(statusConfig).map(([status, config]) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <BrandedCardSkeleton key={i} showImage={true} lines={6} />
                  ))}
                </div>
              ) : error ? (
                <AdminErrorState
                  title="Lỗi tải danh sách báo cáo"
                  description={error}
                  action={
                    <Button 
                      variant="outline" 
                      className="admin-btn-secondary"
                      onClick={() => window.location.reload()}
                    >
                      <adminIcons.system.refresh className="h-4 w-4 mr-2" />
                      Thử lại
                    </Button>
                  }
                />
              ) : filteredItems.length === 0 ? (
                <AdminEmptyState
                  icon={config.icon}
                  title={`Không có báo cáo ${config.label.toLowerCase()}`}
                  description={
                    searchQuery 
                      ? "Thử điều chỉnh từ khóa tìm kiếm hoặc xóa bộ lọc"
                      : `Chưa có báo cáo nào ở trạng thái này`
                  }
                  action={
                    searchQuery ? (
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchQuery('')}
                        className="admin-btn-secondary"
                      >
                        Xóa tìm kiếm
                      </Button>
                    ) : null
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => {
                    const statusInfo = statusConfig[item.status as keyof typeof statusConfig]
                    const reportType = item.metadata?.reportType || 'other'
                    const typeInfo = reportTypeConfig[reportType as keyof typeof reportTypeConfig]
                    const slaStatus = getSLAStatus(item.submittedAt, reportType)
                    
                    return (
                      <Card key={item.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-200">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-start gap-4">
                            {/* Place/Content Preview */}
                            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm border-2 border-red-100 relative">
                              {item.contentDetails?.images?.[0] ? (
                                <img 
                                  src={item.contentDetails.images[0].url} 
                                  alt=""
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <MapPin className="h-7 w-7 text-red-600" />
                              )}
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center">
                                <Flag className="h-3 w-3 text-red-600" />
                              </div>
                            </div>

                            {/* Report Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-2">
                                    <Flag className="h-4 w-4 text-red-600" />
                                    Báo cáo: {item.contentDetails?.name || 'Nội dung bị báo cáo'}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-2">
                                    <span className="font-medium">Lý do:</span> {item.metadata?.reportReason || 'Không có lý do cụ thể'}
                                  </p>
                                  {item.metadata?.reportDetails && (
                                    <div className="bg-gray-50 rounded-md p-2 mb-2">
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-800">Chi tiết báo cáo:</span>
                                        <span className="text-gray-700 ml-1">{item.metadata.reportDetails}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 ml-4">
                                  <Badge className={cn("text-xs font-medium shadow-sm", statusInfo?.color)}>
                                    <statusInfo.icon className="w-3 h-3 mr-1" />
                                    {statusInfo?.label}
                                  </Badge>
                                  <Badge className={cn("text-xs font-medium shadow-sm", typeInfo?.color)}>
                                    <typeInfo.icon className="w-3 h-3 mr-1" />
                                    {typeInfo?.label}
                                  </Badge>
                                  <Badge className={cn("text-xs font-medium shadow-sm px-2 py-1 rounded-full", slaStatus.color)}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {slaStatus.text}
                                  </Badge>
                                </div>
                              </div>

                              {/* Meta Info */}
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>Báo cáo từ: {item.submitter?.fullName || 'Người dùng ẩn danh'}</span>
                                  <UserRoleDisplay 
                                    role={item.submitter?.role || 'traveler'}
                                    variant="compact"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(item.submittedAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>Ưu tiên: {typeInfo?.priority}</span>
                                </div>
                              </div>

                              {/* Priority Alert */}
                              {(reportType === 'safety_legal' || slaStatus.status === 'overdue') && (
                                <div className={cn(
                                  "rounded-lg p-3 mb-4 border",
                                  reportType === 'safety_legal' 
                                    ? "bg-red-50 border-red-200" 
                                    : "bg-orange-50 border-orange-200"
                                )}>
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className={cn(
                                      "h-4 w-4",
                                      reportType === 'safety_legal' ? "text-red-600" : "text-orange-600"
                                    )} />
                                    <p className={cn(
                                      "text-sm font-medium",
                                      reportType === 'safety_legal' ? "text-red-800" : "text-orange-800"
                                    )}>
                                      {reportType === 'safety_legal' 
                                        ? 'Báo cáo ưu tiên cao - Cần xử lý ngay lập tức'
                                        : 'Cảnh báo: Báo cáo đã quá hạn SLA'
                                      }
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Reviewer Info */}
                              {item.reviewer && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
                                  <p className="text-sm">
                                    <span className="font-medium text-blue-800">Đang được điều tra bởi:</span>
                                    <span className="text-blue-700 ml-1">{item.reviewer.fullName}</span>
                                  </p>
                                  {item.reviewNotes && (
                                    <p className="text-sm text-blue-600 mt-1">
                                      <span className="font-medium">Ghi chú điều tra:</span> {item.reviewNotes}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <Button size="sm" variant="outline" asChild className="hover:shadow-md transition-all duration-200">
                                  <Link href={`/moderation/review/${item.id}`}>
                                    <Eye className="w-4 h-4 mr-1 md:mr-2" />
                                    <span className="hidden sm:inline">Điều tra chi tiết</span>
                                  </Link>
                                </Button>

                                {(status === 'pending' || status === 'in_review') && (
                                  <>
                                    <AdminApproveDialog
                                      itemName={`báo cáo về "${item.contentDetails?.name}"`}
                                      onConfirm={() => handleAction(item.id, 'resolve')}
                                      trigger={
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          className="text-green-600 border-green-600 hover:bg-green-50"
                                        >
                                          <adminIcons.status.success className="w-4 h-4 mr-2" />
                                          Giải quyết
                                        </Button>
                                      }
                                    />
                                    <AdminRejectDialog
                                      onConfirm={(reason) => handleAction(item.id, 'dismiss', reason)}
                                      trigger={
                                        <Button 
                                          size="sm"
                                          variant="outline" 
                                          className="text-gray-600 border-gray-600 hover:bg-gray-50"
                                        >
                                          <adminIcons.status.error className="w-4 h-4 mr-2" />
                                          Bỏ qua
                                        </Button>
                                      }
                                    />
                                    <AdminEscalateDialog
                                      onConfirm={(reason) => handleAction(item.id, 'escalate', reason)}
                                      trigger={
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                        >
                                          <adminIcons.status.warning className="w-4 h-4 mr-2" />
                                          Chuyển Admin
                                        </Button>
                                      }
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
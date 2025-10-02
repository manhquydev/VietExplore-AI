"use client"

export const dynamic = 'force-dynamic'

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
import { useToast } from "@/hooks/use-toast"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { useAdminReports } from "@/hooks/use-admin-reports"
import { AdminErrorState, AdminEmptyState } from "@/components/admin/loading-states"
import { BrandedLoading, BrandedCardSkeleton } from "@/components/ui/branded-loading"
import { AdminApproveDialog, AdminRejectDialog, AdminEscalateDialog } from "@/components/admin/confirmation-dialogs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getAuth } from "firebase/auth"

const auth = getAuth()

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
  const reportFilters = React.useMemo(() => {
    const filters: any = { 
      status: selectedStatus,
    }
    if (selectedType !== 'all') {
      filters.reportType = selectedType
    }
    return filters
  }, [selectedStatus, selectedType])

  const { reports, loading, error, updateReportStatus, getStatusCounts, refetch } = useAdminReports(reportFilters)

  // Fetch status counts for reports only
  const fetchStatusCounts = React.useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    try {
      const counts = await getStatusCounts()
      setStatusCounts(counts)
    } catch (error) {
      console.error('Error fetching status counts:', error)
    }
  }, [user, getStatusCounts])

  React.useEffect(() => {
    fetchStatusCounts()
  }, [fetchStatusCounts])

  const handleAction = async (
    reportId: string, 
    action: 'resolve' | 'dismiss' | 'escalate' | 'request_delete' | 'claim' | 'release',
    notes?: string
  ) => {
    try {
      // Handle special delete request action
      if (action === 'request_delete') {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          toast({
            title: "Lỗi xác thực",
            description: "Vui lòng đăng nhập lại để tiếp tục",
            variant: "destructive"
          });
          return;
        }

        const token = await firebaseUser.getIdToken();
        const response = await fetch(`/api/admin/reports/${reportId}/request-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ notes })
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }

        toast({
          title: "Thành công", 
          description: "Đã gửi yêu cầu xóa địa điểm cho Admin duyệt",
          variant: "success"
        });
        
        await fetchStatusCounts();
        return;
      }

      // Handle claim and release actions
      if (action === 'claim' || action === 'release') {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          toast({
            title: "Lỗi xác thực",
            description: "Vui lòng đăng nhập lại để tiếp tục",
            variant: "destructive"
          });
          return;
        }

        const token = await firebaseUser.getIdToken();
        const response = await fetch(`/api/admin/reports/${reportId}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action, notes })
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }

        const actionMessages = {
          'claim': 'Đã tiếp nhận báo cáo để điều tra. Báo cáo giờ được khóa cho bạn xử lý.',
          'release': 'Đã trả báo cáo về pool chung. Các moderator khác có thể tiếp nhận báo cáo này.'
        }
        
        toast({
          title: "Thành công",
          description: actionMessages[action],
          variant: "success"
        });
        
        // Refresh reports list to get updated status
        await fetchStatusCounts();
        // Refresh the reports data to update UI immediately
        await refetch();
        return;
      }

      // Handle normal report actions
      const mappedAction = action === 'resolve' ? 'resolve' : action === 'dismiss' ? 'dismiss' : 'escalate'
      const result = await updateReportStatus(reportId, mappedAction, notes)
      
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
      
    } catch (error: any) {
      console.error('Error in handleAction:', error)
      const errorMessage = error?.message || 'Có lỗi không mong đợi xảy ra'
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const filteredReports = React.useMemo(() => {
    if (!searchQuery) return reports
    
    return reports.filter(report =>
      report.placeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporterInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [reports, searchQuery])

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

  const getSLAStatus = (createdAt: string, reportType: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const hoursAgo = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    
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
              ) : filteredReports.length === 0 ? (
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
                  {filteredReports.map((report) => {
                    const statusInfo = statusConfig[report.status as keyof typeof statusConfig] || statusConfig.pending
                    const reportType = report.reportType || 'other'
                    const typeInfo = reportTypeConfig[reportType as keyof typeof reportTypeConfig] || reportTypeConfig.other
                    const slaStatus = getSLAStatus(report.createdAt, reportType)
                    
                    return (
                      <Card key={report.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-200">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-start gap-4">
                            {/* Place/Content Preview */}
                            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm border-2 border-red-100 relative">
                              <MapPin className="h-7 w-7 text-red-600" />
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
                                    Báo cáo: {report.placeName || 'Địa điểm bị báo cáo'}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-2">
                                    <span className="font-medium">Lý do:</span> {report.reason || 'Không có lý do cụ thể'}
                                  </p>
                                  {report.description && (
                                    <div className="bg-gray-50 rounded-md p-2 mb-2">
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-800">Chi tiết báo cáo:</span>
                                        <span className="text-gray-700 ml-1">{report.description}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 ml-4">
                                  <Badge className={cn("text-xs font-medium shadow-sm", statusInfo.color)}>
                                    <statusInfo.icon className="w-3 h-3 mr-1" />
                                    {statusInfo.label}
                                  </Badge>
                                  <Badge className={cn("text-xs font-medium shadow-sm", typeInfo.color)}>
                                    <typeInfo.icon className="w-3 h-3 mr-1" />
                                    {typeInfo.label}
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
                                  <span>Báo cáo từ: {report.reporterInfo?.name || 'Người dùng ẩn danh'}</span>
                                  <UserRoleDisplay 
                                    role={report.reporterInfo?.role || 'traveler'}
                                    variant="compact"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(report.createdAt)}</span>
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
                                    <div className={cn(
                                      "text-sm font-medium",
                                      reportType === 'safety_legal' ? "text-red-800" : "text-orange-800"
                                    )}>
                                      {reportType === 'safety_legal' 
                                        ? 'Báo cáo ưu tiên cao - Cần xử lý ngay lập tức'
                                        : 'Cảnh báo: Báo cáo đã quá hạn SLA'
                                      }
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Reviewer Info - Enhanced */}
                              {report.reviewerInfo && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="text-sm flex items-center flex-wrap gap-2">
                                        <span className="font-medium text-blue-800">Đang được điều tra bởi:</span>
                                        <span className="text-blue-700">{report.reviewerInfo.name}</span>
                                        <UserRoleDisplay 
                                          role={report.reviewerInfo.role}
                                          variant="compact"
                                        />
                                      </div>
                                      {report.claimedAt && (
                                        <p className="text-xs text-blue-600 mt-1">
                                          <span className="font-medium">Tiếp nhận lúc:</span> {formatDate(report.claimedAt)}
                                        </p>
                                      )}
                                      {report.reviewNotes && (
                                        <p className="text-sm text-blue-600 mt-1">
                                          <span className="font-medium">Ghi chú điều tra:</span> {report.reviewNotes}
                                        </p>
                                      )}
                                    </div>
                                    
                                    {/* Show lock icon if claimed by someone else */}
                                    {report.reviewerInfo.id !== user?.id && (
                                      <div className="flex items-center text-blue-600 ml-2">
                                        <adminIcons.status.warning className="h-4 w-4" />
                                        <span className="text-xs ml-1">Đã khóa</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Warning for reports assigned to someone else */}
                              {status === 'in_review' && report.reviewerInfo && report.reviewerInfo.id !== user?.id && (
                                <div className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
                                  <div className="flex items-center gap-2">
                                    <adminIcons.status.warning className="h-4 w-4 text-orange-600" />
                                    <div className="text-sm text-orange-800">
                                      <span className="font-medium">Báo cáo này đã được tiếp nhận bởi người khác.</span> 
                                      Chỉ người tiếp nhận mới có thể xử lý hoặc trả về pool.
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <Button size="sm" variant="outline" asChild className="hover:shadow-md transition-all duration-200">
                                  <Link href={`/places/${report.placeId}`} target="_blank">
                                    <Eye className="w-4 h-4 mr-1 md:mr-2" />
                                    <span className="hidden sm:inline">Xem địa điểm</span>
                                  </Link>
                                </Button>

                                {/* Action buttons based on status and role */}
                                {status === 'pending' && (
                                  // Pending reports: show Claim button
                                  <AdminApproveDialog
                                    title="Tiếp nhận báo cáo"
                                    description={`Bạn có muốn tiếp nhận và điều tra báo cáo này không? Báo cáo sẽ được chuyển sang trạng thái "Đang điều tra" và được khóa cho bạn xử lý.`}
                                    itemName={`báo cáo về "${report.placeName}"`}
                                    onConfirm={() => handleAction(report.id, 'claim')}
                                    trigger={
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                      >
                                        <adminIcons.status.pending className="w-4 h-4 mr-2" />
                                        Tiếp nhận điều tra
                                      </Button>
                                    }
                                  />
                                )}

                                {status === 'in_review' && (
                                  // In review reports: only show actions if user owns the report or is admin
                                  <>
                                    {(report.reviewerInfo?.id === user?.id || user?.role === 'admin') && (
                                      <>
                                        <AdminApproveDialog
                                          itemName={`báo cáo về "${report.placeName}"`}
                                          onConfirm={() => handleAction(report.id, 'resolve')}
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
                                          title="Bỏ qua báo cáo"
                                          description="Bạn có chắc chắn muốn bỏ qua báo cáo này không? Báo cáo sẽ được đánh dấu là 'Đã bỏ qua' và người báo cáo sẽ nhận được thông báo."
                                          onConfirm={(reason) => handleAction(report.id, 'dismiss', reason)}
                                          trigger={
                                            <Button 
                                              size="sm"
                                              variant="outline" 
                                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                                            >
                                              <adminIcons.status.error className="w-4 h-4 mr-2" />
                                              Bỏ qua báo cáo
                                            </Button>
                                          }
                                        />
                                        
                                        {/* Only show Escalate for Moderator who owns the report, Admin can handle directly */}
                                        {user?.role === 'moderator' && report.reviewerInfo?.id === user?.id && (
                                          <AdminEscalateDialog
                                            onConfirm={(reason) => handleAction(report.id, 'escalate', reason)}
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
                                        )}

                                        {/* Delete Place option for severe reports */}
                                        {(reportType === 'safety_legal' || slaStatus.status === 'overdue') && (
                                          <AdminRejectDialog
                                            title="Xóa địa điểm"
                                            description="Bạn có chắc chắn muốn yêu cầu xóa địa điểm này? Địa điểm sẽ được chuyển sang trạng thái 'Chờ xóa' và cần Admin duyệt."
                                            onConfirm={(reason) => handleAction(report.id, 'request_delete', reason)}
                                            trigger={
                                              <Button 
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                              >
                                                <adminIcons.actions.delete className="w-4 h-4 mr-2" />
                                                Yêu cầu xóa
                                              </Button>
                                            }
                                          />
                                        )}
                                      </>
                                    )}

                                    {/* Release claim - only show to report owner */}
                                    {report.reviewerInfo?.id === user?.id && (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                          >
                                            <adminIcons.system.close className="w-4 h-4 mr-2" />
                                            Trả về pool
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Trả báo cáo về pool chung</DialogTitle>
                                            <DialogDescription>
                                              Bạn có muốn trả báo cáo này về pool chung không?
                                              <br/><br/>
                                              Báo cáo sẽ chuyển về trạng thái <strong>"Chờ xử lý"</strong> để các moderator khác có thể tiếp nhận và xử lý tiếp. 
                                              Điều này hữu ích khi bạn bận hoặc cần người khác có chuyên môn phù hợp hơn.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <DialogFooter>
                                            <Button variant="outline" onClick={() => {}}>Hủy</Button>
                                            <Button 
                                              className="bg-orange-600 hover:bg-orange-700"
                                              onClick={() => handleAction(report.id, 'release')}
                                            >
                                              Xác nhận trả về pool
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    )}

                                    {/* Admin override - allow admin to reassign even if claimed by someone else */}
                                    {user?.role === 'admin' && report.reviewerInfo?.id !== user?.id && (
                                      <AdminApproveDialog
                                        title="Tiếp quản báo cáo"
                                        description={`Báo cáo này đang được xử lý bởi ${report.reviewerInfo?.name}. Bạn có muốn tiếp quản báo cáo này không?`}
                                        itemName={`báo cáo từ ${report.reviewerInfo?.name}`}
                                        onConfirm={() => handleAction(report.id, 'claim')}
                                        trigger={
                                          <Button 
                                            size="sm"
                                            variant="outline"
                                            className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                          >
                                            <adminIcons.status.warning className="w-4 h-4 mr-2" />
                                            Tiếp quản (Admin)
                                          </Button>
                                        }
                                      />
                                    )}
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
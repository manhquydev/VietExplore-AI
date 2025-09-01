"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Users, Eye } from "lucide-react"
import { adminIcons } from "@/lib/admin/icon-system"
import { adminClasses } from "@/lib/admin/theme-utils"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useModerationQueue } from "@/hooks/use-admin"
import { useToast } from "@/components/providers/toast-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { apiClient } from "@/lib/client/api"
import { AdminTableSkeleton, AdminLoading, AdminErrorState, AdminEmptyState } from "@/components/admin/loading-states"
import { AdminApproveDialog, AdminRejectDialog, AdminEscalateDialog } from "@/components/admin/confirmation-dialogs"

const statusConfig = {
  pending: { 
    label: "Chờ xử lý", 
    variant: "warning" as const, 
    icon: adminIcons.status.pending,
    color: "admin-status-warning"
  },
  in_review: { 
    label: "Đang xem xét", 
    variant: "default" as const, 
    icon: adminIcons.actions.view,
    color: "admin-status-info"
  },
  approved: { 
    label: "Đã phê duyệt", 
    variant: "success" as const, 
    icon: adminIcons.status.success,
    color: "admin-status-success"
  },
  rejected: { 
    label: "Bị từ chối", 
    variant: "destructive" as const, 
    icon: adminIcons.status.error,
    color: "admin-status-error"
  },
  escalated: { 
    label: "Đã leo thang", 
    variant: "secondary" as const, 
    icon: adminIcons.status.warning,
    color: "bg-admin-info-50 text-admin-info-700 border-admin-info-200"
  }
}

const priorityConfig = {
  low: { label: "Low", color: "text-gray-600 bg-gray-50" },
  medium: { label: "Medium", color: "text-blue-600 bg-blue-50" },
  high: { label: "High", color: "text-orange-600 bg-orange-50" },
  urgent: { label: "Urgent", color: "text-red-600 bg-red-50" }
}

export default function AdminModerationPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [selectedStatus, setSelectedStatus] = React.useState<string>('pending')
  const [selectedQueue, setSelectedQueue] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusCounts, setStatusCounts] = React.useState<{[key: string]: number}>({})

  // Build filters
  const queueFilters = React.useMemo(() => {
    const filters: any = { status: selectedStatus }
    if (selectedQueue !== 'all') {
      filters.queueType = selectedQueue
    }
    return filters
  }, [selectedStatus, selectedQueue])

  const { items, loading, error, reviewItem } = useModerationQueue(queueFilters)

  // Fetch status counts for better UX
  const fetchStatusCounts = React.useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    try {
      const statuses = ['pending', 'in_review', 'approved', 'rejected', 'escalated']
      const counts: {[key: string]: number} = {}

      for (const status of statuses) {
        const filters: any = { status }
        if (selectedQueue !== 'all') {
          filters.queueType = selectedQueue
        }
        const result = await apiClient.moderation.queue.list(filters)
        counts[status] = result.data?.length || 0
      }

      setStatusCounts(counts)
    } catch (error) {
      console.error('Error fetching status counts:', error)
    }
  }, [selectedQueue, user])

  React.useEffect(() => {
    fetchStatusCounts()
  }, [fetchStatusCounts])

  const handleAction = async (
    itemId: string, 
    action: 'approve' | 'reject' | 'escalate',
    notes?: string
  ) => {
    try {
      const result = await reviewItem(itemId, action, notes)
      if (result && result.success) {
        const actionMessages = {
          'approve': 'Nội dung đã được phê duyệt thành công',
          'reject': 'Nội dung đã bị từ chối',
          'escalate': 'Nội dung đã được chuyển lên cấp cao hơn'
        }
        toast.success(actionMessages[action as keyof typeof actionMessages] || 'Hành động đã được thực hiện thành công')
        
        // Force refresh both status counts and items list
        await fetchStatusCounts()
        
        // Force re-fetch the items by triggering a dependency change
        // The useModerationQueue hook will re-run when its dependencies change
        window.dispatchEvent(new CustomEvent('moderationUpdated'))
      } else {
        toast.error(`Lỗi: ${result?.error || 'Có lỗi xảy ra khi thực hiện hành động'}`)
      }
    } catch (error) {
      console.error('Error in handleAction:', error)
      toast.error('Có lỗi không mong đợi xảy ra')
    }
  }

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items
    
    return items.filter(item =>
      item.contentDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submitter?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const actions = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1 sm:flex-none">
        <adminIcons.utility.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-admin-neutral-400" />
        <Input
          placeholder="Tìm kiếm mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-input pl-10 w-full sm:w-64"
        />
      </div>
      <Select value={selectedQueue} onValueChange={setSelectedQueue}>
        <SelectTrigger className="w-full sm:w-48 admin-input">
          <SelectValue placeholder="Loại hàng đợi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <adminIcons.utility.filter className="h-3 w-3" />
              Tất cả hàng đợi
            </div>
          </SelectItem>
          <SelectItem value="contributor_queue">
            <div className="flex items-center gap-2">
              <adminIcons.navigation.users className="h-3 w-3" />
              Cộng tác viên
            </div>
          </SelectItem>
          <SelectItem value="partner_queue">
            <div className="flex items-center gap-2">
              <adminIcons.content.external className="h-3 w-3" />
              Đối tác
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="admin-page-title">Hàng đợi kiểm duyệt</h1>
          <p className="admin-body-text max-w-2xl">Xem xét và quản lý nội dung được gửi từ cộng đồng</p>
        </div>
        <div className="flex-shrink-0">
          {actions}
        </div>
      </div>
      <div className="space-y-6">
        {/* Trạng thái Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <div className="admin-card p-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-admin-neutral-50 p-1 rounded-lg">
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
                <AdminTableSkeleton rows={3} />
              ) : error ? (
                <AdminErrorState
                  title="Lỗi tải dữ liệu kiểm duyệt"
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
                  title={`Không có mục ${config.label.toLowerCase()}`}
                  description={
                    searchQuery 
                      ? "Thử điều chỉnh từ khóa tìm kiếm hoặc xóa bộ lọc"
                      : `Chưa có mục nào ở trạng thái này trong hàng đợi`
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
                    
                    return (
                      <Card key={item.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-200">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-start gap-4">
                            {/* Content Preview */}
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                              {item.contentDetails?.images?.[0] ? (
                                <img 
                                  src={item.contentDetails.images[0].url} 
                                  alt=""
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <MapPin className="h-6 w-6 text-gray-500" />
                              )}
                            </div>

                            {/* Content Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                    {item.itemType === 'place_edit' && '✏️ '}
                                    {item.itemType === 'place_deletion' && '🗑️ '}
                                    {item.contentDetails?.name || 'Untitled'}
                                  </h3>
                                  <p className="text-gray-600 text-sm line-clamp-2">
                                    {item.itemType === 'place_edit' && 'Yêu cầu chỉnh sửa địa điểm đã xuất bản'}
                                    {item.itemType === 'place_deletion' && `Yêu cầu xóa địa điểm: ${item.metadata?.reason || 'Không có lý do cụ thể'}`}
                                    {!item.itemType && (item.contentDetails?.shortDescription || 'No description')}
                                  </p>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 ml-4">
                                  <Badge className={cn("text-xs font-medium shadow-sm", statusInfo?.color)}>
                                    <statusInfo.icon className="w-3 h-3 mr-1" />
                                    {statusInfo?.label}
                                  </Badge>
                                  {item.itemType === 'place_edit' && (
                                    <Badge className="text-xs font-medium shadow-sm bg-yellow-100 text-yellow-800">
                                      Chỉnh sửa
                                    </Badge>
                                  )}
                                  {item.itemType === 'place_deletion' && (
                                    <Badge className="text-xs font-medium shadow-sm bg-red-100 text-red-800">
                                      Yêu cầu xóa
                                    </Badge>
                                  )}
                                  {item.priority && (
                                    <Badge className={cn("text-xs font-medium shadow-sm", priorityConfig[item.priority as keyof typeof priorityConfig]?.color)}>
                                      {priorityConfig[item.priority as keyof typeof priorityConfig]?.label}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Meta Info */}
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{item.submitter?.fullName || 'Unknown'}</span>
                                  <UserRoleDisplay 
                                    role={item.submitter?.role || 'traveler'}
                                    variant="compact"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(item.submittedAt)}</span>
                                </div>
                                {item.queueType && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.queueType === 'partner_queue' ? '🏢 Đối tác' : '👥 Cộng tác viên'}
                                  </Badge>
                                )}
                              </div>

                              {/* Special info for deletion requests */}
                              {item.itemType === 'place_deletion' && item.metadata?.reason && (
                                <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-100">
                                  <p className="text-sm">
                                    <span className="font-medium text-red-800">Lý do xóa:</span>
                                    <span className="text-red-700 ml-1">{item.metadata.reason}</span>
                                  </p>
                                </div>
                              )}

                              {/* Reviewer Info */}
                              {item.reviewer && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                  <p className="text-sm">
                                    <span className="font-medium">Reviewed by:</span> {item.reviewer.fullName}
                                  </p>
                                  {item.reviewNotes && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      <span className="font-medium">Notes:</span> {item.reviewNotes}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Hành động */}
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <Button size="sm" variant="outline" asChild className="hover:shadow-md transition-all duration-200">
                                  <Link href={`/moderation/review/${item.id}`}>
                                    <Eye className="w-4 h-4 mr-1 md:mr-2" />
                                    <span className="hidden sm:inline">Xem xét</span>
                                  </Link>
                                </Button>

                                {status === 'pending' && (
                                  <>
                                    <AdminApproveDialog
                                      itemName={item.contentDetails?.name || 'nội dung này'}
                                      onConfirm={() => handleAction(item.id, 'approve')}
                                      trigger={
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          className="text-green-600 border-green-600 hover:bg-green-50"
                                        >
                                          <adminIcons.status.success className="w-4 h-4 mr-2" />
                                          {item.itemType === 'place_edit' ? 'Duyệt chỉnh sửa' : 
                                           item.itemType === 'place_deletion' ? 'Duyệt xóa' : 'Phê duyệt'}
                                        </Button>
                                      }
                                    />
                                    <AdminRejectDialog
                                      onConfirm={(reason) => handleAction(item.id, 'reject', reason)}
                                      trigger={
                                        <Button 
                                          size="sm"
                                          variant="outline" 
                                          className="text-red-600 border-red-600 hover:bg-red-50"
                                        >
                                          <adminIcons.status.error className="w-4 h-4 mr-2" />
                                          {item.itemType === 'place_edit' ? 'Từ chối chỉnh sửa' : 
                                           item.itemType === 'place_deletion' ? 'Từ chối xóa' : 'Từ chối'}
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
                                          Leo thang
                                        </Button>
                                      }
                                    />
                                  </>
                                )}

                                {status === 'in_review' && (
                                  <>
                                    <AdminApproveDialog
                                      itemName={item.contentDetails?.name || 'nội dung này'}
                                      onConfirm={() => handleAction(item.id, 'approve')}
                                      trigger={
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          className="text-green-600 border-green-600 hover:bg-green-50"
                                        >
                                          <adminIcons.status.success className="w-4 h-4 mr-2" />
                                          {item.itemType === 'place_edit' ? 'Duyệt chỉnh sửa' : 
                                           item.itemType === 'place_deletion' ? 'Duyệt xóa' : 'Phê duyệt'}
                                        </Button>
                                      }
                                    />
                                    <AdminRejectDialog
                                      onConfirm={(reason) => handleAction(item.id, 'reject', reason)}
                                      trigger={
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 border-red-600 hover:bg-red-50" 
                                        >
                                          <adminIcons.status.error className="w-4 h-4 mr-2" />
                                          {item.itemType === 'place_edit' ? 'Từ chối chỉnh sửa' : 
                                           item.itemType === 'place_deletion' ? 'Từ chối xóa' : 'Từ chối'}
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
                                          Leo thang
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
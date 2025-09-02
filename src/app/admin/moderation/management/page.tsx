"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Users, Eye, Edit3, Trash2, AlertTriangle } from "lucide-react"
import { adminIcons } from "@/lib/admin/icon-system"
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
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  in_review: { 
    label: "Đang xem xét", 
    variant: "default" as const, 
    icon: adminIcons.actions.view,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  approved: { 
    label: "Đã chấp thuận", 
    variant: "success" as const, 
    icon: adminIcons.status.success,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  rejected: { 
    label: "Bị từ chối", 
    variant: "destructive" as const, 
    icon: adminIcons.status.error,
    color: "bg-red-100 text-red-800 border-red-200"
  }
}

const requestTypeConfig = {
  place_edit: {
    label: "Chỉnh sửa địa điểm",
    icon: Edit3,
    color: "bg-orange-100 text-orange-800",
    description: "Yêu cầu chỉnh sửa thông tin địa điểm đã được xuất bản"
  },
  place_deletion: {
    label: "Xóa địa điểm", 
    icon: Trash2,
    color: "bg-red-100 text-red-800",
    description: "Yêu cầu xóa địa điểm khỏi hệ thống"
  }
}

export default function PlaceManagementPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [selectedStatus, setSelectedStatus] = React.useState<string>('pending')
  const [selectedType, setSelectedType] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusCounts, setStatusCounts] = React.useState<{[key: string]: number}>({})

  // Build filters for place edits and deletions only
  const queueFilters = React.useMemo(() => {
    const filters: any = { 
      status: selectedStatus,
      itemType: selectedType === 'all' ? ['place_edit', 'place_deletion'] : [selectedType]
    }
    return filters
  }, [selectedStatus, selectedType])

  const { items, loading, error, reviewItem } = useModerationQueue(queueFilters)

  // Fetch status counts for place management requests
  const fetchStatusCounts = React.useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    try {
      const statuses = ['pending', 'in_review', 'approved', 'rejected']
      const counts: {[key: string]: number} = {}

      for (const status of statuses) {
        const filters: any = { 
          status,
          itemType: ['place_edit', 'place_deletion']
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
    action: 'approve' | 'reject' | 'escalate',
    notes?: string
  ) => {
    try {
      const result = await reviewItem(itemId, action, notes)
      if (result && result.success) {
        const actionMessages = {
          'approve': 'Yêu cầu đã được chấp thuận và thực hiện',
          'reject': 'Yêu cầu đã bị từ chối',
          'escalate': 'Yêu cầu đã được chuyển lên Admin xử lý'
        }
        toast.success(actionMessages[action as keyof typeof actionMessages] || 'Hành động đã được thực hiện thành công')
        
        await fetchStatusCounts()
        window.dispatchEvent(new CustomEvent('moderationUpdated'))
      } else {
        const errorMessage = result?.error || 'Có lỗi xảy ra khi thực hiện hành động'
        toast.error(`Lỗi: ${errorMessage}`)
      }
    } catch (error: any) {
      console.error('Error in handleAction:', error)
      const errorMessage = error?.error || error?.message || 'Có lỗi không mong đợi xảy ra'
      toast.error(`Lỗi: ${errorMessage}`)
    }
  }

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items
    
    return items.filter(item =>
      item.contentDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submitter?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.reason?.toLowerCase().includes(searchQuery.toLowerCase())
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
          placeholder="Tìm kiếm yêu cầu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-input pl-10 w-full sm:w-64"
        />
      </div>
      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="w-full sm:w-48 admin-input">
          <SelectValue placeholder="Loại yêu cầu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <adminIcons.utility.filter className="h-3 w-3" />
              Tất cả yêu cầu
            </div>
          </SelectItem>
          <SelectItem value="place_edit">
            <div className="flex items-center gap-2">
              <Edit3 className="h-3 w-3" />
              Chỉnh sửa địa điểm
            </div>
          </SelectItem>
          <SelectItem value="place_deletion">
            <div className="flex items-center gap-2">
              <Trash2 className="h-3 w-3" />
              Xóa địa điểm
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
          <h1 className="admin-page-title flex items-center gap-3">
            <adminIcons.navigation.settings className="h-8 w-8 text-admin-primary-600" />
            Quản lý Địa điểm
          </h1>
          <p className="admin-body-text max-w-2xl">Xử lý yêu cầu chỉnh sửa và xóa địa điểm từ người đăng và cộng đồng</p>
          <div className="flex items-center gap-4 text-sm text-admin-neutral-600">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Yêu cầu xóa có SLA 72 giờ</span>
            </div>
            <div className="flex items-center gap-1">
              <Edit3 className="h-4 w-4 text-blue-500" />
              <span>Chỉnh sửa áp dụng hệ thống versioning</span>
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
              {Object.entries(statusConfig).map(([status, config]) => {
                if (!config || !config.icon) return null
                return (
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
                )
              })}
            </TabsList>
          </div>

          {Object.entries(statusConfig).map(([status, config]) => {
            if (!config || !config.icon) return null
            return (
            <TabsContent key={status} value={status} className="space-y-4">
              {loading ? (
                <AdminTableSkeleton rows={3} />
              ) : error ? (
                <AdminErrorState
                  title="Lỗi tải yêu cầu quản lý địa điểm"
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
                  title={`Không có yêu cầu ${config.label.toLowerCase()}`}
                  description={
                    searchQuery 
                      ? "Thử điều chỉnh từ khóa tìm kiếm hoặc xóa bộ lọc"
                      : `Chưa có yêu cầu nào ở trạng thái này`
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
                    const typeInfo = requestTypeConfig[item.itemType as keyof typeof requestTypeConfig]
                    
                    // Skip items with missing config
                    if (!statusInfo || !typeInfo) {
                      console.warn('Missing config for item:', item.id, 'status:', item.status, 'itemType:', item.itemType)
                      return null
                    }
                    
                    return (
                      <Card key={item.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-200">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-start gap-4">
                            {/* Place Preview */}
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm border-2 border-gray-100 relative">
                              {item.contentDetails?.images?.[0] ? (
                                <img 
                                  src={item.contentDetails.images[0].url} 
                                  alt=""
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <MapPin className="h-7 w-7 text-gray-500" />
                              )}
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center">
                                {typeInfo?.icon && <typeInfo.icon className="h-3 w-3 text-gray-600" />}
                              </div>
                            </div>

                            {/* Request Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                    {item.contentDetails?.name || 'Địa điểm không tên'}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-2">
                                    {typeInfo.description}
                                  </p>
                                  {item.metadata?.reason && (
                                    <div className="bg-gray-50 rounded-md p-2 mb-2">
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-800">Lý do:</span>
                                        <span className="text-gray-700 ml-1">{item.metadata.reason}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 ml-4">
                                  <Badge className={cn("text-xs font-medium shadow-sm", statusInfo?.color)}>
                                    {statusInfo?.icon && <statusInfo.icon className="w-3 h-3 mr-1" />}
                                    {statusInfo?.label}
                                  </Badge>
                                  <Badge className={cn("text-xs font-medium shadow-sm", typeInfo?.color)}>
                                    {typeInfo?.icon && <typeInfo.icon className="w-3 h-3 mr-1" />}
                                    {typeInfo?.label}
                                  </Badge>
                                </div>
                              </div>

                              {/* Meta Info */}
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{item.submitter?.fullName || 'Không rõ'}</span>
                                  <UserRoleDisplay 
                                    role={item.submitter?.role || 'traveler'}
                                    variant="compact"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(item.submittedAt)}</span>
                                </div>
                                {item.itemType === 'place_deletion' && (
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    <span className="text-orange-600 font-medium">Yêu cầu xóa</span>
                                  </div>
                                )}
                              </div>

                              {/* Version Information for Edits */}
                              {item.itemType === 'place_edit' && item.metadata?.changes && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
                                  <p className="text-sm font-medium text-blue-800 mb-1">Thay đổi được đề xuất:</p>
                                  <ul className="text-sm text-blue-700 space-y-1">
                                    {Object.entries(item.metadata.changes).map(([field, change]) => (
                                      <li key={field} className="flex">
                                        <span className="font-medium capitalize mr-2">{field}:</span>
                                        <span className="truncate">{String(change)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Deletion Warning */}
                              {item.itemType === 'place_deletion' && (
                                <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-100">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <p className="text-sm font-medium text-red-800">
                                      Cảnh báo: Hành động này sẽ ẩn địa điểm khỏi công khai
                                    </p>
                                  </div>
                                  <p className="text-xs text-red-600 mt-1">
                                    Dữ liệu vẫn được lưu trữ và có thể khôi phục bởi Admin
                                  </p>
                                </div>
                              )}

                              {/* Reviewer Info */}
                              {item.reviewer && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                  <p className="text-sm">
                                    <span className="font-medium">Đang được xử lý bởi:</span>
                                    <span className="ml-1">{item.reviewer.fullName}</span>
                                  </p>
                                  {item.reviewNotes && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      <span className="font-medium">Ghi chú:</span> {item.reviewNotes}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <Button size="sm" variant="outline" asChild className="hover:shadow-md transition-all duration-200">
                                  <Link href={`/moderation/review/${item.id}`}>
                                    <Eye className="w-4 h-4 mr-1 md:mr-2" />
                                    <span className="hidden sm:inline">Xem chi tiết</span>
                                  </Link>
                                </Button>

                                {(status === 'pending' || status === 'in_review') && (
                                  <>
                                    <AdminApproveDialog
                                      itemName={`${typeInfo.label.toLowerCase()} "${item.contentDetails?.name}"`}
                                      onConfirm={() => handleAction(item.id, 'approve')}
                                      trigger={
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          className="text-green-600 border-green-600 hover:bg-green-50"
                                        >
                                          <adminIcons.status.success className="w-4 h-4 mr-2" />
                                          {item.itemType === 'place_edit' ? 'Chấp thuận chỉnh sửa' : 'Chấp thuận xóa'}
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
                                          Từ chối
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
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}
"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Users, Eye, Clock } from "lucide-react"
import { adminIcons } from "@/lib/admin/icon-system"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useModerationQueue } from "@/hooks/use-admin"
import { toastService } from "@/lib/ui/toast-service"
import { auth } from "@/lib/firebase"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { apiClient } from "@/lib/client/api"
import { AdminTableSkeleton, AdminLoading, AdminErrorState, AdminEmptyState } from "@/components/admin/loading-states"
import { BrandedLoading, BrandedCardSkeleton } from "@/components/ui/branded-loading"
import { AdminApproveDialog, AdminRejectDialog, AdminEscalateDialog, AdminRequestEditDialog } from "@/components/admin/confirmation-dialogs"

// Chỉ các trạng thái cho NEW PLACE moderation queue
const statusConfig = {
  pending: { 
    label: "Chờ duyệt", 
    variant: "warning" as const, 
    icon: adminIcons.status.pending,
    color: "admin-status-warning"
  },
  claimed: {
    label: "Đã tiếp nhận",
    variant: "info" as const,
    icon: adminIcons.actions.view,
    color: "admin-status-info"
  },
  in_review: { 
    label: "Đang duyệt", 
    variant: "default" as const, 
    icon: adminIcons.actions.view,
    color: "admin-status-info"
  },
  approved: { 
    label: "Đã duyệt", 
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
  needs_revision: { 
    label: "Yêu cầu sửa", 
    variant: "secondary" as const, 
    icon: adminIcons.actions.edit,
    color: "admin-status-warning"
  }
}

const priorityConfig = {
  low: { label: "Thấp", color: "text-gray-600 bg-gray-50" },
  medium: { label: "Trung bình", color: "text-blue-600 bg-blue-50" },
  high: { label: "Cao", color: "text-orange-600 bg-orange-50" },
  urgent: { label: "Khẩn cấp", color: "text-red-600 bg-red-50" }
}

export default function NewPlaceQueuePage() {
  const { user } = useAuth()

  const [selectedStatus, setSelectedStatus] = React.useState<string>('pending')
  const [claimingItemId, setClaimingItemId] = React.useState<string | null>(null)
  const [selectedQueue, setSelectedQueue] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusCounts, setStatusCounts] = React.useState<{[key: string]: number}>({})
  const [timeOfDay, setTimeOfDay] = React.useState<'morning' | 'afternoon' | 'evening'>('morning')

  // Time of day greeting
  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay('morning')
    else if (hour < 18) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')
  }, [])

  // Build filters for NEW places only
  const queueFilters = React.useMemo(() => {
    const filters: any = {
      status: selectedStatus,
      itemType: 'new_place' // Only new place submissions
    }
    if (selectedQueue !== 'all') {
      filters.queueType = selectedQueue
    }
    return filters
  }, [selectedStatus, selectedQueue])

  const { items, loading, error, reviewItem } = useModerationQueue(queueFilters)

  // Fetch status counts for new places only
  const fetchStatusCounts = React.useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    try {
      const statuses = ['pending', 'claimed', 'in_review', 'approved', 'rejected', 'needs_revision']
      const counts: {[key: string]: number} = {}

      for (const status of statuses) {
        const filters: any = { 
          status,
          itemType: 'new_place'
        }
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

  const handleClaim = async (itemId: string) => {
    if (claimingItemId) return // Prevent double claiming - fixed TypeError
    
    setClaimingItemId(itemId)
    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        toastService.error('Lỗi', 'Vui lòng đăng nhập lại')
        return
      }

      const token = await firebaseUser.getIdToken()
      const response = await fetch(`/api/moderation/queue/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'claim' })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      if (result?.success) {
        toastService.success('Thành công', 'Đã tiếp nhận địa điểm để kiểm duyệt')
        await fetchStatusCounts()
        window.dispatchEvent(new CustomEvent('moderationUpdated'))
      } else {
        const errorMessage = result?.error || 'Có lỗi xảy ra khi tiếp nhận'
        toastService.error('Lỗi', errorMessage)
      }
    } catch (error: any) {
      console.error('Error claiming item:', error)
      const errorMessage = error?.message || 'Có lỗi không mong đợi xảy ra'
      toastService.error('Lỗi', errorMessage)
    } finally {
      setClaimingItemId(null)
    }
  }

  const handleAction = async (
    itemId: string, 
    action: 'approve' | 'reject' | 'escalate' | 'request_edit',
    notes?: string
  ) => {
    try {
      const result = await reviewItem(itemId, action, notes)
      if (result?.success) {
        const actionMessages = {
          'approve': 'Địa điểm mới đã được phê duyệt và xuất bản',
          'reject': 'Địa điểm mới đã bị từ chối',
          'escalate': 'Địa điểm đã được chuyển lên Admin xử lý',
          'request_edit': 'Đã gửi yêu cầu chỉnh sửa cho người đăng'
        }
        toastService.success('Thành công', actionMessages[action as keyof typeof actionMessages] || 'Hành động đã được thực hiện thành công')

        await fetchStatusCounts()
        window.dispatchEvent(new CustomEvent('moderationUpdated'))
      } else {
        const errorMessage = result?.error || 'Có lỗi xảy ra khi thực hiện hành động'
        toastService.error('Lỗi', errorMessage)
      }
    } catch (error: any) {
      console.error('Error in handleAction:', error)
      const errorMessage = error?.message || 'Có lỗi không mong đợi xảy ra'
      toastService.error('Lỗi', errorMessage)
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

  const getTimeAgo = (dateString: string) => {
    try {
      const now = new Date()
      const submitted = new Date(dateString)
      const diffInHours = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Mới gửi'
      if (diffInHours < 24) return `${diffInHours} giờ trước`
      return `${Math.floor(diffInHours / 24)} ngày trước`
    } catch {
      return 'N/A'
    }
  }

  const actions = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1 sm:flex-none">
        <adminIcons.utility.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-admin-neutral-400" />
        <Input
          placeholder="Tìm kiếm địa điểm mới..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-input pl-10 w-full sm:w-64"
        />
      </div>
      <Select value={selectedQueue} onValueChange={setSelectedQueue}>
        <SelectTrigger className="w-full sm:w-48 admin-input">
          <SelectValue placeholder="Hàng đợi" />
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
              Đối tác cộng đồng
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  const getGreeting = () => {
    const greetings = {
      morning: '🌅 Chào buổi sáng',
      afternoon: '☀️ Chào buổi chiều',
      evening: '🌙 Chào buổi tối'
    }
    return greetings[timeOfDay]
  }

  const totalPending = statusCounts['pending'] || 0
  const totalClaimed = statusCounts['claimed'] || 0
  const totalApproved = statusCounts['approved'] || 0

  return (
    <div className="space-y-6">
      {/* Vietnam Travel Themed Header */}
      <div className="bg-gradient-to-r from-green-100 via-yellow-50 to-green-100 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center shadow-xl border-2 border-yellow-300">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-800 mb-1">
                {getGreeting()}, {user?.fullName?.split(' ').slice(-1)[0] || 'Moderator'}!
              </h1>
              <p className="text-lg text-green-700 font-medium">
                Kiểm duyệt Địa điểm Mới từ Cộng đồng Du lịch Việt Nam 🇻🇳
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-green-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>SLA: 48h/địa điểm</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Max 10 địa điểm/moderator</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{totalPending}</div>
              <div className="text-xs text-gray-600">Chờ duyệt</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalClaimed}</div>
              <div className="text-xs text-gray-600">Đang xử lý</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalApproved}</div>
              <div className="text-xs text-gray-600">Đã duyệt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {actions}
      </div>
      <div className="space-y-6">
        {/* Status Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <div className="admin-card p-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-admin-neutral-50 p-1 rounded-lg">
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
                    <BrandedCardSkeleton key={i} showImage={true} lines={4} />
                  ))}
                </div>
              ) : error ? (
                <AdminErrorState
                  title="Lỗi tải danh sách địa điểm mới"
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
                  icon={config?.icon}
                  title={`Không có địa điểm ${config?.label?.toLowerCase() || 'này'}`}
                  description={
                    searchQuery 
                      ? "Thử điều chỉnh từ khóa tìm kiếm hoặc xóa bộ lọc"
                      : `Chưa có địa điểm mới nào ở trạng thái này`
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
                      <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-2 hover:border-green-200 bg-white overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-start gap-4">
                            {/* Place Preview with Vietnam Style */}
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg border-2 border-yellow-200 group-hover:border-yellow-300 transition-all">
                              {item.contentDetails?.images?.[0] ? (
                                <>
                                  <img
                                    src={item.contentDetails.images[0].url}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-yellow-500/20"></div>
                                </>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center">
                                  <MapPin className="h-8 w-8 text-green-600" />
                                </div>
                              )}
                            </div>

                            {/* Place Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-bold text-xl text-gray-900 mb-2 flex items-center gap-2 group-hover:text-green-700 transition-colors">
                                    <span className="text-2xl">🗺️</span>
                                    {item.contentDetails?.name || 'Chưa có tên'}
                                  </h3>
                                  <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                                    {item.contentDetails?.shortDescription || 'Chưa có mô tả'}
                                  </p>
                                  {item.contentDetails?.region && (
                                    <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200 w-fit">
                                      <MapPin className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-700">
                                        {item.contentDetails.region === 'bac-bo' ? '🏔️ Miền Bắc' :
                                         item.contentDetails.region === 'trung-bo' ? '☀️ Miền Trung' : '🌴 Miền Nam'}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 ml-4">
                                  <Badge className={cn("text-xs font-semibold shadow-md px-3 py-1.5", statusInfo?.color)}>
                                    {statusInfo && <statusInfo.icon className="w-3 h-3 mr-1" />}
                                    {statusInfo?.label}
                                  </Badge>
                                  <Badge className="text-xs font-semibold shadow-md px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                                    ✨ Địa điểm mới
                                  </Badge>
                                  {item.priority && (
                                    <Badge className={cn("text-xs font-semibold shadow-md px-3 py-1.5", priorityConfig[item.priority as keyof typeof priorityConfig]?.color)}>
                                      {priorityConfig[item.priority as keyof typeof priorityConfig]?.label}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Meta Info */}
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{item.submitter?.fullName || 'Không rõ'}</span>
                                  <UserRoleDisplay 
                                    role={item.submitter?.role || 'contributor'}
                                    variant="compact"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(item.submittedAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{getTimeAgo(item.submittedAt)}</span>
                                </div>
                              </div>

                              {/* Claim/Reviewer Info - Vietnam Style */}
                              {item.claimedBy && (
                                <div className={cn(
                                  "rounded-xl p-4 mb-4 border-2 shadow-sm",
                                  item.claimedBy === user?.id
                                    ? "bg-gradient-to-r from-green-50 to-yellow-50 border-green-300"
                                    : "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-300"
                                )}>
                                  <p className="text-sm font-medium">
                                    {item.claimedBy === user?.id ? (
                                      <>
                                        <span className="flex items-center gap-2 text-green-800 font-bold">
                                          ✅ Bạn đã tiếp nhận địa điểm này
                                        </span>
                                        <span className="text-green-700 block mt-1">
                                          Bạn có toàn quyền kiểm duyệt và quyết định
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="flex items-center gap-2 text-blue-800 font-bold">
                                          👤 Đã được tiếp nhận
                                        </span>
                                        <span className="text-blue-700 block mt-1">
                                          Moderator: {item.reviewer?.fullName || 'Kiểm duyệt viên'}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                  {item.claimedAt && (
                                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      <span className="font-medium">Thời gian:</span> {formatDate(item.claimedAt)}
                                    </p>
                                  )}
                                  {item.reviewNotes && (
                                    <p className="text-sm text-blue-700 mt-2 bg-white/50 rounded-lg p-2">
                                      <span className="font-bold">📝 Ghi chú:</span> {item.reviewNotes}
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

                                {/* Show Claim button only for pending items - Vietnam Style */}
                                {status === 'pending' && !item.claimedBy && (
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md font-semibold"
                                    disabled={claimingItemId === item.id}
                                    onClick={() => handleClaim(item.id)}
                                  >
                                    <adminIcons.actions.view className="w-4 h-4 mr-2" />
                                    {claimingItemId === item.id ? '⏳ Đang tiếp nhận...' : '🙋 Tiếp nhận ngay'}
                                  </Button>
                                )}

                                {/* Show action buttons only for claimed items - Vietnam Styled */}
                                {(status === 'claimed' || status === 'in_review') &&
                                 (item.claimedBy === user?.id || user?.role === 'admin') && (
                                  <>
                                    <AdminApproveDialog
                                      itemName={item.contentDetails?.name || 'địa điểm này'}
                                      onConfirm={() => handleAction(item.id, 'approve')}
                                      trigger={
                                        <Button
                                          size="sm"
                                          className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md font-semibold border-0"
                                        >
                                          <adminIcons.status.success className="w-4 h-4 mr-2" />
                                          ✅ Phê duyệt & Xuất bản
                                        </Button>
                                      }
                                    />
                                    <AdminRejectDialog
                                      onConfirm={(reason) => handleAction(item.id, 'reject', reason)}
                                      trigger={
                                        <Button
                                          size="sm"
                                          className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md font-semibold border-0"
                                        >
                                          <adminIcons.status.error className="w-4 h-4 mr-2" />
                                          ❌ Từ chối
                                        </Button>
                                      }
                                    />
                                    <AdminRequestEditDialog
                                      onConfirm={(reason) => handleAction(item.id, 'request_edit', reason)}
                                      trigger={
                                        <Button
                                          size="sm"
                                          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md font-semibold border-0"
                                        >
                                          <adminIcons.actions.edit className="w-4 h-4 mr-2" />
                                          ✏️ Yêu cầu sửa
                                        </Button>
                                      }
                                    />
                                    <AdminEscalateDialog
                                      onConfirm={(reason) => handleAction(item.id, 'escalate', reason)}
                                      trigger={
                                        <Button
                                          size="sm"
                                          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md font-semibold border-0"
                                        >
                                          <adminIcons.status.warning className="w-4 h-4 mr-2" />
                                          🚀 Chuyển Admin
                                        </Button>
                                      }
                                    />
                                  </>
                                )}

                                {/* Show release button for claimed items by current user */}
                                {status === 'claimed' && item.claimedBy === user?.id && (
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                    onClick={async () => {
                                      try {
                                        const firebaseUser = auth.currentUser
                                        if (!firebaseUser) {
                                          toastService.error('Lỗi', 'Vui lòng đăng nhập lại')
                                          return
                                        }

                                        const token = await firebaseUser.getIdToken()
                                        const response = await fetch(`/api/moderation/queue/${item.id}`, {
                                          method: 'PATCH',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                          },
                                          body: JSON.stringify({ action: 'release' })
                                        })

                                        if (!response.ok) {
                                          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                                        }

                                        const result = await response.json()
                                        if (result?.success) {
                                          toastService.success('Thành công', 'Đã bỏ tiếp nhận địa điểm')
                                          await fetchStatusCounts()
                                          window.dispatchEvent(new CustomEvent('moderationUpdated'))
                                        } else {
                                          const errorMessage = result?.error || 'Có lỗi xảy ra khi bỏ tiếp nhận'
                                          toastService.error('Lỗi', errorMessage)
                                        }
                                      } catch (error) {
                                        toastService.error('Lỗi', 'Không thể bỏ tiếp nhận')
                                      }
                                    }}
                                  >
                                    <adminIcons.actions.close className="w-4 h-4 mr-2" />
                                    Bỏ tiếp nhận
                                  </Button>
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
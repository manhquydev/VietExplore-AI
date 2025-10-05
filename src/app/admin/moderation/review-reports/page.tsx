"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Calendar, Users, Eye, Flag, Star } from "lucide-react"
import { adminIcons } from "@/lib/admin/icon-system"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { AdminErrorState, AdminEmptyState } from "@/components/admin/loading-states"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { AdminApproveDialog, AdminRejectDialog } from "@/components/admin/confirmation-dialogs"
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAuth } from 'firebase/auth'

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

const reasonLabels: Record<string, string> = {
  spam: "Spam/Quảng cáo",
  inappropriate: "Nội dung không phù hợp",
  offensive: "Ngôn từ xúc phạm",
  fake: "Đánh giá giả mạo",
  irrelevant: "Không liên quan",
  other: "Lý do khác"
}

interface ReviewReport {
  id: string
  reviewId: string
  placeId: string
  placeName: string
  reviewContent: string
  reviewRating: number
  reviewAuthorId: string
  reportedBy: string
  reporterName: string
  reporterEmail: string
  reason: string
  details: string
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed'
  createdAt: string
  updatedAt: string
}

export default function ReviewReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [selectedStatus, setSelectedStatus] = React.useState<string>('pending')
  const [reports, setReports] = React.useState<ReviewReport[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [statusCounts, setStatusCounts] = React.useState<{[key: string]: number}>({})

  // Fetch reports from Firestore
  const fetchReports = React.useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    setLoading(true)
    setError(null)

    try {
      const reportsRef = collection(db, 'review_reports')
      const q = query(
        reportsRef,
        where('status', '==', selectedStatus),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const reportsData: ReviewReport[] = []

      snapshot.forEach((doc) => {
        reportsData.push({
          id: doc.id,
          ...doc.data()
        } as ReviewReport)
      })

      setReports(reportsData)
      console.log(`[REVIEW REPORTS] Loaded ${reportsData.length} reports with status: ${selectedStatus}`)
    } catch (err) {
      console.error('[REVIEW REPORTS] Error fetching reports:', err)
      setError(err instanceof Error ? err.message : 'Lỗi khi tải báo cáo')
    } finally {
      setLoading(false)
    }
  }, [selectedStatus, user])

  // Fetch status counts
  const fetchStatusCounts = React.useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) return

    try {
      const counts: {[key: string]: number} = {}

      for (const status of ['pending', 'in_review', 'resolved', 'dismissed']) {
        const q = query(
          collection(db, 'review_reports'),
          where('status', '==', status)
        )
        const snapshot = await getDocs(q)
        counts[status] = snapshot.size
      }

      setStatusCounts(counts)
    } catch (err) {
      console.error('[REVIEW REPORTS] Error fetching counts:', err)
    }
  }, [user])

  React.useEffect(() => {
    fetchReports()
  }, [fetchReports])

  React.useEffect(() => {
    fetchStatusCounts()
  }, [fetchStatusCounts])

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

  const handleAction = async (
    reportId: string,
    action: 'claim' | 'release' | 'resolve' | 'dismiss' | 'remove_review',
    notes?: string
  ) => {
    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại để tiếp tục",
          variant: "destructive"
        })
        return
      }

      const token = await firebaseUser.getIdToken()

      // Handle claim and release actions
      if (action === 'claim' || action === 'release') {
        const response = await fetch(`/api/admin/review-reports/${reportId}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Thao tác thất bại')
        }

        const actionMessages = {
          'claim': 'Đã tiếp nhận báo cáo để điều tra. Báo cáo giờ được khóa cho bạn xử lý.',
          'release': 'Đã trả báo cáo về pool chung. Các moderator khác có thể tiếp nhận báo cáo này.'
        }

        toast({
          title: "Thành công",
          description: actionMessages[action],
          variant: "success"
        })

        await fetchStatusCounts()
        await fetchReports()
        return
      }

      // Handle remove review action
      if (action === 'remove_review') {
        const response = await fetch(`/api/admin/review-reports/${reportId}/remove-review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ notes })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Không thể xóa đánh giá')
        }

        toast({
          title: "Thành công",
          description: "Đánh giá đã bị xóa do vi phạm quy định",
          variant: "success"
        })

        await fetchStatusCounts()
        await fetchReports()
        return
      }

      // Handle normal report actions (resolve, dismiss)
      const response = await fetch(`/api/admin/review-reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, notes })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Thao tác thất bại')
      }

      const actionMessages = {
        'resolve': 'Báo cáo đã được xử lý và giải quyết',
        'dismiss': 'Báo cáo đã được bỏ qua'
      }

      toast({
        title: "Thành công",
        description: actionMessages[action as keyof typeof actionMessages] || 'Hành động đã được thực hiện thành công',
        variant: "success"
      })

      await fetchStatusCounts()
      await fetchReports()

    } catch (error: any) {
      console.error('[REVIEW REPORTS] Error in handleAction:', error)
      const errorMessage = error?.message || 'Có lỗi không mong đợi xảy ra'
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  if (!user || !['moderator', 'admin'].includes(user.role)) {
    return (
      <AdminErrorState
        title="Không có quyền truy cập"
        description="Bạn cần quyền Moderator hoặc Admin để xem trang này"
      />
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="admin-page-title flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-admin-primary-600" />
            Báo cáo Đánh giá
          </h1>
          <p className="admin-body-text max-w-2xl">Xử lý báo cáo vi phạm đánh giá từ cộng đồng</p>
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
                <BrandedLoading text="Đang tải báo cáo..." />
              ) : error ? (
                <AdminErrorState
                  title="Lỗi tải danh sách báo cáo"
                  description={error}
                  action={
                    <Button
                      variant="outline"
                      className="admin-btn-secondary"
                      onClick={() => fetchReports()}
                    >
                      <adminIcons.system.refresh className="h-4 w-4 mr-2" />
                      Thử lại
                    </Button>
                  }
                />
              ) : reports.length === 0 ? (
                <AdminEmptyState
                  icon={config.icon}
                  title={`Không có báo cáo ${config.label.toLowerCase()}`}
                  description="Chưa có báo cáo đánh giá nào ở trạng thái này"
                />
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => {
                    const statusInfo = statusConfig[report.status] || statusConfig.pending

                    return (
                      <Card key={report.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-200">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm border-2 border-orange-100 relative">
                              <MessageSquare className="h-7 w-7 text-orange-600" />
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
                                    Báo cáo đánh giá tại: {report.placeName}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={cn(
                                            "h-4 w-4",
                                            i < report.reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                          )}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600">({report.reviewRating}/5)</span>
                                  </div>
                                  <div className="bg-gray-50 rounded-md p-3 mb-2">
                                    <p className="text-sm text-gray-700 italic">"{report.reviewContent}"</p>
                                  </div>
                                  <p className="text-gray-600 text-sm mb-2">
                                    <span className="font-medium">Lý do báo cáo:</span> {reasonLabels[report.reason] || report.reason}
                                  </p>
                                  {report.details && (
                                    <div className="bg-yellow-50 rounded-md p-2 mb-2">
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-800">Chi tiết:</span>
                                        <span className="text-gray-700 ml-1">{report.details}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <Badge className={cn("text-xs font-medium shadow-sm ml-4", statusInfo.color)}>
                                  <statusInfo.icon className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                              </div>

                              {/* Meta Info */}
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>Báo cáo từ: {report.reporterName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(report.createdAt)}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <Button size="sm" variant="outline" asChild className="hover:shadow-md transition-all duration-200">
                                  <Link href={`/places/${report.placeId}`} target="_blank">
                                    <Eye className="w-4 h-4 mr-1 md:mr-2" />
                                    <span className="hidden sm:inline">Xem địa điểm</span>
                                  </Link>
                                </Button>

                                {/* Status: pending - Show claim button */}
                                {report.status === 'pending' && (
                                  <AdminApproveDialog
                                    title="Tiếp nhận báo cáo"
                                    description="Bạn muốn tiếp nhận báo cáo này để điều tra? Báo cáo sẽ được khóa cho bạn xử lý."
                                    itemName={`báo cáo từ ${report.reporterName}`}
                                    onConfirm={() => handleAction(report.id, 'claim')}
                                    trigger={
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                      >
                                        <adminIcons.actions.view className="w-4 h-4 mr-1 md:mr-2" />
                                        Tiếp nhận
                                      </Button>
                                    }
                                  />
                                )}

                                {/* Status: in_review - Show action buttons */}
                                {report.status === 'in_review' && (
                                  <>
                                    <AdminApproveDialog
                                      title="Giải quyết báo cáo"
                                      description="Xác nhận báo cáo đã được xử lý và giải quyết?"
                                      itemName="báo cáo này"
                                      onConfirm={() => handleAction(report.id, 'resolve')}
                                      trigger={
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-green-600 border-green-600 hover:bg-green-50"
                                        >
                                          <adminIcons.status.success className="w-4 h-4 mr-1 md:mr-2" />
                                          Giải quyết
                                        </Button>
                                      }
                                    />

                                    <AdminRejectDialog
                                      title="Bỏ qua báo cáo"
                                      description="Xác nhận bỏ qua báo cáo này (không hành động)?"
                                      onConfirm={(reason) => handleAction(report.id, 'dismiss', reason)}
                                      trigger={
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-gray-600 border-gray-600 hover:bg-gray-50"
                                        >
                                          <adminIcons.status.error className="w-4 h-4 mr-1 md:mr-2" />
                                          Bỏ qua
                                        </Button>
                                      }
                                    />

                                    <AdminRejectDialog
                                      title="Xóa đánh giá vi phạm"
                                      description="Xác nhận xóa đánh giá này do vi phạm quy định? Hành động này không thể hoàn tác."
                                      onConfirm={(reason) => handleAction(report.id, 'remove_review', reason)}
                                      trigger={
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 border-red-600 hover:bg-red-50"
                                        >
                                          <adminIcons.actions.delete className="w-4 h-4 mr-1 md:mr-2" />
                                          Xóa đánh giá
                                        </Button>
                                      }
                                    />

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                      onClick={() => handleAction(report.id, 'release')}
                                    >
                                      <adminIcons.system.close className="w-4 h-4 mr-1 md:mr-2" />
                                      Trả về pool
                                    </Button>
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

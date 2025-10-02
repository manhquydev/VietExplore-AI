"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useParams, notFound, useRouter } from "next/navigation"
import { PlaceDetailContent } from "@/components/place-detail-content"
import { useAuth } from "@/components/auth/auth-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ModerationHistory from "@/components/moderation-history"
import { apiClient } from "@/lib/client/api"
import { 
  ArrowLeft, 
  Eye, 
  Edit, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText,
  ChevronRight,
  ChevronLeft,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PlaceData {
  id: string
  name: string
  shortDescription: string
  description: string
  type: "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in"
  region: "bac-bo" | "trung-bo" | "nam-bo"
  province: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  images: Array<{
    id: string
    url: string
    alt: string
    caption?: string
    isPrimary: boolean
  }>
  video?: {
    id: string
    url: string
    thumbnail?: string
    duration?: number
  }
  openingHours?: string
  entryFee?: string
  bestTimeToVisit?: string
  facilities: string[]
  tags: string[]
  sources: Array<{
    type: "website" | "social" | "document" | "personal"
    url: string
    description: string
  }>
  trustLevel: "community" | "contributor" | "partner" | "verified"
  authorRole: "contributor" | "partner" | "admin"
  authorName: string
  createdAt: string
  updatedAt: string
  stats: {
    views: number
    likes: number
    saves: number
    reviews: number
  }
}

const statusConfig = {
  draft: { 
    label: "Bản nháp", 
    variant: "secondary" as const, 
    icon: FileText,
    description: "Chưa gửi duyệt",
    color: "text-gray-600"
  },
  submitted: { 
    label: "Đã gửi", 
    variant: "default" as const, 
    icon: Clock,
    description: "Đang chờ kiểm duyệt",
    color: "text-blue-600"
  },
  in_review: { 
    label: "Đang duyệt", 
    variant: "warning" as const, 
    icon: Eye,
    description: "Kiểm duyệt viên đang xem xét",
    color: "text-yellow-600"
  },
  published: { 
    label: "Đã xuất bản", 
    variant: "success" as const, 
    icon: CheckCircle,
    description: "Địa điểm đã được phê duyệt và xuất bản",
    color: "text-green-600"
  },
  rejected: { 
    label: "Từ chối", 
    variant: "danger" as const, 
    icon: XCircle,
    description: "Địa điểm bị từ chối",
    color: "text-red-600"
  }
}

export default function DraftPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [place, setPlace] = React.useState<PlaceData | null>(null)
  const [draft, setDraft] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  const draftId = params.id as string

  React.useEffect(() => {
    // Don't proceed if auth state hasn't been determined yet
    if (authLoading) {
      return
    }
    
    if (isAuthenticated === undefined) {
      return
    }
    
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    // Wait for Firebase auth to be ready
    if (!user) {
      return
    }

    async function loadDraftPreview() {
      try {
        setLoading(true)
        setError(null)

        // Ensure user is authenticated before making API call
        if (!user) {
          setError('Người dùng chưa đăng nhập')
          return
        }

        const result = await apiClient.places.drafts.getById(draftId)
        
        if (!result.success) {
          // Don't set error for authentication issues, let auth provider handle it
          if (result.error?.includes('đăng nhập') || result.error?.includes('token')) {
            setError('Vui lòng đăng nhập để xem bản nháp')
          } else {
            setError(result.error || 'Không tìm thấy bản nháp hoặc bạn không có quyền xem')
          }
          return
        }
        
        if (!result.data) {
          setError('Dữ liệu bản nháp không hợp lệ')
          return
        }

        const draftData = result.data
        setDraft(draftData)

        // Transform draft data to PlaceData format for preview
        const previewPlace: PlaceData = {
          id: draftData.id,
          name: draftData.name || 'Chưa có tên',
          shortDescription: draftData.shortDescription || '',
          description: draftData.description || '',
          type: draftData.type,
          region: draftData.region,
          province: draftData.province || '',
          address: draftData.address || '',
          coordinates: draftData.coordinates || { lat: 0, lng: 0 },
          images: draftData.images || [],
          video: draftData.video ? {
            id: draftData.video.id || 'video-1',
            url: draftData.video.url || draftData.video,
            thumbnail: draftData.video.thumbnail,
            duration: draftData.video.duration
          } : undefined,
          openingHours: draftData.openingHours || '',
          entryFee: draftData.entryFee || '',
          bestTimeToVisit: draftData.bestTimeToVisit || '',
          facilities: draftData.facilities || [],
          tags: draftData.tags || [],
          sources: draftData.sources || [],
          trustLevel: 'community',
          authorRole: 'contributor',
          authorName: user?.fullName || 'Người đóng góp',
          createdAt: draftData.createdAt,
          updatedAt: draftData.updatedAt,
          stats: {
            views: 0,
            likes: 0,
            saves: 0,
            reviews: 0
          }
        }

        setPlace(previewPlace)
      } catch (err: any) {
        console.error('Error loading draft preview:', err)
        if (err?.error) {
          setError(err.error)
        } else {
          setError('Có lỗi xảy ra khi tải bản nháp')
        }
      } finally {
        setLoading(false)
      }
    }

    loadDraftPreview()
  }, [draftId, isAuthenticated, user?.uid, authLoading])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
        <span className="ml-3">Đang tải bản nháp...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Cần đăng nhập</h1>
          <p className="text-gray-600">Bạn cần đăng nhập để xem bản nháp này.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Lỗi tải bản nháp</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    )
  }
  
  if (!place || !draft) {
    return notFound()
  }

  const statusInfo = statusConfig[draft.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo?.icon || FileText

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center text-yellow-800">
            <Eye className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              Chế độ xem trước bản nháp - Chưa được xuất bản
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white"
            >
              <Settings className="h-4 w-4 mr-1" />
              {sidebarOpen ? 'Ẩn' : 'Hiện'} chi tiết
              {sidebarOpen ? <ChevronRight className="h-4 w-4 ml-1" /> : <ChevronLeft className="h-4 w-4 ml-1" />}
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex max-w-7xl mx-auto">
        {/* Main Content */}
        <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "mr-96" : "mr-0")}>
          <PlaceDetailContent place={place} />
        </div>
        
        {/* Moderation Sidebar */}
        <div className={cn(
          "fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-300 overflow-y-auto z-40",
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-semibold">Chi tiết kiểm duyệt</h2>
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="ghost"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <StatusIcon className="h-4 w-4" />
                  Trạng thái hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <Badge variant={statusInfo?.variant} className="text-xs">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo?.label}
                  </Badge>
                  <p className="text-xs text-gray-600">
                    {statusInfo?.description}
                  </p>
                  
                  {draft.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h4 className="font-medium text-red-900 text-xs mb-1">Lý do từ chối:</h4>
                      <p className="text-xs text-red-700">{draft.rejectionReason}</p>
                    </div>
                  )}
                  
                  {draft.moderationInfo?.reviewNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-medium text-blue-900 text-xs mb-1">Ghi chú kiểm duyệt:</h4>
                      <p className="text-xs text-blue-700">{draft.moderationInfo.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Tạo:</span>
                  <span className="font-medium">{formatDate(draft.createdAt)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Cập nhật:</span>
                  <span className="font-medium">{formatDate(draft.updatedAt)}</span>
                </div>
                {draft.submittedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Gửi duyệt:</span>
                    <span className="font-medium">{formatDate(draft.submittedAt)}</span>
                  </div>
                )}
                {draft.moderationInfo?.reviewedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Đánh giá:</span>
                    <span className="font-medium">{formatDate(draft.moderationInfo.reviewedAt)}</span>
                  </div>
                )}
                {draft.publishedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Xuất bản:</span>
                    <span className="font-medium">{formatDate(draft.publishedAt)}</span>
                  </div>
                )}
                {draft.rejectedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Từ chối:</span>
                    <span className="font-medium">{formatDate(draft.rejectedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviewer Information */}
            {draft.moderationInfo?.reviewer && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-xs">
                        {draft.moderationInfo.reviewer.fullName?.[0] || 'R'}
                      </AvatarFallback>
                    </Avatar>
                    Người đánh giá
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {draft.moderationInfo.reviewer.fullName?.[0] || 'R'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {draft.moderationInfo.reviewer.fullName || 'Người đánh giá'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {draft.moderationInfo.reviewer.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hành động</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {(draft.status === "draft" || draft.status === "submitted" || draft.status === "rejected") && (
                  <Button 
                    onClick={() => router.push(`/contribute/edit/${draft.id}`)}
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
                
                {draft.status === "published" && (
                  <Button 
                    onClick={() => window.open(`/places/${draft.id}`, '_blank')}
                    variant="outline"
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem trang công khai
                  </Button>
                )}

                <Button 
                  onClick={() => router.push('/contribute/my-drafts')}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách
                </Button>
              </CardContent>
            </Card>

            {/* Moderation History */}
            {draft.moderationHistory && draft.moderationHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Lịch sử kiểm duyệt</h3>
                <ModerationHistory 
                  contentId={draft.id}
                  history={draft.moderationHistory}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
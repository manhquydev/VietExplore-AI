"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import ModerationHistory from "@/components/moderation-history"
import ModerationTimeline from "@/components/moderation-timeline"
import { 
  ArrowLeft,
  Eye,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { auth } from "@/lib/firebase"

interface ModerationPageProps {
  params: Promise<{
    draftId: string
  }>
}

const statusConfig = {
  draft: { 
    label: "Bản nháp", 
    variant: "secondary" as const, 
    icon: FileText,
    description: "Chưa gửi duyệt"
  },
  submitted: { 
    label: "Đã gửi", 
    variant: "default" as const, 
    icon: Clock,
    description: "Đang chờ kiểm duyệt"
  },
  in_review: { 
    label: "Đang duyệt", 
    variant: "warning" as const, 
    icon: Eye,
    description: "Kiểm duyệt viên đang xem xét"
  },
  published: { 
    label: "Đã xuất bản", 
    variant: "success" as const, 
    icon: CheckCircle,
    description: "Địa điểm đã được phê duyệt và xuất bản"
  },
  rejected: { 
    label: "Từ chối", 
    variant: "danger" as const, 
    icon: XCircle,
    description: "Địa điểm bị từ chối"
  },
  needs_revision: { 
    label: "Cần chỉnh sửa", 
    variant: "warning" as const, 
    icon: RefreshCw,
    description: "Kiểm duyệt viên yêu cầu chỉnh sửa"
  }
}

export default function ModerationDetailPage({ params }: ModerationPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  
  const [draftId, setDraftId] = React.useState<string>('')
  const [draft, setDraft] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Get draftId from params
  React.useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setDraftId(resolvedParams.draftId)
    }
    getParams()
  }, [params])

  // Fetch draft details
  React.useEffect(() => {
    if (!draftId || !user) return

    async function fetchDraft() {
      setLoading(true)
      setError(null)

      try {
        const firebaseUser = auth.currentUser
        if (!firebaseUser) {
          throw new Error('Chưa đăng nhập')
        }

        const token = await firebaseUser.getIdToken()
        
        const response = await fetch(`/api/places/drafts/${draftId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success) {
          setDraft(data.data)
        } else {
          setError(data.error || 'Không thể tải thông tin bản nháp')
        }
      } catch (err: any) {
        console.error('Error fetching draft:', err)
        setError('Có lỗi xảy ra khi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    fetchDraft()
  }, [draftId, user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Cần đăng nhập</h1>
            <p className="mt-2 text-gray-600">Bạn cần đăng nhập để xem trang này.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !draft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Không tìm thấy</h1>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy bản nháp'}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusInfo = statusConfig[draft.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo?.icon || FileText

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => router.back()}
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chi tiết kiểm duyệt
          </h1>
          <p className="text-gray-600">
            Theo dõi quá trình kiểm duyệt địa điểm của bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tiến trình kiểm duyệt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ModerationTimeline
                  currentStatus={draft.status}
                  draft={draft}
                  onActionClick={(action) => {
                    switch (action) {
                      case "edit":
                        router.push(`/contribute/edit/${draft.id}`)
                        break
                      case "submit":
                        // TODO: Add submit functionality
                        console.log("Submit for review")
                        break
                      case "view_public":
                        window.open(`/places/${draft.id}`, '_blank')
                        break
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Place Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {draft.images && draft.images.length > 0 && (
                    <img 
                      src={draft.images.find((img: any) => img.isPrimary)?.url || draft.images[0]?.url} 
                      alt={draft.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{draft.name}</h2>
                    <p className="text-sm text-gray-600">{draft.shortDescription}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Loại:</span>
                    <span className="ml-2 font-medium capitalize">{draft.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Miền:</span>
                    <span className="ml-2 font-medium">
                      {draft.region === 'bac-bo' ? 'Miền Bắc' : 
                       draft.region === 'trung-bo' ? 'Miền Trung' : 'Miền Nam'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tỉnh:</span>
                    <span className="ml-2 font-medium">{draft.province}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Hình ảnh:</span>
                    <span className="ml-2 font-medium">{draft.images?.length || 0} ảnh</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moderation Progress Summary */}
            {draft.moderationInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Tiến độ kiểm duyệt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Trạng thái:</span>
                      <Badge variant={statusInfo?.variant} className="ml-2 text-xs">
                        {statusInfo?.label}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Gửi lúc:</span>
                      <span className="ml-2 font-medium">
                        {draft.moderationInfo.submittedAt ? formatDate(draft.moderationInfo.submittedAt) : 'Chưa gửi'}
                      </span>
                    </div>
                    {draft.moderationInfo.reviewer && (
                      <>
                        <div>
                          <span className="text-gray-500">Kiểm duyệt viên:</span>
                          <span className="ml-2 font-medium">{draft.moderationInfo.reviewer.fullName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duyệt lúc:</span>
                          <span className="ml-2 font-medium">
                            {draft.moderationInfo.reviewedAt ? formatDate(draft.moderationInfo.reviewedAt) : 'Chưa duyệt'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Processing Time */}
                  {draft.moderationInfo.submittedAt && draft.moderationInfo.reviewedAt && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Thời gian xử lý:</span> {' '}
                        {(() => {
                          const diffMs = new Date(draft.moderationInfo.reviewedAt).getTime() - new Date(draft.moderationInfo.submittedAt).getTime();
                          const diffMinutes = Math.round(diffMs / (1000 * 60));
                          const diffHours = Math.round(diffMs / (1000 * 60 * 60));
                          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                          
                          if (diffMinutes < 60) {
                            return `${diffMinutes} phút`;
                          } else if (diffHours < 24) {
                            return `${diffHours} giờ`;
                          } else {
                            return `${diffDays} ngày`;
                          }
                        })()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Complete Activity Log */}
            <ModerationHistory 
              contentId={draft.id}
              history={draft.moderationHistory || []}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className="w-5 h-5" />
                  Trạng thái hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant={statusInfo?.variant} className="text-sm">
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusInfo?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {statusInfo?.description}
                  </p>
                  
                  {draft.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h4 className="font-medium text-red-900 mb-1">Lý do từ chối:</h4>
                      <p className="text-sm text-red-700">{draft.rejectionReason}</p>
                    </div>
                  )}
                  
                  {(draft.revisionReason || (draft.status === 'needs_revision' && draft.moderationInfo?.reviewNotes)) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="font-medium text-yellow-900 mb-1">Yêu cầu chỉnh sửa:</h4>
                      <p className="text-sm text-yellow-700">
                        {draft.revisionReason || draft.moderationInfo?.reviewNotes}
                      </p>
                      {draft.moderationInfo?.reviewer && (
                        <div className="mt-2 pt-2 border-t border-yellow-200">
                          <p className="text-xs text-yellow-600">
                            Kiểm duyệt bởi: <span className="font-medium">{draft.moderationInfo.reviewer.fullName}</span>
                            {draft.moderationInfo.reviewedAt && (
                              <span className="ml-2">• {formatDate(draft.moderationInfo.reviewedAt)}</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {draft.escalationReason && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <h4 className="font-medium text-purple-900 mb-1">Lý do chuyển lên:</h4>
                      <p className="text-sm text-purple-700">{draft.escalationReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạo:</span>
                  <span className="font-medium">{formatDate(draft.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cập nhật:</span>
                  <span className="font-medium">{formatDate(draft.updatedAt)}</span>
                </div>
                {draft.submittedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Gửi duyệt:</span>
                    <span className="font-medium">{formatDate(draft.submittedAt)}</span>
                  </div>
                )}
                {draft.publishedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Xuất bản:</span>
                    <span className="font-medium">{formatDate(draft.publishedAt)}</span>
                  </div>
                )}
                {draft.rejectedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Từ chối:</span>
                    <span className="font-medium">{formatDate(draft.rejectedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hành động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => window.open(`/drafts/${draft.id}/preview`, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem trước
                </Button>
                
                {(draft.status === "draft" || draft.status === "submitted" || draft.status === "rejected" || draft.status === "needs_revision") && (
                  <Button 
                    onClick={() => router.push(`/contribute/edit/${draft.id}`)}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
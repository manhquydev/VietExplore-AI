/**
 * Moderation Review Detail Page - Vietnam Travel Theme
 * Modern admin interface for detailed content review
 */

"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  User,
  Calendar,
  Clock,
  MapPin,
  Flag,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Video,
  ExternalLink,
  RefreshCw,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { auth } from "@/lib/firebase"
import { ActivityLog } from "@/components/moderation-history"
import { BrandedLoading } from "@/components/ui/branded-loading"

interface ReviewPageProps {
  params: Promise<{
    id: string
  }>
}

const statusConfig = {
  pending: { label: "Chờ duyệt", variant: "warning" as const, icon: Clock },
  in_review: { label: "Đang duyệt", variant: "default" as const, icon: Eye },
  approved: { label: "Đã duyệt", variant: "success" as const, icon: CheckCircle },
  rejected: { label: "Từ chối", variant: "danger" as const, icon: XCircle },
  escalated: { label: "Chuyển lên", variant: "warning" as const, icon: AlertTriangle },
  needs_revision: { label: "Cần chỉnh sửa", variant: "warning" as const, icon: RefreshCw },
  hidden: { label: "Đã ẩn", variant: "secondary" as const, icon: EyeOff }
}

const priorityConfig = {
  // String priorities
  low: { label: "Thấp", variant: "secondary" as const },
  medium: { label: "Trung bình", variant: "default" as const },
  high: { label: "Cao", variant: "warning" as const },
  urgent: { label: "Khẩn cấp", variant: "danger" as const },
  // Numeric priorities (legacy)
  1: { label: "Thấp", variant: "secondary" as const },
  2: { label: "Trung bình", variant: "default" as const },
  3: { label: "Cao", variant: "warning" as const },
  4: { label: "Khẩn cấp", variant: "danger" as const }
}

export default function ReviewDetailPage({ params }: ReviewPageProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [reviewItem, setReviewItem] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [moderatorNotes, setModeratorNotes] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("content")

  // Check permissions
  const isModerator = user?.role === 'moderator' || user?.role === 'admin'

  // Fetch moderation item data
  React.useEffect(() => {
    const fetchReviewItem = async () => {
      try {
        const resolvedParams = await params
        const { id } = resolvedParams
        
        if (!user || !isAuthenticated) return

        const firebaseUser = auth.currentUser
        if (!firebaseUser) {
          throw new Error('Chưa đăng nhập')
        }

        const token = await firebaseUser.getIdToken()
        
        // Try to get all moderation queue items (including completed ones)
        let queueResponse = await fetch(`/api/moderation/queue`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        let item = null;
        
        if (queueResponse.ok) {
          try {
            const queueData = await queueResponse.json()
            item = queueData.data?.find((item: any) => item.id === id)
          } catch (jsonError) {
            console.warn('Failed to parse queue response JSON:', jsonError)
          }
        }
        
        // If not found in general queue, try specifically looking for the item with different status filters
        if (!item) {
          const statuses = ['pending', 'in_review', 'escalated', 'approved', 'rejected'];
          for (const status of statuses) {
            const statusResponse = await fetch(`/api/moderation/queue?status=${status}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (statusResponse.ok) {
              try {
                const statusData = await statusResponse.json();
                item = statusData.data?.find((item: any) => item.id === id);
                if (item) break;
              } catch (jsonError) {
                console.warn(`Failed to parse status response JSON for status ${status}:`, jsonError)
              }
            }
          }
        }
        
        if (!item) {
          throw new Error('Không tìm thấy mục kiểm duyệt. Có thể mục này đã được xử lý hoặc đã bị xóa.')
        }

        setReviewItem(item)
      } catch (error: any) {
        console.error('Error fetching review item:', error)
        setError(error.message || 'Có lỗi xảy ra khi tải thông tin kiểm duyệt')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user) {
      fetchReviewItem()
    }
  }, [params, user, isAuthenticated])

  const handleAction = async (action: 'approve' | 'reject' | 'escalate' | 'start_review' | 'request_edit') => {
    if (!moderatorNotes.trim() && (action === 'reject' || action === 'escalate' || action === 'request_edit')) {
      alert("Vui lòng nhập lý do cho hành động này")
      return
    }

    setIsProcessing(true)
    try {
      if (!user || !reviewItem) return

      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        throw new Error('Chưa đăng nhập')
      }

      const token = await firebaseUser.getIdToken()

      const response = await fetch(`/api/moderation/queue/${reviewItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          reviewNotes: moderatorNotes
        })
      })

      // Check if response has content before parsing JSON
      let result;
      const responseText = await response.text()
      
      if (!responseText.trim()) {
        throw new Error('Server returned empty response')
      }
      
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        console.error('Response text:', responseText)
        throw new Error('Server returned invalid response format')
      }

      if (!response.ok) {
        throw new Error(result?.error || `Server error: ${response.status}`)
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Không thể thực hiện hành động')
      }
      
      console.log('Moderation action completed:', result)
      
      // Handle different actions properly
      if (action === 'start_review') {
        // Stay on page and refresh item data
        setReviewItem(prevItem => prevItem ? {
          ...prevItem,
          status: 'in_review',
          assignedTo: user?.id,
          assignedAt: new Date().toISOString()
        } : null)
        setModeratorNotes('')
        
      } else if (action === 'request_edit') {
        // For request_edit, redirect immediately after successful response
        console.log('Đã gửi yêu cầu chỉnh sửa đến tác giả thành công!')
        router.push('/admin/moderation')
        
      } else {
        // For final actions (approve, reject, escalate), redirect immediately
        const messages = {
          approve: 'Đã duyệt và xuất bản thành công!',
          reject: 'Đã từ chối nội dung!',
          escalate: 'Đã chuyển lên cấp cao hơn!'
        }
        if (messages[action as keyof typeof messages]) {
          console.log(messages[action as keyof typeof messages])
        }
        router.push('/admin/moderation')
      }
    } catch (error: any) {
      console.error('Action failed:', error)
      alert(error.message || 'Có lỗi xảy ra khi thực hiện hành động')
    } finally {
      setIsProcessing(false)
    }
  }

  // Show loading while authenticating
  if (!isAuthenticated || !isModerator) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <BrandedLoading
          variant="logo"
          size="lg"
          text="Đang xác thực quyền truy cập..."
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <BrandedLoading
          variant="logo"
          size="lg"
          text="Đang tải thông tin kiểm duyệt..."
        />
      </div>
    )
  }

  if (error || !reviewItem) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Vietnam Travel Themed Header */}
        <div className="bg-gradient-to-r from-red-100 via-red-50 to-red-100 border-b-2 border-red-200">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl border-2 border-red-300">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-red-800 mb-1">⚠️ Có lỗi xảy ra</h1>
                <p className="text-lg text-red-700 font-medium">Không thể tải thông tin kiểm duyệt</p>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-6 py-16">
          <Card className="max-w-2xl mx-auto border-2 border-red-200">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">😔</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Không tìm thấy mục kiểm duyệt</h2>
              <p className="text-gray-600 mb-8">{error || 'Mục này có thể đã được xử lý hoặc đã bị xóa'}</p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-2 border-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button
                  onClick={() => router.push('/moderation/dashboard')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                >
                  Về Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const statusInfo = statusConfig[reviewItem.status] || statusConfig.pending
  const priorityInfo = priorityConfig[reviewItem.priority] || priorityConfig.medium
  const contentDetails = reviewItem.contentDetails || {}

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Vietnam Travel Themed Header */}
      <div className="bg-gradient-to-r from-green-100 via-yellow-50 to-green-100 border-b-2 border-yellow-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/moderation/dashboard')}
              className="flex items-center gap-2 hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Về Dashboard
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center shadow-xl border-2 border-yellow-300 overflow-hidden flex-shrink-0">
                <Image
                  src="/logo-icon.svg"
                  alt="Du Lịch Việt"
                  width={40}
                  height={40}
                  className="scale-75"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl lg:text-3xl font-bold text-green-800">
                    {contentDetails.name || reviewItem.metadata?.title || 'Chi tiết kiểm duyệt'}
                  </h1>
                  <Badge
                    className={cn(
                      "gap-1.5 text-xs font-semibold shadow-sm px-3 py-1",
                      statusInfo.variant === 'success' && "bg-green-100 text-green-700",
                      statusInfo.variant === 'warning' && "bg-yellow-100 text-yellow-700",
                      statusInfo.variant === 'danger' && "bg-red-100 text-red-700",
                      statusInfo.variant === 'default' && "bg-blue-100 text-blue-700",
                      statusInfo.variant === 'secondary' && "bg-gray-100 text-gray-700"
                    )}
                  >
                    <statusInfo.icon className="w-3.5 h-3.5" />
                    {statusInfo.label}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-xs font-semibold shadow-sm px-3 py-1",
                      priorityInfo.variant === 'danger' && "bg-red-100 text-red-700",
                      priorityInfo.variant === 'warning' && "bg-orange-100 text-orange-700",
                      priorityInfo.variant === 'default' && "bg-blue-100 text-blue-700",
                      priorityInfo.variant === 'secondary' && "bg-gray-100 text-gray-700"
                    )}
                  >
                    {priorityInfo.label}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-green-700">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <strong>{reviewItem.submitter?.fullName || reviewItem.submittedBy || 'Người dùng'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(reviewItem.submittedAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="text-xs bg-white/80 text-green-700 px-3 py-1 rounded-full font-medium border border-green-200">
                    ID: {reviewItem.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-green-200 p-1">
                <TabsTrigger
                  value="content"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold"
                >
                  <FileText className="w-4 h-4" />
                  Nội dung
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold"
                >
                  <ImageIcon className="w-4 h-4" />
                  Ảnh & Video ({(contentDetails.images?.length || 0) + (contentDetails.video ? 1 : 0)})
                </TabsTrigger>
                <TabsTrigger
                  value="sources"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  Nguồn
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-semibold"
                >
                  <Clock className="w-4 h-4" />
                  Lịch sử
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6 mt-6">

                {/* Edit Comparison for Published Places */}
                {(contentDetails.isEditRequest || reviewItem?.itemType === 'place_edit' || reviewItem?.action === 'edit_review') && (
                  <Card className="border-2 border-orange-200 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <RefreshCw className="w-5 h-5 text-orange-600" />
                        So sánh chỉnh sửa địa điểm
                      </CardTitle>
                      <p className="text-sm text-orange-700">
                        Bên trái là nội dung gốc đã xuất bản, bên phải là nội dung chỉnh sửa đề xuất
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Original Content */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">📄 Nội dung gốc (đã xuất bản)</Badge>
                          </div>
                          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg space-y-3">
                            {(contentDetails.originalData || reviewItem?.originalData) ? (
                              <>
                                <div>
                                  <Label className="text-sm font-medium text-muted">Tên địa điểm</Label>
                                  <p className="text-base font-semibold mt-1">{(contentDetails.originalData || reviewItem?.originalData)?.name || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted">Mô tả ngắn</Label>
                                  <p className="text-sm mt-1">{(contentDetails.originalData || reviewItem?.originalData)?.shortDescription || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted">Loại hình</Label>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {(contentDetails.originalData || reviewItem?.originalData)?.type || 'Chưa phân loại'}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted">Vùng miền</Label>
                                  <p className="text-sm mt-1">{(contentDetails.originalData || reviewItem?.originalData)?.region || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted">Tỉnh/thành</Label>
                                  <p className="text-sm mt-1">{(contentDetails.originalData || reviewItem?.originalData)?.province || 'Chưa cập nhật'}</p>
                                </div>
                              </>
                            ) : (
                              <p className="text-gray-500 text-sm italic">Không có dữ liệu gốc</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Edited Content */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs">✏️ Nội dung chỉnh sửa (đề xuất)</Badge>
                          </div>
                          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-muted">Tên địa điểm</Label>
                              <p className="text-base font-semibold mt-1">{contentDetails.name || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted">Mô tả ngắn</Label>
                              <p className="text-sm mt-1">{contentDetails.shortDescription || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted">Loại hình</Label>
                              <Badge variant="outline" className="text-xs mt-1">
                                {contentDetails.type || 'Chưa phân loại'}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted">Vùng miền</Label>
                              <p className="text-sm mt-1">{contentDetails.region || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted">Tỉnh/thành</Label>
                              <p className="text-sm mt-1">{contentDetails.province || 'Chưa cập nhật'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Change Summary */}
                      {(() => {
                        const originalData = contentDetails.originalData || reviewItem?.originalData;
                        return originalData ? (
                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <h4 className="font-medium text-amber-900 mb-2">📋 Tóm tắt thay đổi:</h4>
                            <ul className="space-y-1 text-sm text-amber-800">
                              {contentDetails.name !== originalData.name && (
                                <li>• <strong>Tên:</strong> "{originalData.name}" → "{contentDetails.name}"</li>
                              )}
                              {contentDetails.shortDescription !== originalData.shortDescription && (
                                <li>• <strong>Mô tả ngắn:</strong> Đã thay đổi</li>
                              )}
                              {contentDetails.type !== originalData.type && (
                                <li>• <strong>Loại hình:</strong> {originalData.type} → {contentDetails.type}</li>
                              )}
                              {contentDetails.region !== originalData.region && (
                                <li>• <strong>Vùng miền:</strong> {originalData.region} → {contentDetails.region}</li>
                              )}
                              {contentDetails.province !== originalData.province && (
                                <li>• <strong>Tỉnh/thành:</strong> {originalData.province} → {contentDetails.province}</li>
                              )}
                              {contentDetails.description !== originalData.description && (
                                <li>• <strong>Mô tả chi tiết:</strong> Đã thay đổi</li>
                              )}
                              {(!contentDetails.name || contentDetails.name === originalData.name) &&
                               (!contentDetails.shortDescription || contentDetails.shortDescription === originalData.shortDescription) &&
                               (!contentDetails.type || contentDetails.type === originalData.type) &&
                               (!contentDetails.region || contentDetails.region === originalData.region) &&
                               (!contentDetails.province || contentDetails.province === originalData.province) &&
                               (!contentDetails.description || contentDetails.description === originalData.description) && (
                                <li className="text-amber-700 italic">🔍 Không phát hiện thay đổi rõ ràng trong các trường cơ bản</li>
                              )}
                            </ul>
                          </div>
                        ) : (
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h4 className="font-medium text-red-900 mb-2">⚠️ Cảnh báo:</h4>
                            <p className="text-sm text-red-800">Không tìm thấy dữ liệu gốc để so sánh. Đây có thể là lỗi dữ liệu.</p>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Basic Information */}
                <Card className="border-2 border-blue-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Thông tin cơ bản
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted">Tên địa điểm</Label>
                        <p className="text-base font-semibold mt-1">{contentDetails.name || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted">Loại hình</Label>
                        <div className="mt-1">
                          <Badge variant="secondary" className="capitalize">
                            {contentDetails.type || reviewItem.metadata?.type || 'Chưa phân loại'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted">Mô tả ngắn</Label>
                      <p className="text-base mt-1 leading-relaxed">{contentDetails.shortDescription || 'Chưa cập nhật'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted">Mô tả chi tiết</Label>
                      <div className="mt-1 prose prose-sm max-w-none">
                        {contentDetails.description ? (
                          contentDetails.description.split('\n\n').map((paragraph: string, index: number) => (
                            <p key={index} className="text-base leading-relaxed mb-4 last:mb-0">
                              {paragraph}
                            </p>
                          ))
                        ) : (
                          <p className="text-base text-muted">Chưa cập nhật</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Information */}
                <Card className="border-2 border-green-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Thông tin vị trí
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted">Vùng miền</Label>
                        <p className="text-base mt-1 capitalize font-medium">
                          {contentDetails.region === 'bac-bo' ? 'Miền Bắc' : 
                           contentDetails.region === 'trung-bo' ? 'Miền Trung' : 
                           contentDetails.region === 'nam-bo' ? 'Miền Nam' : 
                           reviewItem.metadata?.region || 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted">Tỉnh/Thành phố</Label>
                        <p className="text-base mt-1 font-medium">{contentDetails.province || reviewItem.metadata?.province || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    
                    {/* Administrative Address - Vietnam Address System */}
                    {contentDetails.vietnamAddress && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <Label className="text-sm font-medium text-blue-900 mb-3 block">Địa chỉ hành chính chi tiết:</Label>
                        
                        <div className="space-y-3">
                          {/* Current Administrative Address */}
                          <div className="bg-white p-3 rounded border border-blue-300">
                            <p className="text-xs font-medium text-gray-800 mb-2">📍 Địa chỉ hành chính hiện tại:</p>
                            <p className="text-sm font-mono text-blue-900">
                              {[
                                contentDetails.vietnamAddress.wardName,
                                contentDetails.vietnamAddress.districtName,
                                contentDetails.vietnamAddress.provinceName
                              ].filter(Boolean).join(', ')}
                            </p>
                            <div className="flex flex-wrap items-center gap-1 mt-2">
                              {contentDetails.vietnamAddress.provinceName && (
                                <Badge variant="outline" className="text-xs bg-blue-100">
                                  {contentDetails.vietnamAddress.provinceName}
                                </Badge>
                              )}
                              {contentDetails.vietnamAddress.districtName && (
                                <>  
                                  <span className="text-blue-400 text-xs">→</span>
                                  <Badge variant="outline" className="text-xs bg-blue-100">
                                    {contentDetails.vietnamAddress.districtName}
                                  </Badge>
                                </>
                              )}
                              {contentDetails.vietnamAddress.wardName && (
                                <>
                                  <span className="text-blue-400 text-xs">→</span>
                                  <Badge variant="outline" className="text-xs bg-blue-100">
                                    {contentDetails.vietnamAddress.wardName}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Address Conversion Display - Old vs New */}
                          {contentDetails.addressConversion?.hasChanges && (
                            <div className="space-y-3">
                              <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                                🔄 So sánh địa chỉ trước và sau sáp nhập hành chính:
                              </p>
                              
                              {/* Old Address */}
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-xs font-medium text-gray-800 mb-2">📍 Địa chỉ hành chính cũ:</p>
                                <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded">
                                  {[
                                    contentDetails.addressConversion.oldAddress.ward?.name,
                                    contentDetails.addressConversion.oldAddress.district?.name,
                                    contentDetails.addressConversion.oldAddress.province?.name
                                  ].filter(Boolean).join(', ')}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Cấu trúc: Xã/Phường, Huyện/Quận, Tỉnh/Thành Phố
                                </p>
                              </div>
                              
                              {/* New Address */}
                              {contentDetails.addressConversion.newAddress && (
                                <div className="bg-white p-3 rounded border border-green-200">
                                  <p className="text-xs font-medium text-green-800 mb-2">✅ Địa chỉ hành chính mới:</p>
                                  <p className="text-sm font-mono text-green-900 bg-green-50 p-2 rounded">
                                    {[
                                      contentDetails.addressConversion.newAddress.ward?.name,
                                      contentDetails.addressConversion.newAddress.district?.name || contentDetails.addressConversion.newAddress.province?.name
                                    ].filter(Boolean).join(', ')}
                                    {contentDetails.addressConversion.newAddress.district && contentDetails.addressConversion.newAddress.province && `, ${contentDetails.addressConversion.newAddress.province.name}`}
                                  </p>
                                  <p className="text-xs text-green-700 mt-1">
                                    Cấu trúc: {contentDetails.addressConversion.newAddress.district ? 'Xã/Phường, Huyện/Quận, Tỉnh/TP' : 'Xã/Phường, Tỉnh/TP'}
                                  </p>
                                </div>
                              )}
                              
                              {/* Conversion Details */}
                              <div className="bg-amber-50 p-3 rounded border border-amber-200">
                                <p className="text-xs font-medium text-amber-800 mb-1">📋 Chi tiết thay đổi:</p>
                                <p className="text-xs text-amber-700">{contentDetails.addressConversion.conversionMessage}</p>
                                
                                {!contentDetails.addressConversion.newAddress?.district && contentDetails.addressConversion.oldAddress.district && (
                                  <p className="text-xs text-amber-800 mt-2 p-2 bg-amber-100 rounded">
                                    ⚠️ <strong>Quan trọng:</strong> Cấu trúc hành chính đã thay đổi từ 3 cấp xuống 2 cấp.
                                    Bỏ cấp huyện: <strong>{contentDetails.addressConversion.oldAddress.district.name}</strong>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* No conversion case */}
                          {contentDetails.addressConversion && !contentDetails.addressConversion.hasChanges && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                              <p className="text-xs text-gray-600">ℹ️ Địa chỉ này không thay đổi sau cải cách hành chính hoặc chưa được kiểm tra conversion.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium text-muted">Địa chỉ cụ thể</Label>
                      <p className="text-base mt-1">{contentDetails.address || 'Chưa cập nhật'}</p>
                      
                      {/* Combined full address display */}
                      {contentDetails.vietnamAddress?.fullAddress && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs text-green-700">
                            <strong>Địa chỉ hoàn chỉnh:</strong> {contentDetails.address}
                            {contentDetails.address && !contentDetails.address.includes(contentDetails.vietnamAddress.provinceName) && 
                              `, ${contentDetails.vietnamAddress.fullAddress}`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {contentDetails.coordinates?.lat && contentDetails.coordinates?.lng && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted">Vĩ độ</Label>
                          <p className="text-base mt-1 font-mono">{contentDetails.coordinates.lat}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted">Kinh độ</Label>
                          <p className="text-base mt-1 font-mono">{contentDetails.coordinates.lng}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="border-2 border-purple-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="text-purple-800">Thông tin bổ sung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted">Giờ mở cửa</Label>
                        <p className="text-base mt-1">{contentDetails.openingHours || "Chưa cập nhật"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted">Phí vào cửa</Label>
                        <p className="text-base mt-1">{contentDetails.entryFee || "Chưa cập nhật"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted">Thời gian tốt nhất</Label>
                        <p className="text-base mt-1">{contentDetails.bestTimeToVisit || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                    
                    {contentDetails.facilities && contentDetails.facilities.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted">Tiện ích</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contentDetails.facilities.map((facility: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {contentDetails.tags && contentDetails.tags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contentDetails.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-6 mt-6">
                {/* Video Section */}
                {contentDetails.video && (
                  <Card className="border-2 border-red-200 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                      <CardTitle className="flex items-center gap-2 text-red-800">
                        <Video className="w-5 h-5 text-red-600" />
                        Video giới thiệu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="relative aspect-video overflow-hidden rounded-lg border bg-black">
                          <video
                            controls
                            className="w-full h-full"
                            preload="metadata"
                          >
                            <source src={contentDetails.video.url} type="video/mp4" />
                            <source src={contentDetails.video.url} type="video/mov" />
                            <source src={contentDetails.video.url} type="video/avi" />
                            Trình duyệt của bạn không hỗ trợ video.
                          </video>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-sm font-medium">Tên file</Label>
                            <p className="text-sm text-muted mt-1">{contentDetails.video.name || 'Không có tên'}</p>
                          </div>
                          {contentDetails.video.duration && (
                            <div>
                              <Label className="text-sm font-medium">Thời lượng</Label>
                              <p className="text-sm text-muted mt-1">{Math.floor(contentDetails.video.duration / 60)}:{(contentDetails.video.duration % 60).toString().padStart(2, '0')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Images Section */}
                <Card className="border-2 border-blue-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      Hình ảnh đính kèm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contentDetails.images && contentDetails.images.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        {contentDetails.images.map((image: any, index: number) => (
                          <div key={image.id || index} className="space-y-3">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                              <img
                                src={image.url}
                                alt={image.alt || 'Hình ảnh địa điểm'}
                                className="w-full h-full object-cover"
                              />
                              {image.isPrimary && (
                                <div className="absolute top-2 left-2">
                                  <Badge variant="default" className="text-xs">
                                    Ảnh chính
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm font-medium">Alt text</Label>
                              <p className="text-sm text-muted">{image.alt || 'Không có mô tả'}</p>
                            </div>
                            {image.caption && (
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">Chú thích</Label>
                                <p className="text-sm text-muted italic">{image.caption}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có hình ảnh nào được đính kèm</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sources" className="space-y-6 mt-6">
                <Card className="border-2 border-purple-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <ExternalLink className="w-5 h-5 text-purple-600" />
                      Nguồn tham khảo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contentDetails.sources && contentDetails.sources.length > 0 ? (
                      <div className="space-y-4">
                        {contentDetails.sources.map((source: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="capitalize text-xs">
                                {source.type === 'website' ? 'Website' :
                                 source.type === 'social' ? 'Mạng xã hội' :
                                 source.type === 'document' ? 'Tài liệu' : 'Cá nhân'}
                              </Badge>
                            </div>
                            {source.url && (
                              <div>
                                <Label className="text-sm font-medium">URL</Label>
                                <p className="text-sm text-blue-600 break-all mt-1">{source.url}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-sm font-medium">Mô tả</Label>
                              <p className="text-sm text-muted mt-1">{source.description || 'Không có mô tả'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted">
                        <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có nguồn tham khảo nào</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6 mt-6">
                <ActivityLog 
                  contentId={contentDetails.id || reviewItem.contentId}
                  history={contentDetails.moderationHistory || []}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submitter Info */}
            <Card className="border-2 border-green-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <User className="w-5 h-5 text-green-600" />
                  Thông tin người gửi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={reviewItem.submitter?.avatar} />
                    <AvatarFallback>
                      {(reviewItem.submitter?.fullName || reviewItem.submittedBy || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{reviewItem.submitter?.fullName || 'Người dùng'}</span>
                    </div>
                    <p className="text-sm text-muted">{reviewItem.submitter?.email || 'Không có email'}</p>
                    <div className="mt-2">
                      <UserRoleDisplay 
                        role={reviewItem.submitter?.role || 'traveler'}
                        variant="compact"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Loại nội dung:</span>
                    <span className="font-medium capitalize">{reviewItem.contentType || 'Địa điểm'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Hàng đợi:</span>
                    <span className="font-medium">
                      {reviewItem.queueType === 'partner_queue' ? 'Partner' : 'Contributor'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Có hình ảnh:</span>
                    <Badge variant={reviewItem.metadata?.hasImages ? "success" : "secondary"} className="text-xs">
                      {reviewItem.metadata?.hasImages ? "Có" : "Không"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Có video:</span>
                    <Badge variant={contentDetails.video ? "success" : "secondary"} className="text-xs">
                      {contentDetails.video ? "Có" : "Không"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card className="border-2 border-yellow-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Shield className="w-5 h-5 text-yellow-600" />
                  Hành động kiểm duyệt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="moderatorNotes" className="text-sm font-medium">
                    Ghi chú cho tác giả
                  </Label>
                  <Textarea
                    id="moderatorNotes"
                    placeholder="Nhập phản hồi cho tác giả..."
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    rows={4}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted mt-1">
                    Bắt buộc khi từ chối hoặc yêu cầu chỉnh sửa
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  {/* Quy trình theo tài liệu 2.2.1: Phải claim trước khi duyệt */}
                  {reviewItem.status === 'pending' && (
                    <div className="space-y-3">
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md font-semibold"
                        onClick={() => handleAction('start_review')}
                        disabled={isProcessing}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Nhận việc và bắt đầu duyệt
                      </Button>

                      <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800">
                          ⚠️ <strong>Quy trình:</strong> Phải nhận việc trước khi có thể duyệt nội dung
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Chỉ hiện các nút duyệt chính khi đã claim (status = in_review hoặc claimed) */}
                  {(reviewItem.status === 'in_review' || reviewItem.status === 'claimed') && (
                    <>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md font-semibold"
                        onClick={() => handleAction('approve')}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        ✅ Duyệt và xuất bản
                      </Button>

                      {/* Yêu cầu chỉnh sửa - theo tài liệu 2.2.2 (b) */}
                      <Button
                        variant="outline"
                        className="w-full justify-start border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-semibold shadow-sm"
                        onClick={() => handleAction('request_edit')}
                        disabled={isProcessing}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        ✏️ Yêu cầu chỉnh sửa
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start border-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold shadow-sm"
                        onClick={() => handleAction('reject')}
                        disabled={isProcessing}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        ❌ Từ chối
                      </Button>

                      {/* Chuyển lên cấp cao hơn - chỉ hiện với Moderator */}
                      {user?.role === 'moderator' && (
                        <Button
                          variant="outline"
                          className="w-full justify-start border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold shadow-sm"
                          onClick={() => handleAction('escalate')}
                          disabled={isProcessing}
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          🔼 Chuyển lên cấp cao hơn
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border-2 border-blue-200">
                  <p className="text-xs text-blue-800 leading-relaxed font-semibold mb-2">
                    📋 Quy trình Kiểm duyệt (theo tài liệu 2.2):
                  </p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">1️⃣</span>
                      <span>Nhận việc (claim) để bắt đầu kiểm duyệt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">2️⃣</span>
                      <span>Chọn 1 trong 4 hành động:</span>
                    </li>
                    <li className="ml-6 flex items-start gap-2">
                      <span>✅</span>
                      <span><strong>Chấp thuận:</strong> Xuất bản ngay + ISR revalidation</span>
                    </li>
                    <li className="ml-6 flex items-start gap-2">
                      <span>✏️</span>
                      <span><strong>Yêu cầu chỉnh sửa:</strong> Gửi notification cho tác giả</span>
                    </li>
                    <li className="ml-6 flex items-start gap-2">
                      <span>❌</span>
                      <span><strong>Từ chối:</strong> Đánh dấu rejected + archive</span>
                    </li>
                    {user?.role === 'moderator' && (
                      <li className="ml-6 flex items-start gap-2">
                        <span>🔼</span>
                        <span><strong>Chuyển lên Admin:</strong> Escalate khi phức tạp</span>
                      </li>
                    )}
                    {user?.role === 'admin' && (
                      <li className="ml-6 flex items-start gap-2 text-amber-700 bg-amber-50 -mx-2 px-2 py-1 rounded">
                        <span>⭐</span>
                        <span><strong>Admin:</strong> Có quyền cao nhất, không cần escalate</span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}

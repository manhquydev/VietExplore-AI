"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
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
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { auth } from "@/lib/firebase"
import { ActivityLog } from "@/components/moderation-history"

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
          const queueData = await queueResponse.json()
          item = queueData.data?.find((item: any) => item.id === id)
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
              const statusData = await statusResponse.json();
              item = statusData.data?.find((item: any) => item.id === id);
              if (item) break;
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

  const handleAction = async (action: 'approve' | 'reject' | 'escalate' | 'start_review') => {
    if (!moderatorNotes.trim() && (action === 'reject' || action === 'escalate')) {
      alert("Vui lòng nhập lý do từ chối hoặc chuyển lên cấp cao hơn")
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

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Không thể thực hiện hành động')
      }
      
      console.log('Moderation action completed:', result)
      
      // Only redirect to dashboard for final actions (approve, reject, escalate)
      // For start_review, stay on the page to continue reviewing
      if (action !== 'start_review') {
        router.push('/moderation/dashboard')
      } else {
        // Refresh the current item data to show updated status
        setReviewItem(prevItem => prevItem ? {
          ...prevItem,
          status: 'in_review',
          assignedTo: user?.id,
          assignedAt: new Date().toISOString()
        } : null)
        setModeratorNotes('') // Clear notes after starting review
      }
    } catch (error: any) {
      console.error('Action failed:', error)
      alert(error.message || 'Có lỗi xảy ra khi thực hiện hành động')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isAuthenticated || !isModerator) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
            <Button variant="secondary" onClick={() => router.back()}>
              Quay lại
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted">Đang tải thông tin kiểm duyệt...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !reviewItem) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Lỗi</h1>
            <p className="text-muted mb-6">{error || 'Không tìm thấy mục kiểm duyệt'}</p>
            <Button variant="secondary" onClick={() => router.back()}>
              Quay lại
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusInfo = statusConfig[reviewItem.status] || statusConfig.pending
  const priorityInfo = priorityConfig[reviewItem.priority] || priorityConfig.medium
  const contentDetails = reviewItem.contentDetails || {}

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{contentDetails.name || reviewItem.metadata?.title || 'Địa điểm'}</h1>
              <Badge variant={statusInfo.variant} className="flex items-center gap-1.5">
                <statusInfo.icon className="w-3.5 h-3.5" />
                {statusInfo.label}
              </Badge>
              <Badge variant={priorityInfo.variant} size="sm">
                {priorityInfo.label}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Gửi bởi: <strong>{reviewItem.submitter?.fullName || reviewItem.submittedBy || 'Người dùng'}</strong>
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
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                ID: {reviewItem.id}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Nội dung
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Ảnh & Video ({(contentDetails.images?.length || 0) + (contentDetails.video ? 1 : 0)})
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Nguồn tham khảo
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Lịch sử
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6 mt-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
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
                    
                    <div>
                      <Label className="text-sm font-medium text-muted">Địa chỉ</Label>
                      <p className="text-base mt-1">{contentDetails.address || 'Chưa cập nhật'}</p>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin bổ sung</CardTitle>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="w-5 h-5" />
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5" />
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
                  {reviewItem.status === 'pending' && (
                    <Button
                      className="w-full justify-start"
                      onClick={() => handleAction('start_review')}
                      disabled={isProcessing}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Bắt đầu duyệt
                    </Button>
                  )}
                  
                  <Button
                    className="w-full justify-start"
                    onClick={() => handleAction('approve')}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Duyệt và xuất bản
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleAction('reject')}
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleAction('escalate')}
                    disabled={isProcessing}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Chuyển lên cấp cao hơn
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Lưu ý:</strong> Tất cả hành động kiểm duyệt sẽ được ghi lại và thông báo đến tác giả qua email.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

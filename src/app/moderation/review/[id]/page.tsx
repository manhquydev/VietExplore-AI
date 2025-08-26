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
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"

interface ReviewPageProps {
  params: {
    id: string
  }
}

// Mock review item data
const mockReviewItem = {
  id: "mod_001",
  type: "place" as const,
  targetId: "place_new_001",
  title: "Bãi biển Quy Nhon",
  description: "Bãi biển hoang sơ với cát vàng và nước biển trong xanh",
  status: "pending" as const,
  priority: "medium" as const,
  submittedBy: {
    id: "user_001",
    name: "Nguyễn Văn A",
    username: "nguyen_van_a",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    role: "contributor",
    verified: false,
    stats: {
      placesContributed: 3,
      approvalRate: 85
    }
  },
  submittedAt: "2024-03-15T10:30:00Z",
  content: {
    name: "Bãi biển Quy Nhon",
    shortDescription: "Bãi biển hoang sơ với cát vàng và nước biển trong xanh",
    description: `Bãi biển Quy Nhon là một trong những bãi biển đẹp nhất miền Trung, nằm ở thành phố Quy Nhon, tỉnh Bình Định. Với bãi cát vàng mịn trải dài và làn nước biển trong xanh, nơi đây thu hút nhiều du khách yêu thích sự yên tĩnh và hoang sơ.

Điểm đặc biệt của bãi biển Quy Nhon là sự kết hợp hoàn hảo giữa cảnh quan thiên nhiên và văn hóa địa phương. Du khách có thể thưởng thức hải sản tươi ngon tại các quán ăn ven biển, tham gia các hoạt động thể thao nước, hoặc đơn giản là thư giãn dưới ánh nắng mặt trời.

Ngoài ra, từ bãi biển, du khách có thể dễ dàng di chuyển đến các điểm tham quan khác như tháp Chăm Đôi, chùa Long Khánh, hay làng chài Nhơn Hải.`,
    type: "biển",
    region: "trung-bo",
    province: "Bình Định",
    address: "Phường Ghềnh Ráng, TP. Quy Nhon, Bình Định",
    coordinates: {
      lat: 13.7563,
      lng: 109.2297
    },
    images: [
      {
        id: "img_001",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        alt: "Bãi biển Quy Nhon",
        caption: "Cảnh hoàng hôn tuyệt đẹp tại bãi biển Quy Nhon",
        isPrimary: true
      },
      {
        id: "img_002",
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
        alt: "Hoạt động tại bãi biển",
        caption: "Du khách tham gia các hoạt động thể thao nước",
        isPrimary: false
      }
    ],
    sources: [
      {
        type: "website",
        url: "https://binhdinh.gov.vn/tourism",
        description: "Website chính thức du lịch Bình Định"
      },
      {
        type: "personal",
        url: "",
        description: "Trải nghiệm cá nhân tháng 2/2024"
      }
    ],
    facilities: ["Bãi đỗ xe", "Nhà vệ sinh", "Nhà hàng", "Cửa hàng lưu niệm"],
    tags: ["biển", "hoang sơ", "hải sản", "thể thao nước"],
    openingHours: "24/7",
    entryFee: "Miễn phí",
    bestTimeToVisit: "Tháng 3 - Tháng 9"
  },
  history: [
    {
      action: "submitted",
      timestamp: "2024-03-15T10:30:00Z",
      actor: "Nguyễn Văn A",
      notes: "Gửi địa điểm mới để duyệt"
    }
  ]
}

const statusConfig = {
  pending: { label: "Chờ duyệt", variant: "warning" as const, icon: Clock },
  approved: { label: "Đã duyệt", variant: "success" as const, icon: CheckCircle },
  rejected: { label: "Từ chối", variant: "danger" as const, icon: XCircle },
  hidden: { label: "Đã ẩn", variant: "secondary" as const, icon: EyeOff }
}

const priorityConfig = {
  low: { label: "Thấp", variant: "secondary" as const },
  medium: { label: "Trung bình", variant: "default" as const },
  high: { label: "Cao", variant: "warning" as const },
  urgent: { label: "Khẩn cấp", variant: "danger" as const }
}

export default function ReviewDetailPage({ params }: ReviewPageProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [reviewItem] = React.useState(mockReviewItem)
  const [moderatorNotes, setModeratorNotes] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("content")

  // Check permissions
  const isModerator = user?.role === 'moderator' || user?.role === 'admin'

  const handleAction = async (action: 'approve' | 'reject' | 'hide' | 'request_edit') => {
    if (!moderatorNotes.trim() && (action === 'reject' || action === 'request_edit')) {
      alert("Vui lòng nhập lý do từ chối hoặc yêu cầu chỉnh sửa")
      return
    }

    setIsProcessing(true)
    try {
      // TODO: Send action to API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Moderation action:', {
        itemId: reviewItem.id,
        action,
        notes: moderatorNotes,
        moderatorId: user?.id
      })
      
      // Redirect back to dashboard
      router.push('/moderation/dashboard')
    } catch (error) {
      console.error('Action failed:', error)
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

  const statusInfo = statusConfig[reviewItem.status]
  const priorityInfo = priorityConfig[reviewItem.priority]

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
              <h1 className="text-2xl font-bold">{reviewItem.title}</h1>
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
                Gửi bởi: <strong>{reviewItem.submittedBy.name}</strong>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Nội dung
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Hình ảnh ({reviewItem.content.images.length})
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Nguồn tham khảo
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
                        <p className="text-base font-semibold mt-1">{reviewItem.content.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted">Loại hình</Label>
                        <div className="mt-1">
                          <Badge variant="secondary" className="capitalize">
                            {reviewItem.content.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted">Mô tả ngắn</Label>
                      <p className="text-base mt-1 leading-relaxed">{reviewItem.content.shortDescription}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted">Mô tả chi tiết</Label>
                      <div className="mt-1 prose prose-sm max-w-none">
                        {reviewItem.content.description.split('\\n\\n').map((paragraph, index) => (
                          <p key={index} className="text-base leading-relaxed mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
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
                          {reviewItem.content.region === 'bac-bo' ? 'Miền Bắc' : 
                           reviewItem.content.region === 'trung-bo' ? 'Miền Trung' : 'Miền Nam'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted">Tỉnh/Thành phố</Label>
                        <p className="text-base mt-1 font-medium">{reviewItem.content.province}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted">Địa chỉ</Label>
                      <p className="text-base mt-1">{reviewItem.content.address}</p>
                    </div>
                    
                    {reviewItem.content.coordinates.lat && reviewItem.content.coordinates.lng && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted">Vĩ độ</Label>
                          <p className="text-base mt-1 font-mono">{reviewItem.content.coordinates.lat}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted">Kinh độ</Label>
                          <p className="text-base mt-1 font-mono">{reviewItem.content.coordinates.lng}</p>
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
                        <p className="text-base mt-1">{reviewItem.content.openingHours || "Chưa cập nhật"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted">Phí vào cửa</Label>
                        <p className="text-base mt-1">{reviewItem.content.entryFee || "Chưa cập nhật"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted">Thời gian tốt nhất</Label>
                        <p className="text-base mt-1">{reviewItem.content.bestTimeToVisit || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                    
                    {reviewItem.content.facilities.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted">Tiện ích</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {reviewItem.content.facilities.map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {reviewItem.content.tags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {reviewItem.content.tags.map((tag, index) => (
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

              <TabsContent value="images" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Hình ảnh đính kèm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {reviewItem.content.images.map((image, index) => (
                        <div key={image.id} className="space-y-3">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                            <img
                              src={image.url}
                              alt={image.alt}
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
                            <p className="text-sm text-muted">{image.alt}</p>
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
                    <div className="space-y-4">
                      {reviewItem.content.sources.map((source, index) => (
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
                            <p className="text-sm text-muted mt-1">{source.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
                    <AvatarImage src={reviewItem.submittedBy.avatar} />
                    <AvatarFallback>
                      {reviewItem.submittedBy.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{reviewItem.submittedBy.name}</span>
                    </div>
                    <p className="text-sm text-muted">@{reviewItem.submittedBy.username}</p>
                    <div className="mt-2">
                      <UserRoleDisplay 
                        role={reviewItem.submittedBy.role}
                        variant="compact"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Đã đóng góp:</span>
                    <span className="font-medium">{reviewItem.submittedBy.stats.placesContributed} địa điểm</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Tỷ lệ duyệt:</span>
                    <span className="font-medium text-green-600">{reviewItem.submittedBy.stats.approvalRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Trạng thái:</span>
                    <Badge variant={reviewItem.submittedBy.verified ? "default" : "secondary"} className="text-xs">
                      {reviewItem.submittedBy.verified ? "Đã xác minh" : "Chưa xác minh"}
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
                    className="w-full justify-start"
                    onClick={() => handleAction('request_edit')}
                    disabled={isProcessing}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Yêu cầu chỉnh sửa
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
                    onClick={() => handleAction('hide')}
                    disabled={isProcessing}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ẩn nội dung
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Lưu ý:</strong> Tất cả hành động kiểm duyệt sẽ được ghi lại và thông báo đến tác giả qua email.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Review History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Lịch sử xem xét
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewItem.history.map((entry, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium capitalize">
                            {entry.action === 'submitted' ? 'Đã gửi' :
                             entry.action === 'approved' ? 'Đã duyệt' :
                             entry.action === 'rejected' ? 'Đã từ chối' : 'Khác'}
                          </p>
                          <span className="text-xs text-muted">
                            {new Date(entry.timestamp).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted mt-1">
                          Bởi: {entry.actor}
                        </p>
                        {entry.notes && (
                          <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
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

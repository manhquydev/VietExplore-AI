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
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{reviewItem.title}</h1>
            <p className="text-muted">Kiểm duyệt nội dung #{reviewItem.id}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
            <Badge variant={statusInfo.variant} className="gap-1">
              <statusInfo.icon className="w-3 h-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Nội dung</TabsTrigger>
                <TabsTrigger value="media">Hình ảnh</TabsTrigger>
                <TabsTrigger value="sources">Nguồn</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Tên địa điểm</Label>
                        <p className="mt-1">{reviewItem.content.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Loại hình</Label>
                        <p className="mt-1 capitalize">{reviewItem.content.type}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Mô tả ngắn</Label>
                      <p className="mt-1">{reviewItem.content.shortDescription}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Mô tả chi tiết</Label>
                      <div className="mt-1 prose prose-sm max-w-none">
                        {reviewItem.content.description.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-3">{paragraph}</p>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Vùng miền</Label>
                        <p className="mt-1">
                          {reviewItem.content.region === 'bac-bo' ? 'Miền Bắc' : 
                           reviewItem.content.region === 'trung-bo' ? 'Miền Trung' : 'Miền Nam'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tỉnh/Thành phố</Label>
                        <p className="mt-1">{reviewItem.content.province}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Địa chỉ</Label>
                      <p className="mt-1">{reviewItem.content.address}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Tọa độ</Label>
                        <p className="mt-1 text-sm font-mono">
                          {reviewItem.content.coordinates.lat}, {reviewItem.content.coordinates.lng}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Thời gian tốt nhất</Label>
                        <p className="mt-1">{reviewItem.content.bestTimeToVisit}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Giờ mở cửa</Label>
                        <p className="mt-1">{reviewItem.content.openingHours}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phí vào cửa</Label>
                        <p className="mt-1">{reviewItem.content.entryFee}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tiện ích</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {reviewItem.content.facilities.map((facility, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {reviewItem.content.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Hình ảnh ({reviewItem.content.images.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {reviewItem.content.images.map((image, index) => (
                        <div key={image.id} className="space-y-3">
                          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface">
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
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <Label className="text-xs font-medium">Mô tả ảnh</Label>
                              <p className="text-muted">{image.alt}</p>
                            </div>
                            {image.caption && (
                              <div>
                                <Label className="text-xs font-medium">Chú thích</Label>
                                <p className="text-muted">{image.caption}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-xs font-medium">URL</Label>
                              <p className="text-muted break-all">{image.url}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sources" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Nguồn tham khảo ({reviewItem.content.sources.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviewItem.content.sources.map((source, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {source.type === 'website' ? 'Website' :
                               source.type === 'social' ? 'Mạng xã hội' :
                               source.type === 'document' ? 'Tài liệu' : 'Cá nhân'}
                            </Badge>
                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 text-sm"
                              >
                                Xem nguồn
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-sm">{source.description}</p>
                          {source.url && (
                            <p className="text-xs text-muted mt-2 break-all">{source.url}</p>
                          )}
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
                <CardTitle>Thông tin người gửi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={reviewItem.submittedBy.avatar} />
                    <AvatarFallback>
                      {reviewItem.submittedBy.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
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

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Đã đóng góp:</span>
                    <span>{reviewItem.submittedBy.stats.placesContributed} địa điểm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Tỷ lệ duyệt:</span>
                    <span>{reviewItem.submittedBy.stats.approvalRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hành động kiểm duyệt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="moderatorNotes">Ghi chú (bắt buộc khi từ chối)</Label>
                  <Textarea
                    id="moderatorNotes"
                    placeholder="Nhập ghi chú cho tác giả..."
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleAction('approve')}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Duyệt và xuất bản
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAction('request_edit')}
                    disabled={isProcessing}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Yêu cầu chỉnh sửa
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full text-danger hover:text-danger"
                    onClick={() => handleAction('reject')}
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => handleAction('hide')}
                    disabled={isProcessing}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ẩn nội dung
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submission Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin gửi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Loại:</span>
                  <Badge variant="outline" className="text-xs">
                    {reviewItem.type === 'place' ? 'Địa điểm' :
                     reviewItem.type === 'itinerary' ? 'Lịch trình' :
                     reviewItem.type === 'user' ? 'Người dùng' : 'Báo cáo'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Thời gian gửi:</span>
                  <span>{new Date(reviewItem.submittedAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ID mục tiêu:</span>
                  <span className="font-mono text-xs">{reviewItem.targetId}</span>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử xử lý</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reviewItem.history.map((entry, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{entry.actor}</p>
                        <p className="text-muted">{entry.notes}</p>
                        <p className="text-xs text-muted">
                          {new Date(entry.timestamp).toLocaleString('vi-VN')}
                        </p>
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

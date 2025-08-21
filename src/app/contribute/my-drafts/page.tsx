"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

interface Draft {
  id: string
  name: string
  shortDescription: string
  type: string
  province: string
  status: "draft" | "submitted" | "in_review" | "published" | "rejected"
  createdAt: string
  updatedAt: string
  submittedAt?: string
  reviewedAt?: string
  publishedAt?: string
  coverImage?: string
  moderatorNotes?: string
}

// Mock drafts data
const mockDrafts: Draft[] = [
  {
    id: "draft_001",
    name: "Bãi biển Quy Nhon",
    shortDescription: "Bãi biển hoang sơ với cát vàng và nước biển trong xanh",
    type: "biển",
    province: "Bình Định",
    status: "in_review",
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-03-12T15:30:00Z",
    submittedAt: "2024-03-12T15:30:00Z",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop"
  },
  {
    id: "draft_002",
    name: "Đồi chè Mộc Châu",
    shortDescription: "Cảnh quan đồi chè bạt ngàn với không khí trong lành",
    type: "núi",
    province: "Sơn La",
    status: "draft",
    createdAt: "2024-03-08T14:20:00Z",
    updatedAt: "2024-03-08T14:20:00Z",
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop"
  },
  {
    id: "draft_003",
    name: "Chùa Bái Đính",
    shortDescription: "Quần thể chùa lớn nhất Việt Nam với kiến trúc uy nghi",
    type: "văn hóa",
    province: "Ninh Bình",
    status: "published",
    createdAt: "2024-02-20T09:15:00Z",
    updatedAt: "2024-02-25T11:40:00Z",
    submittedAt: "2024-02-22T16:20:00Z",
    reviewedAt: "2024-02-24T10:30:00Z",
    publishedAt: "2024-02-25T11:40:00Z",
    coverImage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&h=200&fit=crop"
  },
  {
    id: "draft_004",
    name: "Quán cà phê vợt Sài Gòn",
    shortDescription: "Quán cà phê độc đáo với không gian vintage",
    type: "ẩm thực",
    province: "TP. Hồ Chí Minh",
    status: "rejected",
    createdAt: "2024-02-05T11:30:00Z",
    updatedAt: "2024-02-10T14:15:00Z",
    submittedAt: "2024-02-08T16:45:00Z",
    reviewedAt: "2024-02-10T14:15:00Z",
    moderatorNotes: "Thông tin chưa đủ chi tiết, cần bổ sung địa chỉ cụ thể và giờ mở cửa"
  }
]

const statusConfig = {
  draft: {
    label: "Bản nháp",
    variant: "secondary" as const,
    icon: "edit",
    description: "Chưa gửi duyệt"
  },
  submitted: {
    label: "Đã gửi",
    variant: "default" as const,
    icon: "clock",
    description: "Đang chờ duyệt"
  },
  in_review: {
    label: "Đang duyệt",
    variant: "warning" as const,
    icon: "alert-circle",
    description: "Đang được kiểm duyệt"
  },
  published: {
    label: "Đã xuất bản",
    variant: "success" as const,
    icon: "check-circle",
    description: "Đã được duyệt và xuất bản"
  },
  rejected: {
    label: "Bị từ chối",
    variant: "danger" as const,
    icon: "x-circle",
    description: "Cần chỉnh sửa theo góp ý"
  }
}

export default function MyDraftsPage() {
  const { user, isAuthenticated } = useAuth()
  const [drafts, setDrafts] = React.useState(mockDrafts)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<keyof typeof statusConfig | "all">("all")

  // Filter drafts
  const filteredDrafts = React.useMemo(() => {
    let filtered = drafts

    if (searchQuery) {
      filtered = filtered.filter(draft =>
        draft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draft.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(draft => draft.status === statusFilter)
    }

    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [drafts, searchQuery, statusFilter])

  const handleDelete = async (draftId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản nháp này?")) return
    
    setDrafts(prev => prev.filter(d => d.id !== draftId))
  }

  const handleDuplicate = async (draft: Draft) => {
    const duplicated = {
      ...draft,
      id: `draft_${Date.now()}`,
      name: `${draft.name} (Sao chép)`,
      status: "draft" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: undefined,
      reviewedAt: undefined,
      publishedAt: undefined,
      moderatorNotes: undefined
    }
    
    setDrafts(prev => [duplicated, ...prev])
  }

  const handleSubmit = async (draftId: string) => {
    setDrafts(prev => prev.map(d => 
      d.id === draftId ? { 
        ...d, 
        status: "submitted",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } : d
    ))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem bản nháp</h1>
            <Button>Đăng nhập ngay</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bản nháp của tôi</h1>
            <p className="text-muted">
              Quản lý các địa điểm bạn đã đóng góp và theo dõi trạng thái duyệt
            </p>
          </div>
          <Button asChild>
            <Link href="/contribute/new-place">
              <Icon name="plus" className="mr-2" />
              Thêm địa điểm mới
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <Input
              placeholder="Tìm kiếm bản nháp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status as keyof typeof statusConfig)}
                className="gap-2"
              >
                <Icon name={config.icon} />
                {config.label}
              </Button>
            ))}
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Tất cả
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{drafts.length}</div>
            <div className="text-sm text-muted">Tổng số</div>
          </div>
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="text-center">
              <div className="text-2xl font-bold text-primary">
                {drafts.filter(d => d.status === status).length}
              </div>
              <div className="text-sm text-muted">{config.label}</div>
            </div>
          ))}
        </div>

        {/* Drafts List */}
        {filteredDrafts.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== "all" 
                ? "Không tìm thấy bản nháp nào" 
                : "Chưa có bản nháp nào"
              }
            </h3>
            <p className="text-muted mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                : "Bắt đầu đóng góp bằng cách thêm địa điểm đầu tiên"
              }
            </p>
            <Button asChild>
              <Link href="/contribute/new-place">
                <Icon name="plus" className="mr-2" />
                Thêm địa điểm mới
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrafts.map((draft) => {
              const statusInfo = statusConfig[draft.status]
              return (
                <Card key={draft.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Cover Image */}
                      <div className="w-24 h-18 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                        {draft.coverImage ? (
                          <img
                            src={draft.coverImage}
                            alt={draft.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <Icon name="camera" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                              {draft.name}
                            </h3>
                            <p className="text-muted text-sm mb-2 line-clamp-2">
                              {draft.shortDescription}
                            </p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Icon name="more-horizontal" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {draft.status === "published" ? (
                                <DropdownMenuItem asChild>
                                  <Link href={`/places/${draft.id}`}>
                                    <Icon name="eye" className="mr-2" />
                                    Xem trang công khai
                                  </Link>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <Icon name="eye" className="mr-2" />
                                  Xem trước
                                </DropdownMenuItem>
                              )}
                              
                              {(draft.status === "draft" || draft.status === "rejected") && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/contribute/edit/${draft.id}`}>
                                    <Icon name="edit" className="mr-2" />
                                    Chỉnh sửa
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem onClick={() => handleDuplicate(draft)}>
                                <Icon name="plus" className="mr-2" />
                                Sao chép
                              </DropdownMenuItem>
                              
                              {draft.status === "draft" && (
                                <DropdownMenuItem onClick={() => handleSubmit(draft.id)}>
                                  <Icon name="check-circle" className="mr-2" />
                                  Gửi duyệt
                                </DropdownMenuItem>
                              )}
                              
                              {draft.status !== "published" && (
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(draft.id)}
                                  className="text-danger"
                                >
                                  <Icon name="trash-2" className="mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <Badge variant={statusInfo.variant} className="gap-1">
                            <Icon name={statusInfo.icon} className="w-3 h-3" />
                            {statusInfo.label}
                          </Badge>
                          
                          <Badge variant="outline" className="text-xs">
                            {draft.type}
                          </Badge>
                          
                          <Badge variant="outline" className="text-xs">
                            {draft.province}
                          </Badge>
                        </div>

                        {/* Timeline */}
                        <div className="text-xs text-muted space-y-1">
                          <div>Tạo: {new Date(draft.createdAt).toLocaleDateString('vi-VN')}</div>
                          {draft.submittedAt && (
                            <div>Gửi duyệt: {new Date(draft.submittedAt).toLocaleDateString('vi-VN')}</div>
                          )}
                          {draft.publishedAt && (
                            <div>Xuất bản: {new Date(draft.publishedAt).toLocaleDateString('vi-VN')}</div>
                          )}
                        </div>

                        {/* Moderator Notes */}
                        {draft.moderatorNotes && (
                          <div className="mt-3 p-3 bg-warn/10 border border-warn/20 rounded-md">
                            <p className="text-sm text-warn">
                              <strong>Góp ý từ kiểm duyệt viên:</strong> {draft.moderatorNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-12">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">📋 Quy trình đóng góp</h3>
            <div className="grid sm:grid-cols-4 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="edit" className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="font-medium mb-2">1. Tạo bản nháp</h4>
                <p className="text-muted">Điền thông tin địa điểm chi tiết</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="clock" className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">2. Gửi duyệt</h4>
                <p className="text-muted">Gửi cho đội ngũ kiểm duyệt</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-warn/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="alert-circle" className="w-6 h-6 text-warn" />
                </div>
                <h4 className="font-medium mb-2">3. Kiểm duyệt</h4>
                <p className="text-muted">Xác minh thông tin và chất lượng</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="check-circle" className="w-6 h-6 text-success" />
                </div>
                <h4 className="font-medium mb-2">4. Xuất bản</h4>
                <p className="text-muted">Hiển thị công khai cho mọi người</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary">
                <svg className="w-4 h-4 inline mr-1 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                <strong>Mẹo để được duyệt nhanh:</strong> Cung cấp thông tin chi tiết, 
                hình ảnh chất lượng cao và nguồn tham khảo đáng tin cậy
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

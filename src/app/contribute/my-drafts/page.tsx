"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useUserDrafts } from "@/hooks/use-user-drafts"
import { UserDraft } from "@/app/api/places/my-drafts/route"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/components/providers/toast-provider"
import { apiClient } from "@/lib/client/api"

// UserDraft interface is now imported from API types

// Real drafts data is now fetched from API

const statusConfig = {
  draft: {
    label: "Bản nháp",
    variant: "secondary" as const,
    icon: "edit",
    description: "Chưa gửi duyệt",
    help: "Bạn có thể chỉnh sửa và lưu bản nháp bao nhiêu lần cũng được"
  },
  submitted: {
    label: "Đã gửi",
    variant: "default" as const,
    icon: "clock",
    description: "Đang chờ duyệt",
    help: "Bạn vẫn có thể chỉnh sửa và gửi lại cho đến khi được duyệt"
  },
  in_review: {
    label: "Đang duyệt",
    variant: "warning" as const,
    icon: "alert-circle",
    description: "Đang được kiểm duyệt",
    help: "Kiểm duyệt viên đang xem xét. Bạn không thể chỉnh sửa trong thời gian này"
  },
  published: {
    label: "Đã xuất bản",
    variant: "success" as const,
    icon: "check-circle",
    description: "Đã được duyệt và xuất bản",
    help: "Địa điểm đã được xuất bản và hiển thị công khai"
  },
  rejected: {
    label: "Bị từ chối",
    variant: "danger" as const,
    icon: "x-circle",
    description: "Cần chỉnh sửa theo góp ý",
    help: "Xem lý do từ chối bên dưới và chỉnh sửa để gửi lại"
  },
  needs_revision: {
    label: "Cần chỉnh sửa",
    variant: "warning" as const,
    icon: "edit-3",
    description: "Cần sửa theo yêu cầu",
    help: "Kiểm duyệt viên đã yêu cầu chỉnh sửa. Xem lý do bên dưới và chỉnh sửa để gửi lại"
  },
  pending_edit: {
    label: "Chờ duyệt chỉnh sửa",
    variant: "warning" as const,
    icon: "edit-3",
    description: "Chỉnh sửa đang chờ duyệt",
    help: "Bản chỉnh sửa đang chờ kiểm duyệt viên xem xét"
  },
  pending_deletion: {
    label: "Chờ duyệt xóa",
    variant: "danger" as const,
    icon: "trash",
    description: "Yêu cầu xóa đang chờ duyệt",
    help: "Yêu cầu xóa địa điểm đang chờ kiểm duyệt viên xem xét"
  }
}

export default function MyDraftsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<keyof typeof statusConfig | "all">("all")
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const toast = useToast()
  
  // Fetch real user drafts
  const { 
    drafts, 
    stats, 
    loading, 
    error, 
    deleteDraft, 
    duplicateDraft, 
    submitForReview 
  } = useUserDrafts({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery.trim() || undefined,
    autoRefresh: true
  })

  // Drafts are already filtered by the API based on search and status

  const handleDelete = async (draftId: string) => {
    const confirmed = window.confirm(
      `🗑️ Xóa bản nháp\n\n` +
      `Hành động này không thể hoàn tác.\n` +
      `Bản nháp sẽ được xóa vĩnh viễn khỏi hệ thống.\n\n` +
      `Bạn có chắc chắn muốn tiếp tục không?`
    )
    
    if (!confirmed) return
    
    setActionLoading(`delete-${draftId}`)
    try {
      const result = await deleteDraft(draftId)
      if (!result.success) {
        toast.error(result.error || 'Không thể xóa bản nháp', {
          title: '❌ Lỗi'
        })
      } else {
        toast.success('Bản nháp đã được xóa thành công', {
          title: '✅ Thành công'
        })
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleDuplicate = async (draft: UserDraft) => {
    setActionLoading(`duplicate-${draft.id}`)
    try {
      const result = await duplicateDraft(draft)
      if (!result.success) {
        toast.error(result.error || 'Không thể sao chép bản nháp', {
          title: '❌ Lỗi'
        })
      } else {
        toast.success('Bản nháp đã được sao chép thành công', {
          title: '✅ Thành công'
        })
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleSubmit = async (draftId: string) => {
    setActionLoading(`submit-${draftId}`)
    try {
      const result = await submitForReview(draftId)
      if (!result.success) {
        toast.error(result.error || 'Không thể gửi duyệt', {
          title: '❌ Lỗi'
        })
      } else {
        toast.success('Bản nháp đã được gửi để duyệt thành công', {
          title: '✅ Thành công'
        })
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleRequestEdit = async (draftId: string, draft: UserDraft) => {
    const confirmed = window.confirm(
      `✏️ Chỉnh sửa địa điểm: ${draft.name}\n\n` +
      `• Bạn sẽ được chuyển đến trang chỉnh sửa với nội dung hiện tại\n` +
      `• Sau khi chỉnh sửa xong, bản chỉnh sửa sẽ cần được kiểm duyệt\n` +
      `• Nội dung gốc vẫn hiển thị công khai cho đến khi được duyệt\n\n` +
      `Bạn có muốn tiếp tục không?`
    )
    
    if (!confirmed) return
    
    setActionLoading(`edit-${draftId}`)
    try {
      // Create edit draft copy instead of direct request
      const result = await apiClient.places.createEditDraft(draftId)
      
      if (result.success && result.data?.editDraftId) {
        toast.success('Đã tạo bản chỉnh sửa, chuyển đến trang chỉnh sửa', {
          title: '✅ Thành công'
        })
        router.push(`/contribute/edit/${result.data.editDraftId}?editing=${draftId}`)
      } else {
        toast.error(result.error || 'Không thể tạo bản chỉnh sửa', {
          title: '❌ Lỗi'
        })
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo bản chỉnh sửa', {
        title: '❌ Lỗi hệ thống'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRequestDeletion = async (draftId: string, draft: UserDraft) => {
    // Use a more professional approach instead of prompt
    const reason = window.prompt(
      `🗑️ Yêu cầu xóa địa điểm: ${draft.name}\n\n` +
      `Lý do xóa sẽ được gửi đến bộ phận kiểm duyệt để xem xét.\n\n` +
      `Vui lòng nhập lý do xóa:`
    )
    
    if (!reason?.trim()) {
      toast.warning('Vui lòng nhập lý do xóa để tiếp tục', {
        title: '⚠️ Thiếu thông tin'
      })
      return
    }
    
    setActionLoading(`delete-request-${draftId}`)
    try {
      const result = await apiClient.places.requestDeletion(draftId, reason.trim())
      
      if (result.success) {
        toast.success('Yêu cầu xóa địa điểm đã được gửi thành công', {
          title: '✅ Thành công'
        })
        // Refresh the data
        window.location.reload()
      } else {
        toast.error(result.error || 'Không thể gửi yêu cầu xóa', {
          title: '❌ Lỗi'
        })
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi yêu cầu xóa', {
        title: '❌ Lỗi hệ thống'
      })
    } finally {
      setActionLoading(null)
    }
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
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-8 gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-8 gap-4 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted">Tổng số</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.draft}</div>
              <div className="text-sm text-muted">{statusConfig.draft.label}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.in_review || 0}</div>
              <div className="text-sm text-muted">{statusConfig.in_review.label}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.published}</div>
              <div className="text-sm text-muted">{statusConfig.published.label}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.rejected}</div>
              <div className="text-sm text-muted">{statusConfig.rejected.label}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.needs_revision || 0}</div>
              <div className="text-sm text-muted">{statusConfig.needs_revision.label}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.pending_edit || 0}</div>
              <div className="text-sm text-muted">{statusConfig.pending_edit.label}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.pending_deletion || 0}</div>
              <div className="text-sm text-muted">{statusConfig.pending_deletion.label}</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h3>
            <p className="text-muted mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingCard 
                key={i} 
                lines={3} 
                showImage={true} 
                showAvatar={false}
                className="border rounded-lg p-6"
              />
            ))}
          </div>
        )}

        {/* Drafts List */}
        {!loading && !error && drafts.length === 0 ? (
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
        ) : !loading && !error && (
          <div className="space-y-4">
            {drafts.map((draft) => {
              const statusInfo = statusConfig[draft.status] || statusConfig.draft
              
              // Determine primary action based on status
              const getPrimaryAction = () => {
                switch (draft.status) {
                  case 'draft':
                  case 'rejected':
                  case 'needs_revision':
                  case 'submitted':  // Allow editing submitted drafts
                    return () => router.push(`/contribute/edit/${draft.id}`)
                  case 'in_review':
                    return () => window.open(`/drafts/${draft.id}/preview`, '_blank')
                  case 'published':
                    return () => window.open(`/places/${draft.id}`, '_blank')
                  case 'pending_edit':
                    return () => router.push(`/contribute/edit/${draft.id}`)
                  case 'pending_deletion':
                    return () => window.open(`/places/${draft.id}`, '_blank')
                  default:
                    return () => window.open(`/drafts/${draft.id}/preview`, '_blank')
                }
              }
              
              const getPrimaryActionLabel = () => {
                switch (draft.status) {
                  case 'draft':
                  case 'rejected':
                  case 'needs_revision':
                  case 'submitted':  // Allow editing submitted drafts
                    return 'Chỉnh sửa'
                  case 'in_review':
                    return 'Xem trước'
                  case 'published':
                    return 'Xem công khai'
                  case 'pending_edit':
                    return 'Tiếp tục chỉnh sửa'
                  case 'pending_deletion':
                    return 'Xem địa điểm'
                  default:
                    return 'Xem trước'
                }
              }
              
              return (
                <Card key={draft.id} className="overflow-hidden transition-all hover:shadow-md border border-gray-200 hover:border-gray-300">
                  <CardContent className="p-0">
                    {/* Clickable main area */}
                    <div 
                      className="flex gap-4 p-6 cursor-pointer transition-colors hover:bg-gray-50/50"
                      onClick={getPrimaryAction()}
                    >
                      {/* Cover Image */}
                      <div className="w-20 h-16 rounded-lg overflow-hidden bg-surface flex-shrink-0 shadow-sm">
                        {draft.coverImage ? (
                          <img
                            src={draft.coverImage}
                            alt={draft.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted bg-gradient-to-br from-gray-100 to-gray-200">
                            <Icon name="camera" className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                                {draft.name || 'Chưa có tên'}
                              </h3>
                              <Badge 
                                variant={statusInfo.variant} 
                                className="text-xs gap-1 flex-shrink-0"
                              >
                                <Icon name={statusInfo.icon} className="w-3 h-3" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            
                            <p className="text-muted text-sm mb-3 line-clamp-2">
                              {draft.shortDescription || 'Chưa có mô tả'}
                            </p>
                            
                            {/* Quick metadata */}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Icon name="map-pin" className="h-3 w-3" />
                                {draft.province || 'Chưa chọn tỉnh'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="tag" className="h-3 w-3" />
                                {draft.type || 'Chưa phân loại'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="calendar" className="h-3 w-3" />
                                {new Date(draft.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action bar */}
                    <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Primary action button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            getPrimaryAction()()
                          }}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          {getPrimaryActionLabel()}
                        </Button>
                        
                        {/* Quick actions based on status */}
                        {(draft.status === 'submitted' || draft.status === 'in_review' || draft.status === 'rejected' || draft.status === 'needs_revision' || draft.status === 'pending_edit' || draft.status === 'pending_deletion') && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/contribute/my-drafts/${draft.id}/moderation`)
                            }}
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            Xem tiến trình
                          </Button>
                        )}
                        
                        {draft.status === 'draft' && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSubmit(draft.id)
                            }}
                            variant="outline"
                            size="sm"
                            disabled={actionLoading === `submit-${draft.id}`}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            {actionLoading === `submit-${draft.id}` ? (
                              <LoadingSpinner size="sm" className="mr-1" />
                            ) : (
                              <Icon name="send" className="w-3 h-3 mr-1" />
                            )}
                            Gửi duyệt
                          </Button>
                        )}

                        {draft.status === 'published' && (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRequestEdit(draft.id, draft)
                              }}
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === `edit-${draft.id}`}
                              className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                            >
                              {actionLoading === `edit-${draft.id}` ? (
                                <LoadingSpinner size="sm" className="mr-1" />
                              ) : (
                                <Icon name="edit-3" className="w-3 h-3 mr-1" />
                              )}
                              Chỉnh sửa
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRequestDeletion(draft.id, draft)
                              }}
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === `delete-request-${draft.id}`}
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              {actionLoading === `delete-request-${draft.id}` ? (
                                <LoadingSpinner size="sm" className="mr-1" />
                              ) : (
                                <Icon name="trash" className="w-3 h-3 mr-1" />
                              )}
                              Yêu cầu xóa
                            </Button>
                          </>
                        )}
                        
                      </div>
                      
                      {/* Secondary actions menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Icon name="more-horizontal" className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {/* Preview/View actions */}
                          {draft.status !== 'published' && (
                            <DropdownMenuItem 
                              onClick={() => window.open(`/drafts/${draft.id}/preview`, '_blank')}
                            >
                              <Icon name="eye" className="mr-2 h-4 w-4" />
                              Xem trước
                            </DropdownMenuItem>
                          )}
                          
                          {draft.status === 'published' && (
                            <DropdownMenuItem asChild>
                              <Link href={`/places/${draft.id}`} target="_blank">
                                <Icon name="external-link" className="mr-2 h-4 w-4" />
                                Xem trang công khai
                              </Link>
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {/* Duplicate action */}
                          <DropdownMenuItem 
                            onClick={() => handleDuplicate(draft)}
                            disabled={actionLoading === `duplicate-${draft.id}`}
                          >
                            {actionLoading === `duplicate-${draft.id}` ? (
                              <LoadingSpinner size="sm" className="mr-2" />
                            ) : (
                              <Icon name="copy" className="mr-2 h-4 w-4" />
                            )}
                            Sao chép
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {/* Destructive actions */}
                          {(draft.status !== "published" && draft.status !== "pending_deletion") && (
                            <DropdownMenuItem 
                              onClick={() => handleDelete(draft.id)}
                              disabled={actionLoading === `delete-${draft.id}`}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              {actionLoading === `delete-${draft.id}` ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                              ) : (
                                <Icon name="trash-2" className="mr-2 h-4 w-4" />
                              )}
                              Xóa bản nháp
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Status-specific notifications */}
                    {draft.status === 'rejected' && draft.rejectionReason && (
                      <div className="px-6 py-3 bg-red-50 border-t border-red-100">
                        <div className="flex items-start gap-2">
                          <Icon name="alert-triangle" className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</p>
                            <p className="text-sm text-red-700">{draft.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {draft.status === 'needs_revision' && draft.revisionNotes && (
                      <div className="px-6 py-3 bg-orange-50 border-t border-orange-100">
                        <div className="flex items-start gap-2">
                          <Icon name="edit-3" className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-orange-800 mb-1">Yêu cầu chỉnh sửa:</p>
                            <p className="text-sm text-orange-700">{draft.revisionNotes}</p>
                            <p className="text-xs text-orange-600 mt-1">Vui lòng chỉnh sửa theo yêu cầu và gửi lại để kiểm duyệt</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {draft.status === 'in_review' && (
                      <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
                        <div className="flex items-center gap-2">
                          <Icon name="clock" className="h-4 w-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            Bản nháp đang được kiểm duyệt. Vui lòng chờ thông báo.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {draft.status === 'published' && (
                      <div className="px-6 py-3 bg-green-50 border-t border-green-100">
                        <div className="flex items-center gap-2">
                          <Icon name="check-circle" className="h-4 w-4 text-green-600" />
                          <p className="text-sm text-green-800">
                            Địa điểm đã được xuất bản và hiển thị công khai.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {draft.status === 'pending_edit' && (
                      <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
                        <div className="flex items-center gap-2">
                          <Icon name="edit-3" className="h-4 w-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            Bản chỉnh sửa đang chờ kiểm duyệt. Địa điểm vẫn hiển thị công khai cho đến khi được duyệt.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {draft.status === 'pending_deletion' && (
                      <div className="px-6 py-3 bg-red-50 border-t border-red-100">
                        <div className="flex items-center gap-2">
                          <Icon name="trash" className="h-4 w-4 text-red-600" />
                          <p className="text-sm text-red-800">
                            Yêu cầu xóa địa điểm đang chờ kiểm duyệt. Địa điểm vẫn hiển thị công khai cho đến khi được duyệt.
                          </p>
                        </div>
                      </div>
                    )}
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

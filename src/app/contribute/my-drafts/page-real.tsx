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
import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface Draft {
  id: string
  title: string
  description: string
  type: string
  province: string
  region: string
  status: "draft" | "submitted" | "in_review" | "published" | "rejected"
  createdAt: any
  updatedAt: any
  submittedAt?: any
  reviewedAt?: any
  publishedAt?: any
  photos?: string[]
  submitter: string
  submitterRole: string
  moderatorNotes?: string
}

// Firebase Functions
const getUserDrafts = httpsCallable(functions, 'getUserDrafts')
const deleteDraft = httpsCallable(functions, 'deletePlaceDraft')
const submitDraftForReview = httpsCallable(functions, 'submitDraftForReview')

const statusConfig = {
  draft: {
    label: "Bản nháp",
    variant: "secondary" as const,
    icon: "edit" as const,
    description: "Chưa gửi duyệt"
  },
  submitted: {
    label: "Đã gửi",
    variant: "primary" as const,
    icon: "clock" as const,
    description: "Đang chờ duyệt"
  },
  in_review: {
    label: "Đang duyệt",
    variant: "primary" as const,
    icon: "alert-circle" as const,
    description: "Đang được kiểm duyệt"
  },
  published: {
    label: "Đã xuất bản",
    variant: "primary" as const,
    icon: "check-circle" as const,
    description: "Đã được duyệt và xuất bản"
  },
  rejected: {
    label: "Bị từ chối",
    variant: "danger" as const,
    icon: "x-circle" as const,
    description: "Cần chỉnh sửa theo góp ý"
  }
}

function formatDate(date: any): string {
  if (!date) return ''
  
  try {
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

export default function MyDraftsPage() {
  const { user, profile, loading: authLoading } = useFirebaseAuth()
  const router = useRouter()
  const [drafts, setDrafts] = React.useState<Draft[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<keyof typeof statusConfig | "all">("all")

  React.useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Allow contributor, partner, moderator, admin to access
    const allowedRoles = ['contributor', 'partner', 'moderator', 'admin']
    if (!profile || !allowedRoles.includes(profile.role)) {
      router.push('/')
      return
    }
    
    loadUserDrafts()
  }, [user, profile, authLoading, router])

  const loadUserDrafts = async () => {
    try {
      setLoading(true)
      const result = await getUserDrafts({ userId: user?.uid })
      
      const data = result.data as any
      if (data.success) {
        setDrafts(data.drafts || [])
      }
    } catch (error) {
      console.error('Error loading drafts:', error)
      setDrafts([])
    } finally {
      setLoading(false)
    }
  }

  // Filter drafts
  const filteredDrafts = React.useMemo(() => {
    let filtered = drafts

    if (searchQuery) {
      filtered = filtered.filter(draft =>
        draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draft.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(draft => draft.status === statusFilter)
    }

    return filtered.sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt)
      const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt)
      return bTime.getTime() - aTime.getTime()
    })
  }, [drafts, searchQuery, statusFilter])

  const handleDelete = async (draftId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản nháp này?")) return
    
    try {
      await deleteDraft({ draftId })
      await loadUserDrafts()
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Lỗi khi xóa bản nháp')
    }
  }

  const handleSubmitForReview = async (draftId: string) => {
    try {
      await submitDraftForReview({ draftId })
      await loadUserDrafts()
    } catch (error) {
      console.error('Error submitting for review:', error)
      alert('Lỗi khi gửi duyệt')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon name="loader" className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Đang tải...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bản nháp của tôi</h1>
              <p className="text-gray-600 mt-1">
                Quản lý các địa điểm bạn đã đóng góp
              </p>
            </div>
            <Link href="/contribute/new-place">
              <Button>
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Tạo địa điểm mới
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Tìm kiếm theo tên địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {Object.entries(statusConfig).map(([status, config]) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? "primary" : "ghost"}
                  onClick={() => setStatusFilter(status as keyof typeof statusConfig)}
                >
                  <Icon name={config.icon} className="w-4 h-4 mr-1" />
                  {config.label}
                </Button>
              ))}
              <Button
                size="sm"
                variant={statusFilter === "all" ? "primary" : "ghost"}
                onClick={() => setStatusFilter("all")}
              >
                Tất cả
              </Button>
            </div>
          </div>

          {/* Drafts List */}
          {filteredDrafts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Icon name="file-text" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "Không tìm thấy kết quả" : "Chưa có bản nháp nào"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                    : "Bắt đầu đóng góp bằng cách tạo địa điểm mới"
                  }
                </p>
                {!searchQuery && (
                  <Link href="/contribute/new-place">
                    <Button>
                      <Icon name="plus" className="w-4 h-4 mr-2" />
                      Tạo địa điểm đầu tiên
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDrafts.map((draft) => {
                const statusInfo = statusConfig[draft.status]
                const coverPhoto = draft.photos?.[0]
                
                return (
                  <Card key={draft.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Cover Image */}
                        <div className="w-48 h-32 bg-gray-200 flex-shrink-0">
                          {coverPhoto ? (
                            <img
                              src={coverPhoto}
                              alt={draft.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="image" className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {draft.title}
                              </h3>
                              <p className="text-gray-600 mb-2 line-clamp-2">
                                {draft.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Icon name="map-pin" className="w-4 h-4" />
                                  {draft.province}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="tag" className="w-4 h-4" />
                                  {draft.type}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="calendar" className="w-4 h-4" />
                                  {formatDate(draft.updatedAt)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant={statusInfo.variant}>
                                  <Icon name={statusInfo.icon} className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                                
                                {draft.moderatorNotes && (
                                  <Badge variant="secondary">
                                    <Icon name="message-circle" className="w-3 h-3 mr-1" />
                                    Có góp ý
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 ml-4">
                              {draft.status === 'draft' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="primary"
                                    onClick={() => handleSubmitForReview(draft.id)}
                                  >
                                    Gửi duyệt
                                  </Button>
                                  <Link href={`/contribute/edit/${draft.id}`}>
                                    <Button size="sm" variant="ghost">
                                      <Icon name="edit" className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                </>
                              )}
                              
                              {draft.status === 'rejected' && (
                                <Link href={`/contribute/edit/${draft.id}`}>
                                  <Button size="sm" variant="primary">
                                    Chỉnh sửa
                                  </Button>
                                </Link>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <Icon name="more-vertical" className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/contribute/preview/${draft.id}`}>
                                      <Icon name="eye" className="w-4 h-4 mr-2" />
                                      Xem trước
                                    </Link>
                                  </DropdownMenuItem>
                                  {draft.status === 'published' && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/places/${draft.id}`}>
                                        <Icon name="external-link" className="w-4 h-4 mr-2" />
                                        Xem trang công khai
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDelete(draft.id)}
                                  >
                                    <Icon name="trash-2" className="w-4 h-4 mr-2" />
                                    Xóa
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Moderator Notes */}
                          {draft.moderatorNotes && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm font-medium text-yellow-800 mb-1">
                                Góp ý từ kiểm duyệt viên:
                              </p>
                              <p className="text-sm text-yellow-700">
                                {draft.moderatorNotes}
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
        </div>
      </main>

      <Footer />
    </div>
  )
}

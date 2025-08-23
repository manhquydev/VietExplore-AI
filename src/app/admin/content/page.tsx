"use client"

import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

interface ContentStats {
  totalPlaces: number
  publishedPlaces: number
  pendingReview: number
  hiddenPlaces: number
  trustBadgeStats: {
    contributor: number
    partner: number
    verified: number
    community: number
  }
}

interface ContentItem {
  id: string
  name: string
  province: string
  type: string
  status: 'published' | 'pending' | 'hidden'
  trustBadge: 'contributor' | 'partner' | 'verified' | 'community'
  submittedBy: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
}

export default function AdminContentPage() {
  const { user, profile, loading: authLoading } = useFirebaseAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [contentStats, setContentStats] = useState<ContentStats | null>(null)
  const [recentContent, setRecentContent] = useState<ContentItem[]>([])

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (!profile || profile.role !== 'admin') {
      router.push('/')
      return
    }

    loadContentData()
  }, [user, profile, authLoading, router])

  const loadContentData = async () => {
    try {
      setLoading(true)
      
      // Mock data - can be replaced with real Firebase Functions calls
      const mockStats: ContentStats = {
        totalPlaces: 1247,
        publishedPlaces: 1189,
        pendingReview: 38,
        hiddenPlaces: 20,
        trustBadgeStats: {
          contributor: 523,
          partner: 341,
          verified: 275,
          community: 108
        }
      }

      const mockContent: ContentItem[] = [
        {
          id: "1",
          name: "Vịnh Hạ Long",
          province: "Quảng Ninh",
          type: "Điểm tham quan",
          status: "published",
          trustBadge: "verified",
          submittedBy: "partner@sdt.qn.gov.vn",
          submittedAt: "2 giờ trước",
          reviewedBy: "admin@system",
          reviewedAt: "1 giờ trước"
        },
        {
          id: "2",
          name: "Phố cổ Hội An",
          province: "Quảng Nam",
          type: "Khu vực lịch sử",
          status: "published",
          trustBadge: "partner",
          submittedBy: "partner@hoian.tourism",
          submittedAt: "4 giờ trước",
          reviewedBy: "moderator@system",
          reviewedAt: "3 giờ trước"
        },
        {
          id: "3",
          name: "Thác Sekumpul Bali",
          province: "Đà Lạt",
          type: "Thác nước",
          status: "pending",
          trustBadge: "contributor",
          submittedBy: "contributor_traveler_123",
          submittedAt: "1 ngày trước"
        },
        {
          id: "4",
          name: "Resort XYZ",
          province: "Nha Trang",
          type: "Khách sạn", 
          status: "hidden",
          trustBadge: "community",
          submittedBy: "spam_user_456",
          submittedAt: "2 ngày trước",
          reviewedBy: "moderator@system",
          reviewedAt: "1 ngày trước"
        }
      ]

      setContentStats(mockStats)
      setRecentContent(mockContent)
    } catch (error) {
      console.error('Error loading content data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrustBadgeLabel = (badge: string) => {
    const labels = {
      contributor: "Cộng tác viên",
      partner: "Đối tác cộng đồng",
      verified: "Đã kiểm duyệt",
      community: "Cộng đồng"
    }
    return labels[badge as keyof typeof labels] || badge
  }

  const getTrustBadgeVariant = (badge: string) => {
    const variants = {
      verified: "success",
      partner: "danger", 
      contributor: "secondary",
      community: "outline"
    }
    return variants[badge as keyof typeof variants] || "outline"
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      published: "Đã xuất bản",
      pending: "Chờ duyệt",
      hidden: "Đã ẩn"
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusVariant = (status: string) => {
    const variants = {
      published: "success",
      pending: "warning",
      hidden: "danger"
    }
    return variants[status as keyof typeof variants] || "outline"
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">Đang tải dữ liệu nội dung...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center text-red-600">Không có quyền truy cập</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!contentStats) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">Không thể tải dữ liệu nội dung</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Content Management</h1>
            <p className="text-muted mt-2">
              Quản lý địa điểm, trust badge và nội dung nền tảng
            </p>
          </div>
          <Badge variant="danger">
            <Icon name="shield" className="mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng địa điểm</CardTitle>
              <Icon name="map" className="text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contentStats.totalPlaces}</div>
              <p className="text-xs text-muted">Tất cả nội dung</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
              <Icon name="check-circle" className="text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{contentStats.publishedPlaces}</div>
              <p className="text-xs text-muted">Nội dung công khai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
              <Icon name="clock" className="text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{contentStats.pendingReview}</div>
              <p className="text-xs text-muted">Cần xem xét</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bị ẩn</CardTitle>
              <Icon name="x-circle" className="text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{contentStats.hiddenPlaces}</div>
              <p className="text-xs text-muted">Nội dung vi phạm</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trust Badge Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="shield-check" />
                Phân bố Trust Badge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Đã kiểm duyệt</Badge>
                    <span className="text-sm text-muted">{contentStats.trustBadgeStats.verified} địa điểm</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {((contentStats.trustBadgeStats.verified / contentStats.totalPlaces) * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="danger">Đối tác cộng đồng</Badge>
                    <span className="text-sm text-muted">{contentStats.trustBadgeStats.partner} địa điểm</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {((contentStats.trustBadgeStats.partner / contentStats.totalPlaces) * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Cộng tác viên</Badge>
                    <span className="text-sm text-muted">{contentStats.trustBadgeStats.contributor} địa điểm</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {((contentStats.trustBadgeStats.contributor / contentStats.totalPlaces) * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Cộng đồng</Badge>
                    <span className="text-sm text-muted">{contentStats.trustBadgeStats.community} địa điểm</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {((contentStats.trustBadgeStats.community / contentStats.totalPlaces) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Content Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="activity" />
                Hoạt động nội dung gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentContent.map((item) => (
                  <div key={item.id} className="border-b border-border pb-3 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <p className="text-xs text-muted">{item.province} • {item.type}</p>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant={getStatusVariant(item.status) as any} className="text-xs">
                          {getStatusLabel(item.status)}
                        </Badge>
                        <Badge variant={getTrustBadgeVariant(item.trustBadge) as any} className="text-xs">
                          {getTrustBadgeLabel(item.trustBadge)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted space-y-1">
                      <div>Gửi bởi: {item.submittedBy} • {item.submittedAt}</div>
                      {item.reviewedBy && (
                        <div>Duyệt bởi: {item.reviewedBy} • {item.reviewedAt}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="secondary" className="w-full">
                  Xem tất cả nội dung
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="settings" />
              Hành động quản lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="secondary" className="w-full">
                <Icon name="search" className="mr-2" />
                Tìm kiếm nội dung
              </Button>
              <Button variant="secondary" className="w-full">
                <Icon name="filter" className="mr-2" />
                Lọc theo trust badge
              </Button>
              <Button variant="secondary" className="w-full">
                <Icon name="edit" className="mr-2" />
                Chỉnh sửa hàng loạt
              </Button>
              <Button variant="secondary" className="w-full">
                <Icon name="share" className="mr-2" />
                Xuất dữ liệu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badge Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="shield" />
              Quản lý Trust Badge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Gán trust badge tự động</h4>
                  <p className="text-sm text-muted">Thiết lập quy tắc gán badge dựa trên nguồn</p>
                  <Button variant="secondary" size="sm">
                    Cấu hình quy tắc
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Kiểm duyệt badge thủ công</h4>
                  <p className="text-sm text-muted">Xem xét và gán badge cho nội dung quan trọng</p>
                  <Button variant="secondary" size="sm">
                    Duyệt badge
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="secondary">
                    Nâng cấp thành "Verified"
                  </Button>
                  <Button variant="secondary">
                    Hạ cấp badge
                  </Button>
                  <Button variant="secondary">
                    Xóa badge
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Actions */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Icon name="alert-triangle" />
              Hành động khẩn cấp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="danger">
                <Icon name="x-circle" className="mr-2" />
                Ẩn nội dung ngay
              </Button>
              <Button variant="danger">
                <Icon name="trash-2" className="mr-2" />
                Xóa nội dung spam
              </Button>
              <Button variant="danger">
                <Icon name="alert-circle" className="mr-2" />
                Báo cáo khẩn cấp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}

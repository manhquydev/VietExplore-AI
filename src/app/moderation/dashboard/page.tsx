"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Calendar,
  User,
  MapPin,
  Flag,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { useModerationQueue } from "@/hooks/use-admin"

interface ModerationItem {
  id: string
  contentType: "place" | "itinerary" | "user_report" | "suggestion"
  contentId: string
  submittedBy: string
  submittedAt: string
  status: "pending" | "approved" | "rejected" | "escalated"
  priority: "low" | "medium" | "high" | "urgent"
  content: {
    title: string
    description: string
    changes: string
    region?: string
    province?: string
    type?: string
    trustLabel?: string
  }
  submitterInfo?: {
    fullName: string
    role: string
    avatar?: string
  }
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}

// The moderation data now comes from the API via useModerationQueue hook

const statusConfig = {
  pending: { label: "Chờ duyệt", variant: "warning" as const, icon: Clock },
  approved: { label: "Đã duyệt", variant: "success" as const, icon: CheckCircle },
  rejected: { label: "Từ chối", variant: "danger" as const, icon: XCircle },
  hidden: { label: "Đã ẩn", variant: "secondary" as const, icon: Eye }
}

const priorityConfig = {
  low: { label: "Thấp", variant: "secondary" as const },
  medium: { label: "Trung bình", variant: "default" as const },
  high: { label: "Cao", variant: "warning" as const },
  urgent: { label: "Khẩn cấp", variant: "danger" as const }
}

const typeConfig = {
  place: { label: "Địa điểm", icon: MapPin },
  itinerary: { label: "Lịch trình", icon: Calendar },
  user_report: { label: "Báo cáo", icon: Flag },
  suggestion: { label: "Đề xuất", icon: User }
}

export default function ModerationDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<keyof typeof statusConfig | "all">("all")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<keyof typeof priorityConfig | "all">("all")
  const [activeTab, setActiveTab] = React.useState("queue")
  
  // Get real moderation data
  const { items, loading, error, reviewItem } = useModerationQueue({
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    contentType: typeFilter !== 'all' ? typeFilter as any : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter as any : undefined,
    limit: 50
  })

  // Check permissions
  const isModerator = user?.role === 'moderator' || user?.role === 'admin'

  // Filter items
  const filteredItems = React.useMemo(() => {
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.submitterInfo?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(item => item.contentType === typeFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(item => item.priority === priorityFilter)
    }

    return filtered.sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority]
      const bPriority = priorityOrder[b.priority]
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    })
  }, [items, searchQuery, statusFilter, typeFilter, priorityFilter])

  const stats = React.useMemo(() => {
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      approved: items.filter(i => i.status === 'approved').length,
      rejected: items.filter(i => i.status === 'rejected').length,
      urgent: items.filter(i => i.priority === 'urgent').length,
      reports: items.filter(i => i.contentType === 'user_report').length
    }
  }, [items])

  const handleAction = async (itemId: string, action: 'approve' | 'reject' | 'hide', notes?: string) => {
    try {
      const apiAction = action === 'hide' ? 'reject' : action
      const result = await reviewItem(itemId, apiAction, notes)
      
      if (!result.success) {
        console.error('Failed to review item:', result.error)
        // Show error to user - you might want to add toast notification here
        alert(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error reviewing item:', error)
      alert('Có lỗi xảy ra khi xử lý yêu cầu')
    }
  }

  const assignToSelf = (itemId: string) => {
    // This would require an API endpoint for assignment
    // For now, we'll just show it's assigned locally
    console.log(`Assigning item ${itemId} to ${user?.fullName}`)
  }

  if (!isAuthenticated || !isModerator) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
            <p className="text-muted mb-6">
              Trang này chỉ dành cho Moderator và Admin
            </p>
            <Button variant="secondary" onClick={() => window.history.back()}>
              Quay lại
            </Button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bảng điều khiển kiểm duyệt</h1>
          <p className="text-muted">
            Quản lý nội dung và báo cáo từ cộng đồng
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted">Tổng số</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warn">{stats.pending}</div>
              <div className="text-sm text-muted">Chờ duyệt</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.approved}</div>
              <div className="text-sm text-muted">Đã duyệt</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-danger">{stats.rejected}</div>
              <div className="text-sm text-muted">Từ chối</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-danger">{stats.urgent}</div>
              <div className="text-sm text-muted">Khẩn cấp</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.reports}</div>
              <div className="text-sm text-muted">Báo cáo</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="queue">Hàng đợi duyệt</TabsTrigger>
            <TabsTrigger value="reports">Báo cáo vi phạm</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm nội dung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Loại</SelectItem>
                    {Object.entries(typeConfig).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Ưu tiên</SelectItem>
                    {Object.entries(priorityConfig).map(([priority, config]) => (
                      <SelectItem key={priority} value={priority}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Moderation Queue */}
            <div className="space-y-4">
              {filteredItems.filter(item => item.contentType !== 'user_report').map((item) => {
                const statusInfo = statusConfig[item.status]
                const priorityInfo = priorityConfig[item.priority]
                const typeInfo = typeConfig[item.contentType]
                
                return (
                  <Card key={item.id} className={cn(
                    "transition-all hover:shadow-card",
                    item.priority === 'urgent' && "border-danger",
                    item.priority === 'high' && "border-warn"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{item.content.title}</h3>
                              <p className="text-muted text-sm line-clamp-2">{item.content.description}</p>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Badge variant={priorityInfo.variant} className="text-xs">
                                {priorityInfo.label}
                              </Badge>
                              <Badge variant={statusInfo.variant} className="gap-1 text-xs">
                                <statusInfo.icon className="w-3 h-3" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <typeInfo.icon className="w-4 h-4 text-muted" />
                              <span className="text-muted">{typeInfo.label}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted" />
                              <span className="text-muted mr-2">
                                {item.submitterInfo?.fullName || 'Unknown User'}
                              </span>
                              <UserRoleDisplay 
                                role={item.submitterInfo?.role || 'traveler'}
                                variant="compact"
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted" />
                              <span className="text-muted">
                                {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>

                            {item.reviewedBy && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted">Đã xử lý bởi: {item.reviewedBy}</span>
                              </div>
                            )}
                          </div>

                          {item.reviewNotes && (
                            <div className="p-3 bg-primary-50 rounded-md mb-4">
                              <p className="text-sm text-primary">
                                <strong>Ghi chú:</strong> {item.reviewNotes}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/moderation/review/${item.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </Link>
                            </Button>
                            
                            {item.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => assignToSelf(item.id)}
                                >
                                  Nhận xử lý
                                </Button>
                                
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleAction(item.id, 'approve')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Duyệt
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAction(item.id, 'reject')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Từ chối
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Reports List */}
            <div className="space-y-4">
              {filteredItems.filter(item => item.contentType === 'user_report').map((item) => {
                const statusInfo = statusConfig[item.status]
                const priorityInfo = priorityConfig[item.priority]
                
                return (
                  <Card key={item.id} className={cn(
                    "transition-all hover:shadow-card",
                    item.priority === 'urgent' && "border-danger",
                    item.priority === 'high' && "border-warn"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                            <Flag className="w-5 h-5 text-danger" />
                            {item.content.title}
                          </h3>
                          <p className="text-muted text-sm">{item.content.description}</p>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Badge variant={priorityInfo.variant} className="text-xs">
                            {priorityInfo.label}
                          </Badge>
                          <Badge variant={statusInfo.variant} className="gap-1 text-xs">
                            <statusInfo.icon className="w-3 h-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted">
                        <div className="flex items-center gap-2">
                          <span>Báo cáo bởi: {item.submitterInfo?.fullName || 'Unknown User'}</span>
                          <UserRoleDisplay 
                            role={item.submitterInfo?.role || 'traveler'}
                            variant="compact"
                          />
                        </div>
                        <span>•</span>
                        <span>{new Date(item.submittedAt).toLocaleDateString('vi-VN')}</span>
                        {item.content.reportType && (
                          <>
                            <span>•</span>
                            <span>Lý do: {item.content.reportType}</span>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" asChild>
                          <Link href={`/moderation/review/${item.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </Link>
                        </Button>
                        
                        {item.status === 'pending' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleAction(item.id, 'approve')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Giải quyết
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(item.id, 'hide')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ẩn nội dung
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold mb-2">
              Đang tải dữ liệu...
            </h3>
            <p className="text-muted">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">
              Có lỗi xảy ra
            </h3>
            <p className="text-muted mb-4">
              {error}
            </p>
            <Button onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">
              Không có mục nào cần xử lý
            </h3>
            <p className="text-muted">
              Tất cả nội dung đã được xử lý hoặc không có nội dung phù hợp với bộ lọc
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

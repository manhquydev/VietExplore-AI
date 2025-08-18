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

interface ModerationItem {
  id: string
  type: "place" | "itinerary" | "user" | "report"
  targetId: string
  title: string
  description: string
  status: "pending" | "approved" | "rejected" | "hidden"
  priority: "low" | "medium" | "high" | "urgent"
  submittedBy: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  submittedAt: string
  assignedTo?: {
    id: string
    name: string
  }
  moderatorNotes?: string
  category?: string
  reportReason?: string
}

// Mock moderation data
const mockModerationItems: ModerationItem[] = [
  {
    id: "mod_001",
    type: "place",
    targetId: "place_new_001",
    title: "Bãi biển Quy Nhon",
    description: "Bãi biển hoang sơ với cát vàng và nước biển trong xanh",
    status: "pending",
    priority: "medium",
    submittedBy: {
      id: "user_001",
      name: "Nguyễn Văn A",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      role: "contributor"
    },
    submittedAt: "2024-03-15T10:30:00Z",
    category: "biển"
  },
  {
    id: "mod_002",
    type: "report",
    targetId: "place_002",
    title: "Báo cáo: Thông tin sai lệch về giờ mở cửa",
    description: "Địa điểm này không mở cửa 24/7 như đã ghi",
    status: "pending",
    priority: "high",
    submittedBy: {
      id: "user_002",
      name: "Trần Thị B",
      role: "traveler"
    },
    submittedAt: "2024-03-15T08:15:00Z",
    reportReason: "Thông tin sai lệch",
    assignedTo: {
      id: "mod_001",
      name: "Moderator A"
    }
  },
  {
    id: "mod_003",
    type: "place",
    targetId: "place_new_002",
    title: "Đồi chè Mộc Châu",
    description: "Cảnh quan đồi chè bạt ngàn với không khí trong lành",
    status: "approved",
    priority: "low",
    submittedBy: {
      id: "user_003",
      name: "Lê Văn C",
      role: "partner"
    },
    submittedAt: "2024-03-14T16:45:00Z",
    category: "núi",
    moderatorNotes: "Thông tin đầy đủ và chính xác"
  },
  {
    id: "mod_004",
    type: "itinerary",
    targetId: "itinerary_new_001",
    title: "Hà Nội - Sa Pa 5 ngày",
    description: "Lịch trình khám phá miền Bắc cho gia đình",
    status: "pending",
    priority: "low",
    submittedBy: {
      id: "user_004",
      name: "Phạm Thị D",
      role: "traveler"
    },
    submittedAt: "2024-03-14T14:20:00Z",
    category: "lịch trình"
  }
]

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
  user: { label: "Người dùng", icon: User },
  report: { label: "Báo cáo", icon: Flag }
}

export default function ModerationDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [items, setItems] = React.useState(mockModerationItems)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<keyof typeof statusConfig | "all">("all")
  const [typeFilter, setTypeFilter] = React.useState<keyof typeof typeConfig | "all">("all")
  const [priorityFilter, setPriorityFilter] = React.useState<keyof typeof priorityConfig | "all">("all")
  const [activeTab, setActiveTab] = React.useState("queue")

  // Check permissions
  const isModerator = user?.role === 'moderator' || user?.role === 'admin'

  // Filter items
  const filteredItems = React.useMemo(() => {
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(item => item.type === typeFilter)
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
      reports: items.filter(i => i.type === 'report').length
    }
  }, [items])

  const handleAction = async (itemId: string, action: 'approve' | 'reject' | 'hide', notes?: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'hidden',
            moderatorNotes: notes || item.moderatorNotes
          }
        : item
    ))
  }

  const assignToSelf = (itemId: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, assignedTo: { id: user!.id, name: user!.fullName } }
        : item
    ))
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
              {filteredItems.filter(item => item.type !== 'report').map((item) => {
                const statusInfo = statusConfig[item.status]
                const priorityInfo = priorityConfig[item.priority]
                const typeInfo = typeConfig[item.type]
                
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
                              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                              <p className="text-muted text-sm line-clamp-2">{item.description}</p>
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
                                {item.submittedBy.name}
                              </span>
                              <UserRoleDisplay 
                                role={item.submittedBy.role}
                                variant="compact"
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted" />
                              <span className="text-muted">
                                {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>

                            {item.assignedTo && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted">Phụ trách: {item.assignedTo.name}</span>
                              </div>
                            )}
                          </div>

                          {item.moderatorNotes && (
                            <div className="p-3 bg-primary-50 rounded-md mb-4">
                              <p className="text-sm text-primary">
                                <strong>Ghi chú:</strong> {item.moderatorNotes}
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
                                {!item.assignedTo && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => assignToSelf(item.id)}
                                  >
                                    Nhận xử lý
                                  </Button>
                                )}
                                
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
              {filteredItems.filter(item => item.type === 'report').map((item) => {
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
                            {item.title}
                          </h3>
                          <p className="text-muted text-sm">{item.description}</p>
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
                          <span>Báo cáo bởi: {item.submittedBy.name}</span>
                          <UserRoleDisplay 
                            role={item.submittedBy.role}
                            variant="compact"
                          />
                        </div>
                        <span>•</span>
                        <span>{new Date(item.submittedAt).toLocaleDateString('vi-VN')}</span>
                        {item.reportReason && (
                          <>
                            <span>•</span>
                            <span>Lý do: {item.reportReason}</span>
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

        {/* Empty State */}
        {filteredItems.length === 0 && (
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

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
  BarChart3,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { callApi } from "@/lib/client/api"
import { useRouter } from "next/navigation"

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

// TODO: Migrate these functions to API routes
// const getModerationQueue = httpsCallable(functions, 'getModerationQueue')
// const modDecisionApprove = httpsCallable(functions, 'modDecisionApprove')
// const getModerationStats = httpsCallable(functions, 'getModerationStats')

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
  const { user, profile, loading: authLoading } = useFirebaseAuth()
  const router = useRouter()
  const [moderationItems, setModerationItems] = React.useState<ModerationItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    urgent: 0
  })
  const [activeTab, setActiveTab] = React.useState("all")
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')

  React.useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (!profile || (profile.role !== 'moderator' && profile.role !== 'admin')) {
      router.push('/')
      return
    }
    
    loadModerationData()
  }, [user, profile, authLoading, router, activeTab, statusFilter, priorityFilter, typeFilter])

  const loadModerationData = async () => {
    // TODO: Implement with a new API route
    console.log("loadModerationData needs to be migrated to a new API route.");
    setLoading(false);
    // try {
    //   setLoading(true)
    //   const result = await callApi('moderation/queue', 'GET', { ...filters });
    //   setModerationItems(result.items);
    //   setStats(result.stats);
    // } catch (error) {
    //   console.error('Error loading moderation data:', error)
    // } finally {
    //   setLoading(false)
    // }
  }

  const handleClaimRequest = async (requestId: string) => {
    try {
      await callApi('moderation/claim', 'POST', { requestId });
      loadModerationData(); // Refresh data
    } catch (error) {
      console.error('Error claiming request:', error);
      alert('Lỗi khi nhận việc: ' + (error as any).message);
    }
  }

  const handleApprove = async (requestId: string, reason?: string) => {
    try {
      // TODO: Call the new API route when it's ready
      // await callApi('moderation/approve', 'POST', { requestId, notes: reason });
      alert("Chức năng duyệt chưa được di chuyển sang API Route mới.");
      // loadModerationData()
    } catch (error) {
      console.error('Error approving request:', error);
    }
  }

  const handleReject = async (requestId: string, reason: string) => {
    try {
      await callApi('moderation/reject', 'POST', { requestId, notes: reason });
      loadModerationData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Lỗi khi từ chối: ' + (error as any).message);
    }
  }

  const handleRequestEdit = async (requestId: string, changes: string) => {
    try {
      await callApi('moderation/request-edit', 'POST', { requestId, notes: changes });
      loadModerationData();
    } catch (error) {
      console.error('Error requesting edit:', error);
      alert('Lỗi khi yêu cầu chỉnh sửa: ' + (error as any).message);
    }
  }

  const filteredItems = moderationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && item.status === 'pending') ||
                      (activeTab === 'urgent' && item.priority === 'urgent') ||
                      (activeTab === 'reports' && item.type === 'report')
    return matchesSearch && matchesTab
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">Đang tải dữ liệu kiểm duyệt...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
            <p className="text-muted">
              Quản lý và kiểm duyệt nội dung nền tảng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={loadModerationData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Badge variant="warning">
              {profile?.role === 'admin' ? 'Admin' : 'Moderator'} Access
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted">Tổng cộng</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted">Chờ duyệt</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted">Đã duyệt</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted">Từ chối</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted">Khẩn cấp</p>
                  <p className="text-2xl font-bold">{stats.urgent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="place">Địa điểm</SelectItem>
                    <SelectItem value="itinerary">Lịch trình</SelectItem>
                    <SelectItem value="report">Báo cáo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tất cả ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Chờ duyệt ({stats.pending})</TabsTrigger>
            <TabsTrigger value="urgent">Khẩn cấp ({stats.urgent})</TabsTrigger>
            <TabsTrigger value="reports">Báo cáo</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted">Không có mục nào để hiển thị</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <ModerationItemCard 
                    key={item.id} 
                    item={item}
                    onClaim={() => handleClaimRequest(item.id)}
                    onApprove={() => handleApprove(item.id)}
                    onReject={(reason) => handleReject(item.id, reason)}
                    onRequestEdit={(changes) => handleRequestEdit(item.id, changes)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  )
}

// Individual Moderation Item Card Component
function ModerationItemCard({ 
  item, 
  onClaim, 
  onApprove, 
  onReject, 
  onRequestEdit 
}: { 
  item: ModerationItem
  onClaim: () => void
  onApprove: () => void
  onReject: (reason: string) => void
  onRequestEdit: (changes: string) => void
}) {
  const StatusIcon = statusConfig[item.status].icon
  const TypeIcon = typeConfig[item.type].icon

  return (
    <Card className={cn(
      "border-l-4",
      item.priority === 'urgent' && "border-l-red-500",
      item.priority === 'high' && "border-l-orange-500",
      item.priority === 'medium' && "border-l-yellow-500",
      item.priority === 'low' && "border-l-green-500"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon className="w-4 h-4" />
              <span className="text-sm text-muted">{typeConfig[item.type].label}</span>
              <Badge variant={priorityConfig[item.priority].variant}>
                {priorityConfig[item.priority].label}
              </Badge>
              <Badge variant={statusConfig[item.status].variant}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[item.status].label}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-muted mb-4 line-clamp-2">{item.description}</p>

            <div className="flex items-center gap-4 text-sm text-muted">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{item.submittedBy.name}</span>
                <UserRoleDisplay role={item.submittedBy.role as any} variant="compact" />
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(item.submittedAt).toLocaleDateString('vi-VN')}</span>
              </div>
              {item.assignedTo && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Được nhận bởi {item.assignedTo.name}</span>
                </div>
              )}
            </div>

            {item.reportReason && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                <span className="font-medium">Lý do báo cáo:</span> {item.reportReason}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            {item.status === 'pending' && (
              <>
                {!item.assignedTo && (
                  <Button variant="secondary" size="sm" onClick={onClaim}>
                    Nhận việc
                  </Button>
                )}
                <Link href={`/moderation/review/${item.id}`}>
                  <Button variant="primary" size="sm">
                    Xem xét
                  </Button>
                </Link>
              </>
            )}
            {item.status !== 'pending' && (
              <Link href={`/moderation/review/${item.id}`}>
                <Button variant="ghost" size="sm">
                  Xem chi tiết
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

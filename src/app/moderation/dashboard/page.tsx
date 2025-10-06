/**
 * Moderation Dashboard - Vietnam Travel Theme
 * Modern admin interface with Vietnam tourism branding
 */

"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Calendar,
  User,
  MapPin,
  Flag,
  Shield,
  Activity,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { useModerationQueue } from "@/hooks/use-admin"
import { useRouter } from "next/navigation"
import { BrandedLoading } from "@/components/ui/branded-loading"

interface ModerationItem {
  id: string
  contentType: "place" | "itinerary" | "user_report" | "suggestion"
  contentId: string
  submittedBy: string
  submittedAt: string
  status: "pending" | "in_review" | "approved" | "rejected" | "escalated"
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

const statusConfig = {
  pending: { label: "Chờ duyệt", variant: "warning" as const, icon: Clock },
  in_review: { label: "Đang duyệt", variant: "default" as const, icon: Eye },
  approved: { label: "Đã duyệt", variant: "success" as const, icon: CheckCircle },
  rejected: { label: "Từ chối", variant: "danger" as const, icon: XCircle },
  escalated: { label: "Chuyển lên", variant: "warning" as const, icon: AlertTriangle },
  hidden: { label: "Đã ẩn", variant: "secondary" as const, icon: Eye }
}

const priorityConfig = {
  low: { label: "Thấp", variant: "secondary" as const },
  medium: { label: "Trung bình", variant: "default" as const },
  high: { label: "Cao", variant: "warning" as const },
  urgent: { label: "Khẩn cấp", variant: "danger" as const },
  1: { label: "Thấp", variant: "secondary" as const },
  2: { label: "Trung bình", variant: "default" as const },
  3: { label: "Cao", variant: "warning" as const },
  4: { label: "Khẩn cấp", variant: "danger" as const }
}

const typeConfig = {
  place: { label: "Địa điểm", icon: MapPin },
  itinerary: { label: "Lịch trình", icon: Calendar },
  user_report: { label: "Báo cáo", icon: Flag },
  suggestion: { label: "Đề xuất", icon: User }
}

export default function ModerationDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<keyof typeof statusConfig | "all">("all")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<keyof typeof priorityConfig | "all">("all")
  const [activeTab, setActiveTab] = React.useState("queue")
  const [timeOfDay, setTimeOfDay] = React.useState<'morning' | 'afternoon' | 'evening'>('morning')

  // Time of day greeting
  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay('morning')
    else if (hour < 18) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')
  }, [])

  // Get real moderation data
  const { items, loading, error, reviewItem } = useModerationQueue({
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    contentType: typeFilter !== 'all' ? typeFilter as any : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter as any : undefined,
    limit: 50
  })

  // Check permissions
  const isModerator = user?.role === 'moderator' || user?.role === 'admin'

  // Redirect if not authorized
  React.useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isModerator)) {
      router.push('/admin')
    }
  }, [authLoading, isAuthenticated, isModerator, router])

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
      in_review: items.filter(i => i.status === 'in_review').length,
      approved: items.filter(i => i.status === 'approved').length,
      rejected: items.filter(i => i.status === 'rejected').length,
      urgent: items.filter(i => i.priority === 'urgent').length,
      reports: items.filter(i => i.contentType === 'user_report').length
    }
  }, [items])

  const handleAction = async (itemId: string, action: 'approve' | 'reject' | 'hide' | 'start_review', notes?: string) => {
    try {
      const apiAction = action === 'hide' ? 'reject' : action
      const result = await reviewItem(itemId, apiAction, notes)

      if (!result.success) {
        console.error('Failed to review item:', result.error)
        alert(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error reviewing item:', error)
      alert('Có lỗi xảy ra khi xử lý yêu cầu')
    }
  }

  const getGreeting = () => {
    const greetings = {
      morning: '🌅 Chào buổi sáng',
      afternoon: '☀️ Chào buổi chiều',
      evening: '🌙 Chào buổi tối'
    }
    return greetings[timeOfDay]
  }

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <BrandedLoading
          variant="logo"
          size="lg"
          text="Đang xác thực quyền truy cập..."
        />
      </div>
    )
  }

  // Show nothing if not authorized (will redirect)
  if (!isAuthenticated || !isModerator) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Vietnam Travel Themed Header */}
      <div className="bg-gradient-to-r from-green-100 via-yellow-50 to-green-100 border-b-2 border-yellow-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center shadow-xl border-2 border-yellow-300 overflow-hidden">
                <Image
                  src="/logo-icon.svg"
                  alt="Du Lịch Việt"
                  width={48}
                  height={48}
                  className="scale-75"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-green-800 mb-1">
                  {getGreeting()}, {user?.fullName?.split(' ').slice(-1)[0] || 'Moderator'}!
                </h1>
                <p className="text-lg text-green-700 font-medium flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Bảng điều khiển Kiểm duyệt - Du Lịch Việt AI 🇻🇳
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="outline" className="bg-white/80 backdrop-blur-sm hover:bg-white">
                  ← Về Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview - Vietnam Style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-blue-200">
            <div className="absolute -top-4 -right-4 opacity-10">
              <Activity className="h-20 w-20 text-blue-400" />
            </div>
            <CardContent className="p-5 text-center relative">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600 font-medium">Tổng số</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-yellow-200">
            <div className="absolute -top-4 -right-4 opacity-10">
              <Clock className="h-20 w-20 text-yellow-400" />
            </div>
            <CardContent className="p-5 text-center relative">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
              <div className="text-sm text-gray-600 font-medium">Chờ duyệt</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-sky-200">
            <div className="absolute -top-4 -right-4 opacity-10">
              <Eye className="h-20 w-20 text-sky-400" />
            </div>
            <CardContent className="p-5 text-center relative">
              <div className="text-3xl font-bold text-sky-600 mb-1">{stats.in_review}</div>
              <div className="text-sm text-gray-600 font-medium">Đang duyệt</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-green-200">
            <div className="absolute -top-4 -right-4 opacity-10">
              <CheckCircle className="h-20 w-20 text-green-400" />
            </div>
            <CardContent className="p-5 text-center relative">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.approved}</div>
              <div className="text-sm text-gray-600 font-medium">Đã duyệt</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-red-200">
            <div className="absolute -top-4 -right-4 opacity-10">
              <XCircle className="h-20 w-20 text-red-400" />
            </div>
            <CardContent className="p-5 text-center relative">
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.rejected}</div>
              <div className="text-sm text-gray-600 font-medium">Từ chối</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-orange-200">
            <div className="absolute -top-4 -right-4 opacity-10">
              <AlertTriangle className="h-20 w-20 text-orange-400" />
            </div>
            <CardContent className="p-5 text-center relative">
              <div className="text-3xl font-bold text-orange-600 mb-1">{stats.urgent}</div>
              <div className="text-sm text-gray-600 font-medium">Khẩn cấp</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-purple-200">
            <div className="absolute -top-4 -right-4 opacity-10">
              <Flag className="h-20 w-20 text-purple-400" />
            </div>
            <CardContent className="p-5 text-center relative">
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.reports}</div>
              <div className="text-sm text-gray-600 font-medium">Báo cáo</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-green-200 p-1">
            <TabsTrigger value="queue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold">
              Hàng đợi duyệt
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-semibold">
              Báo cáo vi phạm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-6">
            {/* Filters */}
            <Card className="border-2 border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm nội dung..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-2 border-gray-300 focus:border-green-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32 border-2 border-gray-300">
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
                      <SelectTrigger className="w-32 border-2 border-gray-300">
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
                      <SelectTrigger className="w-32 border-2 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Ưu tiên</SelectItem>
                        {Object.entries(priorityConfig).filter(([key]) => !key.match(/^\d+$/)).map(([priority, config]) => (
                          <SelectItem key={priority} value={priority}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moderation Queue */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16">
                  <BrandedLoading
                    variant="logo"
                    size="lg"
                    text="Đang tải dữ liệu..."
                  />
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
                </div>
              ) : filteredItems.filter(item => item.contentType !== 'user_report').length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">Không có mục nào cần xử lý</h3>
                  <p className="text-gray-600">
                    Tất cả nội dung đã được xử lý hoặc không có nội dung phù hợp với bộ lọc
                  </p>
                </div>
              ) : (
                filteredItems.filter(item => item.contentType !== 'user_report').map((item) => {
                  const statusInfo = statusConfig[item.status] || statusConfig.pending
                  const priorityInfo = priorityConfig[item.priority] || priorityConfig.medium
                  const typeInfo = typeConfig[item.contentType]

                  return (
                    <Card key={item.id} className={cn(
                      "group transition-all hover:shadow-xl hover:scale-[1.01] border-2",
                      item.priority === 'urgent' && "border-red-300 bg-red-50/30",
                      item.priority === 'high' && "border-orange-300 bg-orange-50/30",
                      item.priority === 'medium' && "border-gray-200",
                      item.priority === 'low' && "border-gray-200"
                    )}>
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors">
                                    {item.content.title}
                                  </h3>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{item.content.description}</p>
                              </div>

                              <div className="flex gap-2 ml-4">
                                <Badge className={cn("text-xs font-semibold shadow-sm px-3 py-1",
                                  priorityInfo.variant === 'danger' && "bg-red-100 text-red-700",
                                  priorityInfo.variant === 'warning' && "bg-orange-100 text-orange-700",
                                  priorityInfo.variant === 'default' && "bg-blue-100 text-blue-700",
                                  priorityInfo.variant === 'secondary' && "bg-gray-100 text-gray-700"
                                )}>
                                  {priorityInfo.label}
                                </Badge>
                                <Badge className={cn("gap-1.5 text-xs font-semibold shadow-sm px-3 py-1",
                                  statusInfo.variant === 'success' && "bg-green-100 text-green-700",
                                  statusInfo.variant === 'warning' && "bg-yellow-100 text-yellow-700",
                                  statusInfo.variant === 'danger' && "bg-red-100 text-red-700",
                                  statusInfo.variant === 'default' && "bg-blue-100 text-blue-700"
                                )}>
                                  <statusInfo.icon className="w-3 h-3" />
                                  {statusInfo.label}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 mb-4 text-sm">
                              <div className="flex items-center gap-2">
                                <typeInfo.icon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">{typeInfo.label}</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  {item.submitterInfo?.fullName || 'Unknown User'}
                                </span>
                                <UserRoleDisplay
                                  role={item.submitterInfo?.role || 'traveler'}
                                  variant="compact"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  {new Date(item.submittedAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>

                              {item.reviewedBy && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-xs">Đã xử lý bởi: <strong>{item.reviewedBy}</strong></span>
                                </div>
                              )}
                            </div>

                            {item.reviewNotes && (
                              <div className="p-3 bg-blue-50 rounded-lg mb-4 border border-blue-200">
                                <p className="text-sm text-blue-700">
                                  <strong>📝 Ghi chú:</strong> {item.reviewNotes}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" asChild className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md font-semibold">
                                <Link href={`/moderation/review/${item.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Xem chi tiết
                                </Link>
                              </Button>

                              {item.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAction(item.id, 'start_review', 'Bắt đầu kiểm duyệt chi tiết')}
                                    className="bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 shadow-md font-semibold"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Bắt đầu duyệt
                                  </Button>

                                  <Button
                                    size="sm"
                                    onClick={() => handleAction(item.id, 'approve')}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md font-semibold"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    ✅ Duyệt
                                  </Button>

                                  <Button
                                    size="sm"
                                    onClick={() => handleAction(item.id, 'reject')}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md font-semibold"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    ❌ Từ chối
                                  </Button>
                                </>
                              )}

                              {item.status === 'in_review' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAction(item.id, 'approve')}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md font-semibold"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    ✅ Duyệt
                                  </Button>

                                  <Button
                                    size="sm"
                                    onClick={() => handleAction(item.id, 'reject')}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md font-semibold"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    ❌ Từ chối
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Reports List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16">
                  <BrandedLoading
                    variant="logo"
                    size="lg"
                    text="Đang tải báo cáo..."
                  />
                </div>
              ) : filteredItems.filter(item => item.contentType === 'user_report').length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">Không có báo cáo nào</h3>
                  <p className="text-gray-600">Tất cả báo cáo đã được xử lý</p>
                </div>
              ) : (
                filteredItems.filter(item => item.contentType === 'user_report').map((item) => {
                  const statusInfo = statusConfig[item.status] || statusConfig.pending
                  const priorityInfo = priorityConfig[item.priority] || priorityConfig.medium

                  return (
                    <Card key={item.id} className={cn(
                      "group transition-all hover:shadow-xl hover:scale-[1.01] border-2",
                      item.priority === 'urgent' && "border-red-300 bg-red-50/30",
                      item.priority === 'high' && "border-orange-300 bg-orange-50/30",
                      item.priority === 'medium' && "border-gray-200",
                      item.priority === 'low' && "border-gray-200"
                    )}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2 text-gray-900 group-hover:text-red-700 transition-colors">
                              <Flag className="w-5 h-5 text-red-600" />
                              {item.content.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{item.content.description}</p>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Badge className={cn("text-xs font-semibold shadow-sm px-3 py-1",
                              priorityInfo.variant === 'danger' && "bg-red-100 text-red-700",
                              priorityInfo.variant === 'warning' && "bg-orange-100 text-orange-700"
                            )}>
                              {priorityInfo.label}
                            </Badge>
                            <Badge className={cn("gap-1 text-xs font-semibold shadow-sm px-3 py-1",
                              statusInfo.variant === 'success' && "bg-green-100 text-green-700",
                              statusInfo.variant === 'warning' && "bg-yellow-100 text-yellow-700"
                            )}>
                              <statusInfo.icon className="w-3 h-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>Báo cáo bởi: {item.submitterInfo?.fullName || 'Unknown User'}</span>
                            <UserRoleDisplay
                              role={item.submitterInfo?.role || 'traveler'}
                              variant="compact"
                            />
                          </div>
                          <span>•</span>
                          <span>{new Date(item.submittedAt).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" asChild className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md font-semibold">
                            <Link href={`/moderation/review/${item.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </Link>
                          </Button>

                          {item.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAction(item.id, 'approve')}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md font-semibold"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                ✅ Giải quyết
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => handleAction(item.id, 'hide')}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-md font-semibold"
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
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
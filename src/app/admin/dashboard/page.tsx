"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminUsers, useModerationQueue, useAdminStats, useAdminPlaces } from "@/hooks/use-admin"
import { UserRole } from "@/lib/types/auth"
import { Users, MapPin, FileText, AlertTriangle, Shield, Settings, MoreHorizontal, UserCheck, UserX, KeyRound, Clock, TrendingUp, Eye, Heart, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/providers/toast-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const getInitials = (fullName?: string, email?: string) => {
  if (fullName) {
    const names = fullName.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return 'U';
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { stats, loading: statsLoading } = useAdminStats();
  
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Không có quyền truy cập</h1>
            <p className="mt-2 text-gray-600">Bạn cần quyền admin để truy cập trang này.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Quản lý người dùng, nội dung và hệ thống
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng người dùng"
            value={statsLoading ? '...' : stats.totalUsers.toLocaleString()}
            icon={<Users className="h-5 w-5 stroke-1" />}
            color="blue"
          />
          <StatsCard
            title="Địa điểm"
            value={statsLoading ? '...' : stats.totalPlaces.toLocaleString()}
            icon={<MapPin className="h-5 w-5 stroke-1" />}
            color="green"
          />
          <StatsCard
            title="Chờ duyệt"
            value={statsLoading ? '...' : stats.pendingModeration.toLocaleString()}
            icon={<Clock className="h-5 w-5 stroke-1" />}
            color="yellow"
          />
          <StatsCard
            title="Cần xử lý"
            value={statsLoading ? '...' : stats.openReports.toLocaleString()}
            icon={<TrendingUp className="h-5 w-5 stroke-1" />}
            color="red"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 rounded-lg border-0">
            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Người dùng</TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Kiểm duyệt</TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Nội dung</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Cài đặt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="moderation" className="space-y-6">
            <ModerationManagement />
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <ContentManagement />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  )
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red'
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    red: 'text-red-600 bg-red-50 border-red-200'
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UserManagement() {
  const { toast } = useToast()
  const [selectedRole, setSelectedRole] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  
  const { users, loading, error, changeUserRole, sendPasswordReset, toggleUserStatus } = useAdminUsers({
    role: selectedRole !== 'all' ? selectedRole as UserRole : undefined,
    search: searchTerm || undefined
  })

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const result = await changeUserRole(userId, newRole, 'Thay đổi bởi admin')
      console.log('Role change result:', result); // Debug log
      
      // Check if result is valid and has expected structure
      if (result && typeof result === 'object') {
        if (result.success) {
          toast.success(result.message || 'Thay đổi quyền thành công', { title: "Thành công" })
        } else {
          toast.error(result.error || 'Có lỗi xảy ra khi thay đổi quyền', { title: "Lỗi" })
        }
      } else {
        // Handle case where result is undefined/null or has unexpected format
        console.error('Unexpected result format:', result);
        toast.error('Phản hồi từ server không đúng định dạng', { title: "Lỗi" })
      }
    } catch (error) {
      console.error('Role change error:', error);
      toast.error('Có lỗi xảy ra khi thay đổi quyền', { title: "Lỗi" })
    }
  }

  const handlePasswordReset = async (email: string) => {
    const result = await sendPasswordReset(email)
    if (result && result.success) {
      toast.success(`Email đặt lại mật khẩu đã được gửi đến ${email}`, { title: "Thành công" })
    } else {
      toast.error(result?.error || 'Có lỗi xảy ra', { title: "Lỗi" })
    }
  }
  
  const handleToggleStatus = async (userId: string, disabled: boolean) => {
    const action = disabled ? "vô hiệu hóa" : "kích hoạt"
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return
    
    const result = await toggleUserStatus(userId, disabled)
    if (result && result.success) {
      toast.success(result.message || `Đã ${action} tài khoản thành công`, { title: "Thành công" })
    } else {
      toast.error(result?.error || 'Có lỗi xảy ra', { title: "Lỗi" })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 stroke-1" />
            Quản lý người dùng
            <span className="ml-2 text-sm font-normal text-gray-500">({users.length} người dùng)</span>
          </CardTitle>
        </CardHeader>
          <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
            <Input
              placeholder="Tìm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Vai trò</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="traveler">Traveler</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Đang tải danh sách người dùng...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Thử lại
            </Button>
          </div>
        ) : (
            <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      <span className="text-sm">{getInitials(user.fullName, user.email)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-gray-900">{user.fullName || 'Chưa cập nhật'}</p>
                        {user.disabled && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
                            Vô hiệu hóa
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                        {user.stats && (
                          <span>{user.stats.placesContributed || 0} đóng góp</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Select 
                        value={user.role} 
                        onValueChange={(newRole: UserRole) => handleRoleChange(user.id, newRole)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="traveler">Traveler</SelectItem>
                          <SelectItem value="contributor">Contributor</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Hành động
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePasswordReset(user.email)}>
                          Reset mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id, !user.disabled)}>
                          {user.disabled ? 'Kích hoạt tài khoản' : 'Vô hiệu hóa tài khoản'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
            </div>
        )}
          </CardContent>
        </Card>
      </div>
  )
}

function ModerationManagement() {
  const { toast } = useToast()
  const [selectedStatus, setSelectedStatus] = React.useState('pending')
  const { items, loading, error, reviewItem } = useModerationQueue({ status: selectedStatus })

  const handleReview = async (
    itemId: string, 
    action: 'approve' | 'reject' | 'escalate',
    notes?: string
  ) => {
    const result = await reviewItem(itemId, action, notes)
    if (result && result.success) {
      toast.success('Đã xử lý thành công!')
    } else {
      toast.error(`Lỗi: ${result?.error || 'Có lỗi xảy ra'}`)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'destructive'
    if (priority >= 2) return 'default'
    return 'secondary'
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 stroke-1" />
              Hàng đợi kiểm duyệt
              <span className="ml-2 text-sm font-normal text-gray-500">({items.length} mục)</span>
            </CardTitle>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
              <SelectItem value="escalated">Chuyển lên</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-2">Đang tải dữ liệu kiểm duyệt...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Thử lại
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {selectedStatus === 'pending' 
                ? 'Không có nội dung cần duyệt' 
                : `Không có nội dung ${selectedStatus === 'approved' ? 'đã duyệt' : selectedStatus === 'rejected' ? 'bị từ chối' : 'được chuyển lên'}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {item.metadata?.title || item.contentDetails?.name || 'Không có tiêu đề'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.contentDetails?.description || item.contentDetails?.shortDescription || 'Không có mô tả'}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="capitalize">
                        {item.contentType === 'place' ? 'Địa điểm' : item.contentType}
                      </Badge>
                      <Badge variant={getPriorityColor(item.priority)}>
                        Ưu tiên: {item.priority}
                      </Badge>
                      {item.metadata?.type && (
                        <Badge variant="secondary">{item.metadata.type}</Badge>
                      )}
                      {item.metadata?.region && (
                        <Badge variant="outline">
                          {item.metadata.region === 'bac-bo' ? 'Miền Bắc' : 
                           item.metadata.region === 'trung-bo' ? 'Miền Trung' : 'Miền Nam'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 ml-4">
                    <p className="font-medium">
                      {item.submitter?.fullName || 'N/A'}
                    </p>
                    <p className="text-xs">
                      {item.submitter?.role && (
                        <Badge variant="outline" className="mr-1 text-xs">
                          {item.submitter.role}
                        </Badge>
                      )}
                    </p>
                    <p className="mt-1">{formatDate(item.submittedAt)}</p>
                  </div>
                </div>
                
                {selectedStatus === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      size="sm" 
                      onClick={() => handleReview(item.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✓ Phê duyệt
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('Lý do từ chối:')
                        if (reason) handleReview(item.id, 'reject', reason)
                      }}
                    >
                      ✕ Từ chối
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const reason = prompt('Lý do chuyển lên:')
                        if (reason) handleReview(item.id, 'escalate', reason)
                      }}
                    >
                      ↑ Chuyển lên
                    </Button>
                    {item.contentType === 'place' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(`/admin/review/${item.id}`, '_blank')}
                      >
                        👁 Xem chi tiết
                      </Button>
                    )}
                  </div>
                )}
                
                {selectedStatus !== 'pending' && (
                  <div className="pt-4 border-t text-sm text-gray-600">
                    <p>Đã xử lý vào: {formatDate(item.reviewedAt || item.submittedAt)}</p>
                    {item.reviewNotes && <p>Ghi chú: {item.reviewNotes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      </Card>
    </div>
  )
}

function ContentManagement() {
  const { toast } = useToast()
  const [selectedStatus, setSelectedStatus] = React.useState<string>('published')
  const [selectedRegion, setSelectedRegion] = React.useState<string>('all')
  const [selectedType, setSelectedType] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [showBulkActions, setShowBulkActions] = React.useState(false)
  
  const { places, loading, error, updatePlaceStatus, deletePlace, deleteAllPlaces } = useAdminPlaces({
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    region: selectedRegion !== 'all' ? selectedRegion : undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    search: searchTerm || undefined
  })

  const handleStatusChange = async (placeId: string, newStatus: string) => {
    if (!confirm(`Bạn có chắc muốn thay đổi trạng thái địa điểm này thành "${newStatus}"?`)) return
    
    try {
      const result = await updatePlaceStatus(placeId, newStatus)
      if (result && result.success) {
        toast.success(result.message || 'Đã cập nhật trạng thái thành công', { title: "Thành công" })
      } else {
        toast.error(result?.error || 'Có lỗi xảy ra khi cập nhật trạng thái', { title: "Lỗi" })
      }
    } catch (error: any) {
      console.error('Error updating place status:', error)
      toast.error('Có lỗi không xác định xảy ra', { title: "Lỗi" })
    }
  }

  const handleDeletePlace = async (placeId: string, placeName: string) => {
    if (!confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN địa điểm "${placeName}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) return
    
    try {
      const result = await deletePlace(placeId)
      if (result && result.success) {
        toast.success(result.message || 'Đã xóa địa điểm thành công', { title: "Thành công" })
      } else {
        toast.error(result?.error || 'Có lỗi xảy ra khi xóa địa điểm', { title: "Lỗi" })
      }
    } catch (error: any) {
      console.error('Error deleting place:', error)
      toast.error('Có lỗi không xác định xảy ra', { title: "Lỗi" })
    }
  }

  const handleDeleteAllPlaces = async () => {
    if (!confirm(`Bạn có chắc muốn XÓA TẤT CẢ ${places.length} địa điểm?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) return
    if (!confirm(`XÁC NHẬN LẦN CUỐI: Bạn thực sự muốn xóa tất cả địa điểm?`)) return
    
    try {
      const result = await deleteAllPlaces()
      if (result && result.success) {
        toast.success(result.message || 'Đã xóa tất cả địa điểm thành công', { title: "Thành công" })
      } else {
        toast.error(result?.error || 'Có lỗi xảy ra khi xóa tất cả địa điểm', { title: "Lỗi" })
      }
    } catch (error: any) {
      console.error('Error deleting all places:', error)
      toast.error('Có lỗi không xác định xảy ra', { title: "Lỗi" })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-50 text-green-700 border-green-200'
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200'
      case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'in_review': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'hidden': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Đã xuất bản'
      case 'draft': return 'Bản nháp'
      case 'submitted': return 'Đã gửi'
      case 'in_review': return 'Đang duyệt'
      case 'hidden': return 'Ẩn'
      default: return status
    }
  }

  const getRegionText = (region: string) => {
    switch (region) {
      case 'bac-bo': return 'Miền Bắc'
      case 'trung-bo': return 'Miền Trung'
      case 'nam-bo': return 'Miền Nam'
      default: return region
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'bien': return 'Biển'
      case 'nui': return 'Núi'
      case 'van-hoa': return 'Văn hóa'
      case 'am-thuc': return 'Ẩm thực'
      case 'check-in': return 'Check-in'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Quản lý địa điểm
              <span className="ml-2 text-sm font-normal text-gray-500">({places.length} địa điểm)</span>
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                Hành động hàng loạt
              </Button>
            </div>
          </div>
          
          {showBulkActions && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Hành động nguy hiểm</h4>
              <p className="text-sm text-red-700 mb-3">Các hành động này không thể hoàn tác. Hãy cẩn thận!</p>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteAllPlaces}
                disabled={places.length === 0}
              >
                Xóa tất cả địa điểm ({places.length})
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
              <Input
                placeholder="Tìm theo tên, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="submitted">Đã gửi</SelectItem>
                  <SelectItem value="in_review">Đang duyệt</SelectItem>
                  <SelectItem value="hidden">Ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Miền</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="bac-bo">Miền Bắc</SelectItem>
                  <SelectItem value="trung-bo">Miền Trung</SelectItem>
                  <SelectItem value="nam-bo">Miền Nam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Loại</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="bien">Biển</SelectItem>
                  <SelectItem value="nui">Núi</SelectItem>
                  <SelectItem value="van-hoa">Văn hóa</SelectItem>
                  <SelectItem value="am-thuc">Ẩm thực</SelectItem>
                  <SelectItem value="check-in">Check-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Đang tải danh sách địa điểm...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Thử lại
              </Button>
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Không có địa điểm nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            <div className="space-y-3">
              {places.map((place) => (
                <div key={place.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900 truncate">{place.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(place.status)}`}>
                              {getStatusText(place.status)}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                              {place.trustLabel}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {place.shortDescription}
                          </p>
                          
                          <div className="flex items-center gap-6 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Miền:</span> {getRegionText(place.region)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Tỉnh:</span> {place.province}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Loại:</span> {getTypeText(place.type)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-6 text-xs text-gray-500 mt-2">
                            <span>{place.viewCount || 0} lượt xem</span>
                            <span>{place.likeCount || 0} thích</span>
                            <span>{place.rating?.average || 0}/5 ({place.rating?.count || 0} đánh giá)</span>
                            <span>Tạo: {formatDate(place.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/places/${place.slug}`} target="_blank">
                        <Button size="sm" variant="outline">
                          Xem chi tiết
                        </Button>
                      </Link>
                      
                      {place.status !== 'published' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusChange(place.id, 'published')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Xuất bản
                        </Button>
                      )}
                      
                      {place.status === 'published' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(place.id, 'hidden')}
                        >
                          Ẩn
                        </Button>
                      )}
                      
                      {place.status === 'hidden' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusChange(place.id, 'published')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Hiển thị
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeletePlace(place.id, place.name)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 stroke-1" />
            Cài đặt hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cài đặt hệ thống</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Các tùy chọn cài đặt nâng cao và quản lý hệ thống sẽ được bổ sung trong các phiên bản tiếp theo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

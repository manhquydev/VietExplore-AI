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
import { useAdminUsers, useModerationQueue, useAdminStats } from "@/hooks/use-admin"
import { UserRole } from "@/lib/types/auth"
import { Users, MapPin, FileText, AlertTriangle, Shield, Settings, MoreHorizontal, UserCheck, UserX, KeyRound, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

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
            icon={<Users className="h-6 w-6" />}
            color="blue"
          />
          <StatsCard
            title="Địa điểm"
            value={statsLoading ? '...' : stats.totalPlaces.toLocaleString()}
            icon={<MapPin className="h-6 w-6" />}
            color="green"
          />
          <StatsCard
            title="Chờ duyệt"
            value={statsLoading ? '...' : stats.pendingModeration.toLocaleString()}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
          />
          <StatsCard
            title="Báo cáo"
            value={statsLoading ? '...' : stats.openReports.toLocaleString()}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="red"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="moderation">Kiểm duyệt</TabsTrigger>
            <TabsTrigger value="content">Nội dung</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
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
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100'
  }

  return (
    <Card>
      <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
          </p>
        </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
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
    const result = await changeUserRole(userId, newRole, 'Thay đổi bởi admin')
    if (result.success) {
      toast({ title: "Thành công", description: result.message })
    } else {
      toast({ title: "Lỗi", description: result.error, variant: "destructive" })
    }
  }

  const handlePasswordReset = async (email: string) => {
    const result = await sendPasswordReset(email)
    if (result.success) {
      toast({ title: "Thành công", description: `Email đặt lại mật khẩu đã được gửi đến ${email}` })
    } else {
      toast({ title: "Lỗi", description: result.error, variant: "destructive" })
    }
  }
  
  const handleToggleStatus = async (userId: string, disabled: boolean) => {
    const action = disabled ? "vô hiệu hóa" : "kích hoạt"
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return
    
    const result = await toggleUserStatus(userId, disabled)
    if (result.success) {
      toast({ title: "Thành công", description: result.message })
    } else {
      toast({ title: "Lỗi", description: result.error, variant: "destructive" })
    }
  }

  return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
              Quản lý người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo vai trò" />
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

        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
            <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{getInitials(user.fullName, user.email)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{user.fullName || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.disabled && <Badge variant="destructive" className="mt-1">Vô hiệu hóa</Badge>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select 
                    value={user.role} 
                    onValueChange={(newRole: UserRole) => handleRoleChange(user.id, newRole)}
                  >
                    <SelectTrigger className="w-32">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handlePasswordReset(user.email)}>
                        <KeyRound className="w-4 h-4 mr-2" />
                        Reset Mật khẩu
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(user.id, !user.disabled)}>
                        {user.disabled ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Kích hoạt
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 mr-2" />
                            Vô hiệu hóa
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
        )}
          </CardContent>
        </Card>
  )
}

function ModerationManagement() {
  const { items, loading, error, reviewItem } = useModerationQueue()

  const handleReview = async (
    itemId: string, 
    action: 'approve' | 'reject' | 'escalate',
    notes?: string
  ) => {
    const result = await reviewItem(itemId, action, notes)
    if (result.success) {
      alert('Đã xử lý thành công!')
    } else {
      alert(`Lỗi: ${result.error}`)
    }
  }

  return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Hàng đợi kiểm duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-600">Không có nội dung cần duyệt</div>
        ) : (
            <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{item.content.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.content.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{item.contentType}</Badge>
                      <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Gửi bởi: {item.submitter.fullName}</p>
                    <p>{new Date(item.submittedAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleReview(item.id, 'approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Phê duyệt
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReview(item.id, 'reject', 'Không đáp ứng yêu cầu')}
                  >
                    Từ chối
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReview(item.id, 'escalate', 'Cần xem xét thêm')}
                  >
                    Chuyển lên
                  </Button>
                  </div>
                </div>
              ))}
            </div>
        )}
          </CardContent>
        </Card>
  )
}

function ContentManagement() {
  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Quản lý nội dung
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="text-center py-8 text-gray-600">
          Chức năng quản lý nội dung sẽ được triển khai trong giai đoạn tiếp theo
          </div>
        </CardContent>
      </Card>
  )
}

function SystemSettings() {
  return (
    <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Cài đặt hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="text-center py-8 text-gray-600">
          Cài đặt hệ thống sẽ được triển khai trong giai đoạn tiếp theo
          </div>
        </CardContent>
      </Card>
  )
}

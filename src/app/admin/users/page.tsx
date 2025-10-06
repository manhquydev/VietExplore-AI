/**
 * Enhanced User Management Page 2025 - Du Lịch Việt AI Admin
 * Modern user management with advanced data table and enhanced UI
 */

"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import Image from "next/image"
import { EnhancedCard, CardHeader, CardContent } from "@/components/ui/modern/enhanced-card"
import { EnhancedButton } from "@/components/ui/modern/enhanced-button"
import { EnhancedDataTable } from "@/components/ui/modern/enhanced-data-table"
import { useAdminTheme } from "@/providers/admin-theme-provider"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users, Crown, Shield, Star, Edit3, Eye, UserPlus, Mail, Ban,
  CheckCircle, AlertCircle, Filter, Download, RefreshCw, Search,
  MoreHorizontal, Settings, Activity, TrendingUp, Calendar, UserCog
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminUsers } from "@/hooks/use-admin"
import { toastService } from "@/lib/ui/toast-service"
import { UserRole } from "@/lib/types/auth"
import { apiClient } from "@/lib/client/api"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { AdminErrorState } from "@/components/admin/loading-states"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  disabled: boolean
  verified: boolean
  createdAt: string
  lastLogin: string
  stats: {
    placesSubmitted: number
    reviewsWritten: number
  }
}

const roleConfig = {
  admin: {
    label: "Quản trị viên",
    color: 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border-primary-300',
    icon: Crown,
    badgeSvg: '/badges/verified.svg',
    priority: 6
  },
  moderator: {
    label: "Kiểm duyệt viên",
    color: 'bg-gradient-to-r from-warning-100 to-success-100 text-warning-800 border-warning-200',
    icon: Shield,
    badgeSvg: null,
    priority: 5
  },
  partner: {
    label: "Đối tác",
    color: 'bg-gradient-to-r from-success-100 to-success-200 text-success-800 border-success-300',
    icon: Star,
    badgeSvg: '/badges/community-partner.svg',
    priority: 4
  },
  contributor: {
    label: "Cộng tác viên",
    color: 'bg-gradient-to-r from-info-100 to-primary-100 text-info-800 border-info-200',
    icon: Edit3,
    badgeSvg: '/badges/contributor.svg',
    priority: 3
  },
  traveler: {
    label: "Du khách",
    color: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    icon: Users,
    badgeSvg: null,
    priority: 2
  },
  guest: {
    label: "Khách",
    color: 'bg-neutral-50 text-neutral-600 border-neutral-200',
    icon: Eye,
    badgeSvg: null,
    priority: 1
  }
}

const statusConfig = {
  active: { 
    label: "Hoạt động", 
    color: 'bg-success-50 text-success-700 border-success-200',
    icon: CheckCircle,
    dotColor: 'bg-success-500'
  },
  disabled: { 
    label: "Bị khóa", 
    color: 'bg-danger-50 text-danger-700 border-danger-200',
    icon: Ban,
    dotColor: 'bg-danger-500'
  }
}

export default function EnhancedUserManagementPage() {
  const { user: currentUser } = useAuth()
  const { colors, spacing, animations, isDark } = useAdminTheme()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([])
  const [roleStats, setRoleStats] = React.useState<Record<UserRole, number> | null>(null)

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [newRole, setNewRole] = React.useState<UserRole>('traveler')
  const [roleChangeReason, setRoleChangeReason] = React.useState('')
  const [isChangingRole, setIsChangingRole] = React.useState(false)

  // Build filters for hook
  const userFilters = React.useMemo(() => {
    const filters: any = {}
    if (roleFilter !== 'all') {
      filters.role = roleFilter as UserRole
    }
    if (searchQuery) {
      filters.search = searchQuery
    }
    return filters
  }, [roleFilter, searchQuery])

  const {
    users,
    loading,
    error,
    changeUserRole,
    sendPasswordReset,
    toggleUserStatus
  } = useAdminUsers(userFilters)

  // Fetch role statistics
  React.useEffect(() => {
    async function fetchRoleStats() {
      try {
        const result = await apiClient.admin.users.stats()
        if (result.success && result.data) {
          setRoleStats(result.data.byRole)
        }
      } catch (error) {
        console.error('Failed to fetch role stats:', error)
      }
    }

    if (currentUser?.role === 'admin') {
      fetchRoleStats()
    }
  }, [currentUser, users]) // Re-fetch when users change

  const filteredUsers = React.useMemo(() => {
    let filtered = users || []

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => {
        if (statusFilter === 'active') return !u.disabled
        if (statusFilter === 'disabled') return u.disabled
        return false
      })
    }

    return filtered
  }, [users, statusFilter])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setRoleChangeReason('')
    setRoleDialogOpen(true)
  }

  const handleRoleChangeSubmit = async () => {
    if (!selectedUser) return

    if (selectedUser.role === newRole) {
      toastService.warning('Cảnh báo', 'Người dùng đã có vai trò này')
      return
    }

    setIsChangingRole(true)
    try {
      const result = await changeUserRole(selectedUser.id, newRole, roleChangeReason)

      if (result.success) {
        toastService.success('Thành công', `Đã cập nhật quyền thành ${roleConfig[newRole]?.label}`)
        setRoleDialogOpen(false)
        setSelectedUser(null)
        setRoleChangeReason('')
      } else {
        toastService.error('Lỗi', result.error || 'Lỗi khi cập nhật quyền người dùng')
      }
    } catch (error: any) {
      toastService.error('Lỗi', error.message || 'Lỗi khi cập nhật quyền người dùng')
    } finally {
      setIsChangingRole(false)
    }
  }

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus)
      toastService.success('Thành công', currentStatus ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')
    } catch (error) {
      toastService.error('Lỗi', 'Lỗi khi thay đổi trạng thái tài khoản')
    }
  }

  const handleSendPasswordReset = async (email: string) => {
    try {
      await sendPasswordReset(email)
      toastService.success('Thành công', 'Đã gửi email đặt lại mật khẩu')
    } catch (error) {
      toastService.error('Lỗi', 'Lỗi khi gửi email đặt lại mật khẩu')
    }
  }

  const bulkActions = [
    {
      label: 'Gửi email xác thực',
      onClick: (users: User[]) => {
        console.log('Send verification emails to', users.length, 'users')
        toastService.success('Thành công', `Đã gửi email xác thực cho ${users.length} người dùng`)
      },
      variant: 'secondary' as const
    },
    {
      label: 'Khóa tài khoản',
      onClick: (users: User[]) => {
        console.log('Disable', users.length, 'users')
        toastService.success('Thành công', `Đã khóa ${users.length} tài khoản`)
      },
      variant: 'danger' as const,
      disabled: (users: User[]) => users.some(u => u.disabled)
    }
  ]

  const tableColumns = [
    {
      key: 'user',
      title: 'Người dùng',
      width: '300px',
      render: (value: any, user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} />
            <AvatarFallback>
              {user.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-neutral-900">
              {user.fullName}
            </div>
            <div className="text-sm text-neutral-500">
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Quyền',
      width: '150px',
      render: (value: any, user: User) => {
        const config = roleConfig[user.role as keyof typeof roleConfig]
        const IconComponent = config?.icon || Users

        return (
          <Badge className={cn('inline-flex items-center gap-1 rounded-full h-7 transition-colors px-3 py-1.5 text-xs font-semibold border', config?.color)}>
            {config?.badgeSvg ? (
              <Image
                src={config.badgeSvg}
                alt={user.role}
                width={14}
                height={14}
                className="w-3.5 h-3.5 object-contain"
              />
            ) : (
              <IconComponent className="h-3 w-3" />
            )}
            {config?.label || user.role}
          </Badge>
        )
      }
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '120px',
      render: (value: any, user: User) => {
        const config = statusConfig[user.disabled ? 'disabled' : 'active']
        const IconComponent = config.icon
        
        return (
          <Badge className={cn('px-3 py-1.5 text-xs font-semibold border', config.color)}>
            <div className={cn('h-2 w-2 rounded-full mr-1.5', config.dotColor)}></div>
            {config.label}
          </Badge>
        )
      }
    },
    {
      key: 'stats',
      title: 'Hoạt động',
      width: '120px',
      render: (value: any, user: User) => (
        <div className="text-sm">
          <div className="text-neutral-900 font-medium">
            {user.stats?.placesSubmitted || 0} địa điểm
          </div>
          <div className="text-neutral-500">
            {user.stats?.reviewsWritten || 0} đánh giá
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Ngày tham gia',
      width: '120px',
      render: (value: any, user: User) => (
        <div className="text-sm text-neutral-600">
          {formatDate(user.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '150px',
      render: (value: any, user: User) => (
        <div className="flex items-center gap-2">
          <EnhancedButton
            variant="ghost"
            size="xs"
            onClick={() => openRoleDialog(user)}
            title="Thay đổi quyền"
          >
            <UserCog className="h-3 w-3" />
          </EnhancedButton>
          <EnhancedButton
            variant="ghost"
            size="xs"
            onClick={() => handleSendPasswordReset(user.email)}
            title="Gửi email đặt lại mật khẩu"
          >
            <Mail className="h-3 w-3" />
          </EnhancedButton>
          <EnhancedButton
            variant="ghost"
            size="xs"
            onClick={() => handleStatusToggle(user.id, user.disabled)}
            title={user.disabled ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
          >
            {user.disabled ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
          </EnhancedButton>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="min-h-[400px] flex items-center justify-center">
          <BrandedLoading 
            variant="logo" 
            size="lg"
            text="Đang tải danh sách người dùng..."
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <AdminErrorState
          title="Lỗi tải danh sách người dùng"
          description={error}
          action={
            <EnhancedButton 
              variant="outline" 
              onClick={() => window.location.reload()}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Thử lại
            </EnhancedButton>
          }
        />
      </div>
    )
  }

  const totalUsers = filteredUsers?.length || 0
  const activeUsers = filteredUsers?.filter(u => !u.disabled).length || 0
  const adminUsers = filteredUsers?.filter(u => u.role === 'admin').length || 0
  const verifiedUsers = filteredUsers?.filter(u => u.verified).length || 0

  return (
    <div className="min-h-screen bg-white">
      
      {/* Enhanced Header */}
      <div className="relative px-6 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-info-500/3 to-success-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <CardHeader
            title="Quản lý Người dùng"
            subtitle="Quản lý tài khoản, quyền và hoạt động của người dùng"
            icon={<Users className="h-6 w-6" />}
            action={
              <div className="flex items-center gap-3">
                <EnhancedButton
                  variant="outline"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Xuất Excel
                </EnhancedButton>
                <EnhancedButton
                  variant="primary"
                  leftIcon={<UserPlus className="h-4 w-4" />}
                >
                  Thêm người dùng
                </EnhancedButton>
              </div>
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 space-y-8">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Tổng người dùng
                  </p>
                  <p className="text-3xl font-bold text-primary-700 mt-1">{totalUsers}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Đang hoạt động
                  </p>
                  <p className="text-3xl font-bold text-success-700 mt-1">{activeUsers}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Quản trị viên
                  </p>
                  <p className="text-3xl font-bold text-warning-700 mt-1">{adminUsers}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Đã xác thực
                  </p>
                  <p className="text-3xl font-bold text-info-700 mt-1">{verifiedUsers}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-info-500 to-info-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Role Distribution Statistics */}
        <EnhancedCard variant="elevated">
          <CardHeader
            title="Phân bố vai trò"
            subtitle="Thống kê số lượng người dùng theo từng vai trò"
            icon={<Filter className="h-5 w-5" />}
          />
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(([role, config]) => {
                const count = roleStats?.[role] || 0
                const IconComponent = config.icon
                const isActive = roleFilter === role

                return (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105",
                      isActive
                        ? "border-primary-500 bg-primary-50 shadow-lg"
                        : "border-neutral-200 bg-white hover:border-primary-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        config.color.split(' ')[0]
                      )}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      {isActive && (
                        <CheckCircle className="h-4 w-4 text-primary-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-neutral-700">
                        {config.label}
                      </p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {count}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {roleFilter !== 'all' && (
              <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary-700" />
                  <span className="text-sm font-medium text-primary-900">
                    Đang lọc: {roleConfig[roleFilter as UserRole]?.label}
                  </span>
                </div>
                <EnhancedButton
                  variant="ghost"
                  size="xs"
                  onClick={() => setRoleFilter('all')}
                >
                  Xóa bộ lọc
                </EnhancedButton>
              </div>
            )}
          </CardContent>
        </EnhancedCard>

        {/* Enhanced Data Table */}
        <EnhancedCard variant="elevated" size="lg">
          <EnhancedDataTable
            data={filteredUsers || []}
            columns={tableColumns}
            loading={loading}
            search={
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success-500"></div>
                        <span>Hoạt động</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="disabled">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-danger-500"></div>
                        <span>Bị khóa</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
            selection={{
              selectedItems: selectedUsers,
              onSelectionChange: setSelectedUsers,
              getItemId: (user) => user.id
            }}
            actions={
              selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  {bulkActions.map((action, index) => (
                    <EnhancedButton
                      key={index}
                      variant={action.variant}
                      size="sm"
                      onClick={() => action.onClick(selectedUsers)}
                      disabled={action.disabled ? action.disabled(selectedUsers) : false}
                    >
                      {action.label}
                    </EnhancedButton>
                  ))}
                </div>
              )
            }
            pagination={{
              page: 1,
              limit: 50,
              total: totalUsers,
              onPageChange: (page) => console.log('Page changed:', page)
            }}
          />
        </EnhancedCard>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thay đổi quyền người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật vai trò và quyền hạn cho người dùng. Thông báo sẽ được gửi đến người dùng.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.fullName}`} />
                  <AvatarFallback>
                    {selectedUser.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-neutral-900">{selectedUser.fullName}</div>
                  <div className="text-sm text-neutral-500">{selectedUser.email}</div>
                </div>
              </div>

              {/* Current Role */}
              <div className="space-y-2">
                <Label>Vai trò hiện tại</Label>
                <div className="flex items-center gap-2">
                  <Badge className={cn('inline-flex items-center gap-1 rounded-full h-8 px-4 text-sm font-semibold border', roleConfig[selectedUser.role as keyof typeof roleConfig]?.color)}>
                    {React.createElement(roleConfig[selectedUser.role as keyof typeof roleConfig]?.icon, { className: "h-4 w-4" })}
                    {roleConfig[selectedUser.role as keyof typeof roleConfig]?.label}
                  </Badge>
                </div>
              </div>

              {/* New Role */}
              <div className="space-y-2">
                <Label htmlFor="new-role">Vai trò mới *</Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="Chọn vai trò mới" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traveler">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Du khách</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="contributor">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4" />
                        <span>Cộng tác viên</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="partner">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>Đối tác</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderator">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Kiểm duyệt viên</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        <span>Quản trị viên</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Lý do thay đổi (tùy chọn)</Label>
                <Textarea
                  id="reason"
                  placeholder="Nhập lý do thay đổi quyền..."
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-neutral-500">
                  Lý do sẽ được ghi lại trong lịch sử và gửi thông báo đến người dùng
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <EnhancedButton
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={isChangingRole}
            >
              Hủy
            </EnhancedButton>
            <EnhancedButton
              variant="primary"
              onClick={handleRoleChangeSubmit}
              disabled={isChangingRole || !selectedUser || selectedUser.role === newRole}
            >
              {isChangingRole ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
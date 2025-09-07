"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  CheckCircle, 
  AlertCircle, 
  Ban, 
  ShieldX, 
  Search, 
  Users, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  MoreHorizontal, 
  Mail,
  Filter,
  Download,
  UserPlus,
  Settings,
  TrendingUp,
  Crown,
  Shield,
  Star,
  Eye,
  Edit3
} from "lucide-react"
import Image from "next/image"
import { adminIcons } from "@/lib/admin/icon-system"
import { adminClasses } from "@/lib/admin/theme-utils"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { useAdminUsers } from "@/hooks/use-admin"
import { useToast } from "@/components/providers/toast-provider"
import { useNotifications, useNotificationPermission } from "@/components/ui/notification-system"
import { UserRole } from "@/lib/types/auth"
import { AdminTableSkeleton, AdminMetricSkeleton } from "@/components/admin/loading-states"

// Custom Role Icon Component
const RoleIcon = ({ role, className = "w-3 h-3" }: { role: string, className?: string }) => {
  const iconMap = {
    admin: "/icons/Verified.svg",
    moderator: "/icons/icon-round.svg", 
    partner: "/icons/Community_Partner.svg",
    contributor: "/icons/Contributor.svg",
    traveler: null, // No icon for traveler
    guest: null // No icon for guest
  }
  
  const iconSrc = iconMap[role as keyof typeof iconMap]
  
  if (!iconSrc) {
    return null // No icon for traveler and guest roles
  }
  
  return (
    <Image 
      src={iconSrc} 
      alt={`${role} icon`} 
      width={12} 
      height={12} 
      className={className}
    />
  )
}

const roleConfig = {
  admin: { 
    label: "Quản trị viên", 
    color: 'bg-gradient-to-r from-admin-primary-100 to-admin-info-100 text-admin-primary-800 border border-admin-primary-200', 
    icon: Crown,
    customIcon: true,
    priority: 6 
  },
  moderator: { 
    label: "Kiểm duyệt viên", 
    color: 'bg-gradient-to-r from-admin-warning-100 to-admin-success-100 text-admin-warning-800 border border-admin-warning-200', 
    icon: Shield,
    customIcon: true,
    priority: 5 
  },
  partner: { 
    label: "Đối tác", 
    color: 'bg-gradient-to-r from-admin-success-100 to-admin-success-200 text-admin-success-800 border border-admin-success-300', 
    icon: Star,
    customIcon: true,
    priority: 4 
  },
  contributor: { 
    label: "Cộng tác viên", 
    color: 'bg-gradient-to-r from-admin-info-100 to-admin-primary-100 text-admin-info-800 border border-admin-info-200', 
    icon: Edit3,
    customIcon: true,
    priority: 3 
  },
  traveler: { 
    label: "Du khách", 
    color: 'bg-gradient-to-r from-admin-neutral-100 to-admin-neutral-200 text-admin-neutral-700 border border-admin-neutral-300', 
    icon: Users,
    customIcon: false,
    priority: 2 
  },
  guest: { 
    label: "Khách", 
    color: 'bg-gradient-to-r from-admin-neutral-50 to-admin-neutral-100 text-admin-neutral-600 border border-admin-neutral-200', 
    icon: Eye,
    customIcon: false,
    priority: 1 
  }
}

const statusConfig = {
  active: { 
    label: "Hoạt động", 
    color: 'bg-admin-success-50 text-admin-success-700 border border-admin-success-200', 
    icon: CheckCircle,
    dotColor: 'bg-admin-success-500'
  },
  disabled: { 
    label: "Bị khóa", 
    color: 'bg-admin-error-50 text-admin-error-700 border border-admin-error-200', 
    icon: Ban,
    dotColor: 'bg-admin-error-500'
  }
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { getIdToken } = useFirebaseAuth()
  const { toast } = useToast()
  const notifications = useNotifications()
  const { permission, requestPermission } = useNotificationPermission()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

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

  // Request notification permission on component mount
  React.useEffect(() => {
    if (permission === 'default') {
      setTimeout(() => {
        requestPermission()
      }, 2000) // Wait 2 seconds before asking
    }
  }, [permission, requestPermission])

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

  const getInitials = (fullName?: string) => {
    if (!fullName || typeof fullName !== 'string') {
      return 'N/A'
    }
    return fullName.split(' ').map(n => n[0] || '').join('').toUpperCase() || 'N/A'
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      console.log('🔄 START: handleRoleChange called with:', { userId, newRole })
      
      if (!changeUserRole) {
        console.error('❌ changeUserRole function is not available')
        toast.error('Function not available - please refresh page')
        return
      }
      
      console.log('📞 Calling changeUserRole...')
      const result = await changeUserRole(userId, newRole, `Vai trò changed by ${currentUser?.fullName}`)
      console.log('📥 changeUserRole returned result:', result)
      console.log('📊 Result details - Type:', typeof result, 'Is Array:', Array.isArray(result), 'Constructor:', result?.constructor?.name)
      
      // Ultra-defensive checking
      if (result === null) {
        console.error('❌ Result is null')
        toast.error('Server returned null response')
        return
      }
      
      if (result === undefined) {
        console.error('❌ Result is undefined')
        toast.error('Server returned undefined response')
        return
      }
      
      if (typeof result !== 'object') {
        console.error('❌ Result is not an object:', typeof result, result)
        toast.error('Invalid response format from server')
        return
      }
      
      console.log('✅ Result is valid object, checking success property...')
      const hasSuccess = 'success' in result
      const hasError = 'error' in result
      console.log('🔍 Properties check - hasSuccess:', hasSuccess, 'hasError:', hasError, 'success value:', result.success)
      
      if (result.success === true) {
        console.log('✅ Success! Showing success toast')
        console.log('🔍 TOAST DEBUG - Type:', typeof toast, 'Value:', toast)
        console.log('🔍 TOAST SUCCESS - Type:', typeof toast?.success, 'Function?', typeof toast?.success === 'function')
        
        if (toast && typeof toast.success === 'function') {
          console.log('📢 Calling toast.success...')
          toast.success('Người dùng role updated successfully')
          console.log('📢 toast.success called successfully')
        } else {
          console.warn('⚠️ FALLBACK: Using notification system')
          notifications.success(
            'Vai trò người dùng đã được cập nhật thành công!',
            'Thành công',
            { duration: 4000 }
          )
        }
      } else {
        console.log('❌ Not successful, showing error toast')
        const errorMsg = (hasError ? result.error : null) || result.message || 'Unknown error occurred'
        console.log('📝 Error message to show:', errorMsg)
        
        if (toast && typeof toast.error === 'function') {
          toast.error(`Failed to update role: ${errorMsg}`)
        } else {
          console.warn('⚠️ FALLBACK: Using notification system')
          notifications.error(
            `Không thể cập nhật vai trò: ${errorMsg}`,
            'Lỗi',
            { duration: 6000 }
          )
        }
      }
      
      console.log('✅ END: handleRoleChange completed successfully')
    } catch (error: any) {
      console.error('💥 EXCEPTION caught in handleRoleChange:', error)
      console.error('💥 Error stack:', error?.stack)
      const errorMessage = error?.message || 'Network or system error'
      console.log('📝 Exception error message:', errorMessage)
      
      if (toast && typeof toast.error === 'function') {
        toast.error(`Failed to update role: ${errorMessage}`)
      } else {
        console.warn('⚠️ FALLBACK: Using notification system in catch block')
        notifications.error(
          `Lỗi hệ thống: ${errorMessage}`,
          'Lỗi nghiêm trọng',
          { duration: 8000, persistent: false }
        )
      }
    }
  }

  const handleStatusToggle = async (userId: string, disabled: boolean) => {
    try {
      const result = await toggleUserStatus(userId, disabled)
      
      if (!result) {
        toast.error(`Failed to ${disabled ? 'disable' : 'enable'} user: No response from server`)
        return
      }
      
      if (result.success === true) {
        toast.success(`Người dùng ${disabled ? 'disabled' : 'enabled'} successfully`)
      } else {
        toast.error(`Failed to ${disabled ? 'disable' : 'enable'} user: ${result.error || 'Unknown error occurred'}`)
      }
    } catch (error: any) {
      console.error('Error in handleStatusToggle:', error)
      toast.error(`Failed to ${disabled ? 'disable' : 'enable'} user: ${error.message || 'Network or system error'}`)
    }
  }

  const handlePasswordReset = async (email: string) => {
    try {
      const result = await sendPasswordReset(email)
      
      if (!result) {
        toast.error('Failed to send reset email: No response from server')
        return
      }
      
      if (result.success === true) {
        toast.success('Password reset email sent')
      } else {
        toast.error(`Failed to send reset email: ${result.error || 'Unknown error occurred'}`)
      }
    } catch (error: any) {
      console.error('Error in handlePasswordReset:', error)
      toast.error(`Failed to send reset email: ${error.message || 'Network or system error'}`)
    }
  }

  const handleSendEmailVerification = async (userId: string, email: string) => {
    try {
      // Get current user's token from Firebase Auth
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        toast.error('Bạn cần đăng nhập để thực hiện hành động này');
        return;
      }

      const token = await getIdToken();

      const response = await fetch('/api/admin/users/send-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, email })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('Email xác minh đã được gửi!')
        // In development, show the verification link
        if (result.verificationLink) {
          console.log('Verification link:', result.verificationLink);
          toast.success('Link xác minh đã được tạo (xem console để test)');
        }
      } else {
        toast.error(`Không thể gửi email: ${result.error || 'Lỗi không xác định'}`)
      }
    } catch (error: any) {
      console.error('Error sending email verification:', error)
      toast.error(`Lỗi gửi email: ${error.message || 'Lỗi hệ thống'}`)
    }
  }


  const getUserStatus = (user: any) => {
    if (user.disabled) return 'disabled'
    return 'active'
  }

  const actions = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1 sm:flex-none">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex gap-2">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40 focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Tất cả vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            {Object.entries(roleConfig).map(([role, config]) => (
              <SelectItem key={role} value={role}>
                <div className="flex items-center gap-2">
                  {config.customIcon ? (
                    <RoleIcon role={role} className="h-3 w-3" />
                  ) : (
                    <config.icon className="h-3 w-3" />
                  )}
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-3 w-3" />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-2">Quản lý người dùng, vai trò và quyền hạn trên nền tảng của bạn</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Không thể tải người dùng</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-neutral-50 via-white to-admin-primary-50/20">
      
      {/* Modern Header Section */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-admin-primary-500/5 via-admin-info-500/3 to-admin-success-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-600 to-admin-info-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-admin-neutral-900 tracking-tight">
                    Quản lý Người dùng
                  </h1>
                  <p className="text-admin-neutral-600 mt-1">
                    Hệ thống quản lý người dùng và phân quyền chuyên nghiệp
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 rounded-xl px-6 py-4 shadow-lg">
              <div className="flex items-center gap-4">
                {actions}
                <Button 
                  className="bg-gradient-to-r from-admin-success-600 to-admin-success-700 hover:from-admin-success-700 hover:to-admin-success-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Thêm người dùng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">
        
        {/* User Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Users */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-primary-500/10 via-transparent to-admin-primary-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Tổng người dùng
                  </p>
                  <div className="flex items-baseline gap-2">
                    {loading ? (
                      <div className="h-8 w-20 bg-gradient-to-r from-admin-primary-200/50 to-admin-primary-300/50 rounded-lg animate-pulse shadow-sm"></div>
                    ) : (
                      <span className="text-3xl font-bold text-admin-primary-700">
                        {users?.length || 0}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-500 to-admin-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-admin-success-600" />
                <span className="text-xs font-medium text-admin-success-700">
                  +{users?.filter(u => {
                    const joinDate = new Date(u.createdAt || Date.now())
                    const monthAgo = new Date()
                    monthAgo.setMonth(monthAgo.getMonth() - 1)
                    return joinDate >= monthAgo
                  }).length || 0} tháng này
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-success-500/10 via-transparent to-admin-success-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Đang hoạt động
                  </p>
                  <div className="flex items-baseline gap-2">
                    {loading ? (
                      <div className="h-8 w-16 bg-gradient-to-r from-admin-success-200/50 to-admin-success-300/50 rounded-lg animate-pulse shadow-sm"></div>
                    ) : (
                      <span className="text-3xl font-bold text-admin-success-700">
                        {users?.filter(u => !u.disabled).length || 0}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-success-500 to-admin-success-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-admin-success-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-admin-success-700">
                  {Math.round(((users?.filter(u => !u.disabled).length || 0) / Math.max(users?.length || 1, 1)) * 100)}% tổng số
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contributors & Partners */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-admin-info-500/10 via-transparent to-admin-primary-500/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Cộng tác viên
                  </p>
                  <div className="flex items-baseline gap-2">
                    {loading ? (
                      <div className="h-8 w-16 bg-gradient-to-r from-admin-info-200/50 to-admin-primary-200/50 rounded-lg animate-pulse shadow-sm"></div>
                    ) : (
                      <span className="text-3xl font-bold text-admin-info-700">
                        {users?.filter(u => ['contributor', 'partner'].includes(u.role)).length || 0}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-admin-info-500 to-admin-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Crown className="h-3 w-3 text-admin-info-600" />
                <span className="text-xs font-medium text-admin-info-700">
                  Thành viên chủ chốt
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Email Verification */}
          <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-admin-neutral-600 uppercase tracking-wide">
                    Chờ Email OK
                  </p>
                  <div className="flex items-baseline gap-2">
                    {loading ? (
                      <div className="h-8 w-16 bg-gradient-to-r from-orange-200/50 to-orange-300/50 rounded-lg animate-pulse shadow-sm"></div>
                    ) : (
                      <span className={`text-3xl font-bold ${users?.filter(u => !u.emailVerified && !u.disabled).length > 10 ? 'text-orange-700' : 'text-orange-600'}`}>
                        {users?.filter(u => !u.emailVerified && !u.disabled).length || 0}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">
                  {users?.filter(u => !u.emailVerified && !u.disabled).length > 10 ? 'Nhiều chờ xử lý' : 'Email pending'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table - Modern Design */}
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-admin-neutral-50/30 via-transparent to-admin-primary-50/20"></div>
          
          <CardHeader className="relative pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-admin-primary-500 to-admin-info-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-admin-neutral-900">Danh sách Người dùng</h2>
                  <p className="text-sm text-admin-neutral-600">Quản lý và theo dõi hoạt động người dùng</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-admin-primary-100 text-admin-primary-800 border border-admin-primary-200 px-3 py-1">
                  <Users className="h-3 w-3 mr-1.5" />
                  {filteredUsers.length} / {users?.length || 0}
                </Badge>
                {(roleFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                  <Badge className="bg-admin-warning-100 text-admin-warning-800 border border-admin-warning-200 px-3 py-1">
                    <Filter className="h-3 w-3 mr-1.5" />
                    Đã lọc
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-6">
                {/* Modern loading header */}
                <div className="text-center py-8 space-y-4">
                  <div className="relative">
                    <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-500 to-admin-info-600 rounded-xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-xl border-2 border-admin-primary-300/30 animate-ping"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-admin-neutral-700 font-semibold">Đang tải danh sách người dùng...</p>
                    <p className="text-sm text-admin-neutral-500">Hệ thống đang chuẩn bị dữ liệu cho bạn</p>
                  </div>
                </div>
                
                {/* Professional table skeleton */}
                <AdminTableSkeleton rows={6} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' 
                    ? "Thử điều chỉnh bộ lọc tìm kiếm" 
                    : "Chưa có người dùng nào trong hệ thống"
                  }
                </p>
                {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('')
                      setRoleFilter('all')
                      setStatusFilter('all')
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-900">Người dùng</TableHead>
                      <TableHead className="font-semibold text-gray-900">Vai trò</TableHead>
                      <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-gray-900">Email Verify</TableHead>
                      <TableHead className="font-semibold text-gray-900">Tham gia</TableHead>
                      <TableHead className="font-semibold text-gray-900">Thống kê</TableHead>
                      <TableHead width="80" className="font-semibold text-gray-900">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userItem) => {
                      const roleInfo = roleConfig[userItem.role as keyof typeof roleConfig]
                      const status = getUserStatus(userItem)
                      const statusInfo = statusConfig[status as keyof typeof statusConfig]
                      
                      return (
                        <TableRow key={userItem.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                                <AvatarImage src={`https://avatar.vercel.sh/${userItem.email}`} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                  {getInitials(userItem.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 truncate">{userItem.fullName}</p>
                                <p className="text-sm text-gray-600 truncate">{userItem.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge className={cn("text-xs font-medium", roleInfo.color)}>
                              {roleInfo.customIcon ? (
                                <RoleIcon role={userItem.role} className="w-3 h-3 mr-1" />
                              ) : (
                                <roleInfo.icon className="w-3 h-3 mr-1" />
                              )}
                              {roleInfo.label}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge className={cn("text-xs font-medium", statusInfo.color)}>
                              <statusInfo.icon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>

                          {/* Email Verification */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "p-1 rounded-full",
                                userItem.emailVerified ? "bg-green-100" : "bg-orange-100"
                              )}>
                                {userItem.emailVerified ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Mail className="h-3 w-3 text-orange-600" />
                                )}
                              </div>
                              <span className={cn(
                                "text-sm font-medium",
                                userItem.emailVerified ? "text-green-700" : "text-orange-700"
                              )}>
                                {userItem.emailVerified ? "Đã xác minh" : "Chưa xác minh"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1 text-gray-700">
                                <Calendar className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{formatDate(userItem.createdAt)}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                <span className="font-medium">{userItem.stats?.placesContributed || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3 text-green-500" />
                                <span className="font-medium">{userItem.stats?.itinerariesCreated || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-purple-500" />
                                <span className="font-medium">{userItem.stats?.helpfulVotes || 0}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePasswordReset(userItem.email)}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Gửi đặt lại mật khẩu
                                </DropdownMenuItem>
                                
                                {!userItem.emailVerified && (
                                  <DropdownMenuItem onClick={() => handleSendEmailVerification(userItem.id, userItem.email)}>
                                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                    Gửi xác minh email
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {currentUser?.role === 'admin' && userItem.role !== 'admin' && (
                                  <>
                                    {userItem.role !== 'traveler' && (
                                      <DropdownMenuItem onClick={() => handleRoleChange(userItem.id, 'traveler')}>
                                        Change to Du khách
                                      </DropdownMenuItem>
                                    )}
                                    {userItem.role !== 'contributor' && (
                                      <DropdownMenuItem onClick={() => handleRoleChange(userItem.id, 'contributor')}>
                                        Change to Cộng tác viên
                                      </DropdownMenuItem>
                                    )}
                                    {userItem.role !== 'partner' && (
                                      <DropdownMenuItem onClick={() => handleRoleChange(userItem.id, 'partner')}>
                                        Change to Đối tác
                                      </DropdownMenuItem>
                                    )}
                                    {userItem.role !== 'moderator' && (
                                      <DropdownMenuItem onClick={() => handleRoleChange(userItem.id, 'moderator')}>
                                        Change to Kiểm duyệt viên
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                
                                <DropdownMenuItem 
                                  className={userItem.disabled ? "text-green-600" : "text-red-600"}
                                  onClick={() => handleStatusToggle(userItem.id, !userItem.disabled)}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  {userItem.disabled ? "Kích hoạt người dùng" : "Vô hiệu người dùng"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
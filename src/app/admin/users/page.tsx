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
  Mail 
} from "lucide-react"
import { adminIcons } from "@/lib/admin/icon-system"
import { adminClasses } from "@/lib/admin/theme-utils"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { useAdminUsers } from "@/hooks/use-admin"
import { useToast } from "@/components/providers/toast-provider"
import { UserRole } from "@/lib/types/auth"

const roleConfig = {
  admin: { label: "Quản trị viên", color: 'bg-purple-100 text-purple-800', icon: adminIcons.status.success },
  moderator: { label: "Kiểm duyệt viên", color: 'bg-blue-100 text-blue-800', icon: adminIcons.navigation.moderation },
  partner: { label: "Đối tác", color: 'bg-green-100 text-green-800', icon: adminIcons.status.success },
  contributor: { label: "Cộng tác viên", color: 'bg-yellow-100 text-yellow-800', icon: adminIcons.navigation.users },
  traveler: { label: "Du khách", color: 'bg-gray-100 text-gray-800', icon: adminIcons.navigation.users },
  guest: { label: "Khách", color: 'bg-gray-100 text-gray-600', icon: adminIcons.navigation.users }
}

const statusConfig = {
  active: { label: "Hoạt động", color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: "Chờ xử lý", color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  disabled: { label: "Bị vô hiệu", color: 'bg-red-100 text-red-800', icon: Ban },
  inactive: { label: "Không hoạt động", color: 'bg-gray-100 text-gray-800', icon: ShieldX }
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
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

  const filteredUsers = React.useMemo(() => {
    let filtered = users || []

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => {
        if (statusFilter === 'active') return !u.disabled && u.verified
        if (statusFilter === 'pending') return !u.disabled && !u.verified
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
    const result = await changeUserRole(userId, newRole, `Vai trò changed by ${currentUser?.fullName}`)
    if (result.success) {
      toast.success('Người dùng role updated successfully')
    } else {
      toast.error(`Failed to update role: ${result.error || 'Unknown error occurred'}`)
    }
  }

  const handleStatusToggle = async (userId: string, disabled: boolean) => {
    const result = await toggleUserStatus(userId, disabled)
    if (result.success) {
      toast.success(`Người dùng ${disabled ? 'disabled' : 'enabled'} successfully`)
    } else {
      toast.error(`Failed to ${disabled ? 'disable' : 'enable'} user: ${result.error}`)
    }
  }

  const handlePasswordReset = async (email: string) => {
    const result = await sendPasswordReset(email)
    if (result.success) {
      toast.success('Password reset email sent')
    } else {
      toast.error(`Failed to send reset email: ${result.error}`)
    }
  }

  const getUserStatus = (user: any) => {
    if (user.disabled) return 'disabled'
    if (!user.verified) return 'pending'
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
                  <config.icon className="h-3 w-3" />
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
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm md:text-base text-gray-600">Quản lý người dùng, vai trò và quyền hạn trên nền tảng của bạn</p>
        </div>
        <div className="flex-shrink-0">
          {actions}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Thống kê Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Tổng người dùng</p>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-6 md:h-8 w-12 md:w-16 rounded"></div>
                    ) : (
                      <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                        {users?.length || 0}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Người dùng hoạt động</p>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-6 md:h-8 w-12 md:w-16 rounded"></div>
                    ) : (
                      <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                        {users?.filter(u => !u.disabled && u.verified).length || 0}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-amber-400">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Chờ xác minh</p>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-6 md:h-8 w-12 md:w-16 rounded"></div>
                    ) : (
                      <span className={`${users?.filter(u => !u.verified && !u.disabled).length > 5 ? 'text-amber-600' : 'text-gray-900'} font-bold`}>
                        {users?.filter(u => !u.verified && !u.disabled).length || 0}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Cộng tác viên</p>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-6 md:h-8 w-12 md:w-16 rounded"></div>
                    ) : (
                      <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        {users?.filter(u => ['contributor', 'partner'].includes(u.role)).length || 0}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <adminIcons.navigation.users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold">Danh sách người dùng</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {filteredUsers.length} / {users?.length || 0}
                </Badge>
                {(roleFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                  <Badge variant="secondary" className="text-xs">
                    Đã lọc
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium">Đang tải dữ liệu người dùng...</p>
                <p className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát</p>
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
                      <TableHead className="font-semibold text-gray-900">Xác minh</TableHead>
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
                              <roleInfo.icon className="w-3 h-3 mr-1" />
                              {roleInfo.label}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge className={cn("text-xs font-medium", statusInfo.color)}>
                              <statusInfo.icon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "p-1 rounded-full",
                                userItem.verified ? "bg-green-100" : "bg-yellow-100"
                              )}>
                                {userItem.verified ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                                )}
                              </div>
                              <span className={cn(
                                "text-sm font-medium",
                                userItem.verified ? "text-green-700" : "text-yellow-700"
                              )}>
                                {userItem.verified ? "Đã xác minh" : "Chưa xác minh"}
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
                                <DropdownMenuSeparator />
                                
                                {currentUser?.role === 'admin' && userItem.role !== 'admin' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleRoleChange(userItem.id, 'contributor')}>
                                      Change to Cộng tác viên
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(userItem.id, 'partner')}>
                                      Change to Đối tác
                                    </DropdownMenuItem>
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
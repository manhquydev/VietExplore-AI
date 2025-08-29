"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminStats } from "@/hooks/use-admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  BarChart3, 
  Settings, 
  Shield,
  LogOut,
  ChevronLeft
} from "lucide-react"

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string | number
  description?: string
  roles?: string[]
}

const navigation: NavItem[] = [
  {
    title: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Tổng quan hệ thống và chỉ số chính"
  },
  {
    title: "Hàng đợi kiểm duyệt",
    href: "/admin/moderation",
    icon: FileCheck,
    badge: "Mới",
    description: "Xem xét nội dung đã gửi"
  },
  {
    title: "Quản lý người dùng", 
    href: "/admin/users",
    icon: Users,
    description: "Quản lý người dùng và vai trò",
    roles: ["admin"]
  },
  {
    title: "Phân tích",
    href: "/admin/analytics", 
    icon: BarChart3,
    description: "Báo cáo và thông tin chi tiết"
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
    description: "Cấu hình hệ thống",
    roles: ["admin"]
  }
]

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  collapsed = false, 
  onToggle 
}) => {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { stats, loading } = useAdminStats()

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  )

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Bảng điều khiển</h2>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "p-2 h-8 w-8",
              collapsed && "mx-auto"
            )}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )} title={collapsed ? "Mở rộng" : "Thu gọn"} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-blue-700" : "text-gray-500 group-hover:text-gray-700"
                )} />
                
                {!collapsed && (
                  <>
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs px-2 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <>
            <Separator className="my-4" />
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Thống kê nhanh
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Đang chờ duyệt</span>
                  <span className="font-medium">
                    {loading ? "..." : stats.pendingModeration}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng người dùng</span>
                  <span className="font-medium">
                    {loading ? "..." : stats.totalUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái hệ thống</span>
                  <span className={`font-medium ${stats.systemHealth >= 99 ? 'text-green-600' : stats.systemHealth >= 95 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {loading ? "..." : stats.systemHealth >= 99 ? 'Tốt' : stats.systemHealth >= 95 ? 'Bình thường' : 'Cần chú ý'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className={cn(
            "w-full justify-start text-gray-700 hover:text-red-700 hover:bg-red-50",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Đăng xuất</span>}
        </Button>
      </div>
    </div>
  )
}
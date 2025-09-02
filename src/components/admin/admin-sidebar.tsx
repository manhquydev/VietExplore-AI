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
import { adminIcons } from "@/lib/admin/icon-system"
import { adminLayout } from "@/lib/admin/theme-utils"
import { AdminSkeleton, AdminLoading } from "@/components/admin/loading-states"
import { useFocusTrap, useKeyboardNavigation, AdminSROnly } from "@/lib/admin/accessibility"

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
    icon: adminIcons.navigation.dashboard,
    description: "Tổng quan hệ thống và chỉ số chính"
  },
  {
    title: "Kiểm duyệt",
    href: "/admin/moderation",
    icon: adminIcons.navigation.moderation,
    description: "Tổng quan hệ thống kiểm duyệt"
  },
  {
    title: "Người dùng", 
    href: "/admin/users",
    icon: adminIcons.navigation.users,
    description: "Quản lý người dùng và vai trò",
    roles: ["admin"]
  },
  {
    title: "Phân tích",
    href: "/admin/analytics", 
    icon: adminIcons.navigation.analytics,
    description: "Báo cáo và thông tin chi tiết"
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: adminIcons.navigation.settings,
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
  const focusTrapRef = useFocusTrap(!collapsed)
  const { focusedIndex, handleKeyDown } = useKeyboardNavigation(navigation.length)

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  )

  return (
    <aside 
      ref={focusTrapRef}
      role="navigation"
      aria-label="Admin navigation"
      className={cn(
        "admin-layout-sidebar flex flex-col h-screen transition-all duration-300",
        collapsed ? "admin-layout-sidebar-collapsed" : "admin-layout-sidebar"
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Header - Clean & Professional */}
      <div className="flex items-center justify-between p-4 border-b border-admin-neutral-200">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-admin-primary-600 to-admin-primary-700 rounded-xl flex items-center justify-center shadow-sm">
              <adminIcons.navigation.dashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="admin-card-title text-base">VietExplore</h2>
              <p className="admin-caption-text capitalize font-medium text-admin-primary-600">{user?.role}</p>
            </div>
          </div>
        )}
        
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "admin-btn-ghost admin-btn-sm p-2 h-8 w-8 hover:bg-admin-neutral-100",
              collapsed && "mx-auto"
            )}
          >
            <adminIcons.system.previous className={cn(
              "h-4 w-4 transition-transform duration-200",
              collapsed && "rotate-180"
            )} title={collapsed ? "Mở rộng" : "Thu gọn"} />
          </Button>
        )}
      </div>

      {/* Navigation - Professional & Clean */}
      <ScrollArea className="flex-1 px-3 py-6">
        <nav className="space-y-1" role="menubar">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                  <AdminSkeleton className="h-5 w-5 rounded" />
                  {!collapsed && <AdminSkeleton className="h-4 flex-1" />}
                </div>
              ))}
            </div>
          ) : (
            filteredNavigation.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              
              return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                tabIndex={focusedIndex === index ? 0 : -1}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-admin-primary-50 text-admin-primary-700 border-l-3 border-l-admin-primary-600 shadow-sm" 
                    : "text-admin-neutral-700 hover:bg-admin-neutral-100 hover:text-admin-neutral-900",
                  focusedIndex === index && "ring-2 ring-admin-primary-500 ring-offset-2"
                )}
                title={collapsed ? item.title : item.description}
                aria-label={`${item.title}${item.description ? `: ${item.description}` : ''}`}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  isActive ? "text-admin-primary-700" : "text-admin-neutral-500 group-hover:text-admin-neutral-700"
                )} />
                
                {!collapsed && (
                  <>
                    <AdminSROnly>Điều hướng đến </AdminSROnly>
                    <span className="truncate font-medium">{item.title}</span>
                    {stats.pendingModeration > 0 && item.href === '/admin/moderation' && (
                      <Badge className="ml-auto bg-admin-warning-100 text-admin-warning-700 border-admin-warning-200 text-xs px-2 py-0.5 font-semibold">
                        {stats.pendingModeration}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
              )
            })
          )}
        </nav>

        {!collapsed && (
          <>
            <Separator className="my-6 bg-admin-neutral-200" />
            <div className="px-3 py-2">
              <p className="admin-caption-text uppercase tracking-wider mb-3 font-semibold">
                Thống kê nhanh
              </p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2 rounded-md bg-admin-neutral-50">
                  <span className="text-admin-neutral-600">Chờ duyệt</span>
                  <span className={cn(
                    "font-semibold px-2 py-1 rounded-full text-xs",
                    stats.pendingModeration > 10 
                      ? "bg-admin-warning-100 text-admin-warning-700" 
                      : "bg-admin-neutral-200 text-admin-neutral-700"
                  )}>
                    {loading ? <AdminLoading size="sm" inline /> : stats.pendingModeration}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-admin-neutral-50">
                  <span className="text-admin-neutral-600">Người dùng</span>
                  <span className="font-semibold text-admin-primary-700">
                    {loading ? <AdminLoading size="sm" inline /> : stats.totalUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-admin-neutral-50">
                  <span className="text-admin-neutral-600">Hệ thống</span>
                  <span className={cn(
                    "font-semibold px-2 py-1 rounded-full text-xs",
                    stats.systemHealth >= 99 
                      ? 'bg-admin-success-100 text-admin-success-700' 
                      : stats.systemHealth >= 95 
                        ? 'bg-admin-warning-100 text-admin-warning-700' 
                        : 'bg-admin-error-100 text-admin-error-700'
                  )}>
                    {loading ? <AdminLoading size="sm" inline /> : stats.systemHealth >= 99 ? 'Tốt' : stats.systemHealth >= 95 ? 'Ổn' : 'Lỗi'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </ScrollArea>

      {/* Footer - User Profile & Logout */}
      <div className="p-4 border-t border-admin-neutral-200 bg-admin-neutral-50">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-lg bg-white border border-admin-neutral-200">
            <div className="w-10 h-10 bg-gradient-to-br from-admin-primary-600 to-admin-primary-700 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-sm font-semibold text-white">
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="admin-body-text font-semibold text-admin-neutral-900 truncate">
                {user?.fullName}
              </p>
              <p className="admin-caption-text truncate">
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
            "admin-btn-ghost w-full text-admin-neutral-700 hover:text-admin-error-600 hover:bg-admin-error-50 transition-all duration-200",
            collapsed ? "justify-center px-2" : "justify-start gap-3"
          )}
        >
          <adminIcons.system.close className="h-4 w-4" />
          {!collapsed && <span className="font-medium">Đăng xuất</span>}
        </Button>
      </div>
    </aside>
  )
}
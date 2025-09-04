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
import { AdminSkeleton } from "@/components/admin/loading-states"
import { BrandedLoading } from "@/components/ui/branded-loading"
import Image from "next/image"
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
    title: "Về trang chủ",
    href: "/",
    icon: adminIcons.navigation.analytics,
    description: "Quay về website chính Du Lịch Việt"
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
        "fixed left-0 top-0 z-50 w-64 flex flex-col h-screen bg-white border-r border-pink-200 shadow-lg transition-all duration-300",
        collapsed && "w-16"
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Header - Project Branding */}
      <div className="flex items-center justify-between p-4 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-white shadow-lg border-2 border-pink-200 flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo-stacked.svg" 
                alt="Du Lịch Việt Logo"
                width={32}
                height={32}
                className="object-contain scale-75"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Du Lịch Việt</h2>
              <p className="text-sm font-medium text-pink-600 capitalize">Quản trị • {user?.role}</p>
            </div>
          </div>
        )}
        
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "p-2 h-8 w-8 hover:bg-pink-100 text-pink-600",
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
                    ? "bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 border-l-4 border-l-pink-600 shadow-sm" 
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:text-pink-700",
                  focusedIndex === index && "ring-2 ring-pink-500 ring-offset-2"
                )}
                title={collapsed ? item.title : item.description}
                aria-label={`${item.title}${item.description ? `: ${item.description}` : ''}`}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  isActive ? "text-pink-700" : "text-gray-500 group-hover:text-pink-600"
                )} />
                
                {!collapsed && (
                  <>
                    <AdminSROnly>Điều hướng đến </AdminSROnly>
                    <span className="truncate font-medium">{item.title}</span>
                    {stats.pendingModeration > 0 && item.href === '/admin/moderation' && (
                      <Badge className="ml-auto bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border border-pink-300 text-xs px-2 py-0.5 font-semibold">
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
            <Separator className="my-6 bg-pink-200" />
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-md flex items-center justify-center">
                  <adminIcons.navigation.analytics className="h-3 w-3 text-white" />
                </div>
                <p className="text-xs text-pink-700 uppercase tracking-wider font-semibold">
                  Thống kê nhanh
                </p>
              </div>
              
              <div className="space-y-3">
                {/* Chờ duyệt - Enhanced Card */}
                <div className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-sm">
                        <adminIcons.status.pending className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-pink-700">Chờ duyệt</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "font-bold text-sm px-2.5 py-1 rounded-full shadow-sm transition-colors duration-200",
                        stats.pendingModeration > 10 
                          ? "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-300" 
                          : "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300"
                      )}>
                        {loading ? <BrandedLoading variant="spinner" size="sm" showText={false} /> : stats.pendingModeration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Người dùng - Enhanced Card */}
                <div className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <adminIcons.navigation.users className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-blue-700">Người dùng</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-blue-800 bg-gradient-to-r from-blue-100 to-indigo-100 px-2.5 py-1 rounded-full shadow-sm border border-blue-300">
                        {loading ? <BrandedLoading variant="spinner" size="sm" showText={false} /> : stats.totalUsers.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hệ thống - Enhanced Card */}
                <div className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-6 w-6 rounded-lg flex items-center justify-center shadow-sm",
                        stats.systemHealth >= 99 
                          ? "bg-gradient-to-br from-emerald-500 to-green-600" 
                          : stats.systemHealth >= 95 
                            ? "bg-gradient-to-br from-yellow-500 to-orange-500" 
                            : "bg-gradient-to-br from-red-500 to-red-600"
                      )}>
                        {stats.systemHealth >= 99 ? (
                          <adminIcons.status.success className="h-3 w-3 text-white" />
                        ) : stats.systemHealth >= 95 ? (
                          <adminIcons.status.warning className="h-3 w-3 text-white" />
                        ) : (
                          <adminIcons.status.error className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        stats.systemHealth >= 99 
                          ? "text-emerald-700" 
                          : stats.systemHealth >= 95 
                            ? "text-yellow-700" 
                            : "text-red-700"
                      )}>
                        Hệ thống
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "font-bold text-sm px-2.5 py-1 rounded-full shadow-sm border transition-colors duration-200",
                        stats.systemHealth >= 99 
                          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-300' 
                          : stats.systemHealth >= 95 
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300' 
                            : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                      )}>
                        {loading ? <BrandedLoading variant="spinner" size="sm" showText={false} /> : stats.systemHealth >= 99 ? 'Tốt' : stats.systemHealth >= 95 ? 'Ổn' : 'Lỗi'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </ScrollArea>

      {/* Footer - User Profile & Logout */}
      <div className="p-4 border-t border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-lg bg-white/80 backdrop-blur-sm border border-pink-200 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-sm font-semibold text-white">
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-pink-600 truncate">
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
            "w-full text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg",
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
/**
 * Modern Admin Sidebar - 2025 Design
 * Clean, responsive, accessible sidebar with modern interactions
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { useAdminStats } from '@/hooks/use-admin'
import { cn } from '@/lib/utils'
import { designSystem } from '@/lib/design-system'
import Image from 'next/image'
import { 
  ChevronLeft,
  Home,
  Shield,
  Users,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface ModernSidebarProps {
  collapsed?: boolean
  onToggleCollapsed?: () => void
  className?: string
}

interface NavItem {
  id: string
  title: string
  href: string
  icon: React.ElementType
  badge?: string | number
  description?: string
  roles?: string[]
}

const navigation: NavItem[] = [
  {
    id: 'dashboard',
    title: 'Tổng quan',
    href: '/admin',
    icon: Home,
    description: 'Dashboard tổng quan hệ thống'
  },
  {
    id: 'moderation',
    title: 'Kiểm duyệt',
    href: '/admin/moderation',
    icon: Shield,
    description: 'Quản lý nội dung chờ duyệt'
  },
  {
    id: 'places',
    title: 'Địa điểm',
    href: '/admin/places',
    icon: MapPin,
    description: 'Quản lý địa điểm du lịch',
    roles: ['moderator', 'admin']
  },
  {
    id: 'users',
    title: 'Người dùng',
    href: '/admin/users',
    icon: Users,
    description: 'Quản lý tài khoản người dùng',
    roles: ['admin']
  },
  {
    id: 'analytics',
    title: 'Phân tích',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Báo cáo và thống kê'
  },
  {
    id: 'settings',
    title: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings,
    description: 'Cấu hình hệ thống',
    roles: ['admin']
  }
]

export function ModernSidebar({ 
  collapsed = false, 
  onToggleCollapsed,
  className 
}: ModernSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { stats, loading: statsLoading } = useAdminStats()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  
  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  )

  // Check if nav item is active
  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          // Base styles - fixed position để không cuộn theo trang
          'fixed left-0 top-0 z-50 h-screen bg-white border-r transition-all duration-300 ease-out',
          // Width variations
          collapsed ? 'w-16' : 'w-64',
          // Mobile styles
          'lg:block',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
        style={{
          borderColor: designSystem.semanticColors.border.default
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                <Image
                  src="/logo-icon.svg"
                  alt="Du Lịch Việt Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Du Lịch Việt</h2>
                <p className="text-xs text-neutral-500">Admin Panel</p>
              </div>
            </div>
          )}

          {/* Collapse Toggle - Desktop */}
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className={cn(
                'hidden lg:flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                'hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                collapsed && 'mx-auto'
              )}
              style={{
                borderColor: designSystem.semanticColors.border.default
              }}
            >
              <ChevronLeft className={cn(
                'h-4 w-4 transition-transform',
                collapsed && 'rotate-180'
              )} />
            </button>
          )}

          {/* Close Button - Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    'hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    active 
                      ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-200'
                      : 'text-neutral-700 hover:text-neutral-900',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    active ? 'text-primary-600' : 'text-neutral-500 group-hover:text-neutral-700'
                  )} />
                  
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.title}</span>
                      
                      {/* Badge for pending items */}
                      {item.id === 'moderation' && stats.pendingModeration > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-warning-100 text-warning-800 text-xs font-medium">
                          {stats.pendingModeration > 99 ? '99+' : stats.pendingModeration}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Quick Stats - Only when not collapsed */}
          {!collapsed && (
            <div className="mt-6 p-3 bg-neutral-50 rounded-lg">
              <h4 className="text-xs font-medium text-neutral-700 mb-3 uppercase tracking-wide">
                Thống kê nhanh
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">Người dùng</span>
                  <span className="font-medium text-neutral-900">
                    {statsLoading ? '...' : stats.totalUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">Địa điểm</span>
                  <span className="font-medium text-neutral-900">
                    {statsLoading ? '...' : stats.totalPlaces.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">Chờ duyệt</span>
                  <span className={cn(
                    'font-medium',
                    stats.pendingModeration > 0 ? 'text-warning-700' : 'text-success-700'
                  )}>
                    {statsLoading ? '...' : stats.pendingModeration}
                  </span>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t">
          {!collapsed && user && (
            <div className="mb-3 flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
                <span className="text-xs font-medium">
                  {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user.fullName || user.email}
                </p>
                <p className="text-xs text-neutral-500 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => logout()}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              'text-neutral-700 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-md bg-white border shadow-sm hover:bg-neutral-50"
        style={{
          borderColor: designSystem.semanticColors.border.default
        }}
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}

// Backward compatibility
export const AdminSidebar = ModernSidebar
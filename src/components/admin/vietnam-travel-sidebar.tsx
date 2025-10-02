"use client"

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { useAdminStats } from '@/hooks/use-admin'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  Home,
  Shield,
  Users,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  FileText,
  Activity,
  Wrench,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Megaphone
} from 'lucide-react'

interface VietnamTravelSidebarProps {
  collapsed?: boolean
  onToggleCollapsed?: () => void
  className?: string
}

interface NavSection {
  section: string
  items: NavItem[]
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

// Đầy đủ navigation với 16 trang admin được nhóm theo section
const navigationSections: NavSection[] = [
  {
    section: "Tổng quan",
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/admin',
        icon: Home,
        description: 'Tổng quan hệ thống'
      }
    ]
  },
  {
    section: "Kiểm duyệt",
    items: [
      {
        id: 'moderation',
        title: 'Tổng quan',
        href: '/admin/moderation',
        icon: Shield,
        description: 'Tổng quan kiểm duyệt'
      },
      {
        id: 'moderation-queue',
        title: 'Hàng đợi',
        href: '/admin/moderation/queue',
        icon: AlertTriangle,
        description: 'Hàng đợi kiểm duyệt'
      },
      {
        id: 'moderation-management',
        title: 'Quản lý',
        href: '/admin/moderation/management',
        icon: Wrench,
        description: 'Quản lý kiểm duyệt'
      },
      {
        id: 'moderation-reports',
        title: 'Báo cáo',
        href: '/admin/moderation/reports',
        icon: FileText,
        description: 'Báo cáo kiểm duyệt'
      }
    ]
  },
  {
    section: "Nội dung",
    items: [
      {
        id: 'places',
        title: 'Địa điểm',
        href: '/admin/places',
        icon: MapPin,
        description: 'Quản lý địa điểm',
        roles: ['moderator', 'admin']
      },
      {
        id: 'announcements',
        title: 'Thông báo',
        href: '/admin/announcements',
        icon: Megaphone,
        description: 'Quản lý thông báo cộng đồng',
        roles: ['moderator', 'admin']
      },
      {
        id: 'users',
        title: 'Người dùng',
        href: '/admin/users',
        icon: Users,
        description: 'Quản lý người dùng',
        roles: ['admin']
      }
    ]
  },
  {
    section: "Phân tích",
    items: [
      {
        id: 'analytics',
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        description: 'Phân tích tổng quan'
      },
      {
        id: 'analytics-places',
        title: 'Places Analytics',
        href: '/admin/analytics/places',
        icon: TrendingUp,
        description: 'Phân tích địa điểm'
      },
      {
        id: 'audit',
        title: 'Audit',
        href: '/admin/audit',
        icon: Activity,
        description: 'Nhật ký hệ thống',
        roles: ['admin']
      }
    ]
  },
  {
    section: "Cấu hình",
    items: [
      {
        id: 'settings',
        title: 'Cài đặt',
        href: '/admin/settings',
        icon: Settings,
        description: 'Cài đặt hệ thống',
        roles: ['admin']
      },
      {
        id: 'system-config',
        title: 'System Config',
        href: '/admin/system/config',
        icon: Wrench,
        description: 'Cấu hình nâng cao',
        roles: ['admin']
      },
      {
        id: 'auto-sync-demo',
        title: 'Auto Sync Demo',
        href: '/admin/auto-sync-demo',
        icon: Activity,
        description: 'Demo đồng bộ tự động'
      }
    ]
  }
]

export function VietnamTravelSidebar({
  collapsed = false,
  onToggleCollapsed,
  className
}: VietnamTravelSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { stats, loading: statsLoading } = useAdminStats()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Check if user has permission for navigation item
  const hasPermission = (item: NavItem) => {
    if (!item.roles || !user) return true
    return item.roles.includes(user.role || 'guest')
  }

  // Get badge count for nav items
  const getBadgeCount = (itemId: string) => {
    if ((itemId === 'moderation-queue' || itemId === 'moderation') && stats) {
      return stats.pendingModeration > 0 ? stats.pendingModeration : undefined
    }
    return undefined
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-gray-200 flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Header với branding du lịch Việt Nam */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-500 to-yellow-500 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Image
                src="/logo-icon.svg"
                alt="Du Lịch Việt"
                width={24}
                height={24}
                className="scale-75"
              />
            </div>
            <div className="text-white">
              <div className="font-bold text-lg">VietExplore</div>
              <div className="text-xs text-white/80">Admin Portal</div>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            className="lg:hidden p-1 text-white hover:text-white/80"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info với thiết kế Việt Nam */}
        <div className="p-4 border-b border-gray-200 bg-green-50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user?.fullName || user?.email || 'Admin'}
              </div>
              <div className="text-xs text-green-600 capitalize font-medium">
                {user?.role || 'admin'} • 🇻🇳
              </div>
            </div>
          </div>

          {/* Quick stats */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="bg-white/50 rounded p-2 text-center">
                <div className="font-semibold text-blue-600">{stats.totalUsers || 0}</div>
                <div className="text-gray-600">Users</div>
              </div>
              <div className="bg-white/50 rounded p-2 text-center">
                <div className="font-semibold text-green-600">{stats.totalPlaces || 0}</div>
                <div className="text-gray-600">Places</div>
              </div>
              <div className="bg-white/50 rounded p-2 text-center">
                <div className="font-semibold text-yellow-600">{stats.pendingModeration || 0}</div>
                <div className="text-gray-600">Pending</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation - scrollable with custom scrollbar */}
        <nav className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
          {navigationSections.map((section) => (
            <div key={section.section} className="mb-6">
              <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {section.section}
                </h3>
              </div>
              <div className="space-y-1">
                {section.items
                  .filter(hasPermission)
                  .map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    const badgeCount = getBadgeCount(item.id)

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group flex items-center px-4 py-2.5 mx-2 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02]",
                          isActive
                            ? "bg-gradient-to-r from-green-100 to-yellow-50 text-green-800 shadow-md border border-green-200"
                            : "text-gray-700 hover:bg-gray-100 hover:text-green-700"
                        )}
                      >
                        <Icon
                          className={cn(
                            "mr-3 h-4 w-4 flex-shrink-0 transition-colors",
                            isActive ? "text-green-600" : "text-gray-400 group-hover:text-green-500"
                          )}
                        />
                        <span className="flex-1 truncate">{item.title}</span>
                        {badgeCount && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full min-w-[20px] h-5">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer với logout */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 bg-white shadow-md"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}
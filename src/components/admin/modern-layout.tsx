/**
 * Modern Admin Layout - Clean & Professional
 * Responsive layout with modern sidebar and header
 */

'use client'

import * as React from 'react'
import { ModernSidebar } from './modern-sidebar'
import { useAuth } from '@/components/auth/auth-provider'
import { BrandedLoading } from '@/components/ui/branded-loading'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/providers/theme-provider'
import { Bell } from 'lucide-react'

interface ModernAdminLayoutProps {
  children: React.ReactNode
}

export function ModernAdminLayout({ children }: ModernAdminLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  // Redirect if not authorized
  React.useEffect(() => {
    if (!isLoading && (!user || !['admin', 'moderator'].includes(user.role))) {
      router.push('/')
    }
  }, [user, isLoading, router])

  // Show loading while authenticating
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <BrandedLoading 
          variant="logo" 
          size="lg"
          text="Đang xác thực quyền truy cập..."
        />
      </div>
    )
  }

  // Show nothing if not authorized (will redirect)
  if (!user || !['admin', 'moderator'].includes(user.role)) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <ModernSidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Left side - could add breadcrumbs here */}
            <div className="flex-1">
              <div className="text-sm text-neutral-600">
                Chào mừng trở lại, <span className="font-medium text-neutral-900">{user.fullName || user.email}</span>
              </div>
            </div>

            {/* Right side - actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle variant="icon" />
              
              {/* Notifications */}
              <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Home Link */}
              <a 
                href="/"
                className="text-sm text-neutral-600 hover:text-neutral-900 font-medium px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                ← Về trang chủ
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Backward compatibility
export default ModernAdminLayout
"use client"

import * as React from "react"
import { AdminSidebar } from "./admin-sidebar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { adminIcons } from "@/lib/admin/icon-system"
import { adminLayout } from "@/lib/admin/theme-utils"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title,
  description,
  actions 
}) => {
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isMobile, setIsMobile] = React.useState(false)

  // Handle mobile detection and responsive behavior
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-admin-neutral-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      <div className="flex h-screen bg-admin-neutral-50">
        {/* Professional Sidebar */}
        <div className={cn(
          "relative z-50 transition-all duration-300",
          isMobile && sidebarCollapsed && "-translate-x-full"
        )}>
          <AdminSidebar 
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="admin-layout-main w-full">{/* Ensure full width on mobile */}
        {/* Professional Admin Header */}
        <header className="admin-layout-header">
          <div className="flex items-center justify-between w-full">
            {/* Left Section - Mobile Menu + Search */}
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="admin-btn-ghost admin-btn-sm lg:hidden"
              >
                <adminIcons.system.menu className="h-4 w-4" />
              </Button>
              
              {/* Global Search - Responsive */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <adminIcons.utility.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-admin-neutral-400" />
                  <Input
                    placeholder={isMobile ? "Tìm kiếm..." : "Tìm kiếm người dùng, địa điểm..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-input pl-10 bg-admin-neutral-50 border-0 focus:bg-white focus:ring-2 focus:ring-admin-primary-500 transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right Section - Actions + Profile */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="admin-btn-ghost relative">
                <adminIcons.feedback.notification className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-admin-error-500 hover:bg-admin-error-500 text-white border-2 border-white rounded-full flex items-center justify-center">
                  3
                </Badge>
              </Button>
              
              {/* Help */}
              <Button variant="ghost" size="sm" className="admin-btn-ghost">
                <adminIcons.feedback.info className="h-4 w-4" />
              </Button>
              
              {/* Separator */}
              <div className="h-6 w-px bg-admin-neutral-200 mx-2" />
              
              {/* User Profile - Responsive */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-admin-primary-600 to-admin-primary-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-semibold text-white">
                    {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="admin-body-text font-semibold text-admin-neutral-900 text-sm">
                    {user?.fullName}
                  </p>
                  <p className="admin-caption-text capitalize font-medium text-admin-primary-600">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Header - Clean & Professional */}
        {(title || actions) && (
          <div className="bg-white border-b border-admin-neutral-200 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {title && (
                  <h1 className="admin-page-title">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="admin-body-text max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Area - Professional Spacing & Mobile Optimized */}
        <main className="admin-layout-content">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
            {children}
          </div>
        </main>
        </div>
      </div>
    </>
  )
}
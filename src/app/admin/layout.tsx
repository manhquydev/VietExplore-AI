"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { RealtimeNotifications } from "@/components/admin/realtime-notifications"
import { useAuth } from "@/components/auth/auth-provider"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !['admin', 'moderator'].includes(user.role))) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <BrandedLoading 
          variant="logo" 
          size="lg"
          text="Đang xác thực quyền truy cập quản trị..."
        />
      </div>
    )
  }

  if (!user || !['admin', 'moderator'].includes(user.role)) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top Navigation Bar with Notifications */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-pink-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Chào mừng, <span className="font-semibold text-pink-600">{user.fullName || user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <RealtimeNotifications />
            </div>
          </div>
        </div>
        
        <div className="h-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
          {children}
        </div>
      </main>
    </div>
  )
}
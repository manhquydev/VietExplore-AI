"use client"

import { usePermissions } from "@/lib/auth-guards"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { loading, canAccessAdmin, isAuthenticated } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('🔒 Admin access denied: Not authenticated')
        router.push('/auth/login?redirectTo=/admin/dashboard')
        return
      }

      if (!canAccessAdmin) {
        console.log('🔒 Admin access denied: Insufficient permissions')
        router.push('/unauthorized')
        return
      }
      
      console.log('✅ Admin access granted')
    }
  }, [loading, isAuthenticated, canAccessAdmin, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </main>
    )
  }

  // Don't render anything if not authorized (while redirecting)
  if (!isAuthenticated || !canAccessAdmin) {
    return null
  }

  // Render admin content if authorized
  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Bảng Điều Khiển Quản Trị
          </h1>
          <p className="text-muted-foreground">
            Quản lý hệ thống VietExplore-AI
          </p>
        </div>
        {children}
      </div>
    </main>
  )
}

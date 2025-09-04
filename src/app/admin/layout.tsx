"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/components/auth/auth-provider"
import { BrandedLoading } from "@/components/ui/branded-loading"
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
        <div className="h-full bg-gradient-to-br from-pink-50 via-white to-purple-50">
          {children}
        </div>
      </main>
    </div>
  )
}
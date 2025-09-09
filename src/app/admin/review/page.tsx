"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminReviewRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to moderation dashboard
    router.replace('/admin/moderation')
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Đang chuyển hướng...</h1>
        <p className="text-muted-foreground">
          Chuyển hướng đến trang kiểm duyệt chính...
        </p>
      </div>
    </div>
  )
}
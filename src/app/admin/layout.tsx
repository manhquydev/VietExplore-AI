"use client"

import { ModernAdminLayout } from "@/components/admin/modern-layout"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ModernAdminLayout>
      {children}
    </ModernAdminLayout>
  )
}
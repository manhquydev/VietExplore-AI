"use client"

import { ModernAdminLayout } from "@/components/admin/modern-layout"
import { AdminThemeProvider } from "@/providers/admin-theme-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminThemeProvider>
      <ModernAdminLayout>
        {children}
      </ModernAdminLayout>
    </AdminThemeProvider>
  )
}
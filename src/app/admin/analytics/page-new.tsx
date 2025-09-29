"use client"

import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminAnalyticsPage() {
  const { user, profile, loading } = useFirebaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (!profile || profile.role !== 'admin') {
      router.push('/')
      return
    }
  }, [user, profile, loading, router])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user || !profile || profile.role !== 'admin') {
    return <div className="p-8">Access denied</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded">
          <p><strong>Admin:</strong> {user.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Analytics Features</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Platform metrics overview</li>
            <li>User growth analytics</li>
            <li>Moderation performance tracking</li>
            <li>SLA compliance monitoring</li>
            <li>Export functionality</li>
          </ul>
        </div>
        
        <p className="text-gray-600">
          Analytics dashboard will be implemented here.<br/>
          Currently showing placeholder for admin access verification.
        </p>
      </div>
    </div>
  )
}

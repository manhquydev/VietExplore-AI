"use client"

import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminTestPage() {
  const { user, profile, loading } = useFirebaseAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Auth State:', { user: user?.email, profile: profile?.role, loading })
    
    if (loading) return
    
    if (!user) {
      console.log('No user, redirecting to login')
      router.push('/auth/login')
      return
    }
    
    if (!profile) {
      console.log('No profile loaded yet')
      return
    }
    
    if (profile.role !== 'admin') {
      console.log('User is not admin:', profile.role)
      router.push('/')
      return
    }
    
    console.log('Admin access granted!')
  }, [user, profile, loading, router])

  if (loading) {
    return <div className="p-8">Loading auth state...</div>
  }

  if (!user) {
    return <div className="p-8">Redirecting to login...</div>
  }

  if (!profile) {
    return <div className="p-8">Loading profile...</div>
  }

  if (profile.role !== 'admin') {
    return <div className="p-8">Access denied. Role: {profile.role}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {user.uid}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Profile Role:</strong> {profile.role}</p>
        <p><strong>Profile Status:</strong> {profile.status}</p>
        <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}

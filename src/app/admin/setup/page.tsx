// src/app/admin/setup/page.tsx
"use client"

import { useFirebaseAuth } from "@/components/auth/FirebaseAuthProvider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AdminSetupPage() {
  const { user, profile, loading } = useFirebaseAuth()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    console.log('Current auth state:', { 
      user: user?.email, 
      profile: profile?.role, 
      loading,
      uid: user?.uid 
    })
  }, [user, profile, loading])

  const createAdminProfile = async () => {
    if (!user) {
      setMessage("No user logged in")
      return
    }

    setIsCreating(true)
    setMessage("Creating admin profile...")

    try {
      // Check if profile already exists
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        setMessage(`Profile already exists with role: ${userDoc.data().role}`)
        
        // Update role to admin if needed
        if (userDoc.data().role !== 'admin') {
          await setDoc(userDocRef, {
            ...userDoc.data(),
            role: 'admin',
            updatedAt: new Date()
          }, { merge: true })
          setMessage("Updated role to admin")
        }
      } else {
        // Create new admin profile
        const adminProfile = {
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'admin',
          status: 'active',
          verifiedContributor: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await setDoc(userDocRef, adminProfile)
        setMessage("Admin profile created successfully!")
      }

      // Reload the page to refresh auth state
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('Error creating admin profile:', error)
      setMessage(`Error: ${error}`)
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading auth state...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
        <p>Please login first</p>
        <button 
          onClick={() => router.push('/auth/login')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Current User Info:</h2>
          <p><strong>User ID:</strong> {user.uid}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
          <p><strong>Profile Role:</strong> {profile?.role || 'No profile found'}</p>
          <p><strong>Profile Status:</strong> {profile?.status || 'N/A'}</p>
        </div>

        {message && (
          <div className="bg-blue-100 p-4 rounded">
            {message}
          </div>
        )}

        <button 
          onClick={createAdminProfile}
          disabled={isCreating}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Create/Update Admin Profile'}
        </button>

        <div className="mt-4">
          <button 
            onClick={() => router.push('/admin/test')}
            className="px-4 py-2 bg-green-500 text-white rounded mr-2"
          >
            Test Admin Access
          </button>
          
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

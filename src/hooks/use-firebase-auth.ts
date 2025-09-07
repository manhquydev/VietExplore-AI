"use client"

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'

/**
 * Hook to get Firebase user object directly with getIdToken method
 * Use this when you need Firebase-specific methods like getIdToken()
 */
export const useFirebaseAuth = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const getIdToken = async (): Promise<string | null> => {
    if (!firebaseUser) return null
    try {
      return await firebaseUser.getIdToken()
    } catch (error) {
      console.error('Error getting ID token:', error)
      return null
    }
  }

  return {
    firebaseUser,
    loading,
    getIdToken
  }
}
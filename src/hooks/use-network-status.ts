"use client"

import * as React from "react"

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(true)
  const [isChecking, setIsChecking] = React.useState(false)

  React.useEffect(() => {
    // Initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const checkConnectivity = React.useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false)
      return false
    }

    setIsChecking(true)
    try {
      // Try to fetch a small resource to check real connectivity
      const response = await fetch('/favicon.svg', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      const connected = response.ok
      setIsOnline(connected)
      return connected
    } catch (error) {
      setIsOnline(false)
      return false
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    isOnline,
    isChecking,
    checkConnectivity
  }
}
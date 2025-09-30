"use client"

/**
 * Toast Provider Bridge
 * Connects ToastService (non-React) with React's useToast hook
 *
 * This component:
 * 1. Subscribes to toastService events
 * 2. Triggers React toast renders via useToast hook
 * 3. Manages cleanup on unmount
 */

import { useEffect } from 'react'
import { toastService } from './toast-service'
import { toast } from '@/hooks/use-toast'
import type { ToastMessage } from './toast-types'

export function ToastProviderBridge() {
  useEffect(() => {
    // Subscribe to toast service events
    const unsubscribe = toastService.subscribe((toastMessage: ToastMessage) => {
      // Trigger React toast via useToast
      toast({
        variant: toastMessage.variant,
        title: toastMessage.title,
        description: toastMessage.description,
        duration: toastMessage.duration,
        action: toastMessage.action,
      })
    })

    // Debug log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[ToastProviderBridge] Subscribed to toast service')
    }

    // Cleanup on unmount
    return () => {
      unsubscribe()
      if (process.env.NODE_ENV === 'development') {
        console.log('[ToastProviderBridge] Unsubscribed from toast service')
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}
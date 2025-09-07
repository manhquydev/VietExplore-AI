"use client"

import * as React from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
  persistent?: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined)

// Notification item component
function NotificationItem({ notification, onRemove }: { 
  notification: Notification
  onRemove: (id: string) => void 
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (!notification.persistent && notification.duration) {
      const timer = setTimeout(() => {
        handleRemove()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.persistent])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300) // Match animation duration
  }

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const styles = {
    success: {
      bg: "bg-green-50 border-green-200",
      icon: "text-green-600",
      text: "text-green-800",
      button: "text-green-600 hover:bg-green-100"
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: "text-red-600",
      text: "text-red-800",
      button: "text-red-600 hover:bg-red-100"
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-600",
      text: "text-yellow-800",
      button: "text-yellow-600 hover:bg-yellow-100"
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-800",
      button: "text-blue-600 hover:bg-blue-100"
    }
  }

  const Icon = icons[notification.type]
  const style = styles[notification.type]

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-4 border rounded-lg shadow-lg backdrop-blur-sm",
        "transition-all duration-300 ease-out transform",
        style.bg,
        isVisible && !isLeaving 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95",
        isLeaving && "translate-x-full opacity-0 scale-95"
      )}
    >
      <div className={cn("flex-shrink-0", style.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className={cn("text-sm font-semibold mb-1", style.text)}>
            {notification.title}
          </h4>
        )}
        <p className={cn("text-sm", style.text)}>
          {notification.message}
        </p>
      </div>

      <button
        onClick={handleRemove}
        className={cn(
          "flex-shrink-0 p-1 rounded-md transition-colors duration-200",
          style.button
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Notification container
function NotificationContainer({ notifications, removeNotification }: {
  notifications: Notification[]
  removeNotification: (id: string) => void
}) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
}

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])

  const addNotification = React.useCallback((notification: Omit<Notification, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    }

    setNotifications(prev => [...prev, newNotification])

    // Try to show browser notification as well
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(
          notification.title || `${notification.type.toUpperCase()}`, 
          {
            body: notification.message,
            icon: '/favicon.svg',
            tag: notification.type // Prevents duplicate notifications
          }
        )
        
        // Auto close browser notification
        setTimeout(() => {
          browserNotification.close()
        }, notification.duration || 5000)
      } catch (error) {
        console.warn('Failed to show browser notification:', error)
      }
    }
  }, [])

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearNotifications = React.useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification, 
      clearNotifications 
    }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </NotificationContext.Provider>
  )
}

// Hook for using notifications
export function useNotifications() {
  const context = React.useContext(NotificationContext)
  
  if (!context) {
    console.warn("useNotifications: No NotificationProvider found! Using fallback notifications")
    
    // Fallback functions
    const fallbackNotification = (type: NotificationType, message: string, title?: string) => {
      // Try browser notification first
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title || type.toUpperCase(), {
            body: message,
            icon: '/favicon.svg'
          })
          return
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(title || type.toUpperCase(), {
                body: message,
                icon: '/favicon.svg'
              })
            } else {
              // Fallback to alert
              alert(`${type.toUpperCase()}: ${message}`)
            }
          })
          return
        }
      }
      
      // Final fallback to alert
      alert(`${type.toUpperCase()}: ${message}`)
    }
    
    return {
      notifications: [],
      addNotification: () => console.warn("NotificationProvider not available"),
      removeNotification: () => console.warn("NotificationProvider not available"),
      clearNotifications: () => console.warn("NotificationProvider not available"),
      success: (message: string, title?: string) => fallbackNotification("success", message, title),
      error: (message: string, title?: string) => fallbackNotification("error", message, title),
      warning: (message: string, title?: string) => fallbackNotification("warning", message, title),
      info: (message: string, title?: string) => fallbackNotification("info", message, title),
    }
  }

  const { addNotification } = context

  // Helper functions for different notification types
  const success = React.useCallback(
    (message: string, title?: string, options?: Partial<Notification>) =>
      addNotification({ type: "success", message, title, ...options }),
    [addNotification]
  )

  const error = React.useCallback(
    (message: string, title?: string, options?: Partial<Notification>) =>
      addNotification({ type: "error", message, title, ...options }),
    [addNotification]
  )

  const warning = React.useCallback(
    (message: string, title?: string, options?: Partial<Notification>) =>
      addNotification({ type: "warning", message, title, ...options }),
    [addNotification]
  )

  const info = React.useCallback(
    (message: string, title?: string, options?: Partial<Notification>) =>
      addNotification({ type: "info", message, title, ...options }),
    [addNotification]
  )

  return {
    ...context,
    success,
    error,
    warning,
    info,
  }
}

// Hook to request notification permission
export function useNotificationPermission() {
  const [permission, setPermission] = React.useState<NotificationPermission | null>(
    typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : null
  )

  const requestPermission = React.useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return null
  }, [])

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  return { permission, requestPermission }
}
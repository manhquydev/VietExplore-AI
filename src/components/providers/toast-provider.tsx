"use client"

import * as React from "react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  persistent?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after duration (unless persistent)
    if (!newToast.persistent) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  const { addToast } = context

  // Helper functions for different toast types
  const success = React.useCallback(
    (message: string, options?: Partial<Toast>) =>
      addToast({ type: "success", message, ...options }),
    [addToast]
  )

  const error = React.useCallback(
    (message: string, options?: Partial<Toast>) =>
      addToast({ type: "error", message, ...options }),
    [addToast]
  )

  const warning = React.useCallback(
    (message: string, options?: Partial<Toast>) =>
      addToast({ type: "warning", message, ...options }),
    [addToast]
  )

  const info = React.useCallback(
    (message: string, options?: Partial<Toast>) =>
      addToast({ type: "info", message, ...options }),
    [addToast]
  )

  return {
    ...context,
    success,
    error,
    warning,
    info,
  }
}
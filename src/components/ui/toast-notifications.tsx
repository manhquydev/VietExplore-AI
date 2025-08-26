"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast, type Toast, type ToastType } from "@/components/providers/toast-provider"

const toastConfig: Record<ToastType, {
  icon: React.ComponentType<any>
  className: string
}> = {
  success: {
    icon: CheckCircle,
    className: "border-success bg-success/10 text-success"
  },
  error: {
    icon: AlertCircle,
    className: "border-danger bg-danger/10 text-danger"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warn bg-warn/10 text-warn"
  },
  info: {
    icon: Info,
    className: "border-primary bg-primary/10 text-primary"
  }
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const config = toastConfig[toast.type]
  const Icon = config.icon

  React.useEffect(() => {
    if (!toast.persistent && toast.duration) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, toast.persistent, onRemove])

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm",
        "animate-in slide-in-from-right-full duration-300",
        "max-w-md w-full",
        config.className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-semibold text-sm mb-1">{toast.title}</div>
        )}
        <div className="text-sm leading-relaxed">{toast.message}</div>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastNotifications() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-label="Thông báo"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}
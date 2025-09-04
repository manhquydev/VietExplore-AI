"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Bell 
} from "lucide-react"

const getToastIcon = (variant: string) => {
  switch (variant) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
    case "destructive":
      return <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
    case "info":
      return <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
    default:
      return <Bell className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start space-x-3 flex-1">
              {getToastIcon(variant as string)}
              <div className="flex-1 grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

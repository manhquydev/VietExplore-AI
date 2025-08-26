"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "primary" | "secondary"
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
}

const variantClasses = {
  default: "text-muted",
  primary: "text-primary",
  secondary: "text-secondary"
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "default",
  className,
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
      aria-label="Loading..."
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  loadingText?: string
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  className,
  loadingText = "Đang tải..."
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" variant="primary" />
            <p className="text-sm text-muted font-medium">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface LoadingCardProps {
  lines?: number
  showAvatar?: boolean
  showImage?: boolean
  className?: string
}

export function LoadingCard({ 
  lines = 3, 
  showAvatar = false,
  showImage = false,
  className 
}: LoadingCardProps) {
  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      {showImage && (
        <div className="bg-muted rounded-lg aspect-[3/2]" />
      )}
      
      <div className="space-y-3">
        {showAvatar && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="h-4 bg-muted rounded w-24" />
          </div>
        )}
        
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 bg-muted rounded",
                i === 0 && "w-3/4",
                i === 1 && "w-full", 
                i === 2 && "w-2/3",
                i > 2 && "w-1/2"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
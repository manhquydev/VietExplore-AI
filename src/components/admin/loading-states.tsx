/**
 * Du Lịch Việt AI - Professional Admin Loading States
 * Elegant loading components to replace spinners and improve UX
 */

import * as React from "react"
import { cn } from "@/lib/utils"

// === SKELETON LOADERS ===

export interface AdminSkeletonProps {
  className?: string
  children?: React.ReactNode
}

export const AdminSkeleton = ({ className, children, ...props }: AdminSkeletonProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse bg-admin-neutral-200 rounded", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// === METRIC CARD SKELETON ===
export const AdminMetricSkeleton = () => {
  return (
    <div className="admin-card">
      <div className="admin-card-content space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <AdminSkeleton className="h-3 w-24" />
            <AdminSkeleton className="h-8 w-16" />
          </div>
          <AdminSkeleton className="h-12 w-12 rounded-xl" />
        </div>
        <div className="pt-3 border-t border-admin-neutral-100 flex items-center justify-between">
          <AdminSkeleton className="h-4 w-12" />
          <AdminSkeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

// === TABLE SKELETON ===
export const AdminTableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="admin-card">
      <div className="admin-card-content space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-6 w-32" />
          <AdminSkeleton className="h-5 w-16" />
        </div>
        
        {/* Table Rows */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-admin-neutral-50">
              <AdminSkeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <AdminSkeleton className="h-4 w-32" />
                <AdminSkeleton className="h-3 w-24" />
              </div>
              <div className="space-y-2">
                <AdminSkeleton className="h-4 w-16" />
                <AdminSkeleton className="h-3 w-12" />
              </div>
              <AdminSkeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// === ACTIVITY FEED SKELETON ===
export const AdminActivitySkeleton = ({ items = 3 }: { items?: number }) => {
  return (
    <div className="admin-card">
      <div className="admin-card-content space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AdminSkeleton className="h-8 w-8 rounded-lg" />
            <AdminSkeleton className="h-5 w-32" />
          </div>
          <AdminSkeleton className="h-5 w-12 rounded-full" />
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-admin-neutral-50">
              <AdminSkeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <AdminSkeleton className="h-4 w-40" />
                <AdminSkeleton className="h-3 w-32" />
              </div>
              <AdminSkeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-admin-neutral-100">
          <AdminSkeleton className="h-9 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}

// === LOADING STATES ===
export interface AdminLoadingProps {
  size?: 'sm' | 'base' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse'
  className?: string
}

export const AdminLoading = ({ 
  size = 'base', 
  variant = 'pulse',
  className,
  inline = false
}: AdminLoadingProps & { inline?: boolean }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    base: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  // For inline usage (inside p tags), use span instead of div
  const Element = inline ? 'span' : 'div'

  if (variant === 'spinner') {
    return (
      <Element className={cn("animate-spin rounded-full border-2 border-admin-neutral-300 border-t-admin-primary-600", sizeClasses[size], inline ? 'inline-block' : '', className)} />
    )
  }

  if (variant === 'dots') {
    return (
      <Element className={cn("flex items-center gap-1", inline ? 'inline-flex' : '', className)}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("bg-admin-primary-600 rounded-full animate-pulse", 
              size === 'sm' ? 'h-1 w-1' : size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'
            )}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </Element>
    )
  }

  // Default pulse
  return (
    <Element className={cn("bg-admin-primary-600 rounded animate-pulse", sizeClasses[size], inline ? 'inline-block' : '', className)} />
  )
}

// === PAGE LOADING STATE ===
export const AdminPageLoading = ({ title }: { title?: string }) => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <AdminSkeleton className="h-8 w-64" />
        <AdminSkeleton className="h-4 w-96" />
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <AdminMetricSkeleton key={i} />
        ))}
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminActivitySkeleton />
        <AdminTableSkeleton rows={3} />
      </div>
    </div>
  )
}

// === EMPTY STATES ===
export interface AdminEmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const AdminEmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className
}: AdminEmptyStateProps) => {
  return (
    <div className={cn("text-center py-12", className)}>
      {Icon && (
        <div className="mb-4">
          <Icon className="h-16 w-16 text-admin-neutral-400 mx-auto" />
        </div>
      )}
      <h3 className="admin-card-title text-admin-neutral-900 mb-2">{title}</h3>
      {description && (
        <p className="admin-body-text mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action}
    </div>
  )
}

// === ERROR STATES ===
export interface AdminErrorStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const AdminErrorState = ({
  title,
  description,
  action,
  className
}: AdminErrorStateProps) => {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="mb-4">
        <div className="h-16 w-16 bg-admin-error-100 rounded-full flex items-center justify-center mx-auto">
          <div className="h-8 w-8 bg-admin-error-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
        </div>
      </div>
      <h3 className="admin-card-title text-admin-error-900 mb-2">{title}</h3>
      {description && (
        <p className="admin-body-text text-admin-error-700 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action}
    </div>
  )
}
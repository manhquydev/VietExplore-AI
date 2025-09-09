/**
 * Enhanced Modern Card Component 2025 - VietExplore AI Admin
 * Professional card design with advanced states and interactions
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useAdminTheme } from '@/providers/admin-theme-provider'

interface EnhancedCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  loading?: boolean
  onClick?: () => void
  footer?: React.ReactNode
  header?: React.ReactNode
}

export function EnhancedCard({
  children,
  className,
  variant = 'default',
  size = 'md',
  interactive = false,
  loading = false,
  onClick,
  footer,
  header,
}: EnhancedCardProps) {
  const { spacing } = useAdminTheme()

  const baseStyles = [
    'rounded-lg transition-all duration-normal ease-easeOut',
    'border border-neutral-200',
    'bg-white',
  ]

  const variantStyles = {
    default: 'shadow-sm',
    elevated: 'shadow-card hover:shadow-float',
    outlined: 'border-2 shadow-none',
    ghost: 'border-transparent shadow-none bg-transparent',
  }

  const sizeStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }

  const interactiveStyles = interactive ? [
    'cursor-pointer',
    'hover:shadow-card hover:border-primary-300 hover:bg-neutral-50',
    'active:scale-[0.99] active:shadow-sm',
  ] : []

  const loadingOverlay = loading && (
    <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center z-10">
      <div className="animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div
      className={cn(
        ...baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        ...interactiveStyles,
        'relative',
        className
      )}
      onClick={interactive ? onClick : undefined}
    >
      {loadingOverlay}
      
      {header && (
        <div className="mb-4 pb-4 border-b border-neutral-200">
          {header}
        </div>
      )}

      <div className={cn(loading && 'opacity-50 pointer-events-none')}>
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          {footer}
        </div>
      )}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('text-neutral-700', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
  justify?: 'start' | 'end' | 'between' | 'center'
}

export function CardFooter({ children, className, justify = 'end' }: CardFooterProps) {
  const justifyStyles = {
    start: 'justify-start',
    end: 'justify-end', 
    between: 'justify-between',
    center: 'justify-center',
  }

  return (
    <div className={cn('flex items-center gap-2', justifyStyles[justify], className)}>
      {children}
    </div>
  )
}
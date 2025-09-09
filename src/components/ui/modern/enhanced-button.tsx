/**
 * Enhanced Modern Button Component 2025 - VietExplore AI Admin
 * Professional button design with consistent interactions
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useAdminTheme } from '@/providers/admin-theme-provider'

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export function EnhancedButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...props
}: EnhancedButtonProps) {
  const { animations, prefersReducedMotion } = useAdminTheme()

  const baseStyles = [
    'inline-flex items-center justify-center gap-2 font-medium',
    'rounded-lg transition-all duration-fast ease-easeOut',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    !prefersReducedMotion && 'hover:scale-[1.02] active:scale-[0.98]',
  ]

  const variantStyles = {
    primary: [
      'bg-primary-600 text-white border border-primary-600',
      'hover:bg-primary-700 hover:border-primary-700',
      'focus:ring-primary-500',
      'disabled:bg-primary-300 disabled:border-primary-300',
    ],
    secondary: [
      'bg-white text-neutral-700 border border-neutral-200',
      'hover:bg-neutral-50 hover:border-neutral-300',
      'focus:ring-neutral-500',
    ],
    outline: [
      'bg-transparent text-primary-600 border border-primary-600',
      'hover:bg-primary-50 hover:text-primary-700',
      'focus:ring-primary-500',
    ],
    ghost: [
      'bg-transparent text-neutral-600 border border-transparent',
      'hover:bg-neutral-100 hover:text-neutral-900',
      'focus:ring-neutral-500',
    ],
    danger: [
      'bg-danger-600 text-white border border-danger-600',
      'hover:bg-danger-700 hover:border-danger-700',
      'focus:ring-danger-500',
      'disabled:bg-danger-300 disabled:border-danger-300',
    ],
  }

  const sizeStyles = {
    xs: 'px-2.5 py-1.5 text-xs h-7',
    sm: 'px-3 py-2 text-sm h-8',
    md: 'px-4 py-2.5 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14',
  }

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
  }

  const LoadingSpinner = () => (
    <div className={cn('animate-spin border-2 border-current border-t-transparent rounded-full', iconSizes[size])} />
  )

  return (
    <button
      className={cn(
        ...baseStyles,
        ...variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner />
      ) : leftIcon ? (
        <span className={cn('flex-shrink-0', iconSizes[size])}>
          {leftIcon}
        </span>
      ) : null}
      
      {children && <span>{children}</span>}
      
      {!loading && rightIcon && (
        <span className={cn('flex-shrink-0', iconSizes[size])}>
          {rightIcon}
        </span>
      )}
    </button>
  )
}

interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function ButtonGroup({ children, className, orientation = 'horizontal' }: ButtonGroupProps) {
  const orientationStyles = {
    horizontal: 'flex-row [&>button:not(:first-child)]:rounded-l-none [&>button:not(:last-child)]:rounded-r-none [&>button:not(:first-child)]:border-l-0',
    vertical: 'flex-col [&>button:not(:first-child)]:rounded-t-none [&>button:not(:last-child)]:rounded-b-none [&>button:not(:first-child)]:border-t-0',
  }

  return (
    <div className={cn('inline-flex', orientationStyles[orientation], className)}>
      {children}
    </div>
  )
}
/**
 * Modern Metric Card - Clean & Professional
 * Minimal design following 2025 trends
 */

'use client'

import * as React from 'react'
import { ModernCard } from '@/components/ui/modern/card'
import { cn } from '@/lib/utils'
import { designSystem } from '@/lib/design-system'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface ModernMetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
  }
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  loading?: boolean
  className?: string
}

const variantStyles = {
  default: {
    iconBg: 'bg-neutral-100',
    iconColor: 'text-neutral-600',
    trendPositive: 'text-success-600',
    trendNegative: 'text-danger-600',
    trendNeutral: 'text-neutral-500'
  },
  success: {
    iconBg: 'bg-success-50',
    iconColor: 'text-success-600',
    trendPositive: 'text-success-600',
    trendNegative: 'text-danger-600',
    trendNeutral: 'text-neutral-500'
  },
  warning: {
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-600',
    trendPositive: 'text-success-600',
    trendNegative: 'text-danger-600',
    trendNeutral: 'text-neutral-500'
  },
  danger: {
    iconBg: 'bg-danger-50',
    iconColor: 'text-danger-600',
    trendPositive: 'text-success-600',
    trendNegative: 'text-danger-600',
    trendNeutral: 'text-neutral-500'
  },
  info: {
    iconBg: 'bg-info-50',
    iconColor: 'text-info-600',
    trendPositive: 'text-success-600',
    trendNegative: 'text-danger-600',
    trendNeutral: 'text-neutral-500'
  }
}

export function ModernMetricCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  variant = 'default',
  loading = false,
  className
}: ModernMetricCardProps) {
  const styles = variantStyles[variant]
  
  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.value > 0) {
      return <TrendingUp className="h-3 w-3" />
    } else if (trend.value < 0) {
      return <TrendingDown className="h-3 w-3" />
    } else {
      return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return styles.trendNeutral
    
    if (trend.value > 0) {
      return styles.trendPositive
    } else if (trend.value < 0) {
      return styles.trendNegative
    } else {
      return styles.trendNeutral
    }
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('vi-VN').format(val)
    }
    return val
  }

  return (
    <ModernCard 
      className={cn('p-6 hover:shadow-md transition-all duration-200', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-neutral-600 truncate">
            {title}
          </h3>
        </div>
        
        {Icon && (
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            styles.iconBg
          )}>
            <Icon className={cn('h-5 w-5', styles.iconColor)} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        {loading ? (
          <div className="h-8 w-20 bg-neutral-200 rounded animate-pulse" />
        ) : (
          <p 
            className="text-3xl font-bold text-neutral-900"
            style={{ color: designSystem.semanticColors.text.primary }}
          >
            {formatValue(value)}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Description */}
        <div className="flex-1 min-w-0">
          {description && (
            <p className="text-xs text-neutral-500 truncate">
              {description}
            </p>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium ml-2',
            getTrendColor()
          )}>
            {getTrendIcon()}
            <span>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-neutral-500 ml-1">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </ModernCard>
  )
}

// Skeleton for loading state
export function ModernMetricCardSkeleton({ className }: { className?: string }) {
  return (
    <ModernCard className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
        <div className="h-10 w-10 bg-neutral-200 rounded-lg animate-pulse" />
      </div>
      <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse mb-2" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
        <div className="h-3 w-12 bg-neutral-200 rounded animate-pulse" />
      </div>
    </ModernCard>
  )
}

// Quick Actions Card variant
interface QuickActionCardProps {
  title: string
  count: number
  priority: 'low' | 'medium' | 'high'
  href?: string
  onClick?: () => void
  className?: string
}

export function QuickActionCard({
  title,
  count,
  priority,
  href,
  onClick,
  className
}: QuickActionCardProps) {
  const priorityStyles = {
    low: 'border-l-4 border-l-neutral-400 bg-neutral-50',
    medium: 'border-l-4 border-l-warning-400 bg-warning-50',
    high: 'border-l-4 border-l-danger-400 bg-danger-50'
  }

  const priorityTextStyles = {
    low: 'text-neutral-700',
    medium: 'text-warning-700',
    high: 'text-danger-700'
  }

  const Component = href ? 'a' : 'button'
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'block w-full text-left p-4 rounded-lg transition-all duration-200 hover:shadow-sm',
        priorityStyles[priority],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-900">{title}</p>
          <p className="text-xs text-neutral-600 mt-1">
            {count > 0 ? `${count} mục cần xử lý` : 'Không có mục nào'}
          </p>
        </div>
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
          priorityTextStyles[priority],
          count > 0 ? 'bg-white shadow-sm' : 'opacity-50'
        )}>
          {count > 99 ? '99+' : count}
        </div>
      </div>
    </Component>
  )
}
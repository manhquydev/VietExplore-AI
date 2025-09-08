/**
 * Modern Admin Card Component
 * Clean, minimal card design based on 2025 trends
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { designSystem } from '@/lib/design-system'

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  size?: 'sm' | 'base' | 'lg'
}

interface ModernCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean
}

interface ModernCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

interface ModernCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

interface ModernCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean
}

interface ModernCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = 'default', size = 'base', ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-neutral-200 shadow-sm',
      elevated: 'bg-white border border-neutral-100 shadow-md',
      outlined: 'bg-transparent border border-neutral-300',
      ghost: 'bg-transparent border-none'
    }

    const sizes = {
      sm: 'rounded-lg',
      base: 'rounded-xl', 
      lg: 'rounded-2xl'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-200',
          variants[variant],
          sizes[size],
          className
        )}
        style={{
          borderColor: designSystem.semanticColors.border.default
        }}
        {...props}
      />
    )
  }
)
ModernCard.displayName = 'ModernCard'

const ModernCardHeader = React.forwardRef<HTMLDivElement, ModernCardHeaderProps>(
  ({ className, withBorder = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 p-6',
        withBorder && 'border-b border-neutral-200',
        className
      )}
      style={withBorder ? {
        borderBottomColor: designSystem.semanticColors.border.default
      } : undefined}
      {...props}
    />
  )
)
ModernCardHeader.displayName = 'ModernCardHeader'

const ModernCardTitle = React.forwardRef<HTMLHeadingElement, ModernCardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        'text-neutral-900',
        className
      )}
      style={{
        color: designSystem.semanticColors.text.primary,
        ...designSystem.adminTypography.heading.h3
      }}
      {...props}
    />
  )
)
ModernCardTitle.displayName = 'ModernCardTitle'

const ModernCardDescription = React.forwardRef<HTMLParagraphElement, ModernCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-neutral-600 leading-relaxed',
        className
      )}
      style={{
        color: designSystem.semanticColors.text.secondary,
        ...designSystem.adminTypography.body.small
      }}
      {...props}
    />
  )
)
ModernCardDescription.displayName = 'ModernCardDescription'

const ModernCardContent = React.forwardRef<HTMLDivElement, ModernCardContentProps>(
  ({ className, noPadding = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        !noPadding && 'p-6 pt-0',
        className
      )}
      {...props}
    />
  )
)
ModernCardContent.displayName = 'ModernCardContent'

const ModernCardFooter = React.forwardRef<HTMLDivElement, ModernCardFooterProps>(
  ({ className, withBorder = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center p-6 pt-0',
        withBorder && 'border-t border-neutral-200 pt-6',
        className
      )}
      style={withBorder ? {
        borderTopColor: designSystem.semanticColors.border.default
      } : undefined}
      {...props}
    />
  )
)
ModernCardFooter.displayName = 'ModernCardFooter'

export {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent,
  ModernCardFooter
}

// Backward compatibility - create legacy aliases
export const Card = ModernCard
export const CardHeader = ModernCardHeader  
export const CardTitle = ModernCardTitle
export const CardDescription = ModernCardDescription
export const CardContent = ModernCardContent
export const CardFooter = ModernCardFooter
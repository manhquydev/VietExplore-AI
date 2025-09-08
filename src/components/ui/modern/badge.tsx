/**
 * Modern Admin Badge Component
 * Clean status indicators and labels
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { designSystem } from '@/lib/design-system'

const modernBadgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-neutral-900 text-white shadow hover:bg-neutral-800',
        secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        success: 'border-transparent bg-success-100 text-success-800 hover:bg-success-200',
        warning: 'border-transparent bg-warning-100 text-warning-800 hover:bg-warning-200',
        danger: 'border-transparent bg-danger-100 text-danger-800 hover:bg-danger-200',
        info: 'border-transparent bg-info-100 text-info-800 hover:bg-info-200',
        outline: 'border-neutral-200 text-neutral-600 hover:bg-neutral-50',
        
        // Status-specific variants for admin
        pending: 'border-transparent bg-warning-100 text-warning-700',
        approved: 'border-transparent bg-success-100 text-success-700', 
        rejected: 'border-transparent bg-danger-100 text-danger-700',
        draft: 'border-transparent bg-neutral-100 text-neutral-600',
        published: 'border-transparent bg-success-100 text-success-700'
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

interface ModernBadgeProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernBadgeVariants> {
  icon?: React.ReactNode
  dot?: boolean
}

const ModernBadge = React.forwardRef<HTMLDivElement, ModernBadgeProps>(
  ({ className, variant, size, icon, dot, children, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(modernBadgeVariants({ variant, size }), className)}
        style={{
          // Apply design system colors
          ...(variant === 'pending' && {
            backgroundColor: designSystem.semanticColors.status.pending + '20',
            color: designSystem.semanticColors.status.pending
          }),
          ...(variant === 'approved' && {
            backgroundColor: designSystem.semanticColors.status.approved + '20', 
            color: designSystem.semanticColors.status.approved
          }),
          ...(variant === 'rejected' && {
            backgroundColor: designSystem.semanticColors.status.rejected + '20',
            color: designSystem.semanticColors.status.rejected
          })
        }}
        {...props}
      >
        {dot && (
          <span 
            className="h-1.5 w-1.5 rounded-full bg-current" 
            aria-hidden="true"
          />
        )}
        {icon && (
          <span className="h-3 w-3 [&_svg]:h-3 [&_svg]:w-3" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </div>
    )
  }
)
ModernBadge.displayName = 'ModernBadge'

// Status-specific badge components for admin use
const StatusBadge: React.FC<{
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'published'
  children?: React.ReactNode
  className?: string
}> = ({ status, children, className }) => {
  const statusConfig = {
    pending: { variant: 'pending' as const, dot: true, label: 'Chờ duyệt' },
    approved: { variant: 'approved' as const, dot: true, label: 'Đã duyệt' },
    rejected: { variant: 'rejected' as const, dot: true, label: 'Từ chối' },
    draft: { variant: 'draft' as const, dot: true, label: 'Nháp' },
    published: { variant: 'published' as const, dot: true, label: 'Đã xuất bản' }
  }

  const config = statusConfig[status]
  
  return (
    <ModernBadge 
      variant={config.variant}
      dot={config.dot}
      className={className}
    >
      {children || config.label}
    </ModernBadge>
  )
}

export { ModernBadge, modernBadgeVariants, StatusBadge }

// Backward compatibility
export const Badge = ModernBadge
export type BadgeProps = ModernBadgeProps
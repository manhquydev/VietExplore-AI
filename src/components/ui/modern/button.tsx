/**
 * Modern Admin Button Component  
 * Clean, professional button with modern interactions
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { designSystem } from '@/lib/design-system'

const modernButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 text-white shadow hover:bg-neutral-800 focus-visible:ring-neutral-950',
        primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus-visible:ring-primary-500',
        destructive: 'bg-danger-600 text-white shadow-sm hover:bg-danger-700 focus-visible:ring-danger-500',
        success: 'bg-success-600 text-white shadow-sm hover:bg-success-700 focus-visible:ring-success-500',
        outline: 'border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 hover:text-neutral-900 focus-visible:ring-neutral-950',
        secondary: 'bg-neutral-100 text-neutral-900 shadow-sm hover:bg-neutral-200 focus-visible:ring-neutral-500',
        ghost: 'hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-500',
        link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-4 py-2',
        lg: 'h-10 px-6',
        xl: 'h-12 px-8 text-base',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(modernButtonVariants({ variant, size, className }))}
        style={{
          // Apply design system colors
          ...(variant === 'primary' && {
            backgroundColor: designSystem.colors.primary[600],
            '--hover-bg': designSystem.colors.primary[700]
          }),
          ...(variant === 'outline' && {
            borderColor: designSystem.semanticColors.border.default
          })
        }}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-1">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-1">{rightIcon}</span>}
      </Comp>
    )
  }
)
ModernButton.displayName = 'ModernButton'

export { ModernButton, modernButtonVariants }

// Backward compatibility
export const Button = ModernButton
export type ButtonProps = ModernButtonProps
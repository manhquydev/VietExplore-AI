import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 h-7 text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-50 text-primary",
        secondary: "bg-surface text-muted border border-border",
        success: "bg-success/10 text-success",
        warning: "bg-warn/10 text-warn",
        danger: "bg-danger/10 text-danger",
        outline: "border border-primary text-primary bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

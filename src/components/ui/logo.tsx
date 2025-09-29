import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export type LogoVariant = "horizontal" | "icon"
export type LogoSize = "sm" | "md" | "lg" | "xl"

interface LogoProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
  priority?: boolean
}

const sizeConfig = {
  sm: { width: 140, height: 48 },
  md: { width: 200, height: 68 },
  lg: { width: 280, height: 92 },
  xl: { width: 360, height: 120 }
}

const iconSizeConfig = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 80, height: 80 }
}

export const Logo: React.FC<LogoProps> = ({
  variant = "horizontal", // DEFAULT TO HORIZONTAL LOGO
  size = "md",
  className,
  priority = false
}) => {
  const isIcon = variant === "icon"
  const dimensions = isIcon ? iconSizeConfig[size] : sizeConfig[size]

  // Current logo icon
  if (variant === "icon") {
    return (
      <div className={cn("inline-block", className)} style={dimensions}>
        <Image
          src="/logo-icon.svg"
          alt="Du Lịch Việt Icon"
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
          priority={priority}
        />
      </div>
    )
  }

  // Default to horizontal logo
  return (
    <div className={cn("inline-block", className)} style={dimensions}>
      <Image
        src="/logo-horizontal.svg"
        alt="Du Lịch Việt - Khám phá Việt Nam với trí tuệ nhân tạo"
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        priority={priority}
      />
    </div>
  )
}

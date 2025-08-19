import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export type LogoVariant = "horizontal" | "stacked" | "icon" | "mono"
export type LogoSize = "sm" | "md" | "lg" | "xl"

interface LogoProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
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
  variant = "horizontal", 
  size = "md", 
  className 
}) => {
  const isIcon = variant === "icon"
  const dimensions = isIcon ? iconSizeConfig[size] : sizeConfig[size]

  if (variant === "icon") {
    return (
      <div className={cn("inline-block", className)} style={dimensions}>
        <Image
          src="/logo-icon.svg"
          alt="VietExplore"
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
      </div>
    )
  }

  if (variant === "stacked") {
    return (
      <div className={cn("inline-block", className)} style={dimensions}>
        <Image
          src="/logo-stacked.svg"
          alt="VietExplore"
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
      </div>
    )
  }

  if (variant === "mono") {
    return (
      <div className={cn("inline-block", className)} style={dimensions}>
        <Image
          src="/logo-mono.svg"
          alt="VietExplore"
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
      </div>
    )
  }

  // Default to horizontal
  return (
    <div className={cn("inline-block", className)} style={dimensions}>
      <Image
        src="/logo-horizontal.svg"
        alt="VietExplore"
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
    </div>
  )
}

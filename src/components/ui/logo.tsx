import * as React from "react"
import { cn } from "@/lib/utils"

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
        <svg
          viewBox="0 0 256 256"
          className="w-full h-full"
          role="img"
          aria-label="Du Lịch Việt"
        >
          <title>Du Lịch Việt - Icon</title>
          <defs>
            <radialGradient id="bg" cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#FFE3EC"/>
              <stop offset="100%" stopColor="#F8BBD0"/>
            </radialGradient>
            <linearGradient id="lotusGrad3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E91E63"/>
              <stop offset="100%" stopColor="#F48FB1"/>
            </linearGradient>
          </defs>
          <circle cx="128" cy="128" r="120" fill="url(#bg)"/>
          <g transform="translate(128,128) scale(1.1)">
            <path d="M0 -40 C10 -10, 10 10, 0 40 C-10 10, -10 -10, 0 -40Z" fill="url(#lotusGrad3)"/>
            <path d="M-25 -10 C-40 0, -32 20, -10 35 C-15 15, -18 5, -25 -10Z" fill="url(#lotusGrad3)"/>
            <path d="M25 -10 C40 0, 32 20, 10 35 C15 15, 18 5, 25 -10Z" fill="url(#lotusGrad3)"/>
            <circle cx="0" cy="6" r="4" fill="#ffffff" opacity="0.9"/>
          </g>
        </svg>
      </div>
    )
  }

  if (variant === "horizontal") {
    return (
      <div className={cn("inline-block", className)} style={dimensions}>
        <svg
          viewBox="0 0 680 200"
          className="w-full h-full"
          role="img"
          aria-label="Du Lịch Việt"
        >
          <title>Du Lịch Việt</title>
          <defs>
            <linearGradient id="lotusGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E91E63"/>
              <stop offset="100%" stopColor="#F48FB1"/>
            </linearGradient>
          </defs>

          {/* Biểu tượng hoa sen */}
          <g transform="translate(90,100) scale(1.25)">
            <path d="M0 -40 C10 -10, 10 10, 0 40 C-10 10, -10 -10, 0 -40Z" fill="url(#lotusGrad)"/>
            <path d="M-25 -10 C-40 0, -32 20, -10 35 C-15 15, -18 5, -25 -10Z" fill="url(#lotusGrad)"/>
            <path d="M25 -10 C40 0, 32 20, 10 35 C15 15, 18 5, 25 -10Z" fill="url(#lotusGrad)"/>
            <circle cx="0" cy="6" r="4" fill="#ffffff" opacity="0.9"/>
          </g>

          {/* Wordmark */}
          <g transform="translate(210,116)">
            <text x="0" y="0"
              fontFamily="DM Sans, Inter, ui-sans-serif, system-ui"
              fontSize="72" fontWeight="800" fontStyle="italic" letterSpacing="0.2" fill="#D81B60">
              Du Lịch Việt
            </text>
            {/* Nét lướt trang trí */}
            <path d="M2 14 C80 32, 180 18, 280 26 S480 38, 540 18"
              fill="none" stroke="#F48FB1" strokeWidth="7" strokeLinecap="round" opacity="0.8"/>
          </g>
        </svg>
      </div>
    )
  }

  if (variant === "stacked") {
    return (
      <div className={cn("inline-block", className)} style={dimensions}>
        <svg
          viewBox="0 0 420 420"
          className="w-full h-full"
          role="img"
          aria-label="Du Lịch Việt"
        >
          <title>Du Lịch Việt</title>
          <defs>
            <linearGradient id="lotusGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E91E63"/>
              <stop offset="100%" stopColor="#F48FB1"/>
            </linearGradient>
          </defs>

          {/* Hoa sen trung tâm */}
          <g transform="translate(210,150) scale(1.4)">
            <path d="M0 -40 C10 -10, 10 10, 0 40 C-10 10, -10 -10, 0 -40Z" fill="url(#lotusGrad2)"/>
            <path d="M-25 -10 C-40 0, -32 20, -10 35 C-15 15, -18 5, -25 -10Z" fill="url(#lotusGrad2)"/>
            <path d="M25 -10 C40 0, 32 20, 10 35 C15 15, 18 5, 25 -10Z" fill="url(#lotusGrad2)"/>
            <circle cx="0" cy="6" r="4" fill="#ffffff" opacity="0.9"/>
          </g>

          {/* Chữ bên dưới */}
          <g transform="translate(40,0)">
            <text x="170" y="320" textAnchor="middle"
              fontFamily="DM Sans, Inter, ui-sans-serif, system-ui"
              fontSize="64" fontWeight="800" fontStyle="italic" fill="#D81B60">
              Du Lịch Việt
            </text>
            <path d="M65 330 C120 346, 220 340, 275 350" fill="none" stroke="#F48FB1" strokeWidth="7" strokeLinecap="round" opacity="0.8"/>
          </g>
        </svg>
      </div>
    )
  }

  if (variant === "mono") {
    return (
      <div className={cn("inline-block", className)} style={dimensions}>
        <svg
          viewBox="0 0 680 200"
          className="w-full h-full"
          role="img"
          aria-label="Du Lịch Việt"
        >
          <title>Du Lịch Việt - Mono</title>
          <g fill="currentColor">
            {/* Hoa sen */}
            <g transform="translate(90,100) scale(1.25)">
              <path d="M0 -40 C10 -10, 10 10, 0 40 C-10 10, -10 -10, 0 -40Z"/>
              <path d="M-25 -10 C-40 0, -32 20, -10 35 C-15 15, -18 5, -25 -10Z"/>
              <path d="M25 -10 C40 0, 32 20, 10 35 C15 15, 18 5, 25 -10Z"/>
            </g>
            {/* Chữ */}
            <text x="210" y="116"
              fontFamily="DM Sans, Inter, ui-sans-serif, system-ui"
              fontSize="68" fontWeight="800" fontStyle="italic">Du Lịch Việt</text>
          </g>
        </svg>
      </div>
    )
  }

  return null
}


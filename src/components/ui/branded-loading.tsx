"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Extracted lotus logo paths from the original SVG for animation
const LotusLogo = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & { 
    animate?: boolean
    size?: "sm" | "md" | "lg" | "xl"
  }
>(({ className, animate = true, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  }

  return (
    <svg 
      ref={ref}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={cn(sizeClasses[size], className)}
      role="img" 
      aria-label="Du Lịch Việt Logo"
      {...props}
    >
      <defs>
        <linearGradient id="lotusGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E91E63"/>
          <stop offset="100%" stopColor="#F48FB1"/>
        </linearGradient>
        {animate && (
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </defs>

      <g transform="translate(50,35) scale(0.8)">
        {/* Main lotus petal with pulse animation */}
        <path 
          d="M0 -20 C5 -5, 5 5, 0 20 C-5 5, -5 -5, 0 -20Z" 
          fill="url(#lotusGrad)"
        >
          {animate && (
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="scale"
              values="1;1.1;1"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </path>
        
        {/* Left petal */}
        <path 
          d="M-12.5 -5 C-20 0, -16 10, -5 17.5 C-7.5 7.5, -9 2.5, -12.5 -5Z" 
          fill="url(#lotusGrad)"
          opacity={animate ? "0.8" : "1"}
        >
          {animate && (
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="scale"
              values="1;1.05;1"
              dur="2.2s"
              repeatCount="indefinite"
            />
          )}
        </path>
        
        {/* Right petal */}
        <path 
          d="M12.5 -5 C20 0, 16 10, 5 17.5 C7.5 7.5, 9 2.5, 12.5 -5Z" 
          fill="url(#lotusGrad)"
          opacity={animate ? "0.8" : "1"}
        >
          {animate && (
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="scale"
              values="1;1.05;1"
              dur="2.4s"
              repeatCount="indefinite"
            />
          )}
        </path>
        
        {/* Center circle with glow effect */}
        <circle cx="0" cy="3" r="3" fill="#ffffff" opacity="0.9">
          {animate && (
            <>
              <animate
                attributeName="opacity"
                values="0.9;0.6;0.9"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="3;3.5;3"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </>
          )}
        </circle>
      </g>
    </svg>
  )
})
LotusLogo.displayName = "LotusLogo"

// Branded Loading Spinner Component
interface BrandedLoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "logo" | "spinner" | "pulse" | "dots"
  text?: string
  className?: string
  showText?: boolean
}

export function BrandedLoading({ 
  size = "md", 
  variant = "logo",
  text = "Đang tải...",
  className,
  showText = true
}: BrandedLoadingProps) {
  const containerSizeClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4", 
    xl: "gap-6"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  }

  if (variant === "logo") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        containerSizeClasses[size],
        className
      )}>
        <div className="relative">
          <LotusLogo size={size} animate={true} />
          {/* Subtle rotating ring around logo */}
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent border-t-pink-200 animate-spin",
            size === "sm" && "border-[1px]",
            size === "xl" && "border-4"
          )} style={{ animationDuration: "2s" }} />
        </div>
        {showText && (
          <div className="text-center space-y-1">
            <p className={cn("font-medium text-gray-700", textSizeClasses[size])}>
              {text}
            </p>
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-pink-400 rounded-full animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: "1.2s"
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === "spinner") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        containerSizeClasses[size],
        className
      )}>
        <div className="relative">
          <LotusLogo size={size} animate={false} className="opacity-20" />
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent border-t-pink-500 border-r-pink-300 animate-spin",
            size === "sm" && "border-[1px]",
            size === "xl" && "border-4"
          )} />
        </div>
        {showText && (
          <p className={cn("font-medium text-gray-600", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        containerSizeClasses[size],
        className
      )}>
        <div className="relative">
          <LotusLogo size={size} animate={false} />
          <div className={cn(
            "absolute inset-0 rounded-full bg-pink-200 opacity-75 animate-ping"
          )} />
        </div>
        {showText && (
          <p className={cn("font-medium text-gray-600", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        containerSizeClasses[size],
        className
      )}>
        <LotusLogo size={size} animate={false} />
        {showText && (
          <div className="text-center space-y-2">
            <p className={cn("font-medium text-gray-600", textSizeClasses[size])}>
              {text}
            </p>
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "bg-pink-400 rounded-full animate-bounce",
                    size === "sm" && "w-1 h-1",
                    size === "md" && "w-1.5 h-1.5",
                    size === "lg" && "w-2 h-2",
                    size === "xl" && "w-3 h-3"
                  )}
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "1s"
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

// Page Loading Overlay
interface PageLoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  variant?: "logo" | "spinner" | "pulse"
  loadingText?: string
  className?: string
}

export function PageLoadingOverlay({ 
  isLoading, 
  children, 
  variant = "logo",
  loadingText = "Đang tải nội dung...",
  className
}: PageLoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4">
            <BrandedLoading 
              variant={variant} 
              text={loadingText}
              size="lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Full Screen Loading
interface FullScreenLoadingProps {
  variant?: "logo" | "spinner" | "pulse"
  title?: string
  description?: string
  showProgress?: boolean
  progress?: number
}

export function FullScreenLoading({ 
  variant = "logo",
  title = "Du Lịch Việt",
  description = "Đang chuẩn bị trải nghiệm tuyệt vời cho bạn...",
  showProgress = false,
  progress = 0
}: FullScreenLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-4">
        <div className="space-y-4">
          <BrandedLoading 
            variant={variant} 
            size="xl" 
            showText={false}
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-gray-600">
              {description}
            </p>
          </div>
        </div>
        
        {showProgress && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{Math.round(progress)}% hoàn thành</p>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-pink-300 rounded-full animate-pulse"
              style={{ 
                animationDelay: `${i * 0.4}s`,
                animationDuration: "1.5s"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Button Loading State
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary"
}

export function LoadingButton({ 
  isLoading = false, 
  loadingText,
  children, 
  variant = "default",
  className,
  disabled,
  ...props 
}: LoadingButtonProps) {
  const variantClasses = {
    default: "bg-gray-100 hover:bg-gray-200 text-gray-900",
    primary: "bg-pink-600 hover:bg-pink-700 text-white",
    secondary: "bg-purple-600 hover:bg-purple-700 text-white"
  }

  return (
    <button
      className={cn(
        "relative px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        variantClasses[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LotusLogo size="sm" animate={true} />
          <span>{loadingText || "Đang xử lý..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Card Loading Skeleton with branding
export function BrandedCardSkeleton({ 
  showImage = true, 
  lines = 3,
  className 
}: {
  showImage?: boolean
  lines?: number  
  className?: string
}) {
  return (
    <div className={cn("animate-pulse space-y-4 p-6 bg-white rounded-xl shadow-sm border", className)}>
      {showImage && (
        <div className="aspect-[3/2] bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
          <LotusLogo size="md" animate={false} className="opacity-30" />
        </div>
      )}
      
      <div className="space-y-3">
        <div className="h-5 bg-gradient-to-r from-pink-200 to-purple-200 rounded w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 bg-gray-200 rounded",
              i === 0 && "w-full",
              i === 1 && "w-5/6", 
              i === 2 && "w-2/3",
              i > 2 && "w-1/2"
            )}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-pink-200 rounded w-20" />
      </div>
    </div>
  )
}

export { LotusLogo }
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Bánh Chưng Logo Component for Loading (extracted from our new logo design)
const BanhChungLogo = React.forwardRef<
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
      viewBox="0 0 80 80"
      className={cn(sizeClasses[size], className)}
      role="img"
      aria-label="Du Lịch Việt Logo"
      {...props}
    >
      <defs>
        <linearGradient id="banhchungGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16A34A"/>
          <stop offset="100%" stopColor="#22C55E"/>
        </linearGradient>
        <linearGradient id="dauXanhGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#FBBF24"/>
        </linearGradient>
      </defs>

      <g transform="translate(40,40)">
        {/* Main Bánh Chưng Square */}
        <rect
          x="-20" y="-20"
          width="40" height="40"
          rx="6"
          fill="url(#banhchungGrad)"
          stroke="none"
        >
          {animate && (
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </rect>

        {/* Lá Dong Cultural Pattern */}
        <g opacity="0.2">
          <rect x="-12" y="-12" width="24" height="24" rx="2" stroke="#FFFFFF" strokeWidth="1.5" fill="none">
            {animate && (
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="scale"
                values="1;1.05;1"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </rect>
          {/* Path removed to prevent visual artifacts during rotation */}
        </g>

        {/* Center Đậu Xanh */}
        <circle cx="0" cy="0" r="5" fill="url(#dauXanhGrad)">
          {animate && (
            <>
              <animate
                attributeName="opacity"
                values="1;0.7;1"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="5;6;5"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </>
          )}
        </circle>
        <circle cx="0" cy="0" r="2" fill="#FFFFFF" opacity="0.6"/>
      </g>
    </svg>
  )
})
BanhChungLogo.displayName = "BanhChungLogo"

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
          <BanhChungLogo size={size} animate={true} />
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
                  className="w-1 h-1 bg-green-500 rounded-full animate-pulse"
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
          <BanhChungLogo size={size} animate={true} />
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
          <BanhChungLogo size={size} animate={false} />
          <div className={cn(
            "absolute inset-0 rounded-lg bg-green-200 opacity-75 animate-ping"
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
        <BanhChungLogo size={size} animate={false} />
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
                    "bg-green-500 rounded-full animate-bounce",
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
  context?: "page" | "search" | "ai" | "upload" | "processing"
}

// Contextual messages theo ngữ cảnh Du Lịch Việt
const contextualMessages = {
  page: [
    "Đang tìm những địa điểm tuyệt vời nhất...",
    "Chuẩn bị hành trình khám phá Việt Nam...",
    "Đang load văn hóa và truyền thống...",
    "Sắp xếp những trải nghiệm đáng nhớ..."
  ],
  search: [
    "Đang tìm kiếm địa điểm phù hợp...",
    "Khám phá các điểm đến mới...",
    "Phân tích hàng nghìn địa điểm...",
    "Tìm kiếm trải nghiệm tốt nhất cho bạn..."
  ],
  ai: [
    "AI đang suy nghĩ...",
    "Phân tích sở thích của bạn...",
    "Tạo lịch trình thông minh...",
    "Đang tối ưu hóa hành trình..."
  ],
  upload: [
    "Đang tải lên hình ảnh...",
    "Xử lý ảnh đẹp nhất...",
    "Tối ưu hóa chất lượng...",
    "Sắp hoàn tất..."
  ],
  processing: [
    "Đang xử lý dữ liệu...",
    "Kiểm tra thông tin...",
    "Chuẩn bị nội dung...",
    "Chỉ còn vài giây nữa..."
  ]
}

export function FullScreenLoading({
  variant = "logo",
  title = "Du Lịch Việt",
  description,
  showProgress = false,
  progress = 0,
  context = "page"
}: FullScreenLoadingProps) {
  const [messageIndex, setMessageIndex] = React.useState(0)
  const messages = contextualMessages[context]

  // Rotate contextual messages
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [messages.length])

  const currentMessage = description || messages[messageIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-4">
        <div className="space-y-4">
          <BrandedLoading
            variant={variant}
            size="xl"
            showText={false}
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-gray-600 min-h-[24px] transition-opacity duration-300">
              {currentMessage}
            </p>
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 via-yellow-400 to-green-500 h-2 rounded-full transition-all duration-300 ease-out"
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
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
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
    primary: "bg-green-600 hover:bg-green-700 text-white",
    secondary: "bg-yellow-500 hover:bg-yellow-600 text-white"
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
          <BanhChungLogo size="sm" animate={true} />
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
        <div className="aspect-[3/2] bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg flex items-center justify-center">
          <BanhChungLogo size="md" animate={false} className="opacity-30" />
        </div>
      )}

      <div className="space-y-3">
        <div className="h-5 bg-gradient-to-r from-green-200 to-yellow-200 rounded w-3/4" />
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
        <div className="h-8 bg-green-200 rounded w-20" />
      </div>
    </div>
  )
}

// Legacy export for backward compatibility
export { BanhChungLogo as LotusLogo }

// === PLACE CARD SKELETON - Optimized for Du Lịch Việt ===
export function PlaceCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-white shadow-sm", className)}>
      {/* Image Skeleton với Bánh Chưng Watermark */}
      <div className="relative aspect-[3/2] bg-gradient-to-br from-green-50 via-white to-yellow-50 skeleton flex items-center justify-center">
        <BanhChungLogo size="lg" animate={false} className="opacity-[0.08]" />

        {/* Trust Badge Skeleton */}
        <div className="absolute top-3 right-3">
          <div className="w-12 h-12 skeleton rounded-lg" />
        </div>

        {/* Bottom Stats Skeleton */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2">
          <div className="h-6 w-16 skeleton rounded-full" />
          <div className="h-6 w-16 skeleton rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title & Location */}
        <div className="space-y-2">
          <div className="h-5 skeleton rounded w-3/4" />
          <div className="h-4 skeleton rounded w-1/2" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 skeleton rounded w-full" />
          <div className="h-3 skeleton rounded w-5/6" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-20 skeleton rounded-full" />
          <div className="h-6 w-24 skeleton rounded-full" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="border-t border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 skeleton rounded-full" />
          <div className="h-4 w-24 skeleton rounded" />
        </div>
        <div className="h-9 w-28 skeleton rounded-full" />
      </div>
    </div>
  )
}

// === PLACE GRID SKELETON - Multiple Cards ===
export function PlaceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PlaceCardSkeleton key={i} />
      ))}
    </div>
  )
}

// === COMMUNITY STAT CARD SKELETON ===
export function CommunityStatSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 skeleton rounded" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-12 w-12 skeleton rounded-full mx-auto" />
              <div className="h-8 w-16 skeleton rounded mx-auto" />
              <div className="h-4 w-24 skeleton rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// === TOP CONTRIBUTOR SKELETON ===
export function TopContributorSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 skeleton rounded" />
        <div className="h-5 w-40 skeleton rounded" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-yellow-50">
            <div className="h-12 w-12 skeleton rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 skeleton rounded" />
              <div className="h-3 w-24 skeleton rounded" />
            </div>
            <div className="text-center space-y-1">
              <div className="h-6 w-12 skeleton rounded mx-auto" />
              <div className="h-3 w-16 skeleton rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// === ANNOUNCEMENT SKELETON ===
export function AnnouncementSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-48 skeleton rounded" />
        <div className="h-8 w-24 skeleton rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-6 rounded-xl border border-border bg-white space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 skeleton rounded" />
                <div className="h-4 w-full skeleton rounded" />
                <div className="h-4 w-5/6 skeleton rounded" />
              </div>
              {i === 0 && (
                <div className="h-6 w-20 skeleton rounded-full" />
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="h-4 w-32 skeleton rounded" />
              <div className="h-4 w-24 skeleton rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// === SEARCH LOADING STATE ===
export function SearchLoadingSkeleton({ query }: { query?: string }) {
  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 skeleton rounded" />
          {query && (
            <p className="text-sm text-gray-600">
              Đang tìm kiếm cho: <span className="font-medium text-green-600">"{query}"</span>
            </p>
          )}
        </div>
        <div className="h-10 w-32 skeleton rounded-lg" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 skeleton rounded-full" />
        ))}
      </div>

      {/* Loading Animation with Logo */}
      <div className="flex flex-col items-center justify-center py-12">
        <BrandedLoading
          size="lg"
          variant="logo"
          text={query ? `Đang tìm kiếm "${query}"...` : "Đang tìm kiếm..."}
        />
      </div>

      {/* Results Skeleton */}
      <PlaceGridSkeleton count={6} />
    </div>
  )
}

// === INLINE LOADING - For buttons and small areas ===
export function InlineLoading({
  text = "Đang tải...",
  size = "sm"
}: {
  text?: string
  size?: "sm" | "md"
}) {
  return (
    <div className="flex items-center gap-2">
      <BrandedLoading size={size} variant="spinner" showText={false} />
      <span className={size === "sm" ? "text-sm" : "text-base"}>{text}</span>
    </div>
  )
}
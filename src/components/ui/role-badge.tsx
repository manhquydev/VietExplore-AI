import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RoleBadgeProps {
  role: "guest" | "traveler" | "contributor" | "partner" | "moderator" | "admin"
  variant?: "default" | "compact" | "detailed"
  className?: string
}

// SVG Components for role badges
const ContributorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 96 96" 
    className={cn("inline-block", className)}
    role="img" 
    aria-label="Contributor badge"
  >
    <defs>
      <linearGradient id="grad-contributor" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#21C1C5"/>
        <stop offset="100%" stopColor="#2178F5"/>
      </linearGradient>
    </defs>
    {/* Ribbons */}
    <path d="M38 62 L32 88 L48 78 L64 88 L58 62 Z" fill="#1F6DE8" opacity="0.85"/>
    <path d="M38 62 L48 72 L58 62 Z" fill="#FFFFFF" opacity="0.15"/>
    
    {/* Medal circle */}
    <circle cx="48" cy="40" r="28" fill="url(#grad-contributor)"/>
    <circle cx="48" cy="40" r="28" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2"/>
    
    {/* Check */}
    <path d="M36 41 L45 50 L63 32" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Sparkle */}
    <g transform="translate(68,22)" fill="#FFFFFF">
      <circle cx="4" cy="4" r="2" opacity="0.95"/>
      <path d="M4 0 L4 8 M0 4 L8 4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
    </g>
  </svg>
)

const PartnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 108 108" 
    className={cn("inline-block", className)}
    role="img" 
    aria-label="Community Partner badge"
  >
    <defs>
      <linearGradient id="grad-partner" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#DC2626"/>
        <stop offset="100%" stopColor="#991B1B"/>
      </linearGradient>
    </defs>
    {/* Ribbon */}
    <path d="M42 70 L36 96 L54 84 L72 96 L66 70 Z" fill="#FFD700" opacity="0.9"/>
    {/* Medal */}
    <circle cx="54" cy="44" r="28" fill="url(#grad-partner)" stroke="#FFD700" strokeWidth="3"/>
    {/* Star (main symbol) */}
    <polygon points="54,28 58,40 70,40 60,48 64,60 54,52 44,60 48,48 38,40 50,40" fill="#FFD700"/>
    {/* Small check on top-right */}
    <circle cx="72" cy="28" r="10" fill="white" stroke="#FFD700" strokeWidth="2"/>
    <path d="M68 28 L71 31 L76 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, variant = "default", className }) => {
  const roleConfig = {
  guest: { 
    label: "Khách vãng lai", 
    variant: "secondary" as const, 
    icon: null,
    description: "Xem nội dung công khai"
  },
  traveler: { 
    label: "Du khách", 
    variant: "default" as const, 
    icon: null,
    description: "Tạo lịch trình, lưu địa điểm"
  },
  contributor: { 
    label: "Cộng tác viên", 
    variant: "secondary" as const, 
    icon: ContributorIcon,
    description: "Đã được xác minh uy tín - Đóng góp địa điểm chất lượng"
  },
  partner: { 
    label: "Đối tác cộng đồng", 
    variant: "danger" as const, 
    icon: PartnerIcon,
    description: "Tổ chức chính thức đã được ủy quyền"
  },
  moderator: { 
    label: "Kiểm duyệt viên", 
    variant: "warning" as const, 
    icon: null,
    description: "Duyệt nội dung, xử lý báo cáo"
  },
  admin: { 
    label: "Quản trị viên", 
    variant: "danger" as const, 
    icon: null,
    description: "Quản lý hệ thống"
  }
}

  const config = roleConfig[role]
  const IconComponent = config.icon

  if (variant === "compact") {
    return (
      <Badge variant={config.variant} className={cn("gap-1", className)}>
        {IconComponent && <IconComponent className="w-4 h-4" />}
        {config.label}
      </Badge>
    )
  }

  if (variant === "detailed") {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-surface border border-border", className)}>
        {IconComponent && <IconComponent className="w-6 h-6 flex-shrink-0" />}
        <div>
          <Badge variant={config.variant} className="mb-1">
            {config.label}
          </Badge>
          <p className="text-xs text-muted">{config.description}</p>
        </div>
      </div>
    )
  }

  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      {IconComponent && <IconComponent className="w-4 h-4" />}
      {config.label}
    </Badge>
  )
}

// Helper component for displaying role in different contexts
interface UserRoleDisplayProps {
  role: string
  verified?: boolean
  variant?: "default" | "compact" | "detailed"
  className?: string
}

export const UserRoleDisplay: React.FC<UserRoleDisplayProps> = ({ 
  role, 
  variant = "default", 
  className 
}) => {
  // Contributor và Partner roles đã implied verification
  // Không cần hiển thị "Đã xác minh" riêng
  return (
    <div className={className}>
      <RoleBadge 
        role={role as any} 
        variant={variant}
      />
    </div>
  )
}

// Trust Badge for content (separate from user roles)
export type TrustLevel = "community" | "contributor" | "partner" | "verified"

interface TrustBadgeProps {
  level: TrustLevel
  variant?: "default" | "icon-only"
  className?: string
}

const trustConfig = {
  community: {
    label: "Cộng đồng",
    color: "bg-gray-50 text-gray-600 border-gray-200",
    icon: () => (
      <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>
    ),
    description: "Nội dung từ cộng đồng, cần xem xét"
  },
  contributor: {
    label: "Cộng tác viên", 
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: () => (
      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    ),
    description: "Nội dung từ cộng tác viên đã xác minh"
  },
  partner: {
    label: "Đối tác",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: () => (
      <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
        <svg className="w-2.5 h-2.5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
    ),
    description: "Nội dung từ đối tác chính thức"
  },
  verified: {
    label: "Đã xác minh",
    color: "bg-green-50 text-green-600 border-green-200",
    icon: () => (
      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    ),
    description: "Nội dung đã được kiểm duyệt thêm"
  }
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  level,
  variant = "default", 
  className
}) => {
  const config = trustConfig[level]
  const IconComponent = config.icon
  
  if (variant === "icon-only") {
    return (
      <div 
        className={cn("inline-flex", className)}
        title={config.description}
      >
        <IconComponent />
      </div>
    )
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(config.color, "text-xs gap-1", className)}
      title={config.description}
    >
      <IconComponent />
      {config.label}
    </Badge>
  )
}

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { RoleBadge } from "@/components/ui/role-badge"
import { cn } from "@/lib/utils"

interface TrustIndicatorProps {
  trustLevel: "community" | "contributor" | "partner" | "verified"
  variant?: "badge" | "detailed" | "compact"
  className?: string
}

const trustConfig = {
  community: {
    label: "Cộng đồng",
    description: "Nội dung từ cộng đồng, cần xem xét thêm",
    variant: "secondary" as const,
    priority: 1
  },
  contributor: {
    label: "Cộng tác viên",
    description: "Nội dung từ cộng tác viên đã được xác minh uy tín",
    variant: "success" as const,
    priority: 3
  },
  partner: {
    label: "Đối tác cộng đồng",
    description: "Nội dung từ đối tác chính thức đã được ủy quyền (Sở Du lịch, tổ chức uy tín)",
    variant: "warning" as const,
    priority: 4
  },
  verified: {
    label: "Đã xác minh",
    description: "Nội dung đã được kiểm duyệt và xác thực bởi đội ngũ biên tập",
    variant: "default" as const,
    priority: 5
  }
}

export const TrustIndicator: React.FC<TrustIndicatorProps> = ({ 
  trustLevel, 
  variant = "badge", 
  className 
}) => {
  const config = trustConfig[trustLevel]

  if (variant === "detailed") {
    return (
      <div className={cn("flex items-start gap-3 p-4 rounded-lg border border-border bg-surface", className)}>
        <div className="flex-shrink-0 mt-1">
          {(trustLevel === "contributor" || trustLevel === "partner") ? (
            <RoleBadge role={trustLevel} variant="compact" />
          ) : (
            <Badge variant={config.variant}>{config.label}</Badge>
          )}
        </div>
        <div>
          <h4 className="font-medium text-text mb-1">
            Mức độ tin cậy: {config.label}
          </h4>
          <p className="text-sm text-muted">
            {config.description}
          </p>
        </div>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {(trustLevel === "contributor" || trustLevel === "partner") ? (
          <RoleBadge role={trustLevel} variant="compact" />
        ) : (
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        )}
      </div>
    )
  }

  // Default badge variant
  return (
    <div className={className}>
      {(trustLevel === "contributor" || trustLevel === "partner") ? (
        <RoleBadge role={trustLevel} variant="compact" />
      ) : (
        <Badge variant={config.variant}>
          {config.label}
        </Badge>
      )}
    </div>
  )
}

// Helper component for displaying trust level in place details
export const TrustLevelExplanation: React.FC<{ trustLevel: string }> = ({ trustLevel }) => {
  const config = trustConfig[trustLevel as keyof typeof trustConfig]
  
  if (!config) return null

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <TrustIndicator trustLevel={trustLevel as any} variant="compact" />
        <span className="text-sm font-medium">Nguồn thông tin</span>
      </div>
      <p className="text-sm text-muted">
        {config.description}
      </p>
    </div>
  )
}

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  FileText, 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle,
  Edit,
  Play,
  ArrowRight,
  Sparkles
} from "lucide-react"

interface TimelineStep {
  id: string
  label: string
  status: "completed" | "current" | "upcoming" | "skipped"
  icon: React.ComponentType<any>
  timestamp?: string
  description?: string
  canNavigate?: boolean
  action?: () => void
}

interface ModerationTimelineProps {
  currentStatus: "draft" | "submitted" | "in_review" | "published" | "rejected"
  draft: any
  onActionClick?: (action: string) => void
  className?: string
}

const getTimelineSteps = (
  currentStatus: string, 
  draft: any, 
  onActionClick?: (action: string) => void
): TimelineStep[] => {
  const steps: TimelineStep[] = [
    {
      id: "draft",
      label: "Tạo nháp",
      status: "completed",
      icon: FileText,
      timestamp: draft.createdAt,
      description: "Bản nháp được tạo",
      canNavigate: currentStatus !== "published",
      action: currentStatus !== "in_review" && currentStatus !== "published" 
        ? () => onActionClick?.("edit") 
        : undefined
    },
    {
      id: "submitted",
      label: "Gửi duyệt",
      status: currentStatus === "draft" ? "upcoming" : "completed",
      icon: Clock,
      timestamp: draft.submittedAt,
      description: currentStatus === "draft" 
        ? "Sẵn sàng gửi duyệt" 
        : "Đã gửi để kiểm duyệt",
      canNavigate: currentStatus === "draft",
      action: currentStatus === "draft" 
        ? () => onActionClick?.("submit") 
        : undefined
    },
    {
      id: "in_review",
      label: "Kiểm duyệt",
      status: currentStatus === "draft" || currentStatus === "submitted" 
        ? "upcoming" 
        : currentStatus === "in_review" 
          ? "current" 
          : "completed",
      icon: Eye,
      timestamp: draft.moderationInfo?.reviewedAt,
      description: currentStatus === "in_review" 
        ? "Đang được xem xét bởi kiểm duyệt viên"
        : currentStatus === "draft" || currentStatus === "submitted"
          ? "Chờ kiểm duyệt viên xem xét"
          : "Đã hoàn thành kiểm duyệt"
    },
    {
      id: "result",
      label: currentStatus === "published" ? "Xuất bản" : currentStatus === "rejected" ? "Từ chối" : "Kết quả",
      status: currentStatus === "published" || currentStatus === "rejected" 
        ? "completed" 
        : "upcoming",
      icon: currentStatus === "published" 
        ? CheckCircle 
        : currentStatus === "rejected" 
          ? XCircle 
          : Sparkles,
      timestamp: draft.publishedAt || draft.rejectedAt,
      description: currentStatus === "published" 
        ? "Đã được phê duyệt và xuất bản"
        : currentStatus === "rejected"
          ? "Bị từ chối, cần chỉnh sửa"
          : "Chờ quyết định cuối cùng",
      canNavigate: currentStatus === "published",
      action: currentStatus === "published" 
        ? () => onActionClick?.("view_public")
        : currentStatus === "rejected"
          ? () => onActionClick?.("edit")
          : undefined
    }
  ]

  return steps
}

const formatDate = (dateString?: string) => {
  if (!dateString) return null
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return null
  }
}

export const ModerationTimeline: React.FC<ModerationTimelineProps> = ({
  currentStatus,
  draft,
  onActionClick,
  className
}) => {
  const steps = getTimelineSteps(currentStatus, draft, onActionClick)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Tiến trình</span>
          <span className="text-sm text-gray-500">
            {steps.filter(s => s.status === "completed").length}/{steps.length}
          </span>
        </div>
        
        <div className="relative flex items-center">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${(steps.filter(s => s.status === "completed").length / steps.length) * 100}%` 
              }}
            />
          </div>
          {currentStatus === "in_review" && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-px h-8 bg-gray-200" />
              )}
              
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  {
                    "bg-green-500 border-green-500 text-white": step.status === "completed",
                    "bg-yellow-400 border-yellow-400 text-white animate-pulse": step.status === "current",
                    "bg-white border-gray-300 text-gray-400": step.status === "upcoming",
                    "bg-red-500 border-red-500 text-white": step.status === "skipped"
                  }
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className={cn(
                        "font-semibold",
                        {
                          "text-gray-900": step.status === "completed" || step.status === "current",
                          "text-gray-500": step.status === "upcoming"
                        }
                      )}>
                        {step.label}
                      </h3>
                      
                      <Badge 
                        variant={
                          step.status === "completed" ? "success" :
                          step.status === "current" ? "warning" :
                          step.status === "skipped" ? "danger" : "secondary"
                        }
                        className="text-xs"
                      >
                        {step.status === "completed" ? "Hoàn thành" :
                         step.status === "current" ? "Đang xử lý" :
                         step.status === "skipped" ? "Bỏ qua" : "Chờ xử lý"}
                      </Badge>
                    </div>
                    
                    {step.timestamp && (
                      <span className="text-xs text-gray-500 font-mono">
                        {formatDate(step.timestamp)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {step.description}
                  </p>
                  
                  {/* Action Button */}
                  {step.action && (
                    <Button
                      onClick={step.action}
                      variant={step.status === "completed" ? "outline" : "default"}
                      size="sm"
                      className="text-xs"
                    >
                      {step.id === "draft" && <Edit className="w-3 h-3 mr-1" />}
                      {step.id === "submitted" && <Play className="w-3 h-3 mr-1" />}
                      {step.id === "result" && currentStatus === "published" && <Eye className="w-3 h-3 mr-1" />}
                      {step.id === "result" && currentStatus === "rejected" && <Edit className="w-3 h-3 mr-1" />}
                      
                      {step.id === "draft" ? "Chỉnh sửa" :
                       step.id === "submitted" ? "Gửi duyệt" :
                       step.id === "result" && currentStatus === "published" ? "Xem trang công khai" :
                       step.id === "result" && currentStatus === "rejected" ? "Chỉnh sửa và gửi lại" :
                       "Thực hiện"}
                       
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Help */}
      {currentStatus === "rejected" && draft.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Lý do từ chối
          </h4>
          <p className="text-sm text-red-700 mb-3">{draft.rejectionReason}</p>
          <Button 
            onClick={() => onActionClick?.("edit")}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <Edit className="w-3 h-3 mr-1" />
            Chỉnh sửa ngay
          </Button>
        </div>
      )}

      {currentStatus === "in_review" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Đang kiểm duyệt
          </h4>
          <p className="text-sm text-yellow-700">
            Kiểm duyệt viên đang xem xét địa điểm của bạn. Bạn không thể chỉnh sửa trong thời gian này.
          </p>
        </div>
      )}
    </div>
  )
}

export default ModerationTimeline
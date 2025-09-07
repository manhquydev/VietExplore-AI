"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ShieldX, 
  Crown, 
  Edit3, 
  MoreHorizontal, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Undo2,
  Settings
} from "lucide-react"
import { Place } from "@/lib/types/places"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { TemporarySuspensionDialog } from "./temporary-suspension-dialog"
import { useToast } from "@/hooks/use-toast"

interface AdminPowerActionsProps {
  place: Place
  onPlaceUpdated?: (place: Place) => void
  compact?: boolean
}

export const AdminPowerActions: React.FC<AdminPowerActionsProps> = ({
  place,
  onPlaceUpdated,
  compact = false
}) => {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  // Permission checks
  const canSuspend = user && ['moderator', 'admin'].includes(user.role)
  const canForceEdit = user && user.role === 'admin'
  const canOverride = user && user.role === 'admin'

  if (!canSuspend && !canForceEdit && !canOverride) {
    return null
  }

  const isSuspended = place.status === 'temporarily_suspended'
  const canUnsuspend = isSuspended && canSuspend

  const handleUnsuspend = async () => {
    if (!canSuspend) return
    
    setLoading('unsuspend')
    try {
      const response = await fetch(`/api/admin/places/${place.id}/suspend`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Khôi phục thành công",
          description: "Địa điểm đã được khôi phục hiển thị"
        })
        
        onPlaceUpdated?.({
          ...place,
          status: result.data.restoredStatus,
          suspendedAt: undefined,
          suspendedBy: undefined,
          suspensionReason: undefined,
          suspensionExpiresAt: undefined,
          suspensionType: undefined
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to unsuspend')
      }
    } catch (error: any) {
      toast({
        title: "Lỗi khôi phục",
        description: error.message || "Không thể khôi phục địa điểm",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  const handleForceEdit = () => {
    // Navigate to force edit mode
    window.open(`/admin/places/${place.id}/force-edit`, '_blank')
  }

  const handleOverrideStatus = async (newStatus: string) => {
    if (!canOverride) return
    
    setLoading('override')
    try {
      const response = await fetch(`/api/admin/places/${place.id}/override`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          reason: 'Admin override - bypass normal workflow'
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Override thành công",
          description: `Địa điểm đã được chuyển sang trạng thái: ${newStatus}`
        })
        
        onPlaceUpdated?.({
          ...place,
          status: newStatus as any
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi override",
        description: "Không thể thay đổi trạng thái",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  const handleSuspended = (data: any) => {
    onPlaceUpdated?.({
      ...place,
      status: 'temporarily_suspended',
      suspendedAt: data.suspendedAt,
      suspendedBy: data.moderator.id,
      suspensionReason: data.reason,
      suspensionExpiresAt: data.expiresAt
    })
  }

  // Compact mode for table rows
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        
        {/* Suspension Toggle */}
        {canSuspend && (
          <>
            {isSuspended ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleUnsuspend}
                disabled={loading === 'unsuspend'}
                className="h-7 px-2 text-xs"
                title="Khôi phục hiển thị"
              >
                {loading === 'unsuspend' ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                ) : (
                  <Undo2 className="h-3 w-3" />
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSuspensionDialogOpen(true)}
                className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title="Đình chỉ tạm thời"
              >
                <ShieldX className="h-3 w-3" />
              </Button>
            )}
          </>
        )}

        {/* More Actions Dropdown */}
        {(canForceEdit || canOverride) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-1"
                title="Thêm hành động"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Quyền hạn đặc biệt</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {canForceEdit && (
                <DropdownMenuItem onClick={handleForceEdit}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Chỉnh sửa trực tiếp
                </DropdownMenuItem>
              )}
              
              {canOverride && (
                <>
                  <DropdownMenuItem onClick={() => handleOverrideStatus('published')}>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Override → Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOverrideStatus('hidden')}>
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                    Override → Hidden
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <TemporarySuspensionDialog
          place={place}
          open={suspensionDialogOpen}
          onOpenChange={setSuspensionDialogOpen}
          onSuspended={handleSuspended}
        />
      </div>
    )
  }

  // Full mode for detail pages
  return (
    <div className="space-y-3">
      {/* Status Badge */}
      {isSuspended && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <ShieldX className="h-4 w-4 text-orange-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900">Địa điểm đang bị đình chỉ tạm thời</p>
            <p className="text-xs text-orange-700">
              Lý do: {place.suspensionReason}
            </p>
            {place.suspensionExpiresAt && (
              <p className="text-xs text-orange-600">
                Khôi phục vào: {new Date(place.suspensionExpiresAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Power Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* Temporary Suspension */}
        {canSuspend && (
          <div className="p-4 border border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <ShieldX className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900 text-sm">Đình chỉ tạm thời</h4>
                  <p className="text-xs text-orange-700">Moderator+</p>
                </div>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                Power
              </Badge>
            </div>
            
            <p className="text-xs text-orange-800 mb-3">
              Ẩn địa điểm khỏi hiển thị công khai trong thời gian nhất định để xem xét hoặc điều tra
            </p>
            
            {isSuspended ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleUnsuspend}
                disabled={loading === 'unsuspend'}
                className="w-full text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                {loading === 'unsuspend' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Đang khôi phục...
                  </>
                ) : (
                  <>
                    <Undo2 className="h-4 w-4 mr-2" />
                    Khôi phục hiển thị
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setSuspensionDialogOpen(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              >
                <ShieldX className="h-4 w-4 mr-2" />
                Đình chỉ tạm thời
              </Button>
            )}
          </div>
        )}

        {/* Force Edit */}
        {canForceEdit && (
          <div className="p-4 border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 text-sm">Chỉnh sửa trực tiếp</h4>
                  <p className="text-xs text-purple-700">Admin only</p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                Power
              </Badge>
            </div>
            
            <p className="text-xs text-purple-800 mb-3">
              Chỉnh sửa nội dung trực tiếp mà không cần quy trình kiểm duyệt thông thường
            </p>
            
            <Button
              size="sm"
              onClick={handleForceEdit}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Chỉnh sửa ngay
            </Button>
          </div>
        )}

        {/* Override Authority */}
        {canOverride && (
          <div className="p-4 border border-yellow-200 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900 text-sm">Override Authority</h4>
                  <p className="text-xs text-yellow-700">Admin only</p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                Power
              </Badge>
            </div>
            
            <p className="text-xs text-yellow-800 mb-3">
              Thay đổi trạng thái trực tiếp, bỏ qua mọi quy trình workflow thông thường
            </p>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  disabled={loading === 'override'}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                >
                  {loading === 'override' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Override Status
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Chuyển trạng thái</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOverrideStatus('published')}>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Published
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOverrideStatus('hidden')}>
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                  Hidden
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOverrideStatus('in_review')}>
                  <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                  In Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <TemporarySuspensionDialog
        place={place}
        open={suspensionDialogOpen}
        onOpenChange={setSuspensionDialogOpen}
        onSuspended={handleSuspended}
      />
    </div>
  )
}
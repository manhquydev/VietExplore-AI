"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Clock, ShieldX, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Place, TemporarySuspensionRequest } from "@/lib/types/places"
import { apiClient } from "@/lib/client/api"
import { cn } from "@/lib/utils"

interface TemporarySuspensionDialogProps {
  place: Place
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuspended?: (data: any) => void
}

interface SuspensionType {
  id: string
  label: string
  description: string
  maxHours: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  icon: React.ElementType
}

const SUSPENSION_TYPES: SuspensionType[] = [
  {
    id: 'quality_review',
    label: 'Xem xét chất lượng',
    description: 'Tạm ngừng để kiểm tra và cải thiện chất lượng nội dung',
    maxHours: 72,
    severity: 'low',
    icon: Info
  },
  {
    id: 'investigation',
    label: 'Điều tra vi phạm',
    description: 'Tạm ngừng trong quá trình điều tra báo cáo vi phạm',
    maxHours: 168,
    severity: 'medium',
    icon: ShieldX
  },
  {
    id: 'violation',
    label: 'Vi phạm chính sách',
    description: 'Tạm ngừng do vi phạm các quy định và chính sách',
    maxHours: 168,
    severity: 'high',
    icon: AlertTriangle
  },
  {
    id: 'user_request',
    label: 'Yêu cầu từ chủ sở hữu',
    description: 'Tạm ngừng theo yêu cầu của người đăng',
    maxHours: 24,
    severity: 'low',
    icon: Clock
  }
]

const DURATION_PRESETS = [
  { label: '1 giờ', hours: 1 },
  { label: '6 giờ', hours: 6 },
  { label: '24 giờ', hours: 24 },
  { label: '3 ngày', hours: 72 },
  { label: '7 ngày', hours: 168 }
]

export const TemporarySuspensionDialog: React.FC<TemporarySuspensionDialogProps> = ({
  place,
  open,
  onOpenChange,
  onSuspended
}) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [suspensionType, setSuspensionType] = useState<string>('')
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState(24)
  const [autoExpire, setAutoExpire] = useState(true)
  const [notifyOwner, setNotifyOwner] = useState(true)
  
  const selectedType = SUSPENSION_TYPES.find(t => t.id === suspensionType)
  const maxDuration = selectedType?.maxHours || 24

  const handleSubmit = async () => {
    if (!suspensionType || !reason.trim() || !duration) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin đình chỉ",
        variant: "destructive"
      })
      return
    }

    if (reason.trim().length < 10) {
      toast({
        title: "Lý do quá ngắn",
        description: "Lý do đình chỉ phải ít nhất 10 ký tự",
        variant: "destructive"
      })
      return
    }

    if (duration > maxDuration) {
      toast({
        title: "Thời gian vượt quá giới hạn",
        description: `Loại đình chỉ này chỉ được phép tối đa ${maxDuration} giờ`,
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const suspensionRequest: TemporarySuspensionRequest = {
        placeId: place.id,
        reason: reason.trim(),
        duration,
        type: suspensionType as any,
        autoExpire,
        notifyOwner
      }

      const response = await apiClient.post(`/admin/places/${place.id}/suspend`, suspensionRequest)
      
      if (response.data.success) {
        toast({
          title: "Đình chỉ thành công",
          description: `Địa điểm đã được đình chỉ tạm thời ${duration} giờ`,
        })
        
        onSuspended?.(response.data.data)
        onOpenChange(false)
        resetForm()
      }
    } catch (error: any) {
      console.error('Error suspending place:', error)
      toast({
        title: "Lỗi đình chỉ",
        description: error.response?.data?.error || "Không thể đình chỉ địa điểm",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSuspensionType('')
    setReason('')
    setDuration(24)
    setAutoExpire(true)
    setNotifyOwner(true)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <ShieldX className="h-4 w-4 text-white" />
            </div>
            Đình chỉ tạm thời
          </DialogTitle>
          <DialogDescription>
            Đình chỉ tạm thời địa điểm "{place.name}" khỏi hiển thị công khai
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Suspension Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="suspension-type">Loại đình chỉ *</Label>
            <Select value={suspensionType} onValueChange={setSuspensionType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại đình chỉ" />
              </SelectTrigger>
              <SelectContent>
                {SUSPENSION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedType && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("text-xs", getSeverityColor(selectedType.severity))}>
                  Mức độ: {selectedType.severity === 'low' ? 'Thấp' : selectedType.severity === 'medium' ? 'Trung bình' : selectedType.severity === 'high' ? 'Cao' : 'Nghiêm trọng'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Tối đa: {selectedType.maxHours} giờ
                </Badge>
              </div>
            )}
          </div>

          {/* Duration Selection */}
          <div className="space-y-2">
            <Label htmlFor="duration">Thời gian đình chỉ (giờ) *</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {DURATION_PRESETS.map((preset) => (
                <Button
                  key={preset.hours}
                  type="button"
                  variant={duration === preset.hours ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration(preset.hours)}
                  disabled={preset.hours > maxDuration}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={maxDuration}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <span className="text-sm text-muted-foreground">giờ</span>
            </div>
            {duration > maxDuration && (
              <p className="text-xs text-red-600">
                Thời gian vượt quá giới hạn cho loại đình chỉ này ({maxDuration} giờ)
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do đình chỉ *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết cho việc đình chỉ tạm thời này..."
              className="min-h-20"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {reason.length}/500 ký tự
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Tự động khôi phục</Label>
                <p className="text-xs text-muted-foreground">
                  Tự động khôi phục hiển thị khi hết thời gian đình chỉ
                </p>
              </div>
              <Switch checked={autoExpire} onCheckedChange={setAutoExpire} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Thông báo chủ sở hữu</Label>
                <p className="text-xs text-muted-foreground">
                  Gửi thông báo cho người đăng về việc đình chỉ
                </p>
              </div>
              <Switch checked={notifyOwner} onCheckedChange={setNotifyOwner} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !suspensionType || !reason.trim() || duration > maxDuration}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <ShieldX className="h-4 w-4 mr-2" />
                Đình chỉ tạm thời
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
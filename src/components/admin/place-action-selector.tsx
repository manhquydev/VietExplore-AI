/**
 * PlaceActionSelector - Dialog for moderators to choose action when resolving report
 *
 * Purpose: When a report is valid, moderator MUST take action on the place
 * Actions: Request Edit, Suspend, Hide, Warning Only
 */

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { adminIcons } from "@/lib/admin/icon-system"
import { cn } from "@/lib/utils"

// Action types
export type PlaceActionType = 'request_edit' | 'suspend' | 'hide_permanent' | 'warning_only'

export interface PlaceAction {
  type: PlaceActionType
  notes: string
  // For suspend action
  suspendDuration?: number // hours
  // For request edit action
  fieldsToEdit?: string[]
}

export interface PlaceActionSelectorProps {
  reportId: string
  placeId: string
  placeName: string
  reportIssue: string // What was reported
  onConfirm: (action: PlaceAction) => Promise<void>
  trigger: React.ReactNode
}

const ACTION_CONFIG = {
  request_edit: {
    label: "Yêu cầu chỉnh sửa",
    description: "Gửi yêu cầu sửa cho owner (status: needs_revision)",
    icon: adminIcons.actions.edit,
    color: "text-blue-600 bg-blue-50",
    requiresDuration: false
  },
  suspend: {
    label: "Tạm đình chỉ",
    description: "Ẩn tạm thời (1-168 giờ, auto-restore)",
    icon: adminIcons.status.warning,
    color: "text-orange-600 bg-orange-50",
    requiresDuration: true
  },
  hide_permanent: {
    label: "Ẩn vĩnh viễn",
    description: "Ẩn khỏi công khai (admin có thể restore)",
    icon: adminIcons.status.error,
    color: "text-red-600 bg-red-50",
    requiresDuration: false
  },
  warning_only: {
    label: "Chỉ cảnh báo owner",
    description: "Gửi thông báo cảnh cáo, không ẩn địa điểm",
    icon: adminIcons.feedback.info,
    color: "text-gray-600 bg-gray-50",
    requiresDuration: false
  }
} as const

export const PlaceActionSelector = ({
  reportId,
  placeId,
  placeName,
  reportIssue,
  onConfirm,
  trigger
}: PlaceActionSelectorProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedAction, setSelectedAction] = React.useState<PlaceActionType>('request_edit')
  const [notes, setNotes] = React.useState('')
  const [suspendDuration, setSuspendDuration] = React.useState('24') // default 24 hours

  const handleConfirm = async () => {
    // Validation
    if (!notes.trim()) {
      return // Required field handled by UI
    }

    if (selectedAction === 'suspend') {
      const duration = parseInt(suspendDuration)
      if (isNaN(duration) || duration < 1 || duration > 168) {
        return // Validation handled by input
      }
    }

    setIsLoading(true)
    try {
      const action: PlaceAction = {
        type: selectedAction,
        notes: notes.trim(),
        ...(selectedAction === 'suspend' && {
          suspendDuration: parseInt(suspendDuration)
        })
      }

      await onConfirm(action)

      // Close dialog and reset
      setIsOpen(false)
      setNotes('')
      setSelectedAction('request_edit')
      setSuspendDuration('24')
    } catch (error) {
      console.error('Error confirming place action:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset form on close
      setNotes('')
      setSelectedAction('request_edit')
      setSuspendDuration('24')
    }
  }

  const selectedConfig = ACTION_CONFIG[selectedAction]

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="admin-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <adminIcons.status.success className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="admin-section-title text-left">
                Giải quyết báo cáo về "{placeName}"
              </DialogTitle>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Vấn đề được báo cáo:</span> {reportIssue}
            </p>
          </div>
          <DialogDescription className="admin-body-text text-left">
            Báo cáo hợp lệ. Vui lòng chọn hành động xử lý địa điểm:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Action Selection */}
          <div className="space-y-3">
            <Label className="admin-body-text font-semibold">
              Hành động xử lý <span className="text-red-600">*</span>
            </Label>
            <RadioGroup value={selectedAction} onValueChange={(value) => setSelectedAction(value as PlaceActionType)}>
              {(Object.keys(ACTION_CONFIG) as PlaceActionType[]).map((actionType) => {
                const config = ACTION_CONFIG[actionType]
                const Icon = config.icon
                const isSelected = selectedAction === actionType

                return (
                  <div
                    key={actionType}
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedAction(actionType)}
                  >
                    <RadioGroupItem value={actionType} id={actionType} className="mt-1" />
                    <label htmlFor={actionType} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn("h-4 w-4", isSelected ? "text-blue-600" : "text-gray-500")} />
                        <span className="font-medium text-sm">{config.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{config.description}</p>
                    </label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Suspend Duration Input (conditional) */}
          {selectedAction === 'suspend' && (
            <div className="space-y-2 pl-6 border-l-2 border-orange-200 bg-orange-50 p-3 rounded-r-lg">
              <Label htmlFor="suspend-duration" className="text-sm font-semibold text-orange-800">
                Thời gian đình chỉ (giờ) <span className="text-red-600">*</span>
              </Label>
              <Input
                id="suspend-duration"
                type="number"
                min="1"
                max="168"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
                className="admin-input"
                placeholder="Ví dụ: 24 (1 ngày), 168 (7 ngày)"
              />
              <p className="text-xs text-orange-700">
                Tối thiểu 1 giờ, tối đa 168 giờ (7 ngày). Địa điểm sẽ tự động hiển thị lại sau khi hết hạn.
              </p>
            </div>
          )}

          {/* Resolution Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="admin-body-text font-semibold">
              Ghi chú xử lý <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="notes"
              placeholder={
                selectedAction === 'request_edit'
                  ? "Ví dụ: Địa chỉ sai, cần cập nhật theo báo cáo của user. Yêu cầu: Cập nhật địa chỉ chính xác, thêm thông tin liên hệ..."
                  : selectedAction === 'suspend'
                  ? "Ví dụ: Tạm đình chỉ để xác minh thông tin. Có nhiều báo cáo về địa chỉ sai và hình ảnh không phù hợp..."
                  : selectedAction === 'hide_permanent'
                  ? "Ví dụ: Vi phạm nghiêm trọng chính sách nội dung. Hình ảnh không phù hợp, thông tin gây hiểu lầm..."
                  : "Ví dụ: Cảnh báo về chất lượng nội dung. Vui lòng cập nhật thông tin chính xác hơn..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="admin-input min-h-[120px] resize-none"
              rows={5}
            />
            <p className="text-xs text-gray-600">
              Ghi rõ lý do quyết định và hành động đã thực hiện. Thông tin này sẽ được gửi cho owner.
            </p>
          </div>

          {/* Warning Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <adminIcons.feedback.info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1">
                  {selectedAction === 'request_edit' && (
                    <>
                      <li>Địa điểm sẽ chuyển sang trạng thái "Cần chỉnh sửa"</li>
                      <li>Owner sẽ nhận thông báo yêu cầu chỉnh sửa</li>
                      <li>Entry được tạo trong moderation queue</li>
                    </>
                  )}
                  {selectedAction === 'suspend' && (
                    <>
                      <li>Địa điểm sẽ bị ẩn khỏi công khai ngay lập tức</li>
                      <li>Tự động hiển thị lại sau {suspendDuration} giờ</li>
                      <li>Owner nhận thông báo về việc tạm đình chỉ</li>
                    </>
                  )}
                  {selectedAction === 'hide_permanent' && (
                    <>
                      <li>Địa điểm sẽ bị ẩn vĩnh viễn khỏi công khai</li>
                      <li>Chỉ Admin mới có thể khôi phục</li>
                      <li>Owner có thể appeal quyết định</li>
                    </>
                  )}
                  {selectedAction === 'warning_only' && (
                    <>
                      <li>Không thay đổi trạng thái địa điểm</li>
                      <li>Owner nhận cảnh báo qua thông báo</li>
                      <li>Hành động được ghi lại trong audit log</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="admin-btn-secondary"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !notes.trim() || (selectedAction === 'suspend' && (parseInt(suspendDuration) < 1 || parseInt(suspendDuration) > 168))}
            className="admin-btn-primary bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Đang xử lý...
              </div>
            ) : (
              <>
                <adminIcons.status.success className="h-4 w-4 mr-2" />
                Giải quyết & Thực hiện
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

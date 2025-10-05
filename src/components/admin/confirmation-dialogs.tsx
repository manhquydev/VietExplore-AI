/**
 * VietExplore AI - Professional Admin Confirmation Dialogs
 * Replace prompt() with proper modal confirmations
 */

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel, 
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { adminIcons } from "@/lib/admin/icon-system"
import { cn } from "@/lib/utils"

// === CONFIRMATION DIALOG ===
export interface AdminConfirmDialogProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  onConfirm: () => void | Promise<void>
  trigger: React.ReactNode
  loading?: boolean
}

export const AdminConfirmDialog = ({
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = 'default',
  onConfirm,
  trigger,
  loading = false
}: AdminConfirmDialogProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: adminIcons.status.error,
          iconBg: 'bg-admin-error-100',
          iconColor: 'text-admin-error-600',
          buttonClass: 'admin-btn-primary bg-admin-error-600 hover:bg-admin-error-700 focus:ring-admin-error-500'
        }
      case 'warning':
        return {
          icon: adminIcons.status.warning,
          iconBg: 'bg-admin-warning-100', 
          iconColor: 'text-admin-warning-600',
          buttonClass: 'admin-btn-primary bg-admin-warning-600 hover:bg-admin-warning-700 focus:ring-admin-warning-500'
        }
      default:
        return {
          icon: adminIcons.feedback.info,
          iconBg: 'bg-admin-primary-100',
          iconColor: 'text-admin-primary-600',
          buttonClass: 'admin-btn-primary'
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="admin-card max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", variantStyles.iconBg)}>
              <variantStyles.icon className={cn("h-6 w-6", variantStyles.iconColor)} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="admin-section-title text-left">{title}</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="admin-body-text text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-3 sm:gap-3">
          <AlertDialogCancel className="admin-btn-secondary">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            className={variantStyles.buttonClass}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Đang xử lý...
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// === INPUT CONFIRMATION DIALOG ===
export interface AdminInputDialogProps {
  title: string
  description?: string
  placeholder: string
  label?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  onConfirm: (value: string) => void | Promise<void>
  trigger: React.ReactNode
  multiline?: boolean
  required?: boolean
}

export const AdminInputDialog = ({
  title,
  description,
  placeholder,
  label,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = 'default',
  onConfirm,
  trigger,
  multiline = false,
  required = true
}: AdminInputDialogProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    if (required && !value.trim()) return
    
    setIsLoading(true)
    try {
      await onConfirm(value.trim())
      setIsOpen(false)
      setValue('')
    } catch (error) {
      console.error('Input dialog action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setValue('')
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: adminIcons.status.error,
          iconBg: 'bg-admin-error-100',
          iconColor: 'text-admin-error-600',
          buttonClass: 'admin-btn-primary bg-admin-error-600 hover:bg-admin-error-700 focus:ring-admin-error-500'
        }
      case 'warning':
        return {
          icon: adminIcons.status.warning,
          iconBg: 'bg-admin-warning-100',
          iconColor: 'text-admin-warning-600',
          buttonClass: 'admin-btn-primary bg-admin-warning-600 hover:bg-admin-warning-700 focus:ring-admin-warning-500'
        }
      default:
        return {
          icon: adminIcons.feedback.info,
          iconBg: 'bg-admin-primary-100',
          iconColor: 'text-admin-primary-600',
          buttonClass: 'admin-btn-primary'
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="admin-card max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", variantStyles.iconBg)}>
              <variantStyles.icon className={cn("h-6 w-6", variantStyles.iconColor)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="admin-section-title text-left">{title}</DialogTitle>
            </div>
          </div>
          {description && (
            <DialogDescription className="admin-body-text text-left">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {label && (
            <Label htmlFor="input-field" className="admin-body-text font-semibold">
              {label} {required && <span className="text-admin-error-600">*</span>}
            </Label>
          )}
          {multiline ? (
            <Textarea
              id="input-field"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="admin-input min-h-[100px] resize-none"
              rows={4}
            />
          ) : (
            <Input
              id="input-field"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="admin-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !multiline) {
                  handleConfirm()
                }
              }}
            />
          )}
        </div>
        
        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="admin-btn-secondary"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading || (required && !value.trim())}
            className={variantStyles.buttonClass}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Đang xử lý...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// === SPECIALIZED MODERATION DIALOGS ===

export const AdminRejectDialog = ({ onConfirm, trigger, title, description }: {
  onConfirm: (reason: string) => void | Promise<void>
  trigger: React.ReactNode
  title?: string
  description?: string
}) => (
  <AdminInputDialog
    title={title || "Từ chối nội dung"}
    description={description || "Vui lòng cho biết lý do từ chối để người gửi có thể hiểu và cải thiện."}
    placeholder="Nhập lý do từ chối..."
    label="Lý do từ chối"
    confirmText="Từ chối"
    variant="destructive"
    onConfirm={onConfirm}
    trigger={trigger}
    multiline
  />
)

export const AdminEscalateDialog = ({ onConfirm, trigger }: {
  onConfirm: (reason: string) => void | Promise<void>
  trigger: React.ReactNode
}) => (
  <AdminInputDialog
    title="Leo thang vấn đề"
    description="Nội dung này sẽ được chuyển lên cấp cao hơn để xem xét."
    placeholder="Nhập lý do leo thang..."
    label="Lý do leo thang"
    confirmText="Leo thang"
    variant="warning"
    onConfirm={onConfirm}
    trigger={trigger}
    multiline
  />
)

export const AdminDeleteDialog = ({ itemName, onConfirm, trigger }: {
  itemName: string
  onConfirm: () => void | Promise<void>
  trigger: React.ReactNode
}) => (
  <AdminConfirmDialog
    title="Xóa vĩnh viễn"
    description={`Bạn có chắc chắn muốn xóa "${itemName}"? Hành động này không thể hoàn tác.`}
    confirmText="Xóa vĩnh viễn"
    variant="destructive"
    onConfirm={onConfirm}
    trigger={trigger}
  />
)

export const AdminApproveDialog = ({ itemName, onConfirm, trigger, title, description }: {
  itemName: string
  onConfirm: () => void | Promise<void>
  trigger: React.ReactNode
  title?: string
  description?: string
}) => (
  <AdminConfirmDialog
    title={title || "Phê duyệt nội dung"}
    description={description || `Phê duyệt "${itemName}" và công khai cho người dùng?`}
    confirmText="Phê duyệt"
    variant="default"
    onConfirm={onConfirm}
    trigger={trigger}
  />
)

export const AdminRequestEditDialog = ({ onConfirm, trigger }: {
  onConfirm: (reason: string) => void | Promise<void>
  trigger: React.ReactNode
}) => (
  <AdminInputDialog
    title="Yêu cầu chỉnh sửa"
    description="Hướng dẫn cụ thể để người đăng có thể chỉnh sửa và gửi lại."
    placeholder="Nhập yêu cầu chỉnh sửa..."
    label="Nội dung cần chỉnh sửa"
    confirmText="Gửi yêu cầu"
    variant="warning"
    onConfirm={onConfirm}
    trigger={trigger}
    multiline
  />
)

// === REPORT HANDLING DIALOGS (Different from Content Moderation) ===

export const AdminResolveReportDialog = ({
  itemName,
  onConfirm,
  trigger
}: {
  itemName: string
  onConfirm: (notes: string) => void | Promise<void>
  trigger: React.ReactNode
}) => (
  <AdminInputDialog
    title="Giải quyết báo cáo"
    description={`Xác nhận đã xử lý xong báo cáo về "${itemName}"? Vui lòng ghi chú hành động đã thực hiện.`}
    placeholder="Ví dụ: Đã cập nhật địa chỉ chính xác, Đã ẩn hình ảnh không phù hợp, Đã cảnh cáo tác giả..."
    label="Ghi chú xử lý"
    confirmText="Đánh dấu đã giải quyết"
    variant="default"
    onConfirm={onConfirm}
    trigger={trigger}
    multiline
    required
  />
)

export const AdminDismissReportDialog = ({
  itemName,
  onConfirm,
  trigger
}: {
  itemName: string
  onConfirm: (reason: string) => void | Promise<void>
  trigger: React.ReactNode
}) => (
  <AdminInputDialog
    title="Bác bỏ báo cáo"
    description={`Xác nhận báo cáo về "${itemName}" không hợp lệ? Vui lòng ghi rõ lý do để người báo cáo hiểu.`}
    placeholder="Ví dụ: Thông tin địa điểm chính xác, Không vi phạm quy định cộng đồng, Báo cáo không có căn cứ..."
    label="Lý do bác bỏ"
    confirmText="Bác bỏ báo cáo"
    variant="destructive"
    onConfirm={onConfirm}
    trigger={trigger}
    multiline
    required
  />
)
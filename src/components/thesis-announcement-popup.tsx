"use client"

import * as React from "react"
import { X, GraduationCap, User, UserCheck, Award, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  ThesisPopupSettings,
  shouldShowThesisPopup,
  markThesisPopupShown
} from "@/lib/types/thesis-popup"

interface ThesisAnnouncementPopupProps {
  settings: ThesisPopupSettings
}

/**
 * Thesis Announcement Popup Component
 *
 * UX Best Practices Applied:
 * - Session-based display (once per session by default)
 * - 2-second delay before showing (non-intrusive)
 * - Easy dismiss with X button
 * - Clean, professional design
 * - Accessible with proper ARIA labels
 * - Smooth animations
 */
export function ThesisAnnouncementPopup({ settings }: ThesisAnnouncementPopupProps) {
  const [open, setOpen] = React.useState(false)
  const [shouldRender, setShouldRender] = React.useState(false)

  React.useEffect(() => {
    // Check if popup should be displayed
    const shouldShow = shouldShowThesisPopup(settings)

    if (!shouldShow) {
      setShouldRender(false)
      return
    }

    // Apply delay before showing popup (default: 2 seconds)
    const delayMs = (settings.delaySeconds || 2) * 1000

    const timer = setTimeout(() => {
      setShouldRender(true)
      setOpen(true)

      // Mark as shown in storage
      markThesisPopupShown(settings.displayMode)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [settings])

  const handleClose = () => {
    setOpen(false)
  }

  // Don't render if conditions not met
  if (!shouldRender) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          "max-w-3xl p-0 gap-0 border-none shadow-float rounded-2xl",
          "max-h-[90vh] overflow-y-auto",
          "[&>button]:hidden" // Hide the default close button from DialogContent
        )}
      >
        {/* Decorative Top Border - Vietnam Colors */}
        <div className="h-2 bg-gradient-to-r from-brand-green via-brand-gold to-brand-green"></div>

        {/* Header with University Logo - Vietnamese Heritage Style */}
        <div className="relative bg-gradient-to-br from-brand-green/5 via-white to-brand-gold/5 px-6 sm:px-8 py-6">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #16A34A 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 sm:gap-6 flex-1">
              {/* University Logo with decorative frame */}
              {settings.universityLogoUrl && (
                <div className="flex-shrink-0 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-brand-green to-brand-gold rounded-xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl p-3 shadow-card">
                    <img
                      src={settings.universityLogoUrl}
                      alt={settings.universityLogoAlt || "Logo trường"}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Header Text */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-brand-green to-brand-forest text-white rounded-full shadow-soft">
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-semibold">Đồ án Tốt nghiệp</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-cream text-brand-forest rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Tích hợp AI</span>
                  </div>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand-forest to-brand-green bg-clip-text text-transparent leading-tight">
                  Thông tin Đề tài
                </DialogTitle>
              </div>
            </div>

            {/* Close Button - Clean & Minimal - Custom positioned */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full",
                "text-gray-500 hover:text-gray-700",
                "hover:bg-gray-100/80 transition-colors"
              )}
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 py-6 space-y-6">
          {/* Thesis Title - Prominent Display */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-green/10 text-brand-forest rounded-lg">
                <Award className="w-4 h-4" />
                <span className="text-sm font-semibold">Tên đề tài</span>
              </div>
            </div>
            <DialogDescription className={cn(
              "text-lg sm:text-xl font-bold leading-relaxed",
              "bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent",
              "border-l-4 border-brand-green pl-4"
            )}>
              {settings.title}
            </DialogDescription>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Student & Advisor Information - Card Style */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Student Info Card */}
            <div className={cn(
              "relative overflow-hidden rounded-2xl p-5",
              "bg-gradient-to-br from-brand-green/5 to-brand-green/10",
              "border border-brand-green/20 hover:border-brand-green/40",
              "transition-all duration-300 hover:shadow-soft"
            )}>
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-green/20 to-transparent rounded-bl-full"></div>

              <div className="relative space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-green rounded-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-brand-forest">Sinh viên thực hiện</span>
                </div>

                <div className="space-y-3 pl-1">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Họ và tên</div>
                    <div className="text-lg font-bold text-gray-900">{settings.studentName}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">MSSV</div>
                      <div className="font-mono font-semibold text-brand-green">{settings.studentId}</div>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Lớp</div>
                      <div className="font-semibold text-gray-700">{settings.cohort}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advisor Info Card */}
            <div className={cn(
              "relative overflow-hidden rounded-2xl p-5",
              "bg-gradient-to-br from-brand-gold/5 to-brand-gold/10",
              "border border-brand-gold/20 hover:border-brand-gold/40",
              "transition-all duration-300 hover:shadow-soft"
            )}>
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-bl-full"></div>

              <div className="relative space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-lg">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-yellow-800">Giảng viên hướng dẫn</span>
                </div>

                <div className="space-y-3 pl-1">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Học vị</div>
                    <div className="inline-block px-3 py-1 bg-brand-gold/20 text-yellow-800 rounded-full text-sm font-bold">
                      {settings.advisorTitle}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Họ và tên</div>
                    <div className="text-lg font-bold text-gray-900">{settings.advisorName}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Prominent CTA */}
          <div className="pt-6 mt-2">
            <div className={cn(
              "flex flex-col sm:flex-row items-center justify-between gap-4",
              "p-4 rounded-xl bg-gradient-to-r from-brand-green/5 to-brand-gold/5",
              "border border-brand-green/10"
            )}>
              <div className="flex items-center gap-3 text-sm">
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-brand-green/10">
                  <Sparkles className="w-5 h-5 text-brand-green" />
                </div>
                <p className="text-gray-600 leading-relaxed text-center sm:text-left">
                  Dự án đang trong giai đoạn <span className="font-semibold text-brand-forest">thực hiện và triển khai</span>
                </p>
              </div>
              <Button
                onClick={handleClose}
                className={cn(
                  "relative overflow-hidden group w-full sm:w-auto min-w-[140px]",
                  "bg-gradient-to-r from-brand-green via-brand-forest to-brand-green",
                  "hover:shadow-card transition-all duration-300",
                  "text-white font-semibold px-6 py-2.5 rounded-xl",
                  "before:absolute before:inset-0",
                  "before:bg-gradient-to-r before:from-brand-gold before:to-brand-green",
                  "before:opacity-0 hover:before:opacity-100",
                  "before:transition-opacity before:duration-300",
                  "bg-[length:200%_100%] hover:bg-right-bottom"
                )}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Đã hiểu
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom decorative border */}
        <div className="h-1.5 bg-gradient-to-r from-brand-green via-brand-gold to-brand-green"></div>
      </DialogContent>
    </Dialog>
  )
}

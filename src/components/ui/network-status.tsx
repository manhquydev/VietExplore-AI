"use client"

import * as React from "react"
import { WifiOff, Wifi, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useToast } from "@/components/providers/toast-provider"
import { cn } from "@/lib/utils"

export function NetworkStatus() {
  const { isOnline, isChecking, checkConnectivity } = useNetworkStatus()
  const toast = useToast()
  const [showOfflineBanner, setShowOfflineBanner] = React.useState(false)
  const [isDismissed, setIsDismissed] = React.useState(false)
  const hasShownReconnectToast = React.useRef(false)

  // Show offline banner when going offline
  React.useEffect(() => {
    if (!isOnline) {
      // ✅ FIXED: Chỉ set banner = true, KHÔNG gọi toast.warning nữa
      // → Ngăn spam toast khi effect re-run
      setShowOfflineBanner(true)
      setIsDismissed(false)
      hasShownReconnectToast.current = false
    } else {
      // Khi reconnect
      setShowOfflineBanner(false)

      // ✅ Chỉ show toast success 1 lần duy nhất khi reconnect
      if (showOfflineBanner && !hasShownReconnectToast.current) {
        toast.success("Đã kết nối lại internet")
        hasShownReconnectToast.current = true
      }
    }
    // ✅ FIXED: Loại bỏ `toast` khỏi dependency array
    // → Ngăn effect re-run khi toast object thay đổi
  }, [isOnline, showOfflineBanner])

  const handleRetry = async () => {
    const connected = await checkConnectivity()
    if (connected) {
      toast.success("Đã kết nối lại internet")
    } else {
      toast.error("Vẫn không thể kết nối internet. Vui lòng kiểm tra kết nối của bạn.")
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  // Không hiển thị banner nếu online hoặc user đã dismiss
  if (!showOfflineBanner || isDismissed) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className={cn(
        "flex items-center justify-between gap-4 p-4 rounded-lg shadow-lg max-w-2xl w-full",
        "bg-amber-50 border-l-4 border-amber-500",
        "animate-in slide-in-from-top duration-300"
      )}>
        {/* Icon & Message */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm text-slate-900">
              Không có kết nối internet
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Một số tính năng có thể không hoạt động. Bạn vẫn có thể xem nội dung đã tải.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isChecking}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Đang kiểm tra...
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Thử lại
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
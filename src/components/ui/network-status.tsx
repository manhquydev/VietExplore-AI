"use client"

import * as React from "react"
import { WifiOff, Wifi, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useToast } from "@/components/providers/toast-provider"
import { cn } from "@/lib/utils"

export function NetworkStatus() {
  const { isOnline, isChecking, checkConnectivity } = useNetworkStatus()
  const toast = useToast()
  const [showOfflineBanner, setShowOfflineBanner] = React.useState(false)

  // Show offline banner when going offline
  React.useEffect(() => {
    if (!isOnline) {
      setShowOfflineBanner(true)
      toast.warning("Mất kết nối internet", { 
        persistent: true,
        title: "Offline" 
      })
    } else {
      setShowOfflineBanner(false)
    }
  }, [isOnline, toast])

  const handleRetry = async () => {
    const connected = await checkConnectivity()
    if (connected) {
      toast.success("Đã kết nối lại internet")
    } else {
      toast.error("Vẫn không thể kết nối internet")
    }
  }

  if (!showOfflineBanner) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className={cn(
        "flex items-center justify-between gap-4 p-4 rounded-lg shadow-lg",
        "bg-warn/90 backdrop-blur-sm border border-warn",
        "animate-in slide-in-from-bottom duration-300"
      )}>
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-warn" />
          <div>
            <div className="font-semibold text-sm text-warn">
              Không có kết nối internet
            </div>
            <div className="text-xs text-warn/80">
              Một số tính năng có thể không hoạt động
            </div>
          </div>
        </div>

        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleRetry}
          disabled={isChecking}
          className="border-warn text-warn hover:bg-warn hover:text-white"
        >
          {isChecking ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Thử lại
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
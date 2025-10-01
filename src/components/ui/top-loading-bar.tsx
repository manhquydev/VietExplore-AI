"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * Top Loading Bar - Du Lịch Việt Style
 * Hiển thị thanh loading ở đỉnh màn hình khi chuyển trang
 * Brand colors: Green to Yellow gradient
 */
export function TopLoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Bắt đầu loading
    setIsLoading(true)
    setProgress(20)

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(40), 100)
    const timer2 = setTimeout(() => setProgress(70), 300)
    const timer3 = setTimeout(() => setProgress(90), 600)

    // Complete loading
    const completeTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(completeTimer)
    }
  }, [pathname, searchParams])

  if (!isLoading && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent pointer-events-none"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-green-500 shadow-lg transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
        }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>
    </div>
  )
}

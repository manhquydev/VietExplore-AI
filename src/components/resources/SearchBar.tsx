/**
 * SearchBar Component
 * Real-time search across resources (airlines, hospitals, apps)
 * Mobile-first, accessible, keyboard-friendly
 */

"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  resultCount?: number
  className?: string
  showResultCount?: boolean
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Tìm kiếm hãng hàng không, bệnh viện, ứng dụng...",
  resultCount,
  className,
  showResultCount = true
}: SearchBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onChange("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear()
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Search Input Container */}
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" aria-hidden="true" />
        </div>

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 text-sm sm:text-base",
            "glass-card border-2 border-slate-200",
            "focus:border-brand-green focus:ring-2 focus:ring-brand-green/20",
            "placeholder:text-slate-400",
            "min-h-[44px] sm:min-h-[48px]"
          )}
          aria-label="Tìm kiếm tài nguyên"
          aria-describedby={showResultCount && resultCount !== undefined ? "search-result-count" : undefined}
        />

        {/* Clear Button */}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className={cn(
              "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2",
              "w-8 h-8 sm:w-9 sm:h-9 p-0",
              "hover:bg-slate-100 rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            )}
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Result Count (optional) */}
      {showResultCount && resultCount !== undefined && value && (
        <div
          id="search-result-count"
          className="mt-2 text-xs sm:text-sm text-slate-600 text-center sm:text-left"
          role="status"
          aria-live="polite"
        >
          {resultCount === 0 ? (
            <span className="text-slate-500">Không tìm thấy kết quả cho &quot;{value}&quot;</span>
          ) : (
            <span>
              Tìm thấy <strong className="text-brand-green">{resultCount}</strong> kết quả
              {value && <> cho &quot;{value}&quot;</>}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Export display name for debugging
SearchBar.displayName = "SearchBar"

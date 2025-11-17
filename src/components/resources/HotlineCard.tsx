/**
 * HotlineCard Component
 * Displays emergency hotline information with click-to-call functionality
 * Mobile-first, accessible, production-ready
 */

import * as React from "react"
import Link from "next/link"
import { Phone, ExternalLink, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { EmergencyHotline } from "@/data/types"

interface HotlineCardProps {
  hotline: EmergencyHotline
  className?: string
}

const colorClasses = {
  red: {
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    border: "border-red-200",
    numberColor: "text-red-600",
    hoverBg: "hover:bg-red-100",
    buttonBg: "bg-red-600 hover:bg-red-700"
  },
  pink: {
    bg: "bg-pink-50",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    border: "border-pink-200",
    numberColor: "text-pink-600",
    hoverBg: "hover:bg-pink-100",
    buttonBg: "bg-pink-600 hover:bg-pink-700"
  },
  orange: {
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    border: "border-orange-200",
    numberColor: "text-orange-600",
    hoverBg: "hover:bg-orange-100",
    buttonBg: "bg-orange-600 hover:bg-orange-700"
  },
  gray: {
    bg: "bg-gray-50",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    border: "border-gray-200",
    numberColor: "text-gray-500",
    hoverBg: "hover:bg-gray-100",
    buttonBg: "bg-gray-600 hover:bg-gray-700"
  }
}

export function HotlineCard({ hotline, className }: HotlineCardProps) {
  const colors = colorClasses[hotline.color]

  return (
    <div
      className={cn(
        "glass-card border-2 transition-all duration-200 overflow-hidden",
        "flex flex-col h-full",
        colors.bg,
        colors.border,
        hotline.deprecated && "opacity-70",
        className
      )}
      role="article"
      aria-label={`${hotline.name} - ${hotline.number}`}
    >
      {/* Deprecated Badge */}
      {hotline.deprecated && (
        <div className="mb-3">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Số cũ - Chuyển sang {hotline.redirect_to}
          </Badge>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl sm:text-3xl",
            colors.iconBg
          )}
          aria-hidden="true"
        >
          {hotline.icon}
        </div>

        {/* Name and Number */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            {hotline.name}
          </h3>
          <div
            className={cn(
              "text-2xl sm:text-3xl font-bold tracking-tight",
              colors.numberColor
            )}
          >
            {hotline.number}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm sm:text-base text-slate-600 mb-4 leading-relaxed line-clamp-3">
        {hotline.description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-auto">
        {/* Primary CTA: Call Button */}
        <a
          href={hotline.tel_link}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold transition-colors min-h-[44px]",
            colors.buttonBg,
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            hotline.deprecated && "pointer-events-none opacity-50"
          )}
          aria-label={`Gọi ${hotline.number} - ${hotline.name}`}
        >
          <Phone className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          <span>Gọi {hotline.number}</span>
        </a>

        {/* Secondary: Source Link (if available) */}
        {hotline.source_url && (
          <Link
            href={hotline.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg glass-subtle transition-colors min-h-[44px]",
              colors.hoverBg,
              "focus:outline-none focus:ring-2 focus:ring-offset-2"
            )}
            aria-label={`Xem nguồn: ${hotline.source}`}
          >
            <ExternalLink className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-700">Nguồn</span>
          </Link>
        )}
      </div>

      {/* Source Attribution - Fixed overflow */}
      <div className="mt-4 pt-4 border-t border-slate-200/50">
        <p className="text-xs text-slate-500 break-words line-clamp-2 leading-relaxed">
          <span className="font-semibold inline-block mr-1">📋 Nguồn:</span>
          <span className="inline">{hotline.source}</span>
        </p>
        {hotline.source.length > 80 && (
          <button
            className="text-xs text-brand-green hover:text-brand-forest mt-1 font-medium"
            onClick={(e) => {
              const el = e.currentTarget.previousElementSibling as HTMLElement
              if (el) {
                el.classList.toggle('line-clamp-2')
                e.currentTarget.textContent = el.classList.contains('line-clamp-2') ? 'Xem thêm' : 'Thu gọn'
              }
            }}
          >
            Xem thêm
          </button>
        )}
      </div>
    </div>
  )
}

// Export display name for debugging
HotlineCard.displayName = "HotlineCard"

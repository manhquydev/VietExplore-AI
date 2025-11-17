/**
 * AirlineCard Component
 * Displays airline information with booking, phone, and support links
 * Brand colors: Green (primary) & Gold (secondary) - Bánh Chưng theme
 */

import * as React from "react"
import Link from "next/link"
import { Plane, Phone, ExternalLink, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Airline } from "@/data/types"

interface AirlineCardProps {
  airline: Airline
  className?: string
}

export function AirlineCard({ airline, className }: AirlineCardProps) {
  return (
    <div
      className={cn(
        "glass-card group overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      role="article"
      aria-label={`${airline.name} - ${airline.code}`}
    >
      {/* Header with Logo & Name */}
      <div className="p-5 sm:p-6 border-b border-slate-200/50">
        <div className="flex items-start gap-4">
          {/* Logo placeholder */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-green/10 to-brand-gold/10 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-brand-green/20">
            <Plane className="w-8 h-8 sm:w-10 sm:h-10 text-brand-green" aria-hidden="true" />
          </div>

          {/* Airline Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {airline.name}
              </h3>
              <Badge
                variant="outline"
                className="bg-brand-green/10 text-brand-green border-brand-green/30 font-semibold"
              >
                {airline.code}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              {airline.description}
            </p>

            {/* Features tags */}
            {airline.features && airline.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {airline.features.slice(0, 2).map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-white to-slate-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Primary: Book Ticket */}
          <Link
            href={airline.booking_link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
              "bg-gradient-to-r from-brand-green to-brand-forest",
              "text-white font-semibold",
              "hover:from-brand-forest hover:to-brand-green",
              "transition-all duration-200",
              "min-h-[44px] sm:col-span-3",
              "focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            )}
            aria-label={`Đặt vé ${airline.name}`}
          >
            <Plane className="w-4 h-4" aria-hidden="true" />
            <span>Đặt vé ngay</span>
          </Link>

          {/* Secondary: Call */}
          <a
            href={airline.tel_link}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
              "glass-subtle hover:bg-brand-green/10",
              "text-slate-700 hover:text-brand-green font-medium",
              "border border-slate-200 hover:border-brand-green/30",
              "transition-all duration-200",
              "min-h-[44px]",
              "focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            )}
            aria-label={`Gọi ${airline.name}`}
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">{airline.phone_display}</span>
          </a>

          {/* Tertiary: Website */}
          <Link
            href={airline.website}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
              "glass-subtle hover:bg-brand-gold/10",
              "text-slate-700 hover:text-brand-gold font-medium",
              "border border-slate-200 hover:border-brand-gold/30",
              "transition-all duration-200",
              "min-h-[44px]",
              "focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            )}
            aria-label={`Website ${airline.name}`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Website</span>
          </Link>

          {/* Tertiary: Support */}
          <Link
            href={airline.support_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
              "glass-subtle hover:bg-slate-100",
              "text-slate-700 hover:text-slate-900 font-medium",
              "border border-slate-200 hover:border-slate-300",
              "transition-all duration-200",
              "min-h-[44px]",
              "focus:outline-none focus:ring-2 focus:ring-slate-300"
            )}
            aria-label={`Hỗ trợ ${airline.name}`}
          >
            <Headphones className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Hỗ trợ</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Export display name for debugging
AirlineCard.displayName = "AirlineCard"

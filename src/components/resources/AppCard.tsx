/**
 * AppCard Component
 * Displays app information with download links for iOS & Android
 * Brand colors: Green (primary) & Gold (secondary) - Bánh Chưng theme
 */

import * as React from "react"
import Link from "next/link"
import { Download, Star, Smartphone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { App } from "@/data/types"

interface AppCardProps {
  app: App
  className?: string
}

export function AppCard({ app, className }: AppCardProps) {
  return (
    <div
      className={cn(
        "glass-card text-center group overflow-hidden",
        "transition-all duration-300 hover:scale-105 hover:shadow-lg",
        "min-h-[200px] sm:min-h-[220px]",
        className
      )}
      role="article"
      aria-label={`${app.name} - ${app.category}`}
    >
      <div className="p-5 sm:p-6 flex flex-col h-full">
        {/* App Icon */}
        <div
          className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-4",
            "bg-gradient-to-br from-brand-green/10 to-brand-gold/10",
            "flex items-center justify-center text-3xl sm:text-4xl",
            "border-2 border-brand-green/20",
            "group-hover:scale-110 transition-transform duration-300"
          )}
          aria-hidden="true"
        >
          {app.icon}
        </div>

        {/* App Name */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-tight">
          {app.name}
        </h3>

        {/* Category Badge */}
        <Badge
          className="mb-3 bg-brand-green/10 text-brand-green border-brand-green/30 text-xs mx-auto"
          variant="outline"
        >
          {app.category}
        </Badge>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed flex-1">
          {app.description}
        </p>

        {/* Rating (if available) */}
        {app.rating && (
          <div className="flex items-center justify-center gap-1 mb-3 text-xs text-slate-600">
            <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
            <span className="font-semibold">{app.rating}</span>
          </div>
        )}

        {/* Download Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Android / Play Store */}
          <Link
            href={app.app_stores.play_store}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg",
              "bg-gradient-to-br from-brand-green to-brand-forest",
              "text-white text-xs font-semibold",
              "hover:from-brand-forest hover:to-brand-green",
              "transition-all duration-200",
              "min-h-[40px]",
              "focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            )}
            aria-label={`Tải ${app.name} trên Android`}
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Android</span>
          </Link>

          {/* iOS / App Store */}
          <Link
            href={app.app_stores.app_store}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg",
              "glass-subtle hover:bg-slate-200",
              "text-slate-700 text-xs font-semibold",
              "border border-slate-300 hover:border-slate-400",
              "transition-all duration-200",
              "min-h-[40px]",
              "focus:outline-none focus:ring-2 focus:ring-slate-300"
            )}
            aria-label={`Tải ${app.name} trên iOS`}
          >
            <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>iOS</span>
          </Link>
        </div>

        {/* Free Badge */}
        {app.free && (
          <p className="mt-3 text-xs text-brand-green font-medium">
            ✓ Miễn phí
          </p>
        )}
      </div>
    </div>
  )
}

// Export display name for debugging
AppCard.displayName = "AppCard"

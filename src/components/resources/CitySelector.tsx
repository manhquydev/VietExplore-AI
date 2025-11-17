/**
 * CitySelector Component
 * Filter resources by city with sticky scroll behavior
 * Brand colors: Green (primary) & Gold (secondary) - Bánh Chưng theme
 */

"use client"

import * as React from "react"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { City, CITIES } from "@/data/types"

interface CitySelectorProps {
  selectedCity: City
  onChange: (city: City) => void
  className?: string
}

const cityList: { value: City; label: string; icon: string }[] = [
  { value: "all", label: "Tất cả", icon: "🇻🇳" },
  { value: "hanoi", label: "Hà Nội", icon: "🏛️" },
  { value: "hcm", label: "TP.HCM", icon: "🏙️" },
  { value: "danang", label: "Đà Nẵng", icon: "🌉" },
  { value: "cantho", label: "Cần Thơ", icon: "🌾" },
]

export function CitySelector({ selectedCity, onChange, className }: CitySelectorProps) {
  return (
    <div
      className={cn(
        "glass-card sticky top-16 sm:top-20 z-40 shadow-md",
        className
      )}
      role="tablist"
      aria-label="Chọn thành phố"
    >
      <div className="container py-4 sm:py-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-brand-green" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Chọn thành phố
          </h2>
        </div>

        {/* City Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {cityList.map((city) => {
            const isActive = selectedCity === city.value

            return (
              <button
                key={city.value}
                onClick={() => onChange(city.value)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`city-panel-${city.value}`}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium",
                  "whitespace-nowrap transition-all duration-200",
                  "min-h-[44px] text-sm sm:text-base",
                  "focus:outline-none focus:ring-2 focus:ring-brand-green/50",
                  isActive
                    ? "bg-gradient-to-r from-brand-green to-brand-forest text-white shadow-lg scale-105"
                    : "glass-subtle hover:bg-brand-green/10 text-slate-700 hover:text-brand-green border border-slate-200 hover:border-brand-green/30"
                )}
              >
                <span className="text-lg" aria-hidden="true">
                  {city.icon}
                </span>
                <span>{city.label}</span>
              </button>
            )
          })}
        </div>

        {/* Selected City Info */}
        {selectedCity !== "all" && (
          <p className="mt-3 text-xs sm:text-sm text-slate-600">
            Đang hiển thị thông tin cho: <strong className="text-brand-green">{CITIES[selectedCity]}</strong>
          </p>
        )}
      </div>
    </div>
  )
}

// Export display name for debugging
CitySelector.displayName = "CitySelector"

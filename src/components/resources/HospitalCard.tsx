/**
 * HospitalCard Component
 * Displays hospital information with call and map links
 * Brand colors: Green (primary) & Red (emergency) - Bánh Chưng theme
 */

import * as React from "react"
import Link from "next/link"
import { MapPin, Phone, ExternalLink, CheckCircle, Hospital as HospitalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Hospital } from "@/data/types"

interface HospitalCardProps {
  hospital: Hospital
  className?: string
}

export function HospitalCard({ hospital, className }: HospitalCardProps) {
  return (
    <div
      className={cn(
        "glass-card overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.01]",
        "border-l-4 border-red-500",
        className
      )}
      role="article"
      aria-label={`${hospital.name} - ${hospital.city}`}
    >
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-red-50/50 to-white">
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <HospitalIcon className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>

          {/* Hospital Name & Verified Badge */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-tight">
              {hospital.name}
            </h3>
            {hospital.verified_24_7 && (
              <Badge className="bg-brand-green text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Cấp cứu 24/7
              </Badge>
            )}
          </div>
        </div>

        {/* Address (clickable → map) */}
        <Link
          href={hospital.map_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 text-sm text-slate-600 hover:text-brand-green transition-colors group mb-3"
          aria-label={`Xem bản đồ ${hospital.name}`}
        >
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-brand-green" aria-hidden="true" />
          <span className="group-hover:underline">{hospital.address}</span>
        </Link>

        {/* Specialties */}
        {hospital.specialties && hospital.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hospital.specialties.slice(0, 3).map((specialty, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg"
              >
                {specialty}
              </span>
            ))}
            {hospital.specialties.length > 3 && (
              <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">
                +{hospital.specialties.length - 3} khác
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-2 gap-3">
          {/* Primary: Call Emergency Hotline */}
          {hospital.hotline_tel && (
            <a
              href={hospital.hotline_tel}
              className={cn(
                "col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                "bg-gradient-to-r from-red-600 to-red-700",
                "text-white font-bold",
                "hover:from-red-700 hover:to-red-800",
                "transition-all duration-200",
                "min-h-[44px]",
                "focus:outline-none focus:ring-2 focus:ring-red-500/50"
              )}
              aria-label={`Gọi hotline ${hospital.name}`}
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
              <span>Gọi hotline: {hospital.hotline_display}</span>
            </a>
          )}

          {/* Secondary: Call Main Number */}
          <a
            href={hospital.tel_link}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
              "glass-subtle hover:bg-brand-green/10",
              "text-slate-700 hover:text-brand-green font-medium",
              "border border-slate-200 hover:border-brand-green/30",
              "transition-all duration-200",
              "min-h-[44px]",
              "focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            )}
            aria-label={`Gọi tổng đài ${hospital.name}`}
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">{hospital.phone_display}</span>
          </a>

          {/* Secondary: View on Map */}
          <Link
            href={hospital.map_link}
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
            aria-label={`Xem bản đồ ${hospital.name}`}
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Bản đồ</span>
          </Link>
        </div>

        {/* Hospital Note */}
        {hospital.note && (
          <p className="mt-3 text-xs text-slate-500 italic">
            {hospital.note}
          </p>
        )}

        {/* Last Verified */}
        {hospital.verified_24_7 && hospital.last_verified && (
          <p className="mt-2 text-xs text-slate-400">
            Xác minh: {new Date(hospital.last_verified).toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>
    </div>
  )
}

// Export display name for debugging
HospitalCard.displayName = "HospitalCard"

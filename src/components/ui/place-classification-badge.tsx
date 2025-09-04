"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  MapPin, 
  Mountain, 
  Waves, 
  Building2, 
  UtensilsCrossed, 
  Camera,
  Navigation
} from "lucide-react"

interface PlaceClassificationBadgeProps {
  type: "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in"
  region: "bac-bo" | "trung-bo" | "nam-bo"
  className?: string
  size?: "sm" | "md" | "lg"
  showIcons?: boolean
}

export function PlaceClassificationBadge({ 
  type, 
  region, 
  className, 
  size = "md",
  showIcons = true 
}: PlaceClassificationBadgeProps) {
  const getTypeInfo = (type: string) => {
    switch(type) {
      case 'bien':
        return {
          label: 'Biển',
          icon: Waves,
          bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          textColor: 'text-blue-900',
          iconColor: 'text-blue-700'
        }
      case 'nui':
        return {
          label: 'Núi',
          icon: Mountain,
          bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-900',
          iconColor: 'text-green-700'
        }
      case 'van-hoa':
        return {
          label: 'Văn hóa',
          icon: Building2,
          bgColor: 'bg-gradient-to-r from-purple-500 to-violet-500',
          textColor: 'text-purple-900',
          iconColor: 'text-purple-700'
        }
      case 'am-thuc':
        return {
          label: 'Ẩm thực',
          icon: UtensilsCrossed,
          bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
          textColor: 'text-orange-900',
          iconColor: 'text-orange-700'
        }
      case 'check-in':
        return {
          label: 'Check-in',
          icon: Camera,
          bgColor: 'bg-gradient-to-r from-pink-500 to-rose-500',
          textColor: 'text-pink-900',
          iconColor: 'text-pink-700'
        }
      default:
        return {
          label: 'Khác',
          icon: MapPin,
          bgColor: 'bg-gradient-to-r from-gray-500 to-slate-500',
          textColor: 'text-gray-900',
          iconColor: 'text-gray-700'
        }
    }
  }

  const getRegionInfo = (region: string) => {
    switch(region) {
      case 'bac-bo':
        return {
          label: 'Miền Bắc',
          bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
          textColor: 'text-red-900'
        }
      case 'trung-bo':
        return {
          label: 'Miền Trung',
          bgColor: 'bg-gradient-to-r from-yellow-500 to-amber-500',
          textColor: 'text-yellow-900'
        }
      case 'nam-bo':
        return {
          label: 'Miền Nam',
          bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
          textColor: 'text-green-900'
        }
      default:
        return {
          label: 'Việt Nam',
          bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
          textColor: 'text-gray-900'
        }
    }
  }

  const getSizeClasses = (size: string) => {
    switch(size) {
      case 'sm':
        return {
          container: 'px-3 py-1.5 text-xs gap-1.5',
          icon: 'w-3 h-3'
        }
      case 'lg':
        return {
          container: 'px-6 py-3 text-lg gap-3',
          icon: 'w-6 h-6'
        }
      case 'md':
      default:
        return {
          container: 'px-4 py-2 text-sm gap-2',
          icon: 'w-4 h-4'
        }
    }
  }

  const typeInfo = getTypeInfo(type)
  const regionInfo = getRegionInfo(region)
  const sizeClasses = getSizeClasses(size)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Place Type Badge */}
      <div className={cn(
        "inline-flex items-center font-bold rounded-full text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105",
        typeInfo.bgColor,
        sizeClasses.container
      )}>
        {showIcons && (
          <typeInfo.icon className={sizeClasses.icon} />
        )}
        <span className="font-bold tracking-wide">
          {typeInfo.label}
        </span>
      </div>

      {/* Region Badge */}
      <div className={cn(
        "inline-flex items-center font-semibold rounded-full text-white shadow-md transition-all duration-300 hover:shadow-lg",
        regionInfo.bgColor,
        sizeClasses.container
      )}>
        {showIcons && (
          <Navigation className={sizeClasses.icon} />
        )}
        <span className="font-semibold tracking-wide">
          {regionInfo.label}
        </span>
      </div>
    </div>
  )
}
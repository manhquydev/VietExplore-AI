"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProfessionalRoleBadgeProps {
  role: "contributor" | "partner" | "admin" | "moderator"
  authorName?: string
  className?: string
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function ProfessionalRoleBadge({ 
  role, 
  authorName, 
  className, 
  size = "md",
  showLabel = true 
}: ProfessionalRoleBadgeProps) {
  const getRoleInfo = (role: string) => {
    switch(role) {
      case 'partner':
        return {
          label: 'Đối tác cộng đồng',
          bgColor: 'bg-gradient-to-r from-red-500 to-red-700',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100'
        }
      case 'admin':
        return {
          label: 'Quản trị viên',
          bgColor: 'bg-gradient-to-r from-yellow-500 to-amber-600',
          textColor: 'text-amber-900',
          borderColor: 'border-amber-200',
          iconBg: 'bg-amber-100'
        }
      case 'moderator':
        return {
          label: 'Điều hành viên',
          bgColor: 'bg-gradient-to-r from-purple-500 to-purple-700',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-200',
          iconBg: 'bg-purple-100'
        }
      case 'contributor':
      default:
        return {
          label: 'Cộng tác viên',
          bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100'
        }
    }
  }

  const getSizeClasses = (size: string) => {
    switch(size) {
      case 'sm':
        return {
          container: 'px-3 py-2 text-xs',
          icon: 'w-4 h-4',
          gap: 'gap-2'
        }
      case 'lg':
        return {
          container: 'px-3 py-2 text-lg',
          icon: 'w-12 h-12',
          gap: 'gap-2'
        }
      case 'md':
      default:
        return {
          container: 'px-4 py-2.5 text-sm',
          icon: 'w-6 h-6',
          gap: 'gap-2'
        }
    }
  }

  const roleInfo = getRoleInfo(role)
  const sizeClasses = getSizeClasses(size)

  const PartnerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" className={sizeClasses.icon}>
      <defs>
        <linearGradient id="grad-medal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DC2626"/>
          <stop offset="100%" stopColor="#991B1B"/>
        </linearGradient>
      </defs>
      {/* Ribbon */}
      <path d="M42 70 L36 96 L54 84 L72 96 L66 70 Z" fill="#FFD700" opacity="0.9"/>
      {/* Medal */}
      <circle cx="54" cy="44" r="28" fill="url(#grad-medal)" stroke="#FFD700" strokeWidth="3"/>
      {/* Star (main symbol) */}
      <polygon points="54,28 58,40 70,40 60,48 64,60 54,52 44,60 48,48 38,40 50,40" fill="#FFD700"/>
      {/* Small check on top-right */}
      <circle cx="72" cy="28" r="10" fill="white" stroke="#FFD700" strokeWidth="2"/>
      <path d="M68 28 L71 31 L76 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const ContributorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" className={sizeClasses.icon}>
      <defs>
        <linearGradient id="grad-c2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#21C1C5"/>
          <stop offset="100%" stopColor="#2178F5"/>
        </linearGradient>
      </defs>
      {/* Ribbons */}
      <path d="M38 62 L32 88 L48 78 L64 88 L58 62 Z" fill="#1F6DE8" opacity="0.85"/>
      <path d="M38 62 L48 72 L58 62 Z" fill="#FFFFFF" opacity="0.15"/>
      {/* Medal circle */}
      <circle cx="48" cy="40" r="28" fill="url(#grad-c2)"/>
      <circle cx="48" cy="40" r="28" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2"/>
      {/* Check */}
      <path d="M36 41 L45 50 L63 32" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Sparkle */}
      <g transform="translate(68,22)" fill="#FFFFFF">
        <circle cx="4" cy="4" r="2" opacity="0.95"/>
        <path d="M4 0 L4 8 M0 4 L8 4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
      </g>
    </svg>
  )

  const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" className={sizeClasses.icon}>
      <defs>
        <linearGradient id="grad-admin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#B8860B"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#grad-admin)" stroke="#FFF8DC" strokeWidth="3"/>
      <path d="M30 60 C28 52 32 44 40 36 C36 46 36 54 38 62" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M34 64 L28 68" stroke="white" strokeWidth="2" />
      <path d="M36 56 L30 60" stroke="white" strokeWidth="2" />
      <path d="M90 60 C92 52 88 44 80 36 C84 46 84 54 82 62" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M86 64 L92 68" stroke="white" strokeWidth="2" />
      <path d="M84 56 L90 60" stroke="white" strokeWidth="2" />
      <polygon points="60,36 66,52 84,52 70,62 76,78 60,68 44,78 50,62 36,52 54,52" fill="white"/>
      <circle cx="92" cy="28" r="12" fill="white" stroke="#FFD700" strokeWidth="3"/>
      <path d="M88 28 L92 32 L98 22" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const ModeratorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" className={sizeClasses.icon}>
      <defs>
        <linearGradient id="grad-moderator" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="40" fill="url(#grad-moderator)" stroke="#FFFFFF" strokeWidth="3"/>
      <path d="M28 48 L40 60 L68 32" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="68" cy="20" r="8" fill="white" stroke="#8B5CF6" strokeWidth="2"/>
      <path d="M64 20 L67 23 L72 16" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const renderIcon = () => {
    switch(role) {
      case 'partner':
        return <PartnerIcon />
      case 'admin':
        return <AdminIcon />
      case 'moderator':
        return <ModeratorIcon />
      case 'contributor':
      default:
        return <ContributorIcon />
    }
  }

  return (
    <div className={cn(
      "inline-flex items-center font-semibold rounded-full border shadow-sm transition-all duration-200 hover:shadow-md",
      roleInfo.borderColor,
      roleInfo.iconBg,
      sizeClasses.container,
      sizeClasses.gap,
      className
    )}>
      {renderIcon()}
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("font-bold", roleInfo.textColor)}>
            {roleInfo.label}
          </span>
          {authorName && size !== 'sm' && (
            <span className="text-xs text-gray-600 font-medium">
              {authorName}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
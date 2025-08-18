import * as React from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

interface PlaceCardProps {
  place: {
    id: string
    slug: string
    name: string
    shortDescription: string
    province: string
    type: string
    images: Array<{
      url: string
      alt: string
      isPrimary: boolean
    }>
    trustLabel: "contributor" | "partner" | "verified"
    rating?: {
      average: number
      count: number
    }
    tags?: string[]
  }
  showCTA?: boolean
  className?: string
  onAddToItinerary?: (placeId: string) => void
}



export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  showCTA = true,
  className,
  onAddToItinerary,
}) => {
  const primaryImage = place.images?.find(img => img.isPrimary) || place.images?.[0]

  return (
    <Card className={cn("overflow-hidden group", className)}>
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-surface">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-primary-50 flex items-center justify-center">
            <Icon name="location" size={24} className="text-primary opacity-50" />
          </div>
        )}
        
        {/* Trust Badge - Icon only, larger size */}
        <div className="absolute top-3 right-3">
          {place.trustLabel === 'contributor' && (
            <div className="bg-white/90 backdrop-blur rounded-full p-2.5 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 96 96">
                <defs>
                  <linearGradient id="grad-contributor-place" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#21C1C5"/>
                    <stop offset="100%" stopColor="#2178F5"/>
                  </linearGradient>
                </defs>
                <path d="M38 62 L32 88 L48 78 L64 88 L58 62 Z" fill="#1F6DE8" opacity="0.85"/>
                <path d="M38 62 L48 72 L58 62 Z" fill="#FFFFFF" opacity="0.15"/>
                <circle cx="48" cy="40" r="28" fill="url(#grad-contributor-place)"/>
                <circle cx="48" cy="40" r="28" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2"/>
                <path d="M36 41 L45 50 L63 32" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                <g transform="translate(68,22)" fill="#FFFFFF">
                  <circle cx="4" cy="4" r="2" opacity="0.95"/>
                  <path d="M4 0 L4 8 M0 4 L8 4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                </g>
              </svg>
            </div>
          )}
          {place.trustLabel === 'partner' && (
            <div className="bg-white/90 backdrop-blur rounded-full p-2.5 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 108 108">
                <defs>
                  <linearGradient id="grad-medal-place" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#DC2626"/>
                    <stop offset="100%" stopColor="#991B1B"/>
                  </linearGradient>
                </defs>
                <path d="M42 70 L36 96 L54 84 L72 96 L66 70 Z" fill="#FFD700" opacity="0.9"/>
                <circle cx="54" cy="44" r="28" fill="url(#grad-medal-place)" stroke="#FFD700" strokeWidth="3"/>
                <polygon points="54,28 58,40 70,40 60,48 64,60 54,52 44,60 48,48 38,40 50,40" fill="#FFD700"/>
                <circle cx="72" cy="28" r="10" fill="white" stroke="#FFD700" strokeWidth="2"/>
                <path d="M68 28 L71 31 L76 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          {place.trustLabel === 'verified' && (
            <div className="bg-white/90 backdrop-blur rounded-full p-2.5 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="goldA-place" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFD700"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                </defs>
                {/* Medal */}
                <circle cx="60" cy="60" r="50" fill="url(#goldA-place)" stroke="#FFF8DC" strokeWidth="3"/>
                {/* Laurel (left) */}
                <path d="M30 60 C28 52 32 44 40 36 C36 46 36 54 38 62" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <path d="M34 64 L28 68" stroke="white" strokeWidth="2" />
                <path d="M36 56 L30 60" stroke="white" strokeWidth="2" />
                {/* Laurel (right, mirrored) */}
                <path d="M90 60 C92 52 88 44 80 36 C84 46 84 54 82 62" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <path d="M86 64 L92 68" stroke="white" strokeWidth="2" />
                <path d="M84 56 L90 60" stroke="white" strokeWidth="2" />
                {/* Star */}
                <polygon points="60,36 66,52 84,52 70,62 76,78 60,68 44,78 50,62 36,52 54,52" fill="white"/>
                {/* Check */}
                <circle cx="92" cy="28" r="12" fill="white" stroke="#FFD700" strokeWidth="3"/>
                <path d="M88 28 L92 32 L98 22" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Rating - Icon allowed for core functionality */}
        {place.rating && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Icon name="star" className="w-3 h-3 text-warn" />
            <span className="text-xs font-medium">
              {place.rating.average.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        {/* Title & Location */}
        <div>
          <h3 className="font-semibold text-base leading-6 line-clamp-2 group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          <p className="text-sm text-muted mt-1">
            {place.province}
            {place.type && (
              <>
                <span> • </span>
                <span className="capitalize">{place.type}</span>
              </>
            )}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted line-clamp-2">
          {place.shortDescription}
        </p>

        {/* Tags - Clean text-only approach */}
        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {place.tags.slice(0, 2).map((tag, tagIndex) => (
              <Badge
                key={`tag-${tagIndex}-${tag}`}
                variant="secondary"
                className="text-xs h-5 px-2"
              >
                {tag}
              </Badge>
            ))}
            {place.tags.length > 2 && (
              <Badge variant="outline" className="text-xs h-5 px-2">
                +{place.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* CTA Button - Text only, professional */}
      {showCTA && (
        <CardFooter className="p-4 pt-0">
          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => onAddToItinerary?.(place.id)}
          >
            Thêm vào lịch trình
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

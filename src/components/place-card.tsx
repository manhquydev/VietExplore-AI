import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Place } from "@/lib/types/places"
import { generatePlaceUrl } from "@/lib/utils/url-helpers"
import { Eye } from "lucide-react"

interface PlaceCardProps {
  place: Place
  showCTA?: boolean
  className?: string
  onAddToItinerary?: (placeId: string) => void
  realtimeStats?: {
    views?: number
    likes?: number
    saves?: number
  }
}



export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  showCTA = true,
  className,
  onAddToItinerary,
  realtimeStats,
}) => {
  const primaryImage = place.images?.find(img => img.isPrimary) || place.images?.[0]
  
  // Always generate compound URL (slug-shortId format) for consistency
  const placeUrl = generatePlaceUrl({
    id: place.id,
    name: place.name,
    slug: place.slug
  })

  return (
    <Link href={placeUrl} className="block">
      <Card className={cn("overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow", className)}>
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
            <svg className="w-10 h-10 opacity-50 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        )}
        
        {/* Trust Badge - Original design icons */}
        <div className="absolute top-3 right-3">
          {place.trustLabel === 'contributor' && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 96 96">
                <defs>
                  <linearGradient id="grad-c2-card" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#21C1C5"/>
                    <stop offset="100%" stopColor="#2178F5"/>
                  </linearGradient>
                </defs>
                <path d="M38 62 L32 88 L48 78 L64 88 L58 62 Z" fill="#1F6DE8" opacity="0.85"/>
                <path d="M38 62 L48 72 L58 62 Z" fill="#FFFFFF" opacity="0.15"/>
                <circle cx="48" cy="40" r="28" fill="url(#grad-c2-card)"/>
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
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 108 108">
                <defs>
                  <linearGradient id="grad-medal-card" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#DC2626"/>
                    <stop offset="100%" stopColor="#991B1B"/>
                  </linearGradient>
                </defs>
                <path d="M42 70 L36 96 L54 84 L72 96 L66 70 Z" fill="#FFD700" opacity="0.9"/>
                <circle cx="54" cy="44" r="28" fill="url(#grad-medal-card)" stroke="#FFD700" strokeWidth="3"/>
                <polygon points="54,28 58,40 70,40 60,48 64,60 54,52 44,60 48,48 38,40 50,40" fill="#FFD700"/>
                <circle cx="72" cy="28" r="10" fill="white" stroke="#FFD700" strokeWidth="2"/>
                <path d="M68 28 L71 31 L76 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          {place.trustLabel === 'verified' && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="goldA-card" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFD700"/>
                    <stop offset="100%" stopColor="#B8860B"/>
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" fill="url(#goldA-card)" stroke="#FFF8DC" strokeWidth="3"/>
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
            </div>
          )}
        </div>

        {/* Rating and View Count - Bottom overlay */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between">
          {/* Rating */}
          {place.rating && place.rating.average > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 flex items-center gap-1">
              <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              <span className="text-xs font-medium">
                {place.rating.average.toFixed(1)}
              </span>
            </div>
          )}
          
          {/* View Count */}
          {(() => {
            const viewCount = Math.max(realtimeStats?.views || 0, place.viewCount || 0);
            return viewCount > 0 ? (
              <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 flex items-center gap-1">
                <Eye className="w-3 h-3 text-white" />
                <span className="text-xs font-medium text-white">
                  {viewCount.toLocaleString('vi-VN')}
                </span>
              </div>
            ) : null;
          })()}
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 space-y-2">
        {/* Title & Location */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base leading-5 sm:leading-6 line-clamp-2 group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted mt-1">
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
        <p className="text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed text-justify">
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
        <CardFooter className="p-3 sm:p-4 pt-0">
          <Button
            size="sm"
            variant="secondary"
            className="w-full min-h-[44px] text-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToItinerary?.(place.id);
            }}
          >
            Thêm vào lịch trình
          </Button>
        </CardFooter>
      )}
      </Card>
    </Link>
  )
}

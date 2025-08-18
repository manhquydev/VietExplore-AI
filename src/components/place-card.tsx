import * as React from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { TrustBadge } from "@/components/ui/role-badge"
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
    trustLabel: "community" | "contributor" | "partner" | "verified"
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
        
        {/* Trust Badge with Icons */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
            <TrustBadge 
              level={place.trustLabel} 
              variant="default"
              className="text-xs"
            />
          </div>
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
            {place.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
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

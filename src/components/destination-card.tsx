'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  image: string;
  'data-ai-hint': string;
  rating: number;
  reviews: number;
  type: 'contributor' | 'partner' | 'verified';
}

interface DestinationCardProps {
  readonly destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const renderBadge = () => {
    // Chỉ có Contributor và Partner mới có thể đăng địa điểm
    // Traveler chỉ có thể đề xuất, không đăng bài
    // Verified là Admin gán thêm cho địa điểm đặc biệt quan trọng
    
    const badgeContent = {
      contributor: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 96 96" className="inline-block">
            <defs>
              <linearGradient id="grad-contributor-dest" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#21C1C5"/>
                <stop offset="100%" stopColor="#2178F5"/>
              </linearGradient>
            </defs>
            <path d="M38 62 L32 88 L48 78 L64 88 L58 62 Z" fill="#1F6DE8" opacity="0.85"/>
            <path d="M38 62 L48 72 L58 62 Z" fill="#FFFFFF" opacity="0.15"/>
            <circle cx="48" cy="40" r="28" fill="url(#grad-contributor-dest)"/>
            <circle cx="48" cy="40" r="28" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2"/>
            <path d="M36 41 L45 50 L63 32" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
            <g transform="translate(68,22)" fill="#FFFFFF">
              <circle cx="4" cy="4" r="2" opacity="0.95"/>
              <path d="M4 0 L4 8 M0 4 L8 4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
            </g>
          </svg>
        ),
        label: 'Cộng tác viên',
        className: 'bg-white/90 backdrop-blur border border-white/20 shadow-lg',
      },
      partner: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 108 108" className="inline-block">
            <defs>
              <linearGradient id="grad-medal-dest" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#DC2626"/>
                <stop offset="100%" stopColor="#991B1B"/>
              </linearGradient>
            </defs>
            <path d="M42 70 L36 96 L54 84 L72 96 L66 70 Z" fill="#FFD700" opacity="0.9"/>
            <circle cx="54" cy="44" r="28" fill="url(#grad-medal-dest)" stroke="#FFD700" strokeWidth="3"/>
            <polygon points="54,28 58,40 70,40 60,48 64,60 54,52 44,60 48,48 38,40 50,40" fill="#FFD700"/>
            <circle cx="72" cy="28" r="10" fill="white" stroke="#FFD700" strokeWidth="2"/>
            <path d="M68 28 L71 31 L76 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        label: 'Đối tác cộng đồng',
        className: 'bg-white/90 backdrop-blur border border-white/20 shadow-lg',
      },
      verified: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 120 120" className="inline-block">
            <defs>
              <linearGradient id="goldA-dest" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFD700"/>
                <stop offset="100%" stopColor="#B8860B"/>
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="50" fill="url(#goldA-dest)" stroke="#FFF8DC" strokeWidth="3"/>
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
        ),
        label: 'Đã xác thực đặc biệt',
        className: 'bg-white/90 backdrop-blur border border-white/20 shadow-lg',
      },
    };

    const badge = badgeContent[destination.type];

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('absolute top-4 right-4 rounded-full p-2.5 transition-colors scale-110', badge.className)}>
              {badge.icon}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{badge.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="glass-card overflow-hidden flex flex-col h-full motion-gentle hover:scale-105 hover:shadow-2xl touch-target-44">
      <Link href={`/places/${destination.id}`} className="block">
        <CardHeader className="p-0 relative cursor-pointer">
          <div className="relative h-48 sm:h-56 w-full bg-surface">
          {/* Loading skeleton */}
          {isImageLoading && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-border to-surface animate-pulse" />
          )}
          
          {/* Error fallback */}
          {imageError ? (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <div className="text-center space-y-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-muted mx-auto"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21"/>
                </svg>
                <p className="text-sm text-muted">Hình ảnh không khả dụng</p>
              </div>
            </div>
          ) : (
            <Image
              src={destination.image}
              alt={`${destination.name} - ${destination.location}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover motion-gentle",
                isImageLoading ? "opacity-0" : "opacity-100"
              )}
              data-ai-hint={destination['data-ai-hint']}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setImageError(true);
                setIsImageLoading(false);
              }}
              priority={destination.id <= 3} // Load first 3 images with priority
            />
          )}
          
          {/* Elegant gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        {renderBadge()}
      </CardHeader>
      </Link>
      <Link href={`/places/${destination.id}`} className="block flex-grow">
        <CardContent className="pt-4 sm:pt-6 flex-grow space-y-3 sm:space-y-4 px-4 sm:px-6 cursor-pointer">
          <div className="space-y-2">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors">
              {destination.name}
            </CardTitle>
            <CardDescription className="text-muted text-sm sm:text-base lg:text-lg flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-primary flex-shrink-0 sm:w-4 sm:h-4"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span className="line-clamp-1">{destination.location}</span>
          </CardDescription>
        </div>
        <p className="text-muted leading-relaxed text-sm sm:text-base line-clamp-3">
          {destination.description}
        </p>
      </CardContent>
      </Link>
      
      <CardFooter className="glass-subtle border-t border-border/50 flex justify-between items-center p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#0891B2" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            <span className="font-bold text-primary text-sm sm:text-base">{destination.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs sm:text-sm text-muted">({destination.reviews.toLocaleString()} đánh giá)</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSaved(!isSaved)}
          className={cn(
            "glass-subtle motion-gentle hover:scale-105 p-2 rounded-lg touch-target-44",
            isSaved 
              ? "text-danger hover:text-danger" 
              : "text-muted hover:text-primary"
          )}
          aria-label={isSaved ? "Bỏ lưu địa điểm" : "Lưu địa điểm"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill={isSaved ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-200 sm:w-5 sm:h-5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
}

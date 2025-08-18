'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Heart, ShieldCheck, Star } from 'lucide-react';

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

  const renderBadge = () => {
    // Chỉ có Contributor và Partner mới có thể đăng địa điểm
    // Traveler chỉ có thể đề xuất, không đăng bài
    // Verified là Admin gán thêm cho địa điểm đặc biệt quan trọng
    
    const badgeContent = {
      contributor: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 96 96" className="inline-block">
            <defs>
              <linearGradient id="grad-contributor-card" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#21C1C5"/>
                <stop offset="100%" stopColor="#2178F5"/>
              </linearGradient>
            </defs>
            {/* Ribbons */}
            <path d="M38 62 L32 88 L48 78 L64 88 L58 62 Z" fill="#1F6DE8" opacity="0.85"/>
            <path d="M38 62 L48 72 L58 62 Z" fill="#FFFFFF" opacity="0.15"/>
            {/* Medal circle */}
            <circle cx="48" cy="40" r="28" fill="url(#grad-contributor-card)"/>
            <circle cx="48" cy="40" r="28" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2"/>
            {/* Check */}
            <path d="M36 41 L45 50 L63 32" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Sparkle */}
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
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 108 108" className="inline-block">
            <defs>
              <linearGradient id="grad-medal-card" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#DC2626"/>
                <stop offset="100%" stopColor="#991B1B"/>
              </linearGradient>
            </defs>
            {/* Ribbon */}
            <path d="M42 70 L36 96 L54 84 L72 96 L66 70 Z" fill="#FFD700" opacity="0.9"/>
            {/* Medal */}
            <circle cx="54" cy="44" r="28" fill="url(#grad-medal-card)" stroke="#FFD700" strokeWidth="3"/>
            {/* Star (main symbol) */}
            <polygon points="54,28 58,40 70,40 60,48 64,60 54,52 44,60 48,48 38,40 50,40" fill="#FFD700"/>
            {/* Small check on top-right */}
            <circle cx="72" cy="28" r="10" fill="white" stroke="#FFD700" strokeWidth="2"/>
            <path d="M68 28 L71 31 L76 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        label: 'Đối tác cộng đồng',
        className: 'bg-white/90 backdrop-blur border border-white/20 shadow-lg',
      },
      verified: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 120 120" className="inline-block">
            <defs>
              <linearGradient id="goldA-card" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFD700"/>
                <stop offset="100%" stopColor="#B8860B"/>
              </linearGradient>
            </defs>
            {/* Medal */}
            <circle cx="60" cy="60" r="50" fill="url(#goldA-card)" stroke="#FFF8DC" strokeWidth="3"/>
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
            <div className={cn('absolute top-3 right-3 rounded-full p-2.5 transition-colors', badge.className)}>
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
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <div className="relative h-56 w-full">
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={destination['data-ai-hint']}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        {renderBadge()}
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <CardTitle className="font-headline text-2xl mb-1">{destination.name}</CardTitle>
        <CardDescription className="text-foreground/70">{destination.location}</CardDescription>
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">
          {destination.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 text-accent fill-accent" />
          <span className="font-bold">{destination.rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({destination.reviews})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSaved(!isSaved)}
          aria-label={isSaved ? 'Unsave destination' : 'Save destination'}
        >
          <Heart
            className={cn('w-6 h-6', isSaved ? 'text-red-500 fill-red-500' : 'text-muted-foreground')}
          />
        </Button>
      </CardFooter>
    </Card>
  );
}

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Award, Heart, ShieldCheck, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
  type: 'default' | 'verified' | 'partner';
}

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const renderBadge = () => {
    if (destination.type === 'default') return null;

    const badgeContent = {
      verified: {
        icon: <ShieldCheck className="h-4 w-4 text-blue-500" />,
        label: 'Cộng tác viên đã được xác minh',
        className: 'bg-blue-100 text-blue-800',
      },
      partner: {
        icon: <Award className="h-4 w-4 text-amber-500" />,
        label: 'Đối tác cộng đồng',
        className: 'bg-amber-100 text-amber-800',
      },
    };

    const badge = badgeContent[destination.type];

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-3 h-7 text-sm font-medium transition-colors border-0', badge.className)}>
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
          size="icon"
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

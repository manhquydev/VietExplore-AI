// src/components/realtime/ViewersIndicator.tsx
'use client';

import { useItineraryViewers, useItineraryViewerManager } from '@/hooks/usePresence';
import { Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface ViewersIndicatorProps {
  itineraryId: string;
  className?: string;
}

export default function ViewersIndicator({ itineraryId, className = '' }: ViewersIndicatorProps) {
  const { user } = useAuth();
  const { viewersCount, loading } = useItineraryViewers(itineraryId);
  
  // Auto-manage viewer presence
  useItineraryViewerManager(itineraryId, user?.uid || '');

  if (loading) {
    return (
      <div className={`flex items-center space-x-1 text-gray-500 ${className}`}>
        <Eye className="w-4 h-4" />
        <span className="text-sm">...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 text-gray-600 ${className}`}>
      <Eye className="w-4 h-4" />
      <span className="text-sm">
        {viewersCount === 0 ? 'No viewers' : 
         viewersCount === 1 ? '1 viewer' : 
         `${viewersCount} viewers`}
      </span>
    </div>
  );
}

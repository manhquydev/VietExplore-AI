// src/components/providers/PresenceProvider.tsx
'use client';

import { useEffect } from 'react';
import { initializePresence } from '@/lib/presence';

export default function PresenceProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('🔄 Initializing presence system...');
    const unsubscribe = initializePresence();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return <>{children}</>;
}

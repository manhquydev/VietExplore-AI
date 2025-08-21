// src/components/realtime/ModeratorActivityIndicator.tsx
'use client';

import { useModeratorActivity } from '@/hooks/usePresence';
import { User, MessageCircle } from 'lucide-react';

export default function ModeratorActivityIndicator() {
  const { activities, loading } = useModeratorActivity();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Moderator Activity</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const activeModerators = Object.entries(activities).filter(([_, activity]) => 
    activity && activity.requestId
  );

  if (activeModerators.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Moderator Activity</h3>
        <p className="text-sm text-gray-500">No moderators currently active</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <User className="w-4 h-4 mr-1" />
        Active Moderators ({activeModerators.length})
      </h3>
      
      <div className="space-y-2">
        {activeModerators.map(([modUid, activity]) => (
          <div key={modUid} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">
                Mod {modUid.slice(-6)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <span>Request #{activity.requestId?.slice(-6)}</span>
              {activity.typing && (
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>typing...</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

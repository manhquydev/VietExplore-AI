// src/hooks/usePresence.ts
import { useState, useEffect } from 'react';
import { 
  subscribeToModerationQueue, 
  subscribeToQueueSummary,
  subscribeToViewersCount,
  subscribeToModeratorActivity,
  ModeratorActivity,
  ItineraryViewers
} from '@/lib/presence';

// Hook for moderation queue
export function useModerationQueue(priority: 'high' | 'normal' = 'high') {
  const [requestIds, setRequestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToModerationQueue(priority, (ids) => {
      setRequestIds(ids);
      setLoading(false);
    });

    return unsubscribe;
  }, [priority]);

  return { requestIds, loading };
}

// Hook for queue summary
export function useQueueSummary() {
  const [summary, setSummary] = useState({
    totalQueued: 0,
    highPriority: 0,
    overdue: 0,
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToQueueSummary((newSummary) => {
      setSummary(newSummary);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { summary, loading };
}

// Hook for itinerary viewers
export function useItineraryViewers(itineraryId: string) {
  const [viewersCount, setViewersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itineraryId) return;

    setLoading(true);
    const unsubscribe = subscribeToViewersCount(itineraryId, (count) => {
      setViewersCount(count);
      setLoading(false);
    });

    return unsubscribe;
  }, [itineraryId]);

  return { viewersCount, loading };
}

// Hook for moderator activity
export function useModeratorActivity() {
  const [activities, setActivities] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToModeratorActivity((newActivities) => {
      setActivities(newActivities);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { activities, loading };
}

// Hook for moderator activity management
export function useModeratorActivityManager(modUid: string) {
  const [moderatorActivity, setModeratorActivity] = useState<ModeratorActivity | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (modUid) {
      setModeratorActivity(new ModeratorActivity(modUid));
    }
  }, [modUid]);

  const enterReview = async (requestId: string) => {
    if (moderatorActivity) {
      await moderatorActivity.enterReview(requestId);
      setCurrentRequestId(requestId);
    }
  };

  const exitReview = async () => {
    if (moderatorActivity) {
      await moderatorActivity.exitReview();
      setCurrentRequestId(null);
      setIsTyping(false);
    }
  };

  const setTyping = async (typing: boolean) => {
    if (moderatorActivity) {
      await moderatorActivity.setTyping(typing);
      setIsTyping(typing);
    }
  };

  return {
    enterReview,
    exitReview,
    setTyping,
    currentRequestId,
    isTyping
  };
}

// Hook for itinerary viewer management
export function useItineraryViewerManager(itineraryId: string, uid: string) {
  const [itineraryViewer, setItineraryViewer] = useState<ItineraryViewers | null>(null);
  const [isViewing, setIsViewing] = useState(false);

  useEffect(() => {
    if (itineraryId && uid) {
      setItineraryViewer(new ItineraryViewers(itineraryId, uid));
    }
  }, [itineraryId, uid]);

  const enter = async () => {
    if (itineraryViewer) {
      await itineraryViewer.enter();
      setIsViewing(true);
    }
  };

  const exit = async () => {
    if (itineraryViewer) {
      await itineraryViewer.exit();
      setIsViewing(false);
    }
  };

  // Auto-enter when component mounts, auto-exit when unmounts
  useEffect(() => {
    if (itineraryViewer) {
      enter();
      return () => {
        exit();
      };
    }
  }, [itineraryViewer]);

  return {
    enter,
    exit,
    isViewing
  };
}

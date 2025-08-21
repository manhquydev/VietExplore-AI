// src/lib/presence.ts
import { ref, onDisconnect, set, serverTimestamp, onValue, off } from 'firebase/database';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, rtdb } from './firebase';

// User presence management (disabled in development)
export function initializePresence() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Presence system disabled in development');
    return () => {}; // Return empty unsubscribe function
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // User signed out, cleanup handled by onDisconnect
      return;
    }

    try {
      const idTokenResult = await user.getIdTokenResult();
      const userRole = idTokenResult.claims.role || 'traveler';
      
      const statusRef = ref(rtdb, `status/${user.uid}`);
      
      // Set user as online
      await set(statusRef, {
        state: 'online',
        lastSeen: serverTimestamp(),
        role: userRole
      });

      // Set up disconnect handler
      await onDisconnect(statusRef).set({
        state: 'offline',
        lastSeen: serverTimestamp(),
        role: userRole
      });

      console.log('Presence initialized for user:', user.uid);
    } catch (error) {
      console.error('Error setting up presence:', error);
    }
  });
}

// Moderator activity tracking
export class ModeratorActivity {
  private modUid: string;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(modUid: string) {
    this.modUid = modUid;
  }

  async enterReview(requestId: string) {
    const activeRef = ref(rtdb, `moderation/active/${this.modUid}`);
    
    try {
      await set(activeRef, {
        requestId,
        typing: false,
        heartbeat: serverTimestamp()
      });

      // Set up disconnect cleanup
      await onDisconnect(activeRef).remove();

      // Start heartbeat (every 30 seconds)
      this.startHeartbeat();

      console.log(`Moderator ${this.modUid} entered review for request ${requestId}`);
    } catch (error) {
      console.error('Error entering review:', error);
    }
  }

  async exitReview() {
    const activeRef = ref(rtdb, `moderation/active/${this.modUid}`);
    
    try {
      await set(activeRef, null);
      this.stopHeartbeat();
      console.log(`Moderator ${this.modUid} exited review`);
    } catch (error) {
      console.error('Error exiting review:', error);
    }
  }

  async setTyping(typing: boolean) {
    const typingRef = ref(rtdb, `moderation/active/${this.modUid}/typing`);
    
    try {
      await set(typingRef, typing);
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      const heartbeatRef = ref(rtdb, `moderation/active/${this.modUid}/heartbeat`);
      try {
        await set(heartbeatRef, serverTimestamp());
      } catch (error) {
        console.error('Error updating heartbeat:', error);
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }
}

// Itinerary viewers tracking
export class ItineraryViewers {
  private itineraryId: string;
  private uid: string;
  private viewerRef: any;

  constructor(itineraryId: string, uid: string) {
    this.itineraryId = itineraryId;
    this.uid = uid;
    this.viewerRef = ref(rtdb, `itineraries/live/${itineraryId}/viewers/${uid}`);
  }

  async enter() {
    try {
      await set(this.viewerRef, serverTimestamp());
      await onDisconnect(this.viewerRef).remove();
      console.log(`User ${this.uid} entered itinerary ${this.itineraryId}`);
    } catch (error) {
      console.error('Error entering itinerary:', error);
    }
  }

  async exit() {
    try {
      await set(this.viewerRef, null);
      console.log(`User ${this.uid} exited itinerary ${this.itineraryId}`);
    } catch (error) {
      console.error('Error exiting itinerary:', error);
    }
  }
}

// Queue monitoring for moderators
export function subscribeToModerationQueue(
  priority: 'high' | 'normal',
  callback: (requestIds: string[]) => void
) {
  const queueRef = ref(rtdb, `moderation/queueIndex/priority-${priority}`);
  
  const unsubscribe = onValue(queueRef, (snapshot) => {
    const data = snapshot.val();
    const requestIds = data ? Object.keys(data) : [];
    callback(requestIds);
  });

  return unsubscribe;
}

// Queue summary monitoring
export function subscribeToQueueSummary(callback: (summary: any) => void) {
  const summaryRef = ref(rtdb, `moderation/queueSummary`);
  
  const unsubscribe = onValue(summaryRef, (snapshot) => {
    const summary = snapshot.val() || {
      totalQueued: 0,
      highPriority: 0,
      overdue: 0,
      updatedAt: null
    };
    callback(summary);
  });

  return unsubscribe;
}

// Viewers count monitoring
export function subscribeToViewersCount(
  itineraryId: string,
  callback: (count: number) => void
) {
  const viewersRef = ref(rtdb, `itineraries/live/${itineraryId}/viewers`);
  
  const unsubscribe = onValue(viewersRef, (snapshot) => {
    const viewers = snapshot.val();
    const count = viewers ? Object.keys(viewers).length : 0;
    callback(count);
  });

  return unsubscribe;
}

// Moderator activity monitoring
export function subscribeToModeratorActivity(callback: (activities: any) => void) {
  const activeRef = ref(rtdb, `moderation/active`);
  
  const unsubscribe = onValue(activeRef, (snapshot) => {
    const activities = snapshot.val() || {};
    callback(activities);
  });

  return unsubscribe;
}

// Cleanup function
export function cleanupPresence() {
  // This will be called when the app is closing
  // onDisconnect handlers will automatically trigger
}

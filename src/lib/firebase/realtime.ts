import { getDatabase, ref, set, get, onValue, off, push, serverTimestamp } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

const db = getDatabase(app);

export interface PlaceStats {
  likes: number;
  saves: number;
  views: number;
  lastUpdated: number;
}

export interface UserInteraction {
  placeId: string;
  userId: string;
  type: 'like' | 'save' | 'view';
  timestamp: number;
}

export class RealtimeService {
  static async updatePlaceStats(placeId: string, field: keyof PlaceStats, increment: number = 1) {
    const statsRef = ref(db, `places/${placeId}/stats`);
    
    try {
      const snapshot = await get(statsRef);
      const currentStats = snapshot.val() || { likes: 0, saves: 0, views: 0 };
      
      const newValue = Math.max(0, (currentStats[field] || 0) + increment);
      
      await set(ref(db, `places/${placeId}/stats/${field}`), newValue);
      await set(ref(db, `places/${placeId}/stats/lastUpdated`), serverTimestamp());
      
      return newValue;
    } catch (error) {
      console.error('Error updating place stats:', error);
      throw error;
    }
  }

  static async recordUserInteraction(userId: string, placeId: string, type: 'like' | 'save' | 'view') {
    const interactionRef = ref(db, `users/${userId}/interactions/${type}/${placeId}`);
    
    try {
      await set(interactionRef, {
        timestamp: serverTimestamp(),
        placeId
      });

      const recentRef = ref(db, `users/${userId}/recent_interactions`);
      await push(recentRef, {
        placeId,
        type,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error('Error recording user interaction:', error);
      throw error;
    }
  }

  static subscribeToPlaceStats(placeId: string, callback: (stats: PlaceStats) => void) {
    const statsRef = ref(db, `places/${placeId}/stats`);
    
    const unsubscribe = onValue(statsRef, (snapshot) => {
      const stats = snapshot.val() || { likes: 0, saves: 0, views: 0, lastUpdated: Date.now() };
      callback(stats);
    });

    return () => off(statsRef, 'value', unsubscribe);
  }

  static subscribeToUserInteractions(userId: string, type: 'like' | 'save', callback: (placeIds: string[]) => void) {
    const interactionsRef = ref(db, `users/${userId}/interactions/${type}`);
    
    const unsubscribe = onValue(interactionsRef, (snapshot) => {
      const interactions = snapshot.val() || {};
      const placeIds = Object.keys(interactions);
      callback(placeIds);
    });

    return () => off(interactionsRef, 'value', unsubscribe);
  }

  static async getPlaceStats(placeId: string): Promise<PlaceStats> {
    const statsRef = ref(db, `places/${placeId}/stats`);
    
    try {
      const snapshot = await get(statsRef);
      return snapshot.val() || { likes: 0, saves: 0, views: 0, lastUpdated: Date.now() };
    } catch (error) {
      console.error('Error getting place stats:', error);
      return { likes: 0, saves: 0, views: 0, lastUpdated: Date.now() };
    }
  }

  static async getUserInteractions(userId: string, type: 'like' | 'save'): Promise<string[]> {
    if (!userId) {
      return [];
    }
    
    const interactionsRef = ref(db, `users/${userId}/interactions/${type}`);
    
    try {
      const snapshot = await get(interactionsRef);
      const interactions = snapshot.val() || {};
      return Object.keys(interactions);
    } catch (error) {
      console.error('Error getting user interactions:', error);
      return [];
    }
  }

  static async removeUserInteraction(userId: string, placeId: string, type: 'like' | 'save') {
    const interactionRef = ref(db, `users/${userId}/interactions/${type}/${placeId}`);
    
    try {
      await set(interactionRef, null);
    } catch (error) {
      console.error('Error removing user interaction:', error);
      throw error;
    }
  }

  static async syncFirestoreToRealtime(placeId: string, firestoreStats: { likes: number; saves: number; views: number }) {
    const statsRef = ref(db, `places/${placeId}/stats`);
    
    try {
      await set(statsRef, {
        ...firestoreStats,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error syncing Firestore to Realtime:', error);
      throw error;
    }
  }
}

export default RealtimeService;
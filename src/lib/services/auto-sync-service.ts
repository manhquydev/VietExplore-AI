/**
 * Auto-Sync Service - Quản lý đồng bộ tự động giữa Firestore và Realtime Database
 * Loại bỏ hoàn toàn manual sync buttons trong admin panel
 */

import { RealtimeService } from '@/lib/firebase/realtime';
import { auth } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface SyncStats {
  places: number;
  users: number;
  moderation: number;
  lastSyncAt: number;
}

interface ConnectionStats {
  activeConnections: number;
  lastActivity: number;
  bandwidth: number;
}

export class AutoSyncService {
  private static instance: AutoSyncService;
  private isInitialized = false;
  private activeConnections = new Map<string, () => void>();
  private connectionPool = new Set<string>();
  private syncStats: SyncStats | null = null;

  private constructor() {}

  static getInstance(): AutoSyncService {
    if (!AutoSyncService.instance) {
      AutoSyncService.instance = new AutoSyncService();
    }
    return AutoSyncService.instance;
  }

  /**
   * Initialize auto-sync service cho admin users
   */
  async initialize(userId: string, userRole: string) {
    if (this.isInitialized) return;

    if (!['admin', 'moderator'].includes(userRole)) {
      console.log('Auto-sync only available for admin/moderator users');
      return;
    }

    console.log('🔄 Initializing Auto-Sync Service for', userRole);

    try {
      // Track admin connection
      await this.trackAdminConnection(userId);

      // Subscribe to all relevant real-time data
      await this.subscribeToAllData(userId, userRole);

      // Start connection optimization
      this.startConnectionOptimization();

      this.isInitialized = true;
      console.log('✅ Auto-Sync Service initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Auto-Sync Service:', error);
    }
  }

  /**
   * Subscribe to tất cả data cần thiết cho admin dashboard
   */
  private async subscribeToAllData(userId: string, userRole: string) {
    const subscriptions: Array<[string, () => void]> = [];

    // 1. Admin Dashboard Stats
    if (userRole === 'admin') {
      const adminStatsUnsub = RealtimeService.subscribe(
        'admin/dashboard/stats',
        (snapshot) => {
          const stats = snapshot.val();
          this.syncStats = stats;
          this.broadcastStatsUpdate('admin_dashboard', stats);
        }
      );
      subscriptions.push(['admin_dashboard_stats', adminStatsUnsub]);
    }

    // 2. Moderation Queue Updates
    const moderationUnsub = RealtimeService.subscribe(
      'moderation_queue_updates',
      (snapshot) => {
        const updates = snapshot.val() || {};
        this.broadcastStatsUpdate('moderation_queue', updates);
      }
    );
    subscriptions.push(['moderation_queue', moderationUnsub]);

    // 3. Place Stats (for analytics)
    const placeStatsUnsub = RealtimeService.subscribeToMultiplePaths(
      'places',
      (allPlaceStats) => {
        this.broadcastStatsUpdate('place_stats', allPlaceStats);
      }
    );
    subscriptions.push(['place_stats', placeStatsUnsub]);

    // 4. User Stats (for user management)
    if (userRole === 'admin') {
      const userStatsUnsub = RealtimeService.subscribeToMultiplePaths(
        'users',
        (allUserStats) => {
          this.broadcastStatsUpdate('user_stats', allUserStats);
        }
      );
      subscriptions.push(['user_stats', userStatsUnsub]);
    }

    // Store all subscriptions for cleanup
    subscriptions.forEach(([key, unsub]) => {
      this.activeConnections.set(key, unsub);
    });

    console.log(`📡 Subscribed to ${subscriptions.length} real-time data streams`);
  }

  /**
   * Track admin connection cho optimization
   */
  private async trackAdminConnection(userId: string) {
    try {
      await RealtimeService.updateData(`admin_connections/${userId}`, {
        connectedAt: Date.now(),
        userAgent: navigator.userAgent,
        page: window.location.pathname
      });

      // Cleanup on disconnect
      window.addEventListener('beforeunload', () => {
        RealtimeService.removeData(`admin_connections/${userId}`);
      });

    } catch (error) {
      console.error('Error tracking admin connection:', error);
    }
  }

  /**
   * Broadcast updates to all listening components
   */
  private broadcastStatsUpdate(type: string, data: any) {
    // Dispatch custom event cho components
    const event = new CustomEvent('auto-sync-update', {
      detail: { type, data, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  /**
   * Start connection optimization
   */
  private startConnectionOptimization() {
    // Monitor bandwidth usage
    setInterval(() => {
      this.optimizeConnections();
    }, 30000); // Every 30 seconds

    // Cleanup idle connections
    setInterval(() => {
      this.cleanupIdleConnections();
    }, 300000); // Every 5 minutes
  }

  /**
   * Optimize connections để reduce bandwidth
   */
  private optimizeConnections() {
    // Implementation for connection optimization
    const connectionCount = this.activeConnections.size;
    
    if (connectionCount > 10) {
      console.warn(`⚠️  High connection count: ${connectionCount}. Consider optimization.`);
    }

    // Log connection stats
    console.log(`📊 Active connections: ${connectionCount}`);
  }

  /**
   * Cleanup idle connections
   */
  private cleanupIdleConnections() {
    // Check for inactive tabs and cleanup connections
    if (document.hidden) {
      console.log('🔄 Page hidden, optimizing connections...');
      // Reduce connection frequency or pause non-critical subscriptions
    }
  }

  /**
   * Manual sync function (fallback only)
   * Chỉ dùng khi có vấn đề với auto-sync
   */
  async manualSync(): Promise<SyncStats> {
    try {
      console.log('🔄 Triggering manual sync (fallback)...');

      const manualSyncFunction = httpsCallable(functions, 'manualSyncStats');
      const result = await manualSyncFunction();

      const stats = result.data as { success: boolean; stats: SyncStats };
      
      if (stats.success) {
        console.log('✅ Manual sync completed:', stats.stats);
        return stats.stats;
      } else {
        throw new Error('Manual sync failed');
      }

    } catch (error) {
      console.error('❌ Manual sync error:', error);
      throw error;
    }
  }

  /**
   * Get current sync stats
   */
  getCurrentStats(): SyncStats | null {
    return this.syncStats;
  }

  /**
   * Check if service is healthy
   */
  isHealthy(): boolean {
    return this.isInitialized && this.activeConnections.size > 0;
  }

  /**
   * Cleanup all connections
   */
  cleanup() {
    console.log('🧹 Cleaning up Auto-Sync Service...');

    // Unsubscribe from all connections
    this.activeConnections.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });

    this.activeConnections.clear();
    this.connectionPool.clear();
    this.isInitialized = false;

    console.log('✅ Auto-Sync Service cleaned up');
  }

  /**
   * Get service status for debugging
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      activeConnections: this.activeConnections.size,
      connectionPool: this.connectionPool.size,
      currentStats: this.syncStats,
      healthy: this.isHealthy()
    };
  }
}

// Export singleton instance
export const autoSyncService = AutoSyncService.getInstance();
import { getDatabase, ref, set, get, onValue, off, push, serverTimestamp, update } from 'firebase/database';
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
  // ========================================
  // AUTO-SYNC SERVICE METHODS
  // ========================================

  /**
   * Subscribe to single path với callback
   */
  static subscribe(path: string, callback: (snapshot: any) => void): () => void {
    const dataRef = ref(db, path);
    const listener = onValue(dataRef, callback);
    
    // Return unsubscribe function
    return () => off(dataRef, 'value', listener);
  }

  /**
   * Subscribe to multiple paths efficiently (for place stats, user stats)
   */
  static subscribeToMultiplePaths(basePath: string, callback: (data: any) => void): () => void {
    const baseRef = ref(db, basePath);
    const listener = onValue(baseRef, (snapshot) => {
      const data = snapshot.val() || {};
      callback(data);
    });
    
    return () => off(baseRef, 'value', listener);
  }

  /**
   * Update data at path
   */
  static async updateData(path: string, data: any): Promise<void> {
    const dataRef = ref(db, path);
    await update(dataRef, data);
  }

  /**
   * Remove data at path
   */
  static async removeData(path: string): Promise<void> {
    const dataRef = ref(db, path);
    await set(dataRef, null);
  }

  /**
   * Set data at path
   */
  static async setData(path: string, data: any): Promise<void> {
    const dataRef = ref(db, path);
    await set(dataRef, data);
  }

  // ========================================
  // EXISTING METHODS (unchanged)
  // ========================================
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

  // Real-time notifications
  static async sendNotification(userId: string, notification: {
    type: 'like' | 'comment' | 'approval' | 'rejection' | 'system'
    title: string
    message: string
    actionUrl?: string
    metadata?: any
  }) {
    const notificationRef = push(ref(db, `notifications/${userId}`))
    
    try {
      await set(notificationRef, {
        ...notification,
        id: notificationRef.key,
        timestamp: serverTimestamp(),
        read: false
      })
      
      return notificationRef.key
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  static subscribeToNotifications(userId: string, callback: (notifications: any[]) => void) {
    const notificationsRef = ref(db, `notifications/${userId}`)
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notifications = snapshot.val() || {}
      const notificationsList = Object.entries(notifications)
        .map(([key, value]: [string, any]) => ({ id: key, ...value }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      callback(notificationsList)
    })

    return () => off(notificationsRef, 'value', unsubscribe)
  }

  static async markNotificationAsRead(userId: string, notificationId: string) {
    const notificationRef = ref(db, `notifications/${userId}/${notificationId}`)
    
    try {
      await update(ref(db, `notifications/${userId}/${notificationId}`), { read: true })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Live analytics for admin dashboard
  static async updateLiveAnalytics(data: {
    activeUsers?: number
    totalViews?: number
    totalLikes?: number
    totalPlaces?: number
  }) {
    const analyticsRef = ref(db, 'analytics/live')
    
    try {
      await set(analyticsRef, {
        ...data,
        lastUpdated: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating live analytics:', error)
      throw error
    }
  }

  static subscribeToLiveAnalytics(callback: (analytics: any) => void) {
    const analyticsRef = ref(db, 'analytics/live')
    
    const unsubscribe = onValue(analyticsRef, (snapshot) => {
      const analytics = snapshot.val() || {}
      callback(analytics)
    })

    return () => off(analyticsRef, 'value', unsubscribe)
  }

  // User activity tracking  
  static async trackUserActivity(userId: string, activity: {
    type: 'page_view' | 'place_view' | 'search' | 'interaction'
    page?: string
    placeId?: string
    query?: string
    action?: string
    metadata?: any
  }) {
    const activityRef = push(ref(db, `user_activity/${userId}`))
    
    try {
      await set(activityRef, {
        ...activity,
        timestamp: serverTimestamp(),
        sessionId: Date.now().toString() // Simple session tracking
      })
    } catch (error) {
      console.error('Error tracking user activity:', error)
      // Don't throw - activity tracking shouldn't break user experience
    }
  }

  static subscribeToActiveUsers(callback: (count: number) => void) {
    const activeUsersRef = ref(db, 'active_users')
    
    const unsubscribe = onValue(activeUsersRef, (snapshot) => {
      const activeUsers = snapshot.val() || {}
      // Count users active in last 10 minutes
      const now = Date.now()
      const tenMinutesAgo = now - (10 * 60 * 1000)
      
      const activeCount = Object.values(activeUsers).filter(
        (lastSeen: any) => lastSeen > tenMinutesAgo
      ).length
      
      callback(activeCount)
    })

    return () => off(activeUsersRef, 'value', unsubscribe)
  }

  static async updateUserPresence(userId: string) {
    if (!userId) return
    
    const userPresenceRef = ref(db, `active_users/${userId}`)
    
    try {
      await set(userPresenceRef, serverTimestamp())
    } catch (error) {
      console.error('Error updating user presence:', error)
    }
  }

  // Enhanced place stats with more metrics
  static async updateAdvancedPlaceStats(placeId: string, metrics: {
    views?: number
    likes?: number
    shares?: number
    timeSpent?: number // average time spent viewing
    bounceRate?: number // percentage of single-page sessions
  }) {
    const statsRef = ref(db, `places/${placeId}/advanced_stats`)
    
    try {
      const snapshot = await get(statsRef)
      const currentStats = snapshot.val() || {}
      
      const updatedStats = {
        ...currentStats,
        ...metrics,
        lastUpdated: serverTimestamp()
      }
      
      // Calculate running averages for time-based metrics
      if (metrics.timeSpent && currentStats.timeSpent) {
        const count = currentStats.viewCount || 1
        updatedStats.avgTimeSpent = ((currentStats.avgTimeSpent || 0) * count + metrics.timeSpent) / (count + 1)
      }
      
      await set(statsRef, updatedStats)
    } catch (error) {
      console.error('Error updating advanced place stats:', error)
      throw error
    }
  }

  // Reports management for admin dashboard
  static async updateReportStats(increment: number = 1) {
    const reportsStatsRef = ref(db, 'admin/moderation/reports_stats')
    
    try {
      const snapshot = await get(reportsStatsRef)
      const currentStats = snapshot.val() || { 
        pending: 0, 
        in_review: 0, 
        resolved: 0, 
        dismissed: 0, 
        total: 0 
      }
      
      const newTotal = Math.max(0, (currentStats.total || 0) + increment)
      const newPending = Math.max(0, (currentStats.pending || 0) + (increment > 0 ? increment : 0))
      
      await set(reportsStatsRef, {
        ...currentStats,
        pending: newPending,
        total: newTotal,
        lastUpdated: serverTimestamp()
      })
      
      return { pending: newPending, total: newTotal }
    } catch (error) {
      console.error('Error updating report stats:', error)
      throw error
    }
  }

  static async updateReportStatusStats(oldStatus: string, newStatus: string) {
    const reportsStatsRef = ref(db, 'admin/moderation/reports_stats')
    
    try {
      const snapshot = await get(reportsStatsRef)
      const currentStats = snapshot.val() || { 
        pending: 0, 
        in_review: 0, 
        resolved: 0, 
        dismissed: 0, 
        total: 0 
      }
      
      // Decrease old status count
      if (oldStatus && currentStats[oldStatus] > 0) {
        currentStats[oldStatus] = currentStats[oldStatus] - 1
      }
      
      // Increase new status count  
      if (newStatus) {
        currentStats[newStatus] = (currentStats[newStatus] || 0) + 1
      }
      
      await set(reportsStatsRef, {
        ...currentStats,
        lastUpdated: serverTimestamp()
      })
      
      return currentStats
    } catch (error) {
      console.error('Error updating report status stats:', error)
      throw error
    }
  }

  static subscribeToReportStats(callback: (stats: any) => void) {
    const reportsStatsRef = ref(db, 'admin/moderation/reports_stats')
    
    const unsubscribe = onValue(reportsStatsRef, (snapshot) => {
      const stats = snapshot.val() || { 
        pending: 0, 
        in_review: 0, 
        resolved: 0, 
        dismissed: 0, 
        total: 0,
        lastUpdated: Date.now()
      }
      callback(stats)
    })

    return () => off(reportsStatsRef, 'value', unsubscribe)
  }

  // Initialize report stats from Firestore (one-time sync)
  static async initializeReportStats() {
    try {
      // This would typically be called from a server function
      // For now, we'll set default values
      const reportsStatsRef = ref(db, 'admin/moderation/reports_stats')
      const snapshot = await get(reportsStatsRef)
      
      if (!snapshot.exists()) {
        await set(reportsStatsRef, {
          pending: 0,
          in_review: 0, 
          resolved: 0,
          dismissed: 0,
          total: 0,
          lastUpdated: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error initializing report stats:', error)
    }
  }

  // Audit Logs System with Real-time Updates
  static async logAuditAction(auditData: {
    action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'suspend' | 'restore' | 'transfer'
    actor: {
      id: string
      name: string
      role: string
      email?: string
    }
    target: {
      type: 'place' | 'user' | 'report' | 'system'
      id: string
      name: string
    }
    changes?: {
      field: string
      before: any
      after: any
    }[]
    metadata?: {
      reason?: string
      ip?: string
      userAgent?: string
      location?: string
    }
    severity?: 'low' | 'medium' | 'high' | 'critical'
  }) {
    const auditRef = push(ref(db, 'audit_logs'))
    
    try {
      const auditLog = {
        id: auditRef.key,
        timestamp: serverTimestamp(),
        ...auditData,
        severity: auditData.severity || this.getSeverityFromAction(auditData.action)
      }
      
      await set(auditRef, auditLog)
      
      // Also update daily stats
      const today = new Date().toISOString().split('T')[0]
      const dailyStatsRef = ref(db, `audit_stats/daily/${today}`)
      
      const dailySnapshot = await get(dailyStatsRef)
      const dailyStats = dailySnapshot.val() || { 
        total: 0, 
        byAction: {}, 
        bySeverity: {} 
      }
      
      dailyStats.total = (dailyStats.total || 0) + 1
      dailyStats.byAction[auditData.action] = (dailyStats.byAction[auditData.action] || 0) + 1
      dailyStats.bySeverity[auditLog.severity] = (dailyStats.bySeverity[auditLog.severity] || 0) + 1
      dailyStats.lastUpdated = serverTimestamp()
      
      await set(dailyStatsRef, dailyStats)
      
      return auditRef.key
    } catch (error) {
      console.error('Error logging audit action:', error)
      throw error
    }
  }
  
  static getSeverityFromAction(action: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'delete':
      case 'suspend':
        return 'critical'
      case 'reject':
      case 'transfer':
        return 'high'
      case 'approve':
      case 'update':
        return 'medium'
      default:
        return 'low'
    }
  }

  static subscribeToAuditLogs(filters: {
    limit?: number
    action?: string
    severity?: string
    targetType?: string
  } = {}, callback: (logs: any[]) => void) {
    let query = ref(db, 'audit_logs')
    
    const unsubscribe = onValue(query, (snapshot) => {
      const logs = snapshot.val() || {}
      let logsList = Object.entries(logs)
        .map(([key, value]: [string, any]) => ({ ...value, id: key }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      
      // Apply filters
      if (filters.action && filters.action !== 'all') {
        logsList = logsList.filter(log => log.action === filters.action)
      }
      if (filters.severity && filters.severity !== 'all') {
        logsList = logsList.filter(log => log.severity === filters.severity)
      }
      if (filters.targetType && filters.targetType !== 'all') {
        logsList = logsList.filter(log => log.target?.type === filters.targetType)
      }
      
      // Apply limit
      if (filters.limit) {
        logsList = logsList.slice(0, filters.limit)
      }
      
      callback(logsList)
    })

    return () => off(ref(db, 'audit_logs'), 'value', unsubscribe)
  }

  static subscribeToAuditStats(period: 'daily' | 'weekly' | 'monthly' = 'daily', callback: (stats: any) => void) {
    const today = new Date().toISOString().split('T')[0]
    const statsRef = ref(db, `audit_stats/${period}/${today}`)
    
    const unsubscribe = onValue(statsRef, (snapshot) => {
      const stats = snapshot.val() || { 
        total: 0, 
        byAction: {}, 
        bySeverity: {},
        lastUpdated: Date.now()
      }
      callback(stats)
    })

    return () => off(statsRef, 'value', unsubscribe)
  }

  static async getAuditLogsPage(options: {
    limit?: number
    startAfter?: string
    filters?: {
      action?: string
      severity?: string
      targetType?: string
      dateFrom?: string
      dateTo?: string
    }
  } = {}) {
    try {
      const logsRef = ref(db, 'audit_logs')
      const snapshot = await get(logsRef)
      const logs = snapshot.val() || {}
      
      let logsList = Object.entries(logs)
        .map(([key, value]: [string, any]) => ({ ...value, id: key }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      
      // Apply filters
      if (options.filters) {
        const { action, severity, targetType, dateFrom, dateTo } = options.filters
        
        if (action && action !== 'all') {
          logsList = logsList.filter(log => log.action === action)
        }
        if (severity && severity !== 'all') {
          logsList = logsList.filter(log => log.severity === severity)
        }
        if (targetType && targetType !== 'all') {
          logsList = logsList.filter(log => log.target?.type === targetType)
        }
        if (dateFrom) {
          const fromTimestamp = new Date(dateFrom).getTime()
          logsList = logsList.filter(log => (log.timestamp || 0) >= fromTimestamp)
        }
        if (dateTo) {
          const toTimestamp = new Date(dateTo).getTime()
          logsList = logsList.filter(log => (log.timestamp || 0) <= toTimestamp)
        }
      }
      
      // Apply pagination
      const limit = options.limit || 50
      const paginatedLogs = logsList.slice(0, limit)
      
      return {
        logs: paginatedLogs,
        hasMore: logsList.length > limit,
        total: logsList.length
      }
    } catch (error) {
      console.error('Error getting audit logs page:', error)
      throw error
    }
  }
}

export default RealtimeService;
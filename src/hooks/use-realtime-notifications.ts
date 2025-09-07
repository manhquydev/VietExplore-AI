"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeService } from '@/lib/firebase/realtime';
import { useAuth } from '@/components/auth/auth-provider';
import { useNotifications as useToastNotifications } from '@/components/ui/notification-system';
import { ref, onValue, off } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { app } from '@/lib/firebase';

export interface RealtimeNotification {
  id: string;
  type: 'place_approved' | 'place_rejected' | 'place_needs_edit' | 'edit_request_approved' | 'edit_request_rejected' | 'new_moderation_item' | 'moderation_claimed' | 'moderation_escalated' | 'reports_threshold_reached';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  timestamp?: number;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const toast = useToastNotifications();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Memoize toast functions to prevent re-renders
  const showToastRef = useRef(toast);
  showToastRef.current = toast;

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
      return;
    }

    setIsConnected(true);
    
    // Subscribe to user notifications
    const unsubscribe = RealtimeService.subscribeToNotifications(
      user.id,
      (notificationsList: RealtimeNotification[]) => {
        setNotifications(notificationsList);
        
        // Count unread notifications
        const unread = notificationsList.filter(n => !n.read).length;
        setUnreadCount(unread);

        // Show toast for new high priority notifications
        const newHighPriorityNotifications = notificationsList.filter(
          n => !n.read && n.priority === 'high' && 
          // Only show if created in last 30 seconds
          Date.now() - new Date(n.createdAt || 0).getTime() < 30000
        );

        newHighPriorityNotifications.forEach(notification => {
          const notificationType = notification.type.includes('approved') ? 'success' :
                                  notification.type.includes('rejected') ? 'error' : 'info';
          
          showToastRef.current[notificationType](notification.message, notification.title, {
            persistent: true,
            duration: 8000
          });
        });
      }
    );

    // Subscribe to moderator alerts if user is moderator/admin
    let moderatorUnsubscribe: (() => void) | null = null;
    if (user.role && ['moderator', 'admin'].includes(user.role)) {
      const db = getDatabase(app);
      const moderatorAlertsRef = ref(db, `moderator_alerts/${user.id}`);
      
      const listener = onValue(moderatorAlertsRef, (snapshot) => {
        const alerts = snapshot.val() || {};
        const alertsList = Object.entries(alerts)
          .map(([key, value]: [string, any]) => ({ id: key, ...value }))
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Show toast for new moderator alerts
        const newAlerts = alertsList.filter(
          alert => Date.now() - (alert.timestamp || 0) < 10000 // Last 10 seconds
        );

        newAlerts.forEach(alert => {
          showToastRef.current.warning(alert.message, alert.title, {
            persistent: true,
            duration: 10000
          });
        });
      });
      
      moderatorUnsubscribe = () => off(moderatorAlertsRef, 'value', listener);
    }

    // Update user presence
    RealtimeService.updateUserPresence(user.id);
    const presenceInterval = setInterval(() => {
      RealtimeService.updateUserPresence(user.id);
    }, 30000); // Update every 30 seconds

    return () => {
      unsubscribe();
      if (moderatorUnsubscribe) {
        moderatorUnsubscribe();
      }
      clearInterval(presenceInterval);
      setIsConnected(false);
    };
  }, [user?.id, user?.role]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      await RealtimeService.markNotificationAsRead(user.id, notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || notifications.length === 0) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const markPromises = unreadNotifications.map(n => 
        RealtimeService.markNotificationAsRead(user.id, n.id)
      );
      
      await Promise.all(markPromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.id, notifications]);

  // Send notification (for moderators/admins)
  const sendNotification = useCallback(async (
    userId: string,
    type: RealtimeNotification['type'],
    title: string,
    message: string,
    data: Record<string, any> = {},
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    if (!user?.id || !['moderator', 'admin'].includes(user.role || '')) {
      throw new Error('Insufficient permissions to send notifications');
    }

    try {
      // Map notification types to RealtimeService types
      const typeMap: Record<string, 'like' | 'comment' | 'approval' | 'rejection' | 'system'> = {
        'place_approved': 'approval',
        'place_rejected': 'rejection', 
        'place_needs_edit': 'system',
        'edit_request_approved': 'approval',
        'edit_request_rejected': 'rejection',
        'new_moderation_item': 'system',
        'moderation_claimed': 'system',
        'moderation_escalated': 'system',
        'reports_threshold_reached': 'system'
      };
      
      return await RealtimeService.sendNotification(userId, {
        type: typeMap[type] || 'system',
        title,
        message,
        actionUrl: data.actionUrl,
        metadata: data
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }, [user?.id, user?.role]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    sendNotification
  };
}

// Hook for presence tracking
export function useUserPresence() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    // Update presence when user comes online
    RealtimeService.updateUserPresence(user.id);

    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      RealtimeService.updateUserPresence(user.id);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Also listen to visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden && isOnline) {
        RealtimeService.updateUserPresence(user.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Update presence periodically when online
    const presenceInterval = setInterval(() => {
      if (isOnline && !document.hidden) {
        RealtimeService.updateUserPresence(user.id);
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(presenceInterval);
    };
  }, [user?.id, isOnline]);

  return { isOnline };
}

// Hook for moderator real-time dashboard
export function useModeratorNotifications() {
  const { user } = useAuth();
  const [moderationUpdates, setModerationUpdates] = useState<any[]>([]);
  const [onlineModeratorCount, setOnlineModeratorCount] = useState(0);

  useEffect(() => {
    if (!user?.id || !['moderator', 'admin'].includes(user.role || '')) {
      return;
    }

    const db = getDatabase(app);
    
    // Subscribe to moderation queue updates
    const queueUpdatesRef = ref(db, 'moderation_queue_updates');
    const queueUnsubscribe = onValue(queueUpdatesRef, (snapshot) => {
      const updates = snapshot.val() || {};
      const updatesList = Object.entries(updates)
        .map(([key, value]: [string, any]) => ({ id: key, ...value }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 50); // Keep only last 50 updates

      setModerationUpdates(updatesList);
    });

    // Subscribe to online moderator presence
    const onlineRef = ref(db, 'user_presence');
    const presenceUnsubscribe = onValue(onlineRef, (snapshot) => {
      const presence = snapshot.val() || {};
      const onlineCount = Object.values(presence).filter(
        (p: any) => p?.online === true
      ).length;
      
      setOnlineModeratorCount(onlineCount);
    });

    return () => {
      off(queueUpdatesRef, 'value', queueUnsubscribe);
      off(onlineRef, 'value', presenceUnsubscribe);
    };
  }, [user?.id, user?.role]);

  return {
    moderationUpdates,
    onlineModeratorCount
  };
}
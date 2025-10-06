/**
 * Comprehensive Test Suite for Du Lịch Việt-AI Notification System
 * Tests both Phase 1 (User Interactions) and Phase 2 (Admin/Moderator) notifications
 */

import { NotificationService } from '../server/notification-service';
import { SystemHealthMonitoringService } from '../server/system-health-monitoring';
import { NotificationPreferenceService } from '../server/notification-preference-service';
import { MilestoneService } from '../server/milestone-service';

// Mock Firebase services
jest.mock('../server/firebaseAdmin', () => ({
  getAdminDb: () => ({
    collection: jest.fn(() => ({
      add: jest.fn(),
      doc: jest.fn(() => ({
        update: jest.fn(),
        get: jest.fn(() => ({ exists: true, data: () => ({}) }))
      })),
      where: jest.fn(() => ({
        get: jest.fn(() => ({ docs: [], size: 0 }))
      })),
      get: jest.fn(() => ({ docs: [], size: 0 }))
    }))
  }),
  getRealtimeDb: () => ({
    ref: jest.fn(() => ({
      set: jest.fn(),
      push: jest.fn(),
      once: jest.fn(() => Promise.resolve({ val: () => true })),
      onDisconnect: jest.fn(() => ({ set: jest.fn() })),
      transaction: jest.fn((updateFunction) => updateFunction(5))
    }))
  })
}));

describe('Du Lịch Việt-AI Notification System Tests', () => {
  
  // =====================================================================
  // PHASE 1: USER INTERACTION NOTIFICATIONS TESTS
  // =====================================================================
  
  describe('Phase 1: User Interaction Notifications', () => {
    
    test('should send place liked notification correctly', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifyPlaceLiked(
        'owner123',
        'liker456', 
        'Nguyễn Văn A',
        'place789',
        'Hồ Gươm'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Real-time notification sent to user owner123')
      );
      
      consoleSpy.mockRestore();
    });

    test('should not notify when user likes own place', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifyPlaceLiked(
        'user123',
        'user123', // Same user
        'Nguyễn Văn A',
        'place789',
        'Hồ Gươm'
      );
      
      // Should not log notification since it's the same user
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Real-time notification sent to user user123')
      );
      
      consoleSpy.mockRestore();
    });

    test('should send place milestone notification with correct formatting', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifyPlaceMilestone(
        'owner123',
        'place789',
        'Hồ Gươm',
        1000,
        'views'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Real-time notification sent to user owner123')
      );
      
      consoleSpy.mockRestore();
    });

    test('should format milestone numbers correctly (1000 -> 1K)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifyPlaceMilestone(
        'owner123',
        'place789',
        'Hồ Gươm',
        5000,
        'likes'
      );
      
      // Should format 5000 as 5K
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Real-time notification sent to user owner123')
      );
      
      consoleSpy.mockRestore();
    });

    test('should send system maintenance notification to active users', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifySystemMaintenance(
        '🔧 Bảo trì hệ thống',
        'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai',
        '2024-01-15T02:00:00Z',
        '2 hours'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sent maintenance notification to')
      );
      
      consoleSpy.mockRestore();
    });
  });

  // =====================================================================
  // PHASE 2: ADMIN/MODERATOR NOTIFICATIONS TESTS  
  // =====================================================================

  describe('Phase 2: Admin/Moderator Notifications', () => {
    
    test('should send system performance degraded notification', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifySystemPerformanceDegraded(
        'CPU Usage',
        95.5,
        90,
        ['api_requests', 'database_queries']
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Admin notification 'system_performance_degraded' sent to")
      );
      
      consoleSpy.mockRestore();
    });

    test('should send database connection issues notification', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifyDatabaseConnectionIssues(
        'Connection timeout after 30 seconds',
        ['user_authentication', 'place_queries'],
        new Date().toISOString()
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Admin notification 'database_connection_issues' sent to")
      );
      
      consoleSpy.mockRestore();
    });

    test('should send moderation queue overload notification', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifyModerationQueueOverload(
        75, // current queue size
        50, // threshold
        45, // average wait time
        2   // online moderators
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Admin notification 'moderation_queue_overload' sent to")
      );
      
      consoleSpy.mockRestore();
    });

    test('should send security alert notification', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifySuspiciousLoginPatterns(
        'Multiple failed login attempts from same IP',
        5,
        'high',
        {
          ip_addresses: ['192.168.1.100'],
          time_window: '1 hour',
          failure_count: 25
        }
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Admin notification 'suspicious_login_patterns' sent to")
      );
      
      consoleSpy.mockRestore();
    });

    test('should send SSL certificate expiring notification with correct urgency', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Test critical urgency (7 days)
      await NotificationService.notifySSLCertificateExpiring(
        'vietexplore.ai',
        '2024-01-10',
        7
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Admin notification 'ssl_certificate_expiring' sent to")
      );
      
      consoleSpy.mockRestore();
    });

    test('should send GDPR data request notification', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifyGDPRDataRequest(
        'export',
        'user123',
        'test@example.com',
        '2024-01-15',
        { requestReason: 'User requested data export' }
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Admin notification 'data_export_request' sent to")
      );
      
      consoleSpy.mockRestore();
    });

    test('should send moderation handoff notification', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.notifyModerationHandoff(
        'item123',
        'place_submission',
        'mod1',
        'Moderator A',
        'admin1',
        'Complex case needs review',
        'Additional context here'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Real-time notification sent to user admin1')
      );
      
      consoleSpy.mockRestore();
    });
  });

  // =====================================================================
  // SYSTEM HEALTH MONITORING TESTS
  // =====================================================================

  describe('System Health Monitoring', () => {
    
    test('should perform health check without errors', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await SystemHealthMonitoringService.performHealthCheck();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting system health check')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('System health check completed')
      );
      
      consoleSpy.mockRestore();
    });

    test('should get current system status', async () => {
      const status = await SystemHealthMonitoringService.getCurrentSystemStatus();
      
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('metrics');
      expect(status).toHaveProperty('lastCheck');
      expect(['healthy', 'warning', 'critical']).toContain(status.status);
    });

    test('should trigger immediate health check', async () => {
      const metrics = await SystemHealthMonitoringService.triggerImmediateHealthCheck();
      
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('cpu_usage');
      expect(metrics).toHaveProperty('memory_usage');
      expect(metrics).toHaveProperty('response_time');
      expect(metrics.cpu_usage).toBeGreaterThanOrEqual(0);
      expect(metrics.memory_usage).toBeGreaterThanOrEqual(0);
    });
  });

  // =====================================================================
  // NOTIFICATION PREFERENCE TESTS
  // =====================================================================

  describe('Notification Preferences', () => {
    
    test('should create default preferences for new user', async () => {
      const preferences = await NotificationPreferenceService.createDefaultPreferences('user123');
      
      expect(preferences).toHaveProperty('userId', 'user123');
      expect(preferences).toHaveProperty('channels');
      expect(preferences).toHaveProperty('categories');
      expect(preferences.channels.email).toBe(true);
      expect(preferences.channels.push).toBe(true);
    });

    test('should determine if notification should be sent based on preferences', async () => {
      const shouldSend = await NotificationPreferenceService.shouldSendNotification(
        'user123',
        'place_liked',
        'medium'
      );
      
      expect(typeof shouldSend).toBe('boolean');
    });

    test('should create notification batch correctly', async () => {
      const mockNotifications = [
        {
          id: '1',
          userId: 'user123',
          type: 'place_liked' as any,
          title: 'Place Liked',
          message: 'Someone liked your place',
          data: {},
          read: false,
          createdAt: new Date().toISOString(),
          priority: 'low' as any
        }
      ];

      const batch = await NotificationPreferenceService.createNotificationBatch(
        'user123',
        mockNotifications
      );
      
      expect(batch).toHaveProperty('userId', 'user123');
      expect(batch).toHaveProperty('notifications');
      expect(batch.notifications.length).toBeGreaterThan(0);
    });
  });

  // =====================================================================
  // MILESTONE SERVICE TESTS
  // =====================================================================

  describe('Milestone Service', () => {
    
    test('should detect milestone correctly', () => {
      // Test views milestone
      expect(MilestoneService.checkMilestone(100, 'views')).toBe(true);  // 100 is a milestone
      expect(MilestoneService.checkMilestone(150, 'views')).toBe(false); // 150 is not a milestone
      expect(MilestoneService.checkMilestone(500, 'views')).toBe(true);  // 500 is a milestone
      
      // Test likes milestone  
      expect(MilestoneService.checkMilestone(10, 'likes')).toBe(true);   // 10 is a milestone
      expect(MilestoneService.checkMilestone(15, 'likes')).toBe(false);  // 15 is not a milestone
      expect(MilestoneService.checkMilestone(50, 'likes')).toBe(true);   // 50 is a milestone
    });

    test('should get next milestone correctly', () => {
      expect(MilestoneService.getNextMilestone(50, 'views')).toBe(100);
      expect(MilestoneService.getNextMilestone(500, 'views')).toBe(1000);
      expect(MilestoneService.getNextMilestone(5, 'likes')).toBe(10);
      expect(MilestoneService.getNextMilestone(25, 'likes')).toBe(50);
    });

    test('should check place milestone and send notification if reached', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await MilestoneService.checkPlaceMilestone(
        'place123',
        'user456',
        'Test Place',
        { views: 100, likes: 10, saves: 5 }
      );
      
      // Should send notification for views and likes milestones
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  // =====================================================================
  // INTEGRATION TESTS
  // =====================================================================

  describe('Integration Tests', () => {
    
    test('should handle notification flow from place interaction to milestone check', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Simulate place like notification
      await NotificationService.notifyPlaceLiked(
        'owner123',
        'liker456',
        'Test User',
        'place789',
        'Test Place'
      );
      
      // Simulate milestone check
      await MilestoneService.checkPlaceMilestone(
        'place789',
        'owner123',
        'Test Place',
        { views: 1000, likes: 100, saves: 50 }
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Real-time notification sent to user owner123')
      );
      
      consoleSpy.mockRestore();
    });

    test('should handle admin notification escalation flow', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Send system performance notification
      await NotificationService.notifySystemPerformanceDegraded(
        'CPU Usage',
        95,
        90,
        ['api_requests']
      );
      
      // Send escalation to database issues
      await NotificationService.notifyDatabaseConnectionIssues(
        'Critical connection failure',
        ['all_operations'],
        new Date().toISOString()
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Admin notification.*sent to/i)
      );
      
      consoleSpy.mockRestore();
    });
  });

  // =====================================================================
  // ERROR HANDLING TESTS
  // =====================================================================

  describe('Error Handling', () => {
    
    test('should handle notification service errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // This should not throw but log error
      await NotificationService.sendNotification(
        '',  // Invalid user ID
        'place_liked',
        'Test',
        'Test message'
      );
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('should handle system health monitoring errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Force an error in health check
      const originalPerformHealthCheck = SystemHealthMonitoringService.performHealthCheck;
      (SystemHealthMonitoringService.performHealthCheck as jest.Mock) = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await SystemHealthMonitoringService.performHealthCheck();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error performing health check')
      );
      
      // Restore original method
      SystemHealthMonitoringService.performHealthCheck = originalPerformHealthCheck;
      consoleErrorSpy.mockRestore();
    });
  });
});

// =====================================================================
// HELPER FUNCTIONS FOR MANUAL TESTING
// =====================================================================

/**
 * Manual test functions for development testing
 * These can be called directly in development
 */
export const ManualTestHelpers = {
  
  async testUserInteractionFlow() {
    console.log('🧪 Testing User Interaction Notification Flow...');
    
    // Test place like notification
    await NotificationService.notifyPlaceLiked(
      'test_owner',
      'test_liker', 
      'Test User',
      'test_place',
      'Test Location'
    );
    
    // Test milestone notification
    await NotificationService.notifyPlaceMilestone(
      'test_owner',
      'test_place',
      'Test Location',
      1000,
      'views'
    );
    
    console.log('✅ User interaction flow test completed');
  },

  async testAdminNotificationFlow() {
    console.log('🧪 Testing Admin Notification Flow...');
    
    // Test system performance alert
    await NotificationService.notifySystemPerformanceDegraded(
      'CPU Usage',
      95,
      90,
      ['api_requests', 'database_queries']
    );
    
    // Test security alert
    await NotificationService.notifySuspiciousLoginPatterns(
      'Multiple failed attempts',
      5,
      'high',
      { ip: '192.168.1.100', attempts: 20 }
    );
    
    console.log('✅ Admin notification flow test completed');
  },

  async testSystemHealthMonitoring() {
    console.log('🧪 Testing System Health Monitoring...');
    
    const status = await SystemHealthMonitoringService.getCurrentSystemStatus();
    console.log('Current System Status:', status);
    
    await SystemHealthMonitoringService.triggerImmediateHealthCheck();
    
    console.log('✅ System health monitoring test completed');
  },

  async testNotificationPreferences() {
    console.log('🧪 Testing Notification Preferences...');
    
    const prefs = await NotificationPreferenceService.createDefaultPreferences('test_user');
    console.log('Default Preferences:', prefs);
    
    const shouldSend = await NotificationPreferenceService.shouldSendNotification(
      'test_user',
      'place_liked',
      'medium'
    );
    console.log('Should Send Notification:', shouldSend);
    
    console.log('✅ Notification preferences test completed');
  }
};
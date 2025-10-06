import { NotificationService } from './notification-service';
import { getAdminDb, getRealtimeDb } from './firebaseAdmin';
import * as admin from 'firebase-admin';

// System metrics interfaces
export interface SystemMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  response_time: number;
  error_rate: number;
  active_connections: number;
  database_latency: number;
  storage_usage: number;
}

export interface HealthThresholds {
  cpu_warning: number;
  cpu_critical: number;
  memory_warning: number;
  memory_critical: number;
  response_time_warning: number;
  response_time_critical: number;
  error_rate_warning: number;
  error_rate_critical: number;
  database_latency_warning: number;
  database_latency_critical: number;
  storage_warning: number;
  storage_critical: number;
}

export interface SecurityMetrics {
  failed_login_attempts: Record<string, number>;
  suspicious_ip_addresses: string[];
  unusual_activity_patterns: Array<{
    type: string;
    description: string;
    risk_level: 'low' | 'medium' | 'high';
    affected_users: number;
  }>;
}

/**
 * System Health Monitoring Service for Du Lịch Việt-AI
 * Proactively monitors system performance and triggers admin notifications
 */
export class SystemHealthMonitoringService {
  private static db = getAdminDb();
  private static realtimeDb = getRealtimeDb();

  // Default health thresholds
  private static readonly DEFAULT_THRESHOLDS: HealthThresholds = {
    cpu_warning: 75,
    cpu_critical: 90,
    memory_warning: 80,
    memory_critical: 95,
    response_time_warning: 1000, // ms
    response_time_critical: 3000,
    error_rate_warning: 5, // percentage
    error_rate_critical: 15,
    database_latency_warning: 500, // ms
    database_latency_critical: 2000,
    storage_warning: 80, // percentage
    storage_critical: 95
  };

  /**
   * Main health monitoring function - should be called periodically
   */
  static async performHealthCheck(): Promise<void> {
    try {
      console.log('🔍 Starting system health check...');
      
      const metrics = await this.collectSystemMetrics();
      const thresholds = await this.getHealthThresholds();
      
      // Store metrics for historical tracking
      await this.storeMetrics(metrics);
      
      // Check each metric against thresholds
      await this.checkPerformanceMetrics(metrics, thresholds);
      
      // Check Firebase-specific health
      await this.checkFirebaseHealth();
      
      // Check security patterns
      await this.checkSecurityPatterns();
      
      // Check business operations
      await this.checkBusinessOperations();
      
      // Update admin dashboard with current status
      await this.updateAdminDashboard(metrics);
      
      console.log('✅ System health check completed');
    } catch (error) {
      console.error('❌ Error performing health check:', error);
      
      // Send critical notification about monitoring failure
      await NotificationService.sendAdminNotification(
        'system_performance_degraded',
        '🚨 Lỗi giám sát hệ thống',
        'Hệ thống giám sát không thể thực hiện kiểm tra sức khỏe. Cần kiểm tra ngay lập tức.',
        { error: error.message }
      );
    }
  }

  /**
   * Collect current system metrics
   */
  private static async collectSystemMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date().toISOString();
    
    // Simulate metrics collection - in production, these would come from actual monitoring
    const metrics: SystemMetrics = {
      timestamp,
      cpu_usage: await this.getCPUUsage(),
      memory_usage: await this.getMemoryUsage(),
      response_time: await this.getAverageResponseTime(),
      error_rate: await this.getErrorRate(),
      active_connections: await this.getActiveConnections(),
      database_latency: await this.getDatabaseLatency(),
      storage_usage: await this.getStorageUsage()
    };

    return metrics;
  }

  /**
   * Check performance metrics against thresholds
   */
  private static async checkPerformanceMetrics(
    metrics: SystemMetrics, 
    thresholds: HealthThresholds
  ): Promise<void> {
    // CPU Usage Check
    if (metrics.cpu_usage >= thresholds.cpu_critical) {
      await NotificationService.notifySystemPerformanceDegraded(
        'CPU Usage',
        metrics.cpu_usage,
        thresholds.cpu_critical,
        ['api_requests', 'database_queries', 'image_processing']
      );
    } else if (metrics.cpu_usage >= thresholds.cpu_warning) {
      await NotificationService.sendAdminNotification(
        'system_performance_degraded',
        '⚠️ Cảnh báo CPU cao',
        `CPU sử dụng ${metrics.cpu_usage}% (ngưỡng cảnh báo: ${thresholds.cpu_warning}%)`,
        { metric: 'cpu_usage', value: metrics.cpu_usage, threshold: thresholds.cpu_warning }
      );
    }

    // Memory Usage Check
    if (metrics.memory_usage >= thresholds.memory_critical) {
      await NotificationService.sendAdminNotification(
        'server_memory_critical',
        '🚨 Bộ nhớ hệ thống cấp bách',
        `Bộ nhớ sử dụng ${metrics.memory_usage}% - cần can thiệp ngay lập tức`,
        { 
          metric: 'memory_usage', 
          value: metrics.memory_usage, 
          threshold: thresholds.memory_critical,
          actionRequired: 'restart_services_or_scale_up'
        }
      );
    }

    // Response Time Check
    if (metrics.response_time >= thresholds.response_time_critical) {
      await NotificationService.notifySystemPerformanceDegraded(
        'Response Time',
        metrics.response_time,
        thresholds.response_time_critical,
        ['api_endpoints', 'page_loads', 'search_queries']
      );
    }

    // Error Rate Check
    if (metrics.error_rate >= thresholds.error_rate_critical) {
      await NotificationService.sendAdminNotification(
        'api_rate_limit_exceeded',
        '🚨 Tỷ lệ lỗi cao bất thường',
        `Tỷ lệ lỗi: ${metrics.error_rate}% (ngưỡng: ${thresholds.error_rate_critical}%)`,
        {
          metric: 'error_rate',
          value: metrics.error_rate,
          threshold: thresholds.error_rate_critical,
          actionRequired: 'investigate_error_patterns'
        }
      );
    }

    // Database Latency Check
    if (metrics.database_latency >= thresholds.database_latency_critical) {
      await NotificationService.notifyDatabaseConnectionIssues(
        `Database latency: ${metrics.database_latency}ms`,
        ['user_queries', 'place_searches', 'authentication'],
        metrics.timestamp
      );
    }
  }

  /**
   * Check Firebase-specific health metrics
   */
  private static async checkFirebaseHealth(): Promise<void> {
    try {
      // Check Firestore connection
      const testQuery = await this.db.collection('system_health').limit(1).get();
      
      // Check Realtime Database connection  
      if (this.realtimeDb) {
        await this.realtimeDb.ref('health_check').set({
          timestamp: admin.database.ServerValue.TIMESTAMP,
          status: 'healthy'
        });
      }

      // Check Firebase Storage quota (simulated)
      const storageUsage = await this.getStorageUsage();
      if (storageUsage >= 90) {
        await NotificationService.notifyStorageQuotaWarning(
          storageUsage * 10, // GB (simulated)
          1000, // Total quota
          storageUsage,
          this.calculateProjectedFullDate(storageUsage)
        );
      }

    } catch (error) {
      await NotificationService.notifyDatabaseConnectionIssues(
        `Firebase connection error: ${error.message}`,
        ['authentication', 'data_persistence', 'real_time_updates'],
        new Date().toISOString()
      );
    }
  }

  /**
   * Monitor security patterns and anomalies
   */
  private static async checkSecurityPatterns(): Promise<void> {
    try {
      const securityMetrics = await this.collectSecurityMetrics();
      
      // Check for suspicious login patterns
      const suspiciousLogins = Object.entries(securityMetrics.failed_login_attempts)
        .filter(([_, count]) => count >= 10);
      
      if (suspiciousLogins.length > 0) {
        await NotificationService.notifySuspiciousLoginPatterns(
          'Multiple failed login attempts',
          suspiciousLogins.length,
          'high',
          {
            affected_ips: suspiciousLogins.map(([ip, count]) => ({ ip, count })),
            time_window: '1 hour',
            detection_threshold: 10
          }
        );
      }

      // Check for unusual activity patterns
      securityMetrics.unusual_activity_patterns.forEach(async (pattern) => {
        if (pattern.risk_level === 'high') {
          await NotificationService.sendAdminNotification(
            'suspicious_login_patterns',
            '⚠️ Hoạt động bất thường phát hiện',
            `${pattern.description} - Mức độ rủi ro: ${pattern.risk_level}`,
            {
              pattern_type: pattern.type,
              affected_users: pattern.affected_users,
              risk_level: pattern.risk_level
            }
          );
        }
      });

    } catch (error) {
      console.error('Error checking security patterns:', error);
    }
  }

  /**
   * Monitor business operations health
   */
  private static async checkBusinessOperations(): Promise<void> {
    try {
      // Check moderation queue size
      const moderationStats = await this.getModerationQueueStats();
      
      if (moderationStats.queueSize > 50) {
        const onlineModerators = await NotificationService.getOnlineModerators();
        
        await NotificationService.notifyModerationQueueOverload(
          moderationStats.queueSize,
          50, // threshold
          moderationStats.averageWaitTime,
          onlineModerators.length
        );
      }

      // Check for content volume spikes
      const contentStats = await this.getContentVolumeStats();
      if (contentStats.currentHourlyRate > contentStats.normalRate * 3) {
        await NotificationService.sendAdminNotification(
          'content_volume_spike',
          '📈 Tăng đột biến lượng nội dung',
          `Lượng nội dung mới: ${contentStats.currentHourlyRate}/giờ (bình thường: ${contentStats.normalRate}/giờ)`,
          {
            current_rate: contentStats.currentHourlyRate,
            normal_rate: contentStats.normalRate,
            spike_ratio: contentStats.currentHourlyRate / contentStats.normalRate
          }
        );
      }

      // Check for spam patterns
      const spamStats = await this.getSpamDetectionStats();
      if (spamStats.detectedCount > 20) {
        await NotificationService.notifySpamDetectionThreshold(
          'content',
          20,
          spamStats.detectedCount,
          '1 hour',
          spamStats.affectedItems
        );
      }

    } catch (error) {
      console.error('Error checking business operations:', error);
    }
  }

  /**
   * Update admin dashboard with real-time metrics
   */
  private static async updateAdminDashboard(metrics: SystemMetrics): Promise<void> {
    try {
      if (this.realtimeDb) {
        await this.realtimeDb.ref('admin_dashboard/system_health').set({
          current_status: this.determineSystemStatus(metrics),
          metrics: {
            cpu_usage: metrics.cpu_usage,
            memory_usage: metrics.memory_usage,
            response_time: metrics.response_time,
            error_rate: metrics.error_rate,
            database_latency: metrics.database_latency,
            storage_usage: metrics.storage_usage
          },
          last_updated: admin.database.ServerValue.TIMESTAMP,
          active_connections: metrics.active_connections
        });
      }
    } catch (error) {
      console.error('Error updating admin dashboard:', error);
    }
  }

  // Helper methods for metric collection (simulated for demo)
  private static async getCPUUsage(): Promise<number> {
    // Simulate CPU usage between 20-95%
    return Math.random() * 75 + 20;
  }

  private static async getMemoryUsage(): Promise<number> {
    // Simulate memory usage between 30-90%
    return Math.random() * 60 + 30;
  }

  private static async getAverageResponseTime(): Promise<number> {
    // Simulate response time between 200-2000ms
    return Math.random() * 1800 + 200;
  }

  private static async getErrorRate(): Promise<number> {
    // Simulate error rate between 0-10%
    return Math.random() * 10;
  }

  private static async getActiveConnections(): Promise<number> {
    // Simulate active connections between 50-500
    return Math.floor(Math.random() * 450 + 50);
  }

  private static async getDatabaseLatency(): Promise<number> {
    // Simulate database latency between 50-1000ms
    return Math.random() * 950 + 50;
  }

  private static async getStorageUsage(): Promise<number> {
    // Simulate storage usage between 40-95%
    return Math.random() * 55 + 40;
  }

  private static async getModerationQueueStats(): Promise<{queueSize: number, averageWaitTime: number}> {
    try {
      const queueQuery = await this.db.collection('moderation_queue')
        .where('status', '==', 'pending')
        .get();
      
      return {
        queueSize: queueQuery.size,
        averageWaitTime: 45 // Simulated average wait time in minutes
      };
    } catch (error) {
      return { queueSize: 0, averageWaitTime: 0 };
    }
  }

  private static async getContentVolumeStats(): Promise<{currentHourlyRate: number, normalRate: number}> {
    // Simulate content volume statistics
    return {
      currentHourlyRate: Math.floor(Math.random() * 100 + 10),
      normalRate: 25 // Normal hourly rate
    };
  }

  private static async getSpamDetectionStats(): Promise<{detectedCount: number, affectedItems: string[]}> {
    // Simulate spam detection statistics
    const detectedCount = Math.floor(Math.random() * 50);
    return {
      detectedCount,
      affectedItems: Array.from({length: detectedCount}, (_, i) => `item_${i + 1}`)
    };
  }

  private static async collectSecurityMetrics(): Promise<SecurityMetrics> {
    // Simulate security metrics collection
    return {
      failed_login_attempts: {
        '192.168.1.100': Math.floor(Math.random() * 15),
        '10.0.0.50': Math.floor(Math.random() * 20),
        '172.16.0.200': Math.floor(Math.random() * 8)
      },
      suspicious_ip_addresses: ['192.168.1.100', '10.0.0.50'],
      unusual_activity_patterns: [
        {
          type: 'rapid_account_creation',
          description: 'Phát hiện nhiều tài khoản được tạo từ cùng IP trong thời gian ngắn',
          risk_level: 'medium',
          affected_users: 5
        }
      ]
    };
  }

  private static async getHealthThresholds(): Promise<HealthThresholds> {
    try {
      // Try to get custom thresholds from database
      const thresholdsDoc = await this.db.collection('system_config')
        .doc('health_thresholds')
        .get();
      
      if (thresholdsDoc.exists) {
        return { ...this.DEFAULT_THRESHOLDS, ...thresholdsDoc.data() as Partial<HealthThresholds> };
      }
    } catch (error) {
      console.log('Using default health thresholds');
    }
    
    return this.DEFAULT_THRESHOLDS;
  }

  private static async storeMetrics(metrics: SystemMetrics): Promise<void> {
    try {
      await this.db.collection('system_metrics').add(metrics);
      
      // Keep only last 7 days of metrics
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const oldMetricsQuery = await this.db.collection('system_metrics')
        .where('timestamp', '<', weekAgo)
        .get();
      
      const batch = this.db.batch();
      oldMetricsQuery.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error('Error storing metrics:', error);
    }
  }

  private static determineSystemStatus(metrics: SystemMetrics): 'healthy' | 'warning' | 'critical' {
    const criticalConditions = [
      metrics.cpu_usage >= 90,
      metrics.memory_usage >= 95,
      metrics.response_time >= 3000,
      metrics.error_rate >= 15
    ];

    const warningConditions = [
      metrics.cpu_usage >= 75,
      metrics.memory_usage >= 80,
      metrics.response_time >= 1000,
      metrics.error_rate >= 5
    ];

    if (criticalConditions.some(condition => condition)) {
      return 'critical';
    } else if (warningConditions.some(condition => condition)) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  private static calculateProjectedFullDate(currentUsage: number): string {
    // Simple projection based on current usage
    const daysUntilFull = Math.ceil((100 - currentUsage) / 2); // Assuming 2% growth per day
    const projectedDate = new Date(Date.now() + daysUntilFull * 24 * 60 * 60 * 1000);
    return projectedDate.toLocaleDateString('vi-VN');
  }

  /**
   * Manual trigger for immediate health check (for testing)
   */
  static async triggerImmediateHealthCheck(): Promise<SystemMetrics> {
    const metrics = await this.collectSystemMetrics();
    await this.performHealthCheck();
    return metrics;
  }

  /**
   * Get current system status for admin dashboard
   */
  static async getCurrentSystemStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical',
    metrics: SystemMetrics,
    lastCheck: string
  }> {
    const metrics = await this.collectSystemMetrics();
    return {
      status: this.determineSystemStatus(metrics),
      metrics,
      lastCheck: new Date().toISOString()
    };
  }
}
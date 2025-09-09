import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { SystemHealthMonitoringService } from '@/lib/server/system-health-monitoring';
import { NotificationService } from '@/lib/server/notification-service';

/**
 * GET /api/admin/system/health
 * Get current system health status
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get current system status
    const systemStatus = await SystemHealthMonitoringService.getCurrentSystemStatus();
    
    return NextResponse.json({
      success: true,
      data: systemStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting system health:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/system/health
 * Trigger immediate health check or test admin notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, testType } = body;

    switch (action) {
      case 'health_check':
        // Trigger immediate health check
        const metrics = await SystemHealthMonitoringService.triggerImmediateHealthCheck();
        return NextResponse.json({
          success: true,
          message: 'Health check completed',
          data: metrics
        });

      case 'test_notification':
        // Test admin notifications
        await testAdminNotification(testType, authResult.user);
        return NextResponse.json({
          success: true,
          message: `Test notification '${testType}' sent successfully`
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "health_check" or "test_notification"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing admin system request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Test different types of admin notifications
 */
async function testAdminNotification(testType: string, admin: any) {
  const testData = {
    testMode: true,
    triggeredBy: admin.email,
    timestamp: new Date().toISOString()
  };

  switch (testType) {
    case 'system_performance':
      await NotificationService.notifySystemPerformanceDegraded(
        'Test CPU Usage',
        95.5,
        90,
        ['api_requests', 'database_queries']
      );
      break;

    case 'database_connection':
      await NotificationService.notifyDatabaseConnectionIssues(
        'Test database connection timeout',
        ['user_authentication', 'place_queries'],
        new Date().toISOString()
      );
      break;

    case 'moderation_queue':
      await NotificationService.notifyModerationQueueOverload(
        75, // current queue size
        50, // threshold
        45, // average wait time
        2   // online moderators
      );
      break;

    case 'security_alert':
      await NotificationService.notifySuspiciousLoginPatterns(
        'Multiple failed login attempts from same IP',
        5, // affected users
        'high',
        {
          ip_addresses: ['192.168.1.100', '10.0.0.50'],
          time_window: '1 hour',
          failure_count: 25
        }
      );
      break;

    case 'storage_warning':
      await NotificationService.notifyStorageQuotaWarning(
        850, // current usage GB
        1000, // total quota GB
        85, // usage percentage
        '2024-01-15' // projected full date
      );
      break;

    case 'ssl_certificate':
      await NotificationService.notifySSLCertificateExpiring(
        'vietexplore.ai',
        '2024-01-10',
        7 // days until expiry
      );
      break;

    case 'gdpr_request':
      await NotificationService.notifyGDPRDataRequest(
        'export',
        'test_user_id',
        'test@example.com',
        '2024-01-15',
        { requestReason: 'Testing GDPR compliance notification' }
      );
      break;

    case 'spam_detection':
      await NotificationService.notifySpamDetectionThreshold(
        'content',
        20, // threshold
        35, // current count
        '1 hour',
        ['place_001', 'place_002', 'review_123']
      );
      break;

    case 'moderation_handoff':
      await NotificationService.notifyModerationHandoff(
        'test_item_123',
        'place_submission',
        'moderator_1',
        'Nguyễn Văn A',
        admin.id,
        'Complex case requiring admin review',
        'This place submission has conflicting information and needs careful review'
      );
      break;

    default:
      // Send a general test notification
      await NotificationService.sendAdminNotification(
        'system_maintenance',
        '🧪 Test Admin Notification',
        'Đây là thông báo test để kiểm tra hệ thống admin notification. Không cần hành động.',
        testData
      );
  }
}
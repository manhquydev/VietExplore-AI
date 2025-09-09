import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { NotificationService } from '@/lib/server/notification-service';
import { SystemHealthMonitoringService } from '@/lib/server/system-health-monitoring';

/**
 * POST /api/admin/test-notifications
 * Comprehensive test endpoint for notification system validation
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
    const { testSuite } = body;

    const testResults: any = {
      timestamp: new Date().toISOString(),
      tester: authResult.user.email,
      results: []
    };

    switch (testSuite) {
      case 'phase1_user_interactions':
        testResults.results = await testPhase1UserInteractions(authResult.user);
        break;
        
      case 'phase2_admin_notifications':
        testResults.results = await testPhase2AdminNotifications(authResult.user);
        break;
        
      case 'system_health_monitoring':
        testResults.results = await testSystemHealthMonitoring();
        break;
        
      case 'comprehensive':
        testResults.results = await runComprehensiveTests(authResult.user);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid test suite. Use: phase1_user_interactions, phase2_admin_notifications, system_health_monitoring, or comprehensive' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Test suite '${testSuite}' completed`,
      data: testResults
    });

  } catch (error) {
    console.error('Error running notification tests:', error);
    return NextResponse.json(
      { error: 'Internal server error during testing' },
      { status: 500 }
    );
  }
}

/**
 * Test Phase 1: User Interaction Notifications
 */
async function testPhase1UserInteractions(admin: any): Promise<any[]> {
  const tests = [];
  
  try {
    // Test 1: Place Liked Notification
    await NotificationService.notifyPlaceLiked(
      admin.id,
      'test_user_123',
      'Test User',
      'test_place_456',
      'Test Location'
    );
    tests.push({
      test: 'Place Liked Notification',
      status: 'PASSED',
      message: 'Successfully sent place liked notification'
    });
  } catch (error) {
    tests.push({
      test: 'Place Liked Notification',
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 2: Place Milestone Notification
    await NotificationService.notifyPlaceMilestone(
      admin.id,
      'test_place_456',
      'Test Location',
      1000,
      'views'
    );
    tests.push({
      test: 'Place Milestone Notification',
      status: 'PASSED',
      message: 'Successfully sent milestone notification for 1K views'
    });
  } catch (error) {
    tests.push({
      test: 'Place Milestone Notification',
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 3: Place Published Notification
    await NotificationService.notifyPlacePublished(
      admin.id,
      'test_place_789',
      'New Test Place'
    );
    tests.push({
      test: 'Place Published Notification',
      status: 'PASSED',
      message: 'Successfully sent place published notification'
    });
  } catch (error) {
    tests.push({
      test: 'Place Published Notification', 
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 4: Place Review Posted Notification
    await NotificationService.notifyPlaceReviewPosted(
      admin.id,
      'reviewer_123',
      'Test Reviewer',
      'test_place_456',
      'Test Location',
      5,
      'Great place!'
    );
    tests.push({
      test: 'Place Review Posted Notification',
      status: 'PASSED',
      message: 'Successfully sent review posted notification'
    });
  } catch (error) {
    tests.push({
      test: 'Place Review Posted Notification',
      status: 'FAILED', 
      error: error.message
    });
  }

  return tests;
}

/**
 * Test Phase 2: Admin/Moderator Notifications
 */
async function testPhase2AdminNotifications(admin: any): Promise<any[]> {
  const tests = [];

  try {
    // Test 1: System Performance Degraded
    await NotificationService.notifySystemPerformanceDegraded(
      'Test CPU Usage',
      95.5,
      90,
      ['api_requests', 'database_queries']
    );
    tests.push({
      test: 'System Performance Degraded Alert',
      status: 'PASSED',
      message: 'Successfully sent performance degraded notification'
    });
  } catch (error) {
    tests.push({
      test: 'System Performance Degraded Alert',
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 2: Database Connection Issues
    await NotificationService.notifyDatabaseConnectionIssues(
      'Test connection timeout',
      ['user_queries', 'place_searches'],
      new Date().toISOString()
    );
    tests.push({
      test: 'Database Connection Issues Alert',
      status: 'PASSED',
      message: 'Successfully sent database issues notification'
    });
  } catch (error) {
    tests.push({
      test: 'Database Connection Issues Alert',
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 3: Security Alert
    await NotificationService.notifySuspiciousLoginPatterns(
      'Test suspicious login pattern',
      5,
      'high',
      { ip_addresses: ['192.168.1.100'], attempts: 20 }
    );
    tests.push({
      test: 'Security Alert Notification',
      status: 'PASSED',
      message: 'Successfully sent security alert notification'
    });
  } catch (error) {
    tests.push({
      test: 'Security Alert Notification',
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 4: Storage Quota Warning
    await NotificationService.notifyStorageQuotaWarning(
      850, // current usage GB
      1000, // total quota GB  
      85, // usage percentage
      '2024-02-15' // projected full date
    );
    tests.push({
      test: 'Storage Quota Warning',
      status: 'PASSED',
      message: 'Successfully sent storage quota warning'
    });
  } catch (error) {
    tests.push({
      test: 'Storage Quota Warning',
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 5: SSL Certificate Expiring
    await NotificationService.notifySSLCertificateExpiring(
      'test.vietexplore.ai',
      '2024-01-20',
      7 // days until expiry
    );
    tests.push({
      test: 'SSL Certificate Expiring Alert',
      status: 'PASSED',
      message: 'Successfully sent SSL certificate expiring notification'
    });
  } catch (error) {
    tests.push({
      test: 'SSL Certificate Expiring Alert',
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 6: GDPR Data Request
    await NotificationService.notifyGDPRDataRequest(
      'export',
      'test_user_gdpr',
      'test-gdpr@example.com',
      '2024-01-30',
      { requestReason: 'Testing GDPR notification system' }
    );
    tests.push({
      test: 'GDPR Data Request Notification',
      status: 'PASSED',
      message: 'Successfully sent GDPR data request notification'
    });
  } catch (error) {
    tests.push({
      test: 'GDPR Data Request Notification',
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 7: Moderation Queue Overload
    await NotificationService.notifyModerationQueueOverload(
      75, // current queue size
      50, // threshold  
      45, // average wait time
      3   // online moderators
    );
    tests.push({
      test: 'Moderation Queue Overload Alert',
      status: 'PASSED',
      message: 'Successfully sent moderation queue overload notification'
    });
  } catch (error) {
    tests.push({
      test: 'Moderation Queue Overload Alert',
      status: 'FAILED',
      error: error.message
    });
  }

  return tests;
}

/**
 * Test System Health Monitoring
 */
async function testSystemHealthMonitoring(): Promise<any[]> {
  const tests = [];

  try {
    // Test 1: Get Current System Status
    const status = await SystemHealthMonitoringService.getCurrentSystemStatus();
    tests.push({
      test: 'Get Current System Status',
      status: 'PASSED',
      message: `System status: ${status.status}`,
      data: {
        status: status.status,
        cpu: status.metrics.cpu_usage,
        memory: status.metrics.memory_usage,
        responseTime: status.metrics.response_time
      }
    });
  } catch (error) {
    tests.push({
      test: 'Get Current System Status',
      status: 'FAILED',
      error: error.message
    });
  }

  try {
    // Test 2: Trigger Health Check
    const metrics = await SystemHealthMonitoringService.triggerImmediateHealthCheck();
    tests.push({
      test: 'Trigger Immediate Health Check',
      status: 'PASSED',
      message: 'Health check completed successfully',
      data: {
        timestamp: metrics.timestamp,
        cpu_usage: metrics.cpu_usage,
        memory_usage: metrics.memory_usage,
        response_time: metrics.response_time,
        error_rate: metrics.error_rate
      }
    });
  } catch (error) {
    tests.push({
      test: 'Trigger Immediate Health Check',
      status: 'FAILED',
      error: error.message
    });
  }

  return tests;
}

/**
 * Run comprehensive test suite
 */
async function runComprehensiveTests(admin: any): Promise<any[]> {
  const allTests = [];
  
  console.log('🧪 Running comprehensive notification system tests...');
  
  // Run Phase 1 tests
  console.log('📝 Testing Phase 1: User Interactions...');
  const phase1Tests = await testPhase1UserInteractions(admin);
  allTests.push(...phase1Tests.map(test => ({ ...test, phase: 'Phase 1: User Interactions' })));
  
  // Run Phase 2 tests  
  console.log('📝 Testing Phase 2: Admin Notifications...');
  const phase2Tests = await testPhase2AdminNotifications(admin);
  allTests.push(...phase2Tests.map(test => ({ ...test, phase: 'Phase 2: Admin Notifications' })));
  
  // Run System Health tests
  console.log('📝 Testing System Health Monitoring...');
  const healthTests = await testSystemHealthMonitoring();
  allTests.push(...healthTests.map(test => ({ ...test, phase: 'System Health Monitoring' })));
  
  // Calculate summary
  const passed = allTests.filter(test => test.status === 'PASSED').length;
  const failed = allTests.filter(test => test.status === 'FAILED').length;
  const total = allTests.length;
  
  allTests.unshift({
    test: 'COMPREHENSIVE TEST SUMMARY',
    status: failed === 0 ? 'ALL_PASSED' : 'SOME_FAILED',
    message: `${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)`,
    phase: 'Summary',
    summary: {
      total,
      passed,
      failed,
      successRate: `${((passed/total)*100).toFixed(1)}%`
    }
  });
  
  console.log(`✅ Comprehensive tests completed: ${passed}/${total} passed`);
  
  return allTests;
}
import { NextRequest, NextResponse } from 'next/server';
import { moderationHealthMonitor } from '@/lib/server/moderation-health-monitor';

/**
 * Cron job để auto-check moderation queue health
 *
 * Schedule: Mỗi 6 giờ
 *
 * Nhiệm vụ:
 * 1. Run health check
 * 2. Nếu phát hiện approved/rejected entries → auto cleanup
 * 3. Log issues cho admin review
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== CRON: Moderation Health Check ===');

    // Run health check
    const healthReport = await moderationHealthMonitor.runHealthCheck();

    // Log report
    await moderationHealthMonitor.logHealthReport(healthReport);

    console.log('Health Report:', {
      healthy: healthReport.healthy,
      issues: healthReport.issues.length,
      criticalIssues: healthReport.issues.filter(i => i.severity === 'critical').length,
    });

    // Auto-cleanup nếu có approved/rejected entries
    let cleanupResult = null;
    if (healthReport.stats.approvedButNotDeleted > 0) {
      console.log(`⚠️  Found ${healthReport.stats.approvedButNotDeleted} finalized entries - running auto-cleanup...`);
      cleanupResult = await moderationHealthMonitor.cleanupFinalizedEntries();
      console.log(`✅ Auto-cleanup completed: ${cleanupResult.cleaned} entries cleaned`);
    }

    // Alert nếu có critical issues
    const criticalIssues = healthReport.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.error('🚨 CRITICAL ISSUES DETECTED:', criticalIssues);
      // TODO: Send alert to admin (email, Slack, etc.)
    }

    return NextResponse.json({
      success: true,
      message: 'Health check completed',
      data: {
        healthReport,
        cleanupResult,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in moderation health check cron:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}

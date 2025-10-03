import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { moderationHealthMonitor } from '@/lib/server/moderation-health-monitor';

/**
 * GET /api/admin/moderation/health - Run health check on moderation queue
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can access health monitoring' },
        { status: 403 }
      );
    }

    console.log('Running moderation queue health check...');

    // Run health check
    const healthReport = await moderationHealthMonitor.runHealthCheck();

    // Log report to Firestore for audit trail
    await moderationHealthMonitor.logHealthReport(healthReport);

    return NextResponse.json({
      success: true,
      data: healthReport,
    });
  } catch (error) {
    console.error('Error running health check:', error);
    return NextResponse.json(
      { error: 'Failed to run health check' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/moderation/health - Run cleanup of finalized entries
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can run cleanup' },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    if (action === 'cleanup') {
      console.log('Running cleanup of finalized moderation entries...');

      const cleanupResult = await moderationHealthMonitor.cleanupFinalizedEntries();

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${cleanupResult.cleaned} finalized entries`,
        data: cleanupResult,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error running cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to run cleanup' },
      { status: 500 }
    );
  }
}

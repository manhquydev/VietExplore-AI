import { NextRequest, NextResponse } from 'next/server';
import { SoftDeleteService } from '@/lib/server/soft-delete-service';
import { ConflictResolutionService } from '@/lib/server/conflict-resolution-service';
import { ClaimTimeoutService } from '@/lib/server/claim-timeout-service';
import { AutoEscalationService } from '@/lib/server/auto-escalation-service';
import { EnhancedNotificationService } from '@/lib/server/enhanced-notification-service';
import { OrphanedContentService } from '@/lib/server/orphaned-content-service';

/**
 * Cron job để xử lý expired requests
 * 
 * Usage: POST /api/cron/process-expired
 * 
 * Sẽ được gọi bởi Vercel cron hoặc external scheduler mỗi giờ
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron authorization (trong production nên có auth token)
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== CRON JOB: Processing expired requests ===');

    const results = {
      deletionRequests: { processed: 0, errors: 0 },
      conflictRequests: { processed: 0, errors: 0 },
      claimTimeouts: { processed: 0, errors: 0 },
      autoEscalations: { processed: 0, errors: 0 },
      notificationCleanup: { processed: 0, errors: 0 },
      orphanedContent: { processed: 0, errors: 0 }
    };

    // 1. Process expired deletion requests
    try {
      await SoftDeleteService.processExpiredRequests();
      results.deletionRequests.processed = 1;
      console.log('✅ Processed expired deletion requests');
    } catch (error) {
      console.error('❌ Error processing deletion requests:', error);
      results.deletionRequests.errors = 1;
    }

    // 2. Process expired conflict resolution requests
    try {
      await ConflictResolutionService.cleanupExpiredRequests();
      results.conflictRequests.processed = 1;
      console.log('✅ Processed expired conflict requests');
    } catch (error) {
      console.error('❌ Error processing conflict requests:', error);
      results.conflictRequests.errors = 1;
    }

    // 3. Process expired moderation claims - theo tài liệu 2.2.1
    try {
      const claimResults = await ClaimTimeoutService.processExpiredClaims();
      results.claimTimeouts.processed = claimResults.releasedClaims;
      
      if (claimResults.errors.length > 0) {
        results.claimTimeouts.errors = claimResults.errors.length;
        console.error('Some claim processing errors:', claimResults.errors);
      }
      
      console.log(`✅ Processed ${claimResults.releasedClaims} expired claims, notified ${claimResults.notifiedModerators.length} moderators`);
      
      // Also send warnings for claims expiring soon
      await ClaimTimeoutService.sendClaimWarnings();
      console.log('✅ Sent claim expiry warnings');
      
    } catch (error) {
      console.error('❌ Error processing claim timeouts:', error);
      results.claimTimeouts.errors = 1;
    }

    // 4. Process auto-escalations - theo tài liệu 7.2
    try {
      const escalationResults = await AutoEscalationService.processAutoEscalation();
      results.autoEscalations.processed = escalationResults.escalatedItems;
      
      if (escalationResults.errors.length > 0) {
        results.autoEscalations.errors = escalationResults.errors.length;
        console.error('Some auto-escalation errors:', escalationResults.errors);
      }
      
      console.log(`✅ Auto-escalated ${escalationResults.escalatedItems} items:`, escalationResults.triggers);
      
    } catch (error) {
      console.error('❌ Error processing auto-escalations:', error);
      results.autoEscalations.errors = 1;
    }

    // 5. Cleanup expired notifications 
    try {
      await EnhancedNotificationService.cleanupExpiredNotifications();
      results.notificationCleanup.processed = 1;
      console.log('✅ Cleaned up expired notifications');
      
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
      results.notificationCleanup.errors = 1;
    }

    // 6. Process orphaned content - theo tài liệu 7.1 (chạy hàng ngày)
    try {
      const orphanedResults = await OrphanedContentService.scanOrphanedContent();
      results.orphanedContent.processed = orphanedResults.newOrphans.length;
      
      if (orphanedResults.errors.length > 0) {
        results.orphanedContent.errors = orphanedResults.errors.length;
        console.error('Some orphaned content scan errors:', orphanedResults.errors);
      }
      
      // Also process ready orphaned content
      const processResults = await OrphanedContentService.processOrphanedContent();
      results.orphanedContent.processed += processResults.processed;
      
      console.log(`✅ Scanned orphaned content: ${orphanedResults.newOrphans.length} new, processed: ${processResults.processed}`);
      
      // Cleanup old processed orphans
      await OrphanedContentService.cleanupProcessedOrphans();
      console.log('✅ Cleaned up old processed orphans');
      
    } catch (error) {
      console.error('❌ Error processing orphaned content:', error);
      results.orphanedContent.errors = 1;
    }

    console.log('=== CRON JOB COMPLETED ===', results);

    return NextResponse.json({
      success: true,
      message: 'Expired requests processed successfully',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fatal error in cron job:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'Cron job endpoint active',
    endpoints: {
      process: 'POST /api/cron/process-expired',
      health: 'GET /api/cron/process-expired'
    },
    nextRun: 'Every hour (configured in vercel.json or external scheduler)'
  });
}
/**
 * Moderation Queue Health Monitor
 *
 * Service để monitor và detect anomalies trong moderation queue
 * Giúp phát hiện sớm các vấn đề như:
 * - Approved items quay lại pending
 * - Orphaned entries
 * - Stuck entries
 */

import { getAdminDb } from './firebaseAdmin';

export interface ModerationHealthReport {
  timestamp: string;
  healthy: boolean;
  issues: HealthIssue[];
  stats: {
    totalPending: number;
    totalClaimed: number;
    totalApproved: number;
    totalRejected: number;
    orphanedEntries: number;
    stuckEntries: number;
    approvedButNotDeleted: number;
  };
  recommendations: string[];
}

export interface HealthIssue {
  severity: 'critical' | 'warning' | 'info';
  type: string;
  description: string;
  affectedItems: string[];
  suggestedFix: string;
}

export class ModerationHealthMonitor {
  private static instance: ModerationHealthMonitor;

  private constructor() {}

  static getInstance(): ModerationHealthMonitor {
    if (!ModerationHealthMonitor.instance) {
      ModerationHealthMonitor.instance = new ModerationHealthMonitor();
    }
    return ModerationHealthMonitor.instance;
  }

  /**
   * Run full health check trên moderation queue
   */
  async runHealthCheck(): Promise<ModerationHealthReport> {
    const adminDb = getAdminDb();
    const now = new Date();
    const issues: HealthIssue[] = [];

    // Get all moderation queue entries
    const queueSnapshot = await adminDb.collection('moderation_queue').get();

    const stats = {
      totalPending: 0,
      totalClaimed: 0,
      totalApproved: 0,
      totalRejected: 0,
      orphanedEntries: 0,
      stuckEntries: 0,
      approvedButNotDeleted: 0,
    };

    const orphanedItems: string[] = [];
    const stuckItems: string[] = [];
    const approvedButNotDeletedItems: string[] = [];

    // Analyze each entry
    for (const doc of queueSnapshot.docs) {
      const data = doc.data();
      const status = data.status;

      // Count by status
      if (status === 'pending') stats.totalPending++;
      else if (status === 'claimed') stats.totalClaimed++;
      else if (status === 'approved') stats.totalApproved++;
      else if (status === 'rejected') stats.totalRejected++;

      // CHECK 1: Detect approved/rejected entries that should have been deleted
      if (status === 'approved' || status === 'rejected') {
        approvedButNotDeletedItems.push(doc.id);
        stats.approvedButNotDeleted++;
      }

      // CHECK 2: Detect orphaned entries (content không còn tồn tại)
      const contentId = data.contentId || data.itemId;
      if (contentId) {
        const contentExists = await this.checkContentExists(contentId, data.contentType);
        if (!contentExists) {
          orphanedItems.push(doc.id);
          stats.orphanedEntries++;
        }
      }

      // CHECK 3: Detect stuck entries (quá 7 ngày vẫn pending/claimed)
      const submittedAt = data.submittedAt ? new Date(data.submittedAt) : null;
      if (submittedAt) {
        const daysSinceSubmit = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceSubmit > 7 && (status === 'pending' || status === 'claimed')) {
          stuckItems.push(doc.id);
          stats.stuckEntries++;
        }
      }
    }

    // Generate issues based on findings
    if (approvedButNotDeletedItems.length > 0) {
      issues.push({
        severity: 'critical',
        type: 'APPROVED_NOT_DELETED',
        description: `Found ${approvedButNotDeletedItems.length} approved/rejected entries that should have been deleted`,
        affectedItems: approvedButNotDeletedItems.slice(0, 10), // Show first 10
        suggestedFix: 'Run cleanup script to delete finalized moderation entries',
      });
    }

    if (orphanedItems.length > 0) {
      issues.push({
        severity: 'warning',
        type: 'ORPHANED_ENTRIES',
        description: `Found ${orphanedItems.length} moderation entries with missing content`,
        affectedItems: orphanedItems.slice(0, 10),
        suggestedFix: 'Run orphaned content cleanup',
      });
    }

    if (stuckItems.length > 0) {
      issues.push({
        severity: 'warning',
        type: 'STUCK_ENTRIES',
        description: `Found ${stuckItems.length} entries stuck in queue for more than 7 days`,
        affectedItems: stuckItems.slice(0, 10),
        suggestedFix: 'Review and process or escalate these items',
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (stats.approvedButNotDeleted > 0) {
      recommendations.push('URGENT: Clean up approved/rejected entries to prevent re-processing');
    }
    if (stats.orphanedEntries > 5) {
      recommendations.push('Run orphaned content cleanup job');
    }
    if (stats.stuckEntries > 10) {
      recommendations.push('Consider auto-escalating old pending items');
    }
    if (stats.totalPending > 100) {
      recommendations.push('High pending queue - consider adding more moderators');
    }

    const healthy = issues.filter(i => i.severity === 'critical').length === 0;

    return {
      timestamp: now.toISOString(),
      healthy,
      issues,
      stats,
      recommendations,
    };
  }

  /**
   * Check nếu content còn tồn tại trong Firestore
   */
  private async checkContentExists(contentId: string, contentType: string): Promise<boolean> {
    const adminDb = getAdminDb();

    try {
      if (contentType === 'place') {
        const placeDoc = await adminDb.collection('places').doc(contentId).get();
        return placeDoc.exists;
      }
      // Add other content types nếu cần
      return true;
    } catch (error) {
      console.error(`Error checking content exists: ${contentId}`, error);
      return false;
    }
  }

  /**
   * Auto-cleanup approved/rejected entries
   * Safe cleanup function có thể run định kỳ
   */
  async cleanupFinalizedEntries(): Promise<{ cleaned: number; errors: string[] }> {
    const adminDb = getAdminDb();
    const errors: string[] = [];
    let cleaned = 0;

    try {
      // Get all approved/rejected entries (should have been deleted)
      const finalizedSnapshot = await adminDb
        .collection('moderation_queue')
        .where('status', 'in', ['approved', 'rejected', 'deleted'])
        .get();

      console.log(`Found ${finalizedSnapshot.size} finalized entries to cleanup`);

      // Delete each entry
      const deletePromises = finalizedSnapshot.docs.map(async (doc) => {
        try {
          await adminDb.collection('moderation_queue').doc(doc.id).delete();
          cleaned++;
          console.log(`Cleaned up finalized entry: ${doc.id}`);
        } catch (error) {
          const errorMsg = `Failed to delete ${doc.id}: ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      });

      await Promise.all(deletePromises);

      console.log(`Cleanup completed: ${cleaned} entries cleaned, ${errors.length} errors`);

      return { cleaned, errors };
    } catch (error) {
      console.error('Fatal error in cleanupFinalizedEntries:', error);
      throw error;
    }
  }

  /**
   * Log health report to Firestore cho audit trail
   */
  async logHealthReport(report: ModerationHealthReport): Promise<void> {
    const adminDb = getAdminDb();

    try {
      await adminDb.collection('moderation_health_logs').add({
        ...report,
        createdAt: new Date().toISOString(),
      });

      console.log('Health report logged:', {
        healthy: report.healthy,
        issuesCount: report.issues.length,
        criticalIssues: report.issues.filter(i => i.severity === 'critical').length,
      });
    } catch (error) {
      console.error('Error logging health report:', error);
    }
  }
}

// Export singleton instance
export const moderationHealthMonitor = ModerationHealthMonitor.getInstance();

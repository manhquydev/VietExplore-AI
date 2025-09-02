/**
 * Auto-Escalation Service - Tự động escalate theo tài liệu mục 7.2
 * 
 * Triggers escalation:
 * - 3 lần validation loop (request_edit cycle)
 * - Content stuck in review > 7 days
 * - Multiple reports on same content
 * - High priority violations
 * - Pattern recognition (same user/moderator issues)
 */

import { getAdminDb } from './firebaseAdmin';
import { RevisionLimitService } from './revision-limit-service';
import { EnhancedNotificationService } from './enhanced-notification-service';
import { FieldValue } from 'firebase-admin/firestore';

export interface EscalationTrigger {
  type: 'validation_loop' | 'stuck_in_review' | 'multiple_reports' | 'high_priority' | 'pattern_detected' | 'manual';
  placeId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredBy: string; // user/moderator ID or 'system'
  triggeredAt: string;
  metadata?: {
    attemptCount?: number;
    daysSinceSubmission?: number;
    reportCount?: number;
    pattern?: string;
    [key: string]: any;
  };
}

export interface EscalationItem {
  id?: string;
  placeId: string;
  contentType: 'place' | 'place_edit' | 'place_deletion';
  trigger: EscalationTrigger;
  status: 'pending' | 'assigned' | 'resolved' | 'dismissed';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  escalatedAt: string;
  escalatedTo: 'admin' | 'senior_moderator' | 'technical_team';
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  autoEscalated: boolean;
}

export class AutoEscalationService {
  private static adminDb = getAdminDb();

  /**
   * Kiểm tra và tự động escalate các cases cần thiết
   */
  static async processAutoEscalation(): Promise<{
    escalatedItems: number;
    triggers: { [key: string]: number };
    errors: string[];
  }> {
    try {
      const results = {
        escalatedItems: 0,
        triggers: {
          validation_loop: 0,
          stuck_in_review: 0,
          multiple_reports: 0,
          pattern_detected: 0
        } as { [key: string]: number },
        errors: [] as string[]
      };

      // 1. Check validation loops (3+ revisions)
      try {
        const validationLoops = await this.checkValidationLoops();
        results.escalatedItems += validationLoops.length;
        results.triggers.validation_loop = validationLoops.length;
        console.log(`Found ${validationLoops.length} validation loops to escalate`);
      } catch (error) {
        results.errors.push(`Validation loop check failed: ${error}`);
      }

      // 2. Check stuck in review (>7 days)
      try {
        const stuckItems = await this.checkStuckInReview();
        results.escalatedItems += stuckItems.length;
        results.triggers.stuck_in_review = stuckItems.length;
        console.log(`Found ${stuckItems.length} stuck items to escalate`);
      } catch (error) {
        results.errors.push(`Stuck review check failed: ${error}`);
      }

      // 3. Check multiple reports
      try {
        const reportedItems = await this.checkMultipleReports();
        results.escalatedItems += reportedItems.length;
        results.triggers.multiple_reports = reportedItems.length;
        console.log(`Found ${reportedItems.length} heavily reported items to escalate`);
      } catch (error) {
        results.errors.push(`Multiple reports check failed: ${error}`);
      }

      // 4. Pattern detection
      try {
        const patterns = await this.detectPatterns();
        results.escalatedItems += patterns.length;
        results.triggers.pattern_detected = patterns.length;
        console.log(`Found ${patterns.length} pattern-based escalations`);
      } catch (error) {
        results.errors.push(`Pattern detection failed: ${error}`);
      }

      return results;

    } catch (error) {
      console.error('Fatal error in auto-escalation processing:', error);
      return {
        escalatedItems: 0,
        triggers: {},
        errors: [`Fatal error: ${error}`]
      };
    }
  }

  /**
   * Check validation loops - 3+ revision requests theo tài liệu 7.2
   */
  private static async checkValidationLoops(): Promise<EscalationItem[]> {
    try {
      const escalations: EscalationItem[] = [];
      
      // Lấy places có >= 3 revision attempts
      const validationLoopQuery = await this.adminDb
        .collection('places')
        .where('revisionAttempts', '>=', 3)
        .where('shouldEscalate', '==', true)
        .where('status', 'in', ['needs_revision', 'in_review'])
        .get();

      for (const placeDoc of validationLoopQuery.docs) {
        const placeData = placeDoc.data();
        
        // Check if already escalated
        const existingEscalation = await this.adminDb
          .collection('escalations')
          .where('placeId', '==', placeDoc.id)
          .where('trigger.type', '==', 'validation_loop')
          .where('status', 'in', ['pending', 'assigned'])
          .limit(1)
          .get();

        if (!existingEscalation.empty) {
          continue; // Already escalated
        }

        // Get revision history for details
        const revisionHistory = await RevisionLimitService.getRevisionHistory(placeDoc.id);

        const escalationItem: EscalationItem = {
          placeId: placeDoc.id,
          contentType: 'place',
          trigger: {
            type: 'validation_loop',
            placeId: placeDoc.id,
            reason: `Validation loop detected: ${revisionHistory.totalAttempts} revision requests`,
            severity: 'high',
            triggeredBy: 'system',
            triggeredAt: new Date().toISOString(),
            metadata: {
              attemptCount: revisionHistory.totalAttempts,
              lastRevisionBy: placeData.lastRevisionRequestBy,
              revisionCycle: revisionHistory.currentCycle
            }
          },
          status: 'pending',
          priority: 'high',
          escalatedAt: new Date().toISOString(),
          escalatedTo: 'admin',
          autoEscalated: true
        };

        // Create escalation
        const escalationRef = await this.adminDb.collection('escalations').add(escalationItem);
        escalationItem.id = escalationRef.id;
        
        // Update place
        await this.adminDb.collection('places').doc(placeDoc.id).update({
          escalatedAt: new Date().toISOString(),
          escalationReason: 'Validation loop auto-escalation',
          escalationId: escalationRef.id,
          status: 'escalated',
          updatedAt: new Date().toISOString()
        });

        escalations.push(escalationItem);
      }

      return escalations;

    } catch (error) {
      console.error('Error checking validation loops:', error);
      return [];
    }
  }

  /**
   * Check items stuck in review > 7 days
   */
  private static async checkStuckInReview(): Promise<EscalationItem[]> {
    try {
      const escalations: EscalationItem[] = [];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Find places stuck in review
      const stuckQuery = await this.adminDb
        .collection('places')
        .where('status', '==', 'in_review')
        .where('updatedAt', '<', sevenDaysAgo)
        .get();

      for (const placeDoc of stuckQuery.docs) {
        const placeData = placeDoc.data();
        
        // Check if already escalated
        const existingEscalation = await this.adminDb
          .collection('escalations')
          .where('placeId', '==', placeDoc.id)
          .where('trigger.type', '==', 'stuck_in_review')
          .where('status', 'in', ['pending', 'assigned'])
          .limit(1)
          .get();

        if (!existingEscalation.empty) {
          continue;
        }

        const daysSinceSubmission = Math.floor(
          (Date.now() - new Date(placeData.updatedAt).getTime()) / (24 * 60 * 60 * 1000)
        );

        const escalationItem: EscalationItem = {
          placeId: placeDoc.id,
          contentType: 'place',
          trigger: {
            type: 'stuck_in_review',
            placeId: placeDoc.id,
            reason: `Content stuck in review for ${daysSinceSubmission} days`,
            severity: daysSinceSubmission > 14 ? 'high' : 'medium',
            triggeredBy: 'system',
            triggeredAt: new Date().toISOString(),
            metadata: {
              daysSinceSubmission,
              lastModeratorId: placeData.claimedBy || placeData.moderatedBy
            }
          },
          status: 'pending',
          priority: daysSinceSubmission > 14 ? 'high' : 'medium',
          escalatedAt: new Date().toISOString(),
          escalatedTo: daysSinceSubmission > 14 ? 'admin' : 'senior_moderator',
          autoEscalated: true
        };

        const escalationRef = await this.adminDb.collection('escalations').add(escalationItem);
        escalationItem.id = escalationRef.id;

        // Update place
        await this.adminDb.collection('places').doc(placeDoc.id).update({
          escalatedAt: new Date().toISOString(),
          escalationReason: 'Stuck in review auto-escalation',
          escalationId: escalationRef.id,
          status: 'escalated'
        });

        escalations.push(escalationItem);
      }

      return escalations;

    } catch (error) {
      console.error('Error checking stuck in review:', error);
      return [];
    }
  }

  /**
   * Check multiple reports on same content
   */
  private static async checkMultipleReports(): Promise<EscalationItem[]> {
    try {
      const escalations: EscalationItem[] = [];
      const reportThreshold = 5; // 5+ reports trigger escalation

      // Find places with many reports (giả sử có reports collection)
      const placesQuery = await this.adminDb
        .collection('places')
        .where('reportCount', '>=', reportThreshold)
        .where('status', '!=', 'hidden')
        .get();

      for (const placeDoc of placesQuery.docs) {
        const placeData = placeDoc.data();
        
        // Check if already escalated for reports
        const existingEscalation = await this.adminDb
          .collection('escalations')
          .where('placeId', '==', placeDoc.id)
          .where('trigger.type', '==', 'multiple_reports')
          .where('status', 'in', ['pending', 'assigned'])
          .limit(1)
          .get();

        if (!existingEscalation.empty) {
          continue;
        }

        const escalationItem: EscalationItem = {
          placeId: placeDoc.id,
          contentType: 'place',
          trigger: {
            type: 'multiple_reports',
            placeId: placeDoc.id,
            reason: `${placeData.reportCount} reports received`,
            severity: placeData.reportCount > 10 ? 'critical' : 'high',
            triggeredBy: 'system',
            triggeredAt: new Date().toISOString(),
            metadata: {
              reportCount: placeData.reportCount,
              reportTypes: placeData.reportTypes || []
            }
          },
          status: 'pending',
          priority: placeData.reportCount > 10 ? 'urgent' : 'high',
          escalatedAt: new Date().toISOString(),
          escalatedTo: 'admin',
          autoEscalated: true
        };

        const escalationRef = await this.adminDb.collection('escalations').add(escalationItem);
        escalationItem.id = escalationRef.id;

        escalations.push(escalationItem);
      }

      return escalations;

    } catch (error) {
      console.error('Error checking multiple reports:', error);
      return [];
    }
  }

  /**
   * Pattern detection - problematic users/moderators
   */
  private static async detectPatterns(): Promise<EscalationItem[]> {
    try {
      const escalations: EscalationItem[] = [];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Pattern 1: User with high rejection rate
      const recentRejections = await this.adminDb
        .collection('moderation_logs')
        .where('action', '==', 'rejected')
        .where('timestamp', '>=', thirtyDaysAgo)
        .get();

      const rejectionsByUser = new Map<string, number>();
      recentRejections.docs.forEach(doc => {
        const data = doc.data();
        const contentCreatorId = data.contentCreatorId || data.userId;
        if (contentCreatorId) {
          rejectionsByUser.set(contentCreatorId, (rejectionsByUser.get(contentCreatorId) || 0) + 1);
        }
      });

      // Find users with >= 5 rejections in 30 days
      for (const [userId, rejectionCount] of rejectionsByUser.entries()) {
        if (rejectionCount >= 5) {
          // Check if already escalated
          const existingEscalation = await this.adminDb
            .collection('escalations')
            .where('trigger.metadata.pattern', '==', 'high_rejection_user')
            .where('trigger.metadata.userId', '==', userId)
            .where('status', 'in', ['pending', 'assigned'])
            .where('escalatedAt', '>=', thirtyDaysAgo)
            .limit(1)
            .get();

          if (!existingEscalation.empty) {
            continue;
          }

          // Get a recent rejected place from this user
          const userPlacesQuery = await this.adminDb
            .collection('places')
            .where('createdBy', '==', userId)
            .where('status', '==', 'rejected')
            .orderBy('rejectedAt', 'desc')
            .limit(1)
            .get();

          if (!userPlacesQuery.empty) {
            const placeDoc = userPlacesQuery.docs[0];
            
            const escalationItem: EscalationItem = {
              placeId: placeDoc.id,
              contentType: 'place',
              trigger: {
                type: 'pattern_detected',
                placeId: placeDoc.id,
                reason: `User pattern: ${rejectionCount} rejections in 30 days`,
                severity: 'medium',
                triggeredBy: 'system',
                triggeredAt: new Date().toISOString(),
                metadata: {
                  pattern: 'high_rejection_user',
                  userId: userId,
                  rejectionCount: rejectionCount,
                  timeframe: '30 days'
                }
              },
              status: 'pending',
              priority: 'medium',
              escalatedAt: new Date().toISOString(),
              escalatedTo: 'senior_moderator',
              autoEscalated: true
            };

            const escalationRef = await this.adminDb.collection('escalations').add(escalationItem);
            escalations.push(escalationItem);
          }
        }
      }

      return escalations;

    } catch (error) {
      console.error('Error detecting patterns:', error);
      return [];
    }
  }

  /**
   * Manual escalation
   */
  static async manualEscalate(
    placeId: string,
    escalatedBy: string,
    reason: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<{ success: boolean; escalationId?: string; error?: string }> {
    try {
      const escalationItem: EscalationItem = {
        placeId,
        contentType: 'place',
        trigger: {
          type: 'manual',
          placeId,
          reason,
          severity,
          triggeredBy: escalatedBy,
          triggeredAt: new Date().toISOString()
        },
        status: 'pending',
        priority: severity === 'critical' ? 'urgent' : 
                 severity === 'high' ? 'high' : 'medium',
        escalatedAt: new Date().toISOString(),
        escalatedTo: severity === 'critical' ? 'admin' : 'senior_moderator',
        autoEscalated: false
      };

      const escalationRef = await this.adminDb.collection('escalations').add(escalationItem);

      // Update place
      await this.adminDb.collection('places').doc(placeId).update({
        escalatedAt: new Date().toISOString(),
        escalationReason: reason,
        escalationId: escalationRef.id,
        escalatedBy: escalatedBy,
        status: 'escalated'
      });

      return { success: true, escalationId: escalationRef.id };

    } catch (error) {
      console.error('Error in manual escalation:', error);
      return { success: false, error: 'Không thể escalate content' };
    }
  }

  /**
   * Resolve escalation
   */
  static async resolveEscalation(
    escalationId: string,
    resolvedBy: string,
    resolutionNotes: string,
    action: 'approved' | 'rejected' | 'dismissed' | 'reassigned'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      
      await this.adminDb.runTransaction(async (transaction) => {
        const escalationRef = this.adminDb.collection('escalations').doc(escalationId);
        const escalationDoc = await transaction.get(escalationRef);

        if (!escalationDoc.exists) {
          throw new Error('Escalation không tồn tại');
        }

        const escalationData = escalationDoc.data() as EscalationItem;

        // Update escalation
        transaction.update(escalationRef, {
          status: 'resolved',
          resolvedAt: now,
          resolvedBy: resolvedBy,
          resolutionNotes: resolutionNotes,
          resolution: action
        });

        // Update place
        const placeRef = this.adminDb.collection('places').doc(escalationData.placeId);
        
        let newPlaceStatus = 'published'; // Default
        if (action === 'rejected') {
          newPlaceStatus = 'rejected';
        } else if (action === 'dismissed') {
          newPlaceStatus = 'in_review'; // Return to normal flow
        }

        transaction.update(placeRef, {
          status: newPlaceStatus,
          escalationResolved: true,
          escalationResolvedAt: now,
          escalationResolvedBy: resolvedBy,
          escalationResolution: action,
          updatedAt: now
        });
      });

      return { success: true };

    } catch (error: any) {
      console.error('Error resolving escalation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get escalation queue for admin dashboard
   */
  static async getEscalationQueue(filters?: {
    status?: string;
    priority?: string;
    escalatedTo?: string;
    limit?: number;
  }): Promise<EscalationItem[]> {
    try {
      let query = this.adminDb.collection('escalations').orderBy('escalatedAt', 'desc');

      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.priority) {
        query = query.where('priority', '==', filters.priority);
      }
      if (filters?.escalatedTo) {
        query = query.where('escalatedTo', '==', filters.escalatedTo);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EscalationItem[];

    } catch (error) {
      console.error('Error getting escalation queue:', error);
      return [];
    }
  }

  /**
   * Get escalation statistics
   */
  static async getEscalationStatistics(): Promise<{
    totalEscalations: number;
    pendingEscalations: number;
    escalationsByTrigger: { [key: string]: number };
    escalationsByPriority: { [key: string]: number };
    averageResolutionTime: number; // hours
    autoEscalationRate: number; // percentage
  }> {
    try {
      const allEscalations = await this.adminDb.collection('escalations').get();
      
      const stats = {
        totalEscalations: allEscalations.docs.length,
        pendingEscalations: 0,
        escalationsByTrigger: {} as { [key: string]: number },
        escalationsByPriority: {} as { [key: string]: number },
        averageResolutionTime: 0,
        autoEscalationRate: 0
      };

      let totalResolutionTime = 0;
      let resolvedCount = 0;
      let autoCount = 0;

      allEscalations.docs.forEach(doc => {
        const data = doc.data() as EscalationItem;
        
        if (data.status === 'pending') {
          stats.pendingEscalations++;
        }

        // Count by trigger
        const triggerType = data.trigger.type;
        stats.escalationsByTrigger[triggerType] = (stats.escalationsByTrigger[triggerType] || 0) + 1;

        // Count by priority
        stats.escalationsByPriority[data.priority] = (stats.escalationsByPriority[data.priority] || 0) + 1;

        // Calculate resolution time
        if (data.resolvedAt && data.escalatedAt) {
          const resolutionTime = new Date(data.resolvedAt).getTime() - new Date(data.escalatedAt).getTime();
          totalResolutionTime += resolutionTime / (60 * 60 * 1000); // hours
          resolvedCount++;
        }

        // Count auto escalations
        if (data.autoEscalated) {
          autoCount++;
        }
      });

      stats.averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;
      stats.autoEscalationRate = stats.totalEscalations > 0 ? (autoCount / stats.totalEscalations) * 100 : 0;

      return stats;

    } catch (error) {
      console.error('Error getting escalation statistics:', error);
      return {
        totalEscalations: 0,
        pendingEscalations: 0,
        escalationsByTrigger: {},
        escalationsByPriority: {},
        averageResolutionTime: 0,
        autoEscalationRate: 0
      };
    }
  }
}
/**
 * Revision Limit Service - Giới hạn số lần request edit theo tài liệu mục 2.2.2(b)
 * 
 * Quy tắc:
 * - Tối đa 3 lần yêu cầu sửa/địa điểm
 * - Track revision attempts per place
 * - Auto-escalate sau 3 lần
 * - Reset counter khi approved
 */

import { getAdminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export interface RevisionAttempt {
  attemptNumber: number;
  requestedAt: string;
  requestedBy: string; // moderator ID
  reason: string;
  status: 'pending' | 'completed' | 'ignored';
  completedAt?: string;
  escalatedAt?: string;
}

export interface PlaceRevisionHistory {
  placeId: string;
  totalAttempts: number;
  maxAttempts: number;
  currentCycle: RevisionAttempt[];
  canRequestMore: boolean;
  nextEscalationAt?: string;
  lastResetAt?: string; // Khi approved và reset counter
  escalationHistory: Array<{
    attemptCount: number;
    escalatedAt: string;
    escalatedBy: string;
    reason: string;
  }>;
}

export class RevisionLimitService {
  private static adminDb = getAdminDb();
  private static MAX_REVISION_ATTEMPTS = 3; // Theo tài liệu

  /**
   * Kiểm tra có thể request edit không
   */
  static async canRequestRevision(
    placeId: string,
    moderatorId: string
  ): Promise<{
    canRequest: boolean;
    currentAttempts: number;
    maxAttempts: number;
    reason?: string;
    suggestedAction?: string;
  }> {
    try {
      const history = await this.getRevisionHistory(placeId);

      if (history.canRequestMore) {
        return {
          canRequest: true,
          currentAttempts: history.totalAttempts,
          maxAttempts: history.maxAttempts
        };
      }

      return {
        canRequest: false,
        currentAttempts: history.totalAttempts,
        maxAttempts: history.maxAttempts,
        reason: `Đã đạt giới hạn ${history.maxAttempts} lần yêu cầu chỉnh sửa`,
        suggestedAction: 'Escalate lên Admin hoặc từ chối trực tiếp'
      };

    } catch (error) {
      console.error('Error checking revision limit:', error);
      return {
        canRequest: false,
        currentAttempts: 0,
        maxAttempts: this.MAX_REVISION_ATTEMPTS,
        reason: 'Lỗi hệ thống khi kiểm tra giới hạn revision'
      };
    }
  }

  /**
   * Record revision request
   */
  static async recordRevisionRequest(
    placeId: string,
    moderatorId: string,
    reason: string
  ): Promise<{
    success: boolean;
    attemptNumber: number;
    shouldEscalate: boolean;
    error?: string;
  }> {
    try {
      // Check limit first
      const limitCheck = await this.canRequestRevision(placeId, moderatorId);
      
      if (!limitCheck.canRequest) {
        return {
          success: false,
          attemptNumber: limitCheck.currentAttempts,
          shouldEscalate: true,
          error: limitCheck.reason
        };
      }

      const now = new Date().toISOString();
      const historyRef = this.adminDb.collection('place_revision_history').doc(placeId);

      return await this.adminDb.runTransaction(async (transaction) => {
        const historyDoc = await transaction.get(historyRef);
        let historyData: PlaceRevisionHistory;

        if (historyDoc.exists) {
          historyData = historyDoc.data() as PlaceRevisionHistory;
        } else {
          // Initialize new history
          historyData = {
            placeId,
            totalAttempts: 0,
            maxAttempts: this.MAX_REVISION_ATTEMPTS,
            currentCycle: [],
            canRequestMore: true,
            escalationHistory: []
          };
        }

        // Add new revision attempt
        const newAttempt: RevisionAttempt = {
          attemptNumber: historyData.totalAttempts + 1,
          requestedAt: now,
          requestedBy: moderatorId,
          reason: reason,
          status: 'pending'
        };

        historyData.totalAttempts += 1;
        historyData.currentCycle.push(newAttempt);
        historyData.canRequestMore = historyData.totalAttempts < this.MAX_REVISION_ATTEMPTS;

        // Check if should escalate
        const shouldEscalate = historyData.totalAttempts >= this.MAX_REVISION_ATTEMPTS;
        
        if (shouldEscalate) {
          historyData.nextEscalationAt = now;
          historyData.escalationHistory.push({
            attemptCount: historyData.totalAttempts,
            escalatedAt: now,
            escalatedBy: 'system',
            reason: `Đạt giới hạn ${this.MAX_REVISION_ATTEMPTS} lần yêu cầu chỉnh sửa`
          });
        }

        // Update history
        transaction.set(historyRef, historyData);

        // Update place with revision tracking
        const placeRef = this.adminDb.collection('places').doc(placeId);
        transaction.update(placeRef, {
          revisionAttempts: historyData.totalAttempts,
          lastRevisionRequestAt: now,
          lastRevisionRequestBy: moderatorId,
          canReceiveMoreRevisions: historyData.canRequestMore,
          shouldEscalate: shouldEscalate,
          updatedAt: now,
          moderationHistory: FieldValue.arrayUnion({
            action: shouldEscalate ? 'revision_limit_reached' : 'revision_requested',
            moderatorId: moderatorId,
            reason: reason,
            createdAt: now,
            attemptNumber: historyData.totalAttempts
          })
        });

        return {
          success: true,
          attemptNumber: historyData.totalAttempts,
          shouldEscalate
        };
      });

    } catch (error) {
      console.error('Error recording revision request:', error);
      return {
        success: false,
        attemptNumber: 0,
        shouldEscalate: false,
        error: 'Không thể record revision request'
      };
    }
  }

  /**
   * Reset revision counter (khi place được approved)
   */
  static async resetRevisionCounter(
    placeId: string,
    moderatorId: string,
    reason: string = 'Place được phê duyệt'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      const historyRef = this.adminDb.collection('place_revision_history').doc(placeId);

      await this.adminDb.runTransaction(async (transaction) => {
        const historyDoc = await transaction.get(historyRef);
        
        if (historyDoc.exists) {
          const historyData = historyDoc.data() as PlaceRevisionHistory;
          
          // Reset counter
          historyData.totalAttempts = 0;
          historyData.canRequestMore = true;
          historyData.lastResetAt = now;
          historyData.nextEscalationAt = undefined;
          
          // Archive current cycle
          if (historyData.currentCycle.length > 0) {
            // Move to archived cycles (optional)
            historyData.currentCycle = [];
          }

          transaction.set(historyRef, historyData);
        }

        // Update place
        const placeRef = this.adminDb.collection('places').doc(placeId);
        transaction.update(placeRef, {
          revisionAttempts: 0,
          canReceiveMoreRevisions: true,
          shouldEscalate: false,
          revisionCounterResetAt: now,
          revisionCounterResetBy: moderatorId,
          updatedAt: now,
          moderationHistory: FieldValue.arrayUnion({
            action: 'revision_counter_reset',
            moderatorId: moderatorId,
            reason: reason,
            createdAt: now
          })
        });
      });

      console.log(`Reset revision counter for place ${placeId}`);
      return { success: true };

    } catch (error) {
      console.error('Error resetting revision counter:', error);
      return { success: false, error: 'Không thể reset revision counter' };
    }
  }

  /**
   * Get revision history
   */
  static async getRevisionHistory(placeId: string): Promise<PlaceRevisionHistory> {
    try {
      const historyDoc = await this.adminDb
        .collection('place_revision_history')
        .doc(placeId)
        .get();

      if (historyDoc.exists) {
        return historyDoc.data() as PlaceRevisionHistory;
      }

      // Return default if no history
      return {
        placeId,
        totalAttempts: 0,
        maxAttempts: this.MAX_REVISION_ATTEMPTS,
        currentCycle: [],
        canRequestMore: true,
        escalationHistory: []
      };

    } catch (error) {
      console.error('Error getting revision history:', error);
      return {
        placeId,
        totalAttempts: 0,
        maxAttempts: this.MAX_REVISION_ATTEMPTS,
        currentCycle: [],
        canRequestMore: false, // Safe default
        escalationHistory: []
      };
    }
  }

  /**
   * Get places cần escalate
   */
  static async getPlacesNeedingEscalation(): Promise<Array<{
    placeId: string;
    placeName?: string;
    totalAttempts: number;
    lastRequestAt: string;
    lastRequestBy: string;
    suggestedAction: string;
  }>> {
    try {
      // Find places that should escalate
      const placesQuery = await this.adminDb
        .collection('places')
        .where('shouldEscalate', '==', true)
        .where('status', 'in', ['needs_revision', 'in_review'])
        .orderBy('lastRevisionRequestAt', 'desc')
        .limit(50)
        .get();

      const results = [];

      for (const placeDoc of placesQuery.docs) {
        const placeData = placeDoc.data();
        
        results.push({
          placeId: placeDoc.id,
          placeName: placeData.name || 'Địa điểm không tên',
          totalAttempts: placeData.revisionAttempts || 0,
          lastRequestAt: placeData.lastRevisionRequestAt,
          lastRequestBy: placeData.lastRevisionRequestBy,
          suggestedAction: placeData.revisionAttempts >= this.MAX_REVISION_ATTEMPTS 
            ? 'Reject hoặc Admin review' 
            : 'Continue normal flow'
        });
      }

      return results;

    } catch (error) {
      console.error('Error getting places needing escalation:', error);
      return [];
    }
  }

  /**
   * Mark revision attempt as completed
   */
  static async completeRevisionAttempt(
    placeId: string,
    attemptNumber: number,
    completedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      const historyRef = this.adminDb.collection('place_revision_history').doc(placeId);

      await this.adminDb.runTransaction(async (transaction) => {
        const historyDoc = await transaction.get(historyRef);
        
        if (historyDoc.exists) {
          const historyData = historyDoc.data() as PlaceRevisionHistory;
          
          // Find and update the specific attempt
          const attempt = historyData.currentCycle.find(
            a => a.attemptNumber === attemptNumber
          );
          
          if (attempt) {
            attempt.status = 'completed';
            attempt.completedAt = now;
          }

          transaction.set(historyRef, historyData);
        }
      });

      return { success: true };

    } catch (error) {
      console.error('Error completing revision attempt:', error);
      return { success: false, error: 'Không thể mark revision attempt as completed' };
    }
  }

  /**
   * Cleanup old revision histories (sau 6 tháng)
   */
  static async cleanupOldRevisionHistories(): Promise<void> {
    try {
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();

      // Find old histories with all attempts completed or places deleted
      const oldHistoriesQuery = await this.adminDb
        .collection('place_revision_history')
        .where('lastResetAt', '<', sixMonthsAgo)
        .limit(100)
        .get();

      const batch = this.adminDb.batch();
      let deletedCount = 0;

      for (const historyDoc of oldHistoriesQuery.docs) {
        const historyData = historyDoc.data() as PlaceRevisionHistory;
        
        // Check if place still exists
        const placeDoc = await this.adminDb.collection('places').doc(historyData.placeId).get();
        
        if (!placeDoc.exists || placeDoc.data()?.deleted) {
          batch.delete(historyDoc.ref);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        await batch.commit();
        console.log(`Cleaned up ${deletedCount} old revision histories`);
      }

    } catch (error) {
      console.error('Error cleaning up old revision histories:', error);
    }
  }

  /**
   * Get revision statistics for admin dashboard
   */
  static async getRevisionStatistics(): Promise<{
    totalPlacesWithRevisions: number;
    placesAtMaxRevisions: number;
    averageRevisionsPerPlace: number;
    escalationsThisMonth: number;
    topReasonsFotRevision: Array<{ reason: string; count: number }>;
  }> {
    try {
      // This would be better with aggregation queries in production
      const historiesQuery = await this.adminDb
        .collection('place_revision_history')
        .get();

      let totalRevisions = 0;
      let placesAtMax = 0;
      let escalationsThisMonth = 0;
      const reasonCounts = new Map<string, number>();
      
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      historiesQuery.docs.forEach(doc => {
        const data = doc.data() as PlaceRevisionHistory;
        
        totalRevisions += data.totalAttempts;
        
        if (data.totalAttempts >= this.MAX_REVISION_ATTEMPTS) {
          placesAtMax++;
        }

        // Count escalations this month
        data.escalationHistory.forEach(escalation => {
          if (escalation.escalatedAt >= oneMonthAgo) {
            escalationsThisMonth++;
          }
        });

        // Count revision reasons
        data.currentCycle.forEach(attempt => {
          const count = reasonCounts.get(attempt.reason) || 0;
          reasonCounts.set(attempt.reason, count + 1);
        });
      });

      const topReasons = Array.from(reasonCounts.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalPlacesWithRevisions: historiesQuery.docs.length,
        placesAtMaxRevisions: placesAtMax,
        averageRevisionsPerPlace: historiesQuery.docs.length > 0 
          ? totalRevisions / historiesQuery.docs.length 
          : 0,
        escalationsThisMonth,
        topReasonsFotRevision: topReasons
      };

    } catch (error) {
      console.error('Error getting revision statistics:', error);
      return {
        totalPlacesWithRevisions: 0,
        placesAtMaxRevisions: 0,
        averageRevisionsPerPlace: 0,
        escalationsThisMonth: 0,
        topReasonsFotRevision: []
      };
    }
  }
}
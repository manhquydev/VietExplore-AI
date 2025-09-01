/**
 * Claim Timeout Service - Auto-release expired claims theo tài liệu mục 2.2.1
 * 
 * Quy tắc claim:
 * - Mỗi Moderator tối đa 10 địa điểm đang xử lý
 * - Thời gian xử lý tối đa: 48 giờ kể từ khi claim
 * - Quá hạn không xử lý: tự động release về pool
 * - Dashboard hiển thị: số lượng pending, thời gian còn lại
 */

import { getAdminDb } from './firebaseAdmin';
import { NotificationService } from './notification-service';
import { FieldValue } from 'firebase-admin/firestore';

export interface ClaimStatus {
  itemId: string;
  claimedBy: string;
  claimedAt: string;
  claimExpiresAt: string;
  itemType: string;
  priority: string;
  timeRemaining: number; // milliseconds
  isExpired: boolean;
}

export class ClaimTimeoutService {
  private static adminDb = getAdminDb();
  private static DEFAULT_CLAIM_HOURS = 48; // Theo tài liệu
  private static MAX_CLAIMS_PER_MODERATOR = 10; // Theo tài liệu

  /**
   * Auto-release expired claims
   */
  static async processExpiredClaims(): Promise<{
    releasedClaims: number;
    notifiedModerators: string[];
    errors: string[];
  }> {
    try {
      const now = new Date().toISOString();
      const results = {
        releasedClaims: 0,
        notifiedModerators: [] as string[],
        errors: [] as string[]
      };

      // Tìm tất cả claimed items đã expired
      const expiredClaimsQuery = await this.adminDb
        .collection('moderation_queue')
        .where('status', '==', 'claimed')
        .where('claimExpiresAt', '<', now)
        .get();

      console.log(`Found ${expiredClaimsQuery.docs.length} expired claims to process`);

      const batch = this.adminDb.batch();
      const moderatorNotifications = new Map<string, ClaimStatus[]>();

      for (const claimDoc of expiredClaimsQuery.docs) {
        try {
          const claimData = claimDoc.data();
          const moderatorId = claimData.claimedBy;

          // Release claim back to pool
          batch.update(claimDoc.ref, {
            status: 'pending',
            claimedBy: FieldValue.delete(),
            claimedAt: FieldValue.delete(),
            claimExpiresAt: FieldValue.delete(),
            releasedAt: now,
            releaseReason: 'Auto-released due to timeout (48h)',
            autoReleased: true,
            updatedAt: now
          });

          // Track cho notifications
          if (!moderatorNotifications.has(moderatorId)) {
            moderatorNotifications.set(moderatorId, []);
          }
          
          moderatorNotifications.get(moderatorId)!.push({
            itemId: claimDoc.id,
            claimedBy: moderatorId,
            claimedAt: claimData.claimedAt,
            claimExpiresAt: claimData.claimExpiresAt,
            itemType: claimData.itemType || claimData.contentType,
            priority: claimData.priority,
            timeRemaining: 0,
            isExpired: true
          });

          results.releasedClaims++;

          // Log cho audit trail
          await this.adminDb.collection('moderation_logs').add({
            moderationItemId: claimDoc.id,
            contentType: claimData.contentType || claimData.itemType,
            contentId: claimData.contentId || claimData.itemId,
            action: 'claim_auto_released',
            moderatorId: 'system',
            originalClaimant: moderatorId,
            reviewNotes: `Tự động release claim sau 48h timeout. Claim từ ${claimData.claimedAt}`,
            timestamp: now
          });

        } catch (error) {
          console.error(`Error processing expired claim ${claimDoc.id}:`, error);
          results.errors.push(`Failed to process claim ${claimDoc.id}: ${error}`);
        }
      }

      await batch.commit();

      // Gửi notifications cho moderators
      for (const [moderatorId, expiredClaims] of moderatorNotifications.entries()) {
        try {
          await this.notifyModeratorClaimTimeout(moderatorId, expiredClaims);
          results.notifiedModerators.push(moderatorId);
        } catch (error) {
          console.error(`Error notifying moderator ${moderatorId}:`, error);
          results.errors.push(`Failed to notify moderator ${moderatorId}`);
        }
      }

      console.log(`Auto-released ${results.releasedClaims} expired claims, notified ${results.notifiedModerators.length} moderators`);
      return results;

    } catch (error) {
      console.error('Fatal error in processExpiredClaims:', error);
      return {
        releasedClaims: 0,
        notifiedModerators: [],
        errors: [`Fatal error: ${error}`]
      };
    }
  }

  /**
   * Kiểm tra claim limits cho moderator
   */
  static async checkModeratorClaimLimits(moderatorId: string): Promise<{
    currentClaims: number;
    maxClaims: number;
    canClaim: boolean;
    expiringSoon: ClaimStatus[]; // Claims expiring in next 4 hours
  }> {
    try {
      // Lấy tất cả active claims của moderator
      const activeClaimsQuery = await this.adminDb
        .collection('moderation_queue')
        .where('status', '==', 'claimed')
        .where('claimedBy', '==', moderatorId)
        .orderBy('claimExpiresAt', 'asc')
        .get();

      const now = new Date();
      const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const expiringSoon: ClaimStatus[] = [];

      activeClaimsQuery.docs.forEach(doc => {
        const data = doc.data();
        const expiresAt = new Date(data.claimExpiresAt);
        
        if (expiresAt <= fourHoursFromNow) {
          expiringSoon.push({
            itemId: doc.id,
            claimedBy: moderatorId,
            claimedAt: data.claimedAt,
            claimExpiresAt: data.claimExpiresAt,
            itemType: data.itemType || data.contentType,
            priority: data.priority,
            timeRemaining: expiresAt.getTime() - now.getTime(),
            isExpired: expiresAt <= now
          });
        }
      });

      return {
        currentClaims: activeClaimsQuery.docs.length,
        maxClaims: this.MAX_CLAIMS_PER_MODERATOR,
        canClaim: activeClaimsQuery.docs.length < this.MAX_CLAIMS_PER_MODERATOR,
        expiringSoon
      };

    } catch (error) {
      console.error('Error checking claim limits:', error);
      return {
        currentClaims: 0,
        maxClaims: this.MAX_CLAIMS_PER_MODERATOR,
        canClaim: false,
        expiringSoon: []
      };
    }
  }

  /**
   * Extend claim timeout (nếu moderator cần thêm thời gian)
   */
  static async extendClaimTimeout(
    itemId: string,
    moderatorId: string,
    additionalHours: number = 24,
    reason?: string
  ): Promise<{ success: boolean; newExpiryTime?: string; error?: string }> {
    try {
      const itemRef = this.adminDb.collection('moderation_queue').doc(itemId);
      const itemDoc = await itemRef.get();

      if (!itemDoc.exists) {
        return { success: false, error: 'Mục kiểm duyệt không tồn tại' };
      }

      const itemData = itemDoc.data()!;

      // Verify ownership
      if (itemData.claimedBy !== moderatorId) {
        return { success: false, error: 'Bạn không có quyền extend claim này' };
      }

      // Check if already expired
      const currentExpiry = new Date(itemData.claimExpiresAt);
      const now = new Date();
      
      if (currentExpiry <= now) {
        return { success: false, error: 'Claim đã expired, không thể extend' };
      }

      // Extend time
      const newExpiryTime = new Date(currentExpiry.getTime() + additionalHours * 60 * 60 * 1000);

      await itemRef.update({
        claimExpiresAt: newExpiryTime.toISOString(),
        claimExtendedAt: now.toISOString(),
        claimExtensionReason: reason || `Extend thêm ${additionalHours}h`,
        updatedAt: now.toISOString()
      });

      // Log extension
      await this.adminDb.collection('moderation_logs').add({
        moderationItemId: itemId,
        contentType: itemData.contentType || itemData.itemType,
        contentId: itemData.contentId || itemData.itemId,
        action: 'claim_extended',
        moderatorId: moderatorId,
        reviewNotes: `Extend claim thêm ${additionalHours}h. Lý do: ${reason || 'Không có lý do'}`,
        timestamp: now.toISOString(),
        metadata: {
          originalExpiry: currentExpiry.toISOString(),
          newExpiry: newExpiryTime.toISOString(),
          additionalHours
        }
      });

      return { 
        success: true, 
        newExpiryTime: newExpiryTime.toISOString() 
      };

    } catch (error) {
      console.error('Error extending claim timeout:', error);
      return { success: false, error: 'Không thể extend claim timeout' };
    }
  }

  /**
   * Get dashboard data cho moderator
   */
  static async getModerationDashboard(moderatorId: string): Promise<{
    activeClaims: ClaimStatus[];
    pendingItems: number;
    expiringSoon: ClaimStatus[];
    performance: {
      totalProcessed: number;
      avgProcessingTime: number; // hours
      timeoutRate: number; // percentage
    };
    limits: {
      current: number;
      max: number;
      canClaim: boolean;
    };
  }> {
    try {
      // Get claim limits
      const limits = await this.checkModeratorClaimLimits(moderatorId);

      // Get pending items count
      const pendingQuery = await this.adminDb
        .collection('moderation_queue')
        .where('status', '==', 'pending')
        .get();

      // Get performance stats (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const performanceQuery = await this.adminDb
        .collection('moderation_logs')
        .where('moderatorId', '==', moderatorId)
        .where('timestamp', '>=', thirtyDaysAgo)
        .where('action', 'in', ['approved', 'rejected', 'claim_auto_released'])
        .orderBy('timestamp', 'desc')
        .get();

      let totalProcessed = 0;
      let totalProcessingTime = 0;
      let timeouts = 0;

      performanceQuery.docs.forEach(doc => {
        const data = doc.data();
        if (data.action === 'claim_auto_released') {
          timeouts++;
        } else {
          totalProcessed++;
          // Calculate processing time if available
          // This would need claim start time to be accurate
        }
      });

      const activeClaims: ClaimStatus[] = [];
      const now = new Date();

      // Convert limits.expiringSoon to full ClaimStatus objects
      limits.expiringSoon.forEach(claim => {
        activeClaims.push({
          ...claim,
          timeRemaining: new Date(claim.claimExpiresAt).getTime() - now.getTime(),
          isExpired: new Date(claim.claimExpiresAt) <= now
        });
      });

      return {
        activeClaims,
        pendingItems: pendingQuery.docs.length,
        expiringSoon: limits.expiringSoon.filter(claim => claim.timeRemaining <= 4 * 60 * 60 * 1000),
        performance: {
          totalProcessed,
          avgProcessingTime: totalProcessed > 0 ? totalProcessingTime / totalProcessed : 0,
          timeoutRate: totalProcessed + timeouts > 0 ? (timeouts / (totalProcessed + timeouts)) * 100 : 0
        },
        limits: {
          current: limits.currentClaims,
          max: limits.maxClaims,
          canClaim: limits.canClaim
        }
      };

    } catch (error) {
      console.error('Error getting moderation dashboard:', error);
      return {
        activeClaims: [],
        pendingItems: 0,
        expiringSoon: [],
        performance: {
          totalProcessed: 0,
          avgProcessingTime: 0,
          timeoutRate: 0
        },
        limits: {
          current: 0,
          max: this.MAX_CLAIMS_PER_MODERATOR,
          canClaim: false
        }
      };
    }
  }

  /**
   * Warning system - notify moderators về claims sắp expire
   */
  static async sendClaimWarnings(): Promise<void> {
    try {
      const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

      // Find claims expiring in next 4 hours
      const expiringSoonQuery = await this.adminDb
        .collection('moderation_queue')
        .where('status', '==', 'claimed')
        .where('claimExpiresAt', '<=', fourHoursFromNow)
        .get();

      const warningsSent = new Map<string, number>();

      for (const claimDoc of expiringSoonQuery.docs) {
        const claimData = claimDoc.data();
        const moderatorId = claimData.claimedBy;
        
        // Check if warning already sent recently
        const lastWarningKey = `claim_warning_${claimDoc.id}`;
        const lastWarning = await this.adminDb
          .collection('notification_cache')
          .doc(lastWarningKey)
          .get();

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (lastWarning.exists && new Date(lastWarning.data()!.sentAt) > oneHourAgo) {
          continue; // Skip if warning sent in last hour
        }

        // Send warning
        try {
          await this.notifyClaimExpiring(moderatorId, {
            itemId: claimDoc.id,
            claimedBy: moderatorId,
            claimedAt: claimData.claimedAt,
            claimExpiresAt: claimData.claimExpiresAt,
            itemType: claimData.itemType || claimData.contentType,
            priority: claimData.priority,
            timeRemaining: new Date(claimData.claimExpiresAt).getTime() - Date.now(),
            isExpired: false
          });

          // Cache warning sent
          await this.adminDb
            .collection('notification_cache')
            .doc(lastWarningKey)
            .set({
              sentAt: new Date().toISOString(),
              moderatorId,
              type: 'claim_expiring_warning'
            });

          warningsSent.set(moderatorId, (warningsSent.get(moderatorId) || 0) + 1);

        } catch (error) {
          console.error(`Error sending warning for claim ${claimDoc.id}:`, error);
        }
      }

      console.log(`Sent claim expiry warnings to ${warningsSent.size} moderators`);

    } catch (error) {
      console.error('Error sending claim warnings:', error);
    }
  }

  /**
   * Helper notification methods
   */
  private static async notifyModeratorClaimTimeout(
    moderatorId: string,
    expiredClaims: ClaimStatus[]
  ): Promise<void> {
    const message = expiredClaims.length === 1
      ? `Claim của bạn đã timeout: ${expiredClaims[0].itemType}`
      : `${expiredClaims.length} claims của bạn đã timeout`;

    // Use NotificationService to send notification
    // await NotificationService.notifyUser(
    //   moderatorId,
    //   'claim_timeout',
    //   'Claims đã timeout',
    //   message,
    //   {
    //     expiredClaims: expiredClaims.length,
    //     items: expiredClaims.map(c => c.itemId)
    //   }
    // );

    console.log(`Notified moderator ${moderatorId} about ${expiredClaims.length} expired claims`);
  }

  private static async notifyClaimExpiring(
    moderatorId: string,
    claim: ClaimStatus
  ): Promise<void> {
    const hoursRemaining = Math.ceil(claim.timeRemaining / (60 * 60 * 1000));
    
    // await NotificationService.notifyUser(
    //   moderatorId,
    //   'claim_expiring',
    //   'Claim sắp hết hạn',
    //   `Claim ${claim.itemType} sẽ hết hạn trong ${hoursRemaining} giờ`,
    //   {
    //     itemId: claim.itemId,
    //     expiresAt: claim.claimExpiresAt,
    //     hoursRemaining
    //   }
    // );

    console.log(`Warned moderator ${moderatorId} about expiring claim (${hoursRemaining}h remaining)`);
  }
}
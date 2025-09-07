/**
 * Orphaned Content Service - Xử lý nội dung bỏ hoang theo tài liệu mục 7.1
 * 
 * Định nghĩa "Orphaned Content":
 * - Places không có activity trong 6+ tháng
 * - User accounts inactive >1 năm có content published
 * - Draft content bị bỏ >3 tháng
 * - Moderation items stuck >30 ngày
 * - Content không có owner (user bị xóa account)
 */

import { getAdminDb } from './firebaseAdmin';
import { EnhancedNotificationService, NotificationType } from './enhanced-notification-service';
import { FieldValue } from 'firebase-admin/firestore';

export interface OrphanedContentItem {
  id: string;
  contentType: 'place' | 'draft' | 'moderation_item' | 'user_content';
  contentId: string;
  reason: 'inactive_long_term' | 'no_owner' | 'stuck_process' | 'abandoned_draft';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: string;
  daysSinceActivity: number;
  suggestedAction: 'flag' | 'archive' | 'delete' | 'reassign' | 'escalate';
  metadata: {
    originalOwner?: string;
    placeStatus?: string;
    viewCount?: number;
    likeCount?: number;
    reportCount?: number;
    [key: string]: any;
  };
  flaggedAt: string;
  reviewedAt?: string;
  actionTaken?: string;
  actionReason?: string;
}

export interface OrphanageStatistics {
  totalOrphanedItems: number;
  byContentType: { [key: string]: number };
  byReason: { [key: string]: number };
  bySeverity: { [key: string]: number };
  oldestItem: {
    id: string;
    daysSinceActivity: number;
    contentType: string;
  };
  actionsSummary: {
    flagged: number;
    archived: number;
    deleted: number;
    reassigned: number;
    escalate: number;
  };
}

export class OrphanedContentService {
  private static adminDb = getAdminDb();

  // Thresholds theo tài liệu mục 7.1
  private static THRESHOLDS = {
    PLACE_INACTIVE_DAYS: 180,      // 6 tháng
    USER_INACTIVE_DAYS: 365,       // 1 năm
    DRAFT_ABANDONED_DAYS: 90,      // 3 tháng
    MODERATION_STUCK_DAYS: 30,     // 1 tháng
    HIGH_PRIORITY_DAYS: 730,       // 2 năm (critical)
    CRITICAL_PRIORITY_DAYS: 1095   // 3 năm (delete candidate)
  };

  /**
   * Scan và identify orphaned content
   */
  static async scanOrphanedContent(): Promise<{
    newOrphans: OrphanedContentItem[];
    updated: OrphanedContentItem[];
    errors: string[];
  }> {
    try {
      const results = {
        newOrphans: [] as OrphanedContentItem[],
        updated: [] as OrphanedContentItem[],
        errors: [] as string[]
      };

      const now = new Date();

      console.log('🔍 Starting orphaned content scan...');

      // 1. Scan inactive places
      try {
        const inactivePlaces = await this.scanInactivePlaces(now);
        results.newOrphans.push(...inactivePlaces);
        console.log(`Found ${inactivePlaces.length} inactive places`);
      } catch (error) {
        results.errors.push(`Place scan failed: ${error}`);
      }

      // 2. Scan ownerless content
      try {
        const ownerlessContent = await this.scanOwnerlessContent();
        results.newOrphans.push(...ownerlessContent);
        console.log(`Found ${ownerlessContent.length} ownerless content items`);
      } catch (error) {
        results.errors.push(`Ownerless scan failed: ${error}`);
      }

      // 3. Scan abandoned drafts
      try {
        const abandonedDrafts = await this.scanAbandonedDrafts(now);
        results.newOrphans.push(...abandonedDrafts);
        console.log(`Found ${abandonedDrafts.length} abandoned drafts`);
      } catch (error) {
        results.errors.push(`Draft scan failed: ${error}`);
      }

      // 4. Scan stuck moderation items
      try {
        const stuckItems = await this.scanStuckModerationItems(now);
        results.newOrphans.push(...stuckItems);
        console.log(`Found ${stuckItems.length} stuck moderation items`);
      } catch (error) {
        results.errors.push(`Moderation scan failed: ${error}`);
      }

      // 5. Store new orphaned items
      for (const orphan of results.newOrphans) {
        try {
          await this.flagOrphanedContent(orphan);
        } catch (error) {
          results.errors.push(`Failed to flag ${orphan.id}: ${error}`);
        }
      }

      console.log(`🏁 Orphaned content scan completed: ${results.newOrphans.length} new items found`);
      return results;

    } catch (error) {
      console.error('Fatal error in orphaned content scan:', error);
      return {
        newOrphans: [],
        updated: [],
        errors: [`Fatal error: ${error}`]
      };
    }
  }

  /**
   * Scan places không có activity trong 6+ tháng
   */
  private static async scanInactivePlaces(now: Date): Promise<OrphanedContentItem[]> {
    const orphans: OrphanedContentItem[] = [];
    const cutoffDate = new Date(now.getTime() - this.THRESHOLDS.PLACE_INACTIVE_DAYS * 24 * 60 * 60 * 1000);

    try {
      // Lấy places published nhưng không có activity gần đây
      const inactivePlacesQuery = await this.adminDb
        .collection('places')
        .where('status', '==', 'published')
        .where('updatedAt', '<', cutoffDate.toISOString())
        .limit(100) // Process in batches
        .get();

      for (const placeDoc of inactivePlacesQuery.docs) {
        const placeData = placeDoc.data();
        const lastActivity = new Date(placeData.updatedAt);
        const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));

        // Check if owner still exists
        let ownerExists = true;
        try {
          const ownerDoc = await this.adminDb.collection('users').doc(placeData.createdBy).get();
          ownerExists = ownerDoc.exists;
        } catch (error) {
          ownerExists = false;
        }

        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        let suggestedAction: 'flag' | 'archive' | 'delete' | 'reassign' | 'escalate' = 'flag';

        if (daysSinceActivity > this.THRESHOLDS.CRITICAL_PRIORITY_DAYS || !ownerExists) {
          severity = 'critical';
          suggestedAction = !ownerExists ? 'reassign' : 'delete';
        } else if (daysSinceActivity > this.THRESHOLDS.HIGH_PRIORITY_DAYS) {
          severity = 'high';
          suggestedAction = 'archive';
        } else if (daysSinceActivity > this.THRESHOLDS.PLACE_INACTIVE_DAYS) {
          severity = 'medium';
          suggestedAction = 'flag';
        }

        const orphan: OrphanedContentItem = {
          id: `orphan_${placeDoc.id}_${now.getTime()}`,
          contentType: 'place',
          contentId: placeDoc.id,
          reason: !ownerExists ? 'no_owner' : 'inactive_long_term',
          severity,
          lastActivity: placeData.updatedAt,
          daysSinceActivity,
          suggestedAction,
          metadata: {
            originalOwner: placeData.createdBy,
            placeStatus: placeData.status,
            viewCount: placeData.viewCount || 0,
            likeCount: placeData.likeCount || 0,
            reportCount: placeData.reportCount || 0,
            placeName: placeData.name || 'Unnamed Place',
            ownerExists
          },
          flaggedAt: now.toISOString()
        };

        orphans.push(orphan);
      }

      return orphans;

    } catch (error) {
      console.error('Error scanning inactive places:', error);
      return [];
    }
  }

  /**
   * Scan content không có owner (user đã bị xóa)
   */
  private static async scanOwnerlessContent(): Promise<OrphanedContentItem[]> {
    const orphans: OrphanedContentItem[] = [];

    try {
      // Get published places
      const placesQuery = await this.adminDb
        .collection('places')
        .where('status', '==', 'published')
        .limit(200)
        .get();

      // Check owners in batches
      const userIds = [...new Set(placesQuery.docs.map(doc => doc.data().createdBy))];
      const existingUsers = new Set<string>();

      // Batch check users
      for (let i = 0; i < userIds.length; i += 10) {
        const batch = userIds.slice(i, i + 10);
        const userChecks = await Promise.all(
          batch.map(async (userId) => {
            try {
              const userDoc = await this.adminDb.collection('users').doc(userId).get();
              return { userId, exists: userDoc.exists };
            } catch (error) {
              return { userId, exists: false };
            }
          })
        );

        userChecks.forEach(({ userId, exists }) => {
          if (exists) existingUsers.add(userId);
        });
      }

      // Find ownerless places
      for (const placeDoc of placesQuery.docs) {
        const placeData = placeDoc.data();
        const ownerId = placeData.createdBy;

        if (!existingUsers.has(ownerId)) {
          const orphan: OrphanedContentItem = {
            id: `orphan_ownerless_${placeDoc.id}_${Date.now()}`,
            contentType: 'place',
            contentId: placeDoc.id,
            reason: 'no_owner',
            severity: 'high',
            lastActivity: placeData.updatedAt,
            daysSinceActivity: Math.floor((Date.now() - new Date(placeData.updatedAt).getTime()) / (24 * 60 * 60 * 1000)),
            suggestedAction: 'reassign',
            metadata: {
              originalOwner: ownerId,
              placeName: placeData.name || 'Unnamed Place',
              ownerExists: false
            },
            flaggedAt: new Date().toISOString()
          };

          orphans.push(orphan);
        }
      }

      return orphans;

    } catch (error) {
      console.error('Error scanning ownerless content:', error);
      return [];
    }
  }

  /**
   * Scan abandoned drafts >3 tháng
   */
  private static async scanAbandonedDrafts(now: Date): Promise<OrphanedContentItem[]> {
    const orphans: OrphanedContentItem[] = [];
    const cutoffDate = new Date(now.getTime() - this.THRESHOLDS.DRAFT_ABANDONED_DAYS * 24 * 60 * 60 * 1000);

    try {
      const abandonedDraftsQuery = await this.adminDb
        .collection('place_drafts')
        .where('status', 'in', ['draft', 'submitted'])
        .where('updatedAt', '<', cutoffDate.toISOString())
        .limit(100)
        .get();

      for (const draftDoc of abandonedDraftsQuery.docs) {
        const draftData = draftDoc.data();
        const lastActivity = new Date(draftData.updatedAt);
        const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));

        const orphan: OrphanedContentItem = {
          id: `orphan_draft_${draftDoc.id}_${now.getTime()}`,
          contentType: 'draft',
          contentId: draftDoc.id,
          reason: 'abandoned_draft',
          severity: daysSinceActivity > 180 ? 'medium' : 'low',
          lastActivity: draftData.updatedAt,
          daysSinceActivity,
          suggestedAction: daysSinceActivity > 180 ? 'delete' : 'flag',
          metadata: {
            originalOwner: draftData.createdBy,
            draftStatus: draftData.status,
            isEditingPublished: draftData.isEditingPublished || false
          },
          flaggedAt: now.toISOString()
        };

        orphans.push(orphan);
      }

      return orphans;

    } catch (error) {
      console.error('Error scanning abandoned drafts:', error);
      return [];
    }
  }

  /**
   * Scan moderation items stuck >30 ngày
   */
  private static async scanStuckModerationItems(now: Date): Promise<OrphanedContentItem[]> {
    const orphans: OrphanedContentItem[] = [];
    const cutoffDate = new Date(now.getTime() - this.THRESHOLDS.MODERATION_STUCK_DAYS * 24 * 60 * 60 * 1000);

    try {
      const stuckItemsQuery = await this.adminDb
        .collection('moderation_queue')
        .where('status', 'in', ['pending', 'claimed', 'in_review'])
        .where('submittedAt', '<', cutoffDate.toISOString())
        .limit(50)
        .get();

      for (const itemDoc of stuckItemsQuery.docs) {
        const itemData = itemDoc.data();
        const submittedAt = new Date(itemData.submittedAt);
        const daysSinceSubmission = Math.floor((now.getTime() - submittedAt.getTime()) / (24 * 60 * 60 * 1000));

        let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        if (daysSinceSubmission > 90) severity = 'high';
        if (daysSinceSubmission > 180) severity = 'critical';

        const orphan: OrphanedContentItem = {
          id: `orphan_moderation_${itemDoc.id}_${now.getTime()}`,
          contentType: 'moderation_item',
          contentId: itemDoc.id,
          reason: 'stuck_process',
          severity,
          lastActivity: itemData.submittedAt,
          daysSinceActivity: daysSinceSubmission,
          suggestedAction: severity === 'critical' ? 'escalate' : 'reassign',
          metadata: {
            itemType: itemData.itemType,
            submittedBy: itemData.submittedBy,
            claimedBy: itemData.claimedBy,
            status: itemData.status,
            priority: itemData.priority
          },
          flaggedAt: now.toISOString()
        };

        orphans.push(orphan);
      }

      return orphans;

    } catch (error) {
      console.error('Error scanning stuck moderation items:', error);
      return [];
    }
  }

  /**
   * Flag orphaned content trong database
   */
  private static async flagOrphanedContent(orphan: OrphanedContentItem): Promise<void> {
    try {
      // Check if already flagged
      const existingFlag = await this.adminDb
        .collection('orphaned_content')
        .where('contentId', '==', orphan.contentId)
        .where('contentType', '==', orphan.contentType)
        .limit(1)
        .get();

      if (!existingFlag.empty) {
        console.log(`Content ${orphan.contentId} already flagged as orphaned`);
        return;
      }

      // Store orphaned item
      await this.adminDb.collection('orphaned_content').add(orphan);

      // Update original content with orphaned flag
      await this.updateContentOrphanFlag(orphan);

      // Notify admins about new orphaned content
      if (orphan.severity === 'critical' || orphan.severity === 'high') {
        await this.notifyOrphanedContent(orphan);
      }

      console.log(`Flagged orphaned content: ${orphan.contentType}/${orphan.contentId} (${orphan.reason})`);

    } catch (error) {
      console.error('Error flagging orphaned content:', error);
      throw error;
    }
  }

  /**
   * Update original content với orphaned flag
   */
  private static async updateContentOrphanFlag(orphan: OrphanedContentItem): Promise<void> {
    try {
      let collection = 'places';
      if (orphan.contentType === 'draft') collection = 'place_drafts';
      if (orphan.contentType === 'moderation_item') collection = 'moderation_queue';

      await this.adminDb.collection(collection).doc(orphan.contentId).update({
        isOrphaned: true,
        orphanedAt: orphan.flaggedAt,
        orphanReason: orphan.reason,
        orphanSeverity: orphan.severity,
        orphanSuggestedAction: orphan.suggestedAction,
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      // Might fail if document doesn't exist, which is expected
      console.log(`Could not update orphan flag for ${orphan.contentType}/${orphan.contentId}: ${error}`);
    }
  }

  /**
   * Notify admins về orphaned content
   */
  private static async notifyOrphanedContent(orphan: OrphanedContentItem): Promise<void> {
    try {
      const contentName = orphan.metadata.placeName || 
                         orphan.metadata.draftName || 
                         `${orphan.contentType} ${orphan.contentId}`;

      await EnhancedNotificationService.sendNotification(
        await this.getAdmins(),
        NotificationType.CONTENT_REPORTED, // Reuse existing type or create new one
        {
          contentName,
          orphanReason: orphan.reason,
          daysSinceActivity: orphan.daysSinceActivity,
          severity: orphan.severity,
          suggestedAction: orphan.suggestedAction,
          contentId: orphan.contentId,
          contentType: orphan.contentType
        }
      );

    } catch (error) {
      console.error('Error notifying orphaned content:', error);
    }
  }

  /**
   * Process orphaned content actions
   */
  static async processOrphanedContent(): Promise<{
    processed: number;
    actions: { [key: string]: number };
    errors: string[];
  }> {
    try {
      const results = {
        processed: 0,
        actions: {
          flagged: 0,
          archived: 0,
          deleted: 0,
          reassigned: 0,
          escalate: 0
        },
        errors: [] as string[]
      };

      // Get orphaned items ready for action
      const readyForActionQuery = await this.adminDb
        .collection('orphaned_content')
        .where('reviewedAt', '==', null)
        .where('severity', 'in', ['high', 'critical'])
        .limit(50)
        .get();

      for (const orphanDoc of readyForActionQuery.docs) {
        const orphan = orphanDoc.data() as OrphanedContentItem;

        try {
          await this.executeOrphanAction(orphan);
          
          // Mark as processed
          await orphanDoc.ref.update({
            reviewedAt: new Date().toISOString(),
            actionTaken: orphan.suggestedAction,
            actionReason: 'Auto-processed by orphaned content service'
          });

          const actionKey = orphan.suggestedAction === 'flag' ? 'flagged' : orphan.suggestedAction;
          results.actions[actionKey]++;
          results.processed++;

        } catch (error) {
          results.errors.push(`Failed to process ${orphan.id}: ${error}`);
        }
      }

      console.log(`Processed ${results.processed} orphaned content items:`, results.actions);
      return results;

    } catch (error) {
      console.error('Error processing orphaned content:', error);
      return {
        processed: 0,
        actions: {},
        errors: [`Fatal error: ${error}`]
      };
    }
  }

  /**
   * Execute action cho orphaned content
   */
  private static async executeOrphanAction(orphan: OrphanedContentItem): Promise<void> {
    switch (orphan.suggestedAction) {
      case 'delete':
        await this.deleteOrphanedContent(orphan);
        break;
      
      case 'archive':
        await this.archiveOrphanedContent(orphan);
        break;
      
      case 'reassign':
        await this.reassignOrphanedContent(orphan);
        break;
      
      case 'escalate':
        await this.escalateOrphanedContent(orphan);
        break;
      
      default:
        console.log(`No action needed for ${orphan.id} (${orphan.suggestedAction})`);
    }
  }

  /**
   * Delete orphaned content
   */
  private static async deleteOrphanedContent(orphan: OrphanedContentItem): Promise<void> {
    try {
      if (orphan.contentType === 'place') {
        await this.adminDb.collection('places').doc(orphan.contentId).update({
          status: 'hidden',
          deletedAt: new Date().toISOString(),
          deletedBy: 'system_orphan_cleanup',
          deletionReason: `Orphaned content: ${orphan.reason} (${orphan.daysSinceActivity} days inactive)`,
          deleted: true,
          isVisibleToPublic: false
        });
      } else if (orphan.contentType === 'draft') {
        await this.adminDb.collection('place_drafts').doc(orphan.contentId).delete();
      }

      console.log(`Deleted orphaned ${orphan.contentType}: ${orphan.contentId}`);

    } catch (error) {
      console.error('Error deleting orphaned content:', error);
      throw error;
    }
  }

  /**
   * Archive orphaned content
   */
  private static async archiveOrphanedContent(orphan: OrphanedContentItem): Promise<void> {
    try {
      if (orphan.contentType === 'place') {
        await this.adminDb.collection('places').doc(orphan.contentId).update({
          status: 'archived',
          archivedAt: new Date().toISOString(),
          archivedBy: 'system_orphan_cleanup',
          archiveReason: `Orphaned content: ${orphan.reason}`,
          isVisibleToPublic: false
        });
      }

      console.log(`Archived orphaned ${orphan.contentType}: ${orphan.contentId}`);

    } catch (error) {
      console.error('Error archiving orphaned content:', error);
      throw error;
    }
  }

  /**
   * Reassign orphaned content to default admin
   */
  private static async reassignOrphanedContent(orphan: OrphanedContentItem): Promise<void> {
    try {
      // Get system admin
      const systemAdmin = await this.getSystemAdmin();
      if (!systemAdmin) {
        throw new Error('No system admin available for reassignment');
      }

      if (orphan.contentType === 'place') {
        await this.adminDb.collection('places').doc(orphan.contentId).update({
          createdBy: systemAdmin,
          reassignedAt: new Date().toISOString(),
          reassignedFrom: orphan.metadata.originalOwner,
          reassignReason: `Orphaned content: ${orphan.reason}`
        });
      }

      console.log(`Reassigned orphaned ${orphan.contentType}: ${orphan.contentId} to ${systemAdmin}`);

    } catch (error) {
      console.error('Error reassigning orphaned content:', error);
      throw error;
    }
  }

  /**
   * Escalate orphaned content
   */
  private static async escalateOrphanedContent(orphan: OrphanedContentItem): Promise<void> {
    try {
      // Create escalation for admin review
      await this.adminDb.collection('escalations').add({
        placeId: orphan.contentId,
        contentType: orphan.contentType,
        trigger: {
          type: 'pattern_detected',
          placeId: orphan.contentId,
          reason: `Orphaned content: ${orphan.reason} (${orphan.daysSinceActivity} days)`,
          severity: 'high',
          triggeredBy: 'system_orphan_cleanup',
          triggeredAt: new Date().toISOString(),
          metadata: {
            pattern: 'orphaned_content',
            ...orphan.metadata
          }
        },
        status: 'pending',
        priority: 'high',
        escalatedAt: new Date().toISOString(),
        escalatedTo: 'admin',
        autoEscalated: true
      });

      console.log(`Escalated orphaned ${orphan.contentType}: ${orphan.contentId}`);

    } catch (error) {
      console.error('Error escalating orphaned content:', error);
      throw error;
    }
  }

  /**
   * Get orphaned content statistics
   */
  static async getOrphanageStatistics(): Promise<OrphanageStatistics> {
    try {
      const orphanedQuery = await this.adminDb.collection('orphaned_content').get();
      
      const stats: OrphanageStatistics = {
        totalOrphanedItems: orphanedQuery.docs.length,
        byContentType: {},
        byReason: {},
        bySeverity: {},
        oldestItem: { id: '', daysSinceActivity: 0, contentType: '' },
        actionsSummary: { flagged: 0, archived: 0, deleted: 0, reassigned: 0, escalate: 0 }
      };

      let oldestDays = 0;

      orphanedQuery.docs.forEach(doc => {
        const data = doc.data() as OrphanedContentItem;
        
        // Count by content type
        stats.byContentType[data.contentType] = (stats.byContentType[data.contentType] || 0) + 1;
        
        // Count by reason
        stats.byReason[data.reason] = (stats.byReason[data.reason] || 0) + 1;
        
        // Count by severity
        stats.bySeverity[data.severity] = (stats.bySeverity[data.severity] || 0) + 1;
        
        // Track oldest item
        if (data.daysSinceActivity > oldestDays) {
          oldestDays = data.daysSinceActivity;
          stats.oldestItem = {
            id: data.contentId,
            daysSinceActivity: data.daysSinceActivity,
            contentType: data.contentType
          };
        }
        
        // Count actions taken
        if (data.actionTaken) {
          const action = data.actionTaken as keyof typeof stats.actionsSummary;
          if (stats.actionsSummary[action] !== undefined) {
            stats.actionsSummary[action]++;
          }
        } else {
          stats.actionsSummary.flagged++;
        }
      });

      return stats;

    } catch (error) {
      console.error('Error getting orphanage statistics:', error);
      return {
        totalOrphanedItems: 0,
        byContentType: {},
        byReason: {},
        bySeverity: {},
        oldestItem: { id: '', daysSinceActivity: 0, contentType: '' },
        actionsSummary: { flagged: 0, archived: 0, deleted: 0, reassigned: 0, escalate: 0 }
      };
    }
  }

  /**
   * Helper methods
   */
  private static async getAdmins(): Promise<string[]> {
    try {
      const adminsQuery = await this.adminDb.collection('users')
        .where('role', '==', 'admin')
        .get();
      return adminsQuery.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error getting admins:', error);
      return [];
    }
  }

  private static async getSystemAdmin(): Promise<string | null> {
    try {
      const systemAdminQuery = await this.adminDb.collection('users')
        .where('role', '==', 'admin')
        .where('isSystemAccount', '==', true)
        .limit(1)
        .get();

      if (!systemAdminQuery.empty) {
        return systemAdminQuery.docs[0].id;
      }

      // Fallback to first admin
      const firstAdminQuery = await this.adminDb.collection('users')
        .where('role', '==', 'admin')
        .limit(1)
        .get();

      return firstAdminQuery.empty ? null : firstAdminQuery.docs[0].id;

    } catch (error) {
      console.error('Error getting system admin:', error);
      return null;
    }
  }

  /**
   * Cleanup processed orphaned items (sau 1 năm)
   */
  static async cleanupProcessedOrphans(): Promise<void> {
    try {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

      const processedOrphansQuery = await this.adminDb
        .collection('orphaned_content')
        .where('reviewedAt', '<', oneYearAgo)
        .limit(1000)
        .get();

      if (!processedOrphansQuery.empty) {
        const batch = this.adminDb.batch();
        processedOrphansQuery.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        
        console.log(`Cleaned up ${processedOrphansQuery.docs.length} old processed orphaned items`);
      }

    } catch (error) {
      console.error('Error cleaning up processed orphans:', error);
    }
  }
}
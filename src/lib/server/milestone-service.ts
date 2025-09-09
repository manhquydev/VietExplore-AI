/**
 * Milestone Notification Service
 * Handles milestone detection and notifications for place achievements
 */

import { getAdminDb } from './firebaseAdmin';
import { NotificationService } from './notification-service';
import { NotificationPreferenceService } from './notification-preference-service';

export class MilestoneService {
  private static db = getAdminDb();

  // Milestone thresholds
  private static readonly MILESTONES = {
    views: [100, 500, 1000, 5000, 10000, 50000, 100000],
    likes: [10, 50, 100, 500, 1000, 5000, 10000],
    saves: [5, 25, 50, 250, 500, 2500, 5000]
  };

  /**
   * Check and trigger milestone notifications for a place
   */
  static async checkMilestones(
    placeId: string,
    metricType: 'views' | 'likes' | 'saves',
    newValue: number,
    previousValue: number = 0
  ): Promise<void> {
    try {
      const milestones = this.MILESTONES[metricType];
      
      // Find crossed milestones
      const crossedMilestones = milestones.filter(
        milestone => previousValue < milestone && newValue >= milestone
      );

      if (crossedMilestones.length === 0) return;

      // Get place data and owner
      const placeDoc = await this.db.collection('places').doc(placeId).get();
      if (!placeDoc.exists) return;

      const placeData = placeDoc.data();
      const placeOwnerId = placeData?.createdBy;
      
      if (!placeOwnerId) return;

      // Send notifications for each crossed milestone
      for (const milestone of crossedMilestones) {
        await this.sendMilestoneNotification(
          placeOwnerId,
          placeId,
          placeData.name || 'Địa điểm',
          milestone,
          metricType
        );

        // Log milestone achievement
        await this.logMilestone(placeId, placeOwnerId, metricType, milestone);
      }
    } catch (error) {
      console.error('Error checking milestones:', error);
    }
  }

  /**
   * Send milestone notification to place owner
   */
  private static async sendMilestoneNotification(
    userId: string,
    placeId: string,
    placeName: string,
    milestone: number,
    metricType: 'views' | 'likes' | 'saves'
  ): Promise<void> {
    try {
      // Check if user wants milestone notifications
      const shouldSend = await NotificationPreferenceService.shouldSendNotification(
        userId,
        'place_milestone',
        'medium'
      );

      if (!shouldSend) return;

      await NotificationService.notifyPlaceMilestone(
        userId,
        placeId,
        placeName,
        milestone,
        metricType
      );
    } catch (error) {
      console.error('Error sending milestone notification:', error);
    }
  }

  /**
   * Log milestone achievement for analytics
   */
  private static async logMilestone(
    placeId: string,
    userId: string,
    metricType: 'views' | 'likes' | 'saves',
    milestone: number
  ): Promise<void> {
    try {
      await this.db.collection('place_milestones').add({
        placeId,
        userId,
        metricType,
        milestone,
        achievedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging milestone:', error);
    }
  }

  /**
   * Get place milestones for analytics
   */
  static async getPlaceMilestones(placeId: string): Promise<any[]> {
    try {
      const milestonesQuery = await this.db.collection('place_milestones')
        .where('placeId', '==', placeId)
        .orderBy('achievedAt', 'desc')
        .get();

      return milestonesQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting place milestones:', error);
      return [];
    }
  }

  /**
   * Get user's milestone achievements
   */
  static async getUserMilestones(userId: string): Promise<any[]> {
    try {
      const milestonesQuery = await this.db.collection('place_milestones')
        .where('userId', '==', userId)
        .orderBy('achievedAt', 'desc')
        .limit(50)
        .get();

      return milestonesQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user milestones:', error);
      return [];
    }
  }

  /**
   * Check if a milestone has been achieved before
   */
  static async hasMilestoneBeenAchieved(
    placeId: string,
    metricType: 'views' | 'likes' | 'saves',
    milestone: number
  ): Promise<boolean> {
    try {
      const existingMilestone = await this.db.collection('place_milestones')
        .where('placeId', '==', placeId)
        .where('metricType', '==', metricType)
        .where('milestone', '==', milestone)
        .limit(1)
        .get();

      return !existingMilestone.empty;
    } catch (error) {
      console.error('Error checking milestone achievement:', error);
      return false;
    }
  }

  /**
   * Get milestone statistics for admin dashboard
   */
  static async getMilestoneStats(): Promise<{
    totalMilestones: number;
    milestonesByType: Record<string, number>;
    recentMilestones: any[];
    topPerformers: any[];
  }> {
    try {
      // Get total milestones
      const totalQuery = await this.db.collection('place_milestones').get();
      const totalMilestones = totalQuery.size;

      // Group by metric type
      const milestonesByType: Record<string, number> = {};
      totalQuery.docs.forEach(doc => {
        const data = doc.data();
        const type = data.metricType;
        milestonesByType[type] = (milestonesByType[type] || 0) + 1;
      });

      // Get recent milestones (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const recentQuery = await this.db.collection('place_milestones')
        .where('achievedAt', '>=', weekAgo.toISOString())
        .orderBy('achievedAt', 'desc')
        .limit(20)
        .get();

      const recentMilestones = recentQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get top performers (places with most milestones)
      const allMilestones = totalQuery.docs.map(doc => doc.data());
      const placeCount: Record<string, number> = {};
      
      allMilestones.forEach(milestone => {
        const placeId = milestone.placeId;
        placeCount[placeId] = (placeCount[placeId] || 0) + 1;
      });

      const topPerformers = Object.entries(placeCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([placeId, count]) => ({ placeId, milestoneCount: count }));

      return {
        totalMilestones,
        milestonesByType,
        recentMilestones,
        topPerformers
      };
    } catch (error) {
      console.error('Error getting milestone stats:', error);
      return {
        totalMilestones: 0,
        milestonesByType: {},
        recentMilestones: [],
        topPerformers: []
      };
    }
  }

  /**
   * Batch check milestones for multiple places
   * Useful for migration or bulk updates
   */
  static async batchCheckMilestones(placeIds: string[]): Promise<void> {
    try {
      const batchSize = 10;
      
      for (let i = 0; i < placeIds.length; i += batchSize) {
        const batch = placeIds.slice(i, i + batchSize);
        
        const promises = batch.map(async (placeId) => {
          const placeDoc = await this.db.collection('places').doc(placeId).get();
          if (!placeDoc.exists) return;

          const placeData = placeDoc.data();
          const stats = placeData?.stats || {};

          // Check each metric type
          for (const metricType of ['views', 'likes', 'saves'] as const) {
            const currentValue = stats[metricType] || 0;
            if (currentValue > 0) {
              await this.checkMilestones(placeId, metricType, currentValue, 0);
            }
          }
        });

        await Promise.all(promises);
        
        // Small delay between batches to avoid overwhelming the database
        if (i + batchSize < placeIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error in batch milestone check:', error);
    }
  }
}
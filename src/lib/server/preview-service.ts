import { getAdminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Preview Service for draft versions - Section 2.3.1
 * "Vercel Preview URL cho draft version (chỉ authorized users)"
 * "Public version vẫn served từ CDN"
 */
export class PreviewService {
  private static db = getAdminDb();

  /**
   * Generate preview token for authorized users to view drafts
   */
  static generatePreviewToken(draftId: string, userId: string, expiresInHours: number = 24): string {
    const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
    const payload = {
      draftId,
      userId,
      expiresAt,
      type: 'place_draft_preview'
    };

    // Simple token generation (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return token;
  }

  /**
   * Verify preview token
   */
  static verifyPreviewToken(token: string): { valid: boolean; draftId?: string; userId?: string } {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64url').toString());
      
      if (Date.now() > payload.expiresAt) {
        return { valid: false };
      }

      return {
        valid: true,
        draftId: payload.draftId,
        userId: payload.userId
      };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Create preview URL for draft place
   * Section 2.3.1: "Vercel Preview URL cho draft version"
   */
  static async createPreviewUrl(
    draftId: string, 
    userId: string, 
    baseUrl: string
  ): Promise<string> {
    try {
      // Generate preview token
      const token = this.generatePreviewToken(draftId, userId);
      
      // Store preview session in database
      await this.db.collection('preview_sessions').doc(draftId).set({
        draftId,
        userId,
        token,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(),
        accessCount: 0
      });

      // Return preview URL with token
      const previewUrl = `${baseUrl}/drafts/${draftId}/preview?token=${token}`;
      
      console.log(`Created preview URL for draft ${draftId}`);
      return previewUrl;

    } catch (error) {
      console.error('Error creating preview URL:', error);
      throw error;
    }
  }

  /**
   * Check if user is authorized to view draft
   * Section 2.3.1: "chỉ authorized users"
   */
  static async isAuthorizedForPreview(draftId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is the creator
      const draftDoc = await this.db.collection('place_drafts').doc(draftId).get();
      
      if (!draftDoc.exists) {
        return false;
      }

      const draftData = draftDoc.data();
      
      // Creator can always view
      if (draftData?.createdBy === userId) {
        return true;
      }

      // Admin and moderators can view
      const userDoc = await this.db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData?.role && ['admin', 'moderator'].includes(userData.role)) {
        return true;
      }

      return false;

    } catch (error) {
      console.error('Error checking preview authorization:', error);
      return false;
    }
  }

  /**
   * Get draft content for preview (Section 2.3.1)
   * Ensures public version vẫn served từ CDN
   */
  static async getDraftForPreview(draftId: string, userId: string): Promise<any> {
    try {
      // Check authorization first
      const authorized = await this.isAuthorizedForPreview(draftId, userId);
      
      if (!authorized) {
        throw new Error('Unauthorized to view this draft');
      }

      // Get draft from place_drafts collection
      const draftDoc = await this.db.collection('place_drafts').doc(draftId).get();
      
      if (!draftDoc.exists) {
        throw new Error('Draft not found');
      }

      const draftData = draftDoc.data();
      
      // Track preview access
      await this.trackPreviewAccess(draftId, userId);
      
      return {
        id: draftDoc.id,
        ...draftData,
        isPreview: true,
        previewAccessedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting draft for preview:', error);
      throw error;
    }
  }

  /**
   * Track preview access for analytics
   */
  static async trackPreviewAccess(draftId: string, userId: string): Promise<void> {
    try {
      await this.db.collection('preview_sessions').doc(draftId).update({
        lastAccessedAt: new Date().toISOString(),
        lastAccessedBy: userId,
        accessCount: FieldValue.increment(1)
      });
    } catch (error) {
      console.error('Error tracking preview access:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Clean up expired preview sessions
   */
  static async cleanupExpiredPreviews(): Promise<void> {
    try {
      const now = new Date().toISOString();
      const expiredQuery = await this.db.collection('preview_sessions')
        .where('expiresAt', '<', now)
        .get();

      const deletePromises = expiredQuery.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);

      console.log(`Cleaned up ${expiredQuery.size} expired preview sessions`);
    } catch (error) {
      console.error('Error cleaning up expired previews:', error);
    }
  }
}
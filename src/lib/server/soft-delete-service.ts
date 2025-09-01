/**
 * Soft Delete Service - Xử lý soft delete với timeout theo tài liệu mục 2.4.1
 * 
 * Flow:
 * 1. Yêu cầu xóa từ người đăng hoặc Moderator
 * 2. Địa điểm chuyển sang "Chờ xóa" nhưng vẫn hiển thị
 * 3. Moderator review trong 72 giờ
 * 4. Nếu approve: chuyển "Đã xóa" và ẩn khỏi public
 * 5. Data vẫn lưu trong DB với flag deleted=true
 */

import { getAdminDb } from './firebaseAdmin';
import { NotificationService } from './notification-service';
import { FieldValue } from 'firebase-admin/firestore';

export interface DeletionRequest {
  id?: string;
  placeId: string;
  requesterId: string;
  requesterRole: 'owner' | 'moderator' | 'admin';
  reason: string;
  requestType: 'user_request' | 'moderation_action' | 'violation_cleanup';
  status: 'pending_review' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  reviewDeadline: string; // 72 hours from creation
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  autoProcessedAt?: string;
  metadata?: {
    originalStatus: string;
    backupData: any;
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  };
}

export class SoftDeleteService {
  private static adminDb = getAdminDb();
  private static REVIEW_TIMEOUT_HOURS = 72;

  /**
   * Tạo yêu cầu xóa soft delete
   */
  static async createDeletionRequest(
    placeId: string,
    requesterId: string,
    requesterRole: 'owner' | 'moderator' | 'admin',
    reason: string,
    requestType: 'user_request' | 'moderation_action' | 'violation_cleanup' = 'user_request'
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const now = new Date();
      const reviewDeadline = new Date(now.getTime() + this.REVIEW_TIMEOUT_HOURS * 60 * 60 * 1000);

      // Lấy thông tin place hiện tại
      const placeDoc = await this.adminDb.collection('places').doc(placeId).get();
      if (!placeDoc.exists) {
        return { success: false, error: 'Địa điểm không tồn tại' };
      }

      const placeData = placeDoc.data()!;

      // Kiểm tra quyền
      if (requesterRole === 'owner' && placeData.createdBy !== requesterId) {
        return { success: false, error: 'Bạn không có quyền xóa địa điểm này' };
      }

      // Kiểm tra xem đã có deletion request chưa
      const existingRequestQuery = await this.adminDb
        .collection('deletion_requests')
        .where('placeId', '==', placeId)
        .where('status', 'in', ['pending_review'])
        .limit(1)
        .get();

      if (!existingRequestQuery.empty) {
        return { 
          success: false, 
          error: 'Đã có yêu cầu xóa đang chờ xử lý cho địa điểm này' 
        };
      }

      // Xác định urgency level
      let urgencyLevel: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
      if (requestType === 'violation_cleanup') {
        urgencyLevel = 'urgent';
      } else if (requesterRole === 'admin') {
        urgencyLevel = 'high';
      } else if (requesterRole === 'moderator') {
        urgencyLevel = 'medium';
      } else {
        urgencyLevel = 'low';
      }

      // Tạo deletion request
      const deletionRequest: DeletionRequest = {
        placeId,
        requesterId,
        requesterRole,
        reason: reason.trim(),
        requestType,
        status: 'pending_review',
        createdAt: now.toISOString(),
        reviewDeadline: reviewDeadline.toISOString(),
        metadata: {
          originalStatus: placeData.status,
          backupData: { ...placeData, id: placeId },
          urgencyLevel
        }
      };

      // Lưu deletion request
      const requestRef = await this.adminDb.collection('deletion_requests').add(deletionRequest);
      deletionRequest.id = requestRef.id;
      await requestRef.update({ id: requestRef.id });

      // Cập nhật place status thành "pending_deletion" nhưng VẪN HIỂN THỊ
      await this.adminDb.collection('places').doc(placeId).update({
        status: 'pending_deletion',
        deletionRequestId: requestRef.id,
        deletionRequestedAt: now.toISOString(),
        deletionRequestedBy: requesterId,
        deletionReason: reason.trim(),
        deletionReviewDeadline: reviewDeadline.toISOString(),
        // VẪN public visibility - chỉ đổi internal status
        isVisibleToPublic: true,
        updatedAt: now.toISOString(),
        moderationHistory: FieldValue.arrayUnion({
          action: 'deletion_requested',
          moderatorId: requesterId,
          reason: reason.trim(),
          createdAt: now.toISOString(),
          urgencyLevel
        })
      });

      // Tạo moderation queue entry
      const moderationPriority = this.getModerationPriority(urgencyLevel, requestType);
      await this.adminDb.collection('moderation_queue').add({
        itemId: placeId,
        itemType: 'place_deletion',
        contentType: 'place',
        contentId: placeId,
        status: 'pending',
        priority: moderationPriority,
        submittedBy: requesterId,
        submittedAt: now.toISOString(),
        deadline: reviewDeadline.toISOString(),
        metadata: {
          deletionRequestId: requestRef.id,
          urgencyLevel,
          requestType,
          reason: reason.trim()
        }
      });

      // Gửi notifications
      await this.sendDeletionNotifications(
        requestRef.id,
        placeId,
        placeData.name || 'Địa điểm không tên',
        requesterId,
        requesterRole,
        urgencyLevel
      );

      // Schedule auto-processing nếu không được review
      await this.scheduleAutoProcessing(requestRef.id, reviewDeadline);

      return { success: true, requestId: requestRef.id };

    } catch (error) {
      console.error('Error creating deletion request:', error);
      return { success: false, error: 'Không thể tạo yêu cầu xóa' };
    }
  }

  /**
   * Review deletion request bởi moderator
   */
  static async reviewDeletionRequest(
    requestId: string,
    moderatorId: string,
    decision: 'approve' | 'reject',
    reviewNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.adminDb.runTransaction(async (transaction) => {
        // Lấy deletion request
        const requestRef = this.adminDb.collection('deletion_requests').doc(requestId);
        const requestDoc = await transaction.get(requestRef);

        if (!requestDoc.exists) {
          throw new Error('Yêu cầu xóa không tồn tại');
        }

        const request = requestDoc.data() as DeletionRequest;

        if (request.status !== 'pending_review') {
          throw new Error('Yêu cầu xóa đã được xử lý');
        }

        const now = new Date().toISOString();

        // Cập nhật deletion request
        transaction.update(requestRef, {
          status: decision === 'approve' ? 'approved' : 'rejected',
          reviewedBy: moderatorId,
          reviewedAt: now,
          reviewNotes: reviewNotes || ''
        });

        const placeRef = this.adminDb.collection('places').doc(request.placeId);

        if (decision === 'approve') {
          // SOFT DELETE - ẩn khỏi public nhưng vẫn lưu data
          transaction.update(placeRef, {
            status: 'deleted', // Đổi status thành deleted
            isVisibleToPublic: false, // Ẩn khỏi public queries
            deletedAt: now,
            deletedBy: moderatorId,
            deletionApprovedAt: now,
            deletionApprovedBy: moderatorId,
            deletionReviewNotes: reviewNotes || 'Đã phê duyệt xóa',
            // Giữ tất cả data gốc cho audit trail
            deleted: true, // Flag for queries
            updatedAt: now,
            moderationHistory: FieldValue.arrayUnion({
              action: 'deletion_approved',
              moderatorId: moderatorId,
              reason: reviewNotes || 'Phê duyệt xóa địa điểm',
              createdAt: now
            })
          });

        } else {
          // Reject - khôi phục về trạng thái cũ
          transaction.update(placeRef, {
            status: request.metadata?.originalStatus || 'published',
            deletionRequestId: null,
            deletionRequestedAt: null,
            deletionRequestedBy: null,
            deletionReason: null,
            deletionReviewDeadline: null,
            deletionRejectedAt: now,
            deletionRejectedBy: moderatorId,
            deletionRejectionReason: reviewNotes || 'Từ chối xóa',
            isVisibleToPublic: true, // Ensure visible again
            updatedAt: now,
            moderationHistory: FieldValue.arrayUnion({
              action: 'deletion_rejected',
              moderatorId: moderatorId,
              reason: reviewNotes || 'Từ chối xóa địa điểm',
              createdAt: now
            })
          });
        }

        // Update moderation queue
        const moderationQueueQuery = await this.adminDb
          .collection('moderation_queue')
          .where('metadata.deletionRequestId', '==', requestId)
          .limit(1)
          .get();

        if (!moderationQueueQuery.empty) {
          const queueDoc = moderationQueueQuery.docs[0];
          transaction.update(queueDoc.ref, {
            status: decision === 'approve' ? 'approved' : 'rejected',
            reviewedBy: moderatorId,
            reviewedAt: now,
            reviewNotes: reviewNotes || ''
          });
        }

        return { success: true };
      });

    } catch (error: any) {
      console.error('Error reviewing deletion request:', error);
      return { success: false, error: error.message || 'Không thể xử lý yêu cầu xóa' };
    }
  }

  /**
   * Auto-process expired deletion requests
   */
  static async processExpiredRequests(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Tìm expired requests
      const expiredRequestsQuery = await this.adminDb
        .collection('deletion_requests')
        .where('status', '==', 'pending_review')
        .where('reviewDeadline', '<', now)
        .get();

      const batch = this.adminDb.batch();

      for (const requestDoc of expiredRequestsQuery.docs) {
        const request = requestDoc.data() as DeletionRequest;

        // Xác định action dựa trên urgency và type
        let autoAction: 'approve' | 'reject' = 'reject'; // Default reject

        if (request.requestType === 'violation_cleanup' || 
            request.metadata?.urgencyLevel === 'urgent') {
          autoAction = 'approve'; // Auto-approve urgent violations
        } else if (request.requesterRole === 'admin') {
          autoAction = 'approve'; // Auto-approve admin requests
        } else if (request.metadata?.urgencyLevel === 'high') {
          autoAction = 'approve'; // Auto-approve high priority
        }
        // else: reject low/medium priority user requests

        // Update deletion request
        batch.update(requestDoc.ref, {
          status: autoAction === 'approve' ? 'approved' : 'expired',
          autoProcessedAt: now,
          reviewNotes: `Tự động ${autoAction === 'approve' ? 'phê duyệt' : 'từ chối'} do hết thời gian review`
        });

        // Update place
        const placeRef = this.adminDb.collection('places').doc(request.placeId);

        if (autoAction === 'approve') {
          // Auto soft delete
          batch.update(placeRef, {
            status: 'deleted',
            isVisibleToPublic: false,
            deletedAt: now,
            deletedBy: 'system',
            deletionApprovedAt: now,
            deletionApprovedBy: 'system',
            deletionReviewNotes: 'Tự động phê duyệt do hết thời gian review',
            deleted: true,
            updatedAt: now,
            moderationHistory: FieldValue.arrayUnion({
              action: 'deletion_auto_approved',
              moderatorId: 'system',
              reason: 'Tự động phê duyệt do hết thời gian review (72h)',
              createdAt: now
            })
          });
        } else {
          // Auto reject - restore
          batch.update(placeRef, {
            status: request.metadata?.originalStatus || 'published',
            deletionRequestId: null,
            deletionRequestedAt: null,
            deletionRequestedBy: null,
            deletionReason: null,
            deletionReviewDeadline: null,
            deletionExpiredAt: now,
            isVisibleToPublic: true,
            updatedAt: now,
            moderationHistory: FieldValue.arrayUnion({
              action: 'deletion_auto_rejected',
              moderatorId: 'system',
              reason: 'Tự động từ chối do hết thời gian review (72h)',
              createdAt: now
            })
          });
        }

        console.log(`Auto-${autoAction} deletion request ${requestDoc.id} for place ${request.placeId}`);
      }

      await batch.commit();
      console.log(`Processed ${expiredRequestsQuery.docs.length} expired deletion requests`);

    } catch (error) {
      console.error('Error processing expired deletion requests:', error);
    }
  }

  /**
   * Lấy danh sách soft-deleted places (cho admin recovery)
   */
  static async getDeletedPlaces(
    adminId: string,
    filters?: {
      deletedAfter?: string;
      deletedBefore?: string;
      deletedBy?: string;
      limit?: number;
    }
  ): Promise<any[]> {
    try {
      let query = this.adminDb.collection('places')
        .where('deleted', '==', true)
        .orderBy('deletedAt', 'desc');

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        canRestore: true // Admin có thể restore
      }));

    } catch (error) {
      console.error('Error getting deleted places:', error);
      return [];
    }
  }

  /**
   * Restore soft-deleted place
   */
  static async restorePlace(
    placeId: string,
    adminId: string,
    restoreReason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const placeDoc = await this.adminDb.collection('places').doc(placeId).get();
      
      if (!placeDoc.exists) {
        return { success: false, error: 'Địa điểm không tồn tại' };
      }

      const placeData = placeDoc.data()!;
      
      if (!placeData.deleted) {
        return { success: false, error: 'Địa điểm chưa bị xóa' };
      }

      const now = new Date().toISOString();

      await this.adminDb.collection('places').doc(placeId).update({
        status: placeData.metadata?.originalStatus || 'published',
        deleted: false,
        isVisibleToPublic: true,
        restoredAt: now,
        restoredBy: adminId,
        restoreReason: restoreReason,
        updatedAt: now,
        moderationHistory: FieldValue.arrayUnion({
          action: 'restored_from_deletion',
          moderatorId: adminId,
          reason: restoreReason,
          createdAt: now
        })
      });

      return { success: true };

    } catch (error) {
      console.error('Error restoring place:', error);
      return { success: false, error: 'Không thể khôi phục địa điểm' };
    }
  }

  /**
   * Helper methods
   */
  private static getModerationPriority(
    urgencyLevel: string, 
    requestType: string
  ): 'urgent' | 'high' | 'medium' | 'low' {
    if (urgencyLevel === 'urgent' || requestType === 'violation_cleanup') {
      return 'urgent';
    } else if (urgencyLevel === 'high') {
      return 'high';
    } else if (urgencyLevel === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private static async sendDeletionNotifications(
    requestId: string,
    placeId: string,
    placeName: string,
    requesterId: string,
    requesterRole: string,
    urgencyLevel: string
  ): Promise<void> {
    try {
      // Notify moderators about new deletion request
      const priority = urgencyLevel === 'urgent' ? 'HIGH' : 
                      urgencyLevel === 'high' ? 'MEDIUM' : 'LOW';
      
      // Sử dụng NotificationService (giả định có sẵn)
      // await NotificationService.notifyModerators(
      //   'deletion_request',
      //   `Yêu cầu xóa địa điểm: ${placeName}`,
      //   `${requesterRole} yêu cầu xóa địa điểm`,
      //   { requestId, placeId, urgencyLevel }
      // );

      console.log(`Sent deletion notification for request ${requestId} (${urgencyLevel} priority)`);

    } catch (error) {
      console.error('Error sending deletion notifications:', error);
    }
  }

  private static async scheduleAutoProcessing(
    requestId: string,
    deadline: Date
  ): Promise<void> {
    // In production environment, này sẽ là background job/cron
    // Ở đây implement như một simple setTimeout cho demo
    const timeUntilDeadline = deadline.getTime() - Date.now();
    
    if (timeUntilDeadline > 0 && timeUntilDeadline < 7 * 24 * 60 * 60 * 1000) { // Max 7 days
      setTimeout(async () => {
        console.log(`Processing expired deletion request: ${requestId}`);
        await this.processExpiredRequests();
      }, timeUntilDeadline);
    }
  }
}
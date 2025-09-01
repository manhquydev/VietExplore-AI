/**
 * Conflict Resolution Service - Xử lý conflicts khi có multiple edit requests
 * Theo tài liệu mục 2.3.2: Ưu tiên Admin > Moderator > Báo cáo vi phạm > Góp ý
 */

import { getAdminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export interface EditRequest {
  id?: string;
  placeId: string;
  requesterId: string;
  requesterRole: 'admin' | 'moderator' | 'contributor' | 'partner' | 'traveler';
  requestType: 'admin_edit' | 'moderator_edit' | 'violation_report' | 'user_suggestion' | 'owner_edit';
  priority: number; // Higher = more important
  status: 'pending' | 'active' | 'queued' | 'rejected' | 'completed';
  data: any;
  reason: string;
  createdAt: string;
  activeUntil?: string;
  metadata?: {
    reportId?: string;
    suggestionId?: string;
    versionId?: string;
  };
}

export class ConflictResolutionService {
  private static adminDb = getAdminDb();

  // Priority mapping theo tài liệu 2.3.2
  private static PRIORITY_MAP = {
    admin_edit: 100,        // Admin - highest priority
    moderator_edit: 90,     // Moderator
    violation_report: 80,   // Báo cáo vi phạm
    user_suggestion: 70,    // Góp ý user
    owner_edit: 60         // Edit từ owner (lowest)
  };

  /**
   * Tạo edit request và xử lý conflicts
   */
  static async createEditRequest(
    placeId: string,
    requesterId: string,
    requesterRole: string,
    requestType: keyof typeof ConflictResolutionService.PRIORITY_MAP,
    data: any,
    reason: string,
    metadata?: any
  ): Promise<{ success: boolean; requestId?: string; error?: string; conflictInfo?: any }> {
    try {
      const now = new Date().toISOString();
      const priority = this.PRIORITY_MAP[requestType] || 50;

      // Kiểm tra conflicts hiện tại
      const conflictCheck = await this.checkConflicts(placeId, priority);
      
      if (!conflictCheck.canProceed) {
        return {
          success: false,
          error: conflictCheck.reason,
          conflictInfo: conflictCheck.conflictInfo
        };
      }

      // Tạo edit request
      const editRequest: EditRequest = {
        placeId,
        requesterId,
        requesterRole: requesterRole as any,
        requestType,
        priority,
        status: conflictCheck.shouldQueue ? 'queued' : 'active',
        data,
        reason,
        createdAt: now,
        activeUntil: conflictCheck.shouldQueue ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h active
        metadata
      };

      // Lưu vào database
      const requestRef = await this.adminDb.collection('edit_requests').add(editRequest);
      editRequest.id = requestRef.id;
      await requestRef.update({ id: requestRef.id });

      // Nếu request này có priority cao hơn, queue các request thấp hơn
      if (conflictCheck.requestsToQueue.length > 0) {
        await this.queueLowerPriorityRequests(conflictCheck.requestsToQueue);
      }

      // Lock editing nếu cần
      if (editRequest.status === 'active') {
        await this.lockPlaceForEditing(placeId, requestRef.id, requestType, requesterId);
      }

      return {
        success: true,
        requestId: requestRef.id,
        conflictInfo: {
          status: editRequest.status,
          queuedRequests: conflictCheck.requestsToQueue.length,
          priority: priority
        }
      };

    } catch (error) {
      console.error('Error creating edit request:', error);
      return { success: false, error: 'Không thể tạo yêu cầu chỉnh sửa' };
    }
  }

  /**
   * Kiểm tra conflicts và xác định có thể proceed không
   */
  private static async checkConflicts(
    placeId: string, 
    newRequestPriority: number
  ): Promise<{
    canProceed: boolean;
    shouldQueue: boolean;
    reason?: string;
    conflictInfo?: any;
    requestsToQueue: string[];
  }> {
    try {
      // Lấy tất cả active/queued requests cho place này
      const existingRequestsQuery = await this.adminDb
        .collection('edit_requests')
        .where('placeId', '==', placeId)
        .where('status', 'in', ['active', 'queued'])
        .orderBy('priority', 'desc')
        .get();

      const existingRequests = existingRequestsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EditRequest[];

      // Nếu không có request nào, có thể proceed
      if (existingRequests.length === 0) {
        return {
          canProceed: true,
          shouldQueue: false,
          requestsToQueue: []
        };
      }

      // Tìm request có priority cao nhất
      const highestPriorityRequest = existingRequests[0];
      const requestsToQueue: string[] = [];

      // Nếu request mới có priority cao hơn hoặc bằng
      if (newRequestPriority >= highestPriorityRequest.priority) {
        // Queue tất cả requests có priority thấp hơn
        existingRequests.forEach(req => {
          if (req.priority < newRequestPriority) {
            requestsToQueue.push(req.id!);
          }
        });

        return {
          canProceed: true,
          shouldQueue: false,
          requestsToQueue
        };
      }

      // Nếu request mới có priority thấp hơn, queue nó
      return {
        canProceed: true,
        shouldQueue: true,
        reason: `Có yêu cầu ưu tiên cao hơn đang xử lý (${highestPriorityRequest.requestType})`,
        conflictInfo: {
          blockingRequest: {
            type: highestPriorityRequest.requestType,
            priority: highestPriorityRequest.priority,
            requester: highestPriorityRequest.requesterId
          }
        },
        requestsToQueue: []
      };

    } catch (error) {
      console.error('Error checking conflicts:', error);
      return {
        canProceed: false,
        shouldQueue: false,
        reason: 'Lỗi kiểm tra conflicts',
        requestsToQueue: []
      };
    }
  }

  /**
   * Queue các requests có priority thấp hơn
   */
  private static async queueLowerPriorityRequests(requestIds: string[]): Promise<void> {
    try {
      const batch = this.adminDb.batch();

      requestIds.forEach(requestId => {
        const requestRef = this.adminDb.collection('edit_requests').doc(requestId);
        batch.update(requestRef, {
          status: 'queued',
          queuedAt: new Date().toISOString(),
          activeUntil: null
        });
      });

      await batch.commit();
      console.log(`Queued ${requestIds.length} lower priority requests`);

    } catch (error) {
      console.error('Error queuing requests:', error);
    }
  }

  /**
   * Lock place cho editing
   */
  private static async lockPlaceForEditing(
    placeId: string, 
    requestId: string, 
    requestType: string, 
    requesterId: string
  ): Promise<void> {
    try {
      await this.adminDb.collection('places').doc(placeId).update({
        isLocked: true,
        lockedBy: requesterId,
        lockedAt: new Date().toISOString(),
        lockedFor: requestType,
        activeEditRequestId: requestId,
        lockExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h lock
      });

    } catch (error) {
      console.error('Error locking place:', error);
    }
  }

  /**
   * Unlock place và activate request tiếp theo trong queue
   */
  static async completeEditRequest(
    requestId: string, 
    status: 'completed' | 'rejected'
  ): Promise<{ success: boolean; nextRequestActivated?: string }> {
    try {
      return await this.adminDb.runTransaction(async (transaction) => {
        // Lấy request info
        const requestRef = this.adminDb.collection('edit_requests').doc(requestId);
        const requestDoc = await transaction.get(requestRef);
        
        if (!requestDoc.exists) {
          throw new Error('Request không tồn tại');
        }

        const request = requestDoc.data() as EditRequest;

        // Cập nhật request status
        transaction.update(requestRef, {
          status,
          completedAt: new Date().toISOString()
        });

        // Unlock place
        const placeRef = this.adminDb.collection('places').doc(request.placeId);
        transaction.update(placeRef, {
          isLocked: false,
          lockedBy: null,
          lockedAt: null,
          lockedFor: null,
          activeEditRequestId: null,
          lockExpiresAt: null
        });

        // Tìm request tiếp theo trong queue
        const nextRequestQuery = await this.adminDb
          .collection('edit_requests')
          .where('placeId', '==', request.placeId)
          .where('status', '==', 'queued')
          .orderBy('priority', 'desc')
          .orderBy('createdAt', 'asc') // FIFO trong cùng priority
          .limit(1)
          .get();

        let nextRequestId: string | undefined;

        if (!nextRequestQuery.empty) {
          const nextRequest = nextRequestQuery.docs[0];
          nextRequestId = nextRequest.id;

          // Activate next request
          transaction.update(nextRequest.ref, {
            status: 'active',
            activatedAt: new Date().toISOString(),
            activeUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });

          // Lock place cho next request
          const nextRequestData = nextRequest.data() as EditRequest;
          transaction.update(placeRef, {
            isLocked: true,
            lockedBy: nextRequestData.requesterId,
            lockedAt: new Date().toISOString(),
            lockedFor: nextRequestData.requestType,
            activeEditRequestId: nextRequest.id,
            lockExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });
        }

        return {
          success: true,
          nextRequestActivated: nextRequestId
        };
      });

    } catch (error) {
      console.error('Error completing edit request:', error);
      return { success: false };
    }
  }

  /**
   * Lấy queue status cho place
   */
  static async getPlaceQueueStatus(placeId: string): Promise<{
    isLocked: boolean;
    activeRequest?: EditRequest;
    queuedRequests: EditRequest[];
    lockExpiry?: string;
  }> {
    try {
      // Lấy place info
      const placeDoc = await this.adminDb.collection('places').doc(placeId).get();
      const placeData = placeDoc.data();

      // Lấy requests
      const requestsQuery = await this.adminDb
        .collection('edit_requests')
        .where('placeId', '==', placeId)
        .where('status', 'in', ['active', 'queued'])
        .orderBy('priority', 'desc')
        .orderBy('createdAt', 'asc')
        .get();

      const requests = requestsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EditRequest[];

      const activeRequest = requests.find(r => r.status === 'active');
      const queuedRequests = requests.filter(r => r.status === 'queued');

      return {
        isLocked: placeData?.isLocked || false,
        activeRequest,
        queuedRequests,
        lockExpiry: placeData?.lockExpiresAt
      };

    } catch (error) {
      console.error('Error getting queue status:', error);
      return {
        isLocked: false,
        queuedRequests: []
      };
    }
  }

  /**
   * Cleanup expired locks và requests
   */
  static async cleanupExpiredRequests(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Tìm expired active requests
      const expiredRequestsQuery = await this.adminDb
        .collection('edit_requests')
        .where('status', '==', 'active')
        .where('activeUntil', '<', now)
        .get();

      const batch = this.adminDb.batch();

      expiredRequestsQuery.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'expired',
          expiredAt: now
        });
      });

      // Unlock expired places
      const expiredPlacesQuery = await this.adminDb
        .collection('places')
        .where('isLocked', '==', true)
        .where('lockExpiresAt', '<', now)
        .get();

      expiredPlacesQuery.docs.forEach(doc => {
        batch.update(doc.ref, {
          isLocked: false,
          lockedBy: null,
          lockedAt: null,
          lockedFor: null,
          activeEditRequestId: null,
          lockExpiresAt: null
        });
      });

      await batch.commit();

      console.log(`Cleaned up ${expiredRequestsQuery.docs.length} expired requests and ${expiredPlacesQuery.docs.length} expired locks`);

      // Activate next requests in queue for unlocked places
      for (const placeDoc of expiredPlacesQuery.docs) {
        await this.activateNextQueuedRequest(placeDoc.id);
      }

    } catch (error) {
      console.error('Error cleaning up expired requests:', error);
    }
  }

  /**
   * Activate request tiếp theo trong queue
   */
  private static async activateNextQueuedRequest(placeId: string): Promise<void> {
    try {
      const nextRequestQuery = await this.adminDb
        .collection('edit_requests')
        .where('placeId', '==', placeId)
        .where('status', '==', 'queued')
        .orderBy('priority', 'desc')
        .orderBy('createdAt', 'asc')
        .limit(1)
        .get();

      if (!nextRequestQuery.empty) {
        const nextRequest = nextRequestQuery.docs[0];
        const requestData = nextRequest.data() as EditRequest;

        await this.adminDb.runTransaction(async (transaction) => {
          // Activate request
          transaction.update(nextRequest.ref, {
            status: 'active',
            activatedAt: new Date().toISOString(),
            activeUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });

          // Lock place
          const placeRef = this.adminDb.collection('places').doc(placeId);
          transaction.update(placeRef, {
            isLocked: true,
            lockedBy: requestData.requesterId,
            lockedAt: new Date().toISOString(),
            lockedFor: requestData.requestType,
            activeEditRequestId: nextRequest.id,
            lockExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });
        });

        console.log(`Activated queued request ${nextRequest.id} for place ${placeId}`);
      }

    } catch (error) {
      console.error('Error activating next queued request:', error);
    }
  }
}
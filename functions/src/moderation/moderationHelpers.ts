// functions/src/moderation/moderationHelpers.ts
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

export interface ModerationRequest {
  id?: string;
  type: 'place' | 'itinerary' | 'user' | 'report';
  targetId: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason?: string;
  submitterId: string;
  assignedTo?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const moderationHelpers = {
  // Tạo yêu cầu kiểm duyệt
  async createModerationRequest(request: Omit<ModerationRequest, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const db = admin.firestore();
      const docRef = await db.collection('moderation/requests').add({
        ...request,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`Created moderation request: ${docRef.id}`, { type: request.type, targetId: request.targetId });
      return docRef.id;
    } catch (error) {
      logger.error('Error creating moderation request:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái kiểm duyệt
  async updateModerationStatus(
    requestId: string, 
    status: 'approved' | 'rejected' | 'hidden',
    moderatorId: string,
    reason?: string
  ) {
    try {
      const db = admin.firestore();
      
      await db.doc(`moderation/requests/${requestId}`).update({
        status,
        reason: reason || null,
        moderatorId,
        moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Ghi log audit
      await db.collection('audits').add({
        type: 'moderation_action',
        moderatorId,
        requestId,
        action: status,
        reason,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`Updated moderation status: ${requestId} -> ${status}`, { moderatorId, reason });
    } catch (error) {
      logger.error('Error updating moderation status:', error);
      throw error;
    }
  },

  // Tự động gán priority dựa trên nội dung
  determinePriority(type: string, content: any): 'low' | 'medium' | 'high' | 'urgent' {
    // Logic tự động xác định độ ưu tiên
    if (type === 'report') {
      const reportType = content.reportType;
      if (reportType === 'spam' || reportType === 'inappropriate') return 'high';
      if (reportType === 'copyright' || reportType === 'harassment') return 'urgent';
      return 'medium';
    }

    if (type === 'place' || type === 'itinerary') {
      // Kiểm tra từ khóa nhạy cảm
      const text = JSON.stringify(content).toLowerCase();
      const sensitiveKeywords = ['spam', 'fake', 'scam', 'inappropriate'];
      
      if (sensitiveKeywords.some(keyword => text.includes(keyword))) {
        return 'high';
      }
    }

    return 'medium';
  },

  // Lấy danh sách yêu cầu kiểm duyệt
  async getModerationQueue(moderatorId: string, filters?: {
    status?: string;
    type?: string;
    priority?: string;
    limit?: number;
  }) {
    try {
      const db = admin.firestore();
      let query = db.collection('moderation/requests')
        .orderBy('priority', 'desc')
        .orderBy('createdAt', 'asc');

      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.type) {
        query = query.where('type', '==', filters.type);
      }
      if (filters?.priority) {
        query = query.where('priority', '==', filters.priority);
      }

      const limit = filters?.limit || 50;
      const snapshot = await query.limit(limit).get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error fetching moderation queue:', error);
      throw error;
    }
  }
};



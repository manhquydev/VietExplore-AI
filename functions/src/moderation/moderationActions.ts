// functions/src/moderation/moderationActions.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// Helper function để verify moderator
function assertModerator(auth?: any) {
  if (!auth || !['moderator', 'admin'].includes(auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền thực hiện');
  }
}

// Function approve moderation request
export const modDecisionApprove = onCall({
  region: 'asia-southeast1',
  timeoutSeconds: 540 // 9 minutes cho image processing
}, async (req) => {
  assertModerator(req.auth);
  
  const { requestId, notes } = req.data;
  if (!requestId) {
    throw new HttpsError('invalid-argument', 'Request ID là bắt buộc');
  }

  try {
    const db = admin.firestore();
    const requestRef = db.collection('moderation').doc('requests').collection('items').doc(requestId);

    await db.runTransaction(async (tx) => {
      const requestSnap = await tx.get(requestRef);
      
      if (!requestSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy yêu cầu');
      }

      const requestData = requestSnap.data()!;
      
      if (!['in_review', 'queued'].includes(requestData.status)) {
        throw new HttpsError('failed-precondition', 'Yêu cầu không thể approve ở trạng thái hiện tại');
      }

      // Kiểm tra moderator assignment
      if (requestData.moderator && requestData.moderator !== req.auth!.uid && req.auth!.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Yêu cầu đã được assign cho moderator khác');
      }

      // Get draft
      const draftRef = db.doc(`${requestData.ref.collection}/${requestData.ref.id}`);
      const draftSnap = await tx.get(draftRef);
      
      if (!draftSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy bản nháp');
      }

      const draft = draftSnap.data()!;

      // Update draft status → trigger onDraftApproved (Tài liệu 3)
      tx.update(draftRef, { 
        status: 'approved', 
        moderationNotes: notes || null,
        approvedBy: req.auth!.uid,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update moderation request
      tx.update(requestRef, { 
        status: 'approved',
        decisionNotes: notes || null,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: { 
          uid: req.auth!.uid, 
          role: req.auth!.token.role,
          email: req.auth!.token.email
        },
        action: 'approve_draft',
        target: { 
          collection: 'placeDrafts', 
          id: requestData.ref.id 
        },
        metadata: {
          requestId,
          notes,
          submitterRole: draft.submitterRole
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update system counters
      tx.set(db.doc('system/counters/moderation_approved'), {
        value: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    logger.info(`Draft approved: request ${requestId} by moderator ${req.auth!.uid}`);
    return { 
      success: true, 
      message: 'Bản nháp đã được duyệt và sẽ được publish' 
    };
  } catch (error) {
    logger.error('Error approving moderation request:', error);
    throw error;
  }
});

// Function reject moderation request
export const modDecisionReject = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  assertModerator(req.auth);
  
  const { requestId, notes } = req.data;
  if (!requestId || !notes) {
    throw new HttpsError('invalid-argument', 'Request ID và lý do từ chối là bắt buộc');
  }

  try {
    const db = admin.firestore();
    const requestRef = db.collection('moderation').doc('requests').collection('items').doc(requestId);

    await db.runTransaction(async (tx) => {
      const requestSnap = await tx.get(requestRef);
      
      if (!requestSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy yêu cầu');
      }

      const requestData = requestSnap.data()!;
      
      if (!['in_review', 'queued'].includes(requestData.status)) {
        throw new HttpsError('failed-precondition', 'Yêu cầu không thể reject');
      }

      // Update draft
      const draftRef = db.doc(`${requestData.ref.collection}/${requestData.ref.id}`);
      tx.update(draftRef, { 
        status: 'rejected', 
        moderationNotes: notes,
        rejectedBy: req.auth!.uid,
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update request
      tx.update(requestRef, { 
        status: 'rejected',
        decisionNotes: notes,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: { 
          uid: req.auth!.uid, 
          role: req.auth!.token.role 
        },
        action: 'reject_draft',
        target: { 
          collection: 'placeDrafts', 
          id: requestData.ref.id 
        },
        metadata: { requestId, notes },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    logger.info(`Draft rejected: request ${requestId} by moderator ${req.auth!.uid}`);
    return { success: true, message: 'Bản nháp đã bị từ chối' };
  } catch (error) {
    logger.error('Error rejecting moderation request:', error);
    throw error;
  }
});

// Function request edit
export const modDecisionRequestEdit = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  assertModerator(req.auth);
  
  const { requestId, notes } = req.data;
  if (!requestId || !notes) {
    throw new HttpsError('invalid-argument', 'Request ID và ghi chú chỉnh sửa là bắt buộc');
  }

  try {
    const db = admin.firestore();
    const requestRef = db.collection('moderation').doc('requests').collection('items').doc(requestId);

    await db.runTransaction(async (tx) => {
      const requestSnap = await tx.get(requestRef);
      
      if (!requestSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy yêu cầu');
      }

      const requestData = requestSnap.data()!;
      
      if (!['in_review', 'queued'].includes(requestData.status)) {
        throw new HttpsError('failed-precondition', 'Yêu cầu không thể request edit');
      }

      // Update draft
      const draftRef = db.doc(`${requestData.ref.collection}/${requestData.ref.id}`);
      tx.update(draftRef, { 
        status: 'changes_requested', 
        moderationNotes: notes,
        requestedChangesBy: req.auth!.uid,
        requestedChangesAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update request
      tx.update(requestRef, { 
        status: 'returned',
        decisionNotes: notes,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: { 
          uid: req.auth!.uid, 
          role: req.auth!.token.role 
        },
        action: 'request_edit',
        target: { 
          collection: 'placeDrafts', 
          id: requestData.ref.id 
        },
        metadata: { requestId, notes },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    logger.info(`Edit requested for draft: request ${requestId} by moderator ${req.auth!.uid}`);
    return { success: true, message: 'Đã yêu cầu chỉnh sửa bản nháp' };
  } catch (error) {
    logger.error('Error requesting edit:', error);
    throw error;
  }
});

// Function để get moderation stats (Admin/Moderator)
export const getModerationStats = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth!.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền xem stats');
  }

  try {
    const db = admin.firestore();
    
    // Get counts by status
    const statusCounts: { [key: string]: number } = {};
    const statuses = ['queued', 'in_review', 'approved', 'rejected', 'returned'];
    
    for (const status of statuses) {
      const snapshot = await db.collection('moderation').doc('requests').collection('items')
        .where('status', '==', status)
        .count()
        .get();
      statusCounts[status] = snapshot.data().count;
    }

    // Get SLA violations
    const now = admin.firestore.Timestamp.now();
    const overdueSnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('status', 'in', ['queued', 'in_review'])
      .where('dueAt', '<', now)
      .count()
      .get();

    // Get moderator performance (last 7 days)
    const weekAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const moderatorPerformance: { [key: string]: any } = {};
    
    if (req.auth!.token.role === 'admin') {
      const recentActions = await db.collection('audits')
        .where('action', 'in', ['approve_draft', 'reject_draft', 'request_edit'])
        .where('createdAt', '>=', weekAgo)
        .get();

      recentActions.docs.forEach(doc => {
        const data = doc.data();
        const moderatorId = data.actor.uid;
        if (!moderatorPerformance[moderatorId]) {
          moderatorPerformance[moderatorId] = { approved: 0, rejected: 0, edit_requested: 0 };
        }
        moderatorPerformance[moderatorId][data.action.replace('_draft', '').replace('_', '_')]++;
      });
    }

    return {
      success: true,
      stats: {
        statusCounts,
        overdueCount: overdueSnapshot.data().count,
        moderatorPerformance: req.auth!.token.role === 'admin' ? moderatorPerformance : null
      }
    };
  } catch (error) {
    logger.error('Error fetching moderation stats:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy thống kê');
  }
});

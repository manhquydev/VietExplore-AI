// functions/src/moderation/moderationSubmit.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// SLA hours theo role (từ Tài liệu 4)
const SLA_HOURS = { 
  traveler: 24 * 5,    // 5 ngày làm việc
  contributor: 24 * 3,  // 3 ngày làm việc  
  partner: 48          // 48 giờ (fast-track)
};

// Function submit draft cho review (theo Tài liệu 4)
export const submitDraftForReview = onCall({ 
  region: 'asia-southeast1' 
}, async (req) => {
  const caller = req.auth;
  if (!caller || caller.token.email_verified !== true) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập và xác minh email');
  }

  const { draftId } = req.data;
  if (!draftId) {
    throw new HttpsError('invalid-argument', 'Draft ID là bắt buộc');
  }

  try {
    const db = admin.firestore();
    const draftRef = db.doc(`placeDrafts/${draftId}`);

    await db.runTransaction(async (tx) => {
      const draftSnap = await tx.get(draftRef);
      
      if (!draftSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy bản nháp');
      }

      const draft = draftSnap.data()!;
      
      // Kiểm tra ownership
      if (draft.submitter !== caller.uid) {
        throw new HttpsError('permission-denied', 'Không có quyền submit bản nháp này');
      }

      // Kiểm tra status
      if (!['draft', 'changes_requested'].includes(draft.status)) {
        throw new HttpsError('failed-precondition', 'Bản nháp không thể submit ở trạng thái hiện tại');
      }

      // Tính SLA dueAt theo role
      const role = (caller.token.role || 'traveler') as keyof typeof SLA_HOURS;
      const slaHours = SLA_HOURS[role];
      const dueAt = admin.firestore.Timestamp.fromMillis(
        Date.now() + slaHours * 60 * 60 * 1000
      );

      // Update draft status
      tx.update(draftRef, { 
        status: 'submitted', 
        submitterRole: role,
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Tạo moderation request
      const requestRef = db.collection('moderation').doc('requests').collection('items').doc();
      tx.set(requestRef, {
        type: 'place_draft',
        ref: { 
          collection: 'placeDrafts', 
          id: draftId 
        },
        priority: role === 'partner' ? 'high' : 'normal',
        submitter: caller.uid,
        submitterRole: role,
        moderator: null,
        status: 'queued',
        decisionNotes: null,
        targetData: draft, // Snapshot của draft data
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        dueAt,
        escalation: { 
          level: 0, 
          lastNotifiedAt: null 
        }
      });

      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: { 
          uid: caller.uid, 
          role: caller.token.role,
          email: caller.token.email
        },
        action: 'submit_for_review',
        target: { 
          collection: 'placeDrafts', 
          id: draftId 
        },
        metadata: {
          requestId: requestRef.id,
          slaHours,
          dueAt: dueAt.toDate().toISOString()
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    logger.info(`Draft submitted for review: ${draftId} by ${caller.uid}`);
    return { 
      success: true, 
      message: 'Bản nháp đã được nộp để duyệt',
      slaHours: SLA_HOURS[caller.token.role as keyof typeof SLA_HOURS] || SLA_HOURS.traveler
    };
  } catch (error) {
    logger.error('Error submitting draft for review:', error);
    throw error;
  }
});

// Function để lấy moderation queue (Moderator only)
export const getModerationQueue = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền xem queue');
  }

  const { status = 'queued', limit = 20, offset = 0 } = req.data;

  try {
    const db = admin.firestore();
    
    let query = db.collection('moderation').doc('requests').collection('items')
      .where('status', '==', status)
      .orderBy('priority', 'desc')
      .orderBy('createdAt', 'asc');

    if (offset > 0) {
      query = query.offset(offset);
    }
    
    query = query.limit(limit);

    const snapshot = await query.get();
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get total count
    const totalSnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('status', '==', status)
      .count()
      .get();

    logger.info(`Moderation queue fetched: ${requests.length} items for ${req.auth.uid}`);
    return {
      success: true,
      requests,
      total: totalSnapshot.data().count,
      hasMore: snapshot.size === limit
    };
  } catch (error) {
    logger.error('Error fetching moderation queue:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy danh sách kiểm duyệt');
  }
});

// Function để assign moderator (claim request)
export const claimModerationRequest = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền claim');
  }

  const { requestId } = req.data;
  if (!requestId) {
    throw new HttpsError('invalid-argument', 'Request ID là bắt buộc');
  }

  try {
    const db = admin.firestore();
    const requestRef = db.collection('moderation').doc('requests').collection('items').doc(requestId);

    await db.runTransaction(async (tx) => {
      const requestSnap = await tx.get(requestRef);
      
      if (!requestSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy yêu cầu kiểm duyệt');
      }

      const requestData = requestSnap.data()!;
      
      if (requestData.status !== 'queued') {
        throw new HttpsError('failed-precondition', 'Yêu cầu đã được claim hoặc xử lý');
      }

      // Claim request
      tx.update(requestRef, { 
        status: 'in_review', 
        moderator: req.auth!.uid,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: { 
          uid: req.auth!.uid, 
          role: req.auth!.token.role 
        },
        action: 'claim_moderation',
        target: { 
          collection: 'moderation/requests/items', 
          id: requestId 
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    logger.info(`Moderation request claimed: ${requestId} by ${req.auth.uid}`);
    return { success: true, message: 'Đã nhận yêu cầu kiểm duyệt' };
  } catch (error) {
    logger.error('Error claiming moderation request:', error);
    throw error;
  }
});

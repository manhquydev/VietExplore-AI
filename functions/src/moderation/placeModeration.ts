// functions/src/moderation/placeModeration.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';

// Function để submit place draft cho moderation
export const submitPlaceForModeration = onCall(async (req) => {
  if (!req.auth?.token?.role || !['contributor', 'partner', 'moderator', 'admin'].includes(req.auth.token.role)) {
    throw new HttpsError('permission-denied', 'Không có quyền nộp địa điểm');
  }

  const { draftId } = req.data;
  if (!draftId) {
    throw new HttpsError('invalid-argument', 'Draft ID là bắt buộc');
  }

  try {
    const db = admin.firestore();
    const draftDoc = await db.doc(`placeDrafts/${draftId}`).get();
    
    if (!draftDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy bản nháp');
    }

    const draftData = draftDoc.data()!;
    
    // Kiểm tra quyền sở hữu
    if (draftData.authorId !== req.auth.uid && !['moderator', 'admin'].includes(req.auth.token.role)) {
      throw new HttpsError('permission-denied', 'Không có quyền nộp bản nháp này');
    }

    // Tạo moderation request
    const moderationRequest = {
      type: 'place',
      targetId: draftId,
      targetData: draftData,
      status: 'pending',
      priority: req.auth.token.role === 'partner' ? 'high' : 'medium',
      submittedBy: req.auth.uid,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedTo: null,
      reason: null,
      changes: null
    };

    const moderationRef = await db.collection('moderation/requests').add(moderationRequest);

    // Cập nhật draft status
    await db.doc(`placeDrafts/${draftId}`).update({
      status: 'submitted',
      moderationId: moderationRef.id,
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`Place draft ${draftId} submitted for moderation by ${req.auth.uid}`);
    return { success: true, moderationId: moderationRef.id };
  } catch (error) {
    logger.error('Error submitting place for moderation:', error);
    throw error;
  }
});

// Function để approve/reject place
export const moderatePlace = onCall(async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền duyệt');
  }

  const { moderationId, action, reason, changes } = req.data;
  
  if (!moderationId || !action || !['approve', 'reject', 'request_edit'].includes(action)) {
    throw new HttpsError('invalid-argument', 'Dữ liệu không hợp lệ');
  }

  try {
    const db = admin.firestore();
    const moderationDoc = await db.doc(`moderation/requests/${moderationId}`).get();
    
    if (!moderationDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy yêu cầu kiểm duyệt');
    }

    const moderationData = moderationDoc.data()!;
    const batch = db.batch();

    if (action === 'approve') {
      // Tạo place từ draft
      const placeId = db.collection('places').doc().id;
      const placeData = {
        ...moderationData.targetData,
        id: placeId,
        status: 'published',
        publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        moderatedBy: req.auth.uid,
        moderatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.set(db.doc(`places/${placeId}`), placeData);
      
      // Xóa draft
      batch.delete(db.doc(`placeDrafts/${moderationData.targetId}`));
    }

    // Cập nhật moderation request
    batch.update(db.doc(`moderation/requests/${moderationId}`), {
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'edit_requested',
      moderatedBy: req.auth.uid,
      moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reason: reason || null,
      changes: changes || null
    });

    await batch.commit();

    logger.info(`Place moderation ${action} by ${req.auth.uid} for request ${moderationId}`);
    return { success: true, action };
  } catch (error) {
    logger.error('Error moderating place:', error);
    throw error;
  }
});

// Auto-moderation trigger khi có place draft mới
export const autoModeratePlaceDraft = onDocumentCreated('placeDrafts/{draftId}', async (event) => {
  const draftData = event.data?.data();
  if (!draftData) return;

  const db = admin.firestore();
  
  try {
    // Auto-approve cho Partner (fast-track)
    const authorDoc = await db.doc(`users/${draftData.authorId}`).get();
    const authorData = authorDoc.data();
    
    if (authorData?.role === 'partner') {
      logger.info(`Auto-approving place draft from partner: ${draftData.authorId}`);
      
      // Tạo place trực tiếp
      const placeId = db.collection('places').doc().id;
      const placeData = {
        ...draftData,
        id: placeId,
        status: 'published',
        publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        autoApproved: true,
        fastTrack: true
      };

      const batch = db.batch();
      batch.set(db.doc(`places/${placeId}`), placeData);
      batch.delete(event.data!.ref); // Xóa draft

      await batch.commit();
    }
  } catch (error) {
    logger.error('Error in auto-moderation:', error);
  }
});

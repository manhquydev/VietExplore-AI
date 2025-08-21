// functions/src/moderation/contentModeration.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';

// Basic content filtering (có thể integrate với AI services)
const INAPPROPRIATE_WORDS = [
  // Vietnamese inappropriate words (basic list)
  'đồ chó', 'khốn nạn', 'đần độn', 'ngu ngốc',
  // Add more as needed
];

// Function auto-moderate content khi tạo mới
export const autoModerateContent = onDocumentCreated('placeDrafts/{draftId}', async (event) => {
  const draftData = event.data?.data();
  if (!draftData) return;

  const draftId = event.params.draftId;
  const db = admin.firestore();

  try {
    let needsReview = false;
    const issues: string[] = [];

    // 1. Text content moderation
    const textContent = `${draftData.title} ${draftData.description}`.toLowerCase();
    
    for (const word of INAPPROPRIATE_WORDS) {
      if (textContent.includes(word.toLowerCase())) {
        needsReview = true;
        issues.push(`Phát hiện từ ngữ không phù hợp: "${word}"`);
      }
    }

    // 2. Content quality checks
    if (draftData.description && draftData.description.length < 50) {
      needsReview = true;
      issues.push('Mô tả quá ngắn (< 50 ký tự)');
    }

    if (!draftData.sources || draftData.sources.length === 0) {
      needsReview = true;
      issues.push('Thiếu nguồn tham khảo');
    }

    // 3. Duplicate detection (basic)
    const existingPlaces = await db.collection('places')
      .where('name', '==', draftData.title)
      .where('province', '==', draftData.province)
      .limit(1)
      .get();

    if (!existingPlaces.empty) {
      needsReview = true;
      issues.push('Có thể trùng lặp với địa điểm đã tồn tại');
    }

    // 4. Spam detection (simple rate limiting)
    const recentDrafts = await db.collection('placeDrafts')
      .where('submitter', '==', draftData.submitter)
      .where('createdAt', '>', admin.firestore.Timestamp.fromMillis(Date.now() - 60 * 60 * 1000)) // Last hour
      .count()
      .get();

    if (recentDrafts.data().count > 5) {
      needsReview = true;
      issues.push('Tạo quá nhiều bản nháp trong thời gian ngắn');
    }

    // Update draft với moderation flags
    if (needsReview) {
      await db.doc(`placeDrafts/${draftId}`).update({
        autoModerationFlags: issues,
        needsManualReview: true,
        autoModerationAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create high-priority moderation request
      await db.collection('moderation').doc('requests').collection('items').add({
        type: 'auto_flagged_content',
        ref: { collection: 'placeDrafts', id: draftId },
        priority: 'high',
        submitter: draftData.submitter,
        submitterRole: draftData.submitterRole || 'traveler',
        moderator: null,
        status: 'queued',
        targetData: draftData,
        autoModerationFlags: issues,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        dueAt: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // 24h for flagged content
        escalation: { level: 0, lastNotifiedAt: null }
      });

      logger.warn(`Content flagged for review: ${draftId}`, { issues });
    } else {
      // Mark as clean
      await db.doc(`placeDrafts/${draftId}`).update({
        autoModerationFlags: [],
        needsManualReview: false,
        autoModerationAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`Content passed auto-moderation: ${draftId}`);
    }
  } catch (error) {
    logger.error('Error in auto-moderation:', error);
  }
});

// Function manual review content (Moderator)
export const reviewFlaggedContent = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền review');
  }

  const { draftId, decision, cleanedContent } = req.data;
  
  if (!draftId || !decision) {
    throw new HttpsError('invalid-argument', 'Draft ID và decision là bắt buộc');
  }

  const validDecisions = ['approve_as_is', 'approve_with_edits', 'reject'];
  if (!validDecisions.includes(decision)) {
    throw new HttpsError('invalid-argument', 'Decision không hợp lệ');
  }

  try {
    const db = admin.firestore();
    const draftRef = db.doc(`placeDrafts/${draftId}`);

    await db.runTransaction(async (tx) => {
      const draftSnap = await tx.get(draftRef);
      
      if (!draftSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy bản nháp');
      }

      const draftData = draftSnap.data()!;

      switch (decision) {
        case 'approve_as_is':
          tx.update(draftRef, {
            status: 'approved',
            needsManualReview: false,
            reviewedBy: req.auth!.uid,
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          break;

        case 'approve_with_edits':
          if (!cleanedContent) {
            throw new HttpsError('invalid-argument', 'Cleaned content là bắt buộc khi approve with edits');
          }
          
          tx.update(draftRef, {
            ...cleanedContent,
            status: 'approved',
            needsManualReview: false,
            reviewedBy: req.auth!.uid,
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
            moderationNotes: 'Nội dung đã được chỉnh sửa bởi moderator',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          break;

        case 'reject':
          tx.update(draftRef, {
            status: 'rejected',
            needsManualReview: false,
            reviewedBy: req.auth!.uid,
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
            moderationNotes: 'Nội dung vi phạm quy định cộng đồng',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          break;
      }

      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: { 
          uid: req.auth!.uid, 
          role: req.auth!.token.role 
        },
        action: `content_review_${decision}`,
        target: { 
          collection: 'placeDrafts', 
          id: draftId 
        },
        metadata: {
          originalFlags: draftData.autoModerationFlags,
          decision,
          hasEdits: !!cleanedContent
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    logger.info(`Content reviewed: ${draftId} → ${decision} by ${req.auth.uid}`);
    return { 
      success: true, 
      message: `Nội dung đã được review: ${decision}` 
    };
  } catch (error) {
    logger.error('Error reviewing flagged content:', error);
    throw error;
  }
});

// Function get content moderation queue
export const getContentModerationQueue = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền xem queue');
  }

  try {
    const db = admin.firestore();
    
    // Get flagged content
    const flaggedDrafts = await db.collection('placeDrafts')
      .where('needsManualReview', '==', true)
      .where('status', 'in', ['draft', 'submitted'])
      .orderBy('autoModerationAt', 'desc')
      .limit(20)
      .get();

    const flaggedContent = flaggedDrafts.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      flaggedContent,
      total: flaggedContent.length
    };
  } catch (error) {
    logger.error('Error fetching content moderation queue:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy queue content moderation');
  }
});

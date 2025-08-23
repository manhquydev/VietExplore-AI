// functions/src/places/placeWorkflow.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { validation } from '../utils/validation';

// Helper function để generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  const db = admin.firestore();
  
  // Tạo slug cơ bản từ title
  let baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Kiểm tra uniqueness
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existingPlace = await db.collection('places')
      .where('slug', '==', slug)
      .limit(1)
      .get();
      
    if (existingPlace.empty) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
}

// Function tạo place draft
export const createPlaceDraft = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  const userRole = req.auth.token?.role;
  if (!userRole || !['traveler', 'contributor', 'partner'].includes(userRole)) {
    throw new HttpsError('permission-denied', 'Không có quyền tạo địa điểm');
  }

  const { title, region, province, type, description, photos, sources } = req.data;

  // Validation
  const placeValidation = validation.isValidPlaceData({
    title, region, province, type, description, photos, sources
  });

  if (!placeValidation.valid) {
    throw new HttpsError('invalid-argument', placeValidation.errors.join(', '));
  }

  try {
    const db = admin.firestore();
    
    // Tạo draft document
    const draftData = {
      title,
      region,
      province,
      type,
      description,
      photos: photos || [],
      sources: sources || [],
      submitter: req.auth.uid,
      submitterRole: userRole,
      status: 'draft',
      linkedPlaceId: null,
      moderationNotes: null,
      moderationId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const draftRef = await db.collection('placeDrafts').add(draftData);

    logger.info(`Place draft created: ${draftRef.id} by ${req.auth.uid}`);
    return { 
      success: true, 
      draftId: draftRef.id,
      message: 'Bản nháp đã được tạo thành công'
    };
  } catch (error) {
    logger.error('Error creating place draft:', error);
    throw new HttpsError('internal', 'Lỗi khi tạo bản nháp địa điểm');
  }
});

// Function update place draft
export const updatePlaceDraft = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  const { draftId, ...updateData } = req.data;

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

    // Kiểm tra quyền sở hữu hoặc moderator
    if (draftData.submitter !== req.auth.uid && !['moderator', 'admin'].includes(req.auth.token?.role)) {
      throw new HttpsError('permission-denied', 'Không có quyền chỉnh sửa bản nháp này');
    }

    // Kiểm tra status cho phép edit
    if (!['draft', 'changes_requested'].includes(draftData.status) && req.auth.token?.role !== 'moderator') {
      throw new HttpsError('failed-precondition', 'Bản nháp không thể chỉnh sửa ở trạng thái hiện tại');
    }

    // Validate updated data
    if (updateData.title || updateData.description) {
      const validationData = { ...draftData, ...updateData };
      const placeValidation = validation.isValidPlaceData(validationData);
      
      if (!placeValidation.valid) {
        throw new HttpsError('invalid-argument', placeValidation.errors.join(', '));
      }
    }

    // Update draft
    await db.doc(`placeDrafts/${draftId}`).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`Place draft updated: ${draftId} by ${req.auth.uid}`);
    return { success: true, message: 'Bản nháp đã được cập nhật' };
  } catch (error) {
    logger.error('Error updating place draft:', error);
    throw error;
  }
});

// Function publish place từ draft (Moderator only)
export const publishPlace = onCall(async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền publish');
  }

  const { draftId, moderationNotes } = req.data;

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

    // Generate unique slug
    const slug = await generateUniqueSlug(draftData.title);

    // Tạo place document
    const placeId = db.collection('places').doc().id;
    const placeData = {
      id: placeId,
      name: draftData.title,
      slug,
      region: draftData.region,
      province: draftData.province,
      type: draftData.type,
      description: draftData.description,
      photos: draftData.photos || [],
      sources: draftData.sources || [],
      trustLabel: draftData.submitterRole === 'partner' ? 'partner' : 'contributor',
      createdBy: draftData.submitter,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'published'
    };

    const batch = db.batch();

    // Tạo place
    batch.set(db.doc(`places/${placeId}`), placeData);

    // Cập nhật draft
    batch.update(db.doc(`placeDrafts/${draftId}`), {
      status: 'published',
      linkedPlaceId: placeId,
      moderationNotes: moderationNotes || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Cập nhật user stats
    batch.update(db.doc(`users/${draftData.submitter}`), {
      'stats.placesCreated': admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Audit log
    batch.set(db.collection('audits').doc(), {
      actor: {
        uid: req.auth.uid,
        role: req.auth.token.role,
        email: req.auth.token.email
      },
      action: 'publish',
      target: {
        collection: 'places',
        id: placeId
      },
      metadata: {
        draftId,
        moderationNotes,
        slug
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    logger.info(`Place published: ${placeId} from draft ${draftId} by ${req.auth.uid}`);
    return { 
      success: true, 
      placeId, 
      slug,
      message: 'Địa điểm đã được publish thành công' 
    };
  } catch (error) {
    logger.error('Error publishing place:', error);
    throw error;
  }
});

// Auto-trigger khi place draft được tạo
export const onPlaceDraftCreate = onDocumentCreated('placeDrafts/{draftId}', async (event) => {
  const draftData = event.data?.data();
  if (!draftData) return;

  const db = admin.firestore();
  const draftId = event.params.draftId;

  try {
    // Auto-submit cho Partner (fast-track)
    if (draftData.submitterRole === 'partner') {
      logger.info(`Auto-submitting partner draft: ${draftId}`);
      
      // Tạo moderation request với high priority
      await db.collection('moderation').doc('requests').collection('items').add({
        type: 'place_draft',
        ref: {
          collection: 'placeDrafts',
          id: draftId
        },
        priority: 'high', // Partner gets high priority
        submitter: draftData.submitter,
        submitterRole: draftData.submitterRole,
        moderator: null,
        status: 'queued',
        targetData: draftData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update draft status
      await db.doc(`placeDrafts/${draftId}`).update({
        status: 'submitted',
        submittedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Update system counters
    await db.doc('system/counters/drafts_pending').set({
      key: 'drafts_pending',
      value: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

  } catch (error) {
    logger.error('Error in onPlaceDraftCreate:', error);
  }
});

// Function lấy drafts của user (Contributor, Partner, Moderator, Admin)
export const getUserDrafts = onCall(async (req) => {
  try {
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Vui lòng đăng nhập');
    }

    const { userId } = req.data;
    const requestUserId = userId || req.auth.uid;
    
    // Chỉ cho phép lấy drafts của chính mình, trừ Admin/Moderator
    const userDoc = await admin.firestore().doc(`users/${req.auth.uid}`).get();
    const userRole = userDoc.data()?.role || 'traveler';
    
    if (!['admin', 'moderator'].includes(userRole) && requestUserId !== req.auth.uid) {
      throw new HttpsError('permission-denied', 'Không có quyền xem drafts của user khác');
    }

    const db = admin.firestore();
    
    // Query drafts
    let query = db.collection('placeDrafts')
      .where('submitter', '==', requestUserId)
      .orderBy('updatedAt', 'desc')
      .limit(50);

    const snapshot = await query.get();
    
    const drafts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      drafts,
      count: drafts.length
    };
    
  } catch (error) {
    logger.error('Error getting user drafts:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Lỗi server khi lấy drafts');
  }
});

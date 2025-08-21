// functions/src/itinerary/itineraryWorkflow.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { validation } from '../utils/validation';
import { slugHelpers } from '../utils/slugHelpers';

// Function tạo itinerary
export const createItinerary = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  if (!req.auth.token?.email_verified) {
    throw new HttpsError('failed-precondition', 'Cần xác minh email trước');
  }

  const { title, description, days, budgetEstimate, visibility, region } = req.data;

  // Validation
  const itineraryValidation = validation.isValidItineraryData({
    title, description, days, budgetEstimate, visibility
  });

  if (!itineraryValidation.valid) {
    throw new HttpsError('invalid-argument', itineraryValidation.errors.join(', '));
  }

  try {
    const db = admin.firestore();
    
    // Generate slug cho public itinerary
    const slug = visibility === 'public' ? await slugHelpers.generateUniqueSlug(title, 'itineraries') : null;
    
    const itineraryData = {
      ownerId: req.auth.uid,
      title,
      description: description || '',
      days: days || [],
      budgetEstimate: budgetEstimate || 0,
      visibility: visibility || 'private',
      isPublic: visibility === 'public',
      region: region || null,
      duration: Array.isArray(days) ? days.length : 0,
      slug,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Social features
      viewCount: 0,
      duplicateCount: 0,
      likeCount: 0,
      tags: []
    };

    const itineraryRef = await db.collection('itineraries').add(itineraryData);

    logger.info(`Itinerary created: ${itineraryRef.id} by ${req.auth.uid}`);
    return { 
      success: true, 
      itineraryId: itineraryRef.id,
      slug,
      message: 'Lịch trình đã được tạo thành công'
    };
  } catch (error) {
    logger.error('Error creating itinerary:', error);
    throw new HttpsError('internal', 'Lỗi khi tạo lịch trình');
  }
});

// Function update itinerary
export const updateItinerary = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  const { itineraryId, ...updateData } = req.data;

  if (!itineraryId) {
    throw new HttpsError('invalid-argument', 'Itinerary ID là bắt buộc');
  }

  try {
    const db = admin.firestore();
    const itineraryDoc = await db.doc(`itineraries/${itineraryId}`).get();

    if (!itineraryDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy lịch trình');
    }

    const itineraryData = itineraryDoc.data()!;

    // Kiểm tra quyền sở hữu
    if (itineraryData.ownerId !== req.auth.uid) {
      throw new HttpsError('permission-denied', 'Không có quyền chỉnh sửa lịch trình này');
    }

    // Validate updated data
    if (updateData.title || updateData.days) {
      const validationData = { ...itineraryData, ...updateData };
      const validationResult = validation.isValidItineraryData(validationData);
      
      if (!validationResult.valid) {
        throw new HttpsError('invalid-argument', validationResult.errors.join(', '));
      }
    }

    // Update slug nếu title thay đổi và visibility = public
    if (updateData.title && itineraryData.visibility === 'public') {
      updateData.slug = await slugHelpers.generateUniqueSlug(updateData.title, 'itineraries');
    }

    // Calculate duration nếu days thay đổi
    if (updateData.days) {
      updateData.duration = Array.isArray(updateData.days) ? updateData.days.length : itineraryData.duration;
    }

    // Update isPublic nếu visibility thay đổi
    if (updateData.visibility) {
      updateData.isPublic = updateData.visibility === 'public';
      
      // Generate slug cho newly public itinerary
      if (updateData.visibility === 'public' && !itineraryData.slug) {
        updateData.slug = await slugHelpers.generateUniqueSlug(itineraryData.title, 'itineraries');
      }
    }

    await db.doc(`itineraries/${itineraryId}`).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`Itinerary updated: ${itineraryId} by ${req.auth.uid}`);
    return { success: true, message: 'Lịch trình đã được cập nhật' };
  } catch (error) {
    logger.error('Error updating itinerary:', error);
    throw error;
  }
});

// Function tạo suggestion cho place
export const createSuggestion = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  if (!req.auth.token?.email_verified) {
    throw new HttpsError('failed-precondition', 'Cần xác minh email trước');
  }

  const { placeId, proposed, reason } = req.data;

  if (!placeId || !proposed) {
    throw new HttpsError('invalid-argument', 'Place ID và đề xuất là bắt buộc');
  }

  try {
    const db = admin.firestore();
    
    // Kiểm tra place tồn tại
    const placeDoc = await db.doc(`places/${placeId}`).get();
    if (!placeDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy địa điểm');
    }

    // Tạo suggestion
    const suggestionData = {
      placeId,
      proposed,
      reason: reason || '',
      submitter: req.auth.uid,
      status: 'submitted',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const suggestionRef = await db.collection('suggestions').add(suggestionData);

    // Tạo moderation request
    await db.collection('moderation').doc('requests').collection('items').add({
      type: 'suggestion',
      ref: {
        collection: 'suggestions',
        id: suggestionRef.id
      },
      priority: 'normal',
      submitter: req.auth.uid,
      submitterRole: req.auth.token?.role || 'traveler',
      moderator: null,
      status: 'queued',
      targetData: suggestionData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`Suggestion created: ${suggestionRef.id} for place ${placeId} by ${req.auth.uid}`);
    return { 
      success: true, 
      suggestionId: suggestionRef.id,
      message: 'Đề xuất đã được gửi thành công'
    };
  } catch (error) {
    logger.error('Error creating suggestion:', error);
    throw error;
  }
});

// Trigger khi itinerary được tạo
export const onItineraryCreated = onDocumentCreated('itineraries/{itineraryId}', async (event) => {
  const itineraryData = event.data?.data();
  if (!itineraryData) return;

  const db = admin.firestore();
  const itineraryId = event.params.itineraryId;

  try {
    // Cập nhật user stats
    await db.doc(`users/${itineraryData.ownerId}`).update({
      'stats.itinerariesPublic': itineraryData.isPublic ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Cập nhật system counters
    if (itineraryData.isPublic) {
      await db.doc('system/counters/itineraries_public').set({
        key: 'itineraries_public',
        value: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    logger.info(`Counters updated for itinerary: ${itineraryId}`);
  } catch (error) {
    logger.error('Error updating counters for itinerary:', error);
  }
});

// Trigger khi itinerary visibility thay đổi
export const onItineraryUpdated = onDocumentUpdated('itineraries/{itineraryId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  
  if (!beforeData || !afterData) return;

  const db = admin.firestore();
  const itineraryId = event.params.itineraryId;

  try {
    // Kiểm tra thay đổi visibility
    if (beforeData.visibility !== afterData.visibility) {
      const wasPublic = beforeData.visibility === 'public';
      const isNowPublic = afterData.visibility === 'public';

      if (!wasPublic && isNowPublic) {
        // Chuyển từ private → public
        await db.doc(`users/${afterData.ownerId}`).update({
          'stats.itinerariesPublic': admin.firestore.FieldValue.increment(1)
        });
        
        await db.doc('system/counters/itineraries_public').set({
          value: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } else if (wasPublic && !isNowPublic) {
        // Chuyển từ public → private
        await db.doc(`users/${afterData.ownerId}`).update({
          'stats.itinerariesPublic': admin.firestore.FieldValue.increment(-1)
        });
        
        await db.doc('system/counters/itineraries_public').set({
          value: admin.firestore.FieldValue.increment(-1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }

      logger.info(`Itinerary visibility changed: ${itineraryId} from ${beforeData.visibility} to ${afterData.visibility}`);
    }
  } catch (error) {
    logger.error('Error handling itinerary update:', error);
  }
});

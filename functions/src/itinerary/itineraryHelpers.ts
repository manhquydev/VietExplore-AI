// functions/src/itinerary/itineraryHelpers.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';

// Function để tạo shareable link cho itinerary
export const createItineraryShare = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  const { itineraryId, expiresIn = 30 } = req.data; // Default 30 days
  
  if (!itineraryId) {
    throw new HttpsError('invalid-argument', 'Itinerary ID là bắt buộc');
  }

  try {
    const db = admin.firestore();
    
    // Kiểm tra quyền sở hữu itinerary
    const itineraryDoc = await db.doc(`itineraries/${itineraryId}`).get();
    if (!itineraryDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy lịch trình');
    }

    const itineraryData = itineraryDoc.data()!;
    if (itineraryData.authorId !== req.auth.uid) {
      throw new HttpsError('permission-denied', 'Không có quyền chia sẻ lịch trình này');
    }

    // Tạo share link
    const shareId = db.collection('itineraryShares').doc().id;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    const shareData = {
      id: shareId,
      itineraryId,
      authorId: req.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      accessCount: 0,
      isActive: true
    };

    await db.doc(`itineraryShares/${shareId}`).set(shareData);

    logger.info(`Share link created for itinerary ${itineraryId} by ${req.auth.uid}`);
    return { 
      success: true, 
      shareId, 
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/itineraries/shared/${shareId}` 
    };
  } catch (error) {
    logger.error('Error creating itinerary share:', error);
    throw error;
  }
});

// Function để duplicate itinerary
export const duplicateItinerary = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  const { itineraryId, newTitle } = req.data;
  
  if (!itineraryId) {
    throw new HttpsError('invalid-argument', 'Itinerary ID là bắt buộc');
  }

  try {
    const db = admin.firestore();
    
    // Lấy itinerary gốc
    const originalDoc = await db.doc(`itineraries/${itineraryId}`).get();
    if (!originalDoc.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy lịch trình');
    }

    const originalData = originalDoc.data()!;
    
    // Kiểm tra quyền truy cập (public hoặc owner)
    if (!originalData.isPublic && originalData.authorId !== req.auth.uid) {
      throw new HttpsError('permission-denied', 'Không có quyền sao chép lịch trình này');
    }

    // Tạo bản sao
    const newItineraryId = db.collection('itineraries').doc().id;
    const duplicatedData = {
      ...originalData,
      id: newItineraryId,
      title: newTitle || `${originalData.title} (Bản sao)`,
      authorId: req.auth.uid,
      isPublic: false, // Mặc định private
      originalItineraryId: itineraryId,
      isDuplicated: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.doc(`itineraries/${newItineraryId}`).set(duplicatedData);

    // Tăng counter duplicate cho itinerary gốc
    await db.doc(`itineraries/${itineraryId}`).update({
      duplicateCount: admin.firestore.FieldValue.increment(1)
    });

    logger.info(`Itinerary ${itineraryId} duplicated to ${newItineraryId} by ${req.auth.uid}`);
    return { success: true, newItineraryId };
  } catch (error) {
    logger.error('Error duplicating itinerary:', error);
    throw error;
  }
});

// Trigger để cập nhật counters khi có itinerary mới
export const onItineraryCreate = onDocumentCreated('itineraries/{itineraryId}', async (event) => {
  const itineraryData = event.data?.data();
  if (!itineraryData) return;

  const db = admin.firestore();
  
  try {
    // Cập nhật user stats
    await db.doc(`users/${itineraryData.authorId}`).update({
      itineraryCount: admin.firestore.FieldValue.increment(1),
      lastItineraryCreated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Cập nhật system counters
    await db.doc('system/counters/itineraries').set({
      total: admin.firestore.FieldValue.increment(1),
      public: itineraryData.isPublic ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    logger.info(`Counters updated for new itinerary: ${event.params.itineraryId}`);
  } catch (error) {
    logger.error('Error updating counters:', error);
  }
});

// Function để report inappropriate content
export const reportContent = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Cần đăng nhập');
  }

  const { targetType, targetId, reason, description } = req.data;
  
  if (!targetType || !targetId || !reason) {
    throw new HttpsError('invalid-argument', 'Thiếu thông tin báo cáo');
  }

  const validTargetTypes = ['place', 'itinerary', 'user', 'comment'];
  if (!validTargetTypes.includes(targetType)) {
    throw new HttpsError('invalid-argument', 'Loại nội dung báo cáo không hợp lệ');
  }

  try {
    const db = admin.firestore();
    
    // Kiểm tra đã báo cáo chưa
    const existingReport = await db.collection('reports')
      .where('reportedBy', '==', req.auth.uid)
      .where('targetType', '==', targetType)
      .where('targetId', '==', targetId)
      .limit(1)
      .get();

    if (!existingReport.empty) {
      throw new HttpsError('already-exists', 'Bạn đã báo cáo nội dung này rồi');
    }

    // Tạo report
    const reportData = {
      targetType,
      targetId,
      reason,
      description: description || '',
      reportedBy: req.auth.uid,
      status: 'pending',
      priority: 'medium',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null,
      resolution: null
    };

    const reportRef = await db.collection('reports').add(reportData);

    logger.info(`Content reported: ${targetType}/${targetId} by ${req.auth.uid}`);
    return { success: true, reportId: reportRef.id };
  } catch (error) {
    logger.error('Error creating report:', error);
    throw error;
  }
});



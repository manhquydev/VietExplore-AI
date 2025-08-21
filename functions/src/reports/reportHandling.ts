// functions/src/reports/reportHandling.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// Function resolve report (Moderator only)
export const modResolveReport = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth!.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền xử lý báo cáo');
  }

  const { reportId, action, reason } = req.data;
  
  if (!reportId || !action) {
    throw new HttpsError('invalid-argument', 'Report ID và action là bắt buộc');
  }

  const validActions = ['hide_place', 'hide_itinerary', 'disable_user', 'dismiss', 'escalate'];
  if (!validActions.includes(action)) {
    throw new HttpsError('invalid-argument', `Action không hợp lệ. Chỉ chấp nhận: ${validActions.join(', ')}`);
  }

  try {
    const db = admin.firestore();
    const reportRef = db.doc(`reports/${reportId}`);

    await db.runTransaction(async (tx) => {
      const reportSnap = await tx.get(reportRef);
      
      if (!reportSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy báo cáo');
      }

      const reportData = reportSnap.data()!;
      
      if (reportData.status !== 'received') {
        throw new HttpsError('failed-precondition', 'Báo cáo đã được xử lý');
      }

      // Execute action based on type
      switch (action) {
        case 'hide_place':
          if (reportData.target.type === 'place') {
            const placeRef = db.doc(`places/${reportData.target.id}`);
            tx.update(placeRef, {
              status: 'hidden',
              hiddenReason: reason || 'Vi phạm quy định cộng đồng',
              hiddenBy: req.auth!.uid,
              hiddenAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Update counter
            tx.set(db.doc('system/counters/places_hidden'), {
              value: admin.firestore.FieldValue.increment(1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          }
          break;

        case 'hide_itinerary':
          if (reportData.target.type === 'itinerary') {
            const itineraryRef = db.doc(`itineraries/${reportData.target.id}`);
            tx.update(itineraryRef, {
              visibility: 'private',
              isPublic: false,
              hiddenReason: reason || 'Vi phạm quy định cộng đồng',
              hiddenBy: req.auth!.uid,
              hiddenAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          break;

        case 'disable_user':
          if (reportData.target.type === 'user') {
            const userRef = db.doc(`users/${reportData.target.id}`);
            tx.update(userRef, {
              disabled: true,
              disabledReason: reason || 'Vi phạm quy định cộng đồng',
              disabledBy: req.auth!.uid,
              disabledAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          break;

        case 'dismiss':
          // Chỉ update report status
          break;

        case 'escalate':
          // Escalate to admin hoặc higher authority
          break;
      }

      // Update report status
      tx.update(reportRef, {
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        resolution: action,
        handledBy: req.auth!.uid,
        resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        resolutionNotes: reason || null
      });

      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: { 
          uid: req.auth!.uid, 
          role: req.auth!.token.role,
          email: req.auth!.token.email
        },
        action: `resolve_report_${action}`,
        target: { 
          collection: 'reports', 
          id: reportId 
        },
        metadata: {
          originalTarget: reportData.target,
          resolution: action,
          reason
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    logger.info(`Report resolved: ${reportId} with action ${action} by ${req.auth!.uid}`);
    return { 
      success: true, 
      message: `Báo cáo đã được xử lý: ${action}` 
    };
  } catch (error) {
    logger.error('Error resolving report:', error);
    throw error;
  }
});

// Function get reports queue (Moderator/Admin)
export const getReportsQueue = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth!.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền xem reports');
  }

  const { status = 'received', priority, limit = 20, offset = 0 } = req.data;

  try {
    const db = admin.firestore();
    
    let query = db.collection('reports').where('status', '==', status);
    
    if (priority) {
      query = query.where('priority', '==', priority);
    }
    
    query = query.orderBy('createdAt', 'desc');
    
    if (offset > 0) {
      query = query.offset(offset);
    }
    
    query = query.limit(limit);

    const snapshot = await query.get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      reports,
      total: snapshot.size,
      hasMore: snapshot.size === limit
    };
  } catch (error) {
    logger.error('Error fetching reports queue:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy danh sách báo cáo');
  }
});

// Function update report priority (Admin only)
export const updateReportPriority = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || req.auth!.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Chỉ Admin mới có quyền thay đổi priority');
  }

  const { reportId, priority } = req.data;
  
  if (!reportId || !priority) {
    throw new HttpsError('invalid-argument', 'Report ID và priority là bắt buộc');
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    throw new HttpsError('invalid-argument', 'Priority không hợp lệ');
  }

  try {
    const db = admin.firestore();
    
    await db.doc(`reports/${reportId}`).update({
      priority,
      priorityUpdatedBy: req.auth!.uid,
      priorityUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Audit log
    await db.collection('audits').add({
      actor: { 
        uid: req.auth!.uid, 
        role: req.auth!.token.role 
      },
      action: 'update_report_priority',
      target: { 
        collection: 'reports', 
        id: reportId 
      },
      metadata: { newPriority: priority },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`Report priority updated: ${reportId} → ${priority} by ${req.auth!.uid}`);
    return { success: true, message: `Priority đã được cập nhật thành ${priority}` };
  } catch (error) {
    logger.error('Error updating report priority:', error);
    throw error;
  }
});

// Function get moderation dashboard data
export const getModerationDashboard = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth!.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền xem dashboard');
  }

  try {
    const db = admin.firestore();
    
    // Get pending counts
    const pendingModerationSnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('status', '==', 'queued')
      .count()
      .get();

    const inReviewSnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('status', '==', 'in_review')
      .count()
      .get();

    const pendingReportsSnapshot = await db.collection('reports')
      .where('status', '==', 'received')
      .count()
      .get();

    // Get overdue items
    const now = admin.firestore.Timestamp.now();
    const overdueSnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('status', 'in', ['queued', 'in_review'])
      .where('dueAt', '<', now)
      .get();

    // Get recent activity (if Admin)
    let recentActivity = null;
    if (req.auth!.token.role === 'admin') {
      const recentAuditSnapshot = await db.collection('audits')
        .where('action', 'in', ['approve_draft', 'reject_draft', 'resolve_report'])
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      recentActivity = recentAuditSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    return {
      success: true,
      dashboard: {
        pending: {
          moderation: pendingModerationSnapshot.data().count,
          inReview: inReviewSnapshot.data().count,
          reports: pendingReportsSnapshot.data().count
        },
        overdue: {
          count: overdueSnapshot.size,
          items: overdueSnapshot.docs.map(doc => ({
            id: doc.id,
            type: doc.data().type,
            priority: doc.data().priority,
            dueAt: doc.data().dueAt,
            escalationLevel: doc.data().escalation?.level || 0
          }))
        },
        recentActivity
      }
    };
  } catch (error) {
    logger.error('Error fetching moderation dashboard:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy dashboard data');
  }
});

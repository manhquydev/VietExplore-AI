// functions/src/sla/slaSystem.ts
import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// SLA sweep - chạy mỗi giờ (theo Tài liệu 4)
export const slaSweepModerationHourly = onSchedule({
  schedule: 'every 60 minutes',
  region: 'asia-southeast1',
  timeZone: 'Asia/Ho_Chi_Minh'
}, async () => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  
  try {
    logger.info('Starting SLA sweep for moderation queue');

    // Tìm requests quá hạn
    const overdueQuery = db.collection('moderation').doc('requests').collection('items')
      .where('status', 'in', ['queued', 'in_review'])
      .where('dueAt', '<', now);

    const overdueSnapshot = await overdueQuery.get();
    
    if (overdueSnapshot.empty) {
      logger.info('No overdue moderation requests found');
      return;
    }

    const batch = db.batch();
    const notifications: any[] = [];

    overdueSnapshot.forEach((doc) => {
      const requestData = doc.data();
      const currentLevel = requestData.escalation?.level ?? 0;
      const newLevel = Math.min(currentLevel + 1, 3); // Max level 3

      // Update escalation
      batch.update(doc.ref, {
        priority: 'high', // Escalate to high priority
        'escalation.level': newLevel,
        'escalation.lastNotifiedAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Prepare notification data
      notifications.push({
        requestId: doc.id,
        type: requestData.type,
        submitterRole: requestData.submitterRole,
        dueAt: requestData.dueAt,
        escalationLevel: newLevel,
        overdueDays: Math.ceil((now.toMillis() - requestData.dueAt.toMillis()) / (24 * 60 * 60 * 1000))
      });

      logger.info(`Escalated overdue request: ${doc.id} to level ${newLevel}`);
    });

    await batch.commit();

    // Log escalation summary
    await db.collection('audits').add({
      actor: { uid: 'system', role: 'scheduler' },
      action: 'sla_escalation',
      target: { collection: 'moderation/requests/items', id: 'batch' },
      metadata: {
        overdueCount: notifications.length,
        notifications
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update system counter
    await db.doc('system/counters/sla_violations').set({
      key: 'sla_violations',
      value: admin.firestore.FieldValue.increment(notifications.length),
      lastSweepAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    logger.info(`SLA sweep completed: ${notifications.length} requests escalated`);

    // TODO: Send notifications (email/Slack/FCM) cho moderators
    // Có thể integrate với SendGrid, Slack API, hoặc FCM
    
  } catch (error) {
    logger.error('Error in SLA sweep:', error);
  }
});

// Function get SLA metrics (Admin/Moderator)
export const getSLAMetrics = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || !['moderator', 'admin'].includes(req.auth!.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền xem SLA metrics');
  }

  try {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // Get current overdue requests
    const overdueSnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('status', 'in', ['queued', 'in_review'])
      .where('dueAt', '<', now)
      .get();

    // Get requests by escalation level
    const escalationLevels: { [key: string]: number } = {};
    overdueSnapshot.docs.forEach(doc => {
      const level = doc.data().escalation?.level || 0;
      escalationLevels[level] = (escalationLevels[level] || 0) + 1;
    });

    // Get SLA performance (last 30 days)
    const thirtyDaysAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentRequestsSnapshot = await db.collection('moderation').doc('requests').collection('items')
      .where('createdAt', '>=', thirtyDaysAgo)
      .where('status', 'in', ['approved', 'rejected', 'returned'])
      .get();

    let onTimeCount = 0;
    let overdueCount = 0;
    const performanceByRole: { [key: string]: any } = {};

    recentRequestsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const wasOnTime = data.reviewedAt && data.reviewedAt.toMillis() <= data.dueAt.toMillis();
      
      if (wasOnTime) {
        onTimeCount++;
      } else {
        overdueCount++;
      }

      // Track by submitter role
      const role = data.submitterRole || 'unknown';
      if (!performanceByRole[role]) {
        performanceByRole[role] = { onTime: 0, overdue: 0 };
      }
      
      if (wasOnTime) {
        performanceByRole[role].onTime++;
      } else {
        performanceByRole[role].overdue++;
      }
    });

    const totalProcessed = onTimeCount + overdueCount;
    const slaCompliance = totalProcessed > 0 ? Math.round((onTimeCount / totalProcessed) * 100) : 100;

    return {
      success: true,
      metrics: {
        currentOverdue: overdueSnapshot.size,
        escalationLevels,
        last30Days: {
          totalProcessed,
          onTime: onTimeCount,
          overdue: overdueCount,
          slaCompliance: `${slaCompliance}%`
        },
        performanceByRole
      }
    };
  } catch (error) {
    logger.error('Error fetching SLA metrics:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy SLA metrics');
  }
});

// Function force escalate request (Admin only)
export const forceEscalateRequest = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || req.auth!.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Chỉ Admin mới có quyền force escalate');
  }

  const { requestId, reason } = req.data;
  
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
      
      if (!['queued', 'in_review'].includes(requestData.status)) {
        throw new HttpsError('failed-precondition', 'Yêu cầu không thể escalate');
      }

      // Force escalate
      tx.update(requestRef, {
        priority: 'urgent',
        'escalation.level': 3, // Max level
        'escalation.lastNotifiedAt': admin.firestore.FieldValue.serverTimestamp(),
        'escalation.reason': reason || 'Admin force escalation',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit log
      const auditRef = db.collection('audits').doc();
      tx.set(auditRef, {
        actor: { 
          uid: req.auth!.uid, 
          role: req.auth!.token.role 
        },
        action: 'force_escalate',
        target: { 
          collection: 'moderation/requests/items', 
          id: requestId 
        },
        metadata: { reason },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    logger.info(`Request force escalated: ${requestId} by admin ${req.auth!.uid}`);
    return { success: true, message: 'Yêu cầu đã được escalate khẩn cấp' };
  } catch (error) {
    logger.error('Error force escalating request:', error);
    throw error;
  }
});

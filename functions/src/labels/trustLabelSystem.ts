// functions/src/labels/trustLabelSystem.ts
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';

// Valid trust labels (từ Tài liệu 4)
const VALID_LABELS = ['community', 'contributor', 'partner', 'verified'] as const;
type TrustLabel = typeof VALID_LABELS[number];

// Helper function
function assertModerator(auth?: any) {
  if (!auth || !['moderator', 'admin'].includes(auth.token.role)) {
    throw new HttpsError('permission-denied', 'Chỉ Moderator/Admin mới có quyền gắn nhãn');
  }
}

// Function set trust label (Manual - Moderator/Admin only)
export const setTrustLabel = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  assertModerator(req.auth);
  
  const { placeId, label } = req.data as { placeId: string; label: TrustLabel };
  
  if (!placeId || !label) {
    throw new HttpsError('invalid-argument', 'Place ID và label là bắt buộc');
  }

  if (!VALID_LABELS.includes(label)) {
    throw new HttpsError('invalid-argument', `Label không hợp lệ. Chỉ chấp nhận: ${VALID_LABELS.join(', ')}`);
  }

  try {
    const db = admin.firestore();
    const placeRef = db.doc(`places/${placeId}`);
    
    await db.runTransaction(async (tx) => {
      const placeSnap = await tx.get(placeRef);
      
      if (!placeSnap.exists) {
        throw new HttpsError('not-found', 'Không tìm thấy địa điểm');
      }

      const placeData = placeSnap.data()!;
      const previousLabel = placeData.trustLabel;

      // Update place
      tx.update(placeRef, { 
        trustLabel: label,
        labelUpdatedBy: req.auth!.uid,
        labelUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
        action: 'update_trust_label',
        target: { 
          collection: 'places', 
          id: placeId 
        },
        diff: {
          before: { trustLabel: previousLabel },
          after: { trustLabel: label }
        },
        metadata: { reason: 'manual_update' },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update label usage counter
      tx.set(db.doc(`system/counters/trust_labels_${label}`), {
        value: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      if (previousLabel && previousLabel !== label) {
        tx.set(db.doc(`system/counters/trust_labels_${previousLabel}`), {
          value: admin.firestore.FieldValue.increment(-1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    });

    logger.info(`Trust label updated: ${placeId} → ${label} by ${req.auth!.uid}`);
    return { 
      success: true, 
      message: `Nhãn tin cậy đã được cập nhật thành "${label}"` 
    };
  } catch (error) {
    logger.error('Error setting trust label:', error);
    throw error;
  }
});

// Auto-assign trust label khi place được publish (trigger)
export const onPlacePublished = onDocumentCreated('places/{placeId}', async (event) => {
  const placeData = event.data?.data();
  if (!placeData) return;

  const placeId = event.params.placeId;
  const db = admin.firestore();

  try {
    // Determine trust label based on creator role
    let autoLabel: TrustLabel = 'community'; // Default
    
    // Get creator info
    const creatorDoc = await db.doc(`users/${placeData.createdBy}`).get();
    if (creatorDoc.exists) {
      const creatorData = creatorDoc.data()!;
      
      switch (creatorData.role) {
        case 'partner':
          autoLabel = 'partner';
          break;
        case 'contributor':
          autoLabel = placeData.submitterRole === 'contributor' ? 'contributor' : 'community';
          break;
        default:
          autoLabel = 'community';
      }
    }

    // Only update if not already set
    if (!placeData.trustLabel) {
      await db.doc(`places/${placeId}`).update({
        trustLabel: autoLabel,
        labelUpdatedBy: 'system',
        labelUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update counter
      await db.doc(`system/counters/trust_labels_${autoLabel}`).set({
        key: `trust_labels_${autoLabel}`,
        value: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      logger.info(`Auto-assigned trust label: ${placeId} → ${autoLabel}`);
    }
  } catch (error) {
    logger.error('Error auto-assigning trust label:', error);
  }
});

// Function get trust label stats (Public)
export const getTrustLabelStats = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  try {
    const db = admin.firestore();
    const stats: any = {};

    // Get counts for each label
    for (const label of VALID_LABELS) {
      const counterDoc = await db.doc(`system/counters/trust_labels_${label}`).get();
      stats[label] = counterDoc.exists ? counterDoc.data()?.value || 0 : 0;
    }

    // Get total places
    const totalPlacesDoc = await db.doc('system/counters/places_published').get();
    const totalPlaces = totalPlacesDoc.exists ? totalPlacesDoc.data()?.value || 0 : 0;

    return {
      success: true,
      stats: {
        labelCounts: stats,
        totalPlaces,
        distribution: Object.fromEntries(
          VALID_LABELS.map(label => [
            label, 
            totalPlaces > 0 ? Math.round((stats[label] / totalPlaces) * 100) : 0
          ])
        )
      }
    };
  } catch (error) {
    logger.error('Error fetching trust label stats:', error);
    throw new HttpsError('internal', 'Lỗi khi lấy thống kê nhãn tin cậy');
  }
});

// Function manage labels collection (Admin only)
export const manageTrustLabels = onCall({
  region: 'asia-southeast1'
}, async (req) => {
  if (!req.auth?.token?.role || req.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Chỉ Admin mới có quyền quản lý labels');
  }

  const { action, labelData } = req.data;
  
  if (!action || !['create', 'update', 'delete'].includes(action)) {
    throw new HttpsError('invalid-argument', 'Action không hợp lệ');
  }

  try {
    const db = admin.firestore();

    switch (action) {
      case 'create':
        if (!labelData?.key || !labelData?.displayName) {
          throw new HttpsError('invalid-argument', 'Key và displayName là bắt buộc');
        }

        const labelRef = await db.collection('labels').add({
          key: labelData.key,
          displayName: labelData.displayName,
          description: labelData.description || '',
          color: labelData.color || '#3B82F6',
          icon: labelData.icon || '',
          isActive: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, labelId: labelRef.id, message: 'Label đã được tạo' };

      case 'update':
        if (!labelData?.id) {
          throw new HttpsError('invalid-argument', 'Label ID là bắt buộc');
        }

        await db.doc(`labels/${labelData.id}`).update({
          ...labelData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, message: 'Label đã được cập nhật' };

      case 'delete':
        if (!labelData?.id) {
          throw new HttpsError('invalid-argument', 'Label ID là bắt buộc');
        }

        await db.doc(`labels/${labelData.id}`).update({
          isActive: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, message: 'Label đã được vô hiệu hóa' };

      default:
        throw new HttpsError('invalid-argument', 'Action không được hỗ trợ');
    }
  } catch (error) {
    logger.error('Error managing trust labels:', error);
    throw error;
  }
});

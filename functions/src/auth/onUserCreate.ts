// functions/src/auth/onUserCreate.ts  
import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';

// Trigger khi user document được tạo trong Firestore
export const onUserDocumentCreate = onDocumentCreated('users/{uid}', async (event) => {
  const uid = event.params.uid;
  const userData = event.data?.data();
  
  if (!userData) return;

  try {
    logger.info(`Setting custom claims for new user ${uid}`, { email: userData.email });

    // Gán custom claims dựa trên dữ liệu trong Firestore
    await admin.auth().setCustomUserClaims(uid, { 
      role: userData.role || 'traveler', 
      verifiedContributor: userData.verifiedContributor || false,
      partnerId: userData.partnerId || null,
      permissions: userData.permissions || []
    });

    logger.info(`Successfully set custom claims for user ${uid}`);
  } catch (error) {
    logger.error(`Error setting custom claims for user ${uid}:`, error);
  }
});



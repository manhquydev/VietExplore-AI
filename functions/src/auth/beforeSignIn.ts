// functions/src/auth/beforeSignIn.ts
import { beforeUserSignedIn } from 'firebase-functions/v2/identity';
import { HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

export const beforeSignIn = beforeUserSignedIn({
  region: 'asia-east1'
}, async (event) => {
  const uid = event.data?.uid;
  const email = event.data?.email;
  
  try {
    // Kiểm tra user có bị disable không
    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      if (userData?.disabled === true) {
        logger.warn(`Blocked sign-in for disabled user: ${uid}`, { email });
        throw new HttpsError('permission-denied', 'Tài khoản đã bị vô hiệu hóa');
      }
    }

    // Kiểm tra email verification cho các hành động quan trọng
    const emailVerified = event.data?.emailVerified || false;
    if (!emailVerified) {
      logger.info(`User ${uid} signing in without email verification`, { email });
      // Không chặn đăng nhập, nhưng sẽ hạn chế quyền trong Security Rules
    }

    logger.info(`Allowing sign-in for user: ${uid}`, { email, emailVerified });
  } catch (error) {
    logger.error('Error in beforeSignIn function:', error);
    throw error;
  }
});

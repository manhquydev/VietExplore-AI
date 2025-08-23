// functions/src/auth/onAuthUserCreate.ts - Auth trigger để tạo user document
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';

/**
 * Trigger khi Firebase Auth user được tạo
 * Tự động tạo user document trong Firestore
 */
export const onAuthUserCreate = beforeUserCreated(async (event) => {
  const userData = event.data;
  
  if (!userData) {
    logger.error('User creation failed: No user data provided');
    throw new Error('User data is required');
  }

  const { uid, email, displayName, photoURL } = userData;
  
  if (!email) {
    logger.error('User creation failed: No email provided');
    throw new Error('Email is required');
  }

  try {
    // Tạo user profile document trong Firestore
    const userProfile = {
      id: uid,
      email: email,
      displayName: displayName || '',
      photoURL: photoURL || '',
      role: 'traveler',
      status: 'active',
      verifiedContributor: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Thêm metadata
      authProvider: userData.providerData?.[0]?.providerId || 'password',
      emailVerified: false
    };

    // Tạo document trong Firestore với Admin SDK (bypass rules)
    await admin.firestore()
      .collection('users')
      .doc(uid)
      .set(userProfile);

    logger.info(`User profile created successfully for ${email}`, { uid });

    // Set initial custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role: 'traveler',
      verifiedContributor: false,
      partnerId: null,
      permissions: []
    });

    logger.info(`Custom claims set for user ${uid}`);

  } catch (error) {
    logger.error(`Error creating user profile for ${uid}:`, error);
    throw new Error('Failed to create user profile');
  }
});

/**
 * Callable function để tạo user profile manually nếu cần
 */
export const createUserProfile = onCall(async (request) => {
  const { auth } = request;
  
  if (!auth) {
    throw new Error('Authentication required');
  }

  const uid = auth.uid;
  
  try {
    // Check if profile already exists
    const existingDoc = await admin.firestore()
      .collection('users')
      .doc(uid)
      .get();

    if (existingDoc.exists) {
      return { success: true, message: 'Profile already exists' };
    }

    // Get user from Auth
    const userRecord = await admin.auth().getUser(uid);
    
    const userProfile = {
      id: uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || '',
      role: 'traveler',
      status: 'active',
      verifiedContributor: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: userRecord.emailVerified
    };

    await admin.firestore()
      .collection('users')
      .doc(uid)
      .set(userProfile);

    return { success: true, message: 'Profile created successfully' };

  } catch (error) {
    logger.error(`Error in createUserProfile for ${uid}:`, error);
    throw new Error('Failed to create user profile');
  }
});

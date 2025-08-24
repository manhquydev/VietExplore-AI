import * as admin from 'firebase-admin';

/**
 * A function that initializes the Firebase Admin SDK if it hasn't been already.
 * This approach, combined with dynamic imports in the API routes, ensures that
 * the Admin SDK is only initialized when an API route is actually called,
 * preventing build errors in environments where secrets are not available.
 * @returns An object containing the admin app instance and its services.
 */
export const getFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return {
      adminApp: admin.app(),
      adminAuth: admin.auth(),
      adminDb: admin.firestore(),
      adminStorage: admin.storage(),
    };
  }

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!serviceAccountJson) {
    // In a serverless environment, this error will only be thrown at runtime
    // if the environment variable is missing.
    throw new Error('FIREBASE_ADMIN_SDK_JSON is not set.');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  const adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`,
  });

  return {
    adminApp,
    adminAuth: adminApp.auth(),
    adminDb: adminApp.firestore(),
    adminStorage: adminApp.storage(),
  };
};

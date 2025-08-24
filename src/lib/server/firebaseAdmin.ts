import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK, reusing a cached instance if available.
 * This function is the single source of truth for the admin app. It reads credentials
 * from the `FIREBASE_ADMIN_SDK_JSON` environment variable.
 * @returns The initialized Firebase Admin app instance.
 */
function initializeFirebaseAdmin() {
  // Check if we've already initialized
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Read credentials from environment variable
  const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      'FIREBASE_ADMIN_SDK_JSON environment variable is not set. ' +
      'Please provide the service account key as a JSON string.'
    );
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`,
    });
  } catch (error: any) {
    throw new Error(`Failed to parse FIREBASE_ADMIN_SDK_JSON: ${error.message}`);
  }
}

// Initialize and export the admin instance for use in other server-side modules.
export const firebaseAdmin = initializeFirebaseAdmin();
export const adminAuth = firebaseAdmin.auth();
export const adminDb = firebaseAdmin.firestore();
export const adminStorage = firebaseAdmin.storage();

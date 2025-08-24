import * as admin from 'firebase-admin';

// IMPORTANT: In a production environment, you should not hardcode the service account key.
// Instead, use environment variables. For Vercel, you would set an environment variable
// `FIREBASE_ADMIN_SDK_JSON` with the content of the JSON file.
//
// Example for production:
// const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON as string);
//
import serviceAccount from '../../../vietexplore-ai-firebase-adminsdk-fbsvc-3554e3a673.json';

// A type assertion is used here because the imported JSON is not recognized as a ServiceAccountCredential.
// This is a common workaround for using JSON imports with TypeScript for this specific library.
const typedServiceAccount = serviceAccount as admin.ServiceAccount;

/**
 * A global cache for the Firebase Admin app instance to avoid re-initialization.
 * This is a common pattern in serverless environments like Next.js.
 */
let cachedAdminApp: admin.app.App;

/**
 * Initializes the Firebase Admin SDK, reusing the cached instance if available.
 * This function is the single source of truth for the admin app.
 * @returns The initialized Firebase Admin app instance.
 */
function initializeFirebaseAdmin() {
  if (!cachedAdminApp) {
    if (admin.apps.length > 0) {
      cachedAdminApp = admin.app();
    } else {
      cachedAdminApp = admin.initializeApp({
        credential: admin.credential.cert(typedServiceAccount),
        databaseURL: `https://${typedServiceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`,
      });
    }
  }
  return cachedAdminApp;
}

// Initialize and export the admin instance for use in other server-side modules.
export const firebaseAdmin = initializeFirebaseAdmin();
export const adminAuth = firebaseAdmin.auth();
export const adminDb = firebaseAdmin.firestore();
export const adminStorage = firebaseAdmin.storage();

import * as admin from 'firebase-admin';

/**
 * A function that initializes the Firebase Admin SDK if it hasn't been already.
 * This approach, combined with dynamic imports in the API routes, ensures that
 * the Admin SDK is only initialized when an API route is actually called,
 * preventing build errors in environments where secrets are not available.
 * 
 * This version is now emulator-aware, checking NEXT_PUBLIC_USE_FIREBASE_EMULATOR.
 * 
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

  const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

  if (useEmulator) {
    // For emulators, we don't need credentials.
    // The Admin SDK will automatically connect if the appropriate
    // environment variables (e.g., FIREBASE_AUTH_EMULATOR_HOST) are set.
    // We MUST set these env vars for the Admin SDK to connect.
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";

    console.log("🔧 Initializing Firebase Admin SDK for EMULATOR");
    const adminApp = admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vietexplore-ai',
    });
    return {
      adminApp,
      adminAuth: adminApp.auth(),
      adminDb: adminApp.firestore(),
      adminStorage: adminApp.storage(),
    };
  }

  // Production environment logic
  const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_ADMIN_SDK_JSON is not set for production. Please provide the service account key in your environment variables.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    console.log("🌐 Initializing Firebase Admin SDK for PRODUCTION");
    const adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app`,
      storageBucket: `vietexplore-ai.appspot.com`
    });

    return {
      adminApp,
      adminAuth: adminApp.auth(),
      adminDb: adminApp.firestore(),
      adminStorage: adminApp.storage(),
    };
  } catch (error) {
    console.error("Failed to parse FIREBASE_ADMIN_SDK_JSON:", error);
    throw new Error("Invalid Firebase Admin SDK credentials provided. Make sure the environment variable is a valid JSON string.");
  }
};

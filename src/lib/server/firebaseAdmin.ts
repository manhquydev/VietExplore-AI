import * as admin from 'firebase-admin';

// Check if the necessary environment variables are set
const hasServiceAccount = 
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
  if (hasServiceAccount) {
    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase Admin SDK initialized successfully.');
        // Emulator connection logic can be added here if needed
        // process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
        // process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
        // process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
      }
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization error:', error.stack);
    }
  } else {
    // This will run in environments where service account keys are not set,
    // like a client-side only development setup or if the env variables are missing.
    console.warn('Firebase Admin SDK not initialized. Missing environment variables.');
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminStorage = admin.apps.length ? admin.storage() : null;

export default admin.apps.length ? admin.apps[0] : null;

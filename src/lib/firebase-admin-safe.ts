/**
 * Safe Firebase Admin SDK initialization
 * This version handles missing environment variables gracefully during build
 */

let adminAuth: any = null;
let adminDb: any = null;
let adminStorage: any = null;

// Only initialize Firebase Admin SDK if all required env vars are present
if (process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY) {
  
  try {
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    const { getAuth } = require('firebase-admin/auth');
    const { getFirestore } = require('firebase-admin/firestore');
    const { getStorage } = require('firebase-admin/storage');

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    const app = !getApps().length 
      ? initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
        })
      : getApps()[0];

    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
    adminStorage = getStorage(app);
  } catch (error) {
    console.warn('Firebase Admin SDK initialization failed:', error);
  }
} else {
  console.warn('Firebase Admin SDK not initialized: missing environment variables');
}

// Export mock objects if Firebase Admin is not available (for build time)
export const safeAdminAuth = adminAuth || {
  verifyIdToken: () => Promise.reject(new Error('Firebase Admin not initialized')),
  createCustomToken: () => Promise.reject(new Error('Firebase Admin not initialized')),
  createUser: () => Promise.reject(new Error('Firebase Admin not initialized')),
};

export const safeAdminDb = adminDb || {
  collection: () => ({
    doc: () => ({
      get: () => Promise.reject(new Error('Firebase Admin not initialized')),
      set: () => Promise.reject(new Error('Firebase Admin not initialized')),
      update: () => Promise.reject(new Error('Firebase Admin not initialized')),
    }),
    add: () => Promise.reject(new Error('Firebase Admin not initialized')),
    where: () => ({
      get: () => Promise.reject(new Error('Firebase Admin not initialized')),
    }),
  }),
};

export const safeAdminStorage = adminStorage || {
  bucket: () => ({
    file: () => ({}),
  }),
};

// Aliases for backward compatibility
export { safeAdminAuth as adminAuth };
export { safeAdminDb as adminDb };
export { safeAdminStorage as adminStorage };

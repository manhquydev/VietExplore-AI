// src/lib/server/firebaseAdmin.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/app';

// Parse service account from JSON string or individual env vars
let serviceAccount: ServiceAccount;

if (process.env.FIREBASE_ADMIN_SDK_JSON) {
  try {
    const parsed = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON);
    serviceAccount = {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
  } catch (error) {
    console.error('Failed to parse FIREBASE_ADMIN_SDK_JSON:', error);
    throw new Error('Invalid FIREBASE_ADMIN_SDK_JSON format');
  }
} else {
  // Fallback to individual env vars
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      // Use NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET from env or fallback to new format
      const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
                           `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`;

      console.log('[Firebase Admin] Initializing with storage bucket:', storageBucket);

      // Get database URL from environment or construct from project ID
      const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
                         `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`;

      console.log('[Firebase Admin] Initializing with database URL:', databaseURL);

      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: storageBucket,
        databaseURL: databaseURL
      });
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization error:', error);
      throw new Error('Firebase Admin SDK could not be initialized. Check server logs.');
    }
  } else {
    console.warn('Firebase Admin SDK not initialized: Missing environment variables.');
    // In a production environment, you might want to throw an error here.
    // For now, we allow it to proceed, but services will fail.
    return null;
  }
}

const app = initializeFirebaseAdmin();

export function getAdminAuth() {
  if (!app) throw new Error("Firebase Admin not initialized.");
  return admin.auth(app);
}

export function getAdminDb() {
  if (!app) throw new Error("Firebase Admin not initialized.");
  return admin.firestore(app);
}

export function getRealtimeDb() {
  if (!app) throw new Error("Firebase Admin not initialized.");
  return admin.database(app);
}

export function getAdminStorage() {
  if (!app) throw new Error("Firebase Admin not initialized.");
  return admin.storage(app);
}

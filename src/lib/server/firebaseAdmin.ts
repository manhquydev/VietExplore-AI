// src/lib/server/firebaseAdmin.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/app';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
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

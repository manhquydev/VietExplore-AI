"use server"

// src/lib/server/firebaseAdmin.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/app';

let app: admin.app.App;

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    return;
  }

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization error:', error);
      // app will be undefined
    }
  } else {
    console.warn('Firebase Admin SDK not initialized: Missing environment variables.');
    // app will be undefined
  }
}

initializeFirebaseAdmin();

function getInitializedApp(): admin.app.App {
  if (!app) {
    throw new Error('Firebase Admin SDK has not been initialized. Check server logs for details.');
  }
  return app;
}

export function getAdminAuth(): admin.auth.Auth | null {
  try {
    return admin.auth(getInitializedApp());
  } catch (error) {
    console.error("Failed to get Firebase Auth instance:", error);
    return null;
  }
}

export function getAdminDb(): admin.firestore.Firestore | null {
  try {
    return admin.firestore(getInitializedApp());
  } catch (error) {
    console.error("Failed to get Firestore instance:", error);
    return null;
  }
}

export function getAdminStorage(): admin.storage.Storage | null {
  try {
    return admin.storage(getInitializedApp());
  } catch (error) {
    console.error("Failed to get Firebase Storage instance:", error);
    return null;
  }
}

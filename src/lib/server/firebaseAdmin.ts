// src/lib/server/firebaseAdmin.ts
import *d from "dotenv";
d.config({ path: ".env.local" });

import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/app';

let app: admin.app.App;

try {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  if (!admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log('✅ Firebase Admin SDK initialized successfully.');
  } else {
    app = admin.apps[0]!;
  }
} catch (error: any) {
  console.error('❌ Firebase Admin SDK initialization error:', error.stack);
  // Prevent app from running with faulty config
  // process.exit(1); // This can be too aggressive for dev environments
}

// Export admin services
export const adminAuth = app! ? admin.auth() : null;
export const adminDb = app! ? admin.firestore() : null;
export const adminStorage = app! ? admin.storage() : null;

export default app!;

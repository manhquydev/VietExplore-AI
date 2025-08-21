// functions/src/config/admin.ts - Secure Admin SDK Configuration
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK with service account
export function initializeAdminSDK() {
  if (admin.apps.length === 0) {
    // Use environment variables for production
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: "https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app"
      });
    } else {
      // Use service account file for development
      const serviceAccount = require('../../vietexplore-ai-firebase-adminsdk-fbsvc-3554e3a673.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app"
      });
    }
  }
  
  return admin;
}

// functions/src/index-minimal.ts - Minimal functions without storage dependencies
import { setGlobalOptions } from "firebase-functions";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: "https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

// Global configuration
setGlobalOptions({ 
  maxInstances: 10,
  region: 'asia-southeast1'
});

// Core Admin & Auth Functions (no storage dependencies)
export { assignUserRole, getAllUsers, promoteUser, toggleUserStatus, getAuditLogs } from './admin/roleManagement';
export { createFirstAdmin, checkSetupStatus, emergencyPromoteAdmin } from './admin/initialSetup';
export { onUserDocumentCreate } from './auth/onUserCreate';
export { grantRole } from './auth/grantRole';
export { beforeCreate } from './auth/beforeCreate';
export { beforeSignIn } from './auth/beforeSignIn';

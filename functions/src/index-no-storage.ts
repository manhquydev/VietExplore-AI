// functions/src/index-no-storage.ts - Functions without storage triggers
import { setGlobalOptions } from "firebase-functions";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: "https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

// Global configuration - match storage region temporarily
setGlobalOptions({ 
  maxInstances: 10,
  region: 'asia-southeast1'
});

// Authentication Functions (no storage dependency)
export { onUserDocumentCreate } from './auth/onUserCreate';
export { grantRole } from './auth/grantRole';
export { beforeCreate } from './auth/beforeCreate';
export { beforeSignIn } from './auth/beforeSignIn';

// Admin & RBAC Functions (no storage dependency)
export { assignUserRole, getAllUsers, promoteUser, toggleUserStatus, getAuditLogs } from './admin/roleManagement';
export { createFirstAdmin, checkSetupStatus, emergencyPromoteAdmin } from './admin/initialSetup';

// User Management Functions (no storage dependency)
export { getUsers, requestRoleUpgrade, onUserProfileUpdate } from './user/userManagement';

// Moderation Functions (no storage dependency)
export { submitDraftForReview, getModerationQueue, claimModerationRequest } from './moderation/moderationSubmit';
export { modDecisionApprove, modDecisionReject, modDecisionRequestEdit, getModerationStats } from './moderation/moderationActions';

// Trust Label System (no storage dependency)
export { setTrustLabel, onPlacePublished, getTrustLabelStats, manageTrustLabels } from './labels/trustLabelSystem';

// SLA System (no storage dependency)
export { slaSweepModerationHourly, getSLAMetrics, forceEscalateRequest } from './sla/slaSystem';

// Reports Handling (no storage dependency)
export { modResolveReport, getReportsQueue, updateReportPriority, getModerationDashboard } from './reports/reportHandling';

// Content Moderation (no storage dependency)
export { autoModerateContent, reviewFlaggedContent, getContentModerationQueue } from './moderation/contentModeration';

// Realtime Database Functions (no storage dependency)
export { syncQueueIndex, syncViewerCount } from './rtdb/queueSync';
export { cleanupModeratorActivity, cleanupViewerEntries, cleanupOfflineStatus } from './rtdb/cleanup';

// Itinerary Functions (no storage dependency)
export { createItineraryShare, duplicateItinerary, onItineraryCreate, reportContent } from './itinerary/itineraryHelpers';
export { createItinerary, updateItinerary, createSuggestion, onItineraryCreated, onItineraryUpdated } from './itinerary/itineraryWorkflow';

// Places Functions (no storage dependency)
export { createPlaceDraft, updatePlaceDraft, publishPlace, onPlaceDraftCreate } from './places/placeWorkflow';

// NOTE: Storage functions excluded due to region mismatch
// These will be deployed separately after storage bucket region is fixed:
// - onDraftApproved, uploadImageToDraft, deleteImageFromDraft, togglePlaceImage, onDraftImageUpload

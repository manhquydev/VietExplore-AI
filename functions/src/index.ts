/**
 * Cloud Functions for VietExplore-AI
 * Authentication, authorization, and business logic functions
 */

import { setGlobalOptions } from "firebase-functions";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: "https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

// Global configuration for cost control
setGlobalOptions({ 
  maxInstances: 10,
  region: 'asia-southeast1'
});

// Authentication Functions
export { onUserDocumentCreate } from './auth/onUserCreate';
export { grantRole } from './auth/grantRole';
export { beforeCreate } from './auth/beforeCreate';
export { beforeSignIn } from './auth/beforeSignIn';

// Moderation Functions
export { submitPlaceForModeration, moderatePlace, autoModeratePlaceDraft } from './moderation/placeModeration';

// User Management Functions  
export { getUsers, requestRoleUpgrade, onUserProfileUpdate } from './user/userManagement';

// Itinerary Functions
export { createItineraryShare, duplicateItinerary, onItineraryCreate, reportContent } from './itinerary/itineraryHelpers';
export { createItinerary, updateItinerary, createSuggestion, onItineraryCreated, onItineraryUpdated, getUserItineraries } from './itinerary/itineraryWorkflow';

// Places Functions  
export { createPlaceDraft, updatePlaceDraft, publishPlace, onPlaceDraftCreate, getUserDrafts } from './places/placeWorkflow';

// Storage Functions
export { onDraftApproved, uploadImageToDraft, deleteImageFromDraft, togglePlaceImage, onDraftImageUpload } from './storage/imageProcessing';

// Advanced Moderation Functions (Tài liệu 4)
export { submitDraftForReview, getModerationQueue, claimModerationRequest } from './moderation/moderationSubmit';
export { modDecisionApprove, modDecisionReject, modDecisionRequestEdit, getModerationStats } from './moderation/moderationActions';

// Trust Label System
export { setTrustLabel, onPlacePublished, getTrustLabelStats, manageTrustLabels } from './labels/trustLabelSystem';

// SLA System
export { slaSweepModerationHourly, getSLAMetrics, forceEscalateRequest } from './sla/slaSystem';

// Reports Handling
export { modResolveReport, getReportsQueue, updateReportPriority, getModerationDashboard } from './reports/reportHandling';

// Content Moderation
export { autoModerateContent, reviewFlaggedContent, getContentModerationQueue } from './moderation/contentModeration';

// Realtime Database Functions (Tài liệu 5)
export { syncQueueIndex, syncViewerCount } from './rtdb/queueSync';
export { cleanupModeratorActivity, cleanupViewerEntries, cleanupOfflineStatus } from './rtdb/cleanup';

// Admin & RBAC Functions
export { assignUserRole, getAllUsers, promoteUser, toggleUserStatus, getAuditLogs } from './admin/roleManagement';
export { createFirstAdmin, checkSetupStatus, emergencyPromoteAdmin } from './admin/initialSetup';
export { getDashboardStats, getRecentActivities, getPlatformAnalytics } from './admin/analytics';

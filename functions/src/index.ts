/**
 * Cloud Functions for VietExplore-AI
 * Authentication, authorization, and business logic functions
 */

import { setGlobalOptions } from "firebase-functions";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Global configuration for cost control
setGlobalOptions({ 
  maxInstances: 10,
  region: 'asia-east1'
});

// Authentication Functions
export { onUserDocumentCreate } from './auth/onUserCreate';
export { grantRole } from './auth/grantRole';
export { beforeCreate } from './auth/beforeCreate';
export { beforeSignIn } from './auth/beforeSignIn';

// Moderation Functions
export { submitPlaceForModeration, moderatePlace, autoModeratePlaceDraft } from './moderation/placeModeration';

// User Management Functions
export { toggleUserStatus, getUsers, requestRoleUpgrade, onUserProfileUpdate } from './user/userManagement';

// Itinerary Functions
export { createItineraryShare, duplicateItinerary, onItineraryCreate, reportContent } from './itinerary/itineraryHelpers';
export { createItinerary, updateItinerary, createSuggestion, onItineraryCreated, onItineraryUpdated } from './itinerary/itineraryWorkflow';

// Places Functions  
export { createPlaceDraft, updatePlaceDraft, publishPlace, onPlaceDraftCreate } from './places/placeWorkflow';

// Storage Functions
export { onDraftApproved, uploadImageToDraft, deleteImageFromDraft, togglePlaceImage, onDraftImageUpload } from './storage/imageProcessing';

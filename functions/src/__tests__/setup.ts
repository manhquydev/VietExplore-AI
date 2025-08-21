// Jest setup file for Firebase Functions testing
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK for testing
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'demo-test-project',
    storageBucket: 'demo-test-project.appspot.com',
  });
}

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});



// functions/src/__tests__/auth.test.ts
import * as functionsTest from 'firebase-functions-test';

// Initialize the test environment
const test = functionsTest.default({
  projectId: 'demo-test-project',
});

// Mock Firestore
const mockFirestore = {
  doc: jest.fn().mockReturnThis(),
  set: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
  collection: jest.fn().mockReturnThis(),
  add: jest.fn().mockResolvedValue({ id: 'mock-doc-id' })
};

// Mock Auth
const mockAuth = {
  setCustomUserClaims: jest.fn().mockResolvedValue({})
};

// Mock admin SDK
jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => mockFirestore),
  auth: jest.fn(() => mockAuth),
  initializeApp: jest.fn(),
  apps: { length: 1 }
}));

describe('Authentication Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    test.cleanup();
  });

  describe('handleUserCreate', () => {
    it('should create user profile with default traveler role', async () => {
      const { handleUserCreate } = require('../auth/onCreate');
      
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      };

      // Simulate the function call
      await handleUserCreate(mockUser);

      // Verify Firestore document creation
      expect(mockFirestore.doc).toHaveBeenCalledWith('users/test-uid');
      expect(mockFirestore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
          role: 'traveler',
          verifiedContributor: false,
          partnerId: null,
          disabled: false
        })
      );

      // Verify custom claims
      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith('test-uid', {
        role: 'traveler',
        verifiedContributor: false,
        partnerId: null,
        permissions: []
      });
    });
  });

  describe('grantRole', () => {
    it('should allow admin to grant role to other users', async () => {
      const { grantRole } = require('../auth/grantRole');
      
      const mockRequest = {
        auth: {
          uid: 'admin-uid',
          token: { role: 'admin' }
        },
        data: {
          uid: 'user-uid',
          role: 'contributor',
          verifiedContributor: true
        }
      };

      const result = await grantRole(mockRequest);

      expect(result.success).toBe(true);
      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith('user-uid', {
        role: 'contributor',
        verifiedContributor: true,
        partnerId: null,
        permissions: []
      });
    });

    it('should reject non-admin users', async () => {
      const { grantRole } = require('../auth/grantRole');
      
      const mockRequest = {
        auth: {
          uid: 'user-uid',
          token: { role: 'traveler' }
        },
        data: {
          uid: 'other-user-uid',
          role: 'contributor'
        }
      };

      await expect(grantRole(mockRequest)).rejects.toThrow('permission-denied');
    });

    it('should prevent self-elevation', async () => {
      const { grantRole } = require('../auth/grantRole');
      
      const mockRequest = {
        auth: {
          uid: 'admin-uid',
          token: { role: 'admin' }
        },
        data: {
          uid: 'admin-uid', // Same as caller
          role: 'admin'
        }
      };

      await expect(grantRole(mockRequest)).rejects.toThrow('permission-denied');
    });
  });
});

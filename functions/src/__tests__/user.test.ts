// functions/src/__tests__/user.test.ts
import * as functionsTest from 'firebase-functions-test';

const test = functionsTest.default({
  projectId: 'demo-test-project',
});

// Mock Firestore
const mockFirestore = {
  doc: jest.fn().mockReturnThis(),
  collection: jest.fn().mockReturnThis(),
  update: jest.fn().mockResolvedValue({}),
  add: jest.fn().mockResolvedValue({ id: 'mock-audit-id' }),
  get: jest.fn().mockResolvedValue({ 
    exists: true, 
    data: () => ({
      role: 'traveler',
      disabled: false
    })
  }),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  empty: false,
  size: 10,
  docs: [
    { id: 'user1', data: () => ({ role: 'traveler' }) },
    { id: 'user2', data: () => ({ role: 'contributor' }) }
  ]
};

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => mockFirestore),
  initializeApp: jest.fn(),
  apps: { length: 1 }
}));

describe('User Management Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    test.cleanup();
  });

  describe('toggleUserStatus', () => {
    it('should allow admin to disable user', async () => {
      const { toggleUserStatus } = require('../user/userManagement');
      
      const mockRequest = {
        auth: {
          uid: 'admin-uid',
          token: { role: 'admin' }
        },
        data: {
          uid: 'target-user-uid',
          disabled: true,
          reason: 'Violation of terms'
        }
      };

      const result = await toggleUserStatus(mockRequest);

      expect(result.success).toBe(true);
      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
          disabledReason: 'Violation of terms'
        })
      );
      expect(mockFirestore.add).toHaveBeenCalled(); // Audit log
    });

    it('should prevent admin from disabling themselves', async () => {
      const { toggleUserStatus } = require('../user/userManagement');
      
      const mockRequest = {
        auth: {
          uid: 'admin-uid',
          token: { role: 'admin' }
        },
        data: {
          uid: 'admin-uid', // Same as caller
          disabled: true
        }
      };

      await expect(toggleUserStatus(mockRequest)).rejects.toThrow('permission-denied');
    });

    it('should reject non-admin users', async () => {
      const { toggleUserStatus } = require('../user/userManagement');
      
      const mockRequest = {
        auth: {
          uid: 'user-uid',
          token: { role: 'contributor' }
        },
        data: {
          uid: 'target-user-uid',
          disabled: true
        }
      };

      await expect(toggleUserStatus(mockRequest)).rejects.toThrow('permission-denied');
    });
  });

  describe('requestRoleUpgrade', () => {
    it('should allow traveler to request contributor role', async () => {
      const { requestRoleUpgrade } = require('../user/userManagement');
      
      const mockRequest = {
        auth: {
          uid: 'traveler-uid'
        },
        data: {
          requestedRole: 'contributor',
          reason: 'I want to contribute places',
          portfolio: 'https://example.com/portfolio'
        }
      };

      // Mock user document
      mockFirestore.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: 'traveler' })
      });

      const result = await requestRoleUpgrade(mockRequest);

      expect(result.success).toBe(true);
      expect(result.requestId).toBeDefined();
      expect(mockFirestore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'role_upgrade',
          requestedRole: 'contributor',
          status: 'pending'
        })
      );
    });

    it('should reject upgrade request from non-traveler', async () => {
      const { requestRoleUpgrade } = require('../user/userManagement');
      
      const mockRequest = {
        auth: {
          uid: 'contributor-uid'
        },
        data: {
          requestedRole: 'partner'
        }
      };

      // Mock user document with contributor role
      mockFirestore.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: 'contributor' })
      });

      await expect(requestRoleUpgrade(mockRequest)).rejects.toThrow('failed-precondition');
    });
  });

  describe('getUsers', () => {
    it('should allow admin to fetch user list', async () => {
      const { getUsers } = require('../user/userManagement');
      
      const mockRequest = {
        auth: {
          uid: 'admin-uid',
          token: { role: 'admin' }
        },
        data: {
          limit: 20,
          offset: 0,
          role: 'all'
        }
      };

      const result = await getUsers(mockRequest);

      expect(result.users).toBeDefined();
      expect(result.total).toBe(10);
      expect(Array.isArray(result.users)).toBe(true);
    });

    it('should reject non-admin users', async () => {
      const { getUsers } = require('../user/userManagement');
      
      const mockRequest = {
        auth: {
          uid: 'user-uid',
          token: { role: 'traveler' }
        },
        data: {}
      };

      await expect(getUsers(mockRequest)).rejects.toThrow('permission-denied');
    });
  });
});

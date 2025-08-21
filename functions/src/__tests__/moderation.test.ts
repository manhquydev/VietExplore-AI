// functions/src/__tests__/moderation.test.ts
import * as functionsTest from 'firebase-functions-test';

const test = functionsTest.default({
  projectId: 'demo-test-project',
});

// Mock Firestore
const mockFirestore = {
  doc: jest.fn().mockReturnThis(),
  collection: jest.fn().mockReturnThis(),
  set: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  add: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
  get: jest.fn().mockResolvedValue({ 
    exists: true, 
    data: () => ({
      authorId: 'test-user-uid',
      title: 'Test Place',
      status: 'draft'
    })
  }),
  delete: jest.fn().mockResolvedValue({}),
  batch: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    commit: jest.fn().mockResolvedValue({})
  })
};

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => mockFirestore),
  auth: jest.fn(() => ({})),
  initializeApp: jest.fn(),
  apps: { length: 1 }
}));

describe('Moderation Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    test.cleanup();
  });

  describe('submitPlaceForModeration', () => {
    it('should allow contributor to submit place draft', async () => {
      const { submitPlaceForModeration } = require('../moderation/placeModeration');
      
      const mockRequest = {
        auth: {
          uid: 'test-user-uid',
          token: { role: 'contributor' }
        },
        data: {
          draftId: 'test-draft-id'
        }
      };

      const result = await submitPlaceForModeration(mockRequest);

      expect(result.success).toBe(true);
      expect(mockFirestore.add).toHaveBeenCalled();
      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'submitted'
        })
      );
    });

    it('should reject non-contributor users', async () => {
      const { submitPlaceForModeration } = require('../moderation/placeModeration');
      
      const mockRequest = {
        auth: {
          uid: 'test-user-uid',
          token: { role: 'traveler' }
        },
        data: {
          draftId: 'test-draft-id'
        }
      };

      await expect(submitPlaceForModeration(mockRequest)).rejects.toThrow('permission-denied');
    });
  });

  describe('moderatePlace', () => {
    it('should allow moderator to approve place', async () => {
      const { moderatePlace } = require('../moderation/placeModeration');
      
      const mockRequest = {
        auth: {
          uid: 'moderator-uid',
          token: { role: 'moderator' }
        },
        data: {
          moderationId: 'test-moderation-id',
          action: 'approve',
          reason: 'Looks good'
        }
      };

      // Mock moderation document
      mockFirestore.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          targetId: 'draft-id',
          targetData: { title: 'Test Place' }
        })
      });

      const result = await moderatePlace(mockRequest);

      expect(result.success).toBe(true);
      expect(result.action).toBe('approve');
    });

    it('should reject non-moderator users', async () => {
      const { moderatePlace } = require('../moderation/placeModeration');
      
      const mockRequest = {
        auth: {
          uid: 'user-uid',
          token: { role: 'contributor' }
        },
        data: {
          moderationId: 'test-moderation-id',
          action: 'approve'
        }
      };

      await expect(moderatePlace(mockRequest)).rejects.toThrow('permission-denied');
    });
  });
});

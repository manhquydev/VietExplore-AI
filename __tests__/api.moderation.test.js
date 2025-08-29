// Test moderation API endpoints
const { NextRequest } = require('next/server');

// Mock Firebase Admin
jest.mock('@/lib/server/firebaseAdmin', () => ({
  getAdminDb: jest.fn(() => ({
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(() => ({
              docs: [
                {
                  id: 'test-item-1',
                  data: () => ({
                    contentId: 'test-place-1',
                    contentType: 'place',
                    submittedBy: 'user-123',
                    submittedAt: '2024-01-01T00:00:00.000Z',
                    status: 'pending',
                    priority: 'medium',
                    metadata: {
                      title: 'Test Place',
                      description: 'Test description'
                    }
                  })
                }
              ]
            }))
          }))
        }))
      })),
      doc: jest.fn(() => ({
        get: jest.fn(() => ({
          data: () => ({
            fullName: 'Test User',
            role: 'contributor',
            avatar: null
          })
        })),
        update: jest.fn(() => Promise.resolve())
      })),
      add: jest.fn(() => Promise.resolve({ id: 'test-log-id' }))
    }))
  }))
}));

// Mock auth middleware
jest.mock('@/lib/server/auth-middleware', () => ({
  verifyAuthToken: jest.fn(() => ({
    success: true,
    user: {
      id: 'admin-123',
      role: 'admin',
      fullName: 'Admin User'
    }
  }))
}));

describe('Moderation API', () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/moderation/queue');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/moderation/queue', () => {
    it('should return moderation queue items for admin users', async () => {
      // Import the route handler
      const { GET } = require('@/app/api/moderation/queue/route.ts');
      
      const response = await GET(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(Array.isArray(responseData.data)).toBe(true);
    });

    it('should reject non-admin users', async () => {
      // Mock non-admin user
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockReturnValueOnce({
        success: true,
        user: {
          id: 'user-123',
          role: 'contributor',
          fullName: 'Regular User'
        }
      });

      const { GET } = require('@/app/api/moderation/queue/route.ts');
      
      const response = await GET(mockRequest);
      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/moderation/queue/[itemId]', () => {
    it('should approve content successfully', async () => {
      const mockParams = Promise.resolve({ itemId: 'test-item-1' });
      const mockRequest = new NextRequest('http://localhost:3000/api/moderation/queue/test-item-1', {
        method: 'PUT',
        body: JSON.stringify({
          action: 'approve',
          reviewNotes: 'Looks good'
        })
      });

      const { PUT } = require('@/app/api/moderation/queue/[itemId]/route.ts');
      
      const response = await PUT(mockRequest, { params: mockParams });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toContain('phê duyệt');
    });

    it('should reject content successfully', async () => {
      const mockParams = Promise.resolve({ itemId: 'test-item-1' });
      const mockRequest = new NextRequest('http://localhost:3000/api/moderation/queue/test-item-1', {
        method: 'PUT',
        body: JSON.stringify({
          action: 'reject',
          reviewNotes: 'Does not meet standards'
        })
      });

      const { PUT } = require('@/app/api/moderation/queue/[itemId]/route.ts');
      
      const response = await PUT(mockRequest, { params: mockParams });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toContain('từ chối');
    });

    it('should handle invalid actions', async () => {
      const mockParams = Promise.resolve({ itemId: 'test-item-1' });
      const mockRequest = new NextRequest('http://localhost:3000/api/moderation/queue/test-item-1', {
        method: 'PUT',
        body: JSON.stringify({
          action: 'invalid_action',
          reviewNotes: 'Test'
        })
      });

      const { PUT } = require('@/app/api/moderation/queue/[itemId]/route.ts');
      
      const response = await PUT(mockRequest, { params: mockParams });
      expect(response.status).toBe(400);
    });
  });
});

describe('Data Structure Validation', () => {
  it('should have consistent data mapping between API and UI', () => {
    const mockApiResponse = {
      id: 'test-item-1',
      contentType: 'place',
      submittedBy: 'user-123',
      submittedAt: '2024-01-01T00:00:00.000Z',
      status: 'pending',
      priority: 'medium',
      contentDetails: {
        name: 'Test Place',
        description: 'Test description',
        region: 'bac-bo',
        province: 'ha-noi',
        type: 'van-hoa'
      },
      submitter: {
        id: 'user-123',
        fullName: 'Test User',
        role: 'contributor'
      }
    };

    // Test the mapping logic from useModerationQueue hook
    const mappedData = {
      ...mockApiResponse,
      content: {
        title: mockApiResponse.contentDetails?.name || mockApiResponse.metadata?.title || 'Untitled',
        description: mockApiResponse.contentDetails?.description || mockApiResponse.contentDetails?.shortDescription || 'No description',
        changes: '',
        region: mockApiResponse.contentDetails?.region || mockApiResponse.metadata?.region,
        province: mockApiResponse.contentDetails?.province || mockApiResponse.metadata?.province,
        type: mockApiResponse.contentDetails?.type || mockApiResponse.metadata?.type,
        trustLabel: mockApiResponse.contentDetails?.trustLabel
      },
      submitterInfo: mockApiResponse.submitter
    };

    expect(mappedData.content.title).toBe('Test Place');
    expect(mappedData.content.description).toBe('Test description');
    expect(mappedData.content.region).toBe('bac-bo');
    expect(mappedData.submitterInfo.fullName).toBe('Test User');
  });
});

describe('Error Handling', () => {
  it('should handle Firebase connection errors gracefully', async () => {
    // Mock Firebase error
    const { getAdminDb } = require('@/lib/server/firebaseAdmin');
    getAdminDb.mockImplementationOnce(() => {
      throw new Error('Firebase connection failed');
    });

    const { GET } = require('@/app/api/moderation/queue/route.ts');
    const mockRequest = new NextRequest('http://localhost:3000/api/moderation/queue');
    
    const response = await GET(mockRequest);
    expect(response.status).toBe(500);
  });

  it('should handle malformed request bodies', async () => {
    const mockParams = Promise.resolve({ itemId: 'test-item-1' });
    const mockRequest = new NextRequest('http://localhost:3000/api/moderation/queue/test-item-1', {
      method: 'PUT',
      body: 'invalid json'
    });

    const { PUT } = require('@/app/api/moderation/queue/[itemId]/route.ts');
    
    const response = await PUT(mockRequest, { params: mockParams });
    expect(response.status).toBe(500);
  });
});
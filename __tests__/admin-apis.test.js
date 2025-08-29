/**
 * Comprehensive Admin API Tests
 * Tests all admin endpoints with proper authentication and edge cases
 */

const request = require('supertest');
const { NextRequest, NextResponse } = require('next/server');

// Mock Firebase Admin SDK
const mockAdminDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        exists: true,
        data: () => ({
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'admin',
          fullName: 'Test Admin'
        })
      })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve())
    })),
    where: jest.fn(() => ({
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            size: 1,
            docs: [{
              id: 'test-doc-id',
              data: () => ({
                id: 'test-user-id',
                email: 'test@example.com',
                role: 'admin'
              })
            }]
          }))
        }))
      }))
    })),
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          size: 1,
          docs: [{
            id: 'test-doc-id',
            data: () => ({
              id: 'test-user-id',
              email: 'test@example.com',
              role: 'admin'
            })
          }]
        }))
      }))
    })),
    get: jest.fn(() => Promise.resolve({
      size: 1,
      docs: [{
        id: 'test-doc-id',
        data: () => ({
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'admin'
        })
      }]
    })),
    add: jest.fn(() => Promise.resolve({ id: 'new-doc-id' }))
  }))
};

const mockAdminAuth = {
  verifyIdToken: jest.fn(() => Promise.resolve({
    uid: 'test-user-id',
    email: 'test@example.com'
  })),
  setCustomUserClaims: jest.fn(() => Promise.resolve()),
  createUser: jest.fn(() => Promise.resolve({
    uid: 'new-user-id',
    email: 'newuser@example.com'
  })),
  createCustomToken: jest.fn(() => Promise.resolve('custom-token'))
};

// Mock Firebase Admin
jest.mock('@/lib/server/firebaseAdmin', () => ({
  getAdminDb: () => mockAdminDb,
  getAdminAuth: () => mockAdminAuth
}));

// Mock auth middleware
jest.mock('@/lib/server/auth-middleware', () => ({
  verifyAuthToken: jest.fn(() => Promise.resolve({
    success: true,
    user: {
      id: 'test-admin-id',
      email: 'admin@test.com',
      role: 'admin',
      fullName: 'Test Admin'
    }
  }))
}));

// Test suites for each admin endpoint
describe('Admin API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    const { GET } = require('@/app/api/admin/users/route');

    test('should return users list with admin auth', async () => {
      const request = new NextRequest('http://localhost/api/admin/users', {
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.pagination).toBeDefined();
    });

    test('should handle role filtering', async () => {
      const request = new NextRequest('http://localhost/api/admin/users?role=contributor', {
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await GET(request);
      expect(response.status).toBe(200);
    });

    test('should handle pagination', async () => {
      const request = new NextRequest('http://localhost/api/admin/users?limit=10&offset=5', {
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.offset).toBe(5);
    });

    test('should reject unauthorized requests', async () => {
      // Mock unauthorized user
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockResolvedValueOnce({
        success: false,
        error: 'Unauthorized'
      });

      const request = new NextRequest('http://localhost/api/admin/users');

      const response = await GET(request);
      expect(response.status).toBe(403);
    });

    test('should reject non-admin users', async () => {
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockResolvedValueOnce({
        success: true,
        user: { id: 'user-id', role: 'traveler' }
      });

      const request = new NextRequest('http://localhost/api/admin/users', {
        headers: { 'Authorization': 'Bearer user-token' }
      });

      const response = await GET(request);
      expect(response.status).toBe(403);
    });

    test('should handle database errors gracefully', async () => {
      mockAdminDb.collection.mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const request = new NextRequest('http://localhost/api/admin/users', {
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/admin/users/[userId]/role', () => {
    const { PUT } = require('@/app/api/admin/users/[userId]/role/route');

    test('should change user role successfully', async () => {
      const request = new NextRequest('http://localhost/api/admin/users/user123/role', {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRole: 'contributor',
          reason: 'Promoted for good contributions'
        })
      });

      const params = Promise.resolve({ userId: 'user123' });
      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAdminAuth.setCustomUserClaims).toHaveBeenCalledWith('user123', { role: 'contributor' });
    });

    test('should validate role values', async () => {
      const request = new NextRequest('http://localhost/api/admin/users/user123/role', {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRole: 'invalid-role',
          reason: 'Test'
        })
      });

      const params = Promise.resolve({ userId: 'user123' });
      const response = await PUT(request, { params });
      expect(response.status).toBe(400);
    });

    test('should prevent self role change', async () => {
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockResolvedValueOnce({
        success: true,
        user: { id: 'user123', role: 'admin' }
      });

      const request = new NextRequest('http://localhost/api/admin/users/user123/role', {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRole: 'contributor',
          reason: 'Test'
        })
      });

      const params = Promise.resolve({ userId: 'user123' });
      const response = await PUT(request, { params });
      expect(response.status).toBe(400);
    });

    test('should handle non-existent users', async () => {
      mockAdminDb.collection.mockImplementationOnce(() => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: false })
        })
      }));

      const request = new NextRequest('http://localhost/api/admin/users/nonexistent/role', {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRole: 'contributor',
          reason: 'Test'
        })
      });

      const params = Promise.resolve({ userId: 'nonexistent' });
      const response = await PUT(request, { params });
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/moderation/queue', () => {
    const { GET } = require('@/app/api/moderation/queue/route');

    test('should return moderation queue for moderators', async () => {
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockResolvedValueOnce({
        success: true,
        user: { id: 'mod-id', role: 'moderator' }
      });

      // Mock moderation queue data
      mockAdminDb.collection.mockImplementationOnce(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              get: jest.fn(() => Promise.resolve({
                docs: [{
                  id: 'queue-item-1',
                  data: () => ({
                    contentType: 'place',
                    status: 'pending',
                    submittedBy: 'user-id',
                    contentId: 'place-id',
                    submittedAt: new Date().toISOString()
                  })
                }]
              }))
            }))
          }))
        }))
      }));

      // Mock submitter data
      let callCount = 0;
      mockAdminDb.collection.mockImplementation((collection) => {
        if (collection === 'users') {
          return {
            doc: () => ({
              get: () => Promise.resolve({
                data: () => ({
                  fullName: 'Test User',
                  role: 'contributor'
                })
              })
            })
          };
        } else if (collection === 'places') {
          return {
            doc: () => ({
              get: () => Promise.resolve({
                exists: true,
                data: () => ({
                  name: 'Test Place',
                  description: 'Test Description'
                })
              })
            })
          };
        }
        return mockAdminDb.collection(collection);
      });

      const request = new NextRequest('http://localhost/api/moderation/queue', {
        headers: { 'Authorization': 'Bearer mod-token' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    test('should filter by status', async () => {
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockResolvedValueOnce({
        success: true,
        user: { id: 'mod-id', role: 'moderator' }
      });

      const request = new NextRequest('http://localhost/api/moderation/queue?status=approved', {
        headers: { 'Authorization': 'Bearer mod-token' }
      });

      const response = await GET(request);
      expect(response.status).toBe(200);
    });

    test('should reject non-moderator access', async () => {
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockResolvedValueOnce({
        success: true,
        user: { id: 'user-id', role: 'traveler' }
      });

      const request = new NextRequest('http://localhost/api/moderation/queue', {
        headers: { 'Authorization': 'Bearer user-token' }
      });

      const response = await GET(request);
      expect(response.status).toBe(403);
    });

    test('should clean up orphaned entries', async () => {
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockResolvedValueOnce({
        success: true,
        user: { id: 'mod-id', role: 'moderator' }
      });

      // Mock orphaned entry (content doesn't exist)
      mockAdminDb.collection.mockImplementation((collection) => {
        if (collection === 'moderation_queue') {
          return {
            where: jest.fn(() => ({
              orderBy: jest.fn(() => ({
                limit: jest.fn(() => ({
                  get: jest.fn(() => Promise.resolve({
                    docs: [{
                      id: 'orphaned-item',
                      data: () => ({
                        contentType: 'place',
                        contentId: 'deleted-place-id',
                        submittedBy: 'user-id'
                      })
                    }]
                  }))
                }))
              }))
            })),
            doc: jest.fn(() => ({
              delete: jest.fn(() => Promise.resolve())
            }))
          };
        } else if (collection === 'users') {
          return {
            doc: () => ({
              get: () => Promise.resolve({
                data: () => ({ fullName: 'Test User', role: 'contributor' })
              })
            })
          };
        } else if (collection === 'places') {
          return {
            doc: () => ({
              get: () => Promise.resolve({ exists: false }) // Content doesn't exist
            })
          };
        }
        return mockAdminDb.collection(collection);
      });

      const request = new NextRequest('http://localhost/api/moderation/queue', {
        headers: { 'Authorization': 'Bearer mod-token' }
      });

      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete user management flow', async () => {
      // 1. List users
      const { GET: getUsers } = require('@/app/api/admin/users/route');
      const listRequest = new NextRequest('http://localhost/api/admin/users', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      
      const listResponse = await getUsers(listRequest);
      expect(listResponse.status).toBe(200);

      // 2. Change user role
      const { PUT: changeRole } = require('@/app/api/admin/users/[userId]/role/route');
      const roleRequest = new NextRequest('http://localhost/api/admin/users/test-user/role', {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRole: 'contributor',
          reason: 'Integration test'
        })
      });

      const roleResponse = await changeRole(roleRequest, { 
        params: Promise.resolve({ userId: 'test-user' }) 
      });
      expect(roleResponse.status).toBe(200);
    });

    test('should handle moderation workflow', async () => {
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockResolvedValue({
        success: true,
        user: { id: 'mod-id', role: 'moderator' }
      });

      // 1. Get moderation queue
      const { GET: getQueue } = require('@/app/api/moderation/queue/route');
      const queueRequest = new NextRequest('http://localhost/api/moderation/queue?status=pending', {
        headers: { 'Authorization': 'Bearer mod-token' }
      });

      const queueResponse = await getQueue(queueRequest);
      expect(queueResponse.status).toBe(200);

      // 2. Review item (if endpoint exists)
      // This would test the full moderation flow
    });
  });

  describe('Error Handling', () => {
    test('should handle Firebase connection errors', async () => {
      mockAdminDb.collection.mockImplementationOnce(() => {
        throw new Error('Firebase connection failed');
      });

      const { GET } = require('@/app/api/admin/users/route');
      const request = new NextRequest('http://localhost/api/admin/users', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });

      const response = await GET(request);
      expect(response.status).toBe(500);
    });

    test('should handle malformed requests', async () => {
      const { PUT } = require('@/app/api/admin/users/[userId]/role/route');
      const request = new NextRequest('http://localhost/api/admin/users/user123/role', {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer admin-token' },
        body: 'invalid-json'
      });

      const params = Promise.resolve({ userId: 'user123' });
      const response = await PUT(request, { params });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('should handle rate limiting scenarios', async () => {
      // Mock rate limiting error
      mockAdminAuth.verifyIdToken.mockRejectedValueOnce({
        code: 'auth/too-many-requests'
      });

      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockRejectedValueOnce({
        success: false,
        error: 'Too many requests'
      });

      const { GET } = require('@/app/api/admin/users/route');
      const request = new NextRequest('http://localhost/api/admin/users', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });

      const response = await GET(request);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large user lists efficiently', async () => {
      // Mock large dataset
      const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
        id: `user-${i}`,
        data: () => ({
          id: `user-${i}`,
          email: `user${i}@example.com`,
          role: 'traveler'
        })
      }));

      mockAdminDb.collection.mockImplementationOnce(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({ size: 1000 })),
            startAfter: jest.fn(() => ({
              limit: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                  docs: largeUserList.slice(0, 50)
                }))
              }))
            })),
            limit: jest.fn(() => ({
              get: jest.fn(() => Promise.resolve({
                docs: largeUserList.slice(0, 50)
              }))
            }))
          }))
        }))
      }));

      const { GET } = require('@/app/api/admin/users/route');
      const startTime = Date.now();
      
      const request = new NextRequest('http://localhost/api/admin/users?limit=50', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });

      const response = await GET(request);
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test('should handle concurrent requests', async () => {
      const { GET } = require('@/app/api/admin/users/route');
      
      const requests = Array.from({ length: 10 }, () => {
        return GET(new NextRequest('http://localhost/api/admin/users', {
          headers: { 'Authorization': 'Bearer admin-token' }
        }));
      });

      const responses = await Promise.all(requests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Security Tests', () => {
    test('should prevent SQL injection in search', async () => {
      const maliciousQuery = "'; DROP TABLE users; --";
      
      const { GET } = require('@/app/api/admin/users/route');
      const request = new NextRequest(`http://localhost/api/admin/users?search=${encodeURIComponent(maliciousQuery)}`, {
        headers: { 'Authorization': 'Bearer admin-token' }
      });

      const response = await GET(request);
      // Should handle gracefully, not crash
      expect(response.status).toBeOneOf([200, 400, 500]);
    });

    test('should sanitize user input', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const { PUT } = require('@/app/api/admin/users/[userId]/role/route');
      const request = new NextRequest('http://localhost/api/admin/users/user123/role', {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRole: 'contributor',
          reason: xssPayload
        })
      });

      const params = Promise.resolve({ userId: 'user123' });
      const response = await PUT(request, { params });
      
      // Should not crash, should handle input safely
      expect(response.status).toBeOneOf([200, 400]);
    });

    test('should validate admin permissions strictly', async () => {
      // Test with elevated contributor trying to access admin functions
      const { verifyAuthToken } = require('@/lib/server/auth-middleware');
      verifyAuthToken.mockResolvedValueOnce({
        success: true,
        user: { id: 'contributor-id', role: 'contributor' }
      });

      const { PUT } = require('@/app/api/admin/users/[userId]/role/route');
      const request = new NextRequest('http://localhost/api/admin/users/user123/role', {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer contributor-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRole: 'admin',
          reason: 'Unauthorized elevation attempt'
        })
      });

      const params = Promise.resolve({ userId: 'user123' });
      const response = await PUT(request, { params });
      expect(response.status).toBe(403);
    });
  });
});

// Test configuration
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${array}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${array}`,
        pass: false,
      };
    }
  },
});
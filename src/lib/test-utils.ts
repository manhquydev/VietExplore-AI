/**
 * Test utilities for VietExplore-AI backend testing
 */

export const TEST_CONFIG = {
  // Test Firebase config (won't actually connect)
  firebase: {
    projectId: 'test-project',
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
  },
  
  // Test users for different roles
  testUsers: {
    guest: {
      id: 'guest-test-id',
      email: 'guest@test.com',
      role: 'guest' as const
    },
    traveler: {
      id: 'traveler-test-id',
      email: 'traveler@test.com',
      role: 'traveler' as const
    },
    contributor: {
      id: 'contributor-test-id',
      email: 'contributor@test.com',
      role: 'contributor' as const
    },
    partner: {
      id: 'partner-test-id',
      email: 'partner@test.com',
      role: 'partner' as const
    },
    moderator: {
      id: 'moderator-test-id',
      email: 'moderator@test.com',
      role: 'moderator' as const
    },
    admin: {
      id: 'admin-test-id',
      email: 'admin@test.com',
      role: 'admin' as const
    }
  }
}

export function createMockRequest(url: string, options: RequestInit = {}) {
  return new Request(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })
}

export function createAuthenticatedRequest(
  url: string, 
  token: string, 
  options: RequestInit = {}
) {
  return createMockRequest(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  })
}



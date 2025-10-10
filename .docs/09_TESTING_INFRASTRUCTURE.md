# 09. TESTING INFRASTRUCTURE

## Tổng Quan

VietExplore-AI sử dụng **Jest** testing framework với **React Testing Library** cho component testing và **Next.js testing utilities** cho API route testing.

**Test Coverage:**
- ✅ API Routes (Node.js environment)
- ✅ Custom Hooks (jsdom environment)
- ✅ Utility Functions (Node.js environment)
- ✅ RBAC Permission Logic
- 🚧 Component Tests (in progress)
- 🚧 E2E Tests (planned)

**Số lượng test files:** 10+ test files
**Test pattern:** `__tests__` folder convention + `*.test.ts` / `*.spec.ts` files

---

## 1. Jest Configuration

### 1.1. File: `jest.config.js`

**Vị trí:** `C:\Users\manhq\Downloads\da2\VietExplore-AI\jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Load next.config.js and .env files
  dir: './',
})

const customJestConfig = {
  // Setup file for global mocks
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Default test environment (can be overridden per-file)
  testEnvironment: 'node',

  // Ignore folders
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  // Path alias mapping (@/ → src/)
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage collection
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
  ],

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

**Giải thích:**
- `nextJest()` - Automatically loads Next.js config (env vars, path aliases)
- `setupFilesAfterEnv` - Global mocks (Firebase, Next.js router)
- `testEnvironment: 'node'` - Default for API routes (can override với `@jest-environment jsdom`)
- `moduleNameMapping` - Cho phép `import '@/lib/...'` trong tests
- `collectCoverageFrom` - Track coverage cho tất cả src files (except test files)

### 1.2. File: `jest.setup.js`

**Vị trí:** `C:\Users\manhq\Downloads\da2\VietExplore-AI\jest.setup.js`

```javascript
// Mock Firebase Admin SDK (for server-side tests)
jest.mock('@/lib/server/firebaseAdmin', () => ({
  getAdminAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    createCustomToken: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    setCustomUserClaims: jest.fn(),
  })),
  getAdminDb: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(),
          })),
          get: jest.fn(),
        })),
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
        get: jest.fn(),
      })),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
        get: jest.fn(),
      })),
      get: jest.fn(),
      count: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
      })),
    })),
    FieldValue: {
      arrayUnion: jest.fn(),
      increment: jest.fn(),
    },
  })),
  getAdminStorage: jest.fn(() => ({
    bucket: jest.fn(),
  })),
}));

// Mock Firebase Client SDK (for client-side tests)
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    signInWithCustomToken: jest.fn(),
  },
  db: {},
  storage: {},
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Global fetch mock
global.fetch = jest.fn()

// Test environment variables
process.env.FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY = 'test-private-key'
```

**Why Mock Firebase?**
- Tests không cần real Firebase connection
- Faster test execution (no network calls)
- Predictable test data
- No Firebase quota consumption

### 1.3. Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

**Usage:**
```bash
# Run all tests
npm test

# Watch mode (re-run on file change)
npm run test:watch

# Generate coverage report
npm run test:coverage

# CI environment (no watch, generate coverage)
npm run test:ci
```

---

## 2. Test Patterns & Best Practices

### 2.1. API Route Testing

**Example:** `src/app/api/auth/login/__tests__/route.test.ts`

```typescript
/**
 * @jest-environment node
 */

import { POST } from '../route'
import { NextRequest } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

// Mock Firebase Admin SDK
jest.mock('@/lib/firebase-admin')
jest.mock('@/lib/firebase')

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>
const mockAdminDb = adminDb as jest.Mocked<typeof adminDb>

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login successfully with valid credentials', async () => {
    // 1. Setup mocks
    const mockUser = {
      uid: 'test-user-id',
      email: 'test@example.com'
    }

    const mockUserData = {
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'traveler',
      verified: false
    }

    const mockUserDoc = {
      exists: true,
      data: () => mockUserData
    }

    mockAdminDb.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserDoc)
      })
    } as any)

    mockAdminAuth.createCustomToken.mockResolvedValue('mock-custom-token')

    // 2. Create request
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 3. Call API
    const response = await POST(request)
    const data = await response.json()

    // 4. Assertions
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.email).toBe('test@example.com')
    expect(data.token).toBe('mock-custom-token')
    expect(mockAdminAuth.createCustomToken).toHaveBeenCalledWith('test-user-id')
  })

  it('should return 400 for missing email or password', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com'
        // Missing password
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email và mật khẩu là bắt buộc')
  })

  it('should return 404 for non-existent user', async () => {
    // Mock user not found
    const mockUserDoc = {
      exists: false
    }

    mockAdminDb.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserDoc)
      })
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Người dùng không tồn tại')
  })
})
```

**Pattern Breakdown:**
1. ✅ `@jest-environment node` - API routes run in Node.js environment
2. ✅ Import route handler (`POST`, `GET`, etc.)
3. ✅ Mock Firebase services với `jest.mock()`
4. ✅ `beforeEach()` - Clear mocks between tests
5. ✅ Test happy path + error cases (400, 404, 401, 403, 500)
6. ✅ Use `NextRequest` for request creation
7. ✅ Assert response status + body

### 2.2. Custom Hook Testing

**Example:** `src/hooks/__tests__/use-admin.test.ts`

```typescript
/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useAdminStats, useModerationQueue } from '../use-admin'
import { apiClient } from '@/lib/client/api'
import { useAuth } from '@/components/auth/auth-provider'

// Mock dependencies
jest.mock('@/lib/client/api')
jest.mock('@/components/auth/auth-provider')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('useAdminStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch admin stats successfully for admin user', async () => {
    // 1. Mock auth state
    const mockAdmin = {
      id: 'admin1',
      role: 'admin',
      fullName: 'Admin User'
    }

    mockUseAuth.mockReturnValue({
      user: mockAdmin,
      loading: false,
      error: null
    } as any)

    // 2. Mock API responses
    mockApiClient.admin.users.list.mockResolvedValue({
      success: true,
      data: [],
      pagination: { total: 150 }
    })

    mockApiClient.moderation.queue.list.mockResolvedValue({
      success: true,
      data: [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'pending' }
      ]
    })

    // 3. Render hook
    const { result } = renderHook(() => useAdminStats())

    expect(result.current.loading).toBe(true)

    // 4. Wait for async updates
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // 5. Assertions
    expect(result.current.stats.totalUsers).toBe(150)
    expect(result.current.stats.pendingModeration).toBe(3)
    expect(result.current.stats.totalPlaces).toBe(456) // Simulated
    expect(result.current.stats.openReports).toBe(8) // Simulated
  })

  it('should not fetch stats for non-admin users', async () => {
    const mockTraveler = {
      id: 'traveler1',
      role: 'traveler',
      fullName: 'Regular User'
    }

    mockUseAuth.mockReturnValue({
      user: mockTraveler,
      loading: false,
      error: null
    } as any)

    const { result } = renderHook(() => useAdminStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats.totalUsers).toBe(0)
    expect(result.current.stats.pendingModeration).toBe(0)
    expect(mockApiClient.admin.users.list).not.toHaveBeenCalled()
    expect(mockApiClient.moderation.queue.list).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const mockAdmin = {
      id: 'admin1',
      role: 'admin',
      fullName: 'Admin User'
    }

    mockUseAuth.mockReturnValue({
      user: mockAdmin,
      loading: false,
      error: null
    } as any)

    // Mock API failures
    mockApiClient.admin.users.list.mockRejectedValue(new Error('Network error'))
    mockApiClient.moderation.queue.list.mockRejectedValue(new Error('Network error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useAdminStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats.totalUsers).toBe(0)
    expect(result.current.stats.pendingModeration).toBe(0)
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch admin stats', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should handle when user is null', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null
    } as any)

    const { result } = renderHook(() => useAdminStats())

    expect(result.current.loading).toBe(false)
    expect(result.current.stats.totalUsers).toBe(0)
    expect(mockApiClient.admin.users.list).not.toHaveBeenCalled()
  })
})
```

**Pattern Breakdown:**
1. ✅ `@jest-environment jsdom` - React hooks need browser environment
2. ✅ Use `renderHook()` from `@testing-library/react`
3. ✅ Mock `useAuth()` để control user state
4. ✅ Mock API client responses
5. ✅ Use `waitFor()` for async state updates
6. ✅ Test permission-based logic (admin vs non-admin)
7. ✅ Test error handling
8. ✅ Test null/undefined states

### 2.3. Utility Function Testing

**Example:** `src/lib/__tests__/auth-middleware.test.ts`

```typescript
/**
 * @jest-environment node
 */

import { hasPermission, rolePermissions } from '../auth-middleware'
import type { User } from '../types/auth'

describe('Auth Types and Permissions', () => {
  const createMockUser = (role: User['role']): User => ({
    id: 'test-user',
    email: 'test@example.com',
    fullName: 'Test User',
    username: 'testuser',
    role,
    verified: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    stats: {
      placesContributed: 0,
      itinerariesCreated: 0,
      helpfulVotes: 0
    }
  })

  describe('hasPermission function', () => {
    it('should return false for null user', () => {
      const result = hasPermission(null, 'create_place')
      expect(result).toBe(false)
    })

    it('should return true for admin with any permission', () => {
      const adminUser = createMockUser('admin')
      const result = hasPermission(adminUser, 'all_permissions')
      expect(result).toBe(true)
    })

    it('should allow traveler to create itineraries', () => {
      const travelerUser = createMockUser('traveler')
      const result = hasPermission(travelerUser, 'create_itinerary')
      expect(result).toBe(true)
    })

    it('should deny traveler from creating places', () => {
      const travelerUser = createMockUser('traveler')
      const result = hasPermission(travelerUser, 'create_place')
      expect(result).toBe(false)
    })

    it('should allow contributor to create places', () => {
      const contributorUser = createMockUser('contributor')
      const result = hasPermission(contributorUser, 'create_place')
      expect(result).toBe(true)
    })

    it('should allow partner to create places with priority', () => {
      const partnerUser = createMockUser('partner')
      const result = hasPermission(partnerUser, 'create_place_priority')
      expect(result).toBe(true)
    })

    it('should allow moderator to review content', () => {
      const moderatorUser = createMockUser('moderator')
      const result = hasPermission(moderatorUser, 'review_content')
      expect(result).toBe(true)
    })

    it('should deny guest from all actions', () => {
      const guestUser = createMockUser('guest')
      expect(hasPermission(guestUser, 'create_itinerary')).toBe(false)
      expect(hasPermission(guestUser, 'save_places')).toBe(false)
      expect(hasPermission(guestUser, 'report_content')).toBe(false)
    })
  })

  describe('rolePermissions mapping', () => {
    it('should have correct permissions for each role', () => {
      expect(rolePermissions.guest).toEqual([])

      expect(rolePermissions.traveler).toContain('create_itinerary')
      expect(rolePermissions.traveler).toContain('save_places')
      expect(rolePermissions.traveler).toContain('report_content')

      expect(rolePermissions.contributor).toContain('create_place')
      expect(rolePermissions.contributor).toContain('manage_drafts')

      expect(rolePermissions.partner).toContain('create_place_priority')
      expect(rolePermissions.partner).toContain('fast_review')

      expect(rolePermissions.moderator).toContain('review_content')

      expect(rolePermissions.admin).toEqual(['all_permissions'])
    })

    it('should maintain role hierarchy in permissions', () => {
      // Contributor should have all traveler permissions plus their own
      const travelerPerms = rolePermissions.traveler
      const contributorPerms = rolePermissions.contributor

      travelerPerms.forEach(perm => {
        expect(contributorPerms).toContain(perm)
      })

      // Partner should have contributor-level permissions plus their own
      const partnerPerms = rolePermissions.partner
      expect(partnerPerms).toContain('create_itinerary')
      expect(partnerPerms).toContain('save_places')
      expect(partnerPerms).toContain('report_content')
    })
  })

  describe('User interface validation', () => {
    it('should have all required fields', () => {
      const user = createMockUser('traveler')

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('fullName')
      expect(user).toHaveProperty('username')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('verified')
      expect(user).toHaveProperty('createdAt')
      expect(user).toHaveProperty('updatedAt')
      expect(user).toHaveProperty('stats')

      expect(user.stats).toHaveProperty('placesContributed')
      expect(user.stats).toHaveProperty('itinerariesCreated')
      expect(user.stats).toHaveProperty('helpfulVotes')
    })

    it('should support optional profile fields', () => {
      const userWithProfile = createMockUser('contributor')
      userWithProfile.profile = {
        bio: 'Travel enthusiast',
        location: 'Vietnam',
        website: 'https://example.com',
        socialLinks: {
          facebook: 'https://facebook.com/user',
          instagram: 'https://instagram.com/user'
        }
      }

      expect(userWithProfile.profile).toBeDefined()
      expect(userWithProfile.profile?.bio).toBe('Travel enthusiast')
      expect(userWithProfile.profile?.socialLinks?.facebook).toBe('https://facebook.com/user')
    })
  })
})
```

**Pattern Breakdown:**
1. ✅ Test pure functions (no side effects)
2. ✅ Use helper function `createMockUser()` để tạo test data
3. ✅ Test all role combinations
4. ✅ Test permission hierarchy
5. ✅ Test edge cases (null user, guest role)
6. ✅ Validate data structures (User interface)

---

## 3. Test Organization

### 3.1. File Structure Convention

**Pattern 1: `__tests__` Folder**
```
src/
  app/
    api/
      auth/
        login/
          __tests__/
            route.test.ts
          route.ts
  hooks/
    __tests__/
      use-admin.test.ts
      use-auth.test.ts
    use-admin.ts
    use-auth.ts
  lib/
    __tests__/
      auth-middleware.test.ts
      notification-system.test.ts
    auth-middleware.ts
    notification-system.ts
```

**Pattern 2: Collocated `*.test.ts` Files**
```
src/
  utils/
    formatDate.ts
    formatDate.test.ts
    slugify.ts
    slugify.test.ts
```

**Best Practice:**
- ✅ Use `__tests__` folder for API routes và hooks
- ✅ Use `*.test.ts` for utility functions
- ✅ Name test file same as source file

### 3.2. Test Suite Organization

```typescript
describe('Feature/Component Name', () => {
  // Setup
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Subfeature 1', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = ...

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should throw error when Z', () => {
      expect(() => functionUnderTest(badInput)).toThrow('Error message')
    })
  })

  describe('Subfeature 2', () => {
    // More tests...
  })
})
```

**Organization Principles:**
- ✅ Group related tests với `describe()` blocks
- ✅ Use descriptive test names: `should [action] when [condition]`
- ✅ Arrange-Act-Assert pattern
- ✅ One assertion per test (when possible)

---

## 4. Mocking Strategies

### 4.1. Mocking Firebase Admin SDK

**Global Mock** (`jest.setup.js`):
```javascript
jest.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
    createCustomToken: jest.fn(),
    setCustomUserClaims: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
    })),
  },
}))
```

**Per-Test Override:**
```typescript
it('should verify token successfully', async () => {
  const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>

  mockAdminAuth.verifyIdToken.mockResolvedValue({
    uid: 'user123',
    email: 'test@example.com',
    email_verified: true,
    role: 'admin'
  } as DecodedIdToken)

  const { user } = await verifyAuthToken(request)
  expect(user.uid).toBe('user123')
})
```

### 4.2. Mocking API Client

**In Test File:**
```typescript
import { apiClient } from '@/lib/client/api'
jest.mock('@/lib/client/api')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

it('should fetch places successfully', async () => {
  mockApiClient.places.list.mockResolvedValue({
    success: true,
    data: [
      { id: '1', title: 'Place 1', status: 'published' },
      { id: '2', title: 'Place 2', status: 'published' }
    ]
  })

  const { result } = renderHook(() => usePlaces())

  await waitFor(() => {
    expect(result.current.places).toHaveLength(2)
  })
})
```

### 4.3. Mocking Next.js Router

**Global Mock** (`jest.setup.js`):
```javascript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

**Per-Test Override:**
```typescript
it('should redirect to login on 401', async () => {
  const mockPush = jest.fn()

  jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  })

  // Trigger 401 error
  mockApiClient.places.list.mockResolvedValue({
    success: false,
    error: 'Unauthorized',
    status: 401
  })

  const { result } = renderHook(() => usePlaces())

  await waitFor(() => {
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
```

### 4.4. Mocking Environment Variables

**In Test File:**
```typescript
describe('API with env vars', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should use production Firebase', () => {
    process.env.FIREBASE_PROJECT_ID = 'prod-project'

    // Import after setting env
    const { getFirebaseConfig } = require('../firebase-config')
    const config = getFirebaseConfig()

    expect(config.projectId).toBe('prod-project')
  })

  it('should use test Firebase', () => {
    process.env.FIREBASE_PROJECT_ID = 'test-project'

    const { getFirebaseConfig } = require('../firebase-config')
    const config = getFirebaseConfig()

    expect(config.projectId).toBe('test-project')
  })
})
```

---

## 5. Testing Async Code

### 5.1. Async/Await Pattern

```typescript
it('should fetch data asynchronously', async () => {
  // Mock async function
  mockApiClient.getData.mockResolvedValue({ data: 'test' })

  // Await async operation
  const result = await fetchData()

  // Assertions
  expect(result.data).toBe('test')
})
```

### 5.2. waitFor() for React Hooks

```typescript
it('should update state after API call', async () => {
  mockApiClient.getData.mockResolvedValue({ data: 'test' })

  const { result } = renderHook(() => useData())

  // Wait for state update
  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(result.current.data).toBe('test')
})
```

**Options:**
```typescript
await waitFor(() => {
  expect(result.current.data).toBeDefined()
}, {
  timeout: 3000, // Max 3s
  interval: 50,  // Check every 50ms
})
```

### 5.3. Testing Promises

**Resolves:**
```typescript
it('should resolve promise', async () => {
  await expect(asyncFunction()).resolves.toBe('success')
})
```

**Rejects:**
```typescript
it('should reject promise with error', async () => {
  await expect(asyncFunction()).rejects.toThrow('Error message')
})
```

### 5.4. Testing Callbacks

```typescript
it('should call callback with data', (done) => {
  functionWithCallback((error, data) => {
    expect(error).toBeNull()
    expect(data).toBe('test')
    done()
  })
})
```

---

## 6. Code Coverage

### 6.1. Generate Coverage Report

```bash
npm run test:coverage
```

**Output:**
```
PASS  src/app/api/auth/login/__tests__/route.test.ts
PASS  src/hooks/__tests__/use-admin.test.ts
PASS  src/lib/__tests__/auth-middleware.test.ts
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------|---------|----------|---------|---------|-------------------
All files               |   68.42 |    51.23 |   65.78 |   69.01 |
 src/app/api/auth/login |   85.71 |    75.00 |   80.00 |   85.71 | 45-52
 src/hooks              |   62.50 |    45.83 |   60.00 |   63.64 | 78-89,102-115
 src/lib                |   73.33 |    58.82 |   72.73 |   74.19 | 34-39,67-72
------------------------|---------|----------|---------|---------|-------------------
```

### 6.2. Coverage Thresholds

**Add to `jest.config.js`:**
```javascript
module.exports = {
  ...customJestConfig,
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    },
    './src/lib/': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

**Fail CI if coverage below threshold:**
```bash
npm run test:ci
# Exits with error if coverage < threshold
```

### 6.3. View Coverage Report

**HTML Report:**
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

**Files:**
- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/coverage-final.json` - JSON data
- `coverage/lcov.info` - LCOV format (for CI tools)

### 6.4. Exclude Files from Coverage

**Already configured in `jest.config.js`:**
```javascript
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}',
  '!src/**/*.d.ts',           // Type definitions
  '!src/**/*.stories.{js,jsx,ts,tsx}', // Storybook stories
  '!src/**/*.test.{js,jsx,ts,tsx}',    // Test files themselves
]
```

**Add more exclusions:**
```javascript
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}',
  '!src/**/*.d.ts',
  '!src/**/*.test.{js,jsx,ts,tsx}',
  '!src/app/**/layout.tsx',   // Layouts (boilerplate)
  '!src/app/**/loading.tsx',  // Loading states
  '!src/components/ui/**',    // UI components (Radix wrappers)
]
```

---

## 7. Common Testing Patterns

### 7.1. Testing Error Handling

```typescript
it('should handle API errors gracefully', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

  mockApiClient.getData.mockRejectedValue(new Error('Network error'))

  const { result } = renderHook(() => useData())

  await waitFor(() => {
    expect(result.current.error).toBe('Network error')
  })

  expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch data', expect.any(Error))

  consoleSpy.mockRestore()
})
```

**Why suppress console.error?**
- Prevents noisy test output
- Tests errors without console spam

### 7.2. Testing Conditional Rendering

```typescript
it('should show loading state', () => {
  const { result } = renderHook(() => useData())
  expect(result.current.loading).toBe(true)
})

it('should show data when loaded', async () => {
  mockApiClient.getData.mockResolvedValue({ data: 'test' })

  const { result } = renderHook(() => useData())

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(result.current.data).toBe('test')
})

it('should show error when failed', async () => {
  mockApiClient.getData.mockRejectedValue(new Error('Failed'))

  const { result } = renderHook(() => useData())

  await waitFor(() => {
    expect(result.current.error).toBe('Failed')
  })

  expect(result.current.data).toBeNull()
})
```

### 7.3. Testing Role-Based Access

```typescript
describe('Role-based access', () => {
  it('should allow admin to access admin panel', () => {
    const adminUser = createMockUser('admin')
    expect(hasPermission(adminUser, 'admin_panel')).toBe(true)
  })

  it('should deny traveler from accessing admin panel', () => {
    const travelerUser = createMockUser('traveler')
    expect(hasPermission(travelerUser, 'admin_panel')).toBe(false)
  })

  it('should allow moderator to review content', () => {
    const moderatorUser = createMockUser('moderator')
    expect(hasPermission(moderatorUser, 'review_content')).toBe(true)
  })
})
```

### 7.4. Testing State Machines

```typescript
describe('Moderation state machine', () => {
  it('should transition pending → claimed', async () => {
    const item = { id: '1', status: 'pending' }

    const result = await transitionStatus(item, 'claim', 'moderator1')

    expect(result.status).toBe('claimed')
    expect(result.claimedBy).toBe('moderator1')
  })

  it('should reject invalid transition pending → approved', async () => {
    const item = { id: '1', status: 'pending' }

    await expect(
      transitionStatus(item, 'approve', 'moderator1')
    ).rejects.toThrow('Invalid state transition')
  })

  it('should allow claimed → in_review', async () => {
    const item = { id: '1', status: 'claimed', claimedBy: 'moderator1' }

    const result = await transitionStatus(item, 'start_review', 'moderator1')

    expect(result.status).toBe('in_review')
  })
})
```

---

## 8. Test Data Management

### 8.1. Test Fixtures

**File:** `src/__tests__/fixtures/users.ts`

```typescript
import type { User } from '@/lib/types/auth'

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  fullName: 'Test User',
  username: 'testuser',
  role: 'traveler',
  verified: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  stats: {
    placesContributed: 0,
    itinerariesCreated: 0,
    helpfulVotes: 0
  },
  ...overrides
})

export const mockAdminUser = createMockUser({
  id: 'admin-id',
  role: 'admin',
  fullName: 'Admin User'
})

export const mockModeratorUser = createMockUser({
  id: 'moderator-id',
  role: 'moderator',
  fullName: 'Moderator User'
})

export const mockContributorUser = createMockUser({
  id: 'contributor-id',
  role: 'contributor',
  fullName: 'Contributor User'
})
```

**Usage:**
```typescript
import { mockAdminUser, mockContributorUser } from '@/__tests__/fixtures/users'

it('should allow admin to delete user', () => {
  const result = canDeleteUser(mockAdminUser, mockContributorUser)
  expect(result).toBe(true)
})
```

### 8.2. Factory Functions

```typescript
// src/__tests__/factories/place.factory.ts
export const createMockPlace = (overrides?: Partial<Place>): Place => ({
  id: 'place-id',
  title: 'Test Place',
  slug: 'test-place',
  region: 'bac-bo',
  province: 'hanoi',
  type: 'van-hoa',
  description: 'Test description',
  images: [],
  status: 'published',
  submitter: 'user-id',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  stats: {
    viewCount: 0,
    likeCount: 0,
    saveCount: 0
  },
  ...overrides
})

// Usage
const publishedPlace = createMockPlace({ status: 'published' })
const draftPlace = createMockPlace({ status: 'draft', submitter: 'user-123' })
```

### 8.3. Test Data Builders

```typescript
class UserBuilder {
  private user: User

  constructor() {
    this.user = createMockUser()
  }

  withRole(role: User['role']): this {
    this.user.role = role
    return this
  }

  withEmail(email: string): this {
    this.user.email = email
    return this
  }

  verified(): this {
    this.user.verified = true
    return this
  }

  build(): User {
    return this.user
  }
}

// Usage
const adminUser = new UserBuilder()
  .withRole('admin')
  .withEmail('admin@example.com')
  .verified()
  .build()
```

---

## 9. CI/CD Integration

### 9.1. GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run typecheck

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true
```

### 9.2. Pre-commit Hook

**File:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run type check
npm run typecheck

# Run tests
npm test -- --bail --findRelatedTests
```

**Install Husky:**
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm test"
```

---

## 10. Best Practices

### 10.1. Test Naming

✅ **DO:**
```typescript
it('should return 401 when token is invalid', () => {})
it('should create place when user is contributor', () => {})
it('should increment view count on page visit', () => {})
```

❌ **DON'T:**
```typescript
it('works', () => {})
it('test login', () => {})
it('401', () => {})
```

**Pattern:** `should [action] when [condition]`

### 10.2. Test Independence

✅ **DO:**
```typescript
describe('Place API', () => {
  beforeEach(() => {
    jest.clearAllMocks() // Clear between tests
  })

  it('test 1', () => {
    // Self-contained
  })

  it('test 2', () => {
    // Independent from test 1
  })
})
```

❌ **DON'T:**
```typescript
let sharedState = {}

it('test 1', () => {
  sharedState.data = 'test' // Modifies shared state
})

it('test 2', () => {
  expect(sharedState.data).toBe('test') // Depends on test 1
})
```

### 10.3. Assertion Count

✅ **DO:**
```typescript
it('should return user data', async () => {
  const user = await getUser('user-id')

  expect(user.id).toBe('user-id')
  expect(user.email).toBe('test@example.com')
  expect(user.role).toBe('traveler')
})
```

❌ **DON'T:**
```typescript
it('should work', async () => {
  const user = await getUser('user-id')
  // No assertions - test passes but doesn't verify anything
})
```

**Principle:** Every test should have at least 1 assertion

### 10.4. Mock Granularity

✅ **DO:**
```typescript
// Mock only what you need
mockApiClient.places.list.mockResolvedValue({ data: [...] })
```

❌ **DON'T:**
```typescript
// Mock entire module when you only need one function
jest.mock('@/lib/client/api', () => ({
  apiClient: {
    places: { list: jest.fn(), create: jest.fn(), update: jest.fn() },
    users: { list: jest.fn(), get: jest.fn() },
    // ... 20 more functions
  }
}))
```

### 10.5. Test Readability

✅ **DO:**
```typescript
it('should approve place when moderator reviews', async () => {
  // Arrange
  const place = createMockPlace({ status: 'in_review' })
  const moderator = createMockUser({ role: 'moderator' })

  // Act
  const result = await approvePlaceção(place.id, moderator.id)

  // Assert
  expect(result.status).toBe('approved')
  expect(result.approvedBy).toBe(moderator.id)
})
```

❌ **DON'T:**
```typescript
it('test', async () => {
  const r = await f({id:'1',s:'in_review'},'m1')
  expect(r.s).toBe('a')
})
```

**Principle:** Tests should be readable like documentation

---

## 11. Troubleshooting

### 11.1. Common Issues

**Issue 1: "Cannot find module '@/lib/...'"**

**Cause:** Path alias not configured

**Solution:** Check `moduleNameMapper` in `jest.config.js`:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

---

**Issue 2: "The query requires an index"**

**Cause:** Firestore mock không match real query

**Solution:** Update mock chain:
```typescript
mockAdminDb.collection.mockReturnValue({
  where: jest.fn().mockReturnValue({
    orderBy: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: [] })
      })
    })
  })
} as any)
```

---

**Issue 3: "ReferenceError: fetch is not defined"**

**Cause:** Node.js không có global `fetch`

**Solution:** Add to `jest.setup.js`:
```javascript
global.fetch = jest.fn()
```

---

**Issue 4: "Rendered more hooks than previous render"**

**Cause:** Calling hooks conditionally

**Solution:** Move hooks outside conditions:
```typescript
// ❌ BAD
if (user) {
  const data = useData() // Conditional hook call
}

// ✅ GOOD
const data = useData()
if (user && data) {
  // Use data
}
```

---

**Issue 5: "Cannot spy on property 'useRouter' of undefined"**

**Cause:** Next.js router not mocked

**Solution:** Add to `jest.setup.js`:
```javascript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}))
```

---

## 12. Future Test Improvements

### 12.1. Component Testing (Planned)

**Install React Testing Library:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Example Component Test:**
```typescript
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlaceCard } from '@/components/place-card'

describe('PlaceCard Component', () => {
  it('should render place information', () => {
    const place = createMockPlace({
      title: 'Vung Tau Beach',
      region: 'nam-bo'
    })

    render(<PlaceCard place={place} />)

    expect(screen.getByText('Vung Tau Beach')).toBeInTheDocument()
    expect(screen.getByText(/nam-bo/i)).toBeInTheDocument()
  })

  it('should call onClick when card is clicked', () => {
    const place = createMockPlace()
    const handleClick = jest.fn()

    render(<PlaceCard place={place} onClick={handleClick} />)

    fireEvent.click(screen.getByTestId('place-card'))

    expect(handleClick).toHaveBeenCalledWith(place.id)
  })

  it('should show like count when liked', async () => {
    const place = createMockPlace({
      stats: { likeCount: 10 }
    })

    render(<PlaceCard place={place} />)

    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
```

### 12.2. E2E Testing (Planned)

**Install Playwright:**
```bash
npm install --save-dev @playwright/test
```

**Example E2E Test:**
```typescript
import { test, expect } from '@playwright/test'

test('User can login and create place', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login')

  // Fill login form
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Wait for redirect to dashboard
  await page.waitForURL('http://localhost:3000/dashboard')

  // Navigate to create place page
  await page.click('text=Đóng góp địa điểm')

  // Fill place form
  await page.fill('input[name="title"]', 'Test Place')
  await page.selectOption('select[name="region"]', 'bac-bo')
  await page.selectOption('select[name="province"]', 'hanoi')
  await page.selectOption('select[name="type"]', 'van-hoa')
  await page.fill('textarea[name="description"]', 'Test description')

  // Submit form
  await page.click('button[type="submit"]')

  // Verify success message
  await expect(page.locator('text=Địa điểm đã được tạo')).toBeVisible()
})
```

### 12.3. Visual Regression Testing (Planned)

**Install Chromatic:**
```bash
npm install --save-dev chromatic
```

**Storybook Integration:**
```bash
npm run chromatic --project-token=<project-token>
```

---

## 13. Test Coverage Report

### 13.1. Current Coverage (Estimated)

| Category | Coverage | Files Tested |
|----------|----------|--------------|
| **API Routes** | ~30% | 10 test files |
| **Custom Hooks** | ~20% | 1 test file |
| **Utility Functions** | ~40% | 3 test files |
| **Components** | 0% | 0 test files |
| **Overall** | ~15-20% | 10+ test files |

### 13.2. Priority Test Coverage

**High Priority (Critical Business Logic):**
- [x] Authentication API (`/api/auth/login`)
- [x] RBAC Permission Logic (`hasPermission()`)
- [ ] Moderation Queue API (`/api/moderation/queue`)
- [ ] Place Creation API (`/api/places`)
- [ ] State Machine Transitions

**Medium Priority (User-Facing Features):**
- [x] Admin Stats Hook (`useAdminStats`)
- [x] Moderation Queue Hook (`useModerationQueue`)
- [ ] Place Listing Hook (`usePlaces`)
- [ ] Place Detail Hook (`usePlace`)
- [ ] Review System Hooks

**Low Priority (UI Components):**
- [ ] PlaceCard Component
- [ ] ReviewModal Component
- [ ] Header Component
- [ ] Notification Bell Component

---

## 14. Related Documentation

**Xem thêm:**
- [01_SYSTEM_ARCHITECTURE.md](.docs/01_SYSTEM_ARCHITECTURE.md) - Tech stack và architecture
- [05_API_REFERENCE.md](.docs/05_API_REFERENCE.md) - API endpoints để test
- [06_FRONTEND_COMPONENTS_HOOKS.md](.docs/06_FRONTEND_COMPONENTS_HOOKS.md) - Hooks và components để test

**External Resources:**
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Firebase Testing Guide](https://firebase.google.com/docs/rules/unit-tests)

---

**Tài liệu này cung cấp đầy đủ thông tin về testing infrastructure của VietExplore-AI.**

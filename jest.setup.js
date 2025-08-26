// Jest setup for backend testing

// Mock Firebase Admin SDK for testing
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


// Mock Firebase Client SDK
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

// Global test setup
global.fetch = jest.fn()

// Setup environment variables for testing
process.env.FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY = 'test-private-key'

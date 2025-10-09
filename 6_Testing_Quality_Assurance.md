# Testing & Quality Assurance - Du Lịch Việt

> **Phiên bản:** 3.0.0
> **Ngày cập nhật:** Tháng 10, 2025

---

## Mục Lục

1. [Tổng Quan Testing Strategy](#1-tổng-quan-testing-strategy)
2. [Unit Testing](#2-unit-testing)
3. [Integration Testing](#3-integration-testing)
4. [End-to-End Testing](#4-end-to-end-testing)
5. [API Testing](#5-api-testing)
6. [Performance Testing](#6-performance-testing)
7. [Security Testing](#7-security-testing)
8. [Code Quality Tools](#8-code-quality-tools)
9. [Testing Workflow](#9-testing-workflow)
10. [Coverage Requirements](#10-coverage-requirements)

---

## 1. Tổng Quan Testing Strategy

### 1.1. Testing Pyramid

```
                    /\
                   /  \
                  / E2E \          10% - End-to-End Tests
                 /______\
                /        \
               /          \
              / Integration \     30% - Integration Tests
             /______________\
            /                \
           /                  \
          /    Unit Tests      \   60% - Unit Tests
         /______________________\
```

### 1.2. Testing Principles

**1. Test Early, Test Often**
- Write tests alongside features
- Run tests before every commit
- Automated testing in CI/CD

**2. Test What Matters**
- Focus on business logic
- Test edge cases
- Don't test framework code

**3. Fast Feedback Loop**
- Unit tests: < 5 seconds
- Integration tests: < 30 seconds
- E2E tests: < 3 minutes

**4. Maintainable Tests**
- Clear test names
- DRY principle
- Isolate test data

### 1.3. Testing Stack

```typescript
{
  "testing": {
    "unit": "Jest + React Testing Library",
    "integration": "Jest + Supertest",
    "e2e": "Playwright (planned)",
    "api": "Postman + Newman",
    "performance": "Lighthouse + k6",
    "security": "OWASP ZAP"
  }
}
```

---

## 2. Unit Testing

### 2.1. Setup

**Install Dependencies:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Configuration (`jest.config.js`):**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/app/**'  // Exclude Next.js app directory
  ],
  coverageThresholds: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  }
};
```

### 2.2. Component Testing

**Example: PlaceCard Component**

```typescript
// src/components/places/place-card.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceCard } from './place-card';

const mockPlace = {
  id: 'test-place-1',
  name: 'Vịnh Hạ Long',
  slug: 'vinh-ha-long',
  province: 'Quảng Ninh',
  region: 'bac-bo',
  type: 'bien',
  images: [{ url: 'https://example.com/image.jpg', isPrimary: true }],
  stats: {
    averageRating: 4.5,
    totalReviews: 100
  },
  viewCount: 1000
};

describe('PlaceCard', () => {
  it('renders place name', () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText('Vịnh Hạ Long')).toBeInTheDocument();
  });

  it('displays correct province', () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText(/Quảng Ninh/i)).toBeInTheDocument();
  });

  it('shows rating and review count', () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText(/100.*đánh giá/i)).toBeInTheDocument();
  });

  it('formats view count correctly', () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText(/1.000.*lượt xem/i)).toBeInTheDocument();
  });

  it('calls onSave when save button clicked', async () => {
    const onSave = jest.fn();
    render(<PlaceCard place={mockPlace} onSave={onSave} />);

    const saveButton = screen.getByRole('button', { name: /lưu/i });
    await userEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(mockPlace.id);
  });

  it('navigates to place detail on click', async () => {
    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush })
    }));

    render(<PlaceCard place={mockPlace} />);

    const card = screen.getByRole('article');
    await userEvent.click(card);

    expect(mockPush).toHaveBeenCalledWith(`/places/${mockPlace.slug}`);
  });
});
```

### 2.3. Hook Testing

**Example: useAuth Hook**

```typescript
// src/hooks/use-auth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './use-auth';
import * as firebaseAuth from 'firebase/auth';

jest.mock('firebase/auth');

describe('useAuth', () => {
  it('returns null user when not authenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('returns user when authenticated', async () => {
    const mockUser = {
      uid: 'user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    };

    jest.spyOn(firebaseAuth, 'onAuthStateChanged').mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth());

    jest.spyOn(firebaseAuth, 'signInWithEmailAndPassword').mockResolvedValue({
      user: { uid: 'user-123' }
    });

    await result.current.login('test@example.com', 'password');

    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    );
  });
});
```

### 2.4. Utility Function Testing

**Example: Permission Utility**

```typescript
// src/lib/auth/permissions.test.ts
import { hasPermission, ROLE_PERMISSIONS } from './permissions';

describe('hasPermission', () => {
  it('grants permission to role that has it', () => {
    const user = { role: 'contributor' };
    expect(hasPermission(user, 'create_place')).toBe(true);
  });

  it('denies permission to role that does not have it', () => {
    const user = { role: 'traveler' };
    expect(hasPermission(user, 'create_place')).toBe(false);
  });

  it('grants inherited permissions from lower roles', () => {
    const user = { role: 'contributor' };
    expect(hasPermission(user, 'create_review')).toBe(true);  // From traveler
  });

  it('grants all permissions to admin', () => {
    const user = { role: 'admin' };
    expect(hasPermission(user, 'create_place')).toBe(true);
    expect(hasPermission(user, 'review_content')).toBe(true);
    expect(hasPermission(user, 'manage_users')).toBe(true);
  });

  it('denies all permissions to guest', () => {
    const user = { role: 'guest' };
    expect(hasPermission(user, 'create_place')).toBe(false);
    expect(hasPermission(user, 'create_review')).toBe(false);
  });
});
```

---

## 3. Integration Testing

### 3.1. API Route Testing

**Setup:**
```bash
npm install --save-dev supertest
```

**Example: Places API Integration Test**

```typescript
// src/app/api/places/route.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from './route';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin');

describe('/api/places', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('GET /api/places', () => {
    it('returns published places', async () => {
      const mockPlaces = [
        { id: '1', name: 'Place 1', status: 'published' },
        { id: '2', name: 'Place 2', status: 'published' }
      ];

      const mockFirestore = {
        collection: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: mockPlaces.map(p => ({ id: p.id, data: () => p }))
        })
      };

      jest.spyOn(admin, 'firestore').mockReturnValue(mockFirestore as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/places?region=bac-bo'
      });

      const response = await GET(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].name).toBe('Place 1');
    });

    it('filters by region correctly', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/places?region=trung-bo'
      });

      await GET(req);

      const firestore = admin.firestore();
      expect(firestore.where).toHaveBeenCalledWith('region', '==', 'trung-bo');
    });

    it('handles errors gracefully', async () => {
      jest.spyOn(admin.firestore(), 'collection').mockImplementation(() => {
        throw new Error('Database error');
      });

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/places', () => {
    it('creates draft when authenticated', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
        role: 'contributor'
      };

      const { req } = createMocks({
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
        body: {
          name: 'New Place',
          description: 'Description',
          province: 'Hà Nội',
          region: 'bac-bo',
          type: 'van-hoa'
        }
      });

      // Mock auth verification
      jest.spyOn(admin.auth(), 'verifyIdToken').mockResolvedValue({
        uid: mockUser.uid
      } as any);

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Place');
      expect(data.data.status).toBe('draft');
    });

    it('returns 401 when not authenticated', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: { name: 'New Place' }
      });

      const response = await POST(req);

      expect(response.status).toBe(401);
    });

    it('validates required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
        body: { name: 'AB' }  // Too short
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
    });
  });
});
```

### 3.2. Database Integration Testing

**Example: Firestore Transaction Test**

```typescript
// src/lib/server/view-tracker.test.ts
import { ViewTracker } from './view-tracker';
import * as admin from 'firebase-admin';

describe('ViewTracker', () => {
  describe('trackPlaceView', () => {
    it('increments view count for new visitor', async () => {
      const placeId = 'place-123';
      const context = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      };

      // Mock cache miss
      const mockCacheDoc = { exists: false };
      jest.spyOn(admin.firestore().collection('view_cache').doc(''), 'get')
        .mockResolvedValue(mockCacheDoc as any);

      const result = await ViewTracker.trackPlaceView(placeId, context);

      expect(result.isUnique).toBe(true);

      // Verify view count incremented
      const placeRef = admin.firestore().collection('places').doc(placeId);
      expect(placeRef.update).toHaveBeenCalledWith({
        viewCount: admin.firestore.FieldValue.increment(1),
        lastViewedAt: expect.any(Date)
      });
    });

    it('does not increment for duplicate view', async () => {
      const placeId = 'place-123';
      const context = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      };

      // Mock cache hit
      const mockCacheDoc = {
        exists: true,
        data: () => ({
          expiresAt: new Date(Date.now() + 3600000)  // Not expired
        })
      };

      jest.spyOn(admin.firestore().collection('view_cache').doc(''), 'get')
        .mockResolvedValue(mockCacheDoc as any);

      const result = await ViewTracker.trackPlaceView(placeId, context);

      expect(result.isUnique).toBe(false);

      // Verify view count NOT incremented
      const placeRef = admin.firestore().collection('places').doc(placeId);
      expect(placeRef.update).not.toHaveBeenCalled();
    });
  });
});
```

---

## 4. End-to-End Testing

### 4.1. Setup Playwright

**Install:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Configuration (`playwright.config.ts`):**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:9002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9002',
    reuseExistingServer: !process.env.CI
  }
});
```

### 4.2. User Journey Tests

**Example: Place Creation E2E Test**

```typescript
// e2e/place-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Place Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'contributor@test.com');
    await page.fill('input[name="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should create a new place draft', async ({ page }) => {
    // Navigate to create page
    await page.click('text=Đóng góp');
    await page.click('text=Tạo địa điểm');

    // Fill form
    await page.fill('input[name="name"]', 'Bãi Biển Test');
    await page.fill('textarea[name="description"]', 'Đây là mô tả test dài hơn 50 ký tự để pass validation');

    // Select province
    await page.click('select[name="province"]');
    await page.selectOption('select[name="province"]', 'Đà Nẵng');

    // Select region and type
    await page.selectOption('select[name="region"]', 'trung-bo');
    await page.selectOption('select[name="type"]', 'bien');

    // Upload image
    await page.setInputFiles('input[type="file"]', 'e2e/fixtures/test-image.jpg');
    await page.waitForSelector('img[alt="Uploaded image"]');

    // Save draft
    await page.click('button:has-text("Lưu nháp")');

    // Verify success
    await expect(page.locator('text=Tạo nháp thành công')).toBeVisible();
    await expect(page).toHaveURL(/\/contribute\/my-drafts/);
  });

  test('should submit draft for review', async ({ page }) => {
    // Assume we have a draft already
    await page.goto('/contribute/my-drafts');

    // Click on draft
    await page.click('text=Bãi Biển Test');

    // Submit for review
    await page.click('button:has-text("Gửi kiểm duyệt")');
    await page.click('button:has-text("Xác nhận")');  // Confirmation dialog

    // Verify success
    await expect(page.locator('text=Gửi kiểm duyệt thành công')).toBeVisible();
    await expect(page.locator('text=Đang chờ duyệt')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/contribute/create');

    // Try to submit without filling required fields
    await page.click('button:has-text("Lưu nháp")');

    // Verify validation errors
    await expect(page.locator('text=Tên phải có ít nhất 3 ký tự')).toBeVisible();
    await expect(page.locator('text=Mô tả phải có ít nhất 50 ký tự')).toBeVisible();
  });
});
```

**Example: Moderation Workflow E2E Test**

```typescript
// e2e/moderation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Moderation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as moderator
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'moderator@test.com');
    await page.fill('input[name="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('moderator can claim and approve place', async ({ page }) => {
    // Navigate to moderation queue
    await page.goto('/admin/moderation/queue');

    // Filter by pending status
    await page.click('button:has-text("Chờ duyệt")');

    // Find first item
    const firstItem = page.locator('[data-testid="queue-item"]').first();
    const placeName = await firstItem.locator('[data-testid="place-name"]').textContent();

    // Claim item
    await firstItem.locator('button:has-text("Tiếp nhận")').click();
    await expect(firstItem.locator('text=Đã tiếp nhận')).toBeVisible();

    // Start review
    await firstItem.locator('button:has-text("Bắt đầu kiểm duyệt")').click();

    // Review and approve
    await page.click('button:has-text("Duyệt")');
    await page.fill('textarea[name="notes"]', 'Nội dung chất lượng, phê duyệt');
    await page.click('button:has-text("Xác nhận duyệt")');

    // Verify success
    await expect(page.locator('text=Đã duyệt thành công')).toBeVisible();

    // Verify place is published
    await page.goto(`/places?search=${placeName}`);
    await expect(page.locator(`text=${placeName}`)).toBeVisible();
  });

  test('moderator can request revision', async ({ page }) => {
    await page.goto('/admin/moderation/queue');

    const firstItem = page.locator('[data-testid="queue-item"]').first();

    // Claim and start review
    await firstItem.locator('button:has-text("Tiếp nhận")').click();
    await firstItem.locator('button:has-text("Bắt đầu kiểm duyệt")').click();

    // Request revision
    await page.click('button:has-text("Yêu cầu sửa")');
    await page.fill('textarea[name="feedback"]', 'Vui lòng bổ sung thêm thông tin về giờ mở cửa');
    await page.click('button:has-text("Gửi yêu cầu")');

    // Verify
    await expect(page.locator('text=Đã gửi yêu cầu chỉnh sửa')).toBeVisible();
  });
});
```

---

## 5. API Testing

### 5.1. Postman Collection

**Create Collection:**
```json
{
  "info": {
    "name": "Du Lịch Việt API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"test123456\",\n  \"displayName\": \"Test User\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register"
            }
          },
          "response": [],
          "test": "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));\npm.test(\"Returns user data\", () => {\n  const json = pm.response.json();\n  pm.expect(json.success).to.be.true;\n  pm.expect(json.data.user).to.have.property('id');\n});"
        }
      ]
    }
  ]
}
```

### 5.2. Newman (CLI Runner)

**Run Tests:**
```bash
# Install Newman
npm install -g newman

# Run collection
newman run postman-collection.json \
  --environment postman-env.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export ./test-results/api-tests.html
```

---

## 6. Performance Testing

### 6.1. Lighthouse CI

**Configuration (`.lighthouserc.js`):**
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:9002/', 'http://localhost:9002/places'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['warn', { minScore: 0.90 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.90 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

**Run:**
```bash
npm install -g @lhci/cli
lhci autorun
```

### 6.2. Load Testing with k6

**Script (`load-test.js`):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 }    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01']     // Error rate < 1%
  }
};

export default function () {
  // Test homepage
  let res = http.get('http://localhost:9002/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'page loads in < 500ms': (r) => r.timings.duration < 500
  });

  sleep(1);

  // Test API
  res = http.get('http://localhost:9002/api/places?limit=20');
  check(res, {
    'API status is 200': (r) => r.status === 200,
    'returns data': (r) => r.json().data.length > 0
  });

  sleep(1);
}
```

**Run:**
```bash
k6 run load-test.js
```

---

## 7. Security Testing

### 7.1. OWASP ZAP

**Automated Scan:**
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:9002 \
  -r zap-report.html
```

### 7.2. Security Checklist

**Authentication:**
- [ ] Password strength requirements enforced
- [ ] JWT tokens expire after 1 hour
- [ ] Refresh tokens stored in httpOnly cookies
- [ ] Account lockout after 5 failed login attempts

**Authorization:**
- [ ] All protected routes check authentication
- [ ] Role-based permissions enforced
- [ ] Firestore rules prevent unauthorized access

**Input Validation:**
- [ ] All user inputs validated with Zod
- [ ] SQL injection prevented (use Firebase SDK)
- [ ] XSS prevented (sanitize inputs)
- [ ] CSRF tokens on state-changing operations

**Data Protection:**
- [ ] Passwords hashed with bcrypt
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced in production
- [ ] No sensitive data in logs

---

## 8. Code Quality Tools

### 8.1. ESLint

**Configuration (`.eslintrc.json`):**
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Run:**
```bash
npm run lint
npm run lint:fix  # Auto-fix
```

### 8.2. TypeScript

**Run Type Check:**
```bash
npm run typecheck
```

**Strict Mode Enabled:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true
  }
}
```

### 8.3. Prettier

**Configuration (`.prettierrc`):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 9. Testing Workflow

### 9.1. Pre-Commit

**Setup Husky:**
```bash
npm install --save-dev husky lint-staged

# Add to package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

**Create Hook:**
```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

### 9.2. CI/CD Pipeline

**GitHub Actions (`.github/workflows/test.yml`):**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Build
        run: npm run build

      - name: Run E2E tests
        run: npx playwright test
```

---

## 10. Coverage Requirements

### 10.1. Coverage Thresholds

**Minimum Requirements:**
```javascript
// jest.config.js
coverageThresholds: {
  global: {
    branches: 60,    // 60% branch coverage
    functions: 60,   // 60% function coverage
    lines: 60,       // 60% line coverage
    statements: 60   // 60% statement coverage
  },
  './src/lib/**/*.ts': {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### 10.2. Current Status

```
Current Coverage (as of 2025-01-06):
├── Unit Tests: ~30%
├── Integration Tests: ~10%
└── E2E Tests: 0% (Not yet implemented)

Target Coverage (Q2 2025):
├── Unit Tests: 80%
├── Integration Tests: 60%
└── E2E Tests: Critical user flows
```

### 10.3. Coverage Report

**Generate:**
```bash
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## Kết Luận

Testing là một phần quan trọng không thể thiếu để đảm bảo chất lượng và độ tin cậy của **Du Lịch Việt**. Với strategy rõ ràng và tools phù hợp, chúng ta có thể:

1. ✅ **Phát hiện bugs sớm** - Trước khi deploy production
2. ✅ **Đảm bảo chất lượng** - Maintain code quality standards
3. ✅ **Tự tin refactor** - Tests protect against regressions
4. ✅ **Document behavior** - Tests serve as living documentation

**Tài liệu liên quan:**
- [1. Tổng Quan Dự Án](./1_Tong_Quan_Du_Lich_Viet.md)
- [2. Kiến Trúc Hệ Thống](./2_Kien_Truc_He_Thong_&_Cong_Nghe.md)
- [4. Cấu Trúc Thư Mục & Setup](./4_Cau_Truc_Thu_Muc_&_Setup.md)
- [5. API, Database, Security & Performance](./5_API_Database_Security_Performance.md)

---

*© 2025 Du Lịch Việt. All rights reserved.*

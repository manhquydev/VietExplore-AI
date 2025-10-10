# 10. SCRIPTS & MAINTENANCE

## Tổng Quan

VietExplore-AI có bộ công cụ maintenance scripts để quản lý database, testing, deployment và troubleshooting.

**Script Location:** `C:\Users\manhq\Downloads\da2\VietExplore-AI\scripts\`
**Số lượng scripts:** 29+ scripts
**Language:** JavaScript (Node.js)

---

## 1. Script Categories

### 1.1. User Management Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `create-admin-user.js` | Tạo admin user để test moderation workflow | `node scripts/create-admin-user.js` |
| `create-single-admin.js` | Tạo single admin account nhanh | `node scripts/create-single-admin.js` |
| `clear-all-users.js` | Xóa tất cả users (cleanup testing data) | `node scripts/clear-all-users.js` |
| `seed-users.js` | Seed test users với multiple roles | `node scripts/seed-users.js` |
| `reset-vn-admin.js` | Reset VN admin account | `node scripts/reset-vn-admin.js` |

### 1.2. Place Management Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `seed-places-vietnam.js` | Seed 10 real Vietnam tourist destinations | `node scripts/seed-places-vietnam.js` |
| `clear-all-places.js` | Xóa tất cả places (cleanup) | `node scripts/clear-all-places.js` |
| `cleanup-all-published-places.js` | Cleanup published places | `node scripts/cleanup-all-published-places.js` |
| `check-specific-place.js` | Kiểm tra trạng thái place cụ thể | `node scripts/check-specific-place.js <place-id>` |
| `fix-stuck-approved-places.js` | Fix places bị stuck ở approved state | `node scripts/fix-stuck-approved-places.js` |

### 1.3. Moderation Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `create-real-moderation-queue.js` | Tạo realistic moderation queue data | `node scripts/create-real-moderation-queue.js` |
| `seed-moderation-queue.js` | Seed moderation queue items | `node scripts/seed-moderation-queue.js` |
| `check-queue-status.js` | Kiểm tra moderation queue status | `node scripts/check-queue-status.js` |
| `audit-moderation-reset.js` | Audit và reset moderation state | `node scripts/audit-moderation-reset.js` |
| `test-moderation-api.js` | Test moderation API endpoints | `node scripts/test-moderation-api.js` |
| `test-moderation-flow.js` | Test complete moderation workflow | `node scripts/test-moderation-flow.js` |

### 1.4. Testing Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `test-admin-api.js` | Test admin API endpoints | `node scripts/test-admin-api.js` |
| `test-auth-flow.js` | Test authentication flow | `node scripts/test-auth-flow.js` |
| `test-moderation-api.js` | Test moderation APIs | `node scripts/test-moderation-api.js` |
| `test-moderation-flow.js` | Test end-to-end moderation | `node scripts/test-moderation-flow.js` |

### 1.5. Firebase Deployment Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-firebase-config.js` | Deploy Firestore indexes + rules | `node scripts/deploy-firebase-config.js` |
| `deploy-firebase-rules.js` | Deploy only Firestore rules | `node scripts/deploy-firebase-rules.js` |
| `check-firebase-config.js` | Verify Firebase configuration | `node scripts/check-firebase-config.js` |

### 1.6. PWA & Build Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `generate-pwa-icons.js` | Generate PWA icons (all sizes) | `node scripts/generate-pwa-icons.js` |
| `generate-sitemap-file.js` | Generate sitemap.xml | `node scripts/generate-sitemap-file.js` |
| `generate-sitemap-tree.js` | Generate sitemap tree visualization | `node scripts/generate-sitemap-tree.js` |
| `start-dev.js` | Start development server | `node scripts/start-dev.js` |

### 1.7. Team Management Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `seed-team-members.js` | Seed team/founder profiles | `node scripts/seed-team-members.js` |
| `seed-team-via-api.js` | Seed team via API endpoint | `node scripts/seed-team-via-api.js` |

### 1.8. Reset & Cleanup Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `reset-complete.js` | Full project reset (all data) | `node scripts/reset-complete.js` |
| `reset-project.js` | Reset project to initial state | `node scripts/reset-project.js` |
| `delete-entry-8jdBl4UBFWwIXl6uIjT4.js` | Delete specific entry by ID | `node scripts/delete-entry-*.js` |

---

## 2. Detailed Script Documentation

### 2.1. User Management

#### `create-admin-user.js`

**Purpose:** Tạo admin user để test moderation workflow

**Code Structure:**
```javascript
// 1. Initialize Firebase Admin SDK
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// 2. Load service account credentials
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 3. Create admin user
const adminUser = await admin.auth().createUser({
  email: 'admin@vietexplore.test',
  password: 'AdminTest123!',
  displayName: 'Admin Test',
  emailVerified: true
});

// 4. Create Firestore profile
await db.collection('users').doc(adminUser.uid).set({
  id: adminUser.uid,
  email: 'admin@vietexplore.test',
  fullName: 'Admin Test',
  role: 'admin',
  trustLabel: 'verified',
  emailVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  stats: { /* ... */ }
});

// 5. Set custom claims
await admin.auth().setCustomUserClaims(adminUser.uid, {
  role: 'admin'
});
```

**Output:**
```
Created admin user: abc123xyz
✅ Admin user created successfully!
Email: admin@vietexplore.test
Password: AdminTest123!
Role: admin

You can now use this account to access moderation dashboard at /moderation/dashboard
```

**Error Handling:**
```javascript
if (error.code === 'auth/email-already-exists') {
  // Update existing user to admin role
  const existingUser = await admin.auth().getUserByEmail('admin@vietexplore.test');
  await db.collection('users').doc(existingUser.uid).update({
    role: 'admin',
    trustLabel: 'verified',
    updatedAt: new Date().toISOString()
  });
}
```

**Use Cases:**
- Testing moderation features
- Setup development environment
- Admin access recovery

---

#### `seed-users.js`

**Purpose:** Seed test users với multiple roles

**User Types Created:**
```javascript
const testUsers = [
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
    displayName: 'Admin Test'
  },
  {
    email: 'moderator@test.com',
    password: 'Moderator123!',
    role: 'moderator',
    displayName: 'Moderator Test'
  },
  {
    email: 'contributor@test.com',
    password: 'Contributor123!',
    role: 'contributor',
    displayName: 'Contributor Test'
  },
  {
    email: 'traveler@test.com',
    password: 'Traveler123!',
    role: 'traveler',
    displayName: 'Traveler Test'
  },
  {
    email: 'partner@test.com',
    password: 'Partner123!',
    role: 'partner',
    displayName: 'Partner Test'
  }
];
```

**Output:**
```
🔧 Seeding test users...
✅ Created admin@test.com (admin)
✅ Created moderator@test.com (moderator)
✅ Created contributor@test.com (contributor)
✅ Created traveler@test.com (traveler)
✅ Created partner@test.com (partner)

📊 Total users created: 5
🚀 Ready to test role-based features
```

**Use Cases:**
- Testing RBAC permissions
- Testing different user experiences
- Development environment setup

---

#### `clear-all-users.js`

**Purpose:** Xóa tất cả users (cleanup testing data)

**Warning:**
```javascript
console.log('⚠️  WARNING: This will delete ALL users from Firebase Auth and Firestore');
console.log('⚠️  This action CANNOT be undone!');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Are you sure? (yes/no): ', async (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Operation cancelled');
    process.exit(0);
  }
  // Proceed with deletion...
});
```

**Logic:**
```javascript
// 1. List all users from Firebase Auth
const listUsers = await admin.auth().listUsers();

// 2. Delete from Auth
for (const user of listUsers.users) {
  await admin.auth().deleteUser(user.uid);
  console.log(`Deleted user: ${user.email}`);
}

// 3. Delete from Firestore
const usersSnapshot = await db.collection('users').get();
const batch = db.batch();
usersSnapshot.docs.forEach(doc => {
  batch.delete(doc.ref);
});
await batch.commit();
```

**Output:**
```
⚠️  WARNING: This will delete ALL users from Firebase Auth and Firestore
⚠️  This action CANNOT be undone!
Are you sure? (yes/no): yes

Deleted user: admin@test.com
Deleted user: moderator@test.com
Deleted user: contributor@test.com
Deleted user: traveler@test.com

✅ Deleted 4 users from Firebase Auth
✅ Deleted 4 user documents from Firestore

🚀 Database is now clean
```

**Use Cases:**
- Reset development environment
- Clean up after testing
- Start fresh with data

---

### 2.2. Place Management

#### `seed-places-vietnam.js`

**Purpose:** Seed 10 real Vietnam tourist destinations với đầy đủ metadata

**Data Structure:**
```javascript
const vietnamPlaces = [
  {
    name: 'Vịnh Hạ Long',
    slug: 'vinh-ha-long',
    shortDescription: 'Di sản thiên nhiên thế giới UNESCO...',
    description: '...',
    region: 'bac-bo',
    province: 'Quảng Ninh',
    provinceSlug: 'quang-ninh',
    type: 'bien',
    coordinates: { lat: 20.9101, lng: 107.1839 },
    address: 'Thành phố Hạ Long, Tỉnh Quảng Ninh',
    trustLabel: 'verified',
    source: { type: 'partner', partnerName: 'Sở Du lịch Quảng Ninh' },
    status: 'published',
    rating: {
      average: 4.8,
      count: 2847,
      breakdown: { 5: 1890, 4: 657, 3: 200, 2: 70, 1: 30 }
    },
    tags: ['UNESCO', 'di sản thế giới', 'vịnh', 'du thuyền', 'thiên nhiên'],
    viewCount: 45230,
    likeCount: 3890,
    featured: true,
    images: [
      'https://images.unsplash.com/vinh-ha-long-1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/vinh-ha-long-2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/vinh-ha-long-3?w=800&h=600&fit=crop'
    ]
  },
  // ... 9 more places
];
```

**Places Included:**
1. Vịnh Hạ Long (UNESCO, Biển)
2. Phố Cổ Hội An (UNESCO, Văn hóa)
3. Sa Pa và Ruộng Bậc Thang (Núi, Dân tộc)
4. Bà Nà Hills (Check-in, Cầu Vàng)
5. Chợ Nổi Cái Răng (Văn hóa, Sông nước)
6. Đảo Phú Quốc (Biển, Resort)
7. Tràng An Ninh Bình (UNESCO, Hang động)
8. Bãi biển Mỹ Khê (Biển, Forbes)
9. Đà Lạt - Thành phố Ngàn Hoa (Núi, Hoa)
10. Mũi Né (Biển, Đồi cát)

**Output:**
```
🇻🇳 Seeding Vietnam tourist destinations...

Clearing 15 existing places...
✅ Successfully seeded 10 Vietnam tourist destinations
📊 Total published places in database: 10

📍 Places by region:
   Bắc Bộ: 3 places
   Trung Bộ: 3 places
   Nam Bộ: 4 places

🏷️ Places by type:
   Biển: 4 places
   Núi: 2 places
   Văn hóa: 3 places
   Check-in: 1 places

🚀 Ready to test:
1. Start dev server: npm run dev
2. Visit: /places
3. Visit: / (homepage should show featured places)
4. Test contribute flow: /contribute/new-place
```

**Use Cases:**
- Testing place listing pages
- Testing filters (region, type)
- Testing featured places on homepage
- Development environment setup
- Demo/screenshot for docs

---

#### `check-specific-place.js`

**Purpose:** Kiểm tra trạng thái place cụ thể (debug tool)

**Usage:**
```bash
node scripts/check-specific-place.js <place-id>
node scripts/check-specific-place.js abc123xyz
```

**Output:**
```
🔍 Checking place: abc123xyz

📄 Place Document:
{
  id: 'abc123xyz',
  title: 'Vịnh Hạ Long',
  status: 'published',
  submitter: 'user123',
  createdAt: '2024-01-15T10:30:00Z',
  publishedAt: '2024-01-16T14:20:00Z',
  trustLabel: 'verified',
  viewCount: 45230,
  likeCount: 3890,
  rating: {
    average: 4.8,
    count: 2847
  }
}

✅ Status: published
✅ Trust Label: verified
✅ Featured: true
✅ Images: 3 images

📊 Stats:
- View Count: 45,230
- Like Count: 3,890
- Save Count: 1,234
- Rating: 4.8/5.0 (2,847 reviews)

🔄 History:
- Created: 2024-01-15 10:30:00
- Published: 2024-01-16 14:20:00
- Last Updated: 2024-01-20 09:15:00
```

**Use Cases:**
- Debug place not showing
- Investigate status issues
- Verify data integrity

---

#### `fix-stuck-approved-places.js`

**Purpose:** Fix places bị stuck ở approved state nhưng chưa copy sang `places` collection

**Problem:**
```
moderation_queue status = 'approved'
BUT
places collection không có document tương ứng
```

**Logic:**
```javascript
// 1. Find stuck items
const stuckItems = await db.collection('moderation_queue')
  .where('status', '==', 'approved')
  .where('itemType', '==', 'place')
  .get();

for (const item of stuckItems.docs) {
  const itemData = item.data();

  // 2. Check if place exists
  const placeDoc = await db.collection('places').doc(itemData.contentId).get();

  if (!placeDoc.exists) {
    // 3. Place missing - copy from draft
    const draftDoc = await db.collection('placeDrafts').doc(itemData.contentId).get();

    if (draftDoc.exists) {
      const draftData = draftDoc.data();

      // 4. Create place document
      await db.collection('places').doc(itemData.contentId).set({
        ...draftData,
        status: 'published',
        publishedAt: itemData.reviewedAt || new Date().toISOString(),
        approvedBy: itemData.reviewedBy
      });

      console.log(`✅ Fixed place: ${draftData.title}`);
    }
  }
}
```

**Output:**
```
🔍 Checking for stuck approved places...

Found 3 stuck items:
1. "Vịnh Hạ Long" (ID: abc123)
2. "Phố Cổ Hội An" (ID: def456)
3. "Sa Pa" (ID: ghi789)

✅ Fixed place: Vịnh Hạ Long
✅ Fixed place: Phố Cổ Hội An
✅ Fixed place: Sa Pa

📊 Summary:
- Total stuck items: 3
- Successfully fixed: 3
- Failed: 0

🚀 All places are now correctly published
```

**Use Cases:**
- Fix race condition bugs
- Recover from failed deployments
- Manual intervention after errors

---

### 2.3. Moderation Scripts

#### `create-real-moderation-queue.js`

**Purpose:** Tạo realistic moderation queue data để test moderation workflow

**Queue Items Created:**
```javascript
const queueScenarios = [
  // 1. High priority - urgent content
  {
    itemType: 'place',
    contentId: 'draft_urgent_001',
    status: 'pending',
    priority: 'urgent',
    content: {
      title: 'Bãi biển ô nhiễm nghiêm trọng - Cần cảnh báo',
      type: 'report'
    },
    submittedBy: 'user123',
    submittedAt: new Date().toISOString()
  },

  // 2. High priority - offensive content
  {
    itemType: 'review_report',
    contentId: 'review_001',
    status: 'pending',
    priority: 'high',
    content: {
      reason: 'Ngôn từ xúc phạm',
      reportedContent: 'Review chứa từ ngữ không phù hợp'
    }
  },

  // 3. Medium priority - new place submission
  {
    itemType: 'place',
    contentId: 'draft_001',
    status: 'pending',
    priority: 'medium',
    content: {
      title: 'Chùa Một Cột',
      region: 'bac-bo',
      province: 'Hà Nội'
    },
    submittedBy: 'contributor_001'
  },

  // 4. Low priority - edit suggestion
  {
    itemType: 'edit_suggestion',
    contentId: 'suggestion_001',
    status: 'pending',
    priority: 'low',
    content: {
      suggestedChanges: {
        description: 'Update mô tả chi tiết hơn'
      }
    }
  },

  // 5. Claimed item (moderator đã tiếp nhận)
  {
    itemType: 'place',
    contentId: 'draft_002',
    status: 'claimed',
    priority: 'medium',
    claimedBy: 'moderator_001',
    claimedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    claimExpiresAt: new Date(Date.now() + 90 * 60 * 1000).toISOString() // 90 min left
  },

  // 6. In review (đang kiểm duyệt)
  {
    itemType: 'place',
    contentId: 'draft_003',
    status: 'in_review',
    priority: 'medium',
    claimedBy: 'moderator_002',
    reviewStartedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];
```

**Output:**
```
📝 Creating realistic moderation queue...

✅ Created urgent item: "Bãi biển ô nhiễm nghiêm trọng"
✅ Created high priority report: Review report (offensive content)
✅ Created medium priority: "Chùa Một Cột"
✅ Created low priority: Edit suggestion
✅ Created claimed item: "Bãi biển Quy Nhơn" (claimed by moderator_001)
✅ Created in_review item: "Đồi chè Mộc Châu" (reviewing by moderator_002)

📊 Queue Summary:
- Pending: 4 items
- Claimed: 1 items
- In Review: 1 items

📋 Priority Breakdown:
- Urgent: 1 items
- High: 1 items
- Medium: 3 items
- Low: 1 items

🚀 Ready to test moderation workflow at /admin/moderation/queue
```

**Use Cases:**
- Testing moderation dashboard UI
- Testing claim/review/approve flow
- Testing priority sorting
- Testing SLA tracking
- Development/demo environment

---

#### `check-queue-status.js`

**Purpose:** Kiểm tra moderation queue status (overview tool)

**Output:**
```
🔍 Checking moderation queue status...

📊 Queue Overview:
┌─────────────┬────────┐
│ Status      │ Count  │
├─────────────┼────────┤
│ pending     │ 12     │
│ claimed     │ 3      │
│ in_review   │ 5      │
│ approved    │ 8      │
│ rejected    │ 2      │
└─────────────┴────────┘

📋 Priority Distribution:
┌──────────┬────────┐
│ Priority │ Count  │
├──────────┼────────┤
│ urgent   │ 2      │
│ high     │ 5      │
│ medium   │ 15     │
│ low      │ 8      │
└──────────┴────────┘

⏰ SLA Status:
- Within SLA: 25 items (83%)
- Approaching SLA: 3 items (10%)
- Overdue: 2 items (7%)

👥 Moderator Workload:
- moderator_001: 3 items (2 claimed, 1 in_review)
- moderator_002: 5 items (1 claimed, 4 in_review)

⚠️  Issues Detected:
- 2 items overdue SLA (need immediate attention)
- 1 claimed item expired (>2h, should auto-release)

🚀 Recommendations:
1. Review overdue items immediately
2. Release expired claimed items
3. Balance workload between moderators
```

**Use Cases:**
- Daily queue monitoring
- Identify bottlenecks
- Detect stuck items
- Workload balancing

---

### 2.4. Testing Scripts

#### `test-moderation-api.js`

**Purpose:** Test moderation API endpoints (integration test)

**Tests:**
```javascript
async function testModerationAPI() {
  const tests = [
    {
      name: 'GET /api/moderation/queue - List pending items',
      request: {
        method: 'GET',
        url: '/api/moderation/queue?status=pending',
        headers: { Authorization: `Bearer ${moderatorToken}` }
      },
      expectedStatus: 200,
      expectedFields: ['success', 'data', 'pagination']
    },
    {
      name: 'POST /api/moderation/queue/:id - Claim item',
      request: {
        method: 'POST',
        url: `/api/moderation/queue/${itemId}/claim`,
        headers: { Authorization: `Bearer ${moderatorToken}` }
      },
      expectedStatus: 200
    },
    {
      name: 'POST /api/moderation/queue/:id - Start review',
      request: {
        method: 'POST',
        url: `/api/moderation/queue/${itemId}/start-review`,
        headers: { Authorization: `Bearer ${moderatorToken}` }
      },
      expectedStatus: 200
    },
    {
      name: 'POST /api/moderation/queue/:id - Approve',
      request: {
        method: 'POST',
        url: `/api/moderation/queue/${itemId}/approve`,
        headers: { Authorization: `Bearer ${moderatorToken}` },
        body: { notes: 'Approved - content looks good' }
      },
      expectedStatus: 200
    },
    {
      name: 'POST /api/moderation/queue/:id - Reject (traveler cannot access)',
      request: {
        method: 'POST',
        url: `/api/moderation/queue/${itemId}/reject`,
        headers: { Authorization: `Bearer ${travelerToken}` },
        body: { reason: 'Invalid content' }
      },
      expectedStatus: 403
    }
  ];

  for (const test of tests) {
    try {
      const response = await fetch(test.request.url, {
        method: test.request.method,
        headers: test.request.headers,
        body: test.request.body ? JSON.stringify(test.request.body) : undefined
      });

      const status = response.status;
      const data = await response.json();

      if (status === test.expectedStatus) {
        console.log(`✅ PASS: ${test.name}`);
        if (test.expectedFields) {
          test.expectedFields.forEach(field => {
            if (!(field in data)) {
              console.log(`   ⚠️  Missing field: ${field}`);
            }
          });
        }
      } else {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${status}`);
        console.log(`   Response:`, data);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test.name}`);
      console.log(`   ${error.message}`);
    }
  }
}
```

**Output:**
```
🧪 Testing Moderation API Endpoints...

✅ PASS: GET /api/moderation/queue - List pending items
✅ PASS: POST /api/moderation/queue/:id - Claim item
✅ PASS: POST /api/moderation/queue/:id - Start review
✅ PASS: POST /api/moderation/queue/:id - Approve
✅ PASS: POST /api/moderation/queue/:id - Reject (traveler cannot access)

📊 Test Summary:
- Total Tests: 5
- Passed: 5
- Failed: 0
- Errors: 0

🚀 All moderation API endpoints working correctly
```

**Use Cases:**
- Regression testing
- CI/CD integration
- API validation after changes

---

#### `test-auth-flow.js`

**Purpose:** Test authentication flow (login, register, token refresh)

**Tests:**
```javascript
const authTests = [
  {
    name: 'Register new user',
    endpoint: '/api/auth/register',
    method: 'POST',
    body: {
      email: 'newuser@test.com',
      password: 'Test123!',
      fullName: 'New User'
    },
    expectedStatus: 201,
    validateResponse: (data) => {
      return data.success && data.user && data.token;
    }
  },
  {
    name: 'Login with valid credentials',
    endpoint: '/api/auth/login',
    method: 'POST',
    body: {
      email: 'admin@test.com',
      password: 'Admin123!'
    },
    expectedStatus: 200
  },
  {
    name: 'Login with invalid password',
    endpoint: '/api/auth/login',
    method: 'POST',
    body: {
      email: 'admin@test.com',
      password: 'wrongpassword'
    },
    expectedStatus: 401
  },
  {
    name: 'Access protected endpoint with token',
    endpoint: '/api/places/my-drafts',
    method: 'GET',
    useToken: true,
    expectedStatus: 200
  },
  {
    name: 'Access protected endpoint without token',
    endpoint: '/api/places/my-drafts',
    method: 'GET',
    useToken: false,
    expectedStatus: 401
  }
];
```

**Output:**
```
🔐 Testing Authentication Flow...

✅ PASS: Register new user
✅ PASS: Login with valid credentials
✅ PASS: Login with invalid password (correctly rejected)
✅ PASS: Access protected endpoint with token
✅ PASS: Access protected endpoint without token (correctly rejected)

📊 Auth Test Summary:
- Total: 5 tests
- Passed: 5
- Failed: 0

🚀 Authentication system working correctly
```

---

### 2.5. Firebase Deployment Scripts

#### `deploy-firebase-config.js`

**Purpose:** Deploy Firestore indexes + rules

**Logic:**
```javascript
const { execSync } = require('child_process');

async function deployFirebaseConfig() {
  console.log('🚀 Deploying Firebase configuration...\n');

  try {
    // 1. Deploy Firestore rules
    console.log('📜 Deploying Firestore rules...');
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('✅ Firestore rules deployed\n');

    // 2. Deploy Firestore indexes
    console.log('🔍 Deploying Firestore indexes...');
    execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
    console.log('✅ Firestore indexes deployed\n');

    // 3. Verify deployment
    console.log('✅ Firebase configuration deployed successfully');
    console.log('\n📝 Next steps:');
    console.log('1. Wait 5-10 minutes for indexes to build');
    console.log('2. Test queries that require indexes');
    console.log('3. Check Firebase Console for index status');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}
```

**Output:**
```
🚀 Deploying Firebase configuration...

📜 Deploying Firestore rules...
=== Deploying to 'vietexplore-ai'...

i  deploying firestore
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
✔  firestore: released rules firestore.rules to cloud.firestore

✔  Deploy complete!

✅ Firestore rules deployed

🔍 Deploying Firestore indexes...
=== Deploying to 'vietexplore-ai'...

i  deploying firestore
i  firestore: reading indexes from firestore.indexes.json...
i  firestore: updating indexes...
✔  firestore: indexes deployed successfully

✔  Deploy complete!

✅ Firestore indexes deployed

✅ Firebase configuration deployed successfully

📝 Next steps:
1. Wait 5-10 minutes for indexes to build
2. Test queries that require indexes
3. Check Firebase Console for index status
```

**Use Cases:**
- Deploy after rules/indexes changes
- CI/CD deployment pipeline
- Production deployment

---

#### `check-firebase-config.js`

**Purpose:** Verify Firebase configuration (credentials, connection)

**Checks:**
```javascript
async function checkFirebaseConfig() {
  const checks = [
    {
      name: 'Environment Variables',
      test: () => {
        const requiredEnvVars = [
          'FIREBASE_PROJECT_ID',
          'FIREBASE_CLIENT_EMAIL',
          'FIREBASE_PRIVATE_KEY',
          'NEXT_PUBLIC_FIREBASE_API_KEY'
        ];

        const missing = requiredEnvVars.filter(v => !process.env[v]);

        if (missing.length > 0) {
          throw new Error(`Missing env vars: ${missing.join(', ')}`);
        }
      }
    },
    {
      name: 'Firebase Admin SDK Connection',
      test: async () => {
        const db = admin.firestore();
        await db.collection('users').limit(1).get();
      }
    },
    {
      name: 'Firestore Rules Deployed',
      test: async () => {
        // Try operation that requires rules
        const db = admin.firestore();
        await db.collection('places').where('status', '==', 'published').limit(1).get();
      }
    },
    {
      name: 'Required Indexes Exist',
      test: async () => {
        const db = admin.firestore();
        // Test compound query (requires index)
        await db.collection('moderation_queue')
          .where('status', '==', 'pending')
          .orderBy('priority', 'desc')
          .orderBy('submittedAt', 'asc')
          .limit(1)
          .get();
      }
    }
  ];

  for (const check of checks) {
    try {
      await check.test();
      console.log(`✅ ${check.name}: OK`);
    } catch (error) {
      console.log(`❌ ${check.name}: FAILED`);
      console.log(`   ${error.message}`);
    }
  }
}
```

**Output:**
```
🔍 Checking Firebase Configuration...

✅ Environment Variables: OK
✅ Firebase Admin SDK Connection: OK
✅ Firestore Rules Deployed: OK
❌ Required Indexes Exist: FAILED
   The query requires an index. You can create it here: https://console.firebase.google.com/...

📊 Summary:
- Total Checks: 4
- Passed: 3
- Failed: 1

⚠️  Action Required:
- Deploy missing indexes: firebase deploy --only firestore:indexes
```

**Use Cases:**
- Troubleshoot connection issues
- Verify deployment
- Pre-deployment checks

---

### 2.6. PWA Scripts

#### `generate-pwa-icons.js`

**Purpose:** Generate PWA icons trong tất cả sizes cần thiết

**Icon Sizes Generated:**
```javascript
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  // Maskable icons (Android adaptive)
  { size: 192, name: 'icon-maskable-192x192.png', maskable: true },
  { size: 512, name: 'icon-maskable-512x512.png', maskable: true }
];
```

**Logic:**
```javascript
const sharp = require('sharp');
const fs = require('fs');

async function generatePWAIcons() {
  const sourceImage = './public/logo-source.svg'; // Or PNG

  for (const icon of iconSizes) {
    console.log(`Generating ${icon.name}...`);

    let image = sharp(sourceImage).resize(icon.size, icon.size);

    if (icon.maskable) {
      // Add safe zone for maskable icons (80% of size)
      const safeZoneSize = Math.floor(icon.size * 0.8);
      image = image.extract({
        left: (icon.size - safeZoneSize) / 2,
        top: (icon.size - safeZoneSize) / 2,
        width: safeZoneSize,
        height: safeZoneSize
      });
    }

    await image.toFile(`./public/icons/${icon.name}`);
    console.log(`✅ Generated ${icon.name}`);
  }
}
```

**Output:**
```
🎨 Generating PWA Icons...

Generating icon-72x72.png...
✅ Generated icon-72x72.png
Generating icon-96x96.png...
✅ Generated icon-96x96.png
Generating icon-128x128.png...
✅ Generated icon-128x128.png
...
Generating icon-maskable-512x512.png...
✅ Generated icon-maskable-512x512.png

✅ Successfully generated 10 PWA icons

📁 Icons saved to: ./public/icons/

📝 Next steps:
1. Update manifest.json with icon paths
2. Test install prompt on Chrome/Android
3. Verify maskable icons on Android
```

**Use Cases:**
- Update app icon
- Add PWA support
- Generate all required sizes from source image

---

### 2.7. Team Management Scripts

#### `seed-team-members.js`

**Purpose:** Seed team/founder profiles cho /about page

**Data Structure:**
```javascript
const teamMembers = [
  {
    slug: 'nguyen-van-a',
    fullName: 'Nguyễn Văn A',
    title: 'Founder & CEO',
    bio: 'Đam mê du lịch và công nghệ, với kinh nghiệm 10+ năm trong ngành du lịch.',
    avatar: 'https://i.pravatar.cc/300?img=1',
    email: 'nguyenvana@vietexplore.ai',
    socialLinks: {
      facebook: 'https://facebook.com/nguyenvana',
      linkedin: 'https://linkedin.com/in/nguyenvana',
      twitter: 'https://twitter.com/nguyenvana'
    },
    expertise: ['Du lịch', 'Khởi nghiệp', 'AI'],
    status: 'active',
    featured: true,
    displayOrder: 1,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    slug: 'tran-thi-b',
    fullName: 'Trần Thị B',
    title: 'CTO & Co-founder',
    bio: 'Chuyên gia AI và Machine Learning, tốt nghiệp MIT.',
    avatar: 'https://i.pravatar.cc/300?img=2',
    expertise: ['AI', 'Machine Learning', 'Backend'],
    status: 'active',
    featured: true,
    displayOrder: 2
  },
  // ... more team members
];
```

**Output:**
```
👥 Seeding Team Members...

✅ Created: Nguyễn Văn A (Founder & CEO)
✅ Created: Trần Thị B (CTO & Co-founder)
✅ Created: Lê Văn C (Head of Marketing)
✅ Created: Phạm Thị D (Lead Designer)

📊 Team Summary:
- Total Members: 4
- Featured: 2
- Active: 4
- Inactive: 0

🚀 Ready to test /about page
```

**Use Cases:**
- Setup /about page
- Update team information
- Demo/screenshots

---

### 2.8. Reset & Cleanup Scripts

#### `reset-complete.js`

**Purpose:** Full project reset (xóa ALL data)

**Warning System:**
```javascript
console.log('⚠️⚠️⚠️  DANGER ZONE  ⚠️⚠️⚠️');
console.log('This will DELETE ALL DATA:');
console.log('- All users (Firebase Auth + Firestore)');
console.log('- All places (published + drafts)');
console.log('- All moderation queue items');
console.log('- All reviews and reports');
console.log('- All notifications');
console.log('- All analytics data');
console.log('\n⚠️  THIS ACTION CANNOT BE UNDONE ⚠️\n');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Double confirmation
readline.question('Type "RESET" to confirm: ', async (answer1) => {
  if (answer1 !== 'RESET') {
    console.log('❌ Operation cancelled');
    process.exit(0);
  }

  readline.question('Type your project ID to confirm: ', async (answer2) => {
    if (answer2 !== process.env.FIREBASE_PROJECT_ID) {
      console.log('❌ Project ID mismatch. Operation cancelled.');
      process.exit(0);
    }

    // Proceed with reset...
    await performFullReset();
  });
});
```

**Collections Cleared:**
```javascript
const collectionsToReset = [
  'users',
  'places',
  'placeDrafts',
  'moderation_queue',
  'moderation_logs',
  'moderation_archive',
  'place_reviews',
  'review_helpful',
  'review_reports',
  'place_reports',
  'suspension_schedules',
  'itineraries',
  'itinerary_likes',
  'itinerary_saves',
  'announcements',
  'team_members',
  'notification_history',
  'notification_stats',
  'ai_chat_logs',
  'view_cache',
  'rateLimits',
  'admin_logs',
  'audits'
];

for (const collectionName of collectionsToReset) {
  console.log(`Clearing ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  console.log(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
}
```

**Output:**
```
⚠️⚠️⚠️  DANGER ZONE  ⚠️⚠️⚠️
This will DELETE ALL DATA:
- All users (Firebase Auth + Firestore)
- All places (published + drafts)
- All moderation queue items
- All reviews and reports
- All notifications
- All analytics data

⚠️  THIS ACTION CANNOT BE UNDONE ⚠️

Type "RESET" to confirm: RESET
Type your project ID to confirm: vietexplore-ai

🚀 Starting full project reset...

Clearing users...
✅ Cleared 125 documents from users
Clearing places...
✅ Cleared 456 documents from places
Clearing placeDrafts...
✅ Cleared 89 documents from placeDrafts
...

✅ All collections cleared

Deleting Firebase Auth users...
✅ Deleted 125 users from Firebase Auth

📊 Reset Summary:
- Total documents deleted: 1,234
- Total Auth users deleted: 125
- Collections cleared: 20

🎉 Project has been completely reset
🚀 Ready for fresh setup
```

**Use Cases:**
- Start over completely
- Reset test/staging environment
- Clean up after major testing

---

## 3. Common Script Patterns

### 3.1. Firebase Admin SDK Initialization

**Pattern:**
```javascript
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();
```

### 3.2. Batch Operations

**Pattern:**
```javascript
// Efficient batch operations (max 500 operations per batch)
async function batchOperation(items, operation) {
  const batchSize = 500;
  const batches = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = db.batch();
    const chunk = items.slice(i, i + batchSize);

    chunk.forEach(item => {
      operation(batch, item);
    });

    batches.push(batch.commit());
  }

  await Promise.all(batches);
}

// Usage
await batchOperation(places, (batch, place) => {
  const docRef = db.collection('places').doc();
  batch.set(docRef, place);
});
```

### 3.3. Error Handling

**Pattern:**
```javascript
async function runScript() {
  try {
    // Script logic
    console.log('✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

runScript();
```

### 3.4. Progress Reporting

**Pattern:**
```javascript
async function seedData(items) {
  console.log(`Processing ${items.length} items...\n`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const progress = Math.floor((i / items.length) * 100);

    process.stdout.write(`\rProgress: ${progress}% [${i}/${items.length}]`);

    await processItem(item);
  }

  console.log(`\n\n✅ Completed processing ${items.length} items`);
}
```

---

## 4. Script Dependencies

### 4.1. Required Packages

**File:** `package.json`

```json
{
  "devDependencies": {
    "firebase-admin": "^12.0.0",
    "dotenv": "^16.0.3",
    "sharp": "^0.33.0",  // For image processing
    "readline": "^1.3.0" // For user prompts
  }
}
```

**Install:**
```bash
npm install firebase-admin dotenv sharp
```

### 4.2. Environment Variables Required

**File:** `.env.local`

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (for testing)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## 5. Best Practices

### 5.1. Script Safety

✅ **DO:**
- Add confirmation prompts cho destructive operations
- Double-check environment (test vs production)
- Log all operations với timestamps
- Use transactions for critical operations
- Exit with proper status codes (0 = success, 1 = error)

❌ **DON'T:**
- Run destructive scripts without confirmation
- Skip error handling
- Hardcode credentials
- Run production scripts on test data

### 5.2. Script Documentation

✅ **DO:**
- Add script description at top of file
- Include usage examples in comments
- Document parameters and options
- Provide clear output messages
- List prerequisites (packages, env vars)

**Example:**
```javascript
/**
 * Script: seed-places-vietnam.js
 * Purpose: Seed 10 real Vietnam tourist destinations to database
 * Usage: node scripts/seed-places-vietnam.js
 * Prerequisites:
 *   - Firebase Admin SDK initialized
 *   - .env.local with Firebase credentials
 *   - Empty 'places' collection (will clear existing)
 * Output: Creates 10 published places
 * Time: ~5 seconds
 */
```

### 5.3. Script Organization

**Recommended Structure:**
```
scripts/
  admin/                  # Admin-related scripts
    create-admin-user.js
    reset-vn-admin.js
  data/                   # Data seeding
    seed-places-vietnam.js
    seed-users.js
    seed-team-members.js
  testing/                # Testing scripts
    test-auth-flow.js
    test-moderation-api.js
  maintenance/            # Cleanup & fixes
    fix-stuck-approved-places.js
    cleanup-all-published-places.js
  deployment/             # Deployment tools
    deploy-firebase-config.js
    check-firebase-config.js
  utils/                  # Utility functions
    firebase-init.js      # Shared Firebase init
    batch-operations.js   # Shared batch logic
```

---

## 6. Troubleshooting

### 6.1. Common Errors

**Error 1: "Firebase Admin SDK not initialized"**

**Cause:** Missing or invalid credentials

**Solution:**
```bash
# Check .env.local exists
ls -la .env.local

# Verify required env vars
node -e "console.log(process.env.FIREBASE_PROJECT_ID)"

# Re-download service account key from Firebase Console
```

---

**Error 2: "Permission denied" when writing to Firestore**

**Cause:** Admin SDK using wrong credentials

**Solution:**
```bash
# Verify service account email
echo $FIREBASE_CLIENT_EMAIL

# Check service account has Firestore Admin role
# Firebase Console → IAM & Admin → IAM
```

---

**Error 3: "The query requires an index"**

**Cause:** Script uses compound query without index

**Solution:**
```bash
# Deploy indexes first
firebase deploy --only firestore:indexes

# Wait 5-10 minutes for indexing
# Then re-run script
```

---

**Error 4: Script hangs / doesn't exit**

**Cause:** Missing `process.exit()` or pending async operations

**Solution:**
```javascript
// Always add at end of script
try {
  await doWork();
  console.log('✅ Done');
  process.exit(0);  // ✅ Explicit exit
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);  // ✅ Exit with error code
}
```

---

### 6.2. Debugging Scripts

**Add verbose logging:**
```javascript
const DEBUG = process.env.DEBUG === 'true';

function debugLog(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

// Usage
debugLog('Processing item:', item.id);
```

**Run with debug:**
```bash
DEBUG=true node scripts/seed-places-vietnam.js
```

---

## 7. Related Documentation

**Xem thêm:**
- [03_DATABASE_SCHEMA.md](.docs/03_DATABASE_SCHEMA.md) - Firestore schema cho scripts
- [08_SECURITY_ACCESS_CONTROL.md](.docs/08_SECURITY_ACCESS_CONTROL.md) - Firebase Admin SDK setup
- [09_TESTING_INFRASTRUCTURE.md](.docs/09_TESTING_INFRASTRUCTURE.md) - Testing scripts integration

**External Resources:**
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Batch Writes](https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)

---

**Tài liệu này cung cấp đầy đủ thông tin về 29+ maintenance scripts của VietExplore-AI.**

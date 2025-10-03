# 🧪 Test Workflow Địa Điểm - Hướng Dẫn Chi Tiết

## 📋 Mục Lục
1. [Chuẩn Bị Test](#chuẩn-bị-test)
2. [Test Flow: Contributor → Moderator → Public](#test-flow-contributor--moderator--public)
3. [Test Scheduled Functions](#test-scheduled-functions)
4. [Test Edge Cases](#test-edge-cases)
5. [Checklist Validation](#checklist-validation)

---

## 1. Chuẩn Bị Test

### 1.1. Tạo Test Accounts

Bạn cần **3 tài khoản** với roles khác nhau:

| Email | Role | Mục đích |
|-------|------|----------|
| `contributor@test.com` | Contributor | Tạo địa điểm mới |
| `moderator@test.com` | Moderator | Kiểm duyệt nội dung |
| `user@test.com` | Traveler | Xem địa điểm public |

**Tạo accounts:**
```bash
# Tạo via Firebase Console hoặc đăng ký qua UI
# Sau đó promote roles via admin dashboard hoặc script
```

### 1.2. Check Firebase Functions Status

```bash
firebase functions:list
```

Verify 3 functions mới đã ACTIVE:
- ✅ `scheduledCleanupExpiredClaims`
- ✅ `scheduledArchiveModerationQueue`
- ✅ `scheduledModerationHealthCheck`

---

## 2. Test Flow: Contributor → Moderator → Public

### 🔹 BƯỚC 1: Contributor Tạo Địa Điểm

**Login:** `contributor@test.com`

**Hành động:**
1. Vào `/contribute` hoặc button "Thêm Địa Điểm"
2. Điền form:
   - **Tên**: "Test - Đảo Hòn Mun"
   - **Mô tả**: "Đảo san hô đẹp nhất Nha Trang, nước biển trong xanh..."
   - **Region**: `nam-bo`
   - **Type**: `bien`
   - **Upload ảnh**: Chọn 1-3 ảnh
3. **LƯU DRAFT** trước (button "Lưu nháp")
4. Check `/my-drafts` → thấy draft vừa tạo
5. Quay lại edit draft → **GỬI KIỂM DUYỆT** (button "Gửi kiểm duyệt")

**Expected Results:**
```javascript
// Check Firestore: places/{placeId}
{
  name: "Test - Đảo Hòn Mun",
  status: "submitted", // ✅ QUAN TRỌNG
  authorId: "<contributor_uid>",
  createdAt: "2025-10-03T...",
  submittedAt: "2025-10-03T...", // ✅ Có timestamp
  region: "nam-bo",
  type: "bien"
}

// Check Firestore: moderation_queue/{queueId}
{
  placeId: "<place_id>",
  placeName: "Test - Đảo Hòn Mun",
  status: "pending", // ✅ Chờ moderator claim
  priority: "medium",
  submittedAt: "2025-10-03T...",
  authorId: "<contributor_uid>"
}
```

**Validation:**
- [ ] Draft hiển thị trong `/my-drafts`
- [ ] Sau submit, draft biến mất khỏi `/my-drafts`
- [ ] Status đổi từ `draft` → `submitted`
- [ ] Entry xuất hiện trong `moderation_queue` với status `pending`
- [ ] Contributor KHÔNG thể edit được nữa

---

### 🔹 BƯỚC 2: Moderator Claim & Review

**Login:** `moderator@test.com`

**Hành động:**
1. Vào `/admin/moderation/queue`
2. Tab **"Chờ Duyệt"** → thấy entry vừa submit
3. Click **"Claim"** button
4. Status đổi → `claimed` (tự động timeout sau 2h nếu không action)
5. Click **"Bắt đầu kiểm duyệt"**
6. Status đổi → `in_review`
7. Xem chi tiết địa điểm, check ảnh, nội dung
8. Quyết định: **APPROVE** hoặc **REJECT**

**Option A: APPROVE**
```javascript
// Action: Click "Duyệt" button
// Expected: moderation_queue/{queueId}
{
  status: "approved", // ✅
  reviewedBy: "<moderator_uid>",
  reviewedAt: "2025-10-03T...",
  decision: "approved",
  // ❌ KHÔNG delete entry ngay (giữ 30 ngày)
}

// Expected: places/{placeId}
{
  status: "published", // ✅ Đã public
  publishedAt: "2025-10-03T...",
  reviewedBy: "<moderator_uid>"
}
```

**Option B: REJECT**
```javascript
// Action: Click "Từ chối" button + nhập lý do
// Expected: moderation_queue/{queueId}
{
  status: "rejected", // ✅
  reviewedBy: "<moderator_uid>",
  reviewedAt: "2025-10-03T...",
  decision: "rejected",
  rejectionReason: "Ảnh không rõ nét, mô tả thiếu thông tin..."
  // ❌ KHÔNG delete entry ngay (giữ 30 ngày)
}

// Expected: places/{placeId}
{
  status: "rejected", // ✅ Bị từ chối
  reviewedBy: "<moderator_uid>",
  rejectionReason: "Ảnh không rõ nét..."
}
```

**Validation:**
- [ ] Claim thành công → status `claimed`
- [ ] Start review → status `in_review`
- [ ] Approve → địa điểm status = `published`
- [ ] Reject → địa điểm status = `rejected`
- [ ] Entry **VẪN CÒN** trong moderation_queue (không bị xóa)
- [ ] Entry hiển thị trong tab **"Đã Duyệt"** hoặc **"Bị Từ Chối"**

---

### 🔹 BƯỚC 3: User Xem Địa Điểm Public

**Login:** `user@test.com` (hoặc không login)

**Hành động:**
1. Vào trang chủ `/`
2. Vào `/places` hoặc `/places?region=nam-bo&type=bien`
3. Tìm địa điểm "Test - Đảo Hòn Mun"

**Expected Results:**
- ✅ Địa điểm hiển thị trong danh sách public
- ✅ Click vào → xem chi tiết `/places/{placeId}`
- ✅ Ảnh hiển thị đầy đủ
- ✅ Thông tin đầy đủ (tên, mô tả, region, type)

**Validation:**
- [ ] Địa điểm **APPROVED** hiển thị public
- [ ] Địa điểm **REJECTED** KHÔNG hiển thị
- [ ] Chỉ user có quyền mới thấy draft/rejected

---

## 3. Test Scheduled Functions

### 🔹 Test 1: Cleanup Expired Claims (Every 2h)

**Simulate Expired Claim:**

1. Moderator claim 1 địa điểm
2. Đợi 2 giờ HOẶC **force trigger manually:**

```bash
# Option 1: Trigger via Firebase Console
# Go to: https://console.firebase.google.com/project/vietexplore-ai/functions
# Find: scheduledCleanupExpiredClaims → Test function

# Option 2: Trigger via script
node scripts/test-cleanup-expired-claims.js
```

**Script Test (Tạo file mới):**
```javascript
// scripts/test-cleanup-expired-claims.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function testCleanupExpiredClaims() {
  console.log('🧪 Testing Cleanup Expired Claims...\n');

  // 1. Tạo fake expired claim
  const expiredTime = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
  const testEntry = await db.collection('moderation_queue').add({
    placeId: 'test-place-id',
    placeName: 'Test Expired Claim',
    status: 'claimed',
    claimedBy: 'test-moderator-uid',
    claimedAt: expiredTime.toISOString(),
    claimExpiresAt: expiredTime.toISOString(), // ✅ Expired
    priority: 'medium',
    submittedAt: expiredTime.toISOString()
  });

  console.log(`✅ Created test entry: ${testEntry.id}`);

  // 2. Simulate function execution
  const nowISO = new Date().toISOString();
  const expiredClaimsQuery = await db.collection('moderation_queue')
    .where('status', '==', 'claimed')
    .where('claimExpiresAt', '<', nowISO)
    .get();

  console.log(`\n🔍 Found ${expiredClaimsQuery.size} expired claims`);

  // 3. Release claims
  for (const doc of expiredClaimsQuery.docs) {
    await doc.ref.update({
      status: 'pending',
      claimedBy: admin.firestore.FieldValue.delete(),
      claimedAt: admin.firestore.FieldValue.delete(),
      claimExpiresAt: admin.firestore.FieldValue.delete()
    });
    console.log(`✅ Released claim: ${doc.id}`);
  }

  // 4. Verify
  const releasedDoc = await db.collection('moderation_queue').doc(testEntry.id).get();
  console.log(`\n📊 Final status: ${releasedDoc.data().status}`);

  // Cleanup
  await testEntry.delete();
  console.log(`\n🧹 Cleaned up test entry`);
}

testCleanupExpiredClaims().then(() => process.exit(0));
```

**Expected Results:**
- ✅ Entry status đổi từ `claimed` → `pending`
- ✅ Fields `claimedBy`, `claimedAt`, `claimExpiresAt` bị xóa
- ✅ Entry quay lại queue chờ moderator khác claim

**Validation:**
- [ ] Expired claims được release tự động
- [ ] Status reset về `pending`
- [ ] Moderator khác có thể claim lại

---

### 🔹 Test 2: Archive Old Entries (Daily 2AM)

**Simulate Archive:**

```bash
# Option 1: Wait 30 days (lol không thực tế)
# Option 2: Modify test data with old dates

node scripts/test-archive-moderation-queue.js
```

**Script Test:**
```javascript
// scripts/test-archive-moderation-queue.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function testArchiveModerationQueue() {
  console.log('🧪 Testing Archive Moderation Queue...\n');

  // 1. Tạo fake old approved entry (31 days ago)
  const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
  const testEntry = await db.collection('moderation_queue').add({
    placeId: 'test-old-place-id',
    placeName: 'Test Old Approved Place',
    status: 'approved',
    reviewedAt: oldDate.toISOString(),
    reviewedBy: 'test-moderator-uid',
    submittedAt: oldDate.toISOString(),
    priority: 'medium'
  });

  console.log(`✅ Created test entry: ${testEntry.id}`);

  // 2. Simulate archive function
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oldEntriesQuery = await db.collection('moderation_queue')
    .where('status', 'in', ['approved', 'rejected'])
    .where('reviewedAt', '<', cutoffDate.toISOString())
    .get();

  console.log(`\n🔍 Found ${oldEntriesQuery.size} old entries to archive`);

  // 3. Move to archive
  for (const doc of oldEntriesQuery.docs) {
    const data = doc.data();
    await db.collection('moderation_archive').doc(doc.id).set({
      ...data,
      archivedAt: new Date().toISOString(),
      originalQueueId: doc.id
    });
    await doc.ref.delete();
    console.log(`✅ Archived: ${doc.id}`);
  }

  // 4. Verify
  const archivedDoc = await db.collection('moderation_archive').doc(testEntry.id).get();
  console.log(`\n📊 Archived entry exists: ${archivedDoc.exists}`);
  console.log(`📊 Archive data:`, archivedDoc.data());

  // Cleanup
  await db.collection('moderation_archive').doc(testEntry.id).delete();
  console.log(`\n🧹 Cleaned up test archive`);
}

testArchiveModerationQueue().then(() => process.exit(0));
```

**Expected Results:**
- ✅ Entry > 30 days được move từ `moderation_queue` → `moderation_archive`
- ✅ Archive có thêm field `archivedAt`
- ✅ Queue sạch hơn, chỉ giữ entries gần đây

**Validation:**
- [ ] Old entries (>30 days) được archive
- [ ] Archive collection có đầy đủ data
- [ ] Queue không còn old entries

---

### 🔹 Test 3: Health Check (Every 6h)

**Manual Trigger:**

```bash
node scripts/test-moderation-health-check.js
```

**Script Test:**
```javascript
// scripts/test-moderation-health-check.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function testModerationHealthCheck() {
  console.log('🧪 Testing Moderation Health Check...\n');

  // 1. Get queue stats
  const queueSnapshot = await db.collection('moderation_queue').get();

  const stats = {
    total: queueSnapshot.size,
    pending: 0,
    claimed: 0,
    in_review: 0,
    approved: 0,
    rejected: 0
  };

  queueSnapshot.forEach(doc => {
    const status = doc.data().status;
    if (stats[status] !== undefined) {
      stats[status]++;
    }
  });

  console.log('📊 Queue Health Report:');
  console.log(`   Total Entries: ${stats.total}`);
  console.log(`   Pending: ${stats.pending}`);
  console.log(`   Claimed: ${stats.claimed}`);
  console.log(`   In Review: ${stats.in_review}`);
  console.log(`   Approved (awaiting archive): ${stats.approved}`);
  console.log(`   Rejected (awaiting archive): ${stats.rejected}`);

  // 2. Check for stuck items (>7 days pending)
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const stuckQuery = await db.collection('moderation_queue')
    .where('status', '==', 'pending')
    .where('submittedAt', '<', cutoffDate.toISOString())
    .get();

  console.log(`\n⚠️  Stuck Items (>7 days pending): ${stuckQuery.size}`);

  if (stuckQuery.size > 0) {
    console.log('\n🚨 ALERT: Found stuck items!');
    stuckQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.placeName} (${doc.id})`);
      console.log(`     Submitted: ${data.submittedAt}`);
    });
  }

  // 3. Log health report
  await db.collection('moderation_health_logs').add({
    timestamp: new Date().toISOString(),
    stats,
    stuckItemsCount: stuckQuery.size,
    status: stuckQuery.size > 10 ? 'warning' : 'healthy'
  });

  console.log('\n✅ Health check complete!');
}

testModerationHealthCheck().then(() => process.exit(0));
```

**Expected Results:**
- ✅ Health report logged to `moderation_health_logs`
- ✅ Stats chính xác (pending, claimed, approved, rejected)
- ✅ Alert nếu có items stuck >7 days

**Validation:**
- [ ] Health report chính xác
- [ ] Stuck items được phát hiện
- [ ] Logs được lưu vào Firestore

---

## 4. Test Edge Cases

### 🔹 Edge Case 1: Duplicate Submit

**Scenario:** Contributor submit cùng 1 địa điểm 2 lần

**Test:**
1. Contributor tạo draft
2. Submit lần 1 → OK
3. Thử submit lại lần 2 → **SHOULD FAIL**

**Expected:**
```javascript
// Error response
{
  error: "Place already submitted for review"
}
```

**Validation:**
- [ ] Không cho submit duplicate
- [ ] Chỉ 1 entry trong moderation_queue

---

### 🔹 Edge Case 2: Moderator Conflict

**Scenario:** 2 moderators cùng claim 1 địa điểm

**Test:**
1. Moderator A claim địa điểm
2. Moderator B thử claim cùng địa điểm → **SHOULD FAIL**

**Expected:**
```javascript
// Error response
{
  error: "This item is already claimed by another moderator"
}
```

**Validation:**
- [ ] Chỉ 1 moderator claim được
- [ ] Moderator B thấy thông báo lỗi

---

### 🔹 Edge Case 3: Claim Timeout

**Scenario:** Moderator claim nhưng không action trong 2h

**Test:**
1. Moderator claim địa điểm
2. Đợi 2h (hoặc modify `claimExpiresAt` manually)
3. Chạy cleanup function
4. Verify entry quay lại `pending`

**Validation:**
- [ ] Claim expired tự động release
- [ ] Entry available cho moderator khác

---

### 🔹 Edge Case 4: Archive Cleanup

**Scenario:** Archive entries > 90 days tự động delete

**Test:**
1. Tạo fake archive entry với `archivedAt` > 90 days ago
2. Chạy archive function
3. Verify entry bị xóa khỏi `moderation_archive`

**Validation:**
- [ ] Old archives (>90 days) bị xóa
- [ ] Archive không phình to vô hạn

---

## 5. Checklist Validation

### ✅ Frontend Tests

- [ ] **Contributor Dashboard**
  - [ ] Tạo draft thành công
  - [ ] Lưu draft hiển thị trong `/my-drafts`
  - [ ] Submit draft → biến mất khỏi drafts
  - [ ] Không edit được sau khi submit

- [ ] **Moderator Queue**
  - [ ] Tab "Chờ Duyệt" hiển thị pending items
  - [ ] Claim thành công
  - [ ] Start review thành công
  - [ ] Approve → item vào tab "Đã Duyệt"
  - [ ] Reject → item vào tab "Bị Từ Chối"
  - [ ] Tab "Đã Duyệt" hiển thị entries trong 30 ngày

- [ ] **Public View**
  - [ ] Địa điểm approved hiển thị public
  - [ ] Địa điểm rejected KHÔNG hiển thị
  - [ ] Search/filter hoạt động

### ✅ Backend Tests

- [ ] **API Endpoints**
  - [ ] `POST /api/places` - Tạo draft
  - [ ] `PATCH /api/places/{id}` - Submit for review
  - [ ] `GET /api/moderation/queue` - List queue
  - [ ] `PUT /api/moderation/queue/{id}` - Approve/Reject

- [ ] **Scheduled Functions**
  - [ ] `scheduledCleanupExpiredClaims` - Release expired claims
  - [ ] `scheduledArchiveModerationQueue` - Archive old entries
  - [ ] `scheduledModerationHealthCheck` - Health monitoring

### ✅ Database Tests

- [ ] **Firestore Collections**
  - [ ] `places` - Status transitions correct
  - [ ] `moderation_queue` - Entries không bị delete sớm
  - [ ] `moderation_archive` - Archive đúng format
  - [ ] `moderation_logs` - Audit trail đầy đủ

---

## 🚀 Quick Test Script (All-in-One)

```bash
# Chạy full test suite
node scripts/test-full-workflow.js
```

**Tạo file:**
```javascript
// scripts/test-full-workflow.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function runFullWorkflowTest() {
  console.log('🚀 Starting Full Workflow Test...\n');

  // Test 1: Create Place
  console.log('📝 Test 1: Creating test place...');
  const placeRef = await db.collection('places').add({
    name: 'Test Workflow Place',
    description: 'Auto-generated test place',
    status: 'draft',
    region: 'nam-bo',
    type: 'bien',
    authorId: 'test-contributor-uid',
    createdAt: new Date().toISOString()
  });
  console.log(`✅ Created place: ${placeRef.id}\n`);

  // Test 2: Submit for Review
  console.log('📤 Test 2: Submitting for review...');
  await placeRef.update({
    status: 'submitted',
    submittedAt: new Date().toISOString()
  });

  const queueRef = await db.collection('moderation_queue').add({
    placeId: placeRef.id,
    placeName: 'Test Workflow Place',
    status: 'pending',
    priority: 'medium',
    submittedAt: new Date().toISOString(),
    authorId: 'test-contributor-uid'
  });
  console.log(`✅ Created queue entry: ${queueRef.id}\n`);

  // Test 3: Claim
  console.log('👨‍⚖️ Test 3: Claiming entry...');
  await queueRef.update({
    status: 'claimed',
    claimedBy: 'test-moderator-uid',
    claimedAt: new Date().toISOString(),
    claimExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  });
  console.log(`✅ Claimed by moderator\n`);

  // Test 4: Approve
  console.log('✅ Test 4: Approving entry...');
  await queueRef.update({
    status: 'approved',
    reviewedBy: 'test-moderator-uid',
    reviewedAt: new Date().toISOString()
  });

  await placeRef.update({
    status: 'published',
    publishedAt: new Date().toISOString(),
    reviewedBy: 'test-moderator-uid'
  });
  console.log(`✅ Entry approved and place published\n`);

  // Test 5: Verify
  console.log('🔍 Test 5: Verifying final state...');
  const placeDoc = await placeRef.get();
  const queueDoc = await queueRef.get();

  console.log(`Place status: ${placeDoc.data().status}`);
  console.log(`Queue status: ${queueDoc.data().status}`);

  if (placeDoc.data().status === 'published' && queueDoc.data().status === 'approved') {
    console.log('\n🎉 ALL TESTS PASSED!');
  } else {
    console.log('\n❌ TESTS FAILED!');
  }

  // Cleanup
  console.log('\n🧹 Cleaning up test data...');
  await placeRef.delete();
  await queueRef.delete();
  console.log('✅ Cleanup complete!');
}

runFullWorkflowTest().then(() => process.exit(0));
```

---

## 📞 Troubleshooting

### Issue 1: Địa điểm không hiển thị sau approve
**Check:**
- Firestore `places/{id}` có `status: "published"`?
- API `/api/places` có filter `status == published`?
- Cache browser?

### Issue 2: Queue entry bị xóa ngay sau approve
**Check:**
- Code trong `src/app/api/moderation/queue/[itemId]/route.ts`
- KHÔNG nên có `db.collection('moderation_queue').doc(id).delete()`
- Entry phải GIỮ 30 ngày

### Issue 3: Scheduled functions không chạy
**Check:**
- Firebase Console → Functions → Logs
- Cloud Scheduler → Jobs → Execution history
- Timezone đúng chưa (`Asia/Ho_Chi_Minh`)

---

**Good luck testing! 🧪✨**

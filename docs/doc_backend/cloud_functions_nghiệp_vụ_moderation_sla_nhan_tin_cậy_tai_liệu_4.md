# Cloud Functions nghiệp vụ – Moderation, SLA, Nhãn tin cậy (Tài liệu 4)

> Mục tiêu: Định nghĩa **Cloud Functions** phục vụ quy trình kiểm duyệt, gắn nhãn tin cậy và thực thi SLA, bám sát **Tài liệu 1 (Auth)**, **Tài liệu 2 (Firestore)** và **Tài liệu 3 (Storage)** cho giai đoạn 1 (Lean). Toàn bộ thao tác nhạy cảm (duyệt/publish/gắn nhãn) chỉ thực hiện qua Functions bằng **Admin SDK**.

---

## 1) Phạm vi & phụ thuộc
- **Phạm vi:** moderation queue, approve/reject/request-edit, publish place từ draft (gọi pipeline media), gắn **trustLabel**, cập nhật **counters**, thực thi **SLA** (deadline/escalation), thông báo (tùy chọn).
- **Phụ thuộc:**
  - Firestore collections: `placeDrafts`, `moderation/requests`, `places`, `audits`, `system/counters`, `labels`, `partners`, `reports`.
  - Storage buckets: theo cấu trúc ở Tài liệu 3.
  - Auth claims: `role` (traveler/contributor/partner/moderator/admin), `email_verified`.
  - App Check: bật enforcement cho Callable/HTTP (console) – khuyến nghị.

---

## 2) Quy trình nghiệp vụ (tổng quát)
1) **Submit draft** (Traveler/Contributor/Partner) → tạo/ cập nhật doc `placeDrafts/{draftId}` `status = submitted`.
2) **Tạo yêu cầu moderation**: Functions đảm bảo có 1 doc `moderation/requests/{requestId}` liên kết với draft, tính **SLA `dueAt`** theo vai trò submitter.
3) **Moderator claim & review**: moderator "nhận việc" (claim), đổi `status` của request → `in_review`.
4) **Quyết định**:
   - **Approve** → **Publish** place (tạo/sửa `places/{placeId}`), gọi **pipeline media** để move/crop/convert ảnh → update `places.photos`. Set `draft.status = published` + link `linkedPlaceId`.
   - **Request edit** → set `draft.status = changes_requested`, ghi `moderationNotes`.
   - **Reject** → set `draft.status = rejected`.
5) **Trust label**: tự động xác định theo `submitterRole` (community/contributor/partner) và có thể **nâng lên `verified`** chỉ bởi Moderator/Admin.
6) **Audit & Counters**: ghi nhật ký hành động và cập nhật `system/counters`.

---

## 3) SLA – định nghĩa & tính toán
- **Ngưỡng SLA:**
  - Community suggestion (Traveler): **≤ 5 ngày làm việc**.
  - Contributor: **≤ 3 ngày làm việc**.
  - Partner (fast‑track): **≤ 48 giờ**.
- **Trường dữ liệu SLA trong `moderation/requests`**:
```json
{
  "status": "queued|in_review|approved|rejected|returned",
  "priority": "low|normal|high",
  "submitterRole": "traveler|contributor|partner",
  "createdAt": "Timestamp",
  "dueAt": "Timestamp",     // tính theo role ở thời điểm submit
  "escalation": {
    "level": 0,              // 0=none,1=warning,2=overdue
    "lastNotifiedAt": "Timestamp|null"
  }
}
```
- **Tick SLA:** Scheduled Function (mỗi giờ) quét request `status in [queued,in_review]` và `dueAt < now()` → tăng `escalation.level`, gửi thông báo, đẩy `priority=high`.

---

## 4) Endpoint & Trigger (tổng hợp)
- **Callable (HTTPS):**
  - `submitDraftForReview(draftId)` – tạo/đồng bộ moderation request + tính SLA.
  - `modClaim(requestId)` – moderator claim.
  - `modDecisionApprove(requestId)` – approve & publish.
  - `modDecisionReject(requestId, notes)` – từ chối.
  - `modDecisionRequestEdit(requestId, notes)` – yêu cầu sửa.
  - `setTrustLabel(placeId, label)` – chỉ Moderator/Admin; label ∈ `community|contributor|partner|verified`.
- **Background (Firestore/Storage):**
  - `onPlaceDraftStatusChange` – nếu chuyển `approved/published` → chạy **media pipeline** (Tài liệu 3) và tạo/sửa place.
- **Scheduled:**
  - `slaSweepModerationHourly` – tick SLA, gửi cảnh báo/escalate.

> Gợi ý region: `asia-southeast1` (GCP Singapore) để tối ưu latency VN.

---

## 5) Mẫu triển khai (TypeScript)
### 5.1. Tạo/đồng bộ moderation request khi submit
```ts
// functions/src/moderation.submit.ts
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';

const SLA_HOURS = { traveler: 24*5, contributor: 24*3, partner: 48 };

export const submitDraftForReview = onCall({ region: 'asia-southeast1' }, async (req) => {
  const caller = req.auth;
  if (!caller || caller.token.email_verified !== true) throw new Error('AUTH_REQUIRED');

  const { draftId } = req.data;
  const db = admin.firestore();
  const draftRef = db.doc(`placeDrafts/${draftId}`);
  const snap = await draftRef.get();
  if (!snap.exists) throw new Error('DRAFT_NOT_FOUND');

  const draft = snap.data()!;
  if (draft.submitter !== caller.uid) throw new Error('NOT_OWNER');

  const role = (caller.token.role || 'traveler') as 'traveler'|'contributor'|'partner';
  const dueAt = admin.firestore.Timestamp.fromMillis(Date.now() + SLA_HOURS[role]*60*60*1000);

  await db.runTransaction(async (tx) => {
    const d = (await tx.get(draftRef)).data()!;
    if (!['draft','changes_requested'].includes(d.status)) throw new Error('INVALID_STATUS');

    tx.update(draftRef, { status: 'submitted', updatedAt: admin.firestore.FieldValue.serverTimestamp(), submitterRole: role });

    const reqRef = db.collection('moderation').doc('requests').collection('requests').doc();
    tx.set(reqRef, {
      ref: { collection: 'placeDrafts', id: draftId },
      priority: role === 'partner' ? 'high' : 'normal',
      submitter: caller.uid,
      submitterRole: role,
      moderator: null,
      status: 'queued',
      decisionNotes: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      dueAt,
      escalation: { level: 0, lastNotifiedAt: null }
    });
  });

  return { ok: true };
});
```

### 5.2. Moderator claim & approve/reject/request-edit
```ts
// functions/src/moderation.actions.ts
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';

function assertModerator(auth?: any) {
  if (!auth || !['moderator','admin'].includes(auth.token.role)) throw new Error('MODERATOR_ONLY');
}

export const modClaim = onCall({ region: 'asia-southeast1' }, async (req) => {
  assertModerator(req.auth);
  const { requestId } = req.data;
  const db = admin.firestore();
  const ref = db.doc(`moderation/requests/${requestId}`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error('REQUEST_NOT_FOUND');
    const r = snap.data()!;
    if (r.status !== 'queued') throw new Error('CANNOT_CLAIM');
    tx.update(ref, { status: 'in_review', moderator: req.auth!.uid, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

export const modDecisionApprove = onCall({ region: 'asia-southeast1', timeoutSeconds: 540 }, async (req) => {
  assertModerator(req.auth);
  const { requestId } = req.data;
  const db = admin.firestore();
  const reqRef = db.doc(`moderation/requests/${requestId}`);

  await db.runTransaction(async (tx) => {
    const rs = await tx.get(reqRef);
    if (!rs.exists) throw new Error('REQUEST_NOT_FOUND');
    const r = rs.data()!;
    if (!['in_review','queued'].includes(r.status)) throw new Error('INVALID_STATUS');

    // Lấy draft
    const draftRef = db.doc(`${r.ref.collection}/${r.ref.id}`);
    const ds = await tx.get(draftRef);
    const draft = ds.data()!;

    // Đánh dấu approved trước, để trigger pipeline onDraftApproved
    tx.update(draftRef, { status: 'approved', moderationNotes: null, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    tx.update(reqRef, { status: 'approved', updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    // Audit
    const audit = db.collection('audits').doc();
    tx.set(audit, { actor: { uid: req.auth!.uid, role: req.auth!.token.role }, action: 'publish', target: { collection: 'placeDrafts', id: draftRef.id }, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });

  // Lưu ý: publish place + xử lý media sẽ được thực hiện ở trigger onDraftApproved (Tài liệu 3)
  return { ok: true };
});

export const modDecisionReject = onCall({ region: 'asia-southeast1' }, async (req) => {
  assertModerator(req.auth);
  const { requestId, notes } = req.data;
  const db = admin.firestore();
  const ref = db.doc(`moderation/requests/${requestId}`);

  await db.runTransaction(async (tx) => {
    const rs = await tx.get(ref);
    if (!rs.exists) throw new Error('REQUEST_NOT_FOUND');
    const r = rs.data()!;
    if (!['in_review','queued'].includes(r.status)) throw new Error('INVALID_STATUS');

    const draftRef = db.doc(`${r.ref.collection}/${r.ref.id}`);
    tx.update(draftRef, { status: 'rejected', moderationNotes: notes || null, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    tx.update(ref, { status: 'rejected', decisionNotes: notes || null, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

export const modDecisionRequestEdit = onCall({ region: 'asia-southeast1' }, async (req) => {
  assertModerator(req.auth);
  const { requestId, notes } = req.data;
  const db = admin.firestore();
  const ref = db.doc(`moderation/requests/${requestId}`);

  await db.runTransaction(async (tx) => {
    const rs = await tx.get(ref);
    if (!rs.exists) throw new Error('REQUEST_NOT_FOUND');
    const r = rs.data()!;
    if (!['in_review','queued'].includes(r.status)) throw new Error('INVALID_STATUS');

    const draftRef = db.doc(`${r.ref.collection}/${r.ref.id}`);
    tx.update(draftRef, { status: 'changes_requested', moderationNotes: notes || null, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    tx.update(ref, { status: 'returned', decisionNotes: notes || null, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true };
});
```

### 5.3. Gắn nhãn tin cậy (trustLabel)
```ts
// functions/src/trustLabel.ts
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';

const VALID = ['community','contributor','partner','verified'] as const;

type Label = typeof VALID[number];

function assertMod(auth?: any) {
  if (!auth || !['moderator','admin'].includes(auth.token.role)) throw new Error('MODERATOR_ONLY');
}

export const setTrustLabel = onCall({ region: 'asia-southeast1' }, async (req) => {
  assertMod(req.auth);
  const { placeId, label } = req.data as { placeId: string; label: Label };
  if (!VALID.includes(label)) throw new Error('INVALID_LABEL');
  const db = admin.firestore();
  await db.doc(`places/${placeId}`).update({ trustLabel: label, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  await db.collection('audits').add({ actor: { uid: req.auth!.uid, role: req.auth!.token.role }, action: 'update', target: { collection: 'places', id: placeId }, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true };
});
```

> **Mặc định khi publish**: nếu `submitterRole` là `partner` → `trustLabel='partner'`; `contributor` → `contributor`; `traveler` → `community`. Label `verified` **chỉ thiết lập thủ công** bởi Moderator/Admin sau hậu kiểm.

### 5.4. Trigger SLA định kỳ
```ts
// functions/src/sla.sweep.ts
import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const slaSweepModerationHourly = onSchedule({ schedule: 'every 60 minutes', region: 'asia-southeast1', timeZone: 'Asia/Ho_Chi_Minh' }, async () => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  const q = db.collection('moderation').doc('requests').collection('requests')
    .where('status','in',['queued','in_review'])
    .where('dueAt','<', now);
  const snap = await q.get();
  const batch = db.batch();
  snap.forEach((doc) => {
    const r = doc.data();
    const level = (r.escalation?.level ?? 0) + 1;
    batch.update(doc.ref, { priority: 'high', 'escalation.level': level, 'escalation.lastNotifiedAt': admin.firestore.FieldValue.serverTimestamp() });
  });
  await batch.commit();

  // TODO: gửi thông báo (email/Slack/FCM) cho moderator/admin danh sách quá hạn
});
```

---

## 6) Tích hợp pipeline media khi approve
- **onDraftApproved** (đã mô tả trong Tài liệu 3) chịu trách nhiệm:
  - Copy ảnh từ `drafts/` → `places/{placeId}/orig`.
  - Sinh biến thể WebP `thumb/md/lg` vào `places/{placeId}/web/...`.
  - Cập nhật `places/{placeId}.photos[]`.
- Có thể gọi như **module nội bộ** từ `modDecisionApprove` hoặc để **trigger Firestore** bắt sự kiện `draft.status='approved'` – khuyến nghị cách 2 để tách biệt trách nhiệm.

---

## 7) Cập nhật counters & audit
- Mỗi khi publish/hide place:
  - Tăng/giảm `system/counters/places_published`.
  - Ghi `audits` (actor, action, target, timestamp).
- Mỗi thay đổi trustLabel cũng ghi `audits`.

---

## 8) Xử lý báo cáo vi phạm (rút gọn)
- Callable `modResolveReport(reportId, action)` – chỉ Moderator/Admin:
  - `action='hide_place'` → set `places/{id}.status='hidden'` + audit.
  - `action='dismiss'` → set `reports/{id}.status='dismissed'`.
  - SLA tiếp nhận 24–48 giờ có thể đưa vào `slaSweepModerationHourly` hoặc 1 scheduled riêng.

---

## 9) Bảo mật & an toàn
- **Chỉ callable từ client** có **Auth + email_verified**; route moderator yêu cầu `role in [moderator,admin]`.
- Bật **App Check enforcement** cho Functions.
- Dùng **Firestore transaction** để tránh đua trạng thái (double approve).
- **Idempotency**: luồng publish kiểm tra nếu `linkedPlaceId` đã tồn tại thì không tạo thêm.
- **Logging**: sử dụng Cloud Logging + cấu trúc log (requestId, actor, action).

---

## 10) Cấu hình triển khai
- Region: `asia-southeast1`.
- Runtime: Node.js 18+.  
- Timeout: `modDecisionApprove` 540s (do xử lý media).  
- Memory: 1–2 GB cho hàm xử lý ảnh; còn lại 256–512 MB.  
- Min instances: 0 (tiết kiệm), có thể 1 cho hàm nặng nếu cần warm.

---

## 11) Kiểm thử & emulators
- Dùng **Firebase Emulators** (Auth, Firestore, Storage, Functions) để test E2E:
  - Tạo draft → submit callable → request xuất hiện.
  - Claim → approve → check place được tạo + ảnh sinh biến thể.
  - SLA sweep → request quá hạn tăng priority.
- Viết test bằng **Jest/Vitest** gọi trực tiếp các callable với mock auth claims.

---

## 12) Checklist triển khai
- [ ] Bật App Check cho Functions (enforce).  
- [ ] Tạo callable: `submitDraftForReview`, `modClaim`, `modDecisionApprove/Reject/RequestEdit`, `setTrustLabel`.  
- [ ] Tạo scheduled: `slaSweepModerationHourly`.  
- [ ] Kết nối trigger `onDraftApproved` (Tài liệu 3).  
- [ ] Ghi `audits` & cập nhật `system/counters`.  
- [ ] Test transaction & idempotency (không double publish).  

---

✅ Tài liệu này đồng bộ với các phần trước: **submit → moderation → approve → publish (media pipeline) → trustLabel**; có **SLA** thực thi bằng scheduled function; mọi thao tác nhạy cảm đi qua **Cloud Functions** để đảm bảo an toàn & minh bạch cho dự án phi lợi nhuận "Du Lịch Việt".


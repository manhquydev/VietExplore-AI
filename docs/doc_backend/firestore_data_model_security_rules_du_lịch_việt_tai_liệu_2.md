# Firestore Data Model & Security Rules – Du Lịch Việt (Tài liệu 2)

> Mục tiêu: Định nghĩa **schema dữ liệu Firestore** và **Security Rules** cho giai đoạn 1 (Lean). Bám sát mô hình vai trò: Guest · Traveler · Contributor · Community Partner · Moderator · Admin. Tài liệu này **tách riêng** khỏi Auth/Storage/Functions.

---

## 1) Tổng quan kiến trúc dữ liệu (Giai đoạn 1)
- Cơ chế: **Cloud Firestore (Native mode)**.
- Kiểu truy cập: Web SPA với Firebase v9.
- Phân tách dữ liệu theo nhóm chức năng: người dùng, địa điểm, lịch trình, đóng góp, kiểm duyệt, đối tác, báo cáo, hệ thống.

### 1.1. Collections chính
```
users/{uid}
places/{placeId}
placeDrafts/{draftId}
itineraries/{itineraryId}
itineraryShares/{shareId}
suggestions/{suggestionId}
reports/{reportId}
partners/{partnerId}
moderation/requests/{requestId}
labels/{labelId}
audits/{auditId}
system/counters/{counterId}
```
> Giai đoạn 1 giữ tối giản, nhưng đủ cho quy trình: tạo draft → nộp duyệt → moderator duyệt → publish.

---

## 2) Schema chi tiết theo collection
### 2.1. users/{uid}
```json
{
  "email": "string",
  "displayName": "string",
  "photoURL": "string|null",
  "role": "traveler|contributor|partner|moderator|admin",
  "verifiedContributor": true|false,
  "partnerId": "string|null",
  "disabled": true|false,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```
**Quy tắc:**
- Người dùng **chỉ được sửa** một số trường cá nhân (displayName, photoURL).  
- Trường `role`, `verifiedContributor`, `partnerId`, `disabled` **chỉ Admin viết** (qua Cloud Function).

---

### 2.2. places/{placeId}
```json
{
  "name": "string",                // 50-120 ký tự
  "slug": "string",                // không dấu, duy nhất
  "region": "bac-bo|trung-bo|nam-bo",
  "province": "string",            // ví dụ: "ha-noi"
  "type": "bien|nui|van-hoa|am-thuc|check-in",
  "description": "string",         // 100-1200 từ (lean: 80-400 từ)
  "photos": [
    { "path": "string", "width": 0, "height": 0, "credit": "string" }
  ],                                   // 3–5 ảnh
  "sources": ["string"],            // link/nguồn tham khảo
  "trustLabel": "community|contributor|partner|verified",
  "createdBy": "uid",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp",
  "status": "published|hidden"
}
```
**Nguồn tạo:** Moderator/Functions publish từ draft hoặc Partner fast‑track (nhưng vẫn hậu kiểm).  
**Ràng buộc:** `slug` duy nhất (đảm bảo bằng index + check ở Functions).

---

### 2.3. placeDrafts/{draftId}
```json
{
  "title": "string",             // dùng để gợi ý slug
  "region": "bac-bo|trung-bo|nam-bo",
  "province": "string",
  "type": "bien|nui|van-hoa|am-thuc|check-in",
  "description": "string",
  "photos": [
    { "path": "string", "width": 0, "height": 0, "credit": "string" }
  ],
  "sources": ["string"],
  "submitter": "uid",
  "submitterRole": "traveler|contributor|partner",
  "status": "draft|submitted|in_review|changes_requested|approved|published|rejected",
  "linkedPlaceId": "string|null",   // nếu đã publish
  "moderationNotes": "string|null",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```
**Luồng:** Traveler/Contributor/Partner tạo → Submit → Moderator xử lý trong `moderation/requests` → publish.

---

### 2.4. itineraries/{itineraryId}
```json
{
  "ownerId": "uid",
  "title": "string",
  "days": [
    { "date": "string|ISO", "stops": [{ "placeId": "string", "time": "HH:mm" }] }
  ],
  "budgetEstimate": 0,
  "visibility": "private|public",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```
**Ghi chú:** Lưu **tối giản** cho MVP; chi tiết di chuyển/phí có thể thêm sau.

---

### 2.5. itineraryShares/{shareId}
```json
{
  "itineraryId": "string",
  "token": "string",       // mã ngắn cho link chia sẻ
  "expiresAt": "Timestamp|null"
}
```

---

### 2.6. suggestions/{suggestionId} (đề xuất chỉnh sửa Place)
```json
{
  "placeId": "string",
  "proposed": { "description": "string", "sources": ["string"], "photos": [ {"path": "string"} ] },
  "submitter": "uid",
  "status": "submitted|in_review|approved|rejected",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

### 2.7. reports/{reportId}
```json
{
  "target": { "type": "place|itinerary|comment", "id": "string" },
  "reason": "string",
  "evidence": ["storagePath"],
  "reporter": "uid|null",          // Guest có thể ẩn danh → null
  "status": "received|processing|resolved|dismissed",
  "handledBy": "uid|null",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

### 2.8. partners/{partnerId}
```json
{
  "name": "string",
  "slug": "string",
  "contact": { "email": "string", "phone": "string" },
  "authorizedSubmitters": ["uid"],
  "scope": ["province/ha-noi", "type/van-hoa"],
  "status": "active|suspended",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

### 2.9. moderation/requests/{requestId}
```json
{
  "ref": { "collection": "placeDrafts|suggestions", "id": "string" },
  "priority": "low|normal|high",
  "submitter": "uid",
  "submitterRole": "traveler|contributor|partner",
  "moderator": "uid|null",
  "status": "queued|in_review|approved|rejected|returned",
  "decisionNotes": "string|null",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

### 2.10. labels/{labelId}
```json
{
  "key": "verified|partner|contributor|community",
  "displayName": "string",
  "color": "#hex"
}
```

---

### 2.11. audits/{auditId}
```json
{
  "actor": { "uid": "string", "role": "string" },
  "action": "create|update|delete|publish|hide|grantRole",
  "target": { "collection": "string", "id": "string" },
  "diff": { "before": {}, "after": {} },
  "createdAt": "Timestamp"
}
```

---

### 2.12. system/counters/{counterId}
```json
{
  "key": "places_published|itineraries_public|reports_open",
  "value": 0,
  "updatedAt": "Timestamp"
}
```
> Counter cập nhật bằng Cloud Functions để tránh tranh chấp ghi.

---

## 3) Security Rules – Nguyên tắc chung
- Chỉ **đọc công khai** cho nội dung `published/public`.
- Ghi/đọc riêng tư theo **vai trò** (custom claims) và **sở hữu**.
- **Email đã xác minh** bắt buộc cho bất kỳ tác vụ write.
- Mọi hành động nhạy cảm (nâng quyền, publish) không làm từ client; thực hiện qua **Cloud Functions**.

### 3.1. Helpers (Rules functions)
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function emailVerified() { return isSignedIn() && request.auth.token.email_verified == true; }
    function role() { return isSignedIn() ? request.auth.token.role : null; }
    function hasRole(r) { return role() == r; }
    function isAdmin() { return role() == 'admin'; }
    function isModerator() { return role() == 'moderator'; }
    function isContributor() { return role() == 'contributor'; }
    function isPartner() { return role() == 'partner'; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
    function nowTs() { return request.time; }
  
    // Validators
    function isNonEmptyString(f) { return f is string && f.size() > 0 && f.size() <= 20000; }
    function isSlug(s) { return s is string && s.size() > 0 && s.size() <= 120 && s.matches("^[a-z0-9-]+$"); }
  
    // Default deny; matches go below
  
    /* Matches go here */
  }
}
```

---

## 4) Rules theo collection
### 4.1. users
```rules
match /users/{uid} {
  allow read: if isOwner(uid) || isModerator() || isAdmin();
  allow update: if isOwner(uid) && emailVerified() &&
    request.resource.data.diff(resource.data).changedKeys().hasOnly(['displayName','photoURL','updatedAt']);
  allow create, delete: if false; // chỉ qua Functions
}
```

### 4.2. places (công khai khi published)
```rules
match /places/{placeId} {
  allow read: if resource.data.status == 'published';
  allow list: if true; // vẫn chỉ trả published vì read filter
  allow create, update, delete: if false; // publish qua Functions/Moderator
}
```

### 4.3. placeDrafts
```rules
match /placeDrafts/{draftId} {
  allow read: if isOwner(resource.data.submitter) || isModerator() || isAdmin();
  allow create: if emailVerified() && (isContributor() || hasRole('traveler') || isPartner());
  allow update: if emailVerified() && (
    isOwner(resource.data.submitter) && resource.data.status in ['draft','changes_requested']
    || isModerator()
  );
  allow delete: if isOwner(resource.data.submitter) && resource.data.status == 'draft' || isAdmin();

  // Ràng buộc trường tối thiểu
  allow create, update: if request.resource.data.keys().hasAll(['title','region','province','type','description','sources','submitter','status'])
    && isNonEmptyString(request.resource.data.title)
    && request.resource.data.region in ['bac-bo','trung-bo','nam-bo']
    && request.resource.data.type in ['bien','nui','van-hoa','am-thuc','check-in']
    && request.resource.data.sources.size() > 0;
}
```

### 4.4. suggestions (đề xuất chỉnh sửa)
```rules
match /suggestions/{id} {
  allow read: if isOwner(resource.data.submitter) || isModerator() || isAdmin();
  allow create: if emailVerified();
  allow update: if emailVerified() && (isOwner(resource.data.submitter) && resource.data.status == 'submitted' || isModerator());
}
```

### 4.5. itineraries
```rules
match /itineraries/{itineraryId} {
  allow read: if resource.data.visibility == 'public' || isOwner(resource.data.ownerId) || isModerator() || isAdmin();
  allow create: if emailVerified();
  allow update, delete: if emailVerified() && isOwner(resource.data.ownerId);
}
```

### 4.6. itineraryShares
```rules
match /itineraryShares/{shareId} {
  allow read: if true; // public link resolver
  allow create: if emailVerified() && isOwner(get(/databases/$(database)/documents/itineraries/$(request.resource.data.itineraryId)).data.ownerId);
  allow delete: if emailVerified() && isOwner(get(/databases/$(database)/documents/itineraries/$(resource.data.itineraryId)).data.ownerId);
}
```

### 4.7. reports
```rules
match /reports/{reportId} {
  allow create: if true; // cho phép guest gửi (reporter có thể null)
  allow read: if isModerator() || isAdmin() || (isSignedIn() && isOwner(resource.data.reporter));
  allow update: if isModerator() || isAdmin();
}
```

### 4.8. partners
```rules
match /partners/{partnerId} {
  allow read: if true;
  allow create, update, delete: if isAdmin();
}
```

### 4.9. moderation/requests
```rules
match /moderation/requests/{requestId} {
  allow read, create, update: if isModerator() || isAdmin();
}
```

### 4.10. labels, audits, system
```rules
match /labels/{id} { allow read: if true; allow write: if isAdmin(); }
match /audits/{id} { allow read: if isModerator() || isAdmin(); allow write: if isAdmin(); }
match /system/counters/{id} { allow read: if true; allow write: if isAdmin(); }
```

---

## 5) Indexes khuyến nghị (Composite)
Tạo trong **Firestore Indexes** để tối ưu truy vấn thường dùng:
1. `places` by `region ASC, province ASC, type ASC, status ASC` (filter listing).
2. `placeDrafts` by `submitter ASC, status ASC, updatedAt DESC` (trang "Bản nháp của tôi").
3. `moderation/requests` by `status ASC, priority DESC, createdAt DESC` (hàng đợi duyệt).
4. `itineraries` by `ownerId ASC, updatedAt DESC` ("Lịch trình của tôi").

Ví dụ cấu hình JSON (trích):
```json
{
  "indexes": [
    {
      "collectionGroup": "places",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "region", "order": "ASCENDING"},
        {"fieldPath": "province", "order": "ASCENDING"},
        {"fieldPath": "type", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"}
      ]
    }
  ]
}
```

---

## 6) Pattern triển khai (gợi ý)
- **Write nhạy cảm** (publish place, gán nhãn, nâng quyền): gọi **Cloud Functions (Callable/HTTP)** từ client → Functions thực hiện validate bổ sung (slug unique, sanitize) → ghi vào Firestore.
- **Audit trail**: mỗi thay đổi quan trọng Functions ghi 1 doc vào `audits`.
- **Counters**: cập nhật qua Functions (avoid contention).

---

## 7) Checklist áp dụng Rules
- [ ] Bật **Email Verification bắt buộc** trước khi write (đã dùng trong rules).
- [ ] Test vai trò: traveler/contributor/partner/moderator/admin với custom claims khác nhau.
- [ ] Kiểm thử luồng: tạo draft → submit → moderator approve → publish.
- [ ] Kiểm thử read public vs private (itinerary visibility, reports).
- [ ] Thiết lập composite indexes như khuyến nghị.

---

## 8) Ví dụ truy vấn (Client)
```ts
// List places theo vùng/tỉnh/loại + status=published
const q = query(
  collection(db, 'places'),
  where('region','==','bac-bo'),
  where('province','==','ha-noi'),
  where('type','==','van-hoa'),
  where('status','==','published')
);

// Drafts của tôi
const q2 = query(
  collection(db, 'placeDrafts'),
  where('submitter','==', auth.currentUser.uid),
  orderBy('updatedAt','desc')
);
```

---

## 9) Lưu ý mở rộng giai đoạn 2
- Thêm trường nâng cao cho `places` (mùa đẹp, tiện ích, mức độ đông đúc…).
- Thêm `events` (lễ hội theo lịch) và quan hệ Place ↔ Event.
- Cho phép `partner` được **ủy quyền publish có điều kiện** (post‑audit) → cần rule/Function riêng.

---

✅ Tài liệu này cung cấp **mô hình dữ liệu và security rules** tối giản nhưng đủ chặt cho giai đoạn 1, bám sát quy trình cộng đồng và kiểm duyệt của “Du Lịch Việt”.


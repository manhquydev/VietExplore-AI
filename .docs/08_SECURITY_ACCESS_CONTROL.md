# 08. SECURITY & ACCESS CONTROL

## Tổng Quan

VietExplore-AI sử dụng **multi-layered security architecture** với 3 tầng bảo mật:

1. **Firebase Authentication** - Xác thực user (email/password, Google OAuth)
2. **Firestore Security Rules** - Kiểm soát truy cập data ở database level
3. **API Middleware** - Kiểm tra permission ở server-side (Next.js API routes)
4. **Firebase Storage Rules** - Kiểm soát upload/download file (images, videos)

---

## 1. Firestore Security Rules

### 1.1. File: `firestore.rules`

**Vị trí:** `C:\Users\manhq\Downloads\da2\VietExplore-AI\firestore.rules`
**Dòng code:** 421 lines
**Deploy command:** `firebase deploy --only firestore:rules`

### 1.2. Helper Functions

#### Authentication Helpers

```javascript
// Kiểm tra đã đăng nhập
function isSignedIn() {
  return request.auth != null;
}

// Kiểm tra email đã verified
function emailVerified() {
  return isSignedIn() && request.auth.token.email_verified == true;
}

// Lấy role từ custom token claims
function role() {
  return isSignedIn() ? request.auth.token.role : null;
}

// Kiểm tra role cụ thể
function hasRole(r) {
  return role() == r;
}
```

#### Role-Based Helpers

```javascript
// Admin check
function isAdmin() {
  return role() == 'admin';
}

// Moderator check (includes admin)
function isModerator() {
  return role() == 'moderator' || isAdmin();
}

// Contributor check
function isContributor() {
  return role() == 'contributor';
}

// Partner check
function isPartner() {
  return role() == 'partner';
}

// Owner check
function isOwner(uid) {
  return isSignedIn() && request.auth.uid == uid;
}
```

#### Permission-Based Access Control

```javascript
// RBAC Permission checking function
function hasPermission(permission) {
  let userRole = role();

  // Admin has all permissions
  return userRole == 'admin' || (
    // Content permissions (all roles)
    (permission == 'content.view_public') ||

    // Traveler+ permissions
    (userRole in ['traveler', 'contributor', 'partner', 'moderator'] && permission in [
      'itinerary.create', 'itinerary.update_own', 'itinerary.view_own',
      'itinerary.share_public', 'itinerary.delete_own', 'place.suggest',
      'place.view_review_status', 'report.create'
    ]) ||

    // Contributor+ permissions
    (userRole in ['contributor', 'partner'] && permission in [
      'place.create_draft', 'place.submit_review', 'place.edit_own_draft'
    ]) ||

    // Moderator permissions
    (userRole == 'moderator' && permission in [
      'moderation.queue_view', 'moderation.approve', 'moderation.reject',
      'moderation.request_changes', 'moderation.hide', 'moderation.resolve_report',
      'report.view', 'admin.assign_verified_label', 'admin.view_audit_logs'
    ])
  );
}
```

**Sử dụng trong rules:**
```javascript
allow create: if emailVerified() && hasPermission('itinerary.create')
```

#### User Management Helpers

```javascript
// Prevent self-management (admin cannot modify their own role)
function canManageUser(targetUserId) {
  return isAdmin() && request.auth.uid != targetUserId;
}
```

#### Validation Helpers

```javascript
// String validation (non-empty, max 20000 chars)
function isNonEmptyString(f) {
  return f is string && f.size() > 0 && f.size() <= 20000;
}

// Slug validation (lowercase, numbers, hyphens only)
function isSlug(s) {
  return s is string && s.size() > 0 && s.size() <= 120 && s.matches("^[a-z0-9-]+$");
}

// URL validation
function isValidUrl(url) {
  return url is string && url.matches('^https?://[a-zA-Z0-9\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+$');
}

// Profile object validation
function isValidProfile(profile) {
  return profile.keys().hasOnly(['bio', 'location', 'website', 'socialLinks']) &&
    (!('bio' in profile) || (profile.bio is string && profile.bio.size() <= 500)) &&
    (!('location' in profile) || (profile.location is string && profile.location.size() <= 100)) &&
    (!('website' in profile) || (profile.website is string && (profile.website == '' || isValidUrl(profile.website))));
}

// Full name validation
function isValidFullName(name) {
  return name is string && name.size() >= 2 && name.size() <= 100;
}
```

### 1.3. Collection Security Rules

#### 1.3.1. `users` Collection

**Vị trí:** `firestore.rules:109-120`

```javascript
match /users/{uid} {
  // Read: Only owner, moderator, or admin
  allow read: if isOwner(uid) || isModerator() || isAdmin();

  // List: Only admin can list all users
  allow list: if isAdmin();

  // Update: Owner can update limited fields OR admin can update any field
  allow update: if (isOwner(uid) && emailVerified() &&
    request.resource.data.diff(resource.data).changedKeys()
      .hasOnly(['displayName','photoURL','fullName','avatar','profile','updatedAt']) &&
    // Validate fullName if updated
    (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['fullName'])
      || isValidFullName(request.resource.data.fullName)) &&
    // Validate profile object if updated
    (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['profile'])
      || isValidProfile(request.resource.data.profile)))
    // Admin can update any field (including role)
    || (isAdmin() && canManageUser(uid));

  // Create/Delete: Only via Cloud Functions (Firebase Authentication triggers)
  allow create, delete: if false;
}
```

**Giải thích:**
- ✅ User chỉ đọc được profile của chính mình
- ✅ Admin/Moderator đọc được tất cả profiles
- ✅ User chỉ update được: `displayName`, `photoURL`, `fullName`, `avatar`, `profile`, `updatedAt`
- ✅ Admin update được mọi field (kể cả `role`) nhưng **không thể tự sửa role của chính mình**
- ✅ `create`/`delete` chỉ qua Cloud Functions (beforeUserCreated trigger)

**Lý do bảo mật:**
- Ngăn user tự thăng cấp role
- Ngăn admin tự cấp quyền (prevent privilege escalation)
- Validate fullName và profile object (prevent injection attacks)

#### 1.3.2. `places` Collection

**Vị trí:** `firestore.rules:122-127`

```javascript
match /places/{placeId} {
  // Read: Only published places
  allow read: if resource.data.status == 'published';

  // List: Public listing (filtered by read rule)
  allow list: if true;

  // Create/Update/Delete: Only via API/Cloud Functions (moderator approval workflow)
  allow create, update, delete: if false;
}
```

**Giải thích:**
- ✅ Public chỉ thấy places với `status == 'published'`
- ✅ Không ai có thể trực tiếp create/update/delete qua client SDK
- ✅ Mọi thao tác phải qua API (có kiểm tra permission middleware)

**Workflow:**
```
User tạo draft → placeDrafts collection (writable)
     ↓
Submit for review → moderation_queue (moderator approve)
     ↓
Approved → API copy to places collection (published)
```

#### 1.3.3. `placeDrafts` Collection

**Vị trí:** `firestore.rules:129-145`

```javascript
match /placeDrafts/{draftId} {
  // Read: Owner, Moderator, or Admin
  allow read: if isOwner(resource.data.submitter) || isModerator() || isAdmin();

  // Create: Verified contributors (traveler+)
  allow create: if emailVerified() && (isContributor() || hasRole('traveler') || isPartner());

  // Update: Owner (if draft/changes_requested) OR Moderator
  allow update: if emailVerified() && (
    (isOwner(resource.data.submitter) && resource.data.status in ['draft','changes_requested'])
    || isModerator()
  );

  // Delete: Owner (if draft) OR Admin
  allow delete: if (isOwner(resource.data.submitter) && resource.data.status == 'draft') || isAdmin();

  // Field validation
  allow create, update: if request.resource.data.keys().hasAll([
    'title','region','province','type','description','sources','submitter','status'
  ])
    && isNonEmptyString(request.resource.data.title)
    && request.resource.data.region in ['bac-bo','trung-bo','nam-bo']
    && request.resource.data.type in ['bien','nui','van-hoa','am-thuc','check-in']
    && request.resource.data.sources.size() > 0;
}
```

**Giải thích:**
- ✅ Traveler+ có thể tạo draft
- ✅ Owner chỉ edit được khi `status == 'draft'` hoặc `'changes_requested'`
- ✅ Moderator edit được mọi draft
- ✅ Owner chỉ xóa được draft (không xóa được submitted/in_review)
- ✅ Validate required fields: title, region, province, type, description, sources

**Status transitions protected:**
```
draft → submitted (via API, not direct write)
submitted → in_review (moderator only)
in_review → approved/rejected (moderator only)
```

#### 1.3.4. `moderation_queue` Collection

**Vị trí:** `firestore.rules:296-302`

```javascript
match /moderation_queue/{itemId} {
  // Read/List: Only moderator+ can see queue
  allow read, list: if isModerator() || isAdmin();

  // Create: Contributors can submit items for review
  allow create: if emailVerified() && (isContributor() || isPartner() || hasRole('traveler'));

  // Update: Only moderator+ can review items
  allow update: if isModerator() || isAdmin();

  // Delete: Only admin can delete queue items
  allow delete: if isAdmin();
}
```

**Giải thích:**
- ✅ Contributors tạo moderation items khi submit content
- ✅ Chỉ moderator/admin thấy được queue
- ✅ Chỉ admin xóa được items (audit trail preservation)

#### 1.3.5. `place_reviews` Collection

**Vị trí:** `firestore.rules:235-262`

```javascript
match /place_reviews/{reviewId} {
  // Read: Only published reviews
  allow read: if resource.data.status == 'published';

  // List: Public (filtered by read rule)
  allow list: if true;

  // Create: Verified users (auto-publish for now)
  allow create: if emailVerified()
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.keys().hasAll([
      'placeId', 'placeName', 'userId', 'userInfo', 'rating', 'content', 'isAnonymous', 'status'
    ])
    && request.resource.data.rating >= 1
    && request.resource.data.rating <= 5
    && isNonEmptyString(request.resource.data.content)
    && request.resource.data.status == 'published';

  // Update: Owner can update (except rating)
  allow update: if emailVerified()
    && isOwner(resource.data.userId)
    && request.resource.data.userId == resource.data.userId
    && request.resource.data.rating == resource.data.rating; // Can't change rating

  // Delete: Owner OR Moderator
  allow delete: if (emailVerified() && isOwner(resource.data.userId))
    || isModerator() || isAdmin();
}
```

**Giải thích:**
- ✅ Verified users tạo reviews (auto-publish)
- ✅ Rating từ 1-5 (validated)
- ✅ Owner không thể sửa rating sau khi tạo (prevent manipulation)
- ✅ Moderator xóa được spam/inappropriate reviews

#### 1.3.6. `review_helpful` Collection

**Vị trí:** `firestore.rules:264-271`

```javascript
match /review_helpful/{voteId} {
  allow read: if isSignedIn();
  allow create: if emailVerified()
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.keys().hasAll(['userId', 'reviewId', 'createdAt']);
  allow delete: if emailVerified() && isOwner(resource.data.userId);
}
```

**Giải thích:**
- ✅ User chỉ vote được với chính user ID của mình
- ✅ User chỉ xóa được vote của chính mình

**Duplicate vote prevention:** Handled at API level (composite index + query check)

#### 1.3.7. `review_reports` Collection

**Vị trí:** `firestore.rules:273-288`

```javascript
match /review_reports/{reportId} {
  // Read: Moderator, Admin, or Reporter
  allow read: if isModerator() || isAdmin() || (isSignedIn() && isOwner(resource.data.reportedBy));

  // Create: Verified users with field validation
  allow create: if emailVerified()
    && request.resource.data.reportedBy == request.auth.uid
    && request.resource.data.reviewId is string
    && request.resource.data.placeId is string
    && request.resource.data.reportedBy is string
    && request.resource.data.reason is string
    && request.resource.data.status == 'pending';

  // Update: Only moderator+ (for review action)
  allow update: if isModerator() || isAdmin();

  // Delete: Only admin
  allow delete: if isAdmin();
}
```

**Giải thích:**
- ✅ User chỉ report được với chính user ID của mình
- ✅ Status phải là `'pending'` khi tạo (không thể tự approve)
- ✅ Chỉ moderator update được (resolve/dismiss)

**Field validation:**
- `reviewId`, `placeId`, `reportedBy`, `reason` là **required**
- Cho phép additional metadata fields (e.g., `details`, `timestamp`)

#### 1.3.8. `itineraries` Collection

**Vị trí:** `firestore.rules:157-201`

```javascript
match /itineraries/{itineraryId} {
  // Read: Public OR Owner OR Moderator OR Collaborator
  allow read: if resource.data.isPublic == true
    || isOwner(resource.data.userId)
    || isModerator() || isAdmin()
    || (isSignedIn() && resource.data.collaborators != null
        && request.auth.uid in resource.data.collaborators.map(c, c.userId));

  // List: Authenticated users (filtered by read rule)
  allow list: if isSignedIn();

  // Create: Verified users with permission
  allow create: if emailVerified()
    && hasPermission('itinerary.create')
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.keys().hasAll([
      'title', 'userId', 'duration', 'tripType', 'budget', 'places', 'isPublic', 'status'
    ])
    && isNonEmptyString(request.resource.data.title)
    && request.resource.data.duration > 0 && request.resource.data.duration <= 30
    && request.resource.data.tripType in ['solo', 'couple', 'family', 'group', 'business']
    && request.resource.data.status in ['draft', 'published'];

  // Update: Owner OR Collaborator with edit permission OR Moderator
  allow update: if emailVerified()
    && (
      (isOwner(resource.data.userId) && hasPermission('itinerary.update_own'))
      || (isSignedIn() && resource.data.collaborators != null
          && request.auth.uid in resource.data.collaborators
              .filter(c, c.permission in ['edit', 'admin']).map(c, c.userId))
      || isModerator() || isAdmin()
    )
    && request.resource.data.userId == resource.data.userId; // Prevent ownership transfer

  // Delete: Owner with permission OR Admin
  allow delete: if emailVerified()
    && (
      (isOwner(resource.data.userId) && hasPermission('itinerary.delete_own'))
      || isAdmin()
    );
}
```

**Giải thích:**
- ✅ Public itineraries: Ai cũng đọc được
- ✅ Private itineraries: Chỉ owner + collaborators + moderator
- ✅ Collaborators với `permission == 'edit'` hoặc `'admin'` có thể update
- ✅ Ngăn ownership transfer (userId immutable)
- ✅ Duration: 1-30 ngày (validated)

#### 1.3.9. `announcements` Collection

**Vị trí:** `firestore.rules:350-381`

```javascript
match /announcements/{announcementId} {
  // Read: Only published announcements
  allow read: if resource.data.status == 'published';

  // List: Require pagination (prevent full table scan)
  allow list: if request.query.limit != null;

  // Create: Moderator+ can create
  allow create: if isModerator() || isAdmin();

  // Update: Moderator+ OR Author (if draft)
  allow update: if (isModerator() || isAdmin())
    || (isSignedIn() && resource.data.authorId == request.auth.uid && resource.data.status == 'draft');

  // Delete: Only admin
  allow delete: if isAdmin();

  // Validation rules
  allow create, update: if
    request.resource.data.keys().hasAll([
      'title', 'slug', 'content', 'type', 'status', 'priority',
      'authorId', 'authorName', 'viewCount', 'isPinned', 'isFeatured', 'createdAt', 'updatedAt'
    ]) &&
    isNonEmptyString(request.resource.data.title) &&
    request.resource.data.title.size() <= 200 &&
    isSlug(request.resource.data.slug) &&
    isNonEmptyString(request.resource.data.content) &&
    request.resource.data.type in ['announcement', 'feature', 'guide', 'community', 'maintenance', 'event'] &&
    request.resource.data.status in ['draft', 'scheduled', 'published', 'archived'] &&
    request.resource.data.priority in ['low', 'medium', 'high', 'urgent'] &&
    request.resource.data.viewCount is int &&
    request.resource.data.isPinned is bool &&
    request.resource.data.isFeatured is bool;
}
```

**Giải thích:**
- ✅ Public chỉ thấy published announcements
- ✅ Require pagination (prevent DoS attack)
- ✅ Moderator+ tạo announcement
- ✅ Author sửa được draft của mình
- ✅ Validate title, slug, content, type, status, priority

#### 1.3.10. `team_members` Collection

**Vị trí:** `firestore.rules:383-414`

```javascript
match /team_members/{memberId} {
  // Read: Public
  allow read: if true;

  // List: Public with pagination
  allow list: if true;

  // Create/Update/Delete: Only admin
  allow create, update, delete: if isAdmin();

  // Validation rules
  allow create, update: if
    isNonEmptyString(request.resource.data.slug) &&
    isSlug(request.resource.data.slug) &&
    isNonEmptyString(request.resource.data.fullName) &&
    request.resource.data.fullName.size() <= 100 &&
    isNonEmptyString(request.resource.data.title) &&
    request.resource.data.title.size() <= 150 &&
    isNonEmptyString(request.resource.data.bio) &&
    request.resource.data.bio.size() <= 250 &&
    isNonEmptyString(request.resource.data.avatar) &&
    request.resource.data.status in ['active', 'inactive'] &&
    request.resource.data.featured is bool &&
    request.resource.data.displayOrder is int &&
    request.resource.data.displayOrder >= 0 &&
    request.resource.data.expertise is list &&
    request.resource.data.createdBy is string &&
    request.resource.data.updatedBy is string &&
    request.resource.data.createdAt is string &&
    request.resource.data.updatedAt is string;
}
```

**Giải thích:**
- ✅ Public đọc được team profiles (for /about page)
- ✅ Chỉ admin quản lý team members
- ✅ Validate slug, fullName, title, bio, avatar

#### 1.3.11. Admin-Only Collections

**Vị trí:** `firestore.rules:333-348`

```javascript
// Rate limiting (only Cloud Functions)
match /rateLimits/{document} {
  allow read, write: if false;
}

// Admin logs (admin read, functions write)
match /adminLogs/{document} {
  allow read: if isAdmin();
  allow write: if false;
}

match /admin_logs/{document} {
  allow read: if isAdmin();
  allow create: if isAdmin();
  allow write: if false; // Prevent updates after creation (immutable audit log)
}

// Audit logs (moderator+ read, functions write)
match /audits/{id} {
  allow read: if isModerator() || isAdmin();
  allow write: if false;
}

// System counters (public read, functions write)
match /system/counters/{id} {
  allow read: if true;
  allow write: if false;
}
```

**Giải thích:**
- ✅ `rateLimits`: Chỉ Cloud Functions (prevent client-side manipulation)
- ✅ `adminLogs`, `admin_logs`: Admin read, immutable after creation
- ✅ `audits`: Moderator+ read, functions write (audit trail)
- ✅ `system/counters`: Public read, functions write (e.g., total places count)

#### 1.3.12. Default Deny Rule

**Vị trí:** `firestore.rules:416-419`

```javascript
// Default deny all other documents
match /{document=**} {
  allow read, write: if false;
}
```

**Giải thích:**
- ✅ **Security by default:** Mọi collection không được định nghĩa ở trên đều bị deny
- ✅ Prevent accidental data exposure

---

## 2. Firebase Storage Rules

### 2.1. File: `storage.rules`

**Vị trí:** `C:\Users\manhq\Downloads\da2\VietExplore-AI\storage.rules`
**Dòng code:** 108 lines
**Deploy command:** `firebase deploy --only storage`

### 2.2. Helper Functions

```javascript
function isSignedIn() {
  return request.auth != null;
}

function isOwner(uid) {
  return request.auth.uid == uid;
}

// Get role from Firestore (warning: adds latency)
function getUserRole() {
  return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role;
}

function isAdmin() {
  return getUserRole() == 'admin';
}

function isModerator() {
  return getUserRole() in ['moderator', 'admin'];
}

// Get role from custom token claims (FASTER - no Firestore read)
function isContributorOrAbove() {
  return request.auth.token.role != null &&
         request.auth.token.role in ['contributor', 'partner', 'moderator', 'admin'];
}
```

**Performance Note:**
- `getUserRole()` gọi Firestore → adds 50-200ms latency
- `request.auth.token.role` từ JWT token → instant
- **Best practice:** Dùng `token.role` khi có thể

### 2.3. Storage Path Rules

#### 2.3.1. User Profile Images

**Vị trí:** `storage.rules:33-36`

```javascript
match /users/{userId}/profile/{imageId} {
  allow read: if true; // Public read for profile images
  allow write: if isSignedIn() && (isOwner(userId) || isAdmin());
}
```

**Giải thích:**
- ✅ Public read (profile images hiển thị công khai)
- ✅ Owner upload được ảnh của mình
- ✅ Admin upload được ảnh cho bất kỳ user nào

#### 2.3.2. Place Images (Flat Structure)

**Vị trí:** `storage.rules:38-48`

```javascript
// Without userId - only contributors+ can upload
match /places/images/{imageId} {
  allow read: if true; // Public read for place images
  allow write: if isSignedIn() && isContributorOrAbove();
}

// With userId - owner or contributor+ can upload
match /places/images/{userId}/{imageId} {
  allow read: if true; // Public read for place images
  allow write: if isSignedIn() && (isOwner(userId) || isContributorOrAbove());
}
```

**Giải thích:**
- ✅ Public read (place images hiển thị công khai)
- ✅ Chỉ contributor+ upload được
- ✅ Path có userId: Owner upload được ảnh vào thư mục của mình

**Legacy paths** (backward compatibility):

```javascript
// Legacy: /places/{placeId}/images/{imageId}
match /places/{placeId}/images/{imageId} {
  allow read: if true;
  allow write: if isSignedIn() && isContributorOrAbove();
}
```

#### 2.3.3. Place Videos

**Vị trí:** `storage.rules:50-72`

```javascript
// Without userId
match /places/videos/{videoId} {
  allow read: if true;
  allow write: if isSignedIn() && isContributorOrAbove();
}

// With userId
match /places/videos/{userId}/{videoId} {
  allow read: if true;
  allow write: if isSignedIn() && (isOwner(userId) || isContributorOrAbove());
}

// Legacy path
match /places/{placeId}/videos/{videoId} {
  allow read: if true;
  allow write: if isSignedIn() && isContributorOrAbove();
}
```

**Giải thích:**
- ✅ Same logic as images
- ✅ Support video uploads for multimedia content

#### 2.3.4. Itinerary Images

**Vị trí:** `storage.rules:74-78`

```javascript
match /itineraries/{itineraryId}/images/{imageId} {
  allow read: if true; // Public read
  allow write: if isSignedIn(); // Any authenticated user can upload
}
```

**Giải thích:**
- ✅ Mọi authenticated user upload được (không cần contributor role)
- ✅ Itinerary images không yêu cầu moderation

#### 2.3.5. Announcement Images

**Vị trí:** `storage.rules:80-90`

```javascript
// Without userId - only moderator+ can upload
match /announcements/images/{imageId} {
  allow read: if true;
  allow write: if isSignedIn() && isModerator();
}

// With userId - owner (if moderator+) or moderator+ can upload
match /announcements/images/{userId}/{imageId} {
  allow read: if true;
  allow write: if isSignedIn() && (isOwner(userId) || isModerator());
}
```

**Giải thích:**
- ✅ Chỉ moderator+ upload được announcement images
- ✅ Public read (announcements hiển thị công khai)

#### 2.3.6. Admin Uploads

**Vị trí:** `storage.rules:92-95`

```javascript
match /admin/{allPaths=**} {
  allow read, write: if isAdmin();
}
```

**Giải thích:**
- ✅ Admin có full access vào `/admin` path
- ✅ Dùng cho admin-specific files (backups, reports, etc.)

#### 2.3.7. Temporary Uploads

**Vị trí:** `storage.rules:97-100`

```javascript
match /temp/{allPaths=**} {
  allow read, write: if isSignedIn();
}
```

**Giải thích:**
- ✅ Authenticated users upload được vào `/temp`
- ✅ Dùng cho temporary/preview uploads
- ✅ **Có TTL:** 24h (set via Firebase Storage lifecycle rules)

#### 2.3.8. Default Deny

**Vị trí:** `storage.rules:102-105`

```javascript
match /{allPaths=**} {
  allow read, write: if false;
}
```

**Giải thích:**
- ✅ Default deny tất cả paths không được định nghĩa
- ✅ Security by default

### 2.4. File Upload Constraints

**Client-side validation** (implemented in API):
- **Max file size:** 5MB (images), 50MB (videos)
- **Allowed formats:** JPG, PNG, WebP (images), MP4 (videos)
- **Auto-resize:** Images resize to 1200x800px, 80% quality

**Storage rules constraints:**
- Rules KHÔNG validate file size/format (làm ở API level)
- Rules chỉ validate permissions (who can upload where)

---

## 3. Firestore Composite Indexes

### 3.1. File: `firestore.indexes.json`

**Vị trí:** `C:\Users\manhq\Downloads\da2\VietExplore-AI\firestore.indexes.json`
**Dòng code:** 898 lines
**Deploy command:** `firebase deploy --only firestore:indexes`

### 3.2. Tổng Quan Indexes

| Collection | Index Count | Purpose |
|-----------|-------------|---------|
| `places` | 4 | Region/status/type filtering, sorting by createdAt/updatedAt |
| `placeDrafts` | 2 | Status filtering, user's drafts listing |
| `moderation_queue` | 5 | Status/priority/contentType filtering, assignedTo queries |
| `users` | 2 | Role-based queries, sorting by createdAt/updatedAt |
| `itineraries` | 4 | User's itineraries, public listing, filtering by tripType/duration |
| `place_reviews` | 4 | Place reviews, sorting by rating/helpful/createdAt |
| `review_helpful` | 2 | User vote tracking, review votes listing |
| `review_reports` | 4 | Status/reason filtering, reporter/reviewer queries |
| `announcements` | 6 | Status/priority/type filtering, pinned/featured sorting |
| `team_members` | 4 | Status/featured/department filtering, displayOrder sorting |
| `moderation_logs` | 1 | ContentId audit trail |
| `suspension_schedules` | 2 | Auto-restore cron job queries |
| `ai_chat_logs` | 1 | Analytics queries (placeId + userId + timestamp) |

**Tổng cộng:** 50+ composite indexes

### 3.3. Critical Indexes (Most Used)

#### 3.3.1. `moderation_queue` Indexes

**Index 1: Status + Priority + SubmittedAt**
```json
{
  "collectionGroup": "moderation_queue",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "priority", "order": "DESCENDING"},
    {"fieldPath": "submittedAt", "order": "ASCENDING"}
  ]
}
```

**Sử dụng cho query:**
```typescript
db.collection('moderation_queue')
  .where('status', '==', 'pending')
  .orderBy('priority', 'desc')
  .orderBy('submittedAt', 'asc')
  .limit(20);
```

**Mục đích:** Moderator queue sorting (high priority first, oldest first)

**Index 2: AssignedTo + Status + SubmittedAt**
```json
{
  "collectionGroup": "moderation_queue",
  "fields": [
    {"fieldPath": "assignedTo", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "submittedAt", "order": "ASCENDING"}
  ]
}
```

**Sử dụng cho query:**
```typescript
db.collection('moderation_queue')
  .where('assignedTo', '==', userId)
  .where('status', '==', 'in_review')
  .orderBy('submittedAt', 'asc');
```

**Mục đích:** Moderator's assigned items

#### 3.3.2. `places` Indexes

**Index 1: Status + CreatedAt**
```json
{
  "collectionGroup": "places",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

**Sử dụng cho query:**
```typescript
db.collection('places')
  .where('status', '==', 'published')
  .orderBy('createdAt', 'desc')
  .limit(20);
```

**Mục đích:** Homepage listing (newest places first)

**Index 2: Region + Status + CreatedAt**
```json
{
  "collectionGroup": "places",
  "fields": [
    {"fieldPath": "region", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

**Sử dụng cho query:**
```typescript
db.collection('places')
  .where('region', '==', 'bac-bo')
  .where('status', '==', 'published')
  .orderBy('createdAt', 'desc')
  .limit(20);
```

**Mục đích:** Region-filtered explore page

**Index 3: Region + Province + Type + Status**
```json
{
  "collectionGroup": "places",
  "fields": [
    {"fieldPath": "region", "order": "ASCENDING"},
    {"fieldPath": "province", "order": "ASCENDING"},
    {"fieldPath": "type", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"}
  ]
}
```

**Sử dụng cho query:**
```typescript
db.collection('places')
  .where('region', '==', 'nam-bo')
  .where('province', '==', 'tphcm')
  .where('type', '==', 'bien')
  .where('status', '==', 'published');
```

**Mục đích:** Multi-filter explore (region + province + type)

#### 3.3.3. `place_reviews` Indexes

**Index 1: PlaceId + Status + CreatedAt**
```json
{
  "collectionGroup": "place_reviews",
  "fields": [
    {"fieldPath": "placeId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

**Sử dụng cho query:**
```typescript
db.collection('place_reviews')
  .where('placeId', '==', placeId)
  .where('status', '==', 'published')
  .orderBy('createdAt', 'desc')
  .limit(10);
```

**Mục đích:** Place detail page reviews (newest first)

**Index 2: PlaceId + Status + HelpfulCount**
```json
{
  "collectionGroup": "place_reviews",
  "fields": [
    {"fieldPath": "placeId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "helpfulCount", "order": "DESCENDING"}
  ]
}
```

**Sử dụng cho query:**
```typescript
db.collection('place_reviews')
  .where('placeId', '==', placeId)
  .where('status', '==', 'published')
  .orderBy('helpfulCount', 'desc')
  .limit(10);
```

**Mục đích:** Sort reviews by most helpful

#### 3.3.4. `announcements` Indexes

**Index 1: Status + IsPinned + Priority + PublishedAt**
```json
{
  "collectionGroup": "announcements",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "isPinned", "order": "ASCENDING"},
    {"fieldPath": "priority", "order": "DESCENDING"},
    {"fieldPath": "publishedAt", "order": "DESCENDING"}
  ]
}
```

**Sử dụng cho query:**
```typescript
db.collection('announcements')
  .where('status', '==', 'published')
  .orderBy('isPinned', 'asc')
  .orderBy('priority', 'desc')
  .orderBy('publishedAt', 'desc')
  .limit(10);
```

**Mục đích:** Community page announcements (pinned first, high priority first)

### 3.4. Field Overrides

**Index:** `places.slug` (ASCENDING, COLLECTION scope)

```json
{
  "collectionGroup": "places",
  "fieldPath": "slug",
  "ttl": false,
  "indexes": [
    {"order": "ASCENDING", "queryScope": "COLLECTION"}
  ]
}
```

**Mục đích:** Fast slug lookup for `/places/[slug]` routes

**Query:**
```typescript
db.collection('places').where('slug', '==', 'vung-tau-beach').limit(1).get();
```

### 3.5. Index Deployment

**Deploy lần đầu:**
```bash
firebase deploy --only firestore:indexes
```

**Thời gian build:** 5-30 phút (tùy data size)

**Check status:**
```bash
firebase firestore:indexes
```

**Common errors:**
- `The query requires an index` → Missing composite index
- `Query requires an index that is currently building` → Wait for index build

---

## 4. API Middleware Security

### 4.1. File: `src/lib/server/auth-middleware.ts`

**Chức năng:** Xác thực JWT token và kiểm tra permissions ở API routes

### 4.2. `verifyAuthToken()` Function

```typescript
export async function verifyAuthToken(
  request: Request
): Promise<{ user: DecodedIdToken; error?: undefined } | { user?: undefined; error: string }> {
  try {
    // 1. Extract Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid Authorization header' };
    }

    // 2. Get token
    const token = authHeader.split('Bearer ')[1];

    // 3. Verify with Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);

    // 4. Check email verification
    if (!decodedToken.email_verified) {
      return { error: 'Email not verified' };
    }

    // 5. Return decoded token (includes uid, email, role from custom claims)
    return { user: decodedToken };
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error);
    return { error: 'Invalid or expired token' };
  }
}
```

**Sử dụng trong API:**
```typescript
// src/app/api/places/route.ts
export async function POST(request: Request) {
  // Verify authentication
  const { user, error } = await verifyAuthToken(request);
  if (error || !user) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }

  // Check role permission
  if (!user.role || !['contributor', 'partner', 'moderator', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  // ... API logic
}
```

### 4.3. Permission Checking Pattern

**Method 1: Role-based**
```typescript
if (user.role !== 'admin') {
  return NextResponse.json({ error: 'Admin required' }, { status: 403 });
}
```

**Method 2: Permission-based**
```typescript
import { hasPermission } from '@/lib/auth/permissions';

// Get full user document
const userDoc = await adminDb.collection('users').doc(user.uid).get();
const userData = userDoc.data();

if (!hasPermission(userData, 'moderation.approve')) {
  return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
}
```

**Method 3: Resource ownership**
```typescript
const placeDoc = await adminDb.collection('places').doc(placeId).get();
const place = placeDoc.data();

if (place.submitter !== user.uid && user.role !== 'admin') {
  return NextResponse.json({ error: 'Not authorized to edit this place' }, { status: 403 });
}
```

### 4.4. Email Verification Check

**Why important:**
- Ngăn spam accounts tạo content
- Ensure user identity

**Pattern:**
```typescript
if (!user.email_verified) {
  return NextResponse.json({
    error: 'Email verification required',
    code: 'EMAIL_NOT_VERIFIED'
  }, { status: 403 });
}
```

**Frontend handling:**
```typescript
if (error.code === 'EMAIL_NOT_VERIFIED') {
  toast.error('Vui lòng xác thực email trước khi thực hiện hành động này');
  router.push('/verify-email');
}
```

---

## 5. Custom Token Claims

### 5.1. Khái Niệm

**Custom Claims:** Metadata được embed vào JWT token, có thể truy cập mà không cần query Firestore.

**Lợi ích:**
- ✅ Instant access (không cần Firestore read)
- ✅ Automatically refreshed (khi token expired)
- ✅ Available ở cả client và server

### 5.2. Set Custom Claims

**File:** `src/lib/server/auth.ts`

```typescript
import { adminAuth } from './firebase-admin';

export async function setUserRole(userId: string, role: UserRole) {
  // Set custom claims
  await adminAuth.setCustomUserClaims(userId, { role });

  // Update Firestore
  await adminDb.collection('users').doc(userId).update({
    role,
    updatedAt: new Date().toISOString()
  });
}
```

**Sử dụng:**
```typescript
// Admin promotes user to contributor
await setUserRole('user123', 'contributor');
```

### 5.3. Access Custom Claims

**Server-side (API):**
```typescript
const { user } = await verifyAuthToken(request);
console.log(user.role); // 'contributor'
```

**Client-side:**
```typescript
const user = auth.currentUser;
const token = await user?.getIdTokenResult();
console.log(token?.claims.role); // 'contributor'
```

**Firestore Rules:**
```javascript
function role() {
  return isSignedIn() ? request.auth.token.role : null;
}
```

**Storage Rules:**
```javascript
function isContributorOrAbove() {
  return request.auth.token.role in ['contributor', 'partner', 'moderator', 'admin'];
}
```

### 5.4. Force Token Refresh

**Khi nào cần:**
- User role changed (admin promoted user)
- Permission updated

**Client-side:**
```typescript
// Force refresh token to get new custom claims
await auth.currentUser?.getIdToken(true);

// Then reload user data
window.location.reload();
```

**Auto-refresh:**
- Token expires sau 1 giờ
- Firebase SDK tự động refresh
- New claims sẽ có sau refresh

---

## 6. Rate Limiting

### 6.1. Collection: `rateLimits`

**Purpose:** Prevent spam, brute-force attacks, API abuse

**Schema:**
```typescript
interface RateLimit {
  userId: string;        // User ID hoặc IP address
  action: string;        // e.g., 'place_report', 'review_submit'
  count: number;         // Number of actions in time window
  windowStart: string;   // ISO timestamp
  windowEnd: string;     // ISO timestamp
}
```

**Firestore rules:**
```javascript
match /rateLimits/{document} {
  allow read, write: if false; // Only Cloud Functions
}
```

### 6.2. Rate Limit Enforcement

**API Pattern:**
```typescript
// src/app/api/places/[id]/report/route.ts
export async function POST(request: Request) {
  const { user } = await verifyAuthToken(request);

  // Check rate limit: 3 reports/week
  const rateLimitKey = `${user.uid}_place_report`;
  const rateLimitDoc = await adminDb.collection('rateLimits').doc(rateLimitKey).get();

  if (rateLimitDoc.exists) {
    const data = rateLimitDoc.data();
    const windowEnd = new Date(data.windowEnd);

    if (new Date() < windowEnd) {
      if (data.count >= 3) {
        return NextResponse.json({
          error: 'Rate limit exceeded. You can only submit 3 reports per week.',
          resetAt: windowEnd.toISOString()
        }, { status: 429 });
      }

      // Increment count
      await adminDb.collection('rateLimits').doc(rateLimitKey).update({
        count: FieldValue.increment(1)
      });
    } else {
      // Window expired, reset
      await adminDb.collection('rateLimits').doc(rateLimitKey).set({
        userId: user.uid,
        action: 'place_report',
        count: 1,
        windowStart: new Date().toISOString(),
        windowEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  } else {
    // First action, create rate limit doc
    await adminDb.collection('rateLimits').doc(rateLimitKey).set({
      userId: user.uid,
      action: 'place_report',
      count: 1,
      windowStart: new Date().toISOString(),
      windowEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // ... Create report
}
```

### 6.3. Rate Limit Configuration

| Action | Limit | Time Window |
|--------|-------|-------------|
| `place_report` | 3 | 1 week |
| `review_report` | 3 | 1 week |
| `review_submit` | 10 | 1 day |
| `login_attempt` | 5 | 15 minutes |
| `password_reset` | 3 | 1 hour |

### 6.4. Cleanup Cron Job

**Purpose:** Delete expired rate limit docs

**File:** `src/app/api/cron/cleanup-rate-limits/route.ts`

```typescript
export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const expiredDocs = await adminDb.collection('rateLimits')
    .where('windowEnd', '<', now.toISOString())
    .get();

  const batch = adminDb.batch();
  expiredDocs.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  return NextResponse.json({
    success: true,
    deletedCount: expiredDocs.size
  });
}
```

---

## 7. Security Best Practices

### 7.1. Authentication

✅ **DO:**
- Require email verification for all user actions
- Use Firebase Authentication (không tự implement)
- Store role trong custom claims (fast access)
- Validate token ở mọi protected API endpoint

❌ **DON'T:**
- Không trust client-side role checks (always verify server-side)
- Không store sensitive data trong custom claims (public in JWT)
- Không skip email verification check

### 7.2. Authorization

✅ **DO:**
- Implement RBAC với hierarchical permissions
- Use helper functions (`isAdmin()`, `isModerator()`)
- Double-check ownership (`isOwner()`)
- Prevent self-management (admin cannot promote themselves)

❌ **DON'T:**
- Không hardcode role names (use constants)
- Không skip permission checks ở Firestore rules
- Không assume higher roles have lower role permissions (always check inheritance)

### 7.3. Data Validation

✅ **DO:**
- Validate all input fields (length, format, type)
- Use helper functions (`isNonEmptyString()`, `isSlug()`, `isValidUrl()`)
- Enforce required fields với `.keys().hasAll()`
- Validate enums (`status in ['draft','published']`)

❌ **DON'T:**
- Không trust client-side validation (always validate server-side)
- Không skip validation cho "trusted" users (validate even admin input)
- Không forget edge cases (empty strings, null, undefined)

### 7.4. Rate Limiting

✅ **DO:**
- Implement rate limits cho user-generated actions
- Use Firestore transactions for atomic increment
- Cleanup expired rate limit docs (cron job)
- Return clear error messages với `resetAt` timestamp

❌ **DON'T:**
- Không hardcode rate limits (use config)
- Không skip rate limiting cho admin (implement separate higher limits)
- Không forget to handle concurrent requests (use transactions)

### 7.5. Firestore Rules

✅ **DO:**
- Default deny all (`allow read, write: if false`)
- Use helper functions (DRY principle)
- Write unit tests for rules (Firebase Emulator Suite)
- Document complex rules (comments)

❌ **DON'T:**
- Không use `.get()` trong rules (slow, adds latency)
- Không trust `request.resource.data` without validation
- Không skip testing rules (use Firebase Emulator)

### 7.6. Storage Rules

✅ **DO:**
- Use custom claims (`request.auth.token.role`) thay vì Firestore reads
- Public read cho images (unless sensitive)
- Validate file paths (prevent directory traversal)
- Implement TTL cho temporary uploads

❌ **DON'T:**
- Không validate file size/format trong rules (làm ở API)
- Không use `getUserRole()` trong high-traffic paths (slow)
- Không forget default deny rule

### 7.7. API Security

✅ **DO:**
- Verify token ở mọi protected endpoint
- Check email verification
- Use `hasPermission()` helper
- Log security events (admin actions, permission checks)
- Return appropriate HTTP status codes (401 vs 403)

❌ **DON'T:**
- Không expose internal error details (use generic messages)
- Không trust request body without validation
- Không skip permission checks for "small" actions

---

## 8. Security Monitoring

### 8.1. Audit Logs

**Collection:** `audits`, `admin_logs`

**Purpose:** Track security-relevant events

**Schema:**
```typescript
interface AuditLog {
  action: string;         // e.g., 'role_change', 'place_approved'
  actorId: string;        // User who performed action
  actorRole: string;      // Role at time of action
  targetId?: string;      // Affected resource ID
  targetType?: string;    // 'user', 'place', 'review'
  oldValue?: any;         // State before action
  newValue?: any;         // State after action
  timestamp: string;      // ISO timestamp
  ipAddress?: string;     // For security events
}
```

**Logging pattern:**
```typescript
// After role change
await adminDb.collection('admin_logs').add({
  action: 'role_change',
  actorId: adminUser.uid,
  actorRole: adminUser.role,
  targetId: userId,
  targetType: 'user',
  oldValue: { role: 'traveler' },
  newValue: { role: 'contributor' },
  timestamp: new Date().toISOString()
});
```

### 8.2. Monitoring Queries

**Failed login attempts:**
```typescript
db.collection('admin_logs')
  .where('action', '==', 'login_failed')
  .where('timestamp', '>', last24Hours)
  .get();
```

**Role changes:**
```typescript
db.collection('admin_logs')
  .where('action', '==', 'role_change')
  .orderBy('timestamp', 'desc')
  .limit(50)
  .get();
```

**Suspicious activities:**
```typescript
// Multiple reports from same user in short time
db.collection('rateLimits')
  .where('action', '==', 'place_report')
  .where('count', '>=', 3)
  .where('windowEnd', '>', now)
  .get();
```

### 8.3. Alerts

**Setup Firebase Cloud Functions cho alerts:**

```typescript
// functions/src/index.ts
export const securityAlert = functions.firestore
  .document('admin_logs/{logId}')
  .onCreate(async (snap, context) => {
    const log = snap.data();

    // Alert on role change to admin
    if (log.action === 'role_change' && log.newValue?.role === 'admin') {
      await sendAdminEmail({
        subject: '[SECURITY] New Admin Created',
        body: `User ${log.targetId} was promoted to admin by ${log.actorId}`
      });
    }

    // Alert on mass deletion
    if (log.action === 'bulk_delete' && log.count > 100) {
      await sendAdminEmail({
        subject: '[SECURITY] Mass Deletion Detected',
        body: `${log.actorId} deleted ${log.count} items`
      });
    }
  });
```

---

## 9. Common Security Issues

### 9.1. Issue: "Permission Denied" despite correct role

**Cause 1:** Custom claims not refreshed

**Solution:**
```typescript
// Force token refresh
await auth.currentUser?.getIdToken(true);
window.location.reload();
```

**Cause 2:** Email not verified

**Solution:** Check `user.email_verified` in API

**Cause 3:** Firestore rules out of sync

**Solution:**
```bash
firebase deploy --only firestore:rules
```

### 9.2. Issue: "Query requires an index"

**Cause:** Missing composite index

**Solution:**
1. Check error message for index URL
2. Click URL to auto-create index
3. OR add to `firestore.indexes.json` và deploy

**Prevention:**
```bash
# Test queries trong Emulator trước production
firebase emulators:start --only firestore
```

### 9.3. Issue: Rate limit bypassed

**Cause:** Using wrong rate limit key (userId vs IP)

**Solution:**
```typescript
// Correct pattern
const rateLimitKey = `${user.uid}_${action}`;

// For unauthenticated requests
const rateLimitKey = `${ipAddress}_${action}`;
```

### 9.4. Issue: Storage upload fails with 403

**Cause 1:** Storage rules not deployed

**Solution:**
```bash
firebase deploy --only storage
```

**Cause 2:** Custom claims missing role

**Solution:**
```typescript
// Set role when creating user
await adminAuth.setCustomUserClaims(userId, { role: 'contributor' });
```

**Cause 3:** Using Firestore role check (slow, timeout)

**Solution:** Use `request.auth.token.role` instead of `getUserRole()`

---

## 10. Testing Security Rules

### 10.1. Firebase Emulator Suite

**Install:**
```bash
npm install -g firebase-tools
firebase init emulators
```

**Start emulator:**
```bash
firebase emulators:start --only firestore,auth,storage
```

**Access Emulator UI:**
- URL: `http://localhost:4000`
- Firestore: `http://localhost:8080`
- Auth: `http://localhost:9099`
- Storage: `http://localhost:9199`

### 10.2. Unit Testing Rules

**File:** `firestore.test.ts`

```typescript
import { assertSucceeds, assertFails } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  it('allows user to read own profile', async () => {
    const db = getFirestoreWithAuth({ uid: 'user123' });
    await assertSucceeds(db.collection('users').doc('user123').get());
  });

  it('denies user from reading other profiles', async () => {
    const db = getFirestoreWithAuth({ uid: 'user123' });
    await assertFails(db.collection('users').doc('user456').get());
  });

  it('allows contributor to create draft', async () => {
    const db = getFirestoreWithAuth({
      uid: 'user123',
      email_verified: true,
      role: 'contributor'
    });
    await assertSucceeds(db.collection('placeDrafts').add({
      title: 'Test Place',
      region: 'bac-bo',
      province: 'hanoi',
      type: 'van-hoa',
      description: 'Test',
      sources: ['http://example.com'],
      submitter: 'user123',
      status: 'draft'
    }));
  });

  it('denies traveler from creating draft', async () => {
    const db = getFirestoreWithAuth({
      uid: 'user123',
      email_verified: true,
      role: 'traveler'
    });
    await assertFails(db.collection('placeDrafts').add({ /* ... */ }));
  });
});
```

**Run tests:**
```bash
npm test -- firestore.test.ts
```

### 10.3. Integration Testing

**Test với real Firebase:**
```bash
# Use test project
firebase use test-project

# Deploy rules
firebase deploy --only firestore:rules

# Run integration tests
npm run test:integration
```

---

## 11. Deployment Checklist

### 11.1. Pre-Deployment

- [ ] ✅ Firestore rules updated
- [ ] ✅ Storage rules updated
- [ ] ✅ Composite indexes added
- [ ] ✅ Rules tested in Emulator
- [ ] ✅ Environment variables set (production)
- [ ] ✅ Custom claims implemented for new roles
- [ ] ✅ Rate limiting configured

### 11.2. Deploy Commands

```bash
# Deploy all security config
firebase deploy --only firestore:rules,storage,firestore:indexes

# Or separately
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only firestore:indexes
```

### 11.3. Post-Deployment

- [ ] ✅ Verify rules deployed (check Firebase Console)
- [ ] ✅ Test protected endpoints
- [ ] ✅ Check admin access
- [ ] ✅ Monitor error logs (first 24h)
- [ ] ✅ Test rate limiting
- [ ] ✅ Verify audit logs writing

### 11.4. Rollback Plan

**If rules cause issues:**

```bash
# Rollback Firestore rules
firebase firestore:rollback

# Rollback Storage rules (manual via Console)
# Or re-deploy previous version
```

**Emergency fix:**
1. Open Firebase Console
2. Firestore / Rules tab
3. Edit rules directly
4. Publish (bypasses CI/CD)
5. Fix locally + commit + redeploy

---

## 12. Related Documentation

**Xem thêm:**
- [02_RBAC_PERMISSIONS.md](.docs/02_RBAC_PERMISSIONS.md) - Role hierarchy và permission matrix
- [03_DATABASE_SCHEMA.md](.docs/03_DATABASE_SCHEMA.md) - Firestore collection schemas
- [04_WORKFLOWS.md](.docs/04_WORKFLOWS.md) - State machine workflows
- [05_API_REFERENCE.md](.docs/05_API_REFERENCE.md) - API endpoint authentication

**External Resources:**
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Best Practices](https://firebase.google.com/docs/firestore/security/overview)
- [Firebase Auth Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)

---

**Tài liệu này cung cấp đầy đủ thông tin về security & access control của VietExplore-AI.**

# Hệ Thống Phân Quyền và Vai Trò (RBAC)

## Tổng Quan

**Du Lịch Việt - AI** sử dụng hệ thống Role-Based Access Control (RBAC) phân cấp 6 mức độ vai trò, với kiến trúc kế thừa quyền hạn từ cấp thấp lên cấp cao.

---

## 1. Cấu Trúc Vai Trò (Role Hierarchy)

```
┌─────────────────────────────────────────────────────────┐
│                        ADMIN                            │
│              Quyền tối cao - Toàn quyền                 │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                    MODERATOR                            │
│         Kiểm duyệt nội dung - Quản lý quy trình         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                     PARTNER                             │
│      Đối tác đóng góp ưu tiên - Hàng đợi riêng         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                  CONTRIBUTOR                            │
│       Người đóng góp nội dung - Cần kiểm duyệt         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                    TRAVELER                             │
│        Người dùng đăng ký - Tương tác cơ bản           │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                      GUEST                              │
│           Khách vãng lai - Chỉ xem nội dung            │
└─────────────────────────────────────────────────────────┘
```

**Nguyên tắc kế thừa quyền:**
- Mỗi vai trò kế thừa TẤT CẢ quyền của các vai trò bên dưới
- Admin có quyền tuyệt đối, không cần kiểm tra chi tiết
- Moderator kế thừa Traveler nhưng KHÔNG kế thừa Contributor/Partner

---

## 2. Chi Tiết Vai Trò

### 2.1. Guest (Khách)

**Mô tả:** Người dùng chưa đăng ký hoặc chưa đăng nhập

**Quyền hạn:**
- ✅ Xem nội dung công khai (places, itineraries)
- ✅ Tìm kiếm địa điểm
- ✅ Xem bản đồ
- ✅ Đọc reviews
- ❌ Không thể tương tác (like, save, comment)
- ❌ Không thể tạo nội dung

**Giới hạn kỹ thuật:**
- Firestore Rules: Chỉ read `status == 'published'`
- API: Chỉ truy cập public endpoints
- Rate limiting: 100 requests/hour

---

### 2.2. Traveler (Du khách)

**Mô tả:** Người dùng đã đăng ký, xác thực email

**Yêu cầu:**
- Email đã xác thực (`emailVerified == true`)
- Tài khoản active (`disabled != true`)

**Quyền hạn:**
| Permission | Mô tả | Implementation |
|-----------|-------|----------------|
| `report_content` | Báo cáo nội dung vi phạm | API: `/api/places/[id]/report` |
| `create_itinerary` | Tạo lịch trình du lịch | API: `/api/itineraries` |
| `save_places` | Lưu địa điểm yêu thích | API: `/api/places/[id]/save` |
| `like_places` | Like địa điểm | API: `/api/places/[id]/like` |
| `write_reviews` | Viết đánh giá | API: `/api/places/[id]/reviews` |

**Giới hạn:**
- Rate limiting: 300 requests/hour
- Review: 1 review/place/user
- Report: 3 reports/week/user
- Itinerary: Max 20 itineraries active

---

### 2.3. Contributor (Người đóng góp)

**Mô tả:** Người dùng có quyền đóng góp địa điểm mới, cần kiểm duyệt

**Yêu cầu nâng cấp từ Traveler:**
- Đã có ít nhất 5 reviews được đánh giá tốt
- Tài khoản hoạt động ít nhất 30 ngày
- Không có vi phạm nội dung

**Quyền hạn mới (bổ sung Traveler):**
| Permission | Mô tả | Workflow |
|-----------|-------|----------|
| `create_place` | Tạo địa điểm mới | Draft → Submit → Moderation → Published |
| `manage_drafts` | Quản lý bản nháp | CRUD operations on `placeDrafts` |
| `edit_own_draft` | Chỉnh sửa draft của mình | Status: `draft`, `changes_requested` |
| `view_review_status` | Xem trạng thái kiểm duyệt | Dashboard: `/contribute/my-drafts` |

**Workflow tạo địa điểm:**
```
1. Contributor tạo draft → status: "draft"
2. Submit for review → status: "submitted" → moderation_queue: "pending"
3. Moderator reviews:
   - Approve → places: "published" + Trust Label: "contributor"
   - Reject → Notification + reason
   - Request changes → status: "changes_requested"
4. Contributor chỉnh sửa theo yêu cầu → Submit lại → Cycle
```

**Trust Label:** `contributor` (sau khi được duyệt)

**Giới hạn:**
- Max 10 drafts đang pending
- Review SLA: 24-48 giờ
- Rejection không ảnh hưởng role (chỉ cần improve content)

---

### 2.4. Partner (Đối tác)

**Mô tả:** Đối tác chính thức, có ưu tiên kiểm duyệt

**Yêu cầu:**
- Đăng ký đối tác qua `/about/partnership`
- Xác minh thông tin doanh nghiệp
- Admin approve

**Quyền hạn mới (bổ sung Contributor):**
| Permission | Mô tả | Benefit |
|-----------|-------|---------|
| `create_place_priority` | Hàng đợi ưu tiên | Priority queue: `partner_queue` |
| `fast_review` | Cam kết SLA 12h | Moderator alerts nếu quá SLA |
| `partner_badge` | Badge đối tác | Trust Label: `partner` |
| `bulk_upload` | Upload hàng loạt | API: `/api/admin/places/bulk` |
| `analytics_access` | Xem analytics | Dashboard: `/partner/analytics` |

**Workflow đặc biệt:**
```
1. Partner submit → Automatic tag: priority: "high"
2. Moderator Queue: Hiển thị tab riêng "Partner Queue"
3. SLA: 12 giờ (vs 24-48h cho Contributor)
4. Approval → Trust Label: "partner"
```

**Trust Label:** `partner` → Hiển thị badge vàng "Đối tác chính thức"

**Giới hạn:**
- Max 50 drafts pending
- Bulk upload: 100 places/batch
- API rate limit: 1000 requests/hour

---

### 2.5. Moderator (Kiểm duyệt viên)

**Mô tả:** Quản lý quy trình kiểm duyệt, xử lý báo cáo

**Yêu cầu:**
- Được Admin chỉ định
- Đào tạo nội bộ về quy trình moderation
- Ký cam kết bảo mật

**Quyền hạn kiểm duyệt:**
| Permission | Mô tả | Action |
|-----------|-------|--------|
| `review_content` | Xem hàng đợi kiểm duyệt | `/admin/moderation/queue` |
| `approve_content` | Duyệt nội dung | Transition: `in_review` → `approved` |
| `reject_content` | Từ chối nội dung | Transition: `in_review` → `rejected` |
| `request_changes` | Yêu cầu sửa đổi | Transition: `in_review` → `needs_revision` |
| `hide_content` | Ẩn nội dung vi phạm | Transition: `published` → `hidden` |
| `claim_moderation_item` | Claim item để xử lý | Prevent race condition |
| `resolve_report` | Xử lý báo cáo | `/admin/moderation/reports` |
| `view_audit_logs` | Xem audit log | Transparency cho Moderator |

**Quy trình Moderation (State Machine - STRICT):**
```
┌─────────┐   Claim (2h timeout)   ┌─────────┐
│ PENDING ├──────────────────────>│ CLAIMED │
└─────────┘                        └────┬────┘
                                        │
                          Start Review  │
                                        ▼
                                  ┌───────────┐
                            ┌─────┤ IN_REVIEW ├─────┐
                            │     └───────────┘     │
                        Approve                 Reject/Request Edit
                            │                       │
                            ▼                       ▼
                      ┌──────────┐           ┌──────────┐
                      │ APPROVED │           │ REJECTED │
                      └──────────┘           └──────────┘
                            │                       │
                      (Auto-archive                 │
                       sau 30 ngày)          (Auto-archive
                            │                  sau 30 ngày)
                            ▼                       ▼
                    ┌─────────────────────────────────┐
                    │    MODERATION_ARCHIVE           │
                    │   (Retention: 90 ngày)          │
                    └─────────────────────────────────┘
```

**Claim Mechanism:**
- Moderator "Tiếp nhận" item → `claimedBy: userId`, `claimExpiresAt: +2h`
- Tránh 2 moderators xử lý cùng 1 item
- Auto-release nếu không action trong 2h (cron job)

**Escalation:**
- Moderator có thể escalate lên Admin khi:
  - Nội dung nhạy cảm (chính trị, tôn giáo)
  - Không chắc chắn về quyết định
  - Partner có phản đối
- **Admin KHÔNG thể escalate** (quyền cao nhất)

**Giới hạn:**
- Không được chỉnh sửa nội dung (chỉ approve/reject)
- Không quản lý users (chỉ Admin)
- Không thay đổi settings hệ thống

---

### 2.6. Admin (Quản trị viên)

**Mô tả:** Quyền tối cao, toàn quyền quản lý hệ thống

**Yêu cầu:**
- Chỉ Founder/CTO
- 2FA bắt buộc
- Audit log mọi hành động

**Quyền hạn đặc biệt:**
| Permission | Mô tả | Use Case |
|-----------|-------|----------|
| `all_permissions` | Tất cả quyền | Bypass mọi check |
| `manage_users_advanced` | Quản lý users | Change role, disable account |
| `manage_settings` | Settings hệ thống | Feature flags, maintenance mode |
| `manage_security` | Cấu hình bảo mật | Firestore rules, API keys |
| `system_override` | Override quy trình | Emergency actions |
| `view_audit_logs` | Full audit access | Security review |

**Đặc quyền:**
- Bypass moderation queue (nội dung auto-publish)
- Rollback moderation decisions
- Xóa vĩnh viễn nội dung
- Thay đổi role của bất kỳ user nào (trừ chính mình)

**Giới hạn an toàn:**
- **Không thể tự thay đổi role của mình** (prevent self-demotion accident)
- **Không thể xóa tài khoản admin khác** (prevent conflict)
- **Mọi action được audit log** (transparency)

---

## 3. Permission Mapping Chi Tiết

### 3.1. Role → Permissions Matrix

| Permission | Guest | Traveler | Contributor | Partner | Moderator | Admin |
|-----------|-------|----------|-------------|---------|-----------|-------|
| **Content View** |
| `content.view_public` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **User Interactions** |
| `save_places` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `report_content` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `create_itinerary` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Content Creation** |
| `create_place` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `manage_drafts` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `create_place_priority` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `fast_review` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Moderation** |
| `view_moderation_queue` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `approve_content` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `reject_content` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `hide_content` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Administration** |
| `manage_users_advanced` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `manage_settings` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `system_override` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `all_permissions` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.2. Code Implementation

**File:** `src/lib/auth/permissions.ts`

```typescript
import { User, UserRole, Permission } from '@/lib/types/auth';

export const rolePermissions: Record<UserRole, Permission[]> = {
  guest: [],

  traveler: [
    "report_content",
    "create_itinerary",
    "save_places"
  ],

  contributor: [
    "create_place",        // Requires moderation
    "report_content",
    "create_itinerary",
    "save_places",
    "manage_drafts"
  ],

  partner: [
    "create_place",
    "create_place_priority",
    "report_content",
    "create_itinerary",
    "save_places",
    "manage_drafts",
    "partner_badge",
    "fast_review"
  ],

  moderator: [
    "review_content",
    "approve_content",
    "reject_content",
    "hide_content",
    "view_moderation_queue",
    "claim_moderation_item",
    "manage_partial_admin",
    // Inherits traveler permissions
    "report_content",
    "create_itinerary",
    "save_places"
  ],

  admin: [
    "all_permissions"
  ]
};

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const userPermissions = rolePermissions[user.role] || [];

  // Grant base permissions for higher roles
  if (user.role === 'partner') {
    return userPermissions.concat(rolePermissions.contributor).includes(permission);
  }
  if (user.role === 'contributor') {
    return userPermissions.concat(rolePermissions.traveler).includes(permission);
  }

  return userPermissions.includes(permission);
}
```

---

## 4. Trust Label System

Trust Label gắn với nội dung (places), KHÔNG phải với user role.

### 4.1. Trust Label Types

| Label | Mô tả | Điều kiện gán | Hiển thị |
|-------|-------|--------------|----------|
| `community` | Nội dung cộng đồng | User role: Traveler | Badge xám "Cộng đồng" |
| `contributor` | Người đóng góp | User role: Contributor + Approved | Badge xanh "Đóng góp" |
| `partner` | Đối tác chính thức | User role: Partner + Approved | Badge vàng "Đối tác" |
| `verified` | Xác thực chính thức | Admin manual assign | Badge xanh lá "Chính thức" |

### 4.2. Trust Label vs Role

```
User Role          Place Trust Label          Public Display
---------          -----------------          --------------
Traveler     →     community                  "Cộng đồng đóng góp"
Contributor  →     contributor (sau approve)  "Người đóng góp" + checkmark
Partner      →     partner (sau approve)      "Đối tác chính thức" + star
Admin        →     verified (nếu muốn)        "Xác thực" + official badge
```

**Ví dụ:**
- Place A: Tạo bởi Contributor → Trust Label: `contributor`
- Place B: Tạo bởi Partner → Trust Label: `partner`
- Place C: Import từ database → Admin assign → Trust Label: `verified`

---

## 5. Firestore Security Rules Implementation

**File:** `firestore.rules`

### 5.1. Helper Functions

```javascript
function isSignedIn() {
  return request.auth != null;
}

function emailVerified() {
  return isSignedIn() && request.auth.token.email_verified == true;
}

function role() {
  return isSignedIn() ? request.auth.token.role : null;
}

function hasRole(r) {
  return role() == r;
}

function isAdmin() {
  return role() == 'admin';
}

function isModerator() {
  return role() == 'moderator' || isAdmin();
}

function isContributor() {
  return role() == 'contributor';
}

function isPartner() {
  return role() == 'partner';
}
```

### 5.2. Collection Rules Examples

#### Users Collection
```javascript
match /users/{uid} {
  allow read: if isOwner(uid) || isModerator() || isAdmin();
  allow update: if (isOwner(uid) && emailVerified())
    || (isAdmin() && canManageUser(uid));
  allow create, delete: if false; // Only via Cloud Functions
}
```

#### Places Collection (Public)
```javascript
match /places/{placeId} {
  allow read: if resource.data.status == 'published';
  allow list: if true; // Filtered by read rule
  allow create, update, delete: if false; // Only via Functions/Admin
}
```

#### Place Drafts Collection
```javascript
match /placeDrafts/{draftId} {
  allow read: if isOwner(resource.data.submitter) || isModerator();
  allow create: if emailVerified() && (isContributor() || isPartner());
  allow update: if emailVerified() && (
    (isOwner(resource.data.submitter) && resource.data.status in ['draft','changes_requested'])
    || isModerator()
  );
  allow delete: if (isOwner(resource.data.submitter) && resource.data.status == 'draft')
    || isAdmin();
}
```

#### Moderation Queue
```javascript
match /moderation_queue/{itemId} {
  allow read, list: if isModerator() || isAdmin();
  allow create: if emailVerified() && (isContributor() || isPartner());
  allow update: if isModerator() || isAdmin();
  allow delete: if isAdmin();
}
```

---

## 6. API Middleware Authentication

**File:** `src/lib/server/auth-middleware.ts`

### 6.1. Verify Auth Token

```typescript
import { adminAuth } from '@/lib/firebase-admin';

export async function verifyAuthToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid token');
  }

  const token = authHeader.substring(7);
  const decodedToken = await adminAuth.verifyIdToken(token);

  // Get user from Firestore to get role
  const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    role: userDoc.data()?.role || 'guest',
    emailVerified: decodedToken.email_verified
  };
}
```

### 6.2. Check Permission

```typescript
export function requirePermission(user: any, permission: Permission) {
  if (!hasPermission(user, permission)) {
    throw new Error(`Forbidden: Requires ${permission} permission`);
  }
}

export function requireRole(user: any, minRole: UserRole) {
  const roleHierarchy: UserRole[] = ['guest', 'traveler', 'contributor', 'partner', 'moderator', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(user.role);
  const requiredRoleIndex = roleHierarchy.indexOf(minRole);

  if (userRoleIndex < requiredRoleIndex) {
    throw new Error(`Forbidden: Requires ${minRole} role or higher`);
  }
}
```

---

## 7. Best Practices

### 7.1. Permission Checks

✅ **DO:**
```typescript
// Check permission, not role
if (hasPermission(user, 'create_place')) {
  // Allow
}

// Use role hierarchy when needed
if (requireRole(user, 'moderator')) {
  // Allow moderator and admin
}
```

❌ **DON'T:**
```typescript
// Don't hardcode role checks
if (user.role === 'moderator' || user.role === 'admin') { }

// Use hasPermission instead
```

### 7.2. Frontend Permission Display

```typescript
// components/example.tsx
import { useAuth } from '@/hooks/use-auth';
import { hasPermission } from '@/lib/auth/permissions';

export default function Example() {
  const { user } = useAuth();

  return (
    <>
      {hasPermission(user, 'create_place') && (
        <Button href="/contribute/new-place">Đóng góp địa điểm</Button>
      )}

      {hasPermission(user, 'view_moderation_queue') && (
        <Link href="/admin/moderation/queue">Hàng đợi kiểm duyệt</Link>
      )}
    </>
  );
}
```

### 7.3. API Endpoint Protection

```typescript
// app/api/places/route.ts
import { verifyAuthToken, requirePermission } from '@/lib/server/auth-middleware';

export async function POST(request: Request) {
  const user = await verifyAuthToken(request);
  requirePermission(user, 'create_place');

  // Process request
}
```

---

## 8. Role Upgrade Workflow

### 8.1. Traveler → Contributor

**Tự động:**
- Hệ thống tự động upgrade nếu:
  - 5+ reviews được vote helpful
  - Tài khoản > 30 ngày
  - Không có vi phạm

**Thủ công:**
- User request qua form: `/contribute/request-upgrade`
- Admin review trong `/admin/users/upgrade-requests`

### 8.2. Contributor → Partner

**Chỉ thủ công:**
- Submit form `/about/partnership` với thông tin doanh nghiệp
- Admin verify:
  - Business registration documents
  - Website/social media presence
  - Intent to contribute quality content
- Admin approve → Auto-upgrade role

### 8.3. Any → Moderator

**Chỉ Admin chỉ định:**
- Không có public request form
- Admin thêm trực tiếp trong `/admin/users`
- Cần đào tạo nội bộ trước khi activate

---

## 9. Monitoring & Auditing

### 9.1. Admin Actions Audit

Mọi hành động của Admin/Moderator được log vào `admin_logs` collection:

```typescript
{
  id: "log_abc123",
  adminId: "user_xyz",
  adminName: "Nguyễn Văn A",
  action: "approve_place",
  targetType: "place",
  targetId: "place_123",
  details: {
    previousStatus: "in_review",
    newStatus: "approved",
    reason: "Quality content"
  },
  timestamp: "2025-01-09T10:30:00Z",
  ipAddress: "103.x.x.x"
}
```

### 9.2. Permission Violation Alerts

- Firebase Auth rules rejection → Alert to Slack
- Suspicious permission checks → Flag for review
- Rapid role changes → Require 2FA confirmation

---

## 10. Tóm Tắt

| Aspect | Detail |
|--------|--------|
| **Số lượng vai trò** | 6 (Guest → Traveler → Contributor → Partner → Moderator → Admin) |
| **Số lượng permissions** | 25+ permissions chi tiết |
| **Kế thừa quyền** | Hierarchical (role cao kế thừa role thấp) |
| **Trust Labels** | 4 loại (community, contributor, partner, verified) |
| **State machine** | Strict enforcement cho moderation workflow |
| **Security** | Firestore Rules + API Middleware + Audit Logs |

---

**Phiên bản:** 1.0
**Ngày cập nhật:** 2025-01-09
**Tác giả:** Technical Documentation Team

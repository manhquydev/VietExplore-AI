# Technical Requirements – RBAC (Giai đoạn 1)

> Phạm vi: Phân quyền dựa trên vai trò (RBAC) cho backend của dự án “Du Lịch Việt” – Lean MVP. Bao gồm mô hình vai trò, permission, mapping vào API endpoint, middleware kiểm tra quyền, audit log, và kịch bản vận hành moderation.

---

## 1) Vai trò & Mô tả

- **Guest**: người dùng chưa đăng nhập; chỉ xem nội dung công khai, dùng AI demo.
- **Traveler**: người dùng đã đăng nhập; tạo/lưu/chia sẻ lịch trình; đề xuất địa điểm/chỉnh sửa; báo cáo vi phạm.
- **Contributor**: người dùng xác minh; tạo bản nháp địa điểm có cấu trúc, đính kèm nguồn; nộp duyệt.
- **Community Partner**: tổ chức đối tác; nộp nội dung chính thống; luồng duyệt nhanh (ưu tiên); *không* tự xuất bản ở giai đoạn 1.
- **Moderator**: kiểm duyệt; duyệt/sửa/ẩn nội dung; xử lý báo cáo; không duyệt nội dung do chính mình nộp.
- **Admin**: quản trị hệ thống; phân quyền; gán nhãn “Verified”; thiết lập SLA; gỡ khẩn cấp.

---

## 2) Permission Model

### 2.1. Danh mục Permission Keys

- **Nội dung công khai**
  - `content.view_public`
- **Lịch trình (Itinerary)**
  - `itinerary.create`
  - `itinerary.update_own`
  - `itinerary.view_own`
  - `itinerary.share_public`
  - `itinerary.delete_own`
- **Địa điểm (Place)**
  - `place.suggest` (Traveler gửi đề xuất)
  - `place.create_draft` (Contributor/Partner tạo draft)
  - `place.submit_review`
  - `place.edit_own_draft`
  - `place.view_review_status`
- **Moderation**
  - `moderation.queue_view`
  - `moderation.approve`
  - `moderation.reject`
  - `moderation.request_changes`
  - `moderation.hide`
  - `moderation.resolve_report`
- **Báo cáo vi phạm (Report)**
  - `report.create`
  - `report.view`
- **Quản trị**
  - `admin.manage_roles`
  - `admin.assign_verified_label`
  - `admin.emergency_remove`
  - `admin.view_audit_logs`

### 2.2. RBAC Matrix (Giai đoạn 1)

| Role              | content.view\_public | itinerary.create | itinerary.update\_own | itinerary.view\_own | itinerary.share\_public | itinerary.delete\_own | place.suggest | place.create\_draft | place.submit\_review | place.edit\_own\_draft | place.view\_review\_status | moderation.queue\_view | moderation.approve/reject/request\_changes/hide | report.create | report.view | admin.manage\_roles | admin.assign\_verified\_label | admin.emergency\_remove | admin.view\_audit\_logs |
| ----------------- | -------------------- | ---------------- | --------------------- | ------------------- | ----------------------- | --------------------- | ------------- | ------------------- | -------------------- | ---------------------- | -------------------------- | ---------------------- | ----------------------------------------------- | ------------- | ----------- | ------------------- | ----------------------------- | ----------------------- | ----------------------- |
| Guest             | ✅                    | ❌                | ❌                     | ❌                   | ❌                       | ❌                     | ❌             | ❌                   | ❌                    | ❌                      | ❌                          | ❌                      | ❌                                               | ❌             | ❌           | ❌                   | ❌                             | ❌                       | ❌                       |
| Traveler          | ✅                    | ✅                | ✅                     | ✅                   | ✅                       | ✅                     | ✅             | ❌                   | ❌                    | ❌                      | ✅ (đề xuất)                | ❌                      | ❌                                               | ✅             | ❌           | ❌                   | ❌                             | ❌                       | ❌                       |
| Contributor       | ✅                    | ✅                | ✅                     | ✅                   | ✅                       | ✅                     | ✅             | ✅                   | ✅                    | ✅                      | ✅                          | ❌                      | ❌                                               | ✅             | ❌           | ❌                   | ❌                             | ❌                       | ❌                       |
| Community Partner | ✅                    | ✅                | ✅                     | ✅                   | ✅                       | ✅                     | ✅             | ✅                   | ✅ (fast-track flag)  | ✅                      | ✅                          | ❌                      | ❌                                               | ✅             | ❌           | ❌                   | ❌                             | ❌                       | ❌                       |
| Moderator         | ✅                    | ✅                | ✅                     | ✅                   | ✅                       | ✅                     | ✅             | ❌                   | ❌                    | ❌                      | ✅                          | ✅                      | ✅                                               | ✅             | ✅           | ❌                   | ✅ (gán nhãn bài/địa điểm)     | ❌                       | ✅                       |
| Admin             | ✅                    | ✅                | ✅                     | ✅                   | ✅                       | ✅                     | ✅             | ✅                   | ✅                    | ✅                      | ✅                          | ✅                      | ✅                                               | ✅             | ✅           | ✅                   | ✅                             | ✅                       | ✅                       |

*Lưu ý:* Moderator **không được** duyệt bài do chính mình nộp. Kiểm tra này nằm ở layer moderation middleware.

---

## 3) Resource Model & Ownership

- **User**: `{ id, role, status, verified_flags }`
- **Itinerary**: `{ id, owner_id, title, days, items[], visibility: public|private, status: active|deleted }`
- **Place**: `{ id, slug, title, province, type, summary, images[], sources[], label: community|contributor|partner|verified, state: draft|submitted|in_review|published|hidden, created_by, submitted_by, last_review_by }`
- **Report**: `{ id, target_type: place|itinerary, target_id, reason, evidence[], status: open|in_review|resolved|dismissed, created_by, assigned_to }`
- **AuditLog**: `{ id, actor_id, action, resource_type, resource_id, before, after, ts }`

**Ownership rules:**

- `itinerary.*_own` áp dụng khi `owner_id === req.user.id`.
- Contributor/Partner chỉ chỉnh sửa **draft của chính họ**.

---

## 4) API Endpoints & Policy Mapping (ví dụ REST)

### 4.1. Public Content

- `GET /api/places` → `content.view_public`
- `GET /api/places/:slug` → `content.view_public`
- `GET /api/itineraries/:slug` (public) → `content.view_public`

### 4.2. Itinerary (yêu cầu auth)

- `POST /api/itineraries` → `itinerary.create`
- `GET /api/me/itineraries` → `itinerary.view_own`
- `PATCH /api/itineraries/:id` → `itinerary.update_own` (check ownership)
- `DELETE /api/itineraries/:id` → `itinerary.delete_own` (soft-delete)
- `POST /api/itineraries/:id/share` → `itinerary.share_public`

### 4.3. Place Suggest & Draft

- `POST /api/places/suggest` (Traveler) → `place.suggest`
- `POST /api/places/drafts` (Contributor/Partner) → `place.create_draft`
- `PATCH /api/places/drafts/:id` → `place.edit_own_draft`
- `POST /api/places/drafts/:id/submit` → `place.submit_review`
- `GET /api/places/drafts/:id/status` → `place.view_review_status`

### 4.4. Moderation

- `GET /api/mod/queue` → `moderation.queue_view`
- `POST /api/mod/review/:id/approve` → `moderation.approve`
- `POST /api/mod/review/:id/reject` → `moderation.reject`
- `POST /api/mod/review/:id/request-changes` → `moderation.request_changes`
- `POST /api/mod/content/:id/hide` → `moderation.hide`

> Middleware phải chặn trường hợp Moderator duyệt bài do chính mình nộp: nếu `resource.created_by === req.user.id` → 403.

### 4.5. Report

- `POST /api/reports` → `report.create`
- `GET /api/reports` (Moderator/Admin) → `report.view`
- `POST /api/mod/reports/:id/resolve` → `moderation.resolve_report`

### 4.6. Admin

- `POST /api/admin/roles/assign` → `admin.manage_roles`
- `POST /api/admin/labels/verified` → `admin.assign_verified_label`
- `POST /api/admin/content/:id/emergency-remove` → `admin.emergency_remove`
- `GET /api/admin/audit-logs` → `admin.view_audit_logs`

---

## 5) Middleware Kiểm tra Quyền (Pseudo-code)

```ts
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

function permit(permission) {
  return async (req, res, next) => {
    const user = req.user; // { id, role }
    const allowed = await acl.can(user.role, permission);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// Ownership guard for itinerary
async function ensureOwner(req, res, next) {
  const it = await Itinerary.findById(req.params.id);
  if (!it || it.owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  next();
}

// Moderator self-review guard
async function preventSelfApproval(req, res, next) {
  const item = await Content.findById(req.params.id);
  if (item.created_by === req.user.id) return res.status(403).json({ error: 'Self-review forbidden' });
  next();
}
```

---

## 6) State Machine – Place

```
Draft -> Submitted -> InReview -> (Approved -> Published) | (Rejected -> Draft)
Published -> Hidden (by Moderator/Admin) -> (Republish via InReview)
```

**Quy tắc:**

- Chỉ Moderator có thể chuyển `InReview -> Approved/Rejected/RequestChanges`.
- Admin có thể `Hidden` bất kỳ nội dung (emergency remove).

---

## 7) Audit & Logging

- Mọi hành động thay đổi trạng thái hoặc quyền phải ghi vào **AuditLog**.
- Lưu `before/after` đối với nội dung quan trọng (Place, Itinerary).
- Nhật ký phải tra cứu theo `actor_id`, `resource_id`, `range time`.

---

## 8) SLA & Rate Limiting

- Báo cáo vi phạm: tiếp nhận tức thời, xử lý sơ bộ ≤ 48h.
- Hàng đợi moderation: Contributor ≤ 3 ngày, Partner ≤ 48h.
- Rate limit đề xuất/suggest: ≤ 5 lần/giờ/người dùng (429 quá hạn mức).

---

## 9) Mô hình triển khai (tuỳ công nghệ)

**A. Node.js + Strapi/Express**

- Sử dụng **policy/middleware** của Strapi hoặc custom middleware Express.
- Lưu `roles`, `permissions` trong bảng cấu hình; có bảng map role → permission.
- JWT chứa `sub`, `role`, `scopes` (tối giản). Validate ở gateway.

**B. WordPress (CPT + Capabilities)**

- CPT: `place`, `itinerary`.
- Tạo `capabilities` tương ứng: `edit_place`, `publish_place` (không cấp cho Contributor/Partner), `read_place`, `edit_itinerary`, `read_itinerary`, `delete_itinerary`.
- Dùng plugin như **Members** để map capabilities vào roles: traveler, contributor, partner, moderator, admin.
- Hook `pre_post_update` để chặn moderator tự duyệt bài của mình.

---

## 10) Test Matrix (QA)

- **Auth**: Guest không truy cập được endpoint yêu cầu auth.
- **Ownership**: Người dùng A không sửa/lấy itinerary của B.
- **Moderation**: Moderator không duyệt bài do chính mình nộp.
- **State Transitions**: chỉ cho phép chuyển trạng thái hợp lệ.
- **Rate limit**: đề xuất quá 5 lần/giờ trả 429.
- **Audit**: mọi hành động viết log đầy đủ.

---

## 11) Mở rộng giai đoạn 2 (định hướng)

- Ủy quyền xuất bản có điều kiện cho Partner (theo danh mục được giao).
- Phân quyền theo danh mục/địa lý (scope-based RBAC).
- Nhãn tin cậy tự động dựa trên thang điểm tín nhiệm contributor.
- Tách quyền edit/publish theo **workflow** chi tiết (Editor role nếu cần).

---

✅ Tài liệu này có thể đưa thẳng cho dev backend để cấu hình RBAC, viết middleware kiểm tra quyền, và mapping vào các API đã liệt kê.


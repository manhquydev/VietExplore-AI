# Technical Requirements – RBAC (Role-Based Access Control)

## 1. Mục tiêu
- Đảm bảo hệ thống phân quyền rõ ràng, minh bạch.
- Tránh xung đột lợi ích (Moderator không duyệt nội dung do chính mình nộp).
- Cho phép mở rộng linh hoạt (thêm role mới, thêm quyền mới trong tương lai).

---

## 2. Vai trò hệ thống (Roles)
1. **Guest** – Người dùng chưa đăng nhập.
2. **Traveler** – Người dùng đăng nhập cơ bản.
3. **Contributor** – Người dùng đã xác minh, có quyền nộp nội dung.
4. **Community Partner** – Đối tác cộng đồng, có luồng duyệt nhanh.
5. **Moderator** – Kiểm duyệt viên, xử lý duyệt nội dung & báo cáo.
6. **Admin** – Quản trị cấp cao, phân quyền & xử lý khẩn cấp.

---

## 3. Danh sách quyền (Permissions)
- `view_public` → Xem nội dung công khai.
- `search_content` → Tìm kiếm địa điểm, lịch trình.
- `use_ai_demo` → Dùng AI ở chế độ tham khảo.
- `create_itinerary` → Tạo/lưu/chia sẻ lịch trình.
- `suggest_place` → Đề xuất địa điểm/chỉnh sửa.
- `submit_content` → Nộp nội dung mới (địa điểm, lịch trình mẫu).
- `fasttrack_submit` → Nộp nhanh (chỉ Partner).
- `review_content` → Duyệt nội dung trong Moderation Dashboard.
- `handle_reports` → Xử lý báo cáo vi phạm.
- `hide_content` → Ẩn nội dung không phù hợp.
- `assign_verified` → Gắn nhãn “Đã xác minh”.
- `manage_roles` → Quản lý phân quyền hệ thống.
- `emergency_remove` → Gỡ khẩn cấp nội dung.

---

## 4. RBAC Matrix
| Role            | view_public | search_content | use_ai_demo | create_itinerary | suggest_place | submit_content | fasttrack_submit | review_content | handle_reports | hide_content | assign_verified | manage_roles | emergency_remove |
|-----------------|-------------|----------------|-------------|------------------|---------------|----------------|------------------|----------------|----------------|--------------|-----------------|--------------|-----------------|
| Guest           | ✅           | ✅              | ✅ (demo)    | ❌                | ❌             | ❌              | ❌                | ❌              | ❌              | ❌            | ❌               | ❌            | ❌               |
| Traveler        | ✅           | ✅              | ✅           | ✅                | ✅             | ❌              | ❌                | ❌              | ✅ (báo cáo)   | ❌            | ❌               | ❌            | ❌               |
| Contributor     | ✅           | ✅              | ✅           | ✅                | ✅             | ✅              | ❌                | ❌              | ✅             | ❌            | ❌               | ❌            | ❌               |
| Partner         | ✅           | ✅              | ✅           | ✅                | ✅             | ✅              | ✅                | ❌              | ✅             | ❌            | ❌               | ❌            | ❌               |
| Moderator       | ✅           | ✅              | ✅           | ✅                | ✅             | ❌              | ❌                | ✅              | ✅             | ✅            | ❌               | ❌            | ❌               |
| Admin           | ✅           | ✅              | ✅           | ✅                | ✅             | ✅              | ✅                | ✅              | ✅             | ✅            | ✅               | ✅            | ✅               |

---

## 5. Ánh xạ vào Backend
### 5.1. WordPress (nếu dùng)
- Sử dụng plugin **Members** hoặc **Capability Manager Enhanced**.
- Tạo custom roles: traveler, contributor, partner, moderator, admin.
- Gán capabilities tương ứng theo RBAC Matrix.

### 5.2. Strapi (hoặc Node.js custom backend)
- Định nghĩa roles trong collection `roles`.
- Định nghĩa permissions trong collection `permissions`.
- Tạo bảng quan hệ `role_permissions` (nhiều-nhiều).
- Middleware check:
  ```js
  // Pseudocode
  function authorize(requiredPermission) {
    return (req, res, next) => {
      const userRole = req.user.role;
      const hasPermission = checkPermission(userRole, requiredPermission);
      if (!hasPermission) return res.status(403).json({ error: 'Forbidden' });
      next();
    };
  }
  ```

### 5.3. API Endpoint Mapping
- `GET /places` → requires: `view_public`
- `POST /itineraries` → requires: `create_itinerary`
- `POST /places/suggest` → requires: `suggest_place`
- `POST /places/submit` → requires: `submit_content`
- `POST /places/fasttrack` → requires: `fasttrack_submit`
- `POST /moderation/review` → requires: `review_content`
- `POST /moderation/report` → requires: `handle_reports`
- `POST /moderation/hide` → requires: `hide_content`
- `POST /admin/verify` → requires: `assign_verified`
- `POST /admin/roles` → requires: `manage_roles`
- `POST /admin/emergency-remove` → requires: `emergency_remove`

---

## 6. Quy trình vận hành
- **Traveler/Contributor/Partner** → Submit nội dung.
- **Moderator** → Review trong dashboard → Approve/Reject/Request edit.
- **Admin** → Audit định kỳ, xử lý khẩn cấp, quản lý phân quyền.

---

✅ Với RBAC matrix & technical mapping này, dev backend có thể triển khai **set quyền phân tầng rõ ràng**, dễ mở rộng và đảm bảo minh bạch trong vận hành dự án.


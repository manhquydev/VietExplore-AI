# Báo cáo tiến độ dự án "Du Lịch Việt"

Đây là tài liệu theo dõi tiến độ phát triển dự án dựa trên kế hoạch trong `DEVELOPMENT_PLAN_CONTENT_WORKFLOW.md`.

*Cập nhật lần cuối: auto*

---

## Trạng thái tổng quan

| Cột mốc                                                    | Trạng thái      | Ghi chú                               |
| ---------------------------------------------------------- | --------------- | ------------------------------------- |
| **1. Củng cố và kiểm tra hệ thống phân quyền (RBAC)**       | 🔄 **In Progress** | Hoàn thành Hook `useAuth` cho UI.     |
| **2. Xây dựng tính năng đóng góp bài viết**                  | ⬜️ **Not Started** |                                       |
| **3. Xây dựng hệ thống kiểm duyệt**                          | ⬜️ **Not Started** |                                       |
| **4. Hoàn thiện và Tích hợp**                               | ⬜️ **Not Started** |                                       |

---

## Chi tiết Cột mốc 1: Củng cố và kiểm tra hệ thống phân quyền (RBAC)

**Mục tiêu:** Đảm bảo hệ thống phân quyền hoạt động chính xác ở cả backend (API guards) và frontend (hiển thị UI).

| Nhiệm vụ                  | Trạng thái    | Chi tiết                                                                                                                              |
| ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **1.1. Backend (API)**    | 🟧 **To Do**      | - Rà soát lại tất cả các API endpoints. <br> - Viết Unit Test để xác minh quyền truy cập cho từng vai trò.                               |
| **1.2. Frontend (UI)**    | ✅ **Done**     | - Hook `useAuth` đã có sẵn và cung cấp thông tin `user.role`. Sẵn sàng cho việc ẩn/hiện các thành phần UI.                             |
| **1.3. Kiểm tra E2E**     | 🟧 **To Do**      | - Sử dụng script để tạo người dùng với các vai trò khác nhau. <br> - Đăng nhập và kiểm tra thủ công luồng phân quyền.                 |

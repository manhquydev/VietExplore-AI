# Kế hoạch phát triển dự án "Du Lịch Việt" - Giai đoạn 2: Hoàn thiện luồng nội dung

## 1. Tầm nhìn & Mục tiêu

Sau khi đã thiết lập thành công môi trường local, mục tiêu của giai đoạn này là hiện thực hóa luồng nghiệp vụ cốt lõi của dự án: cho phép người dùng đóng góp nội dung, và đội ngũ quản trị kiểm duyệt nội dung đó một cách hiệu quả.

**Mục tiêu chính:**
1.  **Hoàn thiện hệ thống phân quyền (RBAC):** Đảm bảo người dùng chỉ có thể thực hiện các hành động được cho phép theo vai trò của họ.
2.  **Xây dựng luồng tạo và gửi bài viết (Place Draft):** Cung cấp giao diện và API cho `Contributor` và `Community Partner` để tạo và gửi bài viết brouillon.
3.  **Xây dựng hệ thống kiểm duyệt (Moderation):** Cung cấp giao diện và API cho `Moderator` và `Admin` để xem, duyệt, và quản lý các bài viết đang chờ.
4.  **Tự động hóa luồng xử lý:** Sử dụng Cloud Functions để tự động hóa việc tạo yêu cầu kiểm duyệt, xử lý hình ảnh và xuất bản nội dung.

## 2. Các giai đoạn thực hiện (Milestones)

Chúng ta sẽ chia kế hoạch thành 4 cột mốc chính, tập trung vào từng phần của luồng nghiệp vụ.

---

### Cột mốc 1: Củng cố và kiểm tra hệ thống phân quyền (RBAC)

**Mục tiêu:** Đảm bảo hệ thống phân quyền hoạt động chính xác ở cả backend (API guards) và frontend (hiển thị UI).

**Các bước thực hiện:**
1.  **Backend (API):**
    *   **Kiểm tra Middleware:** Rà soát lại tất cả các API endpoints đã được định nghĩa trong `docs/doc_phân quyền/technical_requirements_rbac_du_lịch_việt_giai_doạn_1.md`.
    *   **Viết Unit Test:** Viết các bài test để xác minh:
        *   Người dùng `Guest` không thể truy cập các API cần xác thực.
        *   `Traveler` không thể truy cập API của `Contributor`.
        *   `Contributor` không thể truy cập API của `Moderator`.
        *   `Moderator` không thể tự duyệt bài của chính mình.
2.  **Frontend (UI):**
    *   **Tạo Context/Hook cho vai trò:** Xây dựng một hook (`useRole` hoặc tương tự) để dễ dàng truy cập vai trò và quyền của người dùng hiện tại trong các component React.
    *   **Ẩn/hiện component theo vai trò:**
        *   Nút "Đóng góp bài viết" chỉ hiển thị cho `Contributor` và `Community Partner`.
        *   Tab "Kiểm duyệt" trên thanh điều hướng chỉ hiển thị cho `Moderator` và `Admin`.
        *   Các nút hành động (Approve/Reject) trong trang kiểm duyệt bị vô hiệu hóa nếu người xem không phải là `Moderator`.
3.  **Kiểm tra thủ công (E2E):**
    *   Sử dụng script `setup-admin-local.js` để tạo người dùng với các vai trò khác nhau.
    *   Đăng nhập với từng vai trò và kiểm tra các tính năng, đảm bảo các giới hạn được áp dụng đúng.

---

### Cột mốc 2: Xây dựng tính năng đóng góp bài viết

**Mục tiêu:** Hoàn thiện giao diện và logic cho phép `Contributor` tạo, sửa và gửi bài viết (Place Draft).

**Các bước thực hiện:**
1.  **Tạo trang "Viết bài mới" (`/contribute/new-place`):**
    *   Thiết kế form nhập liệu dựa trên cấu trúc của `Place` trong `docs/doc_phân quyền/technical_requirements_rbac_du_lịch_việt_giai_doạn_1.md`.
    *   Bao gồm các trường: Tiêu đề, Tóm tắt, Tỉnh thành, Loại hình, Nguồn tham khảo.
    *   Tích hợp component tải ảnh lên (sử dụng Cloud Storage).
2.  **API Backend:**
    *   Tạo API endpoint `POST /api/places/drafts` để lưu bài viết brouillon vào collection `placeDrafts` trên Firestore.
    *   Tạo API endpoint `PATCH /api/places/drafts/:id` để cập nhật bài viết.
    *   Tạo API endpoint `POST /api/places/drafts/:id/submit` để người dùng gửi bài đi kiểm duyệt. Endpoint này sẽ gọi Cloud Function `submitDraftForReview`.
3.  **Trang "Bài viết của tôi" (`/contribute/my-drafts`):**
    *   Hiển thị danh sách các bài viết brouillon mà người dùng đã tạo.
    *   Hiển thị trạng thái của từng bài (`Draft`, `Submitted`, `In Review`, `Published`, `Changes Requested`).
    *   Cho phép người dùng chỉnh sửa các bài viết đang ở trạng thái `Draft` hoặc `Changes Requested`.

---

### Cột mốc 3: Xây dựng hệ thống kiểm duyệt

**Mục tiêu:** Cung cấp công cụ cho `Moderator` để quản lý và duyệt bài viết.

**Các bước thực hiện:**
1.  **Tạo trang "Hàng đợi kiểm duyệt" (`/moderation/dashboard`):**
    *   Hiển thị danh sách các bài viết đang chờ duyệt (`status: 'submitted'` hoặc `'in_review'`) từ collection `moderation/requests`.
    *   Hiển thị thông tin quan trọng: Tiêu đề, Người gửi, Vai trò người gửi, Hạn chót SLA.
2.  **Tạo trang "Chi tiết kiểm duyệt" (`/moderation/review/:id`):**
    *   Hiển thị đầy đủ nội dung của bài viết brouillon.
    *   Cung cấp các nút hành động cho `Moderator`:
        *   **"Duyệt" (Approve):** Gọi Cloud Function `modDecisionApprove`.
        *   **"Từ chối" (Reject):** Mở một dialog yêu cầu nhập lý do, sau đó gọi `modDecisionReject`.
        *   **"Yêu cầu chỉnh sửa" (Request Changes):** Mở dialog yêu cầu nhập ghi chú, sau đó gọi `modDecisionRequestEdit`.
3.  **Backend (Cloud Functions):**
    *   Kiểm tra và hoàn thiện các Cloud Functions đã được định nghĩa trong `docs/doc_backend/cloud_functions_nghiệp_vụ_moderation_sla_nhan_tin_cậy_tai_liệu_4.md`.
    *   Đặc biệt chú trọng vào hàm `modDecisionApprove` và trigger `onDraftApproved` để đảm bảo:
        *   Nội dung từ `placeDrafts` được chuyển sang collection `places`.
        *   Hình ảnh được xử lý và chuyển từ thư mục brouillon sang thư mục chính thức.
        *   Nhãn tin cậy (Trust Label) được gán tự động dựa trên vai trò của người gửi.

---

### Cột mốc 4: Hoàn thiện và Tích hợp

**Mục tiêu:** Kết nối tất cả các thành phần, kiểm tra toàn bộ luồng và chuẩn bị cho việc sử dụng thực tế.

**Các bước thực hiện:**
1.  **Kiểm tra toàn bộ luồng (E2E Testing):**
    *   **Luồng thành công:** Đăng nhập với vai trò `Contributor` -> Tạo bài viết brouillon -> Gửi đi kiểm duyệt -> Đăng nhập với vai trò `Moderator` -> Duyệt bài viết -> Kiểm tra xem bài viết đã được xuất bản ở trang public hay chưa, và hình ảnh đã được xử lý đúng cách chưa.
    *   **Luồng yêu cầu chỉnh sửa:** `Moderator` yêu cầu chỉnh sửa -> `Contributor` nhận được thông báo, chỉnh sửa bài viết và gửi lại -> `Moderator` duyệt lại.
2.  **Thông báo (Notifications):** (Nếu có thời gian)
    *   Cân nhắc việc thêm hệ thống thông báo đơn giản (ví dụ: một mục "Thông báo" trên trang cá nhân) để `Contributor` biết khi bài viết của họ được duyệt hoặc cần chỉnh sửa.
3.  **Hoàn thiện UI/UX:**
    *   Rà soát lại các trang đã tạo, đảm bảo giao diện thân thiện, dễ sử dụng.
    *   Thêm các thông báo (toast/snackbar) để phản hồi hành động của người dùng (ví dụ: "Gửi bài thành công!", "Bài viết đã được duyệt.").

## 3. Công nghệ và Công cụ

*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend:** Firebase (Firestore, Cloud Functions, Cloud Storage, Authentication)
*   **Kiểm thử:** Jest/Vitest (Unit Test), Firebase Emulators (E2E Testing)
*   **Quản lý mã nguồn:** Git

## 4. Phân công (Gợi ý)

*   **Task 1 (RBAC):** Backend Developer, Frontend Developer
*   **Task 2 (Đóng góp):** Frontend Developer, Backend Developer
*   **Task 3 (Kiểm duyệt):** Frontend Developer, Backend Developer
*   **Task 4 (Hoàn thiện):** Full-stack Developer, QA/Tester

Bằng cách bám sát kế hoạch này, chúng ta sẽ có một lộ trình rõ ràng để hoàn thiện các tính năng cốt lõi của dự án một cách có hệ thống và hiệu quả.
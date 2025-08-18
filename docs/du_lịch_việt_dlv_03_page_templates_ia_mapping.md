# DLV‑03 · Page Templates & IA Mapping

> Bố cục bám sát sitemap + tính năng giai đoạn 1. Nơi thiếu, đánh dấu **[GIẢ ĐỊNH]**.

---

## 1) Trang chủ (`/`)
- **Hero**: tiêu đề lớn (Display clamp) + mô tả ngắn + CTA `Bắt đầu với AI` (primary) và `Khám phá địa điểm` (secondary). Ảnh máy bay/biển nền, khối bo 24, khoảng trắng rộng.
- **Tìm kiếm nhanh**: input + bộ lọc cơ bản (vùng, tỉnh, loại hình).
- **Vùng nổi bật**: 3 thẻ (Bắc/Trung/Nam) → trang vùng.
- **Feed**: lưới địa điểm mới + lịch trình nổi bật (card 3:2).
- **Đối tác/nhãn tin cậy**: hàng logo xám mờ; copy “Phi lợi nhuận – dữ liệu xác thực”.

## 2) Danh sách địa điểm (`/places/...`)
- **Filter bar** (sticky): Vùng · Tỉnh · Loại hình; chip chọn được; hiển thị số kết quả.
- **Layout**: 3 cột (lg), 2 cột (md), 1 cột (sm). Card hiển thị ảnh, tên, tỉnh, chip loại hình, nhãn tin cậy.
- **Map view** [GIẢ ĐỊNH]: toggle chuyển lưới ↔ bản đồ đơn giản.

## 3) Trang chi tiết địa điểm (`/places/<region>/<province>/<slug>/`)
- **Gallery** 3–5 ảnh; hero media 16:9; overlay để đảm bảo contrast.
- **Nội dung chính**: tên, tỉnh, loại hình, mô tả, nguồn, nhãn tin cậy (Community/Contributor/Partner/Verified).
- **CTA**: “Thêm vào lịch trình”.
- **Mini AI**: ô “Hỏi về địa điểm này”.
- **Block liên quan**: địa điểm tương tự, lịch trình có chứa điểm này.
- **Báo cáo/Đề xuất chỉnh sửa** (link cuối trang).

## 4) Itinerary Builder (`/itineraries/builder/`)
- **Header phụ**: thông số cơ bản (ngày, ngân sách, loại chuyến đi) + CTA sinh lịch trình bằng AI.
- **Canvas**: timeline/ngày; thẻ điểm kéo‑thả; ước tính chi phí tổng [GIẢ ĐỊNH].
- **Sidebar**: danh sách gợi ý từ AI + filter.
- **Chia sẻ**: tạo link công khai `/itineraries/<slug>/`.

## 5) Trang lịch trình công khai (`/itineraries/<slug>/`)
- **Hero**: tên + số ngày + ngân sách; gallery nhỏ.
- **Nội dung**: danh sách ngày → điểm; tips & ghi chú.
- **CTA**: `Sao chép vào lịch trình của tôi` (cần đăng nhập).

## 6) Đóng góp nội dung (`/contribute/...`)
- **Wizard 3 bước**: Thông tin · Địa lý · Ảnh/Nguồn.
- **Progress**: stepper dọc (như ảnh tham khảo có dots).
- **Trạng thái**: Draft → Submitted → In Review → Published.
- **Trang “Bản nháp của tôi”**: bảng đơn giản, status chip.

## 7) Trợ lý AI (`/ai-assistant/...`)
- **Chat**: khung hội thoại + gợi ý nhanh + nút `Tạo lịch trình`.
- **Plan**: layout bảng/kanban hiển thị lịch trình sinh tự động, cho phép chỉnh sửa thủ công.

## 8) Community (`/community/...`) [GIẢ ĐỊNH]
- Announcements + Handbook.

## 9) Moderation Dashboard (`/moderation/dashboard/`)
- **Hàng đợi**: danh sách nội dung chờ duyệt + lọc theo loại/trạng thái.
- **Chi tiết**: hành động `Approve / Reject / Request edit / Hide`; Diff Viewer so sánh trước/sau.

## 10) Profile (`/profile/...`) [GIẢ ĐỊNH]
- Hồ sơ người dùng, đóng góp, huy hiệu.

---

## Layout kỹ thuật
- **Grid 12 cột**, gutter 24.
- **Section rhythm**: 64–80px desktop; 40–56px mobile.
- **Header sticky** 72px; **Footer** 3 cột; **Container** 1200px.

---

## SEO & Structured Data (on-page)
- `Place`, `Itinerary`, `BreadcrumbList` cho trang đích.
- Meta: Title, Description, OG image từ ảnh đầu của gallery.
- Internal link: địa điểm ↔ lịch trình liên quan.

---

## States rỗng & lỗi
- Empty state có minh hoạ; lỗi mạng hiển thị retry + contact.

---

## Ghi chú đồng bộ
- Quyền **Partner** mở rộng và field nâng cao (mùa đẹp, tiện ích, đông đúc) để giai đoạn 2 [GIẢ ĐỊNH].


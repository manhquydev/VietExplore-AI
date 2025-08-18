# 3) Sitemap & Kiến trúc thông tin (Lean – Giai đoạn 1)

## 3.1. Nguyên tắc thiết kế

- **Đơn giản – Khả thi – Tập trung cốt lõi**: giữ cấu trúc dễ duyệt, dễ mở rộng.
- **Minh bạch nguồn**: mọi nội dung hiển thị nhãn tin cậy (Community / Contributor / Partner / Verified).
- **Tích hợp AI tự nhiên**: AI xuất hiện trong trang địa điểm & lịch trình, không chỉ riêng một khu riêng lẻ.
- **Quy trình duyệt gọn nhẹ**: 1 dashboard duyệt + báo cáo cho Moderator.

---

## 3.2. Điều hướng toàn cục (Global Navigation)

**Top Nav:** Trang chủ · Địa điểm · Lịch trình · Đóng góp · Trợ lý AI · Cộng đồng · Về dự án · Đăng nhập

**Secondary Nav:**

- Địa điểm: Theo vùng · Theo tỉnh · Theo loại hình · Bản đồ
- Lịch trình: Trình tạo lịch · Lịch trình của tôi
- Đóng góp: Thêm địa điểm mới · Bản nháp
- Moderation (ẩn, chỉ Moderator/Admin): Dashboard

---

## 3.3. Sitemap Lean (Tree)

```text
/
├─ home/
│  ├─ tìm kiếm nhanh + CTA AI
│  ├─ vùng nổi bật
│  └─ feed: địa điểm mới + lịch trình nổi bật
│
├─ places/
│  ├─ regions/ (Bắc · Trung · Nam)
│  │  └─ <tinh-thanh>/
│  │     └─ <slug-dia-diem>/ (Trang chi tiết địa điểm)
│  ├─ types/ (Biển · Núi · Văn hóa · Ẩm thực · Check-in)
│  └─ map/ (Bản đồ đơn giản)
│
├─ itineraries/
│  ├─ builder/ (Trình tạo lịch trình với AI + kéo thả)
│  ├─ my/ (cần đăng nhập)
│  └─ <slug>/ (Trang lịch trình chia sẻ công khai)
│
├─ contribute/
│  ├─ new-place/ (Form 3 bước: Thông tin · Địa lý · Ảnh/Nguồn)
│  └─ my-drafts/
│
├─ ai-assistant/
│  ├─ chat/ (Hỏi đáp cơ bản)
│  └─ plan/ (Sinh lịch trình tự động)
│
├─ community/
│  ├─ announcements/
│  └─ handbook/
│
├─ moderation/ (Moderator/Admin)
│  └─ dashboard/
│
├─ profile/
│  ├─ me/
│  └─ <username>/
│
├─ about/
│  ├─ mission/
│  └─ contact/
│
├─ help/
│  └─ faq/
│
└─ legal/
   ├─ terms/
   ├─ privacy/
   └─ content-policy/
```

---

## 3.4. Loại nội dung (Content Types)

1. **Place (Địa điểm)**: tên, mô tả, tỉnh/thành, loại hình, 3–5 ảnh, nguồn, nhãn tin cậy.
2. **Itinerary (Lịch trình)**: độ dài, danh sách điểm, chi phí tổng ước tính.
3. **User Profile**: đóng góp, huy hiệu cơ bản.
4. **Report**: form báo cáo vi phạm.

---

## 3.5. Quy trình duyệt & Trạng thái

- **Traveler/Contributor/Partner** → nộp nội dung.
- **Moderator Dashboard** → Approve / Reject / Request edit.
- Trạng thái: Draft → Submitted → In Review → Published → Hidden.

---

## 3.6. Taxonomy & Search

- **Địa lý:** Vùng (Bắc/Trung/Nam) → Tỉnh/Thành.
- **Loại hình:** Biển, Núi, Văn hóa, Ẩm thực, Check-in.
- **Filter cơ bản:** theo vùng, tỉnh, loại hình.

---

## 3.7. URL Scheme

- `/places/bac-bo/ha-noi/ho-guom/`
- `/places/type/bien/`
- `/itineraries/da-nang-3-ngay/`

---

## 3.8. SEO On-page Lean

- Title, Meta description, OG image cơ bản.
- Structured Data: `Place`, `Itinerary`, `BreadcrumbList`.
- Internal linking từ địa điểm → lịch trình liên quan.

---

## 3.9. Ghi chú đồng bộ

- Một số quyền nâng cao của **Community Partner** (xuất bản ủy quyền) và field chi tiết của **Place** (mùa đẹp, tiện ích, đông đúc) sẽ được mở ở **giai đoạn 2**.

---

✅ Với Sitemap Lean này, dự án có thể **ra mắt nhanh, dễ quản lý, chi phí thấp** nhưng vẫn giữ được cốt lõi: dữ liệu địa điểm đáng tin + AI hỗ trợ lịch trình.


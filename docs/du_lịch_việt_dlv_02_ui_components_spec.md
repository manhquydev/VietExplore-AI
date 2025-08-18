# DLV‑02 · UI Components Spec (Tailwind‑first)

> Chỉ mô tả những thành phần có khả năng xuất hiện trong giai đoạn 1; phần khác đánh dấu **[GIẢ ĐỊNH]**. Tất cả trạng thái gồm `default · hover · active · focus-visible · disabled`.

---

## 1) Button
- **Variants:** `primary` (solid), `secondary` (outline), `ghost` (text), `danger`.
- **Sizes:** `sm 32` · `md 40` · `lg 48` (height). Padding ngang 12/16/20.
- **Shape:** pill (`radius-full`), icon‑leading/trailing 20px, gap 8.
- **Focus:** ring 2px `#93C5FD` + offset 2px.
- **Loading:** spinner 16px, `aria-busy=true`, `disabled`.

**Token mapping:**
- Solid: bg `primary`; text `#fff`; hover `primary-700`; shadow `shadow-float` nhẹ.
- Outline: border `primary`; text `primary`; hover: bg `primary-50`.
- Ghost: text `primary`; hover: bg `surface`.

---

## 2) Input / Textarea
- Height `44` (md). Padding 12. Radius 12. Border `hairline`; bg `#fff`.
- Placeholder màu `muted`. Icon bên trái tuỳ chọn.
- Error: border `danger` + trợ giúp nhỏ 12px.

---

## 3) Select / Combobox [GIẢ ĐỊNH]
- Menu radius 12, shadow-card. Item height 36–40, focus bg `primary-50`.
- Tìm kiếm trong menu (Combobox) cho danh sách tỉnh/thành.

---

## 4) Card
- Nền `surface`, radius 16–24 (tuỳ loại), shadow-card. Có thể kèm border 1px `#EEF2F6`.
- **Biến thể:** `place-card`, `itinerary-card`, `testimonial-card`.

**Place Card**:
- Ảnh 3:2 bo 16; tiêu đề 16/semibold; meta 13/muted; Chip loại hình.
- CTA mini: “Thêm vào lịch trình”.

---

## 5) Chip / Badge
- **Kinds:** `info (primary-50 + primary)`, `success`, `warn`, `danger`, `neutral`.
- Radius 9999; height 24–28; icon 16.

---

## 6) Navbar / Header
- Cao 72; container 1200; sticky top; nền `bg` mờ + blur 8 [GIẢ ĐỊNH].
- Mục: Trang chủ · Địa điểm · Lịch trình · Đóng góp · Trợ lý AI · Cộng đồng · Về dự án · Đăng nhập.
- CTA phải: “Bắt đầu với AI” (primary). Mobile: hamburger + drawer.

---

## 7) Footer
- 3 cột: Giới thiệu · Tài nguyên · Điều khoản. Social icons.
- Mini‑brand & disclaimer phi lợi nhuận.

---

## 8) Tabs [GIẢ ĐỊNH]
- Underline indicator 2px primary; khoảng cách 16–20.

---

## 9) Modal / Drawer
- Overlay `rgba(15,23,42,.6)`; container radius 20; shadow‑float.
- Focus trap, ESC to close, `aria-modal=true`, `role=dialog`.

---

## 10) Alert / Toast
- Toast góc phải; time‑out 5s; có nút Undo (khi xoá khỏi lịch trình).

---

## 11) Pagination
- Nút mũi tên bo tròn; trang hiện tại solid `primary`.

---

## 12) Itinerary Builder (key)
- **Khung:** sidebar filters (ngày/ngân sách/loại) + canvas timeline.
- **Thẻ điểm đến** kéo‑thả; snap theo ngày/giờ [GIẢ ĐỊNH].
- **AI gợi ý:** block card lớn với nút “Áp dụng vào lịch trình”.

---

## 13) Rating & Review [GIẢ ĐỊNH]
- 5 sao outline; fill theo điểm. `aria-valuenow`/`aria-valuetext`.

---

## 14) Empty State
- Minh hoạ đơn giản + CTA “Thử Trợ lý AI”.

---

## 15) Skeleton
- Card skeleton 3:2 + 2 dòng text; wave shimmer 1200ms.

---

## 16) Micro‑interactions
- Hover card: nâng `translateY(-2px)` + `shadow-card` → `shadow-float` (150ms).
- Button: ripple nhẹ 200ms [GIẢ ĐỊNH].
- Parallax mây nền hero (tắt khi `prefers-reduced-motion`).


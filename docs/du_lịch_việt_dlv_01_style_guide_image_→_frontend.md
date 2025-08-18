# DLV‑01 · Brand & Style Guide (tham khảo thiết kế mẫu máy bay)

> Lưu ý: Tài liệu này **suy luận từ ảnh tham khảo** nên có thể không chính xác tuyệt đối; các phần đánh dấu **[GIẢ ĐỊNH]** là giả định để đồng bộ hoá giao diện.

---

## 1) Tóm tắt phong cách

- **Từ khoá:** tối giản, airy, bo tròn mềm, neo‑neumorphism nhẹ, thân thiện, hiện đại.
- **Tone**: du lịch an tâm, đáng tin cậy; nhấn mạnh bầu trời xanh – cảm giác rộng mở, tích cực.

---

## 2) Bảng màu (role‑based)

> Mã màu lấy trực tiếp từ ảnh tham khảo + tinh chỉnh mức độ cho đủ contrast.

| Token         | HEX                             | Dùng cho                               |
| ------------- | ------------------------------- | -------------------------------------- |
| `primary`     | `#2986FE`                       | CTA chính, liên kết nổi bật, điểm nhấn |
| `primary-700` | `#1E6EE3`                       | Hover/Active primary                   |
| `primary-50`  | `#E9F2FF`                       | Nền nhạt, chip, tag                    |
| `secondary`   | `#0EA5E9` [GIẢ ĐỊNH]            | hành động phụ/gradient nhấn nhẹ        |
| `success`     | `#16A34A` [GIẢ ĐỊNH]            | trạng thái thành công                  |
| `warn`        | `#F59E0B` [GIẢ ĐỊNH]            | cảnh báo mềm                           |
| `danger`      | `#EF4444` [GIẢ ĐỊNH]            | lỗi/khẩn                               |
| `bg`          | `#FFFFFF`                       | nền chính                              |
| `surface`     | `#F6F8FC` [GIẢ ĐỊNH]            | thẻ/card, block nhấn nhẹ               |
| `text`        | `#101010`                       | văn bản chính                          |
| `muted`       | `#667085` [GIẢ ĐỊNH]            | mô tả, label                           |
| `border`      | `#E5E7EB` [GIẢ ĐỊNH]            | viền, phân tách                        |
| `overlay`     | `rgba(15,23,42,0.6)` [GIẢ ĐỊNH] | nền phủ modal                          |

**Gradient gợi ý** (tuỳ chọn): `linear-gradient(135deg, #2986FE 0%, #6EC3FF 100%)` [GIẢ ĐỊNH]

**Contrast**: đảm bảo `primary` trên `bg` ≥ 4.5:1; text/heading trên nền ảnh cần overlay 16–24% trắng/đen để đạt ≥ 7:1 cho H1.

---

## 3) Typography

- **Font gợi ý:** `DM Sans` (Google Fonts) – gần như trùng ảnh; fallback: `Inter, system-ui`.
- **Cặp chữ:** Heading: *DM Sans* 700; Body: *DM Sans* 400/500.
- **Tracking:** Heading −0.5% ; Body 0% [GIẢ ĐỊNH].
- **Type scale (fluid với clamp):**
  - Display/Hero: `clamp(40px, 5vw, 64px)` / 1.1
  - H1: `clamp(32px, 4vw, 48px)` / 1.2
  - H2: `clamp(24px, 3vw, 36px)` / 1.25
  - H3: `clamp(20px, 2.5vw, 28px)` / 1.3
  - Body‑lg: `clamp(16px, 1.6vw, 18px)` / 1.6
  - Body: 16px / 1.65
  - Caption: 13px / 1.4

---

## 4) Design Tokens

### 4.1 Spacing (4/8 system)

`2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.

### 4.2 Radius

- `radius-sm`: 8
- `radius-md`: 12
- `radius-lg`: 16
- `radius-xl`: 20
- `radius-2xl`: 24 (hero container)
- `radius-full`: 9999 (pill)

### 4.3 Shadow

- `shadow-soft`: `0 2px 8px rgba(16,24,40,.06)` – input, chip
- `shadow-card`: `0 8px 24px rgba(16,24,40,.08)` – card mặc định
- `shadow-float`: `0 16px 48px rgba(2,6,23,.12)` – hero/CTA nổi
- `shadow-inner`: `inset 0 1px 0 rgba(255,255,255,.6)` – neumorphism nhẹ [GIẢ ĐỊNH]

### 4.4 Border

- `hairline`: 1px `#E5E7EB`
- `strong`: 2px `#D0D5DD`
- **Focus Ring**: 2px `#93C5FD` + offset 2px trắng/đen theo mode

### 4.5 Z‑index

- `dropdown 20` · `sticky 30` · `modal 50` · `toast 60` · `overlay 40`

### 4.6 Motion

- Duration: `150ms` (UI) / `250ms` (overlay)
- Easing: `cubic-bezier(.2,.6,.2,1)`
- **prefers-reduced-motion**: tắt parallax/blur, chỉ fade/scale < 1.01

---

## 5) Lưới & Responsive

- **Container:** 1200px max‑width (desktop), padding ngang 24px.
- **Grid:** 12 cột · gutter 24px · margin 24–32px.
- **Breakpoints:**
  - `xs` 360 · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536
- **Quy tắc:**
  - Mobile: stack theo thứ tự nội dung; hero ảnh → text → CTA; card 1 cột.
  - Tablet: 2 cột cho list; hero text\:media = 1:1.
  - Desktop: 12‑col, hero text 6–7 cột + media 6–5 cột.

---

## 6) Iconography & Hình ảnh

- Icon: **Lucide/Heroicons** nét 1.5–2px, bo tròn, outline.
- Avatar/ảnh: bo 16–24px; góc hero có **bo tròn lớn + notch** như ảnh tham khảo [đặc trưng].
- Sử dụng ảnh biển trời, mây xanh; thêm overlay `linear-gradient(#0000001A, #0000001A)` khi đặt text lên ảnh.

---

## 7) Dark mode (mapping)

- `bg` → `#0B1220`
- `surface` → `#101826`
- `text` → `#E6E8EC`
- `muted` → `#98A2B3`
- `border` → `#2B3342`
- `primary` giữ `#2986FE`; hover `#4F93FF`
- Đổ bóng giảm còn 70%; tăng border để phân lớp.

**Ví dụ áp dụng:**

```css
:root{
  --bg:#FFFFFF;--surface:#F6F8FC;--text:#101010;--muted:#667085;--border:#E5E7EB;
  --primary:#2986FE;--primary-700:#1E6EE3;--success:#16A34A;--warn:#F59E0B;--danger:#EF4444;
}
.dark{
  --bg:#0B1220;--surface:#101826;--text:#E6E8EC;--muted:#98A2B3;--border:#2B3342;
  --primary:#2986FE;--primary-700:#4F93FF;
}
```

---

## 8) A11y khuyến nghị

- Tối thiểu **4.5:1** cho body, **7:1** cho heading quan trọng trên ảnh.
- Vùng chạm ≥ **44×44px** (mobile).
- `:focus-visible` rõ ràng; thứ tự tab theo nghĩa.
- ARIA: `aria-label` cho icon button, rating dùng `aria-valuetext`.
- Hỗ trợ i18n: ngôn ngữ mặc định `vi-VN`, định dạng tiền tệ `VND` [GIẢ ĐỊNH].

---

## 9) Brand voice (UI copy)

- Ngắn gọn, động từ rõ: “Khám phá”, “Thêm vào lịch trình”, “Bắt đầu với AI”.
- Tránh quảng cáo; minh bạch nguồn (nhãn Verified/Community).



# 1) DLV‑ICON‑POLICY · Nguyên tắc tổng quát

## 1.1 Mục tiêu

* **Giảm nhiễu thị giác**: icon chỉ dùng khi **cần thiết cho affordance** (biểu thị hành động/trạng thái) hoặc **định hướng** (điều hướng, breadcrumb).
* **Ưu tiên chữ & bố cục**: mọi thông tin chính được diễn đạt bằng **nhãn chữ + hệ phân cấp typographic**; icon chỉ “phụ hoạ”.
* **Tính thống nhất**: một **bộ icon duy nhất**, style nhất quán (outline, stroke 2px), kích thước chuẩn 20/24.

## 1.2 Icon Budget (ngân sách icon trên mỗi màn)

* **Trang landing / marketing**: tối đa **6 icon**/màn hình cuộn đầu (hero + section tiếp theo).
* **Trang danh sách địa điểm**: tối đa **1 icon/Thẻ** (VD: “lưu” hoặc “thêm lịch trình”), không dùng icon cho mọi meta nhỏ.
* **Trang chi tiết**: tối đa **8 icon** toàn trang (bao gồm hành động chính, chia sẻ, điều hướng gallery).
* **Form / bộ lọc**: icon tùy chọn, chỉ cho **làm rõ input** (VD: lịch, vị trí); không kèm icon cho mỗi label.

> Khi vượt ngưỡng, **bắt buộc thay bằng**: chữ, nhãn/badge, spacing, hoặc thumbnail nhỏ (xem §2).

## 1.3 Phạm vi dùng icon — CHO PHÉP

* **Điều hướng**: hamburger (mobile), chevron trái/phải (carousel), breadcrumb chevron.
* **Hành động sơ cấp**: “Thêm vào lịch trình”, “Lưu”, “Chia sẻ”.
* **Trạng thái**: đã lưu (filled), đã xác thực (tick), cảnh báo (warning).
* **Input bổ trợ**: lịch, vị trí, tìm kiếm (trong ô input).
* **Mạng xã hội ở chân trang**: *giới hạn* 3 biểu tượng (Facebook, YouTube, TikTok) \[GIẢ ĐỊNH].

## 1.4 KHÔNG cho phép

* Icon chỉ để “đẹp” cạnh mọi tiêu đề.
* Icon lặp lại ý nghĩa đã rõ qua chữ (ví dụ tiêu đề “Liên hệ” lại kèm icon thư).
* Combo “icon + icon + icon” trong một hành động duy nhất.
* Bộ icon nhiều phong cách (solid + duotone + outline trộn lẫn).

## 1.5 Nguyên tắc hình thức

* **Phong cách**: Outline 2px, **bo góc nhẹ** (stroke cap=round), **không đổ bóng**.
* **Kích thước**: 20px (UI dày), 24px (hero/CTA); **hit‑area tối thiểu 40×40**.
* **Màu**:

  * Mặc định: `text-muted` (xám #6B7280 \[GIẢ ĐỊNH]).
  * Tương tác: `primary-600` (#2986FE) cho trạng thái hover/active.
  * Cảnh báo/thành công: dùng token semantic (success/warn/danger).
* **Khoảng cách**: icon cách chữ **8px** (4/8 system).
* **Trạng thái truy cập**: luôn có **focus‑visible ring** (không chỉ đổi màu).

---

# 2) PATTERN THAY THẾ ICON

Thay vì rải icon, dùng các mẫu dưới đây:

1. **Nhãn chữ rõ + phụ đề nhỏ**

* Tiêu đề/CTA đủ mạnh → bỏ icon.
* Ví dụ: “Khám phá Đà Lạt” (H3) + “Cảnh quan – 3 ngày 2 đêm” (caption) **không cần** icon địa điểm/đồng hồ.

2. **Badge/Nhãn thông tin**

* Thay icon “giảm giá” bằng **Badge**: `-20%` (tone `primary-50/600`).
* Thay icon “verified” spam bằng **1 badge duy nhất** ở block thông tin tác giả.

3. **Thumbnail / Chip hình ảnh**

* Thay nhóm icon “bãi biển/ẩm thực/núi” bằng **3 hình tròn 24–28px** (ảnh thực), giống ảnh tham chiếu.

4. **Phân cấp typographic + spacing**

* Dùng **H1/H2 đậm** + khoảng trắng để tạo nhấn thay vì thêm icon trang trí.

5. **Divider tinh tế**

* Ngăn khối nội dung bằng **divider 1px** thay vì cố nhét icon đầu dòng từng mục.

6. **Microcopy**

* Dùng câu ngắn giải thích hành động: “Thêm vào lịch trình” tốt hơn chỉ để icon “+”.

7. **Color cue**

* Trạng thái (mới/cảnh báo) dùng **màu viền/badge** thay vì icon chấm than khắp nơi.

---

# 3) QUY TẮC THEO THÀNH PHẦN

## 3.1 Navbar/Header

* Desktop: **không icon** cho các mục menu cấp 1.
* Mobile: chỉ **hamburger**; mục con dùng **chevron phải**.
* CTA “Bắt đầu lên lịch trình” **không kèm icon**, trừ khi là **mũi tên phải** nhỏ trong nút.

## 3.2 Card Địa điểm

* Hình ảnh chiếm ưu, **một action duy nhất** nổi bật: “+ Lịch trình” (kèm icon **+** là đủ).
* Meta (khoảng cách, loại hình) **dùng chữ/badge**; tránh chuỗi 3–5 icon nhỏ.

## 3.3 Hero/Section marketing

* **0–2 icon** tổng cộng: điều hướng slide (chevron) + dot indicator; CTA **không cần** icon.

## 3.4 Danh sách/Filter

* Ô **Search** (icon kính lúp trong input) OK.
* **DateRange** dùng icon lịch trong input; Location dùng pin **trong input**.
* **Không** icon cho mỗi filter tag; chỉ label chữ, có nút `x` (glyph nhỏ 12px).

## 3.5 Form

* Label trái/phía trên, **không icon** trước label.
* Nếu cần mô tả: **help text** (12–13px) thay cho icon “info”.

## 3.6 Social proof

* Chỉ 1 icon **ngôi sao** cho rating (duy nhất trong cụm).
* Testimonial **không** icon trích dẫn lớn; thay bằng **ảnh avatar tròn**.

## 3.7 Footer

* Giới hạn **3 icon mạng xã hội**; phần còn lại dùng **liên kết chữ**.

---

# 4) ICON REGISTRY & TRIỂN KHAI (Tailwind + React)

## 4.1 Quy ước sử dụng

* **Không import icon rời rạc** từ nhiều nơi. Chỉ dùng qua `<Icon name="..." />`.
* **Registry** kiểm soát whitelist/banlist và áp cấu hình đồng nhất (kích thước, stroke, màu, a11y).

```tsx
// src/ui/Icon.tsx
import { forwardRef } from "react";

// Whitelist icon được phép
export type IconName =
  | "chevron-left" | "chevron-right" | "menu"
  | "search" | "calendar" | "location"
  | "plus" | "heart" | "share"
  | "check" | "alert" | "star";

const paths: Record<IconName, JSX.Element> = {
  "chevron-left": (<path d="M14 6 L8 12 L14 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />),
  "chevron-right": (<path d="M10 6 L16 12 L10 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />),
  "menu": (<path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />),
  "search": (<><circle cx="11" cy="11" r="6" strokeWidth="2"/><path d="M20 20 L16.5 16.5" strokeWidth="2" strokeLinecap="round"/></>),
  "calendar": (<><rect x="4" y="6" width="16" height="14" rx="2" strokeWidth="2"/><path d="M8 3v6M16 3v6M4 10h16" strokeWidth="2"/></>),
  "location": (<path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10z M12 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" strokeWidth="2" fill="none"/>),
  "plus": (<path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>),
  "heart": (<path d="M20.8 8.6a5 5 0 0 0-8.8-3.2A5 5 0 0 0 3.2 8.6C3.2 13 12 20 12 20s8.8-7 8.8-11.4z" strokeWidth="2" fill="none"/>),
  "share": (<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>),
  "check": (<path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>),
  "alert": (<path d="M12 9v4M12 17h.01 M12 3l9 16H3L12 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>),
  "star": (<path d="M12 3l3.09 6.26L22 10l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.87 2 10l6.91-0.74L12 3z" strokeWidth="2" fill="none"/>),
};

type Props = {
  name: IconName;
  size?: number; // 20/24
  className?: string; // màu theo token
  title?: string;     // a11y: mô tả ngắn
};

export const Icon = forwardRef<SVGSVGElement, Props>(function Icon({ name, size = 20, className = "text-muted", title }, ref) {
  return (
    <svg
      ref={ref}
      role="img"
      aria-label={title || name}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`inline-block align-middle ${className}`}
      fill="none"
      stroke="currentColor"
    >
      {paths[name]}
    </svg>
  );
});
```

### Tailwind gợi ý (tokens liên quan)

```css
/* globals.css (trích) */
:root{
  --icon-muted: #6B7280; /* text-muted */
  --icon-primary: #2986FE;
}
.icon-muted { color: var(--icon-muted); }
.icon-primary { color: var(--icon-primary); }
```

### Kiểm soát qua ESLint (ý tưởng nhanh)

* Cấm import trực tiếp từ các thư viện icon: tạo rule **no-random-icons** kiểm tra `import {X} from 'lucide-react'` → báo lỗi, chỉ cho phép `Icon` nội bộ.
* Với TypeScript, `IconName` là **union type** → bất kỳ icon ngoài whitelist sẽ lỗi biên dịch.

---

# 5) ROADMAP ÁP DỤNG

## 5.1 Audit hiện trạng

* Export danh sách icon đang dùng (grep `Icon`/`svg`/thư viện).
* Gắn label **Giữ / Thay thế / Loại bỏ** theo quy tắc §1–§3.
* Xác định màn nào vượt **Icon Budget**.

## 5.2 Bảng thay thế mẫu

* **Icon “điểm đến/địa điểm”** ở tiêu đề section → **bỏ**, dùng H2 rõ + subtitle.
* **Icon “đồng hồ/thời lượng”** trong card → **Badge** `3 ngày 2 đêm`.
* **Icon “giảm giá %”** → **Badge** `-20%` đặt tại góc ảnh.
* **Icon “điện thoại/email”** ở footer → link chữ “Liên hệ”, “Hỗ trợ”.
* **Chuỗi icon dịch vụ (wifi/xe/ăn uống)** → **bullet list chữ** 3 mục quan trọng nhất, phần còn lại trong modal/accordion.
* **Icon “info”** trong form → **help text** ngay dưới input.

## 5.3 QA checklist

* Mỗi CTA có **nhãn chữ** rõ ràng (icon chỉ phụ); tab‑order đúng.
* Tỷ lệ icon\:text trong card **≤ 1:3**.
* Focus‑visible của icon‑button đạt **2:1** minimum với nền, có ring 2px.
* Kiểm tra **prefers-reduced-motion**: icon không có animation dư thừa.

---

# 6) VÍ DỤ ÁP DỤNG TRONG COMPONENT

### Button (sơ cấp, có icon tuỳ chọn bên phải)

```tsx
<Button>
  Bắt đầu lên lịch trình
  {/* Icon chỉ khi thật sự cần gợi ý hướng tiến */}
  <Icon name="chevron-right" className="ml-2 icon-primary" />
</Button>
```

### Card Địa điểm (chỉ 1 action có icon)

```tsx
<Card
  title="Phú Quốc"
  meta={<div className="flex gap-2">
    <span className="badge">Biển</span>
    <span className="badge">3 ngày 2 đêm</span>
  </div>}
  actions={<button className="icon-btn" aria-label="Thêm vào lịch trình">
    <Icon name="plus" className="icon-primary" />
  </button>}
/>
```

### Input có icon hợp lý

```tsx
<label className="block">
  <span className="label">Ngày khởi hành</span>
  <div className="relative">
    <input className="input pl-10" placeholder="Chọn ngày" />
    <span className="absolute left-3 top-1/2 -translate-y-1/2">
      <Icon name="calendar" className="icon-muted" />
    </span>
  </div>
</label>
```

---

# 7) DO & DON’T (mô tả nhanh)

* **DO**: Tiêu đề hero mạnh + CTA xanh → **không icon**.
* **DO**: Carousel dùng **chỉ** chevron + dot màu nhẹ.
* **DON’T**: Mỗi tiêu đề section kèm một icon minh hoạ.
* **DON’T**: Meta trong card hiển thị bằng chuỗi 4–6 icon nhỏ.

---

# 8) A11y & i18n

* Icon **không** là kênh truyền tải duy nhất: luôn có **label**/`aria-label`.
* Tránh icon mơ hồ đa ngôn ngữ (ví dụ “điểm đến” không cần pin nếu đã có “Địa điểm”).
* Với ngôn ngữ dài (EN/JP), icon nên **ẩn** ở breakpoint hẹp để nhường chỗ cho chữ.

---

# 9) TÓM TẮT THỰC THI NHANH

1. Bật **registry `<Icon/>`** và ESLint rule chặn icon lẻ.
2. Chạy audit → thay thế theo bảng §5.2.
3. Áp **Icon Budget** vào CI (test UI: đếm số `<Icon>`/screen).
4. Review UI theo §3 cho từng template trang.


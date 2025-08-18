# DLV‑05 · Accessibility & Motion Checklist

## 1) Màu sắc & Contrast
- Văn bản thường ≥ 4.5:1; heading quan trọng/CTA trên ảnh ≥ 7:1 (dùng overlay 16–24%).
- Kiểm tra lại khi đổi hình nền; có fallback `bg-surface` nếu ảnh không đủ tương phản.

## 2) Bàn phím
- Tất cả control focusable; `:focus-visible` rõ ràng (ring 2px + offset 2px theo mode).
- Trap focus trong Modal/Drawer; đóng bằng ESC; `aria-modal=true`.

## 3) Screen reader
- Cấu trúc heading logic (H1 duy nhất/trang).
- Icon‑only buttons có `aria-label`.
- Rating dùng `role=img` hoặc `aria-valuenow`/`aria-valuetext`.
- Thông báo Toast có `role=status` hoặc `aria-live=polite`.

## 4) Vùng chạm
- Mobile tối thiểu **44×44px**; khoảng cách giữa các nút ≥ 8px.

## 5) Nội dung động
- Skeleton thay cho layout shift; thông báo rõ khi cập nhật.
- Nút Loading đặt `aria-busy=true` và `disabled`.

## 6) Ngôn ngữ & i18n
- `lang="vi"`; định dạng thời gian/tiền tệ `vi-VN` / `VND`.
- Copy ngắn gọn, tránh viết hoa toàn bộ dài dòng.

## 7) Motion
- Duration 150–250ms; easing `cubic-bezier(.2,.6,.2,1)`.
- Hỗ trợ `prefers-reduced-motion`: tắt parallax, blur, hiệu ứng quá mạnh; chỉ giữ fade/scale nhỏ.

## 8) Form & Lỗi
- Mỗi input có label; lỗi có mô tả (aria‑describedby) và màu kèm icon không phụ thuộc màu sắc duy nhất.

## 9) Bảo mật & Liên kết
- External link có `rel="noopener noreferrer"`, icon rõ (tuỳ chọn).

## 10) Kiểm thử đề xuất
- Lighthouse A11y ≥ 95.
- Keyboard only pass.
- VoiceOver/NVDA spot check các trang: Trang chủ · Chi tiết địa điểm · Builder · Modal.


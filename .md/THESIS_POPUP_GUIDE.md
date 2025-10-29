# Hệ thống Popup Thông báo Đồ án Tốt nghiệp

## Tổng quan

Hệ thống popup thông báo đồ án tốt nghiệp được xây dựng để hiển thị thông tin về đề tài, sinh viên và giảng viên hướng dẫn một cách chuyên nghiệp và không gây phiền nhiễu cho người dùng.

### Đặc điểm chính

✅ **UX-First Design:**
- Session-based display (hiển thị 1 lần mỗi phiên)
- Delay 2 giây trước khi hiển thị
- Dễ dàng đóng với nút X
- Không block nội dung chính

✅ **Professional UI:**
- Gradient header với logo trường
- Layout rõ ràng, dễ đọc
- Responsive design (mobile-friendly)
- Smooth animations

✅ **Admin Control:**
- Bật/tắt popup dễ dàng
- Upload logo trực tiếp từ admin panel
- Chỉnh sửa toàn bộ nội dung
- 3 chế độ hiển thị linh hoạt

## Kiến trúc Hệ thống

### 1. Files Structure

```
src/
├── lib/types/
│   └── thesis-popup.ts                    # Type definitions & helper functions
├── hooks/
│   ├── use-thesis-popup.ts                # Public hook (fetch settings)
│   └── use-thesis-popup-admin.ts          # Admin hook (manage settings)
├── components/
│   └── thesis-announcement-popup.tsx      # Popup component
├── app/
│   ├── page.tsx                           # Homepage integration
│   ├── admin/settings/page.tsx            # Admin UI tab
│   └── api/admin/settings/thesis-popup/
│       ├── route.ts                       # GET, PATCH settings
│       └── upload-logo/
│           └── route.ts                   # POST, DELETE logo
```

### 2. Data Flow

```
Admin Panel (Tab "Đồ án")
    ↓
PATCH /api/admin/settings/thesis-popup
    ↓
Firestore: system_settings/thesis_popup
    ↓
GET /api/admin/settings/thesis-popup (Public)
    ↓
useThesisPopupSettings() hook
    ↓
<ThesisAnnouncementPopup /> component
    ↓
Hiển thị trên Homepage (nếu enabled = true)
```

### 3. Session Storage Logic

```typescript
// Display Mode: "once-per-session"
sessionStorage.setItem('thesis_popup_shown', 'true')
// → Popup chỉ hiện 1 lần/tab cho đến khi đóng browser tab

// Display Mode: "once-per-day"
localStorage.setItem('thesis_popup_last_shown', timestamp)
// → Popup hiện 1 lần/ngày (kiểm tra 24h)

// Display Mode: "always"
// → Popup luôn hiện (không khuyến nghị - gây phiền nhiễu)
```

## Hướng dẫn Sử dụng cho Admin

### Bước 1: Truy cập Admin Settings

1. Đăng nhập với tài khoản **Admin** (bắt buộc)
2. Vào `/admin/settings`
3. Click tab **"Đồ án"** (icon GraduationCap)

### Bước 2: Bật Popup

1. Tìm section **"Bật/Tắt Popup"** (background xanh)
2. Toggle switch sang ON (màu xanh)
3. Status badge sẽ đổi từ "Đã tắt" → "Đang bật"

### Bước 3: Upload Logo Trường (Tùy chọn)

1. Scroll xuống section **"Logo Trường"**
2. Click nút **"Tải lên Logo"**
3. Chọn file từ máy tính:
   - Định dạng: JPG, PNG, WebP, SVG
   - Kích thước khuyến nghị: Vuông (1:1), VD: 200x200px
   - Dung lượng tối đa: 5MB
4. Logo tự động upload lên Firebase Storage
5. Nhập **"Mô tả Logo"** cho accessibility (VD: "Logo Đại học ABC")

**Xóa Logo:**
- Hover vào logo preview → Click nút **"Xóa"**

### Bước 4: Điền Thông tin Đồ án

#### A. Thông tin Đồ án

- **Tên Đề tài** (Bắt buộc): Nhập đầy đủ tên đề tài đồ án tốt nghiệp
  - VD: _"Xây dựng ứng dụng web 'Du lịch Việt' tích hợp Trí tuệ nhân tạo để nâng cao trải nghiệm người dùng"_

#### B. Thông tin Sinh viên

- **Tên Sinh viên** (Bắt buộc): Họ và tên đầy đủ
- **MSSV**: Mã số sinh viên (VD: 2101148)
- **Khóa**: Khóa học (VD: Khóa 45)

#### C. Thông tin Giảng viên Hướng dẫn

- **Học hàm GVHD**: Chọn từ dropdown
  - GS. (Giáo sư)
  - PGS. (Phó Giáo sư)
  - TS. (Tiến sĩ) ← Mặc định
  - ThS. (Thạc sĩ)
  - CN. (Cử nhân)
- **Tên GVHD**: Họ tên giảng viên (VD: An Hồng Sơn)

### Bước 5: Cài đặt Hiển thị

#### A. Tần suất hiển thị

- **Một lần mỗi phiên** (Khuyến nghị) ← UX tốt nhất
  - Hiện 1 lần/tab browser
  - Reset khi đóng tab
  - Không phiền nhiễu user

- **Một lần mỗi ngày**
  - Hiện 1 lần trong 24 giờ
  - Lưu trong localStorage
  - Cho campaign dài hạn

- **Luôn hiển thị** (Không khuyến nghị)
  - Hiện mỗi lần reload page
  - Gây phiền nhiễu
  - Chỉ dùng khi cần thiết

#### B. Độ trễ (giây)

- Mặc định: **2 giây**
- Phạm vi: 0-30 giây
- Khuyến nghị: 2-5 giây để tránh intrusive

### Bước 6: Lưu Cài đặt

1. Click nút **"Lưu cài đặt"** (góc trên phải)
2. Chờ hiển thị **"Đã lưu"** (màu xanh lá)
3. Thay đổi có hiệu lực ngay lập tức

### Bước 7: Kiểm tra Popup

1. Mở trang chủ trong **tab mới** hoặc **Incognito mode**:
   - URL: `https://www.dulichviet.tech`
2. Đợi 2 giây (hoặc delay đã set)
3. Popup sẽ hiện ra với đầy đủ thông tin
4. Kiểm tra:
   - ✅ Logo hiển thị đúng (nếu có)
   - ✅ Tên đề tài hiển thị đầy đủ
   - ✅ Thông tin SV, GVHD chính xác
   - ✅ Nút "Đã hiểu" hoạt động
   - ✅ Nút X (đóng) hoạt động

## UX Best Practices Đã Áp dụng

### 1. Timing & Triggering ✅

- ✅ 2-second delay (non-intrusive)
- ✅ Session-based display (once per tab)
- ✅ No interruption during critical tasks

### 2. Design Principles ✅

- ✅ Clear dismiss option (X button + "Đã hiểu" button)
- ✅ Not fullscreen (max-width: 2xl ~ 672px)
- ✅ Professional gradient header
- ✅ Readable typography hierarchy
- ✅ Mobile-responsive layout

### 3. User Control ✅

- ✅ Easy to close
- ✅ No auto-close timeout (user decides when to dismiss)
- ✅ Admin can disable anytime
- ✅ 3 display modes for flexibility

### 4. Accessibility ✅

- ✅ Proper ARIA labels
- ✅ Keyboard accessible (Tab, Esc keys)
- ✅ Alt text for logo
- ✅ High contrast text

## API Endpoints

### Public Endpoint (No Auth Required)

```bash
# Get popup settings
GET /api/admin/settings/thesis-popup
Response: { success: true, data: ThesisPopupSettings }
```

### Admin Endpoints (Require Admin Auth)

```bash
# Update settings
PATCH /api/admin/settings/thesis-popup
Body: Partial<ThesisPopupSettings>
Response: { success: true, data: ThesisPopupSettings }

# Upload logo
POST /api/admin/settings/thesis-popup/upload-logo
Body: FormData { logo: File }
Response: { success: true, data: { logoUrl: string } }

# Delete logo
DELETE /api/admin/settings/thesis-popup/upload-logo
Response: { success: true }
```

## Firestore Schema

**Collection:** `system_settings`
**Document ID:** `thesis_popup`

```typescript
interface ThesisPopupSettings {
  // Enable/disable
  enabled: boolean

  // Thesis info
  title: string                // Tên đề tài
  studentName: string          // Tên SV
  studentId: string            // MSSV
  cohort: string               // Khóa học
  advisorName: string          // Tên GVHD
  advisorTitle: string         // Học hàm (TS., PGS., etc.)

  // Logo
  universityLogoUrl?: string   // Firebase Storage URL
  universityLogoAlt?: string   // Alt text

  // Display settings
  displayMode: 'once-per-session' | 'once-per-day' | 'always'
  delaySeconds?: number        // Default: 2

  // Metadata
  createdAt: string
  updatedAt: string
  lastEditedBy?: string        // Admin user ID
}
```

## Debugging & Testing

### Debug Display Logic

```typescript
// In browser console (homepage)
// Check if popup should show
shouldShowThesisPopup(settings) // Returns boolean

// Force reset session storage
resetThesisPopupTracking()      // Clears all storage
```

### Common Issues

**❌ Popup không hiển thị:**
1. Check `enabled: true` trong admin settings
2. Check browser console for errors
3. Clear sessionStorage: `sessionStorage.clear()`
4. Try Incognito mode (no cached storage)

**❌ Logo không hiển thị:**
1. Check file đã upload thành công (xem URL trong admin)
2. Check Firebase Storage permissions (public access)
3. Check file format (JPG, PNG, WebP, SVG)

**❌ Thay đổi không có hiệu lực:**
1. Click nút "Lưu cài đặt" sau khi edit
2. Hard refresh homepage (Ctrl+Shift+R)
3. Check Firestore document `system_settings/thesis_popup`

## Performance Impact

- **Bundle size:** ~5KB (component + types + hooks)
- **API calls:** 1 GET request per session
- **Storage:** Minimal (sessionStorage/localStorage)
- **Render impact:** None (only renders when enabled)

## Security

- ✅ **Admin-only writes:** Only admin role can update settings/upload logo
- ✅ **Public reads:** Anyone can fetch settings (no sensitive data)
- ✅ **File validation:** File type and size checked server-side
- ✅ **Firebase Storage:** Uploaded files are public (logo is public asset)

## Future Enhancements (Optional)

Nếu cần mở rộng trong tương lai:

1. **Multi-language support:** EN/VI toggle
2. **Scheduled display:** Show only during specific dates (e.g., thesis defense period)
3. **A/B testing:** Test different designs/copy
4. **Analytics:** Track view count, dismiss rate, CTA click
5. **Custom CTA:** Link to thesis presentation/demo
6. **Multiple popups:** Queue system for different announcements

## Changelog

**v1.0.0 (2025-01-XX):**
- ✅ Initial release
- ✅ Admin UI in `/admin/settings`
- ✅ Session-based display logic
- ✅ Logo upload functionality
- ✅ 3 display modes
- ✅ Full responsive design
- ✅ Accessibility compliant

---

**Người tạo:** Claude Code
**Ngày tạo:** 2025-01-XX
**Status:** Production Ready ✅

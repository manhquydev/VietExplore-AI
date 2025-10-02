# Hệ thống Thông báo Cộng đồng - Workflow & Hướng dẫn

## 📊 Tổng quan hệ thống

Hệ thống Thông báo Cộng đồng (Community Announcements) cho phép Admin và Moderator tạo, quản lý và xuất bản các thông báo chính thức tới cộng đồng người dùng.

---

## 🎯 4 Trạng thái của Thông báo

### 1. **DRAFT** (Nháp) 🔵
- **Mô tả**: Bài viết đang soạn thảo, chưa sẵn sàng xuất bản
- **Ai xem được**: Chỉ Admin và Moderator
- **Hiển thị công khai**: ❌ Không
- **Có thể chỉnh sửa**: ✅ Có

### 2. **PUBLISHED** (Đã xuất bản) 🟢
- **Mô tả**: Bài viết đã được xuất bản và hiển thị công khai
- **Ai xem được**: Tất cả mọi người (kể cả khách)
- **Hiển thị công khai**: ✅ Có
- **Có thể chỉnh sửa**: ✅ Có (cần cẩn thận)
- **URL**: `https://domain.com/community/announcements/[slug]`

### 3. **SCHEDULED** (Lên lịch) ⏰
- **Mô tả**: Bài viết được lên lịch xuất bản tự động vào thời gian cụ thể
- **Ai xem được**: Chỉ Admin và Moderator
- **Hiển thị công khai**: ❌ Không (chưa đến giờ)
- **Có thể chỉnh sửa**: ✅ Có
- **Tự động xuất bản**: ✅ Có (khi đến giờ đã định)

### 4. **ARCHIVED** (Lưu trữ/Ẩn) 🔴
- **Mô tả**: Bài viết đã bị ẩn, không hiển thị công khai nữa
- **Ai xem được**: Chỉ Admin và Moderator (trong trang quản lý)
- **Hiển thị công khai**: ❌ Không
- **Có thể chỉnh sửa**: ✅ Có
- **Có thể khôi phục**: ✅ Có (đổi về Draft hoặc Published)

---

## 🔄 Workflow - Luồng xử lý

### Luồng 1: Tạo và Xuất bản ngay (Quickest)
```
1. Admin vào /admin/announcements
2. Bấm "Tạo thông báo mới"
3. Nhập nội dung (tiêu đề, nội dung, ảnh, tags...)
4. Bấm "Xuất bản ngay" ⚡
   → Status: PUBLISHED
   → Hiển thị ngay tại /community/announcements
```

### Luồng 2: Tạo nháp → Duyệt → Xuất bản
```
1. Admin/Moderator tạo thông báo
2. Bấm "Lưu nháp"
   → Status: DRAFT
3. Người khác review (nếu cần)
4. Vào Edit → Chọn status "Đã xuất bản" → Lưu
   → Status: PUBLISHED
```

### Luồng 3: Lên lịch xuất bản tự động
```
1. Admin/Moderator tạo thông báo
2. Chọn status "Lên lịch"
3. Nhập thời gian xuất bản (scheduledFor)
4. Lưu
   → Status: SCHEDULED
   → Tự động chuyển sang PUBLISHED khi đến giờ
```

### Luồng 4: Ẩn thông báo (Archive)
```
1. Admin vào /admin/announcements
2. Tìm thông báo cần ẩn
3. Bấm nút "Lưu trữ" (biểu tượng thùng rác)
4. Xác nhận
   → Status: ARCHIVED
   → Không hiển thị công khai nữa
```

### Luồng 5: Khôi phục thông báo đã ẩn
```
1. Admin vào /admin/announcements
2. Filter status: "Lưu trữ"
3. Tìm thông báo cần khôi phục
4. Bấm "Edit"
5. Đổi status về "Đã xuất bản" hoặc "Nháp"
6. Lưu
   → Thông báo hiển thị trở lại
```

---

## 🎨 Giao diện và Navigation

### 1. Truy cập Quản lý Thông báo

**Cách 1: Qua Sidebar Admin**
```
/admin → Sidebar bên trái → Bấm "Thông báo" (icon loa 📢)
```

**Cách 2: Truy cập trực tiếp**
```
http://localhost:9004/admin/announcements
```

### 2. Các trang chính

| Trang | URL | Chức năng |
|-------|-----|-----------|
| Danh sách | `/admin/announcements` | Xem tất cả thông báo, filter, search |
| Tạo mới | `/admin/announcements/new` | Tạo thông báo mới |
| Chỉnh sửa | `/admin/announcements/[id]/edit` | Sửa thông báo, đổi status |
| Xem công khai | `/community/announcements` | Trang công khai cho user |
| Chi tiết | `/community/announcements/[slug]` | Xem chi tiết 1 thông báo |

---

## 🛠️ Hướng dẫn sử dụng chi tiết

### A. Tạo Thông báo Mới

1. **Truy cập trang tạo**
   - Vào `/admin/announcements`
   - Bấm nút **"Tạo thông báo mới"** (góc trên bên phải)

2. **Nhập thông tin**

   **📝 Nội dung chính:**
   - **Tiêu đề** (*): Tối đa 200 ký tự
   - **Mô tả ngắn**: Tóm tắt (hoặc để trống, tự động tạo)
   - **Nội dung** (*): Editor rich text với format đầy đủ

   **🖼️ Ảnh đại diện:**
   - Upload ảnh hoặc nhập URL
   - Ảnh hiển thị khi share lên mạng xã hội

   **⚙️ Cài đặt:**
   - **Loại thông báo**: Announcement, Feature, Guide, Community, Maintenance, Event
   - **Mức độ ưu tiên**: Thấp, Trung bình, Cao, Khẩn cấp
   - **Ghim lên đầu**: Hiển thị ở đầu danh sách
   - **Nổi bật**: Highlight đặc biệt

   **🏷️ Tags:**
   - Thêm từ khóa để dễ tìm kiếm
   - Bấm Enter hoặc nút "Thêm" để thêm tag

3. **Xuất bản**
   - **"Xuất bản ngay"** ⚡: Hiển thị công khai ngay lập tức
   - **"Lưu nháp"** 💾: Lưu để chỉnh sửa sau

### B. Chỉnh sửa Thông báo

1. **Truy cập trang edit**
   - Vào `/admin/announcements`
   - Tìm thông báo cần sửa
   - Bấm nút **Edit** (biểu tượng bút chì)

2. **Chỉnh sửa nội dung**
   - Sửa tiêu đề, nội dung, ảnh, tags, settings...

3. **Quản lý trạng thái**

   Sidebar bên phải có dropdown **"Trạng thái"**:

   ```
   🔵 Nháp          → Bản nháp chỉ admin/moderator xem được
   🟢 Đã xuất bản   → Hiển thị công khai cho mọi người
   ⏰ Lên lịch      → Sẽ tự động xuất bản vào thời gian đã định
   🔴 Lưu trữ (Ẩn)  → Đã ẩn, không hiển thị công khai
   ```

4. **Lưu thay đổi**
   - **"Lưu thay đổi"**: Lưu với trạng thái đã chọn
   - **"Xuất bản ngay"**: Chuyển sang Published ngay lập tức

### C. Lưu trữ (Ẩn) Thông báo

1. **Cách 1: Dùng nút Lưu trữ**
   - Vào `/admin/announcements`
   - Tìm thông báo cần ẩn
   - Bấm nút **Trash** (thùng rác) 🗑️
   - Xác nhận → Status chuyển sang ARCHIVED

2. **Cách 2: Qua trang Edit**
   - Vào Edit thông báo
   - Đổi status thành **"Lưu trữ (Ẩn)"**
   - Bấm "Lưu thay đổi"

### D. Khôi phục Thông báo đã ẩn

1. **Tìm thông báo archived**
   - Vào `/admin/announcements`
   - Filter status: **"Lưu trữ"**

2. **Khôi phục**
   - Bấm **Edit** thông báo cần khôi phục
   - Đổi status về:
     - **"Đã xuất bản"** → Hiển thị công khai ngay
     - **"Nháp"** → Về dạng draft để review lại
   - Bấm "Lưu thay đổi"

### E. Xóa vĩnh viễn (Hard Delete)

⚠️ **Lưu ý**: Hiện tại hệ thống dùng **soft delete** (archive), không xóa vĩnh viễn khỏi database.

Nếu cần hard delete:
1. Vào Firebase Console
2. Firestore Database → Collection `announcements`
3. Tìm document cần xóa
4. Delete document

---

## 🔒 Phân quyền

| Chức năng | Admin | Moderator | User/Guest |
|-----------|-------|-----------|------------|
| Xem danh sách quản lý | ✅ | ✅ | ❌ |
| Tạo thông báo | ✅ | ✅ | ❌ |
| Sửa thông báo | ✅ | ✅ (chỉ của mình nếu draft) | ❌ |
| Xuất bản | ✅ | ✅ | ❌ |
| Lưu trữ (ẩn) | ✅ | ❌ | ❌ |
| Xem công khai | ✅ | ✅ | ✅ |

---

## 🎯 Best Practices

### 1. Khi tạo thông báo mới

✅ **NÊN:**
- Viết tiêu đề rõ ràng, súc tích
- Sử dụng mô tả ngắn để thu hút người đọc
- Chọn loại thông báo phù hợp
- Thêm ảnh đại diện chất lượng
- Preview trước khi xuất bản

❌ **KHÔNG NÊN:**
- Viết tiêu đề quá dài (> 100 ký tự)
- Xuất bản ngay mà chưa review
- Quên thêm tags để dễ tìm kiếm
- Dùng ảnh kém chất lượng

### 2. Khi sửa thông báo đã xuất bản

⚠️ **CẨN THẬN:**
- Thông báo đã xuất bản có thể đã được người dùng xem
- Sửa nội dung quan trọng cần cân nhắc
- Nên thêm phần "Cập nhật" nếu sửa nội dung lớn

✅ **GỢI Ý:**
- Chuyển về Draft trước khi sửa lớn
- Sau khi sửa xong, xuất bản lại
- Hoặc tạo thông báo mới thay vì sửa cái cũ

### 3. Quản lý trạng thái

| Tình huống | Nên dùng |
|------------|----------|
| Cần review trước khi xuất bản | Draft |
| Xuất bản ngay lập tức | Published |
| Lên lịch sự kiện tương lai | Scheduled |
| Thông báo hết hạn/không còn liên quan | Archived |
| Thông báo có lỗi cần sửa gấp | Archived → Sửa → Published |

---

## 🐛 Xử lý sự cố thường gặp

### Vấn đề 1: Thông báo không hiển thị ở /community/announcements

**Nguyên nhân:**
- Status không phải là `published`
- Đang ở trạng thái `draft` hoặc `archived`

**Giải pháp:**
1. Vào `/admin/announcements`
2. Kiểm tra status của thông báo
3. Edit → Đổi status thành "Đã xuất bản"
4. Lưu lại

### Vấn đề 2: Không tìm thấy thông báo đã tạo

**Nguyên nhân:**
- Thông báo bị archive
- Filter đang bật (chỉ xem Published)

**Giải pháp:**
1. Vào `/admin/announcements`
2. Kiểm tra filter status → Chọn "Tất cả trạng thái"
3. Hoặc chọn "Lưu trữ" nếu đã bị archive

### Vấn đề 3: Nút "Xóa" không hiện

**Nguyên nhân:**
- Chỉ Admin mới có quyền archive
- Thông báo đã ở trạng thái Archived

**Giải pháp:**
- Đảm bảo bạn đăng nhập với role Admin
- Thông báo đã archived không hiện nút Trash nữa

### Vấn đề 4: Không vào được trang Edit

**Nguyên nhân:**
- Lỗi 403 Forbidden do chưa có auth token

**Giải pháp:**
- Đã fix trong version mới nhất
- Refresh lại trang (Ctrl + R)
- Clear cache browser nếu cần

---

## 📊 API Endpoints (Reference)

### Public Endpoints (Không cần auth)
```
GET  /api/announcements              → Danh sách public (status=published)
GET  /api/announcements/[slug]       → Chi tiết thông báo
```

### Admin Endpoints (Cần auth + role admin/moderator)
```
GET    /api/admin/announcements         → Danh sách tất cả (có filter)
GET    /api/admin/announcements/[id]    → Chi tiết theo ID
POST   /api/admin/announcements         → Tạo mới
PATCH  /api/admin/announcements/[id]    → Cập nhật
DELETE /api/admin/announcements/[id]    → Archive (soft delete)
```

---

## 🎓 Tóm tắt Quick Reference

### Trạng thái
```
Draft (Nháp)          → Chỉ admin xem, chưa public
Published (Xuất bản)  → Hiển thị công khai
Scheduled (Lên lịch)  → Tự động xuất bản sau
Archived (Lưu trữ)    → Đã ẩn, có thể khôi phục
```

### Chuyển đổi trạng thái
```
Draft ──────────────→ Published   (Xuất bản)
Published ──────────→ Draft       (Về nháp)
Published ──────────→ Archived    (Ẩn)
Archived ───────────→ Published   (Khôi phục)
Archived ───────────→ Draft       (Khôi phục về nháp)
```

### Navigation
```
Admin List:    /admin/announcements
Tạo mới:       /admin/announcements/new
Chỉnh sửa:     /admin/announcements/[id]/edit
Public List:   /community/announcements
Chi tiết:      /community/announcements/[slug]
```

---

## 📞 Liên hệ & Hỗ trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng:
- Báo lỗi tại: [GitHub Issues](https://github.com/your-repo/issues)
- Liên hệ Admin hệ thống

---

**Cập nhật lần cuối:** 2025-10-01
**Version:** 1.0.0

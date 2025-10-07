# 🎯 Hướng Dẫn Quản Lý Đội Ngũ (Team Management)

## 📋 Tổng Quan

Hệ thống quản lý đội ngũ cho phép bạn:
- ✅ Thêm/Sửa/Xóa thông tin thành viên
- ✅ Upload avatar và cover image
- ✅ Quản lý thứ tự hiển thị
- ✅ Đánh dấu featured members
- ✅ Tổ chức theo phòng ban (Department)
- ✅ Hiển thị động trên trang About

---

## 🚀 Khởi Động Nhanh

### Bước 1: Khởi động Dev Server

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:9002

### Bước 2: Đăng Nhập Admin

1. Truy cập: http://localhost:9002/auth/login
2. Đăng nhập bằng tài khoản **Admin**
   - Email: admin@dulichviet.tech (hoặc tài khoản admin của bạn)
   - Password: ****

### Bước 3: Seed Dữ Liệu Ban Đầu

**Cách 1: Sử dụng Browser Console (Khuyến nghị)**

1. Sau khi đăng nhập, nhấn **F12** để mở Developer Tools
2. Vào tab **Console**
3. Chạy lệnh sau để xem hướng dẫn:

```bash
node scripts/seed-team-via-api.js
```

4. Copy toàn bộ code JavaScript hiển thị
5. Paste vào Console và nhấn Enter
6. Chờ script tạo 3 team members mẫu

**Cách 2: Sử dụng Admin Interface (Thủ công)**

1. Truy cập: http://localhost:9002/admin/team
2. Click nút **"+ Thêm thành viên"**
3. Điền thông tin theo mẫu:

```
- Slug: nguyen-minh-hoang
- Họ và tên: Nguyễn Minh Hoàng
- Chức vụ: Founder & CEO
- Bio: Đam mê công nghệ và du lịch...
- Avatar URL: https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang
- Status: Active
- Featured: ✅ (checked)
- Display Order: 1
- Department: Leadership
```

---

## 📂 Cấu Trúc Dữ Liệu

### Team Member Schema

```typescript
interface TeamMember {
  id: string;                    // Auto-generated
  slug: string;                  // URL-friendly identifier (e.g., "nguyen-minh-hoang")
  fullName: string;              // Họ và tên đầy đủ
  title: string;                 // Chức vụ
  bio: string;                   // Giới thiệu ngắn (200 ký tự)
  longBio?: string;              // Tiểu sử chi tiết (optional)
  avatar: string;                // URL của avatar
  coverImage?: string;           // URL của cover image (optional)
  expertise: string[];           // Chuyên môn (array)
  achievements?: string[];       // Thành tựu (optional)
  education?: Array<{            // Học vấn (optional)
    degree: string;
    institution: string;
    year: string;
    major?: string;
  }>;
  socialLinks?: {                // Mạng xã hội (optional)
    linkedin?: string;
    github?: string;
    twitter?: string;
    facebook?: string;
    email?: string;
    website?: string;
  };
  status: 'active' | 'inactive'; // Trạng thái
  featured: boolean;             // Hiển thị trên About page
  displayOrder: number;          // Thứ tự hiển thị (1, 2, 3...)
  department?: string;           // Phòng ban
  joinedDate?: string;           // Ngày gia nhập (ISO string)
  metaDescription?: string;      // SEO description
  tags?: string[];               // Tags (optional)
  createdAt: string;             // Auto-generated
  updatedAt: string;             // Auto-updated
  createdBy: string;             // Admin user ID
  updatedBy: string;             // Admin user ID
}
```

### Departments

```typescript
const DEPARTMENTS = {
  leadership: 'Lãnh đạo',
  technology: 'Công nghệ',
  operations: 'Vận hành',
  marketing: 'Marketing',
  design: 'Thiết kế',
  content: 'Nội dung',
  support: 'Hỗ trợ',
  other: 'Khác'
};
```

---

## 🎨 Giao Diện Admin

### Trang Quản Lý: `/admin/team`

**Thống kê:**
- Tổng số thành viên
- Thành viên hoạt động
- Featured members
- Phân loại theo phòng ban

**Chức năng:**
- ✅ **Tìm kiếm**: Search by name, title, bio
- ✅ **Lọc**: Filter by status, department, featured
- ✅ **Sắp xếp**: Order by displayOrder, name, joinedDate
- ✅ **Thêm mới**: Create new team member
- ✅ **Chỉnh sửa**: Update member information
- ✅ **Xóa**: Soft delete (inactive) hoặc hard delete

### Form Thêm/Sửa Thành Viên

**Tab 1: Thông tin cơ bản**
- Slug (auto-generate from fullName)
- Họ và tên
- Chức vụ
- Bio (ngắn)
- Long Bio (chi tiết)

**Tab 2: Hình ảnh**
- Avatar upload hoặc URL
- Cover image upload hoặc URL
- Preview real-time

**Tab 3: Chuyên môn & Thành tựu**
- Expertise (multiple tags)
- Achievements (list)
- Education (expandable list)

**Tab 4: Mạng xã hội**
- LinkedIn, GitHub, Twitter
- Facebook, Email, Website

**Tab 5: Cài đặt**
- Status: Active/Inactive
- Featured: Yes/No
- Display Order: 1, 2, 3...
- Department: Select
- Joined Date: Date picker
- Meta Description (SEO)
- Tags

---

## 🖼️ Upload Hình Ảnh

### Phương Pháp 1: Upload File

1. Click nút **"Upload"** trong form
2. Chọn file từ máy tính (JPG, PNG, WebP)
3. Kích thước tối đa: 5MB
4. Hình ảnh sẽ được tự động resize:
   - Avatar: 400x400px
   - Cover: 1200x400px

### Phương Pháp 2: Dán URL

1. Nhập trực tiếp URL vào field "Avatar URL" hoặc "Cover URL"
2. Hỗ trợ:
   - Firebase Storage URLs
   - External URLs (https://)
   - Dicebear avatars (https://api.dicebear.com/...)

**Gợi ý Avatar Mặc Định:**

```
https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang
https://api.dicebear.com/7.x/avataaars/svg?seed=Lan
https://api.dicebear.com/7.x/avataaars/svg?seed=Duc
```

---

## 🔄 API Endpoints

### 1. List Team Members

```http
GET /api/team?status=active&featured=true&orderBy=displayOrder
```

**Query Parameters:**
- `status`: active | inactive
- `featured`: true | false
- `department`: leadership | technology | ...
- `search`: string
- `limit`: number
- `orderBy`: displayOrder | fullName | joinedDate
- `orderDirection`: asc | desc

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "slug": "nguyen-minh-hoang",
      "fullName": "Nguyễn Minh Hoàng",
      "title": "Founder & CEO",
      ...
    }
  ],
  "total": 3
}
```

### 2. Create Team Member (Admin Only)

```http
POST /api/team
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "slug": "nguyen-minh-hoang",
  "fullName": "Nguyễn Minh Hoàng",
  "title": "Founder & CEO",
  "bio": "...",
  "avatar": "https://...",
  "status": "active",
  "featured": true,
  "displayOrder": 1,
  "department": "leadership"
}
```

### 3. Update Team Member (Admin Only)

```http
PATCH /api/team/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "CEO & Co-Founder",
  "displayOrder": 2
}
```

### 4. Delete Team Member (Admin Only)

```http
DELETE /api/team/{id}?hard=false
Authorization: Bearer YOUR_TOKEN
```

- `hard=false`: Soft delete (set status = inactive)
- `hard=true`: Permanent delete

### 5. Upload Image (Admin Only)

```http
POST /api/team/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file: [binary]
type: "avatar" | "cover"
```

---

## 🌐 Hiển Thị Trên Website

### Trang About: `/about`

**Component:** `<TeamSection />`

**Logic:**
- Chỉ hiển thị members có `status = 'active'` và `featured = true`
- Sắp xếp theo `displayOrder` (ascending)
- Hiển thị tối đa 3-6 members (responsive grid)
- Link đến profile page: `/team/{slug}`

**Nếu không có data:**
- Section sẽ không render (return null)
- Không bị lỗi loading vô hạn

### Trang Profile: `/team/[slug]` (TODO)

**Hiển thị chi tiết:**
- Cover image (hero section)
- Avatar + name + title
- Long bio
- Expertise tags
- Achievements list
- Education timeline
- Social links
- Related team members

---

## 🐛 Xử Lý Lỗi

### Lỗi 1: Reload vô hạn

**Nguyên nhân:** Hook `useTeamMembers` bị trigger re-fetch liên tục do filters object thay đổi reference.

**Giải pháp:** ✅ Đã fix bằng cách destructure filters trong useCallback dependencies.

### Lỗi 2: API trả về 403 Unauthorized

**Nguyên nhân:** Chưa đăng nhập hoặc không có quyền admin.

**Giải pháp:**
1. Đăng nhập lại
2. Kiểm tra role trong profile: `/profile/me`
3. Nếu cần, tạo admin user: `/create-admin`

### Lỗi 3: Slug đã tồn tại

**Nguyên nhân:** Mỗi slug phải unique.

**Giải pháp:**
- Sửa slug thành giá trị khác
- Hoặc xóa member cũ có slug trùng

---

## 📊 Firestore Structure

**Collection:** `team_members`

**Document ID:** Auto-generated by Firebase

**Indexes:**
```json
[
  {
    "fields": [
      {"fieldPath": "status", "order": "ASCENDING"},
      {"fieldPath": "displayOrder", "order": "ASCENDING"}
    ]
  },
  {
    "fields": [
      {"fieldPath": "featured", "order": "ASCENDING"},
      {"fieldPath": "displayOrder", "order": "ASCENDING"}
    ]
  },
  {
    "fields": [
      {"fieldPath": "department", "order": "ASCENDING"},
      {"fieldPath": "displayOrder", "order": "ASCENDING"}
    ]
  }
]
```

**Security Rules:**
```javascript
match /team_members/{memberId} {
  allow read: if true; // Public read
  allow write: if isAdmin(); // Admin only
}
```

---

## ✅ Testing Checklist

### Admin Interface
- [ ] Hiển thị danh sách team members
- [ ] Stats cards hiển thị đúng
- [ ] Tìm kiếm hoạt động
- [ ] Lọc theo status, department, featured
- [ ] Tạo member mới thành công
- [ ] Upload avatar/cover thành công
- [ ] Chỉnh sửa member thành công
- [ ] Xóa member (soft/hard) thành công
- [ ] Form validation hoạt động

### Public Display
- [ ] About page hiển thị featured members
- [ ] Members được sắp xếp theo displayOrder
- [ ] Avatar hiển thị chính xác
- [ ] Click vào member → navigate to profile
- [ ] Khi không có data → không bị lỗi
- [ ] Responsive trên mobile

### API
- [ ] GET /api/team trả về đúng data
- [ ] POST /api/team tạo được member mới
- [ ] PATCH /api/team/{id} update được
- [ ] DELETE /api/team/{id} xóa được
- [ ] Upload image thành công
- [ ] Authentication hoạt động
- [ ] Validation errors rõ ràng

---

## 🚀 Deployment

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### 3. Build & Deploy App

```bash
npm run build
npm run deploy  # hoặc deploy lên Vercel
```

### 4. Verify

- [ ] Rules deployed: Check Firebase Console > Firestore > Rules
- [ ] Indexes created: Check Firebase Console > Firestore > Indexes
- [ ] App deployed: Check production URL
- [ ] About page works
- [ ] Admin interface works

---

## 📚 Tài Liệu Tham Khảo

**Files:**
- Types: `src/lib/types/team.ts`
- API Routes: `src/app/api/team/*`
- Hooks: `src/hooks/use-team-members.ts`
- Components: `src/components/team/team-section.tsx`
- Admin Page: `src/app/admin/team/page.tsx`

**Firestore:**
- Rules: `firestore.rules`
- Indexes: `firestore.indexes.json`

**Scripts:**
- Seed via API: `scripts/seed-team-via-api.js`

---

## 💡 Tips & Best Practices

1. **Display Order:** Sử dụng số chẵn (10, 20, 30) để dễ insert giữa các members sau này.

2. **Slug Naming:** Sử dụng kebab-case, không dấu, không ký tự đặc biệt.

3. **Avatar Quality:** Nên upload ảnh có kích thước 400x400px trở lên để đảm bảo chất lượng.

4. **Bio Length:**
   - Short bio: 150-200 ký tự (hiển thị trên card)
   - Long bio: 300-500 ký tự (hiển thị trên profile page)

5. **Featured Members:** Chỉ đánh dấu featured cho 3-6 members quan trọng nhất để tránh About page quá dài.

6. **Department:** Phân loại rõ ràng để dễ quản lý và filter.

7. **Social Links:** Chỉ điền những link thực sự hoạt động, tránh link giả.

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:

1. **Server logs:** Check terminal nơi chạy `npm run dev`
2. **Browser console:** F12 → Console tab
3. **Network tab:** F12 → Network → kiểm tra API responses
4. **Firestore Console:** Firebase Console → Firestore → Data & Rules

**Common Issues:**
- ❌ "Unauthorized" → Đăng nhập lại
- ❌ "Slug đã tồn tại" → Đổi slug khác
- ❌ "Image too large" → Resize ảnh < 5MB
- ❌ "Invalid token" → Clear localStorage & login lại

---

Chúc bạn thành công! 🎉

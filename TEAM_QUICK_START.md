# ⚡ Team Management - Quick Start

## 🚀 Khởi động trong 3 phút

### 1️⃣ Khởi động server
```bash
npm run dev
```

### 2️⃣ Đăng nhập Admin
- Truy cập: http://localhost:9002/auth/login
- Đăng nhập với tài khoản admin

### 3️⃣ Seed dữ liệu mẫu

**Mở Developer Tools (F12) → Console → Paste code:**

```javascript
// Lấy auth token
const token = localStorage.getItem('authToken');

// Data 3 members mẫu
const teamMembers = [
  {
    slug: "nguyen-minh-hoang",
    fullName: "Nguyễn Minh Hoàng",
    title: "Founder & CEO",
    bio: "Đam mê công nghệ và du lịch, kết hợp AI để mang văn hóa Việt đến gần hơn với mọi người",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang",
    expertise: ["AI/ML", "Product Management", "Startup Strategy"],
    status: "active",
    featured: true,
    displayOrder: 1,
    department: "leadership"
  },
  {
    slug: "tran-thi-lan",
    fullName: "Trần Thị Lan",
    title: "Chief Technology Officer",
    bio: "Chuyên gia AI với niềm đam mê xây dựng hệ thống thông minh phục vụ cộng đồng",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lan",
    expertise: ["AI Architecture", "Machine Learning", "NLP"],
    status: "active",
    featured: true,
    displayOrder: 2,
    department: "technology"
  },
  {
    slug: "le-van-duc",
    fullName: "Lê Văn Đức",
    title: "Head of Operations",
    bio: "Chuyên gia vận hành với kinh nghiệm quản lý cộng đồng và phát triển nội dung du lịch",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Duc",
    expertise: ["Community Management", "Content Moderation", "Partnership"],
    status: "active",
    featured: true,
    displayOrder: 3,
    department: "operations"
  }
];

// Tạo members
(async () => {
  for (const member of teamMembers) {
    const response = await fetch('http://localhost:9002/api/team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(member)
    });
    const result = await response.json();
    console.log(result.success ? `✅ ${member.fullName}` : `❌ Error: ${result.error}`);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('✅ Done! Visit: http://localhost:9002/about');
})();
```

---

## 📍 Links Quan Trọng

| Trang | URL |
|-------|-----|
| **About Page** (hiển thị public) | http://localhost:9002/about |
| **Admin Team Management** | http://localhost:9002/admin/team |
| **API Docs** | [GET] http://localhost:9002/api/team |

---

## 🎯 Chức Năng Chính

### Admin Interface (`/admin/team`)
- ✅ Thêm/Sửa/Xóa thành viên
- ✅ Upload avatar/cover image (hoặc dùng URL)
- ✅ Quản lý display order (thứ tự hiển thị)
- ✅ Đánh dấu featured (hiển thị trên About)
- ✅ Tìm kiếm & lọc theo status/department

### About Page (`/about`)
- ✅ Hiển thị featured members (status = active, featured = true)
- ✅ Sắp xếp theo displayOrder
- ✅ Responsive grid (mobile/tablet/desktop)
- ✅ Link đến profile page (TODO: `/team/{slug}`)

---

## 🛠️ API Endpoints

```bash
# List members
GET /api/team?status=active&featured=true&orderBy=displayOrder

# Create member (Admin only)
POST /api/team
Headers: Authorization: Bearer {token}

# Update member (Admin only)
PATCH /api/team/{id}

# Delete member (Admin only)
DELETE /api/team/{id}?hard=false

# Upload image (Admin only)
POST /api/team/upload
```

---

## 📂 Files Chính

```
src/
├── lib/types/team.ts                    # Type definitions
├── hooks/use-team-members.ts            # React hooks
├── components/team/team-section.tsx     # About page component
├── app/
│   ├── admin/team/page.tsx              # Admin interface
│   └── api/team/
│       ├── route.ts                     # List & Create
│       ├── [id]/route.ts                # Get, Update, Delete
│       └── upload/route.ts              # Image upload

firestore.rules                          # Security rules
firestore.indexes.json                   # Composite indexes
scripts/seed-team-via-api.js             # Seed script helper
```

---

## ⚠️ Lưu Ý

1. **Phải đăng nhập Admin** trước khi seed data
2. **Slug phải unique** - không được trùng nhau
3. **Display Order** - dùng số chẵn (10, 20, 30) để dễ insert sau
4. **Avatar URL** - hỗ trợ Firebase Storage hoặc external URLs
5. **Featured = true** thì mới hiển thị trên About page

---

## 🐛 Troubleshooting

| Lỗi | Giải pháp |
|-----|-----------|
| Reload vô hạn | ✅ Đã fix - hook không bị re-fetch loop |
| 403 Unauthorized | Đăng nhập lại với tài khoản admin |
| Slug đã tồn tại | Đổi slug khác hoặc xóa member cũ |
| Image quá lớn | Resize ảnh < 5MB |

---

## 📖 Full Documentation

Xem chi tiết: [TEAM_MANAGEMENT_GUIDE.md](./TEAM_MANAGEMENT_GUIDE.md)

---

✨ **That's it!** Chỉ cần 3 bước là có thể quản lý đội ngũ hoàn chỉnh!

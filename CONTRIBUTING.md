# Hướng Dẫn Đóng Góp

Cảm ơn bạn quan tâm đến dự án Du Lịch Việt. Chúng tôi luôn chào đón sự đóng góp từ cộng đồng để cùng xây dựng nền tảng du lịch Việt Nam tốt hơn.

## Mục Lục

- [Quy Tắc Ứng Xử](#quy-tắc-ứng-xử)
- [Bắt Đầu](#bắt-đầu)
- [Quy Trình Phát Triển](#quy-trình-phát-triển)
- [Chuẩn Mã Nguồn](#chuẩn-mã-nguồn)
- [Hướng Dẫn Commit](#hướng-dẫn-commit)
- [Quy Trình Pull Request](#quy-trình-pull-request)
- [Báo Cáo Lỗi](#báo-cáo-lỗi)

---

## Quy Tắc Ứng Xử

### Cam Kết Của Chúng Tôi

Chúng tôi cam kết tạo môi trường cộng đồng thân thiện và chuyên nghiệp. Vui lòng tôn trọng và xây dựng trong mọi tương tác.

### Hành Vi Được Khuyến Khích

- Sử dụng ngôn ngữ thân thiện và hòa nhập
- Tôn trọng quan điểm khác biệt
- Chấp nhận phê bình mang tính xây dựng
- Ưu tiên lợi ích của cộng đồng

### Hành Vi Không Được Chấp Nhận

- Quấy rối hoặc ngôn từ phân biệt đối xử
- Bình luận xúc phạm hoặc công kích cá nhân
- Công khai thông tin riêng tư của người khác
- Hành vi thiếu chuyên nghiệp

---

## Bắt Đầu

### Yêu Cầu Hệ Thống

Trước khi bắt đầu đóng góp, hãy đảm bảo máy tính của bạn đã cài đặt:

- Node.js phiên bản 18.0.0 trở lên
- npm phiên bản 9.0.0 trở lên
- Git
- Firebase CLI (nếu thay đổi backend)
- Kiến thức cơ bản về TypeScript, React và Next.js

### Fork và Clone Repository

**Bước 1:** Fork repository trên GitHub

**Bước 2:** Clone repository về máy:

```bash
git clone https://github.com/YOUR-USERNAME/VietExplore-AI.git
cd VietExplore-AI
```

**Bước 3:** Thêm remote upstream:

```bash
git remote add upstream https://github.com/manhquydev/VietExplore-AI.git
```

**Bước 4:** Cài đặt dependencies:

```bash
npm install
```

**Bước 5:** Thiết lập biến môi trường:

```bash
cp .env.example .env.local
# Chỉnh sửa file .env.local với thông tin Firebase của bạn
```

---

## Quy Trình Phát Triển

### 1. Tạo Nhánh Mới

Luôn tạo nhánh mới cho công việc của bạn:

```bash
git checkout -b feature/ten-tinh-nang
# hoặc
git checkout -b fix/mo-ta-loi
```

**Quy Ước Đặt Tên Nhánh:**
- `feature/` - Tính năng mới
- `fix/` - Sửa lỗi
- `docs/` - Thay đổi tài liệu
- `refactor/` - Tái cấu trúc code
- `test/` - Thêm tests
- `chore/` - Công việc bảo trì

### 2. Thực Hiện Thay Đổi

- Viết code rõ ràng, dễ đọc
- Tuân theo style code hiện có
- Thêm comments cho logic phức tạp
- Cập nhật tài liệu nếu cần thiết

### 3. Kiểm Tra Thay Đổi

```bash
# Kiểm tra type
npm run typecheck

# Kiểm tra linting
npm run lint:fix

# Chạy tests
npm test

# Test trong môi trường development
npm run dev
```

### 4. Commit Thay Đổi

Làm theo [Hướng Dẫn Commit](#hướng-dẫn-commit).

```bash
git add .
git commit -m "feat: thêm trang hồ sơ người dùng"
```

---

## Chuẩn Mã Nguồn

### TypeScript

**Các Nguyên Tắc:**
- Sử dụng TypeScript cho tất cả file mới
- Định nghĩa rõ ràng types/interfaces
- Tránh sử dụng `any` trừ khi thực sự cần thiết
- Sử dụng strict mode

**Ví dụ:**

```typescript
// Tốt
interface Place {
  id: string;
  name: string;
  region: 'bac-bo' | 'trung-bo' | 'nam-bo';
}

// Không nên
const place: any = { ... };
```

### React Components

**Các Nguyên Tắc:**
- Sử dụng functional components với hooks
- Sử dụng TypeScript cho props
- Tách logic có thể tái sử dụng thành custom hooks
- Ưu tiên sử dụng Radix UI components

**Ví dụ:**

```typescript
// Tốt
interface PlaceCardProps {
  place: Place;
  onLike: (id: string) => void;
}

export function PlaceCard({ place, onLike }: PlaceCardProps) {
  // Component logic
}

// Không nên
export function PlaceCard(props: any) {
  // Component logic
}
```

### Cấu Trúc Thư Mục

```
src/
├── app/              # Next.js pages và routes
├── components/       # React components có thể tái sử dụng
│   ├── ui/          # UI primitives (buttons, cards, etc.)
│   └── [feature]/   # Components theo từng tính năng
├── hooks/           # Custom React hooks
├── lib/             # Utility functions và helpers
└── types/           # TypeScript type definitions
```

### Styling

**Các Nguyên Tắc:**
- Sử dụng Tailwind CSS utility classes
- Theo approach mobile-first
- Sử dụng màu sắc và spacing từ design system
- Tránh inline styles trừ khi cần dynamic styling

```tsx
// Tốt
<div className="flex items-center gap-4 px-6 py-4 bg-white rounded-lg shadow-sm">

// Không nên
<div style={{ display: 'flex', padding: '16px' }}>
```

---

## Hướng Dẫn Commit

Chúng tôi tuân theo quy ước [Conventional Commits](https://www.conventionalcommits.org/).

### Định Dạng

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Các Loại Commit (Types)

- `feat` - Tính năng mới
- `fix` - Sửa lỗi
- `docs` - Thay đổi tài liệu
- `style` - Thay đổi code style (formatting, etc.)
- `refactor` - Tái cấu trúc code
- `test` - Thêm hoặc cập nhật tests
- `chore` - Công việc bảo trì
- `perf` - Cải thiện hiệu năng

### Ví Dụ

```bash
# Tính năng mới
feat(auth): thêm đăng nhập Google OAuth

# Sửa lỗi
fix(places): sửa lỗi upload ảnh trên Safari

# Tài liệu
docs(readme): cập nhật hướng dẫn cài đặt

# Tái cấu trúc
refactor(api): đơn giản hóa logic lấy địa điểm

# Breaking change
feat(api)!: thay đổi cấu trúc API response

BREAKING CHANGE: Place API giờ trả về `viewCount` thay vì `views`
```

---

## Quy Trình Pull Request

### Trước Khi Gửi

**Bước 1:** Cập nhật nhánh của bạn với upstream mới nhất:

```bash
git fetch upstream
git rebase upstream/main
```

**Bước 2:** Chạy tất cả kiểm tra:

```bash
npm run typecheck
npm run lint:fix
npm test
```

**Bước 3:** Cập nhật tài liệu nếu cần

**Bước 4:** Thêm tests cho tính năng mới

### Gửi Pull Request

**Bước 1:** Push nhánh của bạn lên fork:

```bash
git push origin feature/ten-tinh-nang
```

**Bước 2:** Mở Pull Request trên GitHub

**Bước 3:** Điền vào template PR:

```markdown
## Mô Tả
Mô tả ngắn gọn về thay đổi

## Loại Thay Đổi
- [ ] Sửa lỗi
- [ ] Tính năng mới
- [ ] Breaking change
- [ ] Cập nhật tài liệu

## Kiểm Tra
- [ ] Đã test locally
- [ ] Đã thêm unit tests
- [ ] Tất cả tests đều pass

## Screenshots (nếu có)
Thêm screenshots cho thay đổi UI

## Checklist
- [ ] Code tuân theo style guidelines của dự án
- [ ] Đã tự review code
- [ ] Tài liệu đã được cập nhật
- [ ] Không có warnings mới
```

### Quy Trình Review

- Maintainers sẽ review PR của bạn trong vòng 3-5 ngày làm việc
- Giải quyết feedback hoặc yêu cầu thay đổi
- Khi được approve, PR sẽ được merge

---

## Báo Cáo Lỗi

### Trước Khi Tạo Issue

1. Tìm kiếm issues hiện có để tránh trùng lặp
2. Kiểm tra xem lỗi đã được sửa trong phiên bản mới nhất chưa
3. Thu thập thông tin liên quan (browser, OS, screenshots)

### Template Báo Cáo Lỗi

```markdown
**Mô tả lỗi**
Mô tả rõ ràng về lỗi

**Các bước tái hiện**
1. Vào trang '...'
2. Click vào '...'
3. Thấy lỗi

**Kết quả mong đợi**
Điều bạn mong đợi sẽ xảy ra

**Screenshots**
Thêm screenshots nếu có

**Môi trường:**
- Browser: [ví dụ: Chrome 120]
- OS: [ví dụ: macOS 14.0]
- Version: [ví dụ: 3.0.0]

**Thông tin bổ sung**
Thông tin liên quan khác
```

### Template Đề Xuất Tính Năng

```markdown
**Vấn đề hiện tại**
Mô tả vấn đề mà tính năng này sẽ giải quyết

**Giải pháp đề xuất**
Mô tả rõ ràng về tính năng bạn muốn

**Các phương án thay thế**
Các giải pháp hoặc tính năng thay thế khác

**Thông tin bổ sung**
Mockups, ví dụ, hoặc tài liệu tham khảo
```

---

## Các Lĩnh Vực Có Thể Đóng Góp

### Issues Dành Cho Người Mới

Tìm issues có nhãn `good-first-issue`:
- Cải thiện tài liệu
- Tăng cường UI/UX
- Sửa lỗi nhỏ
- Thêm tests

### Ưu Tiên Cao

- Tối ưu hiệu năng
- Cải thiện khả năng tiếp cận (accessibility)
- Responsive trên mobile
- Quốc tế hóa (i18n)

---

## Tài Liệu Tham Khảo

### Tài Liệu Dự Án

- [README.md](./README.md) - Tổng quan dự án
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Cộng Đồng

- GitHub Issues - Báo cáo lỗi và đề xuất tính năng
- GitHub Discussions - Câu hỏi chung và ý tưởng

---

## Liên Hệ

Cần hỗ trợ? Liên hệ với chúng tôi:

- **Tác giả:** Nguyễn Mạnh Quý
- **Email:** manhquydev@gmail.com

---

## Tác Giả Dự Án

**Nguyễn Mạnh Quý**
- Người sáng lập và duy trì Du Lịch Việt
- © 2025 Bản quyền thuộc về tác giả

---

**Cảm ơn bạn đã đóng góp cho Du Lịch Việt!**

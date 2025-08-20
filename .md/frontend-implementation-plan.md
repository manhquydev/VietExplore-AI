# Kế Hoạch Triển Khai Frontend - Du Lịch Việt

## Tổng Quan Dự Án

**Du Lịch Việt** là nền tảng phi lợi nhuận cung cấp thông tin du lịch Việt Nam đáng tin cậy, tích hợp AI trợ lý để hỗ trợ lập kế hoạch du lịch. Dự án phục vụ nhiều nhóm người dùng: khách vãng lai (Guest), du khách (Traveler), cộng tác viên (Contributor), đối tác cộng đồng (Community Partner), và đội ngũ kiểm duyệt (Moderator/Admin).

**Tech Stack:** Next.js 14+, React 18+, TypeScript, Tailwind CSS, Shadcn/UI Components

---

## 1. Work Breakdown Structure (WBS)

| Epic | Task | Mô tả | Ưu tiên | Ước tính (giờ) | Tham chiếu tài liệu |
|------|------|-------|---------|----------------|---------------------|
| **E1: Thiết lập dự án & Core Infrastructure** |
| | T1.1: Khởi tạo Next.js project | Cài đặt Next.js 14+, TypeScript, Tailwind CSS | Cao | 4 | DLV-04 |
| | T1.2: Cấu hình Tailwind & Design System | Áp dụng tokens từ DLV-01, cấu hình dark mode | Cao | 8 | DLV-01, DLV-04 |
| | T1.3: Thiết lập folder structure | Tổ chức components, pages, hooks, utils | Cao | 2 | - |
| | T1.4: Cấu hình i18n (Vietnamese) | Thiết lập localization cho toàn bộ UI | Cao | 6 | DLV-05 |
| **E2: Core UI Components** |
| | T2.1: Button variants | Primary, secondary, ghost, danger với loading states | Cao | 4 | DLV-02, DLV-04 |
| | T2.2: Form components | Input, Textarea, Select, Combobox với validation | Cao | 8 | DLV-02 |
| | T2.3: Card components | Place card, itinerary card, testimonial card | Cao | 6 | DLV-02 |
| | T2.4: Navigation components | Header, Footer, Breadcrumb | Cao | 8 | DLV-02, DLV-03 |
| | T2.5: Modal & Dialog | Modal, Drawer với focus trap, ESC handling | Trung bình | 6 | DLV-02 |
| | T2.6: Toast & Alert | Notification system với undo functionality | Trung bình | 4 | DLV-02 |
| | T2.7: Chip & Badge | Status indicators, category tags | Trung bình | 3 | DLV-02 |
| | T2.8: Skeleton loaders | Card skeleton với wave animation | Thấp | 3 | DLV-02 |
| **E3: Layout & Navigation** |
| | T3.1: Main layout structure | Container, grid system 12-col | Cao | 4 | DLV-03 |
| | T3.2: Responsive navigation | Desktop menu + mobile hamburger/drawer | Cao | 8 | DLV-02, DLV-03 |
| | T3.3: Sticky header với blur | Header 72px với backdrop-blur | Cao | 4 | DLV-02 |
| | T3.4: Footer 3-column | Thông tin dự án, tài nguyên, điều khoản | Trung bình | 4 | DLV-02, DLV-03 |
| **E4: Trang chủ (Homepage)** |
| | T4.1: Hero section | Display heading, CTA buttons, ảnh nền | Cao | 8 | DLV-03 |
| | T4.2: Tìm kiếm nhanh | Search bar với filters cơ bản | Cao | 8 | DLV-03 |
| | T4.3: Vùng nổi bật | 3 thẻ Bắc/Trung/Nam | Cao | 4 | DLV-03 |
| | T4.4: Feed địa điểm | Lưới địa điểm mới + lịch trình nổi bật | Cao | 6 | DLV-03 |
| | T4.5: Nhãn đối tác | Hàng logo tin cậy | Thấp | 2 | DLV-03 |
| **E5: Quản lý địa điểm (Places)** |
| | T5.1: Danh sách địa điểm | Grid responsive với filtering | Cao | 10 | DLV-03 |
| | T5.2: Filter bar sticky | Vùng, Tỉnh, Loại hình với chip selection | Cao | 8 | DLV-03 |
| | T5.3: Trang chi tiết địa điểm | Gallery, thông tin, CTA, Mini AI | Cao | 12 | DLV-03, Tính năng 4.8 |
| | T5.4: Map view toggle | Chuyển đổi lưới ↔ bản đồ | Thấp | 8 | DLV-03 |
| **E6: Quản lý lịch trình (Itineraries)** |
| | T6.1: Itinerary Builder UI | Canvas timeline, drag & drop interface | Cao | 16 | DLV-03, Tính năng 4.8 |
| | T6.2: Sidebar gợi ý AI | Danh sách gợi ý + filters | Cao | 8 | DLV-03 |
| | T6.3: Form thông số cơ bản | Ngày, ngân sách, loại chuyến đi | Cao | 4 | DLV-03 |
| | T6.4: Trang lịch trình công khai | Hero, danh sách ngày, CTA sao chép | Cao | 8 | DLV-03 |
| | T6.5: Quản lý lịch trình cá nhân | "Lịch trình của tôi" với CRUD | Cao | 8 | Tính năng 4.2 |
| **E7: Đóng góp nội dung (Contribute)** |
| | T7.1: Form wizard 3 bước | Thông tin → Địa lý → Ảnh/Nguồn | Cao | 12 | DLV-03, Tính năng 4.3 |
| | T7.2: Progress stepper | Dots indicator theo tiến trình | Trung bình | 4 | DLV-03 |
| | T7.3: Trang bản nháp | Bảng quản lý với status chips | Cao | 6 | DLV-03, Tính năng 4.3 |
| | T7.4: Form báo cáo vi phạm | Modal báo cáo cho Traveler | Trung bình | 4 | Tính năng 4.2 |
| **E8: Trợ lý AI** |
| | T8.1: AI Chat interface | Khung hội thoại với gợi ý nhanh | Cao | 10 | DLV-03, Tính năng 4.7 |
| | T8.2: AI Plan layout | Bảng/kanban hiển thị lịch trình sinh tự động | Cao | 8 | DLV-03, Tính năng 4.7 |
| | T8.3: Mini AI trong place detail | Ô "Hỏi về địa điểm này" | Trung bình | 4 | DLV-03 |
| **E9: Community & Profile** |
| | T9.1: Community pages | Announcements, Handbook | Thấp | 4 | DLV-03 |
| | T9.2: Profile pages | Hồ sơ cá nhân, đóng góp, huy hiệu | Trung bình | 6 | DLV-03, Tính năng 4.2 |
| | T9.3: Partner profile | Trang hồ sơ đối tác | Thấp | 4 | Tính năng 4.4 |
| **E10: Moderation Dashboard** |
| | T10.1: Dashboard chính | Hàng đợi duyệt + báo cáo | Cao | 10 | DLV-03, Tính năng 4.5 |
| | T10.2: Diff Viewer | So sánh trước/sau chỉnh sửa | Cao | 8 | DLV-03, Tính năng 4.5 |
| | T10.3: Action buttons | Approve/Reject/Request edit/Hide | Cao | 4 | Tính năng 4.5 |
| **E11: Authentication & Authorization** |
| | T11.1: Login/Register forms | Modal hoặc dedicated pages | Cao | 8 | Tính năng 4.1, 4.2 |
| | T11.2: Role-based UI | Hiển thị/ẩn features theo quyền | Cao | 6 | Tính năng tổng hợp |
| | T11.3: Protected routes | Route guards cho từng user role | Cao | 4 | - |
| **E12: Accessibility & Performance** |
| | T12.1: A11y implementation | ARIA, focus management, screen reader | Cao | 12 | DLV-05 |
| | T12.2: Keyboard navigation | Tab order, ESC handling | Cao | 6 | DLV-05 |
| | T12.3: Motion preferences | prefers-reduced-motion support | Trung bình | 4 | DLV-05 |
| | T12.4: Performance optimization | Lazy loading, code splitting | Trung bình | 8 | - |
| **E13: Error Handling & Empty States** |
| | T13.1: Error boundaries | Global error handling | Cao | 4 | DLV-03 |
| | T13.2: Empty states | Minh họa + CTA "Thử Trợ lý AI" | Trung bình | 4 | DLV-02, DLV-03 |
| | T13.3: Loading states | Skeleton, spinner, progress indicators | Cao | 6 | DLV-02 |
| **E14: Testing & Documentation** |
| | T14.1: Component testing | Unit tests cho core components | Trung bình | 16 | - |
| | T14.2: Integration testing | User flow testing | Thấp | 12 | - |
| | T14.3: Storybook setup | Component documentation | Thấp | 8 | - |

**Tổng ước tính:** ~280 giờ (~7 tuần với team 2-3 developers)

---

## 2. Danh Sách Trang & Màn Hình (Page & Screen Inventory)

### 2.1 Trang công khai (Public Pages)

| Trang | Route | Mô tả | User Role | Tham chiếu |
|-------|-------|-------|-----------|------------|
| **Trang chủ** | `/` | Hero, tìm kiếm nhanh, vùng nổi bật, feed | Tất cả | DLV-03 |
| **Danh sách địa điểm** | `/places` | Grid địa điểm với filtering | Tất cả | DLV-03 |
| **Địa điểm theo vùng** | `/places/regions/[region]` | Bắc/Trung/Nam | Tất cả | Sitemap 3.3 |
| **Địa điểm theo tỉnh** | `/places/regions/[region]/[province]` | Lọc theo tỉnh/thành | Tất cả | Sitemap 3.3 |
| **Chi tiết địa điểm** | `/places/[region]/[province]/[slug]` | Gallery, thông tin, Mini AI | Tất cả | DLV-03 |
| **Địa điểm theo loại** | `/places/types/[type]` | Biển/Núi/Văn hóa/Ẩm thực/Check-in | Tất cả | Sitemap 3.3 |
| **Bản đồ địa điểm** | `/places/map` | Map view tất cả địa điểm | Tất cả | DLV-03 |
| **Lịch trình công khai** | `/itineraries/[slug]` | Xem lịch trình chia sẻ | Tất cả | DLV-03 |
| **AI Chat Demo** | `/ai-assistant/chat` | Demo AI cho Guest | Tất cả | DLV-03 |
| **Về dự án** | `/about` | Thông tin dự án | Tất cả | Sitemap 3.3 |
| **Cộng đồng** | `/community` | Announcements, Handbook | Tất cả | DLV-03 |
| **Trợ giúp** | `/help/faq` | FAQ, hướng dẫn | Tất cả | Sitemap 3.3 |
| **Điều khoản** | `/legal/terms` | Terms of service | Tất cả | Sitemap 3.3 |
| **Chính sách** | `/legal/privacy` | Privacy policy | Tất cả | Sitemap 3.3 |
| **Chính sách nội dung** | `/legal/content-policy` | Content guidelines | Tất cả | Sitemap 3.3 |

### 2.2 Trang yêu cầu đăng nhập (Authenticated Pages)

| Trang | Route | Mô tả | User Role | Tham chiếu |
|-------|-------|-------|-----------|------------|
| **Đăng nhập** | `/auth/login` | Form đăng nhập | Guest → User | Tính năng 4.1 |
| **Đăng ký** | `/auth/register` | Form đăng ký | Guest → User | Tính năng 4.1 |
| **Itinerary Builder** | `/itineraries/builder` | Canvas kéo-thả, AI gợi ý | Traveler+ | DLV-03 |
| **Lịch trình của tôi** | `/itineraries/my` | Quản lý lịch trình cá nhân | Traveler+ | Tính năng 4.2 |
| **AI Plan** | `/ai-assistant/plan` | Sinh lịch trình tự động | Traveler+ | DLV-03 |
| **Hồ sơ cá nhân** | `/profile/me` | Thông tin, đóng góp, huy hiệu | Traveler+ | DLV-03 |
| **Hồ sơ người dùng** | `/profile/[username]` | Xem hồ sơ công khai | Tất cả | DLV-03 |

### 2.3 Trang Contributor

| Trang | Route | Mô tả | User Role | Tham chiếu |
|-------|-------|-------|-----------|------------|
| **Thêm địa điểm** | `/contribute/new-place` | Form wizard 3 bước | Contributor+ | DLV-03 |
| **Bản nháp của tôi** | `/contribute/my-drafts` | Quản lý bản nháp | Contributor+ | DLV-03 |

### 2.4 Trang Community Partner

| Trang | Route | Mô tả | User Role | Tham chiếu |
|-------|-------|-------|-----------|------------|
| **Hồ sơ Partner** | `/profile/partner/[id]` | Thông tin đối tác | Partner+ | Tính năng 4.4 |

### 2.5 Trang Moderation

| Trang | Route | Mô tả | User Role | Tham chiếu |
|-------|-------|-------|-----------|------------|
| **Moderation Dashboard** | `/moderation/dashboard` | Hàng đợi duyệt + báo cáo | Moderator+ | DLV-03 |
| **Chi tiết duyệt** | `/moderation/review/[id]` | Diff viewer, action buttons | Moderator+ | Tính năng 4.5 |

### 2.6 Modal & Overlay Screens

| Modal | Trigger | Mô tả | User Role | Tham chiếu |
|-------|---------|-------|-----------|------------|
| **Login Modal** | "Đăng nhập" button | Quick login form | Guest | - |
| **Register Modal** | "Đăng ký" button | Quick register form | Guest | - |
| **Report Modal** | "Báo cáo" link | Báo cáo vi phạm nội dung | Traveler+ | Tính năng 4.2 |
| **Share Modal** | "Chia sẻ" button | Social sharing links | Tất cả | - |
| **Image Gallery** | Image click | Lightbox xem ảnh | Tất cả | - |
| **Mobile Menu** | Hamburger button | Navigation drawer | Tất cả | DLV-02 |

**Tổng số trang:** 32 trang chính + 6 modal screens = **38 màn hình**

---

## 3. Danh Sách Component Tái Sử Dụng (Reusable Components)

### 3.1 Core UI Components

| Component | Variants | Props chính | Sử dụng ở | Tham chiếu |
|-----------|----------|-------------|-----------|------------|
| **Button** | primary, secondary, ghost, danger | variant, size, loading, disabled | Toàn bộ app | DLV-02, DLV-04 |
| **Input** | text, email, password, search | placeholder, error, icon | Forms, search | DLV-02 |
| **Textarea** | - | rows, placeholder, error | Forms | DLV-02 |
| **Select** | single, multiple | options, placeholder, searchable | Filters, forms | DLV-02 |
| **Combobox** | - | options, searchable, creatable | Tỉnh/thành selection | DLV-02 |
| **Checkbox** | - | checked, indeterminate, label | Forms, filters | - |
| **Radio** | - | name, value, label | Forms | - |
| **Switch** | - | checked, label | Settings, toggles | - |

### 3.2 Layout Components

| Component | Variants | Props chính | Sử dụng ở | Tham chiếu |
|-----------|----------|-------------|-----------|------------|
| **Container** | - | maxWidth, padding | Layout wrapper | DLV-01 |
| **Grid** | 12-col | cols, gap, responsive | Layout system | DLV-01 |
| **Stack** | vertical, horizontal | gap, align, justify | Component layout | - |
| **Flex** | - | direction, wrap, gap, align, justify | Flexible layouts | - |

### 3.3 Navigation Components

| Component | Variants | Props chính | Sử dụng ở | Tham chiếu |
|-----------|----------|-------------|-----------|------------|
| **Header** | - | user, sticky | Global header | DLV-02, DLV-03 |
| **Footer** | - | links, social | Global footer | DLV-02, DLV-03 |
| **Breadcrumb** | - | items, separator | Page navigation | - |
| **Tabs** | underline, pills | items, defaultValue | Content sections | DLV-02 |
| **Pagination** | - | total, current, pageSize | List pagination | DLV-02 |

### 3.4 Data Display Components

| Component | Variants | Props chính | Sử dụng ở | Tham chiếu |
|-----------|----------|-------------|-----------|------------|
| **Card** | default, elevated, outlined | padding, hover, clickable | Content containers | DLV-02, DLV-04 |
| **PlaceCard** | - | place, showCTA | Place listings | DLV-02, DLV-04 |
| **ItineraryCard** | - | itinerary, showActions | Itinerary listings | DLV-02 |
| **TestimonialCard** | - | testimonial, author | Homepage | DLV-02 |
| **Avatar** | - | src, name, size | User profiles | - |
| **Badge** | info, success, warning, danger | variant, icon | Status indicators | DLV-02 |
| **Chip** | - | label, removable, icon | Tags, filters | DLV-02, DLV-04 |
| **Rating** | - | value, max, readonly | Place ratings | DLV-02 |

### 3.5 Feedback Components

| Component | Variants | Props chính | Sử dụng ở | Tham chiếu |
|-----------|----------|-------------|-----------|------------|
| **Toast** | success, error, warning, info | message, action, duration | Notifications | DLV-02 |
| **Alert** | info, success, warning, error | title, description, closable | Page alerts | DLV-02 |
| **Progress** | linear, circular | value, max, indeterminate | Loading states | - |
| **Skeleton** | text, card, avatar | lines, width, height | Loading placeholders | DLV-02, DLV-04 |
| **Spinner** | - | size, color | Loading indicators | DLV-04 |

### 3.6 Overlay Components

| Component | Variants | Props chính | Sử dụng ở | Tham chiếu |
|-----------|----------|-------------|-----------|------------|
| **Modal** | - | open, onClose, title, size | Dialogs, forms | DLV-02 |
| **Drawer** | left, right, top, bottom | open, onClose, anchor | Mobile menu, sidebars | DLV-02 |
| **Popover** | - | trigger, content, placement | Tooltips, menus | - |
| **Tooltip** | - | content, placement, delay | Help text | - |
| **DropdownMenu** | - | trigger, items | Action menus | DLV-02 |

### 3.7 Form Components

| Component | Variants | Props chính | Sử dụng ở | Tham chiếu |
|-----------|----------|-------------|-----------|------------|
| **FormField** | - | label, error, required, help | Form wrapper | - |
| **FormGroup** | - | legend, children | Grouped fields | - |
| **Stepper** | horizontal, vertical | steps, current, clickable | Multi-step forms | DLV-03 |
| **FileUpload** | single, multiple | accept, maxSize, preview | Image uploads | - |
| **DatePicker** | - | value, onChange, format | Date selection | - |

### 3.8 Specialized Components

| Component | Variants | Props chính | Sử dụng ở | Tham chiếu |
|-----------|----------|-------------|-----------|------------|
| **SearchBar** | - | placeholder, filters, onSearch | Homepage, places | DLV-03 |
| **FilterBar** | - | filters, values, onChange | Place listings | DLV-03 |
| **RegionCard** | - | region, image, description | Homepage | DLV-03 |
| **AIChat** | - | messages, onSend, suggestions | AI assistant | DLV-03 |
| **ItineraryTimeline** | - | days, places, editable | Itinerary builder | DLV-03 |
| **PlaceGallery** | - | images, current, onSelect | Place detail | DLV-03 |
| **DiffViewer** | - | before, after, changes | Moderation | DLV-03 |
| **EmptyState** | - | illustration, title, description, action | Empty lists | DLV-02, DLV-03 |

### 3.9 Hook Components (Custom Hooks)

| Hook | Mô tả | Return Values | Sử dụng ở |
|------|-------|---------------|-----------|
| **useAuth** | Authentication state | user, login, logout, loading | Auth components |
| **useToast** | Toast notifications | toast, success, error, warning | Global |
| **useLocalStorage** | Local storage sync | value, setValue | Preferences |
| **useDebounce** | Debounced values | debouncedValue | Search inputs |
| **usePagination** | Pagination logic | page, setPage, hasNext, hasPrev | Lists |
| **useFilters** | Filter state management | filters, setFilter, clearFilters | Filter bars |
| **useDragDrop** | Drag & drop functionality | dragProps, dropProps | Itinerary builder |

**Tổng số components:** ~60 components + 7 custom hooks

---

## 4. Kế Hoạch Mock API (Mock API Plan)

### 4.1 Core Entities

#### 4.1.1 User Entity
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "avatar": "string|null",
  "role": "guest|traveler|contributor|partner|moderator|admin",
  "verified": "boolean",
  "badges": ["string"],
  "createdAt": "ISO8601",
  "profile": {
    "bio": "string|null",
    "location": "string|null",
    "website": "string|null",
    "socialLinks": {
      "facebook": "string|null",
      "instagram": "string|null"
    }
  },
  "stats": {
    "placesContributed": "number",
    "itinerariesCreated": "number",
    "helpfulVotes": "number"
  }
}
```

#### 4.1.2 Place Entity
```json
{
  "id": "string",
  "slug": "string",
  "name": "string",
  "description": "string",
  "shortDescription": "string",
  "region": "bac-bo|trung-bo|nam-bo",
  "province": "string",
  "provinceSlug": "string",
  "type": "bien|nui|van-hoa|am-thuc|check-in",
  "coordinates": {
    "lat": "number",
    "lng": "number"
  },
  "address": "string|null",
  "images": [
    {
      "id": "string",
      "url": "string",
      "alt": "string",
      "caption": "string|null",
      "isPrimary": "boolean"
    }
  ],
  "trustLabel": "community|contributor|partner|verified",
  "source": {
    "type": "user|partner|import",
    "userId": "string|null",
    "partnerName": "string|null",
    "url": "string|null"
  },
  "status": "draft|submitted|in_review|published|hidden",
  "rating": {
    "average": "number",
    "count": "number"
  },
  "tags": ["string"],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "publishedAt": "ISO8601|null",
  "createdBy": "User",
  "moderatedBy": "User|null"
}
```

#### 4.1.3 Itinerary Entity
```json
{
  "id": "string",
  "slug": "string",
  "title": "string",
  "description": "string|null",
  "duration": "number",
  "budget": {
    "min": "number|null",
    "max": "number|null",
    "currency": "VND"
  },
  "tripType": "solo|couple|family|group|business",
  "isPublic": "boolean",
  "places": [
    {
      "id": "string",
      "placeId": "string",
      "place": "Place",
      "day": "number",
      "order": "number",
      "duration": "number|null",
      "notes": "string|null",
      "estimatedCost": "number|null"
    }
  ],
  "tags": ["string"],
  "images": ["string"],
  "stats": {
    "views": "number",
    "likes": "number",
    "copies": "number"
  },
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "createdBy": "User"
}
```

#### 4.1.4 AI Chat Entity
```json
{
  "id": "string",
  "sessionId": "string",
  "messages": [
    {
      "id": "string",
      "role": "user|assistant",
      "content": "string",
      "timestamp": "ISO8601",
      "metadata": {
        "suggestions": ["string"],
        "itineraryGenerated": "boolean",
        "placesReferenced": ["string"]
      }
    }
  ],
  "context": {
    "userId": "string|null",
    "preferences": {
      "region": "string|null",
      "budget": "string|null",
      "duration": "number|null",
      "interests": ["string"]
    }
  },
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

#### 4.1.5 Moderation Entity
```json
{
  "id": "string",
  "type": "place|itinerary|user|report",
  "targetId": "string",
  "target": "Place|Itinerary|User",
  "status": "pending|approved|rejected|hidden",
  "priority": "low|medium|high|urgent",
  "reason": "string|null",
  "changes": {
    "before": "object|null",
    "after": "object|null",
    "diff": "object|null"
  },
  "actions": [
    {
      "action": "approve|reject|request_edit|hide",
      "reason": "string|null",
      "moderatorId": "string",
      "moderator": "User",
      "timestamp": "ISO8601"
    }
  ],
  "reportedBy": "User|null",
  "assignedTo": "User|null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### 4.2 API Endpoints Structure

#### 4.2.1 Authentication Endpoints
```
POST   /api/auth/login
POST   /api/auth/register  
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

#### 4.2.2 Places Endpoints
```
GET    /api/places                    # Danh sách địa điểm với filters
GET    /api/places/featured           # Địa điểm nổi bật
GET    /api/places/regions/:region    # Địa điểm theo vùng
GET    /api/places/provinces/:province # Địa điểm theo tỉnh
GET    /api/places/types/:type        # Địa điểm theo loại
GET    /api/places/:slug              # Chi tiết địa điểm
POST   /api/places                    # Tạo địa điểm mới (Contributor+)
PUT    /api/places/:id                # Cập nhật địa điểm
DELETE /api/places/:id                # Xóa địa điểm
POST   /api/places/:id/report         # Báo cáo vi phạm
GET    /api/places/:id/related        # Địa điểm liên quan
```

#### 4.2.3 Itineraries Endpoints
```
GET    /api/itineraries               # Danh sách lịch trình công khai
GET    /api/itineraries/my            # Lịch trình của tôi (Auth required)
GET    /api/itineraries/:slug         # Chi tiết lịch trình
POST   /api/itineraries               # Tạo lịch trình mới
PUT    /api/itineraries/:id           # Cập nhật lịch trình
DELETE /api/itineraries/:id           # Xóa lịch trình
POST   /api/itineraries/:id/copy      # Sao chép lịch trình
POST   /api/itineraries/:id/like      # Like/Unlike lịch trình
```

#### 4.2.4 AI Assistant Endpoints
```
POST   /api/ai/chat                   # Gửi tin nhắn chat
GET    /api/ai/suggestions            # Gợi ý nhanh
POST   /api/ai/generate-itinerary     # Sinh lịch trình từ preferences
GET    /api/ai/place-info/:placeId    # Hỏi về địa điểm cụ thể
```

#### 4.2.5 Users & Profiles Endpoints
```
GET    /api/users/:username           # Hồ sơ công khai
PUT    /api/users/me                  # Cập nhật hồ sơ
GET    /api/users/me/contributions    # Đóng góp của tôi
GET    /api/users/me/drafts           # Bản nháp của tôi
```

#### 4.2.6 Moderation Endpoints
```
GET    /api/moderation/queue          # Hàng đợi duyệt (Moderator+)
GET    /api/moderation/reports        # Danh sách báo cáo
GET    /api/moderation/:id            # Chi tiết item cần duyệt
POST   /api/moderation/:id/approve    # Duyệt
POST   /api/moderation/:id/reject     # Từ chối
POST   /api/moderation/:id/hide       # Ẩn nội dung
```

#### 4.2.7 Search & Filters Endpoints
```
GET    /api/search                    # Tìm kiếm tổng hợp
GET    /api/search/places             # Tìm kiếm địa điểm
GET    /api/search/itineraries        # Tìm kiếm lịch trình
GET    /api/filters/regions           # Danh sách vùng
GET    /api/filters/provinces         # Danh sách tỉnh/thành
GET    /api/filters/types             # Danh sách loại hình
```

### 4.3 Sample API Responses

#### 4.3.1 GET /api/places (với pagination & filters)
```json
{
  "data": [
    {
      "id": "place_001",
      "slug": "bai-bien-my-khe",
      "name": "Bãi biển Mỹ Khê",
      "shortDescription": "Bãi biển đẹp nhất Đà Nẵng với cát trắng mịn và nước trong xanh",
      "region": "trung-bo",
      "province": "Đà Nẵng",
      "provinceSlug": "da-nang",
      "type": "bien",
      "images": [
        {
          "id": "img_001",
          "url": "https://example.com/my-khe-1.jpg",
          "alt": "Bãi biển Mỹ Khê ban mai",
          "isPrimary": true
        }
      ],
      "trustLabel": "verified",
      "rating": {
        "average": 4.8,
        "count": 1250
      },
      "tags": ["biển", "du lịch gia đình", "thể thao nước"],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "region": "trung-bo",
    "type": "bien",
    "province": null
  }
}
```

#### 4.3.2 GET /api/places/:slug (chi tiết địa điểm)
```json
{
  "data": {
    "id": "place_001",
    "slug": "bai-bien-my-khe",
    "name": "Bãi biển Mỹ Khê",
    "description": "Bãi biển Mỹ Khê là một trong những bãi biển đẹp nhất Việt Nam...",
    "shortDescription": "Bãi biển đẹp nhất Đà Nẵng với cát trắng mịn và nước trong xanh",
    "region": "trung-bo",
    "province": "Đà Nẵng",
    "provinceSlug": "da-nang",
    "type": "bien",
    "coordinates": {
      "lat": 16.0544,
      "lng": 108.2277
    },
    "address": "Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng",
    "images": [
      {
        "id": "img_001",
        "url": "https://example.com/my-khe-1.jpg",
        "alt": "Bãi biển Mỹ Khê ban mai",
        "caption": "Hoàng hôn tuyệt đẹp tại Mỹ Khê",
        "isPrimary": true
      }
    ],
    "trustLabel": "verified",
    "source": {
      "type": "partner",
      "partnerName": "Sở Du lịch Đà Nẵng",
      "url": "https://tourism.danang.vn"
    },
    "rating": {
      "average": 4.8,
      "count": 1250
    },
    "tags": ["biển", "du lịch gia đình", "thể thao nước"],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-03-01T14:30:00Z",
    "publishedAt": "2024-01-20T09:00:00Z",
    "createdBy": {
      "id": "user_001",
      "username": "danang_tourism",
      "fullName": "Sở Du lịch Đà Nẵng",
      "verified": true
    }
  },
  "related": [
    {
      "id": "place_002",
      "slug": "cau-rong",
      "name": "Cầu Rồng",
      "shortDescription": "Cầu biểu tượng của Đà Nẵng",
      "images": [{"url": "https://example.com/cau-rong.jpg", "isPrimary": true}],
      "type": "check-in"
    }
  ]
}
```

#### 4.3.3 POST /api/ai/generate-itinerary
```json
{
  "request": {
    "preferences": {
      "region": "trung-bo",
      "duration": 3,
      "budget": {
        "min": 2000000,
        "max": 5000000,
        "currency": "VND"
      },
      "tripType": "couple",
      "interests": ["biển", "văn hóa", "ẩm thực"]
    }
  },
  "response": {
    "data": {
      "id": "ai_itinerary_001",
      "title": "Đà Nẵng - Hội An 3 ngày 2 đêm lãng mạn",
      "description": "Lịch trình hoàn hảo cho cặp đôi khám phá vẻ đẹp Đà Nẵng và phố cổ Hội An",
      "duration": 3,
      "estimatedBudget": {
        "total": 3500000,
        "breakdown": {
          "accommodation": 1500000,
          "food": 1200000,
          "transport": 500000,
          "activities": 300000
        },
        "currency": "VND"
      },
      "days": [
        {
          "day": 1,
          "title": "Khám phá Đà Nẵng",
          "places": [
            {
              "id": "place_001",
              "name": "Bãi biển Mỹ Khê",
              "duration": 120,
              "timeSlot": "morning",
              "notes": "Tắm biển và thư giãn",
              "estimatedCost": 0
            },
            {
              "id": "place_002", 
              "name": "Cầu Rồng",
              "duration": 60,
              "timeSlot": "evening",
              "notes": "Xem rồng phun lửa lúc 21h",
              "estimatedCost": 0
            }
          ]
        }
      ],
      "tips": [
        "Mang theo kem chống nắng khi đi biển",
        "Đặt chỗ trước cho nhà hàng phổ biến"
      ],
      "generatedAt": "2024-03-15T10:30:00Z"
    }
  }
}
```

### 4.4 Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      {
        "field": "name",
        "message": "Tên địa điểm là bắt buộc"
      }
    ]
  },
  "timestamp": "2024-03-15T10:30:00Z",
  "path": "/api/places",
  "method": "POST"
}
```

### 4.5 Mock Data Generation Strategy

1. **Places Data**: ~100 địa điểm mẫu phân bố đều 3 vùng, đủ các loại hình
2. **Users Data**: ~50 users với các role khác nhau
3. **Itineraries Data**: ~30 lịch trình công khai đa dạng
4. **AI Responses**: Template responses cho các loại query phổ biến
5. **Moderation Queue**: ~20 items cần duyệt ở các trạng thái khác nhau

**Tools sử dụng:**
- **MSW (Mock Service Worker)** cho browser mocking
- **JSON Server** cho development API
- **Faker.js** cho generate random data
- **Custom scripts** cho Vietnam-specific data (tỉnh/thành, địa điểm thực)

---

## 5. Kết Luận & Bước Tiếp Theo

### 5.1 Tóm Tắt Deliverables

✅ **Work Breakdown Structure**: 14 epics, 60+ tasks chi tiết với ước tính 280 giờ  
✅ **Page Inventory**: 38 màn hình đầy đủ covering 100% features từ tài liệu  
✅ **Component Library**: 60+ reusable components + 7 custom hooks  
✅ **Mock API Plan**: 5 core entities, 35+ endpoints, sample responses  

### 5.2 Priorities & Phasing

**Phase 1 (Weeks 1-2): Foundation**
- E1: Project setup & infrastructure  
- E2: Core UI components
- E3: Layout & navigation

**Phase 2 (Weeks 3-4): Core Features**  
- E4: Homepage
- E5: Places management
- E11: Authentication

**Phase 3 (Weeks 5-6): Advanced Features**
- E6: Itinerary builder
- E8: AI assistant
- E7: Contribute system

**Phase 4 (Week 7): Polish & Launch**
- E10: Moderation dashboard
- E12: Accessibility & performance
- E13: Error handling

### 5.3 Technical Considerations

**Performance:**
- Code splitting per route
- Image optimization with Next.js Image
- Lazy loading for non-critical components
- Virtual scrolling for long lists

**SEO:**
- Static generation for place pages
- Dynamic meta tags
- Structured data (JSON-LD)
- Sitemap generation

**Accessibility:**
- WCAG 2.1 AA compliance
- Screen reader testing
- Keyboard navigation
- Color contrast validation

### 5.4 Risk Mitigation

**High-Risk Items:**
- Drag & drop itinerary builder (T6.1) - Consider using proven library
- AI chat interface (T8.1) - Start with simple implementation
- Map integration (T5.4) - Use established mapping solution

**Dependencies:**
- Design system tokens must be finalized early
- API contracts need agreement before frontend development
- Content strategy for mock data should align with real data structure

### 5.5 Success Metrics

**Technical Metrics:**
- Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Zero critical accessibility violations

**Feature Coverage:**
- 100% của screens định nghĩa trong sitemap
- 100% user flows cho từng role
- 100% responsive breakpoints (mobile, tablet, desktop)
- Dark mode support cho toàn bộ UI

Kế hoạch này đảm bảo coverage đầy đủ cho tất cả requirements từ tài liệu, với approach có thể thực hiện và timeline realistic cho team 2-3 developers trong 7 tuần.

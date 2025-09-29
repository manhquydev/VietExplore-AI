# VietExplore-AI Brand Identity Guide

## 🎨 Tổng quan hệ thống thương hiệu

VietExplore-AI hiện có **3 mẫu logo** khác nhau để phù hợp với các ngữ cảnh sử dụng khác nhau, cùng với một hệ thống màu sắc thống nhất để đảm bảo tính nhất quán của thương hiệu.

---

## 🏷️ Ba mẫu logo chính

### 1. Logo hiện đại - "VietExplore AI"
**File:** `public/logo-modern-v1.svg`

**Đặc điểm:**
- Phong cách hiện đại, công nghệ cao
- Kết hợp biểu tượng Việt Nam với mạng neural AI
- Màu sắc: Ocean teal (#0891B2) + Tech purple (#8B5CF6)
- Font: Inter (clean, modern)

**Sử dụng khi:**
- Giao diện web hiện đại
- Ứng dụng mobile
- Tài liệu công nghệ
- Presentation cho đối tác tech

### 2. Logo truyền thống - "Du Lịch Việt"
**File:** `public/logo-traditional-v2.svg`

**Đặc điểm:**
- Phong cách truyền thống Việt Nam
- Biểu tượng chùa, đèn lồng, sen
- Màu sắc: Vàng rồng (#F59E0B) + Đỏ sen (#DC2626)
- Font: Times New Roman, Noto Serif (traditional)

**Sử dụng khi:**
- Marketing nội địa
- Tài liệu văn hóa du lịch
- Sự kiện truyền thống
- Hợp tác với cơ quan du lịch Việt Nam

### 3. Logo tối giản - "VietExplore.AI"
**File:** `public/logo-minimal-tech-v3.svg`

**Đặc điểm:**
- Thiết kế tối giản, chuyên nghiệp
- Tập trung vào AI và công nghệ
- Màu sắc: Tech blue (#3B82F6) + Neural cyan (#06B6D4)
- Font: Inter (ultra-clean)

**Sử dụng khi:**
- Favicon
- App icons
- Business cards
- Minimalist interfaces

---

## 🎨 Hệ thống màu thống nhất

### Màu chính (Primary Colors)
```css
/* Ocean-inspired blues - Core brand identity */
--brand-primary-500: #0EA5E9;  /* Brand blue (main) */
--brand-primary-600: #0891B2;  /* Ocean teal (primary) */
--brand-primary-700: #0E7490;  /* Deep ocean */
```

### Màu phụ (Secondary Colors)
```css
/* AI/Tech purple gradient */
--brand-secondary-500: #A855F7;  /* AI purple */
--brand-secondary-600: #8B5CF6;  /* Tech purple */
```

### Màu truyền thống (Traditional Colors)
```css
/* Vietnamese heritage colors */
--brand-traditional-500: #F59E0B;  /* Dragon gold */
--brand-traditional-red600: #DC2626;  /* Lotus red */
```

### Màu ngữ nghĩa (Semantic Colors)
```css
--brand-success: #10B981;  /* Success green */
--brand-warning: #F59E0B;  /* Warning amber */
--brand-error: #EF4444;    /* Error red */
--brand-info: #0EA5E9;     /* Info blue */
```

---

## 💻 Cách sử dụng trong code

### 1. Import brand colors
```typescript
import { unifiedBrandColors, logoThemes } from '@/lib/design-system/brand-colors';
```

### 2. Sử dụng với Tailwind CSS
```html
<!-- Primary colors -->
<div className="bg-brand-primary-600 text-white">VietExplore AI</div>

<!-- Traditional colors -->
<div className="text-brand-traditional-500 border-brand-traditional-red600">
  Du Lịch Việt
</div>

<!-- Semantic colors -->
<button className="bg-brand-success hover:bg-brand-primary-700">
  Hoàn thành
</button>
```

### 3. Sử dụng với CSS-in-JS
```typescript
const modernTheme = logoThemes.modern;

const StyledComponent = styled.div`
  background-color: ${modernTheme.primary};
  color: ${modernTheme.text};
`;
```

### 4. Sử dụng với React inline styles
```jsx
<div style={{
  backgroundColor: unifiedBrandColors.primary[600],
  color: unifiedBrandColors.neutral[0]
}}>
  Content here
</div>
```

---

## 📁 Cấu trúc files

```
src/lib/design-system/
├── brand-colors.ts          # Hệ thống màu thống nhất
├── tokens/
│   ├── colors-2025.ts       # Màu 2025 (existing)
│   └── animations.ts        # Animations (existing)

public/
├── logo-modern-v1.svg       # Logo hiện đại
├── logo-traditional-v2.svg  # Logo truyền thống
├── logo-minimal-tech-v3.svg # Logo tối giản
├── logo-horizontal.svg      # Logo cũ (backup)
└── logo-icon.svg           # Icon cũ (backup)
```

---

## 🎯 Guidelines sử dụng

### Khi nào dùng logo nào?

| Ngữ cảnh | Logo phù hợp | Lý do |
|----------|-------------|-------|
| Website chính | Modern | Hiện đại, tech-forward |
| App mobile | Minimal | Clean, recognizable |
| Marketing VN | Traditional | Cultural connection |
| B2B documents | Modern | Professional |
| Social media | Modern/Minimal | Versatile |
| Print materials | Traditional | Rich, detailed |

### Quy tắc sử dụng màu

1. **Ưu tiên màu chính:** Luôn dùng `brand-primary-600` (#0891B2) làm màu chủ đạo
2. **Tương phản:** Đảm bảo tỷ lệ tương phản ≥ 4.5:1 cho accessibility
3. **Nhất quán:** Trong cùng một interface, chỉ dùng một bộ màu (modern/traditional/minimal)
4. **Semantic colors:** Dùng màu ngữ nghĩa cho các action (success, warning, error)

### Accessibility

- Tất cả logo đều có `role="img"` và `aria-label`
- Màu sắc đã được test với WCAG 2.1 Level AA
- Cung cấp text alternative cho screen readers

---

## 🔄 Migration từ logo cũ

### Bước 1: Backup
```bash
# Logos cũ đã được backup với tên:
# logo-horizontal.svg (old)
# logo-icon.svg (old)
```

### Bước 2: Update imports
```typescript
// Old
import logo from '/logo-horizontal.svg';

// New - Choose appropriate logo
import logoModern from '/logo-modern-v1.svg';
import logoTraditional from '/logo-traditional-v2.svg';
import logoMinimal from '/logo-minimal-tech-v3.svg';
```

### Bước 3: Update CSS classes
```css
/* Old */
.text-primary { color: #E91E63; }

/* New */
.text-brand-primary-600 { color: #0891B2; }
```

---

## 🎨 Thiết kế assets bổ sung

Nếu cần thiết kế thêm assets (business cards, banners, etc.), sử dụng:

1. **Màu từ hệ thống:** `unifiedBrandColors`
2. **Logo phù hợp:** Theo guidelines trên
3. **Typography:**
   - Modern: Inter
   - Traditional: Noto Serif, Times New Roman
   - Minimal: Inter (light weights)

---

## 🏃‍♂️ Quick Start

```bash
# 1. Import brand system
import { unifiedBrandColors, logoThemes } from '@/lib/design-system/brand-colors';

# 2. Use in component
<img src="/logo-modern-v1.svg" alt="VietExplore AI" />
<div className="text-brand-primary-600">Welcome to VietExplore AI</div>

# 3. For traditional context
<img src="/logo-traditional-v2.svg" alt="Du Lịch Việt" />
<div className="text-brand-traditional-500">Chào mừng đến Du Lịch Việt</div>
```

---

*Created by Claude Code - VietExplore AI Brand Identity System*
# Hướng dẫn kích hoạt Dark Mode

Dự án hiện tại đã được cấu hình để chỉ sử dụng **Light Mode**. Để kích hoạt lại Dark Mode trong tương lai, hãy làm theo các bước sau:

## 1. Kích hoạt Tailwind Dark Mode

**File:** `tailwind.config.ts`

```typescript
// Thay dòng này:
// // Dark mode disabled - force light mode only
// // darkMode: ['class', '[data-theme="dark"]'],

// Thành:
darkMode: ['class', '[data-theme="dark"]'],
```

## 2. Chuyển đổi Theme Provider

**File:** `src/app/layout.tsx`

```typescript
// Thay dòng này:
import { LightOnlyThemeProvider } from "@/providers/light-only-theme-provider";

// Thành:
import { EnhancedThemeProvider } from "@/providers/enhanced-theme-provider";

// Và thay:
<LightOnlyThemeProvider>
  ...
</LightOnlyThemeProvider>

// Thành:
<EnhancedThemeProvider>
  ...
</EnhancedThemeProvider>
```

## 3. Thêm lại Theme Toggle

**File:** `src/components/header.tsx`

```typescript
// Thêm import:
import { AdvancedThemeToggle } from "@/providers/enhanced-theme-provider";

// Thêm vào Actions section:
{/* Theme Toggle */}
<AdvancedThemeToggle className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" />
```

## 4. Cập nhật Body Class

**File:** `src/app/layout.tsx`

```typescript
// Thay dòng này:
<body className="min-h-screen bg-white text-slate-900 antialiased light">

// Thành:
<body className="min-h-screen bg-bg text-text antialiased">
```

## 5. Cập nhật CSS Color Scheme

**File:** `src/app/globals.css`

```css
/* Thay dòng này: */
/* Force Light Mode Only */
html {
  color-scheme: light only;
}

/* Thành: */
/* Dynamic color scheme based on theme */
html {
  color-scheme: light dark;
}
```

## 6. Thêm lại Dark Mode Classes

Khi kích hoạt dark mode, bạn có thể thêm lại các class dark mode cho các component:

- `dark:bg-slate-900` cho background
- `dark:text-slate-100` cho text chính
- `dark:text-slate-300` cho text phụ
- `dark:border-slate-700` cho border
- v.v.

## Files quan trọng đã được tạo:

- **`src/providers/light-only-theme-provider.tsx`** - Theme provider chỉ dành cho light mode
- **`src/providers/enhanced-theme-provider.tsx`** - Theme provider đầy đủ (đã tồn tại)

## Lưu ý:

- File `LightOnlyThemeProvider` sẽ luôn force light mode
- `EnhancedThemeProvider` hỗ trợ đầy đủ dark/light mode và system detection
- Tất cả dark mode classes đã được xóa khỏi AI assistant plan page để đảm bảo trang luôn light
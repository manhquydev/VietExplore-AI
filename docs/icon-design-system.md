# Icon Design System - Outline Icons

## Nguyên tắc thiết kế mới

### 🎯 Mục tiêu
Chuyển từ colorful gradient icon backgrounds sang clean outline icons để tạo ra giao diện tối giản và professional hơn.

### ❌ Loại bỏ (OLD)
```tsx
// Gradient background icons - KHÔNG SỬ DỤNG
<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
  <User className="w-4 h-4 text-white" />
</div>
```

### ✅ Sử dụng (NEW)
```tsx
// Outline icons với màu sắc semantic
<User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
```

## Color Palette cho Icons

### Primary Actions
- **Sky**: `text-sky-600 dark:text-sky-400` - User profile, main actions
- **Teal**: `text-teal-600 dark:text-teal-400` - Success, growth

### Semantic Colors
- **Purple**: `text-purple-600 dark:text-purple-400` - Calendar, time
- **Rose**: `text-rose-600 dark:text-rose-400` - Favorites, likes
- **Emerald**: `text-emerald-600 dark:text-emerald-400` - Contributions, create
- **Amber**: `text-amber-600 dark:text-amber-400` - Help, warnings
- **Blue**: `text-blue-600 dark:text-blue-400` - Moderation, admin
- **Violet**: `text-violet-600 dark:text-violet-400` - System admin
- **Red**: `text-red-600 dark:text-red-400` - Logout, delete
- **Slate**: `text-slate-600 dark:text-slate-400` - Settings, neutral

## Icon Sizes

### Standard Sizes
- **Small**: `w-4 h-4` - Button icons, inline icons
- **Medium**: `w-5 h-5` - Menu items, form icons (RECOMMENDED)
- **Large**: `w-6 h-6` - Headers, emphasis icons

## Conversion Examples

### User Menu Items
```tsx
// OLD
<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
  <User className="w-4 h-4 text-white" />
</div>

// NEW
<User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
```

### Action Buttons
```tsx
// OLD - Colorful backgrounds
<div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500">
  <Icon className="w-6 h-6 text-white" />
</div>

// NEW - Clean outline with subtle background
<div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
  <Icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
</div>
```

## Migration Checklist

### Phase 1: Navigation & Headers ✅
- [x] Header user menu
- [ ] Main navigation
- [ ] Mobile menu

### Phase 2: Core Pages
- [ ] Homepage hero section
- [ ] Places page
- [ ] AI Assistant
- [ ] Profile pages
- [ ] Settings

### Phase 3: Forms & Buttons
- [ ] Auth forms
- [ ] Contribute forms
- [ ] Settings forms
- [ ] Action buttons

## Benefits

1. **Cleaner Design**: Loại bỏ visual clutter
2. **Better Hierarchy**: Focus vào content thay vì decorative elements
3. **Faster Loading**: Ít CSS gradients
4. **Accessibility**: Tương tự màu sắc tốt hơn
5. **Modern Look**: Theo trend design hiện tại

## Implementation Guidelines

1. **Consistency**: Sử dụng cùng size và color cho cùng context
2. **Semantic**: Màu sắc phải có ý nghĩa logic
3. **Contrast**: Đảm bảo contrast tốt cho accessibility
4. **Dark Mode**: Luôn cung cấp dark variant

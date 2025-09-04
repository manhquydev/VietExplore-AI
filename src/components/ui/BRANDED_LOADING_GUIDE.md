# Du Lịch Việt - Branded Loading System Guide

## Overview
This document describes the comprehensive branded loading system implemented for the Du Lịch Việt project, which integrates the lotus logo brand identity into all loading states for a cohesive user experience.

## Components

### 1. `BrandedLoading` - Main Loading Component
The primary branded loading component with multiple variants and animations.

```tsx
import { BrandedLoading } from "@/components/ui/branded-loading"

// Basic usage
<BrandedLoading variant="logo" size="md" />

// With custom text
<BrandedLoading variant="logo" size="lg" text="Đang tải dữ liệu..." />

// Without text
<BrandedLoading variant="spinner" size="sm" showText={false} />
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" - Controls the size of the loading indicator
- `variant`: "logo" | "spinner" | "pulse" | "dots" - Different animation styles
- `text`: string - Custom loading text (default: "Đang tải...")
- `showText`: boolean - Whether to show the loading text (default: true)
- `className`: string - Additional CSS classes

**Variants:**
- `logo`: Animated lotus logo with rotating ring (recommended for page loading)
- `spinner`: Static logo with spinning ring around it (good for components)
- `pulse`: Logo with pulsing background effect (subtle option)
- `dots`: Logo with bouncing dots below (playful option)

### 2. `FullScreenLoading` - Page-Level Loading
Full screen loading overlay for initial page loads and major transitions.

```tsx
import { FullScreenLoading } from "@/components/ui/branded-loading"

// Basic usage
<FullScreenLoading />

// With progress bar
<FullScreenLoading 
  variant="logo"
  showProgress={true} 
  progress={65}
  title="Du Lịch Việt"
  description="Đang chuẩn bị trải nghiệm tuyệt vời cho bạn..."
/>
```

**Props:**
- `variant`: "logo" | "spinner" | "pulse" - Loading animation style
- `title`: string - Main title text
- `description`: string - Descriptive text below title
- `showProgress`: boolean - Whether to show progress bar
- `progress`: number (0-100) - Progress percentage

### 3. `PageLoadingOverlay` - Component Overlay
Loading overlay for specific components or sections.

```tsx
import { PageLoadingOverlay } from "@/components/ui/branded-loading"

<PageLoadingOverlay isLoading={isLoading} loadingText="Đang xử lý...">
  <YourComponent />
</PageLoadingOverlay>
```

**Props:**
- `isLoading`: boolean - Controls overlay visibility
- `children`: ReactNode - Content to overlay
- `variant`: "logo" | "spinner" | "pulse" - Animation style
- `loadingText`: string - Loading message
- `className`: string - Additional CSS classes

### 4. `LoadingButton` - Interactive Button Loading
Button component with integrated loading state and branded spinner.

```tsx
import { LoadingButton } from "@/components/ui/branded-loading"

<LoadingButton 
  isLoading={isSubmitting}
  onClick={handleSubmit}
  variant="primary"
  loadingText="Đang gửi..."
>
  Submit
</LoadingButton>
```

**Props:**
- `isLoading`: boolean - Loading state
- `loadingText`: string - Text shown during loading
- `variant`: "default" | "primary" | "secondary" - Button style
- `children`: ReactNode - Button content when not loading
- All standard button props

### 5. `BrandedCardSkeleton` - Content Placeholders
Branded skeleton components for card-based content loading.

```tsx
import { BrandedCardSkeleton } from "@/components/ui/branded-loading"

// With image placeholder
<BrandedCardSkeleton showImage={true} lines={4} />

// Text-only skeleton
<BrandedCardSkeleton showImage={false} lines={3} />
```

**Props:**
- `showImage`: boolean - Whether to show image placeholder
- `lines`: number - Number of text placeholder lines
- `className`: string - Additional CSS classes

### 6. `LotusLogo` - Animated Brand Logo
Standalone lotus logo component with animation capabilities.

```tsx
import { LotusLogo } from "@/components/ui/branded-loading"

// Animated logo
<LotusLogo animate={true} size="lg" />

// Static logo
<LotusLogo animate={false} size="md" />
```

**Props:**
- `animate`: boolean - Whether to animate the logo
- `size`: "sm" | "md" | "lg" | "xl" - Logo size
- All standard SVG props

## Usage Guidelines

### When to Use Each Component

1. **Page Loading (`FullScreenLoading`)**
   - Initial app/page load
   - Route transitions
   - Major data fetching operations
   - Authentication flows

2. **Component Loading (`BrandedLoading`)**
   - Small component states
   - Inline loading indicators
   - Search results loading
   - Form validation

3. **Overlay Loading (`PageLoadingOverlay`)**
   - Form submissions
   - File uploads
   - API calls that affect entire sections
   - Background processing

4. **Button Loading (`LoadingButton`)**
   - Form submit buttons
   - Action buttons (save, delete, etc.)
   - Any clickable element that triggers async operations

5. **Content Skeletons (`BrandedCardSkeleton`)**
   - List/grid item loading
   - Card-based content
   - Preview placeholders

### Animation Timing
All components use consistent timing for smooth UX:
- Logo animations: 2-3 second cycles
- Fade transitions: 300ms
- Skeleton pulse: 1.5 second cycles
- Progress animations: Linear with easing

### Accessibility Features
- Proper ARIA labels (`aria-label="Loading..."`)
- Screen reader support with `role="status"`
- Reduced motion support via CSS `prefers-reduced-motion`
- Semantic HTML structure
- Keyboard navigation support where applicable

### Performance Considerations
- SVG animations use efficient CSS transforms
- Components are tree-shakable
- Minimal JavaScript animation dependencies
- Optimized for 60fps animations

## Migration from Legacy Loading

### Replace LoadingSpinner
```tsx
// Old
import { LoadingSpinner } from "@/components/ui/loading-spinner"
<LoadingSpinner size="lg" variant="primary" />

// New (recommended)
import { BrandedLoading } from "@/components/ui/branded-loading"
<BrandedLoading variant="logo" size="lg" />

// Or use branded variant of old component
<LoadingSpinner size="lg" variant="branded" />
```

### Replace LoadingOverlay
```tsx
// Old
import { LoadingOverlay } from "@/components/ui/loading-spinner"
<LoadingOverlay isLoading={loading}>...</LoadingOverlay>

// New
import { PageLoadingOverlay } from "@/components/ui/branded-loading"
<PageLoadingOverlay isLoading={loading}>...</PageLoadingOverlay>
```

### Replace LoadingCard
```tsx
// Old
import { LoadingCard } from "@/components/ui/loading-spinner"
<LoadingCard showImage={true} lines={3} />

// New
import { BrandedCardSkeleton } from "@/components/ui/branded-loading"
<BrandedCardSkeleton showImage={true} lines={3} />
```

## Customization

### Theme Integration
Components inherit from the design system:
- Primary colors: Pink gradient (#E91E63 to #F48FB1)
- Background: White/transparent with backdrop blur
- Shadows: Consistent with card design system
- Border radius: Follows design system (rounded-xl)

### Custom Animations
To add custom animations, extend the `LotusLogo` component:

```tsx
const CustomAnimatedLogo = () => (
  <LotusLogo animate={true} className="custom-animation" />
)
```

### Color Variants
The system uses consistent branding colors:
- Primary: Pink gradient for logo and accents
- Background: White with transparency
- Text: Semantic colors (gray-600, gray-700)

## Testing

Test all loading states in the dedicated test page:
- Navigate to `/test-loading` in development
- Test all variants and sizes
- Verify responsive behavior
- Check accessibility with screen readers

## Best Practices

1. **Consistency**: Always use branded components for loading states
2. **Performance**: Use appropriate component for the context (don't use FullScreenLoading for small operations)
3. **Accessibility**: Ensure loading states are announced to screen readers
4. **UX**: Provide meaningful loading text that describes the operation
5. **Responsive**: Test loading states on all device sizes
6. **Timing**: Don't show loading for operations under 200ms

## Browser Support
- Modern browsers with CSS animations support
- Fallbacks for older browsers (static logos)
- SVG support required for optimal experience

## Future Enhancements
- Sound feedback options
- Haptic feedback for mobile devices
- More animation variants
- Theme customization API
- Progress tracking improvements
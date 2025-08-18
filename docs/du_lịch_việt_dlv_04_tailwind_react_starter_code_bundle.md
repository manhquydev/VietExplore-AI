# DLV‑04 · Tailwind + React Starter (deliverables)

> Bao gồm `tailwind.config.js`, `globals.css`, và các component mẫu: `Button`, `Card`, `Navbar`, `Hero`, `PlaceCard`, `Footer`. Code ưu tiên A11y, responsive, dark mode, và tương thích với tokens ở DLV‑01.

---

## 1) tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    container: { center: true, padding: '24px' },
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        primary: {
          DEFAULT: 'var(--primary)',
          700: 'var(--primary-700)'
        },
        success: 'var(--success)', warn: 'var(--warn)', danger: 'var(--danger)'
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        soft: '0 2px 8px rgba(16,24,40,.06)',
        card: '0 8px 24px rgba(16,24,40,.08)',
        float: '0 16px 48px rgba(2,6,23,.12)'
      },
      borderRadius: {
        md: '12px', lg: '16px', xl: '20px', '2xl': '24px'
      },
      transitionTimingFunction: {
        elegant: 'cubic-bezier(.2,.6,.2,1)'
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } }
      },
      animation: {
        shimmer: 'shimmer 1200ms ease-in-out infinite'
      }
    }
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
}
```

## 2) globals.css
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
@tailwind base;@tailwind components;@tailwind utilities;

:root{--bg:#fff;--surface:#F6F8FC;--text:#101010;--muted:#667085;--border:#E5E7EB;--primary:#2986FE;--primary-700:#1E6EE3;--success:#16A34A;--warn:#F59E0B;--danger:#EF4444}
.dark{--bg:#0B1220;--surface:#101826;--text:#E6E8EC;--muted:#98A2B3;--border:#2B3342;--primary:#2986FE;--primary-700:#4F93FF}

/* Focus ring */
:where(button, a, input, textarea, select){@apply focus-visible:outline-none;}
:where(button, a, input, textarea, select):focus-visible{box-shadow:0 0 0 2px #fff,0 0 0 4px #93C5FD}
:where([data-theme="dark"]) :where(button, a, input, textarea, select):focus-visible{box-shadow:0 0 0 2px #0B1220,0 0 0 4px #93C5FD}

/***** Component primitives *****/
@layer components{
  .btn{ @apply inline-flex items-center justify-center gap-2 rounded-full transition-all duration-150 ease-elegant disabled:opacity-50 disabled:cursor-not-allowed; height:40px; padding:0 16px; }
  .btn-lg{ height:48px; padding:0 20px; }
  .btn-sm{ height:32px; padding:0 12px; }
  .btn-primary{ @apply bg-primary text-white shadow-float hover:bg-primary-700 active:translate-y-px; }
  .btn-secondary{ @apply border border-primary text-primary bg-transparent hover:bg-primary/10; }
  .btn-ghost{ @apply text-primary hover:bg-surface; }
  .card{ @apply bg-surface rounded-lg shadow-card border border-border; }
  .chip{ @apply inline-flex items-center gap-1 rounded-full px-3 h-7 text-sm bg-primary/10 text-primary; }
}

/* Skeleton */
.skeleton{position:relative;overflow:hidden;background:linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 37%,#E5E7EB 63%);background-size:400% 100%;animation:shimmer 1.2s infinite;}
```

## 3) src/components/Button.tsx
```tsx
import * as React from 'react';
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary'|'secondary'|'ghost'|'danger'; size?: 'sm'|'md'|'lg'; loading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({variant='primary',size='md',className='',loading,children,...props},ref){
  const base = 'btn';
  const byVariant = {primary:'btn-primary',secondary:'btn-secondary',ghost:'btn-ghost',danger:'bg-danger text-white hover:brightness-95'} as const;
  const bySize = {sm:'btn-sm',md:'',lg:'btn-lg'} as const;
  return (
    <button ref={ref} className={[base,byVariant[variant],bySize[size],className].join(' ')} aria-busy={loading} {...props}>
      {loading && (<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" d="M4 12a8 8 0 018-8" fill="currentColor"/></svg>)}
      {children}
    </button>
  )
});
```

## 4) src/components/Card.tsx
```tsx
import * as React from 'react';
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='',...props}) => (
  <div className={["card p-5",className].join(' ')} {...props}/>
);
```

## 5) src/components/Navbar.tsx
```tsx
import * as React from 'react';
import { Button } from './Button';
export const Navbar: React.FC = () => (
  <header className="sticky top-0 z-30 backdrop-blur bg-bg/80 border-b border-border">
    <div className="container h-[72px] flex items-center justify-between">
      <a href="/" className="font-bold text-xl">Du Lịch Việt</a>
      <nav className="hidden md:flex gap-6 text-[15px] text-muted">
        <a href="/places" className="hover:text-text">Địa điểm</a>
        <a href="/itineraries/builder" className="hover:text-text">Lịch trình</a>
        <a href="/contribute/new-place" className="hover:text-text">Đóng góp</a>
        <a href="/ai-assistant/chat" className="hover:text-text">Trợ lý AI</a>
        <a href="/community" className="hover:text-text">Cộng đồng</a>
        <a href="/about" className="hover:text-text">Về dự án</a>
      </nav>
      <div className="flex items-center gap-3">
        <Button className="hidden md:inline-flex">Bắt đầu với AI</Button>
        <Button variant="ghost" aria-label="Đổi giao diện" onClick={()=>document.documentElement.classList.toggle('dark')}>🌓</Button>
      </div>
    </div>
  </header>
);
```

## 6) src/components/Hero.tsx
```tsx
import * as React from 'react';
import { Button } from './Button';
export const Hero: React.FC = () => (
  <section className="container grid lg:grid-cols-12 gap-8 items-center py-16">
    <div className="lg:col-span-6 space-y-6">
      <p className="text-sm text-muted uppercase tracking-wide">Elevate your travel journey</p>
      <h1 className="font-bold leading-tight text-[clamp(32px,4vw,48px)]">Trải nghiệm phép màu của những chuyến bay!</h1>
      <p className="text-muted max-w-prose">Khám phá địa điểm đáng tin cậy khắp Việt Nam và để Trợ lý AI giúp bạn tạo lịch trình trong vài phút.</p>
      <div className="flex gap-3">
        <Button className="btn-lg">Bắt đầu với AI</Button>
        <Button variant="secondary" className="btn-lg">Khám phá địa điểm</Button>
      </div>
    </div>
    <div className="lg:col-span-6">
      <div className="relative rounded-2xl shadow-float overflow-hidden">
        <div className="aspect-[16/10] bg-surface" aria-hidden/>
        {/* Placeholder ảnh/hero */}
        <div className="absolute inset-0 grid place-items-center text-muted">Ảnh hero (máy bay/biển)</div>
      </div>
      <div className="mt-4 flex gap-3">
        <span className="chip">Địa điểm xác thực</span>
        <span className="chip">Phi lợi nhuận</span>
      </div>
    </div>
  </section>
);
```

## 7) src/components/PlaceCard.tsx
```tsx
import * as React from 'react';
import { Button } from './Button';
export const PlaceCard: React.FC<{title:string,location:string,tag?:string}> = ({title,location,tag}) => (
  <article className="card overflow-hidden">
    <div className="aspect-[3/2] bg-[#E9F2FF]"/>
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-[17px] leading-6">{title}</h3>
      <p className="text-sm text-muted">{location}{tag?` · ${tag}`:''}</p>
      <div className="pt-2"><Button size="sm">Thêm vào lịch trình</Button></div>
    </div>
  </article>
);
```

## 8) src/components/Footer.tsx
```tsx
import * as React from 'react';
export const Footer: React.FC = () => (
  <footer className="mt-20 border-t border-border">
    <div className="container py-10 grid md:grid-cols-3 gap-10 text-sm text-muted">
      <div>
        <h4 className="font-semibold mb-3 text-text">Du Lịch Việt</h4>
        <p>Nền tảng phi lợi nhuận, dữ liệu du lịch Việt Nam đáng tin cậy.</p>
      </div>
      <nav className="space-y-2">
        <a href="/about" className="block hover:text-text">Về dự án</a>
        <a href="/community" className="block hover:text-text">Cộng đồng</a>
        <a href="/legal/terms" className="block hover:text-text">Điều khoản</a>
      </nav>
      <div>
        <p>© {new Date().getFullYear()} Du Lịch Việt</p>
      </div>
    </div>
  </footer>
);
```

## 9) src/App.tsx (demo trang chủ)
```tsx
import * as React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PlaceCard } from './components/PlaceCard';
import { Footer } from './components/Footer';
export default function App(){
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar/>
      <main>
        <Hero/>
        <section className="container py-10">
          <div className="flex items-center justify-between mb-4"><h2 className="text-2xl font-semibold">Điểm đến phổ biến</h2><a className="text-primary" href="/places">Xem tất cả</a></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <PlaceCard title="Bãi biển Mỹ Khê" location="Đà Nẵng" tag="Biển"/>
            <PlaceCard title="Đồi chè Cầu Đất" location="Đà Lạt" tag="Núi"/>
            <PlaceCard title="Phố cổ Hội An" location="Quảng Nam" tag="Văn hoá"/>
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}
```

---

## 10) Hướng dẫn tích hợp nhanh
1. Cài đặt: `npm i react react-dom tailwindcss @tailwindcss/forms @tailwindcss/typography`.
2. Thêm `tailwind.config.js` và `globals.css` như trên; import CSS trong entry `index.tsx`.
3. Dán các component vào `src/components/` và dùng `App.tsx` demo.
4. Kích hoạt dark mode bằng thêm class `dark` vào `html` hoặc `data-theme="dark"` vào root.

> Tất cả tên token, màu, radius… khớp với DLV‑01 để mở rộng đồng nhất.


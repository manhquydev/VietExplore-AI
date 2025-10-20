Progressive Web App (PWA) Integration Plan for Du Lịch Việt
Technical Research Summary
Recommended Approach: Serwist (Not next-pwa)
Why Serwist:
✅ Next.js 15 Compatible - Works seamlessly with Turbopack (next-pwa has compatibility warnings)
✅ Actively Maintained - Official Next.js documentation recommends it
✅ Successor to next-pwa - Built on proven workbox patterns
✅ TypeScript First - Full type safety out of the box
Why NOT next-pwa:
❌ Webpack-based (conflicts with Next.js 15's Turbopack)
❌ Development stalled
❌ Generates warnings with modern Next.js
Implementation Plan (5 Phases)
Phase 1: Project Setup & Dependencies
Tasks:
Install Serwist packages: @serwist/next, serwist (dev)
Generate PWA icons (192×192, 512×512 PNG + maskable variants)
Update .gitignore to exclude generated service worker files
Deliverables:
Updated package.json with new dependencies
4 new icon files: icon-192.png, icon-512.png, icon-192-maskable.png, icon-512-maskable.png
Phase 2: Configuration Files
Tasks:
Update next.config.ts with Serwist wrapper
Update tsconfig.json (add webworker types, exclude sw files)
Create src/app/sw.ts (service worker entry point)
Create public/manifest.json (Web App Manifest)
Key Configuration Decisions:
Service Worker Location: src/app/sw.ts (App Router standard)
SW Output: public/sw.js (auto-generated)
Caching Strategy: Hybrid approach:
Cache-First: Static assets (CSS, JS, images, fonts)
Stale-While-Revalidate: HTML pages, API routes
Network-First: Critical dynamic data (auth, user profile)
Manifest.json Structure:
{
  "name": "Du Lịch Việt - Khám phá Việt Nam",
  "short_name": "Du Lịch Việt",
  "description": "Nền tảng du lịch thông minh với AI",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#16A34A",
  "background_color": "#FFFFFF",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-192-maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
Phase 3: Service Worker Implementation
Tasks:
Implement custom runtime caching rules for Du Lịch Việt:
Place pages (/places/*) - Stale-while-revalidate (60min cache)
API routes (/api/places/*) - Network-first with 5s timeout fallback
Firebase Storage images - Cache-first (365 days)
Static assets - Cache-first (immutable)
Add offline fallback page (/offline)
Implement cache versioning strategy
Custom Caching Logic:
runtimeCaching: [
  {
    urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
    handler: 'CacheFirst',
    options: { cacheName: 'firebase-images', expiration: { maxEntries: 200, maxAgeSeconds: 31536000 } }
  },
  {
    urlPattern: /\/places\/[^/]+$/i,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'place-pages', expiration: { maxAgeSeconds: 3600 } }
  },
  {
    urlPattern: /\/api\/places\/.*/i,
    handler: 'NetworkFirst',
    options: { cacheName: 'api-places', networkTimeoutSeconds: 5 }
  }
]
Phase 4: UI Enhancements
Tasks:
Create InstallPrompt component (A2HS banner)
Add offline status indicator (enhance existing NetworkStatus component)
Create offline fallback page with cached places
Add "Update Available" prompt for new SW versions
InstallPrompt Component Features:
Detect beforeinstallprompt event
Dismissible banner (persist dismissal for 7 days)
Show only on 2nd+ visit (avoid annoying first-time users)
Vietnamese copy: "Cài đặt ứng dụng để truy cập nhanh hơn"
Phase 5: Testing & Optimization
Tasks:
Lighthouse PWA Audit - Target: 90+ score
Install Testing:
Android Chrome (test A2HS)
iOS Safari (test Add to Home Screen)
Desktop Chrome/Edge
Offline Testing:
Homepage loads offline
Previously visited place pages work offline
Graceful degradation for un-cached content
Performance Validation:
No regression in Performance/Accessibility/SEO scores
Measure cache hit rate (target: 70%+ for repeat visitors)
Caching Strategy Breakdown
Resource Type	Strategy	Cache Duration	Rationale
Static Assets (CSS/JS)	Cache-First	Immutable	Versioned, never change
Images (Firebase Storage)	Cache-First	365 days	Rarely change, large files
Place Detail Pages	Stale-While-Revalidate	60 min	Balance freshness + speed
Place List API	Network-First	5s timeout	Dynamic, needs fresh data
User Auth API	Network-Only	N/A	Security-critical
Fonts (Google)	Cache-First	365 days	Stable CDN resources
Expected Impact
User Experience Improvements:
✅ Installable App - Users can add to home screen (Android/iOS/Desktop)
✅ Offline Access - Browse previously visited places without internet
✅ Faster Load Times - Static assets served from cache instantly
✅ Reduced Data Usage - Images/assets cached locally
Technical Metrics:
Lighthouse PWA Score: 0 → 90+
First Load (Repeat Visitor): ~2s → ~500ms (cached assets)
Firebase Storage Bandwidth: Reduce by ~40% (image caching)
Installability: 100% on Chromium browsers, 90% on iOS Safari
Constraints & Considerations
✅ Maintained:
No regression in Lighthouse Performance/Accessibility/SEO scores
Compatible with existing Firebase integration
Works with current Next.js 15 + TypeScript setup
⚠️ Limitations:
iOS Safari quirks: Install prompt less prominent than Android
Cache storage limits: ~50-100MB per origin (managed by expiration policies)
Dynamic content: Some pages (admin, real-time moderation) remain online-only
🔧 Development Best Practices:
Disable SW in dev - Avoid "cache hell" during development
Version SW on deploy - Force update on production changes
Monitor cache size - Use Firebase Analytics to track storage usage
Documentation Deliverables
Technical Proposal - This document
Implementation Guide - Step-by-step developer setup
User Guide - How to install and use offline features
Demo Video - Show offline mode + A2HS workflow
Timeline Estimate
Phase 1 (Setup): 2 hours
Phase 2 (Config): 3 hours
Phase 3 (Service Worker): 4 hours
Phase 4 (UI): 3 hours
Phase 5 (Testing): 3 hours
Documentation: 2 hours
Total: ~17 hours (2-3 working days)
Success Criteria
 Lighthouse PWA audit score ≥90
 Successfully installs on Android Chrome
 Successfully installs on iOS Safari
 Homepage loads correctly when offline
 At least 3 previously visited place pages load offline
 No performance regression (Performance score ≥85)
 Cache hit rate ≥70% for repeat visitors (after 1 week)
# Cấu Trúc Thư Mục & Hướng Dẫn Setup - Du Lịch Việt

> **Phiên bản:** 3.0.0
> **Ngày cập nhật:** Tháng 10, 2025

---

## Mục Lục

1. [Cấu Trúc Thư Mục](#1-cấu-trúc-thư-mục)
2. [File và Thư Mục Quan Trọng](#2-file-và-thư-mục-quan-trọng)
3. [Hướng Dẫn Cài Đặt](#3-hướng-dẫn-cài-đặt)
4. [Configuration Files](#4-configuration-files)
5. [Scripts Hữu Ích](#5-scripts-hữu-ích)
6. [Development Workflow](#6-development-workflow)
7. [Deployment Guide](#7-deployment-guide)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Cấu Trúc Thư Mục

### 1.1. Root Level

```
Du-Lich-Viet/
├── .claude/                    # Claude AI documentation
│   └── docs/                   # Detailed project docs
│
├── .github/                    # GitHub workflows (optional)
│
├── public/                     # Static assets
│   ├── icons/                  # PWA icons
│   ├── images/                 # Public images
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker (generated)
│
├── scripts/                    # Utility scripts
│   ├── seed-places-vietnam.js  # Seed places data
│   ├── create-admin-user.js    # Create admin account
│   ├── start-dev.js            # Smart dev server
│   └── ...
│
├── src/                        # Source code (main)
│   ├── ai/                     # AI flows (Genkit)
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Libraries & utilities
│   └── middleware.ts           # Next.js middleware
│
├── .env.local                  # Environment variables (DO NOT COMMIT)
├── .gitignore                  # Git ignore rules
├── CLAUDE.md                   # Claude AI instructions
├── firebase.json               # Firebase config
├── firestore.indexes.json      # Firestore indexes
├── firestore.rules             # Firestore security rules
├── next.config.ts              # Next.js config
├── package.json                # Dependencies
├── README.md                   # Project README
├── tailwind.config.ts          # TailwindCSS config
├── tsconfig.json               # TypeScript config
└── plan.md                     # Development plan
```

### 1.2. Source Code Structure (`src/`)

```
src/
├── ai/                         # Google Genkit AI flows
│   ├── flows/
│   │   ├── place-chat-flow.ts  # Place-specific chatbot
│   │   └── chat-flow.ts        # General chat (future)
│   └── dev.ts                  # Genkit dev server entry
│
├── app/                        # Next.js 15 App Router
│   ├── (root)/                 # Main layout group
│   │   ├── layout.tsx          # Root layout (no Header)
│   │   ├── page.tsx            # Homepage
│   │   ├── places/             # Place routes
│   │   │   ├── page.tsx        # Browse places
│   │   │   ├── saved/          # Saved places
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Place detail (SSR)
│   │   ├── explore/
│   │   │   ├── [region]/       # By region (bac-bo, etc)
│   │   │   └── [type]/         # By type (bien, nui, etc)
│   │   ├── profile/
│   │   │   └── me/             # User profile
│   │   ├── contribute/
│   │   │   ├── create/         # Create place
│   │   │   ├── edit/[id]/      # Edit draft
│   │   │   └── my-drafts/      # My drafts list
│   │   └── notifications/      # Notifications page
│   │
│   ├── admin/                  # Admin panel
│   │   ├── layout.tsx          # Admin-specific layout
│   │   ├── dashboard/          # Analytics dashboard
│   │   ├── moderation/
│   │   │   ├── queue/          # Moderation queue
│   │   │   └── reports/        # Reports management
│   │   ├── users/              # User management
│   │   └── settings/           # System settings
│   │
│   ├── api/                    # API Routes
│   │   ├── auth/               # Authentication
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── me/
│   │   ├── places/             # Places CRUD
│   │   │   ├── route.ts        # GET /api/places
│   │   │   ├── drafts/         # Draft management
│   │   │   ├── my-drafts/      # User's drafts
│   │   │   └── [id]/
│   │   │       ├── route.ts    # GET/PATCH/DELETE
│   │   │       ├── reviews/    # Reviews API
│   │   │       ├── reports/    # Report place
│   │   │       └── favorite/   # Save/unsave
│   │   ├── moderation/
│   │   │   └── queue/
│   │   │       ├── route.ts    # GET queue
│   │   │       └── [itemId]/
│   │   │           └── route.ts # Actions
│   │   ├── reviews/
│   │   │   └── [id]/
│   │   │       ├── helpful/    # Vote helpful
│   │   │       └── report/     # Report review
│   │   ├── admin/              # Admin APIs
│   │   │   ├── users/          # User management
│   │   │   ├── places/         # Place management
│   │   │   ├── reports/        # Report handling
│   │   │   └── analytics/      # Analytics data
│   │   ├── ai/                 # AI APIs
│   │   │   ├── chat/           # General chat
│   │   │   └── place-chat/     # Place chatbot
│   │   └── cron/               # Cron jobs
│   │       ├── cleanup-expired-claims/
│   │       ├── archive-moderation-queue/
│   │       └── process-expired/
│   │
│   ├── globals.css             # Global CSS
│   ├── layout.tsx              # Root layout
│   ├── not-found.tsx           # 404 page
│   ├── error.tsx               # Error boundary
│   ├── loading.tsx             # Loading skeleton
│   └── sw.ts                   # Service Worker (PWA)
│
├── components/                 # React Components
│   ├── ui/                     # Base UI (Radix wrappers)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── toast.tsx
│   │   └── ... (30+ components)
│   ├── auth/                   # Auth components
│   │   ├── login-modal.tsx
│   │   ├── register-modal.tsx
│   │   └── protected-route.tsx
│   ├── places/                 # Place components
│   │   ├── place-card.tsx
│   │   ├── place-detail-content.tsx
│   │   ├── place-filters.tsx
│   │   └── place-images-carousel.tsx
│   ├── modals/                 # Modal dialogs
│   │   ├── create-place-modal.tsx
│   │   └── review-modal.tsx
│   ├── notifications/          # Notifications
│   │   ├── notification-bell.tsx
│   │   └── notification-item.tsx
│   ├── admin/                  # Admin components
│   │   ├── moderation-queue-table.tsx
│   │   └── analytics-charts.tsx
│   ├── pwa/                    # PWA components
│   │   ├── install-prompt.tsx
│   │   └── service-worker-registration.tsx
│   ├── header.tsx              # Global header
│   ├── footer.tsx              # Global footer
│   └── providers.tsx           # Context providers
│
├── hooks/                      # Custom React Hooks
│   ├── use-auth.ts             # Auth state
│   ├── use-places.ts           # Fetch places
│   ├── use-place-stats.ts      # View tracking + stats
│   ├── use-user-drafts.ts      # Draft management
│   ├── use-moderation-queue.ts # Moderation queue
│   ├── use-place-reviews.ts    # Reviews
│   ├── use-place-chat.ts       # AI chatbot
│   └── use-realtime-notifications.ts # Real-time notifs
│
├── lib/                        # Core Libraries
│   ├── server/                 # Server-side only
│   │   ├── auth-middleware.ts  # Auth verification
│   │   ├── view-tracker.ts     # View tracking service
│   │   ├── enhanced-notification-service.ts
│   │   ├── moderation-health-monitor.ts
│   │   └── ... (more services)
│   ├── client/                 # Client-side only
│   │   ├── api.ts              # API client (callApi)
│   │   └── firebase-storage.ts # Storage utils
│   ├── firebase/               # Firebase configs
│   │   ├── firebase.ts         # Client SDK
│   │   ├── firebase-admin.ts   # Admin SDK
│   │   └── realtime.ts         # Realtime DB
│   ├── types/                  # TypeScript types
│   │   ├── auth.ts
│   │   ├── places.ts
│   │   ├── reviews.ts
│   │   ├── notifications.ts
│   │   └── reports.ts
│   ├── auth/                   # Auth utilities
│   │   ├── permissions.ts      # RBAC logic
│   │   └── email-verification.ts
│   ├── utils/                  # Utilities
│   │   ├── api.ts
│   │   └── url-helpers.ts
│   ├── vietnam-provinces.ts    # Vietnam admin data
│   ├── notification-config.tsx # Notification icons
│   └── utils.ts                # General utils
│
└── middleware.ts               # Next.js middleware (auth, redirects)
```

---

## 2. File và Thư Mục Quan Trọng

### 2.1. Configuration Files

#### `package.json`
```json
{
  "name": "Du-Lich-Viet",
  "version": "3.0.0",
  "scripts": {
    "dev": "node scripts/start-dev.js",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

#### `.env.local` (Template)
```bash
# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# Firebase Admin SDK (Server-Side - SECRET!)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# Google AI
GOOGLE_API_KEY=your_google_ai_api_key
GOOGLE_GENAI_API_KEY=your_genai_key

# App Config
NEXT_PUBLIC_BASE_URL=http://localhost:9002
NODE_ENV=development
```

**⚠️ IMPORTANT:**
- NEVER commit `.env.local` to Git
- Add to `.gitignore`
- Use `.env.example` for team

#### `next.config.ts`
```typescript
import type {NextConfig} from 'next';
import withSerwistInit from '@serwist/next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // Fix before production
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
};

// PWA Configuration
const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development'
});

export default withSerwist(nextConfig);
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2.2. Firebase Configuration Files

#### `firebase.json`
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "database": {
    "rules": "database.rules.json"
  },
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

#### `firestore.rules` (Example)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function emailVerified() {
      return isAuthenticated() && request.auth.token.email_verified == true;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Places
    match /places/{placeId} {
      allow read: if true;
      allow create: if emailVerified();
      allow update: if isOwner(resource.data.createdBy);
    }

    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(userId);
    }
  }
}
```

#### `firestore.indexes.json`
```json
{
  "indexes": [
    {
      "collectionGroup": "places",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "region", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "moderation_queue",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" },
        { "fieldPath": "submittedAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 3. Hướng Dẫn Cài Đặt

### 3.1. Prerequisites

**Yêu cầu hệ thống:**
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version
- **Firebase CLI**: >= 13.0.0

**Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

### 3.2. Clone Repository

```bash
git clone https://github.com/your-username/Du-Lich-Viet.git
cd Du-Lich-Viet
```

### 3.3. Install Dependencies

```bash
npm install
```

**Expected time:** 2-3 minutes

### 3.4. Firebase Setup

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: "Du Lịch Việt" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Step 2: Enable Firebase Services

**Firestore Database:**
1. Go to Firestore Database
2. Click "Create database"
3. Select location (asia-southeast1)
4. Start in **production mode** (we have custom rules)

**Authentication:**
1. Go to Authentication
2. Enable Email/Password
3. Enable Google OAuth (optional)

**Storage:**
1. Go to Storage
2. Click "Get started"
3. Use default security rules (we'll deploy custom rules later)

**Realtime Database:**
1. Go to Realtime Database
2. Click "Create Database"
3. Select location (same as Firestore)
4. Start in locked mode

#### Step 3: Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click "Add app" → Web (</> icon)
4. Register app name: "Du Lịch Việt Web"
5. Copy the `firebaseConfig` object

#### Step 4: Get Service Account Key

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save as `service-account-key.json`
4. **DO NOT commit this file!**

### 3.5. Configure Environment Variables

Create `.env.local` file in root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your Firebase config:

```bash
# From firebaseConfig object
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# From service-account-key.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Google AI (get from https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=your_google_ai_api_key
GOOGLE_GENAI_API_KEY=your_genai_key

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:9002
NODE_ENV=development
```

**⚠️ Important Notes:**
- `FIREBASE_PRIVATE_KEY` must have escaped `\n` newlines
- Wrap entire key in double quotes
- No trailing spaces

### 3.6. Deploy Firebase Rules & Indexes

```bash
# Login to Firebase
firebase login

# Select your project
firebase use your-project-id

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage

# Deploy Realtime Database rules
firebase deploy --only database
```

**Expected output:**
```
✔  Deploy complete!
```

### 3.7. Seed Initial Data (Optional)

```bash
# Create admin user
node scripts/create-admin-user.js

# Seed sample places
node scripts/seed-places-vietnam.js

# Create test moderation queue
node scripts/create-real-moderation-queue.js
```

### 3.8. Start Development Server

```bash
npm run dev
```

**Access app:**
- Frontend: http://localhost:9002
- Genkit Dev UI: http://localhost:4000 (if running `npm run genkit:dev`)

---

## 4. Configuration Files

### 4.1. TailwindCSS Config

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          600: '#15803D',
          700: '#14532D'
        },
        secondary: {
          DEFAULT: '#0EA5E9',
          500: '#0EA5E9'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
};

export default config;
```

### 4.2. PWA Manifest

```json
// public/manifest.json
{
  "name": "Du Lịch Việt - Khám phá Việt Nam với AI",
  "short_name": "Du Lịch Việt",
  "description": "Nền tảng chia sẻ và khám phá địa điểm du lịch Việt Nam",
  "theme_color": "#16A34A",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "start_url": "/?source=pwa",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 5. Scripts Hữu Ích

### 5.1. Development Scripts

```json
{
  "scripts": {
    "dev": "node scripts/start-dev.js",
    "dev:9002": "next dev --port 9002",
    "dev:3000": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

### 5.2. Utility Scripts

**`scripts/create-admin-user.js`**
```javascript
// Create first admin user
const adminUser = {
  email: 'admin@dulichviet.tech',
  password: 'your_secure_password',
  displayName: 'Admin',
  role: 'admin'
};

// Run: node scripts/create-admin-user.js
```

**`scripts/seed-places-vietnam.js`**
```javascript
// Seed 50+ real places in Vietnam
// Includes: Vịnh Hạ Long, Phố cổ Hội An, Đà Lạt, etc.

// Run: node scripts/seed-places-vietnam.js
```

---

## 6. Development Workflow

### 6.1. Daily Development

```bash
# 1. Pull latest changes
git pull origin develop2

# 2. Install new dependencies (if any)
npm install

# 3. Start dev server
npm run dev

# 4. Make changes

# 5. Type check
npm run typecheck

# 6. Lint
npm run lint:fix

# 7. Commit
git add .
git commit -m "feat: your feature description"

# 8. Push
git push origin your-branch
```

### 6.2. Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Develop feature

# 3. Test locally

# 4. Create PR
gh pr create --title "Your feature" --body "Description"
```

---

## 7. Deployment Guide

### 7.1. Vercel Deployment (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login**
```bash
vercel login
```

**Step 3: Link Project**
```bash
vercel link
```

**Step 4: Set Environment Variables**
```bash
# Copy .env.local variables to Vercel
vercel env pull .env.production.local

# Or set via Vercel Dashboard:
# https://vercel.com/your-project/settings/environment-variables
```

**Step 5: Deploy**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 7.2. Firebase Hosting

```bash
# 1. Build production
npm run build

# 2. Export static site
npm run export

# 3. Deploy to Firebase
firebase deploy --only hosting
```

---

## 8. Troubleshooting

### 8.1. Common Issues

#### Issue 1: Firebase Admin SDK Error

**Error:**
```
Error: Firebase Admin SDK not initialized
```

**Solution:**
```bash
# Check .env.local has correct values
cat .env.local | grep FIREBASE

# Verify FIREBASE_PRIVATE_KEY has escaped newlines
# Should look like: "-----BEGIN PRIVATE KEY-----\n...\n-----END"
```

#### Issue 2: Build Errors

**Error:**
```
Type error: Property 'X' does not exist on type 'Y'
```

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### Issue 3: Port Already in Use

**Error:**
```
Port 9002 is already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :9002

# Kill process
kill -9 <PID>

# Or use different port
npm run dev:3000
```

---

## Kết Luận

Tài liệu này cung cấp hướng dẫn chi tiết về cấu trúc thư mục và setup cho dự án **Du Lịch Việt**. Với cấu trúc rõ ràng và hướng dẫn từng bước, developer mới có thể nhanh chóng onboard và bắt đầu phát triển.

**Tài liệu liên quan:**
- [1. Tổng Quan Dự Án](./1_Tong_Quan_Du_Lich_Viet.md)
- [2. Kiến Trúc Hệ Thống](./2_Kien_Truc_He_Thong_&_Cong_Nghe.md)
- [3. Tính Năng Quan Trọng](./3_Tinh_Nang_Quan_Trong.md)
- [5. API, Database, Security & Performance](./5_API_Database_Security_Performance.md)

---

*© 2025 Du Lịch Việt. All rights reserved.*

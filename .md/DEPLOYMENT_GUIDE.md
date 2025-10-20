# Du Lịch Việt AI - Deployment Guide

## 🔴 Critical Pre-Deployment Tasks

### 1. Security - Environment Variables

**⚠️ URGENT: `.env` file contains production secrets and is currently committed to Git**

**Immediate Actions Required:**

```bash
# 1. Remove .env files from Git tracking (already in .gitignore)
git rm --cached .env
git rm --cached .env.local
git rm --cached .env.production

# 2. Commit the removal
git commit -m "security: Remove environment files from Git tracking"

# 3. (CRITICAL) Rotate all exposed credentials:
#    - Firebase Admin SDK Private Key
#    - Firebase API Keys
#    - Gemini API Keys
#    Because these were committed to Git, they are now in Git history
#    and should be considered compromised.
```

**How to Rotate Credentials:**

1. **Firebase Admin SDK:**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Delete the old service account key
   - Update environment variables with new credentials

2. **Firebase API Keys:**
   - Go to Firebase Console > Project Settings > General
   - Under "Web API Key", click "Regenerate"
   - Update `NEXT_PUBLIC_FIREBASE_API_KEY` in production

3. **Gemini API Keys:**
   - Go to https://aistudio.google.com/app/apikey
   - Revoke old keys, generate new ones
   - Update `GEMINI_API_KEY` and `GOOGLE_AI_API_KEY`

---

## 📋 Pre-Deployment Checklist

### Build & Type Safety Issues

**Build Status:** ✅ **Passes** (with warnings)

**TypeScript Errors:** ⚠️ **110+ type errors** (build succeeds because `ignoreBuildErrors: true`)

**Key Issues:**
- Missing type definitions for some libraries
- `any` types used in 27+ locations
- Incorrect property access on `unknown` types
- Type mismatches in API routes

**Action Items:**
- [ ] Fix critical type errors in production code paths
- [ ] Enable `ignoreBuildErrors: false` in `next.config.ts` before final deployment
- [ ] Enable `eslint.ignoreDuringBuilds: false`

---

## 🚀 Deployment Steps

### Option 1: Vercel Deployment (Recommended)

**Why Vercel:**
- Built for Next.js apps
- Automatic deployments from Git
- Edge network CDN
- Easy environment variable management

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # First deployment (interactive setup)
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard:**
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`
   - Mark server-side secrets as "Sensitive" (encrypted)

5. **Configure Domain:**
   - Add custom domain in Vercel dashboard
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to production URL

---

### Option 2: Firebase Hosting + Cloud Functions

**Steps:**

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase Hosting:**
   ```bash
   firebase init hosting
   # Select: Use build output from Next.js
   # Public directory: out
   # Configure as single-page app: No
   # Set up automatic builds: Yes
   ```

3. **Build for Static Export:**
   Update `next.config.ts`:
   ```typescript
   output: 'export' // Change from 'standalone'
   ```

4. **Deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🔧 Firebase Configuration

### 1. Deploy Firestore Rules & Indexes

**Current Status:**
- ✅ Firestore rules defined in `firestore.rules`
- ✅ Composite indexes defined in `firestore.indexes.json`
- ✅ Storage rules defined in `storage.rules`
- ✅ Realtime Database rules defined in `database.rules.json`

**Deploy Commands:**

```bash
# Deploy all Firebase rules
firebase deploy --only firestore:rules,firestore:indexes,storage:rules,database:rules

# Or deploy individually
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage:rules
firebase deploy --only database:rules
```

**Verification:**
```bash
# Check deployment status
firebase deploy --only firestore:indexes --dry-run

# View current rules in Firebase Console
open https://console.firebase.google.com/project/vietexplore-ai/firestore/rules
```

---

### 2. Configure Firebase Authentication

**Required Auth Methods:**
- [x] Email/Password
- [x] Google OAuth
- [ ] Facebook (optional)
- [ ] Apple (optional)

**Setup OAuth for Production:**

1. **Google OAuth:**
   - Add production domain to authorized domains in Firebase Console
   - Update OAuth consent screen in Google Cloud Console
   - Add production redirect URL: `https://your-domain.com/__/auth/handler`

2. **Email Verification:**
   - Configure email templates in Firebase Console > Authentication > Templates
   - Set sender email and customize templates

---

### 3. Firestore Security Checklist

**Review before deployment:**

- [ ] Verify role-based access control works correctly
- [ ] Test that unauthenticated users cannot access private data
- [ ] Confirm moderators/admins have proper elevated permissions
- [ ] Test that users cannot escalate their own roles
- [ ] Verify rate limiting is in place for user-generated actions

**Test Security Rules Locally:**
```bash
# Install Firebase Emulator Suite
firebase emulators:start --only firestore,storage,database

# Run security rules tests (if you have test files)
npm run test:firestore-rules
```

---

## 📊 Performance & Monitoring

### 1. Enable Analytics

**Google Analytics 4:**
- Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to environment variables
- Already integrated in `src/app/layout.tsx`

### 2. Error Monitoring

**Recommended: Sentry Integration**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Update `next.config.ts`:
```typescript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  { silent: true },
  { hideSourceMaps: true }
);
```

---

## 🔐 Production Environment Variables

**Critical Variables to Set:**

```bash
# Application URLs (UPDATE THESE!)
NEXTAUTH_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
SITE_URL=https://your-production-domain.com

# Firebase Client (Public - Safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vietexplore-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://vietexplore-ai-default-rtdb...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vietexplore-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vietexplore-ai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=366287046860
NEXT_PUBLIC_FIREBASE_APP_ID=1:366287046860:web:1ab1d22c3be92ba2fd9a69

# Firebase Admin (Server-side - KEEP SECRET)
FIREBASE_PROJECT_ID=vietexplore-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@vietexplore-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Services (KEEP SECRET)
GEMINI_API_KEY=AIzaSyC3v...
GOOGLE_AI_API_KEY=AIzaSyC3v...

# Cron Job Authentication (Generate new for production)
CRON_SECRET=$(openssl rand -base64 32)
```

---

## 🧪 Pre-Deployment Testing

### 1. Local Production Build Test

```bash
# Build production bundle
npm run build

# Start production server
npm run start

# Test on http://localhost:3000
# Verify:
# - All pages load correctly
# - Authentication works
# - API routes respond
# - Images load from Firebase Storage
# - Firestore queries work
```

### 2. Test Critical User Flows

- [ ] User registration and email verification
- [ ] Login (email + Google OAuth)
- [ ] Create new place draft
- [ ] Submit place for moderation
- [ ] Moderator approve/reject workflow
- [ ] Place view count increments correctly
- [ ] Review submission and display
- [ ] Report place/review functionality
- [ ] Itinerary builder
- [ ] AI chat assistant

---

## 🔄 Cron Jobs Setup

**Required Cron Jobs:**

1. **Cleanup Expired Claims** (every 30 min)
   ```
   */30 * * * * curl -X POST https://your-domain.com/api/cron/cleanup-expired-claims \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

2. **Archive Moderation Queue** (daily at 2 AM)
   ```
   0 2 * * * curl -X POST https://your-domain.com/api/cron/archive-moderation-queue \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

3. **Publish Scheduled Announcements** (every 15 min)
   ```
   */15 * * * * curl -X POST https://your-domain.com/api/cron/publish-scheduled-announcements \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

4. **Moderation Health Check** (every hour)
   ```
   0 * * * * curl -X POST https://your-domain.com/api/cron/moderation-health-check \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

**Setup in Vercel:**
- Use Vercel Cron Jobs feature (in `vercel.json`)
- Or use external service like cron-job.org or EasyCron

**Example `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-claims",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/archive-moderation-queue",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## 📱 PWA & Mobile Optimization

**Current Status:**
- ✅ Mobile-responsive design (Tailwind CSS)
- ⚠️ No PWA manifest yet

**Optional: Add PWA Support**

```bash
npm install next-pwa
```

Update `next.config.ts`:
```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);
```

---

## 🐛 Known Issues & Warnings

### Build Warnings

1. **Import Error - FieldValue:**
   ```
   'FieldValue' is not exported from '@/lib/firebase-admin'
   ```
   **Location:** `src/app/api/admin/review-reports/[reportId]/remove-review/route.ts`
   **Fix:** Add `FieldValue` export to firebase-admin wrapper

2. **Edge Runtime Static Generation:**
   ```
   Using edge runtime on a page currently disables static generation
   ```
   **Impact:** Some pages won't be pre-rendered
   **Action:** Review which pages use Edge runtime and if necessary

### Type Errors (110+ total)

**High Priority:**
- API route type mismatches
- Missing types for admin hooks
- `unknown` type usage in data fetching

**Low Priority:**
- Test file type errors (won't affect production)
- Deprecated API usage warnings

---

## 📊 Post-Deployment Monitoring

### 1. Check Application Health

```bash
# Test health endpoint
curl https://your-domain.com/api/admin/system/health

# Check Firestore connection
curl https://your-domain.com/api/places?limit=1

# Verify auth works
curl https://your-domain.com/api/auth/me
```

### 2. Monitor Logs

**Vercel:**
- View logs in Vercel Dashboard > Deployments > [your-deployment] > Logs

**Firebase:**
```bash
firebase functions:log
```

### 3. Set Up Alerts

**Firebase Console:**
- Enable quota alerts for Firestore, Storage, Realtime DB
- Set up Cloud Monitoring alerts for errors

---

## 🔒 Security Best Practices

- [x] Environment variables not committed to Git
- [x] Firestore security rules enforce authentication
- [x] Storage rules prevent unauthorized uploads
- [x] Rate limiting implemented for reports (3/week)
- [ ] Add CORS configuration for API routes
- [ ] Implement request rate limiting (IP-based)
- [ ] Add CSRF protection for forms
- [ ] Enable HTTPS-only (automatic on Vercel)
- [ ] Set security headers (CSP, HSTS, etc.)

**Recommended Security Headers:**

Add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ];
}
```

---

## 📝 Final Deployment Checklist

**Before Going Live:**

- [ ] All critical type errors fixed
- [ ] Environment variables set in production
- [ ] Firebase credentials rotated (due to Git exposure)
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Database rules deployed
- [ ] Firestore indexes deployed
- [ ] Production URLs updated in `.env`
- [ ] OAuth redirect URLs configured
- [ ] Cron jobs scheduled
- [ ] Analytics configured
- [ ] Error monitoring set up
- [ ] Security headers configured
- [ ] Test all critical user flows in production
- [ ] Set up backup/recovery plan
- [ ] Document rollback procedure

**Post-Deployment:**

- [ ] Verify sitemap generated at `/sitemap.xml`
- [ ] Check robots.txt at `/robots.txt`
- [ ] Test Google Search Console integration
- [ ] Monitor error logs for first 24 hours
- [ ] Check performance with Lighthouse
- [ ] Verify all Firebase quotas
- [ ] Test email verification works
- [ ] Confirm notifications send correctly

---

## 🆘 Troubleshooting

### Common Issues

**1. "Firebase Admin SDK not initialized"**
```bash
# Check environment variables are set
vercel env ls

# Verify FIREBASE_PRIVATE_KEY has correct newlines
# Should be: "-----BEGIN PRIVATE KEY-----\nACTUAL_KEY\n-----END PRIVATE KEY-----\n"
```

**2. "The query requires an index"**
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Or use the auto-generated link in the error message
```

**3. "CORS error on API routes"**
```typescript
// Add to API routes that need CORS
export async function OPTIONS(request: Request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

---

## 📞 Support & Resources

- **Firebase Console:** https://console.firebase.google.com/project/vietexplore-ai
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Next.js Docs:** https://nextjs.org/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Project Issues:** (Add your GitHub issues URL)

---

**Good luck with your deployment! 🚀**

# 🔐 Production Environment Variables Setup Guide

**Date:** 2025-10-05
**Project:** VietExplore AI
**Status:** ✅ Firebase Rules Deployed | ⚠️ Credentials Need Rotation

---

## 🔴 CRITICAL SECURITY NOTICE

**Your Firebase credentials were exposed in Git history!**
All credentials listed below **MUST BE ROTATED** before production deployment.

**Already Completed:**
- ✅ Removed `.env` files from Git tracking
- ✅ Updated `.gitignore` to prevent future commits
- ✅ Deployed all Firebase rules to production

**TODO Before Production:**
- [ ] Rotate Firebase Admin SDK credentials
- [ ] Rotate Firebase API keys
- [ ] Rotate Gemini API keys
- [ ] Set up environment variables in Vercel/hosting platform
- [ ] Update production URLs

---

## 📋 Environment Variables Checklist

### For Vercel Deployment

**Navigate to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Configure for:** Production, Preview, Development (check all that apply)

---

## 🔑 Variables to Set

### 1. Firebase Client-Side (Public - Safe to Expose)

These are safe to be public as they're used in the browser:

```bash
# Firebase Public Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... # ⚠️ ROTATE THIS
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vietexplore-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vietexplore-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vietexplore-ai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=366287046860
NEXT_PUBLIC_FIREBASE_APP_ID=1:366287046860:web:1ab1d22c3be92ba2fd9a69
```

**How to Get/Rotate:**
1. Go to [Firebase Console](https://console.firebase.google.com/project/vietexplore-ai)
2. Project Settings → General → Your apps → Web app
3. Copy configuration values
4. To rotate API key: Project Settings → General → Web API Key → Regenerate

---

### 2. Firebase Admin SDK (Server-Side - KEEP SECRET)

⚠️ **MARK AS SENSITIVE** in Vercel dashboard!

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=vietexplore-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@vietexplore-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_NEW_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**How to Rotate (REQUIRED):**

1. **Generate New Service Account Key:**
   ```
   1. Go to Firebase Console → Project Settings
   2. Click "Service Accounts" tab
   3. Click "Generate New Private Key"
   4. Save the downloaded JSON file securely
   ```

2. **Delete Old Key:**
   ```
   1. In Firebase Console → IAM & Admin → Service Accounts
   2. Find: firebase-adminsdk-fbsvc@vietexplore-ai.iam.gserviceaccount.com
   3. Click ⋮ → Manage Keys
   4. Delete the old key (created before Git exposure)
   ```

3. **Extract Values from JSON:**
   ```json
   {
     "project_id": "vietexplore-ai",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-...@vietexplore-ai.iam.gserviceaccount.com"
   }
   ```

4. **Set in Vercel:**
   - `FIREBASE_PROJECT_ID` = `project_id`
   - `FIREBASE_CLIENT_EMAIL` = `client_email`
   - `FIREBASE_PRIVATE_KEY` = `private_key` (keep the `\n` characters!)

**⚠️ Important:** When setting `FIREBASE_PRIVATE_KEY` in Vercel:
- Keep it as a single line with `\n` for newlines
- Wrap in double quotes
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

---

### 3. AI Services (Server-Side - KEEP SECRET)

⚠️ **MARK AS SENSITIVE** in Vercel dashboard!

```bash
# Gemini AI API
GEMINI_API_KEY=AIzaSyC... # ⚠️ ROTATE THIS
GOOGLE_AI_API_KEY=AIzaSyC... # ⚠️ ROTATE THIS (same as GEMINI_API_KEY)
```

**How to Rotate (REQUIRED):**

1. **Revoke Old Keys:**
   ```
   1. Go to https://aistudio.google.com/app/apikey
   2. Find existing keys
   3. Click ⋮ → Delete for each exposed key
   ```

2. **Generate New Keys:**
   ```
   1. Click "Create API Key"
   2. Select "Create API key in new project" or use existing
   3. Copy the generated key
   4. Use the SAME key for both GEMINI_API_KEY and GOOGLE_AI_API_KEY
   ```

---

### 4. Application URLs (Required Update)

**Current (Local):**
```bash
NEXTAUTH_URL=http://localhost:9002
NEXT_PUBLIC_APP_URL=http://localhost:9002
SITE_URL=https://viet-explore-ai.vercel.app
```

**Production (Update to your domain):**
```bash
# Option 1: Vercel default domain
NEXTAUTH_URL=https://vietexplore-ai.vercel.app
NEXT_PUBLIC_APP_URL=https://vietexplore-ai.vercel.app
SITE_URL=https://vietexplore-ai.vercel.app

# Option 2: Custom domain (if configured)
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
SITE_URL=https://yourdomain.com
```

---

### 5. Cron Job Authentication (Generate New)

⚠️ **MARK AS SENSITIVE** in Vercel dashboard!

```bash
# Generate a secure random token:
CRON_SECRET=<generate-new-secret>
```

**How to Generate:**

**Option A - OpenSSL (Windows/Mac/Linux):**
```bash
openssl rand -base64 32
```

**Option B - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option C - Online Generator:**
- Visit: https://generate-secret.now.sh/32
- Copy the generated token

---

## 📝 Complete Environment Variables List

Copy this checklist and fill in the values:

```bash
# ============================================
# FIREBASE CLIENT-SIDE (PUBLIC)
# ============================================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vietexplore-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vietexplore-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vietexplore-ai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=366287046860
NEXT_PUBLIC_FIREBASE_APP_ID=1:366287046860:web:1ab1d22c3be92ba2fd9a69

# ============================================
# FIREBASE ADMIN SDK (SECRET)
# ============================================
FIREBASE_PROJECT_ID=vietexplore-ai
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# ============================================
# AI SERVICES (SECRET)
# ============================================
GEMINI_API_KEY=
GOOGLE_AI_API_KEY=

# ============================================
# APPLICATION URLS
# ============================================
NEXTAUTH_URL=
NEXT_PUBLIC_APP_URL=
SITE_URL=

# ============================================
# CRON JOB AUTH (SECRET)
# ============================================
CRON_SECRET=
```

---

## 🚀 Vercel Deployment Steps

### 1. Connect Repository

```bash
# Option A: Using Vercel CLI
npm install -g vercel
vercel login
vercel

# Option B: Using Vercel Dashboard
# 1. Go to https://vercel.com/new
# 2. Import your Git repository
# 3. Framework Preset: Next.js (auto-detected)
```

### 2. Configure Build Settings

Vercel will auto-detect Next.js configuration. Verify:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next (auto-detected)
Install Command: npm install
```

### 3. Set Environment Variables

**In Vercel Dashboard:**

1. Go to: Project Settings → Environment Variables
2. Add each variable from the checklist above
3. For each variable, select environments:
   - **Production** ✓ (required)
   - **Preview** ✓ (recommended)
   - **Development** ✓ (optional)

**For Sensitive Variables (mark as such):**
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `GEMINI_API_KEY`
- `GOOGLE_AI_API_KEY`
- `CRON_SECRET`

### 4. Deploy

**First Deployment:**
```bash
# Using CLI
vercel --prod

# Or trigger via Git push (if connected to GitHub)
git push origin main
```

**Subsequent Deployments:**
- Automatic on push to `main` branch
- Or manual via Vercel dashboard

---

## 🔧 Firebase Configuration Updates

### 1. Update OAuth Redirect URLs

**For Google OAuth to work in production:**

1. Go to [Firebase Console](https://console.firebase.google.com/project/vietexplore-ai/authentication/providers)
2. Click "Google" provider
3. Add production domain to "Authorized domains":
   ```
   yourdomain.com (or vietexplore-ai.vercel.app)
   ```

4. Also update in [Google Cloud Console](https://console.cloud.google.com/):
   - APIs & Services → Credentials
   - OAuth 2.0 Client IDs → Web client
   - Add to "Authorized JavaScript origins":
     ```
     https://yourdomain.com
     ```
   - Add to "Authorized redirect URIs":
     ```
     https://yourdomain.com/__/auth/handler
     ```

### 2. Configure Email Templates

**For email verification to work:**

1. Go to Firebase Console → Authentication → Templates
2. Customize email verification template
3. Set action URL to: `https://yourdomain.com/auth/verify-email`
4. Update sender name and email

---

## ✅ Post-Deployment Verification

### 1. Test Environment Variables

**Create test endpoint:**
```typescript
// src/app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    hasFirebaseConfig: !!process.env.FIREBASE_PROJECT_ID,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    // Don't return actual secrets!
  });
}
```

**Test:**
```bash
curl https://yourdomain.com/api/test-env
```

### 2. Test Firebase Connection

**Test Firestore:**
```bash
# Should return places list
curl https://yourdomain.com/api/places?limit=1
```

**Test Storage:**
- Upload an image via UI
- Verify it appears in Firebase Storage console

**Test Realtime Database:**
- View a place
- Check if view count increments

### 3. Test Authentication

- [ ] Email registration works
- [ ] Email verification email sent
- [ ] Email verification link works
- [ ] Google OAuth login works
- [ ] Login redirects to correct URL

### 4. Test Critical Paths

- [ ] Create place draft
- [ ] Submit for moderation
- [ ] Moderator can claim and review
- [ ] Notifications appear
- [ ] Image uploads work

---

## 🐛 Troubleshooting

### Error: "Firebase Admin SDK not initialized"

**Cause:** Missing or incorrect environment variables

**Fix:**
```bash
# Check Vercel logs
vercel logs <deployment-url>

# Verify environment variables are set
vercel env ls

# Re-deploy to pick up new env vars
vercel --prod --force
```

### Error: "Invalid Firebase credentials"

**Cause:** `FIREBASE_PRIVATE_KEY` not formatted correctly

**Fix:**
- Ensure the private key has `\n` characters (not actual newlines)
- Wrap in double quotes
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

### Error: "Google OAuth not working"

**Cause:** Authorized domains not configured

**Fix:**
1. Add domain to Firebase Authentication → Settings → Authorized domains
2. Add redirect URIs to Google Cloud Console OAuth client

### Error: "Sitemap not generated"

**Cause:** `SITE_URL` environment variable not set

**Fix:**
```bash
vercel env add SITE_URL production
# Enter: https://yourdomain.com
vercel --prod --force
```

---

## 📊 Monitoring & Logging

### 1. Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Filter by function
vercel logs --filter="api/places"

# View specific deployment
vercel logs <deployment-url>
```

### 2. Firebase Console Monitoring

**Check:**
- Firestore Usage: Console → Firestore → Usage
- Storage Usage: Console → Storage → Usage
- Authentication: Console → Authentication → Users
- Realtime Database: Console → Realtime Database → Data

### 3. Set Up Alerts

**Firebase Quotas:**
- Firestore: 50,000 reads/day (free tier)
- Storage: 1 GB (free tier)
- Realtime Database: 1 GB (free tier)

**Enable Alerts:**
1. Firebase Console → Project Settings → Usage and billing
2. Set up budget alerts
3. Configure email notifications

---

## 🔐 Security Checklist

Before going live:

- [ ] All credentials rotated after Git exposure
- [ ] Old Firebase service account keys deleted
- [ ] Old Gemini API keys revoked
- [ ] Environment variables marked as sensitive in Vercel
- [ ] OAuth redirect URLs configured for production domain
- [ ] Firebase security rules deployed
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CSP headers configured (optional, see `next.config.ts`)
- [ ] CRON_SECRET generated and set
- [ ] No sensitive data in Git history (check with `git log`)

---

## 📞 Support Resources

**Firebase:**
- Console: https://console.firebase.google.com/project/vietexplore-ai
- Documentation: https://firebase.google.com/docs
- Support: https://firebase.google.com/support

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

**Google AI:**
- API Keys: https://aistudio.google.com/app/apikey
- Documentation: https://ai.google.dev/docs

---

## ✅ Final Checklist

Print and check off before deploying:

### Credentials Rotation
- [ ] New Firebase Admin SDK key generated
- [ ] Old Firebase Admin SDK key deleted
- [ ] New Firebase Web API key generated (if rotated)
- [ ] New Gemini API keys generated
- [ ] Old Gemini API keys revoked
- [ ] New CRON_SECRET generated

### Environment Setup
- [ ] All variables set in Vercel
- [ ] Sensitive variables marked as such
- [ ] Production URLs configured
- [ ] OAuth redirect URLs updated

### Firebase Configuration
- [ ] Firestore rules deployed ✅ (Already done)
- [ ] Firestore indexes deployed ✅ (Already done)
- [ ] Storage rules deployed ✅ (Already done)
- [ ] Realtime Database rules deployed ✅ (Already done)
- [ ] Authorized domains configured
- [ ] Email templates customized

### Testing
- [ ] Build succeeds locally
- [ ] Preview deployment works
- [ ] Production deployment successful
- [ ] Authentication tested
- [ ] Critical user flows tested
- [ ] Firebase connections verified

---

**Ready to Deploy!** 🚀

Once all items are checked, you're ready for production deployment.

**Estimated Time to Complete:** 45-60 minutes
**Priority:** 🔴 HIGH - Security issue must be resolved before going live

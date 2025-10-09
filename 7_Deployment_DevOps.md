# Deployment & DevOps - Du Lịch Việt

> **Phiên bản:** 3.0.0
> **Ngày cập nhật:** Tháng 10, 2025

---

## Mục Lục

1. [Deployment Strategy](#1-deployment-strategy)
2. [Environment Configuration](#2-environment-configuration)
3. [Vercel Deployment](#3-vercel-deployment)
4. [Firebase Deployment](#4-firebase-deployment)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Domain & DNS Setup](#6-domain--dns-setup)
7. [Monitoring & Alerts](#7-monitoring--alerts)
8. [Backup Strategy](#8-backup-strategy)
9. [Scaling Strategy](#9-scaling-strategy)
10. [Disaster Recovery](#10-disaster-recovery)

---

## 1. Deployment Strategy

### 1.1. Deployment Architecture

```
┌────────────────────────────────────────────────────┐
│                    PRODUCTION                       │
│                                                     │
│  ┌──────────────┐        ┌──────────────┐         │
│  │   Vercel     │        │   Firebase   │         │
│  │   (Frontend) │◄──────►│   (Backend)  │         │
│  │              │        │              │         │
│  │ • Next.js    │        │ • Firestore  │         │
│  │ • SSR        │        │ • Auth       │         │
│  │ • API Routes │        │ • Storage    │         │
│  │ • Edge Cache │        │ • Functions  │         │
│  └──────┬───────┘        └──────┬───────┘         │
│         │                       │                  │
│         └───────────┬───────────┘                  │
│                     │                              │
│              ┌──────▼──────┐                       │
│              │   CDN       │                       │
│              │ (Cloudflare)│                       │
│              └─────────────┘                       │
└────────────────────────────────────────────────────┘
```

### 1.2. Deployment Environments

#### Development
- **URL**: http://localhost:9002
- **Purpose**: Local development
- **Database**: Firebase Dev Project
- **Deployment**: Manual

#### Staging (Optional)
- **URL**: https://staging.dulichviet.tech
- **Purpose**: Pre-production testing
- **Database**: Firebase Staging Project
- **Deployment**: Auto from `develop2` branch

#### Production
- **URL**: https://www.dulichviet.tech
- **Purpose**: Live site for users
- **Database**: Firebase Production Project
- **Deployment**: Auto from `main` branch

### 1.3. Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing (unit + integration + E2E)
- [ ] TypeScript type check passed
- [ ] ESLint warnings resolved
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Firebase rules deployed
- [ ] Firestore indexes created

**Post-Deployment:**
- [ ] Verify homepage loads
- [ ] Test critical user flows
- [ ] Check API endpoints
- [ ] Monitor error rates
- [ ] Verify analytics tracking
- [ ] Test PWA install
- [ ] Check SSL certificate

---

## 2. Environment Configuration

### 2.1. Environment Variables

**Development (`.env.local`):**
```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=dev_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dev-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dev-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dev-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://dev-project.firebaseio.com

# Firebase Admin SDK
FIREBASE_PROJECT_ID=dev-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@dev-project.iam.gserviceaccount.com

# Google AI
GOOGLE_API_KEY=dev_google_api_key
GOOGLE_GENAI_API_KEY=dev_genai_key

# App Config
NEXT_PUBLIC_BASE_URL=http://localhost:9002
NODE_ENV=development
```

**Production (Vercel Environment Variables):**
```bash
# Set via Vercel Dashboard or CLI
NEXT_PUBLIC_FIREBASE_API_KEY=prod_api_key
FIREBASE_PROJECT_ID=prod-project
# ... all other vars with production values
```

### 2.2. Firebase Projects

**Create Separate Projects:**
```bash
# Development
firebase projects:create du-lich-viet-dev

# Production
firebase projects:create du-lich-viet-prod

# List projects
firebase projects:list

# Switch between projects
firebase use du-lich-viet-dev  # For development
firebase use du-lich-viet-prod # For production
```

---

## 3. Vercel Deployment

### 3.1. Initial Setup

**Install Vercel CLI:**
```bash
npm install -g vercel
```

**Login:**
```bash
vercel login
```

**Link Project:**
```bash
cd /path/to/Du-Lich-Viet
vercel link
```

**Select Settings:**
- Framework Preset: **Next.js**
- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `.next`

### 3.2. Environment Variables Setup

**Via CLI:**
```bash
# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add FIREBASE_PRIVATE_KEY production

# Pull environment variables to local
vercel env pull .env.production.local
```

**Via Dashboard:**
1. Go to https://vercel.com/your-team/du-lich-viet
2. Settings → Environment Variables
3. Add all variables from `.env.local`
4. Select environments: Production, Preview, Development

### 3.3. Deployment Commands

**Preview Deployment:**
```bash
# Deploy to preview URL
vercel

# Output: https://du-lich-viet-xxxx.vercel.app
```

**Production Deployment:**
```bash
# Deploy to production
vercel --prod

# Or merge to main branch (auto-deploy)
git checkout main
git merge develop2
git push origin main
```

**Rollback:**
```bash
# List deployments
vercel ls

# Rollback to previous version
vercel rollback <deployment-url>
```

### 3.4. Vercel Configuration

**`vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

---

## 4. Firebase Deployment

### 4.1. Deploy Firestore Rules

**Command:**
```bash
# Deploy rules only
firebase deploy --only firestore:rules

# Deploy with specific project
firebase deploy --only firestore:rules --project du-lich-viet-prod
```

**Rules File (`firestore.rules`):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Add your security rules here
    // See section 3 of file 5 for details
  }
}
```

### 4.2. Deploy Firestore Indexes

**Command:**
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Check index status
firebase firestore:indexes
```

**Indexes File (`firestore.indexes.json`):**
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
    }
  ]
}
```

### 4.3. Deploy Storage Rules

**Command:**
```bash
firebase deploy --only storage
```

**Rules File (`storage.rules`):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /places/images/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 4.4. Deploy Cloud Functions

**Command:**
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:cleanupExpiredClaims

# View logs
firebase functions:log
```

**Functions Directory:**
```
functions/
├── src/
│   └── index.ts          # Cloud Functions entry point
├── package.json
└── tsconfig.json
```

### 4.5. Deploy Hosting (Optional)

**Command:**
```bash
# Build Next.js app
npm run build

# Export static files
npm run export

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 5. CI/CD Pipeline

### 5.1. GitHub Actions Workflow

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run tests
        run: npm test -- --coverage

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... other env vars

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Deploy Firebase Rules
        run: |
          npm install -g firebase-tools
          firebase deploy --only firestore:rules,storage --token ${{ secrets.FIREBASE_TOKEN }}

      - name: Notify success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Deployment to production succeeded!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Notify failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Deployment to production failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 5.2. Preview Deployments

**`.github/workflows/preview.yml`:**
```yaml
name: Preview Deployment

on:
  pull_request:
    branches: [main, develop2]

jobs:
  preview:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build

      - name: Deploy Preview to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Comment PR with preview URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Preview deployment ready at: ${{ steps.vercel.outputs.preview-url }}'
            })
```

### 5.3. Secrets Management

**Required Secrets (GitHub):**
```
VERCEL_TOKEN              # Vercel authentication token
VERCEL_ORG_ID             # Vercel organization ID
VERCEL_PROJECT_ID         # Vercel project ID
FIREBASE_TOKEN            # Firebase CI token
FIREBASE_API_KEY          # Firebase API key
FIREBASE_PRIVATE_KEY      # Firebase Admin SDK private key
GOOGLE_API_KEY            # Google AI API key
SLACK_WEBHOOK             # Slack notification webhook (optional)
```

**Generate Firebase CI Token:**
```bash
firebase login:ci
# Copy token and add to GitHub secrets
```

---

## 6. Domain & DNS Setup

### 6.1. Domain Configuration

**Purchase Domain:**
- Domain: `dulichviet.tech`
- Registrar: Namecheap / GoDaddy / Google Domains

**DNS Records:**
```
Type    Name    Value                           TTL
A       @       76.76.21.21                     3600
A       www     76.76.21.21                     3600
CNAME   @       cname.vercel-dns.com            3600
CNAME   www     cname.vercel-dns.com            3600
```

### 6.2. Vercel Domain Setup

**Add Domain via CLI:**
```bash
vercel domains add dulichviet.tech
vercel domains add www.dulichviet.tech
```

**Add Domain via Dashboard:**
1. Go to Project Settings → Domains
2. Add domain: `dulichviet.tech`
3. Add www redirect: `www.dulichviet.tech` → `dulichviet.tech`

### 6.3. SSL Certificate

**Automatic SSL (Vercel):**
- Vercel automatically provisions SSL certificates via Let's Encrypt
- No manual configuration needed
- Auto-renewal every 90 days

**Verify SSL:**
```bash
curl -I https://www.dulichviet.tech
# Should return: HTTP/2 200
```

### 6.4. CDN Configuration (Cloudflare)

**Setup Cloudflare:**
1. Add site to Cloudflare
2. Update nameservers at domain registrar
3. Enable proxy (orange cloud icon)
4. Configure caching rules

**Caching Rules:**
```
Cache Everything:
  - Static assets: /images/*, /icons/*, *.css, *.js
  - TTL: 1 month

Bypass Cache:
  - API routes: /api/*
  - Dynamic pages: /places/*, /profile/*
```

---

## 7. Monitoring & Alerts

### 7.1. Vercel Analytics

**Enable:**
1. Go to Project → Analytics
2. Toggle "Enable Analytics"

**Metrics:**
- Page views
- Unique visitors
- Top pages
- Referrers
- Devices (Desktop/Mobile)
- Geographic distribution

### 7.2. Firebase Performance Monitoring

**Install SDK:**
```typescript
// src/lib/firebase.ts
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

**Custom Traces:**
```typescript
import { trace } from 'firebase/performance';

const customTrace = trace(perf, 'load_places');
customTrace.start();

// ... load places logic

customTrace.stop();
```

### 7.3. Error Tracking (Sentry)

**Setup:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Configuration (`sentry.client.config.ts`):**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    return event;
  }
});
```

### 7.4. Uptime Monitoring

**UptimeRobot:**
1. Create monitor: https://www.dulichviet.tech
2. Check interval: 5 minutes
3. Alert contacts: Email, Slack

**Health Check Endpoint:**
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
}
```

### 7.5. Alert Configuration

**Slack Alerts:**
```yaml
# Alert when:
- Error rate > 1%
- Response time > 1s (p95)
- Uptime < 99.9%
- Build failure
- Deployment failure
```

---

## 8. Backup Strategy

### 8.1. Firestore Backup

**Automated Daily Backup (Cloud Scheduler):**
```bash
# Export Firestore to Cloud Storage
gcloud firestore export gs://du-lich-viet-backups/$(date +%Y%m%d)

# Schedule with Cloud Scheduler
gcloud scheduler jobs create http firestore-backup \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/du-lich-viet-prod/databases/(default):exportDocuments" \
  --http-method=POST \
  --message-body='{"outputUriPrefix":"gs://du-lich-viet-backups"}'
```

**Manual Backup:**
```bash
# One-time backup
gcloud firestore export gs://du-lich-viet-backups/manual-$(date +%Y%m%d-%H%M%S)
```

### 8.2. Firebase Storage Backup

**Sync to Google Cloud Storage:**
```bash
# Create backup bucket
gsutil mb -l asia-southeast1 gs://du-lich-viet-storage-backup

# Sync files
gsutil -m rsync -r gs://du-lich-viet-prod.appspot.com gs://du-lich-viet-storage-backup
```

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-storage.sh

DATE=$(date +%Y%m%d)
SOURCE="gs://du-lich-viet-prod.appspot.com"
DEST="gs://du-lich-viet-storage-backup/$DATE"

echo "Starting storage backup to $DEST..."
gsutil -m rsync -r $SOURCE $DEST

echo "Backup completed successfully"
```

### 8.3. Code Backup

**Git Repository:**
- Primary: GitHub (private repo)
- Mirror: GitLab (optional)

**Automated Push:**
```bash
# .git/hooks/post-commit
#!/bin/bash
git push origin main
git push gitlab main  # Mirror to GitLab
```

### 8.4. Backup Retention Policy

```
Daily Backups:
  - Keep for 7 days
  - Auto-delete after retention period

Weekly Backups (Sunday):
  - Keep for 4 weeks

Monthly Backups (1st of month):
  - Keep for 12 months

Yearly Backups (Jan 1):
  - Keep indefinitely
```

---

## 9. Scaling Strategy

### 9.1. Horizontal Scaling

**Vercel Auto-Scaling:**
- Serverless functions scale automatically
- No configuration needed
- Pay-per-use pricing

**Firebase Auto-Scaling:**
- Firestore auto-scales reads/writes
- Cloud Functions scale to demand
- Storage bandwidth scales automatically

### 9.2. Performance Optimization

**CDN Caching:**
```typescript
// next.config.ts
export default {
  headers: async () => [
    {
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ]
    }
  ]
};
```

**Database Optimization:**
```typescript
// Use pagination
const placesRef = collection(db, 'places');
const q = query(
  placesRef,
  where('status', '==', 'published'),
  orderBy('publishedAt', 'desc'),
  limit(20),
  startAfter(lastDoc)  // Cursor-based pagination
);
```

### 9.3. Load Balancing

**Vercel Edge Network:**
- Global CDN with 70+ edge locations
- Automatic routing to nearest edge
- DDoS protection included

**Firebase:**
- Multi-region replication (optional)
- Automatic failover
- Read replicas for heavy read workloads

### 9.4. Capacity Planning

**Estimate at 10,000 MAU:**
```
Vercel:
  - Bandwidth: ~500 GB/month
  - Function invocations: ~1M/month
  - Cost: ~$20/month

Firebase:
  - Firestore reads: ~10M/month
  - Firestore writes: ~500K/month
  - Storage: ~50 GB
  - Cost: ~$50/month

Total: ~$70/month
```

---

## 10. Disaster Recovery

### 10.1. Recovery Plan

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 24 hours

**Recovery Steps:**

1. **Identify Issue**
   - Check monitoring alerts
   - Verify issue in production
   - Assess severity

2. **Rollback (if code issue)**
   ```bash
   vercel rollback <previous-deployment-url>
   ```

3. **Restore Database (if data issue)**
   ```bash
   gcloud firestore import gs://du-lich-viet-backups/20250106
   ```

4. **Restore Storage (if storage issue)**
   ```bash
   gsutil -m rsync -r gs://du-lich-viet-storage-backup/20250106 gs://du-lich-viet-prod.appspot.com
   ```

5. **Verify Recovery**
   - Test critical user flows
   - Check data integrity
   - Monitor error rates

### 10.2. Incident Response Checklist

**Severity Levels:**
- **P0 (Critical)**: Site down, no access
- **P1 (High)**: Major feature broken
- **P2 (Medium)**: Minor feature broken
- **P3 (Low)**: Cosmetic issue

**Response Times:**
- P0: Immediate (< 15 minutes)
- P1: < 1 hour
- P2: < 4 hours
- P3: < 24 hours

### 10.3. Communication Plan

**During Incident:**
1. Update status page
2. Notify team via Slack
3. Post update on social media (if user-facing)
4. Send email to affected users (if needed)

**Post-Incident:**
1. Write incident report
2. Conduct post-mortem
3. Update documentation
4. Implement preventive measures

---

## Kết Luận

Deployment và DevOps cho **Du Lịch Việt** được thiết kế để đảm bảo:

1. ✅ **Reliable Deployments** - CI/CD tự động, zero-downtime
2. ✅ **High Availability** - 99.9% uptime target
3. ✅ **Fast Recovery** - Backup và rollback nhanh chóng
4. ✅ **Scalability** - Auto-scaling theo demand
5. ✅ **Security** - Monitoring và alerts 24/7

**Tài liệu liên quan:**
- [4. Cấu Trúc Thư Mục & Setup](./4_Cau_Truc_Thu_Muc_&_Setup.md)
- [5. API, Database, Security & Performance](./5_API_Database_Security_Performance.md)
- [6. Testing & Quality Assurance](./6_Testing_Quality_Assurance.md)

---

*© 2025 Du Lịch Việt. All rights reserved.*

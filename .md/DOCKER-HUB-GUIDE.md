# 🐳 Hướng Dẫn Đưa Image Lên Docker Hub

Hướng dẫn từng bước để build, test và push image VietExplore-AI lên Docker Hub.

---

## 📋 Yêu Cầu

- ✅ Docker Desktop installed và đang chạy
- ✅ Tài khoản Docker Hub (free hoặc paid)
- ✅ `.env.production` hoặc `.env.local` đã cấu hình đầy đủ

---

## 🎯 BƯỚC 1: Tạo Tài Khoản Docker Hub

### 1.1 Sign Up

Truy cập: https://hub.docker.com/signup

- **Username**: Chọn username dễ nhớ (ví dụ: `manhquydev`)
- **Email**: Email chính của bạn
- **Password**: Mật khẩu mạnh

**Free Tier:**
- ✅ 1 private repository
- ✅ Unlimited public repositories
- ✅ 200 container pulls / 6 hours
- ✅ Unlimited public images

### 1.2 Verify Email

Check inbox và click link verify.

### 1.3 Tạo Access Token (Khuyến nghị)

**Lý do**: Token an toàn hơn password, có thể revoke bất kỳ lúc nào.

**Cách tạo:**
1. Đăng nhập Docker Hub
2. Click avatar (góc phải) → Account Settings
3. Security → New Access Token
4. Điền:
   - **Token description**: `vietexplore-ai-deploy`
   - **Access permissions**: `Read, Write, Delete`
5. Click Generate
6. **COPY TOKEN NGAY** (chỉ hiện 1 lần!)
7. Lưu vào file text hoặc password manager

---

## 🔐 BƯỚC 2: Login Docker CLI

### Windows:

```cmd
docker login
```

Nhập:
```
Username: your-dockerhub-username
Password: [paste ACCESS TOKEN, không phải password]
```

**Output thành công:**
```
Login Succeeded

Logging in with your password grants your terminal complete access to your account.
For better security, log in with a limited-privilege personal access token.
```

### Verify Login:

```cmd
docker info
```

Tìm dòng:
```
Username: your-dockerhub-username
```

---

## 🏗️ BƯỚC 3: Chuẩn Bị Build

### 3.1 Kiểm Tra Environment Files

```cmd
dir .env.production
```

Hoặc:
```cmd
dir .env.local
```

**Phải có ít nhất 1 file!**

### 3.2 Chỉnh Sửa Build Script

**Mở file:**
```cmd
notepad docker-build-args.cmd
```

**Thay đổi dòng 11:**
```cmd
REM Từ:
set DOCKER_USERNAME=your-dockerhub-username

REM Thành (ví dụ):
set DOCKER_USERNAME=manhquydev
```

**Lưu file (Ctrl+S).**

### 3.3 Chỉnh Sửa Push Script

**Mở file:**
```cmd
notepad docker-push.cmd
```

**Thay đổi dòng 7 GIỐNG như build script:**
```cmd
set DOCKER_USERNAME=manhquydev
```

**Lưu file.**

---

## 🔨 BƯỚC 4: Build Image

### 4.1 Run Build Script

**Windows Command Prompt:**
```cmd
cd C:\Users\manhq\Downloads\DuLichViet\VietExplore-AI

docker-build-args.cmd
```

**Git Bash (alternative):**
```bash
bash docker-build-args.sh
```

### 4.2 Theo Dõi Build Process

**Expected output:**
```
================================================
Docker Build for VietExplore-AI (Windows)
================================================
Loading .env.production...

Building image with tags:
  - manhquydev/vietexplore-ai:latest
  - manhquydev/vietexplore-ai:3.0.0
  - manhquydev/vietexplore-ai:production

Building...
[+] Building 120.5s (18/18) FINISHED
 => [internal] load build definition
 => [internal] load .dockerignore
 => [internal] load metadata
 => [deps 1/5] FROM node:20-alpine
 => [deps 2/5] RUN apk add --no-cache libc6-compat python3 make g++
 => [deps 3/5] WORKDIR /app
 => [deps 4/5] COPY package.json package-lock.json ./
 => [deps 5/5] RUN npm ci --omit=dev
 => [builder 1/6] FROM node:20-alpine
 => [builder 2/6] RUN apk add --no-cache libc6-compat python3 make g++
 => [builder 3/6] WORKDIR /app
 => [builder 4/6] COPY package.json package-lock.json ./
 => [builder 5/6] RUN npm ci
 => [builder 6/6] COPY . .
 => [builder 7/6] RUN npm run build
 => [runner 1/6] FROM node:20-alpine
 => [runner 2/6] RUN apk add --no-cache libc6-compat curl
 => [runner 3/6] WORKDIR /app
 => [runner 4/6] RUN addgroup --system --gid 1001 nodejs
 => [runner 5/6] COPY --from=deps /app/node_modules ./node_modules
 => [runner 6/6] COPY --from=builder /app/.next/standalone ./
 => exporting to image
 => => naming to docker.io/manhquydev/vietexplore-ai:latest
 => => naming to docker.io/manhquydev/vietexplore-ai:3.0.0
 => => naming to docker.io/manhquydev/vietexplore-ai:production

================================================
BUILD SUCCESSFUL!
================================================

REPOSITORY                          TAG         IMAGE ID       CREATED         SIZE
manhquydev/vietexplore-ai          latest      abc123def456   2 seconds ago   356MB
manhquydev/vietexplore-ai          3.0.0       abc123def456   2 seconds ago   356MB
manhquydev/vietexplore-ai          production  abc123def456   2 seconds ago   356MB
```

**Build time:** 2-5 phút (lần đầu), 30s-1 phút (có cache)

### 4.3 Troubleshooting Build Errors

#### Error: "Cannot find module 'sharp'"

**Solution:**
```cmd
REM Clear Docker cache
docker builder prune -a

REM Rebuild
docker-build-args.cmd
```

#### Error: "NEXT_PUBLIC_FIREBASE_API_KEY is not set"

**Solution:**
```cmd
REM Check .env file exists
dir .env.production

REM Verify contains NEXT_PUBLIC_* variables
type .env.production | findstr NEXT_PUBLIC
```

#### Error: "The command 'docker' could not be found"

**Solution:**
- Khởi động Docker Desktop
- Wait cho Docker engine start (icon ở system tray)
- Retry command

---

## 🧪 BƯỚC 5: Test Image Locally

### 5.1 Run Container

```cmd
docker run -d ^
  -p 3000:3000 ^
  --env-file .env.production ^
  --name vietexplore-test ^
  manhquydev/vietexplore-ai:latest
```

### 5.2 Check Logs

```cmd
docker logs -f vietexplore-test
```

**Expected output:**
```
> vietexplore-ai@3.0.0 start
> next start

   ▲ Next.js 15.3.3
   - Local:        http://localhost:3000
   - Network:      http://0.0.0.0:3000

 ✓ Ready in 2.1s
```

### 5.3 Test Application

**Open browser:**
```
http://localhost:3000
```

**Check health:**
```cmd
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-10T10:00:00.000Z",
  "checks": {
    "application": { "status": "ok" },
    "environment": { "status": "ok" },
    "firestore": { "status": "ok", "latency": 45 }
  }
}
```

### 5.4 Stop Test Container

```cmd
docker stop vietexplore-test
docker rm vietexplore-test
```

---

## 🚀 BƯỚC 6: Push to Docker Hub

### 6.1 Tạo Repository (Optional)

**Cách 1: Auto-create khi push (khuyến nghị)**
- Docker Hub tự động tạo public repo khi bạn push lần đầu

**Cách 2: Manual create**
1. Login Docker Hub web
2. Click "Create Repository"
3. Name: `vietexplore-ai`
4. Visibility: Public (hoặc Private nếu muốn)
5. Click Create

### 6.2 Run Push Script

```cmd
docker-push.cmd
```

**Expected output:**
```
================================================
Pushing VietExplore-AI to Docker Hub
================================================
Username: manhquydev
Image: vietexplore-ai
Version: 3.0.0

Tags to push:
  - manhquydev/vietexplore-ai:latest
  - manhquydev/vietexplore-ai:3.0.0
  - manhquydev/vietexplore-ai:production
================================================

Checking Docker login...
Verifying images exist...

Pushing images to Docker Hub...

[1/3] Pushing manhquydev/vietexplore-ai:latest...
The push refers to repository [docker.io/manhquydev/vietexplore-ai]
abc123def456: Pushed
def456ghi789: Pushed
ghi789jkl012: Pushed
...
latest: digest: sha256:abc123...def456 size: 3456

[2/3] Pushing manhquydev/vietexplore-ai:3.0.0...
The push refers to repository [docker.io/manhquydev/vietexplore-ai]
abc123def456: Layer already exists
def456ghi789: Layer already exists
...
3.0.0: digest: sha256:abc123...def456 size: 3456

[3/3] Pushing manhquydev/vietexplore-ai:production...
The push refers to repository [docker.io/manhquydev/vietexplore-ai]
abc123def456: Layer already exists
...
production: digest: sha256:abc123...def456 size: 3456

================================================
PUSH SUCCESSFUL!
================================================

Your image is now available at:
  https://hub.docker.com/r/manhquydev/vietexplore-ai

Pull command:
  docker pull manhquydev/vietexplore-ai:latest

Run command:
  docker run -d -p 3000:3000 --env-file .env.production manhquydev/vietexplore-ai:latest

================================================
```

**Push time:** 2-5 phút (lần đầu), 30s (sau khi layers exist)

### 6.3 Verify on Docker Hub

**Open browser:**
```
https://hub.docker.com/r/manhquydev/vietexplore-ai
```

**Check:**
- ✅ 3 tags: `latest`, `3.0.0`, `production`
- ✅ Image size: ~350MB
- ✅ Last pushed: "a few seconds ago"

---

## 🎉 BƯỚC 7: Test Pull & Run từ Docker Hub

### 7.1 Xóa Local Image (để test clean pull)

```cmd
docker rmi manhquydev/vietexplore-ai:latest
docker rmi manhquydev/vietexplore-ai:3.0.0
docker rmi manhquydev/vietexplore-ai:production
```

### 7.2 Pull từ Docker Hub

```cmd
docker pull manhquydev/vietexplore-ai:latest
```

**Expected output:**
```
latest: Pulling from manhquydev/vietexplore-ai
abc123def456: Pull complete
def456ghi789: Pull complete
...
Digest: sha256:abc123...def456
Status: Downloaded newer image for manhquydev/vietexplore-ai:latest
docker.io/manhquydev/vietexplore-ai:latest
```

### 7.3 Run từ Docker Hub Image

```cmd
docker run -d ^
  -p 3000:3000 ^
  -e FIREBASE_PROJECT_ID=your-project-id ^
  -e FIREBASE_CLIENT_EMAIL=your-email@iam.gserviceaccount.com ^
  -e FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..." ^
  -e GOOGLE_AI_API_KEY=your-api-key ^
  -e CRON_SECRET=your-cron-secret ^
  -e NEXTAUTH_URL=http://localhost:3000 ^
  --name vietexplore-prod ^
  manhquydev/vietexplore-ai:latest
```

### 7.4 Verify

```cmd
curl http://localhost:3000/api/health
```

**Expected: Healthy response!**

---

## 🔄 BƯỚC 8: Cập Nhật Image (Future Updates)

### 8.1 Thay Đổi Code

```cmd
REM Make changes to src/
code src/app/page.tsx
```

### 8.2 Update Version

**Edit docker-build-args.cmd:**
```cmd
REM Change version
set VERSION=3.0.1  # hoặc 3.1.0, 4.0.0, etc.
```

### 8.3 Rebuild & Push

```cmd
REM Rebuild
docker-build-args.cmd

REM Push
docker-push.cmd
```

### 8.4 Pull Latest trên Server

```cmd
docker pull manhquydev/vietexplore-ai:latest

docker stop vietexplore-prod
docker rm vietexplore-prod

docker run -d ... manhquydev/vietexplore-ai:latest
```

---

## 📊 BƯỚC 9: Quản Lý Images trên Docker Hub

### 9.1 View Repository

```
https://hub.docker.com/r/manhquydev/vietexplore-ai
```

### 9.2 Tabs

**General:**
- Repository description
- README (auto-generated từ README.md)
- Pull commands

**Tags:**
- List all tags: latest, 3.0.0, 3.0.1, production
- Size, Last pushed, Digest
- Delete old tags

**Settings:**
- Change visibility (Public ↔ Private)
- Delete repository
- Webhooks for auto-deploy

### 9.3 Add Description

1. Click "Settings" tab
2. "Description" field:
   ```
   🇻🇳 VietExplore-AI - Nền tảng du lịch Việt Nam với AI

   Official Docker image cho VietExplore-AI.

   Website: https://www.dulichviet.tech
   GitHub: https://github.com/manhquydev/VietExplore-AI

   ## Quick Start
   docker pull manhquydev/vietexplore-ai:latest
   docker run -d -p 3000:3000 --env-file .env.production manhquydev/vietexplore-ai:latest

   ## Documentation
   https://github.com/manhquydev/VietExplore-AI/blob/main/DOCKER.md
   ```
3. Save

---

## 🤖 BƯỚC 10: Setup Automated Builds (Optional)

### 10.1 Link GitHub Account

1. Docker Hub → Account Settings → Linked Accounts
2. Connect GitHub
3. Authorize Docker Hub

### 10.2 Configure Automated Build

1. Repository → Builds tab
2. Link to Source Repository
3. Select GitHub repo: `manhquydev/VietExplore-AI`
4. Build rules:
   ```
   Source: main
   Docker Tag: latest
   Dockerfile location: /Dockerfile
   Build Context: /
   Autobuild: ON
   ```
5. Save

**Result:**
- Every push to `main` branch → Auto-build on Docker Hub
- No manual build/push needed!

---

## 🔐 BƯỚC 11: Security Best Practices

### 11.1 Environment Variables

**❌ NEVER push .env.production to Docker Hub!**

Already protected by `.dockerignore` (line 10):
```
.env.production
```

### 11.2 Secrets Management

**Production deployment:**
```bash
# Use environment variables at runtime
docker run -e FIREBASE_PRIVATE_KEY="$(cat firebase-key.txt)" ...

# Or Docker Swarm secrets
echo "$FIREBASE_PRIVATE_KEY" | docker secret create firebase_key -

# Or Kubernetes secrets
kubectl create secret generic firebase-secrets --from-literal=private-key="..."
```

### 11.3 Rotate Credentials

**Monthly:**
- Rotate Docker Hub access token
- Update Firebase service account key
- Change CRON_SECRET

### 11.4 Scan for Vulnerabilities

```cmd
docker scout cves manhquydev/vietexplore-ai:latest
```

**Or use Trivy:**
```cmd
trivy image manhquydev/vietexplore-ai:latest
```

---

## 📈 BƯỚC 12: Monitoring

### 12.1 Pull Statistics

**View in Docker Hub:**
- Repository → Analytics
- Pulls over time
- Geographic distribution

### 12.2 Size Monitoring

**Check image size:**
```cmd
docker images | findstr vietexplore-ai
```

**Expected: ~300-400MB**

**If > 500MB:**
- Review dependencies
- Check for unnecessary files
- Optimize multi-stage build

---

## 🚀 BƯỚC 13: Deploy to Production

Bây giờ image đã public, bạn có thể deploy anywhere:

### Google Cloud Run

```bash
gcloud run deploy vietexplore-ai \
  --image docker.io/manhquydev/vietexplore-ai:latest \
  --platform managed \
  --region asia-southeast1
```

### AWS ECS

Create task definition:
```json
{
  "containerDefinitions": [{
    "name": "app",
    "image": "manhquydev/vietexplore-ai:latest",
    "portMappings": [{"containerPort": 3000}]
  }]
}
```

### Railway

```bash
railway up --image manhquydev/vietexplore-ai:latest
```

### Any VPS (DigitalOcean, Linode, etc.)

```bash
ssh user@your-server

docker pull manhquydev/vietexplore-ai:latest

docker run -d \
  -p 80:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  --name vietexplore-ai \
  manhquydev/vietexplore-ai:latest
```

---

## 🆘 Troubleshooting

### Error: "denied: requested access to the resource is denied"

**Cause:** Không đủ quyền hoặc chưa login

**Solution:**
```cmd
docker login
# Nhập lại credentials
```

### Error: "tag does not exist"

**Cause:** Tag không tồn tại trên Docker Hub

**Solution:**
```cmd
# Kiểm tra tags local
docker images | findstr vietexplore-ai

# Verify tag name match
docker push manhquydev/vietexplore-ai:latest
```

### Error: "server gave HTTP response to HTTPS client"

**Cause:** Docker registry configuration issue

**Solution:**
```cmd
docker logout
docker login
```

### Slow Push (> 10 minutes)

**Cause:** Network hoặc image size lớn

**Solution:**
- Check internet speed
- Use Ethernet instead of WiFi
- Consider Docker Hub alternative (GHCR, ECR)

---

## 📚 Summary Commands

```cmd
REM Login
docker login

REM Build
docker-build-args.cmd

REM Test locally
docker run -p 3000:3000 --env-file .env.production manhquydev/vietexplore-ai:latest

REM Push
docker-push.cmd

REM Pull (on production server)
docker pull manhquydev/vietexplore-ai:latest

REM Run (on production server)
docker run -d -p 3000:3000 --env-file .env.production manhquydev/vietexplore-ai:latest
```

---

## ✅ Checklist

- [ ] Tạo tài khoản Docker Hub
- [ ] Tạo access token
- [ ] Login Docker CLI
- [ ] Sửa DOCKER_USERNAME trong scripts
- [ ] Build image local
- [ ] Test image local
- [ ] Push to Docker Hub
- [ ] Verify trên web
- [ ] Test pull từ Docker Hub
- [ ] Deploy to production
- [ ] Setup automated builds (optional)
- [ ] Add repository description
- [ ] Configure webhooks (optional)

---

**Người tạo:** Docker Infrastructure Team
**Ngày tạo:** 2025-01-10
**Status:** ✅ Production Ready

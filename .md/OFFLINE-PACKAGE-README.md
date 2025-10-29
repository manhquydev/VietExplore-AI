# 📦 VietExplore-AI - Offline Distribution Package

## 📋 **TÌNH TRẠNG DỰ ÁN HIỆN TẠI**

**Ngày kiểm tra:** 2025-10-28 (UTC+7)
**Phiên bản:** 3.0.0
**Docker Setup:** ✅ HOÀN THIỆN 100%
**Status:** ✅ SẴN SÀNG BÀN GIAO

---

## 🎯 **PACKAGE NÀY BAO GỒM**

### **1. Docker Image (Development)**
- **File:** `vietexplore-ai-dev.tar` (431.7 MB)
- **Compressed:** `vietexplore-ai-dev.zip` (429.9 MB)
- **Image ID:** 9be1e10204fd
- **Tag:** vietexplore-ai:dev
- **Size:** 2.66 GB (khi import)
- **Base:** node:20-alpine
- **Build Date:** 2025-10-27

**Nội dung:**
- ✅ Next.js 15.3.3 development server
- ✅ Hot reload enabled (với volume mounts)
- ✅ All dependencies (1587 packages)
- ✅ Build tools (python3, make, g++, curl, git)
- ✅ Development environment configured

### **2. Docker Configuration Files**
```
docker-compose.yml          (6.2 KB)  - Production configuration
docker-compose.dev.yml      (7.5 KB)  - Development configuration
Dockerfile                  (6.3 KB)  - Production build
Dockerfile.dev              (2.9 KB)  - Development build
.dockerignore               (5.1 KB)  - Build optimization
docker-build-args.cmd       (3.2 KB)  - Windows build script
docker-build-args.sh        (3.6 KB)  - Linux/Mac build script
docker-push.cmd             (2.7 KB)  - Push to registry script
```

### **3. Environment Configuration**
```
.env.production.example     (Existing) - Production environment template
.env.local                  (Existing) - Development environment
```

### **4. Documentation**
```
README.md                   (27 KB)   - Project overview
DOCKER-DISTRIBUTION-GUIDE.md (NEW)    - 3 cách chia sẻ Docker
GHCR-SETUP-GUIDE.md         (NEW)    - GitHub Container Registry guide
OFFLINE-PACKAGE-README.md   (THIS)   - Offline package instructions
```

---

## 💾 **DOCKER IMAGE STATUS**

### **Current State:**
```bash
REPOSITORY       TAG       IMAGE ID       CREATED       SIZE
vietexplore-ai   dev       9be1e10204fd   4 hours ago   2.66GB
```

### **Container Status:**
```bash
CONTAINER ID   IMAGE                COMMAND                  STATUS
c7b5620f6cb9   vietexplore-ai:dev   "docker-entrypoint..."   Exited (3 hours ago)
```

### **Network:**
```bash
vietexplore-dev-network   bridge    (Created)
```

**✅ Kết luận:** Image đã được build và test thành công, container đã chạy OK.

---

## 🚀 **HƯỚNG DẪN SỬ DỤNG CHO NGƯỜI NHẬN**

### **YÊU CẦU HỆ THỐNG**

**Phần cứng:**
- RAM: 4GB minimum, 8GB recommended
- Disk: 10GB free space (5GB cho image + 5GB workspace)
- CPU: 2 cores minimum, 4 cores recommended

**Phần mềm:**
- Docker Desktop 20.10+ (Windows/Mac)
- Docker Engine 20.10+ (Linux)
- Docker Compose V2

**Ports:**
- Development: 9002
- Production: 3000

---

### **BƯỚC 1: CÀI ĐẶT DOCKER (Nếu chưa có)**

#### **Windows:**
```bash
# 1. Download Docker Desktop
# https://www.docker.com/products/docker-desktop

# 2. Cài đặt và khởi động Docker Desktop

# 3. Verify
docker --version
docker-compose --version
```

#### **Linux (Ubuntu/Debian):**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify
docker --version
docker compose version
```

#### **macOS:**
```bash
# 1. Download Docker Desktop for Mac
# https://docs.docker.com/desktop/install/mac-install/

# 2. Install and start

# 3. Verify
docker --version
docker-compose --version
```

---

### **BƯỚC 2: IMPORT DOCKER IMAGE**

#### **Option A: From .tar file (Recommended)**

```bash
# 1. Giải nén zip (nếu cần)
unzip vietexplore-ai-dev.zip
# Windows: Right-click → Extract All

# 2. Import image vào Docker
docker load -i vietexplore-ai-dev.tar

# Output:
# Loaded image: vietexplore-ai:dev

# 3. Verify image imported
docker images | grep vietexplore-ai

# Expected output:
# vietexplore-ai   dev   9be1e10204fd   X hours ago   2.66GB
```

**⏱️ Thời gian:** ~1-3 phút (tùy máy)

#### **Option B: From .zip file directly (Slower)**

```bash
# Linux/Mac
unzip -p vietexplore-ai-dev.zip | docker load

# Windows PowerShell
Expand-Archive vietexplore-ai-dev.zip -DestinationPath .
docker load -i vietexplore-ai-dev.tar
```

---

### **BƯỚC 3: CẤU HÌNH ENVIRONMENT**

```bash
# 1. Copy template
cp .env.production.example .env.production

# 2. Edit file
nano .env.production    # Linux/Mac
notepad .env.production # Windows

# 3. Điền các giá trị BẮT BUỘC:
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (Runtime secrets)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Google AI (Optional - cho AI features)
GOOGLE_AI_API_KEY=your-google-ai-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

**⚠️ LƯU Ý:**
- Không commit file `.env.production` vào Git
- Giữ Private Key an toàn
- Không chia sẻ credentials

---

### **BƯỚC 4: CHẠY ỨNG DỤNG**

#### **Mode 1: Development (Recommended cho testing)**

```bash
# Start development server với hot reload
docker-compose -f docker-compose.dev.yml up -d

# Check logs
docker logs -f vietexplore-ai-dev

# Access application
# Browser: http://localhost:9002

# Stop
docker-compose -f docker-compose.dev.yml down
```

**Features:**
- ✅ Hot reload (code changes auto-refresh)
- ✅ Source maps enabled
- ✅ Debugging tools
- ✅ Port: 9002

#### **Mode 2: Production (Cho deployment thật)**

⚠️ **Cần build production image trước:**

```bash
# Build production image (cần internet + Firebase credentials)
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
  -t vietexplore-ai:production \
  -f Dockerfile .

# Start production server
docker-compose up -d

# Access: http://localhost:3000
```

**Features:**
- ✅ Optimized build (~350MB)
- ✅ SSG/SSR enabled
- ✅ Production performance
- ✅ Port: 3000

---

### **BƯỚC 5: VERIFY & TEST**

```bash
# 1. Check container running
docker ps

# Expected:
# CONTAINER ID   IMAGE                PORTS                    STATUS
# xxxxxxxxxxxx   vietexplore-ai:dev   0.0.0.0:9002->9002/tcp   Up X minutes

# 2. Check logs (should see "Ready in X.Xs")
docker logs vietexplore-ai-dev

# 3. Test health API
curl http://localhost:9002/api/health

# Expected: JSON response với status

# 4. Test web interface
# Browser: http://localhost:9002
# Should see: VietExplore-AI homepage
```

---

## 🔧 **TROUBLESHOOTING**

### **Issue 1: Docker not installed**
```bash
# Error: "docker: command not found"

# Solution: Install Docker (see Step 1)
```

### **Issue 2: Image import failed**
```bash
# Error: "open vietexplore-ai-dev.tar: no such file or directory"

# Solution:
cd /path/to/extracted/folder
docker load -i vietexplore-ai-dev.tar
```

### **Issue 3: Port already in use**
```bash
# Error: "Bind for 0.0.0.0:9002 failed: port is already allocated"

# Solution 1: Stop conflicting container
docker ps
docker stop <container-id>

# Solution 2: Change port in docker-compose.dev.yml
ports:
  - "8080:9002"  # Use 8080 instead
```

### **Issue 4: Container exits immediately**
```bash
# Check logs
docker logs vietexplore-ai-dev

# Common causes:
# 1. Missing .env file → Create .env.production
# 2. Invalid Firebase credentials → Check .env values
# 3. Port conflict → Change port
```

### **Issue 5: "Firebase Admin SDK not initialized"**
```bash
# This is EXPECTED for development mode without Firebase credentials
# Application still works for frontend testing
# For full functionality, add Firebase credentials to .env.production
```

### **Issue 6: Out of disk space**
```bash
# Check Docker disk usage
docker system df

# Clean up unused images/containers
docker system prune -a

# Remove specific image
docker rmi vietexplore-ai:dev
```

---

## 📊 **PACKAGE FILES SUMMARY**

```
📦 vietexplore-ai-offline-package/
├── 🐳 Docker Image Files (431.7 MB)
│   ├── vietexplore-ai-dev.tar        # Uncompressed image
│   └── vietexplore-ai-dev.zip        # Compressed (recommended)
│
├── ⚙️ Docker Configuration
│   ├── docker-compose.yml            # Production config
│   ├── docker-compose.dev.yml        # Development config
│   ├── Dockerfile                    # Production build
│   ├── Dockerfile.dev                # Development build
│   └── .dockerignore                 # Build optimization
│
├── 🔧 Scripts
│   ├── docker-build-args.cmd         # Build script (Windows)
│   ├── docker-build-args.sh          # Build script (Linux/Mac)
│   └── docker-push.cmd               # Push to registry
│
├── 🔐 Environment Templates
│   ├── .env.production.example       # Production template
│   └── .env.local.example            # Development template
│
└── 📚 Documentation
    ├── README.md                     # Project overview
    ├── DOCKER-DISTRIBUTION-GUIDE.md  # Distribution methods
    ├── GHCR-SETUP-GUIDE.md          # GitHub Registry guide
    └── OFFLINE-PACKAGE-README.md     # This file
```

**Total Size:** ~432 MB (compressed)

---

## ⚡ **QUICK START (TL;DR)**

```bash
# 1. Install Docker
# https://www.docker.com/products/docker-desktop

# 2. Import image
unzip vietexplore-ai-dev.zip
docker load -i vietexplore-ai-dev.tar

# 3. Create .env
cp .env.production.example .env.production
# Edit and add Firebase credentials

# 4. Run
docker-compose -f docker-compose.dev.yml up -d

# 5. Access
# http://localhost:9002
```

⏱️ **Thời gian:** 5-10 phút

---

## 🔄 **UPDATE & MAINTENANCE**

### **Cập nhật Image mới:**
```bash
# 1. Nhận file image mới từ admin
# 2. Stop container hiện tại
docker-compose down

# 3. Remove old image (optional)
docker rmi vietexplore-ai:dev

# 4. Import new image
docker load -i vietexplore-ai-v3.1.0.tar

# 5. Start with new image
docker-compose -f docker-compose.dev.yml up -d
```

### **Backup Data:**
```bash
# Backup environment config
cp .env.production .env.production.backup

# Backup volumes (if any)
docker run --rm -v vietexplore-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

### **Clean Up:**
```bash
# Stop all containers
docker-compose down

# Remove images
docker rmi vietexplore-ai:dev

# Clean system
docker system prune -a
```

---

## 📞 **SUPPORT & CONTACT**

### **Khi gặp vấn đề:**

1. **Check logs first:**
   ```bash
   docker logs vietexplore-ai-dev
   ```

2. **Check container status:**
   ```bash
   docker ps -a
   ```

3. **Search documentation:**
   - README.md
   - DOCKER-DISTRIBUTION-GUIDE.md
   - Troubleshooting section (above)

4. **Contact support:**
   - Email: support@dulichviet.tech
   - GitHub Issues: (if available)
   - Team Chat: (if available)

### **Log Files to Include:**
```bash
# When reporting issues, provide:
docker version
docker-compose version
docker ps -a
docker logs vietexplore-ai-dev --tail 100
docker inspect vietexplore-ai-dev
```

---

## ✅ **CHECKLIST BÀN GIAO**

### **Người Gửi (Admin) đã chuẩn bị:**
- [x] Docker image exported (.tar)
- [x] Docker image compressed (.zip)
- [x] docker-compose files (dev + prod)
- [x] Environment templates
- [x] Documentation complete
- [x] README instructions
- [x] Troubleshooting guide

### **Người Nhận cần có:**
- [ ] Docker Desktop/Engine installed
- [ ] 10GB disk space free
- [ ] Firebase project credentials
- [ ] Basic Docker knowledge (hoặc đọc docs)
- [ ] Terminal/command line access

### **Sau khi nhận package:**
- [ ] Extract files
- [ ] Import Docker image
- [ ] Create .env.production
- [ ] Start container
- [ ] Test application
- [ ] Verify all features work
- [ ] Contact support if issues

---

## 🎯 **EXPECTED RESULTS**

### **Sau khi setup thành công:**

✅ **Container Running:**
```bash
$ docker ps
CONTAINER ID   IMAGE                STATUS      PORTS
xxxxxxxxxxxx   vietexplore-ai:dev   Up X min    0.0.0.0:9002->9002/tcp
```

✅ **Application Accessible:**
- Homepage: http://localhost:9002 ✅
- Health API: http://localhost:9002/api/health ✅
- Admin Panel: http://localhost:9002/admin ✅

✅ **Logs Healthy:**
```
▲ Next.js 15.3.3
- Local: http://localhost:9002
✓ Ready in 4.9s
```

✅ **No Errors:**
- No container crashes
- No permission errors
- No port conflicts

---

## 📈 **PERFORMANCE EXPECTATIONS**

| Metric | Development | Production |
|--------|-------------|------------|
| **Startup Time** | 3-5s | 2-3s |
| **Memory Usage** | 512-768 MB | 256-512 MB |
| **CPU Usage (Idle)** | 5-10% | 2-5% |
| **Hot Reload** | < 1s | N/A |
| **Build Time** | N/A | 3-5 min |
| **Image Size** | 2.66 GB | ~350 MB |

---

## 🔐 **SECURITY NOTES**

### **⚠️ QUAN TRỌNG:**

1. **KHÔNG commit .env.production vào Git**
2. **KHÔNG share Firebase credentials publicly**
3. **KHÔNG expose port 9002/3000 ra internet trực tiếp** (dùng reverse proxy)
4. **CHỈ share Docker image** với người có quyền
5. **Đổi mật khẩu admin** sau khi setup xong

### **Recommended:**
- Dùng HTTPS với reverse proxy (Nginx/Caddy)
- Setup firewall rules
- Regular security updates
- Monitor logs for suspicious activity

---

## 📝 **CHANGELOG**

### **v3.0.0 (2025-10-27)**
- ✅ Initial Docker setup complete
- ✅ Multi-stage build implemented
- ✅ Development and production modes
- ✅ Hot reload for development
- ✅ Comprehensive documentation
- ✅ Offline distribution package ready

---

## 📄 **LICENSE & COPYRIGHT**

**Project:** VietExplore-AI - Vietnam Travel Platform
**Version:** 3.0.0
**Build Date:** 2025-10-27
**Package Type:** Offline Distribution (Development Image)

**⚠️ For internal use only. Do not redistribute without permission.**

---

**Tài liệu được tạo:** 2025-10-28
**Người tạo:** Development Team
**Package Size:** 431.7 MB (tar), 429.9 MB (zip)
**Docker Image:** vietexplore-ai:dev (2.66 GB)
**Status:** ✅ READY FOR DEPLOYMENT

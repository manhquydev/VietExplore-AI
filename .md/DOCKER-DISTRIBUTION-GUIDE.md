# Hướng Dẫn Đóng Gói và Chia Sẻ Docker - VietExplore AI

## 📦 3 CÁCH CHIA SẺ DỰ ÁN DOCKER

---

## ✅ **CÁCH 1: DOCKER HUB (Khuyến nghị - Dễ nhất)**

### **Bước 1: Đăng ký Docker Hub**
```bash
# Truy cập: https://hub.docker.com/signup
# Tạo tài khoản miễn phí
# Free tier: 1 private repo + unlimited public repos
```

### **Bước 2: Login Docker Hub**
```bash
docker login
# Username: your-dockerhub-username
# Password: your-password (hoặc access token)
```

### **Bước 3: Build Production Image**
```bash
# Cập nhật username trong script
# Sửa file docker-build-args.cmd dòng 25:
set DOCKER_USERNAME=your-dockerhub-username

# Build image với real Firebase credentials
docker-build-args.cmd
```

### **Bước 4: Push lên Docker Hub**
```bash
# Push tất cả tags
docker-push.cmd

# Hoặc push thủ công:
docker push your-username/vietexplore-ai:3.0.0
docker push your-username/vietexplore-ai:latest
docker push your-username/vietexplore-ai:production
```

### **Bước 5: Người Nhận Cài Đặt**

**📋 Gửi cho người nhận:**
1. Docker Hub repository URL
2. File `.env.production.example` (để họ tạo `.env.production`)
3. File `docker-compose.yml`

**💻 Người nhận thực hiện:**

```bash
# 1. Pull image
docker pull your-username/vietexplore-ai:latest

# 2. Tạo .env.production (copy từ .env.production.example)
# Điền Firebase credentials thật

# 3. Chạy container
docker run -d \
  --name vietexplore-ai \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  your-username/vietexplore-ai:latest

# Hoặc dùng docker-compose:
docker-compose up -d
```

**✅ Ưu điểm:**
- Dễ nhất, nhanh nhất
- Không giới hạn bandwidth
- Auto-update khi push version mới
- Miễn phí cho public repos
- Không cần gửi file lớn

**❌ Nhược điểm:**
- Cần internet để pull
- Public repo = code có thể bị reverse engineer (dùng private repo nếu lo ngại)

---

## 💾 **CÁCH 2: EXPORT IMAGE FILE (Offline)**

Phù hợp khi người nhận **KHÔNG có internet** hoặc **bảo mật tuyệt đối**.

### **Bước 1: Export Image**

```bash
# Export development image
docker save vietexplore-ai:dev -o vietexplore-ai-dev.tar

# Hoặc export production image (sau khi build)
docker save vietexplore-ai:latest -o vietexplore-ai-latest.tar
```

**Kích thước file:**
- Development: ~421 MB (tar), ~430 MB (zip)
- Production: ~350-400 MB (tar), ~360-410 MB (zip)

### **Bước 2: Nén File (Optional nhưng khuyến nghị)**

```bash
# Windows
powershell -Command "Compress-Archive -Path vietexplore-ai-dev.tar -DestinationPath vietexplore-ai-dev.zip"

# Linux/Mac
gzip vietexplore-ai-dev.tar
# Hoặc
tar -czf vietexplore-ai-dev.tar.gz vietexplore-ai-dev.tar
```

### **Bước 3: Gửi File cho Người Nhận**

**📦 Chuẩn bị package:**
```
vietexplore-ai-distribution/
├── vietexplore-ai-dev.zip          # Docker image (~430 MB)
├── docker-compose.yml               # Compose file
├── .env.production.example          # Environment template
└── INSTALLATION-GUIDE.md            # Hướng dẫn cài đặt
```

**🚀 Gửi qua:**
- Google Drive / OneDrive / Dropbox
- WeTransfer (miễn phí đến 2GB)
- USB / External HDD
- FTP / SFTP server
- Mega.nz (50GB free)

### **Bước 4: Người Nhận Import và Chạy**

**💻 Người nhận thực hiện:**

```bash
# 1. Giải nén file (nếu đã nén)
# Windows: Right-click → Extract
# Linux/Mac:
unzip vietexplore-ai-dev.zip
# hoặc
gunzip vietexplore-ai-dev.tar.gz

# 2. Import image vào Docker
docker load -i vietexplore-ai-dev.tar

# 3. Verify image imported
docker images | grep vietexplore-ai

# 4. Tạo .env.production từ template
cp .env.production.example .env.production
nano .env.production  # Điền Firebase credentials

# 5. Chạy container
docker-compose up -d

# Hoặc chạy trực tiếp:
docker run -d \
  --name vietexplore-ai \
  -p 9002:9002 \
  --env-file .env.production \
  --restart unless-stopped \
  vietexplore-ai:dev
```

**✅ Ưu điểm:**
- Không cần internet
- Bảo mật tuyệt đối (không public code)
- Hoạt động offline hoàn toàn
- Kiểm soát phân phối

**❌ Nhược điểm:**
- File lớn (~430 MB)
- Cần gửi qua dịch vụ file sharing
- Cập nhật version phải gửi lại file mới

---

## 🐙 **CÁCH 3: GITHUB CONTAINER REGISTRY (GHCR)**

Alternative cho Docker Hub, miễn phí, unlimited private repos.

### **Bước 1: Setup GitHub Personal Access Token**

```bash
# 1. Truy cập: https://github.com/settings/tokens
# 2. Generate new token (classic)
# 3. Chọn scopes:
#    - write:packages
#    - read:packages
#    - delete:packages
# 4. Copy token
```

### **Bước 2: Login GitHub Container Registry**

```bash
# Windows
set CR_PAT=YOUR_GITHUB_TOKEN
echo %CR_PAT% | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Linux/Mac
export CR_PAT=YOUR_GITHUB_TOKEN
echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### **Bước 3: Tag và Push Image**

```bash
# Tag image với GHCR format
docker tag vietexplore-ai:latest ghcr.io/your-github-username/vietexplore-ai:latest
docker tag vietexplore-ai:latest ghcr.io/your-github-username/vietexplore-ai:3.0.0

# Push to GHCR
docker push ghcr.io/your-github-username/vietexplore-ai:latest
docker push ghcr.io/your-github-username/vietexplore-ai:3.0.0
```

### **Bước 4: Người Nhận Pull và Chạy**

```bash
# Login GHCR (nếu private repo)
echo YOUR_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull image
docker pull ghcr.io/your-github-username/vietexplore-ai:latest

# Run container
docker run -d \
  --name vietexplore-ai \
  -p 3000:3000 \
  --env-file .env.production \
  ghcr.io/your-github-username/vietexplore-ai:latest
```

**✅ Ưu điểm:**
- Miễn phí unlimited private repos
- Tích hợp với GitHub
- No bandwidth limit
- Auto-build với GitHub Actions

**❌ Nhược điểm:**
- Cần GitHub account
- Setup phức tạp hơn Docker Hub

---

## 📋 **PACKAGE CHECKLIST - GỬI CHO NGƯỜI NHẬN**

### **Minimum Package (Bắt buộc):**
- [ ] Docker image file (.tar hoặc .zip) HOẶC Docker Hub URL
- [ ] `.env.production.example` - Template môi trường
- [ ] `INSTALLATION-GUIDE.md` - Hướng dẫn cài đặt

### **Full Package (Khuyến nghị):**
- [ ] Docker image file hoặc Docker Hub URL
- [ ] `.env.production.example`
- [ ] `docker-compose.yml` - Compose configuration
- [ ] `INSTALLATION-GUIDE.md` - Hướng dẫn chi tiết
- [ ] `TROUBLESHOOTING.md` - Hướng dẫn fix lỗi
- [ ] `README.md` - Tổng quan dự án
- [ ] Firebase service account setup guide (nếu cần)

### **Optional (Nice to have):**
- [ ] `firestore.rules` - Firestore security rules
- [ ] `firestore.indexes.json` - Database indexes
- [ ] `scripts/` folder - Utility scripts
- [ ] SSL certificates setup guide
- [ ] Nginx reverse proxy config (nếu dùng)

---

## 🚀 **INSTALLATION GUIDE MẪU (Cho Người Nhận)**

Tạo file `INSTALLATION-GUIDE.md`:

```markdown
# Hướng Dẫn Cài Đặt VietExplore-AI

## Yêu Cầu Hệ Thống

- Docker 20.10+
- Docker Compose V2
- RAM: 2GB minimum, 4GB recommended
- Disk: 5GB free space
- Port 3000 available (hoặc tùy chỉnh)

## Cài Đặt Docker (Nếu chưa có)

### Windows
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop
3. Verify: `docker --version`

### Linux
\`\`\`bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
\`\`\`

### macOS
1. Download Docker Desktop for Mac
2. Cài đặt và khởi động
3. Verify: `docker --version`

## Bước 1: Pull Docker Image

### Từ Docker Hub (Nếu có internet)
\`\`\`bash
docker pull your-username/vietexplore-ai:latest
\`\`\`

### Từ File (Nếu offline)
\`\`\`bash
# Giải nén (nếu file .zip)
unzip vietexplore-ai-latest.zip

# Import image
docker load -i vietexplore-ai-latest.tar

# Verify
docker images | grep vietexplore-ai
\`\`\`

## Bước 2: Cấu Hình Environment Variables

\`\`\`bash
# Tạo file .env.production
cp .env.production.example .env.production

# Chỉnh sửa file
nano .env.production  # Linux/Mac
notepad .env.production  # Windows
\`\`\`

**Điền các giá trị bắt buộc:**
- Firebase credentials (lấy từ Firebase Console)
- Google AI API Key (nếu dùng AI features)
- Public URL của ứng dụng

## Bước 3: Chạy Ứng Dụng

### Option A: Docker Compose (Khuyến nghị)
\`\`\`bash
docker-compose up -d
\`\`\`

### Option B: Docker Run
\`\`\`bash
docker run -d \
  --name vietexplore-ai \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  vietexplore-ai:latest
\`\`\`

## Bước 4: Verify

\`\`\`bash
# Check container status
docker ps

# Check logs
docker logs -f vietexplore-ai

# Test application
curl http://localhost:3000/api/health
\`\`\`

## Bước 5: Truy Cập Ứng Dụng

Mở browser: **http://localhost:3000**

## Troubleshooting

### Container không start
\`\`\`bash
docker logs vietexplore-ai
\`\`\`

### Port conflict
\`\`\`bash
# Đổi port (ví dụ 8080)
docker run -d -p 8080:3000 ...
\`\`\`

### Reset container
\`\`\`bash
docker-compose down
docker-compose up -d
\`\`\`

## Support

Email: support@example.com
GitHub: https://github.com/your-repo
\`\`\`

---

## 🔒 **BẢO MẬT KHI CHIA SẺ**

### **QUAN TRỌNG - KHÔNG BAO GIỜ BAO GỒM:**

❌ **KHÔNG gửi kèm:**
- `.env.production` với Firebase credentials thật
- Firebase service account JSON files
- API keys, secrets, passwords
- Database credentials
- Private keys (.pem, .key files)

✅ **CHỈ gửi:**
- `.env.production.example` (template, giá trị giả)
- Docker image (không chứa secrets)
- Public configuration files
- Documentation

### **Best Practices:**

1. **Tách secrets khỏi image:**
   - Dùng `--env-file` hoặc environment variables
   - KHÔNG bake secrets vào Dockerfile
   - KHÔNG commit .env files vào Git

2. **Private Docker Registry:**
   - Dùng private repos trên Docker Hub
   - Hoặc self-hosted registry
   - Hoặc GHCR private

3. **Encrypted Transfer:**
   - Dùng HTTPS khi upload
   - Dùng encrypted file sharing
   - Dùng password-protected archives

4. **Access Control:**
   - Chỉ share với người cần
   - Revoke access khi không dùng
   - Monitor downloads/pulls

---

## 📊 **SO SÁNH 3 CÁCH**

| Tiêu Chí | Docker Hub | Export File | GHCR |
|----------|-----------|------------|------|
| **Dễ dàng** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Tốc độ** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Offline** | ❌ | ✅ | ❌ |
| **Bảo mật** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Chi phí** | Free | Free | Free |
| **Cập nhật** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **File size** | N/A | 430 MB | N/A |

**Khuyến nghị:**
- **Có internet:** Docker Hub hoặc GHCR
- **Offline/Bảo mật:** Export File
- **GitHub integration:** GHCR
- **Dễ nhất:** Docker Hub

---

## 🎯 **NEXT STEPS**

### **Sau khi gửi cho người nhận:**

1. **Cung cấp Support:**
   - Email/chat để hỗ trợ cài đặt
   - Giải đáp các câu hỏi
   - Fix bugs nếu phát hiện

2. **Monitor Usage:**
   - Track Docker Hub pulls
   - Check container health
   - Collect feedback

3. **Cập nhật Version:**
   - Push new versions khi có update
   - Notify người dùng về updates
   - Maintain changelog

4. **Documentation:**
   - Cập nhật docs khi có thay đổi
   - Add FAQ based on user questions
   - Video tutorials (nếu có)

---

## 📞 **Support & Contact**

**Email:** support@dulichviet.tech
**GitHub:** https://github.com/your-repo
**Docs:** https://docs.dulichviet.tech

---

**Tài liệu được tạo:** 2025-01-27
**Phiên bản:** 1.0.0
**Docker Image:** vietexplore-ai:dev (2.66GB), vietexplore-ai:latest (350MB)

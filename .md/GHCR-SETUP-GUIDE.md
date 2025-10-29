# Hướng Dẫn Setup GitHub Container Registry (GHCR) - Private Repository

## 🐙 **TẠI SAO DÙNG GHCR?**

✅ **Unlimited private repositories** - MIỄN PHÍ
✅ **Access control qua GitHub teams/organizations**
✅ **Tích hợp GitHub Actions** (CI/CD automation)
✅ **No bandwidth limits**
✅ **Fine-grained permissions**

---

## 🚀 **SETUP GHCR - 5 PHÚT**

### **Bước 1: Tạo GitHub Personal Access Token**

1. **Truy cập:** https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Token name:** `GHCR-VietExplore-AI`
4. **Expiration:** Chọn thời hạn (khuyến nghị: 90 days hoặc No expiration)
5. **Select scopes:**
   - ✅ `write:packages` - Upload packages
   - ✅ `read:packages` - Download packages
   - ✅ `delete:packages` - Delete packages (optional)
   - ✅ `repo` (nếu repo là private)

6. Click **"Generate token"**
7. **⚠️ QUAN TRỌNG:** Copy token ngay (chỉ hiện 1 lần)
   - Lưu vào file an toàn: `GHCR_TOKEN.txt`

---

### **Bước 2: Login GHCR từ Docker**

```bash
# Windows (PowerShell)
$env:CR_PAT="YOUR_GITHUB_TOKEN"
echo $env:CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Windows (CMD)
set CR_PAT=YOUR_GITHUB_TOKEN
echo %CR_PAT% | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Linux/Mac
export CR_PAT=YOUR_GITHUB_TOKEN
echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

**Kết quả:** `Login Succeeded`

---

### **Bước 3: Build và Tag Image cho GHCR**

```bash
# Build production image (với real Firebase credentials)
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:latest \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your-key \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id \
  -f Dockerfile .

# Tag thêm version
docker tag ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:latest \
           ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:3.0.0

docker tag ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:latest \
           ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:production
```

---

### **Bước 4: Push lên GHCR**

```bash
# Push all tags
docker push ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:latest
docker push ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:3.0.0
docker push ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:production
```

**Kết quả:** Image xuất hiện tại https://github.com/YOUR_USERNAME?tab=packages

---

### **Bước 5: Set Package Visibility = Private**

1. Vào package: https://github.com/users/YOUR_USERNAME/packages/container/vietexplore-ai
2. Click **"Package settings"** (góc phải)
3. Scroll xuống **"Danger Zone"**
4. Click **"Change package visibility"**
5. Chọn **"Private"** ⭐
6. Confirm

**⚠️ LƯU Ý:** Package mặc định là PUBLIC khi push lần đầu. Phải đổi sang PRIVATE thủ công!

---

## 🔐 **CẤP QUYỀN CHO NGƯỜI KHÁC**

### **Cách 1: Invite GitHub Collaborators (Organization)**

**Nếu repo nằm trong GitHub Organization:**

1. Vào package settings
2. **"Manage Actions access"** section
3. Add repository có quyền pull: `organization/repo-name`

**Nếu dùng personal account:**
- GHCR không có collaborators như Docker Hub
- Phải dùng **Access Token sharing** (Cách 2)

---

### **Cách 2: Share Access Token (Khuyến nghị)**

#### **A. Tạo Read-Only Token cho người nhận:**

1. Tạo token mới tại https://github.com/settings/tokens
2. **Token name:** `VietExplore-Pull-Only-Token`
3. **Scopes:** CHỈ chọn `read:packages` ⭐
4. Copy token
5. Gửi token cho người nhận (qua email/chat an toàn)

#### **B. Người nhận login và pull:**

```bash
# Login GHCR với read-only token
export CR_PAT=RECEIVED_TOKEN
echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull private image
docker pull ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:latest

# Verify
docker images | grep vietexplore-ai

# Run container
docker run -d \
  --name vietexplore-ai \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  ghcr.io/YOUR_GITHUB_USERNAME/vietexplore-ai:latest
```

---

### **Cách 3: GitHub Organization + Teams (Advanced)**

**Nếu có GitHub Organization:**

1. Tạo GitHub Organization: https://github.com/organizations/plan
2. Tạo team: `VietExplore-Users`
3. Add members vào team
4. Grant team quyền `read` cho package

**Cách này:**
- ✅ Quản lý quyền theo team
- ✅ Dễ add/remove members
- ✅ Professional cho team lớn
- ❌ Cần GitHub Organization (free cho public repos)

---

## 📦 **PACKAGE GỬI CHO NGƯỜI NHẬN**

Tạo file `INSTALLATION-FROM-GHCR.md`:

```markdown
# Hướng Dẫn Cài Đặt VietExplore-AI từ GHCR

## Bước 1: Nhận Access Token

Liên hệ admin để nhận:
- GitHub username: YOUR_GITHUB_USERNAME
- Read-only token: (gửi qua email/chat)

## Bước 2: Login GHCR

\`\`\`bash
# Linux/Mac
export CR_PAT=YOUR_RECEIVED_TOKEN
echo $CR_PAT | docker login ghcr.io -u ADMIN_GITHUB_USERNAME --password-stdin

# Windows (PowerShell)
$env:CR_PAT="YOUR_RECEIVED_TOKEN"
echo $env:CR_PAT | docker login ghcr.io -u ADMIN_GITHUB_USERNAME --password-stdin
\`\`\`

## Bước 3: Pull Image

\`\`\`bash
docker pull ghcr.io/ADMIN_GITHUB_USERNAME/vietexplore-ai:latest
\`\`\`

## Bước 4: Tạo .env.production

\`\`\`bash
cp .env.production.example .env.production
nano .env.production  # Điền Firebase credentials
\`\`\`

## Bước 5: Chạy Container

\`\`\`bash
# Với docker-compose (khuyến nghị)
docker-compose up -d

# Hoặc docker run
docker run -d \
  --name vietexplore-ai \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  ghcr.io/ADMIN_GITHUB_USERNAME/vietexplore-ai:latest
\`\`\`

## Bước 6: Verify

\`\`\`bash
docker ps
docker logs -f vietexplore-ai
curl http://localhost:3000/api/health
\`\`\`

## Troubleshooting

### Lỗi "unauthorized: authentication required"
→ Token hết hạn hoặc không có quyền read:packages
→ Liên hệ admin để nhận token mới

### Lỗi "manifest unknown"
→ Image chưa được push hoặc sai tag
→ Check tag: latest, 3.0.0, production

## Support
Email: support@example.com
\`\`\`
```

---

## 🔄 **UPDATE IMAGE (Khi có version mới)**

```bash
# 1. Rebuild image
docker build -t ghcr.io/YOUR_USERNAME/vietexplore-ai:latest .

# 2. Tag version mới
docker tag ghcr.io/YOUR_USERNAME/vietexplore-ai:latest \
           ghcr.io/YOUR_USERNAME/vietexplore-ai:3.1.0

# 3. Push
docker push ghcr.io/YOUR_USERNAME/vietexplore-ai:latest
docker push ghcr.io/YOUR_USERNAME/vietexplore-ai:3.1.0
```

**Người dùng update:**
```bash
docker pull ghcr.io/YOUR_USERNAME/vietexplore-ai:latest
docker-compose down
docker-compose up -d
```

---

## 🔒 **BẢO MẬT BEST PRACTICES**

### **1. Token Management:**
- ✅ **Admin token:** Có `write:packages` (chỉ admin giữ)
- ✅ **User token:** Chỉ `read:packages` (gửi cho end-users)
- ✅ **Expiration:** Set 90 days, renew trước khi hết hạn
- ✅ **Revoke:** Thu hồi token khi không dùng

### **2. Token Storage:**
```bash
# Lưu token vào file (local only)
echo "YOUR_TOKEN" > ~/.ghcr_token
chmod 600 ~/.ghcr_token

# Dùng token
cat ~/.ghcr_token | docker login ghcr.io -u USERNAME --password-stdin
```

### **3. Giới Hạn Quyền:**
- Read-only token chỉ pull được, không push
- Không share admin token
- Mỗi user/team riêng token

### **4. Monitoring:**
- Check package download stats
- Audit token usage
- Revoke compromised tokens ngay

---

## 📊 **SO SÁNH: DOCKER HUB vs GHCR**

| Feature | Docker Hub Free | GHCR Free |
|---------|----------------|-----------|
| **Private repos** | 1 | ✅ Unlimited |
| **Collaborators** | Manual add | ✅ GitHub teams |
| **Access tokens** | Basic | ✅ Fine-grained |
| **Bandwidth** | Unlimited | Unlimited |
| **GitHub integration** | No | ✅ Native |
| **CI/CD** | Separate | ✅ GitHub Actions |
| **Cost** | Free (1 private) | ✅ Free (unlimited) |

**Khuyến nghị:** GHCR cho unlimited private repos

---

## 🚀 **AUTOMATED BUILD với GitHub Actions (Bonus)**

Tạo file `.github/workflows/docker-build.yml`:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main, develop2]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v3

      - name: Login to GHCR
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository_owner }}/vietexplore-ai:latest
            ghcr.io/${{ github.repository_owner }}/vietexplore-ai:${{ github.sha }}
```

**Lợi ích:**
- ✅ Auto build khi push code
- ✅ Auto push lên GHCR
- ✅ Version tracking với commit SHA

---

## 📞 **Support**

**GHCR Issues:**
- GitHub: https://github.com/YOUR_USERNAME/vietexplore-ai/issues
- Email: support@example.com

**Token Renewal:**
- Email admin 1 tuần trước token hết hạn

---

**Tài liệu được tạo:** 2025-01-27
**Phiên bản:** 1.0.0
**Registry:** GitHub Container Registry (ghcr.io)

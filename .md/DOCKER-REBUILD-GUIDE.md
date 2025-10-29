# Hướng Dẫn Rebuild Docker Sau Khi Update Dự Án

## Tình Huống: Bạn đã update code và muốn build lại Docker image mới

---

## 🔄 REBUILD DEVELOPMENT IMAGE

### Bước 1: Dọn dẹp container và image cũ (Optional nhưng khuyến nghị)

```bash
# Dừng và xóa container cũ
docker compose -f docker-compose.dev.yml down

# Xóa image cũ (nếu muốn build clean 100%)
docker rmi vietexplore-ai:dev

# Hoặc xóa tất cả dangling images (images không tag)
docker image prune -f
```

### Bước 2: Build lại với --no-cache (Build hoàn toàn mới)

```bash
# Build lại từ đầu, bỏ qua cache
docker compose -f docker-compose.dev.yml build --no-cache

# Hoặc build + start luôn
docker compose -f docker-compose.dev.yml up --build --force-recreate -d
```

**Giải thích flags:**
- `--no-cache`: Bỏ qua Docker cache, build lại từ đầu
- `--build`: Rebuild image trước khi start
- `--force-recreate`: Tạo lại container dù không có thay đổi
- `-d`: Chạy ở background (detached mode)

### Bước 3: Verify image mới

```bash
# Kiểm tra image mới (chú ý CREATED time)
docker images vietexplore-ai

# Kiểm tra container đang chạy
docker ps

# Xem logs
docker compose -f docker-compose.dev.yml logs -f
```

---

## 🚀 REBUILD PRODUCTION IMAGE

### Option A: Build Production với Build Args (Khuyến nghị)

```bash
# Sử dụng script có sẵn
.\docker-build-args.cmd

# Hoặc tương đương:
docker build ^
  --no-cache ^
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=%NEXT_PUBLIC_FIREBASE_API_KEY% ^
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN% ^
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=%NEXT_PUBLIC_FIREBASE_PROJECT_ID% ^
  # ... (tất cả env vars)
  -t vietexplore-ai:latest ^
  -t vietexplore-ai:3.0.0 ^
  -t vietexplore-ai:production ^
  .
```

**Trước khi chạy:**
1. Đảm bảo `.env.production` có đầy đủ Firebase credentials thật
2. Update `VERSION` trong `docker-build-args.cmd` nếu cần (hiện tại: 3.0.0)

### Option B: Build Production với docker-compose

```bash
# Build production
docker compose -f docker-compose.yml build --no-cache

# Build + start
docker compose -f docker-compose.yml up --build -d
```

---

## 📦 UPDATE OFFLINE PACKAGE (Sau khi rebuild)

### Bước 1: Export image mới

```bash
# Export development image
docker save vietexplore-ai:dev -o vietexplore-ai-dev-v2.tar

# Hoặc production image
docker save vietexplore-ai:latest -o vietexplore-ai-prod-v2.tar
```

### Bước 2: Nén file (Optional)

```bash
# Windows PowerShell
Compress-Archive -Path vietexplore-ai-dev-v2.tar -DestinationPath vietexplore-ai-dev-v2.zip

# Linux/Mac
gzip vietexplore-ai-dev-v2.tar
# Tạo: vietexplore-ai-dev-v2.tar.gz
```

### Bước 3: Update CHANGELOG trong OFFLINE-PACKAGE-README.md

Thêm vào đầu file:

```markdown
## Version 2.0.0 (2025-01-XX)

**Changes:**
- [Mô tả update của bạn]
- [Ví dụ: Fixed authentication bug]
- [Ví dụ: Added new AI features]

**Breaking Changes:**
- [Nếu có breaking changes]
```

---

## 🔄 WORKFLOW HOÀN CHỈNH

### Khi bạn update code và muốn bàn giao version mới:

```bash
# 1. Commit code changes
git add .
git commit -m "Update: [mô tả changes]"

# 2. Stop container cũ
docker compose -f docker-compose.dev.yml down

# 3. Clean build mới (bỏ cache)
docker compose -f docker-compose.dev.yml build --no-cache

# 4. Test image mới
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f

# 5. Kiểm tra app hoạt động: http://localhost:9002

# 6. Export image mới
docker save vietexplore-ai:dev -o vietexplore-ai-dev-v2.tar

# 7. Nén
Compress-Archive -Path vietexplore-ai-dev-v2.tar -DestinationPath vietexplore-ai-dev-v2.zip

# 8. Upload lên cloud storage
# 9. Share link với người nhận
```

---

## ⚡ REBUILD NHANH (Khi chỉ thay đổi nhỏ)

Nếu bạn chỉ sửa code nhỏ và muốn rebuild nhanh:

```bash
# Rebuild WITH cache (nhanh hơn)
docker compose -f docker-compose.dev.yml up --build -d

# Docker sẽ:
# - Phát hiện files nào thay đổi
# - Chỉ rebuild layers bị ảnh hưởng
# - Giữ lại cache của layers không đổi
```

**Khi nào dùng:**
- ✅ Sửa code trong `src/`
- ✅ Thay đổi CSS/UI
- ✅ Update dependencies nhỏ

**Khi nào KHÔNG nên dùng:**
- ❌ Thay đổi `package.json` (dependencies)
- ❌ Thay đổi `next.config.ts`
- ❌ Thay đổi Dockerfile
- ❌ Muốn build "sạch" 100%

→ Những trường hợp này nên dùng `--no-cache`

---

## 🐛 TROUBLESHOOTING

### ❌ "Error: Image is being used by container"

```bash
# Dừng và xóa container trước
docker compose -f docker-compose.dev.yml down
docker rm -f vietexplore-ai-dev

# Rồi mới xóa image
docker rmi vietexplore-ai:dev
```

### ❌ Build lâu quá (10+ phút)

**Nguyên nhân:** Docker đang download lại dependencies

**Giải pháp:**
```bash
# Dùng cache để build nhanh hơn
docker compose -f docker-compose.dev.yml build
# (Bỏ --no-cache nếu không cần thiết)
```

### ❌ "No space left on device"

```bash
# Dọn dẹp Docker để giải phóng space
docker system prune -a --volumes

# Warning: Sẽ xóa:
# - Tất cả images không dùng
# - Tất cả containers đã dừng
# - Tất cả volumes không dùng
# - Build cache
```

### ❌ Port 9002 đã bị chiếm

```bash
# Tìm process đang dùng port
netstat -ano | findstr :9002

# Hoặc kill process
taskkill /PID <PID_NUMBER> /F

# Hoặc đổi port trong docker-compose.dev.yml
ports:
  - "9003:9002"  # Host:Container
```

---

## 📋 CHECKLIST UPDATE VERSION

### Trước khi build:
- [ ] Code đã commit và test local?
- [ ] Update version trong `docker-build-args.cmd`?
- [ ] `.env.production` có credentials thật? (cho production build)
- [ ] Đã đọc logs để biết dependencies nào thay đổi?

### Sau khi build:
- [ ] Image size hợp lý? (`docker images`)
- [ ] Container start thành công? (`docker ps`)
- [ ] App accessible tại port? (http://localhost:9002)
- [ ] Logs không có critical errors? (`docker logs`)

### Trước khi export:
- [ ] Test app với real user flow?
- [ ] Check Firebase connection works?
- [ ] AI features hoạt động? (nếu có)
- [ ] Update CHANGELOG?

### Trước khi share:
- [ ] File size không quá lớn? (nên < 500 MB compressed)
- [ ] Đã test import image trên máy khác?
- [ ] Documentation updated?
- [ ] Gửi kèm OFFLINE-PACKAGE-README.md?

---

## 🎯 QUICK REFERENCE

### Development Rebuild (Most Common)

```bash
# Clean rebuild
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up --build --force-recreate --no-cache -d

# Quick rebuild (with cache)
docker compose -f docker-compose.dev.yml up --build -d
```

### Production Rebuild

```bash
# Với script
.\docker-build-args.cmd

# Manual
docker build --no-cache -t vietexplore-ai:latest .
```

### Export Updated Image

```bash
docker save vietexplore-ai:dev -o vietexplore-ai-dev-v2.tar
Compress-Archive -Path vietexplore-ai-dev-v2.tar -DestinationPath vietexplore-ai-dev-v2.zip
```

---

## 📚 Related Documentation

- `DOCKER.md` - Docker overview
- `DOCKER-DISTRIBUTION-GUIDE.md` - Distribution methods
- `OFFLINE-PACKAGE-README.md` - Installation guide
- `docker-build-args.cmd` - Production build script
- `docker-compose.dev.yml` - Development config
- `docker-compose.yml` - Production config

---

**Tác giả:** Claude Code
**Ngày tạo:** 2025-01-28
**Version:** 1.0.0
**Mục đích:** Hướng dẫn rebuild Docker sau update code

# 🐳 Docker Quick Start Guide

Hướng dẫn nhanh để chạy VietExplore-AI với Docker trong 5 phút.

---

## 📋 Prerequisites

- Docker 20.10+ installed
- Docker Compose V2 installed
- `.env.local` or `.env.production` configured

---

## 🚀 Development (với Hot Reload)

### 1. Chuẩn bị Environment

```bash
# Copy template
cp .env.example .env.local

# Edit với editor yêu thích
nano .env.local  # hoặc code .env.local
```

### 2. Start Development Stack

```bash
# Build và start
docker compose -f docker-compose.dev.yml up --build

# Hoặc run ở background
docker compose -f docker-compose.dev.yml up -d
```

### 3. Access Application

- **Web App**: http://localhost:9002
- **Health Check**: http://localhost:9002/api/health

### 4. View Logs

```bash
docker compose -f docker-compose.dev.yml logs -f
```

### 5. Stop

```bash
# Stop và giữ containers
docker compose -f docker-compose.dev.yml stop

# Stop và xóa containers
docker compose -f docker-compose.dev.yml down
```

---

## 🏭 Production (Local Testing)

### 1. Chuẩn bị Environment

```bash
# Copy template
cp .env.production.example .env.production

# Edit với production values
nano .env.production
```

### 2. Build Production Image

```bash
docker compose build
```

### 3. Run Production Stack

```bash
# Start ở background
docker compose up -d

# View logs
docker compose logs -f app
```

### 4. Access Application

- **Web App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

### 5. Verify Health

```bash
curl http://localhost:3000/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","checks":{...}}
```

### 6. Stop

```bash
docker compose down
```

---

## 🔧 Common Commands

### Development

```bash
# Start
docker compose -f docker-compose.dev.yml up

# Rebuild
docker compose -f docker-compose.dev.yml up --build

# Stop
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Execute command
docker compose -f docker-compose.dev.yml exec app sh
docker compose -f docker-compose.dev.yml exec app npm install <package>
```

### Production

```bash
# Start
docker compose up -d

# Rebuild
docker compose up -d --build

# Stop
docker compose down

# View logs
docker compose logs -f app

# Restart
docker compose restart app

# Scale (requires load balancer)
docker compose up -d --scale app=3
```

### Debugging

```bash
# Check health
curl http://localhost:3000/api/health

# View logs
docker logs -f vietexplore-ai-prod

# Open shell in container
docker exec -it vietexplore-ai-prod sh

# Check environment variables
docker exec vietexplore-ai-prod env

# Resource usage
docker stats vietexplore-ai-prod
```

---

## 🐛 Troubleshooting

### Issue: Port already in use

```bash
# Find process
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Use different port
docker run -p 8080:3000 vietexplore-ai:latest
```

### Issue: Build fails

```bash
# Clear cache và rebuild
docker compose build --no-cache

# Or clear all Docker cache
docker builder prune -a
```

### Issue: Environment variables not loaded

```bash
# Verify .env file exists
ls -la .env.production

# Check variables in container
docker exec vietexplore-ai-prod env | grep FIREBASE

# Restart container
docker compose restart app
```

### Issue: Hot reload not working (dev)

```bash
# Ensure WATCHPACK_POLLING=true in docker-compose.dev.yml
# Already configured - just rebuild

docker compose -f docker-compose.dev.yml up --build
```

---

## 📦 Image Management

```bash
# List images
docker images | grep vietexplore

# Remove image
docker rmi vietexplore-ai:latest

# Remove all unused images
docker image prune -a

# Check image size
docker images vietexplore-ai:latest
# Expected: ~300-400MB
```

---

## 🌐 Production Deployment

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/vietexplore-ai

# Deploy
gcloud run deploy vietexplore-ai \
  --image gcr.io/PROJECT_ID/vietexplore-ai \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```

### AWS ECS

```bash
# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.region.amazonaws.com
docker tag vietexplore-ai:latest ACCOUNT.dkr.ecr.region.amazonaws.com/vietexplore-ai:latest
docker push ACCOUNT.dkr.ecr.region.amazonaws.com/vietexplore-ai:latest
```

### Railway

```bash
# Install CLI
npm install -g @railway/cli

# Deploy
railway up
```

---

## 📚 Full Documentation

Để biết thêm chi tiết, xem:

- **[DOCKER.md](./DOCKER.md)** - Comprehensive Docker guide (200+ pages)
  - Multi-stage build optimization
  - Security best practices
  - CI/CD integration
  - Deployment to all major platforms
  - Troubleshooting guide
  - Performance optimization

- **[.env.production.example](./.env.production.example)** - Environment template với hướng dẫn

---

## ⏱️ Expected Performance

| Metric | Value |
|--------|-------|
| **Build Time** | 2-3 phút (with cache) |
| **Image Size** | ~300-400 MB |
| **Startup Time** | ~2-3 giây |
| **Memory Usage** | ~512 MB (production) |

---

## ✅ Health Check

Container tự động health check mỗi 30 giây:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "application": { "status": "ok" },
    "environment": { "status": "ok" },
    "firestore": { "status": "ok", "latency": 45 }
  }
}
```

---

## 🆘 Need Help?

- 📖 **Full Guide**: [DOCKER.md](./DOCKER.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/manhquydev/VietExplore-AI/issues)
- 📧 **Email**: support@dulichviet.tech

---

**Người tạo:** Docker Infrastructure Team
**Ngày tạo:** 2025-01-10
**Status:** ✅ Production Ready

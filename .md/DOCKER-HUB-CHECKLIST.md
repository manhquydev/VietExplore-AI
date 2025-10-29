# ✅ Docker Hub Deployment Checklist

Quick checklist để đưa VietExplore-AI lên Docker Hub trong 30 phút.

---

## 📋 Phase 1: Setup (5 phút)

### 1. Tài Khoản Docker Hub
- [ ] Truy cập https://hub.docker.com/signup
- [ ] Username: `_____________` (ghi lại đây)
- [ ] Verify email
- [ ] Tạo access token: Settings → Security → New Access Token
- [ ] Copy và lưu token: `_____________`

### 2. Login Docker CLI
```cmd
docker login
Username: _____________ (điền username)
Password: _____________ (paste access token)
```
- [ ] Thấy "Login Succeeded"

---

## 🔧 Phase 2: Cấu Hình (5 phút)

### 3. Edit Build Scripts

**File: docker-build-args.cmd (dòng 11)**
- [ ] Mở: `notepad docker-build-args.cmd`
- [ ] Sửa: `set DOCKER_USERNAME=your-dockerhub-username`
- [ ] Thành: `set DOCKER_USERNAME=_____________` (điền username của bạn)
- [ ] Save (Ctrl+S)

**File: docker-push.cmd (dòng 7)**
- [ ] Mở: `notepad docker-push.cmd`
- [ ] Sửa: `set DOCKER_USERNAME=your-dockerhub-username`
- [ ] Thành: `set DOCKER_USERNAME=_____________` (SAME username)
- [ ] Save (Ctrl+S)

### 4. Verify Environment
- [ ] Check file tồn tại: `dir .env.production` hoặc `dir .env.local`
- [ ] File phải chứa tất cả `NEXT_PUBLIC_*` variables

---

## 🏗️ Phase 3: Build (10 phút)

### 5. Build Image
```cmd
docker-build-args.cmd
```

- [ ] Build starts (thấy "Building...")
- [ ] Chờ 2-5 phút (lần đầu)
- [ ] Thấy "BUILD SUCCESSFUL!"
- [ ] Check size: ~300-400MB

**If build fails:**
```cmd
docker builder prune -a
docker-build-args.cmd
```

---

## 🧪 Phase 4: Test Local (5 phút)

### 6. Run Container
```cmd
docker run -d -p 3000:3000 --env-file .env.production --name test manhquydev/vietexplore-ai:latest
```

Replace `manhquydev` với username của bạn!

- [ ] Container starts

### 7. Test Application
- [ ] Browser: http://localhost:3000
- [ ] Health check: `curl http://localhost:3000/api/health`
- [ ] Response: `{"status":"healthy",...}`

### 8. Cleanup Test
```cmd
docker stop test
docker rm test
```

---

## 🚀 Phase 5: Push to Docker Hub (5 phút)

### 9. Push Image
```cmd
docker-push.cmd
```

- [ ] Thấy "[1/3] Pushing ... :latest"
- [ ] Thấy "[2/3] Pushing ... :3.0.0"
- [ ] Thấy "[3/3] Pushing ... :production"
- [ ] Thấy "PUSH SUCCESSFUL!"

**If push fails "denied":**
```cmd
docker login
docker-push.cmd
```

### 10. Verify on Docker Hub
- [ ] Open: https://hub.docker.com/r/YOUR_USERNAME/vietexplore-ai
- [ ] Thấy 3 tags: latest, 3.0.0, production
- [ ] Size: ~350MB
- [ ] Last pushed: "a few seconds ago"

---

## ✅ Phase 6: Verify Pull & Run (5 phút)

### 11. Clean Local
```cmd
docker rmi YOUR_USERNAME/vietexplore-ai:latest
docker rmi YOUR_USERNAME/vietexplore-ai:3.0.0
docker rmi YOUR_USERNAME/vietexplore-ai:production
```

### 12. Pull from Docker Hub
```cmd
docker pull YOUR_USERNAME/vietexplore-ai:latest
```

- [ ] Thấy "Pull complete"
- [ ] Status: "Downloaded newer image"

### 13. Run from Docker Hub
```cmd
docker run -d -p 3000:3000 --env-file .env.production --name prod YOUR_USERNAME/vietexplore-ai:latest
```

- [ ] Container starts
- [ ] Test: http://localhost:3000
- [ ] Health: `curl http://localhost:3000/api/health`

---

## 🎉 Success Criteria

### You're done when:
- ✅ Image visible on Docker Hub
- ✅ Pull command works: `docker pull YOUR_USERNAME/vietexplore-ai:latest`
- ✅ Run command works và app accessible
- ✅ Health check returns healthy

### Your image URL:
```
https://hub.docker.com/r/YOUR_USERNAME/vietexplore-ai
```

---

## 📝 Next Steps (Optional)

### Automated Builds
- [ ] Docker Hub → Repository → Builds
- [ ] Link GitHub account
- [ ] Enable autobuild on push to main

### Repository Settings
- [ ] Add description
- [ ] Add README
- [ ] Change visibility (Public/Private)

### Documentation
- [ ] Update README.md với Docker Hub link
- [ ] Share pull command với team
- [ ] Document deployment process

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "docker command not found" | Start Docker Desktop |
| "denied: requested access" | `docker login` again |
| "build failed: sharp" | `docker builder prune -a` then rebuild |
| ".env file not found" | Check file exists: `dir .env.production` |
| "push failed: timeout" | Check internet, retry |
| "tag does not exist" | Verify username match in scripts |

---

## 📊 Time Tracking

| Phase | Expected Time | Your Time | Status |
|-------|---------------|-----------|--------|
| Setup | 5 min | _____ | ☐ |
| Configure | 5 min | _____ | ☐ |
| Build | 10 min | _____ | ☐ |
| Test Local | 5 min | _____ | ☐ |
| Push | 5 min | _____ | ☐ |
| Verify | 5 min | _____ | ☐ |
| **Total** | **35 min** | _____ | ☐ |

---

## 🎓 Key Files Created

- ✅ `docker-build-args.cmd` - Build script
- ✅ `docker-push.cmd` - Push script
- ✅ `DOCKER-HUB-GUIDE.md` - Full guide (1000+ lines)
- ✅ `DOCKER-HUB-CHECKLIST.md` - This checklist

---

## 📞 Need Help?

- 📖 Full guide: [DOCKER-HUB-GUIDE.md](./DOCKER-HUB-GUIDE.md)
- 🐳 Docker docs: [DOCKER.md](./DOCKER.md)
- 🆘 Quick start: [DOCKER-QUICK-START.md](./DOCKER-QUICK-START.md)

---

**Good luck! 🚀**

**Tip:** Print hoặc keep open trong tab riêng để check off khi làm.

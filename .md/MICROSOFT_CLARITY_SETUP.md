# 📊 Microsoft Clarity - Quick Setup Guide

> Free user behavior analytics cho Du Lịch Việt

## ✅ Setup Completed (2025-01-21)

Microsoft Clarity đã được tích hợp thành công vào dự án với cấu hình tối ưu cho Next.js 15 App Router.

## 🎯 Features Enabled

- ✅ **Session Recordings** - Xem lại hành vi người dùng
- ✅ **Heatmaps** - Click, scroll, attention maps
- ✅ **User Insights** - Rage clicks, dead clicks analysis
- ✅ **Production-only** - Chỉ chạy trong production
- ✅ **Privacy-first** - GDPR, CCPA, COPPA compliant

## 🔧 Configuration

### Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_CLARITY_PROJECT_ID=t6zei0ph7p

# Production (Vercel/hosting)
NEXT_PUBLIC_CLARITY_PROJECT_ID=t6zei0ph7p
```

### Project Info

- **Project Name:** Du Lịch Việt
- **Project ID:** `t6zei0ph7p`
- **Dashboard:** https://clarity.microsoft.com/projects/view/t6zei0ph7p

## 📂 Files Modified/Created

```
✅ src/components/analytics/microsoft-clarity.tsx   (NEW)
✅ src/app/layout.tsx                                (UPDATED)
✅ .env.local                                        (UPDATED)
✅ .env.example                                      (UPDATED)
✅ CLAUDE.md                                         (UPDATED)
✅ .claude/docs/features/microsoft-clarity-integration.md (NEW)
```

## 🚀 How to Test

### Local Development (npm run dev)
```bash
npm run dev
# ❌ Clarity will NOT load (development mode check)
```

### Production Build
```bash
npm run build
npm start

# ✅ Clarity loads in browser
# Check: DevTools > Network > Filter "clarity.ms"
```

### Verify in Dashboard
```bash
# 1. Deploy to production
# 2. Wait ~2 hours
# 3. Visit: https://clarity.microsoft.com/projects/view/t6zei0ph7p
# 4. Check Dashboard > Sessions
```

## 📊 Dashboard Access

**URL:** https://clarity.microsoft.com/projects/view/t6zei0ph7p

**Features:**
- 📹 Session recordings with playback
- 🔥 Heatmaps (click, scroll, area)
- 📊 Insights (rage clicks, dead clicks)
- 🌍 Geographic distribution
- 📱 Device/browser breakdown

## 🎓 Best Practices

### ✅ DO

- ✅ Review session recordings weekly
- ✅ Monitor rage clicks (frustration indicators)
- ✅ Analyze dead clicks (missing interactions)
- ✅ Check quick back rate (landing page quality)
- ✅ Use insights to improve UX

### ❌ DON'T

- ❌ Don't enable in development (duplicate data)
- ❌ Don't track sensitive forms (configure in dashboard)
- ❌ Don't ignore rage click patterns
- ❌ Don't skip weekly reviews

## 📈 Expected Data Timeline

- **0-2 hours:** Script loading, initial setup
- **2-4 hours:** First sessions appear
- **24 hours:** Heatmaps start generating
- **7 days:** Full insights available

## 🔍 Troubleshooting

### Script Not Loading?

```bash
# Check environment
echo $NODE_ENV  # Should be "production"

# Check env variable
echo $NEXT_PUBLIC_CLARITY_PROJECT_ID  # Should be "t6zei0ph7p"

# Check browser console
window.clarity  # Should return function
```

### No Data in Dashboard?

1. ✅ Verify production deployment
2. ✅ Check Network tab (clarity.ms request)
3. ✅ Wait 2-4 hours after first deploy
4. ✅ Ensure real traffic (not just you)
5. ✅ Check ad-blocker not blocking

## 📚 Full Documentation

Xem tài liệu chi tiết tại:
- `.claude/docs/features/microsoft-clarity-integration.md`

## 🔗 Resources

- **Dashboard:** https://clarity.microsoft.com/projects/view/t6zei0ph7p
- **Official Docs:** https://docs.microsoft.com/en-us/clarity/
- **GitHub:** https://github.com/microsoft/clarity
- **Support:** clarity-support@microsoft.com

---

**Status:** ✅ Production Ready
**Setup Date:** 2025-01-21
**Version:** 1.0.0

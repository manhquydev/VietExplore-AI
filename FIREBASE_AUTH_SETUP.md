# 🔥 Hướng dẫn cấu hình Firebase Authentication cho Production

## ⚠️ BẮT BUỘC: Thêm Production Domain vào Firebase

### Bước 1: Truy cập Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **vietexplore-ai**
3. Vào mục **Authentication** (biểu tượng khóa bên trái)
4. Click tab **Settings** (ở trên cùng, cạnh "Users")
5. Scroll xuống phần **Authorized domains**

### Bước 2: Thêm Domain Production

Click nút **Add domain** và thêm các domain sau:

```
dulichviet.tech
www.dulichviet.tech
```

**Lưu ý:**
- Cần thêm CẢ HAI domain (với và không có `www`)
- Firebase sẽ tự động verify ownership (nếu domain đã trỏ đến Vercel)
- Nếu domain chưa verify được, hãy đảm bảo DNS record đã trỏ đúng

### Bước 3: Cấu hình Google OAuth (nếu chưa có)

1. Vào **Authentication** → **Sign-in method**
2. Click vào **Google** provider
3. Đảm bảo status là **Enabled**
4. Kiểm tra **Project support email** đã được set

### Bước 4: Google Cloud Console (Tùy chọn - Nâng cao)

Nếu vẫn gặp lỗi, cần cấu hình thêm ở Google Cloud Console:

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project **vietexplore-ai**
3. Vào **APIs & Services** → **Credentials**
4. Click vào OAuth 2.0 Client ID (Web client - auto created by Firebase)
5. Thêm vào **Authorized JavaScript origins**:
   ```
   https://dulichviet.tech
   https://www.dulichviet.tech
   ```
6. Thêm vào **Authorized redirect URIs**:
   ```
   https://dulichviet.tech/__/auth/handler
   https://www.dulichviet.tech/__/auth/handler
   https://vietexplore-ai.firebaseapp.com/__/auth/handler
   ```
7. Click **Save**

## ✅ Xác minh cấu hình

Sau khi hoàn tất các bước trên:

1. Deploy code mới lên Vercel (đã có COOP headers)
2. Truy cập production site: `https://www.dulichviet.tech`
3. Thử đăng nhập/đăng ký với Google
4. Kiểm tra Chrome DevTools Console:
   - ✅ Không còn lỗi `Cross-Origin-Opener-Policy`
   - ✅ Không còn lỗi `popup-closed-by-user`
   - ✅ Đăng nhập thành công

## 🔧 Troubleshooting

### Lỗi: "This domain is not authorized..."

**Nguyên nhân:** Domain chưa được thêm vào Firebase Authorized Domains

**Giải pháp:** Làm lại Bước 2

### Lỗi: Popup vẫn bị chặn

**Nguyên nhân:**
- Browser settings chặn popup
- COOP headers chưa apply (Vercel chưa deploy)

**Giải pháp:**
1. Deploy code mới lên Vercel
2. Clear browser cache
3. Thử lại - code sẽ tự động fallback sang redirect flow

### Lỗi: "auth/unauthorized-domain"

**Nguyên nhân:** OAuth client chưa được config đúng

**Giải pháp:** Làm Bước 4 (Google Cloud Console)

## 📋 Checklist Hoàn chỉnh

- [ ] Firebase Authorized Domains đã có `dulichviet.tech`
- [ ] Firebase Authorized Domains đã có `www.dulichviet.tech`
- [ ] Google sign-in provider đã được enable
- [ ] Code đã được deploy lên Vercel với COOP headers mới
- [ ] Test thành công trên production
- [ ] Console không còn errors

## 🚀 Các thay đổi Code đã được apply

### 1. `vercel.json` - COOP Headers
```json
{
  "source": "/(.*)",
  "headers": [
    {
      "key": "Cross-Origin-Opener-Policy",
      "value": "same-origin-allow-popups"
    }
  ]
}
```

### 2. `auth-provider.tsx` - Auto Fallback Logic
- Tự động chuyển từ popup → redirect khi gặp lỗi COOP
- Xử lý redirect result khi user quay lại
- Better error messages

### 3. Production URL
- Production: `https://www.dulichviet.tech`
- Auth Domain: `vietexplore-ai.firebaseapp.com` (Firebase default)

---

**Lưu ý cuối:** Sau khi hoàn tất setup, file này có thể xóa hoặc move vào `/docs` folder.

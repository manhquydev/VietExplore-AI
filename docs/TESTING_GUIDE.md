# 🧪 Hướng dẫn test các tính năng đã hoàn thiện

## ✅ Tính năng đã sửa xong:

### 1. **Lưu bản nháp** 
### 2. **Giao diện form chuyên nghiệp**
### 3. **Admin review system**
### 4. **Address conversion API**

---

## 🚀 **Test từng tính năng:**

### **1. Test Save Draft (Lưu bản nháp)**

**Các bước:**
1. Vào `http://localhost:9003/contribute/new-place`
2. **Nhập tên địa điểm** (bắt buộc để nút Lưu nháp xuất hiện)
3. **Nút "Lưu nháp"** sẽ xuất hiện ngay khi có tên
4. Click **"Lưu nháp"** → redirect về `/contribute/my-drafts`

**✅ Kết quả mong đợi:**
- Nút hiện ở tất cả các step (không chỉ step 3)
- Lưu thành công và chuyển về My Drafts
- Draft có thể edit và submit sau

---

### **2. Test Form UI/UX Improvements**

**Kiểm tra:**
1. **Không còn debug info** (Province ID, Districts loaded, etc.)
2. **Stepper sạch sẽ** với icons thay vì checkmarks
3. **Address display** không có ✅ icons
4. **Professional appearance** toàn bộ form

**✅ Kết quả mong đợi:**
- Form trông clean, professional
- Không còn text debug
- Icons đơn giản, không cluttered

---

### **3. Test Address Conversion**

**Test case: Thái Bình → Hưng Yên**
1. Chọn: **Tỉnh: Thái Bình** → **Huyện: Quỳnh Phụ** → **Xã: An Hiệp**
2. **Kết quả hiển thị:**
   - Địa chỉ cũ: `Xã An Hiệp, Huyện Quỳnh Phụ, Thái Bình`
   - Địa chỉ mới: `Xã An Hiệp, Hưng Yên`
   - Message: `Tỉnh Thái Bình → Hưng Yên; Bỏ cấp huyện: Quỳnh Phụ`

**✅ Kết quả mong đợi:**
- Hiển thị đúng 2 địa chỉ (cũ và mới)
- Cảnh báo về thay đổi cấu trúc hành chính
- API conversion hoạt động chính xác

---

### **4. Test Admin Review System**

#### **Bước 1: Tạo admin user**
```bash
# Chạy script tạo admin (cần Firebase credentials)
node scripts/create-admin-user.js
```

#### **Bước 2: Test workflow**
1. **User thường:** Tạo địa điểm → Submit → Vào queue
2. **Admin:** Login với `admin@vietexplore.test` / `AdminTest123!`
3. **Review:** Vào `/moderation/dashboard` hoặc `/admin/review`

**✅ Kết quả mong đợi:**
- `/admin/review` redirect về `/moderation/dashboard`
- Admin thấy queue items
- Có thể approve/reject places

---

### **5. Test Preview Mode**

**Các bước:**
1. Điền đầy đủ form (tên, mô tả, ảnh, địa chỉ)
2. Click **"Xem trước"**
3. **Professional preview** hiển thị như place thật

**✅ Kết quả mong đợi:**
- Hero section với ảnh full-screen
- Layout giống production site
- Hiển thị đúng address conversion
- Responsive design

---

## 🛠 **Troubleshooting**

### **Nếu Save Draft không hiện:**
- Kiểm tra đã nhập tên địa điểm chưa
- Refresh browser
- Check console errors

### **Nếu Admin script lỗi:**
- Kiểm tra file `.env.local` có `FIREBASE_SERVICE_ACCOUNT_KEY`
- Hoặc đặt file `serviceAccountKey.json` ở root project
- Install: `npm install dotenv`

### **Nếu Address conversion không hoạt động:**
- Kiểm tra network tab có API calls `/api/address/convert`
- Server phải running trên port 9003
- Thử clear browser cache

---

## 🎯 **Summary checklist:**

- [ ] **Save Draft button xuất hiện khi có tên**
- [ ] **Form UI sạch sẽ, không có debug info** 
- [ ] **Address conversion hiển thị đúng cũ → mới**
- [ ] **Preview mode professional như production**
- [ ] **Admin review redirect đúng path**
- [ ] **End-to-end workflow hoạt động**

**Tất cả tính năng đã hoàn thiện theo yêu cầu!** 🎉
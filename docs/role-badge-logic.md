# 🏷️ Role Badge Logic - Du Lịch Việt

## 📋 **Hiểu đúng về Verification Flow**

### **❌ Logic cũ (SAI)**
```
User → Đăng ký → Traveler → Xin xác minh → Contributor/Partner + "Đã xác minh" badge
```

### **✅ Logic đúng theo tài liệu**
```
User → Đăng ký → Traveler
Admin → Xác minh năng lực → Gán role Contributor/Partner (đã implied verification)
```

## 🎯 **Role Badge Implementation**

### **1. Contributor (Cộng tác viên)**
- **Điều kiện**: Đã được Admin xác minh năng lực và uy tín
- **Badge**: Blue medal với checkmark (từ `Contributor.svg`)
- **Ý nghĩa**: "Đã được xác minh uy tín - Đóng góp địa điểm chất lượng"
- **Không cần**: Thêm badge "Đã xác minh" (redundant)

### **2. Partner (Đối tác cộng đồng)**
- **Điều kiện**: Tổ chức chính thức được ủy quyền (Sở Du lịch, etc.)
- **Badge**: Red medal với gold star (từ `Community_Partner.svg`)
- **Ý nghĩa**: "Tổ chức chính thức đã được ủy quyền"
- **Không cần**: Thêm badge "Đã xác minh" (redundant)

### **3. Trust Labels cho Content**
- **Community**: Nội dung từ cộng đồng, cần xem xét
- **Contributor**: Nội dung từ cộng tác viên (đã xác minh)
- **Partner**: Nội dung từ đối tác chính thức
- **Verified**: Nội dung đã được kiểm duyệt thêm bởi Moderator

## 🎨 **Visual Hierarchy**

### **Thứ tự uy tín (cao → thấp)**:
1. 🌟 **Verified** (Nội dung đã kiểm duyệt)
2. 🏛️ **Partner** (Đối tác chính thức)
3. ✍️ **Contributor** (Cộng tác viên uy tín)
4. 👥 **Community** (Cộng đồng)

### **Hiển thị trong UI**:
- **Place Cards**: Trust badge trên ảnh
- **Profile Pages**: Role badge dưới tên
- **Header Dropdown**: Role trong user info
- **Moderation**: Role của người gửi nội dung

## 🧪 **Test Cases Updated**

### **Contributor Test**:
- Login: `contributor@example.com`
- Expect: Blue medal badge ONLY (không có "Đã xác minh" riêng)
- Meaning: Role đã implied verification

### **Partner Test**:
- Login: `partner@danang.gov.vn`
- Expect: Red medal badge ONLY (không có "Đã xác minh" riêng)
- Meaning: Role đã implied official authorization

### **Content Trust Test**:
- Place từ Contributor → "Cộng tác viên" badge với blue medal
- Place từ Partner → "Đối tác cộng đồng" badge với red medal
- Place verified thêm → "Đã xác minh" badge (content level)

## ✅ **Compliance với Tài liệu**

Theo `tinh_nang_cốt_loi_lean_giai_doạn_1.md`:
- ✅ Line 35: "Contributor (Cộng tác viên xác minh)" → Role đã implied verification
- ✅ Line 15: "huy hiệu đóng góp (Verified Contributor)" → Badge thể hiện status
- ✅ Line 75: "Gán nhãn Verified" → Admin action, không phải user attribute

**Kết luận**: Role badge đã đủ thể hiện credibility, không cần redundant verification badge.


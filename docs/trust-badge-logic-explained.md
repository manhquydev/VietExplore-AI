# 🏷️ Logic Trust Badge - Giải thích rõ ràng (CORRECTED)

## 📋 **Phân biệt: User Role vs Content Trust**

### **User Roles (Vai trò người dùng)**

- **Traveler**: Người dùng thường - KHÔNG thể đăng địa điểm, chỉ đề xuất
- **Contributor**: Cộng tác viên đã được Admin xác minh uy tín - CÓ THỂ đăng địa điểm
- **Partner**: Đối tác chính thức (Sở Du lịch, tổ chức uy tín) - CÓ THỂ đăng địa điểm
- **Moderator**: Kiểm duyệt viên
- **Admin**: Quản trị viên

### **Content Trust Labels (Nhãn tin cậy nội dung)**

- **Cộng tác viên**: Nội dung từ user Contributor - đã được xác minh uy tín  
- **Đối tác cộng đồng**: Nội dung từ user Partner - tổ chức chính thức
- **Đã kiểm duyệt**: Nội dung đã được Moderator/Admin kiểm duyệt thêm

## 🚫 **QUAN TRỌNG: Traveler KHÔNG thể đăng địa điểm**

Theo tài liệu chính thức:
- ✅ **Contributor**: "Tạo bản nháp địa điểm", "Nộp nội dung để duyệt"
- ✅ **Partner**: "Nộp nội dung chính thống"
- ❌ **Traveler**: CHỈ có thể "Đề xuất địa điểm mới" - KHÔNG phải đăng bài

## 🎯 **Logic thực tế cho địa điểm**

### **Chỉ có 2 nguồn địa điểm hợp lệ:**
1. **Contributor** → hiển thị mác "Cộng tác viên" 
2. **Partner** → hiển thị mác "Đối tác cộng đồng"

### **Thêm kiểm duyệt:**
- Moderator duyệt bất kỳ địa điểm nào → thêm mác "Đã kiểm duyệt"
- ✅ Hiển thị: **"Cộng tác viên"** với icon medal xanh
- ❌ Không hiển thị: Cộng đồng, Đã kiểm duyệt (trừ khi Moderator duyệt thêm)

### **Scenario 3: User Partner đăng địa điểm**
- ✅ Hiển thị: **"Đối tác cộng đồng"** với icon medal đỏ
- ❌ Không hiển thị: Cộng đồng, Cộng tác viên, Đã kiểm duyệt (trừ khi Moderator duyệt thêm)

### **Scenario 4: Moderator duyệt bất kỳ nội dung nào**
- ✅ Hiển thị: **"Đã kiểm duyệt"** với icon shield xanh lá
- ℹ️ Có thể kết hợp với mác gốc (VD: "Cộng tác viên" + "Đã kiểm duyệt")

## 🎨 **Visual Hierarchy (Thứ tự ưu tiên)**

1. 🌟 **Đã kiểm duyệt** (cao nhất - đã được Moderator xác nhận)
2. 🏛️ **Đối tác cộng đồng** (tổ chức chính thức)  
3. ✍️ **Cộng tác viên** (cá nhân uy tín)
4. 👥 **Cộng đồng** (user thường - thấp nhất hoặc không hiển thị)

## 🔧 **Implementation trong Code**

### **destination-card.tsx**
```tsx
type: 'community' | 'contributor' | 'partner' | 'verified'

// 'community' = từ Traveler (có thể không hiển thị mác)
// 'contributor' = từ Contributor (medal xanh) 
// 'partner' = từ Partner (medal đỏ)
// 'verified' = đã được Moderator duyệt (shield xanh lá)
```

### **Mapping Logic**
- User Traveler tạo địa điểm → `type: 'community'`
- User Contributor tạo địa điểm → `type: 'contributor'`  
- User Partner tạo địa điểm → `type: 'partner'`
- Moderator approve nội dung → `type: 'verified'` (có thể kết hợp)

## ✅ **Ví dụ cụ thể**

### **Trang chủ - Điểm đến nổi bật:**
- Vịnh Hạ Long → **"Đã kiểm duyệt"** (đã được Moderator duyệt)
- Phố cổ Hội An → **"Cộng tác viên"** (từ Contributor)
- TP.HCM → **"Đối tác cộng đồng"** (từ Sở Du lịch TP.HCM)
- Hà Nội → **Không có mác** (từ user Traveler thường)
- Sa Pa → **"Cộng tác viên"** (từ Contributor)  
- Đồng bằng sông Cửu Long → **Không có mác** (từ user Traveler thường)

## 📖 **Tóm tắt cho Developer**

1. **KHÔNG có mác "Đã xác minh"** riêng cho user - Role Contributor/Partner đã implied verification
2. **Mác "Đã kiểm duyệt"** chỉ dành cho nội dung được Moderator review thêm
3. **Mác "Cộng đồng"** có thể ẩn đi để giảm nhiễu thị giác
4. **Icon phải đúng**: Contributor = medal xanh, Partner = medal đỏ vàng
5. **Priority hiển thị**: Verified > Partner > Contributor > Community

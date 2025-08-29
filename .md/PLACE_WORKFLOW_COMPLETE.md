# 🏞️ Quy trình đăng địa điểm hoàn chỉnh - VietExplore AI

## 📋 Tổng quan quy trình

### 1. Quyền hạn theo vai trò

| Vai trò | Đăng địa điểm | Kiểm duyệt | Nhãn tin cậy | Ghi chú |
|---------|:-------------:|:---------:|:------------:|---------|
| `guest` | ❌ | ❌ | - | Không được đăng |
| `traveler` | ❌ | ❌ | - | Mặc định khi đăng ký |
| `contributor` | ✅ | ❌ | `contributor` | Cần kiểm duyệt 24-48h |
| `partner` | ✅ | ❌ | `partner` | Kiểm duyệt ưu tiên 12-24h |
| `moderator` | ✅ | ✅ | `verified` | Có thể kiểm duyệt |
| `admin` | ✅ | ✅ | `special_verified` | Auto-publish, bỏ qua kiểm duyệt |

### 2. Luồng trạng thái địa điểm

```
draft → submitted → in_review → published
  ↑        ↑            ↓
  └────────┴─────── rejected
```

**Chi tiết trạng thái:**
- `draft`: Bản nháp, có thể chỉnh sửa tự do
- `submitted`: Đã gửi, có thể chỉnh sửa (reset về submitted)  
- `in_review`: Đang kiểm duyệt, KHÔNG được chỉnh sửa
- `published`: Đã xuất bản, KHÔNG được chỉnh sửa (chỉ admin/moderator)
- `rejected`: Bị từ chối với lý do, có thể chỉnh sửa và gửi lại

## 🎯 API Endpoints chi tiết

### A. Quản lý bản nháp

#### 1. Tạo bản nháp
```http
POST /api/places/drafts
Content-Type: application/json

{
  "name": "Tên địa điểm",
  "description": "Mô tả chi tiết",
  "shortDescription": "Mô tả ngắn",
  "region": "bac-bo", // hoặc trung-bo, nam-bo
  "province": "Hà Nội",
  "type": "van-hoa",
  "vietnamAddress": {
    "provinceId": 1,
    "provinceName": "Hà Nội", 
    "districtId": 5,
    "districtName": "Ba Đình",
    "fullAddress": "Số 1, Đường ABC, Phường XYZ, Quận Ba Đình, Hà Nội"
  },
  "images": [
    {
      "url": "https://...",
      "alt": "Ảnh đại diện",
      "isPrimary": true
    },
    {
      "url": "https://...", 
      "alt": "Ảnh phụ 1",
      "isPrimary": false
    }
  ],
  "video": {
    "url": "https://...",
    "thumbnail": "https://..."
  },
  "tags": ["văn hóa", "lịch sử"]
}
```

**Validation:**
- ✅ Bắt buộc có ít nhất 1 ảnh
- ✅ Chỉ được 1 video (không bắt buộc)
- ✅ Phải có ảnh đại diện (isPrimary: true)

#### 2. Cập nhật bản nháp
```http
PUT /api/places/drafts/{draftId}
```

#### 3. Gửi bản nháp để kiểm duyệt
```http
POST /api/places/drafts/{draftId}/submit
```

### B. Workflow kiểm duyệt

#### 1. Lấy hàng đợi kiểm duyệt
```http
GET /api/moderation/queue?queueType=partner_queue
GET /api/moderation/queue?queueType=contributor_queue
```

**Tách riêng 2 luồng:**
- `partner_queue`: Hàng đợi ưu tiên cho Partner
- `contributor_queue`: Hàng đợi thường cho Contributor

#### 2. Bắt đầu kiểm duyệt
```http
PUT /api/moderation/queue/{itemId}
{
  "action": "start_review",
  "reviewNotes": "Bắt đầu kiểm duyệt"
}
```
→ Chuyển trạng thái: `submitted` → `in_review`

#### 3. Phê duyệt
```http  
PUT /api/moderation/queue/{itemId}
{
  "action": "approve",
  "reviewNotes": "Địa điểm hợp lệ",
  "newTrustLabel": "verified"
}
```
→ Chuyển trạng thái: `in_review` → `published`

#### 4. Từ chối với lý do
```http
PUT /api/moderation/queue/{itemId}
{
  "action": "reject", 
  "reviewNotes": "Thông tin không chính xác, thiếu hình ảnh"
}
```
→ Chuyển trạng thái: `in_review` → `rejected`

### C. API địa chỉ Việt Nam

#### 1. Lấy danh sách tỉnh/thành
```http
GET /api/address/provinces?mode=2
```

#### 2. Lấy quận/huyện theo tỉnh
```http  
GET /api/address/districts?provinceId=1
```

#### 3. Lấy xã/phường
```http
GET /api/address/wards?districtId=5
```

#### 4. Chuyển đổi địa chỉ cũ → mới
```http
POST /api/address/convert
{
  "oldProvinceId": 123
}
```

## 🔒 Quyền chỉnh sửa theo trạng thái

| Trạng thái | User thường | Admin/Moderator | Ghi chú |
|------------|:-----------:|:---------------:|---------|
| `draft` | ✅ Edit | ✅ Edit | |
| `submitted` | ✅ Edit → reset submitted | ✅ Edit | Gửi lại sau edit |
| `in_review` | ❌ No edit | ✅ Edit | User bị khóa |
| `published` | ❌ No edit | ✅ Edit | Chỉ admin sửa |
| `rejected` | ✅ Edit → reset submitted | ✅ Edit | Clear rejection info |

## 🏷️ Hệ thống nhãn tin cậy

| Nhãn | Mô tả | Điều kiện |
|------|-------|----------|
| `community` | Cộng đồng | Contributor mặc định |
| `contributor` | Người đóng góp | Contributor role |  
| `partner` | Đối tác | Partner role |
| `verified` | Đã xác thực | Moderator/Admin duyệt |
| `special_verified` | **Xác thực đặc biệt** | Chỉ dành cho Admin |

## 📊 Logging & Audit Trail

### 1. Moderation History (trong Place document)
```json
"moderationHistory": [
  {
    "action": "started_review",
    "moderatorId": "user123", 
    "reason": "Bắt đầu kiểm duyệt",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "action": "approved",
    "moderatorId": "user123",
    "reason": "Địa điểm hợp lệ", 
    "createdAt": "2024-01-01T01:00:00.000Z"
  }
]
```

### 2. Moderation Logs (collection riêng)
```json
{
  "moderationItemId": "queue123",
  "contentType": "place",
  "contentId": "place456", 
  "action": "approve",
  "moderatorId": "user123",
  "reviewNotes": "OK",
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

## ⚡ Tính năng đặc biệt

### 1. Địa chỉ thông minh
- Tích hợp API địa chỉ hành chính Việt Nam mới nhất
- Hỗ trợ chuyển đổi địa chỉ cũ → mới sau sáp nhập tỉnh
- Tự động phân vùng miền (Bắc - Trung - Nam)

### 2. Upload media thông minh  
- **Ảnh**: Bắt buộc ít nhất 1 ảnh, phân biệt ảnh đại diện/phụ
- **Video**: Tối đa 1 video, không bắt buộc
- Tự động set ảnh đầu tiên làm đại diện nếu chưa chọn

### 3. Luồng kiểm duyệt tách biệt
- **Partner Queue**: Ưu tiên cao, xử lý 12-24h
- **Contributor Queue**: Thường, xử lý 24-48h  
- Admin bypass hoàn toàn, auto-publish với nhãn đặc biệt

## 🚀 Workflow hoàn chỉnh - Ví dụ thực tế

### Contributor đăng địa điểm:
1. **Draft**: Tạo bản nháp → lưu nhiều lần
2. **Submit**: Gửi kiểm duyệt → vào `contributor_queue`
3. **Moderator**: Xem queue → `start_review` → `in_review`
4. **Decision**: `approve` → `published` HOẶC `reject` → `rejected`
5. **If rejected**: User edit lại → gửi lại → quay về bước 2

### Admin đăng địa điểm:
1. **Draft**: Tạo bản nháp
2. **Submit**: Gửi → **Tự động published** với `special_verified`
3. **Bypass**: Bỏ qua hoàn toàn kiểm duyệt

---

**📝 Lưu ý quan trọng:**
- Tất cả thao tác đều có audit log minh bạch
- User không thể can thiệp khi ở trạng thái `in_review`  
- Admin có thể override mọi quyền hạn
- Hệ thống không cho Guest đăng địa điểm
- Traveler cần upgrade role để đóng góp
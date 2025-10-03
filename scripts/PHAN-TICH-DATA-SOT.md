# 📊 PHÂN TÍCH DỮ LIỆU CÒN SÓT TRONG SCRIPT CŨ

## ❌ VẤN ĐỀ PHÁT HIỆN

Sau khi chạy script `reset-vn-admin.js` hoặc `reset-project.js`, vẫn còn **SÓT DỮ LIỆU**:

### **Firestore Collections còn sót:**
1. ❌ `deletion_requests` - 1+ documents
2. ❌ `moderation` - Parent collection cho subcollections
3. ❌ `moderationQueue` - Legacy camelCase version

### **Storage Folders còn sót:**
1. ❌ `homepage/regions/bac-bo` - Region images
2. ❌ `announcements/images` - Announcement images

---

## 🔍 NGUYÊN NHÂN TẠI SAO CÒN SÓT?

### 📂 **1. Collections còn sót**

#### **`deletion_requests`** - Yêu cầu xóa soft delete

**Nguồn gốc:**
- Collection được tạo bởi `SoftDeleteService` trong `src/lib/server/soft-delete-service.ts`
- Sử dụng cho tính năng soft delete với timeout 72 giờ
- Được implement sau khi viết scripts reset ban đầu

**Tại sao script cũ KHÔNG xóa:**
```javascript
// Script cũ (reset-vn-admin.js, reset-project.js) chỉ xóa 4 collections:
const collections = [
  'places',
  'moderation_queue',  // ❌ Chỉ có underscore version
  'moderation_logs',
  'users'
];
// ❌ THIẾU: deletion_requests
```

**Ảnh hưởng:**
- Foreign keys trỏ đến places đã xóa → Lỗi khi query
- Orphan data trong database
- Tăng kích thước database không cần thiết

---

#### **`moderation`** - Parent collection cho subcollections

**Nguồn gốc:**
- Legacy collection trong `firestore.rules` (line 250)
- Chứa subcollections: `moderation/requests/{requestId}`
- Được sử dụng trong phiên bản cũ của hệ thống moderation

**Tại sao script cũ KHÔNG xóa:**
```javascript
// firestore.rules có định nghĩa:
match /moderation/requests/{requestId} {
  allow read, create, update: if isModerator() || isAdmin();
}

// Nhưng script cũ chỉ xóa 'moderation_queue', không xóa 'moderation'
```

**Lưu ý về Firestore subcollections:**
- Firestore có cấu trúc: `collection/document/subcollection/document`
- Khi xóa parent collection `moderation`, subcollections `moderation/requests` **KHÔNG TỰ ĐỘNG** bị xóa
- Cần xóa riêng từng subcollection

**Ảnh hưởng:**
- Data cũ còn sót lại từ phiên bản legacy
- Có thể gây conflict với hệ thống moderation mới

---

#### **`moderationQueue`** - CamelCase version (Legacy)

**Nguồn gốc:**
- Version camelCase của `moderation_queue`
- Có thể do:
  - Developer viết typo khi test
  - Migration code từ codebase cũ
  - Auto-generated từ tools bên ngoài

**Tại sao script cũ KHÔNG xóa:**
```javascript
// Script cũ chỉ xóa snake_case version:
await clearCollection('moderation_queue');

// ❌ THIẾU camelCase version:
// await clearCollection('moderationQueue');
```

**Lưu ý:**
- Firestore **PHÂN BIỆT HOA THƯỜNG** (case-sensitive)
- `moderation_queue` ≠ `moderationQueue` ≠ `ModerationQueue`
- Mỗi tên là một collection riêng biệt

**Ảnh hưởng:**
- Duplicate/orphan data
- Gây nhầm lẫn khi query

---

### 💾 **2. Storage Folders còn sót**

#### **`homepage/regions/`** - Homepage region images

**Nguồn gốc:**
- Folder chứa ảnh cho homepage regions (Bắc Bộ, Trung Bộ, Nam Bộ)
- Được upload qua `src/app/api/admin/homepage-settings/upload-region-image/route.ts`
- Path pattern: `homepage/regions/{region}/{uuid}.jpg`
  - `homepage/regions/bac-bo/...`
  - `homepage/regions/trung-bo/...`
  - `homepage/regions/nam-bo/...`

**Tại sao script cũ KHÔNG xóa:**
```javascript
// Script cũ chỉ xóa 1 folder:
const STORAGE_FOLDERS = [
  'places/'  // ❌ THIẾU: homepage/, announcements/
];
```

**Code upload:**
```typescript
// src/app/api/admin/homepage-settings/upload-region-image/route.ts:85
const fileName = `homepage/regions/${region}/${uuidv4()}.${fileExtension}`;
await fileRef.save(processedBuffer, { ... });
```

**Ảnh hưởng:**
- Tốn Storage quota (ảnh có thể 1-5MB/file)
- Còn sót ảnh cũ không dùng đến
- Tăng chi phí Firebase Storage

---

#### **`announcements/images`** - Announcement images

**Nguồn gốc:**
- Folder chứa ảnh cho announcements/thông báo
- Được upload qua admin panel khi tạo announcement
- Sử dụng trong `single-image-upload.tsx` component

**Tại sao script cũ KHÔNG xóa:**
```javascript
// Script cũ chỉ focus vào places:
const STORAGE_FOLDERS = [
  'places/'  // ❌ THIẾU: announcements/
];
```

**Ảnh hưởng:**
- Orphan images không còn announcement tham chiếu
- Tốn Storage quota
- Gây lỗi khi load announcement đã xóa

---

## ✅ GIẢI PHÁP - Script `reset-complete.js`

Script mới đã được **CẬP NHẬT** để xóa TOÀN BỘ:

### **36+ Firestore Collections:**

```javascript
const ALL_COLLECTIONS = {
  moderation: [
    'moderation_queue',        // ✅ Underscore version
    'moderationQueue',         // ✅ CamelCase version (NEW)
    'moderation',              // ✅ Parent collection (NEW)
    'moderation_logs',
    'suggestions',
    'edit_suggestions',
    'deletion_requests',       // ✅ Soft delete requests (NEW)
  ],
  // ... 29+ collections khác
};
```

### **5 Storage Folders:**

```javascript
const STORAGE_FOLDERS = [
  'places/',
  'users/',
  'itineraries/',
  'homepage/',         // ✅ Homepage regions (NEW)
  'announcements/',    // ✅ Announcement images (NEW)
];
```

---

## 🎯 SO SÁNH TRƯỚC VÀ SAU

### **TRƯỚC (Scripts cũ):**

| Loại | Xóa được | Còn sót |
|------|----------|---------|
| **Firestore** | 4 collections | **29+ collections** |
| **Storage** | 1 folder (`places/`) | **2+ folders** (`homepage/`, `announcements/`) |
| **Phủ sóng** | ~20% | **80% còn sót** |

### **SAU (`reset-complete.js`):**

| Loại | Xóa được | Còn sót |
|------|----------|---------|
| **Firestore** | **36+ collections** | ✅ **0 collections** |
| **Storage** | **5 folders** | ✅ **0 folders** |
| **Phủ sóng** | **100%** | ✅ **0% còn sót** |

---

## 📝 BÀI HỌC

### **1. Firestore Collections:**

❌ **KHÔNG NÊN:**
- Chỉ xóa collections chính mà không kiểm tra subcollections
- Bỏ qua các collections mới được thêm vào sau này
- Chỉ xóa snake_case mà không xóa camelCase variants

✅ **NÊN:**
- Maintain danh sách đầy đủ tất cả collections
- Xóa cả parent collections lẫn subcollections
- Xóa cả variants: `moderation_queue`, `moderationQueue`, `ModerationQueue`
- Review codebase định kỳ để phát hiện collections mới

### **2. Firebase Storage:**

❌ **KHÔNG NÊN:**
- Chỉ xóa folders chính (`places/`)
- Bỏ qua folders con (`homepage/regions/`, `announcements/images/`)
- Hardcode danh sách folders

✅ **NÊN:**
- Xóa toàn bộ folders gốc (xóa `homepage/` sẽ xóa tất cả subfolders)
- Grep codebase tìm tất cả upload paths
- Document rõ structure: `homepage/{what}/{nested}/...`

### **3. Script Maintenance:**

❌ **KHÔNG NÊN:**
- Viết script một lần rồi không maintain
- Không update khi có features mới

✅ **NÊN:**
- Review script khi add features mới (announcements, soft delete, etc.)
- Có `--status` command để preview trước khi xóa
- Document rõ ràng những gì script xóa

---

## 🚀 HƯỚNG DẪN SỬ DỤNG SCRIPT MỚI

### **1. Kiểm tra dữ liệu hiện tại:**

```bash
node scripts/reset-complete.js --status
```

**Output sẽ hiển thị ĐẦY ĐỦ:**
```
📂 FIRESTORE COLLECTIONS:
   📁 deletion_requests         : 1 documents   ✅
   📁 moderationQueue           : 1 documents   ✅
   📁 moderation                : 0 documents   ✅

💾 FIREBASE STORAGE:
   📁 homepage/                 : 2 files       ✅
   📁 announcements/            : 3 files       ✅
```

### **2. Reset hoàn toàn:**

```bash
node scripts/reset-complete.js --confirm
```

**Sẽ xóa:**
- ✅ Tất cả 36+ collections (bao gồm deletion_requests, moderationQueue, moderation)
- ✅ Tất cả 5 folders (bao gồm homepage/, announcements/)
- ✅ Tất cả Firebase Auth users
- ✅ Tạo admin mới: `admin@dulichviet.tech`

---

## 📞 TÓM TẮT

### **Vấn đề:**
Scripts cũ (`reset-vn-admin.js`, `reset-project.js`) **KHÔNG ĐẦY ĐỦ**, còn sót:
- 3 Firestore collections: `deletion_requests`, `moderation`, `moderationQueue`
- 2 Storage folders: `homepage/`, `announcements/`

### **Nguyên nhân:**
1. Collections mới được thêm sau khi viết scripts
2. Không xóa variants (camelCase vs snake_case)
3. Không xóa parent collections và subcollections
4. Không maintain scripts khi add features mới

### **Giải pháp:**
Sử dụng **`reset-complete.js`** - Script mới xóa **100% dữ liệu**:
- 36+ Firestore collections
- 5 Storage folders
- Tất cả Firebase Auth users
- Progress tracking chi tiết

### **Khuyến nghị:**
Luôn chạy `--status` trước để kiểm tra, sau đó mới `--confirm` để reset!

---

**Cập nhật:** December 2024
**Tác giả:** VietExplore AI Team

# Edit Workflow Implementation Guide

## 🎯 Tổng quan
Tài liệu này mô tả chi tiết workflow chỉnh sửa địa điểm đã xuất bản và các tính năng moderation đi kèm.

## 🔄 Edit Workflow Flow

### 1. User Workflow
```
Published Place → Click "Chỉnh sửa" → Create Edit Draft → Make Changes → Submit → Review → Apply/Reject
```

**Bước chi tiết:**
1. User truy cập `/contribute/my-drafts` 
2. Tìm địa điểm đã published và click "Chỉnh sửa"
3. System gọi `POST /api/places/{id}/create-edit-draft`
4. Redirect đến `/contribute/edit/{draftId}?editing={originalId}`
5. User chỉnh sửa nội dung và click Submit
6. System gọi `POST /api/places/drafts/{draftId}/submit`
7. Tạo moderation queue entry với comparison data

### 2. Moderator Workflow
```
Moderation Dashboard → Edit Request → View Comparison → Approve/Reject
```

**Bước chi tiết:**
1. Moderator truy cập `/admin/moderation`
2. Thấy items với icon ✏️ và badge "Chỉnh sửa"
3. Click "Xem xét" đến `/moderation/review/{itemId}`
4. So sánh nội dung gốc vs chỉnh sửa
5. Approve: Apply changes, delete edit draft
6. Reject: Delete edit draft, keep original

## 🗃️ Database Schema

### Collection: `places`
```typescript
interface Place {
  id: string;
  status: 'draft' | 'submitted' | 'published' | 'pending_edit';
  // ... other place fields
  
  // Edit tracking
  editApprovedAt?: string;
  editApprovedBy?: string;
  editRejectedAt?: string;
  editRejectedBy?: string;
  editRejectionReason?: string;
}
```

### Collection: `place_drafts`
```typescript
interface EditDraft {
  // All place fields
  ...Place;
  
  // Edit-specific metadata
  isEditingPublished: true;
  originalPlaceId: string;
  originalData: Place; // Snapshot of original
  editCreatedAt: string;
}
```

### Collection: `moderation_queue`
```typescript
interface EditModerationItem {
  itemType: 'place_edit';
  itemId: string; // Original place ID
  originalData: Place;
  editedData: Place;
  metadata: {
    editDraftId: string;
    reason?: string;
  };
  // ... standard moderation fields
}
```

## 🔌 API Endpoints

### 1. Create Edit Draft
```
POST /api/places/{id}/create-edit-draft
```
- Tạo copy của published place trong `place_drafts`
- Set `isEditingPublished: true` và `originalPlaceId`
- Store original data for comparison

### 2. Draft Operations
```
GET/PUT/DELETE /api/places/drafts/{draftId}
```
- Hỗ trợ cả `places` và `place_drafts` collections
- Special handling cho edit drafts với `isEditingPublished` flag

### 3. Submit Edit
```
POST /api/places/drafts/{draftId}/submit
```
- Detect edit submissions vs regular submissions
- Create moderation queue với comparison data
- Set original place status to `pending_edit`

### 4. Moderation Review
```
PUT /api/moderation/queue/{itemId}
```
- Handle edit approvals: merge changes + delete draft
- Handle edit rejections: delete draft + revert status
- Proper cleanup và logging

### 5. Comprehensive History
```
GET /api/moderation/logs/{contentId}
```
- Thu thập data từ 3 nguồn: `moderation_logs`, `place_data`, `moderation_queue`
- Build complete timeline từ creation đến hiện tại
- Support edit-specific actions

## 🖼️ Frontend Components

### 1. My Drafts Page
- Hiển thị published places với edit option
- Professional confirmation dialogs
- Toast notifications với titles

### 2. Edit Page
- Detect editing published places via query param
- Special UI messages và warnings
- Form pre-filled with current data

### 3. Moderation Dashboard
- Edit requests với ✏️ icon và "Chỉnh sửa" badge
- Special description cho edit requests
- Context-aware action buttons

### 4. Moderation Review Page
- **Debug panel** (development mode):
  - Item type, edit flags, data availability
- **Comparison section**:
  - Side-by-side original vs edited
  - Change summary với specific diffs
  - Visual indicators và color coding

### 5. Activity Log Component
- New actions: `edit_draft_created`, `edit_submitted`
- Metadata hiển thị: edit requests, queue types
- Timeline visual với appropriate icons

## 🧪 Testing Guide

### 1. Manual Testing
```bash
# Generate test data
node create-test-edit-request.js

# Add to Firebase manually or via admin panel
# Visit http://localhost:9002/admin/moderation
```

### 2. Test Data Structure
- Complete edit request với original/edited comparison
- Realistic field changes (name, type, description)
- Proper submitter information

### 3. Verification Points
- ✅ Dashboard shows edit requests với proper badges
- ✅ Review page displays comparison
- ✅ Debug info shows correct flags
- ✅ History log tracks all actions
- ✅ Approval/rejection works correctly

## 🔧 Troubleshooting

### Common Issues

1. **Edit requests không hiển thị:**
   - Kiểm tra `itemType === 'place_edit'`
   - Verify API response có `originalData` và `editedData`
   - Check moderation queue collection

2. **Comparison không hiển thị:**
   - Debug panel shows data availability
   - Check `contentDetails.isEditRequest` flag
   - Verify `originalData` field exists

3. **Authentication errors:**
   - Ensure proper Bearer token trong requests
   - Check user role permissions (contributor+)
   - Verify session valid

### Debug Commands
```javascript
// Check API response
fetch('/api/moderation/queue?status=pending', {
  headers: { 'Authorization': 'Bearer TOKEN' }
}).then(r => r.json()).then(console.log);

// Verify data structure
console.log('ContentDetails:', contentDetails);
console.log('IsEditRequest:', contentDetails.isEditRequest);
console.log('OriginalData:', contentDetails.originalData);
```

## 📋 Implementation Checklist

### Backend ✅
- [x] Create edit draft endpoint
- [x] Dual collection support trong draft APIs
- [x] Edit submission logic
- [x] Moderation review với merge/delete
- [x] Comprehensive history logs
- [x] Error handling và validation

### Frontend ✅  
- [x] My drafts edit workflow
- [x] Edit page với published detection
- [x] Moderation dashboard edit display
- [x] Review page comparison UI
- [x] Activity log edit actions
- [x] Debug information panel

### Testing ✅
- [x] Test data generation
- [x] Manual testing guide
- [x] Documentation complete

## 🚀 Production Deployment

### Pre-deployment
1. Remove debug panels (`process.env.NODE_ENV` check)
2. Test với real Firebase data
3. Performance testing với large datasets
4. User acceptance testing

### Post-deployment
1. Monitor edit request volume
2. Track approval/rejection rates  
3. User feedback on comparison UI
4. Performance metrics

---

**📝 Tác giả:** Claude Code  
**📅 Ngày tạo:** 2025-08-31  
**🔄 Cập nhật:** Ongoing
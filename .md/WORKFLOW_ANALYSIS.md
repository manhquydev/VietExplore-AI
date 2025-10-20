# 🔍 PHÂN TÍCH WORKFLOW HIỆN TẠI VÀ VẤN ĐỀ CẦN KHẮC PHỤC

## 🚨 VẤN ĐỀ ĐƯỢC XÁC ĐỊNH

### 1. **Logic Lỗi: Địa điểm "Chờ duyệt chỉnh sửa"**
**Vấn đề:** Địa điểm đã published → User request edit → Status thành "pending_edit" → Nhưng user không thể thấy địa điểm trên site nữa

**Logic đúng should be:**
- Địa điểm vẫn HIỂN THỊ phiên bản gốc cho public
- Chỉ admin/moderator thấy có edit request pending
- Khi approve edit → Update địa điểm với new content
- Khi reject edit → Giữ nguyên địa điểm gốc

### 2. **UI/UX Lỗi: Admin không thấy edit requests**
**Vấn đề:** 
- Admin/moderator vào `/admin/moderation` không thấy edit requests
- Địa điểm "pending_edit" không appear trong queue properly
- Thiếu workflow cho deletion requests

### 3. **Missing Workflow: Community Interactions**
**Vấn đề:** Thiếu hoàn toàn 2 tính năng quan trọng:

**a) Góp ý (Suggestions):**
- User xem địa điểm → Click "Góp ý" → Gửi suggestion
- Notification đến author → Author có thể accept/ignore
- Author tự quyết định chỉnh sửa

**b) Báo cáo (Reports):**  
- User xem địa điểm → Click "Báo cáo" → Gửi report
- Report vào moderation queue → Moderator xử lý
- Có thể dẫn đến warning/suspension/deletion

## 📊 CURRENT STATE vs DESIRED STATE

### Current Implementation Issues

#### Database State Problems:
```
❌ WRONG:
published_place → edit_request → status="pending_edit" → INVISIBLE to users

✅ CORRECT:  
published_place → status="published" (unchanged) 
edit_request → separate queue → admin sees both original + edit
```

#### Moderation Queue Problems:
```
❌ CURRENT: Edit requests không hiển thị properly
❌ CURRENT: Thiếu deletion requests workflow  
❌ CURRENT: Không có reports/suggestions workflow
```

## 🎯 WORKFLOW REQUIREMENTS - EXPERT ANALYSIS

### Core Business Logic Requirements:

#### 1. **Content Lifecycle Management**
- **Published content** must remain STABLE and VISIBLE
- **Edit requests** should NOT affect published visibility
- **Version control** approach: published version + pending changes
- **Rollback capability** if edit is rejected

#### 2. **Moderation Queue Architecture**  
```
┌─ Regular Content Queue (new submissions)
├─ Edit Request Queue (changes to published content)  
├─ Deletion Request Queue (removal requests)
├─ Report Queue (community reports)
└─ Suggestion Queue (community feedback)
```

#### 3. **User Permission Matrix**
```
Regular User: View, Suggest, Report
Content Author: Edit own content, Delete own content  
Contributor: Create content, Edit own published content
Moderator: Review all queues, Approve/Reject
Admin: Full access, System management
```

#### 4. **Community Interaction Workflow**

**Suggestions Flow:**
```
User views place → "Góp ý" button → Suggestion form → 
Notification to Author → Author decides → 
Optional: Author makes edit → Edit goes through moderation
```

**Reports Flow:**
```
User views place → "Báo cáo" button → Report form →
Moderation queue → Moderator review →  
Actions: Warning/Edit/Delete/No action
```

## 🏗️ TECHNICAL ARCHITECTURE NEEDED

### Database Schema Updates:

#### New Collections:
```typescript
// Suggestions từ community
interface Suggestion {
  id: string;
  placeId: string;
  suggestedBy: string;
  suggestion: string;
  category: 'content' | 'location' | 'images' | 'other';
  status: 'pending' | 'accepted' | 'ignored';
  authorResponse?: string;
  createdAt: string;
}

// Reports từ community  
interface Report {
  id: string;
  placeId: string;
  reportedBy: string;
  reason: 'inappropriate' | 'incorrect' | 'spam' | 'copyright' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  moderatorNotes?: string;
  resolution?: string;
  createdAt: string;
}

// Enhanced Moderation Queue
interface ModerationItem {
  // Existing fields...
  
  // New queue types
  queueType: 'content_review' | 'edit_request' | 'delete_request' | 'report_review';
  
  // Enhanced metadata
  metadata: {
    originalContent?: any;
    suggestedChanges?: any;
    reportReason?: string;
    communityImpact?: 'low' | 'medium' | 'high';
  };
}
```

#### Updated Place Schema:
```typescript
interface Place {
  // Existing fields...
  
  // Community interaction stats
  stats: {
    suggestions: number;
    reports: number;
    lastSuggestionAt?: string;
    lastReportAt?: string;
  };
  
  // Edit state management
  editState?: {
    hasPendingEdit: boolean;
    editRequestId?: string;
    editSubmittedAt?: string;
    editSubmittedBy?: string;
  };
}
```

### API Endpoints Needed:

#### Community Interactions:
```
POST /api/places/{id}/suggest - Submit suggestion
GET /api/places/{id}/suggestions - Get suggestions (author only)
PUT /api/suggestions/{id}/respond - Author response

POST /api/places/{id}/report - Submit report  
GET /api/admin/reports - Get reports (moderator only)
PUT /api/admin/reports/{id}/resolve - Resolve report
```

#### Enhanced Moderation:
```
GET /api/moderation/queue?type=edit_requests
GET /api/moderation/queue?type=delete_requests  
GET /api/moderation/queue?type=reports
```

## 🎨 UI/UX REQUIREMENTS

### 1. **Public Place View Enhancements**
- "Góp ý" button → Suggestion modal
- "Báo cáo" button → Report modal
- Author sees suggestion notifications

### 2. **Author Dashboard**
- Pending suggestions section
- Edit request status tracking  
- Community feedback summary

### 3. **Admin Moderation Dashboard**
- Separate tabs/sections for each queue type:
  - 📝 New Content
  - ✏️ Edit Requests  
  - 🗑️ Delete Requests
  - ⚠️ Reports
  - 💡 Escalated Suggestions
- Enhanced filtering and search
- Bulk actions capability

### 4. **Edit Request Workflow**
- Clear status indicators
- Side-by-side comparison  
- Community context (suggestions that led to edit)
- Impact assessment

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: Fix Current Edit Logic ⚠️ URGENT
1. Keep published places visible during edit review
2. Fix moderation queue display for edit requests
3. Proper status management

### Phase 2: Community Features 🎯 HIGH PRIORITY  
1. Suggestion system implementation
2. Report system implementation
3. Author notification system

### Phase 3: Enhanced Moderation 📊 MEDIUM PRIORITY
1. Queue type segregation
2. Advanced filtering and search
3. Analytics and reporting

### Phase 4: Advanced Features 🚀 FUTURE
1. Automated moderation rules
2. Community voting systems
3. Reputation management

## 🔧 TECHNICAL DEBT TO ADDRESS

1. **Inconsistent status management** across places/drafts
2. **Missing transaction handling** for complex operations
3. **No rollback mechanisms** for failed operations  
4. **Insufficient logging** for audit trails
5. **No rate limiting** for community interactions
6. **Missing notification system** infrastructure

---

**⚡ NEXT STEPS:** Cần approval cho approach này trước khi implement để đảm bảo alignment với business requirements.
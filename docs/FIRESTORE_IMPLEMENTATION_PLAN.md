# Firestore Data Model Implementation Plan

## 📋 Phân tích Tài liệu 2: Firestore Data Model & Security Rules

### 🎯 **Mục tiêu:** Triển khai schema dữ liệu Firestore và Security Rules chi tiết cho giai đoạn 1

---

## 📊 **Gap Analysis: Current vs Required**

### ✅ **Đã có (từ Tài liệu 1)**
- [x] Basic user profile structure
- [x] Role-based security rules foundation
- [x] Email verification enforcement
- [x] Custom claims integration

### 🔄 **Cần triển khai (từ Tài liệu 2)**

| Collection | Schema Status | Rules Status | Priority |
|------------|---------------|--------------|----------|
| `users/{uid}` | ✅ Basic → 🔄 **Enhance** | ✅ Done | HIGH |
| `places/{placeId}` | ❌ **Missing** | ❌ **Missing** | HIGH |
| `placeDrafts/{draftId}` | ❌ **Missing** | ❌ **Missing** | HIGH |
| `itineraries/{itineraryId}` | ❌ **Missing** | ❌ **Missing** | HIGH |
| `itineraryShares/{shareId}` | ❌ **Missing** | ❌ **Missing** | MEDIUM |
| `suggestions/{suggestionId}` | ❌ **Missing** | ❌ **Missing** | MEDIUM |
| `reports/{reportId}` | ❌ **Missing** | ❌ **Missing** | MEDIUM |
| `partners/{partnerId}` | ❌ **Missing** | ❌ **Missing** | LOW |
| `moderation/requests/{requestId}` | ❌ **Missing** | ❌ **Missing** | HIGH |
| `labels/{labelId}` | ❌ **Missing** | ❌ **Missing** | LOW |
| `audits/{auditId}` | ✅ Basic | ✅ Done | MEDIUM |
| `system/counters/{counterId}` | ❌ **Missing** | ❌ **Missing** | LOW |

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Core Collections (Week 1)**

#### 1.1 Enhanced Users Schema
```typescript
interface UserProfile {
  // Current fields (✅ done)
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';
  verifiedContributor: boolean;
  partnerId: string | null;
  disabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // NEW fields needed
  consent: {
    privacyAcceptedAt: Timestamp;
    marketing: boolean;
  };
  stats?: {
    placesCreated: number;
    itinerariesPublic: number;
    contributionScore: number;
  };
}
```

#### 1.2 Places Collection
```typescript
interface Place {
  name: string;              // 50-120 ký tự
  slug: string;              // không dấu, duy nhất
  region: 'bac-bo' | 'trung-bo' | 'nam-bo';
  province: string;          // ví dụ: "ha-noi"
  type: 'bien' | 'nui' | 'van-hoa' | 'am-thuc' | 'check-in';
  description: string;       // 100-1200 từ (lean: 80-400 từ)
  photos: Array<{
    path: string;
    width: number;
    height: number;
    credit: string;
  }>;
  sources: string[];         // link/nguồn tham khảo
  trustLabel: 'community' | 'contributor' | 'partner' | 'verified';
  createdBy: string;         // uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'published' | 'hidden';
}
```

#### 1.3 Place Drafts Collection
```typescript
interface PlaceDraft {
  title: string;
  region: 'bac-bo' | 'trung-bo' | 'nam-bo';
  province: string;
  type: 'bien' | 'nui' | 'van-hoa' | 'am-thuc' | 'check-in';
  description: string;
  photos: Array<{
    path: string;
    width: number;
    height: number;
    credit: string;
  }>;
  sources: string[];
  submitter: string;         // uid
  submitterRole: 'traveler' | 'contributor' | 'partner';
  status: 'draft' | 'submitted' | 'in_review' | 'changes_requested' | 'approved' | 'published' | 'rejected';
  linkedPlaceId: string | null;
  moderationNotes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **Phase 2: User Content (Week 2)**

#### 2.1 Itineraries Collection
#### 2.2 Itinerary Shares
#### 2.3 Suggestions (Edit proposals)

### **Phase 3: Moderation System (Week 3)**

#### 3.1 Reports Collection
#### 3.2 Moderation Requests
#### 3.3 Enhanced Audit Logging

### **Phase 4: System Collections (Week 4)**

#### 4.1 Partners Management
#### 4.2 Labels System
#### 4.3 System Counters

---

## 🔧 **Technical Implementation Tasks**

### **Immediate Actions (Today)**

1. **Update Firestore Rules** với detailed schema từ Tài liệu 2
2. **Create TypeScript interfaces** cho tất cả collections
3. **Setup Firestore Indexes** theo khuyến nghị
4. **Create helper functions** cho data validation
5. **Update existing Security Rules** với advanced logic

### **This Week**

1. **Cloud Functions cho Places workflow**
   - `createPlaceDraft` - Tạo bản nháp
   - `updatePlaceDraft` - Chỉnh sửa bản nháp
   - `publishPlace` - Moderator publish place
   - `generateSlug` - Auto-generate unique slug

2. **Cloud Functions cho Itineraries**
   - `createItinerary` - Tạo lịch trình
   - `shareItinerary` - Tạo link chia sẻ
   - `duplicateItinerary` - Sao chép lịch trình

3. **Advanced Security Rules**
   - Slug uniqueness validation
   - Content length validation
   - File upload restrictions
   - Rate limiting per user

---

## 📈 **Performance Optimizations**

### **Firestore Indexes (Critical)**
```json
{
  "indexes": [
    {
      "collectionGroup": "places",
      "queryScope": "COLLECTION", 
      "fields": [
        {"fieldPath": "region", "order": "ASCENDING"},
        {"fieldPath": "province", "order": "ASCENDING"},
        {"fieldPath": "type", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "placeDrafts",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "submitter", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "updatedAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "requests",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "priority", "order": "DESCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ]
}
```

---

## 🧪 **Testing Strategy**

### **Data Validation Tests**
- Schema compliance testing
- Field validation rules
- Required field enforcement
- Data type validation

### **Security Rules Tests**
- Role-based access testing
- Owner permission verification
- Email verification enforcement
- Cross-collection permission checks

### **Integration Tests**
- Complete workflow testing (draft → review → publish)
- Multi-user scenario testing
- Performance testing với large datasets

---

## 📅 **Implementation Timeline**

### **Week 1: Foundation**
- [ ] Day 1-2: Update Security Rules với detailed schema
- [ ] Day 3-4: Create TypeScript interfaces và validation
- [ ] Day 5-7: Implement core Cloud Functions (Places workflow)

### **Week 2: User Content**
- [ ] Day 1-3: Itineraries collection và functions
- [ ] Day 4-5: Sharing mechanism
- [ ] Day 6-7: Suggestions system

### **Week 3: Moderation**
- [ ] Day 1-3: Reports và moderation workflow
- [ ] Day 4-5: Advanced audit logging
- [ ] Day 6-7: Performance optimization

### **Week 4: System Features**
- [ ] Day 1-2: Partners management
- [ ] Day 3-4: Labels system
- [ ] Day 5-7: System counters và analytics

---

## ⚠️ **Critical Dependencies**

### **Before Starting Phase 1:**
1. ✅ Firebase Auth implementation (DONE)
2. ✅ Basic security rules (DONE)
3. ✅ Testing framework (DONE)
4. 🔄 **Environment variables setup**
5. 🔄 **Firebase Console configuration**

### **Required for Each Phase:**
1. **Schema validation** - Strict TypeScript interfaces
2. **Security rules testing** - Comprehensive permission tests
3. **Performance monitoring** - Query optimization
4. **Data migration** - Safe schema updates

---

## 🎯 **Success Criteria**

### **Phase 1 Complete When:**
- [ ] All core collections implemented với full schema
- [ ] Security rules pass all test scenarios
- [ ] Cloud Functions deployed và functional
- [ ] Frontend có thể create/read places và drafts

### **Full Implementation Complete When:**
- [ ] All 11 collections implemented
- [ ] Complete moderation workflow functional
- [ ] Performance targets met (< 2s query time)
- [ ] 100% security rules test coverage
- [ ] Production deployment successful

---

## 🚨 **Risk Mitigation**

### **Data Migration Risks**
- **Solution:** Implement schema versioning
- **Backup:** Daily Firestore exports
- **Testing:** Extensive staging environment testing

### **Performance Risks** 
- **Solution:** Implement proper indexing strategy
- **Monitoring:** Query performance tracking
- **Optimization:** Pagination và lazy loading

### **Security Risks**
- **Solution:** Comprehensive rules testing
- **Audit:** All permission changes logged
- **Monitoring:** Suspicious activity detection


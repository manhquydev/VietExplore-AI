# **IMPLEMENTATION CHECKLIST - DỰ ÁN DU LỊCH VIỆT**
## **Checklist Đối chiếu với Tài liệu Quy trình Quản lý Địa điểm**
---

## **📊 BẢNG TỔNG HỢP TRẠNG THÁI**

| Module | Tổng items | Hoàn thành | Đang làm | Chưa làm | Ghi chú |
|--------|------------|------------|----------|----------|---------|
| **1. Roles & Permissions** | 12 | ___ | ___ | ___ | |
| **2. Luồng Xử lý Địa điểm** | 28 | ___ | ___ | ___ | |
| **3. Quy trình Kiểm duyệt** | 18 | ___ | ___ | ___ | |
| **4. Tương tác Cộng đồng** | 14 | ___ | ___ | ___ | |
| **5. Notification System** | 10 | ___ | ___ | ___ | |
| **6. Technical Architecture** | 22 | ___ | ___ | ___ | |
| **7. Performance & Security** | 15 | ___ | ___ | ___ | |
| **TỔNG CỘNG** | **119** | ___ | ___ | ___ | |

**Chú thích:** ✅ Hoàn thành | 🔄 Đang thực hiện | ❌ Chưa bắt đầu | ⚠️ Cần sửa | 🚫 Không áp dụng

---

## **1. ROLES & PERMISSIONS (Theo Mục 1.2)**

### **1.1 Thiết lập 6 Vai trò**
- [ ] **Guest**: Chỉ xem, không góp ý/báo cáo
- [ ] **Traveler**: Xem + Góp ý/Báo cáo (cần đăng nhập)
- [ ] **Contributor**: Xem + Góp ý/Báo cáo + Đăng địa điểm (cần duyệt)
- [ ] **Community Partner**: Xem + Góp ý/Báo cáo + Đăng địa điểm (cần duyệt)
- [ ] **Moderator**: Xem + Góp ý/Báo cáo + Kiểm duyệt (KHÔNG đăng địa điểm)
- [ ] **Admin**: Full quyền + Đăng địa điểm (tự động duyệt)

### **1.2 Validation Quyền hạn Đặc biệt**
- [ ] **Moderator KHÔNG THỂ tạo địa điểm** (validate ở backend)
- [ ] **Admin tạo địa điểm TỰ ĐỘNG DUYỆT** (skip moderation flow)
- [ ] **Chỉ Contributor/Partner được đăng địa điểm** (cần kiểm duyệt)
- [ ] **Guest không thể góp ý/báo cáo** (cần đăng nhập)
- [ ] **Moderator có quyền quản trị "một phần"** (define rõ phần nào)
- [ ] **Admin có toàn quyền quản trị**

---

## **2. LUỒNG XỬ LÝ ĐỊA ĐIỂM (Theo Mục II)**

### **2.1 Khởi tạo Địa điểm - Contributor/Partner (Mục 2.1.1)**
- [ ] Form data validate tại **Vercel Edge Function**
- [ ] Lưu Firestore với trạng thái **"Bản nháp"**
- [ ] Upload media files lên **Firebase Storage**
- [ ] Action: **Lưu nháp** (tiếp tục chỉnh sửa sau)
- [ ] Action: **Hủy bỏ** (xóa vĩnh viễn bản nháp)
- [ ] Action: **Gửi kiểm duyệt** (chuyển sang "Chờ kiểm duyệt")

### **2.2 Khởi tạo Địa điểm - Admin (Mục 2.1.2)**
- [ ] **Skip validation** tại Edge Function
- [ ] Direct write Firestore với status **"Đã duyệt"**
- [ ] **Trigger ISR rebuild** để update static pages ngay

### **2.3 Pool và Claim (Mục 2.2.1)**
- [ ] API Route Vercel nhận request kiểm duyệt
- [ ] Write Firestore status **"Chờ kiểm duyệt"**
- [ ] Firebase Realtime Database push notification cho Moderators online
- [ ] Moderator dashboard hiển thị realtime địa điểm mới
- [ ] Moderator **CLAIM** qua Vercel API (Firestore transaction atomic)
- [ ] Dashboard cache với **stale-while-revalidate**
- [ ] WebSocket qua Vercel Edge (lower latency)
- [ ] Claim action qua Edge Function (respond nhanh)

### **2.4 Quyết định Kiểm duyệt (Mục 2.2.2)**
- [ ] **Chấp thuận**: Update status "Đã duyệt" + Trigger ISR + Clear CDN cache + Push notification
- [ ] **Yêu cầu sửa**: Update status + Send notification (không affect cache)
- [ ] **Từ chối**: Mark rejected + Archive data + No cache invalidation

### **2.5 Chỉnh sửa Địa điểm Đã duyệt (Mục 2.3)**
- [ ] Create **draft version** trong Firestore
- [ ] **Vercel Preview URL** cho draft (chỉ authorized users)
- [ ] **Public version vẫn served từ CDN** (không bị ảnh hưởng)
- [ ] Sau approve: trigger ISR revalidation
- [ ] Revalidate strategy: `/place/${placeId}` on approval
- [ ] Category pages: revalidate 60s stale time
- [ ] Search index: background revalidation

### **2.6 Xóa Địa điểm (Mục 2.4)**
- [ ] Mark **deleted** trong Firestore
- [ ] **Immediate cache purge** qua Vercel API
- [ ] Return **404** for deleted places
- [ ] **Keep data for audit trail** (không xóa thật)

---

## **3. QUY TRÌNH KIỂM DUYỆT (Theo Mục 2.2)**

### **3.1 Cơ chế Pool Chung**
- [ ] **KHÔNG có auto-assign** cho Moderator
- [ ] Tất cả pending items vào **pool chung**
- [ ] Moderators tự chọn items để claim
- [ ] **Lock item khi claimed** (tránh duplicate)
- [ ] **Auto-release sau timeout** (nếu không xử lý)

### **3.2 Quy tắc Claim (Inferred from doc)**
- [ ] Giới hạn số items per moderator
- [ ] Deadline tracking cho mỗi claimed item
- [ ] Manual release option nếu cần
- [ ] Hiển thị ai đã claim item

### **3.3 Trạng thái Địa điểm**
- [ ] **Bản nháp** (Draft)
- [ ] **Chờ kiểm duyệt** (Pending Review)
- [ ] **Đang kiểm duyệt** (In Review - sau khi claim)
- [ ] **Đã duyệt** (Approved)
- [ ] **Bị từ chối** (Rejected)
- [ ] **Yêu cầu chỉnh sửa** (Revision Required)
- [ ] **Tạm đình chỉ** (Suspended - by Moderator)
- [ ] **Đã xóa** (Deleted - soft delete)

---

## **4. TƯƠNG TÁC CỘNG ĐỒNG (Theo Mục III)**

### **4.1 Hệ thống Góp ý (Mục 3.1)**
- [ ] Rate limiting với **Vercel Edge Middleware**
- [ ] Config matcher: `/api/feedback/*`
- [ ] Limit: **3 góp ý/user/place/week**
- [ ] Sử dụng **Vercel KV hoặc Upstash Redis** cho rate limit
- [ ] Góp ý gửi trực tiếp cho owner địa điểm
- [ ] Owner có thể apply góp ý (trigger edit flow)

### **4.2 Hệ thống Báo cáo (Mục 3.2)**
- [ ] **High priority reports** xử lý tại edge
- [ ] **Auto-escalation logic** trong Edge Function
- [ ] **Webhook alert** Moderators cho urgent cases
- [ ] Priority based on category (safety > incorrect info > inappropriate > spam > other)

---

## **5. NOTIFICATION SYSTEM (Theo Mục IV)**

### **5.1 Real-time Notifications (Firebase Realtime Database)**
- [ ] Instant notifications cho **logged-in users**
- [ ] **Presence tracking** (online/offline status)
- [ ] **Unread count sync** real-time

### **5.2 Edge-based Notifications (Vercel)**
- [ ] **Email queuing** với background functions
- [ ] SMS integration (marked as future)
- [ ] **Push notification scheduling**

### **5.3 Implementation Pattern**
- [ ] Write notification to Firebase: `/notifications/${userId}`
- [ ] Queue immediate email nếu priority **HIGH** (Vercel Cron)
- [ ] Trigger webhook for mobile push
- [ ] Notification data structure với priority levels

---

## **6. TECHNICAL ARCHITECTURE (Theo Mục 1.3 & V-XII)**

### **6.1 Vercel Setup**
- [ ] **Vercel Hosting** với global edge network
- [ ] **Edge Functions** cho auth và validation
- [ ] **ISR** cho địa điểm phổ biến
- [ ] **Preview Deployments** cho testing
- [ ] **Automatic CI/CD** từ Git
- [ ] Regions config: **sin1, hkg1** (gần Việt Nam)
- [ ] Runtime: **edge** cho performance

### **6.2 Firebase Setup**
- [ ] **Firestore Database** cho structured data
- [ ] **Firebase Storage** cho images/media
- [ ] **Realtime Database** cho notifications
- [ ] **Firebase Authentication** cho user auth
- [ ] Security rules configured
- [ ] Composite indexes created

### **6.3 Caching Strategy (Mục 5.1)**
- [ ] Popular places: **Full SSG với revalidation**
- [ ] Category pages: **ISR với 60s revalidate**
- [ ] Search results: **Client-side với SWR**
- [ ] Cache headers configuration

### **6.4 Image Optimization (Mục 5.2)**
- [ ] Vercel: **Auto format conversion** (WebP/AVIF)
- [ ] Vercel: **Responsive sizing on-demand**
- [ ] Vercel: **Lazy loading với blur placeholder**
- [ ] Firebase Storage: **Original images backup**

### **6.5 Deployment (Mục 6.1)**
- [ ] Branch **main**: Production
- [ ] Branch **develop**: Staging với preview URL
- [ ] Feature branches: **Auto preview deployments**
- [ ] Environment variables configured in Vercel Dashboard

---

## **7. PERFORMANCE & SECURITY**

### **7.1 Security Implementation (Mục VII)**
- [ ] **DDoS protection** at edge
- [ ] **Rate limiting** với Edge Middleware
- [ ] **IP blocking** cho suspicious activity
- [ ] **Token verification** in middleware
- [ ] API endpoint protection với auth

### **7.2 Monitoring (Mục 6.2)**
- [ ] **Vercel Analytics**: Web Vitals, Edge performance
- [ ] **Firebase Monitoring**: Database, Storage, Auth metrics
- [ ] Error tracking setup
- [ ] Performance benchmarks

### **7.3 Optimization (Mục IX)**
- [ ] Optimize Edge Function execution time
- [ ] Use **ISR instead of SSR** where possible
- [ ] Proper cache headers
- [ ] **Batch writes** để giảm Firebase operations
- [ ] Compress images trước khi upload
- [ ] Archive old data định kỳ

### **7.4 Disaster Recovery (Mục VIII)**
- [ ] **Vercel**: Automatic deployment rollback
- [ ] **Firebase**: Daily automated backups
- [ ] **Git**: Full code history
- [ ] Incident response plan documented

### **7.5 Future Enhancements (Mục X)**
- [ ] Plan for **Edge Config** (dynamic config)
- [ ] Plan for **Cron Jobs** (scheduled tasks)
- [ ] Plan for **Split Testing** (A/B tests)
- [ ] Plan for **Geolocation** routing

---

## **📋 VALIDATION CHECKLIST**

### **Critical Requirements từ Tài liệu:**

| Yêu cầu | Location in Doc | Status | Notes |
|---------|-----------------|--------|-------|
| Moderator KHÔNG được tạo địa điểm | Mục 1.2 | [ ] | Must validate in backend |
| Admin tạo địa điểm TỰ ĐỘNG duyệt | Mục 2.1.2 | [ ] | Skip moderation flow |
| Pool chung, không auto-assign | Mục 2.2.1 | [ ] | Moderator tự claim |
| Version cũ hiển thị khi đang sửa | Mục 2.3.1 | [ ] | Public version từ CDN |
| Edge Function validate form | Mục 2.1.1 | [ ] | Faster response |
| ISR trigger sau approve | Mục 2.2.2 | [ ] | Update static pages |
| Rate limit 3 góp ý/user/place/week | Mục 3.1.1 | [ ] | Use Vercel KV/Redis |
| Regions sin1, hkg1 | Mục 5.1.2 | [ ] | Gần Việt Nam |

---

## **📝 HƯỚNG DẪN SỬ DỤNG**

### **Cách đánh giá:**
1. **Check từng item** theo implementation thực tế
2. **Đánh dấu status**: ✅ Done | 🔄 In Progress | ❌ Not Started | ⚠️ Issue
3. **Ghi chú** vào cột Notes nếu có vấn đề hoặc deviation
4. **Update tổng hợp** ở bảng đầu tiên

### **Priority Order:**
1. **P0**: Authentication & Roles (blocking everything)
2. **P1**: Basic CRUD địa điểm + Status flow
3. **P2**: Pool & Claim mechanism
4. **P3**: Notifications & Community features
5. **P4**: Optimization & Monitoring

### **Definition of Done cho mỗi item:**
- Code implemented
- Backend validation
- Frontend UI
- Error handling
- Testing coverage
- Documentation

---

---

# **Tài liệu Quy trình Quản lý Địa điểm
*Đã cập nhật với Vercel Deployment*

## **I. TỔNG QUAN HỆ THỐNG**

### **1.1 Mục tiêu và Nguyên tắc**
Hệ thống quản lý địa điểm Du Lịch Việt được xây dựng trên ba nguyên tắc cốt lõi: đảm bảo chất lượng nội dung thông qua kiểm duyệt chặt chẽ, khuyến khích sự tham gia tích cực của cộng đồng, và duy trì tính minh bạch trong mọi quy trình xử lý.

### **1.2 Ma trận Phân quyền**

| Vai trò | Xem | Góp ý/Báo cáo | Đăng địa điểm | Kiểm duyệt | Quản trị |
|---------|-----|---------------|---------------|------------|----------|
| **Guest** | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Traveler** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Contributor** | ✓ | ✓ | ✓ (cần duyệt) | ✗ | ✗ |
| **Community Partner** | ✓ | ✓ | ✓ (cần duyệt) | ✗ | ✗ |
| **Moderator** | ✓ | ✓ | ✗ | ✓ | Một phần |
| **Admin** | ✓ | ✓ | ✓ (tự động duyệt) | ✓ | ✓ |

### **1.3 Kiến trúc Công nghệ Hybrid**

Hệ thống sử dụng kiến trúc **Vercel + Firebase** kết hợp:

**Frontend & Hosting (Vercel):**
- **Vercel Hosting**: Deploy frontend application với global edge network
- **Edge Functions**: Xử lý authentication và validation tại edge locations
- **ISR (Incremental Static Regeneration)**: Tối ưu rendering cho địa điểm phổ biến
- **Preview Deployments**: Test changes trước khi production
- **Automatic CI/CD**: Deploy tự động từ Git repository

**Backend Services (Firebase):**
- **Firestore Database**: Lưu trữ structured data với real-time sync
- **Firebase Storage**: Quản lý images và media files
- **Realtime Database**: Hệ thống notification và presence tracking
- **Firebase Authentication**: Xác thực và phân quyền người dùng

**Integration Architecture:**
```
User → Vercel CDN → Next.js App → API Routes → Firebase Services
         ↓                            ↓
    Edge Functions            Vercel Serverless Functions
```

## **II. LUỒNG XỬ LÝ ĐỊA ĐIỂM**

### **2.1 Khởi tạo Địa điểm**

#### **2.1.1 Người đăng: Contributor/Community Partner**
Quá trình bắt đầu khi người dùng tạo địa điểm mới:
1. Form data được validate tại **Vercel Edge Function** (faster response)
2. Lưu vào Firestore với trạng thái "Bản nháp"
3. Media files upload trực tiếp lên Firebase Storage
4. Ba hành động khả dụng:
   - **Lưu nháp**: Giữ lại để tiếp tục chỉnh sửa
   - **Hủy bỏ**: Xóa vĩnh viễn bản nháp
   - **Gửi kiểm duyệt**: Chuyển sang trạng thái "Chờ kiểm duyệt"

#### **2.1.2 Người đăng: Admin**
Admin tạo địa điểm với quy trình đặc biệt:
- Skip validation tại Edge Function
- Direct write vào Firestore với status "Đã duyệt"
- Trigger ISR rebuild để update static pages ngay

### **2.2 Quy trình Kiểm duyệt**

#### **2.2.1 Cơ chế Pool và Claim**
Khi địa điểm được gửi kiểcó m duyệt:

1. **API Route** trên Vercel nhận request
2. Write vào Firestore với status "Chờ kiểm duyệt"
3. **Firebase Realtime Database** push notification đến Moderators online
4. Moderator dashboard (realtime subscription) hiển thị địa điểm mới
5. Moderator **claim** qua Vercel API → Firestore transaction đảm bảo atomic

**Optimizations với Vercel:**
- Dashboard được cache với `stale-while-revalidate`
- WebSocket connection qua Vercel Edge cho lower latency
- Claim action qua Edge Function để respond nhanh hơn

#### **2.2.2 Quyết định Kiểm duyệt**

**a) Chấp thuận**
- Update Firestore status → "Đã duyệt"
- **Trigger ISR revalidation** cho related pages
- Clear CDN cache cho category pages
- Push notification qua Realtime Database

**b) Yêu cầu chỉnh sửa**
- Update status trong Firestore
- Send notification với Edge Function
- Không affect cached pages (vì chưa public)

**c) Từ chối**
- Mark as rejected trong Firestore
- Archive data cho audit trail
- No cache invalidation needed

### **2.3 Chỉnh sửa Địa điểm Đã duyệt**

#### **2.3.1 Cơ chế Versioning với Vercel Preview**
1. Create draft version trong Firestore
2. **Vercel Preview URL** cho draft version (chỉ authorized users)
3. Public version vẫn served từ CDN
4. Sau khi approve: trigger ISR revalidation

#### **2.3.2 Cache Management**
```javascript
// Vercel revalidation strategy
- On approval: revalidate(`/place/${placeId}`)
- Category pages: revalidate with 60s stale time
- Search index: background revalidation
```

### **2.4 Xóa Địa điểm**

#### **2.4.1 Soft Delete với Cache Invalidation**
1. Mark deleted trong Firestore
2. **Immediate cache purge** qua Vercel API
3. Return 404 for deleted places
4. Keep data for audit trail

## **III. TƯƠNG TÁC CỘNG ĐỒNG**

### **3.1 Hệ thống Góp ý**

#### **3.1.1 Rate Limiting với Vercel Edge**
```javascript
// Edge Middleware for rate limiting
export const config = {
  matcher: '/api/feedback/*',
}

export function middleware(request) {
  // Check rate limit: 3 góp ý/user/place/week
  // Use Vercel KV hoặc Upstash Redis
}
```

### **3.2 Hệ thống Báo cáo**

#### **3.2.1 Priority Queue với Edge Functions**
- High priority reports processed at edge
- Auto-escalation logic trong Edge Function
- Webhook to alert Moderators for urgent cases

## **IV. NOTIFICATION SYSTEM VỚI VERCEL**

### **4.1 Hybrid Approach**

**Real-time (Firebase Realtime Database):**
- Instant notifications cho logged-in users
- Presence tracking
- Unread count sync

**Edge-based (Vercel):**
- Email queuing với background functions
- SMS integration (future)
- Push notification scheduling

### **4.2 Implementation Pattern**
```javascript
// Vercel API Route
export async function POST(request) {
  // 1. Write notification to Firebase
  await admin.database().ref(`notifications/${userId}`).push(data)
  
  // 2. Queue email if needed (using Vercel Cron)
  if (priority === 'HIGH') {
    await queueImmediateEmail()
  }
  
  // 3. Trigger webhook for mobile push
  await triggerPushNotification()
}
```

## **V. PERFORMANCE OPTIMIZATION VỚI VERCEL**

### **5.1 Caching Strategy**

#### **5.1.1 Static Generation**
- Popular places: Full SSG với revalidation
- Category pages: ISR với 60s revalidate
- Search results: Client-side với SWR

#### **5.1.2 Edge Caching**
```javascript
// Vercel Edge Config
export const config = {
  runtime: 'edge',
  regions: ['sin1', 'hkg1'], // Gần Việt Nam
}
```

### **5.2 Image Optimization**

**Vercel Image Optimization:**
- Automatic format conversion (WebP/AVIF)
- Responsive sizing on-demand
- Lazy loading với blur placeholder

**Firebase Storage:**
- Original images backup
- User-uploaded content
- Documents và files khác

### **5.3 Database Query Optimization**

**Edge Functions cho common queries:**
```javascript
// Cache frequent queries at edge
const popularPlaces = await fetch('/api/places/popular', {
  next: { 
    revalidate: 3600, // 1 hour
    tags: ['popular-places']
  }
})
```

## **VI. DEPLOYMENT WORKFLOW**

### **6.1 Vercel CI/CD Pipeline**

#### **6.1.1 Branch Strategy**
- `main`: Production deployment
- `develop`: Staging với preview URL
- Feature branches: Automatic preview deployments

#### **6.1.2 Environment Variables**
```bash
# Vercel Dashboard
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
NEXT_PUBLIC_FIREBASE_CONFIG
```

### **6.2 Monitoring và Analytics**

**Vercel Analytics:**
- Real User Metrics (Web Vitals)
- Edge Function performance
- Error tracking

**Firebase Monitoring:**
- Database performance
- Storage usage
- Authentication metrics

## **VII. SECURITY VỚI VERCEL**

### **7.1 Edge Security**
- DDoS protection tại edge
- Rate limiting với Edge Middleware
- IP blocking cho suspicious activity

### **7.2 API Security**
```javascript
// Vercel API Route protection
import { verifyToken } from '@/lib/auth'

export async function middleware(request) {
  const token = request.headers.get('authorization')
  if (!await verifyToken(token)) {
    return new Response('Unauthorized', { status: 401 })
  }
}
```

## **VIII. DISASTER RECOVERY**

### **8.1 Backup Strategy**
- **Vercel**: Automatic deployment rollback
- **Firebase**: Daily automated backups
- **Git**: Full code history

### **8.2 Incident Response**
1. Rollback deployment qua Vercel Dashboard
2. Restore Firebase data if needed
3. Clear CDN cache
4. Post-mortem analysis

## **IX. COST OPTIMIZATION**

### **9.1 Vercel Usage**
- Optimize Edge Function execution time
- Use ISR instead of SSR where possible
- Implement proper cache headers

### **9.2 Firebase Usage**
- Batch writes để giảm operations
- Compress images trước khi upload
- Archive old data định kỳ

## **X. FUTURE ENHANCEMENTS**

### **10.1 Vercel-specific Features**
- **Edge Config**: Dynamic config without redeploy
- **Cron Jobs**: Scheduled tasks cho cleanup
- **Split Testing**: A/B test new features
- **Geolocation**: Route users to nearest content

### **10.2 Advanced Integrations**
- **Vercel KV**: Fast rate limiting
- **Vercel Postgres**: Analytical data
- **Vercel Blob**: Alternative storage
- **AI Functions**: Content moderation

## **XI. TROUBLESHOOTING GUIDE**

### **11.1 Common Issues**

| Issue | Cause | Solution |
|-------|-------|----------|
| Slow initial load | Cold start | Use Edge Functions |
| Stale content | ISR not triggered | Manual revalidation |
| Upload fails | CORS config | Check Vercel headers |
| Notification delay | Region latency | Use closer edge location |

### **11.2 Debug Tools**
- Vercel Function Logs
- Firebase Console
- Browser DevTools
- Postman for API testing

## **XII. KẾT LUẬN**

Kiến trúc **Vercel + Firebase** mang lại:
- **Performance**: Edge computing gần user Việt Nam
- **Scalability**: Auto-scaling không cần config
- **Developer Experience**: Preview deployments, easy rollback
- **Cost Effective**: Pay-per-use model
- **Reliability**: Global CDN với high availability

Sự kết hợp này tối ưu cho dự án Du Lịch Việt với traffic từ Việt Nam và international visitors.

---
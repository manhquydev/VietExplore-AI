# **PROMPTS KIỂM TRA & DEBUG FRONTEND-BACKEND CONNECTION**
## **Troubleshooting Guide cho Dự án Du Lịch Việt**

---

## **PHASE 1: KIỂM TRA CƠ BẢN**

### **Prompt 1.1 - Kiểm tra Authentication & Roles**
```
Hãy kiểm tra và liệt kê:
1. Tôi đang đăng nhập với role gì? (Guest/Traveler/Contributor/Partner/Moderator/Admin)
2. Role này được lưu ở đâu trong frontend? (localStorage/sessionStorage/context/state)
3. Khi gọi API, role có được gửi trong header/token không?
4. Backend có validate và trả về đúng role không?

Cho tôi xem:
- Code đoạn lấy user role ở frontend
- API response khi login (có field role không?)
- Cách frontend check role để hiển thị UI
```

### **Prompt 1.2 - Kiểm tra API Endpoints**
```
Liệt kê tất cả API endpoints đã triển khai ở backend và kiểm tra:
1. Endpoint nào đang hoạt động? (trả về 200)
2. Endpoint nào trả về 401/403/404/500?
3. Frontend có gọi đúng URL không?

Test thử với Postman/Thunder Client:
- GET /api/places (list địa điểm)
- POST /api/places/create (tạo địa điểm)
- GET /api/moderation/queue (xem queue kiểm duyệt)
- POST /api/feedback/submit (gửi góp ý)

Paste kết quả response của mỗi endpoint.
```

### **Prompt 1.3 - Kiểm tra Firebase Connection**
```
Kiểm tra kết nối Firebase:
1. Firebase config có đúng trong .env không?
2. Firestore có data không? Screenshot Firebase Console
3. Security rules có block không?

Chạy code test này trong browser console:
const db = firebase.firestore();
db.collection('places').limit(1).get()
  .then(snap => console.log('Works:', snap.size))
  .catch(err => console.log('Error:', err));

Kết quả là gì?
```

---

## **PHASE 2: KIỂM TRA CONDITIONAL RENDERING**

### **Prompt 2.1 - Debug Menu/Navigation Display**
```
Kiểm tra navigation menu:
1. Component Header/Navigation render các menu item như thế nào?
2. Có check role trước khi hiển thị không?

Tìm và show code:
- Nơi render "Tạo địa điểm" button
- Nơi render "Kiểm duyệt" menu
- Nơi render "Admin" panel

Thêm console.log debug:
console.log('Current user:', user);
console.log('User role:', user?.role);
console.log('Should show create button:', ['contributor', 'partner', 'admin'].includes(user?.role));
```

### **Prompt 2.2 - Check Permission Guards**
```
Kiểm tra route protection:
1. Có middleware/guard cho protected routes không?
2. Khi access /moderation - có bị redirect không?
3. Khi access /places/create - có cho phép không?

Test các URL này và báo kết quả:
- /dashboard (logged in users)
- /places/create (contributor/partner only)
- /moderation (moderator/admin only)
- /admin (admin only)

Nếu bị redirect, redirect đi đâu? Có thông báo gì không?
```

### **Prompt 2.3 - Debug Specific Features**
```
Với mỗi feature không hiển thị, kiểm tra:

VÍ DỤ: Nút "Gửi kiểm duyệt" không hiện
1. Tìm component render nút này
2. Check điều kiện hiển thị:
   - Status địa điểm phải là 'draft'?
   - User phải là owner?
   - Có validate gì khác?
3. Thêm debug:
   console.log('Place status:', place.status);
   console.log('Is owner:', place.createdBy === user.id);
   console.log('Show submit button:', showSubmitButton);

Làm tương tự cho các feature khác không hiển thị.
```

---

## **PHASE 3: KIỂM TRA DATA FLOW**

### **Prompt 3.1 - Trace Create Place Flow**
```
Trace luồng tạo địa điểm:
1. Form submit gọi function nào?
2. Function đó gọi API nào?
3. API trả về gì?
4. Sau khi success, có redirect không?

Thêm logging vào mỗi step:
- onSubmit: console.log('1. Submitting:', formData)
- API call: console.log('2. Calling API:', url, payload)
- Response: console.log('3. API response:', response)
- After success: console.log('4. Redirect to:', nextUrl)

Chạy và paste full log.
```

### **Prompt 3.2 - Debug Moderation Queue**
```
Kiểm tra moderation queue:
1. API /api/moderation/queue trả về data không?
2. Frontend component ModerationQueue có nhận được data không?
3. Có filter theo role không? (chỉ moderator/admin thấy)

Debug code:
useEffect(() => {
  console.log('Fetching moderation queue...');
  fetchQueue().then(data => {
    console.log('Queue data:', data);
    console.log('Queue length:', data?.length);
  });
}, []);

Kết quả?
```

### **Prompt 3.3 - Check Realtime Updates**
```
Kiểm tra Firebase Realtime notifications:
1. Có listener cho notifications không?
2. Khi có notification mới, UI có update không?

Test:
1. Mở 2 browser tabs
2. Tab 1: Login as Contributor, tạo địa điểm
3. Tab 2: Login as Moderator, xem có notification không?

Hoặc manually add notification trong Firebase Console:
/notifications/{moderatorId}/test123
{
  type: "moderation_required",
  title: "Test notification",
  read: false,
  createdAt: timestamp
}

UI có hiện notification bell không?
```

---

## **PHASE 4: SPECIFIC FEATURE CHECKS**

### **Prompt 4.1 - Place Status Workflow**
```
Kiểm tra status workflow:
1. Tạo địa điểm mới - status là gì?
2. Click "Gửi kiểm duyệt" - status chuyển thành gì?
3. Moderator claim - status chuyển thành gì?
4. Moderator approve - status chuyển thành gì?

Mỗi step, check:
- Firestore document status field
- Frontend display
- Available actions cho user

Có mismatch giữa backend và frontend không?
```

### **Prompt 4.2 - Role-Specific UI Elements**
```
Với từng role, kiểm tra xem có thấy:

CONTRIBUTOR/PARTNER:
[ ] Nút "Tạo địa điểm"
[ ] Tab "Địa điểm của tôi"
[ ] Nút "Sửa" cho địa điểm mình tạo
[ ] Nút "Gửi kiểm duyệt"
[ ] Xem feedback nhận được

MODERATOR:
[ ] Tab "Kiểm duyệt"
[ ] Queue list
[ ] Nút "Claim"
[ ] Form review (approve/reject/revise)
[ ] Xem reports

ADMIN:
[ ] Tất cả của Moderator
[ ] Tab "Admin"
[ ] User management
[ ] System settings
[ ] Audit logs

Cái nào thiếu? Tại sao?
```

### **Prompt 4.3 - Feedback & Report System**
```
Test góp ý và báo cáo:

1. Với role Traveler, vào 1 địa điểm đã duyệt
2. Có thấy nút "Góp ý" không?
3. Có thấy nút "Báo cáo" không?
4. Submit góp ý - check:
   - API call success?
   - Owner nhận được notification?
   - Góp ý xuất hiện ở đâu?

Tương tự cho Report.
```

---

## **PHASE 5: COMMON ISSUES & FIXES**

### **Prompt 5.1 - Quick Diagnosis**
```
Chạy diagnostic script này:

// 1. Check auth
const checkAuth = () => {
  const user = // get current user
  console.log('=== AUTH CHECK ===');
  console.log('Logged in:', !!user);
  console.log('User role:', user?.role);
  console.log('User ID:', user?.uid);
}

// 2. Check permissions
const checkPermissions = () => {
  console.log('=== PERMISSIONS CHECK ===');
  console.log('Can create place:', canCreatePlace());
  console.log('Can moderate:', canModerate());
  console.log('Is admin:', isAdmin());
}

// 3. Check API
const checkAPI = async () => {
  console.log('=== API CHECK ===');
  const endpoints = [
    '/api/places',
    '/api/auth/verify-role',
    '/api/moderation/queue'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      console.log(`${endpoint}: ${res.status}`);
    } catch (err) {
      console.log(`${endpoint}: ERROR`, err.message);
    }
  }
}

checkAuth();
checkPermissions();
checkAPI();

Paste toàn bộ output.
```

### **Prompt 5.2 - Common Fixes Checklist**
```
Thử các fix sau và báo cái nào work:

1. [ ] Clear localStorage/sessionStorage và login lại
2. [ ] Hard refresh (Ctrl+Shift+R)
3. [ ] Check browser console có errors không
4. [ ] Verify .env.local có đủ variables
5. [ ] Restart dev server
6. [ ] Clear .next folder và rebuild
7. [ ] Check network tab khi call API
8. [ ] Verify Firebase project ID đúng
9. [ ] Check Vercel deployment logs
10. [ ] Test trên incognito window

Cái nào fix được issue?
```

---

## **PHASE 6: SYSTEMATIC VERIFICATION**

### **Prompt 6.1 - Create Full Test Scenario**
```
Thực hiện test scenario đầy đủ:

1. CONTRIBUTOR tạo địa điểm:
   - Login as contributor@test.com
   - Click "Tạo địa điểm"
   - Fill form và save draft
   - Click "Gửi kiểm duyệt"
   - Verify status = "pending_review"

2. MODERATOR kiểm duyệt:
   - Login as moderator@test.com
   - Vào trang kiểm duyệt
   - Thấy địa điểm trong queue không?
   - Click "Claim"
   - Click "Approve"
   - Verify status = "approved"

3. PUBLIC xem địa điểm:
   - Logout hoặc dùng Guest
   - Vào trang places
   - Thấy địa điểm vừa approve không?

Step nào fail? Error message gì?
```

### **Prompt 6.2 - Generate Debug Report**
```
Tạo báo cáo debug đầy đủ:

## SYSTEM INFO
- Node version:
- Next.js version:
- Firebase SDK version:
- Browser:

## AUTH STATUS
- Current user:
- Role:
- Permissions:

## BACKEND STATUS
- [ ] Firebase connected
- [ ] Firestore readable
- [ ] Storage accessible
- [ ] Auth working

## FRONTEND STATUS
- [ ] Login form works
- [ ] Dashboard loads
- [ ] Navigation shows correct items
- [ ] Protected routes work

## FEATURES STATUS
- [ ] Create place: ___
- [ ] Edit place: ___
- [ ] Submit for review: ___
- [ ] Moderation queue: ___
- [ ] Claim & review: ___
- [ ] Feedback system: ___
- [ ] Report system: ___
- [ ] Notifications: ___

## ERRORS FOUND
1. ___
2. ___
3. ___

## SUSPECTED CAUSES
1. ___
2. ___
```

---

## **SỬ DỤNG PROMPTS**

### **Quy trình đề xuất:**
1. **Bắt đầu với Phase 1** - Kiểm tra cơ bản
2. **Nếu auth/API work** → Phase 2 - Check UI rendering
3. **Nếu UI không hiện** → Phase 3 - Trace data flow
4. **Test specific features** → Phase 4
5. **Apply common fixes** → Phase 5
6. **Full system test** → Phase 6

### **Khi gặp issue cụ thể:**
- **"Không thấy nút X"** → Dùng Prompt 2.1, 2.3
- **"API trả về 403"** → Dùng Prompt 1.1, 1.2
- **"Data không update"** → Dùng Prompt 3.1, 3.3
- **"Role sai"** → Dùng Prompt 1.1, 4.2

### **Template báo cáo issue:**
```
## ISSUE: [Tên feature] không hiển thị/hoạt động

**Current behavior:**
- 

**Expected behavior:**
- 

**Steps checked:**
1. User role: ___
2. API response: ___
3. Console errors: ___
4. Network tab: ___

**Debug output:**
[Paste relevant logs]

**Suspected cause:**
- 

**Need help with:**
- 
```

Dùng các prompts này theo thứ tự hoặc chọn phù hợp với issue đang gặp. Mỗi prompt giúp narrow down nguyên nhân và tìm ra solution.
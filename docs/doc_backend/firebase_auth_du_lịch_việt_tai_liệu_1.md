# Firebase Authentication – Tài liệu kỹ thuật (Du Lịch Việt)

> Mục tiêu: Thiết kế & triển khai xác thực người dùng phù hợp mô hình phân quyền (Guest · Traveler · Contributor · Community Partner · Moderator · Admin) cho giai đoạn 1 (Lean). Tài liệu này **chỉ** bao phủ Authentication + các điểm chạm liên quan (custom claims, blocking functions, App Check). Firestore/Storage/Functions khác sẽ có tài liệu riêng.

---

## 1) Phạm vi & quyết định kiến trúc
- **Nhà cung cấp đăng nhập (giai đoạn 1):**  
  **Email/Password**, **Google**. (Tuỳ chọn: **Apple** cho iOS; **Phone** để mở rộng sau).  
  Lý do: Phủ phổ biến, chi phí thấp, UX quen thuộc, ít rủi ro spam hơn so với Phone ở VN.  
- **Kiểu phiên (session):** Web SPA (Firebase Web v9 modular).  
- **Phân quyền:** dùng **Custom Claims** trên Firebase Auth token để ánh xạ role; dữ liệu hồ sơ lưu trong `users/{uid}` (Firestore).  
- **Bảo mật bổ sung:** **Email Verification bắt buộc**, **MFA** (bắt buộc cho Moderator/Admin), **App Check** cho web, **Blocking Functions** để chặn đăng ký bất thường.

---

## 2) Mô hình vai trò & custom claims
### 2.1. Bộ vai trò (role)
- `traveler` (mặc định sau đăng ký)
- `contributor`
- `partner`
- `moderator`
- `admin`

### 2.2. Cấu trúc custom claims (ví dụ)
```json
{
  "role": "traveler",
  "verifiedContributor": false,
  "partnerId": null,
  "permissions": []
}
```
> Ghi chú: Giai đoạn 1, Partner **chỉ nộp nhanh** → có `role = "partner"`, có thể gắn `partnerId` để tra quyền hiển thị nhãn.

### 2.3. Ánh xạ phân quyền → UI/Routes
- `traveler`: tạo/lưu/chia sẻ lịch trình; đề xuất/sửa; báo cáo.
- `contributor`: tạo draft địa điểm, nộp duyệt.
- `partner`: nộp nhanh (fast‑track), có nhãn Partner.
- `moderator`: truy cập `/moderation/dashboard`.
- `admin`: truy cập trang cấu hình, gán nhãn, phân quyền.

---

## 3) Luồng người dùng (Auth Flows)
### 3.1. Đăng ký (Email/Password)
1. Người dùng nhập email + password.
2. Tạo tài khoản → gửi **email verification**.
3. Tạo doc `users/{uid}` với profile mặc định (role traveler).
4. Yêu cầu xác minh email trước khi cho phép viết dữ liệu (Rules kiểm tra `email_verified`).

### 3.2. Đăng nhập Google
- One‑tap/Popup → nếu mới lần đầu: tạo `users/{uid}` + claim mặc định.

### 3.3. Quên mật khẩu
- Gửi email reset; giới hạn tần suất bằng **blocking function** / reCAPTCHA Enterprise (qua App Check) nếu cần.

### 3.4. Nâng/cấp quyền
- Admin duyệt hồ sơ và **gán role** qua **Callable Cloud Function** (không làm trên client).  
- Sau khi gán claim, client **reload token** để cập nhật UI.

### 3.5. MFA (bắt buộc cho Moderator/Admin)
- Yêu cầu đăng ký **SMS TOTP/Authenticator** trước khi truy cập khu quản trị.

---

## 4) Cấu trúc dữ liệu hồ sơ người dùng (Firestore)
```
users/{uid}
  - email
  - displayName
  - photoURL
  - role                // shadow của custom claim để hiển thị nhanh
  - verifiedContributor // bool
  - partnerId           // nếu là partner
  - createdAt, updatedAt
  - consent: { privacyAcceptedAt, marketing: false }
```
> Lưu ý: Quyền truy cập/ghi vào hồ sơ sẽ do **Rules Firestore** kiểm soát (tài liệu riêng). Tại đây chỉ nêu field liên quan auth.

---

## 5) Security: Blocking Functions & ràng buộc
### 5.1. Blocking Functions (Before Create / Before Sign‑in)
- Chặn đăng ký từ domain tạm/throwaway (danh sách đen cơ bản).
- Giới hạn **đăng ký lặp** từ cùng IP trong thời gian ngắn.
- Tự động gán `role = traveler` khi tạo mới (không cho client tự gán).  
- Từ chối sign‑in nếu `disabled = true` trong `users/{uid}`.

### 5.2. App Check (Web)
- Bật **App Check** với reCAPTCHA Enterprise hoặc reCAPTCHA v3.  
- Yêu cầu App Check đối với Firestore/Storage/Functions để giảm abuse.

### 5.3. Email Verification bắt buộc
- Rules phía Firestore/Storage chỉ cho phép **write** khi `request.auth.token.email_verified == true`.

### 5.4. MFA cho Moderator/Admin
- Kiểm tra claim ở middleware UI trước khi vào route quản trị; nếu chưa bật MFA → redirect setup.

---

## 6) Cloud Functions (TypeScript) – Mẫu cốt lõi
### 6.1. Tạo hồ sơ & claim mặc định khi user tạo mới
```ts
// functions/src/auth.onCreate.ts
import * as admin from 'firebase-admin';
import { onAuthCreate } from 'firebase-functions/v2/identity';

export const handleUserCreate = onAuthCreate(async (user) => {
  const db = admin.firestore();
  const { uid, email, displayName, photoURL } = user;

  await db.doc(`users/${uid}`).set({
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    role: 'traveler',
    verifiedContributor: false,
    partnerId: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    consent: { privacyAcceptedAt: admin.firestore.FieldValue.serverTimestamp(), marketing: false }
  });

  await admin.auth().setCustomUserClaims(uid, { role: 'traveler', verifiedContributor: false });
});
```

### 6.2. Nâng/cấp quyền – chỉ Admin được gọi
```ts
// functions/src/callable.grantRole.ts
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';

export const grantRole = onCall(async (req) => {
  const caller = req.auth;
  if (!caller?.token?.role || caller.token.role !== 'admin') {
    throw new Error('PERMISSION_DENIED');
  }
  const { uid, role, verifiedContributor, partnerId, permissions } = req.data;

  // Không cho tự nâng quyền cho chính mình
  if (caller.uid === uid) throw new Error('CANNOT_SELF_ELEVATE');

  await admin.auth().setCustomUserClaims(uid, {
    role,
    verifiedContributor: !!verifiedContributor,
    partnerId: partnerId || null,
    permissions: Array.isArray(permissions) ? permissions : []
  });

  await admin.firestore().doc(`users/${uid}`).update({
    role,
    verifiedContributor: !!verifiedContributor,
    partnerId: partnerId || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true };
});
```

### 6.3. Blocking function mẫu (Before Create)
```ts
// functions/src/blocking.beforeCreate.ts
import { beforeUserCreated } from 'firebase-functions/v2/identity';

const bannedDomains = ['mailinator.com', 'tempmail.com'];

export const beforeCreate = beforeUserCreated((event) => {
  const email = event.data?.email || '';
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && bannedDomains.includes(domain)) {
    throw new Error('BLOCKED_DOMAIN');
  }
});
```

---

## 7) Client (Web v9) – Khởi tạo & mẹo triển khai
```ts
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = { /* env */ };
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

```ts
// Đăng nhập Google (popup)
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);
```

```ts
// Lấy claims mới sau khi được nâng quyền
await auth.currentUser?.getIdToken(true); // force refresh
```

**Best practices UI:**
- Ẩn/hiện menu theo `role` từ claims; luôn **kiểm tra lại ở server/Rules**.
- Hiển thị badge: Traveler/Contributor/Partner/Verified.
- Yêu cầu xác minh email trước khi mở tính năng viết.

---

## 8) Tuân thủ & quyền riêng tư
- Thu thập thông tin **tối thiểu** (email, tên hiển thị, ảnh đại diện).  
- Cung cấp cơ chế **xoá tài khoản** và **xoá dữ liệu cá nhân** theo yêu cầu.  
- Ghi log các thay đổi quyền (ai → gán quyền gì → lúc nào) trong Firestore để audit.

---

## 9) Kiểm thử & giám sát (QA)
- Unit test cho helper xử lý claims và guards route.
- E2E (Playwright): đăng ký → xác minh email (mock) → đăng nhập → tạo lịch trình.
- Kiểm thử blocking functions: domain cấm, rate-limit.
- Giám sát auth errors với Firebase Crashlytics (nếu có app mobile) hoặc Sentry (web).

---

## 10) Checklist triển khai nhanh
- [ ] Bật Email/Password, Google (và domain whitelist OAuth).  
- [ ] Bật Email Verification bắt buộc.  
- [ ] Viết blocking functions (beforeCreate / beforeSignIn).  
- [ ] Tạo Cloud Function `handleUserCreate` + `grantRole`.  
- [ ] Bật App Check (web) và áp dụng cho Firestore/Storage/Functions.  
- [ ] Thiết lập MFA bắt buộc cho Moderator/Admin.  
- [ ] Tạo trang quản trị gán quyền (Admin only).  
- [ ] Viết test: unit + E2E luồng đăng nhập/đăng ký.  

---

### Phạm vi kế tiếp (tài liệu riêng)
1. **Firestore Data Model & Security Rules** (Tài liệu 2).  
2. **Cloud Storage cho media & Security Rules** (Tài liệu 3).  
3. **Cloud Functions nghiệp vụ (moderation, SLA, nhãn tin cậy)** (Tài liệu 4).  
4. **Realtime Database (tuỳ chọn – presence & queue nhẹ)** (Tài liệu 5, nếu áp dụng).


# Realtime Database – Presence, Queue nhẹ & Activity Indicators (Tài liệu 5)

> Mục tiêu: Sử dụng **Firebase Realtime Database (RTDB)** cho các tính năng *thời gian thực nhẹ* trong giai đoạn 1, đồng bộ với:
> - Tài liệu 1: Auth (roles, claims, App Check, email verified)
> - Tài liệu 2: Firestore (dữ liệu chính, moderation workflow)
> - Tài liệu 3: Storage (media pipeline)
> - Tài liệu 4: Cloud Functions nghiệp vụ (moderation, SLA, trust labels)
>
> RTDB chỉ dùng cho **trạng thái tạm / ephemeral**: presence (online/offline), “đang xem/đang review”, *queue index nhẹ* cho moderator, và *activity indicators* cơ bản. Mọi **quyết định nghiệp vụ** (claim/review/publish) vẫn ở **Firestore + Functions** để đảm bảo nhất quán.

---

## 1) Phạm vi dùng RTDB (Lean GĐ1)
1. **Presence người dùng** (online/offline, lastSeen).  
2. **Moderator activity**: ai đang review request nào; “đang gõ ghi chú” (typing).  
3. **Queue nhẹ cho moderation**: index tối giản các request đang chờ, ưu tiên hiển thị nhanh theo `priority`/`dueAt` (nguồn chuẩn ở Firestore).  
4. **Viewers / Activity tối thiểu** trên Itinerary công khai: số người đang xem.

> Không lưu nội dung chính, không lưu logs dài hạn ở RTDB.

---

## 2) Cấu trúc RTDB (đề xuất)
```text
/ (root)
  /status/{uid}
    state: "online" | "offline"
    lastSeen: serverTimestamp
    role: "traveler|contributor|partner|moderator|admin"

  /moderation
    /active/{moderatorUid}
      requestId: "<requestId>|null"      // request đang review
      typing: false                       // đang nhập notes hay không
      heartbeat: serverTimestamp

    /queueIndex
      /priority-high/{requestId}: true    // mirror nhẹ từ Firestore
      /priority-normal/{requestId}: true

    /queueSummary
      totalQueued: 0
      highPriority: 0
      overdue: 0
      updatedAt: serverTimestamp

  /itineraries
    /live/{itineraryId}
      viewersCount: 0
      viewers/
        {uid}: serverTimestamp            // auto remove onDisconnect
```

> `queueIndex` chỉ là chỉ mục để UI load nhanh danh sách request *id*; chi tiết request (status, dueAt, submitterRole, …) vẫn lấy từ **Firestore**. Đồng bộ bởi Cloud Functions.

---

## 3) Security Rules (RTDB)
> Yêu cầu: **Auth bắt buộc** cho mọi write, **App Check** bật enforcement cho Web.

```json
{
  "rules": {
    ".read": false,               
    ".write": false,

    "status": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",                
        ".write": "auth != null && auth.uid === $uid && auth.token.email_verified === true"
      }
    },

    "moderation": {
      ".read": "auth != null && (auth.token.role === 'moderator' || auth.token.role === 'admin')",
      ".write": "auth != null && (auth.token.role === 'moderator' || auth.token.role === 'admin')",

      "active": {
        "$modUid": {
          ".write": "auth != null && auth.uid === $modUid",         
          ".read": true                                             
        }
      },

      "queueIndex": {
        ".read": true,
        ".write": false                                             
      },

      "queueSummary": {
        ".read": true,
        ".write": false                                             
      }
    },

    "itineraries": {
      "live": {
        "$itineraryId": {
          ".read": true,
          ".write": "auth != null && auth.token.email_verified === true"
        }
      }
    }
  }
}
```

> Ghi chú: `queueIndex` và `queueSummary` chỉ **Functions** được ghi (Admin SDK bỏ qua rules), nên `.write=false` cho client.

---

## 4) Presence người dùng (client web v9)
```ts
import { getDatabase, ref, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const db = getDatabase();

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const statusRef = ref(db, `status/${user.uid}`);
  // Online: set state + onDisconnect -> offline
  await set(statusRef, { state: 'online', lastSeen: serverTimestamp(), role: (await user.getIdTokenResult()).claims.role || 'traveler' });
  onDisconnect(statusRef).set({ state: 'offline', lastSeen: serverTimestamp() });
});
```

- Chỉ chính người dùng xem/ghi được node `status/{uid}` của mình (bảo vệ riêng tư).  
- Moderator/Admin có thể xem **tóm tắt** hoạt động qua `moderation/active` thay vì xem trực tiếp toàn bộ `status/*`.

---

## 5) Moderator activity & typing indicator
```ts
import { ref, set, onDisconnect, serverTimestamp } from 'firebase/database';

function enterReview(modUid: string, requestId: string) {
  const r = ref(db, `moderation/active/${modUid}`);
  set(r, { requestId, typing: false, heartbeat: serverTimestamp() });
  onDisconnect(r).remove();
}

function setTyping(modUid: string, typing: boolean) {
  set(ref(db, `moderation/active/${modUid}/typing`), typing);
}
```
- UI của Moderator có thể hiển thị: “M1 đang review request #ABC…”.  
- **Quyết định claim/approve** vẫn gọi **Callable Functions** (Tài liệu 4).

---

## 6) Queue nhẹ cho moderation (đồng bộ từ Firestore)
**Mục tiêu:** load nhanh danh sách request ID theo ưu tiên, tránh query nặng trên Firestore mỗi giây.

**Đồng bộ bằng Cloud Functions (Firestore → RTDB):**
- Trigger **onWrite** trên `moderation/requests/{requestId}`:
  - Nếu `status in ['queued','in_review']` → đặt key vào `queueIndex/priority-{priority}/{requestId}: true`.
  - Nếu ra khỏi hai trạng thái trên → xoá key tương ứng.
  - Cập nhật `queueSummary` (đếm tổng, highPriority, overdue nếu `dueAt < now`).

```ts
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getDatabase } from 'firebase-admin/database';

export const syncQueueIndex = onDocumentWritten('moderation/requests/{requestId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  const rtdb = getDatabase();

  const pathsToSet: string[] = [];
  const pathsToDel: string[] = [];

  function pathFor(rec: any) {
    return `moderation/queueIndex/priority-${rec.priority}/${event.params.requestId}`;
  }

  if (before && (!after || before.status !== after.status || before.priority !== after.priority)) {
    if (['queued','in_review'].includes(before.status)) pathsToDel.push(pathFor(before));
  }
  if (after && ['queued','in_review'].includes(after.status)) pathsToSet.push(pathFor(after));

  const updates: Record<string, any> = {};
  pathsToDel.forEach((p) => updates[p] = null);
  pathsToSet.forEach((p) => updates[p] = true);

  await rtdb.ref().update(updates);

  // Cập nhật summary đơn giản (có thể tối ưu bằng counters)
  // Ở đây demo đọc Firestore đếm; thực tế nên giữ counter ở Firestore và mirror sang RTDB.
});
```

**UI Moderator (client):**
- Lắng nghe `queueIndex/priority-high` trước → lấy top N `requestId` → fetch chi tiết từ Firestore bằng `getDocs` một lần.
- Khi claim/approve → Callable Function cập nhật Firestore, Function sync sang RTDB.

---

## 7) Viewers Itinerary (ai đang xem)
```ts
import { ref, onDisconnect, serverTimestamp, increment, runTransaction } from 'firebase/database';

function enterItinerary(itineraryId: string, uid: string) {
  const viewersRef = ref(db, `itineraries/live/${itineraryId}/viewers/${uid}`);
  onDisconnect(viewersRef).remove();
  set(viewersRef, serverTimestamp());
}
```
- UI hiển thị `viewersCount` (cập nhật bởi Function hoặc client side transaction).  
- Dùng `onDisconnect` để tự dọn khi người dùng rời trang.

**(Tuỳ chọn) Function giữ `viewersCount` nhất quán:**
- Trigger RTDB **onWrite** trên `itineraries/live/{itineraryId}/viewers/{uid}` → tăng/giảm `viewersCount` an toàn tránh race.

---

## 8) Đồng bộ & nhất quán với Firestore
- **Nguồn chuẩn** của moderation requests vẫn ở Firestore. RTDB chỉ là **chỉ mục nhẹ** + trạng thái đang hoạt động.  
- Không bao giờ thay đổi `status`, `priority`, `dueAt` ở RTDB.  
- Mọi quyết định duyệt/publish nằm trong **Callable Functions** (Tài liệu 4).

---

## 9) App Check & hiệu năng
- Bật **App Check** cho RTDB Web; từ chối write nếu không có token hợp lệ.  
- Dữ liệu RTDB phải **nhỏ, nông, TTL ngắn**: dùng `onDisconnect`, scheduled job dọn dẹp các node `heartbeat` > 24h.  
- Tránh listen quá nhiều nhánh cùng lúc; chỉ subscribe khi mở màn hình moderator/itinerary.

---

## 10) Dọn dẹp & TTL (Scheduled Functions)
- Scheduled 15 phút: xoá `moderation/active/*` nếu `heartbeat` > 30 phút.  
- Scheduled 1 giờ: xoá viewer entries quá cũ (phòng trường hợp mất onDisconnect).

---

## 11) Kiểm thử
- Emulators: RTDB + Firestore + Functions.  
- Case: đăng nhập → status online; mở Itinerary → viewers tăng; Moderator mở request → `active` cập nhật; claim/approve → RTDB index thay đổi.

---

## 12) Checklist triển khai
- [ ] Bật App Check cho RTDB (Web).  
- [ ] Áp dụng RTDB rules như trên.  
- [ ] Client presence: `status/{uid}` + `onDisconnect`.  
- [ ] Moderator activity: `moderation/active/{uid}` + UI hiển thị.  
- [ ] Cloud Function sync Firestore → RTDB: `queueIndex`, `queueSummary`.  
- [ ] (Tuỳ chọn) RTDB trigger giữ `viewersCount` nhất quán.  
- [ ] Scheduled dọn dẹp TTL.

---

✅ Tài liệu này **đồng bộ** với các phần trước: RTDB chỉ dùng cho **trạng thái tức thời** (presence, activity, queue index), còn **logic & dữ liệu chính** nằm ở Firestore/Functions. Cách tiếp cận này vừa nhẹ chi phí, vừa đảm bảo minh bạch & nhất quán cho dự án phi lợi nhuận "Du Lịch Việt".


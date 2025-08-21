# Cloud Storage cho Media & Security Rules – Du Lịch Việt (Tài liệu 3)

> Mục tiêu: Thiết kế lưu trữ ảnh/video phục vụ **Place / PlaceDraft / Itinerary** theo phiên bản Lean Giai đoạn 1, đồng bộ với Tài liệu 1 (Auth) và Tài liệu 2 (Firestore). Bao gồm: cấu trúc thư mục, quy trình upload, xử lý sau upload (Functions), quy tắc bảo mật (Storage Rules), tối ưu ảnh & CDN, và checklist QA.

---

## 1) Phạm vi & nguyên tắc
- **Chỉ ảnh** giai đoạn 1: `.jpg/.jpeg/.png/.webp` (khuyến nghị webp). Video sẽ xem xét ở giai đoạn 2.
- **Nguồn hợp lệ:** ảnh tự chụp hoặc có quyền sử dụng; bắt buộc khai báo **credit** trong Firestore.
- **Kênh upload hợp lệ:** người dùng đã **xác minh email**; Guest không được upload.
- **Không public write**: di chuyển file sang khu công khai chỉ qua **Cloud Functions** sau khi Moderator approve.
- **Tự động tối ưu**: nén, tạo các kích thước (thumbnail/medium/large), chuyển WebP, bỏ EXIF nhạy cảm.

---

## 2) Cấu trúc bucket & thư mục
Sử dụng **một bucket chuẩn** (mặc định) với phân tách thư mục:
```
/<bucket_root>
  /drafts/
    /places/{draftId}/<uuid>.<ext>            // ảnh nháp do Traveler/Contributor/Partner nộp
  /places/
    /{placeId}/
      /orig/<uuid>.<ext>                      // ảnh gốc đã kiểm duyệt (giữ riêng, không public)
      /web/
        /thumb/<uuid>.webp                    // 320px
        /md/<uuid>.webp                       // 768px
        /lg/<uuid>.webp                       // 1280px
  /users/
    /{uid}/avatar/<uuid>.<ext>
  /reports/
    /{reportId}/evidence/<uuid>.<ext>
```
> **Nguyên tắc xuất bản**: Mọi upload của người dùng đi vào `drafts/` hoặc `users/`. Sau khi **Moderator approve** bản nháp, Cloud Function sẽ **copy/move** ảnh từ `drafts/places/{draftId}` sang `places/{placeId}/orig` và sinh các biến thể vào `places/{placeId}/web/...`.

---

## 3) Luồng upload & xuất bản
1) **Upload nháp (client):**
   - Traveler/Contributor/Partner upload ảnh vào `drafts/places/{draftId}/...`.
   - Kèm **App Check** + **email_verified**.
2) **Ghi metadata ảnh vào Firestore** trong `placeDrafts/{draftId}.photos[]` (path, w, h, credit).
3) **Moderation approve** → gọi **Cloud Function (onWrite)** để:
   - Sao chép file từ `drafts/...` → `places/{placeId}/orig`.
   - Tạo biến thể `thumb/md/lg` (Sharp/Imagemin) dưới `places/{placeId}/web/...`.
   - Bỏ EXIF, thêm watermark nhẹ (tùy chọn), ghi **cache-control** phù hợp.
   - Cập nhật `places/{placeId}.photos[]` với đường dẫn web.
4) **Ẩn/Gỡ**: Moderator gỡ một ảnh → Function xóa biến thể, cập nhật Firestore.

---

## 4) Metadata & chuẩn ảnh
- **Kích thước tối ưu (đầu vào):** khuyến nghị ≤ 4096px chiều dài lớn nhất; **dung lượng tối đa 5MB/ảnh**.
- **Biến thể đầu ra:**
  - `thumb`: max width 320px  
  - `md`: max width 768px  
  - `lg`: max width 1280px
- **Định dạng:** WebP (ưu tiên); fallback giữ gốc `.jpg/.png` trong `orig/` (không public URL trực tiếp).
- **EXIF:** loại bỏ toàn bộ EXIF, đặc biệt GPS.
- **Cache-Control:** `public, max-age=31536000, immutable` cho `web/` (biến thể có tên file chứa hash/uuid).

---

## 5) Security Rules (Firebase Storage)
> Đồng bộ với Auth (custom claims) & Firestore Rules. Sử dụng **App Check** bắt buộc cho mọi đường dẫn người dùng.

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function isSignedIn() { return request.auth != null; }
    function emailVerified() { return isSignedIn() && request.auth.token.email_verified == true; }
    function role() { return isSignedIn() ? request.auth.token.role : null; }
    function isModerator() { return role() == 'moderator' || role() == 'admin'; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

    // Chỉ cho phép read công khai ở các biến thể web của ảnh đã publish
    match /places/{placeId}/web/{folder}/{file} {
      allow read: if true;                 // ảnh công khai cho website
      allow write: if false;               // chỉ Functions ghi
    }

    // Ảnh gốc đã duyệt: không public
    match /places/{placeId}/orig/{file} {
      allow read, write: if false;         // chỉ Functions truy cập bằng Admin SDK
    }

    // Upload nháp: chỉ chủ draft hoặc Contributor/Partner đã xác minh
    match /drafts/places/{draftId}/{file} {
      allow read: if false;                // không public listing
      allow write: if emailVerified()      // bắt buộc email verified
        && (request.resource.size < 5 * 1024 * 1024)  // <= 5MB
        && request.resource.contentType.matches('image/.*')
        && request.time < timestamp.date(2100, 1, 1);
      allow delete: if emailVerified();    // cho phép xóa ảnh nháp của chính mình (kiểm tra sở hữu ở Function an toàn hơn)
    }

    // Avatar người dùng: chỉ chủ sở hữu thao tác
    match /users/{uid}/avatar/{file} {
      allow read: if true;                 // có thể public, tùy UI
      allow write, delete: if emailVerified() && isOwner(uid)
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    // Evidence kèm report: cho phép upload kể cả user mới (nhưng cần App Check)
    match /reports/{reportId}/evidence/{file} {
      allow read: if false;
      allow write: if request.time < timestamp.date(2100,1,1)
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```
> **Lưu ý:** Rule ở `drafts/places/{draftId}` không kiểm tra UID sở hữu do Storage Rules **không đọc** Firestore trực tiếp. Xác minh sở hữu nên thực hiện ở **Cloud Function/Client** dựa trên Firestore `placeDrafts/{draftId}.submitter`. Nếu cần ràng buộc chặt hơn ở Storage Rules, có thể encode `{uid}` trong đường dẫn: `drafts/places/{uid}/{draftId}/...`.

---

## 6) Cloud Functions xử lý media (TypeScript)
### 6.1. Trigger khi moderator approve (service pipeline)
- Sự kiện: update `placeDrafts/{draftId}.status` → `approved/published`
- Thao tác:
  1. Tạo `placeId` (nếu mới) & ghi `places/{placeId}`.
  2. Lấy danh sách ảnh ở `drafts/places/{draftId}`.
  3. Copy sang `places/{placeId}/orig`.
  4. Dùng **Sharp** tạo `thumb/md/lg` ở `places/{placeId}/web/...` (WebP, strip EXIF).
  5. Ghi `places/{placeId}.photos[]` (đường dẫn web, kích thước, credit).

```ts
import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';

export const onDraftApproved = onDocumentUpdated('placeDrafts/{draftId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;
  if (before.status === after.status) return;
  if (!['approved','published'].includes(after.status)) return;

  const draftId = event.params.draftId as string;
  const db = admin.firestore();
  const bucket = getStorage().bucket();

  // 1) Tạo place (rút gọn minh hoạ)
  const placeRef = await db.collection('places').add({
    name: after.title,
    slug: /* hàm tạo slug duy nhất */ after.title,
    region: after.region,
    province: after.province,
    type: after.type,
    description: after.description,
    trustLabel: 'contributor',
    createdBy: after.submitter,
    status: 'published',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 2) Copy & tạo biến thể
  const [files] = await bucket.getFiles({ prefix: `drafts/places/${draftId}/` });
  const photos: any[] = [];
  for (const f of files) {
    const filename = f.name.split('/').pop()!;
    const origPath = `places/${placeRef.id}/orig/${filename}`;
    await f.copy(origPath);

    const [buf] = await bucket.file(origPath).download();
    const outThumb = await sharp(buf).resize({ width: 320 }).webp({ quality: 80 }).toBuffer();
    const outMd = await sharp(buf).resize({ width: 768 }).webp({ quality: 82 }).toBuffer();
    const outLg = await sharp(buf).resize({ width: 1280 }).webp({ quality: 85 }).toBuffer();

    await bucket.file(`places/${placeRef.id}/web/thumb/${filename}.webp`).save(outThumb, { contentType: 'image/webp', metadata: { cacheControl: 'public, max-age=31536000, immutable' } });
    await bucket.file(`places/${placeRef.id}/web/md/${filename}.webp`).save(outMd, { contentType: 'image/webp', metadata: { cacheControl: 'public, max-age=31536000, immutable' } });
    await bucket.file(`places/${placeRef.id}/web/lg/${filename}.webp`).save(outLg, { contentType: 'image/webp', metadata: { cacheControl: 'public, max-age=31536000, immutable' } });

    photos.push({
      path: `places/${placeRef.id}/web/lg/${filename}.webp`,
      variants: {
        thumb: `places/${placeRef.id}/web/thumb/${filename}.webp`,
        md: `places/${placeRef.id}/web/md/${filename}.webp`,
        lg: `places/${placeRef.id}/web/lg/${filename}.webp`
      },
      credit: /* lấy từ after.photos */ ''
    });
  }

  await placeRef.update({ photos, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
});
```

> **Chú ý:** xử lý lỗi, retry, idempotent; xóa `drafts/places/{draftId}` sau khi publish thành công.

---

## 7) Phân quyền & đồng bộ với Firestore
- **Chỉ Moderator/Admin** được approve/publish draft → Functions thao tác Storage.  
- Người dùng **không bao giờ** ghi trực tiếp vào `places/...` → tránh bypass kiểm duyệt.  
- Đường dẫn ảnh hiển thị trên web luôn lấy từ `places/{placeId}/web/...`.

---

## 8) Tối ưu hiển thị ảnh trên web
- Sử dụng **`<img srcset>`** để tự chọn biến thể phù hợp viewport.  
- **Lazy‑load** và **placeholder blur** (có thể sinh thêm biến thể cực nhỏ 16–32px).  
- Dùng **CDN Firebase** mặc định; có thể gắn **Cloud CDN** nếu cần sau.

Ví dụ:
```html
<img
  src="/storage/v0/b/<bucket>/o/places%2F<placeId>%2Fweb%2Fmd%2F<file>.webp?alt=media"
  srcset="/storage/v0/b/<bucket>/o/places%2F<placeId>%2Fweb%2Fthumb%2F<file>.webp?alt=media 320w,
          /storage/v0/b/<bucket>/o/places%2F<placeId>%2Fweb%2Fmd%2F<file>.webp?alt=media 768w,
          /storage/v0/b/<bucket>/o/places%2F<placeId>%2Fweb%2Flg%2F<file>.webp?alt=media 1280w"
  sizes="(max-width: 768px) 100vw, 768px"
  alt="Mô tả ảnh địa điểm" />
```

---

## 9) Kiểm duyệt nội dung ảnh (tùy chọn)
- Tích hợp **Google Cloud Vision SafeSearch** trong pipeline để gắn cờ ảnh không phù hợp.
- Từ chối ảnh mờ/nhỏ: kiểm tra kích thước tối thiểu (≥ 800px cạnh dài) trong Function trước khi tạo biến thể.

---

## 10) Nhật ký & theo dõi
- Ghi **audit** cho các thao tác publish/hide ảnh vào `audits` (Firestore).  
- Log lỗi Functions và Storage vào **Cloud Logging**; cảnh báo qua **Alerting**.

---

## 11) Checklist triển khai
- [ ] Bật **App Check** cho web; bắt buộc với Storage/Firestore/Functions.  
- [ ] Áp Storage Rules như mẫu (giới hạn loại file, dung lượng).  
- [ ] Tạo Cloud Function `onDraftApproved` (hoặc job tương đương) xử lý media.  
- [ ] Thiết lập cache-control & bỏ EXIF cho biến thể `web/`.  
- [ ] Kiểm thử E2E: upload → submit → approve → ảnh hiển thị public.  
- [ ] Viết dọn dẹp `drafts/` sau publish; xử lý rollback nếu publish lỗi.  
- [ ] Bảo vệ `places/orig` khỏi truy cập public.

---

## 12) Kế hoạch mở rộng giai đoạn 2
- Hỗ trợ video ngắn (≤ 60s) với transcode (Cloud Run/FFmpeg) và poster frame.  
- CDN tuỳ chỉnh & xử lý ảnh *on-the-fly* (Cloud Run Image Proxy).  
- Watermark nhẹ cho ảnh công khai (tuỳ chọn).  
- Quota & rate‑limit upload theo người dùng/partner.

---

✅ Tài liệu này **đồng bộ** với kiến trúc hiện tại: upload chỉ vào vùng nháp, publish qua Moderator + Cloud Functions, ảnh hiển thị từ biến thể web tối ưu hoá, và Storage Rules chặt chẽ để đảm bảo an toàn – minh bạch.


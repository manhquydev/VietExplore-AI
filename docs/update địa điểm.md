Dưới đây là **tài liệu chi tiết yêu cầu update đồng bộ UI/UX/layout** cho biểu mẫu đăng địa điểm và trang chi tiết địa điểm dự án Du Lịch Việt. Tài liệu này giúp team dev, designer, content và kiểm thử phối hợp làm việc để tạo trải nghiệm chuyên nghiệp, hấp dẫn, thống nhất ở cả đầu vào lẫn đầu ra:

***

### 1. Mục tiêu tổng thể

- Tăng sự chuyên nghiệp, hấp dẫn, nhất quán giữa luồng nhập liệu và hiển thị điểm đến.
- Hạn chế tình trạng nội dung sơ sài/lặp lại.
- Tối ưu giao diện, trải nghiệm người dùng, chuẩn hóa đầu ra để dễ kiểm duyệt, tăng giá trị khai thác dài hạn.

***

### 2. Yêu cầu update layout & UI biểu mẫu đăng địa điểm

#### a. Tổng thể

- Chia rõ 3 bước (stepper/card):  
  **Thông tin cơ bản → Vị trí địa lý → Hình ảnh & Nguồn/minh họa**
- Luôn hiển thị tiến trình nhập với thanh trạng thái trực quan, chỉ rõ user đang ở bước nào.
- Áp dụng responsive, điều chỉnh phù hợp cả mobile và desktop.

#### b. Cụ thể từng trường

| Trường | Yêu cầu UI/UX | Yêu cầu nội dung | Validation |
|---|---|---|---|
| Tên địa điểm | Input lớn, font rõ, tự động gợi ý nếu trùng tên | Tối thiểu 5 ký tự | Không giống hoàn toàn với địa điểm có sẵn |
| Loại hình | ComboBox chọn (searchable) + icon minh họa | Có gợi ý VD: bãi biển, bảo tàng… | Phải chọn |
| Mô tả ngắn | Textarea, gợi ý “1-2 câu nổi bật nhất về điểm đến” | Tối thiểu 30 ký tự. Hiển thị ví dụ mẫu ngay dưới field | Không cho submit nếu quá ngắn |
| Mô tả chi tiết | Textarea lớn hơn. Gợi ý cấu trúc: “Lịch sử - Cảnh đẹp - Đặc sản - Trải nghiệm thực tế” | Tối thiểu 150 ký tự. Có ví dụ mẫu (ẩn/show tooltip) | Không submit nếu chưa đủ |
| Giờ mở cửa, phí vào cửa, thời điểm tốt nhất | 3 field layout ngang dễ nhập | Có label phụ, ví dụ điền | Nếu trống tự động chuyển “Chưa rõ” trên chi tiết |
| Tiện ích | Hiển thị grid có icon, click tự động chọn/deselect | Tooltip giải thích ngắn cho từng tiện ích | Tùy chọn |
| Tags | Đề xuất tags phổ biến khi gõ, hạn chế tối đa gõ tự do | Gợi ý tag theo domain | Không bắt buộc |

#### Bước 2 – Vị trí địa lý

- Các trường chọn tỉnh, quận/huyện, xã/phường liên kết động (select cascade).
- Trực quan bằng maps mini (OpenStreetMap/Google Maps nhỏ) để xác thực vị trí, kéo thả chọn trên bản đồ.
- Có gợi ý, autofill địa chỉ thực.

#### Bước 3 – Hình ảnh & Nguồn

| Trường | Yêu cầu UI/UX | Validation | 
|---|---|---|
| Hình ảnh | Có gallery upload, preview ngay khi tải lên | Tối thiểu 3 ảnh, có thể phân loại/cắt ảnh cover và caption từng ảnh. Chỉ nhận file jpg, png < 5MB |
| Video (tùy chọn) | Hỗ trợ drag-drop, preview | Format mp4/mov/avi | Không bắt buộc |
| Nguồn tham khảo | Thêm nhanh, auto suggestion các nguồn uy tín | Loại nguồn (website/chuyên gia/báo), URL hợp lệ, mô tả ngắn | Bắt buộc ít nhất 1 nguồn |

***

### 3. Yêu cầu update UI/UX/layout trang chi tiết địa điểm

#### a. Header và block đầu trang

- Tên địa điểm + loại hình dạng badge/icon nổi bật.
- Ảnh cover lớn, crop chuẩn 16:9 trên desktop, tỷ lệ tự co mobile.
- Có breadcrumb (đường dẫn) rõ ràng để điều hướng về danh mục cha.

#### b. Thư viện hình/video & mô tả

- **Ảnh gallery:** Cho phép lướt sliding hoặc grid; click vào mở lightbox full-screen, có chú thích ảnh ngắn.
- **Video:** Nếu có, ưu tiên hiển thị kế bên hoặc dưới ảnh chính.
- **Mô tả ngắn:** Dưới tên địa điểm 1-2 câu tóm tắt súc tích, màu nổi hoặc italic.
- **Mô tả chi tiết:** Phân đoạn, bôi đậm điểm đặc sắc (lịch sử - thắng cảnh - trải nghiệm - gợi ý lịch trình).

#### c. Block tiện ích

- Grid 2-4 cột, mỗi tiện ích là một icon + label rõ ràng.
- Tooltip giải thích ngắn khi hover/long-press.
- Các tiện ích nổi bật (như Wifi miễn phí, nhà hàng, chỗ đỗ xe…) lên đầu.

#### d. Vị trí & chỉ đường

- Bản đồ nhúng trực tiếp, marker to rõ, kèm nút “Chỉ đường Google Maps”.
- Thông tin địa chỉ chi tiết và các liên kết bổ trợ (gần trạm xe buýt, taxi…).

#### e. Đánh giá & phản hồi

- Khu vực review, hiển thị điểm số trung bình, hiển thị nhận xét của khách & form gửi đánh giá ngay bên dưới (hạn chế reload/phải đăng nhập).
- Sắp xếp review hữu ích lên đầu.

#### f. Nguồn tham khảo & đóng góp

- Hiển thị theo dạng bảng, logo nguồn uy tín (nếu là báo/website lơn), link truy cập nhanh.
- Block “Lịch sử cập nhật”, ai đã đóng góp, timestamp rõ ràng (tăng trust).
- CTA rõ ràng: “Đề xuất chỉnh sửa”, “Báo cáo sai sót”, “Thêm vào lịch trình”, “Chia sẻ”.

#### g. Các chi tiết bổ sung

- Đảm bảo font size tối ưu cho đọc trên mọi thiết bị, khoảng cách dòng hợp lý, màu nền – text tương phản tốt cho người lớn tuổi, trẻ nhỏ cùng sử dụng.
- UX truyền cảm hứng: sử dụng icon, hình họa vui nhộn, màu sắc tươi sáng; tránh “lạnh lùng”/quá máy móc.
- Đảm bảo tối ưu SEO: thẻ mô tả, heading, alt ảnh chuẩn schema du lịch.

***

### 4. Kiểm thử & hướng dẫn phối hợp

- Có checklist nội dung nhập liệu (cho quản trị viên kiểm tra).
- Có bảng tham chiếu layout trước/sau, ghi phiên bản cập nhật, log change UI/UX với dev/designer/tester cùng ký nhận.

***

### 5. Checklist tổng hợp để gửi cho toàn team

**Nhập liệu:**
- [ ] Tiêu đề, loại hình, mô tả ngắn/chi tiết có ví dụ & xác thực ký tự tối thiểu
- [ ] 3 ảnh trở lên đầy đủ caption, chất lượng tốt, đúng format
- [ ] Thông tin vị trí đầy đủ, có bản đồ xác thực
- [ ] Nội dung review hoặc chia sẻ trải nghiệm thực tế (nếu có)

**Hiển thị:**
- [ ] Trình bày bố cục rõ ràng, chuyên nghiệp, dễ đọc cả desktop lẫn mobile
- [ ] Block tiện ích có icon sinh động, phân nhóm logic
- [ ] Mô tả nổi bật, gallery ảnh/video bắt mắt
- [ ] Có khu vực review/thảo luận/đề xuất chỉnh sửa tiện dụng
- [ ] Nút chia sẻ & lưu lịch trình, điều hướng breadcrumbs rõ ràng
***

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/62961541/31ad9eed-4ec5-4447-a9e6-1f2d12c0b1bb/screenshot.jpg)
[2](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/62961541/a759da2b-2e4d-463c-a047-9b82a27427ca/screenshot.jpg)
[3](http://localhost:9002/places/z3omu18L4NLGKpFiCTnq)
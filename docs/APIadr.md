Dưới đây là tài liệu hoàn chỉnh, tổng hợp từ 3 phần: **giới thiệu, hướng dẫn API, ví dụ sử dụng, và format response** – đã được biên soạn lại rõ ràng, mạch lạc, phù hợp cho lập trình viên và chuyên viên ứng dụng:

***

# 🇻🇳 Vietnam Province API – Tài liệu hướng dẫn sử dụng

***

## 1. Giới thiệu chung

- **Vietnam Province API** là dịch vụ miễn phí, không cần đăng ký tài khoản hoặc API key, cung cấp thông tin địa giới hành chính chuẩn mới nhất (tỉnh/thành phố, quận/huyện, xã/phường) của Việt Nam.
- Thiết kế chuẩn REST, tích hợp dễ dàng vào các ứng dụng web, app di động hoặc desktop.
- **Không giới hạn số lượt gọi, không thu phí, không cần đăng ký.**

***

## 2. Các endpoint chính

### 2.1. Lấy danh sách tỉnh/thành phố

- **GET:** `https://tailieu365.com/api/address/province?mode=2`
- **mode tuỳ chọn:**
  - `mode=0`: Lấy cả cũ và mới
  - `mode=1`: Chỉ tỉnh/thành cũ
  - `mode=2`: Chỉ tỉnh/thành mới (khuyên dùng)
- **Trả về:** Danh sách tất cả tỉnh/thành phố cùng thông tin cơ bản.

### 2.2. Lấy quận/huyện theo tỉnh/thành phố

- **GET:** `https://tailieu365.com/api/address/district?provinceId={province_id}`
- **Ví dụ:** `provinceId=5`
- **Trả về:** Danh sách quận/huyện thuộc tỉnh/thành phố đó.

### 2.3. Lấy xã/phường theo quận/huyện

- **GET:** `https://tailieu365.com/api/address/ward?districtId={district_id}`
- **Ví dụ:** `districtId=214`
- **Trả về:** Danh sách xã/phường thuộc quận/huyện.

### 2.4. Lấy xã/phường theo tỉnh/thành phố

- **GET:** `https://tailieu365.com/api/address/ward?provinceId={province_id}`
- **Ví dụ:** `provinceId=214`
- **Trả về:** Danh sách xã/phường thuộc tỉnh/thành phố.

***

## 3. Ví dụ sử dụng API

### 3.1. JavaScript (Fetch API)

```javascript
// Lấy danh sách tỉnh/thành phố
fetch('https://tailieu365.com/api/address/province')
  .then(response => response.json())
  .then(data => { console.log('Danh sách tỉnh/thành phố:', data); });

// Lấy quận/huyện theo tỉnh
fetch('https://tailieu365.com/api/address/district?provinceId=5')
  .then(response => response.json())
  .then(data => { console.log('Quận/huyện:', data); });

// Lấy xã/phường theo quận/huyện
fetch('https://tailieu365.com/api/address/ward?districtId=214')
  .then(response => response.json())
  .then(data => { console.log('Xã/phường:', data); });
```

### 3.2. Python (requests)

```python
import requests

# Lấy danh sách tỉnh/thành phố
response = requests.get('https://tailieu365.com/api/address/province')
print(response.json())

# Lấy quận/huyện theo tỉnh
response = requests.get('https://tailieu365.com/api/address/district', params={'provinceId': 5})
print('Quận/huyện:', response.json())

# Lấy xã/phường theo quận/huyện
response = requests.get('https://tailieu365.com/api/address/ward', params={'districtId': 214})
print('Xã/phường:', response.json())
```

### 3.3. cURL

```bash
# Lấy danh sách tỉnh/thành phố
curl --location 'https://tailieu365.com/api/address/province' --header 'Accept: application/json'

# Lấy quận/huyện theo tỉnh
curl --location 'https://tailieu365.com/api/address/district?provinceId=5' --header 'Accept: application/json'

# Lấy xã/phường theo quận/huyện
curl --location 'https://tailieu365.com/api/address/ward?districtId=214' --header 'Accept: application/json'
```

***

## 4. Định dạng dữ liệu trả về (Response Format)

### 4.1. Danh sách tỉnh/thành phố

```json
[
  { "id": 10, "name": "Yên Bái", "isNew": null, "newId": 94304 },
  { "id": 16, "name": "Phú Thọ", "isNew": null, "newId": 94302 }
]
```
- **id:** Mã tỉnh/thành phố
- **name:** Tên tỉnh/thành phố
- **isNew:** Đánh dấu mới (null hoặc true)
- **newId:** Mã mới khi có sáp nhập

### 4.2. Danh sách quận/huyện

```json
[
  { "id": 797, "name": "Huyện Lâm Bình", "provinceId": 5 },
  { "id": 180, "name": "Huyện Sơn Dương", "provinceId": 5 }
]
```
- **id:** Mã quận/huyện
- **name:** Tên quận/huyện
- **provinceId:** Mã tỉnh/thành

### 4.3. Danh sách xã/phường

```json
[
  { "id": 94356, "name": "Xã Cát Hải", "districtId": null, "provinceId": 433, "isNew": null, "newId": 94301 },
  { "id": 94357, "name": "Phường An Khê", "districtId": null, "provinceId": 214, "isNew": true, "newId": null }
]
```
- **id:** Mã xã/phường
- **name:** Tên xã/phường
- **districtId:** Mã quận/huyện (có thể null)
- **provinceId:** Mã tỉnh/thành
- **isNew:** Đánh dấu mới (null hoặc true)
- **newId:** ID mới sau sáp nhập (nếu có)

***

## 5. Cam kết & hỗ trợ

- API tối ưu cho tốc độ – miễn phí toàn diện – dành cho cộng đồng lập trình viên Việt Nam.
- **Ủng hộ tác giả:**  
  - MoMo: 0363709786  
  - BIDV: 3143463645 – Nguyễn Thành Lộc  
  - ZaloPay: 0363709786  
  - Paypal: nguyenthanhlocpc@gmail.com

***

**Ghi chú:**  
Có thể thử nghiệm các endpoint trực tiếp bằng Postman, Insomnia hoặc trình duyệt tuỳ ý.  
Trường `isNew`, `newId` nhằm đảm bảo đồng bộ dữ liệu khi có sự thay đổi đơn vị hành chính.

***

*Đây là bản tài liệu hoàn chỉnh, có thể dùng làm tài liệu tham khảo, học tập hoặc tích hợp hệ thống thực tế.*

[1](https://tailieu365.com/new-address-api)
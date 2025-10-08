# 🇻🇳 Vietnam Address API – tailieu365.com

API miễn phí cung cấp thông tin về tỉnh, thành phố, quận, huyện, xã, phường mới sáp nhập Việt Nam. Dễ dàng tích hợp vào web, mobile hoặc desktop.

***

## 🚀 API Endpoints

### 1. Lấy tất cả tỉnh/thành phố

**Endpoint:**
```
GET https://tailieu365.com/api/address/province?mode=2
```
- Trả về danh sách tất cả tỉnh/thành phố của Việt Nam.
- **Tham số “mode”:**
  - `mode=0`: Lấy tỉnh/thành phố cả cũ và mới (default)
  - `mode=1`: Chỉ lấy tỉnh/thành phố cũ
  - `mode=2`: Chỉ lấy tỉnh/thành phố mới

***

### 2. Lấy quận/huyện theo tỉnh

**Endpoint:**
```
GET https://tailieu365.com/api/address/district?provinceId={province_id}
```
- Thay `{province_id}` bằng ID của tỉnh/thành phố cần lấy.
- Ví dụ: `provinceId=5`

***

### 3. Lấy xã/phường theo quận/huyện

**Endpoint:**
```
GET https://tailieu365.com/api/address/ward?districtId={district_id}
```
- Thay `{district_id}` bằng ID của quận/huyện cần lấy.
- Ví dụ: `districtId=214`

***

### 4. Lấy xã/phường theo tỉnh (mới)

**Endpoint:**
```
GET https://tailieu365.com/api/address/ward?provinceId={province_id}
```
- Thay `{province_id}` bằng ID của tỉnh cần lấy.

***

## 📋 Response Format

### 1. Province List Response

```json
[
  {
    "id": 10,
    "name": "Yên Bái",
    "isNew": null,
    "newId": 94304
  },
  {
    "id": 16,
    "name": "Phú Thọ",
    "isNew": null,
    "newId": 94302
  }
]
```

***

### 2. District List Response

```json
[
  {
    "id": 797,
    "name": "Huyện Lâm Bình",
    "provinceId": 5
  },
  {
    "id": 180,
    "name": "Huyện Sơn Dương",
    "provinceId": 5
  }
]
```

***

### 3. Ward List Response

```json
[
  {
    "id": 94356,
    "name": "Xã Cát Hải",
    "districtId": null,
    "provinceId": 433,
    "isNew": null,
    "newId": 94301
  },
  {
    "id": 94357,
    "name": "Phường An Khê",
    "districtId": null,
    "provinceId": 214,
    "isNew": true,
    "newId": null
  }
]
```

***

## 💡 Ví dụ sử dụng

### - JavaScript (Fetch API)

```javascript
// Lấy danh sách tỉnh/thành phố
fetch('https://tailieu365.com/api/address/province')
  .then(response => response.json())
  .then(data => {
    console.log('Danh sách tỉnh/thành phố:', data);
  });

// Lấy quận/huyện theo tỉnh
fetch('https://tailieu365.com/api/address/district?provinceId=5')
  .then(response => response.json())
  .then(data => {
    console.log('Quận/huyện:', data);
  });

// Lấy xã/phường theo quận/huyện
fetch('https://tailieu365.com/api/address/ward?districtId=214')
  .then(response => response.json())
  .then(data => {
    console.log('Xã/phường:', data);
  });
```

***

### - Python (requests)

```python
import requests
import json

# Lấy danh sách tỉnh/thành phố
response = requests.get('https://tailieu365.com/api/address/province')
if response.status_code == 200:
    provinces = response.json()
    print(json.dumps(provinces, indent=2, ensure_ascii=False))
else:
    print(f'Lỗi: {response.status_code}')

# Lấy quận/huyện theo tỉnh
response = requests.get('https://tailieu365.com/api/address/district', params={'provinceId': 5})
districts = response.json()
print('Quận/huyện:', districts)

# Lấy xã/phường theo quận/huyện
response = requests.get('https://tailieu365.com/api/address/ward', params={'districtId': 214})
wards = response.json()
print('Xã/phường:', wards)
```

***

### - cURL

```bash
# Lấy danh sách tỉnh/thành phố
curl --location 'https://tailieu365.com/api/address/province' \
  --header 'Accept: application/json'

# Lấy quận/huyện theo tỉnh (provinceId = 5)
curl --location 'https://tailieu365.com/api/address/district?provinceId=5' \
  --header 'Accept: application/json'

# Lấy xã/phường theo quận/huyện (districtId = 214)
curl --location 'https://tailieu365.com/api/address/ward?districtId=214' \
  --header 'Accept: application/json'

# Pretty print JSON với jq
curl --location 'https://tailieu365.com/api/address/province' \
  --header 'Accept: application/json' | jq '.'
```

***

## ⚡ Tính năng

- API miễn phí, không giới hạn số lượng request, không cần đăng ký tài khoản hay API key phức tạp.
- Chuẩn RESTful, dễ tích hợp cho mọi ứng dụng web, mobile, desktop.
- Dữ liệu cập nhật mới nhất!

***


---

[1](https://tailieu365.com/new-address-api)
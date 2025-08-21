# 🌳 Sitemap Tree Generator

Công cụ tạo sitemap tree chi tiết cho dự án VietExplore-AI với khả năng xuất ra file hoặc hiển thị terminal.

## 📋 Các Scripts Có Sẵn

### 1. **Hiển thị Terminal (Có Màu Sắc)**
```bash
# Hiển thị sitemap tree trực tiếp trên terminal với màu sắc
npm run sitemap:tree
```

### 2. **Xuất File TXT (Không Màu)**
```bash
# Tạo file txt trong thư mục docs/
npm run sitemap:file

# Hoặc sử dụng script cũ với flag
npm run sitemap:tree:file
```

### 3. **Xem Cấu Trúc App Directory**
```bash
# Hiển thị cấu trúc thư mục src/app
npm run sitemap:routes
```

### 4. **Tạo Sitemap Mới + Xem Tree**
```bash
# Build project và tạo sitemap, sau đó xuất tree ra file
npm run build && npm run sitemap:file
```

## 📂 Output Files

Files được tạo trong thư mục `docs/`:
- `sitemap-tree-YYYY-MM-DD.txt` - Tree structure đầy đủ
- Format: UTF-8 encoding, tương thích với mọi editor

## 📊 Thông Tin Được Hiển Thị

### 1. **App Directory Routes**
- Cấu trúc tree của tất cả routes trong `src/app/`
- Phân biệt: Static routes, Dynamic routes `[param]`, Catch-all `[...slug]`

### 2. **Generated Sitemap URLs** 
- Tất cả URLs từ sitemap.xml được phân loại:
  - **Core Pages**: Trang chủ, About, Help, Resources
  - **Places**: Địa điểm, categories, regions, provinces  
  - **Community**: Cộng đồng, guidelines, announcements
  - **AI Assistant**: Chat, Plan
  - **Legal**: Terms, Privacy, Content Policy
  - **Other**: Itineraries, Profiles, Contribute

### 3. **Route Analysis**
- Thống kê số lượng routes theo loại
- Tổng số URLs trong sitemap

## 🎨 Features

### Terminal Display
- 🌈 **Màu sắc phân biệt**: 
  - Xanh lá: Static routes
  - Vàng: Dynamic routes
  - Tím: Catch-all routes
- 📋 **Tree structure** trực quan
- 📊 **Thống kê real-time**

### File Output  
- 📄 **Clean text format** (không màu)
- 🕐 **Timestamp** tạo file
- 📈 **Đầy đủ thông tin** như terminal
- 💾 **UTF-8 encoding** chuẩn

## 📖 Ví Dụ Output

### Terminal (Có Màu)
```
🌳 VietExplore-AI Sitemap Tree Generator
==================================================

📁 App Directory Routes:
└── /
    ├── about
    │   ├── contact
    │   ├── mission
    │   └── partnership
    ├── ai-assistant [màu xanh]
    │   ├── chat
    │   └── plan
    ├── places
    │   └── [slug] [dynamic] [màu vàng]

📊 Total Routes: 37
📊 Total Sitemap URLs: 96
```

### File Output (docs/sitemap-tree-2025-08-21.txt)
```
🌳 VietExplore-AI Sitemap Tree Generator
==================================================

📁 App Directory Routes:
└── /
    ├── about
    │   ├── contact
    │   ├── mission
    │   └── partnership
    
Places: (55 URLs)
├── /places/map
├── /places/vinh-ha-long  
├── /places/bai-bien-my-khe
└── ...

📊 Total Routes: 37
📊 Total Sitemap URLs: 96
📈 Route Analysis:
├── Static Routes: 31
├── Dynamic Routes: 6  
└── Catch-all Routes: 0

Generated on: 2025-08-21T05:04:24.343Z
```

## 🛠️ Technical Details

### Files
- `scripts/generate-sitemap-tree.js` - Main script (terminal + file output)
- `scripts/generate-sitemap-file.js` - File-only script (clean output)

### Dependencies
- Node.js built-in modules only (fs, path)
- Reads from: `src/app/` directory, `public/sitemap-0.xml`
- Outputs to: `docs/` directory

### Auto-generation
- Sitemap tự động update sau mỗi `npm run build`
- Tree generator có thể chạy độc lập bất cứ lúc nào

## 🚀 Usage Tips

1. **Development**: Sử dụng `npm run sitemap:tree` để xem nhanh
2. **Documentation**: Sử dụng `npm run sitemap:file` để tạo file share
3. **CI/CD**: Có thể integrate vào build process
4. **Monitoring**: Track changes khi thêm routes mới

## 📝 Notes

- File output không chứa ANSI color codes
- Tự động tạo thư mục `docs/` nếu chưa có
- Filename có timestamp để tránh ghi đè
- Compatible với Windows, macOS, Linux

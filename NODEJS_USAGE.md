# Dự Án Có Dùng Node.js Không?

## Câu Trả Lời Ngắn Gọn

**CÓ** - Dự án VietExplore-AI sử dụng Node.js làm nền tảng chính cho cả frontend và backend.

## Chi Tiết

### 1. Node.js Được Sử Dụng Ở Đâu?

#### **Frontend - Next.js Application**
Dự án sử dụng **Next.js 15.3.3**, một framework React được xây dựng trên Node.js.

**Package.json chính:**
```json
{
  "name": "Du-Lich-Viet",
  "version": "3.0.0",
  "scripts": {
    "dev": "node scripts/start-dev.js",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  },
  "dependencies": {
    "next": "15.3.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "firebase": "^11.10.0",
    "genkit": "^1.16.1",
    ...
  }
}
```

#### **Backend - Firebase Cloud Functions**
Thư mục `functions/` chứa Firebase Cloud Functions chạy trên Node.js.

**functions/package.json:**
```json
{
  "name": "functions",
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "firebase-admin": "^12.1.0",  // Functions sử dụng v12
    "firebase-functions": "^5.0.0"
  }
}
```

**Lưu ý:** Main app sử dụng `firebase-admin@^13.4.0` (Server Components), trong khi Firebase Functions sử dụng `firebase-admin@^12.1.0` (Cloud Functions runtime). Cả hai đều tương thích và hoạt động độc lập.

### 2. Yêu Cầu Node.js Version

Dự án yêu cầu:
- **Node.js >= 18.0.0** cho ứng dụng Next.js
- **Node.js 20** cho Firebase Cloud Functions (bắt buộc)
- **npm >= 9.0.0** cho quản lý packages

### 3. Các Công Nghệ Phụ Thuộc Node.js

| Công Nghệ | Mô Tả | Phụ Thuộc Node.js |
|-----------|-------|-------------------|
| **Next.js 15** | React framework với SSR | ✅ Có |
| **TypeScript** | Ngôn ngữ lập trình | ✅ Có (compile bằng tsc) |
| **Firebase Functions** | Serverless backend | ✅ Có (chạy trên Node.js 20) |
| **Google Genkit** | AI framework | ✅ Có |
| **Jest** | Testing framework | ✅ Có |
| **ESLint** | Code linting | ✅ Có |

### 4. Scripts Node.js Trong Dự Án

Dự án có nhiều scripts Node.js:

```bash
# Development
npm run dev                 # Chạy server dev với Node.js
npm run build               # Build ứng dụng
npm run start               # Start production server

# Scripts utilities
node scripts/start-dev.js                  # Auto-select port
node scripts/seed-places-vietnam.js        # Seed data
node scripts/create-admin-user.js          # Tạo admin user
node scripts/generate-sitemap-tree.js      # Generate sitemap
```

### 5. Cài Đặt và Chạy Dự Án

**Bước 1: Kiểm tra Node.js**
```bash
node --version    # Phải >= 18.0.0
npm --version     # Phải >= 9.0.0
```

**Bước 2: Cài đặt dependencies**
```bash
npm install
cd functions && npm install && cd ..
```

**Bước 3: Chạy development server**
```bash
npm run dev       # Server chạy tại http://localhost:9002
```

### 6. Kiến Trúc Node.js

```
VietExplore-AI/
├── package.json              # Node.js dependencies cho Next.js
├── functions/
│   └── package.json         # Node.js dependencies cho Firebase Functions
├── scripts/
│   ├── start-dev.js         # Node.js script
│   ├── seed-places-vietnam.js
│   └── create-admin-user.js
├── src/
│   └── app/
│       └── api/             # Next.js API Routes (Node.js runtime)
└── node_modules/            # Node.js packages
```

### 7. Node.js Packages Chính

**Runtime Dependencies (major packages):**
- `next@15.3.3` - Framework chính
- `react@18.3.1` - UI library
- `firebase@11.10.0` - Firebase SDK (client-side)
- `firebase-admin@13.4.0` - Admin SDK (main app)
- `firebase-admin@12.1.0` - Admin SDK (functions/)
- `genkit@1.16.1` - AI framework
- `typescript@5.9.2` - Type system

**Dev Dependencies (key packages):**
- `jest@30.0.5` - Testing
- `eslint@9.37.0` - Linting
- `@types/node@20` - TypeScript types cho Node.js

### 8. Tại Sao Cần Node.js?

1. **Next.js Framework**: Không thể chạy Next.js mà không có Node.js
2. **SSR (Server-Side Rendering)**: Next.js cần Node.js để render React components trên server
3. **API Routes**: Next.js API routes chạy trên Node.js runtime
4. **Firebase Functions**: Cloud functions chạy trên Node.js 20 environment
5. **Build Tools**: npm, TypeScript compiler, ESLint đều yêu cầu Node.js
6. **Development Tools**: Hot reload, dev server đều chạy trên Node.js

## Kết Luận

**VietExplore-AI là một dự án 100% Node.js-based.** Không thể phát triển, build, hoặc chạy dự án này mà không có Node.js.

### Checklist Node.js Usage

- ✅ Next.js 15.3.3 (Node.js runtime)
- ✅ Firebase Cloud Functions (Node.js 20)
- ✅ npm scripts và package management
- ✅ TypeScript compilation với tsc
- ✅ Jest testing framework
- ✅ ESLint code linting
- ✅ Development server (Next.js dev)
- ✅ Production server (Next.js start)
- ✅ Build process (Next.js build)
- ✅ Utility scripts (seed data, admin user, etc.)

---

**Tóm lại**: Dự án này **BẮT BUỘC** phải có Node.js để hoạt động. Node.js là nền tảng cốt lõi của toàn bộ stack công nghệ.

**Kiểm tra Node.js version của bạn**: Chạy `node --version` để kiểm tra. Đảm bảo bạn có Node.js >= 18.0.0 hoặc Node.js 20 (được khuyến nghị cho Firebase Functions).

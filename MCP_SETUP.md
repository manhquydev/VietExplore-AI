# MCP (Model Context Protocol) Setup Guide - VietExplore-AI

## 📋 Tổng Quan

Dự án VietExplore-AI đã được cấu hình với **3 MCP Servers** để tối ưu hóa workflow phát triển với Claude Code:

### ✅ MCP Servers Đã Cài Đặt

| MCP Server | Mức Độ Ưu Tiên | Chức Năng Chính |
|------------|----------------|-----------------|
| **🔥 Firebase MCP** | Critical (10/10) | Thao tác trực tiếp với Firestore, Auth, Storage |
| **🧠 Sequential Thinking** | High (9/10) | Structured problem-solving cho complex tasks |
| **📁 Filesystem** | High (8/10) | Safe file operations với read/write access |

---

## 🚀 Cài Đặt

### 1. Packages Đã Được Cài Global

```bash
npm install -g @gannonh/firebase-mcp
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-sequential-thinking
```

### 2. File Cấu Hình

File `.claude/mcp.json` đã được tạo với cấu hình:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "@gannonh/firebase-mcp"],
      "env": {
        "FIREBASE_PROJECT_ID": "vietexplore-ai",
        "GOOGLE_APPLICATION_CREDENTIALS": "./firebase-service-account.json"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "c:\\Users\\manhq\\Downloads\\da2\\VietExplore-AI"
      ]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

---

## 📚 Use Cases Theo MCP Server

### 🔥 Firebase MCP Server

**Khi nào sử dụng:**
- Debug Firestore queries với 20+ composite indexes
- Kiểm tra user roles & permissions (6-tier system)
- Quản lý moderation queue workflow
- Upload/manage images trong Firebase Storage
- Verify Firestore security rules

**Ví dụ câu lệnh với Claude:**
```
"Show me all users with role 'moderator' in Firestore"
"Check the moderation_queue for pending items"
"List all places in region 'bac-bo' with status 'published'"
"Upload image to Firebase Storage at path places/images/"
```

**Collections chính:**
- `users` - User profiles với role-based permissions
- `places` - Travel destinations (1000+ documents)
- `moderation_queue` - Content review workflow
- `moderation_logs` - Audit trail
- `itineraries` - User-generated trip plans

---

### 🧠 Sequential Thinking MCP Server

**Khi nào sử dụng:**
- Planning complex features (multi-stage workflows)
- Debugging role permission cascading
- Architectural design decisions
- Analyzing moderation queue logic
- Large-scale refactoring

**Ví dụ câu lệnh với Claude:**
```
"Break down the process of adding a new role to the permission system"
"Analyze the moderation workflow from draft to published"
"Plan refactoring of the image upload system"
"Design a new feature for place recommendations"
```

**Complex Systems trong dự án:**
1. **6-tier Role System**: Guest → Traveler → Contributor → Partner → Moderator → Admin
2. **3-stage Moderation**: draft → submitted → in_review → published/rejected
3. **Trust Label System**: community → contributor → partner → verified
4. **Regional Structure**: bac-bo, trung-bo, nam-bo

---

### 📁 Filesystem MCP Server

**Khi nào sử dụng:**
- Quản lý 19 seeding scripts trong `/scripts/`
- Organize Next.js App Router structure
- Safe refactoring file structure
- Batch file operations
- Config file management

**Ví dụ câu lệnh với Claude:**
```
"Show me all route files in src/app/api/"
"List all scripts in the scripts/ directory"
"Find all files importing firebase-admin"
"Create a new API endpoint for place reviews"
```

**Cấu trúc quan trọng:**
```
VietExplore-AI/
├── src/
│   ├── app/              # Next.js 15 App Router
│   │   ├── api/          # 50+ API endpoints
│   │   ├── admin/        # Admin dashboard pages
│   │   └── places/       # Place listing pages
│   ├── lib/
│   │   ├── auth/         # Permission system
│   │   ├── types/        # TypeScript schemas
│   │   └── firebase-admin.ts
│   └── components/       # Reusable UI components
├── scripts/              # 19 database seeding scripts
├── firestore.rules       # Security rules
└── firestore.indexes.json # Composite indexes
```

---

## 🛠️ Kích Hoạt MCP Servers

### Trong Claude Code (VSCode Extension)

1. **Restart Claude Code** sau khi tạo file `.claude/mcp.json`
2. MCP servers sẽ tự động load khi Claude Code khởi động
3. Kiểm tra status trong Claude Code settings

### Trong Claude Desktop App

Nếu sử dụng Claude Desktop, thêm vào config file:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Mac/Linux:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

Copy nội dung từ `.claude/mcp.json`

---

## ✅ Verification Checklist

- [ ] File `.claude/mcp.json` đã được tạo
- [ ] Packages đã cài global (`npm list -g --depth=0`)
- [ ] Firebase service account JSON có trong project root
- [ ] Restart Claude Code/VSCode
- [ ] Test Firebase MCP với câu lệnh đơn giản

---

## 🐛 Troubleshooting

### Lỗi: "MCP server failed to start"

**Giải pháp:**
1. Kiểm tra packages đã cài đúng:
   ```bash
   npm list -g | grep mcp
   ```
2. Kiểm tra PATH environment variable
3. Restart terminal/VSCode

### Lỗi: "Firebase credentials not found"

**Giải pháp:**
1. Verify file `firebase-service-account.json` exists
2. Check path trong `GOOGLE_APPLICATION_CREDENTIALS`
3. Hoặc dùng Firebase login:
   ```bash
   firebase login
   ```

### Lỗi: "Permission denied" (Filesystem MCP)

**Giải pháp:**
- Filesystem MCP chỉ có quyền truy cập folder được specify
- Kiểm tra đường dẫn trong config là absolute path
- Windows: dùng `\\` hoặc `/` trong path

---

## 📈 Performance Tips

1. **Firebase MCP**:
   - Limit query results để tránh timeout
   - Dùng indexes đã được define trong `firestore.indexes.json`

2. **Sequential Thinking**:
   - Dùng cho tasks phức tạp, không dùng cho simple queries
   - Giúp break down large features thành smaller steps

3. **Filesystem MCP**:
   - Prefer batch operations over individual file reads
   - Cache frequently accessed files

---

## 🔒 Security Notes

⚠️ **QUAN TRỌNG:**
- `.claude/mcp.json` đã thêm vào `.gitignore` (nên thêm)
- **KHÔNG** commit `firebase-service-account.json`
- MCP servers có full access đến Firebase production data
- Chỉ dùng trên local development environment

---

## 📝 Next Steps

1. ✅ MCP servers đã được setup
2. Test với simple queries
3. Train team members sử dụng MCP
4. Document common use cases
5. Monitor performance và adjust config

---

## 🆘 Support

- **MCP Documentation**: https://modelcontextprotocol.io/
- **Firebase MCP**: https://github.com/gannonh/firebase-mcp
- **Claude Code Docs**: https://docs.claude.com/claude-code

---

**Last Updated:** 2025-10-01
**Version:** 1.0.0
**Project:** VietExplore-AI

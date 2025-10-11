# 📚 Du Lịch Việt - AI | Technical Documentation

> **Tài liệu kỹ thuật toàn diện cho dự án Du Lịch Việt - AI Platform**

---

## 🎯 Mục Đích

Bộ tài liệu này cung cấp kiến thức sâu và toàn diện về kiến trúc, cấu trúc, quy trình và implementation của dự án **Du Lịch Việt - AI**, giúp developers, technical leads và stakeholders hiểu rõ hệ thống từ góc độ kỹ thuật.

**Đối tượng:**
- ✅ Software Engineers (Frontend, Backend, Fullstack)
- ✅ Technical Leads / Architects
- ✅ DevOps Engineers
- ✅ QA/Test Engineers
- ✅ Technical Product Managers

**Không dành cho:**
- ❌ End users (xem User Guide riêng)
- ❌ Marketing/Business teams (xem Business docs riêng)

---

## 📖 Cấu Trúc Tài Liệu

### 🏗️ **[01. System Architecture](./01_SYSTEM_ARCHITECTURE.md)**

**Nội dung:**
- Tech Stack chi tiết (Next.js 15, Firebase, AI)
- Architecture Layers (Presentation, API, Data)
- Directory Structure đầy đủ (`src/app`, `src/components`, `src/lib`, `src/hooks`)
- Data Flow (SSR, API Request, Real-time Notifications)
- Deployment Architecture (Vercel + Firebase)
- Security Architecture
- Performance Optimization

**Khi nào đọc:**
- 🟢 **Bắt đầu tham gia dự án** - Hiểu tổng quan hệ thống
- 🟢 **Onboarding developers mới**
- 🟢 **Khi cần refactor architecture**
- 🟢 **Trước khi design new features**

**Keyword:** Next.js, Firebase, Firestore, App Router, Tech Stack, Deployment

---

### 🔐 **[02. RBAC & Permissions](./02_RBAC_PERMISSIONS.md)**

**Nội dung:**
- 6 cấp độ vai trò (Guest → Traveler → Contributor → Partner → Moderator → Admin)
- Chi tiết permissions cho từng role
- Trust Label System (community, contributor, partner, verified)
- Firestore Security Rules implementation
- API Middleware Authentication
- Role Upgrade Workflow
- Best Practices

**Khi nào đọc:**
- 🟡 **Khi implement tính năng liên quan đến permissions**
- 🟡 **Khi gặp lỗi "Forbidden" hoặc "Unauthorized"**
- 🟡 **Khi cần thêm role/permission mới**
- 🟡 **Debug Firestore rules**

**Keyword:** Roles, Permissions, hasPermission, Authorization, Firestore Rules

---

### 🗄️ **[03. Database Schema](./03_DATABASE_SCHEMA.md)**

**Nội dung:**
- 20 Firestore collections chi tiết
- Schema cho từng collection (users, places, placeDrafts, moderation_queue, reviews, etc.)
- Composite indexes (50+ indexes)
- Data relationships & denormalization strategy
- Data lifecycle (place, moderation, view tracking)
- Example documents

**Khi nào đọc:**
- 🔴 **Bắt buộc đọc trước khi thêm/sửa collection**
- 🔴 **Khi gặp lỗi "Index not found"**
- 🔴 **Khi design new data model**
- 🔴 **Debug data inconsistencies**

**Keyword:** Firestore, Collections, Schema, Indexes, Database, NoSQL

---

### 🔄 **[04. Workflows](./04_WORKFLOWS.md)**

**Nội dung:**
- Content Moderation Workflow (State Machine STRICT)
- Place Submission Workflow (Contributor vs Partner)
- Review System Workflow (Submit, Helpful, Report)
- Real-time Notification Workflow
- Temporary Suspension Workflow
- Role Upgrade Workflow
- View Tracking Workflow (Anti-inflation)

**Khi nào đọc:**
- 🟣 **Khi implement business logic**
- 🟣 **Debug moderation flow issues**
- 🟣 **Hiểu state transitions**
- 🟣 **Khi cần modify workflows**
- 🟣 **Onboarding moderators/admins**

**Keyword:** State Machine, Moderation, Place Submission, Notifications, Cron Jobs

---

### 📡 **[05. API Reference](./05_API_REFERENCE.md)**

**Nội dung:**
- 60+ API endpoints đầy đủ documentation
- Authentication APIs (login, register, password reset)
- Places APIs (CRUD, listing, filtering)
- Admin APIs (user management, moderation)
- Moderation Queue APIs (claim, review, approve/reject)
- Review & Report APIs
- Request/Response examples
- Error codes & handling

**Khi nào đọc:**
- 🔵 **Khi implement API integration**
- 🔵 **Debug API errors (400, 401, 403, 500)**
- 🔵 **Hiểu request/response format**
- 🔵 **Testing API endpoints**

**Keyword:** API, Endpoints, HTTP Methods, Request, Response, Error Handling

---

### ⚛️ **[06. Frontend Components & Hooks](./06_FRONTEND_COMPONENTS_HOOKS.md)**

**Nội dung:**
- 28 custom React hooks chi tiết
- 50+ UI components (pages, layouts, cards, modals)
- Component architecture patterns
- Hook usage examples & best practices
- State management patterns
- Common pitfalls & solutions

**Khi nào đọc:**
- 🟠 **Khi implement frontend features**
- 🟠 **Hiểu data fetching patterns**
- 🟠 **Debug component rendering issues**
- 🟠 **Reuse existing hooks**

**Keyword:** React Hooks, Components, useState, useEffect, Custom Hooks, UI Patterns

---

### 🔔 **[07. Notification System](./07_NOTIFICATION_SYSTEM.md)**

**Nội dung:**
- Real-time notification architecture (Firebase Realtime DB)
- 30+ notification types (place moderation, reviews, reports)
- EnhancedNotificationService API
- Multi-channel delivery (in_app, push, email, SMS)
- User preferences & quiet hours
- Frontend integration (hooks, UI components)
- Best practices & troubleshooting

**Khi nào đọc:**
- 🟤 **Khi add new notification type**
- 🟤 **Debug notification not showing**
- 🟤 **Implement notification preferences**
- 🟤 **Hiểu notification workflow**

**Keyword:** Notifications, Real-time, Firebase Realtime DB, Push, Toast, Bell Icon

---

### 🔒 **[08. Security & Access Control](./08_SECURITY_ACCESS_CONTROL.md)**

**Nội dung:**
- Firestore Security Rules (421 dòng rules code)
- Storage Rules (108 dòng rules code)
- 50+ Composite Indexes
- Custom Token Claims (role-based)
- Rate Limiting strategies
- API Middleware security
- Security best practices & testing

**Khi nào đọc:**
- 🔴 **Khi deploy Firestore rules changes**
- 🔴 **Debug permission denied errors**
- 🔴 **Implement new collection security**
- 🔴 **Security audit & testing**

**Keyword:** Firestore Rules, Storage Rules, Security, Rate Limiting, JWT, Custom Claims

---

### 🧪 **[09. Testing Infrastructure](./09_TESTING_INFRASTRUCTURE.md)**

**Nội dung:**
- Jest configuration & setup
- 10+ test files examples
- API Route testing patterns (Node.js environment)
- Custom Hook testing (jsdom environment)
- Utility function testing
- Mocking strategies (Firebase, APIs, Router)
- Code coverage & CI/CD integration

**Khi nào đọc:**
- 🟢 **Khi viết tests cho new features**
- 🟢 **Debug failing tests**
- 🟢 **Understand mocking patterns**
- 🟢 **Setup CI/CD testing pipeline**

**Keyword:** Jest, Testing, Unit Tests, Mocking, Code Coverage, TDD

---

### 🛠️ **[10. Scripts & Maintenance](./10_SCRIPTS_MAINTENANCE.md)**

**Nội dung:**
- 29+ maintenance scripts documentation
- User Management (create-admin-user, seed-users, clear-all-users)
- Place Management (seed-places-vietnam, fix-stuck-approved-places)
- Moderation Scripts (create-real-moderation-queue, test-moderation-api)
- Testing Scripts (test-auth-flow, test-moderation-flow)
- Firebase Deployment (deploy-firebase-config, check-firebase-config)
- PWA Scripts (generate-pwa-icons)
- Reset & Cleanup Scripts

**Khi nào đọc:**
- 🟡 **Khi setup development environment**
- 🟡 **Seed test data**
- 🟡 **Debug database issues**
- 🟡 **Deploy Firebase configuration**
- 🟡 **Run maintenance tasks**

**Keyword:** Scripts, Seeding, Maintenance, Firebase Admin SDK, Deployment, Testing

---

## 🚀 Quick Start Guide

### Cho Developer Mới

**Ngày 1: Hiểu tổng quan**
1. Đọc [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) - Phần 1, 2, 3 (Tech Stack + Architecture + Directory Structure)
2. Clone repo + setup môi trường (`npm install`, `.env.local`)
3. Chạy `npm run dev` → Khám phá UI

**Ngày 2-3: Hiểu data & permissions**
4. Đọc [03. Database Schema](./03_DATABASE_SCHEMA.md) - Phần 2 (Core Collections)
5. Đọc [02. RBAC & Permissions](./02_RBAC_PERMISSIONS.md) - Phần 1, 2 (Roles & Details)
6. Thử query Firestore từ code

**Ngày 4-5: Hiểu workflows**
7. Đọc [04. Workflows](./04_WORKFLOWS.md) - Sections 1, 2 (Moderation + Place Submission)
8. Chạy thử flow: Tạo draft → Submit → Review → Approve
9. Debug một vài issues để làm quen

**Tuần 2: Deep dive**
10. Đọc toàn bộ tài liệu còn lại
11. Tham gia code review sessions
12. Bắt đầu pick tasks

---

### Cho Technical Lead / Architect

**Tập trung vào:**
- [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) - Sections 2, 4, 5, 7 (Architecture Layers, Data Flow, Deployment, Performance)
- [03. Database Schema](./03_DATABASE_SCHEMA.md) - Sections 4, 5, 6 (Indexes, Relationships, Lifecycle)
- [04. Workflows](./04_WORKFLOWS.md) - All sections (hiểu toàn bộ business logic)

**Decision Points:**
- Scaling strategy → Section 5 (Deployment Architecture)
- Performance bottlenecks → Section 7 (Performance Optimization)
- Security review → Section 6 (Security Architecture)

---

### Cho QA/Test Engineer

**Tập trung vào:**
- [02. RBAC & Permissions](./02_RBAC_PERMISSIONS.md) - Sections 2, 3 (Roles Details, Permission Matrix)
- [04. Workflows](./04_WORKFLOWS.md) - All sections (test cases từ workflows)

**Test Scenarios:**
- Permission matrix → Test mỗi role với mỗi permission
- State machine → Test invalid transitions (should fail)
- Edge cases → Từ workflow descriptions

---

## 🔍 Tìm Kiếm Nhanh

### Theo Từ Khóa

| Từ khóa | Tài liệu | Section |
|---------|----------|---------|
| **Next.js, Tech Stack** | [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) | Section 1 |
| **Directory Structure** | [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) | Section 3 |
| **Roles, Permissions** | [02. RBAC](./02_RBAC_PERMISSIONS.md) | Section 2, 3 |
| **Trust Labels** | [02. RBAC](./02_RBAC_PERMISSIONS.md) | Section 4 |
| **Firestore Rules** | [02. RBAC](./02_RBAC_PERMISSIONS.md) | Section 5 |
| **Database Collections** | [03. Database Schema](./03_DATABASE_SCHEMA.md) | Section 2 |
| **Firestore Indexes** | [03. Database Schema](./03_DATABASE_SCHEMA.md) | Section 4 |
| **Moderation Flow** | [04. Workflows](./04_WORKFLOWS.md) | Section 1 |
| **Place Submission** | [04. Workflows](./04_WORKFLOWS.md) | Section 2 |
| **Review System** | [04. Workflows](./04_WORKFLOWS.md) | Section 3 |
| **Notifications** | [04. Workflows](./04_WORKFLOWS.md) | Section 4 |

### Theo Use Case

| Use Case | Tài liệu cần đọc |
|----------|------------------|
| **Thêm field mới vào places** | [03. Database Schema](./03_DATABASE_SCHEMA.md) → Section 2.2 |
| **Tạo permission mới** | [02. RBAC](./02_RBAC_PERMISSIONS.md) → Section 3 |
| **Fix lỗi moderation flow** | [04. Workflows](./04_WORKFLOWS.md) → Section 1 |
| **Deploy lên production** | [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) → Section 5 |
| **Optimize performance** | [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) → Section 7 |
| **Implement new API endpoint** | [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) → Section 4.2 |

---

## 📋 Checklist Trước Khi Code

### Implement Tính Năng Mới

- [ ] Đọc [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) để hiểu nơi đặt code (directory structure)
- [ ] Kiểm tra [02. RBAC](./02_RBAC_PERMISSIONS.md) xem cần permission mới không
- [ ] Thiết kế database schema → Đọc [03. Database Schema](./03_DATABASE_SCHEMA.md) Section 2
- [ ] Vẽ workflow diagram → Tham khảo [04. Workflows](./04_WORKFLOWS.md)
- [ ] Tạo Firestore indexes nếu cần (BEFORE deploy)
- [ ] Update Firestore rules nếu có collection mới

### Fix Bug

- [ ] Xác định layer gặp lỗi (Frontend? API? Database?)
- [ ] Đọc workflow liên quan trong [04. Workflows](./04_WORKFLOWS.md)
- [ ] Kiểm tra permission logic trong [02. RBAC](./02_RBAC_PERMISSIONS.md)
- [ ] Verify database schema trong [03. Database Schema](./03_DATABASE_SCHEMA.md)
- [ ] Check logs (console, Firebase, Vercel)

### Code Review

- [ ] Architecture alignment → [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md)
- [ ] Permission checks đúng → [02. RBAC](./02_RBAC_PERMISSIONS.md)
- [ ] Database operations optimized → [03. Database Schema](./03_DATABASE_SCHEMA.md)
- [ ] Workflow logic correct → [04. Workflows](./04_WORKFLOWS.md)
- [ ] Tests cover edge cases

---

## 📚 Tài Liệu Liên Quan

### Trong Dự Án

- **CLAUDE.md** - Hướng dẫn cho Claude Code AI
- **.claude/docs/** - Chi tiết từng pattern, pitfall, lesson learned
- **README.md** - Setup & development guide
- **DEPLOYMENT_GUIDE.md** - Deployment instructions

### Tài Liệu Ngoài

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Google Genkit](https://firebase.google.com/docs/genkit)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server (port 9002)
npm run build            # Production build
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint

# Firebase
firebase deploy --only firestore:rules    # Deploy Firestore rules
firebase deploy --only firestore:indexes  # Deploy indexes
firebase deploy --only firestore          # Deploy both

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Watch mode

# AI Development
npm run genkit:dev       # Genkit dev server
```

---

## 📊 Document Statistics

| Tài liệu | Số dòng | Sections | Ước tính thời gian đọc |
|----------|---------|----------|----------------------|
| **01. System Architecture** | 642 | 9 sections | 30 phút |
| **02. RBAC & Permissions** | 688 | 10 sections | 35 phút |
| **03. Database Schema** | 1,065 | 7 sections | 50 phút |
| **04. Workflows** | 862 | 8 sections | 40 phút |
| **05. API Reference** | 2,678 | 12 sections | 90 phút |
| **06. Frontend Components & Hooks** | 1,891 | 11 sections | 60 phút |
| **07. Notification System** | 1,378 | 10 sections | 45 phút |
| **08. Security & Access Control** | 1,831 | 12 sections | 60 phút |
| **09. Testing Infrastructure** | 1,734 | 14 sections | 60 phút |
| **10. Scripts & Maintenance** | 1,670 | 8 sections | 55 phút |
| **TOTAL** | **14,986 dòng** | **111 sections** | **~8.5 giờ** |

**Khuyến nghị:** Đọc từng tài liệu trong nhiều sessions, tập trung 1-2 sections/lần để hiểu sâu.

---

## 🔄 Cập Nhật Tài Liệu

**Quy tắc:**
- Khi thêm collection mới → Update [03. Database Schema](./03_DATABASE_SCHEMA.md)
- Khi thêm role/permission → Update [02. RBAC](./02_RBAC_PERMISSIONS.md)
- Khi thay đổi workflow → Update [04. Workflows](./04_WORKFLOWS.md)
- Khi refactor architecture → Update [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md)

**Version Control:**
- Mỗi tài liệu có version number ở cuối file
- Ngày cập nhật được ghi rõ
- Major changes log trong CHANGELOG.md (future)

---

## 💡 Tips Đọc Tài Liệu Hiệu Quả

1. **Đừng đọc tuần tự từ đầu đến cuối** - Tìm section cần thiết cho task hiện tại
2. **Dùng Ctrl+F để search keyword** - Mỗi tài liệu có section Keyword
3. **Đọc code examples** - Hiểu implementation thực tế
4. **Vẽ diagrams khi đọc** - Giúp visualize architecture/workflows
5. **Thử trên local sau khi đọc** - Hands-on learning
6. **Đặt câu hỏi trong team** - Clarify unclear points

---

## 🎓 Learning Path

### Junior Developer (0-1 năm kinh nghiệm)

**Tuần 1-2:**
- [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) - Sections 1, 2, 3
- [03. Database Schema](./03_DATABASE_SCHEMA.md) - Section 2 (Core Collections)

**Tuần 3-4:**
- [02. RBAC](./02_RBAC_PERMISSIONS.md) - Sections 1, 2
- [04. Workflows](./04_WORKFLOWS.md) - Section 2 (Place Submission)

**Tháng 2:**
- Deep dive vào các sections còn lại
- Thử implement small features

### Mid-Level Developer (1-3 năm)

**Tuần 1:**
- Đọc toàn bộ 4 tài liệu (skim mode)
- Focus vào Sections 4, 5 của mỗi tài liệu (advanced topics)

**Tuần 2:**
- Implement 1 feature từ đầu đến cuối
- Review code của junior devs

### Senior Developer / Tech Lead (3+ năm)

**Ngày 1-2:**
- Đọc toàn bộ với focus vào architecture decisions
- Identify improvement opportunities

**Tuần 1:**
- Propose architecture improvements
- Mentor team members
- Review và update tài liệu nếu cần

---

## ❓ FAQ

**Q: Tôi cần đọc tài liệu nào trước?**
A: Bắt đầu với [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md) để hiểu tổng quan, sau đó đọc tài liệu liên quan đến task hiện tại.

**Q: Làm sao biết permission nào cần cho feature mới?**
A: Xem [02. RBAC](./02_RBAC_PERMISSIONS.md) Section 3 (Permission Mapping Matrix) để tìm permission tương tự.

**Q: Database schema có thể thay đổi không?**
A: Có, nhưng PHẢI update Firestore indexes trước khi deploy. Xem [03. Database Schema](./03_DATABASE_SCHEMA.md) Section 4.

**Q: Workflow có thể skip state không?**
A: KHÔNG. State machine trong moderation là STRICT enforcement. Xem [04. Workflows](./04_WORKFLOWS.md) Section 1.1.

**Q: Làm sao debug permission denied error?**
A: Check 3 layers: Firestore Rules → API Middleware → UI Conditional. Xem [02. RBAC](./02_RBAC_PERMISSIONS.md) Section 6.2.

---

## 📞 Support & Contact

**Khi cần trợ giúp:**
1. Search trong tài liệu này (Ctrl+F)
2. Check `.claude/docs/` folder cho specific issues
3. Ask team trong Slack/Discord
4. Create GitHub issue nếu tìm thấy bug trong docs

**Maintainers:**
- Technical Documentation Team
- Lead Developer
- Tech Lead

---

## 📝 Document Metadata

| Field | Value |
|-------|-------|
| **Version** | 2.1 |
| **Created** | 2025-01-09 |
| **Last Updated** | 2025-10-11 |
| **Total Files** | 10 documents |
| **Total Size** | 14,986 lines |
| **Language** | Vietnamese + English (code) |
| **Format** | Markdown |

---

**Chúc bạn làm việc hiệu quả với dự án Du Lịch Việt - AI! 🚀**

---

## 🗂️ Navigation

**Bắt đầu đọc:**
- → [01. System Architecture](./01_SYSTEM_ARCHITECTURE.md)
- → [02. RBAC & Permissions](./02_RBAC_PERMISSIONS.md)
- → [03. Database Schema](./03_DATABASE_SCHEMA.md)
- → [04. Workflows](./04_WORKFLOWS.md)
- → [05. API Reference](./05_API_REFERENCE.md)
- → [06. Frontend Components & Hooks](./06_FRONTEND_COMPONENTS_HOOKS.md)
- → [07. Notification System](./07_NOTIFICATION_SYSTEM.md)
- → [08. Security & Access Control](./08_SECURITY_ACCESS_CONTROL.md)
- → [09. Testing Infrastructure](./09_TESTING_INFRASTRUCTURE.md)
- → [10. Scripts & Maintenance](./10_SCRIPTS_MAINTENANCE.md)

**Quay lại project root:**
- ← [README.md](../README.md)
- ← [CLAUDE.md](../CLAUDE.md)

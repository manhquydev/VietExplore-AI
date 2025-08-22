# 🌏 VietExplore-AI: Du Lịch Việt Platform

## 🚀 QUICK START

### � **DEVELOPMENT (Khuyến nghị)**
```bash
npm install && cd functions && npm install && cd ..
npm run dev:emulator
```
**👆 Sử dụng Firebase Emulators - An toàn cho testing**

### 🌐 **PRODUCTION DEPLOY**
```bash
npm run deploy
```

---

## 📖 **DOCUMENTATION**

- **📋 [Development Guide](./docs/DEVELOPMENT_GUIDE.md)** - Setup & Workflow
- **🔧 [Technical Docs](./docs/)** - Complete backend implementation

---

## 🌟 **ABOUT PROJECT**

VietExplore AI là nền tảng du lịch thông minh cho Việt Nam, sử dụng AI để gợi ý địa điểm và lên kế hoạch du lịch cá nhân hóa.

### �️ **Tech Stack**
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **AI**: OpenAI API, Gemini AI ready
- **Development**: Firebase Emulators + Hot reload

### 🏗️ **Architecture Highlights**
- **35+ optimized routes** với SSG/SSR
- **Role-based authentication** (traveler, contributor, partner, admin)
- **50+ Cloud Functions** cho business logic
- **Advanced security rules** và data validation
- **Auto media optimization** (WebP, resize, CDN)

## ✅ **IMPLEMENTATION STATUS**

### 🔐 **Authentication System**
- ✅ User registration/login với role system
- ✅ Email verification & password reset
- ✅ Custom claims & blocking functions
- ✅ Profile management

### 🗄️ **Database & Security**
- ✅ Complete Firestore schema
- ✅ Role-based security rules
- ✅ Composite indexes
- ✅ Data validation & integrity

### 📁 **Storage & Media**
- ✅ Secure image upload
- ✅ Auto processing (resize, WebP)
- ✅ EXIF removal & CDN optimization

4. **Advanced Moderation & Business Logic (Tài liệu 4)**
   - AI-enhanced content moderation system
   - SLA tracking và automatic escalation
   - Trust label system cho content quality
   - Comprehensive reports handling
   - Real-time moderation dashboard

5. **Realtime Database & Live Features (Tài liệu 5)**
   - User presence system (online/offline)
   - Moderator activity tracking với typing indicators
   - Real-time moderation queue updates
   - Live itinerary viewer counts
   - Automatic cleanup và TTL management

6. **RBAC System & Admin Management**
   - Role-based access control (Guest → Traveler → Contributor → Partner → Moderator → Admin)
   - Granular permission system với 20+ permissions
   - Admin dashboard cho user management
   - Complete audit trail và compliance tracking
   - Initial setup system với security protection

## 📁 Project Structure

```
VietExplore-AI/
├── src/                          # Next.js application
│   ├── app/                      # App Router pages
│   ├── components/               # Reusable components
│   ├── lib/                      # Utility libraries
│   └── types/                    # TypeScript definitions
├── functions/                    # Firebase Cloud Functions
│   ├── src/
│   │   ├── auth/                 # Authentication functions
│   │   ├── moderation/           # Content moderation
│   │   ├── labels/               # Trust label system
│   │   ├── sla/                  # SLA monitoring
│   │   ├── reports/              # Report handling
│   │   └── storage/              # Media processing
├── docs/                         # Technical documentation
├── firestore.rules               # Database security rules
├── storage.rules                 # Storage security rules
└── firestore.indexes.json       # Database indexes
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Firebase CLI
- Git

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd VietExplore-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Firebase setup**
   ```bash
   firebase login
   firebase use --add  # Select your Firebase project
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env.local
   # Update với Firebase config
   ```

5. **Start development**
   ```bash
   # Terminal 1: Next.js dev server
   npm run dev
   
   # Terminal 2: Firebase emulators
   npm run emulator
   ```

## 🧪 Testing

### Unit Tests
```bash
# Frontend tests
npm test

# Backend tests  
npm run test:functions
```

### Integration Tests
```bash
# With emulators
npm run emulator
npm run test:integration
```

## 🚀 Deployment

### Backend (Firebase)
```bash
npm run deploy:backend
```

### Frontend (Vercel)
```bash
# Auto-deploy on push to main branch
# Or manual deploy:
npm run build
vercel --prod
```

## 📊 Features

### 🏛️ Core Features
- **Place Discovery**: Browse địa điểm theo region/type
- **AI Trip Planning**: Personalized itinerary generation
- **Community Content**: User-contributed places và reviews
- **Quality Control**: Multi-level moderation system

### 👥 User Roles
- **Traveler**: Browse, save places, create itineraries
- **Contributor**: Submit new places, verified content
- **Partner**: Business submissions, enhanced features  
- **Moderator**: Content review, quality control
- **Admin**: Full system management

### 🤖 AI Capabilities
- Smart trip planning based on preferences
- Content quality assessment
- Automated moderation assistance
- Personalized recommendations

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for speed
- **SEO**: Full sitemap với 87 URLs
- **Accessibility**: WCAG 2.1 AA compliant

## 🔒 Security

- **Authentication**: Firebase Auth với MFA
- **Authorization**: Role-based access control
- **Data Protection**: Firestore security rules
- **Content Safety**: AI-powered moderation
- **Privacy**: EXIF removal, data anonymization

## 📚 Documentation

- [Firebase Auth Implementation](docs/FIREBASE_AUTH_COMPLIANCE_CHECK.md)
- [Firestore Data Model](docs/FIRESTORE_DOC2_COMPLIANCE_CHECK.md)  
- [Cloud Storage Setup](docs/STORAGE_DOC3_COMPLIANCE_CHECK.md)
- [Advanced Functions](docs/CLOUD_FUNCTIONS_DOC4_COMPLIANCE_CHECK.md)
- [Deployment Guide](docs/BACKEND_DEPLOYMENT_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase team cho excellent backend services
- Next.js team cho amazing React framework
- Tailwind CSS cho utility-first styling
- Community contributors cho feedback và testing

---

**VietExplore AI** - Khám phá Việt Nam thông minh với AI 🇻🇳
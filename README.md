# VietExplore AI - Du Lịch Việt Platform

## 🌟 Giới Thiệu

VietExplore AI là nền tảng du lịch thông minh cho Việt Nam, sử dụng AI để gợi ý địa điểm và lên kế hoạch du lịch cá nhân hóa. Platform kết hợp nội dung do cộng đồng đóng góp với hệ thống kiểm duyệt chất lượng cao.

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **AI Integration**: Ready for OpenAI API, Gemini AI
- **Testing**: Jest, Firebase Emulators
- **Deployment**: Vercel (Frontend), Firebase (Backend)

## 🏗️ Architecture

### Frontend (Next.js App Router)
- **Pages**: 35+ optimized routes với SSG/SSR
- **Components**: Reusable UI components với Tailwind
- **Auth**: Firebase Authentication integration
- **State**: Context API cho global state management

### Backend (Firebase)
- **Authentication**: Role-based với custom claims
- **Database**: Firestore với advanced security rules  
- **Functions**: 50+ Cloud Functions cho business logic
- **Storage**: Media handling với automatic optimization

## 🔧 Backend Implementation Status

### ✅ Completed Components

1. **Firebase Authentication (Tài liệu 1)**
   - User registration/login với role system
   - Custom claims (traveler, contributor, partner, moderator, admin)
   - Email verification và MFA support
   - Blocking functions cho security
   - Profile management

2. **Firestore Data Model (Tài liệu 2)**
   - Complete schema cho tất cả collections
   - Security rules với role-based access
   - Composite indexes cho performance
   - Data validation và integrity

3. **Cloud Storage & Media (Tài liệu 3)**
   - Image upload với security rules
   - Automatic processing (resize, WebP conversion)
   - EXIF data removal cho privacy
   - CDN optimization

4. **Advanced Moderation & Business Logic (Tài liệu 4)**
   - AI-enhanced content moderation system
   - SLA tracking và automatic escalation
   - Trust label system cho content quality
   - Comprehensive reports handling
   - Real-time moderation dashboard

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
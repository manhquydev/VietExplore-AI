# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Core Development:**
- `npm run dev` - Start development server on port 9002
- `npm run build` - Production build with sitemap generation (includes `next-sitemap` postbuild)
- `npm run typecheck` - TypeScript type checking without build
- `npm run lint` / `npm run lint:fix` - ESLint validation and auto-fix

**Testing:**
- `npm test` - Run Jest test suite
- `npm run test:watch` - Jest in watch mode for development
- `npm run test:coverage` - Generate coverage reports
- `npm run test:ci` - CI-optimized test run

**AI Development:**
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Genkit with file watching for AI flow development

**Utilities:**
- `npm run analyze` - Bundle analysis for performance optimization
- `npm run sitemap:tree` - Generate sitemap tree visualization
- Scripts in `/scripts/` for database seeding and Firebase management

## Architecture Overview

### Tech Stack Foundation
- **Next.js 15** with App Router architecture
- **Firebase** for authentication, Firestore database, and file storage
- **TypeScript** with strict type safety
- **Tailwind CSS** with custom design system
- **Genkit AI** integration for travel itinerary generation

### Authentication & Authorization System

**Role-Based Hierarchy (6 levels):**
```
Guest → Traveler → Contributor → Partner → Moderator → Admin
```

**Permission System:**
- Defined in `src/lib/auth/permissions.ts` 
- Hierarchical inheritance (higher roles inherit lower role permissions)
- Key permissions: `create_place`, `review_content`, `manage_users`, `all_permissions`
- Use `hasPermission(user, permission)` function for access control

**Trust Label System:**
- `community` → `contributor` → `partner` → `verified` 
- Affects content moderation priority and display prominence
- Assigned based on user role and content quality

### Core Data Models

**Place Schema (`src/lib/types/places.ts`):**
- **Status flow:** `draft → submitted → in_review → published/rejected`
- **Regional structure:** Vietnam divided into `bac-bo`, `trung-bo`, `nam-bo`
- **Types:** `bien`, `nui`, `van-hoa`, `am-thuc`, `check-in`
- **Image system:** Firebase Storage integration with auto-resize and validation

**User Schema (`src/lib/types/auth.ts`):**
- Role-based permissions with stats tracking
- Profile data, badges, and contribution metrics
- Email verification and account status management

### API Architecture

**RESTful Endpoints Structure:**
- `GET /api/places` - Public place listing with filtering
- `POST /api/places` - Create new place (requires contributor+ role)
- `PATCH /api/places/[id]` - Update place status/content
- `GET /api/places/my-drafts` - User's draft management
- `GET /api/moderation/queue` - Moderation workflow (moderator+ only)
- `PUT /api/moderation/queue/[itemId]` - Review actions (approve/reject/escalate)

**Authentication Middleware:**
- `verifyAuthToken()` in `src/lib/server/auth-middleware.ts`
- JWT token validation with role-based access control
- Used across all protected API endpoints

### Content Moderation Workflow

**Three-Stage Process:**
1. **Submission:** Contributors create content → `submitted` status
2. **Review Queue:** Moderators review via `/moderation/dashboard`
3. **Publication:** Approved content becomes `published` and public

**Moderation Features:**
- Priority-based queue (urgent → high → medium → low)
- Escalation system for complex cases
- Moderation history tracking and notes
- Real-time dashboard with filtering and search

### Key React Patterns

**Custom Hooks:**
- `useAuth()` - Authentication state management
- `usePlaces(filters)` - Place data fetching with filtering
- `useUserDrafts(options)` - User's draft management with CRUD operations
- `useModerationQueue(filters)` - Admin moderation workflow

**Component Architecture:**
- Compound components with consistent UI patterns
- Role-based conditional rendering throughout
- Custom UI components in `src/components/ui/` built on Radix UI
- Image upload system with Firebase Storage integration

### Firebase Configuration

**Collections:**
- `users` - User profiles and authentication data
- `places` - Travel destinations with full metadata
- `moderation_queue` - Content review workflow
- `moderation_logs` - Audit trail for all moderation actions

**Security Rules:**
- Firestore rules in `firestore.rules` enforce role-based access
- Storage rules in `storage.rules` protect uploaded images
- Composite indexes in `firestore.indexes.json` for complex queries

### Development Workflow

**Branch Strategy:**
- `main` - Production branch
- `develop1` - Current development branch

**Database Seeding:**
- `scripts/seed-places-vietnam.js` - Real Vietnam tourism data
- `scripts/create-real-moderation-queue.js` - Realistic moderation scenarios
- `scripts/seed-users.js` - Test user accounts with various roles

**File Upload System:**
- Firebase Storage path: `places/images/{userId}/{filename}`
- Auto-resize to 1200x800px, 80% quality
- Support for JPG, PNG, WebP (max 5MB)
- Dual interface: file upload or URL input

### AI Integration

**Genkit Framework:**
- Travel itinerary generation in `src/ai/flows/`
- Integrated with Google AI for intelligent trip planning
- Development server on separate port for AI testing

### Error Patterns & Debugging

**Common Issues:**
- **"Firebase Admin SDK not initialized"** - Check `.env.local` variables
- **"The query requires an index"** - Run Firebase index deployment
- **Role permission errors** - Verify user role in `/admin/dashboard`
- **Image upload failures** - Check Firebase Storage rules and auth

**Debugging Tools:**
- Firebase Admin SDK logs in server console
- Role switcher component in development for testing permissions
- Comprehensive error boundaries for user-friendly error handling

When working with this codebase, always consider the role-based permission system, maintain the moderation workflow integrity, and ensure proper Firebase security rule compliance.
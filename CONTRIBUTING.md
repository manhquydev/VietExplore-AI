# Contributing to Du Lịch Việt

Thank you for your interest in contributing to Du Lịch Việt! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- ✅ Use welcoming and inclusive language
- ✅ Be respectful of differing viewpoints
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what is best for the community

### Unacceptable Behavior

- ❌ Harassment or discriminatory language
- ❌ Trolling or insulting comments
- ❌ Publishing others' private information
- ❌ Unprofessional conduct

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** installed
- **Firebase CLI** (for backend changes)
- Basic knowledge of TypeScript, React, and Next.js

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/VietExplore-AI.git
cd VietExplore-AI
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/VietExplore-AI.git
```

4. Install dependencies:

```bash
npm install
```

5. Copy environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

---

## 💻 Development Process

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint:fix

# Run tests
npm test

# Test in dev environment
npm run dev
```

### 4. Commit Your Changes

Follow our [Commit Guidelines](#commit-guidelines).

```bash
git add .
git commit -m "feat: add user profile page"
```

---

## 📝 Coding Standards

### TypeScript

- ✅ Use TypeScript for all new files
- ✅ Define proper types/interfaces
- ✅ Avoid `any` type unless absolutely necessary
- ✅ Use strict mode

**Example:**

```typescript
// ✅ Good
interface Place {
  id: string;
  name: string;
  region: 'bac-bo' | 'trung-bo' | 'nam-bo';
}

// ❌ Bad
const place: any = { ... };
```

### React Components

- ✅ Use functional components with hooks
- ✅ Use TypeScript for props
- ✅ Extract reusable logic into custom hooks
- ✅ Use Radix UI components when possible

**Example:**

```tsx
// ✅ Good
interface PlaceCardProps {
  place: Place;
  onLike: (id: string) => void;
}

export function PlaceCard({ place, onLike }: PlaceCardProps) {
  // Component logic
}

// ❌ Bad
export function PlaceCard(props: any) {
  // Component logic
}
```

### File Organization

```
src/
├── app/              # Next.js pages and routes
├── components/       # Reusable React components
│   ├── ui/          # UI primitives (buttons, cards, etc.)
│   └── [feature]/   # Feature-specific components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and helpers
└── types/           # TypeScript type definitions
```

### Styling

- ✅ Use Tailwind CSS utility classes
- ✅ Follow mobile-first approach
- ✅ Use design system colors and spacing
- ✅ Avoid inline styles unless dynamic

```tsx
// ✅ Good
<div className="flex items-center gap-4 px-6 py-4 bg-white rounded-lg shadow-sm">

// ❌ Bad
<div style={{ display: 'flex', padding: '16px' }}>
```

---

## 📜 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Examples

```bash
# Feature
feat(auth): add Google OAuth login

# Bug fix
fix(places): resolve image upload error on Safari

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(api): simplify place fetching logic

# Breaking change
feat(api)!: change place API response structure

BREAKING CHANGE: Place API now returns `viewCount` instead of `views`
```

---

## 🔄 Pull Request Process

### Before Submitting

1. ✅ Update your branch with latest upstream:

```bash
git fetch upstream
git rebase upstream/main
```

2. ✅ Run all checks:

```bash
npm run typecheck
npm run lint:fix
npm test
```

3. ✅ Update documentation if needed
4. ✅ Add tests for new features

### Submitting PR

1. Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

2. Open a Pull Request on GitHub

3. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

- Maintainers will review your PR within 3-5 business days
- Address any feedback or requested changes
- Once approved, your PR will be merged

---

## 🐛 Issue Reporting

### Before Creating an Issue

1. Search existing issues to avoid duplicates
2. Check if the issue is already fixed in latest version
3. Gather relevant information (browser, OS, screenshots)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
Add screenshots if applicable

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14.0]
- Version: [e.g., 3.0.0]

**Additional context**
Any other relevant information
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of what you want

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or references
```

---

## 🎯 Areas to Contribute

### Good First Issues

Look for issues labeled `good-first-issue`:
- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Adding tests

### High Priority

- Performance optimizations
- Accessibility improvements
- Mobile responsiveness
- Internationalization (i18n)

---

## 📚 Resources

### Documentation

- [README.md](./README.md) - Project overview
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Community

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - General questions and ideas

---

## 📞 Contact

Need help? Reach out:

- **Author**: Nguyễn Mạnh Quý
- **Email**: support@dulichviet.tech
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)

---

## 👨‍💻 Project Owner

**Nguyễn Mạnh Quý**
- Creator and maintainer of Du Lịch Việt
- © 2025 All rights reserved

---

**Thank you for contributing to Du Lịch Việt! 🇻🇳**

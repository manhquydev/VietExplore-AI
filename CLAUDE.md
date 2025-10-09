# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Architecture & Setup

@.claude/docs/core/architecture.md
@.claude/docs/core/moderation-workflow.md
@.claude/docs/core/firebase-setup.md

## Frontend Development

@.claude/docs/frontend/react-patterns.md
@.claude/docs/frontend/notification-system.md
@.claude/docs/frontend/analytics-tracking.md

## Features & Implementation

@.claude/docs/features/ai-features.md
@.claude/docs/features/review-system.md
@.claude/docs/features/pwa-integration.md

## Lessons Learned

### Critical Patterns

@.claude/docs/lessons-learned/critical-patterns/race-conditions.md
@.claude/docs/lessons-learned/critical-patterns/field-cleanup.md

### Common Pitfalls

@.claude/docs/lessons-learned/common-pitfalls/type-mismatches.md
@.claude/docs/lessons-learned/common-pitfalls/api-responses.md
@.claude/docs/lessons-learned/common-pitfalls/formdata-upload.md
@.claude/docs/lessons-learned/common-pitfalls/component-imports.md

### Feature Development

@.claude/docs/lessons-learned/feature-development/genkit-api.md

### Workflow Improvements

@.claude/docs/lessons-learned/workflow-improvements/notification-best-practices.md

## Development Guides

@.claude/docs/guides/development-guide.md

---

## Quick Reference

**Most Common Issues:**
1. Missing component imports → [@component-imports](.claude/docs/lessons-learned/common-pitfalls/component-imports.md)
2. API response structure mismatch → [@api-responses](.claude/docs/lessons-learned/common-pitfalls/api-responses.md)
3. Type mismatches (object vs primitive) → [@type-mismatches](.claude/docs/lessons-learned/common-pitfalls/type-mismatches.md)
4. Race conditions in cron jobs → [@race-conditions](.claude/docs/lessons-learned/critical-patterns/race-conditions.md)
5. Genkit API issues → [@genkit-api](.claude/docs/lessons-learned/feature-development/genkit-api.md)

**Development Commands:**
- `npm run dev` - Start dev server (port 9002)
- `npm run build` - Production build
- `npm run typecheck` - Type checking
- `firebase deploy --only firestore` - Deploy Firebase config

**Key Principles:**
- ✅ Always use `EnhancedNotificationService` for notifications
- ✅ Use `callApi()` helper for authenticated API requests
- ✅ Import components before using them in JSX
- ✅ Validate API response structure before accessing nested properties
- ✅ Use Firestore transactions for atomic updates
- ✅ Clean up state-specific fields when transitioning out of a state
- ✅ Let browser auto-set Content-Type for FormData uploads

When working with this codebase, always consider the role-based permission system, maintain the moderation workflow integrity, ensure proper Firebase security rule compliance, follow the notification workflow patterns for consistency, and use centralized view tracking to prevent count inflation.

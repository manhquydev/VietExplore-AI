# Test Place Posting Workflow

## Test Scenarios

### 1. Draft Creation & Management
```
POST /api/places/drafts
- Create new draft with minimal info
- Verify status = 'draft'
- User can edit multiple times
```

### 2. Draft Update
```
PUT /api/places/drafts/{draftId}
- Update draft content
- Verify only draft status allows editing
- Verify user ownership check
```

### 3. Draft Submission
```
POST /api/places/drafts/{draftId}/submit
- Submit draft for review
- Verify status changes: draft → submitted
- Admin: draft → published (auto)
- Add to moderation queue (non-admin)
```

### 4. Moderation Workflow

#### Start Review
```
PUT /api/moderation/queue/{itemId}
{
  "action": "start_review",
  "reviewNotes": "Starting review process"
}
- Changes place status: submitted → in_review
- User can no longer edit
```

#### Approve Content
```
PUT /api/moderation/queue/{itemId}
{
  "action": "approve",
  "reviewNotes": "Content looks good",
  "newTrustLabel": "verified"
}
- Changes place status: in_review → published
- Sets publishedAt timestamp
- Updates user stats
```

#### Reject Content
```
PUT /api/moderation/queue/{itemId}
{
  "action": "reject", 
  "reviewNotes": "Thông tin không chính xác"
}
- Changes place status: in_review → rejected
- Sets rejectedAt and rejectionReason
- User can edit and resubmit
```

### 5. Edit Permissions Test

#### Status-based Edit Rules
- `draft` → ✅ User can edit
- `submitted` → ✅ User can edit (resets to submitted)
- `in_review` → ❌ User cannot edit
- `published` → ❌ User cannot edit (only admin/moderator)
- `rejected` → ✅ User can edit (resets to submitted)

### 6. User Role Permissions
- `traveler` → ❌ Cannot create places
- `contributor` → ✅ Can create, needs review
- `partner` → ✅ Can create, priority review
- `admin` → ✅ Can create, auto-published

## Status Flow Diagram
```
draft → submitted → in_review → published
  ↑         ↑           ↓
  └─────────┴─────── rejected
```

## API Endpoints Summary
1. `POST /api/places/drafts` - Create draft
2. `PUT /api/places/drafts/{id}` - Update draft
3. `POST /api/places/drafts/{id}/submit` - Submit for review
4. `GET /api/places/my-drafts` - Get user's places
5. `PUT /api/places/{id}` - Edit place (with status rules)
6. `PUT /api/moderation/queue/{itemId}` - Moderate content

## Logging & Audit
- All moderation actions logged to `moderation_logs`
- Place moderation history stored in place document
- User stats updated on approval

## Missing Features to Implement (Frontend)
1. Draft form component
2. Submit vs Save Draft buttons
3. Status indicator in user dashboard
4. Rejection reason display
5. Edit restrictions based on status
6. Moderator review interface with start_review action
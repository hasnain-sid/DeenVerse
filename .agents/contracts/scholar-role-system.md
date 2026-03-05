# Feature Contract: Scholar Role System

> **Created by**: copilot (Opus 4.6)
> **Date**: 2026-03-05
> **Status**: ✅ Complete

---

## 1. Overview

**What**: Add a `scholar` role with verification workflow, RBAC middleware, scholar profile fields, and badge display.
**Why**: Foundation for the entire Islamic education ecosystem — scholars create courses, teach live, answer Q&A, earn salary.
**Scope**: Backend (models, middleware, API) + Frontend (application form, admin review, badge component).

| Layer | Required? | Owner Agent | Status |
|-------|-----------|-------------|--------|
| Shared (types/schemas) | Yes | copilot (Opus) | ✅ Complete |
| Backend (API) | Yes | copilot (Opus) | ✅ Complete |
| Frontend (UI) | Yes | antigravity (prototypes) → copilot-2 (integration) | ✅ Complete |
| Mobile | No | — | — |

---

## 2. API Contract

### Endpoints

```
POST   /api/v1/scholars/apply
  Request:  { credentials: [...], specialties: [...], bio, teachingLanguages: [...], videoIntroUrl }
  Response: { message, applicationId }
  Auth:     Required (user role)
  Status:   ⬜ Not Implemented

GET    /api/v1/scholars/application-status
  Request:  —
  Response: { status: 'none'|'pending'|'approved'|'rejected', applicationDate, rejectionReason }
  Auth:     Required
  Status:   ⬜ Not Implemented

GET    /api/v1/scholars/:id/profile
  Request:  —
  Response: { scholarProfile, user: { name, username, avatar }, courses, rating }
  Auth:     Public
  Status:   ⬜ Not Implemented

# Admin endpoints
GET    /api/v1/admin/scholars/applications
  Request:  ?status=pending&page=1&limit=10
  Response: { applications: [...], pagination }
  Auth:     Required (admin role)
  Status:   ⬜ Not Implemented

PUT    /api/v1/admin/scholars/applications/:userId/review
  Request:  { decision: 'approved'|'rejected', rejectionReason?, specialties? }
  Response: { message, user }
  Auth:     Required (admin role)
  Status:   ⬜ Not Implemented

GET    /api/v1/admin/scholars
  Request:  ?page=1&limit=10
  Response: { scholars: [...], pagination }
  Auth:     Required (admin role)
  Status:   ⬜ Not Implemented
```

---

## 3. Data Model Changes

### userSchema.js extensions

```javascript
role: enum ['user', 'scholar', 'moderator', 'admin']  // add 'scholar'

scholarProfile: {
  verifiedAt: Date,
  verifiedBy: ObjectId (ref: User),
  specialties: [String],  // ['tafseer', 'hadith', 'fiqh', 'arabic', 'tajweed']
  credentials: [{
    title: String,
    institution: String,
    year: Number,
    documentUrl: String
  }],
  bio: String,
  teachingLanguages: [String],
  rating: { average: Number, count: Number },
  totalStudents: Number,
  totalCourses: Number,
  applicationStatus: enum ['none', 'pending', 'approved', 'rejected'],
  applicationDate: Date,
  rejectionReason: String
}
```

### New middleware

```javascript
isScholar         — allows scholar + admin
isScholarOrAdmin  — alias
```

---

## 4. Frontend Requirements

### Pages
- **ScholarApplicationPage**: Form to apply for scholar status (credentails, specialties, bio, video intro)
- **AdminScholarReviewPage**: Admin panel to review pending applications, approve/reject
- **ScholarProfilePage**: Public scholar profile with courses, rating, credentials
- **ScholarBadge**: Reusable component shown next to usernames (green crescent for scholars)

### Hooks
- `useScholarApplication()` — submit application, check status
- `useAdminScholarReview()` — list applications, approve/reject
- `useScholarProfile(id)` — fetch scholar public profile

---

## 5. Dependency Order

1. Shared Zod schemas (scholar application, scholar profile)
2. Backend: userSchema extension + isScholar middleware
3. Backend: scholar routes/controller/service
4. Frontend: prototypes (parallel with step 2-3)
5. Frontend: integration (after step 3 + prototype selection)
6. Testing (after step 3)

---

## 6. Handover Log

| Date | Agent | Action | Notes |
|------|-------|--------|-------|
| 2026-03-05 | copilot | Contract created | Ready for implementation |
| 2026-03-05 | copilot | Backend + Shared complete | isScholar middleware, scholar routes/controller/service, Zod schemas in packages/shared |
| 2026-03-05 | antigravity | Prototypes complete | 5 variants per set delivered; winner selected |
| 2026-03-05 | copilot-2 | Frontend integration complete | ScholarApplicationPage, AdminScholarReviewPage, ScholarEarningsPage, ScholarBadge, useScholarApplication hook |
| 2026-03-06 | copilot-2 | Phase 1 implementation complete | Lint clean, feature board updated, all commits made. TASK-043 closed. |

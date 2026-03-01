# Feature Contract: [Feature Name]

> **Created by**: [agent-id]
> **Date**: YYYY-MM-DD
> **Status**: 📋 Planning | 🔵 In Progress | ✅ Complete

---

## 1. Overview

**What**: One-line description of the feature.
**Why**: Business / user value.
**Scope**: Which layers are involved?

| Layer | Required? | Owner Agent | Status |
|-------|-----------|-------------|--------|
| Shared (types/schemas) | Yes / No | — | ⬜ |
| Backend (API) | Yes / No | — | ⬜ |
| Frontend (UI) | Yes / No | — | ⬜ |
| Mobile | Yes / No | — | ⬜ |

---

## 2. API Contract

Define endpoints BEFORE any agent starts coding. This is the integration agreement.

### Endpoints

```
METHOD  /api/v1/resource
  Request:  { field: type }
  Response: { field: type }
  Auth:     Required / Public
  Status:   ⬜ Not Implemented

METHOD  /api/v1/resource/:id
  Request:  { field: type }
  Response: { field: type }
  Auth:     Required / Public
  Status:   ⬜ Not Implemented
```

### Shared Zod Schema (if needed)

```ts
// packages/shared/src/schemas/<feature>.ts
import { z } from 'zod';

export const featureSchema = z.object({
  // Define fields here
});

export type Feature = z.infer<typeof featureSchema>;
```

---

## 3. Data Model

```js
// backend/models/<feature>Schema.js
{
  field: { type: String, required: true },
  // ...
}
```

---

## 4. Frontend Requirements

- **Route**: `/feature-path`
- **Protected**: Yes / No
- **Components needed**:
  - [ ] `FeaturePage.tsx` — main page
  - [ ] `FeatureCard.tsx` — list item
  - [ ] `useFeature.ts` — TanStack Query hooks
- **State**: What goes in Zustand vs. TanStack Query vs. local state?
- **UI Reference**: Link to prototype or design (if any)

---

## 5. Dependencies & Order of Operations

Define which layer must be done FIRST:

```
1. ⬜ Shared schema defined in packages/shared    → Owner: [agent]
2. ⬜ Backend API endpoints implemented            → Owner: [agent]  → depends on #1
3. ⬜ Frontend UI + hooks implemented              → Owner: [agent]  → depends on #1, #2
4. ⬜ Mobile screen implemented                    → Owner: [agent]  → depends on #1, #2
```

**Critical path**: Shared schema → Backend → Frontend/Mobile (parallel)

---

## 6. Acceptance Criteria

- [ ] All API endpoints return correct responses (test with curl/Postman)
- [ ] Frontend connects to real API (no mocked data in production code)
- [ ] Error states handled (loading, empty, network error)
- [ ] Responsive on mobile viewport
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No lint warnings (`npm run lint`)

---

## 7. Handover Log

Record when each layer is completed so other agents know they can start dependent work.

| Date | Agent | Layer | Action | Notes |
|------|-------|-------|--------|-------|
| — | — | — | — | — |

---

## 8. Integration Verification

After all layers are complete:

- [ ] End-to-end flow works (UI → API → DB → API → UI)
- [ ] Feature board updated (`.agents/feature-board.md`)
- [ ] Contract status set to ✅ Complete

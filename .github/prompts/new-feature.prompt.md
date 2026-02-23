---
mode: agent
description: "Build a full-stack feature end-to-end following DeenVerse conventions"
---

# /new-feature

Build a **complete new feature** end-to-end.

## Your task

Implement the following feature:

**Feature:** {{ input }}

## Steps

### 1. Research Gate

Before writing code, ask the user:

> Do you want deep research first (internet + GitHub + local codebase), or should I implement directly?

Proceed only after the user confirms.

### 2. Frontend

- Create feature folder: `frontend/src/features/<feature>/`
  - `<Feature>Page.tsx` — named export, typed props, responsive, loading/error states.
  - `use<Feature>.ts` — TanStack Query hooks for all API calls.
  - Sub-components as needed.
- Register lazy-loaded route in `App.tsx`.
- Add navigation entry in Sidebar/MobileNav if top-level page.

### 3. Backend (if needed)

- `backend/routes/<feature>Route.js` — endpoints with auth/rate-limit middleware.
- `backend/controller/<feature>Controller.js` — request parsing, try/catch, `next(error)`.
- `backend/services/<feature>Service.js` — business logic, `AppError` for errors.
- `backend/models/<feature>Schema.js` — Mongoose schema if new collection needed.
- Register router in `backend/index.js`.

### 4. Integration

- Wire frontend hooks to backend endpoints via `@/lib/api.ts`.
- Handle auth (access token in header, refresh on 401).
- Validate inputs with Zod (shared schemas in `packages/shared/` if used on both sides).

## Constraints

- Follow all rules in `.github/instructions/new-feature.instructions.md`.
- Follow all rules in `.github/instructions/api-endpoint.instructions.md` (if backend work).
- Follow all rules in `.github/instructions/react-component.instructions.md` (for `.tsx` files).
- TypeScript strict mode in frontend, ESM in backend.
- No `any`, no lint warnings.

## Output

After building, summarize:
- Files created/modified.
- How to test the feature locally.
- Any follow-up work needed.

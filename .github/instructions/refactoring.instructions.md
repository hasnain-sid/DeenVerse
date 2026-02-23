---
description: "refactor, split, extract, cleanup, reorganize, simplify, decouple"
---

# Refactoring Instructions

When the user asks to **refactor**, **extract**, **split**, or **clean up** code, follow these behavior-preserving rules.

## Core Principle

**Refactoring must not change observable behavior.** The app should work identically before and after.

## Workflow

### 1. Scope the Change

- Clarify exactly what is being refactored and why (readability, reuse, performance, testability).
- List the files that will be touched.
- If the scope is large (>5 files), break it into smaller, independently safe steps.

### 2. Apply Extraction Patterns

| Pattern | When to use |
|---|---|
| **Extract Component** | A section of JSX is reused or makes the parent too long (>150 lines). Move to its own `.tsx` file with typed props. |
| **Extract Hook** | Logic with `useState`/`useEffect`/`useQuery` is reused or clutters the component. Move to `use<Name>.ts`. |
| **Extract Service Function** | Backend controller has business logic mixed in. Move to the corresponding `services/` file. |
| **Extract Utility** | Pure function used in 2+ places. Move to `frontend/src/lib/` or `packages/shared/src/`. |
| **Extract Type** | Interface used across files. Move to `types.ts` in the feature folder or `packages/shared/`. |

### 3. Check After Each Step

After every extraction or move:

- Verify all imports are updated (especially `@/` aliases in frontend, `.js` extensions in backend ESM).
- Run type check (`tsc --noEmit` for frontend).
- Confirm no circular dependencies were introduced.

## Scope Control Rules

- **Do not rename things unrelated to the refactor** — it creates noise in diffs.
- **Do not change formatting** beyond what the refactor requires — let the linter handle that.
- **Do not upgrade dependencies** during a refactor.
- **Do not modify `src/_legacy/`** — it is archived.
- **Do not refactor and add features at the same time** — one or the other per change.

## File Placement

| What | Where |
|---|---|
| Feature-specific component | `frontend/src/features/<feature>/` |
| Shared/reusable component | `frontend/src/components/` |
| shadcn/ui primitive | `frontend/src/components/ui/` (CLI-generated, don't manually edit) |
| Frontend utility | `frontend/src/lib/` |
| Shared type/schema | `packages/shared/src/` |
| Backend service logic | `backend/services/` |
| Backend utility | `backend/utils/` |

## Checklist Before Done

- [ ] Behavior unchanged — same inputs produce same outputs.
- [ ] No TypeScript errors or lint warnings introduced.
- [ ] All imports updated.
- [ ] No circular dependencies.
- [ ] Commit message clearly describes what was extracted/moved.

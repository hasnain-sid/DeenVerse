# 04 — Development Guide

> Day-to-day conventions and workflow. Assumes you've completed [03_Setup_Guide.md](03_Setup_Guide.md).

## Command reference

| Command | What it does |
|---|---|
| `npm run dev:backend` | Build shared package, then nodemon API on :8081 |
| `npm run dev:web` | Vite dev server on :3000 (proxies API + sockets) |
| `npm run build:shared` | `tsc` → `packages/shared/dist` — prerequisite for tests and builds |
| `npm run build` | Full production build → `./dist` (what Vercel runs) |
| `npm run test:backend` | Jest: 392 tests / 19 suites against in-memory Mongo replica set |
| `npm run lint:web` / `typecheck:web` | ESLint / `tsc --noEmit` (the CI gates) |
| `cd frontend && npm run lint:strict` | Zero-warnings ESLint mode |
| `cd frontend && npm run format` | Prettier write (`format:check` to verify) |
| `npm run check:integrity` | Static frontend↔backend route drift check — run after adding/removing routes |

Run a single backend test file: `cd backend && node ../node_modules/jest/bin/jest.js quizService` (Jest is hoisted to the root, so plain `npx jest` inside `backend/` may not resolve).

## Backend conventions (plain JS, ESM, Node 20)

- **Layer flow** `routes → controller → services → models`. Controllers stay thin: parse/validate → call service → `res.json({ ...result, success: true })`. Services throw `AppError(message, statusCode)`; the central error handler turns those into `{ success: false, message }`.
- **Models export named constants** — `export const X = mongoose.model(...)`, never default exports. A `.default` import of the `Enrollment` model once silently broke classroom socket joins; the convention exists because of that bug.
- **New endpoints** validate with shared Zod schemas: `schema.safeParse(req.body)` → on failure `next(new AppError(msg, 400))`. Rate-limit sensitive routes with the factories in `middlewares/rateLimiter.js`.
- **Logging** via the Winston `logger` from `config/logger.js` — never `console.log`.
- **Optional infra pattern**: check whether the service is configured, log one warning, and no-op. Redis, AWS, LiveKit, Stripe, and VAPID consumers all follow this; match it for anything new.
- Style: JSDoc on exported functions; section dividers written as `// ── Section Name ──…`. There is **no backend linter or formatter** — conventions are enforced only by review, so read neighboring files before writing.

## Frontend conventions (TypeScript strict, React 18)

- **Feature folders**: new code goes in `src/features/<feature>/` with its components, hooks, and API calls together.
- **Pages are named exports, lazy-loaded in `App.tsx`**: `lazy(() => import('./features/x/XPage').then(m => ({ default: m.XPage })))`. Follow it exactly or the route breaks in production chunking.
- **Server state** → TanStack Query hooks (one `useX.ts` per feature). **Global client state** → the existing Zustand stores. **Forms** → React Hook Form + Zod resolver.
- **All HTTP through `lib/api.ts`** — the axios instance handles auth headers and the 401→refresh→retry queue. Raw `fetch` bypasses auth and will misbehave.
- **UI**: compose from `components/ui/` primitives (CVA variants, `cn()` merge), Lucide icons only, Tailwind tokens from `globals.css`. Design language: Notion-minimal, teal accent `#2D7D6F`, Amiri/Scheherazade for Arabic. Framer Motion for animation.
- Path alias `@/` → `src/`. Prettier + ESLint are enforced; run `lint:strict` before pushing.

## Testing

- **Backend**: Jest 30 + babel-jest + supertest against `mongodb-memory-server` (spun up as a replica set, so transactions work in tests). Suites live in `backend/__tests__/`. Coverage is *phase-shaped*: the 392 tests thoroughly cover courses, quizzes, classrooms, scholars, and Stripe, but **auth, users, posts, feed, chat, and streams have zero tests** — be extra careful touching those, and ideally leave a test behind.
- **Frontend**: no test infrastructure exists at all (known gap; Vitest + React Testing Library is the plan). Manual verification + typecheck are the only gates.

## Git workflow

- **Conventional commits with scope**: `feat(courses): …`, `fix(classroom): …`, `docs(audits): …`, `chore(deps): …`, `test(phase3): …`. Imperative summary, wrapped body explaining *why*. The `[tick]` prefix is reserved for tracker auto-commits — don't use it manually.
- **Branches**: work on `hotfix/*` or `feature-*` branches; `main` is protected by convention. Note the currently active branch is `hotfix/vercel-build-fix`, which is ~15 commits ahead of `main` and needs merging — see [10_Project_Status.md](10_Project_Status.md) before basing new work anywhere.
- **CI** (`.github/workflows/ci.yml`): frontend typecheck, backend Jest against a Mongo 7 container, frontend build. Ignore the S3/CloudFront deploy jobs — they're dead ([08_Code_Review.md](08_Code_Review.md) #16).

## The multi-agent process

If you participate in the Tick/agents workflow (optional for a human contributor, but you'll see its artifacts everywhere):

1. New features start with a **contract** in `.agents/contracts/<name>.md` (API shapes agreed before coding).
2. Update `.agents/feature-board.md` when a layer (shared/backend/frontend/mobile) is complete.
3. Run `npm run check:integrity` after route changes; it cross-references frontend API calls against backend mounts (known accepted orphan: `POST /user/:param`).
4. **Never trust "done" in `TICK.md` without checking `git log -- <file>`** — the tracker has recorded finished work that was never committed.

## Things you must not "fix" casually

- The Stripe webhook mount before `express.json()` in `backend/index.js`.
- The workbox regexes in `frontend/vite.config.ts` that exclude auth endpoints from service-worker caching.
- The root dependency `@livekit/components-styles` — it looks misplaced but is a Vercel workspace-resolution workaround.
- The blanket `sanitizeInput` middleware — it's known-bad ([08_Code_Review.md](08_Code_Review.md) #10) but removing it without per-route replacements would drop a defense layer.

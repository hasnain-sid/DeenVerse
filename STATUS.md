# DeenVerse — Status Audit

**Audited:** 2026-09-03 · **Branch:** `main` @ `15fdf32` · **Working tree:** clean · **473 commits** (2024-05-27 → 2026-08-07)

Everything below was verified against the code in this repo. Where existing docs
(`README.md`, `ROADMAP.md`, `.claude/CURRENT_STATUS.md`, `.claude/KNOWN_ISSUES.md`) disagree with the
code, the code wins and the discrepancy is noted.

**Verification run for this audit:**

| Check | Command | Result |
|---|---|---|
| Shared package build | `npm run build:shared` | ✅ exit 0 |
| Frontend typecheck | `npx tsc --noEmit` | ✅ exit 0, zero errors |
| Frontend lint | `npx eslint . --ext ts,tsx` | ✅ exit 0, zero warnings |
| Frontend prod build | `npx vite build` | ✅ exit 0, 7.6 MB `dist/`, 119 precache entries |
| Backend tests | `npm test` (backend) | ⚠️ 361 passed / 155 failed / 516 total — **all 155 failures are the 6 DB-backed suites failing to reach MongoDB in this environment**, not code defects (see [Testing](#testing)) |

---

## Overview

DeenVerse is an Islamic social media and learning platform: a Twitter-style feed with posts,
follows, DMs, notifications and live streaming, bolted to a monetized education stack — verified
Scholar accounts sell courses through Stripe (30% platform commission, Connect payouts) and teach
live in LiveKit-backed virtual classrooms with a tldraw whiteboard and recordings. Around that sits
curated devotional content: a Quran reader, topic/mood browsing, a "Ruhani" spiritual-practice
journal, daily hadith, and an "Iman Boost" signs feed.

**It is not a RAG-based knowledge platform, and no part of it ever has been.** A strict search across
every `.js/.ts/.tsx/.jsx/.json` file in the repo for `openai|langchain|anthropic|embedding|vector
store|pinecone|weaviate|qdrant|chroma|faiss|pgvector|RAG|retrieval.augment|semantic search|cosine
similarity` returns **zero hits outside `docs/`**. The project's own scope statement
(`.claude/PROJECT_CONTEXT.md:3`, `docs/01_Project_Overview.md:7-10`) describes a social network plus
an LMS, with no AI/retrieval component. RAG appears only as aspiration in two research memos
(`docs/browse-by-topic-optimization-research.md:245`, `docs/explore-data-utilization-research.md:231`)
and as two greyed-out "Coming Soon" cards in the UI. See [Not Started](#not-started).

---

## Tech Stack

npm-workspaces monorepo: `packages/shared` (build first — everything else resolves it through
`dist/`), `frontend`, `backend`, `packages/mobile`.

### Backend — `backend/package.json`, plain JS ESM, Node 20

| Package | Version | Used in |
|---|---|---|
| express | 4.19.2 | 35 files |
| mongoose | 8.8.0 | 48 files |
| socket.io | 4.8.1 | `socket/index.js` |
| jsonwebtoken | 9.0.2 | 7 files |
| bcryptjs | 2.4.3 | 3 files |
| stripe | 20.4.0 | 6 files |
| livekit-server-sdk | 2.15.0 | `services/livekitService.js` |
| @aws-sdk/client-{ivs,s3,ses} + s3-request-presigner | 3.992.0 | IVS/S3/SES services |
| helmet | 8.1.0 | `middlewares/security.js` |
| ioredis | 5.9.3 | `config/redis.js` |
| rate-limiter-flexible | 9.1.1 | `middlewares/rateLimiter.js` |
| express-validator | 7.3.1 | `middlewares/validators.js` |
| xss | 1.0.15 | `middlewares/security.js` |
| winston / morgan | 3.19.0 / 1.10.1 | logging |
| quran-meta | 6.0.17 | `services/quranService.js` |
| web-push | 3.6.7 | `services/pushService.js` |
| slugify / uuid / dotenv / cors / cookie-parser | 1.6.6 / 13.0.0 / 16.4.5 / 2.8.5 / 1.4.6 | — |

### Frontend — `frontend/package.json`, React 18 + TS 5.6 + Vite 5

React 18.3.1 · TypeScript 5.6.3 · Vite 5.2.14 · Tailwind 4.0.0 · **Zustand 5.0.1** ·
@tanstack/react-query 5.60.0 · react-router-dom 6.28.0 · axios 1.7.7 · zod 4.3.6 ·
react-hook-form 7.71.1 + @hookform/resolvers 5.2.2 · framer-motion 11.11.0 ·
lucide-react 0.454.0 (113 files) · react-hot-toast 2.4.1 (48 files) · livekit-client 2.17.2 +
@livekit/components-react 2.9.20 · @tldraw/tldraw 4.4.1 · hls.js 1.6.15 · fuse.js 7.1.0 ·
socket.io-client 4.8.1 · vite-plugin-pwa 1.2.0 · @radix-ui/react-{select,slot}

> **Correction to the brief: there is no Redux store.** State is Zustand (4 stores,
> `frontend/src/stores/`, 200 lines total) + TanStack Query for server state. `@reduxjs/toolkit` and
> `react-redux` are not dependencies. The only Redux code left is dead —
> `frontend/src/_legacy/redux/{store,userSlice,contentSlice}.js`, part of a 32-file / 2,092-line
> `_legacy/` v1 tree that is imported by nothing (grep for `_legacy` across `src`, `tsconfig.json`,
> `vite.config.ts` returns zero hits) and excluded from the build because it is `.js` with no `allowJs`.

### Mobile — `packages/mobile`, Expo 52 / RN 0.76.7 / expo-router 4

37 files, 3,920 lines. **Never installed or built by CI** — `.github/workflows/ci.yml` installs only
`-w packages/shared -w frontend -w backend`, with an explicit comment that mobile is excluded. Its
build status is therefore unknown; treat as unverified.

### Installed but unused

| Package | Where declared | Evidence |
|---|---|---|
| `@fontsource/amiri`, `@fontsource/cairo`, `@fontsource/scheherazade-new` | frontend deps | zero references in `src/`, `globals.css`, or `index.html` — three Arabic font packages downloaded and never loaded |
| `@tanstack/react-virtual` | frontend deps | zero imports, no `useVirtualizer` call anywhere |
| `dompurify` + `@types/dompurify` | frontend deps/devDeps | zero imports (case-insensitive) |
| `nodemon` 3.1.0 | backend **`dependencies`** | correct package, wrong section — ships to production |
| `@livekit/components-styles` | **root** `package.json` dependencies | duplicates the frontend's own declaration; nothing at the root imports it |

### Referenced in code but missing from dependencies

- **`tldraw`** — `frontend/src/features/classroom/components/WhiteboardPanel.tsx:24-25` imports
  `from 'tldraw'` and `'tldraw/tldraw.css'`, and `frontend/vite.config.ts:118` names it in
  `manualChunks`. Only `@tldraw/tldraw` is declared. It resolves today purely because
  `@tldraw/tldraw@4.4.1` is a shim whose sole dependency is `tldraw@4.4.1`, hoisted to the root
  `node_modules`. This breaks under a non-hoisting installer (pnpm/yarn PnP) or if the shim changes.
  Fix: add `"tldraw": "^4.4.1"` to `frontend/package.json`.

---

## Completed / Working

### Auth — working, thin

- `backend/config/auth.js` — `isAuthenticated` + `optionalAuth`, dual-secret JWT (access via
  `Authorization: Bearer`, refresh via httpOnly cookie), with a Redis-cached ban check
  (`assertNotBanned`, 60s TTL, `auth.js:62-73`).
- `backend/utils/tokenUtils.js` — 15-min access token, 7-day refresh token, `SameSite=None; Secure`
  cookie in production.
- `backend/middlewares/admin.js` — `isAdmin` / `isScholar`, checking the DB `role` field with an
  `ADMIN_IDS` env override.
- Password reset is fully wired end to end: `userService.js:269-301` generates a SHA-256-hashed
  one-time token with a 1-hour expiry and **does** send the email via
  `emailService.sendPasswordResetEmail`. (The comment at `controller/userController.js:244` claiming
  "For now, return token for development/testing" is stale — the email path exists; the token is
  additionally returned only when `NODE_ENV !== 'production'`.)
- Frontend: `AuthGuard.tsx`, `AdminGuard.tsx`, `stores/authStore.ts` (access token in memory only,
  never persisted), and a refresh-on-401 interceptor with a concurrent-request queue
  (`lib/api.ts:43-95`).
- 11 tests in `__tests__/bannedEnforcement.test.js` + 14 in `scholarMiddleware.test.js`.

**Note:** two of the five "Critical (security)" items in `.claude/KNOWN_ISSUES.md` are now fixed and
that file is out of date — `banned` **is** enforced (item 3), and the `role` enum **is** used rather
than an ADMIN_IDS-only allowlist (item 11).

### Data models — 25 Mongoose schemas, 1,715 lines, `backend/models/`

`User` (116 lines, with an embedded `scholarProfile` and `subscription`), `Post`, `Collection`,
`Conversation`, `Message`, `Notification`, `PushSubscription`, `Stream`, `Report`, `AuditLog`,
`AnalyticsEvent`, `Course`, `Enrollment`, `Quiz`, `QuizAttempt`, `Payment`, `ScholarPayment`,
`Classroom`, `ClassroomParticipant`, `Sign`, `SpiritualPractice`, `SpiritualSession`,
`TopicReflection`, `LearningProgress`, `DailyLearning`.

Indexing is deliberate, not accidental — 48 index declarations, including a weighted text index on
`User` (`userSchema.js:112-115`), a compound unique on `Enrollment{student,course}`
(`enrollmentSchema.js:51`), and a `unique+sparse` on `Payment.stripeSessionId`
(`paymentSchema.js:16-21`) that the Stripe webhook genuinely relies on for idempotency.

### API — 182 route registrations across 25 route files

Mounted in `backend/index.js:128-149` under `/api/v1/*`: `user`, `collections`, `posts`,
`notifications`, `chat`, `streams`, `push`, `upload`, `moderation`, `analytics`, `daily-learning`,
`quran`, `quran-topics`, `ruhani`, `signs`, `share`, `scholars`, `payments`, `courses`, `quizzes`,
`classrooms`, `admin/courses`, plus `/api/v1/webhooks` (mounted at `index.js:105`, before
`express.json`, so Stripe's raw body survives), `/health` and SEO routes.

Middleware chain is complete and correctly ordered: CORS with a Vercel-preview regex
(`index.js:73`) → Helmet CSP → Morgan→Winston → raw-body webhooks → body parsing → XSS
sanitisation → global rate limiter → Socket.IO → routes → centralized `errorHandler`.

`node scripts/check-feature-integrity.js` reports **all 158 frontend API calls resolve to a real
backend route** — no orphaned client calls.

### Courses / LMS — the most complete vertical, minus checkout

`courseService.js` (790 lines) + `quizService.js` + `enrollmentSchema` + `middlewares/courseAccess.js`.
Working: course CRUD with slugs, publish/archive with soft-delete when enrollments exist
(`courseService.js:322-333`), discovery with a weighted popularity aggregation
(`courseService.js:178-190`), **free** enrollment inside a Mongo transaction with an atomic
`maxStudents` capacity check (`courseService.js:497-533`), per-lesson progress tracking, quiz
attempts and grading, and an admin review queue. Frontend: `CoursesPage`, `CourseDetailPage`,
`CoursePlayerPage`, `QuizPlayerPage`, `MyCoursesPage`, `MyTeachingPage`, `CreateCoursePage`,
`EditCoursePage`, `AdminCourseReviewPage` (28 files, 6,526 lines).
Tests: 42 `courseService` + 16 `courseModel` + 11 `enrollmentService` + 9 `enrollmentModel` +
15 `quizService` + 6 `courseAccess` + 27 `phase2.smoke`.

**Paid enrollment is broken — see [Known Issues #1](#1-paid-course-purchase-is-broken-end-to-end).**

### Virtual classrooms — feature-complete, largest single feature

`classroomService.js` (1,111 lines) + `livekitService.js` + `socket/index.js` (501 lines).
Working: scheduling, lifecycle (start/end), participant roles, host controls (mute, remove with
reason, grant-speak), a hand-raise queue, a tldraw whiteboard with throttled server-side snapshot
persistence, egress recording, and course-gated access. 15 Socket.IO event handlers
(`socket/index.js:98-438`), JWT-authenticated at the handshake (`socket/index.js:46`).
Frontend: 9 files, 6,187 lines — `ClassroomLobbyPage`, `ClassroomLivePage`, `RecordingViewerPage`,
`ScheduleClassroomPage`, `EditClassroomPage`, `MySessionsPage`, `StudentSessionsPage`,
`WhiteboardPanel`. Tests: 40 + 32 + 20 + 17 + 17 + 30 + 29 = **185 tests**, the best-covered area.

### Ruhani (spiritual practice) — complete and the most recently finished

22 endpoints in `routes/ruhaniRoute.js`, `ruhaniService.js` (19 exports), content seeded from
`data/{tafakkurTopics,tazkiaTraits,tadabburAyahs}.js` (2,385 lines of curated content across
`backend/data/`). Guided sessions with suggestions, practice CRUD, a journal with export, and
per-user deterministic content rotation. Frontend: 12 files, 2,598 lines, 6 pages plus a
localStorage draft-recovery hook (`hooks/useReflectionDraft.ts`).
Tests: 53 + 22 + 11 = 86.

### Quran — working, external-API-backed

`quranService.js` uses the local `quran-meta` package for the 114-surah index and juz/ruku maths (no
network), and `api.alquran.cloud` for text/translation/tafsir with a 7-day Redis cache
(`quranService.js:13`). Deterministic daily rotation at `quranService.js:27-34`.
`quranTopicRoute.js` exposes 14 endpoints over 28 topics (`data/quranTopics.js`, 1,060 lines).
Frontend: `QuranReaderPage`, `QuranTopicsPage`, `TopicDetailPage`, `MoodDetailPage`.
Tests: 9 + 6 + 11.

### Scholar system + Stripe plumbing

Application → admin review → approval → Stripe Connect onboarding → earnings.
`scholarService.js` (11 exports), `stripeService.js` (7 exports), `webhookController.js` with
signature verification (`webhookController.js:30`) and idempotent inserts (`:125-133`).
Handles `checkout.session.completed`, `customer.subscription.{updated,deleted}`, `account.updated`.
Tests: 18 + 14 + 9 + 9 + 15 `phase1.smoke`.

### Frontend shell

`App.tsx`: 66 routes, 62 lazy-loaded page chunks, 28 behind `AuthGuard`, 2 behind `AdminGuard`,
wrapped in `ErrorBoundary` + `QueryClientProvider`. Plus `MainLayout`, `CommandPalette`,
`InstallPrompt`, `CookieConsent`, 12 shadcn-style UI primitives, PWA with offline fallback and
scoped runtime caching that correctly excludes auth endpoints (`vite.config.ts:65`).
**Typecheck, lint and production build all pass clean.**

---

## Partially Built / Stubbed

### Moderation — 100% backend, 0% frontend

`moderationRoute.js` exposes 7 endpoints (report content, list/resolve/dismiss reports, ban/unban
users, audit log) backed by `moderationService.js` (7 exports), `reportSchema.js` and
`auditLogSchema.js`. `check-feature-integrity.js` flags every one as having no frontend consumer, and
a grep for `/moderation/` across `frontend/src` returns **zero API calls**. There is no
`/admin/reports` or `/admin/users` route in `App.tsx` — only `/admin/scholars` and `/admin/courses`.
A complete moderation backend that no human can operate. **~50% (backend done, UI absent).**

### Analytics — same shape

`analyticsRoute.js` has 4 endpoints including `GET /analytics/admin/dashboard`, backed by
`analyticsService.js` (6 exports) and `analyticsEventSchema.js`. The frontend makes exactly one
analytics call in the entire app — `api.post('/analytics/topic-view', …)` at
`features/quran-topics/TopicDetailPage.tsx:28`, fire-and-forget with `.catch(() => {})`. Nothing
reads the insights or dashboard endpoints. **~40%.**

### Iman Boost / Signs — wired to mock data, not the API

`features/iman-boost/useSigns.ts:11` sets `const USE_MOCK = import.meta.env.DEV`, so in development
`useDailySign` and `useSigns` return data from `mockData.ts` (871 lines) and the real `/signs`
endpoints are **never exercised**. The backend side is real (`signSchema.js`, `signService.js`,
`data/signsSeed.json`, `scripts/seedSigns.js`), it just has no dev-time consumer. `mockData.ts` is
statically imported at `useSigns.ts:4`, so all 871 lines ship in the production bundle too.
The category browser also renders "New signs coming soon to this category" for empty categories
(`ImanBoostPage.tsx:314`). **~60% — both halves built, never connected in dev.**

### Global Courses — a hardcoded 10-row JSON file

`features/courses/GlobalCoursesPage.tsx:3` imports
`@/data/global_islamic_courses_database.json` — a static 7.5 KB, 10-entry array. The `/global-courses`
route renders a browsable catalogue that touches no database and no API. **~20%: it's a UI over a
fixture.**

### Live streaming — depends on unconfigured AWS IVS, with no fallback UI

`services/ivsService.js:24-35` returns fabricated values when AWS credentials are absent:
`channelArn: "placeholder:channel:…"` and
`playbackUrl: "https://placeholder.playback.live-video.net/{id}.m3u8"`. `StreamViewPage.tsx:77-97`
feeds that straight into hls.js with no guard — a grep for `placeholder` in
`features/streams/` finds only textarea attributes. The classroom equivalent *does* guard
(`ClassroomLivePage.tsx:149` checks `livekitToken.startsWith('placeholder-token')`); streams do not.
So without IVS credentials the stream player fails silently, with no message to the user.
**~70% — code complete, undeployable and undiagnosable without AWS.**

### Learn Quran hub — a menu where 5 of 7 items are inert

`features/learn-quran/LearnQuranHub.tsx:5-69`: 7 feature cards, of which 2 are `status: 'Available'`
and **5 are `status: 'Coming Soon'` with `href: '#'`** — Consistency Engine, Word-by-Word,
Ask-the-Quran Assistant, AI Tajweed Coach, Story Mode Context Cards. They render greyed out with
`cursor-not-allowed` (`:94`). No backing code exists for any of the five. **~29% of the advertised hub.**

### Scholar prototypes shipped in production routes

`App.tsx:538-544` wires 7 `/prototypes/*` routes, **outside `MainLayout` and outside any guard**.
`/prototypes/scholar-review` and `/prototypes/scholar-badge` still render 10 design-exploration
components (1,574 lines) driven by `prototypes/mockApplications.ts`. The course ones are already
tombstoned — `courses/prototypes/PrototypesViewer.tsx` is a 25-line "Prototypes Promoted" notice —
but 5 routes still point at it.

### Email — 1 of 3 templates used, no verification flow

`emailService.js` exports three functions; only `sendPasswordResetEmail` has a caller.
`sendVerificationEmail` (`:103`) and `sendNotificationDigest` (`:125`) are dead code, and there is no
email-verification flow anywhere — `userSchema.js` has no `emailVerified` field.

### Dormant / unverified

- **`packages/mobile`** — 3,920 lines of Expo app (auth, tabs, post/stream/user detail, offline
  cache, push hooks). Excluded from CI by design; never installed, typechecked or built here.
- **`frontend/src/_legacy`** — 2,092 lines of the v1 React app, imported by nothing.

---

## Not Started

### RAG / embeddings / vector search — 0%, nothing exists

To be explicit, since the brief assumed otherwise: **there is no RAG pipeline, no embedding
generation, no vector store, no LLM client, and no semantic search anywhere in this repository.**
A strict regex sweep of every source and config file for
`openai|langchain|anthropic|google.generativeai|mistralai|cohere|ollama|huggingface|pinecone|weaviate|qdrant|chromadb|faiss|pgvector|vectorStore|embeddings?|RAG|retrieval.augment|gpt-[0-9]|claude-[a-z0-9]|semantic.search|cosine.similarit`
returns **zero matches** outside `docs/`. There is no AI provider SDK in any of the four
`package.json` files. Search today is:

- MongoDB text indexes (`userSchema.js:112`, `postSchema`) for users and posts,
- `fuse.js` 7.1.0 for client-side fuzzy matching (one file),
- keyword filtering over the 28 hand-written topics in `backend/data/quranTopics.js`.

The only traces of intent are **research memos**, not code —
`docs/browse-by-topic-optimization-research.md:213-290` ("Semantic Search with Embeddings",
"Quranic Knowledge Graph + RAG"), `docs/explore-data-utilization-research.md:231` — and the two
greyed-out cards noted above. If a RAG knowledge platform is the actual goal, this is a greenfield
build on top of an existing social/LMS app, not a continuation of it.

### Also entirely absent

| Missing | Evidence |
|---|---|
| **Any frontend test** | zero `*.test.*` / `*.spec.*` under `frontend/src`; no vitest/jest/testing-library in `frontend/package.json` |
| **Any E2E test** | no playwright/cypress config or directory anywhere |
| **Email verification** | no `emailVerified` field, no route, `sendVerificationEmail` uncalled |
| **OAuth / social login** | password-only; no passport, no OAuth deps |
| **2FA** | nothing |
| **Refresh-token rotation or revocation** | `Logout` clears the cookie; no denylist. A stolen 7-day token stays valid for 7 days |
| **Socket.IO Redis adapter** | `@socket.io/redis-adapter` not a dependency — see Known Issues #4 |
| **Word-by-word Quran, tajweed, tafsir story mode** | the 5 "Coming Soon" cards |
| **Certificates on course completion** | promised in `CheckoutPage.tsx:69` UI copy; no model, route or service |
| **LICENSE file** | `README.md` claims MIT and links `[LICENSE](LICENSE)`; the file does not exist |

---

## Known Issues / Tech Debt

### 1. Paid course purchase is broken end-to-end — FIXED in `f454557`

> **Resolved.** Kept here as the record of what was wrong. All three breaks below are closed;
> the line references describe the pre-fix code and no longer match `main`.

The single most serious functional defect. Three independent breaks in one flow:

1. **Param name mismatch.** `CourseDetailPage.tsx:106` sets the Stripe success URL to
   `/checkout?success=true&course=${slug}`. `CheckoutPage.tsx:12` reads
   `searchParams.get('courseSlug')` — a different key. On return from Stripe it is `null`, so
   `CheckoutPage.tsx:16-20` immediately redirects the paying user to `/`.
2. **No success handling at all.** `CheckoutPage.tsx` (111 lines) never reads `success`, never reads
   Stripe's `session_id`, and has no post-payment branch. It only ever renders the pre-payment
   "Pay securely" screen.
3. **Enrollment is never created.** `courseService.enrollInCourse` requires a `paymentSessionId` for
   paid courses and throws `402 Payment required` without it (`courseService.js:475-488`). But
   `useCourseEnrollment.ts:18` posts to `/courses/${slug}/enroll` **with no body**, and
   `paymentSessionId` appears **nowhere in `frontend/src` or `packages/mobile`**. The webhook creates
   a `Payment` row but never an `Enrollment` (`webhookController.js:78-153`).

Net effect: a user is charged, a `Payment` row is written, and they get no course access and no
error. Free enrollment works fine; paid does not.

**How it was fixed.** A fourth break turned up that is not listed above: the custom `successUrl`
*overrode* the backend default and dropped Stripe's `{CHECKOUT_SESSION_ID}` placeholder, so no
session id ever came back and correcting the param name alone would not have worked.
`stripeService.createCheckoutSession` now guarantees the placeholder on any success URL; the
webhook creates the `Enrollment` on `checkout.session.completed` so access does not depend on the
buyer's browser surviving the redirect; and `CheckoutPage` gained confirm / already-enrolled /
cancelled states so the pay button no longer re-renders after a successful charge.

### 2. `enrollmentCount` is double-incremented on every paid enrollment — FIXED in `f454557`

> **Resolved** in the same commit as #1, necessarily: once the webhook creates the enrollment,
> `enrollInCourse` owns the increment, so leaving the webhook's own `$inc` would have double-counted
> every paid enrollment.

`webhookController.js:140-142` does `$inc: { enrollmentCount: 1 }` on `checkout.session.completed`,
and `courseService.js:511` does the same `$inc` inside the enrollment transaction. Any paid course
that ever completes both halves counts each student twice — which also corrupts the popularity
ranking that sorts course discovery (`courseService.js:178-190`).

**Note:** rows written before the fix still carry the doubled count. Nothing backfills them; a
one-off reconciliation against the `Enrollment` collection is still outstanding.

### 3. The refresh token is accepted as full authorization on every endpoint (CSRF) — FIXED in `b343337`

> **Resolved.** The refresh cookie now authenticates exactly one endpoint, `POST /user/refresh`.
> A grep for cookie reads across `backend/{config,socket,controller,middlewares,routes,services}`
> returns exactly that one handler.

`config/auth.js:49` — `extractToken` falls back to `req.cookies.token || req.cookies.refreshToken`,
and `:89-91` verifies cookie-sourced tokens with the refresh secret and admits them. Consequences:

- The 15-minute access-token lifetime is decorative; the 7-day refresh cookie authenticates every
  route directly.
- The cookie is `SameSite=None; Secure` in production (`tokenUtils.js:37`) and
  `express.urlencoded` is enabled (`index.js:108`), so a cross-site form POST carries it and executes
  authenticated mutations. There is no CSRF token anywhere.

Fix is narrow: accept the cookie only on `POST /user/refresh`.

**What the narrow fix missed.** Two call sites were living off the fallback and had to change with
it. The Socket.IO handshake (`socket/index.js`) accepted the refresh cookie directly — and because
`accessToken` is not persisted while `isAuthenticated` is, *every page reload* connected the socket
on the cookie alone. And `ScholarEarningsPage` reached the Stripe dashboard through a plain
`<a href>`, a browser navigation that cannot carry an `Authorization` header.

### 4. Horizontal scaling is blocked

`socket/index.js:10,16,22` keeps `onlineUsers`, `handQueues` and `whiteboardSaveTimestamps` in
process-local `Map`s with no Redis adapter (`@socket.io/redis-adapter` is not a dependency). Two
backend instances would show different online lists, split hand-raise queues, and desynced
whiteboards. `middlewares/rateLimiter.js:15-24` correctly prefers Redis but silently falls back to
`RateLimiterMemory`, so limits become per-instance too.

### 5. NoSQL operator injection is still reachable — FIXED in `7705fb0`

> **Resolved.** `sanitizeInput` now rejects any key starting with `$` or containing `.`, recursively
> across body, query and params including inside arrays, returning 400. Values are untouched, so an
> address like `first.last@example.com` still passes — only keys are constrained.

`middlewares/security.js:93-103` — `deepSanitize` sanitises object **values** but copies **keys**
verbatim (`:98-100`), so a payload like `{"email": {"$gt": ""}}` passes through untouched. No
`express-mongo-sanitize` is installed (verified absent). Routes with `express-validator` rules are
safe; routes without them (posts, chat, collections, streams, share, signs) are not.

The query-string route to the same hole was not noted above: `?email[$ne]=` is expanded by `qs`
into the identical nested operator object, so `express-validator` coverage on the body alone would
not have closed it.

### 6. Mongoose validation errors surface as HTTP 500

`middlewares/errorHandler.js:31-37` — the `ValidationError` branch is commented out. Any
`ValidationError` or `CastError` falls through to `statusCode = err.statusCode || 500`. A malformed
ObjectId on an unvalidated route returns 500 instead of 400.

### 7. Stripe webhook failures are swallowed and reported as success

`webhookController.js:57-66` catches every processing error, logs it, and still returns
`200 {received: true}` — explicitly so "Stripe will retry if we return non-200". That inverts the
retry contract: a transient DB failure while recording a payment is permanently discarded rather
than retried. Related: `.env.example:74` documents `STRIPE_CONNECT_WEBHOOK_SECRET`, but the code
never reads it (verified against the full `process.env.*` inventory) — Connect `account.updated`
events are verified with the platform secret and will fail signature checks if Stripe signs them
with the Connect endpoint's own secret.

### 8. Frontend types disagree with the backend schema (silent empty UI)

`courseTypes.ts:97-102` and `useClassroom.ts:23-25` declare the instructor's
`scholarProfile` as `{ specializations?: string[]; averageRating?: number }`. The backend stores
`scholarProfile.specialties` and `scholarProfile.rating.average`
(`userSchema.js:57,66-69`; selected as such in `scholarService.js:218`). So
`CourseDetailPage.tsx:133-134` reads two fields that are **always `undefined`** — instructor
specialties and instructor rating never render on any course page. TypeScript cannot catch it
because these types are hand-maintained rather than derived from `packages/shared`, and the optional
chaining + `?? ''` hides the failure.

### 9. Testing is phase-shaped, and half the app has none

516 backend tests across 26 suites — but they cover only Phases 1-3 (scholar, payments, courses,
enrollment, quizzes, classrooms) plus Ruhani and Quran. **Zero tests** exist for: `postService`,
`chatService`, `streamService`, `collectionService`, `moderationService`, `analyticsService`,
`notificationService`, `uploadService`, `shareService`, `signService`, `topicService`,
`streakService`, `learningProgressService`, `reflectionService`, `pushService`, `emailService`, or
`userService` beyond ban enforcement. That is 8 of 29 services with dedicated suites. The entire
original social layer — feed, DMs, streams, notifications — is untested.

<a id="testing"></a>**Local run, for the record:** 361 passed / 155 failed / 516 total. All 155
failures come from exactly the 6 suites that need a live MongoDB (`ruhaniPractice` 53,
`ruhaniSession` 22, `phase1.smoke` 15, `phase2.smoke` 27, `phase3.smoke` 29, `scholarEarnings` 9),
each dying in `beforeAll` with `MongoMemoryServer.create()` timing out in this sandbox. **These are
environment failures, not code defects** — CI provisions a real `mongo:7` service. The 20 suites
that mock their dependencies pass 361/361 clean.

### 10. Frontend has zero test infrastructure

Not just zero tests — no test runner is installed. Nothing prevents a regression in 31,655 lines of
`features/` code. CI runs `tsc --noEmit` on the frontend and nothing else; it never runs ESLint
either (`.github/workflows/ci.yml` lint job only typechecks, despite its name).

### 11. Bundle sizes far exceed the project's own budget

`vite.config.ts:123` sets `chunkSizeWarningLimit: 250` (KB). Actual output:

| Chunk | Size |
|---|---|
| `whiteboard` (tldraw) | **1,563 KB** |
| `ClassroomLivePage` | 529 KB |
| `hls` | 507 KB |
| `ui` (lucide-react) | 490 KB |

`ClassroomLivePage.tsx` is 1,879 lines in one file; `ClassroomLobbyPage.tsx` is 914;
`classroomService.js` is 1,111.

### 12. Deployment story contradicts itself three ways

`vercel.json` builds for Vercel; `.github/workflows/ci.yml` deploys `frontend/dist` to S3 +
CloudFront (skipped when AWS secrets are absent, per `15fdf32`); `frontend/.env.production` points
the API at `https://deenverse-backend.onrender.com` while `backend/index.js:59` defaults its CORS
allowlist to `https://deen-verse-front.vercel.app`. Three targets, no single source of truth.

### 13. Documentation is stale in ways that actively mislead

- **`README.md` describes a different application.** It documents "DeenVerse - Hadith Of The Day",
  a Material-Tailwind + Redux app with 8 endpoints, `npm start`, and a `constant.js` config file —
  none of which exist. It is the v1 README, ~2 years and 473 commits out of date.
- `.claude/KNOWN_ISSUES.md` lists three items that are now fixed (banned enforcement, the
  ADMIN_IDS/role split, and `.env.example` drift — `.env.example` now matches the code exactly and
  even documents the `MONGO_URI` vs `MONGODB_URI` trap).
- `.claude/CURRENT_STATUS.md` is pinned to 2026-07-19 and a `hotfix/vercel-build-fix` branch that
  has since merged.
- `docs/01_Project_Overview.md:22` warns that the Tick tracker has historically marked work "done"
  that was never committed. Treat `TICK.md`, `ROADMAP.md` and `.agents/feature-board.md` as
  unverified. (`check-feature-integrity.js` currently reports 7 "In Progress", 7 "Needs Attention",
  1 "Blocked", 40 "Not Started" layers.)

### 14. Nine junk files are committed to git

`frontend/{lint.txt, lint-out.txt, tsc-errors.txt, tsc_errors.txt, tsc-out.txt, typecheck.txt,
typecheck_utf8.txt, raw-utf8.txt}` are all tracked (`git ls-files`). They are UTF-16LE PowerShell
error dumps — captured output of *"The value specified in an AutoRun registry key could not be
parsed"* — containing no useful information. `.gitignore` does not cover them.

### 15. Smaller items

- **CSP allows `'unsafe-inline'` scripts** — `security.js:20`, with a `// tighten in production`
  comment that was never actioned. Helmet also only covers the API; the Vercel-served frontend has
  no security headers.
- **Admin UI is client-trust-gated.** `authStore.ts:65-68` persists `user` (including `role`) to
  localStorage; `AdminGuard.tsx:26` reads `user?.role` from it. Editing localStorage renders the
  admin pages. The backend still enforces `isAdmin`, so this leaks UI, not data — but it is the wrong
  place to make the decision.
- **Hadith bypasses the backend entirely.** `features/hadith/useHadith.ts:4` calls
  `https://hadeethenc.com/api/v1` directly from the browser — no server proxy, no caching, no
  fallback. Meanwhile `vite.config.ts:59` caches `/api/v1/hadith`, a route that does not exist.
- **No timeout or retry on the Quran API.** `quranService.js:38-44` — bare `fetch` with no
  `AbortSignal.timeout`; if `api.alquran.cloud` hangs, the request hangs.
- **`autoIndex` left at default.** `config/database.js` never sets `autoIndex: false`, so Mongoose
  attempts index builds on every boot in production.
- **Mongo transactions require a replica set.** `courseService.js:499` uses
  `startSession`/`startTransaction`; a standalone local `mongod` will fail enrollment. Documented in
  `.env.example:8-10` but easy to trip over.
- **Two import conventions for the API client** — 23 files use `import api from '@/lib/api'`,
  7 use `import { api }`. Both exports exist; purely cosmetic.

---

## Suggested Next Steps

Ordered by what actually blocks an MVP.

**1. ~~Fix the paid-course purchase flow~~ — DONE (`f454557`).** Closed along the exact line this
step recommended: the `Enrollment` is created in `handleCheckoutCompleted`, and the duplicate `$inc`
is gone. The suggested smoke test for the paid path was *not* added — the smoke suites cannot run in
this environment (see the `mongodb-memory-server` entry in `docs/09_Technical_Debt.md`), so coverage
went into `stripeService.test.js` and `webhookController.test.js` instead. Original text follows.

Rewrite `CheckoutPage.tsx` to read `session_id` from the Stripe success URL and call
`POST /courses/:slug/enroll` with `{ paymentSessionId }`; align the param name with
`CourseDetailPage.tsx:106`; thread `paymentSessionId` through `useEnrollInCourse`
(`useCourseEnrollment.ts:16-28`). Better still, create the `Enrollment` directly in
`handleCheckoutCompleted` (`webhookController.js:135`) so access does not depend on the user's
browser surviving the redirect — and remove the duplicate `$inc` at `webhookController.js:140` while
you are in there (Issue #2). Add a smoke test for the full free *and* paid paths.

**2. Close the CSRF hole and the injection surface — MOSTLY DONE (`b343337`, `7705fb0`).**
The cookie restriction and the `$`/`.`-key rejection are both in. **Still outstanding:** the
`ValidationError` branch in `errorHandler.js:31-37` is still commented out, so Mongoose validation
and cast errors still surface as HTTP 500 (Known Issue #6). That was left alone deliberately — it is
not a security fix and was out of scope for the M0 batch. Original text follows.

Restrict cookie-based auth to `POST /user/refresh` only (`config/auth.js:49,89`); everything else
requires the Bearer access token. Add `express-mongo-sanitize` (or reject `$`/`.`-prefixed keys in
`deepSanitize`, `security.js:98`). Uncomment and finish the `ValidationError` branch in
`errorHandler.js:31-37`. These are three small, well-understood diffs against a known-good test suite.

**3. Decide, explicitly, whether RAG is in scope — then write it down.**
Right now the brief, the research memos and the shipped code disagree. Nothing in the codebase moves
toward retrieval, and the two AI cards in `LearnQuranHub.tsx` are the only user-facing promise. Either
(a) drop them and let DeenVerse be the social + LMS platform it actually is, or (b) scope a real
retrieval feature — the corpus is small and already structured (28 topics, ~300 curated ayah refs in
`backend/data/quranTopics.js`, 6,236 ayahs via `quran-meta`), so this is a tractable greenfield
project, but it is a new subsystem with its own provider, cost and content-accuracy review needs, not
an increment. Anything else leaves the roadmap lying to itself.

**4. Ship a moderation and analytics UI, or delete the backends.**
11 finished endpoints across `moderationRoute.js` and `analyticsRoute.js` have no operator. For a
platform with user-generated posts, DMs and live video, an unusable ban/report queue is a launch
blocker. Two admin pages behind the existing `AdminGuard` would close it — the services, schemas and
audit log already exist and are tested at the middleware layer.

**5. Put a floor under the untested half, and stop the docs lying.**
Install Vitest + Testing Library and cover the auth flow, `AuthGuard`/`AdminGuard`, and the
enrollment path first. Add supertest suites for `postService`, `chatService` and `userService` —
the feed and DMs are the oldest code in the repo with zero coverage. Make CI actually run
`npm run lint:web` (it currently only typechecks). Then rewrite `README.md`, which still documents a
different application, delete the 9 committed junk `.txt` files, add the `LICENSE` the README links
to, declare `tldraw` in `frontend/package.json`, move `nodemon` to `devDependencies`, and drop the 5
unused frontend packages.

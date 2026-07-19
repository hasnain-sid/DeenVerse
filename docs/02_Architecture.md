# 02 — Architecture

> As-built architecture as of 2026-07-19 audit ([docs/audits/codebase-audit.md](audits/codebase-audit.md)). The root `ARCHITECTURE.md` describes the *v2 design intent* — largely executed, but partially aspirational (e.g. it promises a backend TypeScript migration and OpenAPI docs that never happened).

## Big picture

DeenVerse is a **monolithic Express API + single-page React app**. There are no microservices, no message queues, and no background job runners — everything is driven by an HTTP request or a Socket.IO event. Optional infrastructure (Redis, AWS, LiveKit, Stripe) degrades gracefully: if it isn't configured, the relevant service logs a warning and no-ops, so the app boots with nothing but MongoDB and a JWT secret.

```
Browser (React SPA, Vercel) ──HTTP /api/v1──▶ Express API (:8081) ──▶ MongoDB Atlas
        │                                        │
        └────────── Socket.IO (WebSocket) ───────┤──▶ Redis (optional: cache, rate limits)
                                                 ├──▶ Stripe (payments, webhooks)
                                                 ├──▶ LiveKit (classroom video + recordings)
                                                 ├──▶ AWS: S3 (media), IVS (streams), SES (email)
                                                 └──▶ alquran.cloud (Quran text API)
```

## Backend

### Middleware pipeline (`backend/index.js`)

Order is load-bearing — memorize the Stripe exception:

1. CORS — allowlist from env plus a regex matching Vercel preview URLs (`deen-verse-front*.vercel.app`)
2. Helmet + CSP (note: `scriptSrc 'unsafe-inline'` — a known weakness)
3. Morgan → Winston request logging
4. **Stripe webhooks (`/api/v1/webhooks`) — mounted BEFORE `express.json()`** because signature verification needs the raw body. **Never move this.**
5. Body parsing (json + urlencoded)
6. Blanket XSS sanitization — mutates every string in body/query/params (a known trap; see [08_Code_Review.md](08_Code_Review.md) #10)
7. Global rate limit — 100 req/min, Redis-backed when connected, in-memory otherwise
8. Socket.IO initialization
9. ~23 route mounts under `/api/v1/*` (full map in [05_API_Documentation.md](05_API_Documentation.md))
10. Central error handler (`middlewares/errorHandler`) — errors resolve to `{ success: false, message }`

### Layering

```
routes/ (25) → controller/ (22) → services/ (30) → models/ (24)
```

Controllers stay thin: parse/validate → call service → `res.json({ ...result, success: true })`. Services own business logic and throw `AppError(message, statusCode)` (`backend/utils/AppError.js`). Newer controllers (courses, quizzes) validate request bodies with Zod schemas from `@deenverse/shared`; older routes use express-validator or nothing at all — this generational split is a recurring theme.

### Authentication

- **Dual JWT**: a 15-minute access token (`TOKEN_SECRET`) held in client memory, and a 7-day refresh token (`REFRESH_TOKEN_SECRET`) in an httpOnly cookie (`SameSite=None` in production).
- `backend/config/auth.js` exports `isAuthenticated` (accepts Bearer **or** the refresh cookie — the root cause of the CSRF finding, [08_Code_Review.md](08_Code_Review.md) #1) and `optionalAuth`. After auth, `req.user` is the userId string.
- Role middleware: `isScholar`, `isAdmin` (checks the `ADMIN_IDS` env allowlist — a `role` enum exists on the user model but is *not* used for authz), `isEnrolled`/`courseAccess` for paid-content gating.
- Tokens are stateless: there is no rotation, revocation, or denylist, and the `banned` flag is never checked at auth time. All three are open critical findings.

### Realtime (`backend/socket/index.js`)

Socket.IO authenticates the WebSocket handshake with the same JWTs. Each user joins a personal room `user:{id}` (used to push notifications and chat); classrooms use `classroom:{id}` rooms gated by enrollment or follower status. Presence tracking, classroom hand-raise queues, and whiteboard-save throttling all live in **in-process JavaScript maps** — there is no Redis adapter, so the whole realtime layer assumes exactly one backend instance. This is the project's hard scaling ceiling ([15_Risk_Assessment.md](15_Risk_Assessment.md)).

### Caching

`backend/services/cacheService.js` wraps ioredis with per-domain TTLs (user 5m, feed 1m, Quran data 7d, …) and no-ops when Redis is down. The Quran routes proxy alquran.cloud with heavy caching.

## Frontend

- **Structure**: feature folders under `frontend/src/features/` (26 of them — auth, feed, hadith, quran, courses, classroom, streams, messages, scholar, payments, …). Every route page is a **named export** lazy-loaded in `App.tsx` via `lazy(() => import(...).then(m => ({ default: m.X })))` — follow this pattern exactly.
- **UI**: shadcn-style primitives in `components/ui/` (CVA + `cn()` from tailwind-merge), Radix under the hood, Lucide icons only, Tailwind 4 tokens from `globals.css`. Design language is "Notion-minimal" with a teal accent (#2D7D6F); Amiri/Scheherazade fonts for Arabic text. Framer Motion for animation.
- **State**: TanStack Query 5 for all server state (per-feature `useX.ts` hooks); Zustand stores (`auth`, `socket`, `theme`, `ui`) for global client state; React Hook Form + Zod for forms.
- **API access**: exclusively through `frontend/src/lib/api.ts` — an axios instance whose interceptor attaches the access token and, on a 401, automatically calls `/user/refresh` with request queueing so concurrent calls wait for one refresh. Never use raw `fetch`.
- **Routing/guards**: React Router 6 with `AuthGuard`/`AdminGuard`.
- **PWA**: vite-plugin-pwa in autoUpdate mode. Workbox caches hadith responses (stale-while-revalidate) and non-auth API calls (network-first); **auth endpoints are regex-excluded from the service-worker cache** after a stale-session bug — treat `frontend/vite.config.ts` workbox config as load-bearing. A `vite:preloadError` handler reloads once to recover from stale lazy chunks after deploys.
- **Dev server**: `:3000`, proxying `/api` and `/socket.io` to the backend on `:8081`, so `VITE_API_URL` stays empty in development.
- **Build**: terser (strips console), gzip + brotli, manual chunk splitting. The build compiles `packages/shared` first.

## Shared package

`@deenverse/shared` (`packages/shared/`) holds Zod schemas (course, classroom, payment, scholar) and TS types — the single source of validation truth across backend, frontend, and (eventually) mobile. It's compiled with plain `tsc` to `dist/` and consumed as a `file:` dependency (frontend) and via Jest `moduleNameMapper` (backend tests). **It must be built (`npm run build:shared`) before backend tests or the frontend build** — most root scripts do this for you.

## Notable design decisions

Condensed from `.claude/DECISIONS.md`; the "why" behind surprising things:

1. **Backend stayed plain JS** — the TS migration only ever reached the frontend. Don't assume server-side types; the shared Zod schemas are the bridge.
2. **Two video stacks on purpose** — AWS IVS for broadcast-scale public live streams (HLS), LiveKit for small interactive classroom rooms with egress recordings to S3.
3. **Redis as optional optimization** — dev simplicity was chosen over consistency; every consumer falls back gracefully.
4. **Vercel over the S3/CloudFront pipeline** — Vercel won for preview deploys; the CI deploy jobs were never deleted and are now dead config.
5. **Admin via `ADMIN_IDS` env allowlist** — predates the role enum; the allowlist is cached at boot (changes require a restart).

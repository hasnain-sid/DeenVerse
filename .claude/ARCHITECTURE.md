# Architecture (as-built)

Monolithic Express API + SPA. No microservices, queues, or background jobs — everything is request- or socket-driven.

## Backend request flow (`backend/index.js`)
CORS (allowlist + Vercel-preview regex) → Helmet/CSP → Morgan→Winston → **Stripe webhooks (raw body, MUST stay before express.json)** → body parsing → XSS sanitize (blanket, mutates all strings) → global rate limit (100/min, Redis or memory) → Socket.IO init → routes (`/api/v1/*`, 23 mounts) → central errorHandler.

## Layering
`routes/ → controller/ → services/ → models/` — controllers thin, services own business logic, errors via `utils/AppError.js`. New (course/quiz) controllers validate bodies with `@deenverse/shared` Zod schemas; older routes use express-validator or nothing.

## Auth
- Access JWT 15min (`TOKEN_SECRET`) in memory client-side (Zustand); refresh JWT 7d (`REFRESH_TOKEN_SECRET`) in httpOnly cookie (SameSite=None in prod).
- `backend/config/auth.js`: `isAuthenticated` accepts Bearer OR cookie (⚠️ CSRF issue — see KNOWN_ISSUES.md); `optionalAuth` variant. `req.user` = userId string.
- Frontend `lib/api.ts`: axios interceptor attaches token, auto-refreshes on 401 with request queueing.
- Admin = `ADMIN_IDS` env allowlist (role enum exists but unused for authz).

## Realtime (`backend/socket/index.js`)
Socket.IO with JWT handshake auth. Per-user rooms `user:{id}`, classroom rooms `classroom:{id}` (enrollment/follower-gated). Presence, hand-raise queues, whiteboard throttle all **in-process memory** — single-instance only, no Redis adapter.

## Caching / degradation pattern
Redis (ioredis) is optional everywhere: cacheService and rate limiter no-op/fall back in-memory when disconnected. Same graceful-degradation for AWS (S3/SES/IVS) and LiveKit when unconfigured.

## Frontend
Feature folders (`src/features/<name>/`), all route pages lazy-loaded in `App.tsx` (named export → lazy pattern), shadcn-style `components/ui/`, Zustand stores (auth/socket/theme/ui) + TanStack Query for server state, `@/` alias, PWA via vite-plugin-pwa (auth endpoints excluded from SW cache). Dev server :3000 proxies `/api` + `/socket.io` → :8081.

Full detail: `docs/audits/codebase-audit.md`. Design intent (partially aspirational): root `ARCHITECTURE.md`.

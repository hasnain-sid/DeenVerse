# DeenVerse — Codebase Audit (2026-07-19)

See also [git-history-audit.md](git-history-audit.md).

## 1. Overview & Architecture
- **Product**: Islamic social media platform — hadith/Quran content, Twitter-like feed, chat, live streams, scholar-taught paid courses (LMS), quizzes, virtual classrooms.
- **Shape**: Monolithic Express API + SPA frontend. No microservices, no queues, no background job runners.
- **Monorepo**: npm workspaces: `packages/shared`, `frontend`, `backend`, `packages/mobile`.
- **Docs**: ARCHITECTURE.md (v2 plan, largely executed), ROADMAP.md, PHASE-1/2/2.5/3 playbooks, docs/ research. **README.md is outdated (describes old CRA v1 app).**

## 2. Directory Map
```
backend/            # Express API (plain JS, ESM) — routes(25) → controller(22) → services(30) → models(24)
  index.js          # Entry: CORS→helmet→morgan→webhooks(raw)→json→sanitize→rate-limit→socket→routes
  config/           # auth (JWT), aws, database, logger (Winston), redis
  middlewares/      # admin, courseAccess, errorHandler, rateLimiter, security, validators
  socket/index.js   # Socket.IO: JWT handshake auth, presence, chat, classroom hand-raise/whiteboard
  data/ scripts/    # seeds; __tests__/ (16 Jest suites + smoke/phase1-3)
frontend/src/
  features/ (26)    # auth, feed, hadith, quran, courses, classroom, streams, messages, scholar, payments…
  components/       # ui/ (shadcn-style), layout/, CommandPalette
  lib/              # api.ts (axios + refresh interceptor), socket.ts
  stores/           # Zustand: auth, socket, theme, ui
packages/shared/    # @deenverse/shared — Zod schemas (course, classroom, payment, scholar), TS types
packages/mobile/    # Expo 52 / RN 0.76 scaffold (expo-router) — mostly pending
scripts/check-feature-integrity.js  # FE↔BE route cross-check (npm run check:integrity)
.agents/            # feature-board.md, contracts/, workflows/ (multi-agent docs)
.tick/ + TICK.md    # Tick task tracker (TASK-001…101; agents: hasna, copilot, copilot-2, antigravity)
.github/            # ci.yml + Copilot/Antigravity instructions
vercel.json         # Vercel SPA deploy
```

## 3. Backend
- Node 20, Express 4 (ESM **JavaScript** — backend TS migration never happened), Mongoose 8, Socket.IO 4, ioredis, Winston+Morgan, Helmet, rate-limiter-flexible, xss.
- API under `/api/v1/`: user, collections, posts, notifications, chat, streams, push, upload, moderation, analytics, daily-learning, quran, quran-topics, ruhani, signs, share, scholars, payments, courses, quizzes, classrooms, admin/courses, webhooks. Plus `/health`, sitemap/robots.
- Stripe webhooks mounted **before** express.json() for raw body signature verification (index.js ~L101).
- 24 Mongoose models incl. course, enrollment, quiz(+attempt), classroom(+participants), payment, scholarPayment.
- Redis = graceful-fallback optimization (config/redis.js, services/cacheService.js — no-op if down). Rate limiting: Redis store when connected else in-memory; global 100 req/min.
- Socket.IO: JWT handshake (auth token = access; cookie = refresh), per-user rooms `user:{id}`, presence/chat/classroom state all **in-memory** — single-process assumption, no Redis adapter.

## 4. Auth
- JWT access (Bearer, TOKEN_SECRET) + refresh (httpOnly cookie, REFRESH_TOKEN_SECRET, falls back to access secret). backend/config/auth.js + utils/tokenUtils.js. `isAuthenticated` / `optionalAuth`; req.user = userId.
- Frontend: access token in Zustand authStore; lib/api.ts axios interceptor auto-refreshes on 401 via /user/refresh with request queue.
- Admin via `ADMIN_IDS` env allowlist; scholar role system; courseAccess middleware gates paid content.
- Helmet+CSP, xss sanitize, CORS allowlist + Vercel preview regex `deen-verse-front*.vercel.app`.

## 5. Frontend
- React 18.3 + TS 5.6 + Vite 5, Tailwind 4 + shadcn/ui-style (CVA, Radix), Lucide, Framer Motion.
- Zustand + TanStack Query 5; RHF + Zod; React Router 6, all pages lazy-loaded in App.tsx; AuthGuard/AdminGuard.
- LiveKit React + hls.js, @tldraw/tldraw whiteboard, fuse.js, react-virtual, DOMPurify, html-to-image export.
- PWA: vite-plugin-pwa autoUpdate; Workbox: hadith SWR cache, non-auth API network-first (auth endpoints excluded).
- Build: terser (drops console), gzip+brotli, manual chunks. Dev :3000 proxies /api & /socket.io → :8081. `npm run build` compiles shared first (`tsc -p ../packages/shared/tsconfig.json && tsc && vite build`).

## 6. Shared & Mobile
- @deenverse/shared: Zod 4 schemas + types, built with tsc to dist/; frontend uses `file:` dep; backend tests map it via Jest moduleNameMapper → dist/. **Must be pre-built** (`npm run build:shared`).
- Mobile: Expo 52 / RN 0.76, expo-router, scaffold only (feature board: all mobile pending).

## 7. Integrations
Stripe v20 (courses, subscriptions, Connect payouts, 30% commission, webhooks), LiveKit (classrooms), AWS S3+presigner (avatars/media/streams/recordings), AWS IVS (live streams), AWS SES (email), Web Push VAPID, alquran.cloud API, MongoDB Atlas, Redis.

## 8. Env Vars (backend)
PORT, NODE_ENV, **MONGO_URI** (⚠️ .env.example wrongly says MONGODB_URI), MONGO_POOL_SIZE, TOKEN_SECRET, REFRESH_TOKEN_SECRET, FRONTEND_URL(_PROD), CORS_ORIGINS, ADMIN_IDS, LOG_LEVEL, REDIS_URL|HOST|PORT|PASSWORD, AWS_REGION|SES_REGION|IVS_REGION|ACCESS_KEY_ID|SECRET_ACCESS_KEY, S3_BUCKET_AVATARS|MEDIA|STREAMS|RECORDINGS, CDN_BASE_URL, SES_FROM_EMAIL, VAPID_*, STRIPE_SECRET_KEY|WEBHOOK_SECRET|CONNECT_WEBHOOK_SECRET|STUDENT_PRICE_ID|PREMIUM_PRICE_ID, COURSE_COMMISSION_RATE, LIVEKIT_API_KEY|API_SECRET|URL, ALQURAN_CLOUD_BASE_URL, QURAN_*_EDITION. Frontend: VITE_API_URL (empty in dev → proxy), VITE_APP_NAME. `.env.example` missing Redis + LiveKit vars.

## 9. Tests, CI/CD, Deploy
- Backend-only tests: Jest 30 + babel-jest, mongodb-memory-server, supertest; 16 suites (Phase 1–3 features) + smoke tests. **No frontend tests.**
- CI (.github/workflows/ci.yml): frontend tsc, backend Jest vs Mongo 7 container, frontend build; deploys to S3+CloudFront (staging: redesign/v2-modern branch; prod: main).
- Vercel is the *other* (apparently active) frontend deploy: deen-verse-front.vercel.app; root build copies frontend/dist → dist/.
- Docker: backend only (node:20-alpine, non-root, /health healthcheck). No compose.

## 10. Multi-Agent Workflow
Development coordinated across AI agents (copilot, copilot-2, antigravity) + human owner via TICK.md/.tick (task YAML, `[tick]` auto-commits), .agents/feature-board.md (feature × layer status), .agents/contracts/ (API contracts), .agents/workflows/, .github/copilot-instructions.md. Phases: 1 scholar+payments, 2 course LMS, 2.5 fixes, 3 virtual classroom — all marked complete.

## 11. Conventions & Gotchas
- Backend: ESM JS, JSDoc, `// ── X ──` section dividers, graceful degradation everywhere (Redis/AWS/LiveKit optional).
- Frontend: feature folders, named-export lazy pages, `@/` alias, Notion-minimal design (teal #2D7D6F), Amiri/Scheherazade Arabic fonts.
- Gotchas: stale README; .env.example drift; in-memory socket state (not horizontally scalable); shared package must be built before backend tests/frontend build; frontend/ dir littered with debug logs (tsc*.txt, build*.log, vite.config.ts.timestamp-*.mjs).

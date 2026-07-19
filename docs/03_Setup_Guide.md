# 03 — Setup Guide

> Verified commands from the 2026-07-19 audit session (Windows, Node v20.10.0 / npm 10.2.3). Everything runs from the **repo root** unless noted.

## Prerequisites

- **Node.js ≥ 20** (prefer ≥ 20.19 — mongodb-memory-server warns on older 20.x but still works) and npm ≥ 10.
- **MongoDB** — you need a **replica set**, not a standalone `mongod`. Course enrollment uses multi-document transactions, which standalone Mongo does not support. The easy path is a free MongoDB Atlas cluster; a local single-node replica set also works. This requirement is easy to trip over and was undocumented until recently.
- Optional (features degrade gracefully without them): Redis, Stripe account, LiveKit project, AWS credentials (S3/IVS/SES), VAPID keys for Web Push.
- Docker only if you want to build the backend image.

## 1. Install

```sh
npm install
```

One root install covers all four workspaces (dependencies are hoisted). Don't be alarmed if `packages/shared/node_modules` doesn't exist — that's normal.

## 2. Environment

```sh
cp backend/.env.example backend/.env   # then fill in values
```

The example file was corrected on 2026-07-19 and is now accurate (it previously said `MONGODB_URI` while the code reads **`MONGO_URI`** — if you see stale copies of that advice, the code wins).

**Minimum to boot**: `MONGO_URI` and `TOKEN_SECRET`. The server starts without everything else — Redis, AWS, LiveKit, Stripe, and VAPID consumers log a warning and no-op.

Selected variables (full table in `.claude/DEPENDENCIES.md` and [audits/codebase-audit.md](audits/codebase-audit.md) §8):

| Variable | Purpose |
|---|---|
| `MONGO_URI`, `MONGO_POOL_SIZE` | MongoDB connection (⚠️ known issue: the URI in the existing `.env` pointed at an Atlas cluster that no longer resolves — you'll likely need your own cluster) |
| `TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | JWT signing (refresh falls back to access secret if unset) |
| `PORT` | API port, default 8081 |
| `FRONTEND_URL`, `FRONTEND_URL_PROD`, `CORS_ORIGINS` | CORS allowlist |
| `ADMIN_IDS` | Comma-separated user ids granted admin. **Cached at boot — restart after changing** |
| `REDIS_URL` (or `REDIS_HOST/PORT/PASSWORD`) | Optional cache + rate-limit store |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET`, `STRIPE_STUDENT_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`, `COURSE_COMMISSION_RATE` | Payments (commission default 0.30) |
| `LIVEKIT_API_KEY/API_SECRET/URL` | Virtual classrooms |
| `AWS_*`, `S3_BUCKET_*`, `CDN_BASE_URL`, `SES_FROM_EMAIL` | Media storage, live streams, email |
| `VAPID_PUBLIC_KEY/PRIVATE_KEY/SUBJECT` | Web Push |
| `ALQURAN_CLOUD_BASE_URL`, `QURAN_*_EDITION` | Quran reader data source |

**Frontend env**: leave `VITE_API_URL` **empty** in development — the Vite dev server proxies `/api` and `/socket.io` to `:8081` for you. Set it only for production builds pointing at a hosted API.

## 3. Run

Two terminals:

```sh
npm run dev:backend   # builds shared package, then nodemon on :8081 (auto-restart)
npm run dev:web       # Vite dev server on :3000 with HMR
```

Open http://localhost:3000. Health check: http://localhost:8081/health.

## 4. Verify your setup

```sh
npm run test:backend    # 392 tests / 19 suites, ~20s — uses in-memory Mongo, no .env needed
npm run typecheck:web   # tsc --noEmit, the CI gate
npm run lint:web        # ESLint over frontend — currently clean
```

If the backend tests pass, your toolchain is fine even if your `.env` isn't finished.

## 5. Seed data (optional, needs a working `MONGO_URI`)

```sh
node backend/scripts/seedAdmin.js
node backend/scripts/seedSigns.js
```

## 6. Production build

```sh
npm run build   # shared → frontend tsc → vite build → copies frontend/dist to ./dist (~2 min)
```

This is exactly what Vercel runs. Output includes the PWA service worker and gzip/brotli assets.

## 7. Docker (backend only)

```sh
cd backend && docker build -t deenverse-api . && docker run -p 8081:8081 --env-file .env deenverse-api
```

There is no docker-compose and no frontend image (frontend ships via Vercel). If you add a backend dependency, regenerate the backend's standalone lockfile or `npm ci` inside the image breaks: `cd backend && npm install --package-lock-only --workspaces=false`.

## Gotchas checklist

- **Shared package first**: `@deenverse/shared` must be tsc-built before backend tests or the frontend build. Root scripts (`dev:backend`, `test:backend`, `build`) handle it; manual invocations may not.
- **Replica set or bust**: enrollment `POST /courses/:id/enroll` throws on standalone Mongo.
- **Stripe webhook mount order** in `backend/index.js` (raw body before `express.json()`) — never reorder.
- **`ADMIN_IDS` cached per-process** — restart the backend after editing it.
- Debugging configs live in `.vscode/launch.json` (local/gitignored): backend `--inspect` launch, attach-to-9229, Chrome-against-Vite, and Jest-current-file. From a terminal: `cd backend && nodemon --inspect index.js`.

Next: [04_Development_Guide.md](04_Development_Guide.md).

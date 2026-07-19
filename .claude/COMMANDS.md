# Commands (verified 2026-07-19 on Windows, Node v20.10.0 / npm 10.2.3)

All from repo root unless noted. ✅ = executed and confirmed working this session.

## Install
```sh
npm install                # ✅ root install covers all workspaces (hoisted). Nothing else needed.
```
Notes: `packages/shared/node_modules` may not exist — fine, deps are hoisted. mongodb-memory-server warns on Node < 20.19 but works; prefer Node ≥ 20.19 when convenient.

## Env setup
```sh
cp backend/.env.example backend/.env    # then fill values — the example file is accurate as of 2026-07-19
```
- Minimum to boot: `MONGO_URI`, `TOKEN_SECRET` (server starts without the rest; Redis/AWS/LiveKit/VAPID/Stripe degrade gracefully with warnings).
- ⚠️ Verified 2026-07-19: the `MONGO_URI` currently in `backend/.env` fails DNS (`cluster0.bwrv8sw.mongodb.net` ENOTFOUND) — Atlas cluster likely paused/deleted. Server still boots; DB calls fail.
- Transactions need a replica set: use Atlas or local replica set, never standalone mongod.
- Frontend `.env`: leave `VITE_API_URL` empty in dev (Vite proxy handles it).

## Run (hot reload built in)
```sh
npm run dev:backend        # builds shared, then nodemon on :8081 (auto-restarts on change) ✅ boots
npm run dev:web            # Vite dev server on :3000 with HMR; proxies /api + /socket.io → :8081
```

## Build
```sh
npm run build:shared       # ✅ tsc → packages/shared/dist (prereq for backend tests & frontend build)
npm run build              # ✅ full production build → ./dist (what Vercel runs); ~2min, PWA + gzip/brotli
```

## Test
```sh
npm run test:backend       # ✅ builds shared + Jest via workspace — 392 tests / 19 suites, ~20s, in-memory Mongo replica set
# single file: cd backend && node ../node_modules/jest/bin/jest.js quizService
```
No frontend tests exist (known gap — see KNOWN_ISSUES.md).

## Lint / format / checks
```sh
npm run lint:web           # ✅ ESLint over frontend — currently clean
npm run typecheck:web      # ✅ tsc --noEmit (the CI gate)
cd frontend && npm run lint:strict    # zero-warnings mode
cd frontend && npm run format         # Prettier write; format:check to verify
npm run check:integrity    # FE↔BE route drift checker
```
No backend lint/format tooling exists (gap — backend is plain JS, only conventions enforce style).

## Debugging
- `.vscode/launch.json` (created 2026-07-19, local/gitignored): backend nodemon --inspect launch, attach-to-9229, Chrome-against-Vite, and Jest-current-file configs.
- Terminal: `cd backend && nodemon --inspect index.js` then attach any inspector to :9229.

## Docker (backend only)
```sh
cd backend && docker build -t deenverse-api . && docker run -p 8081:8081 --env-file .env deenverse-api
```
- Docker 28.3.2 installed. Dockerfile: node:20-alpine, non-root, /health healthcheck.
- Fixed 2026-07-19: `backend/package-lock.json` was out of sync with backend/package.json (missing livekit-server-sdk) which broke `npm ci` in the image — regenerated. **When adding backend deps, refresh it**: `cd backend && npm install --package-lock-only --workspaces=false`.
- No docker-compose and no frontend image (frontend deploys via Vercel).

## Seeds
```sh
node backend/scripts/seedAdmin.js     # needs working MONGO_URI
node backend/scripts/seedSigns.js
```

## Gotchas recap
Shared package must be built before backend tests / frontend build · Stripe webhook mount order in backend/index.js is load-bearing · `ADMIN_IDS` cached at boot (restart after changes) · commit style in [CONVENTIONS.md](CONVENTIONS.md).

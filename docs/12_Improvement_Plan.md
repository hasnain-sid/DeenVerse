# 12 — Improvement Plan

> The actionable, step-by-step version of the near-term roadmap. [11_Roadmap.md](11_Roadmap.md) says *what and in which order*; this says *how*. Steps reference finding numbers from [08_Code_Review.md](08_Code_Review.md).

## Sprint 0 — Consolidate the baseline (hours, not days)

1. **Merge `hotfix/vercel-build-fix` → `main`.** Open a PR (`gh pr create`), confirm CI green (typecheck + backend Jest + build), merge, verify the Vercel production deploy actually redeploys and works. Until this lands, `main` is unsafe to ship ([10_Project_Status.md](10_Project_Status.md)).
2. **Delete the junk untracked files** in `frontend/` (build-task082.txt, lint-phase3.txt, vite timestamp files).
3. **Repo hygiene while you're in there**: delete branches `dev`, `redesign/v2-modern`, `Responsive-Feature`, `UpgradingDownloadOption`; drop the 2 stale v1 stashes; `git worktree remove` the leftover copilot worktree; delete or repoint the dead S3/CloudFront staging job in `.github/workflows/ci.yml` (#16).

## Sprint 1 — Security (the non-negotiable one)

Ordered so each step is independently shippable:

1. **CSRF (#1)**: in `backend/config/auth.js`, stop accepting the refresh cookie in `isAuthenticated`; the cookie should authenticate **only** `POST /user/refresh`. Verify the frontend flow still works (it sends Bearer everywhere; only the axios refresh call relies on the cookie). Regression-test a cross-site form POST no longer executes.
2. **Token rotation + revocation (#2)**: on each `/user/refresh`, issue a new refresh token and denylist the old one's jti in Redis (the unused `TTL.SESSION` constant in `cacheService` was put there for this); denylist on logout too. Degrade gracefully when Redis is absent (log + accept, matching house style) or decide to make Redis mandatory in prod — decide explicitly.
3. **Enforce `banned` (#3)**: check `banned`/`mutedUntil` in login *and* in `isAuthenticated` (cheap: fold into the existing user lookup or cache).
4. **Injection guard (#6)**: add `express-mongo-sanitize` after body parsing, then progressively Zod-validate legacy routes.
5. **Dependency triage (#4 / TASK-044)**: `npm audit`, upgrade or pin the 3 critical + 32 high, rerun the full test suite.
6. **Headers (#8, #9)**: add a `headers` block to `vercel.json` (CSP, HSTS, X-Frame-Options/frame-ancestors); work toward removing `'unsafe-inline'` from the backend CSP.

Each step: write tests in `backend/__tests__/` as you go — this sprint doubles as the start of the auth test backfill.

## Sprint 2 — Ship the idle inventory

Highest feature value per unit of effort, because the backends are done:

1. **Daily Learning UI** — finish the partially built pages (design: `docs/daily-learning-design.md`).
2. **Quran Reader UI** — same.
3. **Ruhani Hub frontend** — 13 backend routes with zero consumers today (design: `docs/ruhani-hub-design.md`).
4. **Moderation admin panel** — consume the 7 existing admin routes; pairs naturally with Sprint 1 step 3, which makes bans actually mean something.
5. **Analytics dashboard** — visualize the events already being collected.

Follow the frontend conventions in [04_Development_Guide.md](04_Development_Guide.md) (feature folders, lazy named-export pages, TanStack Query hooks); run `npm run check:integrity` after wiring each backend.

## Sprint 3 — Trust the codebase again

1. **Backend test backfill** (#14): auth first (it just changed in Sprint 1), then users, posts/feed, chat, notifications. Mirror the structure of the existing phase suites.
2. **Frontend test bootstrap**: add Vitest + RTL, then smoke tests for login, feed render, and course checkout.
3. **Error handling** (#19): re-enable Mongoose ValidationError/CastError mapping in the error handler (400s, not 500s).
4. **Fix the registration race** (#11): pre-check + catch E11000 into a clean 409; raise the password minimum; add lockout.

## Sprint 4 — Structural paydown

In the order argued in [09_Technical_Debt.md](09_Technical_Debt.md): decompose ClassroomLivePage (71KB) and the other 23KB+ pages → consolidate admin authz on `role` (#7) → adopt migrate-mongo (#15) → replace blanket `sanitizeInput` route-by-route (#10) → introduce the `Follow` collection + paginate user queries (#12) → Socket.IO Redis adapter (#5) when multi-instance actually approaches.

## Continuous / cheap wins (do anytime)

- Rewrite the root `README.md` for v2; add the LICENSE file; mark root `ROADMAP.md` honestly or replace it with a pointer to this series (#26, #28).
- Remove the orphan `POST /user/:param`; retire the 17 stale Tick tasks.
- Kill stray `console.log`s (#25); fix the `manualChunks` `'tldraw'` entry (#22); fix the authStore persistence flash (#21).

## Definition of done, per item

Code + tests green (`npm run test:backend`, `typecheck:web`, `lint:web`) + `check:integrity` clean + conventional commit *actually pushed* — given this project's history, "done" means **visible in `git log` on origin**, nothing less.

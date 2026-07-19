# DeenVerse — Deep Code Review (2026-07-19)

Companion to [codebase-audit.md](codebase-audit.md) and [git-history-audit.md](git-history-audit.md). Reviewed at commit 91c02cf (hotfix/vercel-build-fix, pushed; 392 backend tests green).

## 🔴 Critical

1. **CSRF on cookie-authenticated state-changing endpoints.** `isAuthenticated` accepts the refresh-token cookie as full auth for ANY request; prod cookies are `SameSite=None`; `express.urlencoded` is enabled. A cross-site HTML form POST (e.g. to /api/v1/user/follow) executes with the victim's cookie. CORS only blocks reading responses, not the mutation. Fix: only accept Bearer tokens for state-changing requests (cookie only on /user/refresh), or add CSRF tokens / drop urlencoded parsing / SameSite=Lax.
2. **No refresh-token rotation or revocation.** Refresh JWTs are stateless, 7-day, unrevocable; logout only clears the cookie — a stolen token stays valid. `refreshSession` issues new tokens without invalidating old ones. Redis is already available for a token allow/deny list (TTL.SESSION constant already exists, unused).
3. **`banned` flag not enforced at auth.** userSchema has banned/mutedUntil but neither login nor token verification checks them — banned users keep working via existing tokens and can re-login.
4. **Dependabot backlog: 3 critical / 32 high vulns (TASK-044)** — never addressed.
5. **Horizontal scaling blocked by in-memory state.** Socket.IO presence/hand-queues/whiteboard-throttle in process maps, no Redis adapter; rate limiter falls back to memory. Any second instance breaks realtime + presence. Fine today, fatal for the stated "millions of users" goal.
6. **No NoSQL-injection guard on most routes.** xss sanitizer only processes strings, leaving `{$gt:""}`-style objects intact; no express-mongo-sanitize. login/register are covered by express-validator and courses by Zod, but many older routes pass req.body/query straight into Mongoose queries.

## 🟡 Medium

7. Admin authz has two sources of truth: `ADMIN_IDS` env allowlist (cached per-process) vs unused `role: admin` enum. Consolidate on role (with cache invalidation).
8. Frontend on Vercel gets **no security headers** — helmet CSP only covers API responses; vercel.json has no `headers` config. Add CSP/HSTS/frame-ancestors there.
9. Backend CSP has `scriptSrc 'unsafe-inline'`.
10. Blanket `sanitizeInput` mutates every string in body/query/params — destroys legitimate `<`/`>` content (lesson text, math, code samples) and is the wrong layer for XSS (React escaping + DOMPurify already handle output). Prefer per-field sanitization.
11. Password policy: 6-char minimum, no email verification, no lockout beyond loginLimiter (5/15min). Registration race → raw E11000 500s (username dup not even pre-checked).
12. `getOtherUsersProfiles` returns ALL users unpaginated (`User.find({$ne})`); user doc embeds unbounded followers/following arrays → 16MB doc limit and hot-doc contention at scale. Needs a Follow collection.
13. Giant page components: ClassroomLivePage.tsx 71KB, ClassroomLobbyPage 38KB, EditCoursePage 34KB, +7 more >23KB — despite TASK-099 "extract sub-components" marked done.
14. Test coverage is phase-shaped: 392 tests all target courses/quizzes/classrooms/scholar/stripe. Zero tests for user/auth/posts/feed/chat/streams/notifications — the older, most-used surface. **No frontend tests at all.**
15. No DB migration tooling (schema drift handled implicitly by Mongoose defaults); risky for enum/index changes already accumulating.
16. Dual deploy pipelines: Vercel (active) + S3/CloudFront GitHub Actions (staging keyed to deleted branch redesign/v2-modern) — CI deploy jobs are dead/misleading.
17. Enrollment transaction requires a replica set — fine on Atlas & tests (MongoMemoryReplSet), fails on standalone local Mongo; undocumented.
18. `.env.example` drift: says MONGODB_URI (code reads MONGO_URI), missing Redis/LiveKit/ALQURAN vars — onboarding trap.
19. Error handler passes Mongoose ValidationError/CastError through as 500s (specific handling is commented out).
20. Accessibility: ~35 aria-* attributes across 126 TSX files; no focus management/skip links/axe checks evident.

## 🟢 Minor

21. `authStore` persists `isAuthenticated: true` without a token → brief authenticated-UI flash before refresh resolves.
22. vite manualChunks references `'tldraw'` which is not a dependency (only `@tldraw/tldraw`) — brittle config.
23. Login does a second `User.findById` just to strip password (`.select("-password")` on first query would do); toggleSavedContent does 3 sequential queries.
24. `user.saved` is `[String]` with no ref — untyped content ids.
25. Stray `console.log` in redis.js, socket/index.js (Winston elsewhere); Morgan skip only covers /health.
26. Frontend dir littered with committed-adjacent debug logs (tsc*.txt, lint*.txt untracked); repo has no LICENSE file despite README claiming MIT.
27. No OpenAPI/Swagger docs (planned in ARCHITECTURE.md, never built).
28. README still documents the v1 CRA app.

## Recommendations (by impact)

1. Kill the CSRF hole: restrict cookie auth to /user/refresh only (small auth.js change), or CSRF middleware.
2. Add refresh-token rotation + Redis denylist; check `banned` in isAuthenticated/login.
3. Run `npm audit` / Dependabot triage (TASK-044).
4. Add express-mongo-sanitize (or Zod-validate all remaining routes).
5. Socket.IO Redis adapter + move presence/queues to Redis (unblocks horizontal scale).
6. Point CI staging at a live branch or delete the dead deploy jobs; add security headers to vercel.json.
7. Backfill tests for auth/user/posts/feed; add Vitest + a few RTL smoke tests on frontend.
8. Break up the 30KB+ pages; introduce a Follow collection before growth.
9. Fix .env.example, add migration tooling (migrate-mongo), document replica-set requirement.
10. Consolidate admin on role field; strengthen password/registration flow.

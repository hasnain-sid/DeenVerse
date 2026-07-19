# 08 — Code Review

> Prose expansion of the deep code review performed 2026-07-19 at commit `91c02cf` on `hotfix/vercel-build-fix`, with all 392 backend tests green ([audits/deep-code-review.md](audits/deep-code-review.md)). Numbering below matches that audit so the two documents can be cross-referenced.

## How to read this

The review sorted findings into Critical (exploitable or blocking), Medium (real but survivable), and Minor (polish). Nothing here is speculative — each finding was verified against the code. As of this writing, **none of the Critical items have been fixed**; they form the "security sprint" at the top of [12_Improvement_Plan.md](12_Improvement_Plan.md).

## 🔴 Critical

**1. CSRF on cookie-authenticated endpoints.** `isAuthenticated` accepts the refresh-token cookie as full authentication for *any* request. Production cookies are `SameSite=None`, and `express.urlencoded` is enabled — so a plain HTML form on a malicious site can POST to, say, `/api/v1/user/follow` and the browser will attach the victim's cookie and execute the mutation. CORS does not help here: it only prevents *reading* responses, not sending the request. **Fix**: accept cookie auth *only* on `/user/refresh` (a small change in `backend/config/auth.js`), require Bearer tokens for everything state-changing; alternatively add CSRF tokens or move to `SameSite=Lax`.

**2. No refresh-token rotation or revocation.** Refresh JWTs are stateless and live 7 days. Logout clears the cookie but cannot invalidate the token; `refreshSession` issues new tokens without retiring old ones. A stolen refresh token grants a week of access with no remedy. Redis is already wired up and an unused `TTL.SESSION` constant sits in `cacheService` — a denylist (or rotation with reuse detection) is straightforward from here.

**3. `banned` not enforced.** The user schema has `banned` and `mutedUntil`, and moderation endpoints set them — but neither login nor token verification checks them. Banned users keep their sessions and can even log in again. Moderation is currently theater.

**4. Dependency vulnerabilities.** Dependabot reports **3 critical / 32 high** vulnerabilities (tracked as TASK-044 since March, never triaged). Actual exposure unknown until someone runs the audit.

**5. Single-instance ceiling.** Socket.IO presence, classroom hand-raise queues, and whiteboard throttling live in process-local maps with no Redis adapter; the rate limiter falls back to memory too. A second backend instance would silently break realtime, presence, and rate limiting. Fine for today's scale; fatal for the platform's stated ambitions.

**6. NoSQL injection surface.** The XSS sanitizer only touches strings, so operator objects like `{"$gt": ""}` pass through untouched, and there is no `express-mongo-sanitize`. Login/register (express-validator) and course routes (Zod) are protected, but many older routes pass `req.body`/`req.query` straight into Mongoose queries.

## 🟡 Medium

7. **Two admin authz sources of truth** — the `ADMIN_IDS` env allowlist (cached per-process) vs an unused `role: admin` enum. Consolidate on the role field.
8. **No security headers on the Vercel frontend** — helmet only covers API responses; `vercel.json` sets no CSP/HSTS/frame-ancestors.
9. **Backend CSP allows `scriptSrc 'unsafe-inline'`.**
10. **Blanket `sanitizeInput`** mutates every string in body/query/params — it can corrupt legitimate `<`/`>` content (lesson text, code samples) and is the wrong layer anyway (React escaping + DOMPurify already handle output). Prefer per-field validation.
11. **Weak account flow** — 6-character password minimum, no email verification, no lockout beyond the login limiter (5/15min); duplicate-username registration races produce raw E11000 500s.
12. **Unpaginated/unbounded user data** — `getOtherUsersProfiles` returns *every user*; follower/following arrays embedded on the user doc grow without bound (16MB doc limit, hot-doc contention). Needs a `Follow` collection.
13. **Giant page components** — ClassroomLivePage.tsx is 71KB; nine more pages exceed 23KB, despite the task to decompose them being marked "done" (another tracker-trust lesson).
14. **Phase-shaped test coverage** — all 392 tests target Phases 1–3 (courses/quizzes/classrooms/scholar/Stripe). The oldest, most-used surface — auth, users, posts, feed, chat, streams, notifications — has **zero tests**, and the frontend has none at all.
15. **No DB migration tooling** — schema drift rides on Mongoose defaults; risky for the enum/index changes already accumulating.
16. **Dual deploy pipelines** — Vercel is live; the S3/CloudFront GitHub Actions jobs are dead (staging keyed to a deleted branch) and only mislead.
17. **Replica-set requirement undocumented** (now documented in [03_Setup_Guide.md](03_Setup_Guide.md)) — enrollment transactions fail on standalone Mongo.
18. **`.env.example` drift** — wrong Mongo var name, missing Redis/LiveKit/quran vars. *(Corrected 2026-07-19, noted here for history.)*
19. **Error handler passes Mongoose ValidationError/CastError through as 500s** — the specific handling exists but is commented out.
20. **Accessibility is thin** — ~35 aria attributes across 126 TSX files; no focus management, skip links, or automated checks.

## 🟢 Minor

21. `authStore` persists `isAuthenticated: true` without a token → brief flash of authenticated UI before refresh resolves.
22. Vite `manualChunks` references `'tldraw'`, which is not a dependency (only `@tldraw/tldraw` is) — brittle config.
23. Redundant queries: login refetches the user just to strip the password (`.select("-password")` would do); `toggleSavedContent` runs 3 sequential queries.
24. `user.saved` is an untyped `[String]` with no ref.
25. Stray `console.log` in `redis.js` and `socket/index.js` (Winston everywhere else); Morgan's skip-list only covers `/health`.
26. Debug-log litter in `frontend/` (tsc*.txt, lint*.txt, vite timestamp files); no LICENSE file despite the README claiming MIT.
27. No OpenAPI/Swagger docs.
28. README still documents the v1 CRA app.

## Recommendations, ranked by impact

1. Close the CSRF hole (cookie auth only on `/user/refresh`).
2. Refresh-token rotation + Redis denylist; enforce `banned` in `isAuthenticated` and login.
3. Triage the Dependabot backlog (TASK-044).
4. Add `express-mongo-sanitize` (or finish Zod-validating the legacy routes).
5. Socket.IO Redis adapter + move presence/queues to Redis.
6. Delete or repoint the dead CI deploy jobs; add security headers to `vercel.json`.
7. Backfill tests for auth/user/posts/feed; stand up Vitest + a few RTL smoke tests.
8. Decompose the oversized pages; introduce a `Follow` collection before growth makes it painful.
9. Add migration tooling; keep `.env.example` honest.
10. Consolidate admin authz on `role`; strengthen password/registration flow.

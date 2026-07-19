# Known Issues

Full analysis: `docs/audits/deep-code-review.md`. Ordered by severity.

## Critical (security)
1. **CSRF**: `isAuthenticated` accepts the refresh cookie (SameSite=None) as full auth on ALL endpoints + `express.urlencoded` enabled → cross-site form POSTs execute mutations. Fix: cookie auth only on `/user/refresh`.
2. **No refresh-token rotation/revocation** — stolen 7d tokens irrevocable; logout only clears the cookie. Redis denylist needed (unused `TTL.SESSION` already defined in cacheService).
3. **`banned`/`mutedUntil` never checked** at login or token verification — moderation bans don't work.
4. **TASK-044**: 3 critical / 32 high Dependabot vulns, untriaged since March.
5. **NoSQL injection surface** on older routes (no mongo-sanitize; xss middleware ignores objects like `{$gt:""}`). Auth + course routes are validated; legacy routes aren't.

## High (operational)
6. Horizontal scaling blocked: socket presence/hand-queues/whiteboard-throttle in process memory, no Redis adapter; memory rate-limit fallback.
7. `main` ships pre-hardening code until `hotfix/vercel-build-fix` merges.
8. Vercel frontend has zero security headers (helmet only covers API); backend CSP allows `'unsafe-inline'` scripts.
9. Mongo transactions (enrollment) require replica set — standalone local Mongo breaks; undocumented.

## Medium
10. Blanket `sanitizeInput` mutates all request strings — can corrupt legitimate `<`/`>` content.
11. ADMIN_IDS allowlist (cached per-process — changes need restart) vs unused `role` enum.
12. Test coverage phase-shaped: auth/users/posts/feed/chat/streams have zero tests; frontend has none at all.
13. 10 frontend pages >23KB (ClassroomLivePage.tsx = 71KB).
14. Registration: 6-char passwords, no email verification, duplicate-username race → raw E11000 500.
15. Unbounded followers/following arrays on user doc; `getOtherUsersProfiles` returns all users unpaginated.
16. Mongoose ValidationError/CastError surface as 500s (errorHandler's specific handling commented out).
17. `.env.example` drift: `MONGODB_URI` vs code's `MONGO_URI`; Redis/LiveKit/quran-API vars missing.

## Minor
authStore persists `isAuthenticated` without token (UI flash) · vite manualChunks references non-dependency `'tldraw'` · stray console.log in redis.js/socket · README/ROADMAP stale · no LICENSE file · frontend debug-log litter · a11y sparse (~35 aria attrs / 126 files)

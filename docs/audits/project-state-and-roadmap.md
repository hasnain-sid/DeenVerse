# DeenVerse — Project State Reconstruction & Roadmap (2026-07-19)

Synthesized from the codebase audit, git-history audit, and deep code review (see [README.md](README.md)), cross-checked against `TICK.md`, `.agents/feature-board.md`, and `ROADMAP.md`. Supersedes the status claims in the root `ROADMAP.md` (which optimistically marks all 8 phases complete) — this document reflects what is actually in the code.

---

## Part 1 — State Reconstruction

### ✅ Completed features (all layers working, most with tests)

| Feature | Notes |
|---|---|
| Auth (JWT access + refresh) | 15min/7d tokens, axios auto-refresh, forgot/reset password via SES |
| Feed / Posts | Hashtags, mentions, replies, trending; indexed queries; rate-limited |
| Hadith browse + image export | Original core feature, PWA-cached |
| Collections / Saved | |
| Chat / Messaging | Socket.IO, conversations/messages |
| Notifications | In-app (socket) + Web Push (VAPID); message/link content since Phase 2.5 |
| Live Streaming | AWS IVS + hls.js viewer |
| Search / Explore / Community | fuse.js client search + user search |
| Quran Topics (browse by topic) | Netflix-style UI, code-reviewed |
| Share to Feed | |
| Iman Boost, Signs, Streaks | |
| Scholar Role System | Application → admin review → role; badges; earnings pages |
| Payment System (Stripe) | Checkout, subscriptions (student/premium), Connect payouts, 30% commission, webhooks (raw-body mount) |
| Course System (LMS) | Models/API/UI: discovery, detail, player, builder, progress, admin review; Zod-validated writes; transactional enrollment |
| Quiz engine | Attempts, grading, answer-hiding, soft-archive (Phase 2.5 hardened) |
| Virtual Classroom | LiveKit rooms/tokens/recordings, tldraw whiteboard, scheduler, hand-raise; socket authz fixed 2026-07-19 |
| PWA | Install prompt, workbox caching (auth endpoints excluded), stale-chunk recovery |
| Infrastructure hygiene | Winston logging, Helmet+CSP, rate limiting (Redis-backed), XSS sanitize, health checks, Docker (backend) |

### 🟡 Partially completed (backend done, frontend thin or absent)

1. **Daily Learning** — backend ✅, UI partially done (board: high priority)
2. **Quran Reader** — backend ✅, UI partially done
3. **Ruhani Hub** — backend ✅ with **13 unconsumed routes**, frontend pages missing
4. **Moderation** — backend ✅ (7 admin routes, reports, audit log), **no admin panel UI**; `banned` flag not enforced at auth
5. **Analytics** — backend ✅ (event tracking, 3 routes), **no dashboard UI**
6. **Uploads (S3 presign flow)** — code complete; AWS env vars/bucket CORS verification deferred (ROADMAP backlog note)
7. **Mobile app** — Expo 52 scaffold with deps only; no feature screens
8. **Email (SES)** — password reset only; no verification/digest emails

### 🔴 Broken / defective as-shipped

1. **CSRF exposure** — refresh cookie (SameSite=None) accepted as full auth on all endpoints + urlencoded parsing → cross-site form mutations possible (review Critical #1)
2. **Moderation bans ineffective** — `banned`/`mutedUntil` never checked at login or token verification
3. **Token revocation impossible** — stateless 7-day refresh JWTs, no rotation/denylist
4. **CI staging deploy dead** — keyed to deleted branch `redesign/v2-modern`; S3/CloudFront pipeline unused while Vercel is the real deploy
5. **Orphan endpoint** — `POST /user/:param` flagged by integrity checker (board pending #8)
6. *(Fixed 2026-07-19)* Classroom REST routes were never mounted; course-only classroom socket join/whiteboard failed (bad import) — both resolved in the recovered Phase 2.5 commits

### ⬜ Missing (planned, never started)

- Email verification flow (ROADMAP Phase 2 Step 4, board "contract needed")
- Google OAuth (and Apple/GitHub)
- Interactive Quran Teaching (Phase 4 concept, depends on classroom)
- Certification system (certificateOnCompletion flag exists, no generation)
- Dawah & Q&A platform (Phase 6 concept)
- Admin dashboards (moderation + analytics UIs)
- OpenAPI/Swagger docs
- Frontend test suite (zero tests)
- DB migration tooling
- Socket.IO Redis adapter / multi-instance support
- Follow collection (social graph still embedded arrays on user doc)

### 🧱 Technical debt (from deep review)

- Phase-shaped tests: 392 tests cover only Phases 1–3 features; auth/users/posts/feed/chat/streams untested
- 10 frontend pages > 23KB (ClassroomLivePage 71KB) despite TASK-099 "done"
- Blanket `sanitizeInput` mutation; no NoSQL-operator sanitization on older routes
- ADMIN_IDS env allowlist vs unused `role` enum (two authz sources of truth)
- `.env.example` drift (MONGODB_URI vs MONGO_URI; Redis/LiveKit vars missing)
- No security headers on Vercel frontend; backend CSP allows 'unsafe-inline' scripts
- Stale docs: README describes v1 CRA app; ROADMAP.md claims Phases 4–8 complete (aspirational); no LICENSE despite MIT claim
- Repo litter: debug logs in frontend/, stale vite timestamp files, leftover copilot worktree + 5 dead branches, 2 v1-era stashes
- Weak account flow: 6-char passwords, no lockout, register races → raw 500s
- Password reset/login do redundant queries; unpaginated `getOtherUsersProfiles`

### 🚧 Blockers

1. **`hotfix/vercel-build-fix` not merged** — main lacks the Vercel build fixes AND all 12 recovered Phase 2.5/security commits; deploying main today ships known-vulnerable quiz/classroom code
2. **TASK-044: 3 critical / 32 high Dependabot vulnerabilities** — unresolved since March
3. **Replica-set requirement** — enrollment transactions fail on standalone local Mongo (undocumented; blocks local onboarding)
4. **Single-instance ceiling** — in-memory socket/presence/rate-limit state blocks horizontal scaling
5. **Stale multi-agent tracker state** — 17 Tick tasks open (mostly superseded prototype tasks) pollute the queue for any resumed agent workflow

---

## Part 2 — Roadmap

### Completed
Everything in "Completed features" above: the v2 platform (Vite/TS/Tailwind frontend, hardened Express API), social core (feed/chat/notifications/streams), spiritual content (hadith/quran/topics/ruhani backend), and the monetized education stack (scholars → payments → courses → quizzes → virtual classrooms), now including the recovered Phase 2.5 hardening (committed & pushed 2026-07-19).

### In Progress
- **Branch consolidation**: `hotfix/vercel-build-fix` (14 commits ahead) awaiting merge → `main`
- Daily Learning / Quran Reader frontend completion (board pending, high priority)
- Mobile app (scaffold exists; awaiting contract + first screens)

### Next Priority (ordered)
1. **Merge `hotfix/vercel-build-fix` → main** and verify Vercel production deploy (unblocks everything else)
2. **Security sprint** (review Criticals): restrict cookie auth to /user/refresh (CSRF), refresh-token rotation + Redis denylist, enforce `banned` at auth, `express-mongo-sanitize`, Dependabot triage (TASK-044)
3. **Finish the half-built UIs**: Daily Learning, Quran Reader, Ruhani Hub (13 idle routes), then moderation panel + analytics dashboard (their backends are idle inventory)
4. **Email verification** (highest-priority missing feature per board; needs contract)
5. **Close tracker hygiene**: retire the 17 stale Tick tasks, fix the orphan `POST /user/:param`, repoint or delete the dead CI staging pipeline

### Future Improvements
- Google OAuth → then Apple/GitHub
- Certification system (course completion → generated certificates)
- Interactive Quran Teaching on top of Virtual Classroom
- Dawah & Q&A platform
- Mobile feature build-out (auth → feed → courses parity)
- OpenAPI docs; Vitest + RTL frontend tests; Playwright smoke E2E
- Socket.IO Redis adapter + presence in Redis (scale prerequisite)
- Follow collection + paginated user queries (social-graph scale)
- Security headers via vercel.json; drop 'unsafe-inline' CSP

### Technical Debt (paydown order)
1. Test backfill for the untested legacy surface (auth/users/posts/feed)
2. Decompose the 10 oversized pages (start: ClassroomLivePage 71KB)
3. Consolidate admin authz on `role`; kill ADMIN_IDS duality
4. `.env.example` correction + migrate-mongo + document replica-set need
5. Replace blanket sanitizeInput with per-field validation (Zod everywhere)
6. Docs refresh: rewrite README for v2, mark ROADMAP.md phases honestly, add LICENSE
7. Repo cleanup: delete dead branches/stashes/worktree, purge debug-log litter

### Known Risks
- **Deploying main before the merge** ships the pre-hardening quiz answer leak + open classroom sockets
- **CSRF + irrevocable tokens** are live in production until the security sprint lands
- **Ban evasion**: moderation actions don't take effect at the auth layer
- **npm audit backlog** (3 critical/32 high) — unknown exposure until triaged
- **Local dev fragility**: standalone Mongo breaks enrollment; missing env docs make onboarding error-prone
- **Scale cliff**: first horizontal scale-out silently breaks realtime/presence/rate-limiting
- **Process risk**: the Tick/agent workflow previously marked work "done" that was never committed — treat tracker status as untrusted until verified against git (integrity check + `git log -- <file>`)

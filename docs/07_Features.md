# 07 — Features

> Feature inventory **verified against code** on 2026-07-19 ([audits/project-state-and-roadmap.md](audits/project-state-and-roadmap.md)). This is the honest version — the root `ROADMAP.md` and parts of `TICK.md` claim more than exists. Live layer-by-layer status: `.agents/feature-board.md`.

## ✅ Complete (backend + frontend working, mostly tested)

**Social platform**
- **Auth** — register/login with dual JWTs (15min access / 7d refresh), automatic client-side refresh, forgot/reset password via SES email.
- **Feed / Posts** — hashtags, mentions, replies, trending; indexed queries; rate-limited.
- **Hadith browse + image export** — the original core feature; PWA-cached, exportable as images (html-to-image).
- **Collections / Saved content**.
- **Chat / Messaging** — Socket.IO conversations and messages, presence.
- **Notifications** — in-app (socket-pushed) + browser Web Push (VAPID); carry message/link payloads since Phase 2.5.
- **Live Streaming** — AWS IVS channels with an hls.js viewer.
- **Search / Explore / Community** — fuse.js client-side search + server user search.
- **Quran Topics** — Netflix-style browse-by-topic UI (code-reviewed; research in `docs/browse-by-topic-optimization-research.md`).
- **Share to Feed** — share hadith/ayah content into posts with enrichment.
- **Iman Boost** (mood-based ayah recommendations), **Signs** (curated content, seeded), **Streaks**.

**Education & commerce stack** (Phases 1–3 of the v2 effort)
- **Scholar Role System** — application → admin review → verified role with badges and earnings pages.
- **Payments (Stripe)** — course checkout, student/premium subscriptions, Connect onboarding and payouts with 30% platform commission, signature-verified webhooks.
- **Course LMS** — discovery, detail, player, builder, progress tracking, admin review queue; Zod-validated writes; transactional enrollment with capacity checks.
- **Quiz engine** — attempts, server-side grading, answer-hiding on start, soft-archive to preserve grades (hardened in Phase 2.5).
- **Virtual Classroom** — LiveKit rooms/tokens/recordings (egress → S3), tldraw whiteboard with persistence, scheduling, hand-raise queue, host controls. Socket access control (enrollment/follower gating) was fixed 2026-07-19.

**Platform**
- **PWA** — install prompt, workbox caching with auth endpoints excluded, stale-chunk auto-recovery.
- **Infrastructure hygiene** — Winston logging, Helmet+CSP, Redis-backed rate limiting, XSS sanitization, health checks, backend Dockerfile.

## 🟡 Partial (backend done, frontend thin or absent)

| Feature | State | Gap |
|---|---|---|
| **Daily Learning** | Backend ✅ (content + progress API) | UI partially built — board marks it high priority |
| **Quran Reader** | Backend ✅ (alquran.cloud proxy, cached) | UI partially built — high priority |
| **Ruhani Hub** | Backend ✅ — **13 routes, zero frontend consumers** | Entire frontend missing (design doc: `docs/ruhani-hub-design.md`) |
| **Moderation** | Backend ✅ (reports, 7 admin actions, audit log) | No admin panel UI; worse, `banned` is never enforced at auth so actions are cosmetic |
| **Analytics** | Backend ✅ (event tracking, 3 routes) | No dashboard UI |
| **Uploads (S3 presign)** | Code complete end-to-end | AWS env/bucket-CORS verification deferred — not confirmed working against real buckets |
| **Email (SES)** | Password reset works | No verification, digest, or notification emails |
| **Mobile app** | Expo 52 scaffold with deps | Zero feature screens |

The pattern to internalize: **several backends are "idle inventory"** — fully built APIs waiting for UIs. Building those UIs is cheap, high-value work ([12_Improvement_Plan.md](12_Improvement_Plan.md)).

## 🔴 Broken / defective as shipped

Full analysis in [08_Code_Review.md](08_Code_Review.md):

1. **CSRF exposure** — the refresh cookie (SameSite=None) is accepted as full auth on every endpoint, and urlencoded parsing is enabled, so cross-site form POSTs can perform mutations as the victim.
2. **Bans don't work** — `banned`/`mutedUntil` exist on the user model but are never checked at login or token verification.
3. **Tokens are irrevocable** — stateless 7-day refresh JWTs with no rotation or denylist; logout only clears the cookie.
4. **CI staging deploy is dead** — keyed to the deleted branch `redesign/v2-modern`.
5. **Orphan endpoint** — `POST /user/:param` exists on the backend with no consumer.
6. *(Fixed 2026-07-19)* Classroom REST routes were unmounted and course-only classroom socket joins failed on a bad import — both resolved in the recovered Phase 2.5 commits.

## ⬜ Missing (planned, never started)

- Email verification flow (highest-priority missing feature per the board; contract needed first)
- Google OAuth (then Apple/GitHub)
- Certification system (`certificateOnCompletion` flag exists on courses; no generation)
- Interactive Quran Teaching (Phase 4 concept, builds on classrooms)
- Dawah & Q&A platform (Phase 6 concept)
- Admin dashboards for moderation + analytics
- OpenAPI/Swagger docs · frontend test suite · DB migrations · Socket.IO Redis adapter · `Follow` collection

## Design & research docs

Feature design thinking lives alongside this file in `docs/`: `daily-learning-design.md`, `iman-boost-feature-design.md`, `ruhani-hub-design.md`, `quran-learning-feature-solutions.md`, `mood-based-ayah-research.md`, `courses-scholars-platform-research.md`, and several optimization/code-review write-ups. Check there before redesigning any of these features from scratch.

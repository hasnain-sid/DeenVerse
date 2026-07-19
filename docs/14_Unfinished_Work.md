# 14 — Unfinished Work

> Every loose end in one place: half-built features, open tracker tasks, and process leftovers. Cross-referenced from [07_Features.md](07_Features.md) (feature detail) and [13_Git_History_Summary.md](13_Git_History_Summary.md) (repo state).

## 1. The unmerged branch (blocking everything)

`hotfix/vercel-build-fix` is pushed but was never PR'd or merged. Until it lands on `main`, the security hardening recovered in July exists only on this branch, and `main` remains unsafe to deploy. **This is the single most important unfinished item.**

## 2. Backends waiting for frontends ("idle inventory")

| Feature | Backend | What's missing |
|---|---|---|
| Daily Learning | ✅ content + progress API | Finish the partially built UI (board: high priority) |
| Quran Reader | ✅ cached alquran.cloud proxy | Finish the partially built UI (high priority) |
| Ruhani Hub | ✅ **13 routes, zero consumers** | Entire frontend (design doc exists: `docs/ruhani-hub-design.md`) |
| Moderation | ✅ reports + 7 admin actions + audit log | Admin panel UI — and enforcement of `banned` at auth, without which the whole feature is inert |
| Analytics | ✅ event tracking (3 routes) | Dashboard UI |
| Uploads (S3 presign) | ✅ code complete | Real-world verification: AWS env vars + bucket CORS never confirmed |
| Email (SES) | ✅ password reset | Verification emails, digests, notification emails |

## 3. The mobile app

`packages/mobile/` is an Expo 52 / React Native 0.76 scaffold with expo-router and dependencies installed — and no feature screens at all. The feature board lists every mobile layer as pending. Nothing has been started; the intended path is auth → feed → courses parity, gated on a `.agents/contracts/` contract.

## 4. Open Tick tracker tasks (17)

State as of the July audit — most are **superseded and should be closed**, not done:

- **TASK-044** — *the only genuinely urgent one*: Dependabot backlog, 3 critical / 32 high vulns, untouched since March.
- **TASK-029** (scholar earnings overview API) — real backlog item, still plausible.
- **TASK-030/033** stuck `in_progress`; **TASK-031/032/034, 051/052/054/055, 073–076** in backlog — all belong to a "5 prototypes" experiment that real shipped pages superseded. Close them.
- **TASK-001/021** stuck `in review` — stale; verify and close.

Remember the standing rule: Tick statuses are untrustworthy in both directions — "done" tasks weren't always done, and these "open" tasks are mostly finished-or-obsolete.

## 5. Known dangling ends in code and config

- **Orphan endpoint** `POST /user/:param` — flagged by `npm run check:integrity`, no frontend consumer. Remove it.
- **Dead CI staging deploy** — S3/CloudFront job keyed to the deleted `redesign/v2-modern` branch. Delete or repoint.
- **Unused `role` enum** on the user model — admin authz still runs on `ADMIN_IDS`; consolidation planned.
- **Unused `TTL.SESSION`** constant in `cacheService` — placed for the (unbuilt) refresh-token denylist.
- **`certificateOnCompletion`** flag on courses — no certificate generation exists behind it.
- **Blanket `sanitizeInput`** — scheduled for replacement by per-route Zod validation, not yet started.

## 6. Repo housekeeping never finished

- Junk untracked files in `frontend/` (build-task082.txt, lint-phase3.txt, 3 vite timestamp files) — delete.
- 5 dead branches, 2 stale stashes, 1 leftover registered worktree — clean per the table in [13_Git_History_Summary.md](13_Git_History_Summary.md).
- Root `README.md` (v1-era) and `ROADMAP.md` (aspirational) rewrites; missing LICENSE file.

## 7. Never-started but planned

Listed with the roadmap ([11_Roadmap.md](11_Roadmap.md)): email verification, Google OAuth, certification generation, Interactive Quran Teaching, Dawah & Q&A, admin dashboards, OpenAPI docs, frontend tests, DB migrations, Socket.IO Redis adapter, `Follow` collection.

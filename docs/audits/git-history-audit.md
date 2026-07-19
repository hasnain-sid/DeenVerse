# DeenVerse — Git History Audit (2026-07-19)

See also [codebase-audit.md](codebase-audit.md).

## Repo stats
- 450 commits, first commit 2024-05-27. Contributors: hasnain-sid (389, incl. AI-agent commits), Hasnain Akhtar, Hasnain, Uves0786. Remote: git@github.com:hasnain-sid/DeenVerse.git (origin only). **No tags.**

## Branches
| Branch | Tip date | State |
|---|---|---|
| `hotfix/vercel-build-fix` (HEAD, pushed) | 2026-07-19 | Active branch. Now 14 ahead of main: 2 vercel build fixes + 12 recovered Phase 2.5 commits (see below). Not yet merged back to main. |
| `main` | 2026-03-23 | Phase 3 complete ([tick] TASK-086). |
| `copilot-worktree-2026-03-23T18-44-58` | = main | Leftover worktree at `C:/Users/hasna/Desktop/DeenVerse.worktrees/…` still registered. |
| `dev` | 2026-02-24 | 368 behind main, 0 ahead — stale, fully merged. |
| `redesign/v2-modern` | 2026-02-23 | Merged into main; upstream deleted ([gone]). Safe to delete locally. CI staging deploy still keyed to this branch (dead config). |
| `Responsive-Feature` | 2025-05-27 | v1-era, NOT merged. Abandoned. |
| `UpgradingDownloadOption` | 2025-05-25 | Merged, upstream gone. Stale. |
| `origin/Testing_Branch` | old | v1-era remote-only. |

## Stashes (both v1-era, abandoned)
- stash@{0} (2026-02-18, Responsive-Feature): "not able to find the right side bar"
- stash@{1} (2025-06-11, Responsive-Feature): WIP

## ✅ RESOLVED 2026-07-19: the uncommitted Phase 2.5 code described below was reviewed and committed as 12 scoped commits (`3595721…91c02cf`, incl. a fix for a broken `Enrollment` default-import in socket/index.js discovered during review), verified with the full backend test suite (392 tests green), and **pushed** to origin/hotfix/vercel-build-fix. Only junk untracked files remain in the tree.

## (Historical) ⚠️ uncommitted Phase 2.5 code (~3,050 insertions, 26 files)
Tick commits mark TASK-087→101 (Phase 2 readiness + Phase 2.5 security/data-integrity fixes) **done** on 2026-03-12, but **only tracker metadata was committed — the actual code was never committed**. It sits uncommitted in the working tree (some files mtime 03-12, socket/index.js re-touched 03-24):
- `backend/services/quizService.js` (+146): answer-hiding serializers (serializeQuestionForStart strips isCorrect), ADMIN_IDS caching, soft-delete
- `backend/services/courseService.js` (+126), courseController (+52), quizController (+24): normalized API response contracts
- `backend/socket/index.js` (+124): classroom:join-room now enforces enrollment/follower access control (security fix)
- Models: min/max validators, enrollment index (course/enrollment/quiz/quizAttempt/notification/classroom schemas)
- `packages/shared/src/schemas/course.ts` (+38), `scripts/check-feature-integrity.js`, backend +livekit-server-sdk dep, root +@livekit/components-styles
- `frontend/src/main.tsx`: vite:preloadError reload-once recovery; `frontend/vite.config.ts`: workbox skipWaiting/cleanupOutdatedCaches + never-cache-auth-endpoints regex
These are mostly **security fixes** — losing them (checkout/reset) would silently regress security. Phase 3 (TASK-077–086) was committed from the separate copilot worktree while these stayed dirty in the main checkout.

## Untracked files
- `PHASE-2-READINESS-PLAYBOOK.md`, `PHASE-2.5-FIXES-PLAYBOOK.md` (real docs, should be committed)
- Junk: `frontend/build-task082.txt`, `frontend/lint-phase3.txt`, 3× `frontend/vite.config.ts.timestamp-*.mjs` (safe to delete; other logs like tsc*.txt are gitignored)

## Where development stopped
2026-03-24 ~02:00 IST: Phase 3 merged to main (TASK-086), then hotfix/vercel-build-fix branch created for Vercel deploy fixes — pushed but never PR'd/merged to main. Working tree left dirty with the Phase 2.5 code.

## Unfinished / open items
- Merge hotfix/vercel-build-fix → main; commit the Phase 2.5 working-tree changes (verify tests first).
- TASK-044 (backlog): **Dependabot vulns — 3 critical, 32 high** — never addressed.
- TASK-029 backlog (scholar earnings overview API); TASK-030/033 stuck in_progress, TASK-031/032/034, 051/052/054/055, 073–076 backlog — all "5 prototypes" tasks, superseded (real pages shipped); TASK-001/021 stuck in review.
- Mobile app scaffold untouched.

## Risky to touch
1. Working tree — do NOT `git checkout .`/`reset --hard`: uncommitted security fixes.
2. `backend/index.js` webhook mount order (Stripe raw body before express.json).
3. `frontend/vite.config.ts` workbox regexes (auth-endpoint cache exclusion).
4. Leftover worktree branch + `.tick/` auto-commit machinery (agents may assume its state).
5. CI staging deploy references deleted branch redesign/v2-modern (dead but harmless).
- No TODO/FIXME/HACK comments in backend or frontend/src.

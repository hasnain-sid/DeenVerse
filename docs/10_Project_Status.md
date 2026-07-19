# 10 — Project Status

> Snapshot as of **2026-07-20**. When this file and reality diverge, run `git log --oneline -15 --all` and trust git. Session-by-session status lives in the local `.claude/CURRENT_STATUS.md` (gitignored).

## Where the project stands, in one paragraph

DeenVerse's v2 platform is functionally complete through "Phase 3": the social core, spiritual content features, and the full monetized education stack (scholars → payments → courses → quizzes → virtual classrooms) all work, backed by 392 green backend tests. Development paused 2026-03-24 and resumed 2026-07-19 with a recovery-and-audit session that found and committed ~3,050 lines of orphaned security fixes, produced the `docs/audits/` series, and left the project one merge away from a clean baseline — with a queue of known security criticals as the next real work.

## Branch state

- **Active branch**: `hotfix/vercel-build-fix` — pushed to origin, **~15 commits ahead of `main`**: 2 Vercel build fixes (March) + 12 recovered Phase 2.5 security/data-integrity commits + audit/docs commits (July).
- **`main`**: frozen at 2026-03-23 (Phase 3 completion). ⚠️ **`main` still ships pre-hardening code** — the quiz answer leak and ungated classroom sockets are fixed only on the hotfix branch. Do not deploy `main`, and do not base new work on it, until the merge lands.
- **Working tree**: clean apart from junk untracked files (`frontend/build-task082.txt`, `frontend/lint-phase3.txt`, 3× `frontend/vite.config.ts.timestamp-*.mjs`) — safe to delete.
- Dead branches awaiting cleanup: `dev`, `redesign/v2-modern`, `Responsive-Feature`, `UpgradingDownloadOption`, plus a leftover registered worktree and 2 v1-era stashes. Details: [13_Git_History_Summary.md](13_Git_History_Summary.md).

## Quality signals

| Signal | State |
|---|---|
| Backend tests | ✅ 392/392 across 19 suites (~20s, in-memory Mongo replica set) |
| Frontend tests | ❌ none exist |
| `npm run typecheck:web` / `lint:web` | ✅ clean |
| `npm run check:integrity` | 1 known orphan: `POST /user/:param` |
| Dependabot | 🔴 3 critical / 32 high, untriaged (TASK-044) |
| Production deploy | Vercel frontend live; backend host not scripted in repo; local `.env`'s Atlas URI no longer resolves |

## What just happened (the July 2026 recovery)

After a 4-month gap, a full audit discovered that Phase 2.5 (TASK-087→101 — quiz answer-hiding, classroom socket access control, model validators, API contract normalization, PWA cache fixes) had been marked **done** in the Tick tracker on 2026-03-12, but **only the tracker metadata was ever committed** — the ~3,050 lines of actual code sat uncommitted in the working tree for four months. The session reviewed it file-by-file, fixed a real bug found during review (a `.default` import of the named-export-only `Enrollment` model that broke course-only classroom sockets), committed it as 12 scoped commits, verified the full test suite, and pushed. The process lesson — **tracker status ≠ committed code** — is now a standing rule in [04_Development_Guide.md](04_Development_Guide.md).

## Immediate next actions

1. **Merge `hotfix/vercel-build-fix` → `main`** and verify the Vercel production deploy. This unblocks everything else.
2. **Security sprint** — the five Critical findings in [08_Code_Review.md](08_Code_Review.md): CSRF fix, token rotation/denylist, enforce `banned`, mongo-sanitize, Dependabot triage.
3. Then the roadmap proper: [11_Roadmap.md](11_Roadmap.md).

## Open loose ends

Catalogued fully in [14_Unfinished_Work.md](14_Unfinished_Work.md): half-built UIs on finished backends (Daily Learning, Quran Reader, Ruhani Hub, moderation panel, analytics dashboard), the dormant mobile scaffold, 17 stale Tick tasks, the orphan endpoint, and the dead CI staging job.

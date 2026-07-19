# 13 — Git History Summary

> Narrative version of the 2026-07-19 git-history audit ([audits/git-history-audit.md](audits/git-history-audit.md)).

## The story in four acts

**Act 1 — v1 (May 2024 → early 2026).** First commit 2024-05-27: a Create React App hadith-browsing app. Contributors: hasnain-sid (who authored 389 of the 450 total commits, including all AI-agent commits), Hasnain Akhtar, Hasnain, and Uves0786. Branches like `Responsive-Feature`, `UpgradingDownloadOption`, and `Testing_Branch` date from this era; the root `README.md` still describes this app.

**Act 2 — the v2 rebuild (Feb 2026).** A ground-up modernization on the `redesign/v2-modern` branch: Vite + TypeScript + Tailwind frontend, restructured Express backend, the monorepo workspaces, and the multi-agent Tick/contracts workflow. Merged to `main` late February; v1 remnants live on in `frontend/src/_legacy/`.

**Act 3 — the phase sprints (Feb–Mar 2026).** Rapid, agent-assisted delivery: **Phase 1** (scholar roles + Stripe payments) → **Phase 2** (course LMS) → **Phase 2.5** (security/data-integrity fixes) → **Phase 3** (LiveKit virtual classrooms), tracked as TASK-001…101. Phase 3 merged to `main` 2026-03-23/24 (TASK-086), a `hotfix/vercel-build-fix` branch got two deploy fixes, and then development stopped cold on 2026-03-24 — hotfix unmerged, working tree dirty.

**Act 4 — the recovery (Jul 2026).** Resuming after 4 months, an audit found the critical anomaly: **Phase 2.5's code had never been committed.** The tracker marked TASK-087→101 done on 2026-03-12, but only `[tick]` metadata commits exist from that date — the actual ~3,050 insertions across 26 files sat uncommitted in the working tree the whole time, while Phase 3 was committed from a *separate worktree* around it. The recovered code was reviewed file-by-file, split into 12 scoped commits (`3595721…91c02cf`), fixed along the way (a `.default` import of the named-export `Enrollment` model had silently broken course-only classroom sockets), verified against the full 392-test suite, and pushed to `origin/hotfix/vercel-build-fix`, followed by the audit docs and tooling fixes (`974fbb4`, `23b5663`, `4f0d3dc`).

## What was in the recovered Phase 2.5 code

Mostly security and data-integrity work — losing it to a casual `git checkout .` would have silently regressed security:

- `quizService.js` (+146): serializers that strip correct answers from quiz-start payloads; ADMIN_IDS caching; soft-delete.
- `socket/index.js` (+124): `classroom:join-room` enrollment/follower access control.
- `courseService.js` (+126) and controllers: normalized API response contracts.
- Model hardening: min/max validators, enrollment indexes.
- Frontend: `vite:preloadError` reload-once recovery; workbox skipWaiting + never-cache-auth-endpoints regexes.

## Current branch/stash landscape

| Ref | State | Action needed |
|---|---|---|
| `hotfix/vercel-build-fix` (HEAD) | Active, pushed, ~15 ahead of main | **Merge to main** |
| `main` | Phase 3 complete, pre-hardening | Receive the merge; don't deploy until then |
| `dev` | 368 behind, 0 ahead | Delete |
| `redesign/v2-modern` | Merged; upstream deleted; CI staging still keys on it | Delete + fix CI |
| `Responsive-Feature` | v1-era, **unmerged**, abandoned | Delete (nothing worth salvaging identified) |
| `UpgradingDownloadOption` | Merged, upstream gone | Delete |
| `origin/Testing_Branch` | v1-era remote-only | Delete |
| `copilot-worktree-2026-03-23…` | Leftover worktree branch, = main | `git worktree remove` + delete |
| stash@{0}, stash@{1} | v1-era WIP (2025/2026, Responsive-Feature) | Drop |

No tags exist anywhere in the repo. Origin (`github.com/hasnain-sid/DeenVerse`) is the only remote.

## Lessons this history teaches

1. **Tracker status is not evidence.** "Done" in TICK.md has provably meant "code exists only in someone's working tree". Verify with `git log -- <file>`.
2. **Worktrees + dirty main checkout = orphan risk.** Phase 3 was committed from a worktree while Phase 2.5 sat dirty in the main checkout — nobody noticed for four months.
3. **Commit conventions are healthy** otherwise: conventional-commit scopes throughout, `[tick]` prefix reserved for automation.
4. Consider starting to **tag releases** (there are none) so "what's deployed" stops being archaeology.

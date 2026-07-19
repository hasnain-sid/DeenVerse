# 15 — Risk Assessment

> Consolidated risk register as of 2026-07-20. Sources: [08_Code_Review.md](08_Code_Review.md), [10_Project_Status.md](10_Project_Status.md), [13_Git_History_Summary.md](13_Git_History_Summary.md). Ratings are judgment calls scaled to this project (solo maintainer, small-but-real user exposure, production deploy on Vercel).

## Risk matrix

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Deploying `main` before the hotfix merge ships the quiz-answer leak + ungated classroom sockets | High (it's the default branch) | High | Merge `hotfix/vercel-build-fix` now; until then treat `main` as do-not-deploy |
| R2 | CSRF exploitation via cookie auth + urlencoded forms | Medium | High | Sprint 1 step 1 in [12_Improvement_Plan.md](12_Improvement_Plan.md) |
| R3 | Stolen refresh token — 7 days of irrevocable access; ban evasion via existing tokens | Medium | High | Token rotation + Redis denylist; enforce `banned` at auth |
| R4 | Untriaged dependency vulns (3 critical / 32 high, since March) | Unknown — that's the problem | Unknown→High | Run the audit (TASK-044); pin/upgrade; retest |
| R5 | NoSQL-operator injection on unvalidated legacy routes | Medium | Medium–High | express-mongo-sanitize + progressive Zod coverage |
| R6 | Scale cliff: second backend instance silently breaks presence, chat delivery, classrooms, rate limits | Low today, certain at scale | High | Socket.IO Redis adapter + Redis-held state before any horizontal scaling |
| R7 | Social-graph blowup: unbounded embedded follower arrays + unpaginated all-users query | Low today, grows with users | Medium–High | `Follow` collection + pagination before growth |
| R8 | Refactoring the untested legacy surface (auth/users/posts/feed/chat) introduces silent regressions | High (any change there is untested) | Medium | Test backfill first; treat those areas as fragile |
| R9 | Process risk: tracker/board claims diverge from committed code (has already happened once, cost 4 months of latency) | Medium | High | Standing rule: verify "done" against `git log`; DoD = pushed commits |
| R10 | Local-dev fragility: replica-set requirement, formerly-wrong env docs, dead Atlas URI in `.env` | High for newcomers | Low–Medium | [03_Setup_Guide.md](03_Setup_Guide.md) documents all three; keep it current |
| R11 | Deploy confusion: dead S3/CloudFront CI jobs alongside the real Vercel pipeline | Medium | Low–Medium | Delete the dead jobs |
| R12 | Data-integrity drift: no migrations, Mongoose-default schema evolution, validation errors surfacing as 500s | Medium | Medium | migrate-mongo; re-enable error mapping |
| R13 | Single-maintainer bus factor: one human + AI agents, no tags, key context in local gitignored files | Structural | High | This docs/ series is the mitigation — keep it in-repo and current; start tagging releases |
| R14 | Legal/compliance hygiene: no LICENSE despite MIT claim; payments platform with thin account security (6-char passwords, no email verification) | Medium | Medium | Add LICENSE; Sprint 1/3 account hardening |
| R15 | Vercel frontend served with zero security headers; backend CSP allows inline scripts | Medium | Medium | `vercel.json` headers block; tighten CSP |

## The three risks to actually lose sleep over

1. **R1/R2/R3 — the security cluster.** These are live in production *right now*, not hypothetical: an unauthenticated attacker can CSRF authenticated users, stolen sessions cannot be killed, and bans don't bite. They are also the cheapest of the big risks to fix — a focused sprint ([12_Improvement_Plan.md](12_Improvement_Plan.md) Sprint 1).
2. **R9 — the process risk.** It has already materialized once: four months where "done" security fixes existed only in an uncommitted working tree. The cure is cultural, not technical — nothing counts until it's pushed, and audits beat trackers.
3. **R13 — the bus factor.** The project's real state lived in one person's head and a dirty working tree until July 2026. Keeping these docs, `docs/audits/`, and honest tracker state in-repo is what makes the project survivable.

## Explicitly accepted risks (for now)

- **Single-instance architecture (R6)** — accepted until traffic demands scaling; the mitigation path is known.
- **Plain-JS backend without a linter** — accepted; conventions + review carry it.
- **Optional-infra graceful degradation** — Redis/AWS/LiveKit no-op when absent; convenient for dev, but means prod misconfiguration fails *quietly*. Watch logs for the degradation warnings after any deploy.

## Standing safety rules

- Never `git checkout .` / `reset --hard` casually — this working tree has held unique uncommitted security code before.
- Never reorder the Stripe webhook mount in `backend/index.js`.
- Never touch the workbox auth-exclusion regexes in `frontend/vite.config.ts` without understanding the stale-session bug they fixed.
- Restart the backend after changing `ADMIN_IDS` (cached at boot).

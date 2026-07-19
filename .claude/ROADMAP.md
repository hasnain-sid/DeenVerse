# Roadmap (condensed)

Authoritative version: `docs/audits/project-state-and-roadmap.md`. Root `ROADMAP.md` is aspirational — do not trust its phase checkmarks.

## Next Priority (ordered)
1. Merge `hotfix/vercel-build-fix` → `main` + verify Vercel deploy
2. Security sprint — cookie auth only on `/user/refresh` (CSRF), refresh-token rotation + Redis denylist, enforce `banned` at auth, express-mongo-sanitize, npm audit triage (TASK-044)
3. Finish half-built UIs on idle backends: Daily Learning, Quran Reader, Ruhani Hub (13 unconsumed routes), moderation panel, analytics dashboard
4. Email verification (board: high priority, contract needed)
5. Hygiene: retire 17 stale Tick tasks, fix orphan `POST /user/:param`, delete dead CI staging job

## Future
Google OAuth → certificates → interactive Quran teaching → Dawah/Q&A → mobile parity → OpenAPI docs → frontend tests (Vitest/RTL) → Socket.IO Redis adapter → Follow collection.

## Debt paydown order
Test backfill (auth/users/posts/feed) → decompose 71KB pages → admin authz on `role` → env/migrations docs → replace blanket sanitizeInput → README/ROADMAP/LICENSE refresh → repo cleanup.

Feature-by-feature state: [FEATURES.md](FEATURES.md). Risks: [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

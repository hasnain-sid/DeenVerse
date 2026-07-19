# Glossary

## Domain terms
- **Hadith** — sayings/teachings of Prophet Muhammad ﷺ; the original core content unit.
- **Deen** — faith/religion; "DeenVerse" ≈ universe of faith.
- **Ruhani** — "spiritual"; the Ruhani Hub groups Tafakkur/Tazkia/Tadabbur practices.
- **Tafakkur / Tazkia / Tadabbur** — reflection on creation / purification of character traits / contemplation of Quran ayahs (each has seed data in `backend/data/`).
- **Ayah / Surah** — Quran verse / chapter. **Tafsir** — Quran exegesis (fetched per edition from alquran.cloud).
- **Iman Boost** — mood-based ayah/content recommendation feature.
- **Signs** — curated "signs of Allah" content collection (seeded via `seedSigns.js`).
- **Dawah** — Islamic outreach; planned Q&A platform feature.
- **Scholar** — verified teacher role; can create courses/classrooms, receives Stripe Connect payouts.

## Project jargon
- **Tick** — the file-based task tracker (`TICK.md`, `.tick/`); tasks TASK-001…101; auto-commits prefixed `[tick]`. ⚠️ "done" status has historically not implied committed code.
- **copilot / copilot-2 / antigravity** — AI agent identities in the multi-agent workflow (`.agents/`).
- **Contract** — per-feature API agreement in `.agents/contracts/` required before agents start coding.
- **Feature board** — `.agents/feature-board.md`, layer-by-layer (shared/backend/frontend/mobile) status matrix.
- **Phases** — Phase 1 = scholar+payments, Phase 2 = course LMS, Phase 2.5 = security/integrity fixes, Phase 3 = virtual classroom. (Root ROADMAP.md's Phases 1–8 are a different, aspirational numbering.)
- **Shared package** — `@deenverse/shared` (`packages/shared`), Zod schemas + types; must be tsc-built before backend tests/frontend build.
- **Integrity check** — `scripts/check-feature-integrity.js`, static FE↔BE route drift detector.
- **v1 / _legacy** — the pre-2026 CRA app; remnants in `frontend/src/_legacy/` and old branches.
- **Egress** — LiveKit's recording pipeline (room composite → S3); `egressId` tracked on classrooms.

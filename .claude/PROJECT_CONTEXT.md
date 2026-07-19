# Project Context

**DeenVerse** — Islamic social media platform: hadith/Quran content, Twitter-like feed, chat, live streams, plus a monetized education stack (scholar roles → Stripe payments → course LMS → quizzes → LiveKit virtual classrooms). Owner: hasnain-sid (solo human) coordinating AI agents (GitHub Copilot ×2 "copilot"/"copilot-2", "antigravity") via the Tick tracker (`TICK.md`, `.tick/`) and `.agents/` (feature board, contracts, workflows).

**Monorepo** (npm workspaces): `backend/` (Express 4, plain JS ESM), `frontend/` (React 18 + TS + Vite 5), `packages/shared/` (Zod schemas/types, must be built first), `packages/mobile/` (Expo scaffold, dormant).

**Deploys**: Frontend → Vercel (deen-verse-front.vercel.app, `vercel.json`). Backend → Docker-ready, host not scripted in repo. A parallel S3/CloudFront pipeline in `.github/workflows/ci.yml` is dead (staging keyed to a deleted branch).

**Trust warnings**:
- Root `README.md` describes the old v1 app; root `ROADMAP.md` marks phases complete that aren't. Trust `docs/audits/` instead.
- Tick task status has historically claimed "done" for work never committed — verify against `git log` before believing tracker state.

Related: [ARCHITECTURE.md](ARCHITECTURE.md), [CURRENT_STATUS.md](CURRENT_STATUS.md), [GLOSSARY.md](GLOSSARY.md).

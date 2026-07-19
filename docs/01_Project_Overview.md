# 01 — Project Overview

> Part of the DeenVerse onboarding docs (01–15). Written 2026-07-20 for developers who have never seen this project. Start here, then read [02_Architecture.md](02_Architecture.md) and [03_Setup_Guide.md](03_Setup_Guide.md).

## What is DeenVerse?

**DeenVerse** is an Islamic social media and learning platform. The name combines *Deen* (faith/religion) with "verse" — a universe of faith. It started in 2024 as a hadith-browsing app and has grown into a full platform with two big halves:

1. **A social network** — a Twitter-like feed (posts, hashtags, mentions, replies, trending), direct messaging, notifications, live streaming, user profiles with follows, and curated spiritual content (hadith, Quran verses, "Signs", mood-based "Iman Boost" recommendations).
2. **A monetized education stack** — verified **Scholar** accounts who create paid courses (a full LMS with modules, lessons, progress tracking, and quizzes), take payments through Stripe (checkout, subscriptions, Connect payouts with a 30% platform commission), and teach live in **Virtual Classrooms** built on LiveKit (video rooms, hand-raise, a tldraw whiteboard, and recordings).

If domain terms like *hadith*, *ayah*, *tafsir*, *Ruhani*, or *Dawah* are unfamiliar, there is a glossary in the machine-context folder at `.claude/GLOSSARY.md` (local, gitignored) and terms are explained inline in [07_Features.md](07_Features.md) where they matter.

## Who builds it

The project is owned and driven by a single human developer, **hasnain-sid**, who coordinates several AI coding agents (identities: `copilot`, `copilot-2`, `antigravity`) through an in-repo process:

- **Tick** — a file-based task tracker (`TICK.md` + `.tick/`, tasks TASK-001…101, auto-commits prefixed `[tick]`).
- **`.agents/`** — a feature board (`feature-board.md`, feature × layer status matrix), per-feature API **contracts** (`.agents/contracts/`), and workflow documents.

This matters to you for one crucial reason: **the tracker has historically claimed work was "done" that was never committed**. In July 2026 an audit discovered ~3,050 lines of security fixes marked complete in March but sitting uncommitted in the working tree. Treat tracker and roadmap status as untrusted until verified against `git log`. Full story: [13_Git_History_Summary.md](13_Git_History_Summary.md).

## Repository shape

An npm-workspaces monorepo:

| Workspace | What it is |
|---|---|
| `backend/` | Express 4 API, **plain JavaScript** (ESM), Node 20, Mongoose 8, Socket.IO 4 |
| `frontend/` | React 18 + TypeScript 5.6 + Vite 5 SPA, Tailwind 4, shadcn-style UI, PWA |
| `packages/shared/` | `@deenverse/shared` — Zod schemas and TS types shared by backend + frontend; **must be built before anything else** |
| `packages/mobile/` | Expo 52 / React Native scaffold — dormant, no feature screens yet |

Supporting directories: `scripts/` (notably `check-feature-integrity.js`, a frontend↔backend route drift checker), `.agents/` and `.tick/` (multi-agent process), `.github/` (CI), `docs/` (you are here).

## Deployment at a glance

- **Frontend** → Vercel (`deen-verse-front.vercel.app`), configured via root `vercel.json`. The root `npm run build` copies `frontend/dist` → `dist/` for Vercel.
- **Backend** → Docker-ready (`backend/Dockerfile`, node:20-alpine, `/health` healthcheck); the actual host is not scripted in the repo.
- A second S3/CloudFront deploy pipeline exists in `.github/workflows/ci.yml` but is **dead** — its staging job is keyed to a deleted branch. Vercel is the real deploy. See [15_Risk_Assessment.md](15_Risk_Assessment.md).

## Which documents to trust

Some in-repo docs are stale or aspirational. Trust order:

- ✅ **Trust**: this `docs/` series, `docs/audits/` (dated point-in-time audits from 2026-07-19), and the code itself.
- ⚠️ **Distrust**: the root `README.md` (describes the old v1 Create-React-App version), the root `ROADMAP.md` (marks phases complete that were never built), and Tick task statuses (see above).
- 📖 **Historical context**: `PHASE-1/2/2.5/3-PLAYBOOK.md` at the root document how each development phase was planned and executed — useful archaeology, not current state.

## Reading guide for this series

| Read… | To learn… |
|---|---|
| [02_Architecture.md](02_Architecture.md) | How the system fits together |
| [03_Setup_Guide.md](03_Setup_Guide.md) | Getting it running locally |
| [04_Development_Guide.md](04_Development_Guide.md) | Conventions, testing, day-to-day workflow |
| [05_API_Documentation.md](05_API_Documentation.md) / [06_Database.md](06_Database.md) | The API surface and data model |
| [07_Features.md](07_Features.md) | What exists, what's half-built, what's broken |
| [08_Code_Review.md](08_Code_Review.md) / [09_Technical_Debt.md](09_Technical_Debt.md) | Known defects and debt |
| [10_Project_Status.md](10_Project_Status.md) – [12_Improvement_Plan.md](12_Improvement_Plan.md) | Where the project stands and where it's going |
| [13_Git_History_Summary.md](13_Git_History_Summary.md) – [15_Risk_Assessment.md](15_Risk_Assessment.md) | History, loose ends, and risks |

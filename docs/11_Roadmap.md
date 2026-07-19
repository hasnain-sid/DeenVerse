# 11 — Roadmap

> The forward-looking plan, synthesized from the 2026-07-19 state reconstruction ([audits/project-state-and-roadmap.md](audits/project-state-and-roadmap.md)). **This supersedes the root `ROADMAP.md`**, whose phase checkmarks are aspirational (it claims Phases 4–8 complete; they were never started). For the step-by-step execution version of the near-term items, see [12_Improvement_Plan.md](12_Improvement_Plan.md).

## Where we are

**Done**: the v2 platform — Vite/TS/Tailwind frontend, hardened Express API, social core (feed/chat/notifications/streams), spiritual content (hadith, Quran topics, Ruhani backend, Iman Boost, Signs), and the monetized education stack (scholar roles → Stripe payments → course LMS → quizzes → LiveKit virtual classrooms), including the recovered Phase 2.5 hardening (committed & pushed 2026-07-19).

**In progress when work paused**:
- Branch consolidation — `hotfix/vercel-build-fix` awaiting merge to `main`.
- Daily Learning and Quran Reader frontend completion (board: high priority).
- Mobile app — scaffold exists, awaiting a contract and first screens.

## Next priorities (ordered)

1. **Merge `hotfix/vercel-build-fix` → `main`** and verify the Vercel production deploy. Everything queues behind this: until it lands, `main` ships known-vulnerable quiz/classroom code.
2. **Security sprint** — the Critical findings from [08_Code_Review.md](08_Code_Review.md): restrict cookie auth to `/user/refresh` (CSRF), refresh-token rotation + Redis denylist, enforce `banned` at auth, add `express-mongo-sanitize`, and triage the 3 critical / 32 high Dependabot vulns (TASK-044).
3. **Finish the half-built UIs on idle backends** — the cheapest feature wins available: Daily Learning, Quran Reader, Ruhani Hub (13 unconsumed routes), then the moderation panel and analytics dashboard (whose backends are finished inventory).
4. **Email verification** — the highest-priority genuinely-missing feature per the feature board; needs a `.agents/contracts/` contract first.
5. **Tracker & pipeline hygiene** — retire the 17 stale Tick tasks, remove the orphan `POST /user/:param`, delete or repoint the dead CI staging deploy.

## Future improvements (beyond the current horizon)

**Features**
- Google OAuth, then Apple/GitHub sign-in.
- Certification system — generate certificates on course completion (the `certificateOnCompletion` flag already exists).
- Interactive Quran Teaching — Phase 4 concept layered on the virtual classroom.
- Dawah & Q&A platform — Phase 6 concept.
- Mobile build-out — auth → feed → courses parity on the Expo scaffold.

**Engineering**
- OpenAPI documentation; Vitest + React Testing Library frontend tests; Playwright smoke E2E.
- Socket.IO Redis adapter + presence in Redis — the prerequisite for running more than one backend instance.
- `Follow` collection + paginated user queries — the social-graph scale prerequisite.
- Security headers via `vercel.json`; drop `'unsafe-inline'` from the backend CSP.

## Technical-debt paydown (interleave with the above)

In order: test backfill for the untested legacy surface → decompose the 71KB pages → consolidate admin authz on `role` → env/migration tooling → replace blanket `sanitizeInput` → README/ROADMAP/LICENSE refresh → repo cleanup. Rationale for the ordering: [09_Technical_Debt.md](09_Technical_Debt.md).

## Standing risks to keep in view

Summarized in [15_Risk_Assessment.md](15_Risk_Assessment.md) — chiefly: deploying `main` pre-merge, the live CSRF/token-revocation exposure until the security sprint lands, the untriaged dependency vulns, the single-instance scale cliff, and the demonstrated process risk that tracker status can diverge from committed code.

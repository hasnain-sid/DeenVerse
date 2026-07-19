# Conventions

## Backend (plain JS, ESM, Node 20)
- Layer flow `routes → controller → services → models`; controllers thin (parse/validate → service → `res.json({...result, success: true})`), services throw `AppError(message, statusCode)`.
- JSDoc on exported functions; section dividers `// ── Name ──…`.
- Model files: `<name>Schema.js` exporting **named** `export const X = mongoose.model(...)` (no default exports — a `.default` import bug bit us once).
- New endpoints: validate with shared Zod schemas (`safeParse` → `next(new AppError(msg, 400))`), rate-limit sensitive routes via `middlewares/rateLimiter.js` factories.
- Logging: Winston `logger` from `config/logger.js`, not console.log. Graceful degradation for optional infra (Redis/AWS/LiveKit): check configured, warn, no-op.

## Frontend (TS strict, React 18)
- Feature folders `src/features/<feature>/`; pages are **named exports**, lazy-loaded in `App.tsx`.
- UI: shadcn-style primitives in `components/ui/` (CVA + tailwind-merge `cn()`), Lucide icons only, Tailwind 4 tokens from `globals.css` (Notion-minimal, teal accent #2D7D6F), Framer Motion for animation.
- State: server state → TanStack Query hooks (`useX.ts` per feature); global client state → Zustand stores; forms → RHF + Zod resolver.
- API calls through `lib/api.ts` axios instance only (never raw fetch) — it handles auth/refresh.
- Path alias `@/`; Prettier + ESLint enforced (`npm run lint:strict` for zero warnings).

## Git
- Conventional commits with scope: `feat(courses):`, `fix(classroom):`, `docs(audits):`, `chore(deps):`, `test(phase3):`; `[tick]` prefix reserved for tracker auto-commits.
- Branches: `hotfix/*`, `feature-*` history; main is protected by convention (agents work in worktrees/branches).
- Commit messages: imperative summary + wrapped body explaining why; Claude sessions append `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## Multi-agent workflow
New features require a contract in `.agents/contracts/` first; update `.agents/feature-board.md` on layer completion; workflows in `.agents/workflows/` (new-feature, code-review, fix-and-verify…). Run `npm run check:integrity` after adding/removing routes.

---
description: "Use when reviewing code, auditing a PR, checking changed files before committing, or when the user asks to review, audit, or check code quality."
---

# Code Review

Act as a senior DeenVerse engineer doing a pull-request review. Be direct — flag real issues, skip noise.

---

## Step 1 — Identify Scope

- **Files specified**: review exactly those files.
- **No files specified**: run `git diff --staged` (or `git diff HEAD~1`) to find recently changed files, then review those.

---

## Step 2 — Review Checklist

Work through each changed file against all categories below.

### Correctness & Bugs
- [ ] Logic is correct; no off-by-one or branching mistakes
- [ ] Null / undefined paths are handled
- [ ] `async`/`await` used correctly; no fire-and-forget promises
- [ ] Error boundaries or `try/catch` present where the call can fail

### Security (OWASP Top 10)
- [ ] No hardcoded secrets, tokens, or credentials
- [ ] All user input validated with Zod (shared schemas) or express-validator
- [ ] `isAuthenticated` middleware attached to every protected route
- [ ] No PII or sensitive data written to logs
- [ ] Frontend renders user content through `dompurify` — no raw `dangerouslySetInnerHTML`
- [ ] Backend responses never leak internal stack traces to the client
- [ ] No new CORS origins, CSP relaxations, or `unsafe-inline` additions

### DeenVerse Architecture Compliance
- [ ] New backend code follows `routes/ → controller/ → service/ → model/`; no business logic in routes or controllers
- [ ] Backend uses ESM (`import`/`export`); no `require`/`module.exports`
- [ ] Errors thrown as `new AppError(message, statusCode)` — not raw `new Error()`
- [ ] Frontend API calls go through `src/lib/api.ts` (Axios instance with 401 interceptor)
- [ ] Server state fetched with TanStack Query; no raw `useEffect` + `fetch`
- [ ] Global state in Zustand stores (`src/stores/`); local state stays local
- [ ] `accessToken` is **never** stored in `localStorage`, cookies, or Zustand `persist`
- [ ] No imports from `src/_legacy/` — legacy code is read-only
- [ ] Icons from `lucide-react` only; no `react-icons`
- [ ] Toasts via `react-hot-toast`; no `alert()` / `confirm()`

### TypeScript (frontend)
- [ ] No untyped `any` without a comment explaining why
- [ ] Prop types defined inline or in a local `types.ts` — no implicit `any` from missing types
- [ ] `noUnusedLocals` / `noUnusedParameters` would pass (no dead variables)

### Performance
- [ ] No unnecessary `useEffect` re-runs (check dependency arrays)
- [ ] `useMemo` / `useCallback` only where genuinely expensive — not cargo-culted
- [ ] No N+1 MongoDB queries (use `populate`, aggregation, or `Promise.all`)
- [ ] New npm dependencies are necessary, not redundant with existing ones
- [ ] Frontend chunks inside the 250 KB limit; large new libs have a manual chunk in `vite.config.ts`

### Code Quality
- [ ] No duplicated logic — reuses existing utilities / shared components
- [ ] Components are focused; no 300-line God components
- [ ] Functions do one thing; names describe that one thing
- [ ] No dead code, commented-out blocks, or `console.log` left in

### Multi-Agent Coordination
- [ ] Feature board (`.agents/feature-board.md`) is up to date for this feature
- [ ] If new API calls: corresponding backend routes exist (run `npm run check:integrity`)
- [ ] If multi-layer feature: contract exists in `.agents/contracts/` and matches implementation
- [ ] Handover notes left if completing a layer that other agents depend on
- [ ] No files modified that another agent has claimed (🔵 In Progress)

### Readability
- [ ] Non-obvious logic has a comment explaining **why**, not what
- [ ] Naming is clear and consistent with the surrounding file

---

## Step 3 — Report Findings

Present all findings grouped by severity:

| Symbol | Meaning |
|--------|---------|
| 🔴 **Critical** | Must fix before merge — bugs, security holes, broken auth |
| 🟡 **Warning** | Should fix — wrong pattern, performance risk, code smell |
| 🟢 **Suggestion** | Nice-to-have — style, minor clarity improvement |
| ✅ **LGTM** | Nothing found, file is clean |

For each finding include:
- File path + line number (linked)
- What the problem is
- Why it matters
- A concrete fix or code snippet

---

## Step 4 — Offer to Fix

After presenting findings, ask:
> "Should I fix any of these? List the items you'd like auto-fixed."

Apply only the approved fixes. Do not refactor unrelated code while fixing.

---
description: "debug, fix bug, runtime error, build error, type error, crash, broken, not working"
---

# Debugging Instructions

When the user reports a **bug**, **error**, or something **not working**, follow this structured workflow.

## Workflow: Reproduce → Diagnose → Minimal Fix

### Step 1: Reproduce

- Read the error message / stack trace carefully.
- Identify the exact file(s) and line(s) involved.
- Determine whether the issue is a **build error**, **runtime error**, **type error**, or **logic bug**.

### Step 2: Diagnose

Search for the root cause — don't just fix the symptom. Check:

| Area | What to check |
|---|---|
| **Imports** | Wrong path, missing `.js` extension in backend ESM, circular imports |
| **Auth** | Token not sent, 401 interceptor loop, refresh token cookie not set |
| **Types** | `any` masking real errors, missing interface fields, Zod schema mismatch |
| **State** | Zustand store not updating, stale TanStack Query cache, missing `invalidateQueries` |
| **API** | Wrong HTTP method, missing `/api/v1/` prefix, Vite proxy not matching |
| **Backend** | `AppError` not used (raw Error), missing `next(error)`, async without try/catch |
| **Build** | Chunk size > 250 KB, missing env var, wrong `import.meta.env` prefix |

### Step 3: Fix (Minimal & Safe)

- Make the **smallest change** that fixes the root cause.
- Do NOT refactor unrelated code while fixing a bug.
- If the fix touches auth flow, verify the full cycle: login → access → refresh → retry.
- If the fix touches a backend endpoint, verify the full chain: route → controller → service.

## DeenVerse-Specific Issue Map

| Symptom | Likely Cause |
|---|---|
| "No workspaces found" on Vercel | Project root is set to `frontend/` instead of repo root |
| 401 loop / infinite refresh | Interceptor not queuing concurrent requests, or refresh endpoint failing |
| `require is not defined` | Backend file using CJS in an ESM project — use `import`/`export` |
| Component not rendering | Missing lazy import `.then(m => ({ default: m.ComponentName }))` |
| `Cannot read properties of undefined` on user | `authStore` not restored yet — check `useSession` / `SessionRestorer` |
| shadcn component missing | Not installed via CLI — run `npx shadcn@latest add <component>` |
| CSP violation | Check `security.js` — don't widen `unsafe-inline`, check CDN_BASE_URL |
| Hydration mismatch | Server/client time mismatch or conditional rendering based on `window` |

## After the Fix

- Verify the fix resolves the original error.
- Check for TypeScript errors (`tsc`) and lint warnings.
- Explain the root cause and what was changed in 2–3 sentences.

## Do NOT

- Add `// @ts-ignore` unless absolutely necessary (and add a comment explaining why).
- Suppress errors with empty catch blocks.
- Introduce new dependencies to fix a bug.
- Modify `src/_legacy/` code.

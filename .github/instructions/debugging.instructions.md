---
description: "Use when debugging errors, fixing bugs, troubleshooting build failures, runtime errors, type errors, or investigating unexpected behavior."
---

# Debugging Workflow

When asked to debug or fix an issue, follow this systematic approach:

## 1. Reproduce & Understand

- **Read the error message** carefully — extract the file, line number, and error type.
- **Check terminal output** for stack traces, build errors, or runtime logs.
- **Read the relevant file** before making changes — understand the context around the error.

## 2. Diagnose

- **Type errors**: Check the interface/type definition, then the usage site. Often a missing optional `?` or wrong import.
- **Runtime errors**: Trace the data flow — what's the input, what does the function expect, where does it diverge?
- **Build errors**: Check imports, missing dependencies (`package.json`), or TypeScript config.
- **API errors**: Check the request format in the frontend hook, then the route → controller → service chain in backend.
- **"Cannot find module"**: Check path aliases (`@/` → `src/`), file extensions, and export names.

## 3. Fix

- **Minimal fix**: Change the fewest lines possible. Don't refactor surrounding code unless it's the cause.
- **One fix at a time**: Don't fix multiple unrelated issues in one pass — it makes it hard to verify.
- **Verify**: After fixing, check for remaining errors in the file and related files.

## 4. Common DeenVerse-Specific Issues

| Symptom | Likely Cause |
|---|---|
| 401 on all requests | Access token expired and refresh failed — check `authStore` and `api.ts` interceptor |
| "No workspaces found" on Vercel | Project root set to `frontend/` instead of repo root |
| CORS errors in dev | Backend not running on port 8081, or Vite proxy misconfigured |
| `module.exports is not defined` | Backend file using CJS syntax — must use `import`/`export` |
| Component renders but looks wrong | Check Tailwind class order, `cn()` usage, and `globals.css` token values |
| Socket events not received | Check `useSocket()` hook in `App.tsx` and `backend/socket/index.js` event names |

## 5. Don't

- Don't add `try/catch` everywhere as a fix — find the root cause
- Don't suppress TypeScript errors with `@ts-ignore` — fix the type
- Don't modify `src/_legacy/` code
- Don't modify `src/components/ui/` files (shadcn — regenerate instead)

---
mode: agent
description: "Debug and resolve a bug using minimal safe changes"
---

# /fix

Debug and fix the reported issue using **minimal, safe changes**.

## Your task

Fix the following bug:

**Bug:** {{ input }}

## Steps

### 1. Reproduce

- Parse the error message / stack trace.
- Identify the exact file(s) and line(s).
- Classify: build error, runtime error, type error, or logic bug.

### 2. Diagnose

- Search the codebase for the root cause — not just the symptom.
- Check the DeenVerse-specific issue map:
  - Auth: token flow, interceptor, refresh cycle.
  - Imports: ESM `.js` extensions, `@/` aliases, circular deps.
  - State: Zustand persistence, TanStack Query cache staleness.
  - API: route prefix, proxy config, middleware order.
  - Build: chunk size, env vars, Vite config.

### 3. Fix

- Apply the **smallest change** that resolves the root cause.
- Do NOT refactor unrelated code.
- Do NOT introduce new dependencies.

### 4. Verify

- Check for TypeScript errors and lint warnings.
- Confirm the fix resolves the original issue.

## Constraints

- Follow all rules in `.github/instructions/debugging.instructions.md`.
- Do not modify `src/_legacy/`.
- Do not use `// @ts-ignore` unless absolutely necessary (with comment).
- Do not suppress errors with empty catch blocks.

## Output

After fixing, provide:
- **Root cause**: 1–2 sentences explaining what went wrong.
- **Fix applied**: what was changed and why.
- **Files modified**: list of files touched.

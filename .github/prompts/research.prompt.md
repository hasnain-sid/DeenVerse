---
mode: agent
description: "Deep research brief with options, trade-offs, and recommended implementation plan"
---

# /research

Perform **deep research** before any implementation.

## Your task

Research the following topic/problem thoroughly:

**Topic:** {{ input }}

## Steps

1. **Restate the goal** in one sentence.
2. **Search 3 sources** in parallel:
   - **Local codebase**: existing patterns, related features, available utilities, constraints.
   - **Internet / docs**: official documentation, blog posts, benchmarks, best practices.
   - **GitHub / npm**: popular libraries, community solutions, maintenance status, bundle size.
3. **Present 2–4 options** in a comparison table with: Pros, Cons, Effort, and Fit for DeenVerse.
4. **Write a Recommendation Brief** (3–5 sentences): which option to pick, key trade-offs, estimated scope.
5. **Ask before implementing**: present the recommendation and wait for user confirmation.

## Constraints

- Follow all rules in `.github/instructions/research.instructions.md`.
- Prefer solutions that align with the existing tech stack (Vite, React 18, TypeScript, Tailwind 4, shadcn/ui, Zustand, TanStack Query, Express 5 ESM, MongoDB).
- Flag new dependencies with bundle size impact.
- Flag unmaintained libraries (no commits 12+ months).

## Output format

```
## Goal
<one sentence>

## Options
| Option | Pros | Cons | Effort | Fits DeenVerse? |
|--------|------|------|--------|-----------------|
| ...    | ...  | ...  | ...    | ...             |

## Recommendation
<3–5 sentences>

## Next Step
Ready to implement Option X? Or explore another direction?
```

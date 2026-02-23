---
mode: agent
description: "Explain code flow, architecture, and gotchas for a feature or file"
---

# /explain

Explain the requested code, feature, or architectural pattern.

## Your task

Explain the following:

**Subject:** {{ input }}

## Steps

1. **Identify the scope**: Is this about a specific file, a feature flow, an architectural pattern, or a cross-cutting concern?
2. **Trace the flow**: Follow the code path end-to-end.
   - For frontend features: Route → Page component → Hooks → API calls → State updates → UI rendering.
   - For backend endpoints: Route → Middleware → Controller → Service → Model → Response.
   - For auth: Login → Token issuance → Storage → Interceptor → Refresh → Retry.
3. **Call out key patterns**: Highlight DeenVerse-specific conventions being used (lazy loading, named exports, `AppError`, Zustand stores, TanStack Query keys, etc.).
4. **Note gotchas**: Mention non-obvious behaviors, edge cases, or known issues from the pitfalls section of `copilot-instructions.md`.
5. **Provide a summary**: End with a 3–5 sentence overview suitable for someone new to the codebase.

## Output format

```
## Flow
<step-by-step trace through the code>

## Key Patterns
<DeenVerse conventions used>

## Gotchas
<non-obvious things to watch out for>

## Summary
<3–5 sentence overview>
```

## Constraints

- Read actual code — do not guess or assume patterns that aren't there.
- Reference specific files and line numbers.
- Keep explanations clear and concise — avoid unnecessary jargon.
- If the subject spans frontend and backend, cover both sides.

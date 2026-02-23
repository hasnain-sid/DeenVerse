---
description: "research first, deep search, compare options, internet references, github references, evaluate libraries, trade-offs"
---

# Research Instructions

When the user asks to **research first**, **compare options**, or **deep search** before implementing, follow this workflow. Do NOT write implementation code until research is complete and the user approves.

## Research Workflow

### 1. Understand the Problem

- Restate the user's goal in one sentence.
- List 2–4 key questions that the research must answer.

### 2. Search (3 sources, in parallel when possible)

| Source | What to look for |
|---|---|
| **Local codebase** | Existing patterns, related features, utilities already available, constraints from `copilot-instructions.md` |
| **Internet / docs** | Official documentation, blog posts, benchmarks, best practices |
| **GitHub / npm** | Popular libraries, community solutions, issue threads, stars/maintenance status |

### 3. Compile Options

Present **2–4 concrete options** in a comparison table:

```
| Option | Pros | Cons | Effort | Fits DeenVerse? |
|--------|------|------|--------|-----------------|
| A      | ...  | ...  | Low    | Yes / Partial   |
| B      | ...  | ...  | Medium | Yes             |
```

### 4. Recommendation Brief

Provide a short recommendation (3–5 sentences) covering:
- Which option you recommend and why.
- Key trade-offs the user should be aware of.
- Estimated scope (files touched, new dependencies).

### 5. Wait for User Confirmation

**Do not start coding until the user says to proceed.** Present:

> **Recommended: Option X**
> Ready to implement? Or would you like me to explore another direction?

## Rules

- Always check the local codebase first — the answer may already exist.
- Prefer solutions that align with the existing tech stack (see `copilot-instructions.md`).
- Flag any new dependencies and their bundle size impact (250 KB chunk limit).
- If a library is unmaintained (no commits in 12+ months, many open issues), note it as a risk.
- Keep the research brief concise — aim for clarity over length.

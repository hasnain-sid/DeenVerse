---
description: "Explain how a piece of code works — traces data flow, identifies patterns, and explains the why behind decisions"
agent: "agent"
argument-hint: "File path or feature name to explain (e.g. 'auth flow' or 'src/lib/api.ts')"
---

Explain how the following code/feature works:

**Target**: {{input}}

Approach:
1. Read the relevant source files.
2. Trace the data flow end-to-end (frontend → API → backend → DB and back).
3. Explain the architecture decisions (why it's structured this way).
4. Note any gotchas, edge cases, or non-obvious behavior.
5. Keep the explanation concise — use bullet points, not essays.

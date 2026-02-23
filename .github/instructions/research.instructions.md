---
description: "Use when planning a new feature, evaluating technical options, comparing libraries, or when the user asks for research before implementation. Performs deep web and GitHub research first, then proposes implementation choices."
---

# Feature Research Workflow

## Mandatory Clarification Rule

For any request that creates or integrates a new feature:
- If the user did not explicitly mention research or skipping research, ask first:
	`Do you want deep research first, or should I implement directly?`
- Only proceed after user confirmation.

Before implementing a new feature, perform deep research first.

## 1. Research First, Then Build

Do not jump into code immediately for new feature requests.

Always perform:
1. **Web research** for best practices, patterns, UX ideas, and implementation trade-offs.
2. **GitHub research** for high-quality, production-grade code examples from relevant repositories.
3. **Local codebase research** to align with existing architecture and avoid conflicts.

## 2. Research Quality Bar (Deep Search)

A good research pass includes:
- Multiple credible sources (not a single blog post)
- At least one official doc source when libraries/frameworks are involved
- At least 2-3 concrete implementation patterns with pros/cons
- Security/performance/accessibility notes where relevant
- Compatibility check with DeenVerse stack (React + Vite + TS frontend, Node/Express backend)

## 3. Output Format Before Coding

Present a concise research brief before implementation:

1. **Recommended option** (best for current project constraints)
2. **Alternative options** (2-3) with trade-offs
3. **Why this fits DeenVerse** (routing, state, design system, auth, backend pattern)
4. **Implementation plan** (files to create/edit, API/data flow, risks)

If the user asks to proceed directly, then implement the recommended option.

## 4. Source Prioritization

Prioritize sources in this order:
1. Official docs
2. Mature OSS repos with clear activity and quality
3. High-quality engineering write-ups
4. Community discussions (supporting only, not primary evidence)

## 5. Scope Control

- Keep research proportional to task size.
- For small UI tweaks: lightweight research.
- For new modules/features/integrations: deep research required.

## 6. DeenVerse Alignment Checks

Before final recommendation, verify:
- Frontend follows feature-based structure and TanStack Query usage
- No backend changes for prototype-only requests
- Styling uses Tailwind + shadcn/ui + Lucide conventions
- Auth and API patterns match existing app behavior

## 7. When User Mentions "Research First"

Treat "research first", "deep search", "check internet", or "find GitHub references" as mandatory research mode and provide findings before coding.

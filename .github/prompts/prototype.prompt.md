---
mode: agent
description: "Generate frontend prototype variants with a toggleable viewer and temporary route"
---

# /prototype

Generate **3–5 frontend prototype variants** for the requested feature.

## Your task

Given the user's feature description and requirements below:

**Feature:** {{ input }}

## Steps

1. **Create 3–5 distinct visual/UX variants** as self-contained `.tsx` files in `frontend/src/prototypes/<feature-name>/`.
2. **Create a `PrototypesViewer.tsx`** in the same folder that lets the user toggle between variants with tabs.
3. **Register a temporary route** in `App.tsx` at `/prototypes/<feature-name>`.
4. Use **mock data only** — no API calls.
5. Each variant must use the DeenVerse design system: Tailwind CSS 4, shadcn/ui, `cn()`, lucide-react icons, Framer Motion.
6. Each variant should explore a **meaningfully different** layout, density, or interaction pattern.
7. Add brief inline comments explaining the design rationale.

## Constraints

- Follow all rules in `.github/instructions/prototyping.instructions.md`.
- Named exports for all components.
- Mobile-first, responsive.
- No modifications to existing feature code.

## Output

After generating the prototypes, summarize:
- What each variant explores (1 sentence per variant).
- How to view them: `npm run dev:web` → navigate to `/prototypes/<feature-name>`.

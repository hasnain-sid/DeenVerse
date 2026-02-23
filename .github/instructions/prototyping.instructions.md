---
description: "prototype, mockup, design exploration, UI concept, visual exploration"
---

# Prototyping Instructions

When the user asks for a **prototype**, **mockup**, or **design exploration**, follow these rules.

## Workflow

1. **Generate 3–5 distinct variants** of the requested UI/feature.
2. Place all prototype files in `frontend/src/prototypes/<feature-name>/`.
3. Each variant is a self-contained `.tsx` file: `Variant1.tsx`, `Variant2.tsx`, etc.
4. Create a `PrototypesViewer.tsx` inside the same folder that:
   - Imports all variants.
   - Renders a tab bar / toggle at the top to switch between them.
   - Shows the variant name and a one-line description.
5. Register a **temporary route** in `App.tsx`:
   ```tsx
   const PrototypesViewer = lazy(() =>
     import('@/prototypes/<feature-name>/PrototypesViewer').then(m => ({ default: m.PrototypesViewer }))
   );
   // Inside <Routes>:
   <Route path="/prototypes/<feature-name>" element={<PrototypesViewer />} />
   ```
6. Every variant must be **frontend-only** — use hard-coded mock data, no API calls.
7. Use the project's design system: Tailwind CSS 4, shadcn/ui primitives, `cn()`, lucide-react icons, Framer Motion for transitions.

## Variant Guidelines

- Each variant should explore a meaningfully **different layout, information density, or interaction pattern** — not just color changes.
- Include responsive considerations (mobile-first).
- Add brief inline comments explaining the design rationale for each variant.

## After User Picks a Variant

- Extract the chosen variant into the proper `frontend/src/features/<feature>/` folder.
- Remove the `prototypes/` folder and the temporary route.
- Wire up real API calls via TanStack Query hooks.

## Do NOT

- Commit prototypes to `main` — they are for local exploration only.
- Call any backend API from prototype components.
- Modify existing feature code during prototyping.

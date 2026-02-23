---
description: "Use when creating UI prototypes, design explorations, design comparisons, mockups, or when the user says 'prototype'. Covers the standard workflow for building throwaway design variants that can be reviewed in-browser."
---

# Prototyping Workflow

When asked to prototype a UI feature, follow this workflow exactly.

## 1. Location

Prototypes are **colocated with the feature** they belong to:

```
frontend/src/features/<feature>/prototypes/
├── Prototype1.tsx
├── Prototype2.tsx
├── ...
└── PrototypesViewer.tsx   # Toggleable viewer for all variants
```

If the feature folder doesn't exist yet, create it (e.g. `features/quran/prototypes/`).

## 2. What to Build

| Rule | Detail |
|---|---|
| **Quantity** | Create **3–5 distinct design variants** unless the user specifies a number. Each should explore a meaningfully different layout, interaction pattern, or visual direction — not minor tweaks. |
| **Self-contained** | Each `PrototypeN.tsx` is a single file with no external dependencies beyond the project's existing stack (shadcn/ui, Tailwind, Lucide, Framer Motion). |
| **Realistic mock data** | Use domain-accurate placeholder content (real Quran verses, real hadith text, realistic usernames). Never use "Lorem ipsum" or "Test User". Define mock data as constants at the top of each file. |
| **Interactive** | Prototypes must be functional — dropdowns work, tabs switch, accordions expand. Use local `useState` for all interactivity. |
| **Design system** | Use the existing Tailwind tokens, `cn()` helper, and shadcn/ui primitives so prototypes feel production-close. This makes the chosen design faster to promote. |
| **Frontend only** | Never create or modify backend code for prototypes. Hardcode all data. If an API shape is needed for context, define a TypeScript interface and mock objects inline. |

## 3. Viewer & Route

Always create a `PrototypesViewer.tsx` that:
- Renders a **top toolbar** with numbered buttons (Prototype 1, 2, 3…) to switch between variants.
- Shows the **name and a one-line description** of the active variant.
- Renders the active prototype below the toolbar.

Register a **temporary route** in `App.tsx`:

```ts
const FeaturePrototypes = lazy(() =>
  import('@/features/<feature>/prototypes/PrototypesViewer').then(m => ({ default: m.default }))
);
// Inside <Routes>:
<Route path="/prototypes/<feature>" element={<FeaturePrototypes />} />
```

Also add a quick-access card/link in the relevant hub page (e.g. LearnQuranHub) marked as "Prototype".

## 4. After User Chooses

When the user selects a prototype:
1. Promote the chosen variant out of `prototypes/` into the feature root, renaming it to the real component name.
2. Remove the `prototypes/` folder entirely.
3. Remove the temporary route from `App.tsx`.
4. Remove the quick-access link from any hub page.

## 5. Naming Conventions

- Prototype files: `Prototype1.tsx`, `Prototype2.tsx`, etc.
- Viewer: `PrototypesViewer.tsx`
- Route path: `/prototypes/<feature-name>` (kebab-case)

## 6. What Makes a Good Prototype Set

Vary these dimensions across the variants:
- **Layout**: single column vs split-pane vs card grid vs full-screen immersive
- **Information density**: minimal/focused vs detailed/comprehensive
- **Interaction model**: tabs vs accordion vs scroll vs modal vs inline expand
- **Visual tone**: light/airy vs dark/immersive vs traditional/book-like vs modern/minimal
- **Progressive disclosure**: everything visible vs reveal-on-demand

Do NOT create variants that differ only in color or font size — each must be a distinct *design direction*.

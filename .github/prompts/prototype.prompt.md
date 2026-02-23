---
description: "Create UI design prototypes for a feature — generates multiple toggleable variants viewable in-browser"
agent: "agent"
argument-hint: "Feature name and requirements (e.g. 'quran reader with tafseer panel and font options')"
---

Create UI prototypes following the prototyping workflow defined in [prototyping instructions](../instructions/prototyping.instructions.md).

**Feature to prototype**: {{input}}

Steps:
1. Understand the feature requirements from the user's description.
2. Research the existing codebase for related components, design patterns, and design tokens to stay consistent.
3. Create 3–5 distinct design variants in `frontend/src/features/<feature>/prototypes/`.
4. Create a `PrototypesViewer.tsx` with a toggleable toolbar.
5. Register a temporary route in `App.tsx` and add a quick-access link in the relevant hub page.
6. Briefly describe each variant so the user can compare.

---
description: "Use when refactoring code, restructuring files, splitting components, extracting hooks, improving code organization, or cleaning up technical debt."
---

# Refactoring Guidelines

## Principles

1. **Behavior preservation**: Refactoring must not change observable behavior. If behavior changes, that's a feature or bug fix — not a refactor.
2. **One thing at a time**: Rename OR extract OR restructure — never all three at once.
3. **Verify after each step**: Check for TypeScript errors and broken imports after each change.

## Common Refactors in This Codebase

### Extract a component
When a JSX block inside a page/component exceeds ~80 lines or is reused:
1. Create a new file in the feature's `components/` folder.
2. Move the JSX and its local state/handlers into the new component.
3. Define a typed `Props` interface for data passed from the parent.
4. Import and use the new component in the original file.

### Extract a custom hook
When a component has complex state logic, multiple `useEffect`s, or API calls mixed with UI:
1. Create `use<Name>.ts` in the feature folder.
2. Move the state, effects, and API logic into the hook.
3. Return only what the component needs `{ data, isLoading, handlers }`.

### Move to shared
When a component or utility is used by **2+ features**:
1. Move from `features/<feature>/` to `components/` (UI) or `lib/` (utils).
2. Update all import paths.
3. Never move preemptively — wait until actual reuse happens.

## Rules

- **Don't refactor code you weren't asked to touch** — scope creep is the #1 refactoring failure mode.
- **Don't modify `_legacy/`** — it's archived and read-only.
- **Don't modify `components/ui/`** — these are shadcn CLI-generated.
- **Update imports**: After moving files, update all import paths across the codebase.
- **Keep git history clean**: Each refactor should be a logical, self-contained change.

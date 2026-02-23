---
applyTo: "frontend/src/**/*.tsx"
---

# React Component Standards

These rules apply automatically when editing any `.tsx` file in the frontend.

## Exports

- **Named exports only** for components: `export function MyComponent() { ... }`
- Do NOT use `export default` — the lazy-load pattern in `App.tsx` destructures named exports.

## Props

- Define a dedicated `interface` for props: `interface MyComponentProps { ... }`
- Destructure props in the function signature: `export function MyComponent({ title, onClose }: MyComponentProps) { ... }`
- Use `children?: React.ReactNode` when the component accepts children.

## Styling

- Use **Tailwind CSS 4** utility classes for all styling.
- Use the `cn()` helper from `@/lib/utils` for conditional/merged classes:
  ```tsx
  import { cn } from '@/lib/utils';
  <div className={cn('base-classes', isActive && 'active-classes')} />
  ```
- Design tokens (colors, spacing, radii) are defined in `src/globals.css` — prefer token-based classes (e.g., `bg-primary`, `text-muted-foreground`) over raw values.

## Icons

- **Lucide React only**: `import { IconName } from 'lucide-react';`
- Do NOT import from `react-icons` or any other icon library.

## Animations

- Use **Framer Motion** for transitions and animations.
- Prefer `motion.div` with `initial`/`animate`/`exit` props.

## Accessibility

- Interactive elements must have accessible names (`aria-label`, visible text, or `sr-only` label).
- Use semantic HTML: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<section>`.
- Keyboard navigable: focusable elements must be reachable via Tab and operable via Enter/Space.

## Responsiveness

- Mobile-first approach: base styles for mobile, then `md:` and `lg:` breakpoints.
- Test at 375px (mobile), 768px (tablet), 1280px (desktop).

## State & Data

- Server data: fetch via TanStack Query hooks in `use<Feature>.ts` — not inside components.
- Global state: Zustand stores in `src/stores/`.
- Form state: React Hook Form + Zod resolver.
- Toasts: `react-hot-toast` (`toast.success(...)`, `toast.error(...)`) — never use `alert()`.

## Loading & Error States

- Show `Skeleton` components (from shadcn/ui) while data loads.
- Handle errors gracefully with user-friendly messages.

## Do NOT

- Use `any` type — if unavoidable, add a `// TODO: type properly` comment.
- Use inline styles — use Tailwind classes.
- Use `index.tsx` barrel files for features — import directly from the component file.
- Manually create shadcn/ui primitives — use `npx shadcn@latest add <component>`.
- Modify files in `src/_legacy/`.

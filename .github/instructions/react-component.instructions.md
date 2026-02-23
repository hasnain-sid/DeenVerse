---
description: "Use when creating or editing React components, building UI, styling with Tailwind, or working with shadcn/ui components."
applyTo: "frontend/src/**/*.tsx"
---

# React Component Standards

## Component Structure

```tsx
import { useState } from 'react';
import { SomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  isActive?: boolean;
  onAction: () => void;
}

export function FeatureCard({ title, isActive = false, onAction }: FeatureCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("rounded-xl border p-4", isActive && "border-primary bg-primary/5")}>
      {/* Content */}
    </div>
  );
}
```

## Rules

- **Named exports** for all components (not `export default`)
- **Interface for props**, defined above the component (not inline)
- **`cn()` helper** for conditional classes: `cn("base", condition && "conditional")`
- **Icons**: `lucide-react` only — never `react-icons`
- **Animations**: Framer Motion for enter/exit/layout transitions
- **Loading states**: always handle — use skeleton or spinner
- **Error states**: always handle — show user-friendly message with retry
- **No `any`** — use proper types. If truly unavoidable, add `// eslint-disable-next-line` with explanation
- **No inline styles** — use Tailwind utility classes exclusively
- **Mobile-first**: base styles for mobile, `md:` for tablet, `lg:` for desktop
- **Accessible**: buttons have labels, images have alt text, interactive elements are keyboard-navigable

## shadcn/ui

- Primitives live in `src/components/ui/` — **never edit** these files manually
- To add a new component: `npx shadcn@latest add <name>`
- Import from `@/components/ui/<name>`
- Compose shadcn primitives into feature-specific components in `features/<feature>/components/`

## Shared vs Feature Components

| Location | When |
|---|---|
| `features/<feature>/components/` | Used by only this feature |
| `components/` | Used by 2+ features |
| `components/ui/` | shadcn primitives (CLI-generated, don't edit) |

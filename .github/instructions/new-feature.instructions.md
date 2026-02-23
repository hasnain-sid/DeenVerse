---
description: "Use when adding a new feature, building a new page, creating a new feature module, or scaffolding a new frontend feature with its page, hook, and components."
---

# New Feature Scaffold

## Mandatory Research Confirmation Gate

Before creating or integrating any new feature, check whether the user has explicitly requested one of these:
- research first
- skip research and implement directly

If neither is stated, ask this clarifying question before coding:
`Do you want me to run deep research first (internet + GitHub + local codebase) before implementation, or should I implement directly?`

Do not implement until the user confirms one path.

When building a new frontend feature, follow this structure **exactly**:

## File Structure

```
frontend/src/features/<feature-name>/
├── <FeatureName>Page.tsx     # Route-level page component (named export)
├── use<FeatureName>.ts       # TanStack Query hooks for API calls
├── components/               # Feature-private sub-components (optional)
│   ├── <SubComponent>.tsx
│   └── ...
└── types.ts                  # Feature-local types (optional, only if not shared)
```

## Page Component Pattern

```tsx
// Named export — App.tsx re-wraps it as default via lazy()
export function FeaturePage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto p-4 md:p-6 pb-24">
      {/* Content */}
    </div>
  );
}
```

## Hook Pattern (TanStack Query)

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useFeatureList() {
  return useQuery({
    queryKey: ['feature-name'],
    queryFn: async () => {
      const { data } = await api.get('/feature-name');
      return data;
    },
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateFeaturePayload) => {
      const { data } = await api.post('/feature-name', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-name'] });
    },
  });
}
```

## Route Registration (App.tsx)

```tsx
const FeaturePage = lazy(() =>
  import('@/features/<feature>/FeaturePage').then(m => ({ default: m.FeaturePage }))
);

// Inside <Routes>:
<Route path="/feature" element={<FeaturePage />} />
// If protected:
<Route path="/feature" element={<AuthGuard><FeaturePage /></AuthGuard>} />
```

## Checklist

- [ ] Page uses named export (not default)
- [ ] API calls go through `api` instance from `@/lib/api`, never raw `axios` or `fetch`
- [ ] All API paths are relative (`/feature-name`), never absolute URLs
- [ ] State: Zustand for global, TanStack Query for server, `useState` for local
- [ ] Icons from `lucide-react` only
- [ ] Toasts via `react-hot-toast`, no `alert()`
- [ ] Responsive layout (mobile-first, `md:` for desktop)
- [ ] Loading and error states handled

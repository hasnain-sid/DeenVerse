---
description: "new feature, new page, scaffold feature, build feature, add feature"
---

# New Feature Instructions

When the user asks to **create a new feature** or **scaffold a new page**, follow this end-to-end checklist.

## Frontend Feature Structure

Create the feature folder at `frontend/src/features/<feature-name>/` with:

```
<feature-name>/
├── <Feature>Page.tsx        # Main page component (named export)
├── use<Feature>.ts          # TanStack Query hooks (useQuery, useMutation)
├── <SubComponent>.tsx       # Feature-specific sub-components
└── types.ts                 # (optional) Feature-local types
```

### Page Component Rules

- **Named export** (not default): `export function FeaturePage() { ... }`
- Props must be typed with a dedicated interface: `interface FeaturePageProps { ... }`
- Use `cn()` from `@/lib/utils` for conditional class names.
- Icons from `lucide-react` only.
- Responsive: mobile-first, test at 375px / 768px / 1280px breakpoints.
- Loading states: use Skeleton components from shadcn/ui.
- Error states: handle with user-friendly messages via `react-hot-toast`.

### Query Hook Rules (`use<Feature>.ts`)

- Import from `@tanstack/react-query`.
- Use `useQuery` for reads, `useMutation` for writes.
- Query keys: `['<feature>', ...params]`.
- On mutation success: invalidate relevant queries via `queryClient.invalidateQueries`.
- API calls go through the shared Axios instance at `@/lib/api.ts`.

### Route Registration

Add the lazy-loaded import and route in `frontend/src/App.tsx`:

```tsx
const FeaturePage = lazy(() =>
  import('@/features/<feature>/FeaturePage').then(m => ({ default: m.FeaturePage }))
);

// Inside <Routes>, under <MainLayout>:
<Route path="/<feature>" element={<AuthGuard><FeaturePage /></AuthGuard>} />
```

- Public pages omit `<AuthGuard>`.
- Add navigation link in `Sidebar.tsx` and `MobileNav.tsx` if it's a top-level page.

## Backend (if needed)

Follow the chain: **Route → Controller → Service → Model**

1. `backend/routes/<feature>Route.js` — define endpoints, attach middleware.
2. `backend/controller/<feature>Controller.js` — parse request, call service, send response.
3. `backend/services/<feature>Service.js` — business logic, DB calls.
4. `backend/models/<feature>Schema.js` — Mongoose schema (if new collection needed).
5. Register the router in `backend/index.js`: `app.use('/api/v1/<feature>', featureRouter);`
6. ESM only (`import`/`export`), use `AppError` for errors.

## Checklist Before Done

- [ ] Feature folder created with page + hook + sub-components.
- [ ] Route registered in `App.tsx` with lazy loading.
- [ ] Navigation updated (Sidebar / MobileNav) if top-level.
- [ ] Backend route chain created (if full-stack).
- [ ] Loading and error states handled.
- [ ] No `any` types, no lint warnings.

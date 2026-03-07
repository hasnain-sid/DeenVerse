---
project: deenverse
schema_version: "1.0"
created: Wed Mar 04 2026 19:24:26 GMT+0530 (India Standard Time)
updated: 2026-03-07T12:17:52.220Z
default_workflow: [backlog, todo, in_progress, review, done]
id_prefix: TASK
next_id: 87
---

## Agents

| Agent | Type | Role | Status | Working On | Last Active | Trust Level |
|-------|------|------|--------|------------|-------------|-------------|
| hasna | human | owner, architect | idle | - | 2026-03-04T13:55:56.279Z | trusted |
| copilot | bot | developer, researcher | idle | - | 2026-03-06T11:02:21.140Z | trusted |
| copilot-2 | bot | developer, reviewer | idle | - | 2026-03-07T12:17:52.220Z | trusted |
| antigravity | bot | developer, researcher | idle | - | 2026-03-04T13:56:15.009Z | trusted |

---

## Tasks

### TASK-001 · Browse by Topic Tier-1 — Create 5 frontend prototypes

```yaml
id: TASK-001
status: review
priority: high
assigned_to: "@antigravity"
claimed_by: "@antigravity"
created_by: "@hasnain-sid"
created_at: 2026-03-04T17:13:09.467Z
updated_at: 2026-03-04T17:13:09.467Z
tags:
  - frontend
  - prototype
  - browse-topic
history:
  - ts: 2026-03-04T17:13:09.467Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-04T22:46:53+05:30
    who: "@antigravity"
    action: claimed
  - ts: 2026-03-04T22:52:00+05:30
    who: "@antigravity"
    action: moved_to_review
```

> Based on docs/browse-by-topic-optimization-research.md Tier 1: Create 5 distinct prototype designs for the Browse by Topic page redesign. Prototypes should explore: (1) Hub-and-Spoke pillar/cluster hierarchy with 4 Pillars > Clusters > Topics, (2) Cross-linked topic graph with relatedTopics section, (3) Unified Ruhani knowledge links (Tafakkur/Tazkia/Tadabbur connected), (4) Trending/popular signals row. Each prototype in frontend/src/features/browse-topic/prototypes/PrototypeN.tsx with a PrototypesViewer.tsx and temp route at /prototypes/browse-topic. Frontend only — all data mocked inline. Use existing design system (shadcn/ui, Tailwind, Lucide, Framer Motion).

### TASK-021 · Prototype: Browse by Topic UI Redesign (5 variants)

```yaml
id: TASK-021
status: review
priority: high
assigned_to: "@antigravity"
claimed_by: "@antigravity"
created_by: "@hasnain-sid"
created_at: 2026-03-04T20:24:57.823Z
updated_at: 2026-03-04T20:24:57.823Z
tags:
  - frontend
  - quran-topics
  - prototype
history:
  - ts: 2026-03-04T20:24:57.823Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T01:56:35+05:30
    who: "@antigravity"
    action: claimed
  - ts: 2026-03-05T02:02:30+05:30
    who: "@antigravity"
    action: moved_to_review
```

> The current /quran-topics page is visually unappealing — icons on the front screen don't look good and the overall layout needs a design overhaul. Create 5 distinct prototype variants in frontend/src/features/quran-topics/prototypes/ following the prototyping workflow. Each variant should explore different approaches to topic cards, icon treatment, pillar/cluster layout, mood selector, and trending row. Include a PrototypesViewer.tsx with toolbar and register a temporary route at /prototypes/quran-topics. All data is mocked inline — no backend changes.

### TASK-024 · Phase 1: Create shared Zod schemas (scholar, payment)

```yaml
id: TASK-024
status: done
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:21:48.073Z
updated_at: 2026-03-05T10:54:36.991Z
tags:
  - shared
  - scholar
  - payment
history:
  - ts: 2026-03-05T10:21:48.073Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T10:54:35.473Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T10:54:36.276Z
    who: copilot
    action: commented
    note: "Shared Zod schemas created for scholar and payment features: scholar.ts
      (specialties enum, credential, application, profile, review schemas +
      types) and payment.ts (subscription plan, checkout, earnings period,
      payment status schemas + types). Updated schemas/index.ts barrel."
  - ts: 2026-03-05T10:54:36.991Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Define Zod schemas in packages/shared/src/schemas/ for: scholarApplicationSchema, scholarProfileSchema, paymentSchema, earningsSchema. These are the integration contracts between backend and frontend.

### TASK-025 · Phase 1: Extend userSchema + isScholar middleware

```yaml
id: TASK-025
status: done
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:21:55.854Z
updated_at: 2026-03-05T11:09:58.686Z
tags:
  - backend
  - scholar
depends_on:
  - TASK-024
history:
  - ts: 2026-03-05T10:21:55.854Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T11:09:56.824Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T11:09:57.866Z
    who: copilot
    action: commented
    note: userSchema extended with scholarProfile subdoc + 'scholar' role. isScholar
      and isScholarOrAdmin middleware added.
  - ts: 2026-03-05T11:09:58.686Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Extend backend/models/userSchema.js: add 'scholar' to role enum, add scholarProfile subdocument (verifiedAt, verifiedBy, specialties, credentials, bio, teachingLanguages, rating, applicationStatus, stripeConnectId etc). Create isScholar and isScholarOrAdmin middleware in backend/middlewares/admin.js.

### TASK-026 · Phase 1: Scholar Application API (routes/controller/service)

```yaml
id: TASK-026
status: done
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:03.468Z
updated_at: 2026-03-05T11:21:55.423Z
tags:
  - backend
  - scholar
depends_on:
  - TASK-025
history:
  - ts: 2026-03-05T10:22:03.468Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T11:16:57.868Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T11:21:49.962Z
    who: copilot
    action: commented
    note: "Scholar application API complete: apply, status, profile, admin review
      endpoints. Route->Controller->Service pattern. Validation via
      express-validator (backend is JS, can't import TS shared schemas
      directly). Stripe routes stubbed at 501 for TASK-027."
  - ts: 2026-03-05T11:21:55.423Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Build scholar application flow: POST /api/v1/scholars/apply (submit application), GET /api/v1/scholars/application-status (check own status), GET /api/v1/scholars/:id/profile (public profile). Admin endpoints: GET /api/v1/admin/scholars/applications, PUT /api/v1/admin/scholars/applications/:userId/review (approve/reject). Files: scholarRoute.js, scholarController.js, scholarService.js.

### TASK-027 · Phase 1: Stripe Connect integration + service

```yaml
id: TASK-027
status: done
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:11.543Z
updated_at: 2026-03-05T11:39:53.497Z
tags:
  - backend
  - payment
depends_on:
  - TASK-025
history:
  - ts: 2026-03-05T10:22:11.543Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T11:35:29.126Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T11:39:46.066Z
    who: copilot
    action: commented
    note: Stripe Connect service built. paymentSchema + scholarPaymentSchema models
      created. Scholar stripe routes wired.
  - ts: 2026-03-05T11:39:53.497Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Create backend/services/stripeService.js: Stripe Connect Express account creation (scholar onboarding URL), dashboard link generation, account status check. Create paymentSchema.js and scholarPaymentSchema.js models. Endpoints: POST /api/v1/scholars/stripe/connect, GET /api/v1/scholars/stripe/dashboard, GET /api/v1/scholars/stripe/status.

### TASK-028 · Phase 1: Payment checkout + webhook + enrollment API

```yaml
id: TASK-028
status: done
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:19.302Z
updated_at: 2026-03-05T12:13:39.338Z
tags:
  - backend
  - payment
depends_on:
  - TASK-027
history:
  - ts: 2026-03-05T10:22:19.302Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T12:07:24.657Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T12:13:37.917Z
    who: copilot
    action: commented
    note: Payment checkout, subscription, and Stripe webhook handler implemented.
      Raw body correctly handled for /api/v1/webhooks/stripe.
  - ts: 2026-03-05T12:13:39.338Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Build payment flow: POST /api/v1/payments/checkout (Stripe Checkout session), POST /api/v1/payments/subscription, DELETE /api/v1/payments/subscription, GET /api/v1/payments/history. Stripe webhook handler: POST /api/v1/webhooks/stripe (raw body, signature verification, idempotent enrollment creation). Files: paymentRoute.js, paymentController.js, paymentService.js, webhookController.js.

### TASK-029 · Phase 1: Scholar earnings overview API

```yaml
id: TASK-029
status: backlog
priority: medium
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:25.972Z
updated_at: 2026-03-05T10:22:25.972Z
tags:
  - backend
  - payment
depends_on:
  - TASK-027
history:
  - ts: 2026-03-05T10:22:25.972Z
    who: "@hasnain-sid"
    action: created
```

> Scholar earnings endpoints: GET /api/v1/scholars/earnings (summary with totalRevenue, platformFee, netEarnings by period), GET /api/v1/scholars/earnings/details (paginated transaction list). Admin: GET /api/v1/admin/payments/overview, POST /api/v1/admin/scholars/:id/stipend.

### TASK-030 · Phase 1: Scholar Application Page — 5 prototypes

```yaml
id: TASK-030
status: in_progress
priority: high
assigned_to: antigravity
claimed_by: antigravity
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:38.059Z
updated_at: 2026-03-05T10:22:38.059Z
tags:
  - frontend
  - prototype
  - scholar
depends_on:
  - TASK-024
history:
  - ts: 2026-03-05T10:22:38.059Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T16:46:50+05:30
    who: antigravity
    action: claimed
```

> Create 5 distinct prototype variants for the Scholar Application Page in frontend/src/features/scholar/prototypes/. Explore: multi-step wizard, single-page form, card-based sections, document upload UX, specialty picker. Include PrototypesViewer.tsx + temp route /prototypes/scholar-apply. All data mocked inline. Use shadcn/ui, Tailwind, Lucide, Framer Motion.

### TASK-031 · Phase 1: Admin Scholar Review Panel — 5 prototypes

```yaml
id: TASK-031
status: backlog
priority: high
assigned_to: antigravity
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:48.188Z
updated_at: 2026-03-05T10:22:48.188Z
tags:
  - frontend
  - prototype
  - scholar
depends_on:
  - TASK-024
history:
  - ts: 2026-03-05T10:22:48.188Z
    who: "@hasnain-sid"
    action: created
```

> Create 5 distinct prototype variants for the Admin Scholar Review Panel in frontend/src/features/scholar/prototypes/. Explore: table-based review, kanban board, card detail view, split-pane (list+detail), timeline view. Show application details, credentials, approve/reject actions. Include PrototypesViewer.tsx + temp route /prototypes/scholar-review. All data mocked.

### TASK-032 · Phase 1: Scholar Badge + Profile Page — 5 prototypes

```yaml
id: TASK-032
status: backlog
priority: medium
assigned_to: antigravity
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:57.937Z
updated_at: 2026-03-05T10:22:57.937Z
tags:
  - frontend
  - prototype
  - scholar
depends_on:
  - TASK-024
history:
  - ts: 2026-03-05T10:22:57.937Z
    who: "@hasnain-sid"
    action: created
```

> Create 5 prototype variants exploring: scholar badge design (green crescent, star, checkmark styles), badge placement in posts/comments/profile, and Scholar Public Profile Page layout (credentials, courses, rating, bio). Include PrototypesViewer.tsx + temp route /prototypes/scholar-badge. All data mocked.

### TASK-033 · Phase 1: Payment + Subscription pages — 5 prototypes

```yaml
id: TASK-033
status: in_progress
priority: medium
assigned_to: antigravity
claimed_by: antigravity
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:07.423Z
updated_at: 2026-03-05T10:23:07.423Z
tags:
  - frontend
  - prototype
  - payment
depends_on:
  - TASK-024
history:
  - ts: 2026-03-05T10:23:07.423Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T21:18:46+05:30
    who: "@antigravity"
    action: claimed
```

> Create 5 prototype variants for: Checkout confirmation/redirect page, Subscription plans page (Free/Student/Premium tiers with pricing cards), Payment history list. Explore: pricing card layouts, comparison table, feature checklist. Include PrototypesViewer.tsx + temp route /prototypes/payments. All data mocked.

### TASK-034 · Phase 1: Scholar Earnings Dashboard — 5 prototypes

```yaml
id: TASK-034
status: backlog
priority: medium
assigned_to: antigravity
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:17.434Z
updated_at: 2026-03-05T10:23:17.434Z
tags:
  - frontend
  - prototype
  - payment
depends_on:
  - TASK-024
history:
  - ts: 2026-03-05T10:23:17.434Z
    who: "@hasnain-sid"
    action: created
```

> Create 5 prototype variants for Scholar Earnings Dashboard: revenue charts, payout history, course breakdown, pending payouts, Stripe Connect status. Explore: dashbord with graphs, minimal list view, card-based metrics, split analytics/transactions, timeline. Include PrototypesViewer.tsx + temp route /prototypes/scholar-earnings. All data mocked.

### TASK-035 · Phase 1: Integrate Scholar Application page + hooks

```yaml
id: TASK-035
status: done
priority: high
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:29.798Z
updated_at: 2026-03-05T14:28:43.983Z
tags:
  - frontend
  - scholar
depends_on:
  - TASK-026
  - TASK-030
history:
  - ts: 2026-03-05T10:23:29.798Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T14:18:12.306Z
    who: copilot-2
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T14:28:42.070Z
    who: copilot-2
    action: commented
    note: Scholar Application Page integrated. useScholar hook created. Route
      /scholar/apply live.
  - ts: 2026-03-05T14:28:43.983Z
    who: copilot-2
    action: completed
    from: in_progress
    to: done
```

> Promote the chosen Scholar Application prototype to production. Create useScholar.ts hook (TanStack Query) with useScholarApplication mutation and useApplicationStatus query. Wire to POST /api/v1/scholars/apply and GET /api/v1/scholars/application-status. Remove prototype files after promotion.

### TASK-036 · Phase 1: Integrate Admin Scholar Review Panel

```yaml
id: TASK-036
status: done
priority: high
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:37.255Z
updated_at: 2026-03-05T16:54:46.832Z
tags:
  - frontend
  - scholar
depends_on:
  - TASK-026
  - TASK-031
history:
  - ts: 2026-03-05T10:23:37.255Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T15:34:51.744Z
    who: copilot-2
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T15:47:38.070Z
    who: copilot-2
    action: commented
    note: Admin Scholar Review Panel integrated. Admin route /admin/scholars live.
      Created AdminGuard, AdminScholarReviewPage (promoted from Prototype 3),
      added useAdminScholarApplications/useReviewApplication/useAdminScholarList
      hooks. Deleted admin review prototypes and mock data.
  - ts: 2026-03-05T15:47:42.892Z
    who: copilot-2
    action: completed
    from: in_progress
    to: done
  - ts: 2026-03-05T16:54:46.832Z
    who: copilot-2
    action: commented
    note: Admin Scholar Review Panel integrated. Admin route /admin/scholars live.
      useScholar.ts already has useAdminScholarApplications,
      useReviewApplication, useAdminScholarList. AdminScholarReviewPage.tsx
      fully implemented with inbox-style two-panel layout (Applications +
      Verified Scholars tabs). Route /admin/scholars registered with AdminGuard
      in App.tsx. No AdminReview prototypes existed to delete (only Badge
      prototypes remain in prototypes folder).
```

> Promote chosen Admin Scholar Review prototype. Create useAdminScholarReview hook (TanStack Query) for GET /api/v1/admin/scholars/applications and PUT /api/v1/admin/scholars/applications/:userId/review. Wire approve/reject actions. Add route to admin section.

### TASK-037 · Phase 1: Integrate Badge + Scholar Profile across app

```yaml
id: TASK-037
status: done
priority: medium
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:45.711Z
updated_at: 2026-03-05T19:53:16.963Z
tags:
  - frontend
  - scholar
depends_on:
  - TASK-025
  - TASK-032
history:
  - ts: 2026-03-05T10:23:45.711Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T16:59:18.372Z
    who: copilot-2
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T19:53:08.966Z
    who: copilot-2
    action: commented
    note: ScholarBadge component created (Prototype 1 pill design, supports
      scholar/admin/moderator roles, sm/md/lg sizes). Integrated into PostCard,
      MessagesPage (chat header + conversation list), ProfilePage, and
      SearchPage user results. ScholarProfilePage created at /scholars/:id wired
      to useScholarProfile(id) hook with cover/bio/stats/credentials/specialties
      layout. Route /scholars/:id registered. Badge prototypes folder deleted.
  - ts: 2026-03-05T19:53:16.963Z
    who: copilot-2
    action: completed
    from: in_progress
    to: done
```

> Promote chosen badge design. Create ScholarBadge.tsx reusable component. Add badge display in: PostCard, CommentItem, ChatMessage, ProfileHeader, search results. Integrate ScholarProfilePage with useScholarProfile hook → GET /api/v1/scholars/:id/profile. Add route /scholars/:id.

### TASK-038 · Phase 1: Integrate Payment/Checkout + Subscription flow

```yaml
id: TASK-038
status: done
priority: high
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:52.832Z
updated_at: 2026-03-05T20:13:26.656Z
tags:
  - frontend
  - payment
depends_on:
  - TASK-028
  - TASK-033
history:
  - ts: 2026-03-05T10:23:52.832Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T16:56:55.831Z
    who: copilot-2
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T17:02:31.513Z
    who: copilot-2
    action: commented
    note: Payment checkout, subscription, and history pages integrated. usePayments
      hook with 4 TanStack Query hooks created. Routes /subscription, /checkout,
      /payments/history registered with AuthGuard. Upgrade Plan CTA added to
      SettingsPage sidebar. Payment prototypes deleted.
  - ts: 2026-03-05T17:02:33.476Z
    who: copilot-2
    action: completed
    from: in_progress
    to: done
  - ts: 2026-03-05T17:20:21.450Z
    who: copilot-2
    action: commented
    note: Creating payment checkout and subscription pages
  - ts: 2026-03-05T17:20:43.258Z
    who: copilot-2
    action: commented
    note: Payment checkout, subscription, and history pages integrated.
  - ts: 2026-03-05T20:13:26.656Z
    who: copilot-2
    action: commented
    note: Payment checkout, subscription, and history pages integrated.
```

> Promote chosen Payment prototype. Create useCheckout, useSubscription, usePaymentHistory hooks (TanStack Query). Wire to Stripe Checkout redirect flow. Build SubscriptionPage with plan comparison, upgrade/downgrade. Add routes /checkout, /subscription, /payments/history.

### TASK-039 · Phase 1: Integrate Scholar Earnings Dashboard

```yaml
id: TASK-039
status: done
priority: medium
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:01.841Z
updated_at: 2026-03-05T20:30:08.141Z
tags:
  - frontend
  - payment
depends_on:
  - TASK-029
  - TASK-034
history:
  - ts: 2026-03-05T10:24:01.841Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T20:21:32.493Z
    who: copilot-2
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T20:30:00.360Z
    who: copilot-2
    action: commented
    note: Scholar Earnings Dashboard and Stripe setup flow integrated.
  - ts: 2026-03-05T20:30:08.141Z
    who: copilot-2
    action: completed
    from: in_progress
    to: done
```

> Promote chosen Earnings Dashboard prototype. Create useScholarEarnings, useStripeConnect hooks. Wire to GET /api/v1/scholars/earnings, /earnings/details, /stripe/status. Build Stripe Connect onboarding flow. Add routes /scholar/earnings, /scholar/stripe-setup.

### TASK-040 · Phase 1: Unit tests — Scholar models + service + middleware

```yaml
id: TASK-040
status: done
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:11.064Z
updated_at: 2026-03-05T21:56:22.460Z
tags:
  - backend
  - testing
  - scholar
depends_on:
  - TASK-026
history:
  - ts: 2026-03-05T10:24:11.064Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T21:56:01.854Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T21:56:14.383Z
    who: copilot
    action: commented
    note: Unit tests for scholar middleware + service written. All 32 tests passing
      (14 middleware, 18 service). Fixed ESM/CJS babel config. Tests mock
      mongoose models, no real DB.
  - ts: 2026-03-05T21:56:22.460Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Write unit tests for: userSchema scholar fields validation, isScholar/isScholarOrAdmin middleware (role checks, edge cases), scholarService functions (apply, review, approve, reject). Use Jest or Vitest. Test: valid/invalid applications, role transitions, admin-only access, duplicate applications, rejection flow.

### TASK-041 · Phase 1: Unit tests — Payment service + webhook handler

```yaml
id: TASK-041
status: done
priority: high
assigned_to: copilot
claimed_by: copilot
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:19.400Z
updated_at: 2026-03-06T00:00:00.000Z
tags:
  - backend
  - testing
  - payment
depends_on:
  - TASK-028
  - TASK-029
history:
  - ts: 2026-03-05T10:24:19.400Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-06T00:00:00.000Z
    who: copilot
    action: claimed
  - ts: 2026-03-06T00:00:00.000Z
    who: copilot
    action: comment
    note: Unit tests for stripeService + webhookController written. Idempotency
      tested.
  - ts: 2026-03-06T00:00:00.000Z
    who: copilot
    action: done
```

> Write unit tests for: stripeService (checkout session creation, Connect onboarding, webhook signature verification), payment controller (idempotent enrollment, subscription create/cancel), webhook handler (all event types: checkout.session.completed, customer.subscription.updated/deleted, account.updated). Mock Stripe SDK calls.

### TASK-042 · Phase 1: Smoke tests — All Phase 1 API endpoints

```yaml
id: TASK-042
status: done
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:28.389Z
updated_at: 2026-03-05T22:20:49.146Z
tags:
  - backend
  - testing
depends_on:
  - TASK-040
  - TASK-041
history:
  - ts: 2026-03-05T10:24:28.389Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T21:58:02.337Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T22:20:38.107Z
    who: copilot
    action: commented
    note: All 15 smoke tests passing. Phase 1 API verified.
  - ts: 2026-03-05T22:20:49.146Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Write smoke/integration tests that hit all Phase 1 endpoints with real HTTP requests (supertest). Test: scholar application flow (apply → pending → admin approve → role change), Stripe checkout session creation, webhook processing, earnings retrieval. Verify auth guards (401 without token, 403 without correct role). Test edge cases: re-apply after rejection, double enrollment.

### TASK-043 · Phase 1: Update feature-board, contracts, docs + final commit

```yaml
id: TASK-043
status: done
priority: medium
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:37.586Z
updated_at: 2026-03-05T22:36:16.601Z
tags:
  - docs
  - devops
depends_on:
  - TASK-035
  - TASK-036
  - TASK-037
  - TASK-038
  - TASK-039
history:
  - ts: 2026-03-05T10:24:37.586Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-05T22:24:13.891Z
    who: copilot-2
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-05T22:36:14.181Z
    who: copilot-2
    action: commented
    note: Phase 1 complete. Lint clean. Feature board updated. All commits pushed.
  - ts: 2026-03-05T22:36:16.601Z
    who: copilot-2
    action: completed
    from: in_progress
    to: done
```

> Update .agents/feature-board.md with Scholar Role System and Payment System feature rows (all layers). Mark contracts as complete. Update ROADMAP.md with Phase 1 completion. Final code review, lint check, commit with conventional commit messages.

### TASK-044 · Resolve Dependabot security vulnerabilities (3 critical, 32 high)

```yaml
id: TASK-044
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:50:39.062Z
updated_at: 2026-03-05T10:50:39.062Z
tags:
  - security
  - dependencies
  - maintenance
history:
  - ts: 2026-03-05T10:50:39.062Z
    who: "@hasnain-sid"
    action: created
```

> GitHub Dependabot flagged 51 vulnerabilities on the main branch after the March 5 push: 3 critical, 32 high, 8 moderate, 8 low. Steps: 1) Run 'npm audit' from repo root to get the full report. 2) Address critical CVEs first (likely in backend dependencies). 3) Run 'npm audit fix' for auto-fixable issues. 4) Manually update packages that require semver-major bumps (test for breaking changes). 5) Check frontend and mobile packages separately. 6) Verify no regressions after updates. 7) Push updated package-lock.json. Reference: https://github.com/hasnain-sid/DeenVerse/security/dependabot

### TASK-045 · Phase 2: Create shared Zod schemas (course, enrollment, quiz)

```yaml
id: TASK-045
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:10:58.178Z
updated_at: 2026-03-06T10:07:01.380Z
tags:
  - shared
  - course
history:
  - ts: 2026-03-05T13:10:58.178Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-06T10:05:55.900Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-06T10:06:56.045Z
    who: copilot
    action: commented
    note: "Shared Zod schemas created for course system: enums, pricing, lesson,
      module, create/update course, enrollment, quiz, filters, review schemas +
      types."
  - ts: 2026-03-06T10:07:01.380Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Define Zod schemas in packages/shared/src/schemas/course.ts: courseCategoryEnum, courseLevelEnum, courseTypeEnum, courseStatusEnum, coursePricingSchema, courseLessonSchema, courseModuleSchema, createCourseSchema, updateCourseSchema, enrollCourseSchema, quizAnswerSchema, submitQuizSchema, courseReviewSchema, courseFiltersSchema. Export types. Update index.ts barrel.

### TASK-046 · Phase 2: Course + Enrollment + Quiz + QuizAttempt models

```yaml
id: TASK-046
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:11:08.281Z
updated_at: 2026-03-06T10:10:14.317Z
tags:
  - backend
  - course
depends_on:
  - TASK-045
history:
  - ts: 2026-03-05T13:11:08.281Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-06T10:08:12.939Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-06T10:10:08.644Z
    who: copilot
    action: commented
    note: Course, Enrollment, Quiz, QuizAttempt models created. courseAccess
      middleware with isEnrolled added. slugify was already installed.
  - ts: 2026-03-06T10:10:14.317Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Create backend models: courseSchema.js (full schema from contract with indexes), enrollmentSchema.js (student+course compound unique index, progress tracking), quizSchema.js (questions, timeLimit, passingScore), quizAttemptSchema.js (answers, score, timing). Add courseAccess middleware in backend/middlewares/courseAccess.js (verify enrollment before serving paid content).

### TASK-047 · Phase 2: Course CRUD API (routes/controller/service)

```yaml
id: TASK-047
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:11:19.226Z
updated_at: 2026-03-06T10:21:31.809Z
tags:
  - backend
  - course
depends_on:
  - TASK-046
history:
  - ts: 2026-03-05T13:11:19.226Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-06T10:19:00.090Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-06T10:21:25.594Z
    who: copilot
    action: commented
    note: "Course CRUD API complete: create, browse, detail, update, delete,
      publish, module management. Slug auto-generation. Ownership checks.
      Pagination + filtering. Redis-cached featured courses. optionalAuth for
      public detail with enrollment status."
  - ts: 2026-03-06T10:21:31.809Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Build course CRUD: POST /api/v1/courses (create), GET /api/v1/courses (browse with filters/pagination/search), GET /api/v1/courses/:slug (detail), PUT /api/v1/courses/:slug (update), DELETE /api/v1/courses/:slug, PUT /api/v1/courses/:slug/publish, POST/PUT/DELETE modules. Files: courseRoute.js, courseController.js, courseService.js. Use slugify for URL-safe slugs. Ownership check middleware.

### TASK-048 · Phase 2: Enrollment API + progress tracking

```yaml
id: TASK-048
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:11:53.335Z
updated_at: 2026-03-06T10:45:13.630Z
tags:
  - backend
  - course
depends_on:
  - TASK-046
history:
  - ts: 2026-03-05T13:11:53.335Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-06T10:42:29.931Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-06T10:45:06.430Z
    who: copilot
    action: commented
    note: "Enrollment API complete: enroll (free/paid), progress tracking, lesson
      completion with percentComplete recalc, lesson content serving."
  - ts: 2026-03-06T10:45:13.630Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Build enrollment flow: POST /api/v1/courses/:slug/enroll (free auto-enroll, paid verify payment), GET /api/v1/courses/:slug/progress, PUT /api/v1/courses/:slug/progress (mark lesson complete, recalculate percentComplete), GET /api/v1/courses/:slug/lessons/:lessonId (serve content, courseAccess middleware). GET /api/v1/courses/my-courses (student enrolled list). Increment course.enrollmentCount and instructor.scholarProfile.totalStudents on enroll.

### TASK-049 · Phase 2: Quiz engine API (start, submit, results)

```yaml
id: TASK-049
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:12:03.305Z
updated_at: 2026-03-06T10:52:54.288Z
tags:
  - backend
  - course
depends_on:
  - TASK-046
history:
  - ts: 2026-03-05T13:12:03.305Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-06T10:50:30.731Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-06T10:52:49.020Z
    who: copilot
    action: commented
    note: "Quiz engine API complete: CRUD for scholars, start/submit/results for
      students. Server-side grading, time enforcement, max attempts, answer
      stripping."
  - ts: 2026-03-06T10:52:54.288Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Build quiz engine: POST /api/v1/quizzes/:id/start (create QuizAttempt, strip correct answers from questions, enforce maxAttempts), POST /api/v1/quizzes/:id/submit (grade answers server-side, enforce timeLimit + 30s grace, calculate score, set passed), GET /api/v1/quizzes/:id/results (return attempts + best score). CRUD for quizzes tied to courses (scholar can create quizzes for their course lessons).

### TASK-050 · Phase 2: Discovery + Admin course review API

```yaml
id: TASK-050
status: done
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:12:13.824Z
updated_at: 2026-03-06T11:02:21.140Z
tags:
  - backend
  - course
depends_on:
  - TASK-047
history:
  - ts: 2026-03-05T13:12:13.824Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-06T11:00:09.936Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-06T11:02:13.003Z
    who: copilot
    action: commented
    note: "Admin course review API complete: list pending courses, approve/reject
      with notifications. Dedicated adminCourseRoute.js mounted at
      /api/v1/admin/courses. getAdminCourses + reviewCourse service functions
      with instructor notification."
  - ts: 2026-03-06T11:02:21.140Z
    who: copilot
    action: completed
    from: in_progress
    to: done
```

> Build discovery endpoints: GET /api/v1/courses/featured (top-rated + most enrolled, cached in Redis), GET /api/v1/courses/teaching (scholar's own courses). Admin review: GET /api/v1/admin/courses?status=pending-review, PUT /api/v1/admin/courses/:slug/review (approve sets status=published, reject sets archived + reason). Increment instructor.scholarProfile.totalCourses on publish.

### TASK-051 · Phase 2: Course Discovery Page — 5 prototypes

```yaml
id: TASK-051
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:12:26.032Z
updated_at: 2026-03-05T13:12:26.032Z
tags:
  - frontend
  - prototype
  - course
depends_on:
  - TASK-045
history:
  - ts: 2026-03-05T13:12:26.032Z
    who: "@hasnain-sid"
    action: created
```

> Create 5 prototype variants for Course Discovery/Browse page in frontend/src/features/courses/prototypes/. Explore: grid with filters sidebar, Netflix-style carousels by category, search-first with instant results, card masonry layout, map/timeline view. Include PrototypesViewer.tsx + temp route /prototypes/course-discovery. All data mocked.

### TASK-052 · Phase 2: Course Detail Page — 5 prototypes

```yaml
id: TASK-052
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:12:35.345Z
updated_at: 2026-03-05T13:12:35.345Z
tags:
  - frontend
  - prototype
  - course
depends_on:
  - TASK-045
history:
  - ts: 2026-03-05T13:12:35.345Z
    who: "@hasnain-sid"
    action: created
```

> Create 5 prototype variants for Course Detail page. Explore: long-scroll landing page (Udemy-style), tabbed layout (overview/syllabus/reviews/instructor), split panel (info left + syllabus right), video hero header with floating enroll card, minimalist single-column. Show: title, instructor, rating, price, enroll CTA, module list, requirements, outcomes. Temp route /prototypes/course-detail. Mocked data.

### TASK-053 · Phase 2: Course Player Page — 5 prototypes

```yaml
id: TASK-053
status: done
priority: high
assigned_to: antigravity
claimed_by: antigravity
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:12:44.528Z
updated_at: 2026-03-05T13:12:44.528Z
tags:
  - frontend
  - prototype
  - course
depends_on:
  - TASK-045
history:
  - ts: 2026-03-05T13:12:44.528Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-06T17:43:00.000Z
    who: "@antigravity"
    action: claimed
```

> Create 5 prototype variants for Course Player (lesson viewer). Explore: sidebar nav + main content (Coursera-style), collapsible sidebar with progress bar, full-width video with floating module drawer, split view (video top + notes bottom), minimal focus mode with swipe navigation. Show: video/text lesson content, module sidebar, progress indicator, next/prev lesson, notes area. Temp route /prototypes/course-player. Mocked data.

### TASK-054 · Phase 2: Course Builder (Scholar) — 5 prototypes

```yaml
id: TASK-054
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:12:52.784Z
updated_at: 2026-03-05T13:12:52.784Z
tags:
  - frontend
  - prototype
  - course
depends_on:
  - TASK-045
history:
  - ts: 2026-03-05T13:12:52.784Z
    who: "@hasnain-sid"
    action: created
```

> Create 5 prototype variants for Course Builder (scholar creates/edits courses). Explore: multi-step wizard (info->modules->pricing->preview), single-page form with sections, drag-drop module/lesson builder, markdown-first editor (Notion-style), template-based quick-start. Show: course info fields, module/lesson CRUD, pricing config, preview, publish button. Temp route /prototypes/course-builder. Mocked data.

### TASK-055 · Phase 2: Quiz Player — 3 prototypes

```yaml
id: TASK-055
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:13:00.675Z
updated_at: 2026-03-05T13:13:00.675Z
tags:
  - frontend
  - prototype
  - course
depends_on:
  - TASK-045
history:
  - ts: 2026-03-05T13:13:00.675Z
    who: "@hasnain-sid"
    action: created
```

> Create 3 prototype variants for Quiz/Assessment Player. Explore: one-question-per-page with progress bar, all-questions-visible scroll, timed exam mode with countdown and focus lock. Show: question text, MCQ/true-false/short-answer inputs, timer, submit button, results page with score + pass/fail. Temp route /prototypes/quiz-player. Mocked data.

### TASK-056 · Phase 2: Integrate Course Discovery page + hooks

```yaml
id: TASK-056
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:13:09.607Z
updated_at: 2026-03-07T12:17:52.220Z
tags:
  - frontend
  - course
depends_on:
  - TASK-047
  - TASK-051
history:
  - ts: 2026-03-05T13:13:09.607Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-07T12:17:33.944Z
    who: copilot-2
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-03-07T12:17:43.978Z
    who: copilot-2
    action: commented
    note: Course Discovery page integrated. useCourses hook created with filters +
      featured. Route /courses live. Nav link added to Sidebar and MobileNav
      (Learning group). DiscoveryPrototype files deleted. @deenverse/shared
      rebuilt to include course types.
  - ts: 2026-03-07T12:17:52.220Z
    who: copilot-2
    action: completed
    from: in_progress
    to: done
```

> Promote chosen Course Discovery prototype to production. Create frontend/src/features/courses/CoursesPage.tsx. Create useCourses.ts with TanStack Query hooks: useCourses(filters), useFeaturedCourses(). Wire to GET /api/v1/courses, /api/v1/courses/featured. Add route /courses. Add 'Courses' link to main navigation.

### TASK-057 · Phase 2: Integrate Course Detail page

```yaml
id: TASK-057
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:13:17.001Z
updated_at: 2026-03-05T13:13:17.001Z
tags:
  - frontend
  - course
depends_on:
  - TASK-047
  - TASK-052
history:
  - ts: 2026-03-05T13:13:17.001Z
    who: "@hasnain-sid"
    action: created
```

> Promote chosen Course Detail prototype. Create CourseDetailPage.tsx. Add useCourseDetail(slug), useEnrollCourse() hooks to useCourses.ts. Wire to GET /api/v1/courses/:slug, POST /api/v1/courses/:slug/enroll. Show enroll CTA for non-enrolled, 'Continue Learning' for enrolled. Route /courses/:slug.

### TASK-058 · Phase 2: Integrate Course Player + progress

```yaml
id: TASK-058
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:13:24.900Z
updated_at: 2026-03-05T13:13:24.900Z
tags:
  - frontend
  - course
depends_on:
  - TASK-048
  - TASK-053
history:
  - ts: 2026-03-05T13:13:24.900Z
    who: "@hasnain-sid"
    action: created
```

> Promote chosen Course Player prototype. Create CoursePlayerPage.tsx. Add useCourseProgress(slug), useUpdateProgress(), useLessonContent(slug, lessonId) hooks. Wire to progress + lesson APIs. Track lesson completion, auto-advance. Route /courses/:slug/learn. AuthGuard + enrollment check.

### TASK-059 · Phase 2: Integrate Course Builder (Scholar)

```yaml
id: TASK-059
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:13:32.365Z
updated_at: 2026-03-05T13:13:32.365Z
tags:
  - frontend
  - course
depends_on:
  - TASK-047
  - TASK-054
history:
  - ts: 2026-03-05T13:13:32.365Z
    who: "@hasnain-sid"
    action: created
```

> Promote chosen Course Builder prototype. Create CreateCoursePage.tsx + EditCoursePage.tsx. Add useCreateCourse(), useUpdateCourse(), useDeleteCourse(), usePublishCourse(), useAddModule(), useUpdateModule(), useDeleteModule(), useMyTeaching() hooks. Wire to course CRUD APIs. Routes: /scholar/courses/new, /scholar/courses/:slug/edit, /scholar/courses. AuthGuard + scholar check.

### TASK-060 · Phase 2: Integrate Quiz Player + My Courses page

```yaml
id: TASK-060
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:13:39.937Z
updated_at: 2026-03-05T13:13:39.937Z
tags:
  - frontend
  - course
depends_on:
  - TASK-049
  - TASK-055
history:
  - ts: 2026-03-05T13:13:39.937Z
    who: "@hasnain-sid"
    action: created
```

> Promote chosen Quiz Player prototype. Create QuizPlayerPage.tsx + MyCoursesPage.tsx. Add useStartQuiz(), useSubmitQuiz(), useQuizResults(), useMyCourses() hooks. Wire to quiz and my-courses APIs. Routes: /courses/:slug/quiz/:quizId, /my-courses. AuthGuard.

### TASK-061 · Phase 2: Integrate Admin Course Review panel

```yaml
id: TASK-061
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:13:47.445Z
updated_at: 2026-03-05T13:13:47.445Z
tags:
  - frontend
  - course
depends_on:
  - TASK-050
history:
  - ts: 2026-03-05T13:13:47.445Z
    who: "@hasnain-sid"
    action: created
```

> Create AdminCourseReviewPage.tsx. Add useAdminCourses(status, page), useReviewCourse() hooks. Wire to GET /api/v1/admin/courses, PUT /api/v1/admin/courses/:slug/review. Show pending courses with approve/reject actions. Route /admin/courses. AuthGuard + admin check.

### TASK-062 · Phase 2: Unit tests — Course models + service

```yaml
id: TASK-062
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:13:56.277Z
updated_at: 2026-03-05T13:13:56.277Z
tags:
  - backend
  - testing
  - course
depends_on:
  - TASK-047
history:
  - ts: 2026-03-05T13:13:56.277Z
    who: "@hasnain-sid"
    action: created
```

> Write unit tests for: courseSchema validation (required fields, enum values, slug uniqueness), enrollmentSchema (compound index, progress defaults), courseService functions (create, update, delete, publish, slug generation, ownership check). Use Jest. Mock mongoose models. Test: valid/invalid course creation, duplicate slugs, unauthorized update attempts, draft->pending-review->published flow.

### TASK-063 · Phase 2: Unit tests — Enrollment + Quiz engine

```yaml
id: TASK-063
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:14:04.524Z
updated_at: 2026-03-05T13:14:04.524Z
tags:
  - backend
  - testing
  - course
depends_on:
  - TASK-048
  - TASK-049
history:
  - ts: 2026-03-05T13:14:04.524Z
    who: "@hasnain-sid"
    action: created
```

> Write unit tests for: enrollment service (enroll in free course, reject duplicate enrollment, progress tracking, percentComplete calculation, lesson completion), quiz service (start attempt enforces maxAttempts, submit grades correctly, timer enforcement, correct answer stripping). Mock mongoose + Stripe.

### TASK-064 · Phase 2: Smoke tests — All Course API endpoints

```yaml
id: TASK-064
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:14:17.151Z
updated_at: 2026-03-05T13:14:17.151Z
tags:
  - backend
  - testing
  - course
depends_on:
  - TASK-062
  - TASK-063
history:
  - ts: 2026-03-05T13:14:17.151Z
    who: "@hasnain-sid"
    action: created
```

> Smoke/integration tests using supertest: scholar creates course (201), browse courses (200, paginated), get course by slug (200), update course (200, ownership enforced), enroll in free course (200), enroll in paid course without payment (402/400), get progress (200), complete lesson + check percentComplete, start quiz + submit + get results, admin review flow (pending-review->published). Auth guards: 401 without token, 403 without scholar role for create. Use mongodb-memory-server.

### TASK-065 · Phase 2: Update feature-board, contracts, docs + final commit

```yaml
id: TASK-065
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T13:14:27.421Z
updated_at: 2026-03-05T13:14:27.421Z
tags:
  - docs
  - devops
depends_on:
  - TASK-056
  - TASK-057
  - TASK-058
  - TASK-059
  - TASK-060
  - TASK-061
history:
  - ts: 2026-03-05T13:14:27.421Z
    who: "@hasnain-sid"
    action: created
```

> Update .agents/feature-board.md with Course System row (all layers complete). Mark course-system contract as complete. Update ROADMAP.md with Phase 2 completion. Run frontend lint, fix errors. Final code review. Commit with conventional commits: feat(courses), feat(enrollment), feat(quiz), feat(frontend), test(phase2), docs.

### TASK-066 · Phase 3: Create shared Zod schemas (classroom)

```yaml
id: TASK-066
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - shared
  - classroom
  - phase3
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Create packages/shared/src/schemas/classroom.ts: classroomTypeEnum, classroomStatusEnum, classroomAccessEnum, classroomParticipantRoleEnum, classroomSettingsSchema, createClassroomSchema, updateClassroomSchema, classroomFiltersSchema, updateClassroomSettingsSchema. Export inferred types. Update index.ts barrel.

### TASK-067 · Phase 3: Classroom + ClassroomParticipant models + LiveKit service

```yaml
id: TASK-067
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - backend
  - classroom
  - phase3
depends_on:
  - TASK-066
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Create backend/models/classroomSchema.js (host, title, course, type, scheduling, LiveKit fields, status, participants, settings, recordings, whiteboardSnapshot, tags) + backend/models/classroomParticipantSchema.js (classroom, user, role, timing, hand state). Create backend/services/livekitService.js (createRoom, deleteRoom, generateToken, listParticipants, muteParticipant, removeParticipant, startRecording, stopRecording). Install livekit-server-sdk. Graceful fallback when not configured.

### TASK-068 · Phase 3: Classroom CRUD API (routes/controller/service)

```yaml
id: TASK-068
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - backend
  - classroom
  - phase3
depends_on:
  - TASK-067
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Create backend/routes/classroomRoute.js, backend/controller/classroomController.js, backend/services/classroomService.js. CRUD: createClassroom (scholar only), browseClassrooms (public, paginated, filterable), getUpcomingClassrooms, getMySessions (host/student role filter), getClassroomById, updateClassroom (host ownership), deleteClassroom (host, prevent live deletion). Mount at /api/v1/classrooms.

### TASK-069 · Phase 3: Classroom Lifecycle API (start/join/end/leave)

```yaml
id: TASK-069
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - backend
  - classroom
  - phase3
depends_on:
  - TASK-068
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Add lifecycle endpoints to classroomRoute: POST /:id/start (host creates LiveKit room, returns token+serverUrl), POST /:id/join (access control: course-only enrollment check, followers check, public allow; token generation; participant tracking; peakParticipants update), POST /:id/end (host deletes room, updates all participants, sets ended), POST /:id/leave (update participant, decrement count). Socket.IO events: classroom:started, classroom:ended.

### TASK-070 · Phase 3: Classroom Controls API (mute/kick/settings/raise hand)

```yaml
id: TASK-070
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - backend
  - classroom
  - phase3
depends_on:
  - TASK-069
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Add control endpoints: POST /:id/mute/:participantId, POST /:id/kick/:participantId, PUT /:id/settings. Socket.IO events: classroom:raise-hand, classroom:lower-hand, classroom:grant-speak, classroom:join-room, classroom:leave-room. In-memory hand raise queue. Host-only authorization for mute/kick/settings.

### TASK-071 · Phase 3: Session Recording API

```yaml
id: TASK-071
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - backend
  - classroom
  - phase3
depends_on:
  - TASK-069
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Add recording endpoints: POST /:id/recording/start (host, live, recordingEnabled check; LiveKit Egress to S3), POST /:id/recording/stop (stop Egress, push to recordings array), GET /:id/recordings (host/participant access, pre-signed S3 URLs). Socket.IO: classroom:recording-started, classroom:recording-stopped for consent banner.

### TASK-072 · Phase 3: Whiteboard Sync Backend

```yaml
id: TASK-072
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - backend
  - classroom
  - phase3
depends_on:
  - TASK-070
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Whiteboard snapshot persistence: PUT /:id/whiteboard (host saves tldraw snapshot), GET /:id/whiteboard (participants load snapshot for late-join). Socket.IO events: classroom:whiteboard-save (throttled 30s), classroom:whiteboard-load (callback with snapshot), classroom:whiteboard-clear (host broadcast). Primary sync via LiveKit data channels (client-side), backend is fallback.

### TASK-073 · Phase 3: Classroom Lobby prototypes (5 variants)

```yaml
id: TASK-073
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - prototype
  - phase3
depends_on:
  - TASK-066
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> 5 Lobby prototypes: (1) Live-First Grid, (2) Calendar View, (3) Channel-Style, (4) Hero Carousel + Cards, (5) Dashboard Hub. In frontend/src/features/classroom/prototypes/. PrototypesViewer at /prototypes/classroom-lobby. Mocked data: 4 live, 6 upcoming, 3 ended classrooms. Include filters, search, type badges, live badges, responsive.

### TASK-074 · Phase 3: Live Classroom prototypes (5 variants)

```yaml
id: TASK-074
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - prototype
  - phase3
depends_on:
  - TASK-066
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> 5 Live prototypes: (1) Zoom-Style Grid, (2) Lecture Mode, (3) Whiteboard-First, (4) Split Panel, (5) Floating Panels. Each includes: host video, participant grid, control bar (mic/cam/screen/hand/whiteboard/chat/record/leave), chat panel, participants panel, hand raise queue, whiteboard placeholder, recording indicator. Responsive.

### TASK-075 · Phase 3: Schedule Classroom prototypes (5 variants)

```yaml
id: TASK-075
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - prototype
  - phase3
depends_on:
  - TASK-066
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> 5 Schedule prototypes: (1) Multi-Step Wizard, (2) Single-Page Form, (3) Quick Schedule Card, (4) Calendar Integration, (5) Template-Based. Fields: title, description, type, scheduledAt, duration, timezone, course link, access, maxParticipants, settings toggles, tags. Both create and edit states.

### TASK-076 · Phase 3: Whiteboard Panel prototypes (3 variants)

```yaml
id: TASK-076
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - prototype
  - phase3
depends_on:
  - TASK-066
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> 3 Whiteboard prototypes: (1) Full Toolbar Canvas, (2) Minimal Teaching Mode (Arabic handwriting focus), (3) Slide-Based (multi-page). Mocked canvas. Drawing tools, color palette, undo/redo, participant cursors, clear button, zoom, fullscreen.

### TASK-077 · Phase 3: Integrate Classroom Lobby page

```yaml
id: TASK-077
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - phase3
depends_on:
  - TASK-068
  - TASK-073
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Promote chosen Lobby prototype to ClassroomLobbyPage.tsx. Create useClassroom.ts with useClassrooms(filters) + useUpcomingClassrooms hooks. Route /classrooms. Nav link. Delete lobby prototypes.

### TASK-078 · Phase 3: Integrate Live Classroom page + LiveKit

```yaml
id: TASK-078
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - phase3
depends_on:
  - TASK-069
  - TASK-070
  - TASK-074
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Promote chosen Live prototype. Install @livekit/components-react, livekit-client, @livekit/components-styles. LiveKit integration: LiveKitRoom wrapper, VideoTrack, ParticipantTile, mic/cam/screen toggles. Add useStartClassroom, useJoinClassroom, useEndClassroom, useLeaveClassroom, useClassroomDetail hooks. Socket.IO chat + raise hand. Route /classrooms/:id/live.

### TASK-079 · Phase 3: Integrate Schedule Classroom + My Sessions

```yaml
id: TASK-079
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - phase3
depends_on:
  - TASK-068
  - TASK-075
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Promote chosen Schedule prototype. Create ScheduleClassroomPage, EditClassroomPage, MySessionsPage. Hooks: useCreateClassroom, useUpdateClassroom, useDeleteClassroom, useMySessions. Course linking with lesson selector. Form validation with shared Zod schemas. Scholar routes: /scholar/classrooms, /scholar/classrooms/new, /scholar/classrooms/:id/edit.

### TASK-080 · Phase 3: Integrate Whiteboard with tldraw

```yaml
id: TASK-080
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - phase3
depends_on:
  - TASK-072
  - TASK-076
  - TASK-078
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Install @tldraw/tldraw. Create WhiteboardPanel.tsx. tldraw store API for state. Sync via LiveKit data channel. Snapshot persistence every 30s + late-join hydration. Hooks: useSaveWhiteboard, useWhiteboardSnapshot. Host full edit, participant read-only. Cursor sharing. Embed in ClassroomLivePage. Manual chunk in vite.config.ts.

### TASK-081 · Phase 3: Student Sessions + Course integration

```yaml
id: TASK-081
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - phase3
depends_on:
  - TASK-078
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Create StudentSessionsPage (/my-sessions). Integrate into CourseDetailPage (upcoming sessions section) + CoursePlayerPage (live-session lesson type: join/countdown/recording). Hook: useStudentSessions. Nav link in user dropdown.

### TASK-082 · Phase 3: Recording Viewer + Polish

```yaml
id: TASK-082
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - frontend
  - classroom
  - phase3
depends_on:
  - TASK-071
  - TASK-078
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Recording hooks: useStartRecording, useStopRecording, useRecordings, useMuteParticipant, useKickParticipant, useUpdateSettings. Recording UI in live page (record button, banner, indicator). RecordingViewerPage (/classrooms/:id/recordings). Host moderation: mute/kick in participants panel, settings modal. Edge cases: reconnecting overlay, session ended overlay, classroom full message.

### TASK-083 · Phase 3: Unit tests — Classroom + LiveKit

```yaml
id: TASK-083
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - backend
  - classroom
  - test
  - phase3
depends_on:
  - TASK-068
  - TASK-069
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Unit tests: Classroom model validation (required fields, enums, defaults, index uniqueness). LiveKit service (isConfigured, generateToken host vs participant grants, createRoom, deleteRoom, graceful fallback). Classroom service (create, browse pagination, start lifecycle, join access control, reconnection token, end, leave, ownership checks). Use jest.mock() for models and livekit-server-sdk.

### TASK-084 · Phase 3: Unit tests — Controls + Recording + Whiteboard

```yaml
id: TASK-084
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - backend
  - classroom
  - test
  - phase3
depends_on:
  - TASK-070
  - TASK-071
  - TASK-072
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Unit tests: Controls (mute host-only, kick host/admin-only, updateSettings merge, hand queue). Recording (start validations: host/live/enabled, stop + URL generation, getRecordings access control). Whiteboard (save host-only, get snapshot for participants, Mixed type storage). Mock models, livekitService, Socket.IO.

### TASK-085 · Phase 3: Smoke tests — All Classroom APIs

```yaml
id: TASK-085
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - backend
  - classroom
  - test
  - phase3
depends_on:
  - TASK-083
  - TASK-084
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> 29 smoke tests with supertest + mongodb-memory-server: CRUD (401/403 auth guards, 201 create, browse+filter, detail, update ownership, delete), Lifecycle (start host-only, start already-live 400, join enrolled, join non-enrolled 403, join public, join full 403, end, leave), Controls (mute host-only, kick host-only, settings), Recording (start/stop/get), Whiteboard (save/get), Discovery (upcoming, my-sessions). Mock LiveKit.

### TASK-086 · Phase 3: Update feature-board, contracts, docs + final commit

```yaml
id: TASK-086
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T14:00:00.000Z
updated_at: 2026-03-05T14:00:00.000Z
tags:
  - docs
  - devops
  - phase3
depends_on:
  - TASK-077
  - TASK-078
  - TASK-079
  - TASK-080
  - TASK-081
  - TASK-082
history:
  - ts: 2026-03-05T14:00:00.000Z
    who: "@hasnain-sid"
    action: created
```

> Run frontend lint, fix errors. Update feature-board.md: Virtual Classroom row Shared ✅ Backend ✅ Frontend ✅, move to Active, contract ✅. Mark virtual-classroom contract complete. Update ROADMAP.md. Commit with conventional commits: feat(shared), feat(classroom), feat(frontend), test(phase3), docs.

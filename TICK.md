---
project: deenverse
schema_version: "1.0"
created: Wed Mar 04 2026 19:24:26 GMT+0530 (India Standard Time)
updated: 2026-03-05T11:09:56.824Z
default_workflow: [backlog, todo, in_progress, review, done]
id_prefix: TASK
next_id: 45
---

## Agents

| Agent | Type | Role | Status | Working On | Last Active | Trust Level |
|-------|------|------|--------|------------|-------------|-------------|
| hasna | human | owner, architect | idle | - | 2026-03-04T13:55:56.279Z | trusted |
| copilot | bot | developer, researcher | working | TASK-025 | 2026-03-05T11:09:56.824Z | trusted |
| copilot-2 | bot | developer, reviewer | idle | - | 2026-03-04T13:56:09.000Z | trusted |
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
status: in_progress
priority: high
assigned_to: copilot
claimed_by: copilot
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:21:55.854Z
updated_at: 2026-03-05T11:09:56.824Z
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
```

> Extend backend/models/userSchema.js: add 'scholar' to role enum, add scholarProfile subdocument (verifiedAt, verifiedBy, specialties, credentials, bio, teachingLanguages, rating, applicationStatus, stripeConnectId etc). Create isScholar and isScholarOrAdmin middleware in backend/middlewares/admin.js.

### TASK-026 · Phase 1: Scholar Application API (routes/controller/service)

```yaml
id: TASK-026
status: backlog
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:03.468Z
updated_at: 2026-03-05T10:22:03.468Z
tags:
  - backend
  - scholar
depends_on:
  - TASK-025
history:
  - ts: 2026-03-05T10:22:03.468Z
    who: "@hasnain-sid"
    action: created
```

> Build scholar application flow: POST /api/v1/scholars/apply (submit application), GET /api/v1/scholars/application-status (check own status), GET /api/v1/scholars/:id/profile (public profile). Admin endpoints: GET /api/v1/admin/scholars/applications, PUT /api/v1/admin/scholars/applications/:userId/review (approve/reject). Files: scholarRoute.js, scholarController.js, scholarService.js.

### TASK-027 · Phase 1: Stripe Connect integration + service

```yaml
id: TASK-027
status: backlog
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:11.543Z
updated_at: 2026-03-05T10:22:11.543Z
tags:
  - backend
  - payment
depends_on:
  - TASK-025
history:
  - ts: 2026-03-05T10:22:11.543Z
    who: "@hasnain-sid"
    action: created
```

> Create backend/services/stripeService.js: Stripe Connect Express account creation (scholar onboarding URL), dashboard link generation, account status check. Create paymentSchema.js and scholarPaymentSchema.js models. Endpoints: POST /api/v1/scholars/stripe/connect, GET /api/v1/scholars/stripe/dashboard, GET /api/v1/scholars/stripe/status.

### TASK-028 · Phase 1: Payment checkout + webhook + enrollment API

```yaml
id: TASK-028
status: backlog
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:22:19.302Z
updated_at: 2026-03-05T10:22:19.302Z
tags:
  - backend
  - payment
depends_on:
  - TASK-027
history:
  - ts: 2026-03-05T10:22:19.302Z
    who: "@hasnain-sid"
    action: created
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
status: backlog
priority: high
assigned_to: antigravity
claimed_by: null
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
status: backlog
priority: medium
assigned_to: antigravity
claimed_by: null
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
status: backlog
priority: high
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:29.798Z
updated_at: 2026-03-05T10:23:29.798Z
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
```

> Promote the chosen Scholar Application prototype to production. Create useScholar.ts hook (TanStack Query) with useScholarApplication mutation and useApplicationStatus query. Wire to POST /api/v1/scholars/apply and GET /api/v1/scholars/application-status. Remove prototype files after promotion.

### TASK-036 · Phase 1: Integrate Admin Scholar Review Panel

```yaml
id: TASK-036
status: backlog
priority: high
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:37.255Z
updated_at: 2026-03-05T10:23:37.255Z
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
```

> Promote chosen Admin Scholar Review prototype. Create useAdminScholarReview hook (TanStack Query) for GET /api/v1/admin/scholars/applications and PUT /api/v1/admin/scholars/applications/:userId/review. Wire approve/reject actions. Add route to admin section.

### TASK-037 · Phase 1: Integrate Badge + Scholar Profile across app

```yaml
id: TASK-037
status: backlog
priority: medium
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:45.711Z
updated_at: 2026-03-05T10:23:45.711Z
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
```

> Promote chosen badge design. Create ScholarBadge.tsx reusable component. Add badge display in: PostCard, CommentItem, ChatMessage, ProfileHeader, search results. Integrate ScholarProfilePage with useScholarProfile hook → GET /api/v1/scholars/:id/profile. Add route /scholars/:id.

### TASK-038 · Phase 1: Integrate Payment/Checkout + Subscription flow

```yaml
id: TASK-038
status: backlog
priority: high
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:23:52.832Z
updated_at: 2026-03-05T10:23:52.832Z
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
```

> Promote chosen Payment prototype. Create useCheckout, useSubscription, usePaymentHistory hooks (TanStack Query). Wire to Stripe Checkout redirect flow. Build SubscriptionPage with plan comparison, upgrade/downgrade. Add routes /checkout, /subscription, /payments/history.

### TASK-039 · Phase 1: Integrate Scholar Earnings Dashboard

```yaml
id: TASK-039
status: backlog
priority: medium
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:01.841Z
updated_at: 2026-03-05T10:24:01.841Z
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
```

> Promote chosen Earnings Dashboard prototype. Create useScholarEarnings, useStripeConnect hooks. Wire to GET /api/v1/scholars/earnings, /earnings/details, /stripe/status. Build Stripe Connect onboarding flow. Add routes /scholar/earnings, /scholar/stripe-setup.

### TASK-040 · Phase 1: Unit tests — Scholar models + service + middleware

```yaml
id: TASK-040
status: backlog
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:11.064Z
updated_at: 2026-03-05T10:24:11.064Z
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
```

> Write unit tests for: userSchema scholar fields validation, isScholar/isScholarOrAdmin middleware (role checks, edge cases), scholarService functions (apply, review, approve, reject). Use Jest or Vitest. Test: valid/invalid applications, role transitions, admin-only access, duplicate applications, rejection flow.

### TASK-041 · Phase 1: Unit tests — Payment service + webhook handler

```yaml
id: TASK-041
status: backlog
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:19.400Z
updated_at: 2026-03-05T10:24:19.400Z
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
```

> Write unit tests for: stripeService (checkout session creation, Connect onboarding, webhook signature verification), payment controller (idempotent enrollment, subscription create/cancel), webhook handler (all event types: checkout.session.completed, customer.subscription.updated/deleted, account.updated). Mock Stripe SDK calls.

### TASK-042 · Phase 1: Smoke tests — All Phase 1 API endpoints

```yaml
id: TASK-042
status: backlog
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:28.389Z
updated_at: 2026-03-05T10:24:28.389Z
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
```

> Write smoke/integration tests that hit all Phase 1 endpoints with real HTTP requests (supertest). Test: scholar application flow (apply → pending → admin approve → role change), Stripe checkout session creation, webhook processing, earnings retrieval. Verify auth guards (401 without token, 403 without correct role). Test edge cases: re-apply after rejection, double enrollment.

### TASK-043 · Phase 1: Update feature-board, contracts, docs + final commit

```yaml
id: TASK-043
status: backlog
priority: medium
assigned_to: copilot-2
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:24:37.586Z
updated_at: 2026-03-05T10:24:37.586Z
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

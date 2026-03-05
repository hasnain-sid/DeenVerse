---
project: deenverse
schema_version: "1.0"
created: Wed Mar 04 2026 19:24:26 GMT+0530 (India Standard Time)
updated: 2026-03-05T10:23:07.423Z
default_workflow: [backlog, todo, in_progress, review, done]
id_prefix: TASK
next_id: 34
---

## Agents

| Agent | Type | Role | Status | Working On | Last Active | Trust Level |
|-------|------|------|--------|------------|-------------|-------------|
| hasna | human | owner, architect | idle | - | 2026-03-04T13:55:56.279Z | trusted |
| copilot | bot | developer, researcher | idle | - | 2026-03-04T21:15:30.087Z | trusted |
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
status: backlog
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:21:48.073Z
updated_at: 2026-03-05T10:21:48.073Z
tags:
  - shared
  - scholar
  - payment
history:
  - ts: 2026-03-05T10:21:48.073Z
    who: "@hasnain-sid"
    action: created
```

> Define Zod schemas in packages/shared/src/schemas/ for: scholarApplicationSchema, scholarProfileSchema, paymentSchema, earningsSchema. These are the integration contracts between backend and frontend.

### TASK-025 · Phase 1: Extend userSchema + isScholar middleware

```yaml
id: TASK-025
status: backlog
priority: high
assigned_to: copilot
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-05T10:21:55.854Z
updated_at: 2026-03-05T10:21:55.854Z
tags:
  - backend
  - scholar
depends_on:
  - TASK-024
history:
  - ts: 2026-03-05T10:21:55.854Z
    who: "@hasnain-sid"
    action: created
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

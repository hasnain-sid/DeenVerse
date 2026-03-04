---
project: deenverse
schema_version: "1.0"
created: Wed Mar 04 2026 19:24:26 GMT+0530 (India Standard Time)
updated: 2026-03-04T13:58:17.655Z
default_workflow: [backlog, todo, in_progress, review, done]
id_prefix: TASK
next_id: 6
---

## Agents

| Agent | Type | Role | Status | Working On | Last Active | Trust Level |
|-------|------|------|--------|------------|-------------|-------------|
| hasna | human | owner, architect | idle | - | 2026-03-04T13:55:56.279Z | trusted |
| copilot | bot | developer, researcher | working | TASK-001 | 2026-03-04T13:58:17.655Z | trusted |
| copilot-2 | bot | developer, reviewer | idle | - | 2026-03-04T13:56:09.000Z | trusted |
| antigravity | bot | developer, researcher | idle | - | 2026-03-04T13:56:15.009Z | trusted |

---

## Tasks

### TASK-001 · Create Email Verification contract and shared Zod schema

```yaml
id: TASK-001
status: in_progress
priority: high
assigned_to: null
claimed_by: copilot
created_by: "@hasnain-sid"
created_at: 2026-03-04T13:56:58.565Z
updated_at: 2026-03-04T13:58:17.655Z
tags:
  - shared
  - auth
history:
  - ts: 2026-03-04T13:56:58.565Z
    who: "@hasnain-sid"
    action: created
  - ts: 2026-03-04T13:58:17.655Z
    who: copilot
    action: claimed
    from: backlog
    to: in_progress
```

> Define API contract in .agents/contracts/email-verification.md. Create Zod schemas in packages/shared/src/schemas/emailVerification.ts. Endpoints: POST /api/v1/user/verify-email, POST /api/v1/user/resend-verification.

### TASK-002 · Build Email Verification backend endpoints

```yaml
id: TASK-002
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-04T13:57:17.976Z
updated_at: 2026-03-04T13:57:17.976Z
tags:
  - backend
  - auth
depends_on:
  - TASK-001
history:
  - ts: 2026-03-04T13:57:17.976Z
    who: "@hasnain-sid"
    action: created
```

> Implement POST /api/v1/user/verify-email and POST /api/v1/user/resend-verification. Add verification token model, email sending via SES, rate limiting. Follow route->controller->service->model pattern.

### TASK-003 · Build Email Verification frontend UI

```yaml
id: TASK-003
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-04T13:57:30.934Z
updated_at: 2026-03-04T13:57:30.934Z
tags:
  - frontend
  - auth
depends_on:
  - TASK-001
history:
  - ts: 2026-03-04T13:57:30.934Z
    who: "@hasnain-sid"
    action: created
```

> Create frontend/src/features/email-verification/ with VerifyEmailPage.tsx, useEmailVerification.ts hook, and verification success/error states. Use TanStack Query for API calls.

### TASK-004 · Implement Google OAuth - research and contract

```yaml
id: TASK-004
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-04T13:57:39.007Z
updated_at: 2026-03-04T13:57:39.007Z
tags:
  - fullstack
  - auth
history:
  - ts: 2026-03-04T13:57:39.007Z
    who: "@hasnain-sid"
    action: created
```

> Research Google OAuth integration options (passport-google-oauth20 vs googleapis). Create contract in .agents/contracts/google-oauth.md. Define shared schemas.

### TASK-005 · Complete Ruhani Hub frontend pages

```yaml
id: TASK-005
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-04T13:57:48.194Z
updated_at: 2026-03-04T13:57:48.194Z
tags:
  - frontend
  - feature
history:
  - ts: 2026-03-04T13:57:48.194Z
    who: "@hasnain-sid"
    action: created
```

> Build remaining frontend pages for Ruhani Hub feature: Tafakkur, Tazkia, Tadabbur pages in frontend/src/features/ruhani/. Backend is already complete.

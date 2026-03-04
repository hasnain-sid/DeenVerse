---
project: deenverse
schema_version: "1.0"
created: Wed Mar 04 2026 19:24:26 GMT+0530 (India Standard Time)
updated: 2026-03-04T13:56:58.565Z
default_workflow: [backlog, todo, in_progress, review, done]
id_prefix: TASK
next_id: 2
---

## Agents

| Agent | Type | Role | Status | Working On | Last Active | Trust Level |
|-------|------|------|--------|------------|-------------|-------------|
| hasna | human | owner, architect | idle | - | 2026-03-04T13:55:56.279Z | trusted |
| copilot | bot | developer, researcher | idle | - | 2026-03-04T13:56:02.900Z | trusted |
| copilot-2 | bot | developer, reviewer | idle | - | 2026-03-04T13:56:09.000Z | trusted |
| antigravity | bot | developer, researcher | idle | - | 2026-03-04T13:56:15.009Z | trusted |

---

## Tasks

### TASK-001 · Create Email Verification contract and shared Zod schema

```yaml
id: TASK-001
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@hasnain-sid"
created_at: 2026-03-04T13:56:58.565Z
updated_at: 2026-03-04T13:56:58.565Z
tags:
  - shared
  - auth
history:
  - ts: 2026-03-04T13:56:58.565Z
    who: "@hasnain-sid"
    action: created
```

> Define API contract in .agents/contracts/email-verification.md. Create Zod schemas in packages/shared/src/schemas/emailVerification.ts. Endpoints: POST /api/v1/user/verify-email, POST /api/v1/user/resend-verification.

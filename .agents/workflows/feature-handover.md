---
description: Follow this protocol when you complete your layer (backend, frontend, shared) of a multi-layer feature. Ensures no feature is left half-built.
---

# 🔄 Feature Handover Workflow

When you finish your layer of a feature, follow this protocol to ensure the next agent can pick up seamlessly and no work is forgotten.

---

## When to Use This

- You just finished the **backend** for a feature and the frontend hasn't been built yet.
- You just finished the **frontend** and realized the backend isn't done.
- You just defined **shared schemas** and need backend + frontend agents to implement against them.
- You completed **any layer** of a multi-layer feature.

---

## Step 1: Verify Your Layer

Before declaring your layer complete:

```bash
# Backend agents:
node -c backend/controller/<feature>Controller.js   # syntax check
node -c backend/services/<feature>Service.js         # syntax check
# Test the endpoint manually: curl or Postman

# Frontend agents:
cd frontend && npm run lint                          # zero warnings
cd frontend && npx tsc --noEmit                      # zero type errors

# Shared schema agents:
node -c packages/shared/src/schemas/<feature>.js     # syntax check
```

---

## Step 2: Update the Feature Contract

Open `.agents/contracts/<feature-name>.md` and:

1. Update your layer's status from `⬜` or `🔵` to `✅`.
2. Add a row to the **Handover Log** table:

```markdown
| 2026-02-26 | copilot-2 | Backend | Completed | All 3 endpoints working, tested with curl |
```

3. If the next layer has a dependency on your work, note exactly what's ready:
   - Which endpoints are available and their request/response shapes
   - Which shared types/schemas are exported and from where
   - Any environment variables or config the next agent needs

---

## Step 3: Update the Feature Board

Open `.agents/feature-board.md` and update the row for this feature:

- Change your layer's status symbol (e.g., `🔵` → `✅`)
- If another layer is still `⬜` (not started), add a note: "Backend done, frontend needed"

---

## Step 4: Create a Handover Note (if complex)

For non-trivial features, leave a handover note directly in the contract under the Handover Log. Include:

### For Backend → Frontend Handover
- Endpoint URLs with example curl commands
- Response shapes (paste actual JSON)
- Auth requirements for each endpoint
- Any query parameters or pagination details
- Error response format

### For Shared → Backend/Frontend Handover
- Schema import path: `import { FeatureSchema } from '@deenverse/shared'`
- List of exported types and their usage
- Any validation rules encoded in the schema

### For Frontend → Backend Handover (when frontend was done first with mocks)
- List of API calls the frontend makes (path, method, expected response)
- The mock data structure being used (this IS the API contract)
- Any real-time events expected (Socket.IO event names)

---

## Step 5: Flag Incomplete Layers

If you notice that a feature you're working on has incomplete layers that are blocking you:

1. Add `🔴 Blocked` status to the relevant layer in the contract.
2. Update the feature board with a note explaining the blocker.
3. Do NOT implement workarounds or mock the missing layer in production code — either:
   - Wait for the other layer to be completed, OR
   - Build the missing layer yourself if it's within your domain, OR
   - Escalate to the human owner.

---

## Step 6: Announce Readiness

After updating the contract and board, make sure the next agent can find your work:

- **Commit your changes** with a clear message:
  ```
  feat(<feature>): complete backend layer — frontend ready to integrate
  ```
- **Push your branch** and note in the PR description:
  ```
  ## Handover
  - Backend complete for <feature>
  - Contract updated: .agents/contracts/<feature>.md
  - Frontend agent can now implement against these endpoints
  - Next: copilot-1 to build the UI
  ```

---

## Anti-Patterns (Do NOT Do These)

| Anti-Pattern | Why It's Bad | Do This Instead |
|---|---|---|
| Build frontend with hardcoded mock data and call it "done" | Other agents think the feature works end-to-end | Mark as ⚠️ Partial, note "uses mocks, backend needed" |
| Build backend endpoints but don't document the response shape | Frontend agent has to reverse-engineer your code | Add curl examples to the contract |
| Skip updating the feature board | Features silently go incomplete | Always update board + contract together |
| Start a new feature without creating a contract first | No visibility, no integration plan | Create contract from template FIRST |
| Two agents working on the same layer without coordination | Merge conflicts, duplicated work | Check feature board before starting |

---

## Quick Checklist

```
After completing your layer:
  [ ] Layer verified (lint, types, syntax, manual test)
  [ ] Contract updated (status ✅, handover log entry)
  [ ] Feature board updated
  [ ] Handover notes written (for complex features)
  [ ] Changes committed with descriptive message
  [ ] PR description includes handover section
```

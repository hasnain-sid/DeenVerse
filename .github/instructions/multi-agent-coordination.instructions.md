---
description: "Use when multiple agents are working on the same project, starting a new feature, or checking feature completeness across frontend/backend/shared layers. Enforces contract-first development and prevents half-built features."
---

# Multi-Agent Coordination & Feature Contracts

> **This instruction applies to ALL agents** — read before starting any new feature or layer of work.

---

## The Core Problem

When multiple agents (Copilot for backend, Antigravity for frontend, etc.) work on the same project:
- Agent A builds the frontend UI but Agent B never builds the backend API → broken feature
- Agent B builds backend endpoints but Agent A doesn't know the response shape → integration fails
- Nobody tracks which features are fully complete across all layers → silent gaps accumulate

## The Solution: Contract-First Development

**Every multi-layer feature MUST have a contract before any code is written.**

---

## Rule 1: Create a Contract Before Coding

Before starting any feature that touches more than one layer (frontend + backend, or shared + anything):

1. Copy `.agents/contracts/_template.md` → `.agents/contracts/<feature-name>.md`
2. Fill in: overview, API contract, data model, frontend requirements, dependency order
3. Assign owner agents for each layer
4. Get agreement (or self-assign if you're the only agent working)
5. THEN start coding

**Single-layer tasks** (e.g., pure CSS fix, config change) do NOT need a contract.

---

## Rule 2: Always Check the Feature Board First

Before starting work on ANY feature:

```bash
# Check the feature board
cat .agents/feature-board.md
```

Ask yourself:
- Is this feature already tracked? → Update, don't duplicate
- Is another agent already working on a layer? → Coordinate, don't overlap
- Is there a contract? → Read it before coding
- Are there blocked/incomplete layers? → Consider picking those up

---

## Rule 3: Shared Types First, Always

For any feature that needs both frontend and backend:

```
ORDER OF OPERATIONS:
1. Define shared Zod schema in packages/shared/src/schemas/
2. Merge shared schema to dev
3. Backend implements endpoints using the schema
4. Frontend implements UI using the schema types
```

This eliminates the #1 cause of multi-agent integration failures: mismatched types.

If a shared schema isn't needed (simple feature), the API contract in the feature contract file serves the same purpose.

---

## Rule 4: Update Status Religiously

Every time you change a feature's state:

| Action | Update |
|--------|--------|
| Start working on a layer | Board: `⬜ → 🔵` + Contract: status update |
| Finish a layer | Board: `🔵 → ✅` + Contract: handover log entry |
| Hit a blocker | Board: `🔴` + Contract: note the blocker |
| Discover incomplete work | Board: `⚠️` + Contract: flag it |

---

## Rule 5: Follow the Handover Protocol

When you complete your layer, follow `.agents/workflows/feature-handover.md`:
1. Verify your layer (lint, types, manual test)
2. Update the contract with handover notes
3. Update the feature board
4. Commit with a descriptive message mentioning the handover
5. If the other layers are `⬜`, flag it — features must not stay half-built

---

## Rule 6: Run Integrity Checks

Periodically (and before any release/deploy):

```bash
node scripts/check-feature-integrity.js
```

This script detects:
- Frontend API calls that don't have matching backend routes
- Backend routes with no frontend consumers
- Shared schemas that are defined but not imported anywhere

---

## Session Start Checklist (Enhanced)

Every agent session should start with:

```bash
# 1. Standard git sync
git fetch origin
git rebase origin/dev

# 2. Check the feature board for your areas
cat .agents/feature-board.md

# 3. Check for any contracts assigned to you
ls .agents/contracts/

# 4. Look for incomplete features in your domain
#    (frontend agent → check for ⬜ frontend columns)
#    (backend agent → check for ⬜ backend columns)

# 5. If starting NEW work, check for an existing contract
#    If none exists, create one before coding
```

---

## Decision Tree: Should I Create a Contract?

```
Is this feature multi-layer? (touches frontend + backend, or shared + anything)
  ├── YES → Does a contract already exist?
  │   ├── YES → Read it, update it, start coding
  │   └── NO  → Create one from template FIRST, then code
  └── NO (single layer only) → No contract needed, but still update the feature board
```

---

## Integration Verification Workflow

After ALL layers of a feature are marked ✅:

1. Run the full stack: `npm run dev:web` + `npm run dev:backend`
2. Test the end-to-end flow manually
3. Run `node scripts/check-feature-integrity.js`
4. If everything works, move the feature to "Completed" in the feature board
5. Archive the contract (move to `.agents/contracts/archive/`)

---

## Agent Responsibility Matrix (Quick Reference)

| What | Who Creates It | Who Updates It |
|------|---------------|----------------|
| Feature contract | The agent who starts the feature OR the human | Any agent working on the feature |
| Feature board | Maintained by all agents | Every agent, every session |
| Shared schemas | Preferably antigravity (schema owner) | Coordinated change with all agents |
| Handover notes | The agent completing a layer | — |
| Integrity check | Any agent, periodically | — |

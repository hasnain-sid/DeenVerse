---
description: Check overall feature completeness across all layers and agents. Use at the start of a session or before deployment.
---

# 🔎 Feature Status Check Workflow

Quick health check on the state of multi-agent development. Run this when:
- Starting a new session (before picking up work)
- Before deploying
- When you suspect features are incomplete

## Step 1: Run the Integrity Check

```bash
npm run check:integrity
```

Review the output for:
- **Orphan frontend calls** → Frontend is calling APIs that don't exist yet (CRITICAL)
- **Unconsumed backend routes** → Backend built but no frontend UI uses it (needs review)

## Step 2: Review the Feature Board

Open `.agents/feature-board.md` and look for:
- `⚠️` (Needs Attention) — something is half-done
- `🔴` (Blocked) — work is stuck
- `⬜` in your domain — work assigned to you that hasn't started

## Step 3: Check Open Contracts

```bash
ls .agents/contracts/
```

Open each contract and check:
- Is every assigned layer making progress?
- Are there handover notes you haven't acted on?
- Is anything past its target date?

## Step 4: Recommend Actions

Present findings as:

### 🔴 Critical (Fix Before Anything Else)
- Frontend API calls hitting non-existent backend routes
- Features marked as ✅ that are actually broken

### 🟡 Needs Work (Pick Up This Session)
- Features where your layer is ⬜ but dependencies are ✅
- Contracts with handover notes waiting for you

### 🟢 On Track
- Features progressing as planned across all layers

## Step 5: Update Board If Needed

If the check reveals outdated status in the board or contracts, update them now before starting new work.

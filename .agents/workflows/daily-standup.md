---
description: Summarize recent changes, open TODOs, and suggest next priorities from ROADMAP
---

# ☀️ Daily Standup Workflow

Provide a quick summary to help the user pick up right where they left off.

## Step 1: Check the Feature Board
* Open `.agents/feature-board.md` and review:
  - **🔵 In Progress** — Are there tasks left mid-flight from last session?
  - **⏳ Pending** — What's the highest priority task in your domain?
  - **⚠️ Partial** features — Are any features half-built that need your attention?
* Run `npm run check:integrity` to detect orphan frontend calls or unconsumed backend routes.

## Step 2: Recent Changes
// turbo
* Run `git log --oneline -10` to see the last 10 commits.
* Summarize what was worked on recently in plain language.

## Step 3: Current State
// turbo
* Run `git status` to check for any uncommitted changes.
* Run `git branch` to identify the current branch.
* Note any work-in-progress that needs attention.

## Step 4: Open TODOs
* Check the **⏳ Pending** tasks on the feature board.
* Check for any open contracts in `.agents/contracts/` with incomplete layers.
* Look for `TODO`, `FIXME`, or `HACK` comments in recently modified files.

## Step 5: Next Priorities
* Read the feature board's pending tasks (prioritised) FIRST.
* Cross-reference with `ROADMAP.md` for milestone context.
* Prioritize items that are:
  1. Blocking other agents (features with ⚠️ or 🔴)
  2. Nearly complete (one layer away from ✅)
  3. Next on the pending task list

## Step 6: Present Standup
Format the standup as:

### 🔙 Yesterday
- What was accomplished

### 📌 Today's Priorities
- Tasks from the feature board **⏳ Pending** list (ranked)
- Incomplete features where your layer is ⬜ but dependencies are ✅

### ⚠️ Blockers
- Any unresolved issues or decisions needed
- Uncommitted work that needs attention
- Features flagged ⚠️ or 🔴 on the board

### 📊 Integrity Check
- Results from `npm run check:integrity` (orphan calls, unconsumed routes)
